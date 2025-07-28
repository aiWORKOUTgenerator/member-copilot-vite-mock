import { renderHook, act } from '@testing-library/react';
import { useAIService } from '../useAIService';
import { AIComposedProvider } from '../../contexts/composition/AIComposedProvider';
import { mockUserProfile } from '../../__tests__/mocks/userProfile';
import { mockWorkoutOptions } from '../../__tests__/mocks/workoutOptions';

// Mock the AIService
jest.mock('../../services/ai/core/AIService');
const MockAIService = require('../../services/ai/core/AIService').AIService;

describe('useAIService', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AIComposedProvider>{children}</AIComposedProvider>
  );

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock AIService methods
    MockAIService.mockImplementation(() => ({
      setContext: jest.fn().mockResolvedValue(undefined),
      getContext: jest.fn().mockReturnValue({
        userProfile: mockUserProfile,
        currentSelections: {},
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      }),
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
  });

  describe('Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      expect(result.current.currentUserProfile).toBeNull();
      expect(result.current.currentSelections).toEqual({});
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.updateSelections).toBe('function');
      expect(typeof result.current.analyze).toBe('function');
      expect(typeof result.current.generateWorkout).toBe('function');
    });

    it('initializes service with user profile', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      expect(result.current.currentUserProfile).toEqual(mockUserProfile);
      expect(MockAIService.mock.instances[0].setContext).toHaveBeenCalledWith(
        expect.objectContaining({
          userProfile: mockUserProfile,
          currentSelections: {},
          sessionHistory: [],
          preferences: expect.any(Object)
        })
      );
    });

    it('handles initialization errors gracefully', async () => {
      const mockError = new Error('Initialization failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockRejectedValue(mockError),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIService(), { wrapper });

      await expect(
        act(async () => {
          await result.current.initialize(mockUserProfile);
        })
      ).rejects.toThrow('Initialization failed');
    });
  });

  describe('Selection Management', () => {
    it('updates selections correctly', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      act(() => {
        result.current.updateSelections(mockWorkoutOptions);
      });

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
    });

    it('merges partial selections', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const partialSelections = { customization_duration: 30 };
      
      act(() => {
        result.current.updateSelections(partialSelections);
      });

      expect(result.current.currentSelections).toEqual(partialSelections);
    });

    it('updates service context when real-time insights enabled', async () => {
      const mockSetContext = jest.fn().mockResolvedValue(undefined);
      MockAIService.mockImplementation(() => ({
        setContext: mockSetContext,
        getContext: jest.fn().mockReturnValue({
          userProfile: mockUserProfile,
          currentSelections: {},
          sessionHistory: [],
          preferences: {}
        }),
        analyze: jest.fn(),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
        result.current.updateSelections(mockWorkoutOptions);
      });

      // Should call setContext when real-time insights are enabled
      expect(mockSetContext).toHaveBeenCalledTimes(2); // Once for init, once for update
    });
  });

  describe('Analysis', () => {
    it('analyzes workout options successfully', async () => {
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

      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const analysis = await result.current.analyze(mockWorkoutOptions);
      
      expect(analysis).toEqual(mockAnalysis);
      expect(MockAIService.mock.instances[0].analyze).toHaveBeenCalledWith(mockWorkoutOptions);
    });

    it('returns null when no user profile is set', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      const analysis = await result.current.analyze(mockWorkoutOptions);
      
      expect(analysis).toBeNull();
    });

    it('handles analysis errors gracefully', async () => {
      const mockError = new Error('Analysis failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn().mockRejectedValue(mockError),
        generateWorkout: jest.fn()
      }));

      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const analysis = await result.current.analyze(mockWorkoutOptions);
      
      expect(analysis).toBeNull();
    });
  });

  describe('Workout Generation', () => {
    it('generates workout successfully', async () => {
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

      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);
      
      expect(workout).toEqual(mockWorkout);
      expect(MockAIService.mock.instances[0].generateWorkout).toHaveBeenCalledWith({
        userProfile: mockUserProfile,
        selections: mockWorkoutOptions
      });
    });

    it('throws error when no user profile is set', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await expect(
        result.current.generateWorkout(mockWorkoutOptions)
      ).rejects.toThrow('User profile required for workout generation');
    });

    it('handles generation errors gracefully', async () => {
      const mockError = new Error('Generation failed');
      MockAIService.mockImplementation(() => ({
        setContext: jest.fn().mockResolvedValue(undefined),
        getContext: jest.fn().mockReturnValue(null),
        analyze: jest.fn(),
        generateWorkout: jest.fn().mockRejectedValue(mockError)
      }));

      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);
      
      expect(workout).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('maintains proper types for user profile', () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      expect(result.current.currentUserProfile).toBeNull();
      
      act(() => {
        result.current.initialize(mockUserProfile);
      });

      expect(result.current.currentUserProfile).toEqual(mockUserProfile);
      expect(result.current.currentUserProfile?.fitnessLevel).toBe('intermediate');
      expect(result.current.currentUserProfile?.goals).toEqual(['strength', 'endurance']);
    });

    it('maintains proper types for selections', () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      act(() => {
        result.current.updateSelections(mockWorkoutOptions);
      });

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
      expect(result.current.currentSelections.customization_duration).toBeDefined();
      expect(result.current.currentSelections.customization_energy).toBeDefined();
    });
  });
}); 