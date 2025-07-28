import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AIService } from '../../services/ai/core/AIService';
import { UserProfile, PerWorkoutOptions } from '../../types';
import { openAIStrategy } from '../../services/ai/external/OpenAIStrategy';
import { checkEnvironmentConfiguration } from '../../services/ai/external/config/openai.config';
import { aiContextMonitor } from '../../services/ai/monitoring/AIContextMonitor';
import { aiLogger } from '../../services/ai/logging/AILogger';
import {
  AIAnalysisResult,
  GeneratedWorkout,
  WorkoutGenerationRequest,
  AIServiceHealthStatus
} from '../../types/ai-context.types';
import {
  EnergyInsight,
  SorenessInsight
} from '../../types/ai-insights.types';
import { PrioritizedRecommendation } from '../../services/ai/core/types/AIServiceTypes';

// Core AI Service Context Types
interface AIServiceContextValue {
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
  
  // Service Control
  initialize: (userProfile: UserProfile) => Promise<void>;
  updateSelections: (selections: Partial<PerWorkoutOptions>) => void;
  
  // Enhanced Methods
  getEnergyInsights: (value: number) => EnergyInsight[];
  getSorenessInsights: (value: number) => SorenessInsight[];
  analyze: (partialSelections?: Partial<PerWorkoutOptions>) => Promise<AIAnalysisResult | null>;
  generateWorkout: (workoutData: PerWorkoutOptions | WorkoutGenerationRequest) => Promise<GeneratedWorkout | null>;
  getEnhancedRecommendations: () => Promise<PrioritizedRecommendation[]>;
  getEnhancedInsights: () => Promise<AIAnalysisResult | null>;
  analyzeUserPreferences: () => Promise<AIAnalysisResult | null>;
  
  // DevTools Integration
  getServiceHealth: () => AIServiceHealthStatus;
  getDebugInfo: () => {
    initializationTime: number | null;
    lastError: Error | null;
    operationCount: number;
    successRate: number;
  };
}

// Create the context
const AIServiceContext = createContext<AIServiceContextValue | undefined>(undefined);

// Provider component
export const AIServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core state management
  const [aiService] = useState(() => new AIService());
  const [serviceStatus, setServiceStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [environmentStatus, setEnvironmentStatus] = useState({
    isConfigured: false,
    hasApiKey: false,
    isDevelopment: false,
    issues: [] as string[],
    recommendations: [] as string[]
  });
  
  // User profile and selections state
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentSelections, setCurrentSelections] = useState<PerWorkoutOptions>({});
  
  // DevTools monitoring state
  const [operationStats, setOperationStats] = useState({
    initializationTime: null as number | null,
    lastError: null as Error | null,
    operationCount: 0,
    successCount: 0
  });

  // Initialize environment configuration
  useEffect(() => {
    const status = checkEnvironmentConfiguration();
    setEnvironmentStatus(status);
    
    if (process.env.NODE_ENV === 'development') {
      aiLogger.debug('AIServiceProvider: Environment status initialized', { status });
    }
  }, []);

  // Track operation statistics for DevTools
  const trackOperation = useCallback((success: boolean, error?: Error) => {
    setOperationStats(prev => ({
      ...prev,
      operationCount: prev.operationCount + 1,
      successCount: success ? prev.successCount + 1 : prev.successCount,
      lastError: error || prev.lastError
    }));
  }, []);

  // Initialize AI service
  const initialize = useCallback(async (userProfile: UserProfile) => {
    if (serviceStatus !== 'ready') {
      const startTime = Date.now();
      setServiceStatus('initializing');
      
      try {
        // Set up AI service context
        await aiService.setContext({
          userProfile,
          openAIStrategy,
          environmentStatus
        });
        
        setCurrentUserProfile(userProfile);
        setServiceStatus('ready');
        
        const initTime = Date.now() - startTime;
        
        // Update DevTools stats
        setOperationStats(prev => ({
          ...prev,
          initializationTime: initTime,
          operationCount: prev.operationCount + 1,
          successCount: prev.successCount + 1
        }));
        
        // Record successful initialization
        aiContextMonitor.recordStatusChange('ready');
        aiContextMonitor.recordPerformance('initialization', initTime);
        
        if (process.env.NODE_ENV === 'development') {
          aiLogger.info('AIServiceProvider: AI service initialized successfully', {
            initializationTime: initTime
          });
        }
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error(String(error));
        setServiceStatus('error');
        
        // Update DevTools stats
        setOperationStats(prev => ({
          ...prev,
          lastError: typedError,
          operationCount: prev.operationCount + 1
        }));
        
        // Record initialization error
        aiContextMonitor.recordError('initialization', typedError);
        
        if (process.env.NODE_ENV === 'development') {
          aiLogger.error({
            error: typedError,
            context: 'AI service initialization',
            component: 'AIServiceProvider',
            severity: 'high',
            userImpact: true
          });
        }
        
        throw typedError;
      }
    }
  }, [aiService, serviceStatus, environmentStatus]);

  // Update selections with type safety
  const updateSelections = useCallback((selections: Partial<PerWorkoutOptions>) => {
    setCurrentSelections(prev => ({ ...prev, ...selections }));
    trackOperation(true);
  }, [trackOperation]);

  // AI service methods with enhanced error handling and monitoring
  const getEnergyInsights = useCallback((value: number): EnergyInsight[] => {
    if (!currentUserProfile) return [];
    
    try {
      const insights = aiService.getEnergyInsights(value, currentUserProfile);
      trackOperation(true);
      return insights;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('energy_insights', typedError);
      return [];
    }
  }, [aiService, currentUserProfile, trackOperation]);

  const getSorenessInsights = useCallback((value: number): SorenessInsight[] => {
    if (!currentUserProfile) return [];
    
    try {
      const insights = aiService.getSorenessInsights(value, currentUserProfile);
      trackOperation(true);
      return insights;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('soreness_insights', typedError);
      return [];
    }
  }, [aiService, currentUserProfile, trackOperation]);

  const analyze = useCallback(async (partialSelections?: Partial<PerWorkoutOptions>): Promise<AIAnalysisResult | null> => {
    if (!currentUserProfile) return null;
    
    try {
      const selections = { ...currentSelections, ...partialSelections };
      const result = await aiService.analyze(selections, currentUserProfile);
      trackOperation(true);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('analysis', typedError);
      return null;
    }
  }, [aiService, currentUserProfile, currentSelections, trackOperation]);

  const generateWorkout = useCallback(async (workoutData: PerWorkoutOptions | WorkoutGenerationRequest): Promise<GeneratedWorkout | null> => {
    if (!currentUserProfile) return null;
    
    try {
      const result = await aiService.generateWorkout(workoutData);
      trackOperation(true);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('workout_generation', typedError);
      return null;
    }
  }, [aiService, currentUserProfile, trackOperation]);

  const getEnhancedRecommendations = useCallback(async (): Promise<PrioritizedRecommendation[]> => {
    try {
      const context = aiService.getContext();
      if (!context) {
        throw new Error('AI service context not set');
      }
      const recommendations = await aiService.generateRecommendations(context);
      trackOperation(true);
      return recommendations;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('enhanced_recommendations', typedError);
      return [];
    }
  }, [aiService, trackOperation]);

  const getEnhancedInsights = useCallback(async (): Promise<AIAnalysisResult | null> => {
    try {
      const context = aiService.getContext();
      if (!context) {
        throw new Error('AI service context not set');
      }
      const insights = await aiService.enhanceInsights([], context);
      trackOperation(true);
      return insights;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('enhanced_insights', typedError);
      return null;
    }
  }, [aiService, trackOperation]);

  const analyzeUserPreferences = useCallback(async (): Promise<AIAnalysisResult | null> => {
    try {
      const context = aiService.getContext();
      if (!context) {
        throw new Error('AI service context not set');
      }
      const result = await aiService.analyzeUserPreferences(context);
      trackOperation(true);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      trackOperation(false, typedError);
      aiContextMonitor.recordError('user_preferences', typedError);
      return null;
    }
  }, [aiService, trackOperation]);

  // DevTools integration methods
  const getServiceHealth = useCallback((): AIServiceHealthStatus => {
    const { operationCount, successCount } = operationStats;
    const successRate = operationCount > 0 ? successCount / operationCount : 1;
    
    return {
      status: serviceStatus === 'ready' ? 'healthy' : serviceStatus === 'error' ? 'unhealthy' : 'degraded',
      uptime: operationStats.initializationTime || 0,
      responseTime: aiService.getAverageResponseTime(),
      errorRate: 1 - successRate,
      lastError: operationStats.lastError?.message,
      details: {
        environmentStatus,
        operationStats: {
          total: operationCount,
          successful: successCount,
          successRate
        }
      }
    };
  }, [serviceStatus, operationStats, environmentStatus, aiService]);

  const getDebugInfo = useCallback(() => ({
    initializationTime: operationStats.initializationTime,
    lastError: operationStats.lastError,
    operationCount: operationStats.operationCount,
    successRate: operationStats.operationCount > 0 
      ? operationStats.successCount / operationStats.operationCount 
      : 1
  }), [operationStats]);

  // Context value with DevTools integration
  const contextValue: AIServiceContextValue = {
    aiService,
    serviceStatus,
    environmentStatus,
    initialize,
    updateSelections,
    getEnergyInsights,
    getSorenessInsights: getSorenessInsights as any, // TODO: Implement with proper types
    analyze: analyze as any, // TODO: Implement with proper types
    generateWorkout: generateWorkout as any, // TODO: Implement with proper types
    getEnhancedRecommendations: getEnhancedRecommendations as any, // TODO: Implement with proper types
    getEnhancedInsights: getEnhancedInsights as any, // TODO: Implement with proper types
    analyzeUserPreferences: analyzeUserPreferences as any, // TODO: Implement with proper types
    getServiceHealth,
    getDebugInfo
  };

  return (
    <AIServiceContext.Provider value={contextValue}>
      {children}
    </AIServiceContext.Provider>
  );
};

// Hook for accessing AI service context
export const useAIService = (): AIServiceContextValue => {
  const context = useContext(AIServiceContext);
  if (context === undefined) {
    throw new Error('useAIService must be used within an AIServiceProvider');
  }
  return context;
}; 