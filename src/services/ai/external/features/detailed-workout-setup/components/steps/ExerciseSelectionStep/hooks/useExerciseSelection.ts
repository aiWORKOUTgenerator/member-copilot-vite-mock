import { useCallback, useMemo } from 'react';

interface UseExerciseSelectionProps {
  selectedInclude: string[];
  selectedExclude: string[];
  onChange: (key: string | number | symbol, value: unknown) => void;
  disabled?: boolean;
}

interface UseExerciseSelectionReturn {
  // Selection handlers
  handleExerciseToggle: (exerciseId: string, selectionType: 'include' | 'exclude') => void;
  handleIncludeChange: (exercises: string[]) => void;
  handleExcludeChange: (exercises: string[]) => void;
  clearAll: (type: 'include' | 'exclude') => void;
  
  // Selection state queries
  isExerciseSelected: (exerciseId: string, type: 'include' | 'exclude') => boolean;
  hasConflicts: boolean;
  conflictingExercises: string[];
  
  // Selection metadata
  totalSelected: number;
  includeCount: number;
  excludeCount: number;
}

export const useExerciseSelection = ({
  selectedInclude,
  selectedExclude,
  onChange,
  disabled = false
}: UseExerciseSelectionProps): UseExerciseSelectionReturn => {
  
  // Handle exercise selection/deselection
  const handleExerciseToggle = useCallback((exerciseId: string, listType: 'include' | 'exclude') => {
    if (disabled) return;

    if (listType === 'include') {
      const currentSelected = selectedInclude || [];
      const newSelected = currentSelected.includes(exerciseId)
        ? currentSelected.filter(id => id !== exerciseId)
        : [...currentSelected, exerciseId];
      
      onChange('customization_include', newSelected);
      
      // Remove from exclude list if adding to include
      if (!currentSelected.includes(exerciseId)) {
        const currentExcluded = selectedExclude || [];
        const newExcluded = currentExcluded.filter(id => id !== exerciseId);
        onChange('customization_exclude', newExcluded);
      }
    } else {
      const currentSelected = selectedExclude || [];
      const newSelected = currentSelected.includes(exerciseId)
        ? currentSelected.filter(id => id !== exerciseId)
        : [...currentSelected, exerciseId];
      
      onChange('customization_exclude', newSelected);
      
      // Remove from include list if adding to exclude
      if (!currentSelected.includes(exerciseId)) {
        const currentIncluded = selectedInclude || [];
        const newIncluded = currentIncluded.filter(id => id !== exerciseId);
        onChange('customization_include', newIncluded);
      }
    }
  }, [selectedInclude, selectedExclude, onChange, disabled]);

  // Handle bulk include changes
  const handleIncludeChange = useCallback((exercises: string[]) => {
    if (disabled) return;
    
    // Remove any exercises from exclude list that are being included
    const currentExcluded = selectedExclude || [];
    const newExcluded = currentExcluded.filter(id => !exercises.includes(id));
    
    onChange('customization_include', exercises);
    if (newExcluded.length !== currentExcluded.length) {
      onChange('customization_exclude', newExcluded);
    }
  }, [selectedExclude, onChange, disabled]);

  // Handle bulk exclude changes
  const handleExcludeChange = useCallback((exercises: string[]) => {
    if (disabled) return;
    
    // Remove any exercises from include list that are being excluded
    const currentIncluded = selectedInclude || [];
    const newIncluded = currentIncluded.filter(id => !exercises.includes(id));
    
    onChange('customization_exclude', exercises);
    if (newIncluded.length !== currentIncluded.length) {
      onChange('customization_include', newIncluded);
    }
  }, [selectedInclude, onChange, disabled]);

  // Clear all exercises from specified list
  const clearAll = useCallback((type: 'include' | 'exclude') => {
    if (disabled) return;
    
    if (type === 'include') {
      onChange('customization_include', []);
    } else {
      onChange('customization_exclude', []);
    }
  }, [onChange, disabled]);

  // Check if exercise is selected in specified list
  const isExerciseSelected = useCallback((exerciseId: string, type: 'include' | 'exclude'): boolean => {
    if (type === 'include') {
      return (selectedInclude || []).includes(exerciseId);
    } else {
      return (selectedExclude || []).includes(exerciseId);
    }
  }, [selectedInclude, selectedExclude]);

  // Calculate conflicts (exercises in both lists - shouldn't happen with current logic)
  const conflictingExercises = useMemo(() => {
    const include = selectedInclude || [];
    const exclude = selectedExclude || [];
    return include.filter(id => exclude.includes(id));
  }, [selectedInclude, selectedExclude]);

  // Check if there are any conflicts
  const hasConflicts = useMemo(() => {
    return conflictingExercises.length > 0;
  }, [conflictingExercises]);

  // Calculate selection metadata
  const includeCount = useMemo(() => (selectedInclude || []).length, [selectedInclude]);
  const excludeCount = useMemo(() => (selectedExclude || []).length, [selectedExclude]);
  const totalSelected = useMemo(() => includeCount + excludeCount, [includeCount, excludeCount]);

  return {
    // Selection handlers
    handleExerciseToggle,
    handleIncludeChange,
    handleExcludeChange,
    clearAll,
    
    // Selection state queries
    isExerciseSelected,
    hasConflicts,
    conflictingExercises,
    
    // Selection metadata
    totalSelected,
    includeCount,
    excludeCount
  };
}; 