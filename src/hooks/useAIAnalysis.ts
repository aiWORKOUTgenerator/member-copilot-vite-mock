import { useCallback } from 'react';
import { PerWorkoutOptions } from '../types';
import { useAIService } from './useAIService';
import { useAIAnalytics } from '../contexts/composition/AIAnalyticsProvider';
import { aiLogger } from '../services/ai/logging/AILogger';
import { AIAnalysisResult } from '../types/ai-context.types';

/**
 * Hook for AI-powered analysis operations
 * 
 * This hook provides:
 * - Workout analysis with analytics tracking
 * - Cross-component analysis
 * - Error handling and logging
 */
export const useAIAnalysis = (component: string) => {
  // Get core services
  const { currentUserProfile, currentSelections, analyze: coreAnalyze } = useAIService();
  const { trackAIInteraction } = useAIAnalytics();

  // Analyze workout options with analytics
  const analyzeWorkout = useCallback(async (options?: Partial<PerWorkoutOptions>): Promise<AIAnalysisResult | null> => {
    try {
      // Track analysis attempt
      trackAIInteraction({
        type: 'analysis_request',
        component,
        data: {
          options,
          currentSelections
        }
      });

      // Perform analysis
      const analysis = await coreAnalyze(options);

      // Track analysis result
      trackAIInteraction({
        type: 'analysis_success',
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
        type: 'analysis_error',
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
  }, [coreAnalyze, component, currentSelections, trackAIInteraction]);

  // Analyze cross-component interactions
  const analyzeCrossComponent = useCallback(async (options?: Partial<PerWorkoutOptions>): Promise<AIAnalysisResult | null> => {
    try {
      // Track cross-component analysis attempt
      trackAIInteraction({
        type: 'analysis_request',
        component,
        data: {
          type: 'cross_component',
          options,
          currentSelections
        }
      });

      // Perform analysis with cross-component flag
      const analysis = await coreAnalyze({
        ...options,
        crossComponentEnabled: true
      });

      // Track analysis result
      trackAIInteraction({
        type: 'analysis_success',
        component,
        data: {
          type: 'cross_component',
          success: !!analysis,
          conflictCount: analysis?.crossComponentConflicts?.length || 0
        }
      });

      return analysis;
    } catch (error) {
      // Track analysis error
      trackAIInteraction({
        type: 'analysis_error',
        component,
        data: {
          type: 'cross_component',
          error: error instanceof Error ? error.message : String(error),
          options
        }
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'cross-component analysis',
        component,
        severity: 'medium',
        userImpact: false
      });

      return null;
    }
  }, [coreAnalyze, component, currentSelections, trackAIInteraction]);

  return {
    // Analysis operations
    analyzeWorkout,
    analyzeCrossComponent,
    
    // Current state
    currentUserProfile,
    currentSelections
  };
}; 