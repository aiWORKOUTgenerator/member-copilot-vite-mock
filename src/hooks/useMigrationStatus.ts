import { useMemo } from 'react';
import { useAI } from '../contexts/AIContext';

/**
 * Hook for AI service migration status and feature flag monitoring
 * 
 * Provides methods to monitor migration progress, feature flag status,
 * and A/B test results with comprehensive reporting capabilities.
 * 
 * @returns Object containing migration status and controls
 */
export const useMigrationStatus = () => {
  const { featureFlags, abTestResults, developmentTools } = useAI();
  
  // Memoize migration status calculation to prevent recalculation on every render
  const migrationStatus = useMemo(() => ({
    unifiedServiceRollout: featureFlags.ai_service_unified,
    crossComponentRollout: featureFlags.ai_cross_component_analysis,
    realTimeInsightsRollout: featureFlags.ai_real_time_insights,
    learningSystemRollout: featureFlags.ai_learning_system
  }), [featureFlags]);
  
  // Memoize migration report calculation to prevent recalculation on every render
  const migrationReport = useMemo(() => ({
    totalFlags: Object.keys(featureFlags).length,
    enabledFlags: Object.values(featureFlags).filter(Boolean).length,
    abTestResults: abTestResults
  }), [featureFlags, abTestResults]);
  
  // Memoize the migration methods to prevent recreation on every render
  const migrationMethods = useMemo(() => ({
    /**
     * Current migration status for each feature
     */
    migrationStatus,
    
    /**
     * Comprehensive migration report with statistics
     */
    migrationReport,
    
    /**
     * Development tools for migration control
     */
    controls: developmentTools
  }), [migrationStatus, migrationReport, developmentTools]);
  
  return migrationMethods;
}; 