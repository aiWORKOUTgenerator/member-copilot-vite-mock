import React from 'react';
import { Clock } from 'lucide-react';
import { DurationConfigurationData, ValidationResult } from '../../../../../../../types/core';
import { DETAILED_WORKOUT_CONSTANTS } from '../../constants/detailed-workout.constants';

type SupportedDuration = typeof DETAILED_WORKOUT_CONSTANTS.SUPPORTED_DURATIONS[number];

interface DurationFormProps {
  value?: DurationConfigurationData;
  onChange: (value: DurationConfigurationData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const DurationForm: React.FC<DurationFormProps> = ({
  value,
  onChange,
  onValidation,
  disabled = false
}) => {
  const handleDurationChange = (duration: SupportedDuration) => {
    // Calculate durations based on selected total duration
    const warmupDuration = Math.round(duration * 0.15); // 15% for warmup
    const cooldownDuration = Math.round(duration * 0.15); // 15% for cooldown
    const mainDuration = duration - warmupDuration - cooldownDuration;

    const newValue: DurationConfigurationData = {
      duration,
      warmupDuration,
      mainDuration,
      cooldownDuration,
      selected: true,
      label: `${duration} minutes`,
      metadata: {
        intensity: duration <= 30 ? 'moderate' : duration <= 60 ? 'high' : 'low',
        timeOfDay: 'morning'
      }
    };

    onChange(newValue);

    // Defer validation to prevent setState during render
    if (onValidation) {
      setTimeout(() => {
        onValidation({
          isValid: true,
          message: 'Duration selected successfully'
        });
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workout Duration</h3>
          <p className="text-sm text-gray-600">Choose how long you want to exercise</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DETAILED_WORKOUT_CONSTANTS.SUPPORTED_DURATIONS.map((duration) => (
          <button
            key={duration}
            onClick={() => handleDurationChange(duration)}
            disabled={disabled}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200
              ${value?.duration === duration
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">{duration}</div>
            <div className="text-sm text-gray-600">minutes</div>
          </button>
        ))}
      </div>

      {value && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Warm-up</span>
            <span className="font-medium text-gray-900">{value.warmupDuration} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Main Workout</span>
            <span className="font-medium text-gray-900">{value.mainDuration} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cool-down</span>
            <span className="font-medium text-gray-900">{value.cooldownDuration} min</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DurationForm; 