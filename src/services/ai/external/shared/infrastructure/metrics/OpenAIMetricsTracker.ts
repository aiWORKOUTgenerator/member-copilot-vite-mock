// OpenAI Metrics Tracker - Handles performance monitoring
import { ExternalAIMetrics, OpenAIResponse } from '../../../types/external-ai.types';
import { OPENAI_SERVICE_CONSTANTS } from '../../../constants/openai-service-constants';
import { estimateTokenCost } from '../../../config/openai.config';

export class OpenAIMetricsTracker {
  private metrics: ExternalAIMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
    costEstimate: 0,
    cacheHitRate: 0
  };
  private responseTimes: number[] = [];
  private errorCount = 0;

  updateMetrics(response: OpenAIResponse, responseTime: number): void {
    this.incrementRequestCount();
    this.responseTimes.push(responseTime);
    
    // Keep only last N response times for rolling average
    if (this.responseTimes.length > OPENAI_SERVICE_CONSTANTS.MAX_RESPONSE_TIMES_TO_TRACK) {
      this.responseTimes.shift();
    }
    
    this.updateAverageResponseTime();
    this.updateTokenUsage(response);
  }

  recordError(): void {
    this.incrementRequestCount();
    this.errorCount++;
    this.updateErrorRate();
  }

  updateCacheHitRate(isHit: boolean): void {
    const currentRate = this.metrics.cacheHitRate;
    const currentRequests = this.metrics.requestCount;
    
    if (currentRequests === 0) {
      this.metrics.cacheHitRate = isHit ? 1 : 0;
    } else {
      this.metrics.cacheHitRate = ((currentRate * currentRequests) + (isHit ? 1 : 0)) / (currentRequests + 1);
    }
  }

  getMetrics(): ExternalAIMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      costEstimate: 0,
      cacheHitRate: 0
    };
    this.responseTimes = [];
    this.errorCount = 0;
  }

  private incrementRequestCount(): void {
    this.metrics.requestCount++;
  }

  private updateAverageResponseTime(): void {
    if (this.responseTimes.length === 0) return;
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  private updateTokenUsage(response: OpenAIResponse): void {
    if (!response.usage) return;
    
    this.metrics.tokenUsage.prompt += response.usage.prompt_tokens;
    this.metrics.tokenUsage.completion += response.usage.completion_tokens;
    this.metrics.tokenUsage.total += response.usage.total_tokens;
    
    // Update cost estimate
    this.metrics.costEstimate += estimateTokenCost(
      response.usage.total_tokens,
      response.model
    );
  }

  private updateErrorRate(): void {
    const totalRequests = this.metrics.requestCount;
    if (totalRequests === 0) return;
    
    this.metrics.errorRate = this.errorCount / totalRequests;
  }
} 