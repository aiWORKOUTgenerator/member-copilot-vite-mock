import { useCallback, useMemo, useState, useEffect } from 'react';
import { useEnhancedPersistedState } from '../../../hooks/usePersistedState';
import { LiabilityWaiverData, WaiverFormHookReturn } from '../types/liability-waiver.types';
import { calculateCompletionPercentage } from '../utils/waiverHelpers';
import { defaultWaiverData } from '../schemas/waiverSchema';

export const useWaiverForm = (): WaiverFormHookReturn => {
  const {
    state: waiverData,
    setState: setWaiverData,
    metadata,
    hasUnsavedChanges,
    forceSave
  } = useEnhancedPersistedState<LiabilityWaiverData>(
    'waiverData', 
    defaultWaiverData,
    { debounceDelay: 500 } // Faster debounce for better responsiveness
  );
  
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);

  // Removed backup functionality

  const handleInputChange = useCallback((field: keyof LiabilityWaiverData, value: string | boolean) => {
    setWaiverData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouchedFields(prev => {
      if (!prev.includes(field as string)) {
        return [...prev, field as string];
      }
      return prev;
    });
  }, [setWaiverData]);

  const resetForm = useCallback(() => {
    setWaiverData(defaultWaiverData);
    setTouchedFields([]);
    forceSave(); // Immediately persist the reset
  }, [setWaiverData, forceSave]);

  // Step validation logic
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return waiverData.physicianApproval === true;
      case 2:
        return !!(
          waiverData.understandRisks &&
          waiverData.assumeResponsibility &&
          waiverData.followInstructions &&
          waiverData.reportInjuries
        );
      case 3:
        return !!(
          waiverData.releaseFromLiability &&
          waiverData.signature &&
          waiverData.signatureDate
        );
      default:
        return false;
    }
  }, [waiverData]);

  // Calculate completion status
  const isComplete = useMemo(() => {
    // Use step validation to determine completion
    return [1, 2, 3].every(step => validateStep(step));
  }, [validateStep]);

  const getCompletionPercentageValue = useCallback(() => {
    return calculateCompletionPercentage(waiverData);
  }, [waiverData]);

  // Step completion status
  const stepCompletion = useMemo(() => {
    const completion: Record<number, { isComplete: boolean; progress: number }> = {};
    
    // Define fields for each step
    const stepFields = {
      1: ['fullName', 'dateOfBirth', 'emergencyContactName', 'emergencyContactPhone', 'medicalConditions', 'medications', 'physicianApproval'],
      2: ['understandRisks', 'assumeResponsibility', 'followInstructions', 'reportInjuries'],
      3: ['releaseFromLiability', 'signature', 'signatureDate']
    };

    for (let step = 1; step <= 3; step++) {
      const fields = stepFields[step as keyof typeof stepFields];
      let completedFields = 0;

      fields.forEach(field => {
        const value = waiverData[field as keyof LiabilityWaiverData];
        if (typeof value === 'boolean') {
          // For boolean fields, we count them as complete if they are true or if they're optional
          const optionalBooleanFields = ['physicianApproval'];
          if (optionalBooleanFields.includes(field) || value === true) {
            completedFields++;
          }
        } else if (typeof value === 'string') {
          // For string fields, count as complete if not empty, or if they're optional
          const optionalStringFields = ['medicalConditions', 'medications'];
          if (optionalStringFields.includes(field) || value.trim().length > 0) {
            completedFields++;
          }
        }
      });

      const progress = Math.round((completedFields / fields.length) * 100);
      const isComplete = validateStep(step);

      completion[step] = {
        isComplete,
        progress
      };
    }
    
    return completion;
  }, [waiverData, validateStep]);

  // Navigation functions
  const canProceedToNextSection = useCallback(() => {
    return validateStep(currentSection);
  }, [currentSection, validateStep]);

  const nextSection = useCallback(() => {
    if (canProceedToNextSection() && currentSection < 3) {
      setCurrentSection(prev => prev + 1);
    }
  }, [currentSection, canProceedToNextSection]);

  const prevSection = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const setSection = useCallback((section: number) => {
    // Validate all steps up to the target step
    const canNavigate = Array.from({ length: section }, (_, i) => i + 1)
      .every(s => validateStep(s));
    
    if (canNavigate || section === 1) {
      setCurrentSection(section);
    }
  }, [validateStep]);

  const getFieldError = useCallback((field: keyof LiabilityWaiverData) => {
    // Simple validation - you can enhance this with more specific error messages
    if (!touchedFields.includes(field as string)) return undefined;
    
    const value = waiverData[field];
    
    // Required string fields
    const requiredStringFields = ['fullName', 'dateOfBirth', 'emergencyContactName', 'emergencyContactPhone', 'signature', 'signatureDate'];
    if (requiredStringFields.includes(field as string) && typeof value === 'string' && !value.trim()) {
      return 'This field is required';
    }
    
    // Required boolean fields (must be true)
    const requiredBooleanFields = ['understandRisks', 'assumeResponsibility', 'followInstructions', 'reportInjuries', 'releaseFromLiability'];
    if (requiredBooleanFields.includes(field as string) && typeof value === 'boolean' && !value) {
      return 'This acknowledgment is required';
    }
    
    return undefined;
  }, [waiverData, touchedFields]);

  const getTotalProgress = useCallback(() => {
    const completedSteps = Object.values(stepCompletion).filter(s => s.isComplete).length;
    return (completedSteps / 3) * 100;
  }, [stepCompletion]);

  return {
    waiverData,
    handleInputChange,
    resetForm,
    isComplete,
    getCompletionPercentage: getCompletionPercentageValue,
    currentSection,
    touchedFields,
    sectionCompletion: stepCompletion,
    getFieldError,
    canProceedToNextSection,
    nextSection,
    prevSection,
    setSection,
    isWaiverComplete: () => isComplete,
    getTotalProgress,
    // New enhanced features
    hasUnsavedChanges,
    lastSaved: metadata.lastSaved,
    forceSave
  };
}; 