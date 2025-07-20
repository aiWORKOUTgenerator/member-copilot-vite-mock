// Focus Cross-Component Rules - Multi-component focus insights
import { FocusInsightRule, FOCUS_INSIGHT_CONSTANTS } from '../types/focus.types';
import { dataTransformers } from '../../../../../utils/dataTransformers';

/**
 * Generate unique insight ID for cross-component rules
 */
const generateInsightId = (type: string): string => {
  return `focus_${type}_${Date.now()}_${Math.random().toString(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_BASE_RADIX).substr(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_START_INDEX, FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_LENGTH)}`;
};

export const CROSS_COMPONENT_RULES: FocusInsightRule[] = [
  {
    condition: (value, context) => {
      const duration = context.currentSelections.customization_duration;
      const durationValue = dataTransformers.extractDurationValue(duration);
      return !!value && value === 'strength' && durationValue < 30;
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('strength_short_duration'),
      type: 'warning',
      message: 'Strength focus with short duration - may limit effectiveness',
      confidence: 0.8,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_duration'],
      recommendation: 'Consider 45+ minutes for strength or switch to mobility',
      metadata: {
        context: 'duration_mismatch'
      }
    })
  },
  {
    condition: (value, context) => {
      const equipment = context.currentSelections.customization_equipment;
      const equipmentList = dataTransformers.extractEquipmentList(equipment);
      return !!value && value === 'strength' && equipmentList.length === 0;
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('strength_no_equipment'),
      type: 'optimization',
      message: 'Strength focus without equipment - body weight movements available',
      confidence: 0.85,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_equipment'],
      recommendation: 'Focus on body weight strength exercises or add equipment',
      metadata: {
        context: 'equipment_limitation'
      }
    })
  },
  {
    condition: (value, context) => {
      const areas = context.currentSelections.customization_areas;
      const areasList = dataTransformers.extractAreasList(areas);
      return !!value && value === 'cardio' && areasList.length > 3;
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('cardio_many_areas'),
      type: 'optimization',
      message: 'Cardio focus with many areas - consider full-body movements',
      confidence: 0.8,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_areas'],
      recommendation: 'Use compound movements for efficient cardio',
      metadata: {
        context: 'area_optimization'
      }
    })
  }
]; 