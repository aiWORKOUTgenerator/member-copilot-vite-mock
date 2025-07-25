import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractDurationValue, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';
import { dataTransformers } from '../../../../../../utils/dataTransformers';

export const injuryConflictRules: ConflictDetectionRule[] = [
  // Injury vs Focus conflicts
  {
    condition: (options, _context) => {
      const injuryRegions = dataTransformers.extractInjuryRegions(options.customization_injury);
      const focus = extractFocusValue(options.customization_focus);
      return !!(injuryRegions.length > 0 && focus && ['strength', 'power'].includes(focus));
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('injury_focus'),
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
      return !!(injuryRegions.length > 0 && duration && 
             duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('injury_duration'),
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
  }
]; 