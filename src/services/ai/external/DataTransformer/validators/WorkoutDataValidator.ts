import { WorkoutFocusData } from '../transformers/WorkoutFocusTransformer';
import { DEFAULT_VALUES } from '../constants/DefaultValues';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  populatedFields: string[];
}

export function validateWorkoutData(data: WorkoutFocusData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const populatedFields: string[] = [];

  try {
    // Required fields validation
    const requiredFields = [
      'customization_focus',
      'customization_duration',
      'customization_energy'
    ];

    requiredFields.forEach(field => {
      if (!(field in data)) {
        missingFields.push(field);
        errors.push(`Missing required field: ${field}`);
      } else {
        populatedFields.push(field);
      }
    });

    // Focus validation
    if (data.customization_focus) {
      if (typeof data.customization_focus === 'object') {
        if (!data.customization_focus.focus && !data.customization_focus.focusLabel && !data.customization_focus.label) {
          errors.push('Focus object must contain either focus, focusLabel, or label property');
        }
      }
    }

    // Duration validation
    if (typeof data.customization_duration !== 'undefined') {
      const duration = Number(data.customization_duration);
      if (isNaN(duration) || duration < 0) {
        errors.push('Duration must be a positive number');
      }
    }

    // Energy level validation
    if (typeof data.customization_energy !== 'undefined') {
      const energy = Number(data.customization_energy);
      if (isNaN(energy) || energy < 1 || energy > 10) {
        errors.push('Energy level must be a number between 1 and 10');
      }
    }

    // Equipment validation
    if (data.customization_equipment) {
      if (!Array.isArray(data.customization_equipment)) {
        errors.push('Equipment must be an array');
      } else {
        const invalidEquipment = data.customization_equipment.filter(item => 
          typeof item !== 'string' || item.trim().length === 0
        );
        if (invalidEquipment.length > 0) {
          errors.push('Equipment array must contain non-empty strings');
        }
      }
    }

    // Soreness validation
    if (data.customization_soreness) {
      Object.entries(data.customization_soreness).forEach(([area, info]) => {
        if (typeof info !== 'object' || info === null) {
          errors.push(`Invalid soreness data for area: ${area}`);
        } else {
          if (typeof info.selected !== 'boolean') {
            errors.push(`Missing or invalid 'selected' property for soreness area: ${area}`);
          }
          if (info.selected && (typeof info.rating !== 'number' || info.rating < 0 || info.rating > 10)) {
            errors.push(`Invalid rating for soreness area: ${area}. Must be a number between 0 and 10`);
          }
        }
      });
    }

    // Add warnings for missing optional fields
    ['customization_equipment', 'customization_soreness'].forEach(field => {
      if (!(field in data)) {
        warnings.push(`Missing optional field: ${field}`);
      }
    });

    // Log validation results for debugging
    console.log('🔍 Workout data validation results:', {
      totalFields: requiredFields.length + 2, // +2 for optional fields
      requiredFields: requiredFields.length,
      populatedFields: populatedFields.length,
      missingFields: missingFields.length,
      errors: errors.length,
      warnings: warnings.length
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      populatedFields
    };

  } catch (error) {
    console.error('❌ Workout data validation failed:', error);
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      missingFields: [],
      populatedFields: []
    };
  }
} 