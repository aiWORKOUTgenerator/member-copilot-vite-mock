import { WorkoutGenerationService } from '../WorkoutGenerationService';
import { OpenAIService } from '../OpenAIService';
import { WorkoutGenerationRequest } from '../../../types/workout-generation.types';
import { UserProfile } from '../../../types/user';

// Mock OpenAIService
jest.mock('../OpenAIService');

describe('Simple Workout Generation Test', () => {
  let workoutGenerationService: WorkoutGenerationService;
  let mockOpenAIService: jest.Mocked<OpenAIService>;

  beforeEach(() => {
    // Create mock OpenAIService
    mockOpenAIService = {
      generateFromTemplate: jest.fn(),
      healthCheck: jest.fn().mockResolvedValue(true),
    } as any;

    // Create WorkoutGenerationService instance
    workoutGenerationService = new WorkoutGenerationService(mockOpenAIService);
  });

  afterEach(() => {
    // Clear cache between tests
    workoutGenerationService.clearCache();
  });

  test('should generate a quick workout with correct request format', async () => {
    // Arrange - Using correct WorkoutGenerationRequest format
    const mockRequest: WorkoutGenerationRequest = {
      workoutType: 'quick', // Correct field name
      profileData: {
        experienceLevel: 'some experience',
        physicalActivity: 'moderate',
        preferredDuration: '30-45 min',
        timeCommitment: '3-4',
        intensityLevel: 'moderately',
        preferredActivities: ['Strength Training'],
        availableLocations: ['Home'],
        availableEquipment: ['Dumbbells'],
        primaryGoal: 'Strength',
        goalTimeline: '3 months',
        age: '26-35',
        height: '5\'8"',
        weight: '150 lbs',
        gender: 'male',
        hasCardiovascularConditions: 'No',
        injuries: ['No Injuries']
      },
      workoutFocusData: {
        customization_energy: 7,
        customization_soreness: {},
        customization_focus: 'strength',
        customization_duration: 30,
        customization_equipment: ['dumbbells'],
        customization_areas: []
      },
      userProfile: {
        fitnessLevel: 'some experience',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: true,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: ['dumbbells'],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 25,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.8,
          consistencyScore: 0.7,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'achievement',
          adaptationSpeed: 'moderate'
        }
      }
    };

    const mockGeneratedWorkout = {
      id: 'test-workout-1',
      title: 'Quick Strength Workout',
      description: 'A quick strength training session',
      totalDuration: 30,
      estimatedCalories: 200,
      difficulty: 'some experience' as const,
      equipment: ['dumbbells'],
      warmup: { name: 'Warm-up', duration: 5, exercises: [], instructions: '', tips: [] },
      mainWorkout: { name: 'Main Workout', duration: 20, exercises: [], instructions: '', tips: [] },
      cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
      reasoning: 'Based on your energy level and goals',
      personalizedNotes: ['Focus on form'],
      progressionTips: ['Increase weight gradually'],
      safetyReminders: ['Keep proper form'],
      generatedAt: new Date(),
      aiModel: 'gpt-4',
      confidence: 0.9,
      tags: ['strength', 'quick']
    };

    mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

    // Act
    const result = await workoutGenerationService.generateWorkout(mockRequest);

    // Assert
    expect(result).toEqual(mockGeneratedWorkout);
    expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'quick_workout_v2',
        name: 'Quick Workout Generation'
      }),
      expect.objectContaining({
        experienceLevel: 'some experience',
        primaryGoal: 'strength',
        availableEquipment: ['dumbbells'],
        energyLevel: 7,
        sorenessAreas: [],
        duration: 30,
        focus: 'strength'
      }),
      expect.objectContaining({
        timeout: 30000
      })
    );
  });

  test('should handle health check correctly', async () => {
    // Act
    const isHealthy = await workoutGenerationService.healthCheck();

    // Assert
    expect(isHealthy).toBe(true);
    expect(mockOpenAIService.healthCheck).toHaveBeenCalled();
  });

  test('should provide metrics', () => {
    // Act
    const metrics = workoutGenerationService.getMetrics();

    // Assert
    expect(metrics).toBeDefined();
    expect(typeof metrics.totalRequests).toBe('number');
    expect(typeof metrics.cacheHits).toBe('number');
    expect(typeof metrics.cacheMisses).toBe('number');
    expect(typeof metrics.averageResponseTime).toBe('number');
    expect(typeof metrics.errorCount).toBe('number');
  });

  test('should provide cache statistics', () => {
    // Act
    const cacheStats = workoutGenerationService.getCacheStats();

    // Assert
    expect(cacheStats).toBeDefined();
    expect(typeof cacheStats.size).toBe('number');
    expect(typeof cacheStats.hitRate).toBe('number');
    expect(cacheStats.size).toBeGreaterThanOrEqual(0);
    expect(cacheStats.hitRate).toBeGreaterThanOrEqual(0);
    expect(cacheStats.hitRate).toBeLessThanOrEqual(1);
  });
}); 