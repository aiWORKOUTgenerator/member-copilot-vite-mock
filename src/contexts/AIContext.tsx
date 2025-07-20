// AI Context Provider - Manages AI service across the application
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AIService } from '../services/ai/core/AIService';
import { UserProfile, PerWorkoutOptions, AIAssistanceLevel } from '../types';
import { featureFlagService, useFeatureFlags, FeatureFlag, ABTestResults, AnalyticsEvent } from '../services/ai/featureFlags/FeatureFlagService';
import { openAIStrategy } from '../services/ai/external/OpenAIStrategy';
import { openAIWorkoutGenerator } from '../services/ai/external/OpenAIWorkoutGenerator';
import { openAIConfig, isFeatureEnabled, checkEnvironmentConfiguration } from '../services/ai/external/config/openai.config';

// Enhanced AI Context with Feature Flag Support
interface AIContextValue {
  // Core AI Service
  aiService: AIService;
  serviceStatus: 'initializing' | 'ready' | 'error';
  
  // Environment Validation
  environmentStatus: {
    isConfigured: boolean;
    hasApiKey: boolean;
    isDevelopment: boolean;
    issues: string[];
    recommendations: string[];
  };
  
  // Feature Flag Support
  featureFlags: Record<string, boolean>;
  isFeatureEnabled: (flagId: string) => boolean;
  
  // A/B Testing and Analytics
  abTestResults: Record<string, ABTestResults>;
  trackAIInteraction: (interaction: AIInteractionEvent) => void;
  
  // Service Control
  initialize: (userProfile: UserProfile) => Promise<void>;
  updateSelections: (selections: Partial<PerWorkoutOptions>) => void;
  
  // Enhanced Methods with Feature Flag Awareness
  getEnergyInsights: (value: number) => any[];
  getSorenessInsights: (value: number) => any[];
  analyze: (partialSelections?: Partial<PerWorkoutOptions>) => Promise<any>;
  
  // External AI Integration
  generateWorkout: (workoutData: PerWorkoutOptions) => Promise<any>;
  getEnhancedRecommendations: () => Promise<any[]>;
  getEnhancedInsights: () => Promise<any>;
  analyzeUserPreferences: () => Promise<any>;
  
  // Development Tools
  enableValidation: boolean;
  setValidationMode: (enabled: boolean) => void;
  developmentTools: {
    overrideFlag: (flagId: string, enabled: boolean) => void;
    increaseRollout: (flagId: string, percentage: number) => void;
    getAnalytics: (flagId: string) => ABTestResults | null;
    exportFlags: () => Record<string, FeatureFlag>;
    checkEnvironment: () => void;
    validateState: () => any;
    getInitializationInfo: () => {
      attempts: number;
      lastError: string | null;
      startTime: Date | null;
      endTime: Date | null;
      duration: number | null;
    };
  };
}

interface AIInteractionEvent {
  type: 'insight_shown' | 'insight_applied' | 'recommendation_accepted' | 'recommendation_rejected';
  component: string;
  data: Record<string, any>;
  timestamp?: Date;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [aiService] = useState(() => new AIService());
  const [serviceStatus, setServiceStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentSelections, setCurrentSelections] = useState<PerWorkoutOptions>({});
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [abTestResults, setABTestResults] = useState<Record<string, ABTestResults>>({});
  const [enableValidation, setEnableValidation] = useState(false);
  
  // Enhanced debugging and state tracking
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [lastInitializationError, setLastInitializationError] = useState<string | null>(null);
  const [initializationStartTime, setInitializationStartTime] = useState<Date | null>(null);
  const [initializationEndTime, setInitializationEndTime] = useState<Date | null>(null);
  
  // Environment validation state
  const [environmentStatus, setEnvironmentStatus] = useState(() => checkEnvironmentConfiguration());

  // Enhanced state validation function
  const validateAIContextState = useCallback(() => {
    const state = {
      serviceStatus,
      hasUserProfile: !!currentUserProfile,
      hasFeatureFlags: Object.keys(featureFlags).length > 0,
      hasEnvironmentStatus: !!environmentStatus,
      initializationAttempts,
      lastError: lastInitializationError,
      initializationDuration: initializationStartTime && initializationEndTime 
        ? initializationEndTime.getTime() - initializationStartTime.getTime() 
        : null
    };

    console.log('🔍 AI Context State Validation:', state);
    return state;
  }, [serviceStatus, currentUserProfile, featureFlags, environmentStatus, initializationAttempts, lastInitializationError, initializationStartTime, initializationEndTime]);

  // Check environment configuration on mount
  useEffect(() => {
    console.log('🔄 AIProvider: Initializing environment configuration...');
    const status = checkEnvironmentConfiguration();
    setEnvironmentStatus(status);
    
    console.log('✅ AIProvider: Environment status set:', {
      isConfigured: status.isConfigured,
      hasApiKey: status.hasApiKey,
      isDevelopment: status.isDevelopment,
      issuesCount: status.issues.length,
      recommendationsCount: status.recommendations.length
    });
    
    if (status.isDevelopment && !status.isConfigured) {
      console.warn('⚠️  AI Environment Configuration Issues Detected');
      console.warn('   Issues:', status.issues);
      console.warn('   Recommendations:', status.recommendations);
    }
  }, []);

  // Initialize feature flags when user profile is available
  useEffect(() => {
    if (currentUserProfile) {
      console.log('🔄 AIProvider: Loading feature flags for user profile...');
      const flags = featureFlagService.getAIFlags(currentUserProfile);
      setFeatureFlags(flags);
      
      console.log('✅ AIProvider: Feature flags loaded:', {
        totalFlags: Object.keys(flags).length,
        enabledFlags: Object.keys(flags).filter(key => flags[key]),
        userFitnessLevel: currentUserProfile.fitnessLevel
      });
      
      // Set up analytics callback
      featureFlagService.setAnalyticsCallback((event: AnalyticsEvent) => {
        console.log('Feature Flag Analytics:', event);
        
        // In a real implementation, this would send to an analytics service
        // trackEvent('feature_flag', event);
      });
    } else {
      console.log('ℹ️ AIProvider: No user profile available for feature flags');
    }
  }, [currentUserProfile]);

  // Enhanced initialization with comprehensive debugging
  const initialize = useCallback(async (userProfile: UserProfile) => {
    const attemptNumber = initializationAttempts + 1;
    const startTime = new Date();
    
    console.log(`🔄 AIProvider: Starting AI service initialization (attempt ${attemptNumber})...`, { 
      userProfile: { 
        fitnessLevel: userProfile.fitnessLevel, 
        goals: userProfile.goals,
        hasPreferences: !!userProfile.preferences,
        hasLimitations: !!userProfile.basicLimitations
      },
      startTime: startTime.toISOString()
    });
    
    setInitializationAttempts(attemptNumber);
    setInitializationStartTime(startTime);
    setLastInitializationError(null);
    
    try {
      // Validate user profile before initialization
      console.log('🔍 AIProvider: Validating user profile...');
      
      if (!userProfile) {
        throw new Error('User profile is required for AI service initialization');
      }
      
      if (!userProfile.fitnessLevel) {
        throw new Error('User profile must include fitness level');
      }
      
      if (!userProfile.goals || userProfile.goals.length === 0) {
        throw new Error('User profile must include at least one goal');
      }
      
      if (!userProfile.preferences) {
        throw new Error('User profile must include preferences');
      }
      
      if (!userProfile.basicLimitations) {
        throw new Error('User profile must include basic limitations');
      }
      
      console.log('✅ AIProvider: User profile validation passed');
      
      setServiceStatus('initializing');
      setCurrentUserProfile(userProfile);
      
      console.log('✅ AIProvider: User profile set, loading feature flags...');
      
      // Get feature flags for this user
      const flags = featureFlagService.getAIFlags(userProfile);
      setFeatureFlags(flags);
      
      console.log('✅ AIProvider: Feature flags loaded:', {
        enabledFlags: Object.keys(flags).filter(key => flags[key]),
        totalFlags: Object.keys(flags).length
      });
      
      // Set up AI service context with proper error handling
      const context = {
        userProfile,
        currentSelections: {},
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'moderate' as AIAssistanceLevel,
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };
      
      console.log('🔄 AIProvider: Setting AI service context...');
      await aiService.setContext(context);
      console.log('✅ AIProvider: AI service context set successfully');
      
      // Initialize external AI strategy if enabled
      if (isFeatureEnabled('openai_workout_generation') || isFeatureEnabled('openai_enhanced_recommendations')) {
        console.log('🔄 AIProvider: Initializing external AI strategy...');
        aiService.setExternalStrategy(openAIStrategy);
        console.log('✅ AIProvider: External AI strategy initialized');
      } else {
        console.log('ℹ️ AIProvider: External AI strategy not enabled, using internal services');
      }
      
      // Verify service is ready
      console.log('🔍 AIProvider: Verifying service health...');
      const healthStatus = aiService.getHealthStatus();
      console.log('🔍 AIProvider: AI service health status:', healthStatus);
      
      if (healthStatus.status === 'unhealthy') {
        throw new Error(`AI service health check failed: ${JSON.stringify(healthStatus.details)}`);
      }
      
      const endTime = new Date();
      setInitializationEndTime(endTime);
      setServiceStatus('ready');
      
      console.log('✅ AIProvider: AI service initialization completed successfully', {
        attemptNumber,
        duration: endTime.getTime() - startTime.getTime(),
        healthStatus: healthStatus.status,
        userProfile: {
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals
        }
      });
      
      // Log final state validation
      validateAIContextState();
      
    } catch (error) {
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error('❌ AIProvider: Failed to initialize AI service:', error);
      console.error('AIProvider: Error details:', {
        attemptNumber,
        duration: endTime.getTime() - startTime.getTime(),
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        userProfile: userProfile ? { 
          fitnessLevel: userProfile.fitnessLevel, 
          goals: userProfile.goals 
        } : 'null'
      });
      
      setServiceStatus('error');
      setLastInitializationError(errorMessage);
      setInitializationEndTime(endTime);
      
      // Log error state validation
      validateAIContextState();
      
      // Re-throw the error to allow calling code to handle it
      throw error;
    }
  }, [aiService, enableValidation, initializationAttempts, validateAIContextState]);

  // Update workout selections with feature flag awareness
  const updateSelections = useCallback((selections: Partial<PerWorkoutOptions>) => {
    setCurrentSelections(prev => ({ ...prev, ...selections }));
    
    if (currentUserProfile && featureFlags.ai_real_time_insights) {
      // Update the AI service context with new selections
      const currentContext = aiService.getContext();
      if (currentContext) {
        aiService.setContext({
          ...currentContext,
          currentSelections: { ...currentContext.currentSelections, ...selections }
        });
      }
    }
  }, [aiService, currentUserProfile, featureFlags]);

  // Enhanced AI methods with feature flag support and A/B testing
  const getEnergyInsights = useCallback((value: number) => {
    if (!currentUserProfile) return [];
    
    const useNewService = featureFlags.ai_service_unified;
    
    if (useNewService) {
      // Track usage of new service
      trackAIInteraction({
        type: 'insight_shown',
        component: 'energy',
        data: { value, service: 'unified', flagEnabled: true }
      });
      
      return aiService.getEnergyInsights(value);
    } else {
      // Fall back to legacy implementation
      trackAIInteraction({
        type: 'insight_shown',
        component: 'energy',
        data: { value, service: 'legacy', flagEnabled: false }
      });
      
      // Import and use legacy function
      return getLegacyEnergyInsights(value);
    }
  }, [currentUserProfile, featureFlags, aiService]);

  const getSorenessInsights = useCallback((value: number) => {
    if (!currentUserProfile) return [];
    
    const useNewService = featureFlags.ai_service_unified;
    
    if (useNewService) {
      trackAIInteraction({
        type: 'insight_shown',
        component: 'soreness',
        data: { value, service: 'unified', flagEnabled: true }
      });
      
      // Convert number to array format for compatibility
      const sorenessAreas = value > 3 ? ['General'] : [];
      return aiService.getSorenessInsights(sorenessAreas);
    } else {
      trackAIInteraction({
        type: 'insight_shown',
        component: 'soreness',
        data: { value, service: 'legacy', flagEnabled: false }
      });
      
      return getLegacySorenessInsights(value);
    }
  }, [currentUserProfile, featureFlags, aiService]);

  const analyze = useCallback(async (partialSelections?: Partial<PerWorkoutOptions>) => {
    if (!currentUserProfile) return null;
    
    const useNewService = featureFlags.ai_service_unified;
    const useCrossComponentAnalysis = featureFlags.ai_cross_component_analysis;
    
    if (useNewService) {
      trackAIInteraction({
        type: 'insight_shown',
        component: 'unified_analysis',
        data: { 
          service: 'unified',
          crossComponentEnabled: useCrossComponentAnalysis,
          selectionsProvided: !!partialSelections 
        }
      });
      
      const analysis = await aiService.analyze(partialSelections);
      
      // Filter out cross-component insights if feature flag is disabled
      if (!useCrossComponentAnalysis && analysis) {
        analysis.crossComponentConflicts = [];
        analysis.recommendations = analysis.recommendations.filter(
          (rec: any) => rec.category !== 'cross_component'
        );
      }
      
      return analysis;
    } else {
      trackAIInteraction({
        type: 'insight_shown',
        component: 'unified_analysis',
        data: { service: 'legacy', crossComponentEnabled: false }
      });
      
      // Fall back to legacy analysis
      return getLegacyAnalysis(currentSelections, currentUserProfile);
    }
  }, [currentUserProfile, featureFlags, aiService, currentSelections]);

  // Track AI interactions for analytics and learning
  const trackAIInteraction = useCallback((interaction: AIInteractionEvent) => {
    const enhancedInteraction = {
      ...interaction,
      timestamp: interaction.timestamp || new Date(),
      userId: (currentUserProfile as any)?.id || 'anonymous',
      featureFlags: featureFlags
    };
    
    // Log for development
    console.log('AI Interaction:', enhancedInteraction);
    
    // In a real implementation, send to analytics service
    // analyticsService.track('ai_interaction', enhancedInteraction);
    
    // Update A/B test results if this is a recommendation interaction
    if (interaction.type.includes('recommendation')) {
      updateABTestResults(interaction);
    }
  }, [currentUserProfile, featureFlags]);

  const updateABTestResults = useCallback((interaction: AIInteractionEvent) => {
    // Update A/B test results based on user interactions
    const flagId = 'ai_service_unified';
    const currentResults = featureFlagService.getAnalytics(flagId);
    
    if (currentResults) {
      setABTestResults(prev => ({
        ...prev,
        [flagId]: currentResults
      }));
    }
  }, []);

  // Feature flag utility methods
  const isFeatureEnabled = useCallback((flagId: string) => {
    // Use cached feature flags if available, otherwise fall back to direct service call
    const result = featureFlags[flagId] ?? (currentUserProfile ? featureFlagService.isEnabled(flagId, currentUserProfile) : false);
    
    return result;
  }, [currentUserProfile, featureFlags]);

  // Development tools for testing and flag management
  const developmentTools = {
    overrideFlag: (flagId: string, enabled: boolean) => {
      const userId = (currentUserProfile as any)?.id;
      if (userId && currentUserProfile) {
        featureFlagService.addUserOverride(flagId, userId, enabled);
        // Refresh flags
        const updatedFlags = featureFlagService.getAIFlags(currentUserProfile);
        setFeatureFlags(updatedFlags);
      }
    },
    
    increaseRollout: (flagId: string, percentage: number) => {
      featureFlagService.increaseRollout(flagId, percentage);
    },
    
    getAnalytics: (flagId: string) => {
      return featureFlagService.getAnalytics(flagId);
    },
    
    exportFlags: () => {
      return featureFlagService.exportConfiguration();
    },
    
    checkEnvironment: () => {
      const status = checkEnvironmentConfiguration();
      setEnvironmentStatus(status);
      console.group('🔧 Environment Configuration Check');
      console.log('Status:', status);
      console.groupEnd();
      return status;
    },
    validateState: () => {
      return validateAIContextState();
    },
         getInitializationInfo: () => {
       return {
         attempts: initializationAttempts,
         lastError: lastInitializationError,
         startTime: initializationStartTime,
         endTime: initializationEndTime,
         duration: initializationStartTime && initializationEndTime ? initializationEndTime.getTime() - initializationStartTime.getTime() : null
       };
     }
  };

  // External AI methods
  const generateWorkout = useCallback(async (workoutData: PerWorkoutOptions) => {
    if (!currentUserProfile) {
      throw new Error('User profile required for workout generation');
    }
    return await aiService.generateWorkout(workoutData);
  }, [aiService, currentUserProfile]);

  const getEnhancedRecommendations = useCallback(async () => {
    return await aiService.getEnhancedRecommendations();
  }, [aiService]);

  const getEnhancedInsights = useCallback(async () => {
    return await aiService.getEnhancedInsights();
  }, [aiService]);

  const analyzeUserPreferences = useCallback(async () => {
    return await aiService.analyzeUserPreferences();
  }, [aiService]);

  const contextValue: AIContextValue = {
    aiService,
    serviceStatus,
    environmentStatus,
    featureFlags,
    isFeatureEnabled,
    abTestResults,
    trackAIInteraction,
    initialize,
    updateSelections,
    getEnergyInsights,
    getSorenessInsights,
    analyze,
    generateWorkout,
    getEnhancedRecommendations,
    getEnhancedInsights,
    analyzeUserPreferences,
    enableValidation,
    setValidationMode: setEnableValidation,
    developmentTools
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

// Hook for accessing AI context
export const useAI = (): AIContextValue => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

// Debugging hook for initialization issues
export const useAIDebug = () => {
  const { developmentTools, serviceStatus, environmentStatus } = useAI();
  
  return {
    // Get current state validation
    getStateValidation: () => developmentTools.validateState(),
    
    // Get initialization information
    getInitializationInfo: () => developmentTools.getInitializationInfo(),
    
    // Check environment status
    getEnvironmentStatus: () => environmentStatus,
    
    // Get service status
    getServiceStatus: () => serviceStatus,
    
    // Comprehensive debug report
    getDebugReport: () => {
      const stateValidation = developmentTools.validateState();
      const initInfo = developmentTools.getInitializationInfo();
      
      return {
        serviceStatus,
        environmentStatus,
        stateValidation,
        initializationInfo: initInfo,
        timestamp: new Date().toISOString(),
        recommendations: []
      };
    },
    
    // Log debug information to console
    logDebugInfo: () => {
      console.group('🔍 AI Service Debug Information');
      console.log('Service Status:', serviceStatus);
      console.log('Environment Status:', environmentStatus);
      console.log('State Validation:', developmentTools.validateState());
      console.log('Initialization Info:', developmentTools.getInitializationInfo());
      console.groupEnd();
    }
  };
};

// Specialized hooks for different AI use cases
export const useAIRecommendations = () => {
  const { analyze, trackAIInteraction } = useAI();
  
  return {
    getRecommendations: async (selections?: Partial<PerWorkoutOptions>) => {
      const analysis = await analyze(selections);
      return analysis?.recommendations || [];
    },
    applyRecommendation: (recommendationId: string) => {
      trackAIInteraction({
        type: 'recommendation_accepted',
        component: 'recommendations',
        data: { recommendationId }
      });
    },
    dismissRecommendation: (recommendationId: string) => {
      trackAIInteraction({
        type: 'recommendation_rejected',
        component: 'recommendations',
        data: { recommendationId }
      });
    }
  };
};

export const useAIInsights = (component: string) => {
  const { getEnergyInsights, getSorenessInsights, trackAIInteraction } = useAI();
  
  return {
    getEnergyInsights: (value: number) => {
      const insights = getEnergyInsights(value);
      trackAIInteraction({
        type: 'insight_shown',
        component,
        data: { value, insightsCount: insights.length }
      });
      return insights;
    },
    getSorenessInsights: (value: number) => {
      const insights = getSorenessInsights(value);
      trackAIInteraction({
        type: 'insight_shown',
        component,
        data: { value, insightsCount: insights.length }
      });
      return insights;
    }
  };
};

export const useAIHealth = () => {
  const { aiService, serviceStatus, environmentStatus } = useAI();
  
  const getHealthStatus = () => {
    try {
      const healthStatus = aiService.getHealthStatus();
      return {
        ...healthStatus,
        serviceStatus,
        environmentStatus,
        isHealthy: healthStatus.status === 'healthy' && serviceStatus === 'ready',
        hasEnvironmentIssues: environmentStatus.issues.length > 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error),
          serviceStatus,
          hasEnvironmentIssues: environmentStatus.issues.length > 0
        },
        isHealthy: false,
        hasEnvironmentIssues: environmentStatus.issues.length > 0
      };
    }
  };
  
  return {
    isHealthy: () => {
      const health = getHealthStatus();
      return health.isHealthy;
    },
    getHealthStatus,
    getPerformanceMetrics: () => aiService.getPerformanceMetrics(),
    getEnvironmentIssues: () => environmentStatus.issues,
    getEnvironmentRecommendations: () => environmentStatus.recommendations
  };
};

export const useMigrationStatus = () => {
  const { featureFlags, abTestResults, developmentTools } = useAI();
  
  return {
    migrationStatus: {
      unifiedServiceRollout: featureFlags.ai_service_unified,
      crossComponentRollout: featureFlags.ai_cross_component_analysis,
      realTimeInsightsRollout: featureFlags.ai_real_time_insights,
      learningSystemRollout: featureFlags.ai_learning_system
    },
    migrationReport: {
      totalFlags: Object.keys(featureFlags).length,
      enabledFlags: Object.values(featureFlags).filter(Boolean).length,
      abTestResults: abTestResults
    },
    controls: developmentTools
  };
};

// Legacy compatibility functions (simplified versions)
function getLegacyEnergyInsights(value: number): any[] {
  // Simplified legacy energy insights
  if (value <= 2) {
    return [{
      id: 'energy_low_legacy',
      type: 'warning',
      message: 'Low energy detected - consider shorter workout or recovery focus',
      confidence: 0.8,
      actionable: true
    }];
  }
  return [];
}

function getLegacySorenessInsights(value: number | any): any[] {
  // Simplified legacy soreness insights
  // Handle both number and CategoryRatingData types
  const sorenessLevel = typeof value === 'number' ? value : 2;
  
  if (sorenessLevel >= 4) {
    return [{
      id: 'soreness_high_legacy',
      type: 'warning',
      message: 'High soreness levels - focus on recovery and gentle movement',
      confidence: 0.8,
      actionable: true
    }];
  }
  return [];
}

function getLegacyAnalysis(selections: PerWorkoutOptions, userProfile: UserProfile): any {
  // Simplified legacy analysis
  return {
    insights: {
      energy: getLegacyEnergyInsights(selections.customization_energy || 3),
      soreness: getLegacySorenessInsights(selections.customization_soreness || 2)
    },
    crossComponentConflicts: [],
    recommendations: [],
    confidence: 0.7,
    reasoning: 'Basic legacy analysis'
  };
}

// Development-only component for AI debugging
export const AIDevTools: React.FC = () => {
  const { developmentTools, featureFlags, abTestResults, serviceStatus } = useAI();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">AI Debug Panel</h3>
      
      <div className="mb-2">
        <strong>Service Status:</strong> {serviceStatus}
      </div>
      
      <div className="mb-2">
        <strong>Feature Flags:</strong>
        <ul className="text-sm">
          {Object.entries(featureFlags).map(([flag, enabled]) => (
            <li key={flag} className={enabled ? 'text-green-400' : 'text-red-400'}>
              {flag}: {enabled ? 'ON' : 'OFF'}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-1">
        <button
          onClick={() => developmentTools.overrideFlag('ai_service_unified', true)}
          className="block w-full text-left px-2 py-1 bg-blue-600 rounded text-xs"
        >
          Enable Unified Service
        </button>
        <button
          onClick={() => developmentTools.overrideFlag('ai_service_unified', false)}
          className="block w-full text-left px-2 py-1 bg-red-600 rounded text-xs"
        >
          Disable Unified Service
        </button>
        <button
          onClick={() => console.log('Flag Config:', developmentTools.exportFlags())}
          className="block w-full text-left px-2 py-1 bg-gray-600 rounded text-xs"
        >
          Export Flag Config
        </button>
      </div>
    </div>
  );
}; 