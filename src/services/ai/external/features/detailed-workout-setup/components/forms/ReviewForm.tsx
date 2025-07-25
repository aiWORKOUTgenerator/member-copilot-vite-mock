import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Target, Dumbbell, Settings, ChevronRight } from 'lucide-react';
import { PerWorkoutOptions, DurationConfigurationData, WorkoutFocusConfigurationData } from '../../../../../../../types/core';
import { DetailedWorkoutParams } from '../../../types/detailed-workout.types';
import { DETAILED_WORKOUT_CONSTANTS } from '../../../constants/detailed-workout.constants';

interface ReviewFormProps {
  options: PerWorkoutOptions;
  onEdit: (section: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  validationMessages: Record<string, string>;
  disabled?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  options,
  onEdit,
  onSubmit,
  isValid,
  validationMessages,
  disabled = false
}) => {
  const getDurationSummary = (duration: number | DurationConfigurationData | undefined) => {
    if (!duration) return 'Not set';
    if (typeof duration === 'number') return `${duration} minutes`;
    return `${duration.duration} minutes (${duration.warmupDuration}/${duration.mainDuration}/${duration.cooldownDuration})`;
  };

  const getFocusSummary = (focus: string | WorkoutFocusConfigurationData | undefined) => {
    if (!focus) return 'Not set';
    if (typeof focus === 'string') return focus;
    return `${focus.label} (${focus.metadata.intensity} intensity)`;
  };

  const getEquipmentSummary = (equipment: string[] | undefined) => {
    if (!equipment?.length) return 'No equipment selected';
    return equipment.join(', ');
  };

  const renderSection = (
    title: string,
    content: string,
    icon: React.ReactNode,
    sectionKey: string,
    hasError: boolean
  ) => (
    <div className={`p-4 rounded-lg border ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>
        <button
          onClick={() => onEdit(sectionKey)}
          disabled={disabled}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          Edit
        </button>
      </div>
      <div className="mt-2 text-gray-600">{content}</div>
      {hasError && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{validationMessages[sectionKey]}</span>
        </div>
      )}
    </div>
  );

  const renderValidationSummary = () => {
    const messages = Object.entries(validationMessages);
    if (!messages.length) return null;

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Please fix the following issues:</span>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {messages.map(([key, message]) => (
            <li key={key} className="text-red-600 text-sm">
              {message}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Review Your Workout</h3>
        </div>
        {isValid && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">All settings valid</span>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      {!isValid && renderValidationSummary()}

      {/* Sections */}
      <div className="space-y-4">
        {renderSection(
          'Duration',
          getDurationSummary(options.customization_duration),
          <Clock className="w-4 h-4 text-blue-500" />,
          'duration',
          !!validationMessages.duration
        )}

        {renderSection(
          'Focus',
          getFocusSummary(options.customization_focus),
          <Target className="w-4 h-4 text-green-500" />,
          'focus',
          !!validationMessages.focus
        )}

        {renderSection(
          'Equipment',
          getEquipmentSummary(options.customization_equipment),
          <Dumbbell className="w-4 h-4 text-yellow-500" />,
          'equipment',
          !!validationMessages.equipment
        )}

        {options.customization_intensity && renderSection(
          'Customization',
          `Intensity: ${options.customization_intensity}`,
          <Settings className="w-4 h-4 text-purple-500" />,
          'customization',
          !!validationMessages.customization
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSubmit}
          disabled={!isValid || disabled}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
            ${isValid && !disabled
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <span>Generate Workout</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReviewForm; 