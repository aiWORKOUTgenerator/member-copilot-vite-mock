# Validation API Reference

## Core Types

### ValidationResult Interface

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

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| isValid | boolean | Yes | Overall validation status |
| errors | string[] | Yes | Array of error messages |
| warnings | string[] | Yes | Array of warning messages |
| missingFields | string[]? | No | Required fields that are missing |
| populatedFields | string[]? | No | Fields that have values |
| fieldErrors | Record<string, string[]>? | No | Field-specific error messages |
| suggestions | string[]? | No | Suggestions for fixing issues |
| details | Record<string, any>? | No | Additional validation context |

## Validation Utilities

### Form Validation

#### useFormValidation

```typescript
function useFormValidation<T>(schema: z.ZodSchema<T>): {
  validate: (data: unknown) => ValidationResult;
}
```

**Parameters:**
- schema: Zod schema for form validation

**Returns:**
- Object containing validate function

**Example:**
```typescript
const { validate } = useFormValidation(formSchema);
const result = validate(formData);
```

### Schema Validation

#### createSchemaValidator

```typescript
function createSchemaValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => ValidationResult
```

**Parameters:**
- schema: Zod schema for validation

**Returns:**
- Validation function that returns ValidationResult

**Example:**
```typescript
const validateUser = createSchemaValidator(userSchema);
const result = validateUser(userData);
```

### Custom Validation

#### CustomValidator

```typescript
class CustomValidator {
  addRule(rule: ValidationRule): void;
  validate(data: unknown): ValidationResult;
}
```

**Methods:**
- addRule: Add a validation rule
- validate: Validate data against all rules

**Example:**
```typescript
const validator = new CustomValidator();
validator.addRule(new RequiredFieldRule('email'));
const result = validator.validate(data);
```

### Validation Rules

#### ValidationRule Interface

```typescript
interface ValidationRule {
  validate(data: unknown): ValidationResult;
}
```

**Built-in Rules:**

##### RequiredFieldRule

```typescript
class RequiredFieldRule implements ValidationRule {
  constructor(field: string);
  validate(data: unknown): ValidationResult;
}
```

**Example:**
```typescript
const rule = new RequiredFieldRule('email');
const result = rule.validate(data);
```

## Error Handling

### Error Message Formatting

#### formatError

```typescript
function formatError(type: keyof typeof ERROR_MESSAGES, ...args: any[]): string
```

**Parameters:**
- type: Type of error message
- args: Arguments for error message template

**Example:**
```typescript
const message = formatError('required', 'email');
// Returns: "email is required"
```

### Error Message Types

```typescript
const ERROR_MESSAGES = {
  required: (field: string) => string;
  format: (field: string) => string;
  range: (field: string, min: number, max: number) => string;
  custom: (message: string) => string;
}
```

## Performance Utilities

### Validation Caching

#### memoizedValidate

```typescript
const memoizedValidate = memoize(
  (data: unknown): ValidationResult => ValidationResult,
  options: {
    maxAge: number;
    maxSize: number;
  }
);
```

**Parameters:**
- data: Data to validate
- options: Caching options
  - maxAge: Cache duration in milliseconds
  - maxSize: Maximum number of cached results

**Example:**
```typescript
const result = memoizedValidate(data);
```

## Integration Patterns

### React Component Integration

#### ValidatedInput

```typescript
interface ValidatedInputProps {
  value: string;
  onValidation?: (result: ValidationResult) => void;
}

function ValidatedInput(props: ValidatedInputProps): JSX.Element
```

**Example:**
```typescript
<ValidatedInput
  value={email}
  onValidation={handleValidation}
/>
```

### Form Integration

#### ValidatedForm

```typescript
interface ValidatedFormProps {
  onSubmit: (data: unknown) => void;
  schema: z.ZodSchema<any>;
}

function ValidatedForm(props: ValidatedFormProps): JSX.Element
```

**Example:**
```typescript
<ValidatedForm
  onSubmit={handleSubmit}
  schema={formSchema}
/>
```

## Testing Utilities

### Validation Testing

#### createValidationTest

```typescript
function createValidationTest(
  validator: (data: unknown) => ValidationResult,
  testCases: Array<{
    input: unknown;
    expected: Partial<ValidationResult>;
  }>
): void
```

**Example:**
```typescript
createValidationTest(validateEmail, [
  {
    input: 'invalid',
    expected: {
      isValid: false,
      errors: ['Invalid email format']
    }
  }
]);
```

## Common Patterns

### Validation Function Structure

```typescript
function validateData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  // Validation logic

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors
  };
}
```

### Error Collection

```typescript
function collectErrors(results: ValidationResult[]): ValidationResult {
  return {
    isValid: results.every(r => r.isValid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
    fieldErrors: results.reduce((acc, r) => ({
      ...acc,
      ...r.fieldErrors
    }), {})
  };
}
```

### Validation Composition

```typescript
function composeValidators(
  validators: Array<(data: unknown) => ValidationResult>
): (data: unknown) => ValidationResult {
  return (data: unknown) => {
    const results = validators.map(v => v(data));
    return collectErrors(results);
  };
}
```

## Best Practices

### Error Message Standards

- Use consistent terminology
- Include field names in messages
- Keep messages actionable
- Use proper capitalization
- Avoid technical jargon

### Performance Optimization

- Cache validation results
- Validate only changed fields
- Use debounce for real-time validation
- Batch validation operations

### Type Safety

- Use TypeScript for validation functions
- Define clear interfaces
- Leverage type inference
- Document type constraints

### Testing

- Test edge cases
- Test error messages
- Test warning conditions
- Test performance
- Test integration points