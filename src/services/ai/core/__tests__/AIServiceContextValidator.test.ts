import { AIServiceContextValidator } from '../context/AIServiceContextValidator';
import { UserProfile } from '../../../../types/user';

describe('AIServiceContextValidator', () => {
  let validator: AIServiceContextValidator;

  beforeEach(() => {
    validator = new AIServiceContextValidator();
  });

  describe('validateUserProfile', () => {
    it('should validate a complete UserProfile with optional fields', () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        preferences: {
          workoutStyle: ['strength_training', 'cardio'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells', 'bodyweight'],
          availableLocations: ['home', 'gym']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: ['dumbbells', 'bodyweight'],
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
          estimatedCompletedWorkouts: 50,
          averageDuration: 30,
          preferredFocusAreas: ['strength', 'cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        },
        // Optional personal metrics
        age: 30,
        height: 175,
        weight: 70,
        gender: 'male'
      };

      expect(() => validator.validateUserProfile(userProfile)).not.toThrow();
    });

    it('should validate a UserProfile without optional fields', () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['bodyweight'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: ['bodyweight'],
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
          estimatedCompletedWorkouts: 0,
          averageDuration: 30,
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
        // No optional fields
      };

      expect(() => validator.validateUserProfile(userProfile)).not.toThrow();
    });

    it('should validate a UserProfile with partial optional fields', () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'advanced',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
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
          estimatedCompletedWorkouts: 50,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        },
        // Only some optional fields
        age: 25,
        gender: 'female'
        // height and weight are undefined
      };

      expect(() => validator.validateUserProfile(userProfile)).not.toThrow();
    });

    it('should reject invalid age values', () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'expert',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
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
          estimatedCompletedWorkouts: 50,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        },
        age: 5 // Invalid age (too young)
      };

      expect(() => validator.validateUserProfile(userProfile)).toThrow('age must be between 13 and 100');
    });

    it('should reject invalid gender values', () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
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
          estimatedCompletedWorkouts: 50,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        },
        gender: 'invalid' as any // Invalid gender
      };

      expect(() => validator.validateUserProfile(userProfile)).toThrow('gender must be one of');
    });
  });
}); 