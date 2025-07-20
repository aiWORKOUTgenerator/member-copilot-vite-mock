// Base classes and utilities for AI Service components
import { getMemoryUsage } from '../../../../utils/performanceUtils';
import { AIInsight, PrioritizedRecommendation } from '../types/AIServiceTypes';

/**
 * Abstract base class for all AI Service components
 * Provides common functionality and utilities
 */
export abstract class AIServiceComponent {
  protected componentName: string;

  constructor(componentName: string) {
    this.componentName = componentName;
  }

  /**
   * Generate a unique ID for tracking
   */
  protected generateId(): string {
    return `${this.componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log messages with consistent formatting
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.componentName}]`;
    
    switch (level) {
      case 'debug':
        console.debug(`${prefix} 🔍 ${message}`, data);
        break;
      case 'info':
        console.info(`${prefix} ℹ️ ${message}`, data);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`, data);
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data);
        break;
    }
  }

  /**
   * Handle errors with consistent formatting and context
   */
  protected handleError(error: Error, context: string, additionalData?: any): void {
    this.log('error', `${context}: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      context,
      additionalData,
      component: this.componentName
    });
  }

  /**
   * Measure execution time of a function
   */
  protected async measureExecutionTime<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; executionTime: number; memoryUsage: number }> {
    const startTime = performance.now();
    const startMemory = getMemoryUsage();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const endMemory = getMemoryUsage();
      
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory - startMemory;
      
      this.log('debug', `${operation} completed`, {
        executionTime: `${executionTime.toFixed(2)}ms`,
        memoryUsage: `${memoryUsage} bytes`,
        component: this.componentName
      });
      
      return { result, executionTime, memoryUsage };
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      this.log('error', `${operation} failed after ${executionTime.toFixed(2)}ms`, {
        error: error instanceof Error ? error.message : String(error),
        executionTime: `${executionTime.toFixed(2)}ms`,
        component: this.componentName
      });
      
      throw error;
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  protected async retryWithBackoff<T>(
    operation: string,
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.log('info', `Retrying ${operation} (attempt ${attempt + 1}/${maxRetries + 1})`);
        }
        
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          this.log('error', `${operation} failed after ${maxRetries + 1} attempts`, {
            lastError: lastError.message,
            component: this.componentName
          });
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * baseDelay;
        this.log('info', `Waiting ${delay}ms before retry`, {
          attempt: attempt + 1,
          maxRetries,
          delay,
          component: this.componentName
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Validate that a value is not null or undefined
   */
  protected validateRequired<T>(value: T | null | undefined, name: string): T {
    if (value === null || value === undefined) {
      throw new Error(`${name} is required but was ${value}`);
    }
    return value;
  }

  /**
   * Validate that a value is within a range
   */
  protected validateRange(value: number, min: number, max: number, name: string): number {
    if (value < min || value > max) {
      throw new Error(`${name} must be between ${min} and ${max}, got ${value}`);
    }
    return value;
  }

  /**
   * Validate that a value is one of the allowed values
   */
  protected validateEnum<T>(value: T, allowedValues: T[], name: string): T {
    if (!allowedValues.includes(value)) {
      throw new Error(`${name} must be one of [${allowedValues.join(', ')}], got ${value}`);
    }
    return value;
  }
}

/**
 * Utility class for common AI Service operations
 */
export class AIServiceUtils {
  /**
   * Map energy level to intensity
   */
  static mapEnergyToIntensity(energyLevel: number): 'low' | 'moderate' | 'high' {
    if (energyLevel <= 3) return 'low';
    if (energyLevel <= 7) return 'moderate';
    return 'high';
  }

  /**
   * Compare two arrays of insights for equality
   */
  static compareInsights(legacy: AIInsight[], current: AIInsight[]): boolean {
    if (legacy.length !== current.length) return false;
    
    for (let i = 0; i < legacy.length; i++) {
      if (legacy[i].type !== current[i].type ||
          legacy[i].message !== current[i].message ||
          legacy[i].recommendation !== current[i].recommendation) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Compare two arrays of recommendations for equality
   */
  static compareRecommendations(legacy: any, current: PrioritizedRecommendation[]): boolean {
    // This is a placeholder implementation
    // In a real implementation, this would compare recommendation content and priority
    // For now, return true as placeholder - will be implemented when legacy format is known
    return true;
  }

  /**
   * Calculate overall confidence from insights and recommendations
   */
  static calculateOverallConfidence(
    insights: Record<string, AIInsight[]>,
    recommendations: PrioritizedRecommendation[]
  ): number {
    // Extract confidence values, filtering out undefined values and providing defaults
    const insightConfidences = Object.values(insights)
      .flat()
      .map(i => i.confidence ?? 0.5); // Default to 0.5 for undefined confidence
    
    const recommendationConfidences = recommendations.map(r => r.confidence);
    
    const allConfidences = [...insightConfidences, ...recommendationConfidences];
    
    // Calculate average confidence
    return allConfidences.length > 0 
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length
      : 0.5;
  }

  /**
   * Generate reasoning from insights, conflicts, and recommendations
   */
  static generateReasoning(
    insights: Record<string, AIInsight[]>,
    conflicts: any[],
    recommendations: PrioritizedRecommendation[]
  ): string {
    const reasoningParts: string[] = [];
    
    if (conflicts.length > 0) {
      reasoningParts.push(`Detected ${conflicts.length} cross-component issue(s) requiring attention.`);
    }
    
    const criticalRecs = recommendations.filter(r => r.priority === 'critical').length;
    if (criticalRecs > 0) {
      reasoningParts.push(`${criticalRecs} critical recommendation(s) for immediate action.`);
    }
    
    const domains = Object.keys(insights).filter(domain => insights[domain].length > 0);
    if (domains.length > 0) {
      reasoningParts.push(`Analysis based on ${domains.join(', ')} parameters.`);
    }
    
    return reasoningParts.join(' ') || 'Comprehensive analysis completed successfully.';
  }

  /**
   * Generate a cache key from selections and context
   */
  static generateCacheKey(selections: any, fitnessLevel?: string): string {
    return JSON.stringify({
      selections,
      fitnessLevel: fitnessLevel || 'unknown',
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute cache windows
    });
  }

  /**
   * Check if a cache entry is expired
   */
  static isCacheExpired(timestamp: Date, timeout: number): boolean {
    const age = Date.now() - timestamp.getTime();
    return age > timeout;
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge two objects deeply
   */
  static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key] as Record<string, any>);
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>];
        }
      }
    }
    
    return result;
  }

  /**
   * Debounce a function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle a function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

/**
 * Constants for AI Service components
 */
export const AI_SERVICE_CONSTANTS = {
  // Cache constants
  DEFAULT_CACHE_SIZE: 1000,
  DEFAULT_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  CACHE_WINDOW_SIZE: 5 * 60 * 1000, // 5 minutes
  
  // Retry constants
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_BASE_DELAY: 100,
  
  // Performance constants
  PERFORMANCE_THRESHOLD: 200, // ms
  MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB
  
  // Health check constants
  HEALTH_CHECK_INTERVAL: 30 * 1000, // 30 seconds
  ERROR_RATE_THRESHOLD: 0.15, // 15%
  
  // Logging constants
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,
  
  // Component names
  COMPONENT_NAMES: {
    CONTEXT: 'AIServiceContext',
    CACHE: 'AIServiceCache',
    HEALTH: 'AIServiceHealth',
    PERFORMANCE: 'AIServicePerformance',
    EXTERNAL_STRATEGY: 'AIServiceExternalStrategy',
    ANALYZER: 'AIServiceAnalyzer',
    VALIDATOR: 'AIServiceValidator',
    ERROR_HANDLER: 'AIServiceErrorHandler',
    INTERACTION_TRACKER: 'AIServiceInteractionTracker',
    LEARNING_ENGINE: 'AIServiceLearningEngine'
  }
} as const; 