import { useState, useEffect } from 'react';
import { ViewMode } from '../components/quickWorkout/types/quick-workout.types';

interface ViewModePreferenceOptions {
  key: string;
  defaultMode?: ViewMode;
}

/**
 * A reusable hook for managing view mode preferences across the application
 * @param options Configuration options for the view mode preference
 * @param options.key Unique identifier for storing the preference
 * @param options.defaultMode Initial view mode if no preference is stored
 * @returns [currentViewMode, toggleViewMode, setViewMode]
 */
export const useViewModePreference = ({ 
  key, 
  defaultMode = 'complex' 
}: ViewModePreferenceOptions): [
  ViewMode, 
  () => void,
  (mode: ViewMode) => void
] => {
  // Initialize with defaultMode, but will be updated from storage in useEffect
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);
  const storageKey = `viewMode_${key}`;

  useEffect(() => {
    // Check if user has a stored preference
    const storedPreference = localStorage.getItem(storageKey);
    
    // Only update if there's a stored preference
    if (storedPreference === 'simple' || storedPreference === 'complex') {
      setViewMode(storedPreference);
    }
  }, [storageKey]);

  const toggleViewMode = () => {
    const newMode = viewMode === 'complex' ? 'simple' : 'complex';
    setViewMode(newMode);
    localStorage.setItem(storageKey, newMode);
  };

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  return [viewMode, toggleViewMode, updateViewMode];
}; 