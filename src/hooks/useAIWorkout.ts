import { useCallback } from 'react';
import { PerWorkoutOptions } from '../types';
import { useAIService } from './useAIService';
import { useAIAnalytics } from '../contexts/composition/AIAnalyticsProvider';
import { aiLogger } from '../services/ai/logging/AILogger';
import { AIInteractionType, AIAnalysisResult } from '../types/ai-context.types';

/**
 * Hook for AI-powered workout generation
 * 
 * This hook provides:
 * - Workout generation with analytics tracking
 * - Workout analysis and insights
 * - Error handling and logging
 */
export const useAIWorkout = (component: string) => {
  // Get core services
  const { currentUserProfile, currentSelections, analyze, generateWorkout } = useAIService();
  const { trackAIInteraction } = useAIAnalytics();

  // Generate workout with analytics
  const generateWorkoutWithAnalytics = useCallback(async (options: PerWorkoutOptions) => {
    try {
      // Track generation attempt
      trackAIInteraction({
        type: 'workout_request' as AIInteractionType,
        component,
        data: {
          options,
          hasUserProfile: !!currentUserProfile
        }
      });

      // Generate workout
      const workout = await generateWorkout(options);

      // Track generation result
      trackAIInteraction({
        type: 'workout_success' as AIInteractionType,
        component,
        data: {
          success: !!workout,
          options,
          workoutId: workout?.id
        }
      });

      return workout;
    } catch (error) {
      // Track generation error
      trackAIInteraction({
        type: 'workout_error' as AIInteractionType,
        component,
        data: {
          error: error instanceof Error ? error.message : String(error),
          options
        }
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout generation',
        component,
        severity: 'high',
        userImpact: true
      });

      return null;
    }
  }, [component, currentUserProfile, generateWorkout, trackAIInteraction]);

  // Analyze workout options
  const analyzeWorkoutOptions = useCallback(async (options?: Partial<PerWorkoutOptions>) => {
    try {
      // Track analysis attempt
      trackAIInteraction({
        type: 'analysis_request' as AIInteractionType,
        component,
        data: {
          options,
          currentSelections
        }
      });

      // Analyze options
      const analysis = await analyze(options);

      // Track analysis result
      trackAIInteraction({
        type: 'analysis_success' as AIInteractionType,
        component,
        data: {
          success: !!analysis,
          hasInsights: Object.values(analysis?.insights || {}).some(arr => arr.length > 0),
          hasRecommendations: (analysis?.recommendations || []).length > 0
        }
      });

      return analysis;
    } catch (error) {
      // Track analysis error
      trackAIInteraction({
        type: 'analysis_error' as AIInteractionType,
        component,
        data: {
          error: error instanceof Error ? error.message : String(error),
          options
        }
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout analysis',
        component,
        severity: 'medium',
        userImpact: false
      });

      return null;
    }
  }, [analyze, component, currentSelections, trackAIInteraction]);

  return {
    // Core operations
    generateWorkout: generateWorkoutWithAnalytics,
    analyzeWorkout: analyzeWorkoutOptions,
    
    // Current state
    currentUserProfile,
    currentSelections
  };
}; 