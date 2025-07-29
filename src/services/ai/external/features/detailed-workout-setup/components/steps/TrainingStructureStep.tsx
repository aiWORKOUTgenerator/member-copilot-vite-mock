import React, { useState, useCallback, useEffect } from 'react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { DurationForm } from '../forms/DurationForm';
import { FocusForm } from '../forms/FocusForm';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { aiLogger } from '../../../../../../../services/ai/logging/AILogger';

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
      // Extract duration value - handle both number and DurationConfigurationData
      const durationValue = typeof options.customization_duration === 'number' 
        ? options.customization_duration 
        : options.customization_duration.duration;

      // Extract focus value - handle both string and WorkoutFocusConfigurationData
      const focusValue = typeof options.customization_focus === 'string'
        ? options.customization_focus
        : options.customization_focus.focus;

      // Use the workout feature to validate the combination
      const result = await workoutFeature.validateWorkoutStructure({
        duration: durationValue,
        focus: focusValue
      });

      // Update conflicts based on validation result
      if (!result.isValid && result.details?.conflicts) {
        setConflicts(result.details.conflicts.map((conflict: any, index: number) => ({
          id: `structure-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => {
              if (conflict.suggestion?.changes) {
                Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                  onChange(key as keyof PerWorkoutOptions, value as PerWorkoutOptions[keyof PerWorkoutOptions]);
                });
              }
            }
          } : undefined
        })));
      } else {
        setConflicts([]);
      }
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout structure validation',
        component: 'TrainingStructureStep',
        severity: 'medium',
        userImpact: false
      });
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
          value={typeof options.customization_duration === 'object' ? options.customization_duration : undefined}
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
          value={typeof options.customization_focus === 'object' ? options.customization_focus : undefined}
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