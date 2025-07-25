// Cross-Component AI Service - Analyzes interactions between different workout parameters
import { AIInsight } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';
import { PerWorkoutOptions } from '../../../types';
import { 
  extractDurationValue, 
  extractFocusValue, 
  extractSorenessAreas, 
  extractAreasList,
  extractEquipmentList 
} from '../../../types/guards';
import { dataTransformers } from '../../../utils/dataTransformers';

// Configuration Constants - Extracted from magic numbers
export const CROSS_COMPONENT_CONSTANTS = {
  // Energy thresholds
  LOW_ENERGY_THRESHOLD: 2,
  HIGH_ENERGY_THRESHOLD: 4,
  
  // Duration thresholds
  SHORT_DURATION_THRESHOLD: 30,
  LONG_DURATION_THRESHOLD: 60,
  VERY_LONG_DURATION_THRESHOLD: 45,
  
  // Soreness thresholds
  HIGH_SORENESS_THRESHOLD: 3,
  
  // Equipment thresholds
  MIN_EQUIPMENT_FOR_STRENGTH: 2,
  MAX_EQUIPMENT_FOR_SHORT_DURATION: 4,
  
  // Confidence levels
  HIGH_CONFIDENCE: 0.95,
  MEDIUM_HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.85,
  MEDIUM_LOW_CONFIDENCE: 0.8,
  LOW_CONFIDENCE: 0.75,
  VERY_LOW_CONFIDENCE: 0.7,
  
  // Warm-up duration
  WARMUP_DURATION_MINUTES: 5,
  WARMUP_DURATION_MAX_MINUTES: 10
} as const;

export interface CrossComponentConflict {
  id: string;                    // Unique identifier for the conflict
  components: string[];
  type: 'safety' | 'efficiency' | 'goal_alignment' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string;
  confidence: number;
  impact: 'performance' | 'safety' | 'effectiveness';  // Impact assessment
  metadata?: Record<string, unknown>;
}

interface ConflictDetectionRule {
  condition: (options: PerWorkoutOptions, context: GlobalAIContext) => boolean;
  generateConflict: (options: PerWorkoutOptions, context: GlobalAIContext) => CrossComponentConflict;
}

interface SynergyDetectionRule {
  condition: (options: PerWorkoutOptions, context: GlobalAIContext) => boolean;
  generateSynergy: (options: PerWorkoutOptions, context: GlobalAIContext) => Synergy;
}

interface Synergy {
  id: string;
  components: string[];
  type: string;
  description: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export class CrossComponentAIService {
  private readonly CONFLICT_DETECTION_RULES: ConflictDetectionRule[] = [
    // Energy vs Duration conflicts
    {
      condition: (options, _context) => {
        const energy = options.customization_energy;
        const duration = extractDurationValue(options.customization_duration);
        return !!(typeof energy === 'number' && duration && energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD && duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('energy_duration'),
        components: ['customization_energy', 'customization_duration'],
        type: 'efficiency',
        severity: 'high',
        description: 'Low energy level paired with long workout duration may lead to poor performance',
        suggestedResolution: 'Reduce duration to 30-45 minutes or focus on recovery activities',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        impact: 'performance',
        metadata: {
          energyLevel: options.customization_energy,
          duration: extractDurationValue(options.customization_duration)
        }
      })
    },
    
    // Energy vs Focus conflicts
    {
      condition: (options, _context) => {
        const energy = options.customization_energy;
        const focus = extractFocusValue(options.customization_focus);
        return !!(typeof energy === 'number' && focus && energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD && ['strength', 'power'].includes(focus));
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('energy_focus'),
        components: ['customization_energy', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'Low energy with high-intensity focus may increase injury risk',
        suggestedResolution: 'Switch to mobility, flexibility, or recovery focus',
        confidence: CROSS_COMPONENT_CONSTANTS.HIGH_CONFIDENCE,
        impact: 'safety',
        metadata: {
          energyLevel: options.customization_energy,
          focus: extractFocusValue(options.customization_focus)
        }
      })
    },
    
    // Soreness vs Areas conflicts
    {
      condition: (options, _context) => {
        const sorenessAreas = extractSorenessAreas(options.customization_soreness);
        const areas = extractAreasList(options.customization_areas);
        return !!(sorenessAreas.length > 0 && areas.length > 0 && 
               areas.some(area => sorenessAreas.includes(area)));
      },
      generateConflict: (options, _context) => {
        const sorenessAreas = extractSorenessAreas(options.customization_soreness);
        const areas = extractAreasList(options.customization_areas);
        const overlappingAreas = areas.filter(area => sorenessAreas.includes(area));
        
        return {
          id: this.generateConflictId('soreness_areas'),
        components: ['customization_soreness', 'customization_areas'],
        type: 'safety',
        severity: 'medium',
        description: 'Selected workout areas overlap with sore muscle groups',
        suggestedResolution: 'Choose different areas or reduce intensity for sore regions',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
          impact: 'safety',
        metadata: {
            overlappingAreas,
            sorenessLevel: sorenessAreas.length
        }
        };
      }
    },
    
    // Soreness vs Focus conflicts
    {
      condition: (options, _context) => {
        const sorenessAreas = extractSorenessAreas(options.customization_soreness);
        const focus = extractFocusValue(options.customization_focus);
        return !!(sorenessAreas.length >= CROSS_COMPONENT_CONSTANTS.HIGH_SORENESS_THRESHOLD && focus && 
               ['strength', 'power', 'endurance'].includes(focus));
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('soreness_focus'),
        components: ['customization_soreness', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'High soreness with intense focus may worsen muscle recovery',
        suggestedResolution: 'Switch to recovery or flexibility focus',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        impact: 'safety',
        metadata: {
          sorenessAreas: extractSorenessAreas(options.customization_soreness).length,
          focus: extractFocusValue(options.customization_focus)
        }
      })
    },
    
    // Focus vs Duration conflicts
    {
      condition: (options, _context) => {
        const focus = extractFocusValue(options.customization_focus);
        const duration = extractDurationValue(options.customization_duration);
        return !!(focus && duration && focus === 'strength' && duration < CROSS_COMPONENT_CONSTANTS.SHORT_DURATION_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('focus_duration'),
        components: ['customization_focus', 'customization_duration'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Strength focus with very short duration may limit training effectiveness',
        suggestedResolution: 'Increase duration to 45+ minutes or switch to mobility focus',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        impact: 'effectiveness',
        metadata: {
          focus: extractFocusValue(options.customization_focus),
          duration: extractDurationValue(options.customization_duration)
        }
      })
    },

    // Injury vs Focus conflicts
    {
      condition: (options, _context) => {
        const injuryRegions = dataTransformers.extractInjuryRegions(options.customization_injury);
        const focus = extractFocusValue(options.customization_focus);
        return !!(injuryRegions.length > 0 && focus && ['strength', 'power'].includes(focus));
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('injury_focus'),
        components: ['customization_injury', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'Injuries present with high-intensity focus may worsen conditions',
        suggestedResolution: 'Switch to mobility, flexibility, or recovery focus',
        confidence: CROSS_COMPONENT_CONSTANTS.HIGH_CONFIDENCE,
        impact: 'safety',
        metadata: {
          injuryRegions: dataTransformers.extractInjuryRegions(options.customization_injury),
          focus: extractFocusValue(options.customization_focus)
        }
      })
    },

    // Injury vs Duration conflicts
    {
      condition: (options, _context) => {
        const injuryRegions = dataTransformers.extractInjuryRegions(options.customization_injury);
        const duration = extractDurationValue(options.customization_duration);
        return !!(injuryRegions.length > 0 && duration && duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('injury_duration'),
        components: ['customization_injury', 'customization_duration'],
        type: 'safety',
        severity: 'medium',
        description: 'Long workout duration with injuries may increase risk of aggravation',
        suggestedResolution: 'Reduce duration to 30-45 minutes or focus on shorter, targeted sessions',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        impact: 'safety',
        metadata: {
          injuryRegions: dataTransformers.extractInjuryRegions(options.customization_injury),
          duration: extractDurationValue(options.customization_duration)
        }
      })
    },
    
    // Equipment vs Focus conflicts
    {
      condition: (options, _context) => {
        const equipment = extractEquipmentList(options.customization_equipment);
        const focus = extractFocusValue(options.customization_focus);
        return !!(equipment.length === 0 && focus && focus === 'strength');
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('equipment_focus'),
        components: ['customization_equipment', 'customization_focus'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Strength focus without equipment may limit training options',
        suggestedResolution: 'Add resistance equipment or switch to body weight-friendly focus',
        confidence: CROSS_COMPONENT_CONSTANTS.LOW_CONFIDENCE,
        impact: 'effectiveness',
        metadata: {
          focus: extractFocusValue(options.customization_focus),
          equipmentCount: extractEquipmentList(options.customization_equipment).length
        }
      })
    },
    
    // Equipment vs Duration conflicts
    {
      condition: (options, _context) => {
        const equipment = extractEquipmentList(options.customization_equipment);
        const duration = extractDurationValue(options.customization_duration);
        return !!(equipment.length > CROSS_COMPONENT_CONSTANTS.MAX_EQUIPMENT_FOR_SHORT_DURATION && duration && duration < CROSS_COMPONENT_CONSTANTS.VERY_LONG_DURATION_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('equipment_duration'),
        components: ['customization_equipment', 'customization_duration'],
        type: 'efficiency',
        severity: 'medium',
        description: 'Many equipment pieces with short duration may rush transitions',
        suggestedResolution: 'Reduce equipment selection or extend duration',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        impact: 'effectiveness',
        metadata: {
          equipmentCount: extractEquipmentList(options.customization_equipment).length,
          duration: extractDurationValue(options.customization_duration)
        }
      })
    },
    
    // Experience level vs Focus conflicts
    {
      condition: (options, context) => {
        const focus = extractFocusValue(options.customization_focus);
        const fitnessLevel = context.userProfile.fitnessLevel;
        return !!(focus && fitnessLevel === 'new to exercise' && ['power', 'endurance'].includes(focus));
      },
      generateConflict: (options, context) => ({
        id: this.generateConflictId('experience_focus'),
        components: ['customization_focus', 'user_profile'],
        type: 'safety',
        severity: 'medium',
        description: 'Advanced focus may be inappropriate for someone new to exercise',
        suggestedResolution: 'Start with strength or flexibility focus to build foundation',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
        impact: 'safety',
        metadata: {
          focus: extractFocusValue(options.customization_focus),
          fitnessLevel: context.userProfile.fitnessLevel
        }
      })
    },
    
    // Time of day vs Focus conflicts
    {
      condition: (options, context) => {
        const focus = extractFocusValue(options.customization_focus);
        const timeOfDay = context.environmentalFactors?.timeOfDay;
        return !!(focus && timeOfDay === 'evening' && ['power', 'strength'].includes(focus) && 
               context.userProfile.fitnessLevel !== 'advanced athlete');
      },
      generateConflict: (options, context) => ({
        id: this.generateConflictId('time_focus'),
        components: ['customization_focus', 'environmental_factors'],
        type: 'user_experience',
        severity: 'medium',
        description: 'High-intensity focus in the evening may affect sleep quality',
        suggestedResolution: 'Consider morning workouts or switch to recovery focus',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
        impact: 'effectiveness',
        metadata: {
          focus: extractFocusValue(options.customization_focus),
          timeOfDay: context.environmentalFactors?.timeOfDay,
          fitnessLevel: context.userProfile.fitnessLevel
        }
      }),
    
    // Training Load vs Focus conflicts
    {
      condition: (options, _context) => {
        const trainingLoad = options.customization_trainingLoad;
        const focus = extractFocusValue(options.customization_focus);
        return !!(trainingLoad && focus && 
               trainingLoad.averageIntensity === 'intense' && 
               ['strength', 'power'].includes(focus) &&
               trainingLoad.weeklyVolume > 300); // High volume + intense focus
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('training_load_focus'),
        components: ['customization_trainingLoad', 'customization_focus'],
        type: 'safety',
        severity: 'high',
        description: 'High training load with intense focus may lead to overtraining',
        suggestedResolution: 'Consider recovery focus or reduce training intensity',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        impact: 'safety',
        metadata: {
          trainingLoad: options.customization_trainingLoad?.averageIntensity,
          weeklyVolume: options.customization_trainingLoad?.weeklyVolume,
          focus: extractFocusValue(options.customization_focus)
        }
      })
    },
    
    // Training Load vs Duration conflicts
    {
      condition: (options, _context) => {
        const trainingLoad = options.customization_trainingLoad;
        const duration = extractDurationValue(options.customization_duration);
        return !!(trainingLoad && duration && 
               trainingLoad.averageIntensity === 'intense' && 
               duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('training_load_duration'),
        components: ['customization_trainingLoad', 'customization_duration'],
        type: 'efficiency',
        severity: 'medium',
        description: 'High training load with long duration may be unsustainable',
        suggestedResolution: 'Reduce duration or consider recovery-focused session',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
        impact: 'performance',
        metadata: {
          trainingLoad: options.customization_trainingLoad?.averageIntensity,
          duration: extractDurationValue(options.customization_duration)
        }
      })
    },
    
    // Training Load vs Energy conflicts
    {
      condition: (options, _context) => {
        const trainingLoad = options.customization_trainingLoad;
        const energy = options.customization_energy;
        return !!(trainingLoad && typeof energy === 'number' && 
               trainingLoad.averageIntensity === 'intense' && 
               energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD);
      },
      generateConflict: (options, _context) => ({
        id: this.generateConflictId('training_load_energy'),
        components: ['customization_trainingLoad', 'customization_energy'],
        type: 'safety',
        severity: 'high',
        description: 'Low energy with high training load may lead to poor performance',
        suggestedResolution: 'Consider recovery session or reduce workout intensity',
        confidence: CROSS_COMPONENT_CONSTANTS.HIGH_CONFIDENCE,
        impact: 'performance',
        metadata: {
          trainingLoad: options.customization_trainingLoad?.averageIntensity,
          energyLevel: options.customization_energy
        }
      })
    }
  ];
  
  private readonly SYNERGY_DETECTION_RULES: SynergyDetectionRule[] = [
    // Energy + Focus synergies
    {
      condition: (options, _context) => {
        const energy = options.customization_energy;
        const focus = extractFocusValue(options.customization_focus);
        return !!(typeof energy === 'number' && focus && energy >= CROSS_COMPONENT_CONSTANTS.HIGH_ENERGY_THRESHOLD && ['strength', 'power'].includes(focus));
      },
      generateSynergy: (options, _context) => ({
        id: this.generateSynergyId('energy_focus_synergy'),
        components: ['customization_energy', 'customization_focus'],
        type: 'performance_boost',
        description: 'High energy perfectly matches strength/power focus',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
        metadata: {
          energyLevel: options.customization_energy,
          focus: extractFocusValue(options.customization_focus)
        }
      })
    },
    
    // Equipment + Focus synergies
    {
      condition: (options, _context) => {
        const equipment = extractEquipmentList(options.customization_equipment);
        const focus = extractFocusValue(options.customization_focus);
        return !!(equipment.length >= CROSS_COMPONENT_CONSTANTS.MIN_EQUIPMENT_FOR_STRENGTH && focus && focus === 'strength');
      },
      generateSynergy: (options, _context) => ({
        id: this.generateSynergyId('equipment_focus_synergy'),
        components: ['customization_equipment', 'customization_focus'],
        type: 'efficiency_boost',
        description: 'Good equipment selection supports strength training',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
        metadata: {
          equipmentCount: extractEquipmentList(options.customization_equipment).length,
          focus: extractFocusValue(options.customization_focus)
        }
      })
    }
  ];
  
  /**
   * Detect conflicts between different workout parameters
   */
  async detectConflicts(options: PerWorkoutOptions, context: GlobalAIContext): Promise<CrossComponentConflict[]> {
    const conflicts: CrossComponentConflict[] = [];
    
    for (const rule of this.CONFLICT_DETECTION_RULES) {
      if (rule.condition(options, context)) {
        conflicts.push(rule.generateConflict(options, context));
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
   * Find synergies between different workout parameters
   */
  async findSynergies(options: PerWorkoutOptions, context: GlobalAIContext): Promise<Synergy[]> {
    const synergies: Synergy[] = [];
    
    for (const rule of this.SYNERGY_DETECTION_RULES) {
      if (rule.condition(options, context)) {
        synergies.push(rule.generateSynergy(options, context));
      }
    }
    
    return synergies.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Analyze all interactions between components
   */
  async analyzeInteractions(options: PerWorkoutOptions, context: GlobalAIContext): Promise<{
    conflicts: CrossComponentConflict[];
    synergies: Synergy[];
    recommendations: AIInsight[];
  }> {
    const [conflicts, synergies] = await Promise.all([
      this.detectConflicts(options, context),
      this.findSynergies(options, context)
    ]);
    
    const recommendations = this.generateRecommendations(conflicts, synergies, options, context);
    
    return {
      conflicts,
      synergies,
      recommendations
    };
  }
  
  /**
   * Generate AI insights from conflicts and synergies
   */
  private generateRecommendations(
    conflicts: CrossComponentConflict[],
    synergies: Synergy[],
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Convert conflicts to insights
    conflicts.forEach(conflict => {
      insights.push({
        id: this.generateInsightId(`conflict_${conflict.id}`),
        type: conflict.severity === 'critical' ? 'critical_warning' : 'warning',
        message: conflict.description,
        recommendation: conflict.suggestedResolution,
        confidence: conflict.confidence,
        actionable: true,
        relatedFields: conflict.components,
        metadata: {
          conflictType: conflict.type,
          impact: conflict.impact,
          ...conflict.metadata
        }
      });
    });
    
    // Convert synergies to insights
    synergies.forEach(synergy => {
      insights.push({
        id: this.generateInsightId(`synergy_${synergy.id}`),
        type: 'optimization',
        message: synergy.description,
        recommendation: 'Continue with this combination for optimal results',
        confidence: synergy.confidence,
        actionable: false,
        relatedFields: synergy.components,
        metadata: {
          synergyType: synergy.type,
          ...synergy.metadata
        }
      });
    });
    
    // Add optimization insights
    const optimizationInsights = this.generateOptimizationInsights(options, context);
    insights.push(...optimizationInsights);
    
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
  
  /**
   * Generate optimization insights based on current selections
   */
  private generateOptimizationInsights(options: PerWorkoutOptions, _context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check for missing components that could enhance the workout
    const duration = extractDurationValue(options.customization_duration);
    const focus = extractFocusValue(options.customization_focus);
    const equipment = extractEquipmentList(options.customization_equipment);
    const areas = extractAreasList(options.customization_areas);
    
    // Suggest warm-up if duration is long but no warm-up specified
    if (duration && duration > CROSS_COMPONENT_CONSTANTS.VERY_LONG_DURATION_THRESHOLD && typeof options.customization_duration === 'object' && !options.customization_duration?.warmUp?.included) {
        insights.push({
        id: this.generateInsightId('warmup_suggestion'),
          type: 'optimization',
        message: 'Long workout duration detected - consider adding warm-up',
        recommendation: `Include ${CROSS_COMPONENT_CONSTANTS.WARMUP_DURATION_MINUTES}-${CROSS_COMPONENT_CONSTANTS.WARMUP_DURATION_MAX_MINUTES} minutes of dynamic warm-up to prevent injury`,
          confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_LOW_CONFIDENCE,
          actionable: true,
        relatedFields: ['customization_duration'],
          metadata: {
          duration,
          suggestion: 'add_warmup'
          }
        });
    }
    
    // Suggest equipment if strength focus but minimal equipment
    if (focus === 'strength' && equipment.length < CROSS_COMPONENT_CONSTANTS.MIN_EQUIPMENT_FOR_STRENGTH) {
        insights.push({
        id: this.generateInsightId('equipment_suggestion'),
          type: 'optimization',
        message: 'Strength focus with minimal equipment may limit progression',
        recommendation: 'Consider adding resistance bands or dumbbells for variety',
        confidence: CROSS_COMPONENT_CONSTANTS.LOW_CONFIDENCE,
        actionable: true,
          relatedFields: ['customization_equipment', 'customization_focus'],
          metadata: {
          focus,
          equipmentCount: equipment.length,
          suggestion: 'add_equipment'
          }
        });
      }
    
    // Suggest area selection if focus is specified but no areas selected
    if (focus && areas.length === 0) {
      insights.push({
        id: this.generateInsightId('areas_suggestion'),
        type: 'optimization',
        message: 'Focus specified but no target areas selected',
        recommendation: 'Select specific muscle groups to target for better results',
        confidence: CROSS_COMPONENT_CONSTANTS.VERY_LOW_CONFIDENCE,
        actionable: true,
        relatedFields: ['customization_areas', 'customization_focus'],
        metadata: {
          focus,
          suggestion: 'select_areas'
        }
      });
    }
    
    return insights;
  }
  
  /**
   * Generate unique conflict ID
   */
  private generateConflictId(type: string): string {
    return `conflict_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  /**
   * Generate unique synergy ID
   */
  private generateSynergyId(type: string): string {
    return `synergy_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `cross_component_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  /**
   * Validate configuration for conflicts and issues
   */
  async validateConfiguration(options: PerWorkoutOptions, context: GlobalAIContext): Promise<{
    isValid: boolean;
    criticalIssues: CrossComponentConflict[];
    warnings: CrossComponentConflict[];
    suggestions: AIInsight[];
  }> {
    const conflicts = await this.detectConflicts(options, context);
    const optimizationInsights = this.generateOptimizationInsights(options, context);
    
    const criticalIssues = conflicts.filter(c => c.severity === 'critical');
    const warnings = conflicts.filter(c => c.severity === 'high' || c.severity === 'medium');
    
    return {
      isValid: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      suggestions: optimizationInsights
    };
  }
  
  /**
   * Get component dependencies for analysis
   */
  getComponentDependencies(): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    dependencies.set('customization_energy', ['customization_focus', 'customization_duration']);
    dependencies.set('customization_focus', ['customization_equipment', 'customization_areas']);
    dependencies.set('customization_duration', ['customization_energy', 'customization_focus']);
    dependencies.set('customization_equipment', ['customization_focus', 'customization_duration']);
    dependencies.set('customization_areas', ['customization_soreness', 'customization_focus']);
    dependencies.set('customization_soreness', ['customization_areas', 'customization_focus']);
    dependencies.set('customization_injury', ['customization_focus', 'customization_duration', 'customization_areas']);
    dependencies.set('customization_trainingLoad', ['customization_focus', 'customization_duration', 'customization_energy']);
    
    return dependencies;
  }
  
  /**
   * Analyze the impact of changing a specific component
   */
  async analyzeComponentChange(
    component: keyof PerWorkoutOptions,
    newValue: unknown,
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
    // Create new options with the changed value
    const newOptions = { ...currentOptions, [component]: newValue };
    
    // Get conflicts before and after the change
    const [oldConflicts, newConflicts] = await Promise.all([
      this.detectConflicts(currentOptions, context),
      this.detectConflicts(newOptions, context)
    ]);
    
    // Compare conflict states
    const impacts = this.compareConflictStates(oldConflicts, newConflicts);
    
    // Generate recommendations based on the change
    const recommendations = this.generateRecommendations(newConflicts, [], newOptions, context);
    
    return {
      impacts,
      recommendations
    };
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
    
    // Find resolved conflicts (positive impact)
    const resolvedConflicts = currentConflicts.filter(oldConflict => 
      !newConflicts.some(newConflict => newConflict.id === oldConflict.id)
    );
    
    resolvedConflicts.forEach(conflict => {
      impacts.push({
        affectedComponent: conflict.components[0],
        impactType: 'positive',
        description: `Resolved: ${conflict.description}`,
        confidence: conflict.confidence
      });
    });
    
    // Find new conflicts (negative impact)
    const newConflictsOnly = newConflicts.filter(conflict => 
      !currentConflicts.some(oldConflict => oldConflict.id === conflict.id)
    );
    
    newConflictsOnly.forEach(conflict => {
      impacts.push({
        affectedComponent: conflict.components[0],
        impactType: 'negative',
        description: `New issue: ${conflict.description}`,
        confidence: conflict.confidence
      });
    });
    
    // If no changes, mark as neutral
    if (impacts.length === 0) {
      impacts.push({
        affectedComponent: 'general',
        impactType: 'neutral',
        description: 'No significant changes to conflict status',
        confidence: 0.5
      });
    }
    
    return impacts;
  }
} 