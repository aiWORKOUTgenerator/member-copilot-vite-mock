/**
 * AIContext Health Monitor - MANDATORY SAFETY MEASURE
 * 
 * Monitors AIContext health and provides real-time metrics for refactoring safety.
 * Tracks initialization success rates, service status transitions, and error patterns.
 * 
 * CRITICAL: This monitoring system must be active during AIContext refactoring.
 */

import { UserProfile } from '../../../types';
import { aiLogger } from '../logging/AILogger';

export interface AIContextHealthMetrics {
  // Service Status Metrics
  serviceStatus: 'initializing' | 'ready' | 'error' | 'degraded';
  lastStatusChange: Date;
  statusTransitionCount: number;
  uptime: number; // milliseconds
  
  // Initialization Metrics
  initializationAttempts: number;
  initializationSuccesses: number;
  initializationFailures: number;
  lastInitializationAttempt: Date;
  lastInitializationSuccess: Date;
  lastInitializationFailure: Date;
  
  // Error Metrics
  totalErrors: number;
  errorRate: number; // errors per minute
  lastError: Date;
  errorTypes: Map<string, number>;
  
  // Performance Metrics
  averageInitializationTime: number;
  averageResponseTime: number;
  memoryUsage: number;
  
  // Feature Flag Metrics
  featureFlagChecks: number;
  featureFlagSuccesses: number;
  featureFlagFailures: number;
  
  // Consumer Metrics
  activeConsumers: number;
  consumerErrors: number;
  
  // Environment Metrics
  environmentIssues: string[];
  environmentRecommendations: string[];
}

export interface AIContextHealthAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

export class AIContextMonitor {
  private metrics: AIContextHealthMetrics;
  private alerts: AIContextHealthAlert[] = [];
  private startTime: Date;
  private statusHistory: Array<{ status: string; timestamp: Date }> = [];
  private errorHistory: Array<{ error: string; timestamp: Date; type: string }> = [];
  private performanceHistory: Array<{ operation: string; duration: number; timestamp: Date }> = [];
  
  // Migration callbacks for Phase 4C
  private migrationCallbacks: {
    onSuccess?: () => void;
    onFailure?: (error: string) => void;
  } | null = null;
  
  // Alert thresholds
  private readonly ERROR_RATE_THRESHOLD = 0.1; // 10% error rate
  private readonly INITIALIZATION_FAILURE_THRESHOLD = 3; // 3 consecutive failures
  private readonly RESPONSE_TIME_THRESHOLD = 5000; // 5 seconds
  private readonly MEMORY_USAGE_THRESHOLD = 100 * 1024 * 1024; // 100MB

  constructor() {
    this.startTime = new Date();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): AIContextHealthMetrics {
    return {
      serviceStatus: 'initializing',
      lastStatusChange: new Date(),
      statusTransitionCount: 0,
      uptime: 0,
      
      initializationAttempts: 0,
      initializationSuccesses: 0,
      initializationFailures: 0,
      lastInitializationAttempt: new Date(),
      lastInitializationSuccess: new Date(),
      lastInitializationFailure: new Date(),
      
      totalErrors: 0,
      errorRate: 0,
      lastError: new Date(),
      errorTypes: new Map(),
      
      averageInitializationTime: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      
      featureFlagChecks: 0,
      featureFlagSuccesses: 0,
      featureFlagFailures: 0,
      
      activeConsumers: 0,
      consumerErrors: 0,
      
      environmentIssues: [],
      environmentRecommendations: []
    };
  }

  // Service Status Monitoring
  public recordStatusChange(newStatus: AIContextHealthMetrics['serviceStatus']): void {
    const oldStatus = this.metrics.serviceStatus;
    this.metrics.serviceStatus = newStatus;
    this.metrics.lastStatusChange = new Date();
    this.metrics.statusTransitionCount++;
    
    this.statusHistory.push({ status: newStatus, timestamp: new Date() });
    
    // Keep only last 100 status changes
    if (this.statusHistory.length > 100) {
      this.statusHistory.shift();
    }
    
    // Update uptime
    this.metrics.uptime = Date.now() - this.startTime.getTime();
    
    // Generate alert for status changes
    if (oldStatus !== newStatus) {
      this.generateAlert({
        type: newStatus === 'error' ? 'error' : 'info',
        message: `Service status changed from ${oldStatus} to ${newStatus}`,
        severity: newStatus === 'error' ? 'high' : 'low',
        context: { oldStatus, newStatus }
      });
    }
  }

  // Initialization Monitoring
  public recordInitializationAttempt(userProfile: UserProfile): { success: () => void; failure: (error: Error) => void; } {
    this.metrics.initializationAttempts++;
    this.metrics.lastInitializationAttempt = new Date();
    
    const startTime = Date.now();
    
    return {
      success: () => {
        const duration = Date.now() - startTime;
        this.metrics.initializationSuccesses++;
        this.metrics.lastInitializationSuccess = new Date();
        this.metrics.averageInitializationTime = 
          (this.metrics.averageInitializationTime * (this.metrics.initializationSuccesses - 1) + duration) / 
          this.metrics.initializationSuccesses;
        
        this.performanceHistory.push({
          operation: 'initialization',
          duration,
          timestamp: new Date()
        });
        
        this.generateAlert({
          type: 'info',
          message: 'AIContext initialization successful',
          severity: 'low',
          context: { duration, userProfile: { fitnessLevel: userProfile.fitnessLevel } }
        });
      },
      failure: (error: Error) => {
        const duration = Date.now() - startTime;
        this.metrics.initializationFailures++;
        this.metrics.lastInitializationFailure = new Date();
        
        this.recordError('initialization', error);
        
        // Check for consecutive failures
        if (this.metrics.initializationFailures >= this.INITIALIZATION_FAILURE_THRESHOLD) {
          this.generateAlert({
            type: 'error',
            message: `Multiple initialization failures (${this.metrics.initializationFailures})`,
            severity: 'critical',
            context: { error: error.message, consecutiveFailures: this.metrics.initializationFailures }
          });
        }
      }
    };
  }

  // Error Monitoring
  public recordError(type: string, error: Error): void {
    this.metrics.totalErrors++;
    this.metrics.lastError = new Date();
    
    const errorCount = this.metrics.errorTypes.get(type) || 0;
    this.metrics.errorTypes.set(type, errorCount + 1);
    
    this.errorHistory.push({
      error: error.message,
      timestamp: new Date(),
      type
    });
    
    // Keep only last 100 errors
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift();
    }
    
    // Calculate error rate (errors per minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentErrors = this.errorHistory.filter(e => e.timestamp.getTime() > oneMinuteAgo).length;
    this.metrics.errorRate = recentErrors;
    
    // Generate alert for high error rate
    if (this.metrics.errorRate > this.ERROR_RATE_THRESHOLD) {
      this.generateAlert({
        type: 'error',
        message: `High error rate detected: ${this.metrics.errorRate} errors/minute`,
        severity: 'high',
        context: { errorRate: this.metrics.errorRate, threshold: this.ERROR_RATE_THRESHOLD }
      });
    }
    
    this.generateAlert({
      type: 'error',
      message: `Error recorded: ${error.message}`,
      severity: 'medium',
      context: { type, error: error.message }
    });
  }

  // Performance Monitoring
  public recordPerformance(operation: string, duration: number): void {
    this.performanceHistory.push({
      operation,
      duration,
      timestamp: new Date()
    });
    
    // Keep only last 1000 performance records
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }
    
    // Update average response time
    const recentOperations = this.performanceHistory.filter(p => 
      p.timestamp.getTime() > Date.now() - 60000 // Last minute
    );
    
    if (recentOperations.length > 0) {
      this.metrics.averageResponseTime = 
        recentOperations.reduce((sum, op) => sum + op.duration, 0) / recentOperations.length;
    }
    
    // Alert for slow operations
    if (duration > this.RESPONSE_TIME_THRESHOLD) {
      this.generateAlert({
        type: 'warning',
        message: `Slow operation detected: ${operation} took ${duration}ms`,
        severity: 'medium',
        context: { operation, duration, threshold: this.RESPONSE_TIME_THRESHOLD }
      });
    }
  }

  // Feature Flag Monitoring
  public recordFeatureFlagCheck(flag: string, success: boolean): void {
    this.metrics.featureFlagChecks++;
    
    if (success) {
      this.metrics.featureFlagSuccesses++;
    } else {
      this.metrics.featureFlagFailures++;
      
      this.generateAlert({
        type: 'warning',
        message: `Feature flag check failed: ${flag}`,
        severity: 'low',
        context: { flag }
      });
    }
  }

  // Consumer Monitoring
  public recordConsumerActivity(active: boolean, error?: Error): void {
    if (active) {
      this.metrics.activeConsumers++;
    } else {
      this.metrics.activeConsumers = Math.max(0, this.metrics.activeConsumers - 1);
    }
    
    if (error) {
      this.metrics.consumerErrors++;
      this.recordError('consumer', error);
    }
  }

  // Environment Monitoring
  public updateEnvironmentStatus(issues: string[], recommendations: string[]): void {
    this.metrics.environmentIssues = issues;
    this.metrics.environmentRecommendations = recommendations;
    
    if (issues.length > 0) {
      this.generateAlert({
        type: 'warning',
        message: `Environment issues detected: ${issues.length} issues`,
        severity: 'medium',
        context: { issues }
      });
    }
  }

  // Memory Usage Monitoring
  public updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
    
    if (usage > this.MEMORY_USAGE_THRESHOLD) {
      this.generateAlert({
        type: 'warning',
        message: `High memory usage: ${Math.round(usage / 1024 / 1024)}MB`,
        severity: 'medium',
        context: { usage, threshold: this.MEMORY_USAGE_THRESHOLD }
      });
    }
  }

  // Alert Generation
  private generateAlert(alert: Omit<AIContextHealthAlert, 'id' | 'timestamp'>): void {
    const newAlert: AIContextHealthAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.alerts.push(newAlert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // Log critical alerts
    if (newAlert.severity === 'critical') {
      aiLogger.error({
        error: new Error(newAlert.message),
        context: 'health_alert',
        component: 'AIContextMonitor',
        severity: 'critical',
        userImpact: true
      });
    } else if (newAlert.severity === 'high') {
      aiLogger.warn(`High severity AIContext alert: ${newAlert.message}`, {
        context: newAlert.context,
        severity: 'high'
      });
    }
  }

  // Metrics Retrieval
  public getMetrics(): AIContextHealthMetrics {
    return { ...this.metrics };
  }

  public getAlerts(): AIContextHealthAlert[] {
    return [...this.alerts];
  }

  public getStatusHistory(): Array<{ status: string; timestamp: Date }> {
    return [...this.statusHistory];
  }

  public getErrorHistory(): Array<{ error: string; timestamp: Date; type: string }> {
    return [...this.errorHistory];
  }

  public getPerformanceHistory(): Array<{ operation: string; duration: number; timestamp: Date }> {
    return [...this.performanceHistory];
  }

  // Health Check
  public isHealthy(): boolean {
    return (
      this.metrics.serviceStatus === 'ready' &&
      this.metrics.errorRate < this.ERROR_RATE_THRESHOLD &&
      this.metrics.initializationFailures < this.INITIALIZATION_FAILURE_THRESHOLD &&
      this.metrics.averageResponseTime < this.RESPONSE_TIME_THRESHOLD &&
      this.metrics.memoryUsage < this.MEMORY_USAGE_THRESHOLD
    );
  }

  // Reset Metrics (for testing)
  public reset(): void {
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.statusHistory = [];
    this.errorHistory = [];
    this.performanceHistory = [];
    this.startTime = new Date();
  }

  // Migration Callbacks for Phase 4C
  public registerMigrationCallback(callbacks: {
    onSuccess?: () => void;
    onFailure?: (error: string) => void;
  }): void {
    this.migrationCallbacks = callbacks;
    aiLogger.info('🔄 AIContextMonitor - Migration callbacks registered');
  }

  public unregisterMigrationCallback(): void {
    this.migrationCallbacks = null;
    aiLogger.info('🔄 AIContextMonitor - Migration callbacks unregistered');
  }

  public triggerMigrationSuccess(): void {
    if (this.migrationCallbacks?.onSuccess) {
      this.migrationCallbacks.onSuccess();
    }
  }

  public triggerMigrationFailure(error: string): void {
    if (this.migrationCallbacks?.onFailure) {
      this.migrationCallbacks.onFailure(error);
    }
  }

  // Provider Composition Monitoring
  public recordProviderComposition(data: {
    providers: string[];
    timestamp: Date;
    initializationTime: number;
  }): void {
    this.performanceHistory.push({
      operation: 'provider_composition',
      duration: data.initializationTime,
      timestamp: data.timestamp
    });

    // Generate alert for slow composition
    if (data.initializationTime > this.RESPONSE_TIME_THRESHOLD) {
      this.generateAlert({
        type: 'warning',
        message: `Slow provider composition: ${data.initializationTime}ms`,
        severity: 'medium',
        context: { 
          providers: data.providers,
          initializationTime: data.initializationTime,
          threshold: this.RESPONSE_TIME_THRESHOLD
        }
      });
    }

    aiLogger.info('AIComposedProvider: Provider composition recorded', {
      providers: data.providers,
      initializationTime: data.initializationTime
    });
  }

  public recordCompositionHealth(): void {
    const compositionHealth = {
      isHealthy: this.isHealthy(),
      activeProviders: this.metrics.activeConsumers,
      errorRate: this.metrics.errorRate,
      averageResponseTime: this.metrics.averageResponseTime,
      memoryUsage: this.metrics.memoryUsage,
      timestamp: new Date()
    };

    // Generate alert for unhealthy composition
    if (!compositionHealth.isHealthy) {
      this.generateAlert({
        type: 'warning',
        message: 'Provider composition health check failed',
        severity: 'high',
        context: compositionHealth
      });
    }

    if (process.env.NODE_ENV === 'development') {
      aiLogger.debug('AIComposedProvider: Health check recorded', compositionHealth);
    }
  }

  // Export for debugging
  public exportDebugInfo(): any {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      statusHistory: this.getStatusHistory(),
      errorHistory: this.getErrorHistory(),
      performanceHistory: this.getPerformanceHistory(),
      isHealthy: this.isHealthy(),
      uptime: this.metrics.uptime,
      startTime: this.startTime
    };
  }
}

// Global monitor instance
export const aiContextMonitor = new AIContextMonitor();

// Export for use in AIContext
export default aiContextMonitor; 