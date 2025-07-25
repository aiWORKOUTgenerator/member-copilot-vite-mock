// OpenAI Error Handler - Manages error processing and external AI error creation
import { ExternalAIError } from '../../types/external-ai.types';
import { OPENAI_SERVICE_CONSTANTS } from '../../../constants/openai-service-constants';
import { logger } from '../../../../../../utils/logger';

export class OpenAIErrorHandler {
  handleError(error: unknown): void {
    logger.error('OpenAI API error:', error);
  }

  createExternalAIError(error: unknown): ExternalAIError {
    if (this.isAbortError(error)) {
      return {
        type: 'network',
        message: 'Request timeout',
        code: OPENAI_SERVICE_CONSTANTS.ERROR_CODES.TIMEOUT
      };
    }
    
    if (this.isAuthenticationError(error)) {
      return {
        type: 'authentication',
        message: 'Invalid API key',
        code: OPENAI_SERVICE_CONSTANTS.ERROR_CODES.INVALID_API_KEY
      };
    }
    
    if (this.isRateLimitError(error)) {
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded',
        code: OPENAI_SERVICE_CONSTANTS.ERROR_CODES.RATE_LIMIT,
        retryAfter: 60
      };
    }

    if (this.isNotFoundError(error)) {
      return {
        type: 'api_error',
        message: 'OpenAI API endpoint not found. Please check your configuration.',
        code: OPENAI_SERVICE_CONSTANTS.ERROR_CODES.NOT_FOUND
      };
    }

    if (this.isNetworkError(error)) {
      return {
        type: 'network',
        message: 'Network error occurred while connecting to OpenAI API',
        code: OPENAI_SERVICE_CONSTANTS.ERROR_CODES.NETWORK_ERROR
      };
    }
    
    return {
      type: 'api_error',
      message: this.extractErrorMessage(error),
      details: error
    };
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }

  private isAuthenticationError(error: unknown): boolean {
    if (!this.hasErrorMessage(error)) {
      return false;
    }

    // Check for error cause
    if (error instanceof Error && error.cause === 'authentication') {
      return true;
    }

    // Check for HTTP 401 status
    if (error.message.includes(OPENAI_SERVICE_CONSTANTS.HTTP_STATUS.UNAUTHORIZED.toString())) {
      try {
        const errorObj = JSON.parse(error.message.split('HTTP 401: ')[1]);
        return errorObj?.error?.code === 'invalid_api_key';
      } catch {
        return false;
      }
    }

    return false;
  }

  private isRateLimitError(error: unknown): boolean {
    if (!this.hasErrorMessage(error)) {
      return false;
    }

    // Check for error cause
    if (error instanceof Error && error.cause === 'rate_limit') {
      return true;
    }

    // Check for HTTP 429 status
    if (error.message.includes(OPENAI_SERVICE_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS.toString())) {
      try {
        const errorObj = JSON.parse(error.message.split('HTTP 429: ')[1]);
        return errorObj?.error?.code === 'rate_limit_exceeded';
      } catch {
        return false;
      }
    }

    return false;
  }

  private isNotFoundError(error: unknown): boolean {
    if (!this.hasErrorMessage(error)) {
      return false;
    }

    return error.message.includes('HTTP 404:');
  }

  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return true;
    }

    if (!this.hasErrorMessage(error)) {
      return false;
    }

    return error.message.toLowerCase().includes('network') || 
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('ENOTFOUND');
  }

  private hasErrorMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && 
           error !== null && 
           'message' in error && 
           typeof (error as { message: unknown }).message === 'string';
  }

  private extractErrorMessage(error: unknown): string {
    if (this.hasErrorMessage(error)) {
      try {
        const errorObj = JSON.parse(error.message.split('HTTP ')[1].split(': ')[1]);
        return errorObj?.error?.message || error.message;
      } catch {
        return error.message;
      }
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Unknown API error';
  }
} 