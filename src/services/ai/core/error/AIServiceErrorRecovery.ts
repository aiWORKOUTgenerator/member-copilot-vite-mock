// AI Service Error Recovery - Handles retry logic and service recovery
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  AIServiceRecoveryAttempt,
  AIServiceRetryConfig,
  AIServiceRecoveryResult,
  GlobalAIContext,
  UnifiedAIAnalysis
} from '../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../types';

/**
 * Error recovery component for AI Service
 * Handles retry logic, service recovery, and fallback mechanisms
 */
export class AIServiceErrorRecovery extends AIServiceComponent {
  private retryConfig: AIServiceRetryConfig;
  private recoveryAttempts: AIServiceRecoveryAttempt[] = [];
  private domainServices: Map<string, any>;

  constructor(domainServices: Map<string, any>, retryConfig?: Partial<AIServiceRetryConfig>) {
    super('AIServiceErrorRecovery');
    
    this.domainServices = domainServices;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryableErrors: [
        'timeout',
        'network',
        'connection',
        'service unavailable',
        'temporarily unavailable',
        'temporary',
        'retry'
      ],
      ...retryConfig
    };
  }

  /**
   * Attempt recovery from an error
   */
  async attemptRecovery(error: Error, context: string): Promise<boolean> {
    this.log('info', `Attempting recovery for error: ${error.message}`, { context });
    
    try {
      // Check if error is retryable
      if (!this.shouldRetry(error, 0)) {
        this.log('info', 'Error is not retryable, skipping recovery');
        this.recordRecoveryAttempt('general', 'reset', false, 'Error not retryable', 0);
        return false;
      }

      // Attempt service recovery if it's a service error
      if (this.isServiceError(error, context)) {
        const serviceName = this.extractServiceName(context);
        if (serviceName) {
          const startTime = Date.now();
          const result = await this.attemptServiceRecovery(serviceName);
          const duration = Date.now() - startTime;
          this.recordRecoveryAttempt(serviceName, 'reset', result, result ? undefined : 'Service recovery failed', duration);
          return result;
        }
      }

      // Attempt general recovery
      const startTime = Date.now();
      const result = await this.attemptGeneralRecovery(error, context);
      const duration = Date.now() - startTime;
      this.recordRecoveryAttempt('general', 'reset', result, result ? undefined : 'General recovery failed', duration);
      return result;
    } catch (recoveryError) {
      this.log('error', 'Recovery attempt failed', {
        originalError: error.message,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
      });
      this.recordRecoveryAttempt('general', 'reset', false, recoveryError instanceof Error ? recoveryError.message : String(recoveryError), 0);
      return false;
    }
  }

  /**
   * Fallback to legacy implementation
   */
  async fallbackToLegacy(operation: string, context: any): Promise<any> {
    this.log('info', `Attempting fallback to legacy for operation: ${operation}`);
    
    try {
      // This would call the legacy implementation
      // For now, return a safe fallback
      switch (operation) {
        case 'analysis':
          return this.generateLegacyAnalysis(context);
        case 'recommendations':
          return this.generateLegacyRecommendations(context);
        case 'insights':
          return this.generateLegacyInsights(context);
        default:
          throw new Error(`Unknown operation for legacy fallback: ${operation}`);
      }
    } catch (error) {
      this.log('error', 'Legacy fallback failed', {
        operation,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Check if error should be retried
   */
  shouldRetry(error: Error, attemptCount: number): boolean {
    // Check max retries
    if (attemptCount >= this.retryConfig.maxRetries) {
      return false;
    }

    // Check if error is retryable
    const errorMessage = error.message.toLowerCase();
    const isRetryable = this.retryConfig.retryableErrors.some(trigger => 
      errorMessage.includes(trigger)
    );

    if (!isRetryable) {
      this.log('debug', 'Error is not retryable', { errorMessage });
      return false;
    }

    // Check for specific non-retryable errors
    const nonRetryableErrors = [
      'validation failed',
      'invalid input',
      'permission denied',
      'not found',
      'already exists'
    ];

    if (nonRetryableErrors.some(trigger => errorMessage.includes(trigger))) {
      this.log('debug', 'Error is explicitly non-retryable', { errorMessage });
      return false;
    }

    return true;
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    operation: string,
    context?: any
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.log('info', `Retrying ${operation} (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`);
        }
        
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.retryConfig.maxRetries) {
          this.log('error', `${operation} failed after ${this.retryConfig.maxRetries + 1} attempts`, {
            lastError: lastError.message,
            context
          });
          break;
        }
        
        // Check if should retry
        if (!this.shouldRetry(lastError, attempt)) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          Math.pow(this.retryConfig.backoffMultiplier, attempt) * this.retryConfig.baseDelay,
          this.retryConfig.maxDelay
        );
        
        this.log('info', `Waiting ${delay}ms before retry`, {
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delay,
          context
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Force recovery of all services
   */
  async forceRecovery(): Promise<AIServiceRecoveryResult> {
    this.log('info', '🔄 Forcing AI service recovery...');
    
    const recoveredServices: string[] = [];
    const failedServices: string[] = [];
    const errors: string[] = [];
    
    // Don't clear recovery attempts history - let it accumulate for statistics
    
    // Attempt recovery for each domain service
    for (const [serviceName, service] of this.domainServices) {
      try {
        const startTime = Date.now();
        const result = await this.attemptServiceRecovery(serviceName);
        const duration = Date.now() - startTime;
        
        if (result) {
          recoveredServices.push(serviceName);
          this.recordRecoveryAttempt(serviceName, 'reset', true, undefined, duration);
        } else {
          failedServices.push(serviceName);
          this.recordRecoveryAttempt(serviceName, 'reset', false, 'Recovery method not available', duration);
        }
      } catch (error) {
        failedServices.push(serviceName);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${serviceName}: ${errorMessage}`);
        this.recordRecoveryAttempt(serviceName, 'reset', false, errorMessage, 0);
      }
    }
    
    const success = errors.length === 0;
    
    this.log('info', '✅ Recovery completed', {
      success,
      recoveredServices: recoveredServices.length,
      failedServices: failedServices.length,
      errors: errors.length
    });
    
    return {
      success,
      recoveredServices,
      failedServices,
      errors
    };
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    successRate: number;
    recentAttempts: AIServiceRecoveryAttempt[];
    averageRecoveryTime: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentAttempts = this.recoveryAttempts.filter(attempt => attempt.timestamp > oneHourAgo);
    
    const successfulRecoveries = this.recoveryAttempts.filter(attempt => attempt.success).length;
    const totalAttempts = this.recoveryAttempts.length;
    const successRate = totalAttempts > 0 ? successfulRecoveries / totalAttempts : 0;
    
    const successfulAttempts = this.recoveryAttempts.filter(attempt => attempt.success);
    const averageRecoveryTime = successfulAttempts.length > 0 
      ? successfulAttempts.reduce((sum, attempt) => sum + attempt.duration, 0) / successfulAttempts.length
      : 0;
    
    return {
      totalAttempts,
      successfulRecoveries,
      failedRecoveries: totalAttempts - successfulRecoveries,
      successRate,
      recentAttempts,
      averageRecoveryTime
    };
  }

  /**
   * Reset recovery component
   */
  reset(): void {
    this.recoveryAttempts = [];
    this.log('info', 'Recovery component reset');
  }

  // Private methods

  private async attemptServiceRecovery(serviceName: string): Promise<boolean> {
    const service = this.domainServices.get(serviceName);
    if (!service) {
      this.log('warn', `Service not found: ${serviceName}`);
      return false;
    }

    try {
      // Try to reinitialize service if it has an initialize method
      if (typeof service.initialize === 'function') {
        await service.initialize();
        this.log('info', `Service ${serviceName} reinitialized successfully`);
        return true;
      }
      
      // Try to reset service if it has a reset method
      if (typeof service.reset === 'function') {
        service.reset();
        this.log('info', `Service ${serviceName} reset successfully`);
        return true;
      }
      
      // Service doesn't support recovery methods
      this.log('info', `Service ${serviceName} doesn't support recovery methods`);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('error', `Recovery attempt failed for ${serviceName}: ${errorMessage}`);
      throw error; // Re-throw to be caught by forceRecovery
    }
  }

  private async attemptGeneralRecovery(error: Error, context: string): Promise<boolean> {
    this.log('info', 'Attempting general recovery', { context, error: error.message });
    
    // For now, return false as general recovery is not implemented
    // In a real implementation, this could include:
    // - Clearing caches
    // - Resetting state
    // - Reconnecting to external services
    // - Restarting background processes
    
    return false;
  }

  private isServiceError(error: Error, context: string): boolean {
    const serviceNames = Array.from(this.domainServices.keys());
    return serviceNames.some(serviceName => 
      context.toLowerCase().includes(serviceName.toLowerCase()) ||
      error.message.toLowerCase().includes(serviceName.toLowerCase())
    );
  }

  private extractServiceName(context: string): string | null {
    const serviceNames = Array.from(this.domainServices.keys());
    return serviceNames.find(serviceName => 
      context.toLowerCase().includes(serviceName.toLowerCase())
    ) || null;
  }

  private recordRecoveryAttempt(
    serviceName: string,
    method: 'initialize' | 'reset' | 'recreate',
    success: boolean,
    error?: string,
    duration: number = 0
  ): void {
    const attempt: AIServiceRecoveryAttempt = {
      serviceName,
      timestamp: new Date(),
      method,
      success,
      error,
      duration
    };
    
    this.recoveryAttempts.push(attempt);
    
    // Limit recovery attempts history
    if (this.recoveryAttempts.length > 100) {
      this.recoveryAttempts = this.recoveryAttempts.slice(-50);
    }
  }

  private generateLegacyAnalysis(context: any): UnifiedAIAnalysis {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      insights: {
        energy: [],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      },
      crossComponentConflicts: [],
      recommendations: [],
      confidence: 0.1,
      reasoning: 'Legacy analysis generated due to error conditions',
      performanceMetrics: {
        totalExecutionTime: 0,
        cacheHitRate: 0,
        memoryPeakUsage: 0
      }
    };
  }

  private generateLegacyRecommendations(context: any): any[] {
    return [];
  }

  private generateLegacyInsights(context: any): any[] {
    return [];
  }
} 