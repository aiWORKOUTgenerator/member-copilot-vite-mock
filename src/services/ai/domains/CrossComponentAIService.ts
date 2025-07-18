// Cross-Component AI Service - Analyzes interactions between different workout parameters
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';
import { PerWorkoutOptions } from '../../../types';

export interface CrossComponentConflict {
  components: string[];
  type: 'safety' | 'efficiency' | 'goal_alignment' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string;
  confidence: number;
  metadata?: Record<string, any>;
}

interface ConflictDetectionRule {
  condition: (options: PerWorkoutOptions, context: GlobalAIContext) => boolean;
  generateConflict: (options: PerWorkoutOptions, context: GlobalAIContext) => CrossComponentConflict;
}

export class CrossComponentAIService {
  private readonly CONFLICT_DETECTION_RULES: ConflictDetectionRule[] = [
    // Energy vs Duration conflicts
    {
      condition: (options, context) => {
        const energy = options.customization_energy;
        const duration = options.customization_duration;
        return energy && duration && energy <= 2 && duration > 60;
      },
      generateConflict: (options, context) => ({
        components: ['customization_energy', 'customization_duration'],
        type: 'efficiency',
        severity: 'high',
        description: 'Low energy level paired with long workout duration may lead to poor performance',
        suggestedResolution: 'Reduce duration to 30-45 minutes or focus on recovery activities',
        confidence: 0.9,
        metadata: {
          energyLevel: options.customization_energy,
          duration: options.customization_duration
        }
      })
    },
    
    // Energy vs Focus conflicts
    {
      condition: (options, context) => {
        const energy = options.customization_energy;
        const focus = options.customization_focus;
        return energy && focus && energy <= 2 && ['strength', 'power'].includes(focus);
      },
      generateConflict: (options, context) => ({
        components: ['customization_energy', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'Low energy with high-intensity focus may increase injury risk',
        suggestedResolution: 'Switch to mobility, flexibility, or recovery focus',
        confidence: 0.95,
        metadata: {
          energyLevel: options.customization_energy,
          focus: options.customization_focus
        }
      })
    },
    
    // Soreness vs Areas conflicts
    {
      condition: (options, context) => {
        const soreness = options.customization_soreness;
        const areas = options.customization_areas;
        return soreness && areas && soreness.length > 0 && 
               areas.some(area => soreness.includes(area));
      },
      generateConflict: (options, context) => ({
        components: ['customization_soreness', 'customization_areas'],
        type: 'safety',
        severity: 'medium',
        description: 'Selected workout areas overlap with sore muscle groups',
        suggestedResolution: 'Choose different areas or reduce intensity for sore regions',
        confidence: 0.85,
        metadata: {
          overlappingAreas: options.customization_areas?.filter(area => 
            options.customization_soreness?.includes(area)
          ),
          sorenessLevel: options.customization_soreness?.length
        }
      })
    },
    
    // Soreness vs Focus conflicts
    {
      condition: (options, context) => {
        const soreness = options.customization_soreness;
        const focus = options.customization_focus;
        return soreness && focus && soreness.length >= 3 && 
               ['strength', 'power', 'endurance'].includes(focus);
      },
      generateConflict: (options, context) => ({
        components: ['customization_soreness', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'High soreness with intense focus may worsen muscle recovery',
        suggestedResolution: 'Switch to recovery or flexibility focus',
        confidence: 0.9,
        metadata: {
          sorenessAreas: options.customization_soreness?.length,
          focus: options.customization_focus
        }
      })
    },
    
    // Focus vs Duration conflicts
    {
      condition: (options, context) => {
        const focus = options.customization_focus;
        const duration = options.customization_duration;
        return focus && duration && focus === 'strength' && duration < 30;
      },
      generateConflict: (options, context) => ({
        components: ['customization_focus', 'customization_duration'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Strength focus with very short duration may limit training effectiveness',
        suggestedResolution: 'Increase duration to 45+ minutes or switch to mobility focus',
        confidence: 0.8,
        metadata: {
          focus: options.customization_focus,
          duration: options.customization_duration
        }
      })
    },
    
    // Equipment vs Focus conflicts
    {
      condition: (options, context) => {
        const equipment = options.customization_equipment;
        const focus = options.customization_focus;
        return equipment && focus && focus === 'strength' && equipment.length === 0;
      },
      generateConflict: (options, context) => ({
        components: ['customization_equipment', 'customization_focus'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Strength focus without equipment may limit training options',
        suggestedResolution: 'Add resistance equipment or switch to body weight-friendly focus',
        confidence: 0.75,
        metadata: {
          focus: options.customization_focus,
          equipmentCount: equipment?.length || 0
        }
      })
    },
    
    // Equipment vs Duration conflicts
    {
      condition: (options, context) => {
        const equipment = options.customization_equipment;
        const duration = options.customization_duration;
        return equipment && duration && equipment.length > 4 && duration < 45;
      },
      generateConflict: (options, context) => ({
        components: ['customization_equipment', 'customization_duration'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Many equipment pieces with short duration may rush transitions',
        suggestedResolution: 'Reduce equipment selection or extend duration',
        confidence: 0.8,
        metadata: {
          equipmentCount: equipment?.length,
          duration: options.customization_duration
        }
      })
    },
    
    // Experience level vs Focus conflicts
    {
      condition: (options, context) => {
        const focus = options.customization_focus;
        const fitnessLevel = context.userProfile.fitnessLevel;
        return focus && fitnessLevel === 'new to exercise' && ['power', 'endurance'].includes(focus);
      },
      generateConflict: (options, context) => ({
        components: ['customization_focus', 'user_profile'],
        type: 'safety',
        severity: 'medium',
        description: 'Advanced focus may be inappropriate for someone new to exercise',
        suggestedResolution: 'Start with strength or flexibility focus to build foundation',
        confidence: 0.85,
        metadata: {
          focus: options.customization_focus,
          fitnessLevel: context.userProfile.fitnessLevel
        }
      })
    },
    
    // Time of day vs Focus conflicts
    {
      condition: (options, context) => {
        const focus = options.customization_focus;
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return focus && timeOfDay === 'evening' && ['power', 'strength'].includes(focus) && 
               options.customization_duration && options.customization_duration > 60;
      },
      generateConflict: (options, context) => ({
        components: ['customization_focus', 'customization_duration', 'time_of_day'],
        type: 'user_experience',
        severity: 'low',
        description: 'Intense evening workout may affect sleep quality',
        suggestedResolution: 'Reduce intensity or duration for evening sessions',
        confidence: 0.7,
        metadata: {
          focus: options.customization_focus,
          timeOfDay: context.environmentalFactors?.timeOfDay,
          duration: options.customization_duration
        }
      })
    },
    
    // Goal alignment conflicts
    {
      condition: (options, context) => {
        const focus = options.customization_focus;
        const goals = context.userProfile.goals;
        return focus && goals && goals.includes('weight_loss') && focus === 'strength' && 
               options.customization_duration && options.customization_duration > 60;
      },
      generateConflict: (options, context) => ({
        components: ['customization_focus', 'customization_duration', 'user_goals'],
        type: 'goal_alignment',
        severity: 'low',
        description: 'Long strength sessions may not align with weight loss goals',
        suggestedResolution: 'Consider cardio focus or circuit training for weight loss',
        confidence: 0.65,
        metadata: {
          focus: options.customization_focus,
          goals: context.userProfile.goals,
          duration: options.customization_duration
        }
      })
    }
  ];
  
  private readonly SYNERGY_DETECTION_RULES = [
    // Positive combinations
    {
      condition: (options: PerWorkoutOptions, context: GlobalAIContext) => {
        const focus = options.customization_focus;
        const equipment = options.customization_equipment;
        return focus === 'strength' && equipment?.includes('Dumbbells');
      },
      generateSynergy: (options: PerWorkoutOptions, context: GlobalAIContext) => ({
        components: ['customization_focus', 'customization_equipment'],
        type: 'optimization',
        description: 'Strength focus with dumbbells creates excellent training synergy',
        benefit: 'Allows for unilateral training and full range of motion',
        confidence: 0.9
      })
    },
    
    {
      condition: (options: PerWorkoutOptions, context: GlobalAIContext) => {
        const focus = options.customization_focus;
        const soreness = options.customization_soreness;
        const equipment = options.customization_equipment;
        return focus === 'recovery' && soreness && soreness.length > 0 && 
               equipment?.includes('Foam Roller');
      },
      generateSynergy: (options: PerWorkoutOptions, context: GlobalAIContext) => ({
        components: ['customization_focus', 'customization_soreness', 'customization_equipment'],
        type: 'optimization',
        description: 'Recovery focus with foam roller addresses soreness effectively',
        benefit: 'Perfect combination for active recovery and muscle maintenance',
        confidence: 0.95
      })
    }
  ];
  
  /**
   * Detect conflicts between different workout parameters
   */
  async detectConflicts(options: PerWorkoutOptions, context: GlobalAIContext): Promise<CrossComponentConflict[]> {
    const conflicts: CrossComponentConflict[] = [];
    
    // Apply conflict detection rules
    for (const rule of this.CONFLICT_DETECTION_RULES) {
      if (rule.condition(options, context)) {
        const conflict = rule.generateConflict(options, context);
        conflicts.push(conflict);
      }
    }
    
    // Sort by severity and confidence
    return conflicts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }
  
  /**
   * Find positive synergies between workout parameters
   */
  async findSynergies(options: PerWorkoutOptions, context: GlobalAIContext): Promise<any[]> {
    const synergies: any[] = [];
    
    for (const rule of this.SYNERGY_DETECTION_RULES) {
      if (rule.condition(options, context)) {
        const synergy = rule.generateSynergy(options, context);
        synergies.push(synergy);
      }
    }
    
    return synergies.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Analyze component interactions and provide recommendations
   */
  async analyzeInteractions(options: PerWorkoutOptions, context: GlobalAIContext): Promise<{
    conflicts: CrossComponentConflict[];
    synergies: any[];
    recommendations: AIInsight[];
  }> {
    const conflicts = await this.detectConflicts(options, context);
    const synergies = await this.findSynergies(options, context);
    const recommendations = this.generateRecommendations(conflicts, synergies, options, context);
    
    return { conflicts, synergies, recommendations };
  }
  
  /**
   * Generate recommendations based on conflicts and synergies
   */
  private generateRecommendations(
    conflicts: CrossComponentConflict[],
    synergies: any[],
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): AIInsight[] {
    const recommendations: AIInsight[] = [];
    
    // Convert conflicts to actionable insights
    conflicts.forEach(conflict => {
      recommendations.push({
        id: this.generateInsightId('conflict_resolution'),
        type: conflict.severity === 'critical' || conflict.severity === 'high' ? 'warning' : 'optimization',
        message: conflict.description,
        confidence: conflict.confidence,
        actionable: true,
        relatedFields: conflict.components,
        metadata: {
          conflictType: conflict.type,
          severity: conflict.severity,
          resolution: conflict.suggestedResolution,
          ...conflict.metadata
        }
      });
    });
    
    // Convert synergies to positive insights
    synergies.forEach(synergy => {
      recommendations.push({
        id: this.generateInsightId('synergy_highlight'),
        type: 'encouragement',
        message: synergy.description,
        confidence: synergy.confidence,
        actionable: false,
        relatedFields: synergy.components,
        metadata: {
          synergyType: synergy.type,
          benefit: synergy.benefit
        }
      });
    });
    
    // Generate optimization insights
    const optimizations = this.generateOptimizationInsights(options, context);
    recommendations.push(...optimizations);
    
    return recommendations.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return b.confidence - a.confidence;
    });
  }
  
  /**
   * Generate optimization insights based on current selections
   */
  private generateOptimizationInsights(options: PerWorkoutOptions, context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check for missing components that could enhance the workout
    if (!options.customization_equipment || options.customization_equipment.length === 0) {
      if (options.customization_focus === 'strength') {
        insights.push({
          id: this.generateInsightId('missing_equipment'),
          type: 'optimization',
          message: 'Adding resistance equipment could enhance strength training',
          confidence: 0.8,
          actionable: true,
          relatedFields: ['customization_equipment', 'customization_focus'],
          metadata: {
            suggestion: 'Consider adding dumbbells or resistance bands',
            reason: 'Equipment allows for progressive overload in strength training'
          }
        });
      }
    }
    
    // Check for balanced workout structure
    if (options.customization_focus === 'strength' && options.customization_duration && options.customization_duration >= 45) {
      const hasFlexibilityEquipment = options.customization_equipment?.some(eq => 
        ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)'].includes(eq)
      );
      
      if (!hasFlexibilityEquipment) {
        insights.push({
          id: this.generateInsightId('balance_suggestion'),
          type: 'optimization',
          message: 'Consider adding flexibility equipment for post-workout recovery',
          confidence: 0.75,
          actionable: true,
          relatedFields: ['customization_equipment', 'customization_focus'],
          metadata: {
            suggestion: 'Add foam roller or yoga mat for recovery',
            reason: 'Flexibility work enhances strength training recovery'
          }
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `cross_component_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  /**
   * Validate workout configuration for safety and effectiveness
   */
  async validateConfiguration(options: PerWorkoutOptions, context: GlobalAIContext): Promise<{
    isValid: boolean;
    criticalIssues: CrossComponentConflict[];
    warnings: CrossComponentConflict[];
    suggestions: AIInsight[];
  }> {
    const conflicts = await this.detectConflicts(options, context);
    const synergies = await this.findSynergies(options, context);
    
    const criticalIssues = conflicts.filter(c => c.severity === 'critical');
    const warnings = conflicts.filter(c => c.severity === 'high' || c.severity === 'medium');
    const suggestions = this.generateRecommendations(conflicts, synergies, options, context);
    
    return {
      isValid: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      suggestions: suggestions.filter(s => s.type === 'optimization')
    };
  }
  
  /**
   * Get component dependency map
   */
  getComponentDependencies(): Map<string, string[]> {
    return new Map([
      ['customization_focus', ['customization_duration', 'customization_equipment', 'customization_energy']],
      ['customization_energy', ['customization_duration', 'customization_focus', 'customization_soreness']],
      ['customization_soreness', ['customization_areas', 'customization_focus', 'customization_duration']],
      ['customization_duration', ['customization_focus', 'customization_energy', 'customization_equipment']],
      ['customization_equipment', ['customization_focus', 'customization_areas', 'customization_duration']],
      ['customization_areas', ['customization_soreness', 'customization_equipment', 'customization_focus']]
    ]);
  }
  
  /**
   * Analyze impact of changing one component on others
   */
  async analyzeComponentChange(
    component: keyof PerWorkoutOptions,
    newValue: any,
    currentOptions: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<{
    impacts: Array<{
      affectedComponent: string;
      impactType: 'positive' | 'negative' | 'neutral';
      description: string;
      confidence: number;
    }>;
    recommendations: AIInsight[];
  }> {
    const newOptions = { ...currentOptions, [component]: newValue };
    const currentConflicts = await this.detectConflicts(currentOptions, context);
    const newConflicts = await this.detectConflicts(newOptions, context);
    
    const impacts = this.compareConflictStates(currentConflicts, newConflicts);
    const recommendations = this.generateRecommendations(newConflicts, [], newOptions, context);
    
    return { impacts, recommendations };
  }
  
  /**
   * Compare conflict states to determine impact
   */
  private compareConflictStates(
    currentConflicts: CrossComponentConflict[],
    newConflicts: CrossComponentConflict[]
  ): Array<{
    affectedComponent: string;
    impactType: 'positive' | 'negative' | 'neutral';
    description: string;
    confidence: number;
  }> {
    const impacts: Array<{
      affectedComponent: string;
      impactType: 'positive' | 'negative' | 'neutral';
      description: string;
      confidence: number;
    }> = [];
    
    // This would implement detailed conflict comparison logic
    // For now, return basic impact analysis
    
    return impacts;
  }
} 