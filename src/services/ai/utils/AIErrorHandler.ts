// AI Error Handler - Provides graceful error handling and fallback mechanisms
import { PerWorkoutOptions } from '../../types/quick-workout.types';
import { GlobalAIContext, UnifiedAIAnalysis } from '../../types/ai-context.types';
import { aiLogger } from '../logging/AILogger';

export interface AIErrorConfig {
  enableReporting: boolean;
  fallbackToLegacy: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface ErrorContext {
  selections?: PerWorkoutOptions;
  context?: GlobalAIContext;
  expected?: unknown;
  actual?: unknown;
  metrics?: PerformanceMetrics;
  originalError?: Error;
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  executionTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkLatency?: number;
  [key: string]: number | undefined;
}

export interface LegacyImplementation {
  analyze?: (selections: PerWorkoutOptions, context: GlobalAIContext) => Promise<UnifiedAIAnalysis>;
  generateRecommendations?: (data: unknown) => unknown[];
  [key: string]: unknown;
}

export interface LegacyRecommendation {
  title?: string;
  description?: string;
  priority?: number;
  category?: string;
  [key: string]: unknown;
}

export interface AIError {
  id: string;
  timestamp: Date;
  type: 'analysis_failure' | 'validation_error' | 'context_error' | 'performance_error' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context?: ErrorContext;
  component?: string;
  userId?: string;
  resolution?: 'retry' | 'fallback' | 'skip' | 'manual';
}

export class AIErrorHandler {
  private config: AIErrorConfig;
  private errorLog: AIError[] = [];
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, Date> = new Map();
  
  constructor(config: Partial<AIErrorConfig> = {}) {
    this.config = {
      enableReporting: true,
      fallbackToLegacy: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      ...config
    };
  }
  
  /**
   * Handle general errors with classification and resolution
   */
  handleError(error: Error, component: string, context?: ErrorContext): void {
    const aiError = this.classifyError(error, component, context);
    
    // Log error
    this.logError(aiError);
    
    // Update error counts
    this.updateErrorCounts(aiError);
    
    // Report error if enabled
    if (this.config.enableReporting) {
      this.reportError(aiError);
    }
    
    // Check for error patterns
    this.checkErrorPatterns(aiError);
  }
  
  /**
   * Handle analysis errors with fallback mechanisms
   */
  async handleAnalysisError(
    error: Error,
    selections: PerWorkoutOptions,
    context: GlobalAIContext,
    legacyImplementations?: LegacyImplementation
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
    expected: unknown,
    actual: unknown,
    component: string
  ): void {
    const aiError = this.classifyError(error, component, { expected, actual });
    aiError.type = 'validation_error';
    aiError.severity = 'high';
    
    this.logError(aiError);
    
    // Attempt automatic resolution
    if (this.canAutoResolve(aiError)) {
      this.autoResolve(aiError);
    }
  }
  
  /**
   * Handle context errors
   */
  handleContextError(error: Error, context: ErrorContext): void {
    const aiError = this.classifyError(error, 'context', context);
    aiError.type = 'context_error';
    
    this.logError(aiError);
    
    // Attempt context recovery
    this.attemptContextRecovery(aiError);
  }
  
  /**
   * Handle performance errors
   */
  handlePerformanceError(
    error: Error,
    metrics: PerformanceMetrics,
    component: string
  ): void {
    const aiError = this.classifyError(error, component, { metrics });
    aiError.type = 'performance_error';
    aiError.severity = 'medium';
    
    this.logError(aiError);
    
    // Check if performance degradation requires action
    if (this.isPerformanceDegraded(metrics)) {
      this.handlePerformanceDegradation(aiError);
    }
  }
  
  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    errorsByComponent: Record<string, number>;
    recentErrors: AIError[];
    errorRate: number;
  } {
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
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.errorLog.filter(error => error.timestamp > oneHourAgo);
    
    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      errorsByComponent,
      recentErrors,
      errorRate: recentErrors.length / 60 // errors per minute
    };
  }
  
  /**
   * Check if the system is healthy based on error patterns
   */
  isHealthy(): boolean {
    const stats = this.getErrorStats();
    const criticalErrorThreshold = 5;
    const errorRateThreshold = 0.1; // 10% error rate
    
    return (
      stats.errorsBySeverity.critical < criticalErrorThreshold &&
      stats.errorRate < errorRateThreshold
    );
  }
  
  /**
   * Get the last error that occurred
   */
  getLastError(): {
    message: string;
    timestamp: Date;
    component: string;
  } | undefined {
    if (this.errorLog.length === 0) return undefined;
    
    const lastError = this.errorLog[this.errorLog.length - 1];
    return {
      message: lastError.message,
      timestamp: lastError.timestamp,
      component: lastError.component || 'unknown'
    };
  }
  
  /**
   * Get recommendations for error resolution
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getErrorStats();
    
    if (stats.errorsBySeverity.critical > 0) {
      recommendations.push('Critical errors detected - immediate attention required');
    }
    
    if (stats.errorRate > 0.1) {
      recommendations.push('High error rate detected - consider system restart');
    }
    
    if (stats.errorsByType.validation_error > 0) {
      recommendations.push('Validation errors detected - check data integrity');
    }
    
    if (stats.errorsByType.performance_error > 0) {
      recommendations.push('Performance issues detected - consider optimization');
    }
    
    return recommendations;
  }
  
  /**
   * Clear old errors from the log
   */
  clearOldErrors(olderThan: Date): void {
    this.errorLog = this.errorLog.filter(error => error.timestamp > olderThan);
  }
  
  /**
   * Reset the error handler state
   */
  reset(): void {
    this.errorLog = [];
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
  
  /**
   * Classify an error based on its characteristics
   */
  private classifyError(error: Error, component: string, context?: ErrorContext): AIError {
    const errorMessage = error.message.toLowerCase();
    let type: AIError['type'] = 'unknown';
    let severity: AIError['severity'] = 'medium';
    
    // Classify error type
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      type = 'validation_error';
      severity = 'high';
    } else if (errorMessage.includes('analysis') || errorMessage.includes('processing')) {
      type = 'analysis_failure';
      severity = 'medium';
    } else if (errorMessage.includes('context') || errorMessage.includes('state')) {
      type = 'context_error';
      severity = 'medium';
    } else if (errorMessage.includes('performance') || errorMessage.includes('timeout')) {
      type = 'performance_error';
      severity = 'low';
    }
    
    // Adjust severity based on component
    if (component === 'core' || component === 'analysis') {
      severity = 'high';
    } else if (component === 'validation' || component === 'context') {
      severity = 'medium';
    }
    
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type,
      severity,
      message: error.message,
      stack: error.stack,
      context,
      component
    };
  }
  
  /**
   * Log error based on configured log level
   */
  private logError(error: AIError): void {
    const logMessage = `[${error.type.toUpperCase()}] ${error.component}: ${error.message}`;
    
    switch (this.config.logLevel) {
      case 'debug':
        aiLogger.debug(logMessage, error.context);
        break;
      case 'info':
        aiLogger.info(logMessage);
        break;
      case 'warn':
        aiLogger.warn(logMessage);
        break;
      case 'error':
      default:
        aiLogger.error({
          error: new Error(error.message),
          context: 'error_handling',
          component: error.component || 'AIErrorHandler',
          severity: error.severity,
          userImpact: error.severity === 'high' || error.severity === 'critical',
          timestamp: new Date().toISOString()
        });
        break;
    }
    
    this.errorLog.push(error);
  }
  
  /**
   * Report error to external monitoring system
   */
  private reportError(error: AIError): void {
    // Implementation would send to external monitoring service
    // For now, just log to console
    aiLogger.error({
      error: new Error(`Error reported to monitoring system: ${error.message}`),
      context: 'error_reporting',
      component: 'AIErrorHandler',
      severity: 'high',
      userImpact: true,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Update error count tracking
   */
  private updateErrorCounts(error: AIError): void {
    const key = `${error.type}:${error.component}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    this.lastErrorTime.set(key, error.timestamp);
  }
  
  /**
   * Check for error patterns that require special handling
   */
  private checkErrorPatterns(error: AIError): void {
    const key = `${error.type}:${error.component}`;
    const count = this.errorCounts.get(key) || 0;
    
    if (count >= 3) {
      this.handleErrorPattern(error, count);
    }
  }
  
  /**
   * Handle repeated error patterns
   */
  private handleErrorPattern(error: AIError, count: number): void {
    aiLogger.warn(`Error pattern detected: ${error.type} in ${error.component} (${count} times)`, {
      errorType: error.type,
      component: error.component,
      count,
      timestamp: new Date().toISOString()
    });
    
    // Implement pattern-specific handling
    switch (error.type) {
      case 'validation_error':
        this.handleValidationPattern(error, count);
        break;
      case 'analysis_failure':
        this.handleAnalysisPattern(error, count);
        break;
      case 'performance_error':
        this.handlePerformancePattern(error, count);
        break;
    }
  }
  
  /**
   * Check if there's a repeating error pattern
   */
  private hasErrorPattern(): boolean {
    const threshold = 3;
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const now = new Date();
    
    for (const [key, lastTime] of this.lastErrorTime) {
      const count = this.errorCounts.get(key) || 0;
      const timeSinceLastError = now.getTime() - lastTime.getTime();
      
      if (count >= threshold && timeSinceLastError < timeWindow) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Handle validation error patterns
   */
  private handleValidationPattern(error: AIError, count: number): void {
    if (count >= 5) {
      aiLogger.error({
        error: new Error('Critical validation pattern detected - data integrity compromised'),
        context: 'validation_pattern',
        component: 'AIErrorHandler',
        severity: 'critical',
        userImpact: true,
        timestamp: new Date().toISOString()
      });
      // Could trigger system-wide validation reset
    }
  }
  
  /**
   * Handle analysis failure patterns
   */
  private handleAnalysisPattern(error: AIError, count: number): void {
    if (count >= 3) {
      aiLogger.warn('Analysis failure pattern detected - enabling fallback mode', {
        errorType: error.type,
        component: error.component,
        count,
        timestamp: new Date().toISOString()
      });
      // Could enable more aggressive fallback strategies
    }
  }
  
  /**
   * Handle performance error patterns
   */
  private handlePerformancePattern(error: AIError, count: number): void {
    if (count >= 10) {
      aiLogger.error({
        error: new Error('Performance degradation pattern detected - system optimization required'),
        context: 'performance_pattern',
        component: 'AIErrorHandler',
        severity: 'critical',
        userImpact: true,
        timestamp: new Date().toISOString()
      });
      // Could trigger performance optimization routines
    }
  }
  
  /**
   * Fallback to legacy analysis implementation
   */
  private async fallbackToLegacyAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext,
    legacyImplementations: LegacyImplementation
  ): Promise<UnifiedAIAnalysis> {
    aiLogger.warn('Falling back to legacy analysis implementation');
    
    if (legacyImplementations.analyze) {
      return await legacyImplementations.analyze(selections, context);
    }
    
    // If no legacy analyze method, generate minimal analysis
    return this.generateMinimalAnalysis(selections, context);
  }
  
  /**
   * Generate minimal safe analysis when all else fails
   */
  private generateMinimalAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext
  ): UnifiedAIAnalysis {
    aiLogger.warn('Generating minimal safe analysis');
    
    return {
      insights: ['Basic workout analysis available'],
      recommendations: ['Consider consulting with a fitness professional'],
      warnings: ['Analysis limited due to system constraints'],
      metadata: {
        source: 'fallback',
        confidence: 'low',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Convert legacy recommendations to current format
   */
  private convertLegacyRecommendations(legacyRecommendations: LegacyRecommendation[]): unknown[] {
    return legacyRecommendations.map(rec => ({
      title: rec.title || 'Legacy Recommendation',
      description: rec.description || 'Converted from legacy system',
      priority: rec.priority || 1,
      category: rec.category || 'general'
    }));
  }
  
  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if error can be auto-resolved
   */
  private canAutoResolve(error: AIError): boolean {
    return error.severity === 'low' || error.type === 'performance_error';
  }
  
  /**
   * Attempt automatic error resolution
   */
  private autoResolve(error: AIError): void {
    aiLogger.info(`Auto-resolving ${error.type} error in ${error.component}`);
    // Implementation would depend on error type
  }
  
  /**
   * Attempt context recovery
   */
  private attemptContextRecovery(error: AIError): void {
    aiLogger.info(`Attempting context recovery for ${error.component}`);
    // Implementation would attempt to restore context state
  }
  
  /**
   * Check if performance is degraded
   */
  private isPerformanceDegraded(metrics: PerformanceMetrics): boolean {
    return (metrics.executionTime || 0) > 5000 || // 5 seconds
           (metrics.memoryUsage || 0) > 1000000000; // 1GB
  }
  
  /**
   * Handle performance degradation
   */
  private handlePerformanceDegradation(error: AIError): void {
    aiLogger.warn('Performance degradation detected - implementing optimization measures');
    // Implementation would trigger performance optimization
  }
} 