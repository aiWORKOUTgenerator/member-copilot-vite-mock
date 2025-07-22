/**
 * ValidationError - Represents a validation error with context
 * Provides structured error information for validation failures
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  static createFieldError(field: string, message: string): ValidationError {
    return new ValidationError(
      message,
      'FIELD_ERROR',
      field
    );
  }

  static createBusinessError(message: string, context?: Record<string, unknown>): ValidationError {
    return new ValidationError(
      message,
      'BUSINESS_ERROR',
      undefined,
      context
    );
  }
}

/**
 * ValidationWarning - Represents a non-critical validation issue
 */
export class ValidationWarning {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly field?: string,
    public readonly recommendation?: string
  ) {}

  static createFieldWarning(field: string, message: string, recommendation?: string): ValidationWarning {
    return new ValidationWarning(
      message,
      'FIELD_WARNING',
      field,
      recommendation
    );
  }

  static createBusinessWarning(message: string, recommendation?: string): ValidationWarning {
    return new ValidationWarning(
      message,
      'BUSINESS_WARNING',
      undefined,
      recommendation
    );
  }
} 