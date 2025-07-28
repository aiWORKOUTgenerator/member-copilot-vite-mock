import React, { useState, useCallback, useEffect } from 'react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { EquipmentForm } from '../forms/EquipmentForm';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';
import { aiLogger } from 'src/services/ai/logging/AILogger';

interface TrainingDetailsStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export type { TrainingDetailsStepProps };

// eslint-disable-next-line max-lines-per-function
export const TrainingDetailsStep: React.FC<TrainingDetailsStepProps> = ({
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
    context?: Record<string, unknown>;
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

  // Process validation conflicts
  const processValidationConflicts = useCallback((validationResult: ValidationResult) => {
    if (!validationResult.isValid && validationResult.details?.conflicts) {
      setConflicts(validationResult.details.conflicts.map((conflict: {
        message: string;
        severity?: 'high' | 'medium' | 'low';
        fields?: string[];
        suggestion?: {
          label: string;
          changes?: Record<string, unknown>;
        };
      }, index: number) => ({
        id: `details-conflict-${index}`,
        message: conflict.message,
        severity: conflict.severity ?? 'medium',
        affectedFields: conflict.fields ?? [],
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
  }, [onChange]);

  // Handle cross-field validation and AI recommendations
  const validateAndRecommend = useCallback(async () => {
    if (!options.customization_equipment) return;

    try {
      // Validate equipment selection based on focus and duration
      const validationResult = await workoutFeature.validateTrainingDetails({
        equipment: options.customization_equipment,
        focus: options.customization_focus,
        duration: options.customization_duration
      });

      // Process conflicts from validation result
      processValidationConflicts(validationResult);

      // Set empty recommendations for now - workout generation happens in final step
      setRecommendations([]);
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'training details validation',
        component: 'TrainingDetailsStep',
        severity: 'medium',
        userImpact: false
      });
    }
  }, [options, workoutFeature, processValidationConflicts]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Handle AI recommendation application
  const handleRecommendationApply = useCallback((type: string, _description: string) => {
    // Apply the recommendation based on type
    switch (type) {
      case 'modification':
        // Update equipment based on recommendation
        if (options.customization_equipment) {
          const updatedEquipment = [...options.customization_equipment];
          // Apply modification logic based on description
          onChange('customization_equipment', updatedEquipment);
        }
        break;
      case 'alternative':
        // Handle alternative equipment suggestions
        break;
      default:
        aiLogger.warn('Unhandled recommendation type', { type });
    }
  }, [options.customization_equipment, onChange]);

  // Run cross-field validation when equipment is present
  useEffect(() => {
    if (options.customization_equipment) {
      void validateAndRecommend();
    }
  }, [options.customization_equipment, validateAndRecommend]);

  return (
    <div className="space-y-8">
      {/* Equipment Selection */}
      <div className="space-y-4">
        <EquipmentForm
          value={options.customization_equipment ?? []}
          onChange={value => {
            onChange('customization_equipment', value);
            // Remove automatic validation to prevent setState during render
          }}
          onValidation={result => handleValidation('equipment', result)}
          disabled={disabled}
        />
        {validationResults.equipment && !validationResults.equipment.isValid && (
          <ValidationFeedback
            validation={validationResults.equipment}
            size="small"
          />
        )}
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

export default TrainingDetailsStep; 