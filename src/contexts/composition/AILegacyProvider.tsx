import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAIService } from './AIServiceProvider';
import { useAIFeatureFlags } from './AIFeatureFlagsProvider';
import { useAIAnalytics } from './AIAnalyticsProvider';
import { UserProfile, PerWorkoutOptions } from '../../types';
import { AIService } from '../../services/ai/core/AIService';
import { ABTestResults } from '../../services/ai/featureFlags/FeatureFlagService';
import { AIInteractionEvent, AIAnalysisResult, GeneratedWorkout, AIServiceHealthStatus } from '../../types/ai-context.types';
import { EnergyInsight, SorenessInsight } from '../../types/ai-insights.types';
import { PrioritizedRecommendation } from '../../services/ai/core/types/AIServiceTypes';
import { WorkoutGenerationRequest } from '../../types/ai-context.types';

// Legacy AI Context Interface (maintains exact same interface as original)
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
  getEnergyInsights: (value: number) => EnergyInsight[];
  getSorenessInsights: (value: number) => SorenessInsight[];
  analyze: (partialSelections?: Partial<PerWorkoutOptions>) => Promise<AIAnalysisResult | null>;
  
  // External AI Integration
  generateWorkout: (workoutData: PerWorkoutOptions | WorkoutGenerationRequest) => Promise<GeneratedWorkout | null>;
  getEnhancedRecommendations: () => Promise<PrioritizedRecommendation[]>;
  getEnhancedInsights: () => Promise<AIAnalysisResult | null>;
  analyzeUserPreferences: () => Promise<AIAnalysisResult | null>;
  
  // Development Tools
  enableValidation: boolean;
  setValidationMode: (enabled: boolean) => void;
  developmentTools: {
    overrideFlag: (flagId: string, enabled: boolean) => void;
    increaseRollout: (flagId: string, percentage: number) => void;
    getAnalytics: (flagId: string) => ABTestResults | null;
    exportFlags: () => Record<string, any>;
    checkEnvironment: () => void;
    validateState: () => AIServiceHealthStatus;
    getInitializationInfo: () => {
      attempts: number;
      lastError: string | null;
      startTime: Date | null;
      endTime: Date | null;
      duration: number | null;
    };
  };
}

// Create the legacy context
const AIContext = createContext<AIContextValue | undefined>(undefined);

// Legacy Provider component that composes all contexts
export const AILegacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get values from composed contexts
  const aiService = useAIService();
  const featureFlags = useAIFeatureFlags();
  const analytics = useAIAnalytics();

  // Compose the legacy context value
  const contextValue: AIContextValue = useMemo(() => ({
    // Core AI Service (from AIServiceProvider)
    aiService: aiService.aiService,
    serviceStatus: aiService.serviceStatus,
    environmentStatus: aiService.environmentStatus,
    
    // Feature Flag Support (from AIFeatureFlagsProvider)
    featureFlags: featureFlags.featureFlags,
    isFeatureEnabled: featureFlags.isFeatureEnabled,
    abTestResults: featureFlags.abTestResults,
    trackAIInteraction: featureFlags.trackAIInteraction,
    
    // Service Control (from AIServiceProvider)
    initialize: aiService.initialize,
    updateSelections: aiService.updateSelections,
    
    // Enhanced Methods (from AIServiceProvider)
    getEnergyInsights: aiService.getEnergyInsights,
    getSorenessInsights: aiService.getSorenessInsights,
    analyze: aiService.analyze,
    generateWorkout: aiService.generateWorkout,
    getEnhancedRecommendations: aiService.getEnhancedRecommendations,
    getEnhancedInsights: aiService.getEnhancedInsights,
    analyzeUserPreferences: aiService.analyzeUserPreferences,
    
    // Development Tools (from AIFeatureFlagsProvider)
    enableValidation: featureFlags.enableValidation,
    setValidationMode: featureFlags.setValidationMode,
    developmentTools: featureFlags.developmentTools
  }), [aiService, featureFlags]);

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

// Legacy hook for accessing AI context (maintains exact same interface)
export const useAI = (): AIContextValue => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AILegacyProvider');
  }
  return context;
}; 