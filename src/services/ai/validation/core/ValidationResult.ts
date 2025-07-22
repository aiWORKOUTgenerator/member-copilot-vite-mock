/**
 * ValidationResult - Result of a validation run
 * Contains validity, errors, and warnings
 */

import { ValidationError, ValidationWarning } from './ValidationError';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
} 