import { WorkoutRequestFactory } from '../WorkoutRequestFactory';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { PerWorkoutOptions } from '../../../../types/enhanced-workout-types';
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
      }
    };

    // Create valid mock workout focus data
    mockWorkoutFocusData = {
      customization_duration: 30,
      customization_focus: 'strength',
      customization_energy: 7,
      customization_equipment: ['dumbbells', 'bodyweight']
    };

    // Create valid mock profile data
    mockProfileData = {
      experienceLevel: 'Some Experience',
      physicalActivity: 'moderate',
      preferredDuration: '45-60 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      preferredActivities: ['Running/Jogging', 'Yoga'],
      availableLocations: ['Gym', 'Home'],
      availableEquipment: ['Dumbbells', 'Resistance Bands'],
      primaryGoal: 'Strength',
      goalTimeline: '6 months',
      age: '36-45',
      height: '',
      weight: '',
      gender: 'prefer-not-to-say',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
  });

  describe('createRequest', () => {
    it('should create a valid request with all required fields', () => {
      const request = WorkoutRequestFactory.createRequest({
        workoutType: 'quick',
        profileData: mockProfileData,
        workoutFocusData: mockWorkoutFocusData,
        userProfile: mockUserProfile
      });

      expect(request).toBeDefined();
      expect(request.workoutType).toBe('quick');
      expect(request.profileData).toBe(mockProfileData);
      expect(request.workoutFocusData).toBe(mockWorkoutFocusData);
      expect(request.userProfile).toBe(mockUserProfile);
      expect(request.preferences).toBeDefined();
      expect(request.constraints).toBeDefined();
      expect(request.environmentalFactors).toBeDefined();
    });

    it('should infer workoutType as quick for short durations', () => {
      const request = WorkoutRequestFactory.createRequest({
        profileData: mockProfileData,
        workoutFocusData: { ...mockWorkoutFocusData, customization_duration: 15 },
        userProfile: mockUserProfile
      });

      expect(request.workoutType).toBe('quick');
    });

    it('should infer workoutType as detailed for longer durations', () => {
      const request = WorkoutRequestFactory.createRequest({
        profileData: mockProfileData,
        workoutFocusData: { ...mockWorkoutFocusData, customization_duration: 45 },
        userProfile: mockUserProfile
      });

      expect(request.workoutType).toBe('detailed');
    });

    it('should throw error for invalid request', () => {
      const invalidUserProfile = { ...mockUserProfile, fitnessLevel: 'invalid' as any };
      
      expect(() => {
        WorkoutRequestFactory.createRequest({
          workoutType: 'quick',
          profileData: mockProfileData,
          workoutFocusData: mockWorkoutFocusData,
          userProfile: invalidUserProfile
        });
      }).toThrow('Invalid request parameters');
    });
  });

  describe('fromQuickWorkout', () => {
    it('should create a valid request from quick workout data', () => {
      const request = WorkoutRequestFactory.fromQuickWorkout(
        mockWorkoutFocusData,
        mockUserProfile
      );

      expect(request).toBeDefined();
      expect(request.workoutType).toBe('quick');
      expect(request.workoutFocusData).toBe(mockWorkoutFocusData);
      expect(request.userProfile).toBe(mockUserProfile);
      expect(request.preferences).toBeDefined();
      expect(request.constraints).toBeDefined();
      expect(request.environmentalFactors).toBeDefined();
    });
  });

  describe('fromAppComponents', () => {
    it('should create a valid request from app components', () => {
      const request = WorkoutRequestFactory.fromAppComponents(
        'detailed',
        mockProfileData,
        mockWorkoutFocusData,
        mockUserProfile
      );

      expect(request).toBeDefined();
      expect(request.workoutType).toBe('detailed');
      expect(request.profileData).toBe(mockProfileData);
      expect(request.workoutFocusData).toBe(mockWorkoutFocusData);
      expect(request.userProfile).toBe(mockUserProfile);
      expect(request.preferences).toBeDefined();
      expect(request.constraints).toBeDefined();
      expect(request.environmentalFactors).toBeDefined();
    });

    it('should include waiver data when provided', () => {
      const mockWaiverData = { accepted: true, timestamp: new Date() };
      
      const request = WorkoutRequestFactory.fromAppComponents(
        'detailed',
        mockProfileData,
        mockWorkoutFocusData,
        mockUserProfile,
        mockWaiverData
      );

      expect(request.waiverData).toBe(mockWaiverData);
    });
  });

  describe('preferences generation', () => {
    it('should create preferences with correct intensity mapping', () => {
      const lowEnergyRequest = WorkoutRequestFactory.createRequest({
        workoutType: 'quick',
        profileData: mockProfileData,
        workoutFocusData: { ...mockWorkoutFocusData, customization_energy: 2 },
        userProfile: mockUserProfile
      });
      expect(lowEnergyRequest.preferences?.intensity).toBe('low');

      const moderateEnergyRequest = WorkoutRequestFactory.createRequest({
        workoutType: 'quick',
        profileData: mockProfileData,
        workoutFocusData: { ...mockWorkoutFocusData, customization_energy: 5 },
        userProfile: mockUserProfile
      });
      expect(moderateEnergyRequest.preferences?.intensity).toBe('moderate');

      const highEnergyRequest = WorkoutRequestFactory.createRequest({
        workoutType: 'quick',
        profileData: mockProfileData,
        workoutFocusData: { ...mockWorkoutFocusData, customization_energy: 9 },
        userProfile: mockUserProfile
      });
      expect(highEnergyRequest.preferences?.intensity).toBe('high');
    });

    it('should extract equipment list correctly', () => {
      const request = WorkoutRequestFactory.createRequest({
        workoutType: 'quick',
        profileData: mockProfileData,
        workoutFocusData: {
          ...mockWorkoutFocusData,
          customization_equipment: ['dumbbells', 'kettlebell']
        },
        userProfile: mockUserProfile
      });

      expect(request.preferences?.equipment).toEqual(['dumbbells', 'kettlebell']);
    });
  });
}); 