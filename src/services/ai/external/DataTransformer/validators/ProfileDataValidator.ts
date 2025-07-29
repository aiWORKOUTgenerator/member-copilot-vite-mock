import { VALIDATION_RULES, ALL_REQUIRED_FIELDS } from '../constants/ValidationRules';
import type { ProfileFields } from '../types/profile.types';
import { ValidationResult } from '../../../../../types/core';

export function validateProfileData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const populatedFields: string[] = [];

  try {
    // Check for null/undefined data
    if (!data) {
      return {
        isValid: false,
        errors: ['Profile data is required'],
        warnings: [],
        missingFields: ALL_REQUIRED_FIELDS as string[],
        populatedFields: []
      };
    }

    // Validate each field according to rules
    Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
      const value = data[field];

      // Check required fields
      if (rules.required && !value) {
        errors.push(`Missing required field: ${field}`);
        missingFields.push(field);
      } else if (value) {
        populatedFields.push(field);

        // Validate against allowed values if specified
        if ('validValues' in rules && rules.validValues) {
          if (Array.isArray(value)) {
            // For array fields, check each value
            const invalidValues = value.filter(v => !rules.validValues!.includes(v));
            if (invalidValues.length > 0) {
              errors.push(`Invalid values for ${field}: ${invalidValues.join(', ')}`);
            }
          } else if (!rules.validValues.includes(value)) {
            errors.push(`Invalid value for ${field}: ${value}`);
          }
        }

        // Check format if specified
        if ('format' in rules && rules.format) {
          if (!rules.format.test(value)) {
            errors.push(`Invalid format for ${field}: ${value}`);
          }
        }

        // Check dependencies if specified
        if ('dependsOn' in rules && rules.dependsOn) {
          const dependentField = rules.dependsOn;
          if (!data[dependentField]) {
            errors.push(`${field} requires ${dependentField} to be set`);
          }
        }
      } else {
        // Field is not required and not provided
        warnings.push(`Optional field not provided: ${field}`);
        missingFields.push(field);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      populatedFields
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${(error as Error).message}`],
      warnings: [],
      missingFields: [],
      populatedFields: []
    };
  }
} 