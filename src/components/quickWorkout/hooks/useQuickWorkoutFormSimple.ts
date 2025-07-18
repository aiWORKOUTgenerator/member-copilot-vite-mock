import { useState, useMemo } from 'react';
import { useViewModePreference } from '../../../hooks/useViewModePreference';

// Simple, clean types for quick workout
export interface QuickWorkoutFormData {
  workoutFocus: string;
  workoutDuration: number;
  energyLevel: number;
  sorenessLevel: number;
}

// Valid options
export const VALID_FOCUS_OPTIONS = [
  'Energizing Boost',
  'Improve Posture', 
  'Stress Reduction',
  'Quick Sweat',
  'Gentle Recovery & Mobility',
  'Core & Abs Focus'
];

export const VALID_DURATION_OPTIONS = [5, 10, 15, 20, 30, 45];

// Initial state - clearly invalid
const INITIAL_STATE: QuickWorkoutFormData = {
  workoutFocus: '',
  workoutDuration: 0,
  energyLevel: 0,
  sorenessLevel: 0
};

// Simple validation function
function validateQuickWorkoutForm(data: QuickWorkoutFormData): boolean {
  // Check each field explicitly
  const isValidFocus = VALID_FOCUS_OPTIONS.includes(data.workoutFocus);
  const isValidDuration = VALID_DURATION_OPTIONS.includes(data.workoutDuration);
  const isValidEnergy = data.energyLevel >= 1 && data.energyLevel <= 5;
  const isValidSoreness = data.sorenessLevel >= 1 && data.sorenessLevel <= 10;
  
  // Debug logging
  console.log('Validation check:', {
    data,
    isValidFocus,
    isValidDuration,
    isValidEnergy,
    isValidSoreness,
    overall: isValidFocus && isValidDuration && isValidEnergy && isValidSoreness
  });
  
  return isValidFocus && isValidDuration && isValidEnergy && isValidSoreness;
}

export const useQuickWorkoutFormSimple = () => {
  const [formData, setFormData] = useState<QuickWorkoutFormData>(INITIAL_STATE);
  const [viewMode, toggleViewMode, setViewMode] = useViewModePreference({
    key: 'quickWorkout',
    defaultMode: 'complex'
  });

  const handleInputChange = (field: keyof QuickWorkoutFormData, value: string | number) => {
    console.log('Input change:', { field, value, type: typeof value });
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = useMemo(() => {
    return validateQuickWorkoutForm(formData);
  }, [formData]);

  return {
    formData,
    viewMode,
    handleInputChange,
    toggleViewMode,
    setViewMode,
    isFormValid,
    // For backward compatibility
    focusData: formData
  };
}; 