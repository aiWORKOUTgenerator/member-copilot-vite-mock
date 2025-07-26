import { ValidationResult } from '../../../../../../../types/core';
import { PerWorkoutOptions } from '../../../../../../../types/core';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { TransformationContext } from '../../../../DataTransformer/core/TransformationContext';
import { VALIDATION_RULES, EXERCISE_SELECTION_REQUIRED_FIELDS } from './validationRules';
import { ExerciseSelectionData } from './exerciseSelectionSchema';
import { EXERCISE_DATABASE } from '../steps/ExerciseSelectionStep/constants';

export interface ExerciseSelectionConflict {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  affectedFields: string[];
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

export interface ExerciseSelectionRecommendation {
  type: 'form' | 'progression' | 'modification' | 'alternative';
  description: string;
  priority: 'low' | 'medium' | 'high';
  context?: Record<string, any>;
}

export interface ExerciseSelectionValidationConfig {
  options: PerWorkoutOptions;
  workoutFeature: DetailedWorkoutFeature;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  transformationContext: TransformationContext;
  persistedState: ExerciseSelectionData;
  validate: (data: ExerciseSelectionData) => boolean;
  validateField: (field: keyof ExerciseSelectionData, value: any) => boolean;
  forceSave: () => void;
}

export interface ExerciseSelectionValidationResult {
  conflicts: ExerciseSelectionConflict[];
  recommendations: ExerciseSelectionRecommendation[];
  isValid: boolean;
}

// Enhanced exercise selection validation
export const validateExerciseSelection = async (
  config: ExerciseSelectionValidationConfig
): Promise<ExerciseSelectionValidationResult> => {
  const {
    options,
    workoutFeature,
    onChange,
    transformationContext,
    persistedState,
    validate,
    validateField,
    forceSave
  } = config;

  // Check if required fields are present
  if (!options.customization_focus || !options.customization_equipment) {
    return { conflicts: [], recommendations: [], isValid: false };
  }

  try {
    // Validate exercise selections using DetailedWorkoutFeature
    const validationResult = await workoutFeature.validateExerciseSelections({
      include: options.customization_include as string[],
      exclude: options.customization_exclude as string[],
      focus: options.customization_focus,
      equipment: options.customization_equipment as string[],
      duration: options.customization_duration
    });

    let conflicts: ExerciseSelectionConflict[] = [];
    let recommendations: ExerciseSelectionRecommendation[] = [];

    // Process validation conflicts
    if (!validationResult.isValid && validationResult.details?.conflicts) {
      conflicts = validationResult.details.conflicts.map((conflict: {
        message: string;
        severity?: 'high' | 'medium' | 'low';
        fields?: string[];
        suggestion?: {
          label: string;
          changes?: Record<string, unknown>;
        };
      }, index: number) => ({
        id: `exercise-conflict-${index}`,
        message: conflict.message,
        severity: conflict.severity || 'medium',
        affectedFields: conflict.fields || [],
        suggestedAction: conflict.suggestion ? {
          label: conflict.suggestion.label,
          action: () => {
            if (conflict.suggestion?.changes) {
              Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                const transformedValue = transformationContext.getState(key) || value;
                const rule = VALIDATION_RULES[key as keyof typeof VALIDATION_RULES];

                if (rule) {
                  const isValid = validateField(key as keyof ExerciseSelectionData, transformedValue);
                  if (isValid) {
                    onChange(key as keyof PerWorkoutOptions, transformedValue as PerWorkoutOptions[keyof PerWorkoutOptions]);
                  }
                } else {
                  onChange(key as keyof PerWorkoutOptions, transformedValue as PerWorkoutOptions[keyof PerWorkoutOptions]);
                }
              });
            }
          }
        } : undefined
      }));
    }

    // Generate additional conflicts based on business logic
    const additionalConflicts = generateBusinessLogicConflicts(options);
    conflicts = [...conflicts, ...additionalConflicts];

    // Generate recommendations
    recommendations = generateRecommendations(options, conflicts);

    // Validate full state
    const isValid = validate(persistedState);
    if (isValid) {
      forceSave();
    }

    return { conflicts, recommendations, isValid };
  } catch (error) {
    console.error('Error validating exercise selection:', error);
    return { conflicts: [], recommendations: [], isValid: false };
  }
};

// Generate business logic conflicts
const generateBusinessLogicConflicts = (options: PerWorkoutOptions): ExerciseSelectionConflict[] => {
  const conflicts: ExerciseSelectionConflict[] = [];
  const include = options.customization_include as string[] || [];
  const exclude = options.customization_exclude as string[] || [];
  const equipment = options.customization_equipment as string[] || [];

  // Check for include/exclude conflicts
  const conflictingExercises = include.filter(id => exclude.includes(id));
  if (conflictingExercises.length > 0) {
    conflicts.push({
      id: 'include-exclude-conflict',
      message: `Cannot both include and exclude: ${conflictingExercises.join(', ')}`,
      severity: 'high',
      affectedFields: ['customization_include', 'customization_exclude'],
      suggestedAction: {
        label: 'Remove from exclude list',
        action: () => {
          const newExclude = exclude.filter(id => !conflictingExercises.includes(id));
          // This would need to be handled by the parent component
          console.log('Suggested change: remove from exclude', newExclude);
        }
      }
    });
  }

  // Check for equipment conflicts
  const selectedExercises = EXERCISE_DATABASE.filter(ex => include.includes(ex.id));
  const equipmentConflicts = selectedExercises.filter(exercise => {
    if (exercise.equipment.length === 0) return false; // Bodyweight exercises are always available
    return !exercise.equipment.some(eq => equipment.includes(eq));
  });

  if (equipmentConflicts.length > 0) {
    conflicts.push({
      id: 'equipment-conflict',
      message: `Selected exercises require equipment not available: ${equipmentConflicts.map(ex => ex.name).join(', ')}`,
      severity: 'medium',
      affectedFields: ['customization_include', 'customization_equipment'],
      suggestedAction: {
        label: 'Remove incompatible exercises',
        action: () => {
          const compatibleExercises = include.filter(id => 
            !equipmentConflicts.some(ex => ex.id === id)
          );
          console.log('Suggested change: remove incompatible exercises', compatibleExercises);
        }
      }
    });
  }

  return conflicts;
};

// Generate AI recommendations
const generateRecommendations = (
  options: PerWorkoutOptions, 
  conflicts: ExerciseSelectionConflict[]
): ExerciseSelectionRecommendation[] => {
  const recommendations: ExerciseSelectionRecommendation[] = [];
  const include = options.customization_include as string[] || [];
  const focus = options.customization_focus;

  // Generate recommendations based on conflicts
  const highSeverityConflicts = conflicts.filter(conflict => conflict.severity === 'high');
  if (highSeverityConflicts.length > 0) {
    recommendations.push({
      type: 'modification',
      description: 'Resolve conflicts to improve workout compatibility',
      priority: 'high',
      context: { conflicts: highSeverityConflicts }
    });
  }

  // Generate recommendations based on focus
  if (focus && include.length === 0) {
    const focusString = typeof focus === 'string' ? focus : focus.focus;
    const focusExercises = EXERCISE_DATABASE.filter(ex => 
      ex.category.toLowerCase().includes(focusString.toLowerCase())
    );
    
    if (focusExercises.length > 0) {
      recommendations.push({
        type: 'form',
        description: `Add ${focusString} exercises to your workout`,
        priority: 'medium',
        context: { 
          focus: focusString,
          suggestedExercises: focusExercises.slice(0, 3).map(ex => ex.id)
        }
      });
    }
  }

  // Generate recommendations based on exercise count
  if (include.length < 3) {
    recommendations.push({
      type: 'progression',
      description: 'Consider adding more exercises for a complete workout',
      priority: 'low',
      context: { currentCount: include.length, recommendedMin: 3 }
    });
  }

  return recommendations;
};

// Enhanced validation with required fields check
export const handleExerciseSelectionValidation = (
  field: string,
  result: ValidationResult,
  validationResults: Record<string, ValidationResult>,
  setValidationResults: (results: Record<string, ValidationResult>) => void,
  onValidation?: (isValid: boolean) => void
) => {
  setValidationResults(prev => {
    const newResults = { ...prev, [field]: result };
    
    // Check if all required fields are valid
    const isValid = EXERCISE_SELECTION_REQUIRED_FIELDS.every(field => {
      const validation = newResults[field];
      return validation?.isValid ?? false;
    });

    // Defer parent validation to prevent setState during render
    if (onValidation) {
      setTimeout(() => {
        onValidation(isValid);
      }, 0);
    }
    
    return newResults;
  });
}; 