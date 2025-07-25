import React, { useState } from 'react';
import { Settings, Zap, Clock, BarChart } from 'lucide-react';
import { ValidationResult } from '../../../../../../../types/core';

interface CustomizationFormProps {
  value: WorkoutCustomizationData;
  onChange: (value: WorkoutCustomizationData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

interface WorkoutCustomizationData {
  intensity: 'low' | 'moderate' | 'high';
  restPeriods: 'short' | 'moderate' | 'long';
  exercisePreference: 'compound' | 'isolation' | 'mixed';
  progressionStyle: 'conservative' | 'moderate' | 'aggressive';
}

const CUSTOMIZATION_OPTIONS = {
  intensity: [
    { value: 'low', label: 'Low Intensity', description: 'Focus on form and technique' },
    { value: 'moderate', label: 'Moderate Intensity', description: 'Balanced workout intensity' },
    { value: 'high', label: 'High Intensity', description: 'Challenging and intense' }
  ],
  restPeriods: [
    { value: 'short', label: 'Short Rest', description: '30-60 seconds between sets' },
    { value: 'moderate', label: 'Moderate Rest', description: '1-2 minutes between sets' },
    { value: 'long', label: 'Long Rest', description: '2-3 minutes between sets' }
  ],
  exercisePreference: [
    { value: 'compound', label: 'Compound Exercises', description: 'Multi-joint movements' },
    { value: 'isolation', label: 'Isolation Exercises', description: 'Single muscle focus' },
    { value: 'mixed', label: 'Mixed Approach', description: 'Balanced combination' }
  ],
  progressionStyle: [
    { value: 'conservative', label: 'Conservative', description: 'Slow and steady progress' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced progression' },
    { value: 'aggressive', label: 'Aggressive', description: 'Rapid progression' }
  ]
};

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
  value,
  onChange,
  onValidation,
  disabled = false
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('intensity');

  const handleOptionChange = (category: keyof WorkoutCustomizationData, newValue: string) => {
    if (disabled) return;

    console.log('CustomizationForm: handleOptionChange called', { category, newValue });

    const updatedValue = {
      ...value,
      [category]: newValue
    };

    console.log('CustomizationForm: calling onChange with updatedValue:', updatedValue);
    onChange(updatedValue as WorkoutCustomizationData);
    console.log('CustomizationForm: onChange completed');

    // Validate customization options
    if (onValidation) {
      const isValid = Object.entries(updatedValue).every(([key, val]) => 
        CUSTOMIZATION_OPTIONS[key as keyof typeof CUSTOMIZATION_OPTIONS]
          .some(option => option.value === val)
      );

      onValidation({
        isValid,
        message: isValid ? undefined : 'Please select valid options for all customization settings',
        details: { selected: updatedValue }
      });
    }
  };

  const renderSection = (
    category: keyof WorkoutCustomizationData,
    icon: React.ReactNode,
    title: string
  ) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === category ? '' : category)}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        <div className="text-sm text-gray-500">
          {CUSTOMIZATION_OPTIONS[category].find(opt => opt.value === value[category])?.label}
        </div>
      </button>

      {expandedSection === category && (
        <div className="p-4 space-y-2">
          {CUSTOMIZATION_OPTIONS[category].map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionChange(category, option.value)}
              disabled={disabled}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all duration-300
                ${value[category] === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-gray-500">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Advanced Customization</h3>
      </div>

      <div className="space-y-4">
        {renderSection('intensity', <Zap className="w-4 h-4 text-yellow-500" />, 'Workout Intensity')}
        {renderSection('restPeriods', <Clock className="w-4 h-4 text-blue-500" />, 'Rest Periods')}
        {renderSection('exercisePreference', <Settings className="w-4 h-4 text-green-500" />, 'Exercise Selection')}
        {renderSection('progressionStyle', <BarChart className="w-4 h-4 text-red-500" />, 'Progression Style')}
      </div>

      {/* Summary Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="font-medium text-gray-700 mb-2">Your Customization Summary</div>
        <div className="space-y-2 text-sm text-gray-600">
          {Object.entries(value).map(([key, val]) => {
            const option = CUSTOMIZATION_OPTIONS[key as keyof typeof CUSTOMIZATION_OPTIONS]
              .find(opt => opt.value === val);
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium">{option?.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomizationForm; 