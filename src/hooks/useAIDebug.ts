import { useAI } from '../contexts/AIContext';
import { aiContextMonitor } from '../services/ai/monitoring/AIContextMonitor';

/**
 * Hook for AI service debugging and development tools
 * 
 * Provides methods to access debugging information, state validation,
 * and development tools for troubleshooting AI service issues.
 * 
 * @returns Object containing debugging methods
 */
export const useAIDebug = () => {
  const { aiService, serviceStatus, environmentStatus } = useAI();
  
  return {
    /**
     * Get current state validation results
     * 
     * @returns State validation object
     */
    getStateValidation: () => {
      const healthStatus = aiService.getHealthStatus();
      const performanceMetrics = aiService.getPerformanceMetrics();
      const monitorMetrics = aiContextMonitor.getMetrics();
      
      return {
        serviceHealth: healthStatus,
        performance: performanceMetrics,
        monitorMetrics,
        isValid: healthStatus.status === 'healthy',
        issues: healthStatus.details?.lastError ? [healthStatus.details.lastError.message] : []
      };
    },
    
    /**
     * Get initialization information and history
     * 
     * @returns Initialization info object
     */
    getInitializationInfo: () => {
      const monitorMetrics = aiContextMonitor.getMetrics();
      return {
        attempts: monitorMetrics.initializationAttempts,
        successes: monitorMetrics.initializationSuccesses,
        failures: monitorMetrics.initializationFailures,
        averageTime: monitorMetrics.averageInitializationTime,
        lastAttempt: monitorMetrics.lastInitializationAttempt,
        lastSuccess: monitorMetrics.lastInitializationSuccess,
        lastFailure: monitorMetrics.lastInitializationFailure
      };
    },
    
    /**
     * Get current environment status
     * 
     * @returns Environment status object
     */
    getEnvironmentStatus: () => environmentStatus,
    
    /**
     * Get current service status
     * 
     * @returns Service status string
     */
    getServiceStatus: () => serviceStatus,
    
    /**
     * Get comprehensive debug report with all information
     * 
     * @returns Complete debug report object
     */
    getDebugReport: () => {
      const stateValidation = {
        serviceHealth: aiService.getHealthStatus(),
        performance: aiService.getPerformanceMetrics(),
        monitorMetrics: aiContextMonitor.getMetrics(),
        isValid: aiService.getHealthStatus().status === 'healthy',
        issues: (() => {
          const healthStatus = aiService.getHealthStatus();
          return healthStatus.details?.lastError?.message ? [healthStatus.details.lastError.message] : [];
        })()
      };
      const initInfo = {
        attempts: aiContextMonitor.getMetrics().initializationAttempts,
        successes: aiContextMonitor.getMetrics().initializationSuccesses,
        failures: aiContextMonitor.getMetrics().initializationFailures,
        averageTime: aiContextMonitor.getMetrics().averageInitializationTime,
        lastAttempt: aiContextMonitor.getMetrics().lastInitializationAttempt,
        lastSuccess: aiContextMonitor.getMetrics().lastInitializationSuccess,
        lastFailure: aiContextMonitor.getMetrics().lastInitializationFailure
      };
      const monitorMetrics = aiContextMonitor.getMetrics();
      const alerts = aiContextMonitor.getAlerts();
      
      return {
        serviceStatus,
        environmentStatus,
        stateValidation,
        initializationInfo: initInfo,
        monitorMetrics,
        alerts,
        timestamp: new Date().toISOString(),
        recommendations: []
      };
    },
    
    /**
     * Log debug information to console for development
     */
    logDebugInfo: () => {
      console.group('🔍 AI Service Debug Information');
      console.log('Service Status:', serviceStatus);
      console.log('Environment Status:', environmentStatus);
      console.log('Health Status:', aiService.getHealthStatus());
      console.log('Performance Metrics:', aiService.getPerformanceMetrics());
      console.log('Monitor Metrics:', aiContextMonitor.getMetrics());
      console.log('Alerts:', aiContextMonitor.getAlerts());
      console.groupEnd();
    }
  };
}; 