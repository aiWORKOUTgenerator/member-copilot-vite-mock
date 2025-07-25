import React, { useCallback } from 'react';
import { ValidationResult, CategoryRatingData } from '../../../../../../../types/core';

interface SorenessFormProps {
  value: CategoryRatingData | undefined;
  onChange: (value: CategoryRatingData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const SorenessForm: React.FC<SorenessFormProps> = ({
  value = { rating: 5, categories: ['moderate'] },
  onChange,
  onValidation,
  disabled = false
}) => {
  const muscleGroups = [
    'No Soreness',
    'Upper Body',
    'Lower Body',
    'Core',
    'Back',
    'Legs',
    'Arms',
    'Shoulders'
  ];

  const handleSorenessChange = useCallback((level: number) => {
    const newCategories = value.categories.filter(cat => !cat.startsWith('soreness_'));
    newCategories.push(`soreness_${level >= 7 ? 'high' : level >= 4 ? 'moderate' : 'low'}`);
    
    onChange({
      rating: level,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Soreness level updated'
      });
    }
  }, [value, onChange, onValidation]);

  const handleMuscleGroupToggle = useCallback((muscleGroup: string) => {
    if (muscleGroup === 'No Soreness') {
      // Clear all muscle groups and set no soreness
      const newCategories = value.categories.filter(cat => 
        !muscleGroups.some(group => cat.startsWith(`${group.toLowerCase().replace(' ', '_')}_`))
      );
      newCategories.push('no_soreness');
      
      onChange({
        rating: 1,
        categories: newCategories
      });
    } else {
      // Toggle the specific muscle group
      const muscleGroupKey = muscleGroup.toLowerCase().replace(' ', '_');
      const existingGroup = value.categories.find(cat => cat.startsWith(`${muscleGroupKey}_`));
      
      let newCategories = value.categories.filter(cat => 
        !cat.startsWith(`${muscleGroupKey}_`) && cat !== 'no_soreness'
      );
      
      if (!existingGroup) {
        // Add the muscle group with current soreness level
        const sorenessLevel = value.rating >= 7 ? 'high' : value.rating >= 4 ? 'moderate' : 'low';
        newCategories.push(`${muscleGroupKey}_${sorenessLevel}`);
      }
      // If it exists, we remove it (toggle off)
      
      onChange({
        rating: value.rating,
        categories: newCategories
      });
    }

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Muscle groups updated'
      });
    }
  }, [value, muscleGroups, onChange, onValidation]);

  const getSoreness = (): number => {
    const sorenessCategory = value.categories.find(cat => cat.startsWith('soreness_'));
    if (!sorenessCategory) return 5;
    if (sorenessCategory.endsWith('high')) return 8;
    if (sorenessCategory.endsWith('moderate')) return 5;
    return 2;
  };

  const getSelectedMuscleGroups = (): string[] => {
    return muscleGroups.filter(group => {
      if (group === 'No Soreness') {
        return value.categories.includes('no_soreness');
      }
      const muscleGroupKey = group.toLowerCase().replace(' ', '_');
      return value.categories.some(cat => cat.startsWith(`${muscleGroupKey}_`));
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Soreness Level
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={getSoreness()}
              onChange={(e) => handleSorenessChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-16 text-right">
              {getSoreness()}/10
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>No Soreness</span>
            <span>Severe Soreness</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Muscle Groups
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => handleMuscleGroupToggle(group)}
              disabled={disabled || (group !== 'No Soreness' && value.categories.includes('no_soreness'))}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${getSelectedMuscleGroups().includes(group)
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                border transition-colors duration-200
              `}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your Soreness:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Low Soreness (1-3): Minimal discomfort, doesn't affect movement</li>
          <li>Moderate Soreness (4-6): Noticeable discomfort, some movement limitation</li>
          <li>High Soreness (7-10): Significant pain, restricts normal movement</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Muscle Group Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Select specific muscle groups where you're experiencing soreness</li>
          <li>The soreness level applies to all selected muscle groups</li>
          <li>Choose "No Soreness" if you're not experiencing any muscle discomfort</li>
        </ul>
      </div>
    </div>
  );
};

export default SorenessForm; 