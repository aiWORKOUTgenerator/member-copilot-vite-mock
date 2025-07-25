import React from 'react';
import { Target } from 'lucide-react';
import { WorkoutFocusConfigurationData, ValidationResult } from '../../../../../../../types/core';
import { DETAILED_WORKOUT_CONSTANTS, DetailedWorkoutType } from '../../constants/detailed-workout.constants';

interface FocusFormProps {
  value?: WorkoutFocusConfigurationData;
  onChange: (value: WorkoutFocusConfigurationData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const FocusForm: React.FC<FocusFormProps> = ({
  value,
  onChange,
  onValidation,
  disabled = false
}) => {
  const handleFocusChange = (focus: DetailedWorkoutType) => {
    const config = DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS[focus];
    
    const newValue: WorkoutFocusConfigurationData = {
      focus,
      label: focus.charAt(0).toUpperCase() + focus.slice(1).replace('-', ' '),
      selected: true,
      metadata: {
        intensity: focus === 'recovery' ? 'low' : focus === 'cardio' ? 'high' : 'moderate',
        equipment: focus === 'sport-specific' ? 'full-gym' : focus === 'recovery' ? 'minimal' : 'moderate',
        experience: focus === 'sport-specific' ? 'advanced athlete' : focus === 'recovery' ? 'new to exercise' : 'some experience',
        duration_compatibility: [...DETAILED_WORKOUT_CONSTANTS.SUPPORTED_DURATIONS] // Convert readonly array to mutable
      }
    };

    onChange(newValue);

    // Defer validation to prevent setState during render
    if (onValidation) {
      setTimeout(() => {
        onValidation({
          isValid: true,
          message: 'Focus selected successfully'
        });
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workout Focus</h3>
          <p className="text-sm text-gray-600">Choose your primary training goal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DETAILED_WORKOUT_CONSTANTS.WORKOUT_TYPES.map((type) => {
          const config = DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS[type as DetailedWorkoutType];
          return (
            <button
              key={type}
              onClick={() => handleFocusChange(type as DetailedWorkoutType)}
              disabled={disabled}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${value?.focus === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {config.exerciseTypes.join(', ')}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frequency:</span>
                  <span className="text-gray-900">{config.recommendedFrequency}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-3">Selected Focus Details</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Intensity Level</span>
              <span className="font-medium text-gray-900">{value.metadata.intensity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Equipment Needed</span>
              <span className="font-medium text-gray-900">{value.metadata.equipment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Experience Level</span>
              <span className="font-medium text-gray-900">{value.metadata.experience}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusForm; 