import React, { ReactNode, useEffect, useState } from 'react';
import { AIProvider } from './AIContext';
import { AIComposedProvider } from './composition/AIComposedProvider';
import { refactoringFeatureFlags } from '../services/ai/featureFlags/RefactoringFeatureFlags';
import { aiContextMonitor } from '../services/ai/monitoring/AIContextMonitor';
import { aiLogger } from '../services/ai/logging/AILogger';

/**
 * AI Migration Provider - Phase 4C Implementation
 * 
 * This provider handles the gradual migration from the monolithic AIContext
 * to the new composed context architecture using feature flags for safe,
 * controlled rollout.
 * 
 * MIGRATION FEATURES:
 * - Feature flag controlled migration
 * - Gradual rollout with percentage targeting
 * - User segment targeting
 * - Automatic rollback on errors
 * - Migration success/failure monitoring
 * - Performance impact tracking
 * 
 * SAFETY MEASURES:
 * - Zero breaking changes
 * - Instant rollback capability
 * - Comprehensive monitoring
 * - Error threshold rollback
 * 
 * @version 1.0.0
 * @author AI Service Team
 */

interface MigrationMetrics {
  migrationAttempts: number;
  successfulMigrations: number;
  failedMigrations: number;
  rollbackEvents: number;
  averagePerformanceImpact: number;
  lastMigrationTime: Date | null;
  lastRollbackTime: Date | null;
}

interface AIMigrationProviderProps {
  children: ReactNode;
  userId?: string; // Optional user ID for targeting
  enableMonitoring?: boolean; // Enable migration monitoring
}

export const AIMigrationProvider: React.FC<AIMigrationProviderProps> = ({ 
  children, 
  userId,
  enableMonitoring = true 
}) => {
  const [migrationMetrics, setMigrationMetrics] = useState<MigrationMetrics>({
    migrationAttempts: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    rollbackEvents: 0,
    averagePerformanceImpact: 0,
    lastMigrationTime: null,
    lastRollbackTime: null
  });

  const [shouldUseComposed, setShouldUseComposed] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Determine which context to use based on feature flags
  useEffect(() => {
    const checkMigrationEligibility = () => {
      try {
        const useComposed = refactoringFeatureFlags.shouldUseComposedContext(userId);
        
        aiLogger.migration({
          fromContext: 'legacy',
          toContext: 'composed',
          userId,
          success: useComposed,
          featureFlags: {
            migrateToComposedContext: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
            migrateToComposedContextPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
            migrateToComposedContextUserSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments')
          },
          timestamp: new Date().toISOString()
        });

        setShouldUseComposed(useComposed);
        
        if (useComposed) {
          setMigrationMetrics(prev => ({
            ...prev,
            migrationAttempts: prev.migrationAttempts + 1,
            lastMigrationTime: new Date()
          }));
        }
      } catch (error) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'migration_check',
          component: 'AIMigrationProvider',
          severity: 'high',
          userImpact: true,
          timestamp: new Date().toISOString()
        });
        setMigrationError(error instanceof Error ? error.message : 'Unknown error');
        setShouldUseComposed(false);
      }
    };

    checkMigrationEligibility();
  }, [userId]);

  // Monitor migration success/failure
  useEffect(() => {
    if (!enableMonitoring) return;

    const handleMigrationSuccess = () => {
      setMigrationMetrics(prev => ({
        ...prev,
        successfulMigrations: prev.successfulMigrations + 1
      }));
      
      aiLogger.migration({
        fromContext: 'legacy',
        toContext: 'composed',
        userId,
        success: true,
        featureFlags: {
          migrateToComposedContext: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
          migrateToComposedContextPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
          migrateToComposedContextUserSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments')
        },
        timestamp: new Date().toISOString()
      });
    };

    const handleMigrationFailure = (error: string) => {
      setMigrationMetrics(prev => ({
        ...prev,
        failedMigrations: prev.failedMigrations + 1
      }));
      
      aiLogger.error({
        error: new Error(error),
        context: 'migration_execution',
        component: 'AIMigrationProvider',
        severity: 'high',
        userImpact: true,
        timestamp: new Date().toISOString()
      });
      
      // Trigger rollback if error threshold is exceeded
      const { failedMigrations, migrationAttempts } = migrationMetrics;
      const failureRate = migrationAttempts > 0 ? (failedMigrations + 1) / migrationAttempts : 0;
      
      if (failureRate > 0.05) { // 5% failure threshold
        aiLogger.warn('Migration failure threshold exceeded, triggering rollback', {
          failureRate,
          failedMigrations: failedMigrations + 1,
          migrationAttempts,
          threshold: 0.05
        });
        refactoringFeatureFlags.triggerRollback('migration_failure_threshold');
        setShouldUseComposed(false);
      }
    };

    // Register monitoring callbacks
    aiContextMonitor.registerMigrationCallback({
      onSuccess: handleMigrationSuccess,
      onFailure: handleMigrationFailure
    });

    return () => {
      aiContextMonitor.unregisterMigrationCallback();
    };
  }, [enableMonitoring, migrationMetrics, userId]);

  // Register rollback trigger
  useEffect(() => {
    const handleRollback = () => {
      setShouldUseComposed(false);
      setMigrationMetrics(prev => ({
        ...prev,
        rollbackEvents: prev.rollbackEvents + 1,
        lastRollbackTime: new Date()
      }));
      
      aiLogger.migration({
        fromContext: 'composed',
        toContext: 'legacy',
        userId,
        success: true,
        featureFlags: {
          migrateToComposedContext: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
          migrateToComposedContextPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
          migrateToComposedContextUserSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments')
        },
        timestamp: new Date().toISOString()
      });
    };

    refactoringFeatureFlags.registerRollbackTrigger('migration_provider', handleRollback);

    return () => {
      refactoringFeatureFlags.registerRollbackTrigger('migration_provider', () => {});
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!shouldUseComposed || !enableMonitoring) return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMigrationMetrics(prev => ({
        ...prev,
        averagePerformanceImpact: (prev.averagePerformanceImpact + duration) / 2
      }));
    };
  }, [shouldUseComposed, enableMonitoring]);

  // Render appropriate provider based on migration state
  if (shouldUseComposed) {
    aiLogger.info('Using composed context for AI operations', {
      userId,
      featureFlags: {
        migrateToComposedContext: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
        migrateToComposedContextPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
        migrateToComposedContextUserSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments')
      },
      timestamp: new Date().toISOString()
    });
    return <AIComposedProvider>{children}</AIComposedProvider>;
  } else {
    aiLogger.info('Using legacy context for AI operations', {
      userId,
      featureFlags: {
        migrateToComposedContext: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
        migrateToComposedContextPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
        migrateToComposedContextUserSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments')
      },
      timestamp: new Date().toISOString()
    });
    return <AIProvider>{children}</AIProvider>;
  }
};

// Export migration utilities for external use
export const useMigrationStatus = () => {
  return {
    isUsingComposed: refactoringFeatureFlags.shouldUseComposedContext(),
    migrationEnabled: refactoringFeatureFlags.getFlag('migrateToComposedContext'),
    migrationPercentage: refactoringFeatureFlags.getFlag('migrateToComposedContextPercentage'),
    userSegments: refactoringFeatureFlags.getFlag('migrateToComposedContextUserSegments'),
    triggerRollback: () => refactoringFeatureFlags.triggerRollback('manual_rollback')
  };
};

// Export for debugging
export const getMigrationDebugInfo = () => {
  return {
    featureFlags: refactoringFeatureFlags.exportDebugInfo(),
    migrationStatus: useMigrationStatus()
  };
}; 