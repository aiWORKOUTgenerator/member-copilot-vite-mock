// Soreness AI Service - Domain-specific AI logic for muscle soreness analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

// Configuration Constants - Extracted from magic numbers
export const SORENESS_CONSTANTS = {
  // Soreness thresholds
  NONE: 0,
  MILD: 1,
  MODERATE: 2,
  SEVERE: 3,
  EXTREME: 4,
  
  // Analysis thresholds
  HIGH_SORENESS_THRESHOLD: 4,
  MILD_SORENESS_MAX: 2,
  DURATION_CONFLICT_THRESHOLD: 3,
  LONG_DURATION_THRESHOLD: 45,
  
  // History analysis
  RECENT_INTERACTIONS_COUNT: 5,
  PATTERN_MIN_INTERACTIONS: 3,
  
  // Confidence levels
  HIGH_CONFIDENCE: 0.95,
  MEDIUM_HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.85,
  MEDIUM_LOW_CONFIDENCE: 0.8,
  LOW_CONFIDENCE: 0.75
} as const;



interface SorenessInsightRule {
  condition: (value: string[], context: GlobalAIContext) => boolean;
  generateInsight: (value: string[], context: GlobalAIContext) => AIInsight;
}

export class SorenessAIService {
  
  private readonly BASE_INSIGHTS: SorenessInsightRule[] = [
    {
      condition: (_value) => _value.length === 0,
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('no_soreness'),
        type: 'encouragement',
        message: 'No soreness reported - good recovery status',
        recommendation: 'You can maintain or increase workout intensity',
        confidence: SORENESS_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: false,
        relatedFields: ['customization_soreness'],
        metadata: {
          sorenessLevel: 'none'
        }
      })
    },
    {
      condition: (_value) => _value.length >= SORENESS_CONSTANTS.HIGH_SORENESS_THRESHOLD,
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('high_soreness'),
        type: 'warning',
        message: 'Multiple areas of soreness detected - consider recovery focus',
        recommendation: 'Focus on mobility, stretching, and recovery',
        confidence: SORENESS_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus', 'customization_duration'],
        metadata: {
          sorenessLevel: 'high',
          affectedAreas: _value.length
        }
      })
    },
    {
      condition: (value) => value.includes('Back') || value.includes('Lower Body'),
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('back_soreness'),
        type: 'warning',
        message: 'Back/lower body soreness - prioritize proper form and movement quality',
        recommendation: 'Avoid heavy lifting, focus on gentle movement',
        confidence: SORENESS_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          sorenessLevel: 'targeted',
          criticalAreas: value.filter(area => ['Back', 'Lower Body'].includes(area))
        }
      })
    },
    {
      condition: (value) => value.length === 1 || value.length === SORENESS_CONSTANTS.MILD_SORENESS_MAX,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('mild_soreness'),
        type: 'optimization',
        message: 'Mild soreness detected - adjust intensity accordingly',
        recommendation: 'Work around sore areas or use lighter intensity',
        confidence: SORENESS_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          sorenessLevel: 'mild',
          affectedAreas: value.length
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: SorenessInsightRule[] = [
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return value.length > 0 && typeof energyLevel === 'number' && energyLevel <= 2;
      },
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('soreness_low_energy'),
        type: 'warning',
        message: 'Combined soreness and low energy - strong recovery focus recommended',
        recommendation: 'Consider rest day or very light mobility work',
        confidence: SORENESS_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_energy', 'customization_focus'],
        metadata: {
          context: 'energy_soreness_combination'
        }
      })
    },
    {
      condition: (value, context) => {
        const focus = context.currentSelections.customization_focus;
        return value.includes('Upper Body') && focus === 'strength';
      },
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('upper_body_strength_conflict'),
        type: 'warning',
        message: 'Upper body soreness with strength focus - consider lower body emphasis',
        recommendation: 'Switch to lower body or cardio focus',
        confidence: SORENESS_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          context: 'focus_soreness_conflict'
        }
      })
    },
    {
      condition: (value, context) => {
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return value.length > 0 && timeOfDay === 'morning';
      },
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('morning_soreness'),
        type: 'optimization',
        message: 'Morning soreness - include extended warm-up',
        recommendation: 'Add 5-10 minutes of gentle movement before workout',
        confidence: SORENESS_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_duration'],
        metadata: {
          context: 'morning_stiffness'
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: SorenessInsightRule[] = [
    {
      condition: (value, context) => {
        const areas = context.currentSelections.customization_areas;
        return value.length > 0 && Array.isArray(areas) && areas.some((area: string) => value.includes(area));
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('area_soreness_overlap'),
        type: 'warning',
        message: 'Selected workout areas overlap with soreness - consider alternatives',
        recommendation: 'Select unaffected areas or reduce intensity',
        confidence: SORENESS_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_areas'],
        metadata: {
          context: 'area_overlap',
          conflictingAreas: value.filter((area: string) => 
            Array.isArray(context.currentSelections.customization_areas) && 
            context.currentSelections.customization_areas.includes(area)
          )
        }
      })
    },
    {
      condition: (value, context) => {
        const duration = context.currentSelections.customization_duration;
        const durationValue = typeof duration === 'number' ? duration : 
          (typeof duration === 'object' && duration?.totalDuration ? duration.totalDuration : 0);
        return value.length >= SORENESS_CONSTANTS.DURATION_CONFLICT_THRESHOLD && durationValue > SORENESS_CONSTANTS.LONG_DURATION_THRESHOLD;
      },
      generateInsight: (_value, _context) => ({
        id: this.generateInsightId('soreness_duration_conflict'),
        type: 'warning',
        message: 'High soreness with long duration - consider shorter session',
        recommendation: 'Reduce session to 30-45 minutes max',
        confidence: SORENESS_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_duration'],
        metadata: {
          context: 'duration_conflict'
        }
      })
    }
  ];
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `soreness_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  /**
   * Generate learning insights based on user history
   */
  private generateLearningInsights(value: string[], context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check for patterns in user's soreness history
    const recentSoreness = context.sessionHistory
      .filter(interaction => interaction.component === 'soreness')
      .slice(-SORENESS_CONSTANTS.RECENT_INTERACTIONS_COUNT); // Last 5 interactions
    
    if (recentSoreness.length >= SORENESS_CONSTANTS.PATTERN_MIN_INTERACTIONS) {
      const commonAreas = this.findCommonSorenessAreas(recentSoreness);
      if (commonAreas.length > 0) {
        insights.push({
          id: this.generateInsightId('pattern_soreness'),
          type: 'education',
          message: `Pattern detected: ${commonAreas.join(', ')} frequently sore`,
          recommendation: 'Consider mobility work or form check for these areas',
          confidence: SORENESS_CONSTANTS.LOW_CONFIDENCE,
          actionable: true,
          relatedFields: ['customization_soreness', 'customization_focus'],
          metadata: {
            context: 'pattern_learning',
            commonAreas
          }
        });
      }
    }
    
    // User profile-based insights
    if (context.userProfile.fitnessLevel === 'new to exercise' && value.length > 0) {
      insights.push({
        id: this.generateInsightId('new_to_exercise_soreness'),
        type: 'education',
        message: 'As someone new to exercise, some soreness is normal - focus on recovery',
        recommendation: 'Ensure adequate rest between sessions',
        confidence: SORENESS_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_soreness'],
        metadata: {
          context: 'new_to_exercise_education'
        }
      });
    }
    
    return insights;
  }
  
  /**
   * Find common soreness areas from session history
   */
  private findCommonSorenessAreas(_history: unknown[]): string[] {
    // This would need to be implemented based on how soreness data is stored
    // For now, return empty array
    return [];
  }
  
  /**
   * Main analysis method - generates comprehensive soreness insights
   */
  async analyze(sorenessAreas: string[] | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    if (!sorenessAreas || sorenessAreas.length === 0) {
      // Return "no soreness" insight
      return [{
        id: this.generateInsightId('no_soreness'),
        type: 'encouragement',
        message: 'No soreness reported - good recovery status',
        recommendation: 'You can maintain or increase workout intensity',
        confidence: SORENESS_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: false,
        relatedFields: ['customization_soreness'],
        metadata: {
          sorenessLevel: 'none'
        }
      }];
    }
    
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(sorenessAreas, context)) {
        insights.push(rule.generateInsight(sorenessAreas, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(sorenessAreas, context)) {
        const insight = rule.generateInsight(sorenessAreas, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(sorenessAreas, context)) {
        const insight = rule.generateInsight(sorenessAreas, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = this.generateLearningInsights(sorenessAreas, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
  
  /**
   * Generate insights (backward compatibility method)
   * Provides a simplified interface for components that need basic soreness insights
   */
  generateInsights(sorenessAreas: string[], context: GlobalAIContext): AIInsight[] {
    // Use the analyze method but handle the async nature
    // For backward compatibility, we'll run a simplified version synchronously
    const insights: AIInsight[] = [];
    
    if (!sorenessAreas || sorenessAreas.length === 0) {
      return [{
        id: this.generateInsightId('no_soreness'),
        type: 'encouragement',
        message: 'No soreness reported - good recovery status',
        recommendation: 'You can maintain or increase workout intensity',
        confidence: SORENESS_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: false,
        relatedFields: ['customization_soreness'],
        metadata: {
          sorenessLevel: 'none'
        }
      }];
    }
    
    // Apply base insights (synchronous version)
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(sorenessAreas, context)) {
        insights.push(rule.generateInsight(sorenessAreas, context));
      }
    }
    
    // Apply contextual insights (synchronous version)
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(sorenessAreas, context)) {
        const insight = rule.generateInsight(sorenessAreas, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
} 