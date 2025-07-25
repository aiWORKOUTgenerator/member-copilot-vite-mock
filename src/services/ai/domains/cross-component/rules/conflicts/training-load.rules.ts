import { ConflictDetectionRule } from '../../types/conflicts.types';
import { CROSS_COMPONENT_CONSTANTS } from '../../constants/thresholds.constants';
import { extractDurationValue, extractFocusValue } from '../../../../../../types/guards';
import { IdGenerator } from '../../utils/id-generator';

export const trainingLoadConflictRules: ConflictDetectionRule[] = [
  // Training Load vs Focus conflicts
  {
    condition: (options, _context) => {
      const trainingLoad = options.customization_trainingLoad;
      const focus = extractFocusValue(options.customization_focus);
      return !!(trainingLoad && focus && 
             trainingLoad.averageIntensity === 'intense' && 
             ['strength', 'power'].includes(focus) &&
             trainingLoad.weeklyVolume > 300); // High volume + intense focus
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('training_load_focus'),
      components: ['customization_trainingLoad', 'customization_focus'],
      type: 'safety',
      severity: 'high',
      description: 'High training load with intense focus may lead to overtraining',
      suggestedResolution: 'Consider recovery focus or reduce training intensity',
      confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_HIGH_CONFIDENCE,
      impact: 'safety',
      metadata: {
        trainingLoad: options.customization_trainingLoad?.averageIntensity,
        weeklyVolume: options.customization_trainingLoad?.weeklyVolume,
        focus: extractFocusValue(options.customization_focus)
      }
    })
  },

  // Training Load vs Duration conflicts
  {
    condition: (options, _context) => {
      const trainingLoad = options.customization_trainingLoad;
      const duration = extractDurationValue(options.customization_duration);
      return !!(trainingLoad && duration && 
             trainingLoad.averageIntensity === 'intense' && 
             duration > CROSS_COMPONENT_CONSTANTS.LONG_DURATION_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('training_load_duration'),
      components: ['customization_trainingLoad', 'customization_duration'],
      type: 'efficiency',
      severity: 'medium',
      description: 'High training load with long duration may be unsustainable',
      suggestedResolution: 'Reduce duration or consider recovery-focused session',
      confidence: CROSS_COMPONENT_CONSTANTS.MEDIUM_CONFIDENCE,
      impact: 'performance',
      metadata: {
        trainingLoad: options.customization_trainingLoad?.averageIntensity,
        duration: extractDurationValue(options.customization_duration)
      }
    })
  },

  // Training Load vs Energy conflicts
  {
    condition: (options, _context) => {
      const trainingLoad = options.customization_trainingLoad;
      const energy = options.customization_energy;
      return !!(trainingLoad && typeof energy === 'number' && 
             trainingLoad.averageIntensity === 'intense' && 
             energy <= CROSS_COMPONENT_CONSTANTS.LOW_ENERGY_THRESHOLD);
    },
    generateConflict: (options, _context) => ({
      id: IdGenerator.generateConflictId('training_load_energy'),
      components: ['customization_trainingLoad', 'customization_energy'],
      type: 'safety',
      severity: 'high',
      description: 'Low energy with high training load may lead to poor performance',
      suggestedResolution: 'Consider recovery session or reduce workout intensity',
      confidence: CROSS_COMPONENT_CONSTANTS.HIGH_CONFIDENCE,
      impact: 'performance',
      metadata: {
        trainingLoad: options.customization_trainingLoad?.averageIntensity,
        energyLevel: options.customization_energy
      }
    })
  }
]; 