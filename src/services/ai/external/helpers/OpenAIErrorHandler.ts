// OpenAI Error Handler - Manages error processing and external AI error creation
import { ExternalAIError } from '../types/external-ai.types';
import { OPENAI_SERVICE_CONSTANTS } from '../constants/openai-service-constants';
import { logger } from '../../../../utils/logger';

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
    return this.hasErrorMessage(error) && 
           error.message.includes(OPENAI_SERVICE_CONSTANTS.HTTP_STATUS.UNAUTHORIZED.toString());
  }

  private isRateLimitError(error: unknown): boolean {
    return this.hasErrorMessage(error) && 
           error.message.includes(OPENAI_SERVICE_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS.toString());
  }

  private hasErrorMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && 
           error !== null && 
           'message' in error && 
           typeof (error as { message: unknown }).message === 'string';
  }

  private extractErrorMessage(error: unknown): string {
    if (this.hasErrorMessage(error)) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Unknown API error';
  }
} 