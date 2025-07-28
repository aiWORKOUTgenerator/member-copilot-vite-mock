import { useMemo } from 'react';
import { useAIService } from './useAIService';
import { useAIAnalytics } from '../contexts/composition/AIAnalyticsProvider';
import { 
  EnergyInsight, 
  SorenessInsight, 
  EnergyLevel,
  SorenessLevel,
  ENERGY_INSIGHT_TEMPLATES,
  SORENESS_INSIGHT_TEMPLATES,
  createEnergyInsight,
  createSorenessInsight
} from '../types/ai-insights.types';
import { CategoryRatingData } from '../types/core';

/**
 * Hook for AI-powered insights with component-specific tracking
 * 
 * Provides methods to fetch energy and soreness insights with built-in
 * analytics tracking for the specific component using the hook.
 * 
 * @param component - Component identifier for analytics tracking
 * @returns Object containing insight methods
 */
export const useAIInsights = (component: string) => {
  const { aiService, analyze } = useAIService();
  const { trackAIInteraction } = useAIAnalytics();
  
  // Memoize the insight methods to prevent recreation on every render
  const insightMethods = useMemo(() => ({
    /**
     * Get AI-generated energy insights with component tracking
     * 
     * @param value - Energy level value (1-10 scale)
     * @returns Array of energy insights
     */
    getEnergyInsights: async (value: number): Promise<EnergyInsight[]> => {
      const energyRating: CategoryRatingData = {
        rating: value,
        categories: value <= 3 ? ['low_energy'] : value >= 7 ? ['high_energy'] : ['moderate_energy']
      };
      
      const analysis = await analyze({ customization_energy: energyRating });
      const insights = analysis?.insights?.energy || [];
      
      // Convert insights to EnergyInsights using templates
      const energyLevel = Math.max(1, Math.min(5, Math.ceil(value / 2))) as EnergyLevel;
      const template = value <= 3 
        ? 'LOW_ENERGY' 
        : value >= 7 
          ? 'HIGH_ENERGY' 
          : 'MODERATE_ENERGY';
      
      const energyInsights: EnergyInsight[] = insights.length > 0 
        ? insights.map(insight => ({
            ...createEnergyInsight(energyLevel, template),
            message: insight.message || ENERGY_INSIGHT_TEMPLATES[template].message
          }))
        : [createEnergyInsight(energyLevel, template)];
      
      trackAIInteraction({
        type: 'insight_shown',
        component,
        data: { value, insightsCount: energyInsights.length }
      });
      
      return energyInsights;
    },
    
    /**
     * Get AI-generated soreness insights with component tracking
     * 
     * @param value - Soreness level value (1-10 scale)
     * @returns Array of soreness insights
     */
    getSorenessInsights: async (value: number): Promise<SorenessInsight[]> => {
      const sorenessRating: CategoryRatingData = {
        rating: value,
        categories: value <= 3 ? ['low_soreness'] : value >= 7 ? ['high_soreness'] : ['moderate_soreness']
      };
      
      const analysis = await analyze({ customization_soreness: sorenessRating });
      const insights = analysis?.insights?.soreness || [];
      
      // Convert insights to SorenessInsights using templates
      const sorenessLevel = Math.max(1, Math.min(5, Math.ceil(value / 2))) as SorenessLevel;
      const template = value <= 3 
        ? 'LOW_SORENESS' 
        : value >= 7 
          ? 'HIGH_SORENESS' 
          : 'MODERATE_SORENESS';
      
      const sorenessInsights: SorenessInsight[] = insights.length > 0 
        ? insights.map(insight => ({
            ...createSorenessInsight(sorenessLevel, template),
            message: insight.message || SORENESS_INSIGHT_TEMPLATES[template].message
          }))
        : [createSorenessInsight(sorenessLevel, template)];
      
      trackAIInteraction({
        type: 'insight_shown',
        component,
        data: { value, insightsCount: sorenessInsights.length }
      });
      
      return sorenessInsights;
    }
  }), [aiService, analyze, trackAIInteraction, component]);
  
  return insightMethods;
}; 