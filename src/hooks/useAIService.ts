import { useCallback, useEffect, useState } from 'react';
import { AIService } from '../services/ai/core/AIService';
import { UserProfile, PerWorkoutOptions } from '../types';
import { aiLogger } from '../services/ai/logging/AILogger';
import { useAIHealth } from './useAIHealth';
import { useAIFeatureFlags } from '../contexts/composition/AIFeatureFlagsProvider';
import { GlobalAIContext } from '../services/ai/core/types/AIServiceTypes';
import { openAIStrategy } from '../services/ai/external/OpenAIStrategy';

/**
 * Core AI service hook for managing service lifecycle and basic operations
 * 
 * This hook provides:
 * - Service initialization
 * - Basic operations (analyze, generate)
 * - Service status management
 * - Error handling
 */
export const useAIService = () => {
  // Core service state
  const [aiService] = useState(() => {
    const service = new AIService();
    // Set OpenAI strategy immediately when service is created
    service.setOpenAIStrategy(openAIStrategy);
    return service;
  });
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentSelections, setCurrentSelections] = useState<PerWorkoutOptions>({});
  
  // Get health and feature flag contexts
  const health = useAIHealth();
  const { isFeatureEnabled } = useAIFeatureFlags();

  // Initialize AI service
  const initialize = useCallback(async (userProfile: UserProfile) => {
    try {
      // Set up AI service context
      await aiService.setContext({
        userProfile,
        currentSelections: {},
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      } as GlobalAIContext);
      
      setCurrentUserProfile(userProfile);
      
      if (process.env.NODE_ENV === 'development') {
        aiLogger.debug('useAIService: Service initialized', {
          userProfile: {
            fitnessLevel: userProfile.fitnessLevel,
            goals: userProfile.goals
          }
        });
      }
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'service initialization',
        component: 'useAIService',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }, [aiService]);

  // Update workout selections
  const updateSelections = useCallback((selections: Partial<PerWorkoutOptions>) => {
    setCurrentSelections(prev => ({ ...prev, ...selections }));
    
    // Update service context if real-time insights enabled
    if (isFeatureEnabled('ai_real_time_insights')) {
      const context = aiService.getContext();
      if (context) {
        aiService.setContext({
          ...context,
          currentSelections: { ...context.currentSelections, ...selections }
        }).catch(error => {
          aiLogger.error({
            error: error instanceof Error ? error : new Error(String(error)),
            context: 'selections update',
            component: 'useAIService',
            severity: 'medium',
            userImpact: false
          });
        });
      }
    }
  }, [aiService, isFeatureEnabled]);

  // Analyze current state
  const analyze = useCallback(async (partialSelections?: Partial<PerWorkoutOptions>) => {
    if (!currentUserProfile) return null;
    
    try {
      const selections = { ...currentSelections, ...partialSelections };
      return await aiService.analyze(selections);
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'analysis',
        component: 'useAIService',
        severity: 'medium',
        userImpact: false
      });
      return null;
    }
  }, [aiService, currentUserProfile, currentSelections]);

  // Generate workout
  const generateWorkout = useCallback(async (workoutData: PerWorkoutOptions | { userProfile: UserProfile; selections: PerWorkoutOptions }) => {
    // Handle both parameter types for backward compatibility
    let userProfile: UserProfile;
    let selections: PerWorkoutOptions;

    if ('userProfile' in workoutData && 'selections' in workoutData) {
      // It's a request with userProfile and selections
      userProfile = workoutData.userProfile;
      selections = workoutData.selections;
    } else {
      // It's just PerWorkoutOptions - use currentUserProfile
      if (!currentUserProfile) {
        throw new Error('User profile required for workout generation');
      }
      userProfile = currentUserProfile;
      selections = workoutData as PerWorkoutOptions;
    }

    try {
      console.log('🔍 DEBUG - useAIService.generateWorkout called with:', {
        hasUserProfile: !!userProfile,
        userProfileKeys: Object.keys(userProfile),
        workoutDataKeys: Object.keys(selections),
        workoutData: selections
      });

      const result = await aiService.generateWorkout({
        userProfile: userProfile,
        selections: selections
      });

      console.log('🔍 DEBUG - useAIService.generateWorkout returned:', {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : 'null'
      });

      return result;
    } catch (error) {
      console.error('🔍 CRITICAL - useAIService.generateWorkout error:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout generation',
        component: 'useAIService',
        severity: 'high',
        userImpact: true
      });
      return null;
    }
  }, [aiService, currentUserProfile]);

  // Monitor service health
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const healthStatus = health.getHealthStatus();
      aiLogger.debug('useAIService: Service health status', {
        status: healthStatus.status,
        details: healthStatus.details
      });
    }
  }, [health]);

  return {
    // Service state
    currentUserProfile,
    currentSelections,
    
    // Service operations
    initialize,
    updateSelections,
    analyze,
    generateWorkout,
    
    // Service instance (for other hooks)
    aiService
  };
}; 