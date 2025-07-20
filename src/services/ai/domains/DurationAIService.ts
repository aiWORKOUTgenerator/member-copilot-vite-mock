// Duration AI Service - Domain-specific AI logic for workout duration analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';
import { dataTransformers } from '../../../utils/dataTransformers';

// Configuration Constants - Extracted from magic numbers
export const DURATION_CONSTANTS = {
  // Duration thresholds
  VERY_SHORT: 15,
  SHORT: 30,
  MODERATE: 45,
  LONG: 60,
  VERY_LONG: 90,
  
  // Focus-specific recommendations
  STRENGTH_MIN: 45,
  STRENGTH_OPTIMAL: 60,
  STRENGTH_MAX: 90,
  CARDIO_MIN: 20,
  CARDIO_OPTIMAL: 40,
  CARDIO_MAX: 60,
  FLEXIBILITY_MIN: 15,
  FLEXIBILITY_OPTIMAL: 30,
  FLEXIBILITY_MAX: 45,
  RECOVERY_MIN: 20,
  RECOVERY_OPTIMAL: 30,
  RECOVERY_MAX: 45,
  MOBILITY_MIN: 15,
  MOBILITY_OPTIMAL: 25,
  MOBILITY_MAX: 40,
  POWER_MIN: 30,
  POWER_OPTIMAL: 45,
  POWER_MAX: 60,
  ENDURANCE_MIN: 45,
  ENDURANCE_OPTIMAL: 75,
  ENDURANCE_MAX: 120,
  
  // Analysis thresholds
  COMPLETION_RATE_THRESHOLD: 0.7,
  DURATION_VARIANCE_THRESHOLD: 20,
  DURATION_DEVIATION_THRESHOLD: 25,
  SIMILAR_DURATION_RANGE: 10,
  
  // Confidence levels
  HIGH_CONFIDENCE: 0.95,
  MEDIUM_HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.85,
  MEDIUM_LOW_CONFIDENCE: 0.8,
  LOW_CONFIDENCE: 0.75,
  VERY_LOW_CONFIDENCE: 0.7
} as const;

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
    VERY_SHORT: DURATION_CONSTANTS.VERY_SHORT,
    SHORT: DURATION_CONSTANTS.SHORT,
    MODERATE: DURATION_CONSTANTS.MODERATE,
    LONG: DURATION_CONSTANTS.LONG,
    VERY_LONG: DURATION_CONSTANTS.VERY_LONG
  };
  
  private readonly FOCUS_DURATION_RECOMMENDATIONS = new Map<string, { min: number; optimal: number; max: number }>([
    ['strength', { min: DURATION_CONSTANTS.STRENGTH_MIN, optimal: DURATION_CONSTANTS.STRENGTH_OPTIMAL, max: DURATION_CONSTANTS.STRENGTH_MAX }],
    ['cardio', { min: DURATION_CONSTANTS.CARDIO_MIN, optimal: DURATION_CONSTANTS.CARDIO_OPTIMAL, max: DURATION_CONSTANTS.CARDIO_MAX }],
    ['flexibility', { min: DURATION_CONSTANTS.FLEXIBILITY_MIN, optimal: DURATION_CONSTANTS.FLEXIBILITY_OPTIMAL, max: DURATION_CONSTANTS.FLEXIBILITY_MAX }],
    ['recovery', { min: DURATION_CONSTANTS.RECOVERY_MIN, optimal: DURATION_CONSTANTS.RECOVERY_OPTIMAL, max: DURATION_CONSTANTS.RECOVERY_MAX }],
    ['mobility', { min: DURATION_CONSTANTS.MOBILITY_MIN, optimal: DURATION_CONSTANTS.MOBILITY_OPTIMAL, max: DURATION_CONSTANTS.MOBILITY_MAX }],
    ['power', { min: DURATION_CONSTANTS.POWER_MIN, optimal: DURATION_CONSTANTS.POWER_OPTIMAL, max: DURATION_CONSTANTS.POWER_MAX }],
    ['endurance', { min: DURATION_CONSTANTS.ENDURANCE_MIN, optimal: DURATION_CONSTANTS.ENDURANCE_OPTIMAL, max: DURATION_CONSTANTS.ENDURANCE_MAX }]
  ]);
  
  private readonly BASE_INSIGHTS: DurationInsightRule[] = [
    {
      condition: (value) => !!value && value <= this.THRESHOLDS.VERY_SHORT,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('very_short_duration'),
        type: 'warning',
        message: 'Very short duration - consider extending for better results',
        recommendation: 'Aim for at least 20-30 minutes for effective workout',
        confidence: DURATION_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration'],
        metadata: {
          currentDuration: value
        }
      })
    },
    {
      condition: (value) => !!value && value >= this.THRESHOLDS.VERY_LONG,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('very_long_duration'),
        type: 'warning',
        message: 'Very long duration - ensure adequate recovery and hydration',
        confidence: DURATION_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_energy'],
        recommendation: 'Consider breaks and proper hydration for longer sessions',
        metadata: {
          currentDuration: value
        }
      })
    },
    {
      condition: (value) => !!value && value >= this.THRESHOLDS.SHORT && value <= this.THRESHOLDS.MODERATE,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('optimal_duration'),
        type: 'encouragement',
        message: 'Good duration choice - allows for effective workout without overexertion',
        confidence: DURATION_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: false,
        relatedFields: ['customization_duration'],
        recommendation: 'This duration works well for most workout types',
        metadata: {
          currentDuration: value
        }
      })
    },
    {
      condition: (value) => !value || value === 0,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('no_duration'),
        type: 'warning',
        message: 'No duration specified - consider your available time',
        confidence: DURATION_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration'],
        recommendation: 'Set a realistic duration based on your schedule',
        metadata: {
          currentDuration: value
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: DurationInsightRule[] = [
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return !!value && value > 60 && typeof energyLevel === 'number' && energyLevel <= 2;
      },
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('long_duration_low_energy'),
        type: 'warning',
        message: 'Long duration with low energy - consider shorter, more focused session',
        confidence: DURATION_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_energy'],
        recommendation: 'Reduce to 20-30 minutes with lower intensity',
        metadata: {
          context: 'energy_duration_mismatch',
          currentDuration: value
        }
      })
    },
    {
      condition: (value, context) => {
        const soreness = context.currentSelections.customization_soreness;
        const sorenessAreas = dataTransformers.extractSorenessAreas(soreness);
        return !!value && value > 45 && sorenessAreas.length >= 3;
      },
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('long_duration_high_soreness'),
        type: 'warning',
        message: 'Long duration with high soreness - prioritize recovery over duration',
        confidence: DURATION_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_soreness'],
        recommendation: 'Reduce to 30-45 minutes with gentle movements',
        metadata: {
          context: 'soreness_duration_conflict',
          currentDuration: value
        }
      })
    },
    {
      condition: (value, context) => {
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return !!value && value > 60 && timeOfDay === 'evening';
      },
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('evening_long_duration'),
        type: 'optimization',
        message: 'Long evening workout may impact sleep - consider earlier timing',
        confidence: DURATION_CONSTANTS.LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration'],
        recommendation: 'Limit evening workouts to 45-60 minutes',
        metadata: {
          context: 'timing_consideration',
          currentDuration: value
        }
      })
    },
    {
      condition: (value, context) => {
        const fitnessLevel = context.userProfile.fitnessLevel;
        return !!value && value > 60 && fitnessLevel === 'new to exercise';
      },
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('new_to_exercise_long_duration'),
        type: 'warning',
        message: 'Long duration for someone new to exercise - start with shorter sessions',
        confidence: DURATION_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration'],
        recommendation: 'Start with 20-30 minutes and gradually increase',
        metadata: {
          context: 'experience_mismatch',
          currentDuration: value
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: DurationInsightRule[] = [
    {
      condition: (value, context) => {
        const focus = context.currentSelections.customization_focus;
        const focusValue = dataTransformers.extractFocusValue(focus);
        return !!value && !!focusValue && this.FOCUS_DURATION_RECOMMENDATIONS.has(focusValue);
      },
      generateInsight: (value, context) => {
        const focus = context.currentSelections.customization_focus;
        const focusValue = dataTransformers.extractFocusValue(focus);
        const recommendations = this.FOCUS_DURATION_RECOMMENDATIONS.get(focusValue)!;
        
        if (value! < recommendations.min) {
          return {
            id: this.generateInsightId('duration_too_short_for_focus'),
            type: 'warning',
            message: `Duration too short for ${focusValue} focus - consider ${recommendations.optimal} minutes`,
            confidence: DURATION_CONSTANTS.MEDIUM_CONFIDENCE,
            actionable: true,
            relatedFields: ['customization_duration', 'customization_focus'],
            recommendation: `Aim for ${recommendations.optimal} minutes for optimal ${focusValue} benefits`,
            metadata: {
              context: 'focus_duration_mismatch',
              currentDuration: value,
              focusType: focusValue
            }
          };
        } else if (value! > recommendations.max) {
          return {
            id: this.generateInsightId('duration_too_long_for_focus'),
            type: 'optimization',
            message: `Duration may be too long for ${focusValue} focus - consider ${recommendations.optimal} minutes`,
            confidence: DURATION_CONSTANTS.LOW_CONFIDENCE,
            actionable: true,
            relatedFields: ['customization_duration', 'customization_focus'],
            recommendation: `${recommendations.optimal} minutes is typically optimal for ${focusValue}`,
            metadata: {
              context: 'focus_duration_excess',
              currentDuration: value,
              focusType: focusValue
            }
          };
        }
        
        return {
          id: this.generateInsightId('duration_good_for_focus'),
          type: 'encouragement',
          message: `Duration well-suited for ${focusValue} focus`,
          confidence: DURATION_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
          actionable: false,
          relatedFields: ['customization_duration', 'customization_focus'],
          recommendation: 'Duration aligns well with your focus',
          metadata: {
            context: 'focus_duration_match',
            currentDuration: value,
            focusType: focusValue
          }
        };
      }
    },
    {
      condition: (value, context) => {
        const equipment = context.currentSelections.customization_equipment;
        const equipmentList = dataTransformers.extractEquipmentList(equipment);
        return !!value && value < 30 && equipmentList.length > 3;
      },
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('short_duration_much_equipment'),
        type: 'optimization',
        message: 'Short duration with many equipment options - prioritize key exercises',
        confidence: DURATION_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration', 'customization_equipment'],
        recommendation: 'Focus on 2-3 key pieces of equipment for efficiency',
        metadata: {
          context: 'equipment_duration_mismatch',
          currentDuration: value
        }
      })
    },
    {
      condition: (value, context) => {
        const availableTime = context.environmentalFactors?.availableTime;
        return !!value && !!availableTime && value > availableTime;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('duration_exceeds_available_time'),
        type: 'warning',
        message: 'Planned duration exceeds available time - adjust expectations',
        confidence: DURATION_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_duration'],
        recommendation: 'Reduce duration to fit available time',
        metadata: {
          context: 'time_constraint',
          currentDuration: value,
          availableTime: context.environmentalFactors?.availableTime
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
      .filter((interaction: unknown) => (interaction as any).component === 'duration')
      .slice(-10)
      .map((interaction: unknown) => (interaction as any).metadata?.duration)
      .filter((duration: unknown) => duration && typeof duration === 'number' && duration > 0);
    
    if (recentDurations.length >= 3) {
      const avgDuration = recentDurations.reduce((sum: number, d: number) => sum + d, 0) / recentDurations.length;
      const variance = recentDurations.some((d: number) => Math.abs(d - avgDuration) > DURATION_CONSTANTS.DURATION_VARIANCE_THRESHOLD);
      
      if (variance) {
        insights.push({
          id: this.generateInsightId('inconsistent_duration'),
          type: 'education',
          message: 'Your workout durations vary significantly - consider finding a consistent rhythm',
          confidence: DURATION_CONSTANTS.VERY_LOW_CONFIDENCE,
          actionable: true,
          relatedFields: ['customization_duration'],
          recommendation: 'Aim for consistent durations to build sustainable habits',
          metadata: {
            context: 'pattern_learning',
            averageDuration: Math.round(avgDuration)
          }
        });
      }
      
      // Check if current duration is significantly different from typical
      if (value && Math.abs(value - avgDuration) > DURATION_CONSTANTS.DURATION_DEVIATION_THRESHOLD) {
        insights.push({
          id: this.generateInsightId('duration_deviation'),
          type: 'optimization',
          message: `This duration differs from your usual ${Math.round(avgDuration)} minutes`,
          confidence: DURATION_CONSTANTS.LOW_CONFIDENCE,
          actionable: true,
          relatedFields: ['customization_duration'],
          recommendation: 'Consider if this change aligns with your goals',
          metadata: {
            context: 'deviation_from_norm',
            typicalDuration: Math.round(avgDuration),
            currentDuration: value
          }
        });
      }
    }
    
    // Check completion rates by duration
    const completionData = this.analyzeCompletionRates(context.sessionHistory);
    if (completionData.length > 0 && value) {
      const similarDurations = completionData.filter(d => Math.abs(d.duration - value) <= DURATION_CONSTANTS.SIMILAR_DURATION_RANGE);
      if (similarDurations.length > 0) {
        const avgCompletion = similarDurations.reduce((sum, d) => sum + d.completionRate, 0) / similarDurations.length;
        
        if (avgCompletion < DURATION_CONSTANTS.COMPLETION_RATE_THRESHOLD) {
          insights.push({
            id: this.generateInsightId('low_completion_rate'),
            type: 'optimization',
            message: `Similar durations have lower completion rates - consider reducing slightly`,
            confidence: DURATION_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
            actionable: true,
            relatedFields: ['customization_duration'],
            recommendation: 'Slightly shorter durations may improve workout completion',
            metadata: {
              context: 'completion_learning',
              completionRate: Math.round(avgCompletion * 100)
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
  private analyzeCompletionRates(_history: unknown[]): { duration: number; completionRate: number }[] {
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
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
  
  // Backward compatibility method removed
  // Use analyze() method instead for duration insights
} 