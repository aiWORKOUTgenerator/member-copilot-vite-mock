/**
 * CoreFieldsRule - Validates core fields of a WorkoutGenerationRequest
 * Keeps implementation focused and under 100 lines per clean code guidelines
 */

import { ValidationContext } from '../core/ValidationContext';
import { ValidationError } from '../core/ValidationError';
import { isValidFitnessLevel, isValidProfileData } from '../../../../types/guards';
// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';
import { BaseValidationRule } from '../core/ValidationRule';

/**
 * CoreFieldsRule - Validates core fields of a WorkoutGenerationRequest
 * Keeps implementation focused and under 100 lines per clean code guidelines
 */
export class CoreFieldsRule extends BaseValidationRule {
  constructor() {
    super('CoreFieldsRule', 10); // Priority 10 - runs first
  }

  /**
   * Validates core fields of the request:
   * 1. workoutType (required, must be 'quick' or 'detailed')
   * 2. userProfile.fitnessLevel (required, must be valid)
   * 3. profileData (required, must be valid)
   * 4. workoutFocusData (required, must be present)
   */
  validate(context: ValidationContext): void {
    const { request } = context;

    // 1. Validate workoutType
    this.validateWorkoutType(request.workoutType, context);

    // 2. Validate userProfile and fitnessLevel
    this.validateUserProfile(request.userProfile, context);

    // 3. Validate profileData
    this.validateProfileData(request.profileData, context);

    // 4. Validate workoutFocusData
    this.validateWorkoutFocusData(request.workoutFocusData, context);
  }

  private validateWorkoutType(workoutType: unknown, context: ValidationContext): void {
    if (!workoutType) {
      context.addError(
        ValidationError.createFieldError('workoutType', 'workoutType is required')
      );
      return;
    }

    const validTypes: WorkoutType[] = ['quick', 'detailed'];
    if (!validTypes.includes(workoutType as WorkoutType)) {
      context.addError(
        ValidationError.createFieldError(
          'workoutType',
          `workoutType must be one of: ${validTypes.join(', ')}`
        )
      );
    }
  }

  private validateUserProfile(userProfile: unknown, context: ValidationContext): void {
    if (!userProfile) {
      context.addError(
        ValidationError.createFieldError('userProfile', 'userProfile is required')
      );
      return;
    }

    if (typeof userProfile !== 'object' || userProfile === null) {
      context.addError(
        ValidationError.createFieldError('userProfile', 'userProfile must be an object')
      );
      return;
    }

    const profile = userProfile as { fitnessLevel?: unknown };
    
    if (!profile.fitnessLevel) {
      context.addError(
        ValidationError.createFieldError('userProfile.fitnessLevel', 'userProfile.fitnessLevel is required')
      );
      return;
    }

    if (!isValidFitnessLevel(profile.fitnessLevel)) {
      context.addError(
        ValidationError.createFieldError(
          'userProfile.fitnessLevel',
          'userProfile.fitnessLevel must be one of: beginner, novice, intermediate, advanced, adaptive'
        )
      );
    }
  }

  private validateProfileData(profileData: unknown, context: ValidationContext): void {
    if (!profileData) {
      context.addError(
        ValidationError.createFieldError('profileData', 'profileData is required')
      );
      return;
    }

    if (!isValidProfileData(profileData)) {
      context.addError(
        ValidationError.createFieldError('profileData', 'profileData is invalid - check required fields and values')
      );
    }
  }

  private validateWorkoutFocusData(workoutFocusData: unknown, context: ValidationContext): void {
    if (!workoutFocusData) {
      context.addError(
        ValidationError.createFieldError('workoutFocusData', 'workoutFocusData is required')
      );
      return;
    }

    if (typeof workoutFocusData !== 'object' || workoutFocusData === null) {
      context.addError(
        ValidationError.createFieldError('workoutFocusData', 'workoutFocusData must be an object')
      );
      return;
    }

    // Note: Detailed validation of workoutFocusData fields is handled by WorkoutDataRule
    // Here we just ensure it exists and is an object
  }
} 