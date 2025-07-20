// AI Error Handler - Provides graceful error handling and fallback mechanisms
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { GlobalAIContext, UnifiedAIAnalysis } from '../core/AIService';

export interface AIErrorConfig {
  enableReporting: boolean;
  fallbackToLegacy: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface AIError {
  id: string;
  timestamp: Date;
  type: 'analysis_failure' | 'validation_error' | 'context_error' | 'performance_error' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context?: any;
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
  handleError(error: Error, component: string, context?: any): void {
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
      errorRate: recentErrors.length / 60 // errors per minute
    };
  }
  
  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    const stats = this.getErrorStats();
    
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
    if (this.errorLog.length === 0) {
      return undefined;
    }
    
    const lastError = this.errorLog[this.errorLog.length - 1];
    return {
      message: lastError.message,
      timestamp: lastError.timestamp,
      component: lastError.component || 'unknown'
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
  }
  
  /**
   * Classify error type and severity
   */
  private classifyError(error: Error, component: string, context?: any): AIError {
    const aiError: AIError = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: 'unknown',
      severity: 'medium',
      message: error.message,
      stack: error.stack,
      context,
      component,
      userId: context?.userProfile?.id
    };
    
    // Classify by message content
    if (error.message.includes('validation')) {
      aiError.type = 'validation_error';
      aiError.severity = 'high';
    } else if (error.message.includes('context') || error.message.includes('profile')) {
      aiError.type = 'context_error';
      aiError.severity = 'medium';
    } else if (error.message.includes('performance') || error.message.includes('timeout')) {
      aiError.type = 'performance_error';
      aiError.severity = 'medium';
    } else if (error.message.includes('analysis') || error.message.includes('recommendation')) {
      aiError.type = 'analysis_failure';
      aiError.severity = 'high';
    }
    
    // Classify by component
    if (component === 'analysis' || component === 'recommendation') {
      aiError.type = 'analysis_failure';
      aiError.severity = 'high';
    } else if (component === 'validation') {
      aiError.type = 'validation_error';
      aiError.severity = 'high';
    } else if (component === 'context') {
      aiError.type = 'context_error';
      aiError.severity = 'medium';
    }
    
    // Critical errors
    if (error.message.includes('critical') || 
        error.message.includes('fatal') ||
        error.name === 'ReferenceError' ||
        error.name === 'TypeError') {
      aiError.severity = 'critical';
    }
    
    return aiError;
  }
  
  /**
   * Log error with appropriate level
   */
  private logError(error: AIError): void {
    this.errorLog.push(error);
    
    // Limit log size
    if (this.errorLog.length > 1000) {
      this.errorLog.shift();
    }
    
    // Log to console based on severity
    const logMessage = `[AI Error] ${error.type}: ${error.message}`;
    
    switch (error.severity) {
      case 'critical':
        console.error(logMessage, error);
        break;
      case 'high':
        console.error(logMessage, error);
        break;
      case 'medium':
        console.warn(logMessage, error);
        break;
      case 'low':
        console.info(logMessage, error);
        break;
    }
  }
  
  /**
   * Report error to external systems
   */
  private reportError(error: AIError): void {
    if (!this.config.enableReporting) return;
    
    // In a real implementation, this would send to error tracking service
    // For now, we'll just log it
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('Reporting error to external system:', {
        id: error.id,
        type: error.type,
        severity: error.severity,
        message: error.message,
        component: error.component,
        userId: error.userId,
        timestamp: error.timestamp
      });
    }
  }
  
  /**
   * Update error counts for pattern detection
   */
  private updateErrorCounts(error: AIError): void {
    const key = `${error.type}:${error.component}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.lastErrorTime.set(key, error.timestamp);
  }
  
  /**
   * Check for error patterns
   */
  private checkErrorPatterns(error: AIError): void {
    const key = `${error.type}:${error.component}`;
    const count = this.errorCounts.get(key) || 0;
    const lastTime = this.lastErrorTime.get(key);
    
    // Check for burst of errors
    if (count > 5 && lastTime) {
      const timeDiff = error.timestamp.getTime() - lastTime.getTime();
      if (timeDiff < 60000) { // 1 minute
        console.warn(`Error pattern detected: ${count} ${error.type} errors in ${error.component} within 1 minute`);
        
        // Could implement circuit breaker here
        this.handleErrorPattern(error, count);
      }
    }
  }
  
  /**
   * Handle detected error patterns
   */
  private handleErrorPattern(error: AIError, count: number): void {
    // Implement circuit breaker or rate limiting
    console.warn(`Implementing circuit breaker for ${error.component} due to ${count} errors`);
    
    // In a real implementation, this would:
    // 1. Enable circuit breaker
    // 2. Increase retry delays
    // 3. Switch to degraded mode
    // 4. Alert operations team
  }
  
  /**
   * Check if there's an error pattern
   */
  private hasErrorPattern(): boolean {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentErrors = this.errorLog.filter(error => error.timestamp > fiveMinutesAgo);
    
    // Check for high error rate
    if (recentErrors.length > 10) {
      return true;
    }
    
    // Check for repeated errors
    const errorTypes = new Map<string, number>();
    recentErrors.forEach(error => {
      const key = `${error.type}:${error.component}`;
      errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
    });
    
    // If any error type appears more than 3 times in 5 minutes
    return Array.from(errorTypes.values()).some(count => count > 3);
  }
  
  /**
   * Fallback to legacy implementation
   */
  private async fallbackToLegacyAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext,
    legacyImplementations: any
  ): Promise<UnifiedAIAnalysis> {
    console.warn('Falling back to legacy AI implementation');
    
    try {
      // Use legacy recommendation engine
      const legacyRecommendations = legacyImplementations.recommendations.implementation(
        selections,
        context.userProfile
      );
      
      // Convert to new format
      const recommendations = this.convertLegacyRecommendations(legacyRecommendations);
      
      // Use legacy insights where available
      const insights = {
        energy: selections.customization_energy ? 
          legacyImplementations.energy.implementation(selections.customization_energy) : [],
        soreness: selections.customization_soreness ? 
          legacyImplementations.soreness.implementation(selections.customization_soreness) : [],
        focus: [],
        duration: [],
        equipment: []
      };
      
      return {
        id: this.generateErrorId(),
        timestamp: new Date(),
        insights,
        crossComponentConflicts: [],
        recommendations,
        confidence: 0.7, // Lower confidence for fallback
        reasoning: 'Analysis generated using legacy fallback implementation',
        performanceMetrics: {
          totalExecutionTime: 0,
          cacheHitRate: 0,
          memoryPeakUsage: 0
        }
      };
      
    } catch (fallbackError) {
      throw new Error(`Fallback analysis failed: ${fallbackError}`);
    }
  }
  
  /**
   * Generate minimal safe analysis
   */
  private generateMinimalAnalysis(
    selections: PerWorkoutOptions,
    context: GlobalAIContext
  ): UnifiedAIAnalysis {
    return {
      id: this.generateErrorId(),
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
      confidence: 0.5,
      reasoning: 'Minimal analysis due to AI service error',
      performanceMetrics: {
        totalExecutionTime: 0,
        cacheHitRate: 0,
        memoryPeakUsage: 0
      }
    };
  }
  
  /**
   * Convert legacy recommendations to new format
   */
  private convertLegacyRecommendations(legacyRecommendations: any): any[] {
    const recommendations: any[] = [];
    
    if (legacyRecommendations.immediate) {
      legacyRecommendations.immediate.forEach((rec: string, index: number) => {
        recommendations.push({
          id: `legacy_immediate_${index}`,
          priority: 'high',
          category: 'optimization',
          targetComponent: 'general',
          title: rec,
          description: rec,
          reasoning: 'Legacy immediate recommendation',
          confidence: 0.8,
          risk: 'medium'
        });
      });
    }
    
    if (legacyRecommendations.contextual) {
      legacyRecommendations.contextual.forEach((rec: string, index: number) => {
        recommendations.push({
          id: `legacy_contextual_${index}`,
          priority: 'medium',
          category: 'optimization',
          targetComponent: 'general',
          title: rec,
          description: rec,
          reasoning: 'Legacy contextual recommendation',
          confidence: 0.7,
          risk: 'low'
        });
      });
    }
    
    return recommendations;
  }
  
  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 