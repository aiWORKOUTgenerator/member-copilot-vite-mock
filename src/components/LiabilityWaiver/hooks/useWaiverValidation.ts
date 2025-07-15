import { useState, useCallback } from 'react';
import { 
  validateSection, 
  validateFullWaiver, 
  validateField as validateSingleField,
  getSectionForField,
  isSectionComplete
} from '../schemas/waiverSchema';
import { LiabilityWaiverData, StepValidationErrors, ValidationHookReturn } from '../types/liability-waiver.types';

export const useWaiverValidation = (): ValidationHookReturn => {
  const [errors, setErrors] = useState<StepValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateCurrentSection = useCallback((section: number, data: Partial<LiabilityWaiverData>): boolean => {
    const result = validateSection(section, data);
    
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

  const validateField = useCallback((field: keyof LiabilityWaiverData, value: any, section?: number): boolean => {
    const result = validateSingleField(field, value);
    
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

  const validateComplete = useCallback((data: LiabilityWaiverData): boolean => {
    const result = validateFullWaiver(data);
    
    if (!result.success) {
      setErrors(result.errors);
      // Mark all fields as touched for final validation
      setTouchedFields(new Set(Object.keys(data)));
    } else {
      setErrors({});
    }
    
    return result.success;
  }, []);

  const clearFieldError = useCallback((field: keyof LiabilityWaiverData) => {
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

  const getFieldError = useCallback((field: keyof LiabilityWaiverData): string | undefined => {
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

  const isFieldValid = useCallback((field: keyof LiabilityWaiverData): boolean => {
    return !errors[field] || errors[field].length === 0;
  }, [errors]);

  // Additional helper methods for enhanced functionality
  const getFieldErrors = useCallback((field: keyof LiabilityWaiverData): string[] => {
    return errors[field] || [];
  }, [errors]);

  const getErrorCount = useCallback((): number => {
    return Object.values(errors).reduce((count, fieldErrors) => count + fieldErrors.length, 0);
  }, [errors]);

  const getErrorsBySection = useCallback((section: number): StepValidationErrors => {
    const stepErrors: StepValidationErrors = {};
    
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      const fieldStep = getSectionForField(field as keyof LiabilityWaiverData);
      if (fieldStep === section) {
        stepErrors[field] = fieldErrors;
      }
    });
    
    return stepErrors;
  }, [errors]);

  const hasErrorsInSection = useCallback((section: number): boolean => {
    return Object.keys(getErrorsBySection(section)).length > 0;
  }, [getErrorsBySection]);

  const markFieldAsTouched = useCallback((field: keyof LiabilityWaiverData) => {
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  const markFieldAsUntouched = useCallback((field: keyof LiabilityWaiverData) => {
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  }, []);

  const isFieldTouched = useCallback((field: keyof LiabilityWaiverData): boolean => {
    return touchedFields.has(field);
  }, [touchedFields]);

  const validateSectionComplete = useCallback((section: number, data: Partial<LiabilityWaiverData>): boolean => {
    return isSectionComplete(section, data);
  }, []);

  // Enhanced return object with additional methods
  return {
    // Core validation methods
    errors,
    validateCurrentSection,
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
    getErrorsBySection,
    hasErrorsInSection,
    markFieldAsTouched,
    markFieldAsUntouched,
    isFieldTouched,
    validateSectionComplete
  };
}; 