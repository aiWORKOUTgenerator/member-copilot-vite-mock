// Focus Rule Utilities - Helper methods for focus analysis
import { AIInsight } from '../../../../../types/insights';
import { GlobalAIContext, AIInteraction } from '../../../core/AIService';
import { FOCUS_INSIGHT_CONSTANTS, COMPLEMENTARY_FOCUS } from '../types/focus.types';

export class FocusRuleUtils {
  /**
   * Generate unique insight ID
   */
  static generateInsightId(type: string): string {
    return `focus_${type}_${Date.now()}_${Math.random().toString(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_BASE_RADIX).substr(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_START_INDEX, FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_LENGTH)}`;
  }
  
  /**
   * Generate learning insights based on user history
   */
  static generateLearningInsights(value: string | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check for focus patterns
    const recentFocus = context.sessionHistory
      .filter(interaction => interaction.component === 'focus')
      .slice(-FOCUS_INSIGHT_CONSTANTS.MAX_HISTORY_ITEMS);
    
    if (recentFocus.length >= FOCUS_INSIGHT_CONSTANTS.MIN_HISTORY_LENGTH) {
      const focusFrequency = this.analyzeFocusPatterns(recentFocus);
      const dominantFocus = Array.from(focusFrequency.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominantFocus && dominantFocus[1] >= FOCUS_INSIGHT_CONSTANTS.MIN_DOMINANT_FOCUS_COUNT) {
        const complementary = COMPLEMENTARY_FOCUS.get(dominantFocus[0]);
        if (complementary && !complementary.includes(value ?? '')) {
          insights.push({
            id: this.generateInsightId('balance_suggestion'),
            type: 'education',
            message: `You've focused on ${dominantFocus[0]} recently - consider ${complementary[0]} for balance`,
            confidence: 0.75,
            actionable: true,
            relatedFields: ['customization_focus'],
            recommendation: 'Balance your training with complementary focuses',
            metadata: {
              context: 'balance_learning',
              dominantFocus: dominantFocus[0],
              suggestion: complementary[0]
            }
          });
        }
      }
    }
    
    // Goal alignment insights
    if (context.userProfile.goals && value) {
      const goalAlignment = this.assessGoalAlignment(value, context.userProfile.goals);
      if (goalAlignment.score < FOCUS_INSIGHT_CONSTANTS.GOAL_ALIGNMENT_THRESHOLD) {
        insights.push({
          id: this.generateInsightId('goal_alignment'),
          type: 'optimization',
          message: `Current focus may not align with your goals - consider ${goalAlignment.suggestion}`,
          confidence: 0.8,
          actionable: true,
          relatedFields: ['customization_focus'],
          recommendation: 'Align your focus with your primary goals',
          metadata: {
            context: 'goal_alignment',
            currentFocus: value,
            suggestion: goalAlignment.suggestion
          }
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze focus patterns from session history
   */
  static analyzeFocusPatterns(_history: AIInteraction[]): Map<string, number> {
    const frequency = new Map<string, number>();
    
    // This would analyze actual focus selections from history
    // For now, return empty map
    return frequency;
  }
  
  /**
   * Assess how well current focus aligns with user goals
   */
  static assessGoalAlignment(focus: string, goals: string[]): { score: number; suggestion: string } {
    const alignmentMap = new Map<string, string[]>([
      ['strength', ['muscle_building', 'strength', 'toning']],
      ['cardio', ['weight_loss', 'endurance', 'heart_health']],
      ['flexibility', ['mobility', 'injury_prevention', 'wellness']],
      ['recovery', ['injury_prevention', 'wellness', 'stress_relief']]
    ]);
    
    const focusGoals = alignmentMap.get(focus) ?? [];
    const alignedGoals = goals.filter(goal => focusGoals.includes(goal));
    const score = alignedGoals.length / goals.length;
    
    // Find best alignment
    let bestAlignment = focus;
    let bestScore = score;
    
    for (const [altFocus, altGoals] of Array.from(alignmentMap.entries())) {
      const altAligned = goals.filter(goal => altGoals.includes(goal));
      const altScore = altAligned.length / goals.length;
      if (altScore > bestScore) {
        bestScore = altScore;
        bestAlignment = altFocus;
      }
    }
    
    return { score, suggestion: bestAlignment };
  }
} 