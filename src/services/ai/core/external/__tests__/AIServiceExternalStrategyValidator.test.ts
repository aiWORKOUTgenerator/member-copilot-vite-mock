import { AIServiceExternalStrategyValidator } from '../AIServiceExternalStrategyValidator';
import { GlobalAIContext, AIServiceWorkoutRequest } from '../../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile, AIAssistanceLevel } from '../../../../../types';

// Mock data for testing
const mockUserProfile: UserProfile = {
  fitnessLevel: 'intermediate',
  age: 30,
  weight: 70,
  height: 175,
  goals: ['strength', 'endurance'],
  experience: 2
};

const mockWorkoutOptions: PerWorkoutOptions = {
  customization_energy: 7,
  customization_soreness: ['legs', 'back'],
  customization_focus: 'strength',
  customization_duration: 45,
  customization_equipment: ['dumbbells', 'resistance bands']
};

const mockContext: GlobalAIContext = {
  userProfile: mockUserProfile,
  currentSelections: mockWorkoutOptions,
  sessionHistory: [],
  preferences: {
    aiAssistanceLevel: 'moderate' as AIAssistanceLevel,
    showLearningInsights: true,
    autoApplyLowRiskRecommendations: false
  }
};

const mockWorkoutRequest: AIServiceWorkoutRequest = {
  userProfile: mockUserProfile,
  workoutOptions: mockWorkoutOptions,
  preferences: {
    duration: 45,
    focus: 'strength',
    intensity: 'moderate',
    equipment: ['dumbbells', 'resistance bands'],
    location: 'home'
  },
  constraints: {
    timeOfDay: 'morning',
    energyLevel: 7,
    sorenessAreas: ['legs', 'back']
  }
};

describe('AIServiceExternalStrategyValidator', () => {
  let validator: AIServiceExternalStrategyValidator;

  beforeEach(() => {
    validator = new AIServiceExternalStrategyValidator();
  });

  describe('validateStrategy', () => {
    it('should validate complete external strategy', () => {
      const validStrategy = {
        generateWorkout: jest.fn(),
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn(),
        isHealthy: jest.fn()
      };

      const result = validator.validateStrategy(validStrategy);
      expect(result).toBe(true);
    });

    it('should validate strategy without health check methods', () => {
      const basicStrategy = {
        generateWorkout: jest.fn(),
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn()
      };

      const result = validator.validateStrategy(basicStrategy);
      expect(result).toBe(true);
    });

    it('should reject null strategy', () => {
      const result = validator.validateStrategy(null);
      expect(result).toBe(false);
    });

    it('should reject undefined strategy', () => {
      const result = validator.validateStrategy(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object strategy', () => {
      const result = validator.validateStrategy('not an object');
      expect(result).toBe(false);
    });

    it('should reject strategy missing required methods', () => {
      const invalidStrategy = {
        generateWorkout: jest.fn(),
        // Missing other required methods
      };

      const result = validator.validateStrategy(invalidStrategy);
      expect(result).toBe(false);
    });

    it('should reject strategy with non-function methods', () => {
      const invalidStrategy = {
        generateWorkout: 'not a function',
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn()
      };

      const result = validator.validateStrategy(invalidStrategy);
      expect(result).toBe(false);
    });
  });

  describe('validateWorkoutRequest', () => {
    it('should validate complete workout request', () => {
      const result = validator.validateWorkoutRequest(mockWorkoutRequest);
      expect(result).toBe(true);
    });

    it('should reject null request', () => {
      const result = validator.validateWorkoutRequest(null);
      expect(result).toBe(false);
    });

    it('should reject undefined request', () => {
      const result = validator.validateWorkoutRequest(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object request', () => {
      const result = validator.validateWorkoutRequest('not an object');
      expect(result).toBe(false);
    });

    it('should reject request with invalid user profile', () => {
      const invalidRequest = {
        ...mockWorkoutRequest,
        userProfile: null
      };

      const result = validator.validateWorkoutRequest(invalidRequest);
      expect(result).toBe(false);
    });

    it('should reject request with invalid workout options', () => {
      const invalidRequest = {
        ...mockWorkoutRequest,
        workoutOptions: null
      };

      const result = validator.validateWorkoutRequest(invalidRequest);
      expect(result).toBe(false);
    });

    it('should reject request with invalid preferences', () => {
      const invalidRequest = {
        ...mockWorkoutRequest,
        preferences: null
      };

      const result = validator.validateWorkoutRequest(invalidRequest);
      expect(result).toBe(false);
    });

    it('should reject request with invalid constraints', () => {
      const invalidRequest = {
        ...mockWorkoutRequest,
        constraints: null
      };

      const result = validator.validateWorkoutRequest(invalidRequest);
      expect(result).toBe(false);
    });
  });

  describe('validateContext', () => {
    it('should validate complete context', () => {
      const result = validator.validateContext(mockContext);
      expect(result).toBe(true);
    });

    it('should reject null context', () => {
      const result = validator.validateContext(null);
      expect(result).toBe(false);
    });

    it('should reject undefined context', () => {
      const result = validator.validateContext(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object context', () => {
      const result = validator.validateContext('not an object');
      expect(result).toBe(false);
    });

    it('should reject context with invalid user profile', () => {
      const invalidContext = {
        ...mockContext,
        userProfile: null
      };

      const result = validator.validateContext(invalidContext);
      expect(result).toBe(false);
    });

    it('should reject context with invalid current selections', () => {
      const invalidContext = {
        ...mockContext,
        currentSelections: null
      };

      const result = validator.validateContext(invalidContext);
      expect(result).toBe(false);
    });

    it('should reject context with invalid session history', () => {
      const invalidContext = {
        ...mockContext,
        sessionHistory: null
      };

      const result = validator.validateContext(invalidContext);
      expect(result).toBe(false);
    });

    it('should reject context with invalid preferences', () => {
      const invalidContext = {
        ...mockContext,
        preferences: null
      };

      const result = validator.validateContext(invalidContext);
      expect(result).toBe(false);
    });

    it('should reject context with missing preference fields', () => {
      const invalidContext = {
        ...mockContext,
        preferences: {
          aiAssistanceLevel: 'moderate' as AIAssistanceLevel,
          // Missing other required fields
        }
      };

      const result = validator.validateContext(invalidContext);
      expect(result).toBe(false);
    });
  });

  describe('User Profile Validation', () => {
    it('should validate complete user profile', () => {
      const result = (validator as any).validateUserProfile(mockUserProfile);
      expect(result).toBe(true);
    });

    it('should reject null user profile', () => {
      const result = (validator as any).validateUserProfile(null);
      expect(result).toBe(false);
    });

    it('should reject undefined user profile', () => {
      const result = (validator as any).validateUserProfile(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object user profile', () => {
      const result = (validator as any).validateUserProfile('not an object');
      expect(result).toBe(false);
    });

    it('should reject user profile missing required fields', () => {
      const invalidProfile = {
        fitnessLevel: 'intermediate',
        age: 30
        // Missing weight and height
      };

      const result = (validator as any).validateUserProfile(invalidProfile);
      expect(result).toBe(false);
    });

    it('should reject user profile with invalid fitness level', () => {
      const invalidProfile = {
        ...mockUserProfile,
        fitnessLevel: 'invalid_level'
      };

      const result = (validator as any).validateUserProfile(invalidProfile);
      expect(result).toBe(false);
    });

    it('should reject user profile with invalid numeric fields', () => {
      const invalidProfile = {
        ...mockUserProfile,
        age: -5 // Invalid age
      };

      const result = (validator as any).validateUserProfile(invalidProfile);
      expect(result).toBe(false);
    });

    it('should reject user profile with zero numeric fields', () => {
      const invalidProfile = {
        ...mockUserProfile,
        weight: 0 // Invalid weight
      };

      const result = (validator as any).validateUserProfile(invalidProfile);
      expect(result).toBe(false);
    });
  });

  describe('Workout Options Validation', () => {
    it('should validate complete workout options', () => {
      const result = (validator as any).validateWorkoutOptions(mockWorkoutOptions);
      expect(result).toBe(true);
    });

    it('should reject null workout options', () => {
      const result = (validator as any).validateWorkoutOptions(null);
      expect(result).toBe(false);
    });

    it('should reject undefined workout options', () => {
      const result = (validator as any).validateWorkoutOptions(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object workout options', () => {
      const result = (validator as any).validateWorkoutOptions('not an object');
      expect(result).toBe(false);
    });

    it('should reject workout options missing required fields', () => {
      const invalidOptions = {
        customization_energy: 7,
        customization_soreness: ['legs']
        // Missing other required fields
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should reject workout options with invalid energy level', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_energy: 15 // Invalid energy level
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should reject workout options with invalid soreness array', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_soreness: 'not an array'
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should reject workout options with invalid focus', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_focus: '' // Empty focus
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should reject workout options with invalid duration', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_duration: -10 // Invalid duration
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should reject workout options with invalid equipment array', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_equipment: 'not an array'
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });
  });

  describe('Preferences Validation', () => {
    it('should validate complete preferences', () => {
      const result = (validator as any).validatePreferences(mockWorkoutRequest.preferences);
      expect(result).toBe(true);
    });

    it('should reject null preferences', () => {
      const result = (validator as any).validatePreferences(null);
      expect(result).toBe(false);
    });

    it('should reject undefined preferences', () => {
      const result = (validator as any).validatePreferences(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object preferences', () => {
      const result = (validator as any).validatePreferences('not an object');
      expect(result).toBe(false);
    });

    it('should reject preferences missing required fields', () => {
      const invalidPreferences = {
        duration: 45,
        focus: 'strength'
        // Missing other required fields
      };

      const result = (validator as any).validatePreferences(invalidPreferences);
      expect(result).toBe(false);
    });

    it('should reject preferences with invalid intensity', () => {
      const invalidPreferences = {
        ...mockWorkoutRequest.preferences,
        intensity: 'invalid_intensity'
      };

      const result = (validator as any).validatePreferences(invalidPreferences);
      expect(result).toBe(false);
    });

    it('should reject preferences with invalid duration', () => {
      const invalidPreferences = {
        ...mockWorkoutRequest.preferences,
        duration: -5 // Invalid duration
      };

      const result = (validator as any).validatePreferences(invalidPreferences);
      expect(result).toBe(false);
    });

    it('should reject preferences with invalid equipment array', () => {
      const invalidPreferences = {
        ...mockWorkoutRequest.preferences,
        equipment: 'not an array'
      };

      const result = (validator as any).validatePreferences(invalidPreferences);
      expect(result).toBe(false);
    });
  });

  describe('Constraints Validation', () => {
    it('should validate complete constraints', () => {
      const result = (validator as any).validateConstraints(mockWorkoutRequest.constraints);
      expect(result).toBe(true);
    });

    it('should reject null constraints', () => {
      const result = (validator as any).validateConstraints(null);
      expect(result).toBe(false);
    });

    it('should reject undefined constraints', () => {
      const result = (validator as any).validateConstraints(undefined);
      expect(result).toBe(false);
    });

    it('should reject non-object constraints', () => {
      const result = (validator as any).validateConstraints('not an object');
      expect(result).toBe(false);
    });

    it('should reject constraints missing required fields', () => {
      const invalidConstraints = {
        timeOfDay: 'morning',
        energyLevel: 7
        // Missing sorenessAreas
      };

      const result = (validator as any).validateConstraints(invalidConstraints);
      expect(result).toBe(false);
    });

    it('should reject constraints with invalid energy level', () => {
      const invalidConstraints = {
        ...mockWorkoutRequest.constraints,
        energyLevel: 15 // Invalid energy level
      };

      const result = (validator as any).validateConstraints(invalidConstraints);
      expect(result).toBe(false);
    });

    it('should reject constraints with invalid soreness areas array', () => {
      const invalidConstraints = {
        ...mockWorkoutRequest.constraints,
        sorenessAreas: 'not an array'
      };

      const result = (validator as any).validateConstraints(invalidConstraints);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values in nested objects', () => {
      const invalidProfile = {
        ...mockUserProfile,
        age: undefined
      };

      const result = (validator as any).validateUserProfile(invalidProfile);
      expect(result).toBe(false);
    });

    it('should handle empty strings in required string fields', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_focus: '   ' // Whitespace only
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should handle zero values in numeric fields', () => {
      const invalidOptions = {
        ...mockWorkoutOptions,
        customization_duration: 0
      };

      const result = (validator as any).validateWorkoutOptions(invalidOptions);
      expect(result).toBe(false);
    });

    it('should handle empty arrays', () => {
      const validOptions = {
        ...mockWorkoutOptions,
        customization_soreness: [], // Empty array should be valid
        customization_equipment: []
      };

      const result = (validator as any).validateWorkoutOptions(validOptions);
      expect(result).toBe(true);
    });
  });
}); 

import { AIServiceExternalStrategyValidator } from '../AIServiceExternalStrategyValidator';
import { UserProfile } from '../../../../../types/user';

describe('AIServiceExternalStrategyValidator', () => {
  let validator: AIServiceExternalStrategyValidator;

  beforeEach(() => {
    validator = new AIServiceExternalStrategyValidator();
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

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(true);
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

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(true);
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

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(true);
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
        age: -5 // Invalid age (negative)
      };

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(false);
    });

    it('should reject invalid height values', () => {
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
        height: 50 // Invalid height (too short)
      };

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(false);
    });

    it('should reject invalid weight values', () => {
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
        weight: 500 // Invalid weight (too heavy)
      };

      const result = (validator as any).validateUserProfile(userProfile);
      expect(result).toBe(false);
    });
  });
}); 