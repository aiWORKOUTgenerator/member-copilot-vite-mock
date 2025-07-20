import { useAI } from '../contexts/AIContext';

export const useEnvironmentValidation = () => {
  const { environmentStatus, developmentTools } = useAI();
  
  return {
    // Environment status
    isConfigured: environmentStatus.isConfigured,
    hasApiKey: environmentStatus.hasApiKey,
    isDevelopment: environmentStatus.isDevelopment,
    issues: environmentStatus.issues,
    recommendations: environmentStatus.recommendations,
    
    // Helper methods
    hasIssues: environmentStatus.issues.length > 0,
    hasRecommendations: environmentStatus.recommendations.length > 0,
    
    // Actions
    checkEnvironment: developmentTools.checkEnvironment,
    
    // Status helpers
    getStatusType: () => {
      if (!environmentStatus.hasApiKey) return 'error';
      if (environmentStatus.isDevelopment && !environmentStatus.isConfigured) return 'warning';
      if (environmentStatus.issues.length > 0) return 'info';
      return 'success';
    },
    
    getStatusMessage: () => {
      if (!environmentStatus.hasApiKey) {
        return 'OpenAI API key is missing. AI features will be limited.';
      }
      if (environmentStatus.isDevelopment && !environmentStatus.isConfigured) {
        return 'Development environment detected. Some AI features may be limited.';
      }
      if (environmentStatus.issues.length > 0) {
        return 'Environment configuration issues detected.';
      }
      return 'Environment is properly configured.';
    }
  };
}; 