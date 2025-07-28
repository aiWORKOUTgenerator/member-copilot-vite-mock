import { renderHook, act } from '@testing-library/react';
import { useAIWorkout } from '../useAIWorkout';
import { AIComposedProvider } from '../../contexts/composition/AIComposedProvider';
import { mockUserProfile } from '../../__tests__/mocks/userProfile';
import { mockWorkoutOptions } from '../../__tests__/mocks/workoutOptions';

// Mock the AIService
jest.mock('../../services/ai/core/AIService');
const MockAIService = require('../../services/ai/core/AIService').AIService;

// Mock analytics
jest.mock('../../contexts/composition/AIAnalyticsProvider');
const mockTrackAIInteraction = jest.fn();

describe('useAIWorkout', () => {
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
      generateWorkout: jest.fn().mockResolvedValue({
        id: 'workout-1',
        exercises: [],
        duration: 45
      })
    }));

    // Mock analytics provider
    require('../../contexts/composition/AIAnalyticsProvider').useAIAnalytics.mockReturnValue({
      trackAIInteraction: mockTrackAIInteraction
    });
  });

  describe('Workout Generation', () => {
    it('generates workout with analytics tracking', async () => {
      const mockWorkout = {
        id: 'workout-1',
        exercises: [],
        duration: 45
      };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockResolvedValue(mockWorkout)
      }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      await act(async () => {
        await result.current.generateWorkout(mockWorkoutOptions);
      });

      // Verify analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'workout_request',
        component: 'test-component',
        data: {
          options: mockWorkoutOptions,
          hasUserProfile: false
        }
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'workout_success',
        component: 'test-component',
        data: {
          success: true,
          options: mockWorkoutOptions,
          workoutId: 'workout-1'
        }
      });
    });

    it('handles workout generation errors gracefully', async () => {
      const mockError = new Error('Generation failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockRejectedValue(mockError)
      }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);

      expect(workout).toBeNull();

      // Verify error analytics tracking
      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'workout_error',
        component: 'test-component',
        data: {
          error: 'Generation failed',
          options: mockWorkoutOptions
        }
      });
    });

    it('tracks user profile availability', async () => {
      const mockWorkout = { id: 'workout-1', exercises: [], duration: 45 };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockResolvedValue(mockWorkout)
      }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      // Mock user profile
      result.current.currentUserProfile = mockUserProfile;

      await act(async () => {
        await result.current.generateWorkout(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hasUserProfile: true
          })
        })
      );
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

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

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

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

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

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

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
  });

  describe('State Management', () => {
    it('maintains current user profile state', () => {
      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      expect(result.current.currentUserProfile).toBeDefined();
      expect(result.current.currentSelections).toBeDefined();
    });

    it('updates current selections when provided', () => {
      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      // Mock current selections
      result.current.currentSelections = mockWorkoutOptions;

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
    });
  });

  describe('Component Integration', () => {
    it('uses provided component name in analytics', async () => {
      const mockWorkout = { id: 'workout-1', exercises: [], duration: 45 };
      
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockResolvedValue(mockWorkout)
      }));

      const { result } = renderHook(() => useAIWorkout('custom-component'), { wrapper });

      await act(async () => {
        await result.current.generateWorkout(mockWorkoutOptions);
      });

      expect(mockTrackAIInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          component: 'custom-component'
        })
      );
    });

    it('integrates with analytics provider correctly', () => {
      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      expect(mockTrackAIInteraction).toBeDefined();
      expect(typeof result.current.generateWorkout).toBe('function');
      expect(typeof result.current.analyzeWorkout).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects gracefully', async () => {
      const mockError = 'String error';
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockRejectedValue(mockError)
      }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);

      expect(workout).toBeNull();

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'workout_error',
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
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockRejectedValue(undefined)
      }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);

      expect(workout).toBeNull();

      expect(mockTrackAIInteraction).toHaveBeenCalledWith({
        type: 'workout_error',
        component: 'test-component',
        data: {
          error: 'undefined',
          options: mockWorkoutOptions
        }
      });
    });
  });
}); 