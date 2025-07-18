// External AI Service Utilities
import { OpenAIResponse, OpenAIError } from '../types/external-ai.types';

/**
 * Token counting utilities for OpenAI API
 */
export const tokenUtils = {
  /**
   * Estimate token count for a given text (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  },

  /**
   * Check if content fits within token limit
   */
  isWithinTokenLimit(content: string, maxTokens: number): boolean {
    return this.estimateTokens(content) <= maxTokens;
  },

  /**
   * Truncate content to fit within token limit
   */
  truncateToTokenLimit(content: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(content);
    if (estimatedTokens <= maxTokens) {
      return content;
    }
    
    const ratio = maxTokens / estimatedTokens;
    const truncateLength = Math.floor(content.length * ratio * 0.9); // 90% safety margin
    return content.substring(0, truncateLength) + '...';
  }
};

/**
 * Rate limiting utilities
 */
export const rateLimitUtils = {
  /**
   * Calculate delay for exponential backoff
   */
  calculateBackoffDelay(attempt: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  },

  /**
   * Add jitter to prevent thundering herd
   */
  addJitter(delay: number, jitterFactor: number = 0.1): number {
    const jitter = delay * jitterFactor * Math.random();
    return delay + jitter;
  },

  /**
   * Check if error is rate limit related
   */
  isRateLimitError(error: any): boolean {
    return error?.status === 429 || 
           error?.code === 'rate_limit_exceeded' ||
           error?.message?.toLowerCase().includes('rate limit');
  },

  /**
   * Extract retry-after header from rate limit response
   */
  extractRetryAfter(error: any): number | null {
    const retryAfter = error?.headers?.['retry-after'] || 
                      error?.response?.headers?.['retry-after'];
    return retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
  }
};

/**
 * Response parsing utilities
 */
export const responseUtils = {
  /**
   * Parse OpenAI streaming response
   */
  parseStreamingResponse(chunk: string): any[] {
    const lines = chunk.split('\n').filter(line => line.trim());
    const events = [];
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        if (data.trim() === '[DONE]') {
          break;
        }
        try {
          events.push(JSON.parse(data));
        } catch (e) {
          console.warn('Failed to parse streaming response chunk:', data);
        }
      }
    }
    
    return events;
  },

  /**
   * Extract content from OpenAI response
   */
  extractContent(response: OpenAIResponse): string {
    if ('choices' in response && response.choices.length > 0) {
      const choice = response.choices[0];
      return choice.message?.content || choice.text || '';
    }
    return '';
  },

  /**
   * Validate response structure
   */
  validateResponse(response: any): boolean {
    return response && 
           typeof response === 'object' && 
           (response.choices || response.data || response.content);
  },

  /**
   * Parse JSON safely from response content
   */
  parseJsonContent(content: string): any | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to parse as direct JSON
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse JSON from response content:', error);
      return null;
    }
  }
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Convert OpenAI error to standardized format
   */
  standardizeError(error: any): OpenAIError {
    const baseError: OpenAIError = {
      message: error.message || 'Unknown error occurred',
      type: 'api_error',
      code: error.code || 'unknown',
      status: error.status || 500
    };

    // Handle specific OpenAI error types
    if (error.status === 400) {
      baseError.type = 'invalid_request_error';
    } else if (error.status === 401) {
      baseError.type = 'authentication_error';
    } else if (error.status === 403) {
      baseError.type = 'permission_error';
    } else if (error.status === 429) {
      baseError.type = 'rate_limit_error';
    } else if (error.status >= 500) {
      baseError.type = 'api_error';
    }

    return baseError;
  },

  /**
   * Check if error is retryable
   */
  isRetryableError(error: OpenAIError): boolean {
    return error.type === 'rate_limit_error' ||
           error.type === 'api_error' ||
           error.status >= 500;
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: OpenAIError): string {
    switch (error.type) {
      case 'authentication_error':
        return 'AI service authentication failed. Please check your API key.';
      case 'permission_error':
        return 'AI service access denied. Please check your permissions.';
      case 'rate_limit_error':
        return 'AI service is temporarily busy. Please try again in a moment.';
      case 'invalid_request_error':
        return 'Invalid request to AI service. Please try again.';
      default:
        return 'AI service is temporarily unavailable. Please try again later.';
    }
  }
};

/**
 * Caching utilities
 */
export const cacheUtils = {
  /**
   * Generate cache key from request parameters
   */
  generateCacheKey(prefix: string, params: any): string {
    const hash = this.hashObject(params);
    return `${prefix}:${hash}`;
  },

  /**
   * Simple object hash function
   */
  hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },

  /**
   * Check if cached item is still valid
   */
  isCacheValid(cachedItem: any, maxAge: number): boolean {
    if (!cachedItem?.timestamp) {
      return false;
    }
    
    const age = Date.now() - cachedItem.timestamp;
    return age < maxAge;
  },

  /**
   * Create cache item with timestamp
   */
  createCacheItem(data: any): any {
    return {
      data,
      timestamp: Date.now()
    };
  }
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate OpenAI API key format
   */
  isValidApiKey(apiKey: string): boolean {
    return typeof apiKey === 'string' && 
           apiKey.startsWith('sk-') && 
           apiKey.length >= 20;
  },

  /**
   * Validate request parameters
   */
  validateRequestParams(params: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params) {
      errors.push('Request parameters are required');
      return { valid: false, errors };
    }
    
    if (params.max_tokens && (params.max_tokens < 1 || params.max_tokens > 4096)) {
      errors.push('max_tokens must be between 1 and 4096');
    }
    
    if (params.temperature && (params.temperature < 0 || params.temperature > 2)) {
      errors.push('temperature must be between 0 and 2');
    }
    
    if (params.messages && !Array.isArray(params.messages)) {
      errors.push('messages must be an array');
    }
    
    return { valid: errors.length === 0, errors };
  },

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }
};

/**
 * Formatting utilities
 */
export const formatUtils = {
  /**
   * Format duration in milliseconds to readable string
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  },

  /**
   * Format token count with units
   */
  formatTokenCount(tokens: number): string {
    if (tokens < 1000) return `${tokens} tokens`;
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K tokens`;
    return `${(tokens / 1000000).toFixed(1)}M tokens`;
  },

  /**
   * Format API cost estimate
   */
  formatCost(cost: number): string {
    if (cost < 0.01) return `$${(cost * 100).toFixed(2)}¢`;
    return `$${cost.toFixed(4)}`;
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Create performance timer
   */
  createTimer(): { start: number; end: () => number } {
    const start = performance.now();
    return {
      start,
      end: () => performance.now() - start
    };
  },

  /**
   * Calculate percentile from array of values
   */
  calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },

  /**
   * Calculate moving average
   */
  calculateMovingAverage(values: number[], windowSize: number): number {
    if (values.length === 0) return 0;
    
    const window = values.slice(-windowSize);
    return window.reduce((sum, val) => sum + val, 0) / window.length;
  }
};

/**
 * Configuration utilities
 */
export const configUtils = {
  /**
   * Get environment variable with default value
   */
  getEnvVar(name: string, defaultValue: string = ''): string {
    return import.meta.env[name] || defaultValue;
  },

  /**
   * Parse boolean from environment variable
   */
  getEnvBool(name: string, defaultValue: boolean = false): boolean {
    const value = this.getEnvVar(name).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  },

  /**
   * Parse number from environment variable
   */
  getEnvNumber(name: string, defaultValue: number = 0): number {
    const value = this.getEnvVar(name);
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
};

/**
 * Export all utilities
 */
export const externalAIUtils = {
  tokenUtils,
  rateLimitUtils,
  responseUtils,
  errorUtils,
  cacheUtils,
  validationUtils,
  formatUtils,
  performanceUtils,
  configUtils
};

export default externalAIUtils; 