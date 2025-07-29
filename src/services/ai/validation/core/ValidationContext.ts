/**
 * ValidationContext - Maintains state during validation process
 * Tracks errors, warnings, and metrics for a single validation run
 */

import { ValidationResult } from '../../../../types/core';
import { ValidationMetrics } from '../metrics/ValidationMetrics';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';

export class ValidationContext {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  
  constructor(
    public readonly request: WorkoutGenerationRequest,
    private readonly metrics?: ValidationMetrics
  ) {}
  
  addError(error: ValidationError): void {
    this.errors.push(error);
    this.metrics?.recordError(error);
  }

  addWarning(warning: ValidationWarning): void {
    this.warnings.push(warning);
    this.metrics?.recordWarning(warning);
  }
  
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
} 