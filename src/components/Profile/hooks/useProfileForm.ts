import { useCallback, useMemo, useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { ProfileData, ProfileFormHookReturn } from '../types/profile.types';
import { getCompletionPercentage, defaultProfileData } from '../schemas/profileSchema';

export const useProfileForm = (): ProfileFormHookReturn => {
  const [profileData, setProfileData] = usePersistedState<ProfileData>(
    'profileData', 
    defaultProfileData
  );
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);

  const handleInputChange = useCallback((field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
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
  }, [setProfileData]);

  const handleArrayToggle = useCallback((field: keyof ProfileData, value: string) => {
    const currentArray = profileData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  }, [profileData, handleInputChange]);

  const resetForm = useCallback(() => {
    setProfileData(defaultProfileData);
  }, [setProfileData]);

  // Calculate completion status
  const isComplete = useMemo(() => {
    const requiredFields: (keyof ProfileData)[] = [
      'experienceLevel',
      'physicalActivity', 
      'preferredDuration',
      'timeCommitment',
      'intensityLevel',
      'workoutType',
      'primaryGoal',
      'goalTimeline',
      'age',
      'gender',
      'hasCardiovascularConditions'
    ];

    const requiredArrayFields: (keyof ProfileData)[] = [
      'preferredActivities',
      'availableEquipment',
      'injuries'
    ];

    // Check required string fields
    const stringFieldsComplete = requiredFields.every(field => {
      const value = profileData[field] as string;
      return value && value.trim().length > 0;
    });

    // Check required array fields (must have at least one item)
    const arrayFieldsComplete = requiredArrayFields.every(field => {
      const value = profileData[field] as string[];
      return Array.isArray(value) && value.length > 0;
    });

    // Check height and weight (optional but if started, should be completed)
    const heightWeight = profileData.height && profileData.weight;

    return stringFieldsComplete && arrayFieldsComplete && heightWeight;
  }, [profileData]);

  const getCompletionPercentageValue = useCallback(() => {
    return getCompletionPercentage(profileData);
  }, [profileData]);

  // Step validation logic
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.experienceLevel && profileData.physicalActivity);
      case 2:
        return !!(profileData.preferredDuration && profileData.timeCommitment && profileData.intensityLevel);
      case 3:
        return !!(profileData.workoutType && profileData.preferredActivities.length > 0 && profileData.availableEquipment.length > 0);
      case 4:
        return !!(profileData.primaryGoal && profileData.goalTimeline);
      case 5:
        return !!(profileData.age && profileData.gender && profileData.hasCardiovascularConditions);
      default:
        return false;
    }
  }, [profileData]);

  // Step completion status
  const stepCompletion = useMemo(() => {
    const completion: Record<number, { isComplete: boolean; progress: number }> = {};
    
    for (let step = 1; step <= 5; step++) {
      const isComplete = validateStep(step);
      completion[step] = {
        isComplete,
        progress: isComplete ? 100 : 0
      };
    }
    
    return completion;
  }, [validateStep]);

  // Navigation functions
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

  const getFieldError = useCallback((field: keyof ProfileData) => {
    // Simple validation - you can enhance this with more specific error messages
    if (!touchedFields.includes(field as string)) return undefined;
    
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
    const completedSteps = Object.values(stepCompletion).filter(s => s.isComplete).length;
    return (completedSteps / 5) * 100;
  }, [stepCompletion]);

  return {
    profileData,
    handleInputChange,
    handleArrayToggle,
    resetForm,
    isComplete: isComplete === 'complete',
    getCompletionPercentage: getCompletionPercentageValue,
    currentStep,
    touchedFields,
    stepCompletion,
    getFieldError,
    canProceedToNextStep,
    nextStep,
    prevStep,
    isProfileComplete: () => isComplete === 'complete',
    getTotalProgress
  };
}; 