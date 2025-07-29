/**
 * LegacyCompatibility - Handles legacy validation formats
 * Provides backward compatibility for older validation patterns
 */

import { ValidationResult } from '../../../types/core';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { WorkoutRequestValidator } from '../core/WorkoutRequestValidator';

export class LegacyCompatibility {
  /**
   * Convert legacy validation result to new format
   */
  static adaptLegacyResult(legacyResult: any): ValidationResult {
    return {
      isValid: legacyResult.isValid ?? true,
      errors: legacyResult.errors?.map(this.adaptLegacyError) ?? [],
      warnings: legacyResult.warnings?.map(this.adaptLegacyWarning) ?? []
    };
  }

  /**
   * Convert legacy request to new format
   */
  static adaptLegacyRequest(legacyRequest: any): WorkoutGenerationRequest {
    // Placeholder for legacy request adaptation
    return {
      workoutType: legacyRequest.type || 'quick',
      profileData: legacyRequest.profileData,
      workoutFocusData: legacyRequest.workoutFocusData,
      userProfile: legacyRequest.userProfile
    } as WorkoutGenerationRequest;
  }

  /**
   * Validate using legacy format but return new format
   */
  static validateLegacyRequest(legacyRequest: any): ValidationResult {
    const adaptedRequest = this.adaptLegacyRequest(legacyRequest);
    return WorkoutRequestValidator.validate(adaptedRequest);
  }

  private static adaptLegacyError(legacyError: any): any {
    return {
      message: legacyError.message || legacyError,
      code: 'LEGACY_ERROR',
      field: legacyError.field
    };
  }

  private static adaptLegacyWarning(legacyWarning: any): any {
    return {
      message: legacyWarning.message || legacyWarning,
      code: 'LEGACY_WARNING',
      field: legacyWarning.field,
      recommendation: legacyWarning.recommendation
    };
  }
} 