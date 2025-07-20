import { featureFlagService } from '../featureFlags/FeatureFlagService';
import { UserProfile } from '../../../types/user';

describe('OpenAI Feature Flags', () => {
  const mockUserProfile: UserProfile = {
    fitnessLevel: 'some experience',
    goals: ['strength', 'weight loss'],
    preferences: {
      workoutStyle: ['strength training', 'cardio'],
      timePreference: 'morning',
      intensityPreference: 'moderate',
      advancedFeatures: true,
      aiAssistanceLevel: 'moderate'
    },
    basicLimitations: {
      injuries: [],
      availableEquipment: ['dumbbells', 'resistance bands'],
      availableLocations: ['home', 'gym']
    },
    enhancedLimitations: {
      timeConstraints: 45,
      equipmentConstraints: ['dumbbells', 'resistance bands'],
      locationConstraints: ['home', 'gym'],
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
      averageDuration: 45,
      preferredFocusAreas: ['strength', 'cardio'],
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
  };

  test('should enable OpenAI workout generation for all users', () => {
    const isEnabled = featureFlagService.isEnabled('openai_workout_generation', mockUserProfile);
    expect(isEnabled).toBe(true);
  });

  test('should enable OpenAI enhanced recommendations for all users', () => {
    const isEnabled = featureFlagService.isEnabled('openai_enhanced_recommendations', mockUserProfile);
    expect(isEnabled).toBe(true);
  });

  test('should enable OpenAI user analysis for all users', () => {
    const isEnabled = featureFlagService.isEnabled('openai_user_analysis', mockUserProfile);
    expect(isEnabled).toBe(true);
  });

  test('should return all OpenAI flags as enabled', () => {
    const aiFlags = featureFlagService.getAIFlags(mockUserProfile);
    
    expect(aiFlags.openai_workout_generation).toBe(true);
    expect(aiFlags.openai_enhanced_recommendations).toBe(true);
    expect(aiFlags.openai_user_analysis).toBe(true);
  });

  test('should maintain consistent user allocation', () => {
    // Test that the same user gets the same allocation consistently
    const result1 = featureFlagService.isEnabled('openai_workout_generation', mockUserProfile);
    const result2 = featureFlagService.isEnabled('openai_workout_generation', mockUserProfile);
    const result3 = featureFlagService.isEnabled('openai_workout_generation', mockUserProfile);
    
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe(true); // Should be enabled for all users
  });
}); 