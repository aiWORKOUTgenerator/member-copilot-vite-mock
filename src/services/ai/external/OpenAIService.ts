// OpenAI Service - Handles API communication with OpenAI
import { 
  OpenAIConfig, 
  OpenAIResponse, 
  OpenAIMessage, 
  ExternalAIError, 
  ExternalAIMetrics,
  PromptTemplate,
  CacheKey,
  CacheEntry
} from './types/external-ai.types';
import { openAIConfig, validateConfig, estimateTokenCost } from './config/openai.config';
import { logger } from '../../../utils/logger';

export class OpenAIService {
  private config: OpenAIConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private requestCount = 0;
  private lastRequestTime = 0;
  private metrics: ExternalAIMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
    costEstimate: 0,
    cacheHitRate: 0
  };
  private cache = new Map<string, CacheEntry<any>>();
  private responseTimes: number[] = [];

  constructor(config?: OpenAIConfig) {
    this.config = config || openAIConfig.openai;
    
    if (!validateConfig({ ...openAIConfig, openai: this.config })) {
      throw new Error('Invalid OpenAI configuration');
    }
  }

  // Main method to send requests to OpenAI
  async makeRequest(
    messages: OpenAIMessage[],
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<OpenAIResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (options.cacheKey) {
        const cached = this.getCachedResponse(options.cacheKey);
        if (cached) {
          this.metrics.cacheHitRate = this.calculateCacheHitRate(true);
          return cached;
        }
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Prepare request
      const requestBody = {
        model: options.model || this.config.model,
        messages,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        stream: false
      };

      // Make API call
      const response = await this.executeRequest(requestBody, options.timeout);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(response, responseTime);
      
      // Cache response
      if (options.cacheKey) {
        this.cacheResponse(options.cacheKey, response);
      }
      
      return response;
      
    } catch (error) {
      this.handleError(error);
      throw this.createExternalAIError(error);
    }
  }

  // Generate content using a prompt template
  async generateFromTemplate(
    template: PromptTemplate,
    variables: Record<string, any>,
    options: {
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<any> {
    try {
      // Validate required variables
      const missingVars = template.variables
        .filter(v => v.required && !variables[v.name])
        .map(v => v.name);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
      }

      // Replace template variables
      const prompt = this.replaceTemplateVariables(template.template, variables);
      
      // Create messages
      const messages: OpenAIMessage[] = [
        { role: 'system', content: prompt }
      ];

      // Make request
      const response = await this.makeRequest(messages, {
        ...options,
        cacheKey: options.cacheKey || this.generateCacheKey(template.id, variables)
      });

      // Parse response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Try to parse JSON if template expects structured output
      try {
        return JSON.parse(content);
      } catch {
        // Return as text if not JSON
        return content;
      }
      
    } catch (error) {
      logger.error('OpenAI template generation failed:', error);
      throw this.createExternalAIError(error);
    }
  }

  // Stream responses for real-time applications
  async streamResponse(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    } = {}
  ): Promise<void> {
    try {
      await this.enforceRateLimit();

      const requestBody = {
        model: options.model || this.config.model,
        messages,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        stream: true
      };

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organizationId && { 'OpenAI-Organization': this.config.organizationId })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                // Ignore parsing errors for streaming
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      logger.error('OpenAI streaming failed:', error);
      throw this.createExternalAIError(error);
    }
  }

  // Get current service metrics
  getMetrics(): ExternalAIMetrics {
    return { ...this.metrics };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest([
        { role: 'user', content: 'Health check' }
      ], {
        maxTokens: 10,
        timeout: 5000
      });
      
      return response.choices?.[0]?.message?.content !== undefined;
    } catch {
      return false;
    }
  }

  // Private methods
  private async executeRequest(
    requestBody: any,
    timeout?: number
  ): Promise<OpenAIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organizationId && { 'OpenAI-Organization': this.config.organizationId })
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / openAIConfig.performance.maxRequestsPerMinute;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = now;
    this.requestCount++;
  }

  private updateMetrics(response: OpenAIResponse, responseTime: number): void {
    this.metrics.requestCount++;
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times for rolling average
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    
    // Update token usage
    if (response.usage) {
      this.metrics.tokenUsage.prompt += response.usage.prompt_tokens;
      this.metrics.tokenUsage.completion += response.usage.completion_tokens;
      this.metrics.tokenUsage.total += response.usage.total_tokens;
      
      // Update cost estimate
      this.metrics.costEstimate += estimateTokenCost(
        response.usage.total_tokens,
        response.model
      );
    }
  }

  private handleError(error: any): void {
    this.metrics.errorRate = (this.metrics.errorRate * this.metrics.requestCount + 1) / 
      (this.metrics.requestCount + 1);
    
    logger.error('OpenAI API error:', error);
  }

  private createExternalAIError(error: any): ExternalAIError {
    if (error.name === 'AbortError') {
      return {
        type: 'network',
        message: 'Request timeout',
        code: 'TIMEOUT'
      };
    }
    
    if (error.message?.includes('401')) {
      return {
        type: 'authentication',
        message: 'Invalid API key',
        code: 'INVALID_API_KEY'
      };
    }
    
    if (error.message?.includes('429')) {
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        retryAfter: 60
      };
    }
    
    return {
      type: 'api_error',
      message: error.message || 'Unknown API error',
      details: error
    };
  }

  private replaceTemplateVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = Array.isArray(value) ? value.join(', ') : String(value);
      result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    
    return result;
  }

  private generateCacheKey(templateId: string, variables: Record<string, any>): string {
    return `${templateId}_${JSON.stringify(variables)}`;
  }

  private getCachedResponse(cacheKey: string): any | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    return entry.data;
  }

  private cacheResponse(cacheKey: string, data: any): void {
    const entry: CacheEntry<any> = {
      key: {
        userId: 'current', // Should be actual user ID
        requestType: 'openai',
        parameters: cacheKey,
        timestamp: Date.now()
      },
      data,
      expiresAt: Date.now() + openAIConfig.performance.cacheTimeoutMs,
      accessCount: 1,
      lastAccessed: Date.now()
    };
    
    this.cache.set(cacheKey, entry);
    
    // Clean up old entries
    this.cleanupCache();
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private calculateCacheHitRate(isHit: boolean): number {
    const currentRate = this.metrics.cacheHitRate;
    const currentRequests = this.metrics.requestCount;
    
    if (currentRequests === 0) return isHit ? 1 : 0;
    
    return ((currentRate * currentRequests) + (isHit ? 1 : 0)) / (currentRequests + 1);
  }
}

// Export singleton instance
export const openAIService = new OpenAIService(); 