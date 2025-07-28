/**
 * AI Context Provider - Core Service Management
 * 
 * This context provider manages the core AI service lifecycle.
 * For additional functionality, see:
 * - AIFeatureFlagsProvider: Feature flag management
 * - AIAnalyticsProvider: Analytics and tracking
 * - AIHealthProvider: Health monitoring
 * - AIDevToolsDemo: Development tools demo component
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { AIService } from '../services/ai/core/AIService';
import { UserProfile, PerWorkoutOptions } from '../types';
import { aiLogger } from '../services/ai/logging/AILogger';
import { checkEnvironmentConfiguration } from '../services/ai/external/config/openai.config';
import { openAIStrategy } from '../services/ai/external/OpenAIStrategy';
import { aiContextMonitor } from '../services/ai/monitoring/AIContextMonitor';
import { WorkoutGenerationRequest, GeneratedWorkout } from '../types/ai-context.types';
import { useAIRecommendations, useAIInsights, useAIHealth, useMigrationStatus, useAIDebug } from '../hooks';

interface AIContextValue {
  // Core AI Service
  aiService: AIService;
  serviceStatus: 'initializing' | 'ready' | 'error';
  
  // Environment Status
  environmentStatus: {
    isConfigured: boolean;
    hasApiKey: boolean;
    isDevelopment: boolean;
    issues: string[];
    recommendations: string[];
  };
  
  // Core Operations
  initialize: (userProfile: UserProfile) => Promise<void>;
  updateSelections: (selections: Partial<PerWorkoutOptions>) => void;
  generateWorkout: (workoutData: PerWorkoutOptions | WorkoutGenerationRequest) => Promise<GeneratedWorkout | null>;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core state
  const [aiService] = useState(() => new AIService());
  const [serviceStatus, setServiceStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentSelections, setCurrentSelections] = useState<PerWorkoutOptions>({});
  
  // Initialization tracking
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [lastInitializationError, setLastInitializationError] = useState<string | null>(null);
  const [initializationStartTime, setInitializationStartTime] = useState<Date | null>(null);
  const [initializationEndTime, setInitializationEndTime] = useState<Date | null>(null);
  
  // Environment validation state
  const [environmentStatus, setEnvironmentStatus] = useState(() => checkEnvironmentConfiguration());

  // Check environment configuration on mount
  useEffect(() => {
    aiLogger.info('AIProvider: Initializing environment configuration...');
    const status = checkEnvironmentConfiguration();
    setEnvironmentStatus(status);
    
    aiLogger.info('AIProvider: Environment status set', {
      isConfigured: status.isConfigured,
      hasApiKey: status.hasApiKey,
      isDevelopment: status.isDevelopment,
      issuesCount: status.issues.length,
      recommendationsCount: status.recommendations.length
    });
    
    if (status.isDevelopment && !status.isConfigured) {
      aiLogger.warn('AI Environment Configuration Issues Detected');
      aiLogger.warn('AI Environment Issues', { issues: status.issues });
      aiLogger.warn('AI Environment Recommendations', { recommendations: status.recommendations });
    }
  }, []);

  // Initialize AI service
  const initialize = useCallback(async (userProfile: UserProfile) => {
    // Start monitoring this initialization attempt
    const monitor = aiContextMonitor.recordInitializationAttempt(userProfile);
    
    // Simple guard to prevent multiple initializations
    if (isInitializing) {
      aiLogger.info('AIProvider: Already initializing, skipping duplicate request');
      return;
    }
    
    // Simple guard to prevent re-initialization if already done
    if (hasInitialized) {
      aiLogger.info('AIProvider: Already initialized, skipping');
      return;
    }
    
    const attemptNumber = initializationAttempts + 1;
    const startTime = new Date();
    
    aiLogger.info('AIProvider: Starting AI service initialization', { 
      userProfile: { 
        fitnessLevel: userProfile.fitnessLevel, 
        goals: userProfile.goals
      }
    });
    
    setIsInitializing(true);
    setInitializationAttempts(attemptNumber);
    setInitializationStartTime(startTime);
    setLastInitializationError(null);
    
    try {
      // Validate user profile before initialization
      aiLogger.debug('AIProvider: Validating user profile...');
      
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
      
      aiLogger.info('AIProvider: User profile validation passed');
      
      setServiceStatus('initializing');
      setCurrentUserProfile(userProfile);
      
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
          aiAssistanceLevel: 'moderate' as const,
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };
      
      aiLogger.info('AIProvider: Setting AI service context...');
      await aiService.setContext(context);
      aiLogger.info('AIProvider: AI service context set successfully');
      
      // Initialize OpenAI strategy for MVP
      aiLogger.info('AIProvider: Initializing OpenAI strategy...');
      aiService.setOpenAIStrategy(openAIStrategy);
      aiLogger.info('AIProvider: OpenAI strategy initialized');
      
      // Verify service is ready
      aiLogger.debug('AIProvider: Verifying service health...');
      const healthStatus = aiService.getHealthStatus();
      aiLogger.debug('AIProvider: AI service health status', { healthStatus });
      
      if (healthStatus.status === 'unhealthy') {
        throw new Error(`AI service health check failed: ${JSON.stringify(healthStatus.details)}`);
      }
      
      const endTime = new Date();
      
      setInitializationEndTime(endTime);
      setServiceStatus('ready');
      setHasInitialized(true);
      
      // Record successful initialization
      monitor.success();
      aiContextMonitor.recordStatusChange('ready');
      
      aiLogger.info('AIProvider: AI service initialization completed successfully', {
        duration: endTime.getTime() - startTime.getTime(),
        healthStatus: healthStatus.status,
        userProfile: {
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals
        }
      });
      
    } catch (error) {
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Record initialization failure
      monitor.failure(error instanceof Error ? error : new Error(errorMessage));
      aiContextMonitor.recordStatusChange('error');
      
      aiLogger.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        context: 'AIProvider: initialize',
        component: 'AIContext.tsx',
        severity: 'high',
        userImpact: true,
        metadata: {
          attemptNumber,
          duration: endTime.getTime() - startTime.getTime(),
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          userProfile: userProfile ? { 
            fitnessLevel: userProfile.fitnessLevel, 
            goals: userProfile.goals 
          } : 'null'
        }
      });
      
      setServiceStatus('error');
      setLastInitializationError(errorMessage);
      setInitializationEndTime(endTime);
      
      // Re-throw the error to allow calling code to handle it
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [
    aiService,
    isInitializing,
    hasInitialized,
    initializationAttempts,
    setIsInitializing,
    setInitializationAttempts,
    setInitializationStartTime,
    setLastInitializationError,
    setServiceStatus,
    setCurrentUserProfile,
    setInitializationEndTime,
    setHasInitialized
  ]);

  // Update workout selections
  const updateSelections = useCallback((selections: Partial<PerWorkoutOptions>) => {
    setCurrentSelections(prev => ({ ...prev, ...selections }));
    
    // Update the AI service context
    const currentContext = aiService.getContext();
    if (currentContext) {
      // Handle the promise with proper error boundaries and telemetry
      aiService.setContext({
        ...currentContext,
        currentSelections: { ...currentContext.currentSelections, ...selections }
      }).catch((error: Error) => {
        aiLogger.error({
          error,
          context: 'updateSelections',
          component: 'AIContext.tsx',
          severity: 'medium',
          userImpact: false,
          metadata: {
            selections,
            userProfile: currentUserProfile ? { fitnessLevel: currentUserProfile.fitnessLevel } : null
          }
        });
      });
    }
  }, [aiService, currentUserProfile]);

  // Generate workout
  const generateWorkout = useCallback(async (workoutData: PerWorkoutOptions | WorkoutGenerationRequest) => {
    if (!currentUserProfile) {
      throw new Error('User profile required for workout generation');
    }

    try {
      // Handle both parameter types for backward compatibility
      if ('userProfile' in workoutData && 'selections' in workoutData) {
        // It's a WorkoutGenerationRequest
        const request = workoutData as WorkoutGenerationRequest;
        
        aiLogger.debug('AIContext generateWorkout - request', {
          hasUserProfile: !!request.userProfile,
          hasSelections: !!request.selections,
          fitnessLevel: request.userProfile.fitnessLevel,
          selectionsKeys: Object.keys(request.selections ?? {})
        });
        
        return await aiService.generateWorkout(request);
      } else {
        // It's PerWorkoutOptions - convert to WorkoutGenerationRequest
        const request: WorkoutGenerationRequest = {
          userProfile: currentUserProfile,
          selections: workoutData as PerWorkoutOptions
        };
        
        aiLogger.debug('AIContext generateWorkout - converted options', {
          hasUserProfile: !!request.userProfile,
          selectionsKeys: Object.keys(request.selections ?? {})
        });
        
        return await aiService.generateWorkout(request);
      }
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'generateWorkout',
        component: 'AIContext.tsx',
        severity: 'high',
        userImpact: true,
        metadata: { workoutData }
      });
      return null;
    }
  }, [aiService, currentUserProfile]);

  // Context value
  const value: AIContextValue = useMemo(() => ({
    // Core service
    aiService,
    serviceStatus,
    environmentStatus,
    
    // Core operations
    initialize,
    updateSelections,
    generateWorkout
  }), [
    aiService,
    serviceStatus,
    environmentStatus,
    initialize,
    updateSelections,
    generateWorkout
  ]);

  return (
    <AIContext.Provider value={value}>
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

// Re-export extracted hooks for backward compatibility
export { useAIRecommendations, useAIInsights, useAIHealth, useMigrationStatus, useAIDebug }; 