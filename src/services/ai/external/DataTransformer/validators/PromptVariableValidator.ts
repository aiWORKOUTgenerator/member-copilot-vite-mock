import { PromptVariables } from '../types/prompt.types';
import { ValidationResult } from '../../../../../types/core';
import { VALIDATION_RULES } from '../constants/ValidationRules';
import { validateProfileData } from './ProfileDataValidator';
import { validateWorkoutData } from './WorkoutDataValidator';

export function validatePromptVariables(data: PromptVariables): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const populatedFields: string[] = [];

  try {
    // Validate profile data
    const profileValidation = validateProfileData(data);

    // Validate workout data
    const workoutValidation = validateWorkoutData({
      customization_focus: data.focus,
      customization_duration: data.duration,
      customization_energy: data.energyLevel,
      customization_equipment: data.equipment,
      customization_soreness: data.sorenessAreas?.map(area => ({
        [area.split(' (Level ')[0]]: {
          selected: true,
          rating: parseInt(area.split('Level ')[1]) || 0
        }
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
    });

    // Validate metadata
    const metadataErrors: string[] = [];
    if (!data.timestamp || !Date.parse(data.timestamp)) {
      metadataErrors.push('Invalid timestamp format');
    }
    if (!data.version || !data.version.match(/^\d+\.\d+\.\d+$/)) {
      metadataErrors.push('Invalid version format (should be X.Y.Z)');
    }

    // Check for unresolved template variables
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('{{')) {
        errors.push(`Unresolved template variable in field: ${key}`);
      }
    });

    // Combine all validation results
    errors.push(
      ...profileValidation.errors,
      ...workoutValidation.errors,
      ...metadataErrors
    );

    warnings.push(
      ...profileValidation.warnings,
      ...workoutValidation.warnings
    );

    missingFields.push(
      ...profileValidation.missingFields,
      ...workoutValidation.missingFields
    );

    populatedFields.push(
      ...profileValidation.populatedFields,
      ...workoutValidation.populatedFields,
      ...(metadataErrors.length === 0 ? ['timestamp', 'version'] : [])
    );

    // Log validation results for debugging
    console.log('🔍 Prompt variables validation results:', {
      totalFields: Object.keys(data).length,
      populatedFields: populatedFields.length,
      missingFields: missingFields.length,
      errors: errors.length,
      warnings: warnings.length,
      profileValidation: {
        isValid: profileValidation.isValid,
        errorCount: profileValidation.errors.length
      },
      workoutValidation: {
        isValid: workoutValidation.isValid,
        errorCount: workoutValidation.errors.length
      },
      metadataValidation: {
        isValid: metadataErrors.length === 0,
        errorCount: metadataErrors.length
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      populatedFields,
      validationDetails: {
        profile: profileValidation,
        workout: workoutValidation,
        metadata: {
          isValid: metadataErrors.length === 0,
          errors: metadataErrors
        }
      }
    };

  } catch (error) {
    console.error('❌ Prompt variables validation failed:', error);
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      missingFields: [],
      populatedFields: [],
      validationDetails: {
        profile: {
          isValid: false,
          errors: [],
          warnings: [],
          missingFields: [],
          populatedFields: []
        },
        workout: {
          isValid: false,
          errors: [],
          warnings: [],
          missingFields: [],
          populatedFields: []
        },
        metadata: {
          isValid: false,
          errors: []
        }
      }
    };
  }
} 