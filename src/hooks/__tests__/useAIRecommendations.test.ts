import { renderHook, act } from '@testing-library/react';
import { useAIRecommendations } from '../useAIRecommendations';
import { AIComposedProvider } from '../../contexts/composition/AIComposedProvider';
import { mockUserProfile } from '../../__tests__/mocks/userProfile';
import { mockWorkoutOptions } from '../../__tests__/mocks/workoutOptions';
import { PrioritizedRecommendation } from '../../services/ai/core/types/AIServiceTypes';

// Mock the AIService
jest.mock('../../services/ai/core/AIService');
const MockAIService = require('../../services/ai/core/AIService').AIService;

// Mock analytics
jest.mock('../../contexts/composition/AIAnalyticsProvider');
const mockTrackAIInteraction = jest.fn();

describe('useAIRecommendations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AIComposedProvider>{children}</AIComposedProvider>
  );

  const mockRecommendation: PrioritizedRecommendation = {
    id: 'rec-1',
    title: 'Test Recommendation',
    description: 'Test description',
    category: 'energy',
    priority: 'high',
    actionable: true,
    confidence: 0.8,
    reasoning: 'Test reasoning'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AIService
    MockAIService.mockImplementation(() => ({
      setContext: jest.fn().mockResolvedValue(undefined),
      getContext: jest.fn().mockReturnValue(null),
      analyze: jest.fn().mockResolvedValue({
        insights: { energy: [], soreness: [] },
        recommendations: [mockRecommendation],
        confidence: 0.8
      }),
      generateRecommendations: jest.fn().mockResolvedValue([mockRecommendation]),
      generateWorkout: jest.fn()
    }));

    // Mock analytics provider
    require('../../contexts/composition/AIAnalyticsProvider').useAIAnalytics.mockReturnValue({
      trackAIInteraction: mockTrackAIInteraction
    });
  });

  describe('Recommendation Generation', () => {
    it('generates recommendations with analytics tracking', async () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      await act(async () => {
        await result.current.getRecommendations();
      });

      // Verify analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'recommendations',
          hasUserProfile: false,
          hasSelections: false
        }
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_applied',
        component: 'test-component',
        data: {
          type: 'recommendations',
          count: 1,
          categories: ['energy']
        }
      });
    });

    it('handles recommendation generation errors gracefully', async () => {
      const mockError = new Error('Recommendation generation failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateRecommendations: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const recommendations = await result.current.getRecommendations();

      expect(recommendations).toEqual([]);

      // Verify error analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'recommendations_error',
          error: 'Recommendation generation failed'
        }
      });
    });

    it('tracks user profile and selections availability', async () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      // Mock user profile and selections
      result.current.currentUserProfile = mockUserProfile;
      result.current.currentSelections = mockWorkoutOptions;

      await act(async () => {
        await result.current.getRecommendations();
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hasUserProfile: true,
            hasSelections: true
          })
        })
      );
    });
  });

  describe('Prioritized Recommendations', () => {
    it('generates prioritized recommendations through analysis', async () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      await act(async () => {
        await result.current.getPrioritizedRecommendations();
      });

      // Verify analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'prioritized_recommendations',
          hasUserProfile: false
        }
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_applied',
        component: 'test-component',
        data: {
          type: 'prioritized_recommendations',
          count: 1,
          priorities: ['high']
        }
      });
    });

    it('handles prioritized recommendation errors gracefully', async () => {
      const mockError = new Error('Prioritized recommendations failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(mockError),
        generateRecommendations: jest.fn(),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const recommendations = await result.current.getPrioritizedRecommendations();

      expect(recommendations).toEqual([]);

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'prioritized_recommendations_error',
          error: 'Prioritized recommendations failed'
        }
      });
    });

    it('tracks multiple priorities correctly', async () => {
      const mockRecommendations = [
        { ...mockRecommendation, priority: 'high' },
        { ...mockRecommendation, id: 'rec-2', priority: 'medium' },
        { ...mockRecommendation, id: 'rec-3', priority: 'low' }
      ];

      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue({
          insights: { energy: [], soreness: [] },
          recommendations: mockRecommendations,
          confidence: 0.8
        }),
        generateRecommendations: jest.fn(),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      await act(async () => {
        await result.current.getPrioritizedRecommendations();
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_applied',
        component: 'test-component',
        data: {
          type: 'prioritized_recommendations',
          count: 3,
          priorities: ['high', 'medium', 'low']
        }
      });
    });
  });

  describe('Recommendation Actions', () => {
    it('tracks recommendation acceptance', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      act(() => {
        result.current.acceptRecommendation(mockRecommendation);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'recommendation_accepted',
        component: 'test-component',
        data: {
          recommendationId: 'rec-1',
          category: 'energy',
          priority: 'high'
        }
      });
    });

    it('tracks recommendation rejection', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      act(() => {
        result.current.rejectRecommendation(mockRecommendation);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'recommendation_rejected',
        component: 'test-component',
        data: {
          recommendationId: 'rec-1',
          category: 'energy',
          priority: 'high'
        }
      });
    });

    it('handles different recommendation types', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const differentRecommendation = {
        ...mockRecommendation,
        id: 'rec-2',
        category: 'soreness',
        priority: 'medium'
      };

      act(() => {
        result.current.acceptRecommendation(differentRecommendation);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'recommendation_accepted',
        component: 'test-component',
        data: {
          recommendationId: 'rec-2',
          category: 'soreness',
          priority: 'medium'
        }
      });
    });
  });

  describe('State Management', () => {
    it('maintains current user profile state', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      expect(result.current.currentUserProfile).toBeDefined();
      expect(result.current.currentSelections).toBeDefined();
    });

    it('updates current selections when provided', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      // Mock current selections
      result.current.currentSelections = mockWorkoutOptions;

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
    });
  });

  describe('Component Integration', () => {
    it('uses provided component name in analytics', async () => {
      const { result } = renderHook(() => useAIRecommendations('custom-component'), { wrapper });

      await act(async () => {
        await result.current.getRecommendations();
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          component: 'custom-component'
        })
      );
    });

    it('integrates with analytics provider correctly', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      expect(mockTrackAIInteraction).toBeDefined();
      expect(typeof result.current.getRecommendations).toBe('function');
      expect(typeof result.current.getPrioritizedRecommendations).toBe('function');
      expect(typeof result.current.acceptRecommendation).toBe('function');
      expect(typeof result.current.rejectRecommendation).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects gracefully', async () => {
      const mockError = 'String error';
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateRecommendations: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const recommendations = await result.current.getRecommendations();

      expect(recommendations).toEqual([]);

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'recommendations_error',
          error: 'String error'
        }
      });
    });

    it('handles undefined errors gracefully', async () => {
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateRecommendations: jest.fn().mockRejectedValue(undefined),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const recommendations = await result.current.getRecommendations();

      expect(recommendations).toEqual([]);

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'insight_shown',
        component: 'test-component',
        data: {
          type: 'recommendations_error',
          error: 'undefined'
        }
      });
    });
  });

  describe('Type Safety', () => {
    it('maintains proper return types for recommendations', async () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      const recommendations = await result.current.getRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations[0]).toEqual(mockRecommendation);
      expect(recommendations[0].id).toBe('rec-1');
      expect(recommendations[0].category).toBe('energy');
      expect(recommendations[0].priority).toBe('high');
    });

    it('maintains proper types for recommendation actions', () => {
      const { result } = renderHook(() => useAIRecommendations('test-component'), { wrapper });

      expect(typeof result.current.acceptRecommendation).toBe('function');
      expect(typeof result.current.rejectRecommendation).toBe('function');

      // Should accept PrioritizedRecommendation type
      act(() => {
        result.current.acceptRecommendation(mockRecommendation);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recommendationId: mockRecommendation.id,
            category: mockRecommendation.category,
            priority: mockRecommendation.priority
          })
        })
      );
    });
  });
}); 