/**
 * WorkoutDataRule - Validates workout focus data
 * Ensures workout-specific data is valid and consistent
 */

import { BaseValidationRule } from '../core/ValidationRule';
import { ValidationContext } from '../core/ValidationContext';
import { ValidationError } from '../core/ValidationError';
import { ValidationWarning } from '../core/ValidationError';

// Constants for validation
const WORKOUT_GENERATION_CONSTANTS = {
  MIN_WORKOUT_DURATION: 5,
  MAX_WORKOUT_DURATION: 180,
  MIN_ENERGY_LEVEL: 1,
  MAX_ENERGY_LEVEL: 10,
  WARNING_MESSAGES: {
    LONG_DURATION: 'Workout duration is quite long. Consider breaking it into smaller sessions.',
    HIGH_ENERGY: 'High energy workouts over 60 minutes may be too intense.',
    LOW_ENERGY: 'Low energy workouts over 30 minutes may be too long.',
    NO_EQUIPMENT: 'No equipment selected. Workout will be limited to bodyweight exercises.'
  }
};

export class WorkoutDataRule extends BaseValidationRule {
  constructor() {
    super('WorkoutDataRule', 20); // Priority 20 - runs after core fields
  }

  validate(context: ValidationContext): void {
    const { request } = context;
    const { workoutFocusData } = request;

    if (!workoutFocusData) {
      return; // Already validated by CoreFieldsRule
    }

    // Validate duration
    this.validateDuration(workoutFocusData.customization_duration, context);

    // Validate energy level
    this.validateEnergyLevel(workoutFocusData.customization_energy, context);

    // Validate equipment
    this.validateEquipment(workoutFocusData.customization_equipment, context);

    // Cross-field validation
    this.validateCrossFieldConstraints(workoutFocusData, context);

    // Validate detailed workout requirements
    if (request.workoutType === 'detailed') {
      this.validateDetailedWorkoutRequirements(request.profileData, context);
    }
  }

  private validateDuration(duration: unknown, context: ValidationContext): void {
    if (duration === undefined) {
      return;
    }

    const durationValue = Number(duration);
    if (isNaN(durationValue)) {
      context.addError(ValidationError.createFieldError(
        'customization_duration',
        'Duration must be a number'
      ));
      return;
    }

    if (durationValue < WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION) {
      context.addError(ValidationError.createFieldError(
        'customization_duration',
        `Duration must be at least ${WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION} minutes`
      ));
    } else if (durationValue > 60) { // Changed from MAX_WORKOUT_DURATION to 60 for warning
      context.addWarning(new ValidationWarning(
        WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LONG_DURATION,
        'LONG_DURATION',
        'customization_duration'
      ));
    }
  }

  private validateEnergyLevel(energy: unknown, context: ValidationContext): void {
    if (energy === undefined) {
      return;
    }

    const energyValue = Number(energy);
    if (isNaN(energyValue)) {
      context.addError(ValidationError.createFieldError(
        'customization_energy',
        'Energy level must be a number'
      ));
      return;
    }

    if (energyValue < WORKOUT_GENERATION_CONSTANTS.MIN_ENERGY_LEVEL || 
        energyValue > WORKOUT_GENERATION_CONSTANTS.MAX_ENERGY_LEVEL) {
      context.addError(ValidationError.createFieldError(
        'customization_energy',
        `Energy level must be between ${WORKOUT_GENERATION_CONSTANTS.MIN_ENERGY_LEVEL} and ${WORKOUT_GENERATION_CONSTANTS.MAX_ENERGY_LEVEL}`
      ));
    }
  }

  private validateEquipment(equipment: unknown, context: ValidationContext): void {
    if (!equipment) {
      return;
    }

    const equipmentList = Array.isArray(equipment) ? equipment : Object.keys(equipment);
    if (equipmentList.length === 0) {
      context.addWarning(new ValidationWarning(
        WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.NO_EQUIPMENT,
        'NO_EQUIPMENT',
        'customization_equipment'
      ));
    }
  }

  private validateCrossFieldConstraints(workoutFocusData: any, context: ValidationContext): void {
    const duration = Number(workoutFocusData.customization_duration);
    const energy = Number(workoutFocusData.customization_energy);

    if (!isNaN(duration) && !isNaN(energy)) {
      if (energy >= 8 && duration > 60) {
        context.addWarning(new ValidationWarning(
          WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.HIGH_ENERGY,
          'HIGH_ENERGY_LONG_DURATION',
          'customization_energy'
        ));
      }

      if (energy <= 3 && duration > 30) {
        context.addWarning(new ValidationWarning(
          WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LOW_ENERGY,
          'LOW_ENERGY_LONG_DURATION',
          'customization_energy'
        ));
      }
    }
  }

  private validateDetailedWorkoutRequirements(profileData: any, context: ValidationContext): void {
    if (!profileData) {
      return;
    }

    if (!profileData.experienceLevel) {
      context.addError(ValidationError.createFieldError(
        'experienceLevel',
        'Experience level is required for detailed workouts'
      ));
    }

    if (!profileData.physicalActivity) {
      context.addError(ValidationError.createFieldError(
        'physicalActivity',
        'Physical activity level is required for detailed workouts'
      ));
    }
  }
} 