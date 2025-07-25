// Injury AI Service - Domain-specific AI logic for injury analysis and workout adaptation
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';
import { CategoryRatingData } from '../../../types/core';

// Configuration Constants - Extracted from magic numbers
export const INJURY_CONSTANTS = {
  // Pain level thresholds
  NO_PAIN: 1,
  MILD_PAIN: 3,
  MODERATE_PAIN: 6,
  SEVERE_PAIN: 8,
  EXTREME_PAIN: 10,
  
  // Analysis thresholds
  HIGH_PAIN_THRESHOLD: 7,
  MODERATE_PAIN_THRESHOLD: 4,
  MULTIPLE_REGIONS_THRESHOLD: 2,
  
  // Critical body regions
  CRITICAL_REGIONS: ['Neck', 'Lower Back', 'Knees'],
  UPPER_BODY_REGIONS: ['Neck', 'Shoulders', 'Upper Back', 'Arms', 'Wrists'],
  LOWER_BODY_REGIONS: ['Lower Back', 'Hips', 'Knees', 'Ankles'],
  
  // Confidence levels
  HIGH_CONFIDENCE: 0.95,
  MEDIUM_HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.85,
  MEDIUM_LOW_CONFIDENCE: 0.8,
  LOW_CONFIDENCE: 0.75
} as const;

interface InjuryInsightRule {
  condition: (data: CategoryRatingData | undefined, context: GlobalAIContext) => boolean;
  generateInsight: (data: CategoryRatingData | undefined, context: GlobalAIContext) => AIInsight;
}

export class InjuryAIService {
  
  private readonly BASE_INSIGHTS: InjuryInsightRule[] = [
    {
      condition: (data) => !data || data.categories.includes('no_injuries'),
      generateInsight: (_data, _context) => ({
        id: this.generateInsightId('no_injuries'),
        type: 'encouragement',
        message: 'No injuries reported - full workout capacity available',
        recommendation: 'You can safely perform any type of workout',
        confidence: INJURY_CONSTANTS.HIGH_CONFIDENCE,
        actionable: false,
        relatedFields: ['customization_injury'],
        metadata: {
          injuryStatus: 'none',
          workoutCapacity: 'full'
        }
      })
    },
    {
      condition: (data) => {
        if (!data) return false;
        const painLevel = this.getPainLevel(data);
        return painLevel >= INJURY_CONSTANTS.HIGH_PAIN_THRESHOLD;
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('high_pain'),
        type: 'warning',
        message: 'High pain level detected - consider rest or medical consultation',
        recommendation: 'Focus on gentle movement, stretching, or complete rest',
        confidence: INJURY_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_duration'],
        metadata: {
          painLevel: this.getPainLevel(data),
          injuryStatus: 'high_pain',
          recommendation: 'rest_or_consultation'
        }
      })
    },
    {
      condition: (data) => {
        if (!data) return false;
        const regions = this.getInjuryRegions(data);
        return regions.some(region => INJURY_CONSTANTS.CRITICAL_REGIONS.includes(region));
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('critical_regions'),
        type: 'warning',
        message: 'Injury in critical areas - prioritize safety and proper form',
        recommendation: 'Avoid exercises that stress injured areas, focus on alternative movements',
        confidence: INJURY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_equipment'],
        metadata: {
          criticalRegions: this.getInjuryRegions(data).filter(region => 
            INJURY_CONSTANTS.CRITICAL_REGIONS.includes(region)
          ),
          injuryStatus: 'critical_areas',
          recommendation: 'modify_exercises'
        }
      })
    },
    {
      condition: (data) => {
        if (!data) return false;
        const regions = this.getInjuryRegions(data);
        return regions.length >= INJURY_CONSTANTS.MULTIPLE_REGIONS_THRESHOLD;
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('multiple_regions'),
        type: 'optimization',
        message: 'Multiple injury areas - consider full-body approach with modifications',
        recommendation: 'Focus on exercises that don\'t stress injured areas, consider mobility work',
        confidence: INJURY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_duration'],
        metadata: {
          affectedRegions: this.getInjuryRegions(data),
          injuryStatus: 'multiple_areas',
          recommendation: 'modified_full_body'
        }
      })
    },
    {
      condition: (data) => {
        if (!data) return false;
        const painLevel = this.getPainLevel(data);
        return painLevel >= INJURY_CONSTANTS.MODERATE_PAIN_THRESHOLD && painLevel < INJURY_CONSTANTS.HIGH_PAIN_THRESHOLD;
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('moderate_pain'),
        type: 'optimization',
        message: 'Moderate pain level - adjust workout intensity and focus',
        recommendation: 'Use lighter weights, focus on form, and avoid exercises that aggravate pain',
        confidence: INJURY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_intensity'],
        metadata: {
          painLevel: this.getPainLevel(data),
          injuryStatus: 'moderate_pain',
          recommendation: 'reduced_intensity'
        }
      })
    }
  ];

  private readonly CONTEXTUAL_RULES: InjuryInsightRule[] = [
    {
      condition: (data) => {
        if (!data) return false;
        const regions = this.getInjuryRegions(data);
        return regions.some(region => INJURY_CONSTANTS.UPPER_BODY_REGIONS.includes(region));
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('upper_body_injury'),
        type: 'optimization',
        message: 'Upper body injury detected - focus on lower body and core',
        recommendation: 'Prioritize leg exercises, core work, and cardio that doesn\'t stress upper body',
        confidence: INJURY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_areas'],
        metadata: {
          affectedRegions: this.getInjuryRegions(data).filter(region => 
            INJURY_CONSTANTS.UPPER_BODY_REGIONS.includes(region)
          ),
          injuryStatus: 'upper_body',
          recommendation: 'lower_body_focus'
        }
      })
    },
    {
      condition: (data) => {
        if (!data) return false;
        const regions = this.getInjuryRegions(data);
        return regions.some(region => INJURY_CONSTANTS.LOWER_BODY_REGIONS.includes(region));
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('lower_body_injury'),
        type: 'optimization',
        message: 'Lower body injury detected - focus on upper body and seated exercises',
        recommendation: 'Focus on upper body strength, seated cardio, and mobility work',
        confidence: INJURY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_focus', 'customization_equipment'],
        metadata: {
          affectedRegions: this.getInjuryRegions(data).filter(region => 
            INJURY_CONSTANTS.LOWER_BODY_REGIONS.includes(region)
          ),
          injuryStatus: 'lower_body',
          recommendation: 'upper_body_focus'
        }
      })
    }
  ];

  private readonly CROSS_COMPONENT_RULES: InjuryInsightRule[] = [
    {
      condition: (data, context) => {
        if (!data) return false;
        const painLevel = this.getPainLevel(data);
        const energy = context.currentSelections.customization_energy;
        return painLevel >= INJURY_CONSTANTS.MODERATE_PAIN_THRESHOLD && 
               typeof energy === 'number' && energy <= 3;
      },
      generateInsight: (data, _context) => ({
        id: this.generateInsightId('pain_energy_conflict'),
        type: 'warning',
        message: 'High pain with low energy - consider complete rest day',
        recommendation: 'Take a rest day or focus on very gentle mobility work only',
        confidence: INJURY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_injury', 'customization_energy', 'customization_duration'],
        metadata: {
          painLevel: this.getPainLevel(data),
          injuryStatus: 'pain_energy_conflict',
          recommendation: 'rest_day'
        }
      })
    }
  ];

  private generateInsightId(type: string): string {
    return `injury_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPainLevel(data: CategoryRatingData): number {
    return data.rating || 1;
  }

  private getInjuryRegions(data: CategoryRatingData): string[] {
    return data.categories.filter(cat => 
      !cat.startsWith('pain_') && cat !== 'no_injuries'
    );
  }

  private generateLearningInsights(data: CategoryRatingData | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (!data || !context.userHistory) return insights;

    // Analyze injury patterns over time
    const recentInjuries = context.userHistory
      .slice(-10)
      .filter(entry => entry.customization_injury && !entry.customization_injury.categories.includes('no_injuries'))
      .map(entry => entry.customization_injury);

    if (recentInjuries.length >= 3) {
      const commonRegions = this.findCommonInjuryRegions(recentInjuries);
      
      if (commonRegions.length > 0) {
        insights.push({
          id: this.generateInsightId('injury_pattern'),
          type: 'pattern',
          message: `Recurring injuries in ${commonRegions.join(', ')} - consider preventive measures`,
          recommendation: 'Focus on mobility, proper form, and gradual progression to prevent re-injury',
          confidence: INJURY_CONSTANTS.MEDIUM_CONFIDENCE,
          actionable: true,
          relatedFields: ['customization_injury', 'customization_focus'],
          metadata: {
            patternType: 'recurring_injuries',
            commonRegions,
            recommendation: 'preventive_measures'
          }
        });
      }
    }

    return insights;
  }

  private findCommonInjuryRegions(injuryHistory: CategoryRatingData[]): string[] {
    const regionCounts: Record<string, number> = {};
    
    injuryHistory.forEach(injury => {
      const regions = this.getInjuryRegions(injury);
      regions.forEach(region => {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      });
    });

    return Object.entries(regionCounts)
      .filter(([_, count]) => count >= 2)
      .map(([region, _]) => region);
  }

  async analyze(injuryData: CategoryRatingData | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Generate base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    // Generate contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    // Generate cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    // Generate learning insights
    insights.push(...this.generateLearningInsights(injuryData, context));

    return insights;
  }

  generateInsights(injuryData: CategoryRatingData | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];

    // Generate base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    // Generate contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    // Generate cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(injuryData, context)) {
        insights.push(rule.generateInsight(injuryData, context));
      }
    }

    return insights;
  }

  getRelatedFields(): string[] {
    return ['customization_injury', 'customization_focus', 'customization_duration', 'customization_equipment'];
  }

  getDependencies(): string[] {
    return ['customization_energy', 'customization_soreness'];
  }
} 