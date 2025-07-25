import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractDurationValue, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const energyConflictRules: ConflictDetectionRule[] = [
  // Energy vs Duration conflicts
  {
    condition: (options, _context) => {
      const energy = options.customization_energy;
      const duration = extractDurationValue(options.customization_duration);
      return !!(typeof energy === 'number' && duration && 
             energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD && 
             duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('energy_duration'),
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
      return !!(typeof energy === 'number' && focus && 
             energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD && 
             ['strength', 'power'].includes(focus));
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('energy_focus'),
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
  }
]; 