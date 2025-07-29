/**
 * BusinessLogicRule - Validates business logic constraints
 * Ensures workout parameters make sense together
 */

import { ValidationContext } from '../core/ValidationContext';
import { ValidationRule } from '../core/ValidationRule';
import { isValidFitnessLevel } from '../../../../types/guards';

export class BusinessLogicRule extends ValidationRule {
  constructor() {
    super('BusinessLogicRule', 30); // Priority 30 - runs after data validation
  }

  validate(context: ValidationContext): void {
    const { request } = context;
    const { workoutFocusData } = request;

    if (!workoutFocusData) {
      return; // Earlier rules will handle this
    }

    // Cross-field validation placeholders
    this.validateEnergyDurationRelation(context);
    this.validateEquipmentFocusRelation(context);
  }

  private validateEnergyDurationRelation(context: ValidationContext): void {
    // Placeholder for energy/duration business logic
  }

  private validateEquipmentFocusRelation(context: ValidationContext): void {
    const { workoutFocusData } = context.request;
    if (!workoutFocusData) return;
    const focus = workoutFocusData.customization_focus;
    const equipment = workoutFocusData.customization_equipment;
    // Only check length if equipment is an array
    if (focus === 'strength' && Array.isArray(equipment) && equipment.length === 0) {
      context.addWarning(
        'Strength workouts usually require some equipment. Recommend adding at least one equipment item'
      );
    }
  }
} 