import React, { useCallback } from 'react';
import { ValidationResult, CategoryRatingData } from '../../../../../../../types/core';

interface EnergyFormProps {
  value: CategoryRatingData | undefined;
  onChange: (value: CategoryRatingData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const EnergyForm: React.FC<EnergyFormProps> = ({
  value = { rating: 5, categories: ['fair'] },
  onChange,
  onValidation,
  disabled = false
}) => {
  const moodOptions = [
    { label: 'Excellent', value: 'excellent', rating: 9 },
    { label: 'Good', value: 'good', rating: 7 },
    { label: 'Fair', value: 'fair', rating: 5 },
    { label: 'Poor', value: 'poor', rating: 3 },
    { label: 'Very Poor', value: 'very_poor', rating: 1 }
  ];

  const handleEnergyChange = useCallback((level: number) => {
    const newCategories = value.categories.filter(cat => !cat.startsWith('energy_'));
    newCategories.push(`energy_${level >= 7 ? 'high' : level >= 4 ? 'moderate' : 'low'}`);
    
    onChange({
      rating: level,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Energy level updated'
      });
    }
  }, [value, onChange, onValidation]);

  const handleMoodSelect = useCallback((mood: string) => {
    const selectedMood = moodOptions.find(o => o.value === mood);
    if (!selectedMood) return;

    const newCategories = value.categories.filter(cat => !moodOptions.some(o => o.value === cat));
    newCategories.push(mood);

    onChange({
      rating: selectedMood.rating,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Mental mood updated'
      });
    }
  }, [value, moodOptions, onChange, onValidation]);

  const getEnergy = (): number => {
    const energyCategory = value.categories.find(cat => cat.startsWith('energy_'));
    if (!energyCategory) return 5;
    if (energyCategory.endsWith('high')) return 8;
    if (energyCategory.endsWith('moderate')) return 5;
    return 2;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Energy Level
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={getEnergy()}
              onChange={(e) => handleEnergyChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-16 text-right">
              {getEnergy()}/10
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Low Energy</span>
            <span>High Energy</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mental Mood
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {moodOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleMoodSelect(option.value)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${value.categories.includes(option.value)
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                border transition-colors duration-200
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your Energy:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Low Energy (1-3): Feeling sluggish or mentally drained; gentle or restorative workouts recommended</li>
          <li>Moderate Energy (4-6): Adequate focus and motivation for standard, moderate workouts</li>
          <li>High Energy (7-10): Highly energized, alert, and mentally prepared for intense sessions</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Mood Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Positive Mood (Excellent, Good): Optimal mental state supporting challenging workouts</li>
          <li>Neutral Mood (Fair): Balanced mindset, suited for moderate-intensity activities</li>
          <li>Negative Mood (Poor, Very Poor): May require adapted intensity or stress-relieving exercises</li>
        </ul>
      </div>
    </div>
  );
};

export default EnergyForm; 