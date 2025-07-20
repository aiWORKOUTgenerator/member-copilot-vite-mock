// Workout Generation Validation Utilities
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { WORKOUT_GENERATION_CONSTANTS } from '../constants/workout-generation-constants';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates workout generation request parameters
 */
export const validateWorkoutRequest = (request: WorkoutGenerationRequest): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!request.userProfile) {
    errors.push(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_USER_PROFILE);
  }

  if (!request.workoutFocusData) {
    errors.push(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_WORKOUT_DATA);
  }

  if (!request.workoutType) {
    errors.push('Workout type is required');
  }

  // Validate workout focus data if present
  if (request.workoutFocusData) {
    const { customization_duration, customization_energy, customization_focus, customization_equipment } = request.workoutFocusData;

    // Validate duration
    if (customization_duration) {
      const duration = Number(customization_duration);
      if (isNaN(duration) || duration < WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION) {
        errors.push(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_DURATION);
      } else if (duration > WORKOUT_GENERATION_CONSTANTS.MAX_WORKOUT_DURATION) {
        warnings.push(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LONG_DURATION);
      }
    }

    // Validate energy level
    if (customization_energy !== undefined) {
      const energyLevel = Number(customization_energy);
      if (isNaN(energyLevel) || 
          energyLevel < WORKOUT_GENERATION_CONSTANTS.MIN_ENERGY_LEVEL || 
          energyLevel > WORKOUT_GENERATION_CONSTANTS.MAX_ENERGY_LEVEL) {
        errors.push(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_ENERGY_LEVEL);
      }
    }

    // Validate focus
    if (customization_focus && typeof customization_focus !== 'string') {
      errors.push(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_FOCUS);
    }

    // Validate equipment
    if (customization_equipment) {
      const equipmentList = Array.isArray(customization_equipment) 
        ? customization_equipment 
        : Object.keys(customization_equipment);
      
      if (equipmentList.length === 0) {
        warnings.push(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.NO_EQUIPMENT);
      }
    }
  }

  // Validate profile data for detailed workouts
  if (request.workoutType === 'detailed' && request.profileData) {
    const { experienceLevel, physicalActivity, preferredDuration, timeCommitment } = request.profileData;

    if (!experienceLevel) {
      errors.push('Experience level is required for detailed workouts');
    }

    if (!physicalActivity) {
      errors.push('Physical activity level is required for detailed workouts');
    }

    if (preferredDuration && (preferredDuration < WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION || 
                             preferredDuration > WORKOUT_GENERATION_CONSTANTS.MAX_WORKOUT_DURATION)) {
      warnings.push(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LONG_DURATION);
    }
  }

  // Cross-field validation
  if (request.workoutFocusData) {
    const duration = Number(request.workoutFocusData.customization_duration);
    const energyLevel = Number(request.workoutFocusData.customization_energy);

    if (!isNaN(duration) && !isNaN(energyLevel)) {
      if (energyLevel >= 8 && duration > 60) {
        warnings.push(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.HIGH_ENERGY);
      }

      if (energyLevel <= 3 && duration > 30) {
        warnings.push(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LOW_ENERGY);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates generated workout structure
 */
export const validateGeneratedWorkout = (workout: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!workout) {
    errors.push('Generated workout is null or undefined');
    return { isValid: false, errors, warnings };
  }

  // Validate required workout properties
  if (!workout.title || typeof workout.title !== 'string') {
    errors.push('Workout must have a valid title');
  }

  if (!workout.description || typeof workout.description !== 'string') {
    errors.push('Workout must have a valid description');
  }

  if (!workout.totalDuration || typeof workout.totalDuration !== 'number') {
    errors.push('Workout must have a valid total duration');
  }

  if (!workout.difficulty || !['new to exercise', 'some experience', 'advanced athlete'].includes(workout.difficulty)) {
    errors.push('Workout must have a valid difficulty level');
  }

  // Validate workout structure
  if (!workout.warmup || !Array.isArray(workout.warmup.exercises)) {
    errors.push('Workout must have a valid warmup section');
  }

  if (!workout.mainWorkout || !Array.isArray(workout.mainWorkout.exercises)) {
    errors.push('Workout must have a valid main workout section');
  }

  if (!workout.cooldown || !Array.isArray(workout.cooldown.exercises)) {
    errors.push('Workout must have a valid cooldown section');
  }

  // Validate exercise count
  const totalExercises = (workout.warmup?.exercises?.length || 0) + 
                        (workout.mainWorkout?.exercises?.length || 0) + 
                        (workout.cooldown?.exercises?.length || 0);

  if (totalExercises < WORKOUT_GENERATION_CONSTANTS.MIN_EXERCISES_PER_WORKOUT) {
    errors.push(`Workout must have at least ${WORKOUT_GENERATION_CONSTANTS.MIN_EXERCISES_PER_WORKOUT} exercises`);
  }

  if (totalExercises > WORKOUT_GENERATION_CONSTANTS.MAX_EXERCISES_PER_WORKOUT) {
    warnings.push(`Workout has many exercises (${totalExercises}), which may be overwhelming`);
  }

  // Validate duration consistency
  if (workout.totalDuration) {
    const calculatedDuration = (workout.warmup?.duration || 0) + 
                              (workout.mainWorkout?.duration || 0) + 
                              (workout.cooldown?.duration || 0);

    if (Math.abs(calculatedDuration - workout.totalDuration) > 5) {
      warnings.push('Workout duration may not match sum of section durations');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates cache key generation parameters
 */
export const validateCacheKey = (request: WorkoutGenerationRequest): boolean => {
  if (!request.userProfile?.fitnessLevel) {
    return false;
  }

  if (!request.workoutFocusData) {
    return false;
  }

  if (!request.workoutType) {
    return false;
  }

  return true;
};

/**
 * Creates a standardized error message for validation failures
 */
export const createValidationErrorMessage = (validation: ValidationResult): string => {
  if (validation.errors.length === 0) {
    return '';
  }

  return `${WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_REQUEST}: ${validation.errors.join(', ')}`;
};

/**
 * Creates a standardized warning message for validation warnings
 */
export const createValidationWarningMessage = (validation: ValidationResult): string => {
  if (validation.warnings.length === 0) {
    return '';
  }

  return `Workout generation warnings: ${validation.warnings.join(', ')}`;
}; 