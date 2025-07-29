/**
 * ValidationMetrics - Collects and reports validation performance metrics
 * Provides insights into validation efficiency and effectiveness
 */

export interface ValidationMetricsData {
  totalValidations: number;
  totalErrors: number;
  totalWarnings: number;
  averageValidationTime: number;
  errorsByType: Record<string, number>;
  warningsByType: Record<string, number>;
  validationSuccessRate: number;
}

export class ValidationMetrics {
  private totalValidations = 0;
  private totalErrors = 0;
  private totalWarnings = 0;
  private totalValidationTime = 0;
  private errorsByType: Record<string, number> = {};
  private warningsByType: Record<string, number> = {};

  recordValidation(duration: number): void {
    this.totalValidations++;
    this.totalValidationTime += duration;
  }

  recordError(errorType: string): void {
    this.totalErrors++;
    this.errorsByType[errorType] = (this.errorsByType[errorType] || 0) + 1;
  }

  recordWarning(warningType: string): void {
    this.totalWarnings++;
    this.warningsByType[warningType] = (this.warningsByType[warningType] || 0) + 1;
  }

  getMetrics(): ValidationMetricsData {
    return {
      totalValidations: this.totalValidations,
      totalErrors: this.totalErrors,
      totalWarnings: this.totalWarnings,
      averageValidationTime: this.totalValidations > 0 ? this.totalValidationTime / this.totalValidations : 0,
      errorsByType: { ...this.errorsByType },
      warningsByType: { ...this.warningsByType },
      validationSuccessRate: this.totalValidations > 0 ? (this.totalValidations - this.totalErrors) / this.totalValidations : 1
    };
  }

  reset(): void {
    this.totalValidations = 0;
    this.totalErrors = 0;
    this.totalWarnings = 0;
    this.totalValidationTime = 0;
    this.errorsByType = {};
    this.warningsByType = {};
  }
} 