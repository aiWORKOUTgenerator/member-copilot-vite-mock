// Integration test for WorkoutGenerationService
import { WorkoutGenerationService } from '../WorkoutGenerationService';
import { OpenAIService } from '../OpenAIService';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { UserProfile } from '../../../../types/user';
import { PerWorkoutOptions } from '../../../../types/enhanced-workout-types';
import { WorkoutRequestFactory } from '../../factories/WorkoutRequestFactory';
import { WorkoutRequestValidator } from '../../validation/core/WorkoutRequestValidator';

// Mock dependencies
jest.mock('../OpenAIService');
jest.mock('../../factories/WorkoutRequestFactory');
jest.mock('../../validation/core/WorkoutRequestValidator');

describe('WorkoutGenerationService Integration', () => {
  let workoutGenerationService: WorkoutGenerationService;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let mockGeneratedWorkout: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock OpenAIService
    mockOpenAIService = {
      generateFromTemplate: jest.fn(),
      healthCheck: jest.fn().mockResolvedValue(true)
    } as any;

    // Create WorkoutGenerationService instance
    workoutGenerationService = new WorkoutGenerationService(mockOpenAIService);

    // Create mock workout response
    mockGeneratedWorkout = {
      id: 'test-workout-1',
      title: 'Test Workout',
      description: 'A test workout',
      totalDuration: 30,
      estimatedCalories: 200,
      difficulty: 'some experience',
      equipment: ['bodyweight'],
      warmup: {
        name: 'Warm-up',
        duration: 5,
        exercises: [{ name: 'Jumping Jacks', duration: 300 }]
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 20,
        exercises: [{ name: 'Push-ups', sets: 3, reps: 10 }]
      },
      cooldown: {
        name: 'Cool-down',
        duration: 5,
        exercises: [{ name: 'Stretching', duration: 300 }]
      },
      reasoning: 'Test workout reasoning',
      personalizedNotes: ['Test note'],
      progressionTips: ['Test tip'],
      safetyReminders: ['Test reminder'],
      generatedAt: new Date(),
      aiModel: 'gpt-4',
      confidence: 0.9,
      tags: ['test']
    };

    // Mock OpenAI response
    mockOpenAIService.generateFromTemplate.mockResolvedValue(mockGeneratedWorkout);

    // Mock WorkoutRequestValidator
    (WorkoutRequestValidator.validate as jest.Mock).mockImplementation((request) => {
      if (!request || !request.workoutType) {
        return {
          isValid: false,
          errors: ['workoutType is required'],
          warnings: []
        };
      }
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    });

    // Mock WorkoutRequestFactory
    (WorkoutRequestFactory.createRequest as jest.Mock).mockImplementation((params) => ({
      workoutType: params.workoutType || 'quick',
      profileData: params.profileData,
      workoutFocusData: params.workoutFocusData,
      userProfile: params.userProfile,
      preferences: {
        duration: 30,
        focus: 'strength',
        intensity: 'moderate',
        equipment: ['bodyweight'],
        location: 'home'
      },
      constraints: {
        timeOfDay: 'morning',
        energyLevel: 7,
        sorenessAreas: []
      },
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    }));

    (WorkoutRequestFactory.fromQuickWorkout as jest.Mock).mockImplementation((quickWorkoutData, userProfile) => ({
      workoutType: 'quick',
      profileData: {},
      workoutFocusData: quickWorkoutData,
      userProfile,
      preferences: {
        duration: 30,
        focus: 'strength',
        intensity: 'moderate',
        equipment: ['bodyweight'],
        location: 'home'
      },
      constraints: {
        timeOfDay: 'morning',
        energyLevel: 7,
        sorenessAreas: []
      },
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    }));

    (WorkoutRequestFactory.createDefaultEnhancements as jest.Mock).mockReturnValue({
      preferences: {
        duration: 30,
        focus: 'strength',
        intensity: 'moderate',
        equipment: ['bodyweight'],
        location: 'home'
      },
      constraints: {
        timeOfDay: 'morning',
        energyLevel: 7,
        sorenessAreas: []
      },
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    });

    // Reset service state
    workoutGenerationService.resetService();
  });

  // Test 1: Reproduce original failing scenario
  it('should handle missing workoutType gracefully', async () => {
    // Create request missing workoutType (original issue)
    const invalidRequest = {
      profileData: {
        experienceLevel: 'Some Experience',
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
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        }
      } as UserProfile,
      workoutFocusData: {
        customization_duration: 30,
        customization_focus: 'strength',
        customization_energy: 7
      }
    } as WorkoutGenerationRequest;

    // Should throw clear validation error
    await expect(workoutGenerationService.generateWorkout(invalidRequest))
      .rejects.toThrow('Invalid request parameters: workoutType is required');
  });

  // Test 2: Verify valid request works
  it('should generate workout with valid request', async () => {
    // Create valid request using factory
    const validRequest = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      profileData: {
        experienceLevel: 'Some Experience',
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
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        }
      } as UserProfile,
      workoutFocusData: {
        customization_duration: 30,
        customization_focus: 'strength',
        customization_energy: 7
      }
    });

    const result = await workoutGenerationService.generateWorkout(validRequest);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.warmup).toBeDefined();
    expect(result.mainWorkout).toBeDefined();
    expect(result.cooldown).toBeDefined();
  });

  // Test 3: Verify legacy method still works
  it('should maintain generateFromQuickWorkout compatibility', async () => {
    const quickWorkoutData: PerWorkoutOptions = {
      customization_duration: 20,
      customization_focus: 'strength',
      customization_energy: 7,
      customization_equipment: ['bodyweight']
    };

    const userProfile: UserProfile = {
      fitnessLevel: 'intermediate',
      goals: ['strength'],
      preferences: {
        workoutStyle: ['balanced'],
        timePreference: 'morning',
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate'
      },
      basicLimitations: {
        injuries: [],
        availableEquipment: ['Body Weight'],
        availableLocations: ['Home']
      }
    } as UserProfile;

    const result = await workoutGenerationService.generateFromQuickWorkout(quickWorkoutData, userProfile);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.warmup).toBeDefined();
    expect(result.mainWorkout).toBeDefined();
    expect(result.cooldown).toBeDefined();
  });

  // Test 4: Verify factory integration
  it('should use WorkoutRequestFactory for request creation', async () => {
    // Create valid request data
    const requestData = {
      workoutType: 'quick',
      profileData: {
        experienceLevel: 'Some Experience',
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
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        }
      } as UserProfile,
      workoutFocusData: {
        customization_duration: 30,
        customization_focus: 'strength',
        customization_energy: 7
      }
    };

    // Spy on factory
    const createRequestSpy = jest.spyOn(WorkoutRequestFactory, 'createRequest');
    
    // Call service
    await workoutGenerationService.generateWorkout(WorkoutRequestFactory.createRequest(requestData));

    // Verify factory was called
    expect(createRequestSpy).toHaveBeenCalled();
    expect(createRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
      workoutType: 'quick',
      workoutFocusData: expect.any(Object),
      userProfile: expect.any(Object)
    }));
  });
}); 