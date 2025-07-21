import { useCallback, useMemo, useState, useEffect } from 'react';
import { useEnhancedPersistedState } from '../../../hooks/usePersistedState';
import { ProfileData, ProfileFormHookReturn } from '../types/profile.types';
import { logger } from '../../../utils/logger';

// Simplified MVP version - focus on core functionality
export const useProfileForm = (): ProfileFormHookReturn => {
  const {
    state: profileData,
    setState: setProfileData,
    metadata,
    hasUnsavedChanges,
    forceSave
  } = useEnhancedPersistedState<ProfileData | null>(
    'profileData', 
    null,
    { debounceDelay: 500 }
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Simple input change handler
  const handleInputChange = useCallback(async (field: keyof ProfileData, value: string | string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setProfileData(prev => {
        if (!prev) {
          // Initialize with just the field being set
          return { [field]: value } as ProfileData;
        }
        return {
          ...prev,
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
  }, [setProfileData]);

  // Simple array toggle handler
  const handleArrayToggle = useCallback(async (field: keyof ProfileData, value: string) => {
    try {
      setIsLoading(true);
      setError(null);

      setProfileData(prev => {
        if (!prev) {
          logger.warn('Attempted to toggle array field when profileData is null:', { field, value });
          return null;
        }
        
        const currentValue = prev[field];
        if (!Array.isArray(currentValue)) {
          return {
            ...prev,
            [field]: [value]
          };
        }
        
        const stringArray = currentValue as string[];
        const newArray = stringArray.includes(value)
          ? stringArray.filter(item => item !== value)
          : [...stringArray, value];
        
        return {
          ...prev,
          [field]: newArray
        };
      });
      
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
  }, [setProfileData]);

  const resetForm = useCallback(() => {
    setProfileData(null);
  }, [setProfileData]);

  // Simplified step validation - only check if required fields exist
  const validateStep = useCallback((step: number): boolean => {
    if (!profileData) return false;
    
    switch (step) {
      case 1:
        return !!(profileData.experienceLevel && profileData.physicalActivity);
      case 2:
        return !!(profileData.preferredDuration && profileData.timeCommitment && profileData.intensityLevel);
      case 3:
        return !!(profileData.preferredActivities?.length > 0 && profileData.availableLocations?.length > 0 && profileData.availableEquipment?.length > 0);
      case 4:
        return !!(profileData.primaryGoal && profileData.goalTimeline);
      case 5:
        return !!(profileData.age && profileData.gender && profileData.hasCardiovascularConditions && profileData.injuries?.length > 0);
      default:
        return false;
    }
  }, [profileData]);

  // Simple completion check
  const isComplete = useMemo(() => {
    return [1, 2, 3, 4, 5].every(step => validateStep(step));
  }, [validateStep]);

  // Simple completion percentage
  const getCompletionPercentageValue = useCallback(() => {
    if (!profileData) return 0;
    const completedSteps = [1, 2, 3, 4, 5].filter(step => validateStep(step)).length;
    return (completedSteps / 5) * 100;
  }, [profileData, validateStep]);

  // Simplified step completion - just track if each step is complete
  const stepCompletion = useMemo(() => {
    const completion: Record<number, { isComplete: boolean; progress: number }> = {};
    
    for (let step = 1; step <= 5; step++) {
      const isStepComplete = validateStep(step);
      completion[step] = {
        isComplete: isStepComplete,
        progress: isStepComplete ? 100 : 0
      };
    }
    
    return completion;
  }, [validateStep]);

  // Simple navigation
  const canProceedToNextStep = useCallback(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  const nextStep = useCallback(() => {
    if (canProceedToNextStep() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceedToNextStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const getFieldError = useCallback((field: keyof ProfileData) => {
    if (!touchedFields.includes(field as string)) return undefined;
    if (!profileData) return undefined;
    
    const value = profileData[field];
    if (typeof value === 'string' && !value.trim()) {
      return 'This field is required';
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'Please select at least one option';
    }
    return undefined;
  }, [profileData, touchedFields]);

  const getTotalProgress = useCallback(() => {
    return getCompletionPercentageValue();
  }, [getCompletionPercentageValue]);

  return {
    profileData: profileData,
    handleInputChange,
    handleArrayToggle,
    resetForm,
    isComplete,
    getCompletionPercentage: getCompletionPercentageValue,
    currentStep,
    touchedFields,
    stepCompletion,
    getFieldError,
    canProceedToNextStep,
    nextStep,
    prevStep,
    setStep,
    isProfileComplete: () => isComplete,
    getTotalProgress,
    isLoading,
    error,
    hasUnsavedChanges,
    lastSaved: metadata.lastSaved
  };
}; 