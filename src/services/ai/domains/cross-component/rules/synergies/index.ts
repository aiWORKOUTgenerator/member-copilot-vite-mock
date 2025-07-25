import { energySynergyRules } from './energy.rules';
import { equipmentSynergyRules } from './equipment.rules';
import { SynergyDetectionRule } from '../../types/synergies.types';

export const allSynergyRules: SynergyDetectionRule[] = [
  ...energySynergyRules,
  ...equipmentSynergyRules
];

export {
  energySynergyRules,
  equipmentSynergyRules
}; 