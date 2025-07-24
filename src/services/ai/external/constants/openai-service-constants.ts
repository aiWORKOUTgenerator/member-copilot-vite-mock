// OpenAI Service Constants
export const OPENAI_SERVICE_CONSTANTS = {
  // Timeouts (in milliseconds)
  DEFAULT_TIMEOUT_MS: 90000, // Increased to 90 seconds for complex workout generation
  HEALTH_CHECK_TIMEOUT_MS: 5000,
  RATE_LIMIT_CALCULATION_MS: 60000,
  
  // Response tracking
  MAX_RESPONSE_TIMES_TO_TRACK: 100,
  HEALTH_CHECK_MAX_TOKENS: 10,
  
  // Cache management
  DEFAULT_CACHE_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  
  // Error codes
  ERROR_CODES: {
    TIMEOUT: 'TIMEOUT',
    INVALID_API_KEY: 'INVALID_API_KEY',
    RATE_LIMIT: 'RATE_LIMIT',
    NOT_FOUND: 'NOT_FOUND',
    NETWORK_ERROR: 'NETWORK_ERROR'
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    TOO_MANY_REQUESTS: 429,
    NOT_FOUND: 404
  },
  
  // Stream parsing
  STREAM_DATA_PREFIX: 'data: ',
  STREAM_DONE_MARKER: '[DONE]',
  
  // Template variables
  TEMPLATE_VARIABLE_PATTERN: /\{\{(\w+)\}\}/g,
  
  // Cache key generation
  CACHE_KEY_SEPARATOR: '_',
  DEFAULT_USER_ID: 'current'
} as const;

// Type-safe constant access
export type OpenAIServiceConstants = typeof OPENAI_SERVICE_CONSTANTS; 