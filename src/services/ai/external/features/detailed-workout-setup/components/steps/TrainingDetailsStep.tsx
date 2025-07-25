import React, { useState, useCallback } from 'react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { EquipmentForm } from '../forms/EquipmentForm';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';

interface TrainingDetailsStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

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
    if (!options.customization_equipment) return;

    try {
      // Validate equipment selection based on focus and duration
      const validationResult = await workoutFeature.validateTrainingDetails({
        equipment: options.customization_equipment,
        focus: options.customization_focus,
        duration: options.customization_duration
      });

      // Update conflicts based on validation result
      if (!validationResult.isValid && validationResult.details?.conflicts) {
        setConflicts(validationResult.details.conflicts.map((conflict, index) => ({
          id: `details-conflict-${index}`,
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
          : options.customization_duration?.duration || 30
      });

      setRecommendations(recommendationResult.recommendations);
    } catch (error) {
      console.error('Error validating training details:', error);
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
        console.warn('Unhandled recommendation type:', type);
    }
  }, [options.customization_equipment, onChange]);

  return (
    <div className="space-y-8">
      {/* Equipment Selection */}
      <div className="space-y-4">
        <EquipmentForm
          value={options.customization_equipment || []}
          onChange={value => {
            onChange('customization_equipment', value);
            validateAndRecommend();
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