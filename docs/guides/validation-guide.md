# Validation Development Guide

## Overview

This guide explains how to implement validation in the codebase using our unified validation system. It covers form validation, schema validation with Zod, and custom validation implementations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Form Validation](#form-validation)
3. [Schema Validation](#schema-validation)
4. [Custom Validation](#custom-validation)
5. [Best Practices](#best-practices)

## Getting Started

### Import the ValidationResult Interface

```typescript
import { ValidationResult } from '../../../types/core';
```

### Basic Validation Function Structure

```typescript
function validate(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation logic here

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Form Validation

### 1. Create a Form Schema

```typescript
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});
```

### 2. Create a Form Validation Hook

```typescript
function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: unknown): ValidationResult => {
    const result = schema.safeParse(data);
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    const fieldErrors: Record<string, string[]> = {};
    result.error.errors.forEach(error => {
      const field = error.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(error.message);
    });

    return {
      isValid: false,
      errors: result.error.errors.map(e => e.message),
      warnings: [],
      fieldErrors
    };
  };

  return { validate };
}
```

### 3. Use in a Form Component

```typescript
function RegistrationForm() {
  const { validate } = useFormValidation(formSchema);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const handleSubmit = (data: unknown) => {
    const result = validate(data);
    setValidationResult(result);
    if (result.isValid) {
      // Submit form
    }
  };

  return (
    <form>
      {/* Form fields */}
      {validationResult.errors.map(error => (
        <div className="error">{error}</div>
      ))}
    </form>
  );
}
```

## Schema Validation

### 1. Define Your Schema

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  email: z.string().email('Invalid email format'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
});
```

### 2. Create a Schema Validator

```typescript
function createSchemaValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult => {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return {
          isValid: true,
          errors: [],
          warnings: []
        };
      }

      const fieldErrors: Record<string, string[]> = {};
      const errors = result.error.errors.map(error => {
        const field = error.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
        return error.message;
      });

      return {
        isValid: false,
        errors,
        warnings: [],
        fieldErrors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Schema validation error: ${error.message}`],
        warnings: []
      };
    }
  };
}
```

### 3. Use the Schema Validator

```typescript
const validateUser = createSchemaValidator(userSchema);

function UserForm() {
  const handleSubmit = (data: unknown) => {
    const result = validateUser(data);
    if (result.isValid) {
      // Process valid data
    } else {
      // Handle validation errors
    }
  };
}
```

## Custom Validation

### 1. Create a Custom Validator

```typescript
class CustomValidator {
  private rules: ValidationRule[] = [];

  addRule(rule: ValidationRule) {
    this.rules.push(rule);
  }

  validate(data: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string[]> = {};

    for (const rule of this.rules) {
      const result = rule.validate(data);
      if (!result.isValid) {
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, fieldErrors]) => {
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            fieldErrors[field].push(...fieldErrors);
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldErrors
    };
  }
}
```

### 2. Create Validation Rules

```typescript
interface ValidationRule {
  validate(data: unknown): ValidationResult;
}

class RequiredFieldRule implements ValidationRule {
  constructor(private field: string) {}

  validate(data: unknown): ValidationResult {
    const value = data[this.field];
    if (value === undefined || value === null || value === '') {
      return {
        isValid: false,
        errors: [`${this.field} is required`],
        warnings: [],
        fieldErrors: {
          [this.field]: [`${this.field} is required`]
        }
      };
    }
    return { isValid: true, errors: [], warnings: [] };
  }
}
```

### 3. Use Custom Validation

```typescript
const validator = new CustomValidator();
validator.addRule(new RequiredFieldRule('email'));
validator.addRule(new RequiredFieldRule('password'));

function validateForm(data: unknown): ValidationResult {
  return validator.validate(data);
}
```

## Best Practices

### 1. Validation Function Structure

```typescript
function validateData(data: unknown): ValidationResult {
  // 1. Type check
  if (!isValidDataType(data)) {
    return {
      isValid: false,
      errors: ['Invalid data type'],
      warnings: []
    };
  }

  // 2. Required fields
  const missingFields = checkRequiredFields(data);
  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: missingFields.map(field => `${field} is required`),
      warnings: [],
      missingFields
    };
  }

  // 3. Format validation
  const formatErrors = validateFormats(data);
  if (formatErrors.length > 0) {
    return {
      isValid: false,
      errors: formatErrors,
      warnings: []
    };
  }

  // 4. Business rules
  const { errors, warnings } = validateBusinessRules(data);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 2. Error Message Standards

```typescript
const ERROR_MESSAGES = {
  required: (field: string) => `${field} is required`,
  format: (field: string) => `Invalid format for ${field}`,
  range: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max}`,
  custom: (message: string) => message
};

function formatError(type: keyof typeof ERROR_MESSAGES, ...args: any[]): string {
  return ERROR_MESSAGES[type](...args);
}
```

### 3. Performance Optimization

```typescript
const memoizedValidate = memoize((data: unknown): ValidationResult => {
  // Validation logic
}, {
  maxAge: 5000, // Cache for 5 seconds
  maxSize: 100  // Cache up to 100 results
});
```

### 4. Testing Validation

```typescript
describe('validateData', () => {
  it('should validate required fields', () => {
    const data = { name: '' };
    const result = validateData(data);
    expect(result.isValid).toBe(false);
    expect(result.missingFields).toContain('name');
  });

  it('should validate formats', () => {
    const data = { email: 'invalid' };
    const result = validateData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid format for email');
  });

  it('should include warnings for non-blocking issues', () => {
    const data = { age: 17 };
    const result = validateData(data);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('User is under 18');
  });
});
```