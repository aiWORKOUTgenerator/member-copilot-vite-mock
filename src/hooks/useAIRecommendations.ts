import { useCallback } from 'react';
import { useAIService } from './useAIService';
import { useAIAnalytics } from '../contexts/composition/AIAnalyticsProvider';
import { aiLogger } from '../services/ai/logging/AILogger';
import { AIRecommendation, AIInteractionType } from '../types/ai-context.types';
import { PrioritizedRecommendation } from '../services/ai/core/types/AIServiceTypes';

/**
 * Hook for AI-powered recommendations
 * 
 * This hook provides:
 * - Recommendation generation with analytics tracking
 * - Recommendation filtering and prioritization
 * - Error handling and logging
 */
export const useAIRecommendations = (component: string) => {
  // Get core services
  const { aiService, currentUserProfile, currentSelections } = useAIService();
  const { trackAIInteraction } = useAIAnalytics();

  // Get recommendations with analytics
  const getRecommendations = useCallback(async (): Promise<PrioritizedRecommendation[]> => {
    try {
      // Track recommendation request
      trackAIInteraction({
        type: 'insight_shown' as AIInteractionType,
        component,
        data: {
          type: 'recommendations',
          hasUserProfile: !!currentUserProfile,
          hasSelections: Object.keys(currentSelections).length > 0
        }
      });

      // Get recommendations
      const recommendations = await aiService.generateRecommendations({
        userProfile: currentUserProfile!,
        currentSelections,
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      });

      // Track recommendation result
      trackAIInteraction({
        type: 'insight_applied' as AIInteractionType,
        component,
        data: {
          type: 'recommendations',
          count: recommendations.length,
          categories: recommendations.map(r => r.category)
        }
      });

      return recommendations;
    } catch (error) {
      // Track recommendation error
      trackAIInteraction({
        type: 'insight_shown' as AIInteractionType,
        component,
        data: {
          type: 'recommendations_error',
          error: error instanceof Error ? error.message : String(error)
        }
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'recommendations',
        component,
        severity: 'medium',
        userImpact: false
      });

      return [];
    }
  }, [aiService, component, currentUserProfile, currentSelections, trackAIInteraction]);

  // Get prioritized recommendations by analyzing current state
  const getPrioritizedRecommendations = useCallback(async (): Promise<PrioritizedRecommendation[]> => {
    try {
      // Track prioritized recommendation request
      trackAIInteraction({
        type: 'insight_shown' as AIInteractionType,
        component,
        data: {
          type: 'prioritized_recommendations',
          hasUserProfile: !!currentUserProfile
        }
      });

      // Get recommendations through analysis
      const analysis = await aiService.analyze(currentSelections);
      const recommendations = analysis.recommendations || [];

      // Track recommendation result
      trackAIInteraction({
        type: 'insight_applied' as AIInteractionType,
        component,
        data: {
          type: 'prioritized_recommendations',
          count: recommendations.length,
          priorities: recommendations.map(r => r.priority)
        }
      });

      return recommendations;
    } catch (error) {
      // Track recommendation error
      trackAIInteraction({
        type: 'insight_shown' as AIInteractionType,
        component,
        data: {
          type: 'prioritized_recommendations_error',
          error: error instanceof Error ? error.message : String(error)
        }
      });

      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'prioritized recommendations',
        component,
        severity: 'medium',
        userImpact: false
      });

      return [];
    }
  }, [aiService, component, currentUserProfile, currentSelections, trackAIInteraction]);

  // Handle recommendation acceptance
  const acceptRecommendation = useCallback((recommendation: PrioritizedRecommendation) => {
    trackAIInteraction({
      type: 'recommendation_accepted' as AIInteractionType,
      component,
      data: {
        recommendationId: recommendation.id,
        category: recommendation.category,
        priority: recommendation.priority
      }
    });
  }, [component, trackAIInteraction]);

  // Handle recommendation rejection
  const rejectRecommendation = useCallback((recommendation: PrioritizedRecommendation) => {
    trackAIInteraction({
      type: 'recommendation_rejected' as AIInteractionType,
      component,
      data: {
        recommendationId: recommendation.id,
        category: recommendation.category,
        priority: recommendation.priority
      }
    });
  }, [component, trackAIInteraction]);

  return {
    // Recommendation operations
    getRecommendations,
    getPrioritizedRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    
    // Current state
    currentUserProfile,
    currentSelections
  };
}; 