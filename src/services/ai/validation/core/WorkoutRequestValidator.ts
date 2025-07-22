/**
 * WorkoutRequestValidator - Main validation orchestrator
 * Coordinates validation rules and produces final validation result
 */

import { ValidationContext } from './ValidationContext';
import { ValidationRule } from './ValidationRule';
import { ValidationError } from './ValidationError';
import { ValidationMetrics } from '../metrics/ValidationMetrics';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { ValidationResult } from './ValidationResult';

export class WorkoutRequestValidator {
  private static rules: ValidationRule[] = [];
  private static metrics: ValidationMetrics;

  /**
   * Register a validation rule
   */
  static registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
    // Sort rules by priority after adding
    this.rules.sort((a, b) => a.getPriority() - b.getPriority());
  }

  /**
   * Set metrics collector
   */
  static setMetrics(metrics: ValidationMetrics): void {
    this.metrics = metrics;
  }

  /**
   * Main validation method
   */
  static validate(request: WorkoutGenerationRequest): ValidationResult {
    const context = new ValidationContext(request, this.metrics);
    
    // Apply all rules in priority order
    for (const rule of this.rules) {
      try {
        rule.validate(context);
      } catch (error) {
        const validationError = new ValidationError(
          `Rule ${rule.getName()} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'RULE_EXECUTION_ERROR',
          undefined,
          { ruleName: rule.getName() }
        );
        context.addError(validationError);
      }
    }
    
    return context.getResult();
  }

  /**
   * Clear all registered rules
   */
  static clearRules(): void {
    this.rules = [];
  }

  /**
   * Get registered rules for testing
   */
  static getRules(): ValidationRule[] {
    return [...this.rules];
  }
} 