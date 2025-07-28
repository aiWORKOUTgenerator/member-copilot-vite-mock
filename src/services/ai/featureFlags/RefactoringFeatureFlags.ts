/**
 * AIContext Refactoring Feature Flags - MANDATORY SAFETY MEASURE
 * 
 * Feature flags for safe AIContext refactoring rollout.
 * Enables gradual migration and instant rollback capabilities.
 * 
 * CRITICAL: These flags must be active during AIContext refactoring.
 */

import { aiLogger } from '../logging/AILogger';

export interface RefactoringFeatureFlags {
  // Core Refactoring Flags
  aicontext_refactoring_enabled: boolean;
  aicontext_new_implementation: boolean;
  aicontext_gradual_migration: boolean;
  aicontext_rollback_enabled: boolean;
  
  // Phase 4C Migration Flags
  migrateToComposedContext: boolean;
  migrateToComposedContextPercentage: number;
  migrateToComposedContextUserSegments: string[];
  
  // Component Migration Flags
  aicontext_migrate_core_context: boolean;
  aicontext_migrate_feature_flags: boolean;
  aicontext_migrate_service_methods: boolean;
  aicontext_migrate_development_tools: boolean;
  aicontext_migrate_environment_status: boolean;
  
  // Safety Flags
  aicontext_safety_monitoring: boolean;
  aicontext_health_dashboard: boolean;
  aicontext_automated_rollback: boolean;
  aicontext_error_threshold_rollback: boolean;
  
  // Testing Flags
  aicontext_test_mode: boolean;
  aicontext_mock_implementation: boolean;
  aicontext_performance_testing: boolean;
  
  // Rollout Strategy Flags
  aicontext_canary_deployment: boolean;
  aicontext_percentage_rollout: number; // 0-100
  aicontext_user_segments: string[];
  aicontext_time_based_rollout: boolean;
  
  // Monitoring Flags
  aicontext_metrics_collection: boolean;
  aicontext_alerting_enabled: boolean;
  aicontext_debug_logging: boolean;
}

export const DEFAULT_REFACTORING_FLAGS: RefactoringFeatureFlags = {
  // Core Refactoring Flags - START DISABLED
  aicontext_refactoring_enabled: false,
  aicontext_new_implementation: false,
  aicontext_gradual_migration: false,
  aicontext_rollback_enabled: true, // Always enabled for safety
  
  // Phase 4C Migration Flags - START DISABLED
  migrateToComposedContext: false,
  migrateToComposedContextPercentage: 0,
  migrateToComposedContextUserSegments: [],
  
  // Component Migration Flags - START DISABLED
  aicontext_migrate_core_context: false,
  aicontext_migrate_feature_flags: false,
  aicontext_migrate_service_methods: false,
  aicontext_migrate_development_tools: false,
  aicontext_migrate_environment_status: false,
  
  // Safety Flags - START ENABLED
  aicontext_safety_monitoring: true,
  aicontext_health_dashboard: true,
  aicontext_automated_rollback: true,
  aicontext_error_threshold_rollback: true,
  
  // Testing Flags - START DISABLED
  aicontext_test_mode: false,
  aicontext_mock_implementation: false,
  aicontext_performance_testing: false,
  
  // Rollout Strategy Flags - START DISABLED
  aicontext_canary_deployment: false,
  aicontext_percentage_rollout: 0,
  aicontext_user_segments: [],
  aicontext_time_based_rollout: false,
  
  // Monitoring Flags - START ENABLED
  aicontext_metrics_collection: true,
  aicontext_alerting_enabled: true,
  aicontext_debug_logging: true
};

export class RefactoringFeatureFlagManager {
  private flags: RefactoringFeatureFlags;
  private flagHistory: Array<{ flag: keyof RefactoringFeatureFlags; value: any; timestamp: Date }> = [];
  private rollbackTriggers: Map<string, () => void> = new Map();

  constructor(initialFlags: Partial<RefactoringFeatureFlags> = {}) {
    this.flags = { ...DEFAULT_REFACTORING_FLAGS, ...initialFlags };
  }

  // Flag Management
  public getFlag<K extends keyof RefactoringFeatureFlags>(flag: K): RefactoringFeatureFlags[K] {
    return this.flags[flag];
  }

  public setFlag<K extends keyof RefactoringFeatureFlags>(flag: K, value: RefactoringFeatureFlags[K]): void {
    const oldValue = this.flags[flag];
    this.flags[flag] = value;
    
    // Record flag change
    this.flagHistory.push({
      flag,
      value,
      timestamp: new Date()
    });
    
    // Keep only last 100 flag changes
    if (this.flagHistory.length > 100) {
      this.flagHistory.shift();
    }
    
    aiLogger.info(`🔄 AIContext Refactoring Flag Changed: ${flag} = ${value} (was ${oldValue})`);
    
    // Trigger rollback if critical flag is disabled
    if (flag === 'aicontext_refactoring_enabled' && value === false) {
      this.triggerRollback('refactoring_disabled');
    }
  }

  public getAllFlags(): RefactoringFeatureFlags {
    return { ...this.flags };
  }

  // Rollout Strategy
  public shouldUseNewImplementation(userId?: string): boolean {
    if (!this.flags.aicontext_refactoring_enabled) {
      return false;
    }

    if (this.flags.aicontext_test_mode) {
      return true;
    }

    if (this.flags.aicontext_canary_deployment) {
      return this.isCanaryUser(userId);
    }

    if (this.flags.aicontext_percentage_rollout > 0) {
      return this.isPercentageRolloutUser(userId);
    }

    if (this.flags.aicontext_user_segments.length > 0) {
      return this.isTargetedUser(userId);
    }

    return this.flags.aicontext_new_implementation;
  }

  // Phase 4C Migration Strategy
  public shouldUseComposedContext(userId?: string): boolean {
    if (!this.flags.migrateToComposedContext) {
      return false;
    }

    // Check percentage rollout
    if (this.flags.migrateToComposedContextPercentage > 0) {
      return this.isComposedContextRolloutUser(userId);
    }

    // Check user segments
    if (this.flags.migrateToComposedContextUserSegments.length > 0) {
      return this.isComposedContextTargetedUser(userId);
    }

    // If no specific targeting, use the flag directly
    return this.flags.migrateToComposedContext;
  }

  private isComposedContextRolloutUser(userId?: string): boolean {
    if (!userId) return false;
    const hash = this.hashUserId(userId);
    return (hash % 100) < this.flags.migrateToComposedContextPercentage;
  }

  private isComposedContextTargetedUser(userId?: string): boolean {
    if (!userId) return false;
    return this.flags.migrateToComposedContextUserSegments.some(segment => 
      userId.includes(segment) || userId.startsWith(segment)
    );
  }

  private isCanaryUser(userId?: string): boolean {
    // Simple canary logic - can be enhanced
    if (!userId) return false;
    return userId.endsWith('0') || userId.endsWith('5'); // 20% of users
  }

  private isPercentageRolloutUser(userId?: string): boolean {
    if (!userId) return false;
    const hash = this.hashUserId(userId);
    return (hash % 100) < this.flags.aicontext_percentage_rollout;
  }

  private isTargetedUser(userId?: string): boolean {
    if (!userId) return false;
    return this.flags.aicontext_user_segments.some(segment => 
      userId.includes(segment) || userId.startsWith(segment)
    );
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Rollback Management
  public registerRollbackTrigger(triggerId: string, callback: () => void): void {
    this.rollbackTriggers.set(triggerId, callback);
  }

  public triggerRollback(reason: string): void {
    aiLogger.warn(`🚨 AIContext Refactoring Rollback Triggered: ${reason}`);
    
    // Disable refactoring directly without triggering setFlag logic
    this.flags.aicontext_refactoring_enabled = false;
    this.flags.aicontext_new_implementation = false;
    
    // Record the rollback in history
    this.flagHistory.push({
      flag: 'aicontext_refactoring_enabled',
      value: false,
      timestamp: new Date()
    });
    this.flagHistory.push({
      flag: 'aicontext_new_implementation',
      value: false,
      timestamp: new Date()
    });
    
    // Execute rollback callbacks
    this.rollbackTriggers.forEach((callback, triggerId) => {
      try {
        callback();
        aiLogger.info(`✅ Rollback executed for trigger: ${triggerId}`);
      } catch (error) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'rollback_execution',
          component: 'RefactoringFeatureFlagManager',
          severity: 'high',
          userImpact: true,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Safety Checks
  public isSafeToProceed(): boolean {
    return (
      this.flags.aicontext_safety_monitoring &&
      this.flags.aicontext_rollback_enabled &&
      this.flags.aicontext_health_dashboard
    );
  }

  public getSafetyStatus(): {
    isSafe: boolean;
    missingSafetyFeatures: string[];
  } {
    const missingFeatures: string[] = [];
    
    if (!this.flags.aicontext_safety_monitoring) {
      missingFeatures.push('safety_monitoring');
    }
    if (!this.flags.aicontext_rollback_enabled) {
      missingFeatures.push('rollback_enabled');
    }
    if (!this.flags.aicontext_health_dashboard) {
      missingFeatures.push('health_dashboard');
    }
    
    return {
      isSafe: missingFeatures.length === 0,
      missingSafetyFeatures: missingFeatures
    };
  }

  // Migration Status
  public getMigrationStatus(): {
    isComplete: boolean;
    completedComponents: string[];
    pendingComponents: string[];
  } {
    const components = [
      { flag: 'aicontext_migrate_core_context', name: 'Core Context' },
      { flag: 'aicontext_migrate_feature_flags', name: 'Feature Flags' },
      { flag: 'aicontext_migrate_service_methods', name: 'Service Methods' },
      { flag: 'aicontext_migrate_development_tools', name: 'Development Tools' },
      { flag: 'aicontext_migrate_environment_status', name: 'Environment Status' }
    ];

    const completedComponents: string[] = [];
    const pendingComponents: string[] = [];

    components.forEach(({ flag, name }) => {
      if (this.flags[flag as keyof RefactoringFeatureFlags]) {
        completedComponents.push(name);
      } else {
        pendingComponents.push(name);
      }
    });

    return {
      isComplete: pendingComponents.length === 0,
      completedComponents,
      pendingComponents
    };
  }

  // Flag History
  public getFlagHistory(): Array<{ flag: keyof RefactoringFeatureFlags; value: any; timestamp: Date }> {
    return [...this.flagHistory];
  }

  // Export for debugging
  public exportDebugInfo(): any {
    return {
      currentFlags: this.getAllFlags(),
      flagHistory: this.getFlagHistory(),
      safetyStatus: this.getSafetyStatus(),
      migrationStatus: this.getMigrationStatus(),
      rollbackTriggers: Array.from(this.rollbackTriggers.keys())
    };
  }

  // Reset to defaults
  public reset(): void {
    this.flags = { ...DEFAULT_REFACTORING_FLAGS };
    this.flagHistory = [];
    this.rollbackTriggers.clear();
  }
}

// Global refactoring feature flag manager
export const refactoringFeatureFlags = new RefactoringFeatureFlagManager();

// Export for use in AIContext
export default refactoringFeatureFlags; 