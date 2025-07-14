import { useState, useCallback } from 'react';
import { 
  validateStep, 
  validateFullProfile, 
  validateField as validateSingleField,
  getStepForField,
  isStepComplete
} from '../schemas/profileSchema';
import { ProfileData, StepValidationErrors, ValidationHookReturn } from '../types/profile.types';

export const useProfileValidation = (): ValidationHookReturn => {
  const [errors, setErrors] = useState<StepValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateCurrentStep = useCallback((step: number, data: Partial<ProfileData>): boolean => {
    const result = validateStep(step, data);
    
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        ...result.errors
      }));
    } else {
      // Clear errors for fields that are now valid in this step
      const stepFieldsToCheck = Object.keys(result.errors || {});
      setErrors(prev => {
        const newErrors = { ...prev };
        stepFieldsToCheck.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
    
    return result.success;
  }, []);

  const validateField = useCallback((field: keyof ProfileData, value: any, step?: number): boolean => {
    const result = validateSingleField(field, value, step);
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
    
    if (!result.success && result.errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: result.errors[field]
      }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, []);

  const validateComplete = useCallback((data: ProfileData): boolean => {
    const result = validateFullProfile(data);
    
    if (!result.success) {
      setErrors(result.errors);
      // Mark all fields as touched for final validation
      setTouchedFields(new Set(Object.keys(data)));
    } else {
      setErrors({});
    }
    
    return result.success;
  }, []);

  const clearFieldError = useCallback((field: keyof ProfileData) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouchedFields(new Set());
  }, []);

  const getFieldError = useCallback((field: keyof ProfileData): string | undefined => {
    // Only show error if field has been touched
    if (!touchedFields.has(field)) {
      return undefined;
    }
    
    const fieldErrors = errors[field];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
  }, [errors, touchedFields]);

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const isFieldValid = useCallback((field: keyof ProfileData): boolean => {
    return !errors[field] || errors[field].length === 0;
  }, [errors]);

  // Additional helper methods for enhanced functionality
  const getFieldErrors = useCallback((field: keyof ProfileData): string[] => {
    return errors[field] || [];
  }, [errors]);

  const getErrorCount = useCallback((): number => {
    return Object.values(errors).reduce((count, fieldErrors) => count + fieldErrors.length, 0);
  }, [errors]);

  const getErrorsByStep = useCallback((step: number): StepValidationErrors => {
    const stepErrors: StepValidationErrors = {};
    
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      const fieldStep = getStepForField(field as keyof ProfileData);
      if (fieldStep === step) {
        stepErrors[field] = fieldErrors;
      }
    });
    
    return stepErrors;
  }, [errors]);

  const hasErrorsInStep = useCallback((step: number): boolean => {
    return Object.keys(getErrorsByStep(step)).length > 0;
  }, [getErrorsByStep]);

  const markFieldAsTouched = useCallback((field: keyof ProfileData) => {
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  const markFieldAsUntouched = useCallback((field: keyof ProfileData) => {
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  }, []);

  const isFieldTouched = useCallback((field: keyof ProfileData): boolean => {
    return touchedFields.has(field);
  }, [touchedFields]);

  const validateStepComplete = useCallback((step: number, data: Partial<ProfileData>): boolean => {
    return isStepComplete(step, data);
  }, []);

  // Enhanced return object with additional methods
  return {
    // Core validation methods
    errors,
    validateCurrentStep,
    validateField,
    validateComplete,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors,
    isFieldValid,
    touchedFields: Array.from(touchedFields),
    
    // Additional helper methods
    getFieldErrors,
    getErrorCount,
    getErrorsByStep,
    hasErrorsInStep,
    markFieldAsTouched,
    markFieldAsUntouched,
    isFieldTouched,
    validateStepComplete
  };
}; 