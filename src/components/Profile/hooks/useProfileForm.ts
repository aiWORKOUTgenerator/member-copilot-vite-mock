import { useCallback, useMemo, useState, useEffect } from 'react';
import { useEnhancedPersistedState } from '../../../hooks/usePersistedState';
import { ProfileData, ProfileFormHookReturn } from '../types/profile.types';
import { calculateCompletionPercentage } from '../utils/profileHelpers';
import { migrateProfileData } from '../../../utils/migrationUtils';

// Default profile data with proper default values
const defaultProfileData: ProfileData = {
  experienceLevel: 'New to Exercise',
  physicalActivity: 'sedentary',
  preferredDuration: '30-45 min',
  timeCommitment: '2-3',
  intensityLevel: 'lightly',
  preferredActivities: [],
  availableLocations: [],
  availableEquipment: [],
  primaryGoal: 'General Health',
  goalTimeline: '3 months',
  age: '26-35',
  height: '',
  weight: '',
  gender: 'prefer-not-to-say',
  hasCardiovascularConditions: 'No',
  injuries: ['No Injuries']
};

export const useProfileForm = (): ProfileFormHookReturn => {
  const {
    state: rawProfileData,
    setState: setProfileData,
    metadata,
    hasUnsavedChanges,
    forceSave
  } = useEnhancedPersistedState<ProfileData>(
    'profileData', 
    defaultProfileData,
    { debounceDelay: 500 } // Faster debounce for better responsiveness
  );

  // Ensure profile data is properly migrated
  const profileData = useMemo(() => migrateProfileData(rawProfileData), [rawProfileData]);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = useCallback(async (field: keyof ProfileData, value: string | string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while updating the form'));
    } finally {
      setIsLoading(false);
    }
  }, [setProfileData]);

  const handleArrayToggle = useCallback(async (field: keyof ProfileData, value: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentArray = profileData[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      await handleInputChange(field, newArray);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while updating the form'));
    } finally {
      setIsLoading(false);
    }
  }, [profileData, handleInputChange]);

  const resetForm = useCallback(() => {
    setProfileData(defaultProfileData);
  }, [setProfileData]);

  // Step validation logic
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.experienceLevel && profileData.physicalActivity);
      case 2:
        return !!(profileData.preferredDuration && profileData.timeCommitment && profileData.intensityLevel);
      case 3:
        return !!(profileData.preferredActivities.length > 0 && profileData.availableLocations.length > 0 && profileData.availableEquipment.length > 0);
      case 4:
        return !!(profileData.primaryGoal && profileData.goalTimeline);
      case 5:
        return !!(profileData.age && profileData.gender && profileData.hasCardiovascularConditions && profileData.injuries.length > 0);
      default:
        return false;
    }
  }, [profileData]);

  // Calculate completion status
  const isComplete = useMemo(() => {
    // Use step validation to determine completion
    return [1, 2, 3, 4, 5].every(step => validateStep(step));
  }, [validateStep]);

  const getCompletionPercentageValue = useCallback(() => {
    return calculateCompletionPercentage(profileData);
  }, [profileData]);

  // Step completion status
  const stepCompletion = useMemo(() => {
    const completion: Record<number, { isComplete: boolean; progress: number }> = {};
    
    // Define fields for each step
    const stepFields = {
      1: ['experienceLevel', 'physicalActivity'],
      2: ['preferredDuration', 'timeCommitment', 'intensityLevel'],
      3: ['preferredActivities', 'availableLocations', 'availableEquipment'],
      4: ['primaryGoal', 'goalTimeline'],
      5: ['age', 'gender', 'hasCardiovascularConditions', 'injuries']
    };

    for (let step = 1; step <= 5; step++) {
      const fields = stepFields[step as keyof typeof stepFields];
      let completedFields = 0;

      fields.forEach(field => {
        const value = profileData[field as keyof ProfileData];
        if (Array.isArray(value)) {
          if (value.length > 0) completedFields++;
        } else if (typeof value === 'string') {
          if (value.trim().length > 0) completedFields++;
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
  }, [profileData, validateStep]);

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

  const setStep = useCallback((step: number) => {
    // Validate all steps up to the target step
    const canNavigate = Array.from({ length: step }, (_, i) => i + 1)
      .every(s => validateStep(s));
    
    if (canNavigate) {
      setCurrentStep(step + 1); // +1 because step is 0-based index from SectionNavigation
    }
  }, [validateStep]);

  const handleStepChange = useCallback((step: number) => {
    forceSave(); // Force save before changing steps
    setStep(step);
  }, [forceSave, setStep]);

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
    isComplete,
    getCompletionPercentage: getCompletionPercentageValue,
    currentStep,
    touchedFields,
    stepCompletion,
    getFieldError,
    canProceedToNextStep,
    nextStep,
    prevStep,
    setStep: handleStepChange,
    isProfileComplete: () => isComplete,
    getTotalProgress,
    isLoading,
    error,
    hasUnsavedChanges,
    lastSaved: metadata.lastSaved
  };
}; 