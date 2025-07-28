import { useCallback, useMemo, useState, useEffect } from 'react';
import { useEnhancedPersistedState } from '../../../hooks/usePersistedState';
import { LiabilityWaiverData, WaiverFormHookReturn } from '../types/liability-waiver.types';
import { defaultWaiverData } from '../schemas/waiverSchema';

export const useWaiverForm = (): WaiverFormHookReturn => {
  const {
    state: waiverDataRaw,
    setState: setWaiverData,
    metadata,
    hasUnsavedChanges,
    forceSave
  } = useEnhancedPersistedState<LiabilityWaiverData | null>(
    'waiverData', 
    null,
    { debounceDelay: 500 }
  );

  // Always provide a fully populated waiverData object
  const waiverData: LiabilityWaiverData = useMemo(() => {
    if (!waiverDataRaw) return { ...defaultWaiverData };
    return { ...defaultWaiverData, ...waiverDataRaw };
  }, [waiverDataRaw]);
  
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Enhanced input change handler with error handling
  const handleInputChange = useCallback(async (field: keyof LiabilityWaiverData, value: string | boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setWaiverData(prev => {
        const base = prev ? { ...defaultWaiverData, ...prev } : { ...defaultWaiverData };
        return {
          ...base,
          [field]: value
        };
      });
      
      // Mark field as touched
      setTouchedFields(prev => {
        if (!prev.includes(field as string)) {
          return [...prev, field as string];
        }
        return prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while updating the form'));
    } finally {
      setIsLoading(false);
    }
  }, [setWaiverData]);

  const resetForm = useCallback(() => {
    setWaiverData({ ...defaultWaiverData });
    setTouchedFields([]);
    setError(null);
  }, [setWaiverData]);

  // Simplified step validation - only check if required fields exist (matching profile pattern)
  const validateStep = useCallback((step: number): boolean => {
    if (!waiverData) return false;
    
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

  // Simple completion percentage (matching profile pattern)
  const getCompletionPercentageValue = useCallback(() => {
    if (!waiverData) return 0;
    const completedSteps = [1, 2, 3].filter(step => validateStep(step)).length;
    return (completedSteps / 3) * 100;
  }, [waiverData, validateStep]);

  // Simplified step completion - just track if each step is complete (matching profile pattern)
  const stepCompletion = useMemo(() => {
    const completion: Record<number, { isComplete: boolean; progress: number }> = {};
    
    for (let step = 1; step <= 3; step++) {
      const isStepComplete = validateStep(step);
      completion[step] = {
        isComplete: isStepComplete,
        progress: isStepComplete ? 100 : 0
      };
    }
    
    return completion;
  }, [validateStep]);

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
    if (!touchedFields.includes(field as string)) return undefined;
    if (!waiverData) return undefined;
    
    const value = waiverData[field];
    if (typeof value === 'string' && !value.trim()) {
      return 'This field is required';
    }
    if (typeof value === 'boolean' && !value) {
      return 'This acknowledgment is required';
    }
    return undefined;
  }, [waiverData, touchedFields]);

  const getTotalProgress = useCallback(() => {
    return getCompletionPercentageValue();
  }, [getCompletionPercentageValue]);

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
    // Enhanced features matching profile pattern
    isLoading,
    error,
    hasUnsavedChanges,
    lastSaved: metadata.lastSaved,
    forceSave
  };
}; 