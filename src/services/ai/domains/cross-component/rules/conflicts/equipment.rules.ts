import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractDurationValue, extractEquipmentList, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const equipmentConflictRules: ConflictDetectionRule[] = [
  // Equipment vs Focus conflicts
  {
    condition: (options, _context) => {
      const equipment = extractEquipmentList(options.customization_equipment);
      const focus = extractFocusValue(options.customization_focus);
      return !!(equipment.length === 0 && focus && focus === 'strength');
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('equipment_focus'),
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
      return !!(equipment.length > CROSS_COMPONENT_CONSTANTS.MAX_EQUIPMENT_FOR_SHORT_DURATION && 
             duration && 
             duration < CROSS_COMPONENT_CONSTANTS.VERY_LONG_DURATION_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('equipment_duration'),
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
  }
]; 