// OpenAI Service - Handles API communication with OpenAI
import { 
  OpenAIConfig, 
  OpenAIResponse, 
  OpenAIMessage, 
  ExternalAIMetrics,
  PromptTemplate
} from './types/external-ai.types';
import { openAIConfig } from './config/openai.config';
import { OPENAI_SERVICE_CONSTANTS } from './constants/openai-service-constants';
import { 
  OpenAIRequestHandler,
  RequestOptions,
  StreamOptions 
} from './shared/infrastructure/request-handling';
import { OpenAICacheManager } from './shared/infrastructure/cache';
import { OpenAIMetricsTracker } from './shared/infrastructure/metrics';
import { OpenAIErrorHandler } from './shared/infrastructure/error-handling';
import { logger } from '../../../utils/logger';

export class OpenAIService {
  private config: OpenAIConfig;
  private requestHandler: OpenAIRequestHandler;
  private cacheManager: OpenAICacheManager;
  private metricsTracker: OpenAIMetricsTracker;
  private errorHandler: OpenAIErrorHandler;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(config?: OpenAIConfig) {
    this.config = config ?? openAIConfig().openai;

    this.requestHandler = new OpenAIRequestHandler(this.config);
    this.cacheManager = new OpenAICacheManager();
    this.metricsTracker = new OpenAIMetricsTracker();
    this.errorHandler = new OpenAIErrorHandler();
  }

  // Main method to send requests to OpenAI
  async makeRequest(
    messages: OpenAIMessage[],
    options: RequestOptions & {
      cacheKey?: string;
    } = {}
  ): Promise<OpenAIResponse> {
    const startTime = Date.now();
    
    try {
      // Runtime validation - only when actually making requests
      if (!this.config.apiKey || this.config.apiKey === 'sk-mock-development-key-for-testing-only') {
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
      }

      // Check cache first
      if (options.cacheKey) {
        const cached = this.cacheManager.getCachedResponse<OpenAIResponse>(options.cacheKey);
        if (cached) {
          this.metricsTracker.updateCacheHitRate(true);
          return cached;
        }
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Make API call
      const response = await this.requestHandler.executeRequest(messages, options);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.metricsTracker.updateMetrics(response, responseTime);
      
      // Cache response
      if (options.cacheKey) {
        this.cacheManager.cacheResponse(options.cacheKey, response);
      }
      
      return response;
      
    } catch (error: any) {
      this.errorHandler.handleError(error);
      this.metricsTracker.recordError();
      throw this.errorHandler.createExternalAIError(error);
    }
  }

  // Generate content using a prompt template
  async generateFromTemplate(
    template: PromptTemplate,
    variables: Record<string, unknown>,
    options: {
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<unknown> {
    try {
      this.validateTemplateVariables(template, variables);

      // Replace template variables
      const prompt = this.replaceTemplateVariables(template.template, variables);
      
      // Create messages
      const messages: OpenAIMessage[] = [
        { role: 'system', content: prompt }
      ];

      // Make request
      const response = await this.makeRequest(messages, {
        ...options,
        cacheKey: options.cacheKey ?? this.cacheManager.generateCacheKey(template.id, variables)
      });

      return this.parseResponseContent(response);
      
    } catch (error: any) {
      // Handle API key configuration errors gracefully
      if (error instanceof Error && error.message.includes('API key not configured')) {
        logger.warn('OpenAI API key not configured. AI features will be limited.');
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file for full AI functionality.');
      }
      
      logger.error('OpenAI template generation failed:', error);
      // If the error is already an ExternalAIError, rethrow it
      if (error.type && error.message) {
        throw error;
      }
      throw this.errorHandler.createExternalAIError(error);
    }
  }

  // Generate workout using the new prompt builder
  async generateWorkout(request: unknown): Promise<unknown> {
    try {
      // This method is no longer used - workout generation is handled by QuickWorkoutFeature
      throw new Error('Workout generation is now handled by QuickWorkoutFeature. Use generateFromTemplate() for custom prompts.');

    } catch (error: any) {
      logger.error('Workout generation failed:', error);
      throw this.errorHandler.createExternalAIError(error);
    }
  }

  // Stream responses for real-time applications
  async streamResponse(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
    options: StreamOptions = {}
  ): Promise<void> {
    try {
      await this.enforceRateLimit();
      await this.requestHandler.executeStreamRequest(messages, onChunk, options);
    } catch (error) {
      logger.error('OpenAI streaming failed:', error);
      throw this.errorHandler.createExternalAIError(error);
    }
  }

  // Get current service metrics
  getMetrics(): ExternalAIMetrics {
    return this.metricsTracker.getMetrics();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest([
        { role: 'user', content: 'Health check' }
      ], {
        maxTokens: OPENAI_SERVICE_CONSTANTS.HEALTH_CHECK_MAX_TOKENS,
        timeout: OPENAI_SERVICE_CONSTANTS.HEALTH_CHECK_TIMEOUT_MS
      });
      
      return response.choices?.[0]?.message?.content !== undefined;
    } catch {
      return false;
    }
  }

  // Private methods
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = OPENAI_SERVICE_CONSTANTS.RATE_LIMIT_CALCULATION_MS / openAIConfig().performance.maxRequestsPerMinute;
    
    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    
    this.lastRequestTime = now;
  }

  private validateTemplateVariables(template: PromptTemplate, variables: Record<string, unknown>): void {
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        throw new Error(`Missing required variable: ${variable.name}`);
      }
    }
  }

  private replaceTemplateVariables(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      if (!(trimmedKey in variables)) {
        throw new Error(`Variable not found: ${trimmedKey}`);
      }
      return String(variables[trimmedKey]);
    });
  }

  private parseResponseContent(response: OpenAIResponse): unknown {
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format: missing content');
    }

    // 🔍 DEBUG: Log response metrics
    console.log('🔍 OpenAIService.parseResponseContent - Response metrics:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...',
      lastChar: content.charAt(content.length - 1),
      last100Chars: '...' + content.substring(content.length - 100),
      hasValidJSONStructure: content.trim().startsWith('{') && content.trim().endsWith('}'),
      choiceIndex: response.choices?.[0]?.index,
      finishReason: response.choices?.[0]?.finish_reason,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens
    });

    // Try to parse as JSON first
    try {
      return JSON.parse(content);
    } catch (error) {
      // 🔍 DEBUG: Log parsing failure details
      console.error('❌ OpenAIService.parseResponseContent - JSON parsing failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        contentLength: content.length,
        lastBracketIndex: content.lastIndexOf('}'),
        lastQuoteIndex: content.lastIndexOf('"'),
        truncatedAt: error instanceof Error && error.message.includes('position') 
          ? parseInt(error.message.match(/position (\d+)/)?.[1] || '0')
          : 'unknown'
      });
      
      // If not valid JSON, return raw content for feature-specific processing
      return content;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService(); 