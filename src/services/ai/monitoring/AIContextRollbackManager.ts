/**
 * AIContext Automated Rollback Manager - MANDATORY SAFETY MEASURE
 * 
 * Monitors error rates, performance degradation, and user experience metrics
 * to automatically rollback AIContext changes if thresholds are exceeded.
 * 
 * CRITICAL: This system must be active during AIContext refactoring.
 */

import { aiContextMonitor } from './AIContextMonitor';
import { refactoringFeatureFlags } from '../featureFlags/RefactoringFeatureFlags';

export interface RollbackThresholds {
  // Error Rate Thresholds
  maxErrorRate: number; // errors per minute
  maxConsecutiveErrors: number;
  maxInitializationFailures: number;
  
  // Performance Thresholds
  maxResponseTime: number; // milliseconds
  maxMemoryUsage: number; // bytes
  maxInitializationTime: number; // milliseconds
  
  // User Experience Thresholds
  maxConsumerErrors: number;
  maxFeatureFlagFailures: number;
  maxServiceUnavailableTime: number; // milliseconds
  
  // Time-based Thresholds
  maxUnhealthyDuration: number; // milliseconds
  maxRollbackCooldown: number; // milliseconds
}

export interface RollbackTrigger {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  threshold: any;
  currentValue: any;
  shouldRollback: boolean;
}

export const DEFAULT_ROLLBACK_THRESHOLDS: RollbackThresholds = {
  // Error Rate Thresholds
  maxErrorRate: 5, // 5 errors per minute
  maxConsecutiveErrors: 10,
  maxInitializationFailures: 3,
  
  // Performance Thresholds
  maxResponseTime: 5000, // 5 seconds
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxInitializationTime: 10000, // 10 seconds
  
  // User Experience Thresholds
  maxConsumerErrors: 5,
  maxFeatureFlagFailures: 10,
  maxServiceUnavailableTime: 30000, // 30 seconds
  
  // Time-based Thresholds
  maxUnhealthyDuration: 60000, // 1 minute
  maxRollbackCooldown: 300000 // 5 minutes
};

export class AIContextRollbackManager {
  private thresholds: RollbackThresholds;
  private triggers: Map<string, RollbackTrigger> = new Map();
  private lastRollbackTime?: Date;
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(thresholds: Partial<RollbackThresholds> = {}) {
    this.thresholds = { ...DEFAULT_ROLLBACK_THRESHOLDS, ...thresholds };
    this.initializeTriggers();
  }

  private initializeTriggers(): void {
    // Error Rate Triggers
    this.addTrigger({
      id: 'error_rate_threshold',
      name: 'Error Rate Threshold',
      description: 'Rollback if error rate exceeds threshold',
      severity: 'high',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxErrorRate,
      currentValue: 0,
      shouldRollback: false
    });

    this.addTrigger({
      id: 'consecutive_errors',
      name: 'Consecutive Errors',
      description: 'Rollback if too many consecutive errors occur',
      severity: 'critical',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxConsecutiveErrors,
      currentValue: 0,
      shouldRollback: false
    });

    this.addTrigger({
      id: 'initialization_failures',
      name: 'Initialization Failures',
      description: 'Rollback if initialization failures exceed threshold',
      severity: 'critical',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxInitializationFailures,
      currentValue: 0,
      shouldRollback: false
    });

    // Performance Triggers
    this.addTrigger({
      id: 'response_time_threshold',
      name: 'Response Time Threshold',
      description: 'Rollback if average response time exceeds threshold',
      severity: 'medium',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxResponseTime,
      currentValue: 0,
      shouldRollback: false
    });

    this.addTrigger({
      id: 'memory_usage_threshold',
      name: 'Memory Usage Threshold',
      description: 'Rollback if memory usage exceeds threshold',
      severity: 'medium',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxMemoryUsage,
      currentValue: 0,
      shouldRollback: false
    });

    this.addTrigger({
      id: 'initialization_time_threshold',
      name: 'Initialization Time Threshold',
      description: 'Rollback if initialization time exceeds threshold',
      severity: 'high',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxInitializationTime,
      currentValue: 0,
      shouldRollback: false
    });

    // User Experience Triggers
    this.addTrigger({
      id: 'consumer_errors_threshold',
      name: 'Consumer Errors Threshold',
      description: 'Rollback if consumer errors exceed threshold',
      severity: 'high',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxConsumerErrors,
      currentValue: 0,
      shouldRollback: false
    });

    this.addTrigger({
      id: 'feature_flag_failures',
      name: 'Feature Flag Failures',
      description: 'Rollback if feature flag failures exceed threshold',
      severity: 'medium',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxFeatureFlagFailures,
      currentValue: 0,
      shouldRollback: false
    });

    // Service Health Triggers
    this.addTrigger({
      id: 'service_unhealthy_duration',
      name: 'Service Unhealthy Duration',
      description: 'Rollback if service remains unhealthy for too long',
      severity: 'critical',
      isActive: true,
      triggerCount: 0,
      threshold: this.thresholds.maxUnhealthyDuration,
      currentValue: 0,
      shouldRollback: false
    });
  }

  private addTrigger(trigger: RollbackTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  // Start monitoring
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkTriggers();
    }, 5000); // Check every 5 seconds

    console.log('🔄 AIContext Rollback Manager: Monitoring started');
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('🔄 AIContext Rollback Manager: Monitoring stopped');
  }

  // Check all triggers
  private checkTriggers(): void {
    if (!refactoringFeatureFlags.getFlag('aicontext_refactoring_enabled')) {
      return; // Don't check if refactoring is not enabled
    }

    const metrics = aiContextMonitor.getMetrics();
    let shouldRollback = false;
    let triggeredReasons: string[] = [];

    // Update trigger values and check thresholds
    this.triggers.forEach((trigger, id) => {
      switch (id) {
        case 'error_rate_threshold':
          trigger.currentValue = metrics.errorRate;
          trigger.shouldRollback = metrics.errorRate > this.thresholds.maxErrorRate;
          break;

        case 'consecutive_errors':
          trigger.currentValue = metrics.totalErrors;
          trigger.shouldRollback = metrics.totalErrors > this.thresholds.maxConsecutiveErrors;
          break;

        case 'initialization_failures':
          trigger.currentValue = metrics.initializationFailures;
          trigger.shouldRollback = metrics.initializationFailures > this.thresholds.maxInitializationFailures;
          break;

        case 'response_time_threshold':
          trigger.currentValue = metrics.averageResponseTime;
          trigger.shouldRollback = metrics.averageResponseTime > this.thresholds.maxResponseTime;
          break;

        case 'memory_usage_threshold':
          trigger.currentValue = metrics.memoryUsage;
          trigger.shouldRollback = metrics.memoryUsage > this.thresholds.maxMemoryUsage;
          break;

        case 'initialization_time_threshold':
          trigger.currentValue = metrics.averageInitializationTime;
          trigger.shouldRollback = metrics.averageInitializationTime > this.thresholds.maxInitializationTime;
          break;

        case 'consumer_errors_threshold':
          trigger.currentValue = metrics.consumerErrors;
          trigger.shouldRollback = metrics.consumerErrors > this.thresholds.maxConsumerErrors;
          break;

        case 'feature_flag_failures':
          trigger.currentValue = metrics.featureFlagFailures;
          trigger.shouldRollback = metrics.featureFlagFailures > this.thresholds.maxFeatureFlagFailures;
          break;

        case 'service_unhealthy_duration':
          const unhealthyDuration = metrics.serviceStatus !== 'ready' ? 
            Date.now() - metrics.lastStatusChange.getTime() : 0;
          trigger.currentValue = unhealthyDuration;
          trigger.shouldRollback = unhealthyDuration > this.thresholds.maxUnhealthyDuration;
          break;
      }

      if (trigger.shouldRollback && trigger.isActive) {
        shouldRollback = true;
        triggeredReasons.push(`${trigger.name}: ${trigger.currentValue} > ${trigger.threshold}`);
        
        // Update trigger stats
        trigger.lastTriggered = new Date();
        trigger.triggerCount++;
      }
    });

    // Check rollback cooldown
    if (this.lastRollbackTime) {
      const timeSinceLastRollback = Date.now() - this.lastRollbackTime.getTime();
      if (timeSinceLastRollback < this.thresholds.maxRollbackCooldown) {
        console.log(`🔄 AIContext Rollback Manager: Cooldown active (${Math.round(timeSinceLastRollback / 1000)}s remaining)`);
        return;
      }
    }

    // Execute rollback if needed
    if (shouldRollback) {
      this.executeRollback(triggeredReasons);
    }
  }

  // Execute rollback
  private executeRollback(reasons: string[]): void {
    console.error('🚨 AIContext Automated Rollback Executed!');
    console.error('Reasons:', reasons);
    
    this.lastRollbackTime = new Date();
    
    // Trigger rollback through feature flags
    refactoringFeatureFlags.triggerRollback('automated_threshold_exceeded');
    
    // Log rollback event
    aiContextMonitor.recordError('automated_rollback', new Error(`Automated rollback triggered: ${reasons.join(', ')}`));
    
    // Notify stakeholders (in production, this would send alerts)
    this.notifyStakeholders(reasons);
  }

  // Notify stakeholders
  private notifyStakeholders(reasons: string[]): void {
    const message = `🚨 AIContext Automated Rollback Executed\n\nReasons:\n${reasons.map(r => `• ${r}`).join('\n')}\n\nTime: ${new Date().toISOString()}`;
    
    // In production, this would send to Slack, email, etc.
    console.error(message);
    
    // Could also send to monitoring services
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'aicontext_rollback', {
        event_category: 'safety',
        event_label: reasons.join('|'),
        value: reasons.length
      });
    }
  }

  // Manual rollback trigger
  public triggerManualRollback(reason: string): void {
    console.warn(`🚨 AIContext Manual Rollback Triggered: ${reason}`);
    this.executeRollback([`Manual rollback: ${reason}`]);
  }

  // Get trigger status
  public getTriggerStatus(): RollbackTrigger[] {
    return Array.from(this.triggers.values());
  }

  // Update thresholds
  public updateThresholds(newThresholds: Partial<RollbackThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    
    // Update trigger thresholds
    this.triggers.forEach((trigger, id) => {
      switch (id) {
        case 'error_rate_threshold':
          trigger.threshold = this.thresholds.maxErrorRate;
          break;
        case 'consecutive_errors':
          trigger.threshold = this.thresholds.maxConsecutiveErrors;
          break;
        case 'initialization_failures':
          trigger.threshold = this.thresholds.maxInitializationFailures;
          break;
        case 'response_time_threshold':
          trigger.threshold = this.thresholds.maxResponseTime;
          break;
        case 'memory_usage_threshold':
          trigger.threshold = this.thresholds.maxMemoryUsage;
          break;
        case 'initialization_time_threshold':
          trigger.threshold = this.thresholds.maxInitializationTime;
          break;
        case 'consumer_errors_threshold':
          trigger.threshold = this.thresholds.maxConsumerErrors;
          break;
        case 'feature_flag_failures':
          trigger.threshold = this.thresholds.maxFeatureFlagFailures;
          break;
        case 'service_unhealthy_duration':
          trigger.threshold = this.thresholds.maxUnhealthyDuration;
          break;
      }
    });
    
    console.log('🔄 AIContext Rollback Manager: Thresholds updated', newThresholds);
  }

  // Enable/disable specific triggers
  public setTriggerActive(triggerId: string, isActive: boolean): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.isActive = isActive;
      console.log(`🔄 AIContext Rollback Manager: Trigger ${triggerId} ${isActive ? 'enabled' : 'disabled'}`);
    }
  }

  // Get rollback history
  public getRollbackHistory(): Array<{ timestamp: Date; reasons: string[] }> {
    // This would typically be stored in a database
    // For now, return the last rollback info
    if (this.lastRollbackTime) {
      return [{
        timestamp: this.lastRollbackTime,
        reasons: ['Last automated rollback']
      }];
    }
    return [];
  }

  // Export for debugging
  public exportDebugInfo(): any {
    return {
      thresholds: this.thresholds,
      triggers: this.getTriggerStatus(),
      isMonitoring: this.isMonitoring,
      lastRollbackTime: this.lastRollbackTime,
      rollbackHistory: this.getRollbackHistory(),
      metrics: aiContextMonitor.getMetrics()
    };
  }

  // Reset to defaults
  public reset(): void {
    this.thresholds = { ...DEFAULT_ROLLBACK_THRESHOLDS };
    this.triggers.clear();
    this.initializeTriggers();
    this.lastRollbackTime = undefined;
    this.stopMonitoring();
  }
}

// Global rollback manager instance
export const aiContextRollbackManager = new AIContextRollbackManager();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  aiContextRollbackManager.startMonitoring();
}

// Export for use in AIContext
export default aiContextRollbackManager; 