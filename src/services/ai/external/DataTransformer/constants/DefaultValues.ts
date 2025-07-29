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
  Injury,
  FitnessLevel,
  WorkoutIntensity
} from '../types/profile.types';

import type {
  UserProfile,
  UserPreferences,
  UserBasicLimitations,
  AIEnhancedLimitations,
  AIWorkoutHistory,
  AILearningProfile,
  RecoveryNeeds
} from '../types/user.types';

export const DEFAULT_VALUES = {
  profile: {
    // Experience & Activity
    experienceLevel: 'Some Experience' as ExperienceLevel,
    physicalActivity: 'moderate' as PhysicalActivity,
    calculatedFitnessLevel: 'intermediate' as FitnessLevel,

    // Time & Commitment
    preferredDuration: '30-45 min' as PreferredDuration,
    timeCommitment: '3-4' as TimeCommitment,
    intensityLevel: 'moderately' as IntensityLevel,
    calculatedWorkoutIntensity: 'moderate' as WorkoutIntensity,

    // Preferences
    preferredActivities: ['Walking/Power Walking'] as PreferredActivity[],
    availableLocations: ['Home'] as AvailableLocation[],
    availableEquipment: ['Body Weight'],

    // Goals
    primaryGoal: 'General Health' as PrimaryGoal,
    goalTimeline: '3 months' as GoalTimeline,

    // Personal Info
    age: '26-35' as AgeRange,
    gender: 'prefer-not-to-say' as Gender,
    height: '170cm',
    weight: '70 kg',
    hasCardiovascularConditions: 'No' as CardiovascularCondition,
    injuries: ['No Injuries'] as Injury[]
  },

  workout: {
    customization_focus: 'general',
    customization_duration: 30,
    customization_energy: 7,
    customization_equipment: ['Body Weight']
  },

  userProfile: {
    preferences: {
      workoutStyle: ['strength_training'],
      timePreference: 'morning' as const,
      intensityPreference: 'moderate' as const,
      advancedFeatures: false,
      aiAssistanceLevel: 'moderate' as const
    },
    basicLimitations: {
      injuries: [],
      availableEquipment: ['body_weight'],
      availableLocations: ['home']
    },
    enhancedLimitations: {
      timeConstraints: 30,
      equipmentConstraints: ['body_weight'],
      locationConstraints: ['home'],
      recoveryNeeds: {
        restDays: 2,
        sleepHours: 7,
        hydrationLevel: 'moderate' as const
      },
      mobilityLimitations: [],
      progressionRate: 'moderate' as const
    },
    workoutHistory: {
      estimatedCompletedWorkouts: 0,
      averageDuration: 30,
      preferredFocusAreas: ['general fitness'],
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.7,
      consistencyScore: 0.5,
      plateauRisk: 'moderate' as const
    },
    learningProfile: {
      prefersSimplicity: true,
      explorationTendency: 'moderate' as const,
      feedbackPreference: 'simple' as const,
      learningStyle: 'mixed' as const,
      motivationType: 'intrinsic' as const,
      adaptationSpeed: 'moderate' as const
    }
  }
} as const;

// Mapping functions for derived values
export const DERIVED_VALUE_MAPS = {
  // Map experience level and physical activity to fitness level
  calculateFitnessLevel: (experienceLevel: ExperienceLevel, physicalActivity: PhysicalActivity): FitnessLevel => {
    // Special case: Adaptive level for users with varying activity
    if (physicalActivity === 'varies') {
      return 'adaptive';
    }

    // Level 1: Beginner
    if (experienceLevel === 'New to Exercise' && 
        (physicalActivity === 'sedentary' || physicalActivity === 'light')) {
      return 'beginner';
    }

    // Level 2: Novice
    if ((experienceLevel === 'New to Exercise' && physicalActivity === 'moderate') ||
        (experienceLevel === 'Some Experience' && 
         (physicalActivity === 'sedentary' || physicalActivity === 'light'))) {
      return 'novice';
    }

    // Level 3: Intermediate
    if (experienceLevel === 'Some Experience' && 
        (physicalActivity === 'moderate' || physicalActivity === 'very')) {
      return 'intermediate';
    }

    // Level 4: Advanced
    if ((experienceLevel === 'Advanced Athlete') ||
        (experienceLevel === 'Some Experience' && physicalActivity === 'extremely')) {
      return 'advanced';
    }

    // Default fallback for edge cases
    return 'intermediate';
  },

  // Map intensity level and time commitment to workout intensity
  calculateWorkoutIntensity: (intensityLevel: IntensityLevel, timeCommitment: TimeCommitment): WorkoutIntensity => {
    // High intensity if very active or high time commitment
    if (intensityLevel === 'extremely' || intensityLevel === 'very' || timeCommitment === '6-7') {
      return 'high';
    }

    // Low intensity if light activity or low time commitment
    if (intensityLevel === 'lightly' || intensityLevel === 'light-moderate' || timeCommitment === '2-3') {
      return 'low';
    }

    // Default to moderate
    return 'moderate';
  },

  // Map experience level string to FitnessLevel type
  mapExperienceToFitness: (experienceLevel?: string): FitnessLevel => {
    if (!experienceLevel) return 'intermediate';
    
    const levelMap: Record<string, FitnessLevel> = {
      'new to exercise': 'beginner',
      'some experience': 'intermediate', 
      'advanced athlete': 'advanced'
    };
    
    return levelMap[experienceLevel.toLowerCase()] || 'intermediate';
  },

  // Map intensity level to WorkoutIntensity type
  mapIntensityLevel: (intensityLevel?: string): WorkoutIntensity => {
    if (!intensityLevel) return 'moderate';
    
    const intensityMap: Record<string, WorkoutIntensity> = {
      'low': 'low',
      'moderate': 'moderate',
      'high': 'high'
    };
    
    return intensityMap[intensityLevel.toLowerCase()] || 'moderate';
  },

  // Parse age range string to number (use middle of range)
  parseAgeRange: (ageRange: string): number => {
    const ageMap: Record<string, number> = {
      '18-25': 22,
      '26-35': 31,
      '36-45': 41,
      '46-55': 51,
      '56-65': 61,
      '65+': 70
    };
    
    return ageMap[ageRange] || 30; // Default to 30 if unknown
  },

  // Parse weight string to number (handle various formats)
  parseWeight: (weight: string): number => {
    if (!weight) return 70; // Default weight
    
    const weightStr = weight.toLowerCase().trim();
    
    // Handle "200 lbs" format
    if (weightStr.includes('lbs') || weightStr.includes('lb')) {
      const match = weightStr.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // Handle "70 kg" format
    if (weightStr.includes('kg')) {
      const match = weightStr.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // Handle plain number (assume lbs)
    const plainNumber = parseFloat(weightStr);
    if (!isNaN(plainNumber)) {
      return plainNumber;
    }
    
    return 70; // Default weight
  },

  // Parse height string to number (handle various formats)
  parseHeight: (height: string): number => {
    if (!height) return 170; // Default height in cm
    
    const heightStr = height.toLowerCase().trim();
    
    // Handle "5'8\"" format
    if (heightStr.includes("'") && heightStr.includes('"')) {
      const match = heightStr.match(/(\d+)'(\d+)"/);
      if (match) {
        const feet = parseInt(match[1]);
        const inches = parseInt(match[2]);
        return Math.round((feet * 12 + inches) * 2.54); // Convert to cm
      }
    }
    
    // Handle "170cm" format
    if (heightStr.includes('cm')) {
      const match = heightStr.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // Handle plain number (assume cm)
    const plainNumber = parseFloat(heightStr);
    if (!isNaN(plainNumber)) {
      return plainNumber;
    }
    
    return 170; // Default height in cm
  },

  // Calculate recovery needs based on fitness level
  calculateRecoveryNeeds: (fitnessLevel: FitnessLevel): RecoveryNeeds => {
    const recoveryMap = {
      'beginner': { restDays: 3, sleepHours: 8, hydrationLevel: 'moderate' as const },
      'novice': { restDays: 2, sleepHours: 8, hydrationLevel: 'moderate' as const },
      'intermediate': { restDays: 2, sleepHours: 7, hydrationLevel: 'high' as const },
      'advanced': { restDays: 1, sleepHours: 7, hydrationLevel: 'high' as const },
      'adaptive': { restDays: 1, sleepHours: 7, hydrationLevel: 'high' as const }
    };
    
    return recoveryMap[fitnessLevel] || recoveryMap.intermediate;
  },

  // Determine progression rate based on fitness level
  determineProgressionRate: (fitnessLevel: FitnessLevel): 'conservative' | 'moderate' | 'aggressive' => {
    const progressionMap = {
      'beginner': 'conservative' as const,
      'novice': 'conservative' as const,
      'intermediate': 'moderate' as const,
      'advanced': 'aggressive' as const,
      'adaptive': 'moderate' as const
    };
    
    return progressionMap[fitnessLevel] || 'moderate';
  },

  // Estimate completed workouts based on fitness level
  estimateCompletedWorkouts: (fitnessLevel: FitnessLevel): number => {
    const workoutMap = {
      'beginner': 0,
      'novice': 5,
      'intermediate': 20,
      'advanced': 100,
      'adaptive': 50
    };
    
    return workoutMap[fitnessLevel] || 0;
  },

  // Calculate consistency score based on fitness level
  calculateConsistencyScore: (fitnessLevel: FitnessLevel): number => {
    const consistencyMap = {
      'beginner': 0.3,
      'novice': 0.5,
      'intermediate': 0.7,
      'advanced': 0.9,
      'adaptive': 0.8
    };
    
    return consistencyMap[fitnessLevel] || 0.5;
  },

  // Assess plateau risk based on fitness level
  assessPlateauRisk: (fitnessLevel: FitnessLevel): 'low' | 'moderate' | 'high' => {
    const riskMap = {
      'beginner': 'low' as const,
      'novice': 'low' as const,
      'intermediate': 'moderate' as const,
      'advanced': 'high' as const,
      'adaptive': 'moderate' as const
    };
    
    return riskMap[fitnessLevel] || 'moderate';
  },

  // Determine exploration tendency based on fitness level
  determineExplorationTendency: (fitnessLevel: FitnessLevel): 'low' | 'moderate' | 'high' => {
    const tendencyMap = {
      'beginner': 'low' as const,
      'novice': 'low' as const,
      'intermediate': 'moderate' as const,
      'advanced': 'high' as const,
      'adaptive': 'moderate' as const
    };
    
    return tendencyMap[fitnessLevel] || 'moderate';
  },

  // Determine adaptation speed based on fitness level
  determineAdaptationSpeed: (fitnessLevel: FitnessLevel): 'slow' | 'moderate' | 'fast' => {
    const speedMap = {
      'beginner': 'slow' as const,
      'novice': 'slow' as const,
      'intermediate': 'moderate' as const,
      'advanced': 'fast' as const,
      'adaptive': 'moderate' as const
    };
    
    return speedMap[fitnessLevel] || 'moderate';
  }
} as const; 