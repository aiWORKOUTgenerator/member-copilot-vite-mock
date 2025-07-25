import { energyConflictRules } from './energy.rules';
import { focusConflictRules } from './focus.rules';
import { equipmentConflictRules } from './equipment.rules';
import { injuryConflictRules } from './injury.rules';
import { sorenessConflictRules } from './soreness.rules';
import { trainingLoadConflictRules } from './training-load.rules';
import { ConflictDetectionRule } from '../../types/conflicts.types';

export const allConflictRules: ConflictDetectionRule[] = [
  ...energyConflictRules,
  ...focusConflictRules,
  ...equipmentConflictRules,
  ...injuryConflictRules,
  ...sorenessConflictRules,
  ...trainingLoadConflictRules
];

export {
  energyConflictRules,
  focusConflictRules,
  equipmentConflictRules,
  injuryConflictRules,
  sorenessConflictRules,
  trainingLoadConflictRules
}; 