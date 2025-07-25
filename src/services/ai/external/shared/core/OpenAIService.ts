// OpenAI Service - Handles API communication with OpenAI
import { 
  OpenAIConfig, 
  OpenAIResponse, 
  OpenAIMessage, 
  ExternalAIMetrics,
  PromptTemplate
} from '../../types/external-ai.types';
import { openAIConfig, validateConfig } from '../infrastructure/config/openai.config';
import { OPENAI_SERVICE_CONSTANTS } from '../constants/openai-service-constants';
import { 
  OpenAIRequestHandler
} from '../infrastructure/request-handling';
import { 
  OpenAICacheManager
} from '../infrastructure/cache';
import { 
  OpenAIMetricsTracker
} from '../infrastructure/metrics';
import { 
  OpenAIErrorHandler
} from '../infrastructure/error-handling';
import { logger } from '../../../../utils/logger';

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
    
    // Initialize components without strict validation
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
      // BEGIN: Enhanced error logging
      if (error && typeof error === 'object') {
        console.error('[OpenAIService.makeRequest] Error object:', error);
        if (error.status) {
          console.error('[OpenAIService.makeRequest] Error status:', error.status);
        }
        if (error.statusText) {
          console.error('[OpenAIService.makeRequest] Error statusText:', error.statusText);
        }
        if (error.message) {
          console.error('[OpenAIService.makeRequest] Error message:', error.message);
        }
        if (error.response) {
          console.error('[OpenAIService.makeRequest] Error response:', error.response);
        }
      } else {
        console.error('[OpenAIService.makeRequest] Error:', error);
      }
      // END: Enhanced error logging
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

      const parsedContent = this.parseResponseContent(response);
      console.log('🔍 OpenAIService.generateFromTemplate - Returning parsed content:', {
        type: typeof parsedContent,
        isObject: typeof parsedContent === 'object',
        isNull: parsedContent === null,
        hasTitle: parsedContent && typeof parsedContent === 'object' ? !!parsedContent.title : false,
        title: parsedContent && typeof parsedContent === 'object' ? parsedContent.title : 'N/A'
      });
      
      return parsedContent;
      
    } catch (error: any) {
      // BEGIN: Enhanced error logging
      if (error && typeof error === 'object') {
        console.error('[OpenAIService.generateFromTemplate] Error object:', error);
        if (error.status) {
          console.error('[OpenAIService.generateFromTemplate] Error status:', error.status);
        }
        if (error.statusText) {
          console.error('[OpenAIService.generateFromTemplate] Error statusText:', error.statusText);
        }
        if (error.message) {
          console.error('[OpenAIService.generateFromTemplate] Error message:', error.message);
        }
        if (error.response) {
          console.error('[OpenAIService.generateFromTemplate] Error response:', error.response);
        }
      } else {
        console.error('[OpenAIService.generateFromTemplate] Error:', error);
      }
      // END: Enhanced error logging
      // Handle API key configuration errors gracefully
      if (error instanceof Error && error.message.includes('API key not configured')) {
        logger.warn('OpenAI API key not configured. AI features will be limited.');
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file for full AI functionality.');
      }
      
      logger.error('OpenAI template generation failed:', error);
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
    this.requestCount++;
  }

  private validateTemplateVariables(template: PromptTemplate, variables: Record<string, unknown>): void {
    const missingVars = template.variables
      .filter(v => v.required && !variables[v.name])
      .map(v => v.name);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }
  }

  private replaceTemplateVariables(template: string, variables: Record<string, unknown>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = Array.isArray(value) ? value.join(', ') : String(value);
      result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    
    return result;
  }

  private parseResponseContent(response: OpenAIResponse): unknown {
    const content = response.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Try multiple JSON parsing strategies
    let parsed: any = null;
    let parseMethod = '';
    
    try {
      // Strategy 1: Try direct JSON parsing
      parsed = JSON.parse(content);
      parseMethod = 'direct';
    } catch {
      try {
        // Strategy 2: Try to extract JSON from markdown code blocks ✅ THIS IS THE KEY STRATEGY
        const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
          parseMethod = 'markdown';
        }
      } catch {
        try {
          // Strategy 3: Try to extract JSON from any code blocks
          const codeMatch = content.match(/```\s*\n([\s\S]*?)\n```/);
          if (codeMatch) {
            parsed = JSON.parse(codeMatch[1]);
            parseMethod = 'codeblock';
          }
        } catch {
          try {
            // Strategy 4: Try to find JSON object in the text
            const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
              parsed = JSON.parse(jsonObjectMatch[0]);
              parseMethod = 'extracted';
            }
          } catch {
            // Strategy 5: Return as text if all JSON parsing fails
            console.log('🔍 OpenAIService.parseResponseContent - All JSON parsing failed, returning as text');
            return content;
          }
        }
      }
    }
    
    if (parsed) {
      console.log('🔍 OpenAIService.parseResponseContent - Successfully parsed JSON using method:', parseMethod);
      console.log('🔍 OpenAIService.parseResponseContent - Parsed structure:', {
        hasId: !!parsed.id,
        hasTitle: !!parsed.title,
        hasWarmup: !!parsed.warmup,
        hasMainWorkout: !!parsed.mainWorkout,
        hasCooldown: !!parsed.cooldown,
        topLevelKeys: Object.keys(parsed)
      });
      
      console.log('🔍 OpenAIService.parseResponseContent - Returning parsed object with title:', parsed.title);
      return parsed; // ✅ RETURNS CLEAN PARSED OBJECT
    }
    
    return content;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService(); 