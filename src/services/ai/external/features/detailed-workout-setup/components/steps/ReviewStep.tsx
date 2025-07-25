import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Clock, Target, Dumbbell, Zap, Edit2 } from 'lucide-react';
import { PerWorkoutOptions, ValidationResult, DurationConfigurationData, WorkoutFocusConfigurationData } from '../../../../../../../types/core';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';

interface ReviewStepProps {
  options: PerWorkoutOptions;
  onEdit: (section: string) => void;
  onSubmit: () => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  options,
  onEdit,
  onSubmit,
  workoutFeature,
  disabled = false
}) => {
  // Validation and recommendation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
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
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'form' | 'progression' | 'modification' | 'alternative';
    description: string;
    priority: 'low' | 'medium' | 'high';
    context?: Record<string, any>;
  }>>([]);

  // Format duration display
  const formatDuration = (duration: number | DurationConfigurationData | undefined) => {
    if (!duration) return 'Not set';
    if (typeof duration === 'number') return `${duration} minutes`;
    return (
      <div>
        <div className="font-medium">{duration.duration} minutes total</div>
        <div className="text-sm text-gray-500">
          <div>Warm-up: {duration.warmupDuration} min</div>
          <div>Main workout: {duration.mainDuration} min</div>
          <div>Cool-down: {duration.cooldownDuration} min</div>
        </div>
      </div>
    );
  };

  // Format focus display
  const formatFocus = (focus: string | WorkoutFocusConfigurationData | undefined) => {
    if (!focus) return 'Not set';
    if (typeof focus === 'string') return focus;
    return (
      <div>
        <div className="font-medium">{focus.label}</div>
        <div className="text-sm text-gray-500">
          <div>Intensity: {focus.metadata.intensity}</div>
          <div>Equipment needed: {focus.metadata.equipment}</div>
        </div>
      </div>
    );
  };

  // Format equipment display
  const formatEquipment = (equipment: string[] | undefined) => {
    if (!equipment?.length) return 'No equipment selected';
    return (
      <div className="flex flex-wrap gap-2">
        {equipment.map(item => (
          <span
            key={item}
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Validate all selections
  const validateSelections = useCallback(async () => {
    try {
      // Validate complete workout configuration
      const result = await workoutFeature.validateWorkoutConfiguration(options);
      setValidationResult(result);

      // Update conflicts
      if (!result.isValid && result.details?.conflicts) {
        setConflicts(result.details.conflicts.map((conflict, index) => ({
          id: `review-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => onEdit(conflict.fields?.[0] || '')
          } : undefined
        })));
      } else {
        setConflicts([]);
      }

      // Get final recommendations
      const recommendationResult = await workoutFeature.generateWorkout({
        ...options,
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
      console.error('Error validating workout configuration:', error);
      setValidationResult({
        isValid: false,
        message: 'An error occurred while validating the workout configuration'
      });
    }
  }, [options, workoutFeature, onEdit]);

  // Run validation on mount
  React.useEffect(() => {
    validateSelections();
  }, [validateSelections]);

  // Render a section
  const renderSection = (
    title: string,
    content: React.ReactNode,
    icon: React.ReactNode,
    sectionKey: string,
    hasError: boolean = false
  ) => (
    <div className={`
      p-4 rounded-lg border
      ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        <button
          onClick={() => onEdit(sectionKey)}
          disabled={disabled}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
      <div className="mt-3">{content}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Review Your Workout</h2>
        </div>
        {validationResult.isValid ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">All settings valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Please fix validation issues</span>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      {!validationResult.isValid && validationResult.message && (
        <ValidationFeedback
          validation={validationResult}
          size="large"
        />
      )}

      {/* Sections */}
      <div className="space-y-4">
        {renderSection(
          'Duration',
          formatDuration(options.customization_duration),
          <Clock className="w-5 h-5 text-blue-500" />,
          'duration'
        )}

        {renderSection(
          'Focus',
          formatFocus(options.customization_focus),
          <Target className="w-5 h-5 text-green-500" />,
          'focus'
        )}

        {renderSection(
          'Equipment',
          formatEquipment(options.customization_equipment),
          <Dumbbell className="w-5 h-5 text-yellow-500" />,
          'equipment'
        )}

        {renderSection(
          'Physical State',
          <div className="text-sm">
            <div>Energy Level: {options.customization_energy}/10</div>
            {options.customization_soreness?.length && (
              <div>Soreness Areas: {options.customization_soreness.join(', ')}</div>
            )}
          </div>,
          <Zap className="w-5 h-5 text-purple-500" />,
          'physical'
        )}
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <AIRecommendationPanel
          recommendations={recommendations}
          onApply={() => validateSelections()}
          className="mt-6"
        />
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <ConflictWarning
          conflicts={conflicts}
          onDismiss={() => setConflicts([])}
          className="mt-6"
        />
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSubmit}
          disabled={!validationResult.isValid || disabled}
          className={`
            px-6 py-3 rounded-xl font-medium transition-all duration-300
            ${validationResult.isValid && !disabled
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Generate Workout
        </button>
      </div>
    </div>
  );
};

export default ReviewStep; 