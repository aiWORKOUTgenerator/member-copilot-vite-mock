// Focus AI Service - Domain-specific AI logic for workout focus analysis
import { AIInsight } from '../../../../types/insights';
import { GlobalAIContext } from '../../core/AIService';
import { BASE_INSIGHTS } from './rules/focusBaseRules';
import { CONTEXTUAL_RULES } from './rules/focusContextualRules';
import { CROSS_COMPONENT_RULES } from './rules/focusCrossComponentRules';
import { FocusRuleUtils } from './utils/FocusRuleUtils';

export class FocusAIService {
  /**
   * Main analysis method - generates comprehensive focus insights
   */
  async analyze(focus: string | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of BASE_INSIGHTS) {
      if (rule.condition(focus, context)) {
        insights.push(rule.generateInsight(focus, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of CONTEXTUAL_RULES) {
      if (rule.condition(focus, context)) {
        const insight = rule.generateInsight(focus, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of CROSS_COMPONENT_RULES) {
      if (rule.condition(focus, context)) {
        const insight = rule.generateInsight(focus, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = FocusRuleUtils.generateLearningInsights(focus, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
} 