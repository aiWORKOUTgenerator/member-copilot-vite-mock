import { ValidationResult } from '../../../../../../../types/core';
import { PerWorkoutOptions, CategoryRatingData } from '../../../../../../../types/core';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { TransformationContext } from '../../../../DataTransformer/core/TransformationContext';
import { VALIDATION_RULES } from './validationRules';
import { PhysicalStateData } from './physicalStateSchema';

export interface Conflict {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  affectedFields: string[];
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

export interface AIRecommendation {
  type: 'form' | 'progression' | 'modification' | 'alternative';
  description: string;
  priority: 'low' | 'medium' | 'high';
  context?: Record<string, any>;
}

export interface ValidationHandlersConfig {
  options: PerWorkoutOptions;
  workoutFeature: DetailedWorkoutFeature;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  transformationContext: TransformationContext;
  persistedState: PhysicalStateData;
  validate: (data: PhysicalStateData) => boolean;
  validateField: (field: keyof PhysicalStateData, value: any) => boolean;
  forceSave: () => void;
}

export interface ValidationHandlersResult {
  conflicts: Conflict[];
  recommendations: AIRecommendation[];
  isValid: boolean;
}

// Enhanced cross-field validation
export const validateAndRecommend = async (
  config: ValidationHandlersConfig
): Promise<ValidationHandlersResult> => {
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

  if (!options.customization_energy || !options.customization_soreness) {
    return { conflicts: [], recommendations: [], isValid: false };
  }

  try {
    // Transform data for validation
    const energyValue = typeof options.customization_energy === 'number'
      ? options.customization_energy
      : (options.customization_energy as CategoryRatingData).rating;

    // Validate physical state
    const validationResult = await workoutFeature.validatePhysicalState({
      energyLevel: energyValue,
      sorenessAreas: Array.isArray(options.customization_soreness) 
        ? options.customization_soreness
        : []
    });

    let conflicts: Conflict[] = [];
    let recommendations: AIRecommendation[] = [];

    // Update conflicts and recommendations based on validation result
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
        id: `physical-conflict-${index}`,
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
                  const isValid = validateField(key as keyof PhysicalStateData, transformedValue);
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

      // Generate recommendations for high severity conflicts
      const highSeverityConflicts = conflicts.filter(conflict => 
        conflict.severity === 'high'
      );

      if (highSeverityConflicts.length > 0) {
        recommendations = [{
          type: 'modification',
          description: 'Adjust your selections to resolve conflicts',
          priority: 'high',
          context: { conflicts: highSeverityConflicts }
        }];
      }
    }

    // Validate full state
    const isValid = validate(persistedState);
    if (isValid) {
      forceSave();
    }

    return { conflicts, recommendations, isValid };
  } catch (error) {
    console.error('Error validating physical state:', error);
    return { conflicts: [], recommendations: [], isValid: false };
  }
};

// Enhanced validation with required fields check
export const handleValidation = (
  field: string,
  result: ValidationResult,
  validationResults: Record<string, ValidationResult>,
  setValidationResults: React.Dispatch<React.SetStateAction<Record<string, ValidationResult>>>,
  onValidation?: (isValid: boolean) => void
) => {
  setValidationResults((prev: Record<string, ValidationResult>) => {
    const newResults = { ...prev, [field]: result };
    
    // Check if all required fields are valid
    const isValid = ['energy', 'soreness'].every(field => {
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