import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
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
  const errorsRef = useRef<ValidationError[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  const validate = useCallback((data: T): boolean => {
    try {
      schema.parse(data);
      const newErrors: ValidationError[] = [];
      flushSync(() => {
        setErrors(newErrors);
      });
      errorsRef.current = newErrors;
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        flushSync(() => {
          setErrors(validationErrors);
        });
        errorsRef.current = validationErrors;
        return false;
      }
      return false;
    }
  }, [schema]);

  const validateField = useCallback((field: keyof T, value: any): boolean => {
    try {
      // For object schemas, extract the field schema and validate directly
      if (schema instanceof z.ZodObject) {
        const fieldSchema = (schema as any).shape[field];
        if (fieldSchema) {
          fieldSchema.parse(value);
          // If validation passes, remove any existing errors for this field
          const newErrors = errorsRef.current.filter(err => err.field !== String(field));
          flushSync(() => {
            setErrors(newErrors);
          });
          errorsRef.current = newErrors;
          return true;
        }
      }
      
      // Fallback approach: use safeParse to validate the field
      const result = schema.safeParse({ [field]: value } as any);
      
      if (result.success) {
        const newErrors = errorsRef.current.filter(err => err.field !== String(field));
        flushSync(() => {
          setErrors(newErrors);
        });
        errorsRef.current = newErrors;
        return true;
      } else {
        // Find the error for this specific field
        const fieldError = result.error.issues.find(issue => 
          issue.path.includes(field as string)
        );
        
        if (fieldError) {
          const validationError: ValidationError = {
            field: String(field),
            message: fieldError.message
          };
          
          const newErrors = [
            ...errorsRef.current.filter(err => err.field !== String(field)),
            validationError
          ];
          flushSync(() => {
            setErrors(newErrors);
          });
          errorsRef.current = newErrors;
          return false;
        }
      }
      
      // If we can't find a specific field error, create a generic one
      const genericError: ValidationError = {
        field: String(field),
        message: 'Invalid value'
      };
      
      const newErrors = [
        ...errorsRef.current.filter(err => err.field !== String(field)),
        genericError
      ];
      flushSync(() => {
        setErrors(newErrors);
      });
      errorsRef.current = newErrors;
      return false;
    } catch (error) {
      // Handle direct field validation errors
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          field: String(field),
          message: error.issues[0]?.message || 'Invalid value'
        };
        
        const newErrors = [
          ...errorsRef.current.filter(err => err.field !== String(field)),
          validationError
        ];
        flushSync(() => {
          setErrors(newErrors);
        });
        errorsRef.current = newErrors;
        return false;
      }
      
      // If direct field validation fails, create a generic error
      const genericError: ValidationError = {
        field: String(field),
        message: 'Invalid value'
      };
      
      const newErrors = [
        ...errorsRef.current.filter(err => err.field !== String(field)),
        genericError
      ];
      flushSync(() => {
        setErrors(newErrors);
      });
      errorsRef.current = newErrors;
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    flushSync(() => {
      setErrors([]);
    });
    errorsRef.current = [];
  }, []);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    const error = errorsRef.current.find(err => err.field === String(field));
    return error?.message;
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    getFieldError
  };
} 