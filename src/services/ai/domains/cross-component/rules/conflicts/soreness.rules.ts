import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractAreasList, extractFocusValue, extractSorenessAreas } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const sorenessConflictRules: ConflictDetectionRule[] = [
  // Soreness vs Areas conflicts
  {
    condition: (options, _context) => {
      const sorenessAreas = extractSorenessAreas(options.customization_soreness);
      const areas = extractAreasList(options.customization_areas);
      return !!(sorenessAreas.length > 0 && areas.length > 0 && 
             areas.some(area => sorenessAreas.includes(area)));
    },
    generateConflict: (options, _context) => {
      const sorenessAreas = extractSorenessAreas(options.customization_soreness);
      const areas = extractAreasList(options.customization_areas);
      const overlappingAreas = areas.filter(area => sorenessAreas.includes(area));
      
      return {
        id: IdGenerator.generateConflictId('soreness_areas'),
        components: ['customization_soreness', 'customization_areas'],
        type: 'safety',
        severity: 'medium',
        description: 'Selected workout areas overlap with sore muscle groups',
        suggestedResolution: 'Choose different areas or reduce intensity for sore regions',
        confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
        impact: 'safety',
        metadata: {
          overlappingAreas,
          sorenessLevel: sorenessAreas.length
        }
      };
    }
  },

  // Soreness vs Focus conflicts
  {
    condition: (options, _context) => {
      const sorenessAreas = extractSorenessAreas(options.customization_soreness);
      const focus = extractFocusValue(options.customization_focus);
      return !!(sorenessAreas.length >= CROSS_COMPONENT_CONSTANTS.HIGH_SORENESS_THRESHOLD && 
             focus && 
             ['strength', 'power', 'endurance'].includes(focus));
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('soreness_focus'),
      components: ['customization_soreness', 'customization_focus'],
      type: 'safety',
      severity: 'high',
      description: 'High soreness with intense focus may worsen muscle recovery',
      suggestedResolution: 'Switch to recovery or flexibility focus',
      confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
      impact: 'safety',
      metadata: {
        sorenessLevel: extractSorenessAreas(options.customization_soreness).length,
        focus: extractFocusValue(options.customization_focus)
      }
    })
  }
]; 