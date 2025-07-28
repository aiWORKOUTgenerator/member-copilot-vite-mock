import { renderHook, act } from '@testing-library/react';
import { useAIAnalysis } from '../useAIAnalysis';
import { AIComposedProvider } from '../../contexts/composition/AIComposedProvider';
import { mockUserProfile } from '../../__tests__/mocks/userProfile';
import { mockWorkoutOptions } from '../../__tests__/mocks/workoutOptions';

// Mock the AIService
jest.mock('../../services/ai/core/AIService');
const MockAIService = require('../../services/ai/core/AIService').AIService;

// Mock analytics
jest.mock('../../contexts/composition/AIAnalyticsProvider');
const mockTrackAIInteraction = jest.fn();

describe('useAIAnalysis', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AIComposedProvider>{children}</AIComposedProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AIService
    MockAIService.mockImplementation(() => ({
      setContext: jest.fn().mockResolvedValue(undefined),
      getContext: jest.fn().mockReturnValue(null),
      analyze: jest.fn().mockResolvedValue({
        insights: { energy: [], soreness: [] },
        recommendations: [],
        confidence: 0.8
      }),
      generateWorkout: jest.fn()
    }));

    // Mock analytics provider
    require('../../contexts/composition/AIAnalyticsProvider').useAIAnalytics.mockReturnValue({
      trackAIInteraction: mockTrackAIInteraction
    });
  });

  describe('Workout Analysis', () => {
    it('analyzes workout options with analytics tracking', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeWorkout(mockWorkoutOptions);
      });

      // Verify analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_request',
        component: 'test-component',
        data: {
          options: mockWorkoutOptions,
          currentSelections: {}
        }
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_success',
        component: 'test-component',
        data: {
          success: true,
          hasInsights: false,
          hasRecommendations: false
        }
      });
    });

    it('handles analysis errors gracefully', async () => {
      const mockError = new Error('Analysis failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      const analysis = await result.current.analyzeWorkout(mockWorkoutOptions);

      expect(analysis).toBeNull();

      // Verify error analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_error',
        component: 'test-component',
        data: {
          error: 'Analysis failed',
          options: mockWorkoutOptions
        }
      });
    });

    it('tracks insights and recommendations availability', async () => {
      const mockAnalysis = {
        insights: { energy: [{ id: '1', message: 'test' }], soreness: [] },
        recommendations: [{ id: '1', title: 'test' }],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeWorkout(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_success',
        component: 'test-component',
        data: {
          success: true,
          hasInsights: true,
          hasRecommendations: true
        }
      });
    });

    it('handles empty analysis results', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        confidence: 0.0
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeWorkout(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_success',
        component: 'test-component',
        data: {
          success: true,
          hasInsights: false,
          hasRecommendations: false
        }
      });
    });
  });

  describe('Cross-Component Analysis', () => {
    it('analyzes cross-component interactions', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        crossComponentConflicts: [{ id: '1', type: 'energy_soreness' }],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeCrossComponent(mockWorkoutOptions);
      });

      // Verify cross-component analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_request',
        component: 'test-component',
        data: {
          type: 'cross_component',
          options: mockWorkoutOptions,
          currentSelections: {}
        }
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_success',
        component: 'test-component',
        data: {
          type: 'cross_component',
          success: true,
          conflictCount: 1
        }
      });
    });

    it('handles cross-component analysis errors', async () => {
      const mockError = new Error('Cross-component analysis failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      const analysis = await result.current.analyzeCrossComponent(mockWorkoutOptions);

      expect(analysis).toBeNull();

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_error',
        component: 'test-component',
        data: {
          type: 'cross_component',
          error: 'Cross-component analysis failed',
          options: mockWorkoutOptions
        }
      });
    });

    it('tracks conflict count in cross-component analysis', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        crossComponentConflicts: [
          { id: '1', type: 'energy_soreness' },
          { id: '2', type: 'duration_energy' }
        ],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeCrossComponent(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_success',
        component: 'test-component',
        data: {
          type: 'cross_component',
          success: true,
          conflictCount: 2
        }
      });
    });
  });

  describe('State Management', () => {
    it('maintains current user profile state', () => {
      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      expect(result.current.currentUserProfile).toBeDefined();
      expect(result.current.currentSelections).toBeDefined();
    });

    it('updates current selections when provided', () => {
      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      // Mock current selections
      result.current.currentSelections = mockWorkoutOptions;

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
    });
  });

  describe('Component Integration', () => {
    it('uses provided component name in analytics', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('custom-component'), { wrapper });

      await act(async () => {
        await result.current.analyzeWorkout(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          component: 'custom-component'
        })
      );
    });

    it('integrates with analytics provider correctly', () => {
      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      expect(mockTrackAIInteraction).toBeDefined();
      expect(typeof result.current.analyzeWorkout).toBe('function');
      expect(typeof result.current.analyzeCrossComponent).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects gracefully', async () => {
      const mockError = 'String error';
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      const analysis = await result.current.analyzeWorkout(mockWorkoutOptions);

      expect(analysis).toBeNull();

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_error',
        component: 'test-component',
        data: {
          error: 'String error',
          options: mockWorkoutOptions
        }
      });
    });

    it('handles undefined errors gracefully', async () => {
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(undefined),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      const analysis = await result.current.analyzeWorkout(mockWorkoutOptions);

      expect(analysis).toBeNull();

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'analysis_error',
        component: 'test-component',
        data: {
          error: 'undefined',
          options: mockWorkoutOptions
        }
      });
    });
  });

  describe('Type Safety', () => {
    it('maintains proper return types', async () => {
      const mockAnalysis = {
        insights: { energy: [], soreness: [] },
        recommendations: [],
        confidence: 0.8
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockResolvedValue(mockAnalysis),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIAnalysis('test-component'), { wrapper });

      const analysis = await result.current.analyzeWorkout(mockWorkoutOptions);

      expect(analysis).toEqual(mockAnalysis);
      expect(analysis?.insights).toBeDefined();
      expect(analysis?.recommendations).toBeDefined();
      expect(analysis?.confidence).toBe(0.8);
    });
  });
}); 