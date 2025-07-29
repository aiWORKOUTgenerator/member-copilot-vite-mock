import { useState, useMemo } from 'react';
import { WorkoutFocusData, defaultWorkoutFocusData } from '../../../schemas/workoutFocusSchema';
import { useViewModePreference } from '../../../hooks/useViewModePreference';
import { aiLogger } from '../../../services/ai/logging/AILogger';

export const useQuickWorkoutForm = () => {
  const [focusData, setFocusData] = useState<WorkoutFocusData>(defaultWorkoutFocusData);
  const [viewMode, toggleViewMode, setViewMode] = useViewModePreference({
    key: 'quickWorkout',
    defaultMode: 'complex'
  });

  const handleInputChange = (field: keyof WorkoutFocusData, value: string | number) => {
    aiLogger.debug('Form input change:', { field, value, type: typeof value });
    setFocusData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = useMemo(() => {
    try {
      // Simple, direct validation of required fields
      const requiredFields = {
        workoutFocus: focusData.workoutFocus !== '',
        workoutDuration: typeof focusData.workoutDuration === 'number' && focusData.workoutDuration >= 5 && focusData.workoutDuration <= 45,
        energyLevel: typeof focusData.energyLevel === 'number' && focusData.energyLevel >= 1 && focusData.energyLevel <= 10,
        sorenessLevel: typeof focusData.sorenessLevel === 'number' && focusData.sorenessLevel >= 1 && focusData.sorenessLevel <= 10
      };

      // Log validation state for debugging
      aiLogger.debug('Form validation state:', {
        focusData,
        requiredFields,
        allFieldsValid: Object.values(requiredFields).every(isValid => isValid)
      });

      return Object.values(requiredFields).every(isValid => isValid);
    } catch (error) {
      // logger.error('Error validating quick workout form:', error); // This line was removed as per the new_code
      return false;
    }
  }, [focusData]);

  return {
    focusData,
    viewMode,
    handleInputChange,
    toggleViewMode,
    setViewMode,
    isFormValid
  };
}; 