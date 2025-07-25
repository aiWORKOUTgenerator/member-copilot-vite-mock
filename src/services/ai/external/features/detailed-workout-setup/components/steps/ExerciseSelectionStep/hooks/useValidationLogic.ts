import { useState, useCallback, useEffect, useMemo } from 'react';
import { PerWorkoutOptions } from 'src/types/core';
import { DetailedWorkoutFeature } from '../../../../DetailedWorkoutFeature';
import { EXERCISE_DATABASE } from '../constants';

// Type definition for validation conflicts returned by DetailedWorkoutFeature
interface ValidationConflict {
  message: string;
  severity?: 'high' | 'medium' | 'low';
  fields?: string[];
  suggestion?: {
    label: string;
    changes?: Record<string, unknown>;
  };
}

interface ConflictItem {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  affectedFields: string[];
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  conflicts: ConflictItem[];
}

interface UseValidationLogicProps {
  selectedInclude: string[];
  selectedExclude: string[];
  options: PerWorkoutOptions;
  workoutFeature: DetailedWorkoutFeature;
  availableEquipment: string[];
  onValidation?: (isValid: boolean) => void;
}

interface UseValidationLogicReturn {
  // Validation state
  validationResults: Record<string, ValidationResult>;
  conflicts: ConflictItem[];
  isValid: boolean;
  
  // Validation actions
  validateSelections: () => Promise<void>;
  dismissConflict: (conflictId: string) => void;
  resolveConflict: (conflictId: string) => void;
  
  // Real-time validation
  hasSelectionConflicts: boolean;
  hasEquipmentConflicts: boolean;
  hasEnergyConflicts: boolean;
}

export const useValidationLogic = ({
  selectedInclude,
  selectedExclude,
  options,
  workoutFeature,
  availableEquipment,
  onValidation
}: UseValidationLogicProps): UseValidationLogicReturn => {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  // Validate and generate recommendations
  const validateSelections = useCallback(async () => {
    try {
      // Validate exercise selections
      const validationResult = await workoutFeature.validateExerciseSelections({
        include: selectedInclude,
        exclude: selectedExclude,
        focus: options.customization_focus,
        equipment: availableEquipment,
        duration: options.customization_duration
      });

      // Update conflicts based on validation result
      if (!validationResult.isValid && validationResult.details?.conflicts) {
        const newConflicts = validationResult.details.conflicts.map((conflict: ValidationConflict, index: number) => ({
          id: `exercise-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => {
              if (conflict.suggestion?.changes) {
                Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                  // This would need to be handled by the parent component
                  console.log('Suggested change:', key, value);
                });
              }
            }
          } : undefined
        }));
        setConflicts(newConflicts);
      } else {
        setConflicts([]);
      }

      // Update validation results
      setValidationResults(prev => ({
        ...prev,
        include: {
          isValid: validationResult.isValid,
          message: validationResult.message,
          conflicts: conflicts
        }
      }));

      // Notify parent of validation status
      if (onValidation) {
        onValidation(validationResult.isValid);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setConflicts([{
        id: 'validation-error',
        message: 'Failed to validate selections. Please try again.',
        severity: 'high',
        affectedFields: []
      }]);
      
      if (onValidation) {
        onValidation(false);
      }
    }
  }, [selectedInclude, selectedExclude, options, workoutFeature, availableEquipment, onValidation, conflicts]);

  // Dismiss a specific conflict
  const dismissConflict = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
  }, []);

  // Resolve a conflict by applying suggested action
  const resolveConflict = useCallback((conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (conflict?.suggestedAction) {
      conflict.suggestedAction.action();
      dismissConflict(conflictId);
    }
  }, [conflicts, dismissConflict]);

  // Check for basic selection conflicts (include/exclude overlap)
  const hasSelectionConflicts = useCallback(() => {
    const include = selectedInclude || [];
    const exclude = selectedExclude || [];
    return include.some(id => exclude.includes(id));
  }, [selectedInclude, selectedExclude]);

  // Check for equipment conflicts
  const hasEquipmentConflicts = useCallback(() => {
    if (!availableEquipment || availableEquipment.length === 0) return false;
    
    const selectedExercises = EXERCISE_DATABASE.filter(ex => 
      selectedInclude.includes(ex.id)
    );
    
    return selectedExercises.some(exercise => {
      if (exercise.equipment.length === 0) return false; // Bodyweight exercises are always available
      return !exercise.equipment.some(eq => availableEquipment.includes(eq));
    });
  }, [selectedInclude, availableEquipment]);

  // Check for energy level conflicts
  const hasEnergyConflicts = useCallback(() => {
    const energyLevel = options.customization_energy;
    if (!energyLevel) return false;
    
    const selectedExercises = EXERCISE_DATABASE.filter(ex => 
      selectedInclude.includes(ex.id)
    );
    
    // Check if high-intensity exercises are selected with low energy
    const hasHighIntensity = selectedExercises.some(ex => 
      ex.difficulty === 'advanced' || 
      ex.category === 'Cardio' ||
      ex.name.toLowerCase().includes('jump') ||
      ex.name.toLowerCase().includes('sprint')
    );
    
    // Extract rating from CategoryRatingData and compare as number
    const energyRating = typeof energyLevel === 'object' && energyLevel !== null ? energyLevel.rating : energyLevel;
    return energyRating <= 2 && hasHighIntensity;
  }, [selectedInclude, options.customization_energy]);

  // Auto-validate when selections change
  useEffect(() => {
    validateSelections();
  }, [selectedInclude, selectedExclude, validateSelections]);

  // Calculate overall validation status
  const isValid = useMemo(() => {
    return conflicts.length === 0 && 
           !hasSelectionConflicts() && 
           !hasEquipmentConflicts() && 
           !hasEnergyConflicts();
  }, [conflicts, hasSelectionConflicts, hasEquipmentConflicts, hasEnergyConflicts]);

  return {
    // Validation state
    validationResults,
    conflicts,
    isValid,
    
    // Validation actions
    validateSelections,
    dismissConflict,
    resolveConflict,
    
    // Real-time validation
    hasSelectionConflicts: hasSelectionConflicts(),
    hasEquipmentConflicts: hasEquipmentConflicts(),
    hasEnergyConflicts: hasEnergyConflicts()
  };
}; 