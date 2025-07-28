// Base classes and utilities for AI Service components
import { getMemoryUsage } from '../../../../utils/performanceUtils';
import { AIInsight, PrioritizedRecommendation } from '../../../types/ai-context.types';
import { aiLogger } from '../../logging/AILogger';

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
        aiLogger.debug(`${prefix} 🔍 ${message}`, data);
        break;
      case 'info':
        aiLogger.info(`${prefix} ℹ️ ${message}`, data);
        break;
      case 'warn':
        aiLogger.warn(`${prefix} ⚠️ ${message}`, data);
        break;
      case 'error':
        aiLogger.error({
          error: new Error(message),
          context: 'service_operation',
          component: this.componentName,
          severity: 'high',
          userImpact: true,
          timestamp: new Date().toISOString()
        });
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