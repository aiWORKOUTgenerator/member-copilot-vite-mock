# Core Validation System

## Overview

The core validation system provides a unified approach to data validation across the application. It uses a single `ValidationResult` interface as the standard format for validation results, ensuring consistency and type safety throughout the codebase.

## ValidationResult Interface

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields?: string[];
  populatedFields?: string[];
  fieldErrors?: Record<string, string[]>;
  suggestions?: string[];
  details?: Record<string, any>;
}
```

### Interface Fields

- **isValid**: Boolean indicating overall validation status
- **errors**: Array of error messages
- **warnings**: Array of warning messages (non-blocking)
- **missingFields**: Optional array of required fields that are missing
- **populatedFields**: Optional array of fields that have values
- **fieldErrors**: Optional record of field-specific error messages
- **suggestions**: Optional array of suggestions for fixing validation issues
- **details**: Optional record for additional validation context

## Validation Patterns

### 1. Form Validation

```typescript
function validateForm(data: FormData): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: {
      // Field-specific errors
      email: ['Invalid email format']
    }
  };
}
```

### 2. Schema Validation (with Zod)

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

function validateWithSchema(data: unknown): ValidationResult {
  const result = schema.safeParse(data);
  if (result.success) {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
  return {
    isValid: false,
    errors: result.error.errors.map(e => e.message),
    warnings: [],
    fieldErrors: formatZodErrors(result.error)
  };
}
```

### 3. Cross-Field Validation

```typescript
function validateCrossField(data: Record<string, any>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.endDate < data.startDate) {
    errors.push('End date must be after start date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Error Handling Strategy

### Non-Blocking Validation

```typescript
function validateWithWarnings(data: unknown): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Add warnings for non-critical issues
  if (someCondition) {
    warnings.push('This might cause performance issues');
  }

  // Add errors for critical issues
  if (criticalCondition) {
    errors.push('This will cause data corruption');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### Graceful Degradation

```typescript
function validateWithFallback(data: unknown): ValidationResult {
  try {
    // Attempt full validation
    return fullValidation(data);
  } catch (error) {
    // Fallback to basic validation
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`],
      warnings: ['Using fallback validation']
    };
  }
}
```

## Integration with Components

### React Component Example

```typescript
interface Props {
  value: string;
  onValidation?: (result: ValidationResult) => void;
}

function ValidatedInput({ value, onValidation }: Props) {
  useEffect(() => {
    const result = validateInput(value);
    onValidation?.(result);
  }, [value]);

  return <input value={value} />;
}
```

### Form Component Example

```typescript
function ValidatedForm() {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const handleValidation = (result: ValidationResult) => {
    setValidationResult(result);
  };

  return (
    <form>
      <ValidatedInput onValidation={handleValidation} />
      {validationResult.errors.map(error => (
        <div className="error">{error}</div>
      ))}
    </form>
  );
}
```

## Best Practices

### 1. Use Consistent Error Messages
- Keep error messages clear and actionable
- Use consistent terminology
- Include field names in messages

### 2. Handle Edge Cases
- Validate null/undefined values
- Handle empty strings
- Consider type coercion

### 3. Performance Considerations
- Cache validation results when possible
- Validate only changed fields
- Use debounce for real-time validation

### 4. Type Safety
- Use TypeScript for validation functions
- Define clear interfaces for validation inputs
- Leverage type inference

## Common Validation Scenarios

### 1. Required Fields

```typescript
function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      errors: [`${fieldName} is required`],
      warnings: [],
      missingFields: [fieldName]
    };
  }
  return { isValid: true, errors: [], warnings: [] };
}
```

### 2. Format Validation

```typescript
function validateFormat(value: string, pattern: RegExp, fieldName: string): ValidationResult {
  if (!pattern.test(value)) {
    return {
      isValid: false,
      errors: [`Invalid format for ${fieldName}`],
      warnings: [],
      fieldErrors: {
        [fieldName]: [`Invalid format for ${fieldName}`]
      }
    };
  }
  return { isValid: true, errors: [], warnings: [] };
}
```

### 3. Range Validation

```typescript
function validateRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  if (value > max) {
    errors.push(`${fieldName} must be no more than ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Testing Validation

### Unit Tests

```typescript
describe('validateInput', () => {
  it('should return valid result for valid input', () => {
    const result = validateInput('valid@email.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for invalid input', () => {
    const result = validateInput('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });
});
```

### Integration Tests

```typescript
describe('FormValidation', () => {
  it('should validate all fields', async () => {
    const form = render(<ValidatedForm />);
    await userEvent.type(form.getByLabelText('email'), 'test@example.com');
    expect(form.queryByText('Invalid email format')).toBeNull();
  });
});
```

## Troubleshooting

### Common Issues

1. **Validation Not Triggering**
   - Check if validation function is being called
   - Verify event handlers are connected
   - Check for debounce timing issues

2. **Unexpected Validation Results**
   - Log validation input and output
   - Check for type mismatches
   - Verify validation rules

3. **Performance Issues**
   - Profile validation timing
   - Check validation caching
   - Review validation triggers

## Migration Guide

### From Legacy Validation

1. **Update Imports**
   ```typescript
   // Before
   import { ValidationResult } from './local-validation';
   
   // After
   import { ValidationResult } from '../../../types/core';
   ```

2. **Update Return Types**
   ```typescript
   // Before
   return { success: true, errors: {} };
   
   // After
   return { isValid: true, errors: [], warnings: [] };
   ```

3. **Update Error Handling**
   ```typescript
   // Before
   throw new ValidationError('Invalid input');
   
   // After
   return {
     isValid: false,
     errors: ['Invalid input'],
     warnings: []
   };
   ```