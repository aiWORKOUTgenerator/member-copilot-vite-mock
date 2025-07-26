import { useState, useCallback, useEffect, useMemo } from 'react';
import { ValidationResult } from '../../../../../../../types/core';
import { PerWorkoutOptions } from '../../../../../../../types/core';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { TransformationContext } from '../../../../DataTransformer/core/TransformationContext';
import { useFormValidation } from '../../../../../../../hooks/useFormValidation';
import { useEnhancedPersistedState } from '../../../../../../../hooks/usePersistedState';
import { exerciseSelectionSchema, ExerciseSelectionData } from '../validation/exerciseSelectionSchema';
import { 
  validateExerciseSelection, 
  handleExerciseSelectionValidation, 
  ExerciseSelectionConflict, 
  ExerciseSelectionRecommendation 
} from '../validation/exerciseSelectionValidationHandlers';

interface UseExerciseSelectionValidationProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
}

export const useExerciseSelectionValidation = ({
  options,
  onChange,
  onValidation,
  workoutFeature
}: UseExerciseSelectionValidationProps) => {
  // Initialize persisted state with empty values
  const {
    state: persistedState,
    setState: setPersistedState,
    forceSave
  } = useEnhancedPersistedState<ExerciseSelectionData>('exercise_selection', {
    include: [],
    exclude: [],
    focus: undefined,
    equipment: [],
    duration: undefined
  });

  // Form validation
  const { validate, validateField } = useFormValidation<ExerciseSelectionData>(exerciseSelectionSchema);

  // Transformation context
  const transformationContext = useMemo(() => new TransformationContext(), []);

  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<ExerciseSelectionConflict[]>([]);
  const [recommendations, setRecommendations] = useState<ExerciseSelectionRecommendation[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Sync persisted state with props using useEffect
  useEffect(() => {
    const newState = {
      include: options.customization_include as string[] || [],
      exclude: options.customization_exclude as string[] || [],
      focus: options.customization_focus,
      equipment: options.customization_equipment as string[] || [],
      duration: options.customization_duration
    };

    setPersistedState(newState);
  }, [options, setPersistedState]);

  // Enhanced validation with required fields check
  const handleFieldValidation = useCallback((field: string, result: ValidationResult) => {
    handleExerciseSelectionValidation(field, result, validationResults, setValidationResults, onValidation);
  }, [validationResults, onValidation]);

  // Enhanced cross-field validation
  const runValidationAndRecommendations = useCallback(async () => {
    if (!options.customization_focus || !options.customization_equipment) return;

    try {
      setIsValidating(true);
      
      const config = {
        options,
        workoutFeature,
        onChange,
        transformationContext,
        persistedState,
        validate,
        validateField,
        forceSave
      };

      const result = await validateExerciseSelection(config);
      
      setConflicts(result.conflicts);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error in exercise selection validation hook:', error);
      setConflicts([]);
      setRecommendations([]);
    } finally {
      setIsValidating(false);
    }
  }, [options, workoutFeature, onChange, transformationContext, persistedState, validate, validateField, forceSave]);

  // Run cross-field validation when required fields change
  useEffect(() => {
    if (options.customization_focus && options.customization_equipment) {
      runValidationAndRecommendations();
    }
  }, [options.customization_focus, options.customization_equipment, runValidationAndRecommendations]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Handle recommendation application
  const handleRecommendationApply = useCallback((type: string, description: string) => {
    switch (type) {
      case 'form':
        if (description.includes('Add') && description.includes('exercises')) {
          const focus = typeof options.customization_focus === 'string' 
            ? options.customization_focus 
            : options.customization_focus?.focus;
          
          if (focus) {
            // This would trigger adding focus-based exercises
            console.log('Applying form recommendation for focus:', focus);
          }
        }
        break;

      case 'modification':
        if (description.includes('Resolve conflicts')) {
          // This would trigger conflict resolution
          console.log('Applying modification recommendation');
        }
        break;

      case 'progression':
        if (description.includes('adding more exercises')) {
          // This would suggest adding more exercises
          console.log('Applying progression recommendation');
        }
        break;

      default:
        console.warn('Unhandled recommendation type:', type);
    }
  }, [options.customization_focus]);

  return {
    // State
    validationResults,
    conflicts,
    recommendations,
    isValidating,
    persistedState,
    
    // Handlers
    handleFieldValidation,
    handleConflictDismiss,
    handleRecommendationApply,
    
    // Validation functions
    validate,
    validateField,
    
    // Persistence
    forceSave
  };
}; 