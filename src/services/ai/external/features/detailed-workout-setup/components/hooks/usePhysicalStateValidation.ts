import { useState, useCallback, useEffect, useMemo } from 'react';
import { ValidationResult } from '../../../../../../../types/core';
import { PerWorkoutOptions, CategoryRatingData } from '../../../../../../../types/core';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { TransformationContext } from '../../../../DataTransformer/core/TransformationContext';
import { useFormValidation } from '../../../../../../../hooks/useFormValidation';
import { useEnhancedPersistedState } from '../../../../../../../hooks/usePersistedState';
import { physicalStateSchema, PhysicalStateData } from '../validation/physicalStateSchema';
import { validateAndRecommend, handleValidation, Conflict, AIRecommendation } from '../validation/validationHandlers';

interface UsePhysicalStateValidationProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
}

export const usePhysicalStateValidation = ({
  options,
  onChange,
  onValidation,
  workoutFeature
}: UsePhysicalStateValidationProps) => {
  // Initialize persisted state with empty values
  const {
    state: persistedState,
    setState: setPersistedState,
    forceSave
  } = useEnhancedPersistedState<PhysicalStateData>('physical_state', {
    energy: undefined,
    energyCategories: undefined,
    soreness: [],
    injury: undefined,
    sleep: undefined,
    stress: undefined,
    trainingLoad: undefined,
    areas: [],
    restPeriods: undefined
  });

  // Form validation
  const { validate, validateField } = useFormValidation<PhysicalStateData>(physicalStateSchema);

  // Transformation context
  const transformationContext = useMemo(() => new TransformationContext(), []);

  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Sync persisted state with props using useEffect
  useEffect(() => {
    const newState = {
      energy: typeof options.customization_energy === 'number' ? options.customization_energy : undefined,
      energyCategories: typeof options.customization_energy === 'object'
        ? (options.customization_energy as CategoryRatingData)?.categories
        : undefined,
      soreness: options.customization_soreness || [],
      injury: typeof options.customization_injury === 'object'
        ? options.customization_injury as CategoryRatingData
        : undefined,
      sleep: typeof options.customization_sleep === 'object'
        ? options.customization_sleep as CategoryRatingData
        : undefined,
      stress: options.customization_stress,
      trainingLoad: options.customization_trainingLoad,
      areas: options.customization_areas || [],
      restPeriods: options.customization_restPeriods
    };

    setPersistedState(newState);
  }, [options, setPersistedState]);

  // Enhanced validation with required fields check
  const handleFieldValidation = useCallback((field: string, result: ValidationResult) => {
    handleValidation(field, result, validationResults, setValidationResults, onValidation);
  }, [validationResults, onValidation]);

  // Enhanced cross-field validation
  const runValidationAndRecommendations = useCallback(async () => {
    if (!options.customization_energy || !options.customization_soreness) return;

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

      const result = await validateAndRecommend(config);
      
      setConflicts(result.conflicts);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error in validation hook:', error);
      setConflicts([]);
      setRecommendations([]);
    } finally {
      setIsValidating(false);
    }
  }, [options, workoutFeature, onChange, transformationContext, persistedState, validate, validateField, forceSave]);

  // Run cross-field validation only when required fields change
  useEffect(() => {
    if (options.customization_energy && options.customization_soreness) {
      runValidationAndRecommendations();
    }
  }, [options.customization_energy, options.customization_soreness, runValidationAndRecommendations]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Handle recommendation application
  const handleRecommendationApply = useCallback((type: string, description: string) => {
    switch (type) {
      case 'modification':
        if (options.customization_energy) {
          const currentEnergy = typeof options.customization_energy === 'number'
            ? options.customization_energy
            : (options.customization_energy as CategoryRatingData).rating;

          const newEnergy = description.includes('increase')
            ? Math.min(10, currentEnergy + 1)
            : Math.max(1, currentEnergy - 1);

          if (validateField('energy', newEnergy)) {
            onChange('customization_energy', newEnergy);
          }
        }
        break;

      case 'alternative':
        if (description.includes('rest') && options.customization_restPeriods) {
          const newRestPeriod = description.includes('more') ? 'long' :
                               description.includes('less') ? 'short' : 'moderate';

          if (validateField('restPeriods', newRestPeriod)) {
            onChange('customization_restPeriods', newRestPeriod);
          }
        }
        break;

      default:
        console.warn('Unhandled recommendation type:', type);
    }
  }, [options.customization_energy, options.customization_restPeriods, onChange, validateField]);

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