import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractDurationValue, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const focusConflictRules: ConflictDetectionRule[] = [
  // Focus vs Duration conflicts
  {
    condition: (options, _context) => {
      const focus = extractFocusValue(options.customization_focus);
      const duration = extractDurationValue(options.customization_duration);
      return !!(focus && duration && 
             focus === 'strength' && 
             duration < CROSS_COMPONENT_CONSTANTS.SHORT_DURATION_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('focus_duration'),
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

  // Experience level vs Focus conflicts
  {
    condition: (options, context) => {
      const focus = extractFocusValue(options.customization_focus);
      const fitnessLevel = context.userProfile.fitnessLevel;
      return !!(focus && 
             (fitnessLevel === 'beginner' || fitnessLevel === 'novice') && 
             ['power', 'endurance'].includes(focus));
    },
    generateConflict: (options, context) => ({
      id: IdGenerator.generateConflictId('experience_focus'),
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
      return !!(focus && 
             timeOfDay === 'evening' && 
             ['power', 'strength'].includes(focus) && 
             context.userProfile.fitnessLevel !== 'advanced');
    },
    generateConflict: (options, context) => ({
      id: IdGenerator.generateConflictId('time_focus'),
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
    })
  }
]; 