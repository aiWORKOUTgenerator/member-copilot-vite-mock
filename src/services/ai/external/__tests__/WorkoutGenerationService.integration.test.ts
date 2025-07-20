// Integration test for WorkoutGenerationService
import { WorkoutGenerationService } from '../WorkoutGenerationService';
import { OpenAIService } from '../OpenAIService';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { UserProfile } from '../../../../types/user';
import { ProfileData } from '../../../Profile/types/profile.types';

// Mock OpenAIService
jest.mock('../OpenAIService');

describe('WorkoutGenerationService Integration', () => {
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

  describe('generateWorkout', () => {
    it('should handle quick workout requests correctly', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        workoutType: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: '26-35',
          height: '175',
          weight: '70',
          gender: 'male',
          hasCardiovascularConditions: 'No',
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
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
          primaryGoal: 'build strength',
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

    it('should handle detailed workout requests correctly', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        workoutType: 'detailed',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 45,
          timeCommitment: 'high',
          intensityLevel: 'high',
          preferredActivities: ['strength training', 'cardio'],
          availableEquipment: ['dumbbells', 'resistance bands'],
          primaryGoal: 'build muscle',
          goalTimeline: '6 months',
          age: '18-25',
          height: '180',
          weight: '75',
          gender: 'male',
          hasCardiovascularConditions: 'No',
          injuries: []
        } as ProfileData,
        workoutFocusData: {
          customization_energy: 8,
          customization_soreness: { 'chest': { selected: true, level: 3 } },
          customization_focus: 'strength',
          customization_duration: 45,
          customization_equipment: ['dumbbells', 'resistance bands'],
          customization_areas: ['chest', 'back']
        },
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['build muscle'],
          preferences: {
            workoutDuration: 45,
            intensity: 'high',
            equipment: ['dumbbells', 'resistance bands']
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'test-workout-2',
        title: 'Detailed Strength Workout',
        description: 'A comprehensive strength training session',
        totalDuration: 45,
        estimatedCalories: 350,
        difficulty: 'some experience' as const,
        equipment: ['dumbbells', 'resistance bands'],
        warmup: { name: 'Warm-up', duration: 8, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 32, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
        reasoning: 'Comprehensive workout considering your goals and equipment',
        personalizedNotes: ['Focus on chest and back'],
        progressionTips: ['Progressive overload'],
        safetyReminders: ['Avoid chest exercises due to soreness'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.85,
        tags: ['strength', 'detailed', 'chest', 'back']
      };

      mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

      // Act
      const result = await workoutGenerationService.generateWorkout(mockRequest);

      // Assert
      expect(result).toEqual(mockGeneratedWorkout);
      expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/detailed_workout|recovery_workout|new_to_exercise_workout/)
        }),
        expect.objectContaining({
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 45,
          timeCommitment: 'high',
          intensityLevel: 'high',
          preferredActivities: ['strength training', 'cardio'],
          availableEquipment: ['dumbbells', 'resistance bands'],
          primaryGoal: 'build muscle',
          goalTimeline: '6 months',
          age: '18-25',
          height: '180',
          weight: '75',
          gender: 'male',
          hasCardiovascularConditions: 'No',
          injuries: [],
          energyLevel: 8,
          sorenessAreas: ['chest'],
          duration: 45,
          focus: 'strength',
          equipment: ['dumbbells', 'resistance bands']
        }),
        expect.objectContaining({
          timeout: 30000
        })
      );
    });

    it('should handle null/undefined values safely', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        workoutType: 'quick',
        profileData: {
          experienceLevel: 'new to exercise',
          physicalActivity: 'low',
          preferredDuration: 20,
          timeCommitment: 'low',
          intensityLevel: 'low',
          preferredActivities: ['walking'],
          availableEquipment: [],
          primaryGoal: 'general fitness',
          goalTimeline: '1 month',
          age: '36-45',
          height: '165',
          weight: '60',
          gender: 'female',
          hasCardiovascularConditions: 'No',
          injuries: []
        } as ProfileData,
        workoutFocusData: {
          customization_energy: undefined,
          customization_soreness: undefined,
          customization_focus: undefined,
          customization_duration: undefined,
          customization_equipment: undefined,
          customization_areas: undefined
        },
        userProfile: {
          fitnessLevel: 'new to exercise',
          goals: ['general fitness'],
          preferences: {
            workoutDuration: 20,
            intensity: 'low',
            equipment: []
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'test-workout-3',
        title: 'Beginner Workout',
        description: 'A gentle workout for beginners',
        totalDuration: 20,
        estimatedCalories: 100,
        difficulty: 'new to exercise' as const,
        equipment: [],
        warmup: { name: 'Warm-up', duration: 3, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 14, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 3, exercises: [], instructions: '', tips: [] },
        reasoning: 'Gentle workout for beginners',
        personalizedNotes: ['Start slow'],
        progressionTips: ['Gradual progression'],
        safetyReminders: ['Listen to your body'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.95,
        tags: ['beginner', 'gentle']
      };

      mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

      // Act
      const result = await workoutGenerationService.generateWorkout(mockRequest);

      // Assert
      expect(result).toEqual(mockGeneratedWorkout);
      expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'quick_workout_v2'
        }),
        expect.objectContaining({
          experienceLevel: 'new to exercise',
          primaryGoal: 'general fitness',
          availableEquipment: [],
          energyLevel: 5, // Default value
          sorenessAreas: [], // Default empty array
          duration: 0, // Extracted from undefined duration
          focus: '' // Extracted from undefined focus
        }),
        expect.objectContaining({
          timeout: 30000
        })
      );
    });

    it('should throw error when OpenAIService fails', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        workoutType: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: '26-35',
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const mockError = new Error('OpenAI API error');
      mockOpenAIService.generateFromTemplate.mockRejectedValue(mockError);

      // Act & Assert
      await expect(workoutGenerationService.generateWorkout(mockRequest))
        .rejects.toThrow('OpenAI API error');
    });

    it('should validate request and throw error for invalid data', async () => {
      // Arrange - Invalid request missing required fields
      const invalidRequest = {
        type: 'quick',
        profileData: {} as ProfileData,
        workoutFocusData: {},
        userProfile: {} as UserProfile
      } as WorkoutGenerationRequest;

      // Act & Assert
      await expect(workoutGenerationService.generateWorkout(invalidRequest))
        .rejects.toThrow('Invalid request: User fitness level is required');
    });

    it('should validate energy level range', async () => {
      // Arrange - Invalid energy level
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
        workoutFocusData: {
          customization_energy: 15, // Invalid energy level
          customization_soreness: {},
          customization_focus: 'strength',
          customization_duration: 30,
          customization_equipment: ['dumbbells'],
          customization_areas: []
        },
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      // Act & Assert
      await expect(workoutGenerationService.generateWorkout(mockRequest))
        .rejects.toThrow('Invalid request: Energy level must be between 1 and 10');
    });

    it('should cache workout results and serve from cache', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'cached-workout',
        title: 'Cached Workout',
        description: 'A cached workout',
        totalDuration: 30,
        estimatedCalories: 200,
        difficulty: 'some experience' as const,
        equipment: ['dumbbells'],
        warmup: { name: 'Warm-up', duration: 5, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 20, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
        reasoning: 'Cached workout',
        personalizedNotes: ['From cache'],
        progressionTips: ['Cached tips'],
        safetyReminders: ['Cached reminders'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.9,
        tags: ['cached']
      };

      mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

      // Act - First call should hit the API
      const result1 = await workoutGenerationService.generateWorkout(mockRequest);
      
      // Second call should hit the cache
      const result2 = await workoutGenerationService.generateWorkout(mockRequest);

      // Assert
      expect(result1).toEqual(mockGeneratedWorkout);
      expect(result2).toEqual(mockGeneratedWorkout);
      
      // Should only call the API once (second call should be cached)
      expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledTimes(1);
      
      // Check cache stats
      const cacheStats = workoutGenerationService.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      expect(cacheStats.hitRate).toBeGreaterThan(0);
    });

    it('should retry failed requests with exponential backoff', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'retry-workout',
        title: 'Retry Workout',
        description: 'A workout after retries',
        totalDuration: 30,
        estimatedCalories: 200,
        difficulty: 'some experience' as const,
        equipment: ['dumbbells'],
        warmup: { name: 'Warm-up', duration: 5, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 20, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
        reasoning: 'After retries',
        personalizedNotes: ['Retry success'],
        progressionTips: ['Retry tips'],
        safetyReminders: ['Retry reminders'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.9,
        tags: ['retry']
      };

      // Mock first two calls to fail, third to succeed
      mockOpenAIService.generateFromTemplate
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValueOnce(mockGeneratedWorkout);

      // Act
      const result = await workoutGenerationService.generateWorkout(mockRequest);

      // Assert
      expect(result).toEqual(mockGeneratedWorkout);
      expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledTimes(3);
    });

    it('should not retry validation errors', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const validationError = new Error('Invalid request: validation failed');
      mockOpenAIService.generateFromTemplate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(workoutGenerationService.generateWorkout(mockRequest))
        .rejects.toThrow('Invalid request: validation failed');
      
      // Should only call once (no retry for validation errors)
      expect(mockOpenAIService.generateFromTemplate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Monitoring', () => {
    it('should track performance metrics', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'metrics-workout',
        title: 'Metrics Workout',
        description: 'A workout for metrics testing',
        totalDuration: 30,
        estimatedCalories: 200,
        difficulty: 'some experience' as const,
        equipment: ['dumbbells'],
        warmup: { name: 'Warm-up', duration: 5, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 20, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
        reasoning: 'For metrics',
        personalizedNotes: ['Metrics test'],
        progressionTips: ['Metrics tips'],
        safetyReminders: ['Metrics reminders'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.9,
        tags: ['metrics']
      };

      mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

      // Act
      await workoutGenerationService.generateWorkout(mockRequest);

      // Assert
      const metrics = workoutGenerationService.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.lastRequestTime).toBeGreaterThan(0);
    });

    it('should provide cache statistics', async () => {
      // Arrange
      const mockRequest: WorkoutGenerationRequest = {
        type: 'quick',
        profileData: {
          experienceLevel: 'some experience',
          physicalActivity: 'moderate',
          preferredDuration: 30,
          timeCommitment: 'medium',
          intensityLevel: 'moderate',
          preferredActivities: ['strength training'],
          availableEquipment: ['dumbbells'],
          primaryGoal: 'build strength',
          goalTimeline: '3 months',
          age: 30,
          height: 175,
          weight: 70,
          gender: 'male',
          hasCardiovascularConditions: false,
          injuries: []
        } as ProfileData,
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
          goals: ['build strength'],
          preferences: {
            workoutDuration: 30,
            intensity: 'moderate',
            equipment: ['dumbbells']
          }
        } as UserProfile
      };

      const mockGeneratedWorkout = {
        id: 'cache-stats-workout',
        title: 'Cache Stats Workout',
        description: 'A workout for cache stats testing',
        totalDuration: 30,
        estimatedCalories: 200,
        difficulty: 'some experience' as const,
        equipment: ['dumbbells'],
        warmup: { name: 'Warm-up', duration: 5, exercises: [], instructions: '', tips: [] },
        mainWorkout: { name: 'Main Workout', duration: 20, exercises: [], instructions: '', tips: [] },
        cooldown: { name: 'Cool-down', duration: 5, exercises: [], instructions: '', tips: [] },
        reasoning: 'For cache stats',
        personalizedNotes: ['Cache stats test'],
        progressionTips: ['Cache stats tips'],
        safetyReminders: ['Cache stats reminders'],
        generatedAt: new Date(),
        aiModel: 'gpt-4',
        confidence: 0.9,
        tags: ['cache-stats']
      };

      mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

      // Act
      await workoutGenerationService.generateWorkout(mockRequest);
      const cacheStats = workoutGenerationService.getCacheStats();

      // Assert
      expect(cacheStats.size).toBe(1);
      expect(cacheStats.hitRate).toBe(0); // No cache hits yet
    });

    it('should perform health check', async () => {
      // Act
      const isHealthy = await workoutGenerationService.healthCheck();

      // Assert
      expect(isHealthy).toBe(true);
      expect(mockOpenAIService.healthCheck).toHaveBeenCalled();
    });
  });
}); 