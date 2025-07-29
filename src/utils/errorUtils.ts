import { WorkoutGenerationError } from '../types/workout-generation.types';

/**
 * Get detailed error information for workout generation errors
 * @param code Error code
 * @param originalError Original error object
 */
export const getErrorDetails = (code: WorkoutGenerationError['code'], originalError?: any): WorkoutGenerationError => {
  const errorMap: Record<WorkoutGenerationError['code'], Omit<WorkoutGenerationError, 'code'>> = {
    INVALID_DATA: {
      message: 'The provided workout data is incomplete or invalid. Please check your selections and try again.',
      retryable: false,
      recoverySuggestion: 'Please review your workout preferences and ensure all required fields are filled.',
      fallbackAvailable: false
    },
    API_ERROR: {
      message: 'The AI service encountered an error while generating your workout. This is usually temporary.',
      retryable: true,
      retryAfter: 5,
      recoverySuggestion: 'Please wait a moment and try again. If the problem persists, try refreshing the page.',
      fallbackAvailable: true
    },
    NETWORK_ERROR: {
      message: 'Unable to connect to the workout generation service. Please check your internet connection.',
      retryable: true,
      retryAfter: 10,
      recoverySuggestion: 'Check your internet connection and try again. If using a VPN, try disconnecting it.',
      fallbackAvailable: true
    },
    TIMEOUT_ERROR: {
      message: 'The workout generation is taking longer than expected. This might be due to high demand.',
      retryable: true,
      retryAfter: 15,
      recoverySuggestion: 'Please try again in a few moments. If the issue continues, try during off-peak hours.',
      fallbackAvailable: true
    },
    GENERATION_FAILED: {
      message: 'We encountered an unexpected error while creating your workout. Our team has been notified.',
      retryable: true,
      retryAfter: 30,
      recoverySuggestion: 'Please try again. If the problem persists, contact support with the error details.',
      fallbackAvailable: true
    },
    SERVICE_UNAVAILABLE: {
      message: 'The workout generation service is temporarily unavailable. We\'re working to restore it.',
      retryable: true,
      retryAfter: 60,
      recoverySuggestion: 'Please try again in a few minutes. You can also try our basic workout templates.',
      fallbackAvailable: true
    },
    RATE_LIMITED: {
      message: 'You\'ve reached the limit for workout generations. Please wait before trying again.',
      retryable: true,
      retryAfter: 300, // 5 minutes
      recoverySuggestion: 'Please wait 5 minutes before generating another workout. Consider saving your favorites.',
      fallbackAvailable: true
    },
    INSUFFICIENT_DATA: {
      message: 'We need more information about your fitness preferences to generate a personalized workout.',
      retryable: false,
      recoverySuggestion: 'Please complete your fitness profile with more details about your goals and preferences.',
      fallbackAvailable: true
    }
  };

  const baseError = errorMap[code];
  return {
    code,
    ...baseError,
    details: originalError,
    retryAfter: baseError.retryAfter || 0
  };
};