// Focus Base Rules - Core focus-based insights
import { FocusInsightRule, FOCUS_CATEGORIES, FOCUS_INSIGHT_CONSTANTS } from '../types/focus.types';

/**
 * Generate unique insight ID for base rules
 */
const generateInsightId = (type: string): string => {
  return `focus_${type}_${Date.now()}_${Math.random().toString(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_BASE_RADIX).substr(FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_START_INDEX, FOCUS_INSIGHT_CONSTANTS.RANDOM_STRING_LENGTH)}`;
};

export const BASE_INSIGHTS: FocusInsightRule[] = [
  {
    condition: (value) => value === FOCUS_CATEGORIES.STRENGTH,
    generateInsight: (_value, _context) => ({
      id: generateInsightId('strength_focus'),
      type: 'optimization',
      message: 'Strength focus selected - ensure proper form and adequate rest',
      recommendation: 'Focus on compound movements with proper rest periods',
      confidence: 0.9,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_duration'],
      metadata: {
        focusType: 'strength'
      }
    })
  },
  {
    condition: (value) => value === FOCUS_CATEGORIES.CARDIO,
    generateInsight: (_value, _context) => ({
      id: generateInsightId('cardio_focus'),
      type: 'optimization',
      message: 'Cardio focus selected - monitor heart rate and hydration',
      recommendation: 'Stay hydrated and monitor intensity throughout session',
      confidence: 0.9,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_duration'],
      metadata: {
        focusType: 'cardio'
      }
    })
  },
  {
    condition: (value) => value === FOCUS_CATEGORIES.FLEXIBILITY,
    generateInsight: (_value, _context) => ({
      id: generateInsightId('flexibility_focus'),
      type: 'optimization',
      message: 'Flexibility focus - hold stretches and focus on breathing',
      recommendation: 'Use slow, controlled movements and deep breathing',
      confidence: 0.85,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_duration'],
      metadata: {
        focusType: 'flexibility'
      }
    })
  },
  {
    condition: (value) => value === FOCUS_CATEGORIES.RECOVERY,
    generateInsight: (_value, _context) => ({
      id: generateInsightId('recovery_focus'),
      type: 'encouragement',
      message: 'Recovery focus - prioritize gentle movement and restoration',
      recommendation: 'Keep intensity low and focus on restorative movements',
      confidence: 0.95,
      actionable: true,
      relatedFields: ['customization_focus', 'customization_duration'],
      metadata: {
        focusType: 'recovery'
      }
    })
  },
  {
    condition: (value) => !value || value === '',
    generateInsight: (_value, _context) => ({
      id: generateInsightId('no_focus'),
      type: 'warning',
      message: 'No focus selected - consider your primary goal for today',
      recommendation: 'Select a focus to optimize your workout',
      confidence: 0.8,
      actionable: true,
      relatedFields: ['customization_focus'],
      metadata: {
        focusType: 'none'
      }
    })
  }
]; 