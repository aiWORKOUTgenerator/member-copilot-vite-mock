import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { aiContextMonitor } from '../../services/ai/monitoring/AIContextMonitor';
import { aiLogger } from '../../services/ai/logging/AILogger';
import { AIInteractionEvent } from '../../types/ai-context.types';
import { ABTestResults } from '../../services/ai/featureFlags/FeatureFlagService';

// Analytics Context Types
interface AnalyticsSummary {
  interactionCount: number;
  errorCount: number;
  analyticsEnabled: boolean;
  timestamp: string;
  summary: {
    totalInteractions: number;
    totalErrors: number;
    errorRate: number;
  };
  abTestResults: Record<string, ABTestResults>;
}

interface AnalyticsError {
  error: Error;
  context: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsPerformanceMetric {
  metric: string;
  value: number;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface AIAnalyticsContextValue {
  // Analytics and Tracking
  trackAIInteraction: (interaction: AIInteractionEvent) => void;
  recordError: (error: Error, context: string, metadata?: Record<string, unknown>) => void;
  recordPerformance: (metric: string, value: number, context?: Record<string, unknown>) => void;
  
  // A/B Testing
  updateABTestResults: (flagId: string, results: ABTestResults) => void;
  getABTestResults: (flagId: string) => ABTestResults | null;
  
  // Analytics State
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
  
  // Analytics Methods
  getAnalyticsSummary: () => AnalyticsSummary;
  exportAnalytics: () => {
    summary: AnalyticsSummary;
    settings: {
      analyticsEnabled: boolean;
      timestamp: string;
    };
  };
  clearAnalytics: () => void;
}

// Create the context
const AIAnalyticsContext = createContext<AIAnalyticsContextValue | undefined>(undefined);

// Provider component
export const AIAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Analytics state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [interactionCount, setInteractionCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<AnalyticsError[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<AnalyticsPerformanceMetric[]>([]);
  const [abTestResults, setABTestResults] = useState<Record<string, ABTestResults>>({});

  // Track AI interactions
  const trackAIInteraction = useCallback((interaction: AIInteractionEvent) => {
    if (!analyticsEnabled) return;
    
    try {
      // Update local analytics
      setInteractionCount(prev => prev + 1);
      
      // Record in monitoring system
      aiContextMonitor.recordConsumerActivity(true);
      
      if (process.env.NODE_ENV === 'development') {
        aiLogger.debug('AIAnalyticsProvider: Interaction tracked', {
          type: interaction.type,
          component: interaction.component,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      aiContextMonitor.recordError('analytics_tracking', error instanceof Error ? error : new Error(String(error)));
      
      if (process.env.NODE_ENV === 'development') {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'analytics tracking',
          component: 'AIAnalyticsProvider',
          severity: 'medium',
          userImpact: false
        });
      }
    }
  }, [analyticsEnabled]);

  // Record errors with metadata
  const recordError = useCallback((error: Error, context: string, metadata?: Record<string, unknown>) => {
    if (!analyticsEnabled) return;
    
    try {
      // Record error in monitoring system
      aiContextMonitor.recordError(context, error);
      
      // Update local analytics
      setErrorCount(prev => prev + 1);
      setErrors(prev => [
        ...prev,
        {
          error,
          context,
          timestamp: new Date().toISOString(),
          metadata
        }
      ].slice(-100)); // Keep last 100 errors
      
      if (process.env.NODE_ENV === 'development') {
        aiLogger.error({
          error,
          context: `analytics error recording in ${context}`,
          component: 'AIAnalyticsProvider',
          severity: 'medium',
          userImpact: false,
          metadata
        });
      }
    } catch (analyticsError) {
      // Fallback error logging
      aiLogger.error({
        error: analyticsError instanceof Error ? analyticsError : new Error(String(analyticsError)),
        context: 'analytics error recording failed',
        component: 'AIAnalyticsProvider',
        severity: 'medium',
        userImpact: false
      });
    }
  }, [analyticsEnabled]);

  // Record performance metrics with context
  const recordPerformance = useCallback((metric: string, value: number, context?: Record<string, unknown>) => {
    if (!analyticsEnabled) return;
    
    try {
      // Record performance in monitoring system
      aiContextMonitor.recordPerformance(metric, value);
      
      // Update local analytics
      setPerformanceMetrics(prev => [
        ...prev,
        {
          metric,
          value,
          timestamp: new Date().toISOString(),
          context
        }
      ].slice(-1000)); // Keep last 1000 metrics
      
      if (process.env.NODE_ENV === 'development') {
        aiLogger.debug(`AIAnalyticsProvider: Performance recorded - ${metric}`, { value, context });
      }
    } catch (error) {
      aiContextMonitor.recordError('performance_tracking', error instanceof Error ? error : new Error(String(error)));
    }
  }, [analyticsEnabled]);

  // A/B Test Results Management
  const updateABTestResults = useCallback((flagId: string, results: ABTestResults) => {
    setABTestResults(prev => ({
      ...prev,
      [flagId]: results
    }));
    
    if (process.env.NODE_ENV === 'development') {
      aiLogger.debug('AIAnalyticsProvider: A/B test results updated', { flagId, results });
    }
  }, []);

  const getABTestResults = useCallback((flagId: string): ABTestResults | null => {
    return abTestResults[flagId] || null;
  }, [abTestResults]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback((): AnalyticsSummary => {
    return {
      interactionCount,
      errorCount,
      analyticsEnabled,
      timestamp: new Date().toISOString(),
      summary: {
        totalInteractions: interactionCount,
        totalErrors: errorCount,
        errorRate: interactionCount > 0 ? (errorCount / interactionCount) * 100 : 0
      },
      abTestResults
    };
  }, [interactionCount, errorCount, analyticsEnabled, abTestResults]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return {
      summary: getAnalyticsSummary(),
      settings: {
        analyticsEnabled,
        timestamp: new Date().toISOString()
      }
    };
  }, [analyticsEnabled, getAnalyticsSummary]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    setInteractionCount(0);
    setErrorCount(0);
    setErrors([]);
    setPerformanceMetrics([]);
    setABTestResults({});
    
    if (process.env.NODE_ENV === 'development') {
      aiLogger.info('AIAnalyticsProvider: Analytics data cleared');
    }
  }, []);

  // Context value
  const contextValue: AIAnalyticsContextValue = {
    trackAIInteraction,
    recordError,
    recordPerformance,
    updateABTestResults,
    getABTestResults,
    analyticsEnabled,
    setAnalyticsEnabled,
    getAnalyticsSummary,
    exportAnalytics,
    clearAnalytics
  };

  return (
    <AIAnalyticsContext.Provider value={contextValue}>
      {children}
    </AIAnalyticsContext.Provider>
  );
};

// Hook for accessing analytics context
export const useAIAnalytics = (): AIAnalyticsContextValue => {
  const context = useContext(AIAnalyticsContext);
  if (context === undefined) {
    throw new Error('useAIAnalytics must be used within an AIAnalyticsProvider');
  }
  return context;
}; 