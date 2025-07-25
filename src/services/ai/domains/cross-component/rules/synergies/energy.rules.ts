import { SynergyDetectionRule } from '../../types/synergies.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const energySynergyRules: SynergyDetectionRule[] = [
  // Energy + Focus synergies
  {
    condition: (options, _context) => {
      const energy = options.customization_energy;
      const focus = extractFocusValue(options.customization_focus);
      return !!(typeof energy === 'number' && 
             focus && 
             energy >= CROSS_COMPONENT_CONSTANTS.HIGH_ENERGY_THRESHOLD && 
             ['strength', 'power'].includes(focus));
    },
    generateSynergy: (options, _context) => ({
      id: IdGenerator.generateSynergyId('energy_focus_synergy'),
      components: ['customization_energy', 'customization_focus'],
      type: 'performance_boost',
      description: 'High energy perfectly matches strength/power focus',
      confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
      metadata: {
        energyLevel: options.customization_energy,
        focus: extractFocusValue(options.customization_focus)
      }
    })
  }
]; 