// Detailed Workout Setup Constants
export const DETAILED_WORKOUT_CONSTANTS = {
  // Supported Durations
  SUPPORTED_DURATIONS: [15, 30, 45, 60, 90, 120] as const,

  // Step Configuration
  STEPS: {
    TRAINING_STRUCTURE: 'training_structure',
    TRAINING_DETAILS: 'training_details',
    PHYSICAL_STATE: 'physical_state',
    EXERCISE_SELECTION: 'exercise_selection',
    REVIEW: 'review'
  },

  // Validation Rules
  VALIDATION: {
    MIN_DURATION: 10, // minutes
    MAX_DURATION: 180, // minutes
    MIN_ENERGY_LEVEL: 1,
    MAX_ENERGY_LEVEL: 10,
    MIN_EXERCISES: 3,
    MAX_EXERCISES: 20
  },

  // Default Values
  DEFAULTS: {
    DURATION: 30,
    ENERGY_LEVEL: 5,
    INTENSITY_PREFERENCE: 'moderate' as const,
    WORKOUT_STRUCTURE: 'traditional' as const,
    EXPERIENCE_LEVEL: 'intermediate'
  },

  // Exercise Categories
  EXERCISE_CATEGORIES: {
    STRENGTH_TRAINING: 'Strength Training',
    CARDIO: 'Cardio',
    CORE_ABS: 'Core & Abs',
    FLEXIBILITY_MOBILITY: 'Flexibility & Mobility',
    RECOVERY: 'Recovery'
  },

  // Focus Areas
  FOCUS_AREAS: {
    UPPER_BODY: 'Upper Body',
    LOWER_BODY: 'Lower Body',
    CORE: 'Core',
    FULL_BODY: 'Full Body',
    CARDIO: 'Cardio',
    STRENGTH: 'Strength',
    FLEXIBILITY: 'Flexibility',
    RECOVERY: 'Recovery'
  },

  // Equipment Options
  EQUIPMENT_OPTIONS: {
    NO_EQUIPMENT: 'No Equipment',
    DUMBBELLS: 'Dumbbells',
    RESISTANCE_BANDS: 'Resistance Bands',
    YOGA_MAT: 'Yoga Mat',
    PULL_UP_BAR: 'Pull-up Bar',
    KETTLEBELLS: 'Kettlebells',
    BARBELL: 'Barbell',
    CARDIO_MACHINES: 'Cardio Machines'
  },

  // Training Goals
  TRAINING_GOALS: {
    BUILD_STRENGTH: 'Build Strength',
    LOSE_WEIGHT: 'Lose Weight',
    BUILD_MUSCLE: 'Build Muscle',
    IMPROVE_CARDIO: 'Improve Cardio',
    INCREASE_FLEXIBILITY: 'Increase Flexibility',
    MAINTAIN_FITNESS: 'Maintain Fitness',
    RECOVER_INJURY: 'Recover from Injury',
    SPORT_SPECIFIC: 'Sport-Specific Training'
  },

  // Workout Structures
  WORKOUT_STRUCTURES: {
    TRADITIONAL: 'traditional',
    CIRCUIT: 'circuit',
    INTERVAL: 'interval',
    TABATA: 'tabata',
    EMOM: 'emom' // Every Minute On the Minute
  },

  // Intensity Levels
  INTENSITY_LEVELS: {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high'
  } as const,

  // Experience Levels
  EXPERIENCE_LEVELS: {
    NEW_TO_EXERCISE: 'new to exercise',
    SOME_EXPERIENCE: 'some experience',
    ADVANCED_ATHLETE: 'advanced athlete'
  } as const,

  // AI Recommendation Types
  RECOMMENDATION_TYPES: {
    FORM: 'form',
    PROGRESSION: 'progression',
    MODIFICATION: 'modification',
    ALTERNATIVE: 'alternative'
  } as const,

  // Conflict Severity Levels
  CONFLICT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  } as const,

  // UI Configuration
  UI: {
    MAX_VISIBLE_EXERCISES: 12,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOOLTIP_DELAY: 1000
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_DURATION: 'Duration must be between 10 and 180 minutes',
    INVALID_ENERGY_LEVEL: 'Energy level must be between 1 and 10',
    INVALID_EXERCISE_SELECTION: 'Please select at least 3 exercises',
    CONFLICTING_SELECTIONS: 'Cannot include and exclude the same exercise',
    MISSING_FOCUS: 'Please select a workout focus',
    MISSING_EQUIPMENT: 'Please select at least one equipment option'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    WORKOUT_GENERATED: 'Workout generated successfully!',
    VALIDATION_PASSED: 'All selections are valid',
    RECOMMENDATIONS_APPLIED: 'AI recommendations applied'
  },

  // Workout Types
  WORKOUT_TYPES: [
    'strength-training',
    'cardio',
    'flexibility',
    'recovery',
    'sport-specific'
  ] as const,

  // Detailed Workout Configurations
  DETAILED_CONFIGS: {
    'strength-training': {
      exerciseTypes: ['Compound Lifts', 'Isolation Exercises', 'Progressive Overload'],
      recommendedFrequency: '3-4 times/week',
      intensity: 'moderate' as const,
      equipment: 'moderate' as const,
      experience: 'some experience' as const
    },
    'cardio': {
      exerciseTypes: ['HIIT', 'Steady State', 'Interval Training'],
      recommendedFrequency: '3-5 times/week',
      intensity: 'high' as const,
      equipment: 'minimal' as const,
      experience: 'some experience' as const
    },
    'flexibility': {
      exerciseTypes: ['Static Stretching', 'Dynamic Stretching', 'Mobility Work'],
      recommendedFrequency: '2-3 times/week',
      intensity: 'low' as const,
      equipment: 'minimal' as const,
      experience: 'new to exercise' as const
    },
    'recovery': {
      exerciseTypes: ['Foam Rolling', 'Light Stretching', 'Active Recovery'],
      recommendedFrequency: '1-2 times/week',
      intensity: 'low' as const,
      equipment: 'minimal' as const,
      experience: 'new to exercise' as const
    },
    'sport-specific': {
      exerciseTypes: ['Sport Drills', 'Conditioning', 'Skill Work'],
      recommendedFrequency: '2-4 times/week',
      intensity: 'high' as const,
      equipment: 'full-gym' as const,
      experience: 'advanced athlete' as const
    }
  } as const
} as const;

// Type exports for use in components
export type IntensityLevel = typeof DETAILED_WORKOUT_CONSTANTS.INTENSITY_LEVELS[keyof typeof DETAILED_WORKOUT_CONSTANTS.INTENSITY_LEVELS];
export type ExperienceLevel = typeof DETAILED_WORKOUT_CONSTANTS.EXPERIENCE_LEVELS[keyof typeof DETAILED_WORKOUT_CONSTANTS.EXPERIENCE_LEVELS];
export type WorkoutStructure = typeof DETAILED_WORKOUT_CONSTANTS.WORKOUT_STRUCTURES[keyof typeof DETAILED_WORKOUT_CONSTANTS.WORKOUT_STRUCTURES];
export type RecommendationType = typeof DETAILED_WORKOUT_CONSTANTS.RECOMMENDATION_TYPES[keyof typeof DETAILED_WORKOUT_CONSTANTS.RECOMMENDATION_TYPES];
export type ConflictSeverity = typeof DETAILED_WORKOUT_CONSTANTS.CONFLICT_SEVERITY[keyof typeof DETAILED_WORKOUT_CONSTANTS.CONFLICT_SEVERITY];
export type DetailedWorkoutType = typeof DETAILED_WORKOUT_CONSTANTS.WORKOUT_TYPES[number];
export type ComplexityLevel = 'minimal' | 'simple' | 'standard' | 'comprehensive' | 'advanced'; 