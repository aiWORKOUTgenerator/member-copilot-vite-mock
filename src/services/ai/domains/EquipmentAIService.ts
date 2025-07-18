// Equipment AI Service - Domain-specific AI logic for equipment selection analysis
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';

interface EquipmentCategories {
  STRENGTH: string[];
  CARDIO: string[];
  FLEXIBILITY: string[];
  BODYWEIGHT: string[];
  FUNCTIONAL: string[];
}

interface EquipmentInsightRule {
  condition: (value: string[] | undefined, context: GlobalAIContext) => boolean;
  generateInsight: (value: string[] | undefined, context: GlobalAIContext) => AIInsight;
}

export class EquipmentAIService {
  private readonly EQUIPMENT_CATEGORIES: EquipmentCategories = {
    STRENGTH: ['Dumbbells', 'Barbells & Weight Plates', 'Kettlebells', 'Resistance Bands', 'Strength Machines'],
    CARDIO: ['Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)', 'Pool (If available)'],
    FLEXIBILITY: ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)'],
    BODYWEIGHT: ['Body Weight', 'Suspension Trainer/TRX'],
    FUNCTIONAL: ['Functional Training Area (Kettlebells, Resistance Bands, TRX)', 'Suspension Trainer/TRX']
  };
  
  private readonly EQUIPMENT_COMBINATIONS = new Map<string, string[]>([
    ['Dumbbells', ['Yoga Mat', 'Yoga Mat & Stretching Space']],
    ['Barbells & Weight Plates', ['Strength Machines', 'Yoga Mat & Stretching Space']],
    ['Kettlebells', ['Yoga Mat', 'Yoga Mat & Stretching Space']],
    ['Resistance Bands', ['Yoga Mat', 'Suspension Trainer/TRX']],
    ['Yoga Mat', ['Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)']],
    ['Suspension Trainer/TRX', ['Yoga Mat', 'Yoga Mat & Stretching Space']]
  ]);
  
  private readonly FOCUS_EQUIPMENT_ALIGNMENT = new Map<string, string[]>([
    ['strength', ['Dumbbells', 'Barbells & Weight Plates', 'Kettlebells', 'Resistance Bands', 'Strength Machines']],
    ['cardio', ['Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)', 'Pool (If available)']],
    ['flexibility', ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)']],
    ['recovery', ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)']],
    ['mobility', ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)', 'Resistance Bands']],
    ['power', ['Kettlebells', 'Functional Training Area (Kettlebells, Resistance Bands, TRX)']],
    ['endurance', ['Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)', 'Resistance Bands', 'Body Weight']]
  ]);
  
  private readonly BASE_INSIGHTS: EquipmentInsightRule[] = [
    {
      condition: (value) => !value || value.length === 0,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('no_equipment'),
        type: 'optimization',
        message: 'No equipment selected - body weight exercises available',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_equipment'],
        metadata: {
          equipmentCount: 0,
          recommendation: 'Body weight exercises can be highly effective'
        }
      })
    },
    {
      condition: (value) => value && value.length > 5,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('too_much_equipment'),
        type: 'warning',
        message: 'Many equipment pieces selected - may overcomplicate workout',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_duration'],
        metadata: {
          equipmentCount: value.length,
          recommendation: 'Consider focusing on 2-3 key pieces for efficiency'
        }
      })
    },
    {
      condition: (value) => value && value.length >= 1 && value.length <= 3,
      generateInsight: (value, context) => ({
        id: this.generateInsightId('optimal_equipment'),
        type: 'encouragement',
        message: 'Good equipment selection - allows for focused, effective workout',
        confidence: 0.85,
        actionable: false,
        relatedFields: ['customization_equipment'],
        metadata: {
          equipmentCount: value.length,
          recommendation: 'This amount of equipment provides good variety'
        }
      })
    },
    {
      condition: (value) => value?.includes('Dumbbells'),
      generateInsight: (value, context) => ({
        id: this.generateInsightId('dumbbells_selected'),
        type: 'optimization',
        message: 'Dumbbells selected - excellent for full-body strength training',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_areas'],
        metadata: {
          equipmentType: 'strength',
          recommendation: 'Dumbbells allow for unilateral training and full range of motion'
        }
      })
    }
  ];
  
  private readonly CONTEXTUAL_RULES: EquipmentInsightRule[] = [
    {
      condition: (_value, context) => {
        const focus = context.currentSelections.customization_focus ?? '';
        return focus && this.FOCUS_EQUIPMENT_ALIGNMENT.has(focus);
      },
      generateInsight: (value, context) => {
        if (!value || !context.currentSelections.customization_focus) {
          return {
            id: this.generateInsightId('no_equipment_data'),
            type: 'info',
            message: 'No equipment data available for analysis',
            confidence: 0.0,
            actionable: false,
            relatedFields: ['customization_equipment'],
            metadata: {
              context: 'no_data',
              recommendation: 'Select equipment to get personalized insights'
            }
          };
        }
        const focus = context.currentSelections.customization_focus;
        const recommendedEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focus) || [];
        const alignedEquipment = value.filter(eq => recommendedEquipment.includes(eq));
        
        if (alignedEquipment.length === 0) {
          return {
            id: this.generateInsightId('equipment_focus_mismatch'),
            type: 'warning',
            message: `Equipment doesn't align with ${focus} focus - consider ${recommendedEquipment[0]}`,
            confidence: 0.85,
            actionable: true,
            relatedFields: ['customization_equipment', 'customization_focus'],
            metadata: {
              context: 'focus_equipment_mismatch',
              currentFocus: focus,
              recommendedEquipment: recommendedEquipment.slice(0, 3),
              recommendation: `Add ${recommendedEquipment[0]} for better ${focus} results`
            }
          };
        }
        
        return {
          id: this.generateInsightId('equipment_focus_aligned'),
          type: 'encouragement',
          message: `Equipment well-aligned with ${focus} focus`,
          confidence: 0.9,
          actionable: false,
          relatedFields: ['customization_equipment', 'customization_focus'],
          metadata: {
            context: 'focus_equipment_match',
            currentFocus: focus,
            alignedEquipment,
            recommendation: 'Great equipment choice for your focus'
          }
        };
      }
    },
    {
      condition: (value, context) => {
        const energyLevel = context.currentSelections.customization_energy;
        return value && value.length > 3 && energyLevel && energyLevel <= 2;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('complex_equipment_low_energy'),
        type: 'warning',
        message: 'Multiple equipment with low energy - simplify for better focus',
        confidence: 0.85,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_energy'],
        metadata: {
          context: 'energy_equipment_mismatch',
          equipmentCount: value.length,
          recommendation: 'Choose 1-2 pieces for a more manageable workout'
        }
      })
    },
    {
      condition: (value, context) => {
        const location = context.environmentalFactors?.location;
        return value && value.some(eq => ['Treadmill', 'Stationary Bike', 'Elliptical'].includes(eq)) && location === 'home';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('large_equipment_home'),
        type: 'optimization',
        message: 'Large cardio equipment at home - ensure adequate space',
        confidence: 0.75,
        actionable: true,
        relatedFields: ['customization_equipment'],
        metadata: {
          context: 'space_consideration',
          location: 'home',
          recommendation: 'Ensure sufficient space for safe equipment use'
        }
      })
    },
    {
      condition: (value, context) => {
        const fitnessLevel = context.userProfile.fitnessLevel;
        return value && value.includes('Barbells & Weight Plates') && fitnessLevel === 'new to exercise';
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('barbell_beginner'),
        type: 'warning',
        message: 'Barbells for beginner - ensure proper form and supervision',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_equipment'],
        metadata: {
          context: 'safety_consideration',
          recommendation: 'Start with lighter weights or consider dumbbells first'
        }
      })
    }
  ];
  
  private readonly CROSS_COMPONENT_RULES: EquipmentInsightRule[] = [
    {
      condition: (value, context) => {
        const duration = context.currentSelections.customization_duration;
        return value && value.length > 4 && duration && duration < 45;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('equipment_duration_mismatch'),
        type: 'warning',
        message: 'Many equipment pieces with short duration - prioritize key exercises',
        confidence: 0.8,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_duration'],
        metadata: {
          context: 'duration_equipment_conflict',
          equipmentCount: value.length,
          duration: context.currentSelections.customization_duration,
          recommendation: 'Focus on 2-3 pieces for short workouts'
        }
      })
    },
    {
      condition: (value, context) => {
        const areas = context.currentSelections.customization_areas;
        return value && value.includes('Dumbbells') && areas?.includes('Upper Body');
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('dumbbells_upper_body'),
        type: 'optimization',
        message: 'Dumbbells with upper body focus - excellent combination',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_areas'],
        metadata: {
          context: 'equipment_area_synergy',
          recommendation: 'Dumbbells are perfect for targeted upper body training'
        }
      })
    },
    {
      condition: (value, context) => {
        const soreness = context.currentSelections.customization_soreness;
        return value && value.includes('Foam Roller') && soreness && soreness.length > 0;
      },
      generateInsight: (value, context) => ({
        id: this.generateInsightId('foam_roller_soreness'),
        type: 'encouragement',
        message: 'Foam roller with soreness - excellent for recovery',
        confidence: 0.95,
        actionable: true,
        relatedFields: ['customization_equipment', 'customization_soreness'],
        metadata: {
          context: 'recovery_equipment_match',
          recommendation: 'Foam rolling will help address muscle soreness'
        }
      })
    }
  ];
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `equipment_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  /**
   * Generate learning insights based on user history
   */
  private generateLearningInsights(value: string[] | undefined, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze equipment usage patterns
    const recentEquipment = context.sessionHistory
      .filter(interaction => interaction.component === 'equipment')
      .slice(-10);
    
    if (recentEquipment.length >= 3) {
      const equipmentFrequency = this.analyzeEquipmentFrequency(recentEquipment);
      const favoriteEquipment = Array.from(equipmentFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (favoriteEquipment.length > 0) {
        const currentEquipment = value || [];
        const missingFavorites = favoriteEquipment
          .filter(([equipment]) => !currentEquipment.includes(equipment))
          .map(([equipment]) => equipment);
        
        if (missingFavorites.length > 0) {
          insights.push({
            id: this.generateInsightId('missing_favorite_equipment'),
            type: 'optimization',
            message: `You often use ${missingFavorites[0]} - consider adding it today`,
            confidence: 0.75,
            actionable: true,
            relatedFields: ['customization_equipment'],
            metadata: {
              context: 'usage_pattern_learning',
              favoriteEquipment: missingFavorites[0],
              recommendation: 'Include equipment you typically enjoy using'
            }
          });
        }
      }
    }
    
    // Check for equipment combinations
    if (value && value.length > 1) {
      const synergies = this.findEquipmentSynergies(value);
      if (synergies.length > 0) {
        insights.push({
          id: this.generateInsightId('equipment_synergy'),
          type: 'optimization',
          message: `Great equipment combination - ${synergies[0]} work well together`,
          confidence: 0.8,
          actionable: false,
          relatedFields: ['customization_equipment'],
          metadata: {
            context: 'equipment_synergy',
            synergyEquipment: synergies[0],
            recommendation: 'This combination allows for varied exercises'
          }
        });
      }
    }
    
    // Safety reminders based on equipment
    if (value?.some(eq => ['Barbells & Weight Plates', 'Kettlebells'].includes(eq))) {
      insights.push({
        id: this.generateInsightId('safety_reminder'),
        type: 'education',
        message: 'Heavy equipment selected - prioritize proper form and warm-up',
        confidence: 0.9,
        actionable: true,
        relatedFields: ['customization_equipment'],
        metadata: {
          context: 'safety_education',
          recommendation: 'Always warm up thoroughly before using heavy equipment'
        }
      });
    }
    
    return insights;
  }
  
  /**
   * Analyze equipment frequency from session history
   */
  private analyzeEquipmentFrequency(history: any[]): Map<string, number> {
    const frequency = new Map<string, number>();
    
    // This would analyze actual equipment usage from history
    // For now, return empty map
    return frequency;
  }
  
  /**
   * Find equipment synergies
   */
  private findEquipmentSynergies(equipment: string[]): string[] {
    const synergies: string[] = [];
    
    // Check for known good combinations
    for (const [primary, complements] of this.EQUIPMENT_COMBINATIONS) {
      if (equipment.includes(primary) && complements.some(comp => equipment.includes(comp))) {
        synergies.push(`${primary} and ${complements.find(comp => equipment.includes(comp))}`);
      }
    }
    
    return synergies;
  }
  
  /**
   * Main analysis method - generates comprehensive equipment insights
   */
  async analyze(equipment: string[] | undefined, context: GlobalAIContext): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Apply base insights
    for (const rule of this.BASE_INSIGHTS) {
      if (rule.condition(equipment, context)) {
        insights.push(rule.generateInsight(equipment, context));
      }
    }
    
    // Apply contextual insights
    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(equipment, context)) {
        const insight = rule.generateInsight(equipment, context);
        // Avoid duplicates
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Apply cross-component insights
    for (const rule of this.CROSS_COMPONENT_RULES) {
      if (rule.condition(equipment, context)) {
        const insight = rule.generateInsight(equipment, context);
        if (!insights.some(existing => existing.id === insight.id)) {
          insights.push(insight);
        }
      }
    }
    
    // Add learning insights based on user history
    const learningInsights = this.generateLearningInsights(equipment, context);
    insights.push(...learningInsights);
    
    // Sort by confidence and actionability
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return b.confidence - a.confidence;
    });
  }
  
  // Backward compatibility method removed
  // Use analyze() method instead for equipment insights
} 