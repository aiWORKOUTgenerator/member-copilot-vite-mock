// Duration AI Service - Domain-specific AI logic for workout duration analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

interface DurationThresholds {
  VERY_SHORT: number;
  SHORT: number;
  MODERATE: number;
  LONG: number;
  VERY_LONG: number;
}

interface DurationInsightRule {
  condition: (value: number | undefined, context: GlobalAIContext) => boolean;
  generateInsight: (value: number | undefined, context: GlobalAIContext) => AIInsight;
}

export class DurationAIService {
  private readonly THRESHOLDS: DurationThresholds = {
    VERY_SHORT: 15,
    SHORT: 30,
    MODERATE: 45,
    LONG: 60,
    VERY_LONG: 90
  };
  
  private readonly FOCUS_DURATION_RECOMMENDATIONS = new Map<string, { min: number; optimal: number; max: number }>([
    ['strength', { min: 45, optimal: 60, max: 90 }],
    ['cardio', { min: 20, optimal: 40, max: 60 }],
    ['flexibility', { min: 15, optimal: 30, max: 45 }],
    ['recovery', { min: 20, optimal: 30, max: 45 }],
    ['mobility', { min: 15, optimal: 25, max: 40 }],
    ['power', { min: 30, optimal: 45, max: 60 }],
    ['endurance', { min: 45, optimal: 75, max: 120 }]
  ]);
  
  private readonly BASE_INSIGHTS: DurationInsightRule[] = [
    {
      condition: (value) => value && value <= this.THRESHOLDS.VERY_SHORT,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('very_short_duration'),
        type: 'warning',
        message: 'Very short duration - consider extending for better results',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          currentDuration: value,
          recommendation: 'Aim for at least 20-30 minutes for effective workout'
        }
      })
    },
    {
      condition: (value) => value && value >= this.THRESHOLDS.VERY_LONG,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('very_long_duration'),
        type: 'warning',
        message: 'Very long duration - ensure adequate recovery and hydration',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_energy'],
        metadata: {
          currentDuration: value,
          recommendation: 'Consider breaks and proper hydration for longer sessions'
        }
      })
    },
    {
      condition: (value) => value && value >= this.THRESHOLDS.SHORT && value <= this.THRESHOLDS.MODERATE,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('optimal_duration'),
        type: 'encouragement',
        message: 'Good duration choice - allows for effective workout without overexertion',
        confidence: 0.8,
        actionable: false,
        relatedFields: ['customization_duration'],
        metadata: {
          currentDuration: value,
          recommendation: 'This duration works well for most workout types'
        }
      })
    },
    {
      condition: (value) => !value || value === 0,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('no_duration'),
        type: 'warning',
        message: 'No duration specified - consider your available time',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          currentDuration: value,
          recommendation: 'Set a realistic duration based on your schedule'
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: DurationInsightRule[] = [
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return value && value > 60 && energyLevel && energyLevel <= 2;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('long_duration_low_energy'),
        type: 'warning',
        message: 'Long duration with low energy - consider shorter, more focused session',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_energy'],
        metadata: {
          context: 'energy_duration_mismatch',
          currentDuration: value,
          recommendation: 'Reduce to 20-30 minutes with lower intensity'
        }
      })
    },
    {
      condition: (value, context) => {
        const soreness = context.currentSelections.customization_soreness;
        return value && value > 45 && soreness && soreness.length >= 3;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('long_duration_high_soreness'),
        type: 'warning',
        message: 'Long duration with high soreness - prioritize recovery over duration',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_soreness'],
        metadata: {
          context: 'soreness_duration_conflict',
          currentDuration: value,
          recommendation: 'Reduce to 30-45 minutes with gentle movements'
        }
      })
    },
    {
      condition: (value, context) => {
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return value && value > 60 && timeOfDay === 'evening';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('evening_long_duration'),
        type: 'optimization',
        message: 'Long evening workout may impact sleep - consider earlier timing',
        confidence: 0.75,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          context: 'timing_consideration',
          currentDuration: value,
          recommendation: 'Limit evening workouts to 45-60 minutes'
        }
      })
    },
    {
      condition: (value, context) => {
        const fitnessLevel = context.userProfile.fitnessLevel;
        return value && value > 60 && fitnessLevel === 'new to exercise';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('new_to_exercise_long_duration'),
        type: 'warning',
        message: 'Long duration for someone new to exercise - start with shorter sessions',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          context: 'experience_mismatch',
          currentDuration: value,
          recommendation: 'Start with 20-30 minutes and gradually increase'
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: DurationInsightRule[] = [
    {
      condition: (value, context) => {
        const focus = context.currentSelections.customization_focus;
        return value && focus && this.FOCUS_DURATION_RECOMMENDATIONS.has(focus);
      },
      generateInsight: (value, context) => {
        const focus = context.currentSelections.customization_focus!;
        const recommendations = this.FOCUS_DURATION_RECOMMENDATIONS.get(focus)!;
        
        if (value! < recommendations.min) {
          return {
            id: this.generateInsightId('duration_too_short_for_focus'),
            type: 'warning',
            message: `Duration too short for ${focus} focus - consider ${recommendations.optimal} minutes`,
            confidence: 0.85,
            actionable: true,
            relatedFields: ['customization_duration', 'customization_focus'],
            metadata: {
              context: 'focus_duration_mismatch',
              currentDuration: value,
              focusType: focus,
              recommendation: `Aim for ${recommendations.optimal} minutes for optimal ${focus} benefits`
            }
          };
        } else if (value! > recommendations.max) {
          return {
            id: this.generateInsightId('duration_too_long_for_focus'),
            type: 'optimization',
            message: `Duration may be too long for ${focus} focus - consider ${recommendations.optimal} minutes`,
            confidence: 0.75,
            actionable: true,
            relatedFields: ['customization_duration', 'customization_focus'],
            metadata: {
              context: 'focus_duration_excess',
              currentDuration: value,
              focusType: focus,
              recommendation: `${recommendations.optimal} minutes is typically optimal for ${focus}`
            }
          };
        }
        
        return {
          id: this.generateInsightId('duration_good_for_focus'),
          type: 'encouragement',
          message: `Duration well-suited for ${focus} focus`,
          confidence: 0.8,
          actionable: false,
          relatedFields: ['customization_duration', 'customization_focus'],
          metadata: {
            context: 'focus_duration_match',
            currentDuration: value,
            focusType: focus,
            recommendation: 'Duration aligns well with your focus'
          }
        };
      }
    },
    {
      condition: (value, context) => {
        const equipment = context.currentSelections.customization_equipment;
        return value && value < 30 && equipment && equipment.length > 3;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('short_duration_much_equipment'),
        type: 'optimization',
        message: 'Short duration with many equipment options - prioritize key exercises',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_equipment'],
        metadata: {
          context: 'equipment_duration_mismatch',
          currentDuration: value,
          recommendation: 'Focus on 2-3 key pieces of equipment for efficiency'
        }
      })
    },
    {
      condition: (value, context) => {
        const availableTime = context.environmentalFactors?.availableTime;
        return value && availableTime && value > availableTime;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('duration_exceeds_available_time'),
        type: 'warning',
        message: 'Planned duration exceeds available time - adjust expectations',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          context: 'time_constraint',
          currentDuration: value,
          availableTime: context.environmentalFactors?.availableTime,
          recommendation: 'Reduce duration to fit available time'
        }
      })
    }
  ];
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `duration_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  /**
   * Generate learning insights based on user history
   */
  private generateLearningInsights(value: number | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze user's typical duration patterns
    const recentDurations = context.sessionHistory
      .filter(interaction => interaction.component === 'duration')
      .slice(-10)
      .map(interaction => interaction.metadata?.duration)
      .filter(duration => duration && duration > 0);
    
    if (recentDurations.length >= 3) {
      const avgDuration = recentDurations.reduce((sum, d) => sum + d, 0) / recentDurations.length;
      const variance = recentDurations.some(d => Math.abs(d - avgDuration) > 20);
      
      if (variance) {
        insights.push({
          id: this.generateInsightId('inconsistent_duration'),
          type: 'education',
          message: 'Your workout durations vary significantly - consider finding a consistent rhythm',
          confidence: 0.7,
          actionable: true,
          relatedFields: ['customization_duration'],
          metadata: {
            context: 'pattern_learning',
            averageDuration: Math.round(avgDuration),
            recommendation: 'Aim for consistent durations to build sustainable habits'
          }
        });
      }
      
      // Check if current duration is significantly different from typical
      if (value && Math.abs(value - avgDuration) > 25) {
        insights.push({
          id: this.generateInsightId('duration_deviation'),
          type: 'optimization',
          message: `This duration differs from your usual ${Math.round(avgDuration)} minutes`,
          confidence: 0.75,
          actionable: true,
          relatedFields: ['customization_duration'],
          metadata: {
            context: 'deviation_from_norm',
            typicalDuration: Math.round(avgDuration),
            currentDuration: value,
            recommendation: 'Consider if this change aligns with your goals'
          }
        });
      }
    }
    
    // Check completion rates by duration
    const completionData = this.analyzeCompletionRates(context.sessionHistory);
    if (completionData.length > 0 && value) {
      const similarDurations = completionData.filter(d => Math.abs(d.duration - value) <= 10);
      if (similarDurations.length > 0) {
        const avgCompletion = similarDurations.reduce((sum, d) => sum + d.completionRate, 0) / similarDurations.length;
        
        if (avgCompletion < 0.7) {
          insights.push({
            id: this.generateInsightId('low_completion_rate'),
            type: 'optimization',
            message: `Similar durations have lower completion rates - consider reducing slightly`,
            confidence: 0.8,
            actionable: true,
            relatedFields: ['customization_duration'],
            metadata: {
              context: 'completion_learning',
              completionRate: Math.round(avgCompletion * 100),
              recommendation: 'Slightly shorter durations may improve workout completion'
            }
          });
        }
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze completion rates by duration from session history
   */
  private analyzeCompletionRates(history: any[]): { duration: number; completionRate: number }[] {
    // This would analyze actual completion data from history
    // For now, return empty array
    return [];
  }
  
  /**
   * Main analysis method - generates comprehensive duration insights
   */
  async analyze(duration: number | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(duration, context)) {
        insights.push(rule.generateInsight(duration, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(duration, context)) {
        const insight = rule.generateInsight(duration, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(duration, context)) {
        const insight = rule.generateInsight(duration, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = this.generateLearningInsights(duration, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return b.confidence - a.confidence;
    });
  }
  
  // Backward compatibility method removed
  // Use analyze() method instead for duration insights
} 