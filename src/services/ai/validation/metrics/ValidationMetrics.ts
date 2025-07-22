/**
 * ValidationMetrics - Tracks validation performance metrics
 * Collects and reports validation statistics
 */

import { ValidationError, ValidationWarning } from '../core/ValidationError';

export interface ValidationMetricsData {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  totalErrors: number;
  totalWarnings: number;
  averageValidationTime: number;
  errorsByType: Record<string, number>;
  warningsByType: Record<string, number>;
}

export class ValidationMetrics {
  private totalValidations = 0;
  private successfulValidations = 0;
  private failedValidations = 0;
  private totalErrors = 0;
  private totalWarnings = 0;
  private totalValidationTime = 0;
  private errorsByType: Record<string, number> = {};
  private warningsByType: Record<string, number> = {};

  recordValidation(duration: number, success: boolean): void {
    this.totalValidations++;
    this.totalValidationTime += duration;
    
    if (success) {
      this.successfulValidations++;
    } else {
      this.failedValidations++;
    }
  }

  recordError(error: ValidationError): void {
    this.totalErrors++;
    this.errorsByType[error.code] = (this.errorsByType[error.code] || 0) + 1;
  }

  recordWarning(warning: ValidationWarning): void {
    this.totalWarnings++;
    this.warningsByType[warning.code] = (this.warningsByType[warning.code] || 0) + 1;
  }

  getMetrics(): ValidationMetricsData {
    return {
      totalValidations: this.totalValidations,
      successfulValidations: this.successfulValidations,
      failedValidations: this.failedValidations,
      totalErrors: this.totalErrors,
      totalWarnings: this.totalWarnings,
      averageValidationTime: this.totalValidations ? 
        this.totalValidationTime / this.totalValidations : 0,
      errorsByType: { ...this.errorsByType },
      warningsByType: { ...this.warningsByType }
    };
  }

  reset(): void {
    this.totalValidations = 0;
    this.successfulValidations = 0;
    this.failedValidations = 0;
    this.totalErrors = 0;
    this.totalWarnings = 0;
    this.totalValidationTime = 0;
    this.errorsByType = {};
    this.warningsByType = {};
  }
} 