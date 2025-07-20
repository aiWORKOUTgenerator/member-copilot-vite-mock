// Workout Generator Constants
export const WORKOUT_GENERATOR_CONSTANTS = {
  // Confidence levels
  DEFAULT_CONFIDENCE_MIN: 0.7,
  DEFAULT_CONFIDENCE_FALLBACK: 0.8,
  
  // Progression multipliers for week-based workouts
  PROGRESSION_MULTIPLIERS: [0.9, 1.0, 1.1, 1.2],
  
  // Cache settings
  CACHE_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  
  // Default values
  DEFAULT_WORKOUT_DURATION: 30,
  DEFAULT_ENERGY_LEVEL: 5,
  DEFAULT_LOCATION: 'home',
  DEFAULT_FOCUS: 'General Fitness',
  DEFAULT_TIME_OF_DAY: 'morning',
  DEFAULT_NOISE_LEVEL: 'moderate',
  DEFAULT_WEATHER: 'indoor',
  DEFAULT_TEMPERATURE: 20,
  DEFAULT_AIR_QUALITY: 'good',
  
  // Duration tolerance
  DURATION_TOLERANCE: 5,
  
  // Energy thresholds
  LOW_ENERGY_THRESHOLD: 3,
  MODERATE_ENERGY_THRESHOLD: 7,
  
  // Variation types
  VARIATION_TYPES: ['circuit', 'intervals', 'strength_focus', 'cardio_focus'],
  
  // Intensity progression
  INTENSITY_PROGRESSION: ['low', 'moderate', 'moderate', 'high'],
  
  // Default space limitations for Quick Workout
  DEFAULT_SPACE_LIMITATIONS: ['small_space'],
  
  // Safety reminders
  DEFAULT_SAFETY_REMINDERS: [
    'Stop immediately if you feel pain',
    'Maintain proper form throughout',
    'Stay hydrated during your workout',
    'Listen to your body and rest when needed'
  ],
  
  // Progression tips
  DEFAULT_PROGRESSION_TIPS: [
    'Gradually increase workout frequency',
    'Add 5-10% intensity each week',
    'Track your improvements over time',
    'Challenge yourself with new exercises'
  ]
} as const; 