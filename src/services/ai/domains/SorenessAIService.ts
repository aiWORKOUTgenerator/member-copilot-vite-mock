// Soreness AI Service - Domain-specific AI logic for muscle soreness analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

interface SorenessThresholds {
  NONE: number;
  MILD: number;
  MODERATE: number;
  SEVERE: number;
  EXTREME: number;
}

interface SorenessInsightRule {
  condition: (value: string[], context: GlobalAIContext) => boolean;
  generateInsight: (value: string[], context: GlobalAIContext) => AIInsight;
}

export class SorenessAIService {
  private readonly THRESHOLDS: SorenessThresholds = {
    NONE: 0,
    MILD: 1,
    MODERATE: 2,
    SEVERE: 3,
    EXTREME: 4
  };
  
  private readonly SORENESS_AREAS = [
    'Upper Body', 'Lower Body', 'Core', 'Back', 'Legs', 'Arms', 'Shoulders', 'Chest'
  ];
  
  private readonly BASE_INSIGHTS: SorenessInsightRule[] = [
    {
      condition: (value) => value.length === 0,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('no_soreness'),
        type: 'encouragement',
        message: 'No soreness reported - good recovery status',
        confidence: 0.9,
        actionable: false,
        relatedFields: ['customization_soreness'],
        metadata: {
          sorenessLevel: 'none',
          recommendation: 'You can maintain or increase workout intensity'
        }
      })
    },
    {
      condition: (value) => value.length >= 4,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('high_soreness'),
        type: 'warning',
        message: 'Multiple areas of soreness detected - consider recovery focus',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus', 'customization_duration'],
        metadata: {
          sorenessLevel: 'high',
          affectedAreas: value.length,
          recommendation: 'Focus on mobility, stretching, and recovery'
        }
      })
    },
    {
      condition: (value) => value.includes('Back') || value.includes('Lower Body'),
      generateInsight: (value, context) => ({
        id: this.generateInsightId('back_soreness'),
        type: 'warning',
        message: 'Back/lower body soreness - prioritize proper form and movement quality',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          sorenessLevel: 'targeted',
          criticalAreas: value.filter(area => ['Back', 'Lower Body'].includes(area)),
          recommendation: 'Avoid heavy lifting, focus on gentle movement'
        }
      })
    },
    {
      condition: (value) => value.length === 1 || value.length === 2,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('mild_soreness'),
        type: 'optimization',
        message: 'Mild soreness detected - adjust intensity accordingly',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          sorenessLevel: 'mild',
          affectedAreas: value.length,
          recommendation: 'Work around sore areas or use lighter intensity'
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: SorenessInsightRule[] = [
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return value.length > 0 && energyLevel && energyLevel <= 2;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('soreness_low_energy'),
        type: 'warning',
        message: 'Combined soreness and low energy - strong recovery focus recommended',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_energy', 'customization_focus'],
        metadata: {
          context: 'energy_soreness_combination',
          recommendation: 'Consider rest day or very light mobility work'
        }
      })
    },
    {
      condition: (value, context) => {
        const focus = context.currentSelections.customization_focus;
        return value.includes('Upper Body') && focus === 'strength';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('upper_body_strength_conflict'),
        type: 'warning',
        message: 'Upper body soreness with strength focus - consider lower body emphasis',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_focus'],
        metadata: {
          context: 'focus_soreness_conflict',
          recommendation: 'Switch to lower body or cardio focus'
        }
      })
    },
    {
      condition: (value, context) => {
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return value.length > 0 && timeOfDay === 'morning';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('morning_soreness'),
        type: 'optimization',
        message: 'Morning soreness - include extended warm-up',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_duration'],
        metadata: {
          context: 'morning_stiffness',
          recommendation: 'Add 5-10 minutes of gentle movement before workout'
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: SorenessInsightRule[] = [
    {
      condition: (value, context) => {
        const areas = context.currentSelections.customization_areas;
        return value.length > 0 && areas?.some(area => value.includes(area));
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('area_soreness_overlap'),
        type: 'warning',
        message: 'Selected workout areas overlap with soreness - consider alternatives',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_areas'],
        metadata: {
          context: 'area_overlap',
          conflictingAreas: value.filter(area => 
            context.currentSelections.customization_areas?.includes(area)
          ),
          recommendation: 'Select unaffected areas or reduce intensity'
        }
      })
    },
    {
      condition: (value, context) => {
        const duration = context.currentSelections.customization_duration;
        return value.length >= 3 && duration && duration > 45;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('soreness_duration_conflict'),
        type: 'warning',
        message: 'High soreness with long duration - consider shorter session',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_soreness', 'customization_duration'],
        metadata: {
          context: 'duration_conflict',
          recommendation: 'Reduce session to 30-45 minutes max'
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
      .slice(-5); // Last 5 interactions
    
    if (recentSoreness.length >= 3) {
      const commonAreas = this.findCommonSorenessAreas(recentSoreness);
      if (commonAreas.length > 0) {
        insights.push({
          id: this.generateInsightId('pattern_soreness'),
          type: 'education',
          message: `Pattern detected: ${commonAreas.join(', ')} frequently sore`,
          confidence: 0.75,
          actionable: true,
          relatedFields: ['customization_soreness', 'customization_focus'],
          metadata: {
            context: 'pattern_learning',
            commonAreas,
            recommendation: 'Consider mobility work or form check for these areas'
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
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_soreness'],
        metadata: {
          context: 'new_to_exercise_education',
          recommendation: 'Ensure adequate rest between sessions'
        }
      });
    }
    
    return insights;
  }
  
  /**
   * Find common soreness areas from session history
   */
  private findCommonSorenessAreas(history: any[]): string[] {
    const areaFrequency = new Map<string, number>();
    
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
        confidence: 0.9,
        actionable: false,
        relatedFields: ['customization_soreness'],
        metadata: {
          sorenessLevel: 'none',
          recommendation: 'You can maintain or increase workout intensity'
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
      return b.confidence - a.confidence;
    });
  }
  
  // Backward compatibility method removed
  // Use analyze() method instead for soreness insights
} 