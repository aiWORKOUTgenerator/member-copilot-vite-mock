import { PerWorkoutOptions } from '../../../../../types';
import { GlobalAIContext } from '../../../core/types/AIServiceTypes';
import { AIInsight } from '../../../../../types/insights';
import { CROSS_COMPONENT_CONSTANTS } from '../constants/thresholds.constants';
import { extractDurationValue, extractFocusValue, extractEquipmentList, extractAreasList } from '../../../../../types/guards';
import { IdGenerator } from '../utils/id-generator';
import { CrossComponentConflict } from '../types/conflicts.types';
import { Synergy } from '../types/synergies.types';

export class OptimizationAnalyzer {
  /**
   * Generate optimization insights based on current workout configuration
   */
  generateOptimizationInsights(
    options: PerWorkoutOptions,
    _context: GlobalAIContext
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Extract common values used in multiple checks
    const duration = extractDurationValue(options.customization_duration);
    const focus = extractFocusValue(options.customization_focus);
    const equipment = extractEquipmentList(options.customization_equipment);
    const areas = extractAreasList(options.customization_areas);
    
    // Check warm-up for long workouts
    if (this.shouldSuggestWarmup(duration)) {
      insights.push(this.createWarmupInsight(duration!));
    }
    
    // Check equipment for strength training
    if (this.shouldSuggestEquipment(focus, equipment)) {
      insights.push(this.createEquipmentInsight(focus, equipment));
    }
    
    // Check area selection with focus
    if (this.shouldSuggestAreas(focus, areas)) {
      insights.push(this.createAreasInsight(focus));
    }
    
    return insights;
  }

  /**
   * Generate recommendations based on conflicts and synergies
   */
  generateRecommendations(
    conflicts: CrossComponentConflict[],
    synergies: Synergy[],
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Convert conflicts to insights
    conflicts.forEach(conflict => {
      insights.push({
        id: IdGenerator.generateInsightId(`conflict_${conflict.id}`),
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
        id: IdGenerator.generateInsightId(`synergy_${synergy.id}`),
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
    
    return this.sortInsights(insights);
  }

  private shouldSuggestWarmup(
    duration: number | undefined
  ): boolean {
    return !!(
      duration &&
      duration > CROSS_COMPONENT_CONSTANTS.VERY_LONG_DURATION_THRESHOLD
    );
  }

  private createWarmupInsight(duration: number): AIInsight {
    return {
      id: IdGenerator.generateInsightId('warmup_suggestion'),
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
    };
  }

  private shouldSuggestEquipment(
    focus: string | undefined,
    equipment: string[]
  ): boolean {
    return !!(
      focus === 'strength' &&
      equipment.length < CROSS_COMPONENT_CONSTANTS.MIN_EQUIPMENT_FOR_STRENGTH
    );
  }

  private createEquipmentInsight(focus: string | undefined, equipment: string[]): AIInsight {
    return {
      id: IdGenerator.generateInsightId('equipment_suggestion'),
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
    };
  }

  private shouldSuggestAreas(
    focus: string | undefined,
    areas: string[]
  ): boolean {
    return !!(focus && areas.length === 0);
  }

  private createAreasInsight(focus: string | undefined): AIInsight {
    return {
      id: IdGenerator.generateInsightId('areas_suggestion'),
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
    };
  }

  /**
   * Sort insights by actionability and confidence
   */
  private sortInsights(insights: AIInsight[]): AIInsight[] {
    return insights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }
} 