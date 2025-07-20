// Energy AI Service - Domain-specific AI logic for energy level analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

// Configuration Constants - Extracted from magic numbers
export const ENERGY_CONSTANTS = {
  // Energy thresholds
  CRITICAL_LOW: 1,
  LOW: 2,
  MODERATE: 3,
  HIGH: 4,
  MAXIMUM: 5,
  
  // Duration recommendations by energy level
  CRITICAL_LOW_DURATION: 15,
  LOW_DURATION: 25,
  MODERATE_DURATION: 35,
  HIGH_DURATION: 50,
  MAXIMUM_DURATION: 60,
  
  // Fitness level multipliers
  NEW_TO_EXERCISE_MULTIPLIER: 0.8,
  ADVANCED_ATHLETE_MULTIPLIER: 1.2,
  DEFAULT_MULTIPLIER: 1.0,
  
  // Analysis thresholds
  DISMISSAL_RATE_THRESHOLD: 0.7,
  TIME_PATTERN_MIN_INTERACTIONS: 3,
  
  // Confidence levels
  HIGH_CONFIDENCE: 0.95,
  MEDIUM_HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.85,
  MEDIUM_LOW_CONFIDENCE: 0.8,
  LOW_CONFIDENCE: 0.75,
  VERY_LOW_CONFIDENCE: 0.7
} as const;

interface EnergyThresholds {
  CRITICAL_LOW: number;
  LOW: number;
  MODERATE: number;
  HIGH: number;
  MAXIMUM: number;
}

interface EnergyInsightRule {
  condition: (value: number, context: GlobalAIContext) => boolean;
  generateInsight: (value: number, context: GlobalAIContext) => AIInsight;
}

export class EnergyAIService {
  private readonly THRESHOLDS: EnergyThresholds = {
    CRITICAL_LOW: ENERGY_CONSTANTS.CRITICAL_LOW,
    LOW: ENERGY_CONSTANTS.LOW,
    MODERATE: ENERGY_CONSTANTS.MODERATE,
    HIGH: ENERGY_CONSTANTS.HIGH,
    MAXIMUM: ENERGY_CONSTANTS.MAXIMUM
  };
  
  private readonly BASE_INSIGHTS: EnergyInsightRule[] = [
    {
      condition: (value) => value <= this.THRESHOLDS.CRITICAL_LOW,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('critical_low_energy'),
        type: 'warning',
        message: 'Very low energy level detected',
        recommendation: 'Consider resting or limiting to light mobility work today',
        confidence: ENERGY_CONSTANTS.HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy', 'customization_duration'],
        metadata: {
          severity: 'critical',
          energyLevel: value
        }
      })
    },
    {
      condition: (value) => value === this.THRESHOLDS.LOW,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('low_energy'),
        type: 'warning',
        message: 'Low energy level - consider lighter workout',
        recommendation: 'Consider gentle movements or recovery focus',
        confidence: ENERGY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy', 'customization_focus'],
        metadata: {
          severity: 'medium',
          energyLevel: value
        }
      })
    },
    {
      condition: (value) => value === this.THRESHOLDS.MODERATE,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('moderate_energy'),
        type: 'optimization',
        message: 'Moderate energy level',
        recommendation: 'Consider a balanced, moderate-intensity workout',
        confidence: ENERGY_CONSTANTS.LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          severity: 'low',
          energyLevel: value
        }
      })
    },
    {
      condition: (value) => value === this.THRESHOLDS.HIGH,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('high_energy'),
        type: 'encouragement',
        message: 'Good energy level',
        recommendation: 'Ready for a moderate to high-intensity workout',
        confidence: ENERGY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          severity: 'positive',
          energyLevel: value
        }
      })
    },
    {
      condition: (value) => value >= this.THRESHOLDS.MAXIMUM,
      generateInsight: (value, _context) => ({
        id: this.generateInsightId('maximum_energy'),
        type: 'encouragement',
        message: 'High energy level detected',
        recommendation: 'Great opportunity for an intense, challenging workout',
        confidence: ENERGY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          severity: 'positive',
          energyLevel: value
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: EnergyInsightRule[] = [
    {
      condition: (value, context) => 
        value <= this.THRESHOLDS.LOW && 
        context.environmentalFactors?.timeOfDay === 'morning',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('morning_low_energy'),
        type: 'education',
        message: 'Low morning energy is common',
        recommendation: 'Consider light movement to wake up your body',
        confidence: ENERGY_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          timeOfDay: context.environmentalFactors?.timeOfDay,
          energyLevel: value
        }
      })
    },
    {
      condition: (value, context) => 
        value <= this.THRESHOLDS.LOW && 
        context.environmentalFactors?.timeOfDay === 'evening',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('evening_low_energy'),
        type: 'education',
        message: 'Evening fatigue detected',
        recommendation: 'Consider gentle stretching or recovery work',
        confidence: ENERGY_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          timeOfDay: context.environmentalFactors?.timeOfDay,
          energyLevel: value
        }
      })
    },
    {
      condition: (value, context) => 
        value <= this.THRESHOLDS.LOW && 
        context.userProfile.fitnessLevel === 'new to exercise',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('new_to_exercise_low_energy'),
        type: 'education',
        message: 'Low energy is normal when starting fitness',
        recommendation: 'Start with short, gentle movements and build gradually',
        confidence: ENERGY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          fitnessLevel: context.userProfile.fitnessLevel,
          energyLevel: value
        }
      })
    },
    {
      condition: (value, context) => 
        value >= this.THRESHOLDS.HIGH && 
        context.userProfile.fitnessLevel === 'advanced athlete',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('advanced_high_energy'),
        type: 'encouragement',
        message: 'High energy matches your fitness level',
        recommendation: 'Perfect opportunity for advanced training techniques',
        confidence: ENERGY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy'],
        metadata: {
          fitnessLevel: context.userProfile.fitnessLevel,
          energyLevel: value
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: EnergyInsightRule[] = [
    {
      condition: (value, context) => 
        value <= this.THRESHOLDS.LOW && 
        this.getDurationFromContext(context) > 45,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('energy_duration_conflict'),
        type: 'warning',
        message: 'Low energy conflicts with long workout duration',
        recommendation: 'Consider reducing workout duration to 20-30 minutes',
        confidence: ENERGY_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy', 'customization_duration'],
        metadata: {
          energyLevel: value,
          duration: this.getDurationFromContext(context)
        }
      })
    },
    {
      condition: (value, context) => 
        value <= this.THRESHOLDS.LOW && 
        context.currentSelections.customization_focus === 'power',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('energy_power_conflict'),
        type: 'warning',
        message: 'Low energy not ideal for power training',
        confidence: ENERGY_CONSTANTS.MEDIUM_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy', 'customization_focus'],
        metadata: {
          energyLevel: value,
          focus: context.currentSelections.customization_focus,
          recommendation: 'Consider changing focus to recovery or flexibility'
        }
      })
    },
    {
      condition: (value, context) => 
        value >= this.THRESHOLDS.HIGH && 
        context.currentSelections.customization_focus === 'recovery',
      generateInsight: (value, context) => ({
        id: this.generateInsightId('energy_recovery_mismatch'),
        type: 'optimization',
        message: 'High energy with recovery focus',
        confidence: ENERGY_CONSTANTS.VERY_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_energy', 'customization_focus'],
        metadata: {
          energyLevel: value,
          focus: context.currentSelections.customization_focus,
          recommendation: 'You could handle a more challenging workout if desired'
        }
      })
    }
  ];
  
  /**
   * Main analysis method - generates comprehensive energy insights
   */
  async analyze(energyLevel: number | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    if (energyLevel === undefined || energyLevel === null) {
      return [];
    }
    
    // Validate energy level
    if (energyLevel < 1 || energyLevel > 5) {
      return [{
        id: this.generateInsightId('invalid_energy'),
        type: 'warning',
        message: 'Invalid energy level provided',
        confidence: 1.0,
        actionable: false,
        metadata: {
          providedValue: energyLevel,
          expectedRange: '1-5'
        }
      }];
    }
    
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(energyLevel, context)) {
        insights.push(rule.generateInsight(energyLevel, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(energyLevel, context)) {
        const insight = rule.generateInsight(energyLevel, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(energyLevel, context)) {
        const insight = rule.generateInsight(energyLevel, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = this.generateLearningInsights(energyLevel, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
  
  /**
   * Generate insights for backward compatibility
   */
  generateInsights(energyLevel: number, context: GlobalAIContext): AIInsight[] {
    // Convert to legacy format for compatibility
    // Since analyze is async, we need to handle this differently
    // For now, return a synchronous version
    if (energyLevel === undefined || energyLevel === null) {
      return [];
    }
    
    // Validate energy level
    if (energyLevel < 1 || energyLevel > 5) {
      return [{
        id: this.generateInsightId('invalid_energy'),
        type: 'warning',
        message: 'Invalid energy level provided',
        confidence: 1.0,
        actionable: false,
        metadata: {
          providedValue: energyLevel,
          expectedRange: '1-5'
        }
      }];
    }
    
    const insights: AIInsight[] = [];
    
    // Apply base insights synchronously
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(energyLevel, context)) {
        insights.push(rule.generateInsight(energyLevel, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(energyLevel, context)) {
        const insight = rule.generateInsight(energyLevel, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(energyLevel, context)) {
        const insight = rule.generateInsight(energyLevel, context);
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
  
  /**
   * Generate learning insights based on user history
   */
  private generateLearningInsights(energyLevel: number, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    const history = context.sessionHistory || [];
    
    // Check for patterns in user behavior
    const energyInteractions = history.filter(interaction => 
      interaction.component === 'energy' || 
      interaction.recommendationId?.includes('energy')
    );
    
    // If user consistently dismisses energy recommendations
    const dismissalRate = energyInteractions.filter(i => 
      i.action === 'recommendation_dismissed'
    ).length / Math.max(energyInteractions.length, 1);
    
    if (dismissalRate > ENERGY_CONSTANTS.DISMISSAL_RATE_THRESHOLD && energyLevel <= this.THRESHOLDS.LOW) {
      insights.push({
        id: this.generateInsightId('energy_dismissal_pattern'),
        type: 'education',
        message: 'Noticed you often continue with low energy',
        recommendation: 'Consider if this pattern affects your workout quality',
        confidence: ENERGY_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        actionable: true,
        metadata: {
          pattern: 'dismissal',
          dismissalRate
        }
      });
    }
    
    // If user consistently has high energy at certain times
    const timeOfDay = context.environmentalFactors?.timeOfDay;
    if (timeOfDay && energyLevel >= this.THRESHOLDS.HIGH) {
      const sameTimeHighEnergy = history.filter(interaction => 
        interaction.component === 'energy' && 
        interaction.timestamp.getHours() === new Date().getHours()
      );
      
      if (sameTimeHighEnergy.length >= ENERGY_CONSTANTS.TIME_PATTERN_MIN_INTERACTIONS) {
        insights.push({
          id: this.generateInsightId('energy_time_pattern'),
          type: 'education',
          message: `You tend to have high energy during ${timeOfDay}`,
          recommendation: 'Consider scheduling challenging workouts at this time',
          confidence: ENERGY_CONSTANTS.LOW_CONFIDENCE,
          actionable: true,
          metadata: {
            pattern: 'time_consistency',
            timeOfDay
          }
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Helper method to get duration from context
   */
  private getDurationFromContext(context: GlobalAIContext): number {
    const duration = context.currentSelections.customization_duration;
    if (typeof duration === 'number') {
      return duration;
    }
    if (typeof duration === 'object' && duration?.totalDuration) {
      return duration.totalDuration;
    }
    return 0;
  }
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `energy_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  /**
   * Get energy level description
   */
  getEnergyDescription(energyLevel: number): string {
    if (energyLevel <= this.THRESHOLDS.CRITICAL_LOW) {
      return 'Very Low - Consider rest or light movement';
    }
    if (energyLevel <= this.THRESHOLDS.LOW) {
      return 'Low - Gentle exercise recommended';
    }
    if (energyLevel <= this.THRESHOLDS.MODERATE) {
      return 'Moderate - Balanced workout suitable';
    }
    if (energyLevel <= this.THRESHOLDS.HIGH) {
      return 'High - Ready for challenging workout';
    }
    return 'Maximum - Perfect for intense training';
  }
  
  /**
   * Get recommended workout intensity based on energy
   */
  getRecommendedIntensity(energyLevel: number): 'rest' | 'light' | 'moderate' | 'high' | 'maximum' {
    if (energyLevel <= this.THRESHOLDS.CRITICAL_LOW) return 'rest';
    if (energyLevel <= this.THRESHOLDS.LOW) return 'light';
    if (energyLevel <= this.THRESHOLDS.MODERATE) return 'moderate';
    if (energyLevel <= this.THRESHOLDS.HIGH) return 'high';
    return 'maximum';
  }
  
  /**
   * Get energy-based duration recommendation
   */
  getRecommendedDuration(energyLevel: number, userFitnessLevel: string): number {
    const baseMultiplier = userFitnessLevel === 'new to exercise' ? ENERGY_CONSTANTS.NEW_TO_EXERCISE_MULTIPLIER :
                           userFitnessLevel === 'advanced athlete' ? ENERGY_CONSTANTS.ADVANCED_ATHLETE_MULTIPLIER : 
                           ENERGY_CONSTANTS.DEFAULT_MULTIPLIER;
    
    if (energyLevel <= this.THRESHOLDS.CRITICAL_LOW) {
      return Math.round(ENERGY_CONSTANTS.CRITICAL_LOW_DURATION * baseMultiplier);
    }
    if (energyLevel <= this.THRESHOLDS.LOW) {
      return Math.round(ENERGY_CONSTANTS.LOW_DURATION * baseMultiplier);
    }
    if (energyLevel <= this.THRESHOLDS.MODERATE) {
      return Math.round(ENERGY_CONSTANTS.MODERATE_DURATION * baseMultiplier);
    }
    if (energyLevel <= this.THRESHOLDS.HIGH) {
      return Math.round(ENERGY_CONSTANTS.HIGH_DURATION * baseMultiplier);
    }
    return Math.round(ENERGY_CONSTANTS.MAXIMUM_DURATION * baseMultiplier);
  }
  
  /**
   * Check if energy level is compatible with workout focus
   */
  isEnergyCompatibleWithFocus(energyLevel: number, focus: string): boolean {
    const highEnergyRequired = ['power', 'hiit', 'intense_cardio'];
    const lowEnergyOkay = ['recovery', 'flexibility', 'mobility'];
    
    if (energyLevel <= this.THRESHOLDS.LOW) {
      return lowEnergyOkay.includes(focus);
    }
    if (energyLevel <= this.THRESHOLDS.MODERATE) {
      return !highEnergyRequired.includes(focus);
    }
    return true; // High energy is compatible with all focuses
  }
} 