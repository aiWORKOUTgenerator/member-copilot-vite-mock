import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationError {
  field: string;
  message: string;
}

interface UseFormValidationReturn<T> {
  errors: ValidationError[];
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: any) => boolean;
  clearErrors: () => void;
  getFieldError: (field: keyof T) => string | undefined;
}

export function useFormValidation<T>(schema: z.ZodSchema<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback((data: T): boolean => {
    try {
      schema.parse(data);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        setErrors(validationErrors);
      }
      return false;
    }
  }, [schema]);

  const validateField = useCallback((field: keyof T, value: any): boolean => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = schema.shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
        // Remove any existing errors for this field
        setErrors(prev => prev.filter(err => err.field !== String(field)));
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError: ValidationError = {
          field: String(field),
          message: error.errors[0]?.message || 'Invalid value'
        };
        setErrors(prev => [
          ...prev.filter(err => err.field !== String(field)),
          fieldError
        ]);
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors.find(err => err.field === String(field))?.message;
  }, [errors]);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    getFieldError
  };
} 