import { useState, useMemo } from 'react';
import { WorkoutFocusData, defaultWorkoutFocusData, quickWorkoutSchema } from '../../../schemas/workoutFocusSchema';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { useViewModePreference } from '../../../hooks/useViewModePreference';

export const useQuickWorkoutForm = () => {
  const [focusData, setFocusData] = useState<WorkoutFocusData>(defaultWorkoutFocusData);
  const [viewMode, toggleViewMode, setViewMode] = useViewModePreference({
    key: 'quickWorkout',
    defaultMode: 'complex'
  });
  const { validate } = useFormValidation(quickWorkoutSchema);

  const handleInputChange = (field: keyof WorkoutFocusData, value: string | number) => {
    setFocusData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = useMemo(() => {
    return validate(focusData);
  }, [validate, focusData]);

  return {
    focusData,
    viewMode,
    handleInputChange,
    toggleViewMode,
    setViewMode,
    isFormValid
  };
}; 