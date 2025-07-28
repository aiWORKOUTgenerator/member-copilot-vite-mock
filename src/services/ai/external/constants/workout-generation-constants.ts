// Workout Generation Service Constants
export const WORKOUT_GENERATION_CONSTANTS = {
  // Time constants
  ONE_SECOND_MS: 1000,
  ONE_MINUTE_MS: 60 * 1000,
  CACHE_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT_MS: 120 * 1000, // 120 seconds (increased from 30s)
  RETRY_DELAY_MS: 1000, // 1 second
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  BACKOFF_MULTIPLIER: 2,
  MAX_BACKOFF_DELAY_MS: 10 * 1000, // 10 seconds
  
  // Cache configuration
  MAX_CACHE_SIZE: 100,
  CACHE_CLEANUP_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes
  CACHE_ENTRY_TTL_MS: 5 * 60 * 1000, // 5 minutes
  
  // Validation thresholds
  MIN_WORKOUT_DURATION: 5, // minutes
  MAX_WORKOUT_DURATION: 180, // minutes
  MIN_ENERGY_LEVEL: 1,
  MAX_ENERGY_LEVEL: 10,
  MIN_EXERCISES_PER_WORKOUT: 1,
  MAX_EXERCISES_PER_WORKOUT: 20,
  
  // Performance thresholds
  SLOW_RESPONSE_THRESHOLD_MS: 15 * 1000, // 15 seconds
  ERROR_RATE_WARNING_THRESHOLD: 0.1, // 10%
  CACHE_HIT_RATE_TARGET: 0.3, // 30%
  
  // Default values
  DEFAULT_WORKOUT_DURATION: 30,
  DEFAULT_ENERGY_LEVEL: 5,
  DEFAULT_FOCUS: 'general',
  DEFAULT_EQUIPMENT: ['bodyweight'],
  
  // Error messages
  ERROR_MESSAGES: {
    INVALID_REQUEST: 'Invalid workout generation request',
    MISSING_USER_PROFILE: 'User profile is required',
    MISSING_WORKOUT_DATA: 'Workout focus data is required',
    INVALID_DURATION: 'Invalid workout duration',
    INVALID_ENERGY_LEVEL: 'Invalid energy level',
    INVALID_FOCUS: 'Invalid workout focus',
    TIMEOUT_ERROR: 'Workout generation timed out',
    RETRY_FAILED: 'Workout generation failed after retries',
    CACHE_ERROR: 'Cache operation failed',
    OPENAI_ERROR: 'OpenAI service error'
  },
  
  // Warning messages
  WARNING_MESSAGES: {
    LONG_DURATION: 'Long workout duration may impact recovery',
    HIGH_ENERGY: 'High energy level with long duration',
    LOW_ENERGY: 'Low energy level may limit workout intensity',
    NO_EQUIPMENT: 'No equipment selected may limit exercise variety',
    MANY_FOCUS_AREAS: 'Many focus areas may dilute workout effectiveness'
  }
} as const;

// Export individual constants for easier access
export const {
  ONE_SECOND_MS,
  ONE_MINUTE_MS,
  CACHE_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  RETRY_DELAY_MS,
  MAX_RETRY_ATTEMPTS,
  BACKOFF_MULTIPLIER,
  MAX_BACKOFF_DELAY_MS,
  MAX_CACHE_SIZE,
  CACHE_CLEANUP_INTERVAL_MS,
  CACHE_ENTRY_TTL_MS,
  MIN_WORKOUT_DURATION,
  MAX_WORKOUT_DURATION,
  MIN_ENERGY_LEVEL,
  MAX_ENERGY_LEVEL,
  MIN_EXERCISES_PER_WORKOUT,
  MAX_EXERCISES_PER_WORKOUT,
  SLOW_RESPONSE_THRESHOLD_MS,
  ERROR_RATE_WARNING_THRESHOLD,
  CACHE_HIT_RATE_TARGET,
  DEFAULT_WORKOUT_DURATION,
  DEFAULT_ENERGY_LEVEL,
  DEFAULT_FOCUS,
  DEFAULT_EQUIPMENT,
  ERROR_MESSAGES,
  WARNING_MESSAGES
} = WORKOUT_GENERATION_CONSTANTS; 