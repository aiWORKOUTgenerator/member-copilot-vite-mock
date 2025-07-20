// Focus Contextual Rules - Context-aware focus insights
import { FocusInsightRule, FOCUS_INSIGHT_CONSTANTS } from '../types/focus.types';
import { dataTransformers } from '../../../../../utils/dataTransformers';

/**
 * Generate unique insight ID for contextual rules
 */
const generateInsightId = (type: string): string => {
  return `focus_${type}_${Date.now()}_${Math.random().toString(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_BASE_RADIX).substr(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_START_INDEX, FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_LENGTH)}`;
};

export const CONTEXTUAL_RULES: FocusInsightRule[] = [
  {
    condition: (value, context) => {
      const energyLevel = context.currentSelections.customization_energy;
      return !!value && value === 'strength' && typeof energyLevel === 'number' && energyLevel <= 2;
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('strength_low_energy'),
      type: 'warning',
      message: 'Strength focus with low energy - consider lighter loads or mobility',
      confidence: 0.9,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_energy'],
      recommendation: 'Switch to mobility or reduce intensity significantly',
      metadata: {
        context: 'energy_focus_mismatch'
      }
    })
  },
  {
    condition: (value, context) => {
      const soreness = context.currentSelections.customization_soreness;
      const sorenessAreas = dataTransformers.extractSorenessAreas(soreness);
      return !!value && value === 'cardio' && sorenessAreas.length >= 3;
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('cardio_high_soreness'),
      type: 'warning',
      message: 'Cardio focus with multiple sore areas - consider recovery focus',
      confidence: 0.85,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_soreness'],
      recommendation: 'Switch to recovery or light mobility work',
      metadata: {
        context: 'soreness_focus_conflict'
      }
    })
  },
  {
    condition: (value, context) => {
      const timeOfDay = context.environmentalFactors?.timeOfDay;
      return !!value && value === 'power' && timeOfDay === 'evening';
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('power_evening'),
      type: 'optimization',
      message: 'Power focus in evening - may affect sleep quality',
      confidence: 0.75,
      actionable: true,
      relatedFields: ['customization_focus'],
      recommendation: 'Consider earlier timing or switch to strength/flexibility',
      metadata: {
        context: 'timing_consideration'
      }
    })
  },
  {
    condition: (value, context) => {
      const fitnessLevel = context.userProfile.fitnessLevel;
      return !!value && value === 'power' && fitnessLevel === 'new to exercise';
    },
    generateInsight: (_value, _context) => ({
      id: generateInsightId('power_new_to_exercise'),
      type: 'warning',
      message: 'Power focus as someone new to exercise - ensure proper form foundation first',
      confidence: 0.9,
      actionable: true,
      relatedFields: ['customization_focus'],
      recommendation: 'Start with strength focus to build foundation',
      metadata: {
        context: 'experience_mismatch'
      }
    })
  }
]; 