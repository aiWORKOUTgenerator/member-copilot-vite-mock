import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutGeneration } from '../../hooks/useWorkoutGeneration';
import { OpenAIStrategy } from '../../services/ai/external/OpenAIStrategy';
import { RecommendationEngine } from '../../services/ai/internal/RecommendationEngine';
import { mockProfileData } from '../mocks/userProfile';
import { mockWorkoutOptions } from '../mocks/workoutOptions';

// Mock external dependencies
jest.mock('../../services/ai/external/OpenAIStrategy');
jest.mock('../../services/ai/internal/RecommendationEngine');

describe('AI Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate workout using internal AI only', async () => {
    // Mock internal generation
    const mockTemplate = {
      id: 'test-workout',
      title: 'Test Workout',
      description: 'A test workout',
      totalDuration: 30,
      estimatedCalories: 200,
      difficulty: 'some experience',
      equipment: ['body weight'],
      warmup: {
        name: 'Warm-up',
        duration: 5,
        exercises: [],
        instructions: 'Warm up properly',
        tips: ['Start slow']
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 20,
        exercises: [],
        instructions: 'Follow each exercise',
        tips: ['Focus on form']
      },
      cooldown: {
        name: 'Cool-down',
        duration: 5,
        exercises: [],
        instructions: 'Cool down properly',
        tips: ['Stretch gently']
      },
      reasoning: 'Test workout reasoning',
      personalizedNotes: ['Test note'],
      progressionTips: ['Test tip'],
      safetyReminders: ['Test reminder'],
      generatedAt: new Date(),
      aiModel: 'internal',
      confidence: 0.8,
      tags: ['test']
    };

    const mockRecommendations = [
      {
        type: 'intensity',
        content: 'Test recommendation',
        confidence: 0.9,
        source: 'profile',
        priority: 'high'
      }
    ];

    (RecommendationEngine.prototype.generateWorkout as jest.Mock).mockResolvedValue({
      template: mockTemplate,
      recommendations: mockRecommendations,
      prompt: 'Test prompt'
    });

    const { result } = renderHook(() => useWorkoutGeneration());

    await act(async () => {
      const workout = await result.current.generateWorkout(
        {
          profileData: mockProfileData,
          workoutFocusData: mockWorkoutOptions,
          preferences: {
            workoutStyle: [],
            timePreference: 'anytime',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'moderate'
          }
        },
        {
          useExternalAI: false
        }
      );

      expect(workout).toEqual(mockTemplate);
      expect(RecommendationEngine.prototype.generateWorkout).toHaveBeenCalledTimes(1);
      expect(OpenAIStrategy.prototype.generateWorkout).not.toHaveBeenCalled();
      expect(result.current.state.status).toBe('completed');
      expect(result.current.state.generationProgress).toBe(100);
    });
  });

  it('should generate workout using external AI with internal recommendations', async () => {
    // Mock internal generation
    const mockInternalResult = {
      template: {
        id: 'internal-workout',
        // ... other template properties
      },
      recommendations: [
        {
          type: 'intensity',
          content: 'Test recommendation',
          confidence: 0.9,
          source: 'profile',
          priority: 'high'
        }
      ],
      prompt: 'Test prompt'
    };

    // Mock external generation
    const mockExternalWorkout = {
      id: 'external-workout',
      title: 'External Workout',
      description: 'An external workout',
      totalDuration: 45,
      estimatedCalories: 300,
      difficulty: 'some experience',
      equipment: ['dumbbells'],
      warmup: {
        name: 'Warm-up',
        duration: 10,
        exercises: [],
        instructions: 'Warm up properly',
        tips: ['Start slow']
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 30,
        exercises: [],
        instructions: 'Follow each exercise',
        tips: ['Focus on form']
      },
      cooldown: {
        name: 'Cool-down',
        duration: 5,
        exercises: [],
        instructions: 'Cool down properly',
        tips: ['Stretch gently']
      },
      reasoning: 'External workout reasoning',
      personalizedNotes: ['External note'],
      progressionTips: ['External tip'],
      safetyReminders: ['External reminder'],
      generatedAt: new Date(),
      aiModel: 'gpt-4',
      confidence: 0.9,
      tags: ['external']
    };

    (RecommendationEngine.prototype.generateWorkout as jest.Mock).mockResolvedValue(mockInternalResult);
    (OpenAIStrategy.prototype.generateWorkout as jest.Mock).mockResolvedValue(mockExternalWorkout);

    const { result } = renderHook(() => useWorkoutGeneration());

    await act(async () => {
      const workout = await result.current.generateWorkout(
        {
          profileData: mockProfileData,
          workoutFocusData: mockWorkoutOptions,
          preferences: {
            workoutStyle: [],
            timePreference: 'anytime',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'moderate'
          }
        },
        {
          useExternalAI: true
        }
      );

      expect(workout).toEqual(mockExternalWorkout);
      expect(RecommendationEngine.prototype.generateWorkout).toHaveBeenCalledTimes(1);
      expect(OpenAIStrategy.prototype.generateWorkout).toHaveBeenCalledTimes(1);
      expect(OpenAIStrategy.prototype.generateWorkout).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          recommendations: mockInternalResult.recommendations,
          enhancedPrompt: mockInternalResult.prompt
        })
      );
      expect(result.current.state.status).toBe('completed');
      expect(result.current.state.generationProgress).toBe(100);
    });
  });

  it('should fallback to internal generation when external AI fails', async () => {
    // Mock internal generation
    const mockInternalResult = {
      template: {
        id: 'internal-workout',
        title: 'Internal Workout',
        description: 'An internal workout',
        totalDuration: 30,
        estimatedCalories: 200,
        difficulty: 'some experience',
        equipment: ['body weight'],
        warmup: {
          name: 'Warm-up',
          duration: 5,
          exercises: [],
          instructions: 'Warm up properly',
          tips: ['Start slow']
        },
        mainWorkout: {
          name: 'Main Workout',
          duration: 20,
          exercises: [],
          instructions: 'Follow each exercise',
          tips: ['Focus on form']
        },
        cooldown: {
          name: 'Cool-down',
          duration: 5,
          exercises: [],
          instructions: 'Cool down properly',
          tips: ['Stretch gently']
        },
        reasoning: 'Internal workout reasoning',
        personalizedNotes: ['Internal note'],
        progressionTips: ['Internal tip'],
        safetyReminders: ['Internal reminder'],
        generatedAt: new Date(),
        aiModel: 'internal',
        confidence: 0.8,
        tags: ['internal']
      },
      recommendations: [
        {
          type: 'intensity',
          content: 'Test recommendation',
          confidence: 0.9,
          source: 'profile',
          priority: 'high'
        }
      ],
      prompt: 'Test prompt'
    };

    (RecommendationEngine.prototype.generateWorkout as jest.Mock).mockResolvedValue(mockInternalResult);
    (OpenAIStrategy.prototype.generateWorkout as jest.Mock).mockRejectedValue(new Error('External AI failed'));

    const { result } = renderHook(() => useWorkoutGeneration());

    await act(async () => {
      const workout = await result.current.generateWorkout(
        {
          profileData: mockProfileData,
          workoutFocusData: mockWorkoutOptions,
          preferences: {
            workoutStyle: [],
            timePreference: 'anytime',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'moderate'
          }
        },
        {
          useExternalAI: true,
          fallbackToInternal: true
        }
      );

      expect(workout).toEqual(mockInternalResult.template);
      expect(RecommendationEngine.prototype.generateWorkout).toHaveBeenCalledTimes(1);
      expect(OpenAIStrategy.prototype.generateWorkout).toHaveBeenCalledTimes(1);
      expect(result.current.state.status).toBe('completed');
      expect(result.current.state.generationProgress).toBe(100);
    });
  });

  it('should handle cancellation during generation', async () => {
    const { result } = renderHook(() => useWorkoutGeneration());

    // Start generation
    const generationPromise = result.current.generateWorkout(
      {
        profileData: mockProfileData,
        workoutFocusData: mockWorkoutOptions,
        preferences: {
          workoutStyle: [],
          timePreference: 'anytime',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        }
      }
    );

    // Cancel generation
    act(() => {
      result.current.cancelGeneration();
    });

    await expect(generationPromise).rejects.toThrow('Generation was cancelled');
    expect(result.current.state.status).toBe('cancelled');
  });
});