/**
 * ValidationRule - Interface for all validation rules
 * Defines the contract that all validation rules must follow
 */

import { ValidationContext } from './ValidationContext';

export interface ValidationRule {
  /**
   * Validate the request against this rule
   * @param context The validation context containing the request and results
   */
  validate(context: ValidationContext): void;

  /**
   * Get the rule's name for identification and logging
   */
  getName(): string;

  /**
   * Get the rule's priority (lower numbers run first)
   */
  getPriority(): number;
}

export abstract class BaseValidationRule implements ValidationRule {
  constructor(
    private readonly name: string,
    private readonly priority: number = 100
  ) {}

  abstract validate(context: ValidationContext): void;

  getName(): string {
    return this.name;
  }

  getPriority(): number {
    return this.priority;
  }
} 