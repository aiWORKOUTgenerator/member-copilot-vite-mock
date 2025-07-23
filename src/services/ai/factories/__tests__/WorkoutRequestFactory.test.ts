import { WorkoutRequestFactory } from '../WorkoutRequestFactory';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { PerWorkoutOptions } from '../../../../types/core';
import { UserProfile } from '../../../../types/user';
import { ProfileData } from '../../../../components/Profile/types/profile.types';

describe('WorkoutRequestFactory', () => {
  let mockUserProfile: UserProfile;
  let mockWorkoutFocusData: PerWorkoutOptions;
  let mockProfileData: ProfileData;

  beforeEach(() => {
    // Create a valid mock user profile
    mockUserProfile = {
      fitnessLevel: 'intermediate',
      goals: ['general_fitness'],
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
      },
      enhancedLimitations: {
        timeConstraints: 0,
        equipmentConstraints: [],
        locationConstraints: [],
        recoveryNeeds: {
          restDays: 2,
          sleepHours: 7,
          hydrationLevel: 'moderate'
        },
        mobilityLimitations: [],
        progressionRate: 'moderate'
      },
      workoutHistory: {
        estimatedCompletedWorkouts: 0,
        averageDuration: 45,
        preferredFocusAreas: [],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.7,
        consistencyScore: 0.5,
        plateauRisk: 'low'
      },
      learningProfile: {
        prefersSimplicity: true,
        explorationTendency: 'moderate',
        feedbackPreference: 'simple',
        learningStyle: 'visual',
        motivationType: 'intrinsic',
        adaptationSpeed: 'moderate'
      }
    };

    // Create valid mock workout focus data
    mockWorkoutFocusData = {
      customization_focus: {
        focus: 'strength',
        label: 'Strength Training',
        selected: true,
        metadata: {
          intensity: 'moderate',
          equipment: 'moderate',
          experience: 'some experience',
          duration_compatibility: [30, 45, 60]
        }
      },
      customization_duration: {
        duration: 30,
        warmupDuration: 5,
        mainDuration: 20,
        cooldownDuration: 5,
        selected: true,
        label: '30 minutes'
      },
      customization_energy: 7,
      customization_equipment: ['Dumbbells', 'Body Weight'],
      customization_location: 'home',
      customization_intensity: 'moderate',
      customization_soreness: ['Upper Body', 'Lower Body']
    };

    // Create valid mock profile data
    mockProfileData = {
      experienceLevel: 'Some Experience',
      primaryGoal: 'Strength',
      physicalActivity: 'moderate',
      preferredDuration: '30-45 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      goalTimeline: '3 months',
      preferredActivities: ['Running/Jogging', 'Swimming'],
      availableEquipment: ['Dumbbells', 'Resistance Bands'],
      availableLocations: ['Home', 'Gym'],
      age: '26-35',
      height: '175',
      weight: '70',
      gender: 'male',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
  });

  it('should create a valid workout generation request', () => {
    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: mockWorkoutFocusData
    });

    expect(request).toBeDefined();
    expect(request.workoutType).toBe('quick');
    expect(request.userProfile).toBe(mockUserProfile);
    expect(request.workoutFocusData).toBe(mockWorkoutFocusData);
    expect(request.profileData).toBeDefined();
    expect(request.preferences).toBeDefined();
    expect(request.constraints).toBeDefined();
    expect(request.environmentalFactors).toBeDefined();
  });

  it('should create default preferences correctly', () => {
    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: mockWorkoutFocusData
    });

    expect(request.preferences).toEqual({
      duration: 30,
      focus: 'strength',
      intensity: 'moderate',
      equipment: ['Dumbbells', 'Body Weight'],
      location: 'home'
    });
  });

  it('should create default constraints correctly', () => {
    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: mockWorkoutFocusData
    });

    expect(request.constraints).toEqual({
      maxDuration: 35,
      minDuration: 25,
      intensityLimit: 'moderate'
    });
  });

  it('should create default environmental factors correctly', () => {
    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: mockWorkoutFocusData
    });

    expect(request.environmentalFactors).toEqual({
      location: 'indoor',
      timeOfDay: 'morning'
    });
  });

  it('should handle missing optional fields', () => {
    const minimalWorkoutFocusData: PerWorkoutOptions = {
      customization_focus: 'strength',
      customization_duration: {
        duration: 30,
        warmupDuration: 5,
        mainDuration: 20,
        cooldownDuration: 5,
        selected: true,
        label: '30 minutes'
      }
    };

    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: minimalWorkoutFocusData
    });

    expect(request).toBeDefined();
    expect(request.preferences.equipment).toEqual(['bodyweight']);
    expect(request.preferences.location).toBe('home');
  });

  it('should handle numeric duration values', () => {
    const numericDurationData: PerWorkoutOptions = {
      ...mockWorkoutFocusData,
      customization_duration: 30
    };

    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: numericDurationData
    });

    expect(request.preferences.duration).toBe(30);
  });

  it('should handle string focus values', () => {
    const stringFocusData: PerWorkoutOptions = {
      ...mockWorkoutFocusData,
      customization_focus: 'strength'
    };

    const request = WorkoutRequestFactory.createRequest({
      workoutType: 'quick',
      userProfile: mockUserProfile,
      workoutFocusData: stringFocusData
    });

    expect(request.preferences.focus).toBe('strength');
  });
}); 