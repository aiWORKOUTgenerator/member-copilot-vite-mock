import type {
  ExperienceLevel,
  PhysicalActivity,
  PreferredDuration,
  TimeCommitment,
  IntensityLevel,
  PreferredActivity,
  AvailableLocation,
  PrimaryGoal,
  GoalTimeline,
  AgeRange,
  Gender,
  CardiovascularCondition,
  Injury
} from '../types/profile.types';

export const VALIDATION_RULES = {
  // Experience & Activity
  experienceLevel: {
    required: true,
    validValues: ['New to Exercise', 'Some Experience', 'Advanced Athlete'] as ExperienceLevel[]
  },
  physicalActivity: {
    required: true,
    validValues: ['sedentary', 'light', 'moderate', 'very', 'extremely', 'varies'] as PhysicalActivity[]
  },

  // Time & Commitment
  preferredDuration: {
    required: true,
    validValues: ['15-30 min', '30-45 min', '45-60 min', '60+ min'] as PreferredDuration[]
  },
  timeCommitment: {
    required: true,
    validValues: ['2-3', '3-4', '4-5', '6-7'] as TimeCommitment[]
  },
  intensityLevel: {
    required: true,
    validValues: ['lightly', 'light-moderate', 'moderately', 'active', 'very', 'extremely'] as IntensityLevel[]
  },

  // Preferences
  preferredActivities: {
    required: true,
    validValues: [
      'Walking/Power Walking',
      'Running/Jogging',
      'Swimming',
      'Cycling/Mountain Biking',
      'Rock Climbing/Bouldering',
      'Yoga',
      'Pilates',
      'Hiking',
      'Dancing',
      'Team Sports',
      'Golf',
      'Martial Arts'
    ] as PreferredActivity[]
  },
  availableLocations: {
    required: true,
    validValues: [
      'Gym',
      'Home Gym',
      'Home',
      'Parks/Outdoor Spaces',
      'Swimming Pool',
      'Running Track'
    ] as AvailableLocation[]
  },
  availableEquipment: {
    required: true,
    dependsOn: 'availableLocations'
  },

  // Goals
  primaryGoal: {
    required: true,
    validValues: [
      'Weight Loss',
      'Strength',
      'Cardio Health',
      'Flexibility & Mobility',
      'General Health',
      'Muscle Gain',
      'Athletic Performance',
      'Energy Levels',
      'Body Toning',
      'Sleep Quality',
      'Stress Reduction',
      'Functional Fitness'
    ] as PrimaryGoal[]
  },
  goalTimeline: {
    required: true,
    validValues: ['1 month', '3 months', '6 months', '1 year+'] as GoalTimeline[]
  },

  // Personal Info
  age: {
    required: true,
    validValues: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] as AgeRange[]
  },
  gender: {
    required: true,
    validValues: ['male', 'female', 'other', 'prefer-not-to-say'] as Gender[]
  },
  height: {
    required: true,
    format: /^(\d+'?\d*\"|\d+cm)$/
  },
  weight: {
    required: true,
    format: /^(\d+\s*(lbs|kg))$/
  },
  hasCardiovascularConditions: {
    required: true,
    validValues: [
      'No',
      'Yes - but cleared for exercise',
      'Yes - and need medical clearance',
      'Prefer not to answer'
    ] as CardiovascularCondition[]
  },
  injuries: {
    required: true,
    validValues: [
      'No Injuries',
      'Lower Back',
      'Knee',
      'Shoulder',
      'Neck',
      'Ankle',
      'Wrist or Elbow',
      'Hip',
      'Foot or Arch'
    ] as Injury[]
  }
} as const;

// Core required fields for basic functionality
export const CORE_REQUIRED_FIELDS = ['experienceLevel', 'primaryGoal'] as const;

// All Required Fields for Complete Functionality
export const ALL_REQUIRED_FIELDS = [
  'experienceLevel',
  'physicalActivity',
  'preferredDuration',
  'timeCommitment',
  'intensityLevel',
  'preferredActivities',
  'availableLocations',
  'availableEquipment',
  'primaryGoal',
  'goalTimeline',
  'age',
  'gender',
  'height',
  'weight',
  'hasCardiovascularConditions',
  'injuries'
] as const;

// UserProfile validation rules
export const USER_PROFILE_VALIDATION = {
  fitnessLevel: { 
    required: true,
    validValues: ['beginner', 'novice', 'intermediate', 'advanced', 'adaptive'] as const
  },
  goals: { 
    required: true, 
    minLength: 1,
    maxLength: 10
  },
  preferences: { 
    required: true,
    nestedValidation: {
      workoutStyle: { required: true, minLength: 1 },
      timePreference: { 
        required: true,
        validValues: ['morning', 'afternoon', 'evening', 'night'] as const
      },
      intensityPreference: { 
        required: true,
        validValues: ['low', 'moderate', 'high'] as const
      },
      advancedFeatures: { required: true, type: 'boolean' },
      aiAssistanceLevel: { 
        required: true,
        validValues: ['minimal', 'moderate', 'high'] as const
      }
    }
  },
  basicLimitations: { 
    required: true,
    nestedValidation: {
      injuries: { required: true, type: 'array' },
      availableEquipment: { required: true, minLength: 1 },
      availableLocations: { required: true, minLength: 1 }
    }
  },
  enhancedLimitations: { 
    required: true,
    nestedValidation: {
      timeConstraints: { required: true, type: 'number', min: 0 },
      equipmentConstraints: { required: true, type: 'array' },
      locationConstraints: { required: true, type: 'array' },
      recoveryNeeds: { 
        required: true,
        nestedValidation: {
          restDays: { required: true, type: 'number', min: 0, max: 7 },
          sleepHours: { required: true, type: 'number', min: 4, max: 12 },
          hydrationLevel: { 
            required: true,
            validValues: ['low', 'moderate', 'high'] as const
          }
        }
      },
      mobilityLimitations: { required: true, type: 'array' },
      progressionRate: { 
        required: true,
        validValues: ['conservative', 'moderate', 'aggressive'] as const
      }
    }
  },
  workoutHistory: { 
    required: true,
    nestedValidation: {
      estimatedCompletedWorkouts: { required: true, type: 'number', min: 0 },
      averageDuration: { required: true, type: 'number', min: 0 },
      preferredFocusAreas: { required: true, type: 'array' },
      progressiveEnhancementUsage: { required: true, type: 'object' },
      aiRecommendationAcceptance: { required: true, type: 'number', min: 0, max: 1 },
      consistencyScore: { required: true, type: 'number', min: 0, max: 1 },
      plateauRisk: { 
        required: true,
        validValues: ['low', 'moderate', 'high'] as const
      }
    }
  },
  learningProfile: { 
    required: true,
    nestedValidation: {
      prefersSimplicity: { required: true, type: 'boolean' },
      explorationTendency: { 
        required: true,
        validValues: ['low', 'moderate', 'high'] as const
      },
      feedbackPreference: { 
        required: true,
        validValues: ['simple', 'detailed'] as const
      },
      learningStyle: { 
        required: true,
        validValues: ['visual', 'auditory', 'kinesthetic', 'mixed'] as const
      },
      motivationType: { 
        required: true,
        validValues: ['intrinsic', 'extrinsic', 'social'] as const
      },
      adaptationSpeed: { 
        required: true,
        validValues: ['slow', 'moderate', 'fast'] as const
      }
    }
  }
} as const; 