import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';
import { UserProfile } from '../../types';
import { featureFlagService, FeatureFlag, ABTestResults } from '../../services/ai/featureFlags/FeatureFlagService';
import { refactoringFeatureFlags, RefactoringFeatureFlags } from '../../services/ai/featureFlags/RefactoringFeatureFlags';
import { aiContextMonitor } from '../../services/ai/monitoring/AIContextMonitor';
import { aiLogger } from '../../services/ai/logging/AILogger';

// Feature Flag Types
interface FeatureFlagOverride {
  userId: string;
  enabled: boolean;
  timestamp: string;
  reason?: string;
}

interface FeatureFlagRollout {
  flagId: string;
  percentage: number;
  timestamp: string;
  gradual: boolean;
}

interface FeatureFlagState {
  enabled: boolean;
  overrides: Record<string, FeatureFlagOverride>;
  rollout: FeatureFlagRollout | null;
  lastUpdated: string;
}

interface FeatureFlagEvaluation {
  enabled: boolean;
  source: 'default' | 'override' | 'rollout' | 'experiment';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Feature Flags Context Types
interface AIFeatureFlagsContextValue {
  // Feature Flag Management
  featureFlags: Record<string, FeatureFlagState>;
  isFeatureEnabled: (flagId: string) => boolean;
  getFlagEvaluation: (flagId: string) => FeatureFlagEvaluation;
  
  // Flag Administration
  setFlagOverride: (flagId: string, enabled: boolean, reason?: string) => void;
  setFlagRollout: (flagId: string, percentage: number, gradual?: boolean) => void;
  removeFlagOverride: (flagId: string) => void;
  resetFlag: (flagId: string) => void;
  refreshFlags: () => void;
  
  // Refactoring Controls
  refactoringFlags: Record<string, boolean>;
  setRefactoringFlag: (flag: keyof RefactoringFeatureFlags, value: boolean) => void;
  getRefactoringStatus: () => {
    safetyStatus: {
      isSafe: boolean;
      missingSafetyFeatures: string[];
    };
    migrationStatus: {
      isComplete: boolean;
      completedComponents: string[];
      pendingComponents: string[];
    };
    debugInfo: Record<string, unknown>;
  };
  
  // Development Tools
  developmentMode: boolean;
  setDevelopmentMode: (enabled: boolean) => void;
  exportConfiguration: () => {
    flags: Record<string, FeatureFlagState>;
    refactoring: Record<string, boolean>;
    timestamp: string;
  };
}

// Create the context
const AIFeatureFlagsContext = createContext<AIFeatureFlagsContextValue | undefined>(undefined);

// Provider component
export const AIFeatureFlagsProvider: React.FC<{ 
  children: ReactNode;
  userProfile?: UserProfile;
}> = ({ children, userProfile }) => {
  // Feature flag state
  const [featureFlags, setFeatureFlags] = useState<Record<string, FeatureFlagState>>({});
  const [refactoringFlags, setRefactoringFlags] = useState<Record<string, boolean>>({});
  const [developmentMode, setDevelopmentMode] = useState(process.env.NODE_ENV === 'development');

  // Initialize feature flags
  const initializeFeatureFlags = useCallback((profile: UserProfile) => {
    try {
      // Get base flags
      const flags = featureFlagService.getAIFlags(profile);
      
      // Convert to FeatureFlagState
      const flagStates = Object.entries(flags).reduce<Record<string, FeatureFlagState>>(
        (acc, [flagId, enabled]) => {
          acc[flagId] = {
            enabled,
            overrides: {},
            rollout: null,
            lastUpdated: new Date().toISOString()
          };
          return acc;
        },
        {}
      );
      
      setFeatureFlags(flagStates);
      
      // Initialize refactoring flags
      const refFlags = Object.entries(refactoringFeatureFlags.getAllFlags())
        .reduce<Record<string, boolean>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      setRefactoringFlags(refFlags);
      
      if (developmentMode) {
        aiLogger.debug('AIFeatureFlagsProvider: Feature flags initialized', { 
          flags: flagStates,
          refactoring: refFlags
        });
      }
    } catch (error) {
      aiContextMonitor.recordError('feature_flags_initialization', error instanceof Error ? error : new Error(String(error)));
      
      if (developmentMode) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'feature flags initialization',
          component: 'AIFeatureFlagsProvider',
          severity: 'medium',
          userImpact: false
        });
      }
    }
  }, [developmentMode]);

  // Initialize flags when userProfile changes
  useEffect(() => {
    if (userProfile) {
      initializeFeatureFlags(userProfile);
    } else if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Waiting for user profile');
    }
  }, [userProfile, initializeFeatureFlags, developmentMode]);

  // Force refresh flags method
  const refreshFlags = useCallback(() => {
    if (userProfile) {
      initializeFeatureFlags(userProfile);
    }
  }, [userProfile, initializeFeatureFlags]);

  // Expose refresh method for external use
  useEffect(() => {
    if (developmentMode) {
      // Make refreshFlags available globally for debugging
      (window as any).refreshAIFeatureFlags = refreshFlags;
    }
  }, [refreshFlags, developmentMode]);

  // Flag evaluation logic
  const getFlagEvaluation = useCallback((flagId: string): FeatureFlagEvaluation => {
    const flag = featureFlags[flagId];
    if (!flag) {
      return {
        enabled: false,
        source: 'default',
        timestamp: new Date().toISOString()
      };
    }

    // Check overrides first
    if (userProfile) {
      const userId = `user_${userProfile.fitnessLevel}_${userProfile.goals.join('_')}`;
      const override = flag.overrides[userId];
      if (override) {
        return {
          enabled: override.enabled,
          source: 'override',
          timestamp: override.timestamp,
          metadata: { reason: override.reason }
        };
      }
    }

    // Check rollout
    if (flag.rollout && userProfile) {
      const userId = `user_${userProfile.fitnessLevel}_${userProfile.goals.join('_')}`;
      const hash = Math.abs(userId.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0));
      const userPercentile = (hash % 100) + 1;
      
      if (userPercentile <= flag.rollout.percentage) {
        return {
          enabled: true,
          source: 'rollout',
          timestamp: flag.rollout.timestamp,
          metadata: { 
            percentage: flag.rollout.percentage,
            gradual: flag.rollout.gradual
          }
        };
      }
    }

    // Return base state
    return {
      enabled: flag.enabled,
      source: 'default',
      timestamp: flag.lastUpdated
    };
  }, [featureFlags, userProfile]);

  // Check if feature is enabled
  const isFeatureEnabled = useCallback((flagId: string): boolean => {
    const evaluation = getFlagEvaluation(flagId);
    
    try {
      // Monitor feature flag checks
      aiContextMonitor.recordFeatureFlagCheck(flagId, evaluation.enabled);
      
      if (developmentMode) {
        aiLogger.debug('AIFeatureFlagsProvider: Flag evaluation', {
          flagId,
          evaluation
        });
      }
      
      return evaluation.enabled;
    } catch (error) {
      aiContextMonitor.recordError('feature_flag_check', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }, [getFlagEvaluation, developmentMode]);

  // Flag administration methods
  const setFlagOverride = useCallback((flagId: string, enabled: boolean, reason?: string) => {
    if (!userProfile) return;
    
    const userId = `user_${userProfile.fitnessLevel}_${userProfile.goals.join('_')}`;
    
    setFeatureFlags(prev => ({
      ...prev,
      [flagId]: {
        ...prev[flagId],
        overrides: {
          ...prev[flagId]?.overrides,
          [userId]: {
            userId,
            enabled,
            timestamp: new Date().toISOString(),
            reason
          }
        }
      }
    }));
    
    if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Flag override set', {
        flagId,
        enabled,
        userId,
        reason
      });
    }
  }, [userProfile, developmentMode]);

  const setFlagRollout = useCallback((flagId: string, percentage: number, gradual = false) => {
    setFeatureFlags(prev => ({
      ...prev,
      [flagId]: {
        ...prev[flagId],
        rollout: {
          flagId,
          percentage,
          timestamp: new Date().toISOString(),
          gradual
        }
      }
    }));
    
    if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Flag rollout set', {
        flagId,
        percentage,
        gradual
      });
    }
  }, [developmentMode]);

  const removeFlagOverride = useCallback((flagId: string) => {
    if (!userProfile) return;
    
    const userId = `user_${userProfile.fitnessLevel}_${userProfile.goals.join('_')}`;
    
    setFeatureFlags(prev => {
      const flag = prev[flagId];
      if (!flag) return prev;
      
      const { [userId]: _, ...remainingOverrides } = flag.overrides;
      
      return {
        ...prev,
        [flagId]: {
          ...flag,
          overrides: remainingOverrides
        }
      };
    });
    
    if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Flag override removed', {
        flagId,
        userId
      });
    }
  }, [userProfile, developmentMode]);

  const resetFlag = useCallback((flagId: string) => {
    setFeatureFlags(prev => {
      const flag = prev[flagId];
      if (!flag) return prev;
      
      return {
        ...prev,
        [flagId]: {
          enabled: flag.enabled,
          overrides: {},
          rollout: null,
          lastUpdated: new Date().toISOString()
        }
      };
    });
    
    if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Flag reset', { flagId });
    }
  }, [developmentMode]);

  // Refactoring controls
  const setRefactoringFlag = useCallback((flag: keyof RefactoringFeatureFlags, value: boolean) => {
    refactoringFeatureFlags.setFlag(flag, value);
    const updatedFlags = Object.entries(refactoringFeatureFlags.getAllFlags())
      .reduce<Record<string, boolean>>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    setRefactoringFlags(updatedFlags);
    
    if (developmentMode) {
      aiLogger.debug('AIFeatureFlagsProvider: Refactoring flag set', {
        flag,
        value
      });
    }
  }, [developmentMode]);

  const getRefactoringStatus = useCallback(() => ({
    safetyStatus: refactoringFeatureFlags.getSafetyStatus(),
    migrationStatus: refactoringFeatureFlags.getMigrationStatus(),
    debugInfo: refactoringFeatureFlags.exportDebugInfo() as Record<string, unknown>
  }), []);

  // Export configuration
  const exportConfiguration = useCallback(() => ({
    flags: featureFlags,
    refactoring: refactoringFlags,
    timestamp: new Date().toISOString()
  }), [featureFlags, refactoringFlags]);

  // Context value
  const contextValue = useMemo<AIFeatureFlagsContextValue>(() => ({
    featureFlags,
    isFeatureEnabled,
    getFlagEvaluation,
    setFlagOverride,
    setFlagRollout,
    removeFlagOverride,
    resetFlag,
    refreshFlags,
    refactoringFlags,
    setRefactoringFlag,
    getRefactoringStatus,
    developmentMode,
    setDevelopmentMode,
    exportConfiguration
  }), [
    featureFlags,
    isFeatureEnabled,
    getFlagEvaluation,
    setFlagOverride,
    setFlagRollout,
    removeFlagOverride,
    resetFlag,
    refreshFlags,
    refactoringFlags,
    setRefactoringFlag,
    getRefactoringStatus,
    developmentMode,
    exportConfiguration
  ]);

  return (
    <AIFeatureFlagsContext.Provider value={contextValue}>
      {children}
    </AIFeatureFlagsContext.Provider>
  );
};

// Hook for accessing feature flags context
export const useAIFeatureFlags = (): AIFeatureFlagsContextValue => {
  const context = useContext(AIFeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useAIFeatureFlags must be used within an AIFeatureFlagsProvider');
  }
  return context;
}; 