// OpenAI Strategy Constants
export const OPENAI_STRATEGY_CONSTANTS = {
  // Energy thresholds
  ENERGY_THRESHOLD_FOR_WEIGHT_LOSS: 6,
  ENERGY_THRESHOLD_FOR_COMPLEX_CIRCUITS: 7,
  ENERGY_THRESHOLD_FOR_SKILL_BUILDING: 5,
  ENERGY_THRESHOLD_LOW: 3,
  
  // Duration defaults
  DEFAULT_WORKOUT_DURATION: 30,
  DEFAULT_AVAILABLE_TIME: 30,
  DURATION_TOLERANCE: 5,
  
  // Confidence levels
  DEFAULT_CONFIDENCE_MIN: 0.7,
  DEFAULT_CONFIDENCE_FALLBACK: 0.8,
  EMERGENCY_CONFIDENCE: 0.8,
  
  // Default values
  DEFAULT_ENERGY_LEVEL: 5,
  DEFAULT_LOCATION: 'home',
  DEFAULT_WORKOUT_FOCUS: 'general',
  DEFAULT_TIME_OF_DAY: 'morning',
  DEFAULT_NOISE_LEVEL: 'moderate',
  DEFAULT_WEATHER: 'indoor',
  DEFAULT_TEMPERATURE: 'comfortable',
  
  // Equipment thresholds
  EQUIPMENT_THRESHOLD_FOR_COMPLEX_CIRCUITS: 2,
  
  // Timeouts and limits
  RECOMMENDATION_TIMEOUT: 15000,
  WORKOUT_GENERATION_TIMEOUT: 90000,
  INSIGHT_ENHANCEMENT_MAX_TOKENS: 1000,
  USER_ANALYSIS_MAX_TOKENS: 1500,
  
  // Temperature settings
  RECOMMENDATION_TEMPERATURE: 0.7,
  USER_ANALYSIS_TEMPERATURE: 0.8,
  
  // Safety reminders
  DEFAULT_SAFETY_REMINDERS: [
    'Stop immediately if you feel pain',
    'Maintain proper form throughout',
    'Stay hydrated during your workout',
    'Listen to your body and rest when needed'
  ],
  
  // Error messages
  ERROR_MESSAGES: {
    WORKOUT_GENERATION_DISABLED: 'OpenAI workout generation is disabled',
    INVALID_WORKOUT_STRUCTURE: 'Invalid workout structure from AI',
    MISSING_USER_PROFILE: 'User profile is required for workout generation',
    MISSING_PREFERENCES: 'Workout preferences are required',
    INVALID_DURATION: 'Valid workout duration is required',
    MISSING_FOCUS: 'Workout focus is required',
    MISSING_TITLE_DESCRIPTION: 'Workout must have title and description',
    INVALID_DURATION_VALUE: 'Workout must have valid duration',
    MISSING_API_KEY: 'OpenAI API key is required',
    MISSING_MODEL: 'OpenAI model is required'
  }
} as const;

// Export individual constants for easier access
export const {
  ENERGY_THRESHOLD_FOR_WEIGHT_LOSS,
  DEFAULT_CONFIDENCE_MIN,
  DEFAULT_CONFIDENCE_FALLBACK,
  DEFAULT_ENERGY_LEVEL,
  DEFAULT_WORKOUT_DURATION,
  DEFAULT_SAFETY_REMINDERS
} = OPENAI_STRATEGY_CONSTANTS; 