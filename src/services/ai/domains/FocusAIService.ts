// Focus AI Service - Domain-specific AI logic for workout focus analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

interface FocusCategories {
  STRENGTH: string;
  CARDIO: string;
  FLEXIBILITY: string;
  ENDURANCE: string;
  MOBILITY: string;
  RECOVERY: string;
  BALANCE: string;
  POWER: string;
}

interface FocusInsightRule {
  condition: (value: string | undefined, context: GlobalAIContext) => boolean;
  generateInsight: (value: string | undefined, context: GlobalAIContext) => AIInsight;
}

export class FocusAIService {
  private readonly FOCUS_CATEGORIES: FocusCategories = {
    STRENGTH: 'strength',
    CARDIO: 'cardio',
    FLEXIBILITY: 'flexibility',
    ENDURANCE: 'endurance',
    MOBILITY: 'mobility',
    RECOVERY: 'recovery',
    BALANCE: 'balance',
    POWER: 'power'
  };
  
  private readonly COMPLEMENTARY_FOCUS = new Map<string, string[]>([
    ['strength', ['mobility', 'flexibility']],
    ['cardio', ['recovery', 'flexibility']],
    ['flexibility', ['strength', 'balance']],
    ['endurance', ['recovery', 'strength']],
    ['mobility', ['strength', 'balance']],
    ['recovery', ['flexibility', 'mobility']],
    ['balance', ['strength', 'flexibility']],
    ['power', ['mobility', 'recovery']]
  ]);
  
  private readonly BASE_INSIGHTS: FocusInsightRule[] = [
    {
      condition: (value) => value === this.FOCUS_CATEGORIES.STRENGTH,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('strength_focus'),
        type: 'optimization',
        message: 'Strength focus selected - ensure proper form and adequate rest',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_duration'],
        metadata: {
          focusType: 'strength',
          recommendation: 'Focus on compound movements with proper rest periods'
        }
      })
    },
    {
      condition: (value) => value === this.FOCUS_CATEGORIES.CARDIO,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('cardio_focus'),
        type: 'optimization',
        message: 'Cardio focus selected - monitor heart rate and hydration',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_duration'],
        metadata: {
          focusType: 'cardio',
          recommendation: 'Stay hydrated and monitor intensity throughout session'
        }
      })
    },
    {
      condition: (value) => value === this.FOCUS_CATEGORIES.FLEXIBILITY,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('flexibility_focus'),
        type: 'optimization',
        message: 'Flexibility focus - hold stretches and focus on breathing',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_duration'],
        metadata: {
          focusType: 'flexibility',
          recommendation: 'Use slow, controlled movements and deep breathing'
        }
      })
    },
    {
      condition: (value) => value === this.FOCUS_CATEGORIES.RECOVERY,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('recovery_focus'),
        type: 'encouragement',
        message: 'Recovery focus - prioritize gentle movement and restoration',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_duration'],
        metadata: {
          focusType: 'recovery',
          recommendation: 'Keep intensity low and focus on restorative movements'
        }
      })
    },
    {
      condition: (value) => !value || value === '',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('no_focus'),
        type: 'warning',
        message: 'No focus selected - consider your primary goal for today',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_focus'],
        metadata: {
          focusType: 'none',
          recommendation: 'Select a focus to optimize your workout'
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: FocusInsightRule[] = [
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return value === 'strength' && energyLevel && energyLevel <= 2;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('strength_low_energy'),
        type: 'warning',
        message: 'Strength focus with low energy - consider lighter loads or mobility',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_energy'],
        metadata: {
          context: 'energy_focus_mismatch',
          recommendation: 'Switch to mobility or reduce intensity significantly'
        }
      })
    },
    {
      condition: (value, context) => {
        const soreness = context.currentSelections.customization_soreness;
        return value === 'cardio' && soreness && soreness.length >= 3;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('cardio_high_soreness'),
        type: 'warning',
        message: 'Cardio focus with multiple sore areas - consider recovery focus',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_soreness'],
        metadata: {
          context: 'soreness_focus_conflict',
          recommendation: 'Switch to recovery or light mobility work'
        }
      })
    },
    {
      condition: (value, context) => {
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return value === 'power' && timeOfDay === 'evening';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('power_evening'),
        type: 'optimization',
        message: 'Power focus in evening - may affect sleep quality',
        confidence: 0.75,
        actionable: true,
        relatedFields: ['customization_focus'],
        metadata: {
          context: 'timing_consideration',
          recommendation: 'Consider earlier timing or switch to strength/flexibility'
        }
      })
    },
    {
      condition: (value, context) => {
        const fitnessLevel = context.userProfile.fitnessLevel;
        return value === 'power' && fitnessLevel === 'new to exercise';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('power_new_to_exercise'),
        type: 'warning',
        message: 'Power focus as someone new to exercise - ensure proper form foundation first',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_focus'],
        metadata: {
          context: 'experience_mismatch',
          recommendation: 'Start with strength focus to build foundation'
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: FocusInsightRule[] = [
    {
      condition: (value, context) => {
        const duration = context.currentSelections.customization_duration;
        return value === 'strength' && duration && duration < 30;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('strength_short_duration'),
        type: 'warning',
        message: 'Strength focus with short duration - may limit effectiveness',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_duration'],
        metadata: {
          context: 'duration_mismatch',
          recommendation: 'Consider 45+ minutes for strength or switch to mobility'
        }
      })
    },
    {
      condition: (value, context) => {
        const equipment = context.currentSelections.customization_equipment;
        return value === 'strength' && equipment && equipment.length === 0;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('strength_no_equipment'),
        type: 'optimization',
        message: 'Strength focus without equipment - body weight movements available',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_equipment'],
        metadata: {
          context: 'equipment_limitation',
          recommendation: 'Focus on body weight strength exercises or add equipment'
        }
      })
    },
    {
      condition: (value, context) => {
        const areas = context.currentSelections.customization_areas;
        return value === 'cardio' && areas && areas.length > 3;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('cardio_many_areas'),
        type: 'optimization',
        message: 'Cardio focus with many areas - consider full-body movements',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_focus', 'customization_areas'],
        metadata: {
          context: 'area_optimization',
          recommendation: 'Use compound movements for efficient cardio'
        }
      })
    }
  ];
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `focus_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  /**
   * Generate learning insights based on user history
   */
  private generateLearningInsights(value: string | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check for focus patterns
    const recentFocus = context.sessionHistory
      .filter(interaction => interaction.component === 'focus')
      .slice(-10); // Last 10 interactions
    
    if (recentFocus.length >= 5) {
      const focusFrequency = this.analyzeFocusPatterns(recentFocus);
      const dominantFocus = Array.from(focusFrequency.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominantFocus && dominantFocus[1] >= 3) {
        const complementary = this.COMPLEMENTARY_FOCUS.get(dominantFocus[0]);
        if (complementary && !complementary.includes(value || '')) {
          insights.push({
            id: this.generateInsightId('balance_suggestion'),
            type: 'education',
            message: `You've focused on ${dominantFocus[0]} recently - consider ${complementary[0]} for balance`,
            confidence: 0.75,
            actionable: true,
            relatedFields: ['customization_focus'],
            metadata: {
              context: 'balance_learning',
              dominantFocus: dominantFocus[0],
              suggestion: complementary[0],
              recommendation: 'Balance your training with complementary focuses'
            }
          });
        }
      }
    }
    
    // Goal alignment insights
    if (context.userProfile.goals && value) {
      const goalAlignment = this.assessGoalAlignment(value, context.userProfile.goals);
      if (goalAlignment.score < 0.7) {
        insights.push({
          id: this.generateInsightId('goal_alignment'),
          type: 'optimization',
          message: `Current focus may not align with your goals - consider ${goalAlignment.suggestion}`,
          confidence: 0.8,
          actionable: true,
          relatedFields: ['customization_focus'],
          metadata: {
            context: 'goal_alignment',
            currentFocus: value,
            suggestion: goalAlignment.suggestion,
            recommendation: 'Align your focus with your primary goals'
          }
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze focus patterns from session history
   */
  private analyzeFocusPatterns(history: any[]): Map<string, number> {
    const frequency = new Map<string, number>();
    
    // This would analyze actual focus selections from history
    // For now, return empty map
    return frequency;
  }
  
  /**
   * Assess how well current focus aligns with user goals
   */
  private assessGoalAlignment(focus: string, goals: string[]): { score: number; suggestion: string } {
    const alignmentMap = new Map<string, string[]>([
      ['strength', ['muscle_building', 'strength', 'toning']],
      ['cardio', ['weight_loss', 'endurance', 'heart_health']],
      ['flexibility', ['mobility', 'injury_prevention', 'wellness']],
      ['recovery', ['injury_prevention', 'wellness', 'stress_relief']]
    ]);
    
    const focusGoals = alignmentMap.get(focus) || [];
    const alignedGoals = goals.filter(goal => focusGoals.includes(goal));
    const score = alignedGoals.length / goals.length;
    
    // Find best alignment
    let bestAlignment = focus;
    let bestScore = score;
    
    for (const [altFocus, altGoals] of alignmentMap) {
      const altAligned = goals.filter(goal => altGoals.includes(goal));
      const altScore = altAligned.length / goals.length;
      if (altScore > bestScore) {
        bestScore = altScore;
        bestAlignment = altFocus;
      }
    }
    
    return { score, suggestion: bestAlignment };
  }
  
  /**
   * Main analysis method - generates comprehensive focus insights
   */
  async analyze(focus: string | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(focus, context)) {
        insights.push(rule.generateInsight(focus, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(focus, context)) {
        const insight = rule.generateInsight(focus, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(focus, context)) {
        const insight = rule.generateInsight(focus, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = this.generateLearningInsights(focus, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return b.confidence - a.confidence;
    });
  }
  
  // Backward compatibility method removed
  // Use analyze() method instead for focus insights
} 