// AI Context Provider - Manages AI service across the application
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AIService } from '../services/ai/core/AIService';
import { UserProfile, PerWorkoutOptions } from '../types';
import { featureFlagService, useFeatureFlags, FeatureFlag, ABTestResults, AnalyticsEvent } from '../services/ai/featureFlags/FeatureFlagService';
import { openAIStrategy } from '../services/ai/external/OpenAIStrategy';
import { openAIWorkoutGenerator } from '../services/ai/external/OpenAIWorkoutGenerator';
import { openAIConfig, isFeatureEnabled } from '../services/ai/external/config/openai.config';

// Enhanced AI Context with Feature Flag Support
interface AIContextValue {
  // Core AI Service
  aiService: AIService;
  serviceStatus: 'initializing' | 'ready' | 'error';
  
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

  // Initialize feature flags when user profile is available
  useEffect(() => {
    if (currentUserProfile) {
      const flags = featureFlagService.getAIFlags(currentUserProfile);
      setFeatureFlags(flags);
      
      // Set up analytics callback
      featureFlagService.setAnalyticsCallback((event: AnalyticsEvent) => {
        console.log('Feature Flag Analytics:', event);
        
        // In a real implementation, this would send to an analytics service
        // trackEvent('feature_flag', event);
      });
    }
  }, [currentUserProfile]);

  // Initialize AI service with user profile and feature flag context
  const initialize = useCallback(async (userProfile: UserProfile) => {
    try {
      setServiceStatus('initializing');
      setCurrentUserProfile(userProfile);
      
      // Get feature flags for this user
      const flags = featureFlagService.getAIFlags(userProfile);
      setFeatureFlags(flags);
      
      // Set up AI service context
      aiService.setContext({
        userProfile,
        currentSelections: {},
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      });
      
      // Initialize external AI strategy if enabled
      if (isFeatureEnabled('openai_workout_generation') || isFeatureEnabled('openai_enhanced_recommendations')) {
        aiService.setExternalStrategy(openAIStrategy);
      }
      
      setServiceStatus('ready');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setServiceStatus('error');
    }
  }, [aiService, enableValidation]);

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
    return currentUserProfile ? featureFlagService.isEnabled(flagId, currentUserProfile) : false;
  }, [currentUserProfile]);

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
    rejectRecommendation: (recommendationId: string) => {
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
    getInsights: (value: any) => {
      switch (component) {
        case 'energy':
          return getEnergyInsights(value);
        case 'soreness':
          return getSorenessInsights(value);
        default:
          return [];
      }
    },
    trackInsightShown: (insightId: string) => {
      trackAIInteraction({
        type: 'insight_shown',
        component,
        data: { insightId }
      });
    },
    trackInsightApplied: (insightId: string) => {
      trackAIInteraction({
        type: 'insight_applied',
        component,
        data: { insightId }
      });
    }
  };
};

export const useAIHealth = () => {
  const { serviceStatus, abTestResults, featureFlags } = useAI();
  
  return {
    isHealthy: serviceStatus === 'ready',
    serviceStatus,
    featureFlags,
    abTestResults,
    performanceMetrics: {
      // In a real implementation, these would come from monitoring
      responseTime: 85,
      cacheHitRate: 0.78,
      errorRate: 0.001
    }
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