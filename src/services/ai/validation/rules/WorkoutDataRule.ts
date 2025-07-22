/**
 * WorkoutDataRule - Validates workout focus data
 * Ensures workout-specific data is valid and consistent
 */

import { BaseValidationRule } from '../core/ValidationRule';
import { ValidationContext } from '../core/ValidationContext';
import { ValidationError, ValidationWarning } from '../core/ValidationError';

export class WorkoutDataRule extends BaseValidationRule {
  constructor() {
    super('WorkoutDataRule', 20); // Priority 20 - runs after core fields
  }

  validate(context: ValidationContext): void {
    const { request } = context;
    const { workoutFocusData } = request;

    if (!workoutFocusData) {
      return; // CoreFieldsRule will handle this
    }

    // Duration validation placeholder
    if (workoutFocusData.customization_duration) {
      const duration = Number(workoutFocusData.customization_duration);
      if (isNaN(duration) || duration < 5) {
        context.addError(
          ValidationError.createFieldError('duration', 'Duration must be at least 5 minutes')
        );
      }
    }

    // Energy level validation placeholder
    if (workoutFocusData.customization_energy !== undefined) {
      const energy = Number(workoutFocusData.customization_energy);
      if (isNaN(energy) || energy < 1 || energy > 10) {
        context.addError(
          ValidationError.createFieldError('energy', 'Energy level must be between 1 and 10')
        );
      }
    }

    // Focus validation placeholder
    if (!workoutFocusData.customization_focus) {
      context.addWarning(
        ValidationWarning.createFieldWarning('focus', 'No focus specified, will use general workout')
      );
    }
  }
} 