export const DETAILED_WORKOUT_CONSTANTS = {
  SUPPORTED_DURATIONS: [15, 20, 30, 45, 60, 75, 90],
  WORKOUT_TYPES: ['strength', 'cardio', 'hybrid', 'recovery', 'sport-specific'],
  COMPLEXITY_LEVELS: ['beginner', 'intermediate', 'advanced', 'expert'] as const,
  
  // Enhanced configurations
  DETAILED_CONFIGS: {
    'strength': { 
      minDuration: 20, 
      exerciseTypes: ['compound', 'isolation'],
      recommendedFrequency: '2-3 times per week',
      progressionMetrics: ['weight', 'reps', 'sets']
    },
    'cardio': { 
      minDuration: 15, 
      exerciseTypes: ['aerobic', 'anaerobic'],
      recommendedFrequency: '3-5 times per week',
      progressionMetrics: ['duration', 'intensity', 'distance']
    },
    'hybrid': { 
      minDuration: 30, 
      exerciseTypes: ['compound', 'cardio', 'functional'],
      recommendedFrequency: '3-4 times per week',
      progressionMetrics: ['weight', 'duration', 'complexity']
    },
    'recovery': {
      minDuration: 15,
      exerciseTypes: ['mobility', 'flexibility', 'corrective'],
      recommendedFrequency: 'as needed',
      progressionMetrics: ['range of motion', 'discomfort reduction']
    },
    'sport-specific': {
      minDuration: 45,
      exerciseTypes: ['sport-specific', 'conditioning', 'skill-work'],
      recommendedFrequency: 'based on sport schedule',
      progressionMetrics: ['performance', 'skill-mastery']
    }
  } as const
} as const;

// Type-safe workout type guard
export type DetailedWorkoutType = keyof typeof DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS;
export type ComplexityLevel = typeof DETAILED_WORKOUT_CONSTANTS.COMPLEXITY_LEVELS[number]; 