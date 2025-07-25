import { SynergyDetectionRule } from '../../types/synergies.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractEquipmentList, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const equipmentSynergyRules: SynergyDetectionRule[] = [
  // Equipment + Focus synergies
  {
    condition: (options, _context) => {
      const equipment = extractEquipmentList(options.customization_equipment);
      const focus = extractFocusValue(options.customization_focus);
      return !!(equipment.length >= CROSS_COMPONENT_CONSTANTS.MIN_EQUIPMENT_FOR_STRENGTH && 
             focus && 
             focus === 'strength');
    },
    generateSynergy: (options, _context) => ({
      id: IdGenerator.generateSynergyId('equipment_focus_synergy'),
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