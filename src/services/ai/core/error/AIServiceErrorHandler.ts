// AI Service Error Handler - Centralized error handling and classification
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  AIServiceError, 
  AIServiceErrorConfig, 
  AIServiceErrorStats,
  GlobalAIContext,
  UnifiedAIAnalysis,
  PerWorkoutOptions
} from '../types/AIServiceTypes';

/**
 * Centralized error handler for AI Service components
 * Provides error classification, logging, reporting, and recovery strategies
 */
export class AIServiceErrorHandler extends AIServiceComponent {
  private config: AIServiceErrorConfig;
  private errorLog: AIServiceError[] = [];
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, Date> = new Map();
  private circuitBreakerStatus: 'closed' | 'open' | 'half_open' = 'closed';
  private circuitBreakerFailures: number = 0;
  private circuitBreakerLastFailure: Date | null = null;
  private lastError: AIServiceError | null = null;

  constructor(config: Partial<AIServiceErrorConfig> = {}) {
    super('AIServiceErrorHandler');
    
    this.config = {
      enableReporting: true,
      fallbackToLegacy: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Handle general errors with classification and resolution
   */
  handleError(error: Error, context: string, additionalData?: any): void {
    const aiError = this.classifyError(error, context, additionalData);
    
    // Log error
    this.logError(aiError);
    
    // Update error counts and circuit breaker
    this.updateErrorCounts(aiError);
    this.updateCircuitBreaker(aiError);
    
    // Report error if enabled
    if (this.config.enableReporting) {
      this.reportError(aiError);
    }
    
    // Check for error patterns
    this.checkErrorPatterns(aiError);
    
    // Store as last error
    this.lastError = aiError;
  }

  /**
   * Handle analysis errors with fallback mechanisms
   */
  async handleAnalysisError(
    error: Error,
    selections: PerWorkoutOptions,
    context: GlobalAIContext,
    legacyImplementations?: any
  ): Promise<UnifiedAIAnalysis | null> {
    const aiError = this.classifyError(error, 'analysis', { selections, context });
    this.logError(aiError);
    
    // Attempt fallback to legacy implementation
    if (this.config.fallbackToLegacy && legacyImplementations) {
      try {
        return await this.fallbackToLegacyAnalysis(selections, context, legacyImplementations);
      } catch (fallbackError) {
        this.handleError(fallbackError as Error, 'legacy_fallback', { originalError: error });
      }
    }
    
    // Return minimal safe analysis
    return this.generateMinimalAnalysis(selections, context);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: Error,
    expected: any,
    actual: any,
    component: string
  ): void {
    const aiError = this.classifyError(error, component, { expected, actual });
    aiError.type = 'validation_error';
    aiError.severity = 'high';
    
    this.logError(aiError);
    this.reportError(aiError);
  }

  /**
   * Handle context errors
   */
  handleContextError(error: Error, context: any): void {
    const aiError = this.classifyError(error, 'context', { context });
    aiError.type = 'context_error';
    aiError.severity = 'medium';
    
    this.logError(aiError);
  }

  /**
   * Handle performance errors
   */
  handlePerformanceError(
    error: Error,
    metrics: any,
    component: string
  ): void {
    const aiError = this.classifyError(error, component, { metrics });
    aiError.type = 'performance_error';
    aiError.severity = 'medium';
    
    this.logError(aiError);
    this.reportError(aiError);
  }

  /**
   * Handle recovery errors
   */
  handleRecoveryError(
    error: Error,
    serviceName: string,
    recoveryMethod: string
  ): void {
    const aiError = this.classifyError(error, 'recovery', { serviceName, recoveryMethod });
    aiError.type = 'recovery_error';
    aiError.severity = 'high';
    
    this.logError(aiError);
    this.reportError(aiError);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): AIServiceErrorStats {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.errorLog.filter(error => error.timestamp > oneHourAgo);
    
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      if (error.component) {
        errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
      }
    });
    
    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      errorsByComponent,
      recentErrors,
      errorRate: recentErrors.length / 60, // errors per minute
      circuitBreakerStatus: this.circuitBreakerStatus
    };
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    const stats = this.getErrorStats();
    
    // Check circuit breaker
    if (this.circuitBreakerStatus === 'open') {
      return false;
    }
    
    // Check recent error rate
    if (stats.errorRate > 5) { // More than 5 errors per minute
      return false;
    }
    
    // Check for critical errors
    if (stats.errorsBySeverity.critical > 0) {
      return false;
    }
    
    // Check for error patterns
    return !this.hasErrorPattern();
  }

  /**
   * Get the last error that occurred
   */
  getLastError(): {
    message: string;
    timestamp: Date;
    component: string;
  } | undefined {
    if (!this.lastError) {
      return undefined;
    }
    
    return {
      message: this.lastError.message,
      timestamp: this.lastError.timestamp,
      component: this.lastError.component || 'unknown'
    };
  }

  /**
   * Get error recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getErrorStats();
    const recommendations: string[] = [];
    
    if (stats.errorRate > 3) {
      recommendations.push('High error rate detected - consider implementing circuit breaker pattern');
    }
    
    if (stats.errorsByType.validation_error > 5) {
      recommendations.push('Multiple validation errors - review migration compatibility');
    }
    
    if (stats.errorsByType.performance_error > 3) {
      recommendations.push('Performance errors detected - review resource allocation');
    }
    
    if (stats.errorsByType.context_error > 2) {
      recommendations.push('Context errors detected - review context initialization');
    }
    
    if (stats.errorsByType.recovery_error > 1) {
      recommendations.push('Recovery errors detected - review service recovery mechanisms');
    }
    
    if (this.circuitBreakerStatus === 'open') {
      recommendations.push('Circuit breaker is open - service is in degraded mode');
    }
    
    return recommendations;
  }

  /**
   * Clear old errors
   */
  clearOldErrors(olderThan: Date): void {
    this.errorLog = this.errorLog.filter(error => error.timestamp > olderThan);
  }

  /**
   * Reset error handler
   */
  reset(): void {
    this.errorLog = [];
    this.errorCounts.clear();
    this.lastErrorTime.clear();
    this.circuitBreakerStatus = 'closed';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailure = null;
    this.lastError = null;
    
    this.log('info', 'Error handler reset');
  }

  /**
   * Check if should fallback to legacy
   */
  shouldFallbackToLegacy(error: Error): boolean {
    if (!this.config.fallbackToLegacy) {
      return false;
    }
    
    // Check circuit breaker
    if (this.circuitBreakerStatus === 'open') {
      return true;
    }
    
    // Check error type
    const errorMessage = error.message.toLowerCase();
    const fallbackTriggers = [
      'timeout',
      'network',
      'connection',
      'service unavailable',
      'analysis failed',
      'validation failed'
    ];
    
    return fallbackTriggers.some(trigger => errorMessage.includes(trigger));
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitBreakerOpen(): boolean {
    return this.circuitBreakerStatus === 'open';
  }

  /**
   * Manually close circuit breaker
   */
  closeCircuitBreaker(): void {
    this.circuitBreakerStatus = 'closed';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailure = null;
    this.log('info', 'Circuit breaker manually closed');
  }

  // Private methods

  private classifyError(error: Error, component: string, context?: any): AIServiceError {
    const errorMessage = error.message.toLowerCase();
    let type: AIServiceError['type'] = 'unknown';
    let severity: AIServiceError['severity'] = 'medium';
    let resolution: AIServiceError['resolution'] = 'manual';

    // Classify error type
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      type = 'validation_error';
      severity = 'high';
      resolution = 'skip';
    } else if (errorMessage.includes('context') || errorMessage.includes('profile')) {
      type = 'context_error';
      severity = 'medium';
      resolution = 'retry';
    } else if (errorMessage.includes('performance') || errorMessage.includes('timeout')) {
      type = 'performance_error';
      severity = 'medium';
      resolution = 'retry';
    } else if (errorMessage.includes('analysis') || errorMessage.includes('insight')) {
      type = 'analysis_failure';
      severity = 'high';
      resolution = 'fallback';
    } else if (errorMessage.includes('recovery') || errorMessage.includes('reset') || errorMessage.includes('init failed')) {
      type = 'recovery_error';
      severity = 'critical';
      resolution = 'manual';
    }

    // Adjust severity based on context
    if (context?.critical || errorMessage.includes('critical')) {
      severity = 'critical';
    } else if (errorMessage.includes('warning') || errorMessage.includes('minor')) {
      severity = 'low';
    }

    return {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      severity,
      message: error.message,
      stack: error.stack,
      context,
      component,
      resolution,
      retryCount: 0,
      maxRetries: this.config.maxRetries
    };
  }

  private logError(error: AIServiceError): void {
    this.errorLog.push(error);
    
    // Limit error log size
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-500);
    }
    
    this.log('error', `Error occurred: ${error.message}`, {
      type: error.type,
      severity: error.severity,
      component: error.component,
      resolution: error.resolution
    });
  }

  private reportError(error: AIServiceError): void {
    // In a real implementation, this would send to error reporting service
    // For now, just log to console
    console.error('Error reported:', {
      id: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message,
      component: error.component,
      timestamp: error.timestamp
    });
  }

  private updateErrorCounts(error: AIServiceError): void {
    const key = `${error.type}_${error.component}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.lastErrorTime.set(key, error.timestamp);
  }

  private updateCircuitBreaker(error: AIServiceError): void {
    if (!this.config.enableCircuitBreaker) {
      return;
    }

    if (error.severity === 'critical' || error.severity === 'high') {
      this.circuitBreakerFailures++;
      this.circuitBreakerLastFailure = error.timestamp;
      
      if (this.circuitBreakerFailures >= this.config.circuitBreakerThreshold) {
        this.circuitBreakerStatus = 'open';
        this.log('warn', 'Circuit breaker opened due to high error rate');
      }
    }
  }

  private checkErrorPatterns(error: AIServiceError): void {
    const key = `${error.type}_${error.component}`;
    const count = this.errorCounts.get(key) || 0;
    
    if (count >= 3) {
      this.handleErrorPattern(error, count);
    }
  }

  private handleErrorPattern(error: AIServiceError, count: number): void {
    this.log('warn', `Error pattern detected: ${error.type} in ${error.component} (${count} occurrences)`);
    
    // In a real implementation, this could trigger alerts or automatic recovery
    if (count >= 5) {
      this.log('error', `Critical error pattern: ${error.type} in ${error.component}`);
    }
  }

  private hasErrorPattern(): boolean {
    for (const [key, count] of this.errorCounts) {
      if (count >= 3) {
        return true;
      }
    }
    return false;
  }

  private async fallbackToLegacyAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext,
    legacyImplementations: any
  ): Promise<UnifiedAIAnalysis> {
    this.log('info', 'Attempting fallback to legacy analysis');
    
    try {
      // This would call the legacy analysis implementation
      // For now, return a minimal analysis
      return this.generateMinimalAnalysis(selections, context);
    } catch (error) {
      throw new Error(`Legacy fallback failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private generateMinimalAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext
  ): UnifiedAIAnalysis {
    this.log('info', 'Generating minimal safe analysis');
    
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
      reasoning: 'Minimal analysis generated due to error conditions',
      performanceMetrics: {
        totalExecutionTime: 0,
        cacheHitRate: 0,
        memoryPeakUsage: 0
      }
    };
  }
} 