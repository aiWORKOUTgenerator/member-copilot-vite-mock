import React, { useState, useCallback, useEffect } from 'react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { DurationForm } from '../forms/DurationForm';
import { FocusForm } from '../forms/FocusForm';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';

interface TrainingStructureStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export type { TrainingStructureStepProps };

export const TrainingStructureStep: React.FC<TrainingStructureStepProps> = ({
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

  // Handle form validation
  const handleValidation = useCallback((field: string, result: ValidationResult) => {
    setValidationResults(prev => {
      const newResults = { ...prev, [field]: result };
      
      // Check if all required fields are valid
      const isValid = Object.values(newResults).every(r => r.isValid);
      
      // Defer parent validation to prevent setState during render
      if (onValidation) {
        setTimeout(() => {
          onValidation(isValid);
        }, 0);
      }
      
      return newResults;
    });
  }, [onValidation]);

  // Handle cross-field validation
  const validateCrossFields = useCallback(async () => {
    if (!options.customization_duration || !options.customization_focus) return;

    try {
      // Use the workout feature to validate the combination
      const result = await workoutFeature.validateWorkoutStructure({
        duration: options.customization_duration,
        focus: options.customization_focus
      });

      // Update conflicts based on validation result
      if (!result.isValid && result.details?.conflicts) {
        setConflicts(result.details.conflicts.map((conflict, index) => ({
          id: `structure-conflict-${index}`,
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
    } catch (error) {
      console.error('Error validating workout structure:', error);
    }
  }, [options.customization_duration, options.customization_focus, workoutFeature, onChange]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Run cross-field validation when both duration and focus are present
  useEffect(() => {
    if (options.customization_duration && options.customization_focus) {
      validateCrossFields();
    }
  }, [options.customization_duration, options.customization_focus, validateCrossFields]);

  return (
    <div className="space-y-8">
      {/* Duration Selection */}
      <div className="space-y-4">
        <DurationForm
          value={options.customization_duration}
          onChange={value => {
            onChange('customization_duration', value);
            // Remove automatic cross-field validation to prevent setState during render
          }}
          onValidation={result => handleValidation('duration', result)}
          disabled={disabled}
        />
        {validationResults.duration && !validationResults.duration.isValid && (
          <ValidationFeedback
            validation={validationResults.duration}
            size="small"
          />
        )}
      </div>

      {/* Focus Selection */}
      <div className="space-y-4">
        <FocusForm
          value={options.customization_focus}
          onChange={value => {
            onChange('customization_focus', value);
            // Remove automatic cross-field validation to prevent setState during render
          }}
          onValidation={result => handleValidation('focus', result)}
          disabled={disabled}
        />
        {validationResults.focus && !validationResults.focus.isValid && (
          <ValidationFeedback
            validation={validationResults.focus}
            size="small"
          />
        )}
      </div>

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

export default TrainingStructureStep; 