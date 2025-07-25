import React, { useState, useCallback } from 'react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';

interface ExerciseSelectionStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export const ExerciseSelectionStep: React.FC<ExerciseSelectionStepProps> = ({
  options,
  onChange,
  onValidation,
  workoutFeature,
  disabled = false
}) => {
  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<Array<{
    id: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    affectedFields: string[];
    suggestedAction?: {
      label: string;
      action: () => void;
    };
  }>>([]);

  // AI recommendations state
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'form' | 'progression' | 'modification' | 'alternative';
    description: string;
    priority: 'low' | 'medium' | 'high';
    context?: Record<string, any>;
  }>>([]);

  // Handle form validation
  const handleValidation = useCallback((field: string, result: ValidationResult) => {
    setValidationResults(prev => {
      const newResults = { ...prev, [field]: result };
      
      // Check if all required fields are valid
      const isValid = Object.values(newResults).every(r => r.isValid);
      onValidation?.(isValid);
      
      return newResults;
    });
  }, [onValidation]);

  // Handle cross-field validation and AI recommendations
  const validateAndRecommend = useCallback(async () => {
    try {
      // Validate exercise selections based on other options
      const validationResult = await workoutFeature.validateExerciseSelections({
        include: options.customization_include,
        exclude: options.customization_exclude,
        focus: options.customization_focus,
        equipment: options.customization_equipment,
        duration: options.customization_duration
      });

      // Update conflicts based on validation result
      if (!validationResult.isValid && validationResult.details?.conflicts) {
        setConflicts(validationResult.details.conflicts.map((conflict, index) => ({
          id: `exercise-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => {
              if (conflict.suggestion?.changes) {
                Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                  onChange(key as keyof PerWorkoutOptions, value);
                });
              }
            }
          } : undefined
        })));
      } else {
        setConflicts([]);
      }

      // Generate AI recommendations
      const recommendationResult = await workoutFeature.generateWorkout({
        duration: options.customization_duration,
        focus: options.customization_focus,
        equipment: options.customization_equipment,
        energyLevel: options.customization_energy || 5,
        sorenessAreas: options.customization_soreness || [],
        experienceLevel: 'intermediate',
        intensityPreference: 'moderate',
        workoutStructure: 'traditional',
        trainingGoals: ['strength'],
        timeAvailable: typeof options.customization_duration === 'number' 
          ? options.customization_duration 
          : options.customization_duration?.duration || 30,
        includeExercises: options.customization_include,
        excludeExercises: options.customization_exclude
      });

      setRecommendations(recommendationResult.recommendations);
    } catch (error) {
      console.error('Error validating exercise selections:', error);
    }
  }, [options, workoutFeature, onChange]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Handle AI recommendation application
  const handleRecommendationApply = useCallback((type: string, description: string) => {
    // Apply the recommendation based on type
    switch (type) {
      case 'modification':
        // Update exercise selections based on recommendation
        if (description.includes('include')) {
          // Handle include recommendation
          const exercises = description.match(/include: (.*?)(?=\.|$)/)?.[1]?.split(', ');
          if (exercises) {
            onChange('customization_include', exercises);
          }
        } else if (description.includes('exclude')) {
          // Handle exclude recommendation
          const exercises = description.match(/exclude: (.*?)(?=\.|$)/)?.[1]?.split(', ');
          if (exercises) {
            onChange('customization_exclude', exercises);
          }
        }
        break;
      case 'alternative':
        // Handle alternative exercise suggestions
        break;
      default:
        console.warn('Unhandled recommendation type:', type);
    }
  }, [onChange]);

  return (
    <div className="space-y-8">
      {/* Exercise Selection Forms */}
      <div className="space-y-6">
        {/* Include Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Include Exercises</h3>
            <button
              onClick={() => onChange('customization_include', [])}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={disabled}
            >
              Clear All
            </button>
          </div>
          {/* TODO: Add exercise selection UI */}
          {validationResults.include && !validationResults.include.isValid && (
            <ValidationFeedback
              validation={validationResults.include}
              size="small"
            />
          )}
        </div>

        {/* Exclude Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Exclude Exercises</h3>
            <button
              onClick={() => onChange('customization_exclude', [])}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={disabled}
            >
              Clear All
            </button>
          </div>
          {/* TODO: Add exercise selection UI */}
          {validationResults.exclude && !validationResults.exclude.isValid && (
            <ValidationFeedback
              validation={validationResults.exclude}
              size="small"
            />
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <AIRecommendationPanel
          recommendations={recommendations}
          onApply={handleRecommendationApply}
          className="mt-6"
        />
      )}

      {/* Cross-field Validation Warnings */}
      {conflicts.length > 0 && (
        <ConflictWarning
          conflicts={conflicts}
          onDismiss={handleConflictDismiss}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default ExerciseSelectionStep; 