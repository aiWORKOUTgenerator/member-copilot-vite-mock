import React, { useCallback } from 'react';
import { ValidationResult, CategoryRatingData } from '../../../../../../../types/core';

interface InjuryAndRecoveryFormProps {
  value: CategoryRatingData | undefined;
  onChange: (value: CategoryRatingData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const InjuryAndRecoveryForm: React.FC<InjuryAndRecoveryFormProps> = ({
  value = { rating: 1, categories: ['no_injuries'] },
  onChange,
  onValidation,
  disabled = false
}) => {
  const bodyRegions = [
    'No Injuries',
    'Neck',
    'Shoulders',
    'Upper Back',
    'Lower Back',
    'Arms',
    'Wrists',
    'Hips',
    'Knees',
    'Ankles',
    'Other'
  ];

  const handlePainLevelChange = useCallback((level: number) => {
    const newCategories = value.categories.filter(cat => !cat.startsWith('pain_'));
    newCategories.push(`pain_${level >= 7 ? 'high' : level >= 4 ? 'moderate' : 'low'}`);
    
    onChange({
      rating: level,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Pain level updated'
      });
    }
  }, [value, onChange, onValidation]);

  const handleRegionToggle = useCallback((region: string) => {
    let newCategories: string[];

    if (region === 'No Injuries') {
      newCategories = ['no_injuries'];
    } else {
      // Remove 'No Injuries' if it exists
      newCategories = value.categories.filter(cat => cat !== 'no_injuries');
      
      const existingRegion = newCategories.find(cat => cat === region);
      if (existingRegion) {
        newCategories = newCategories.filter(cat => cat !== region);
      } else {
        newCategories = [...newCategories, region];
      }
    }

    // If no regions selected, default to no injuries
    if (newCategories.length === 0) {
      newCategories = ['no_injuries'];
    }

    onChange({
      rating: value.rating,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Injury regions updated'
      });
    }
  }, [value, onChange, onValidation]);

  const getPainLevel = (): number => {
    const painCategory = value.categories.find(cat => cat.startsWith('pain_'));
    if (!painCategory) return 1;
    if (painCategory.endsWith('high')) return 8;
    if (painCategory.endsWith('moderate')) return 5;
    return 2;
  };

  const getSelectedRegions = (): string[] => {
    return value.categories.filter(cat => !cat.startsWith('pain_') && cat !== 'no_injuries');
  };

  const hasNoInjuries = (): boolean => {
    return value.categories.includes('no_injuries');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Affected Areas
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bodyRegions.map(region => (
            <button
              key={region}
              onClick={() => handleRegionToggle(region)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${(region === 'No Injuries' && hasNoInjuries()) || getSelectedRegions().includes(region)
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                border transition-colors duration-200
              `}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {!hasNoInjuries() && getSelectedRegions().length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pain Level in Selected Areas
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={getPainLevel()}
                onChange={(e) => handlePainLevelChange(parseInt(e.target.value, 10))}
                disabled={disabled}
                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-16 text-right">
                {getPainLevel()}/10
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>No Pain</span>
              <span>Severe Pain</span>
            </div>
          </div>
        </div>
      )}

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your State:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>No Pain (1-3): No discomfort, full range of motion</li>
          <li>Moderate Pain (4-6): Some discomfort, minor movement limitation</li>
          <li>Severe Pain (7-10): Significant pain, major movement limitation</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Injury Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>No Injuries allows for full intensity workouts</li>
          <li>Selected areas may need modified exercises</li>
          <li>Pain level determines exercise intensity adjustments</li>
        </ul>
      </div>
    </div>
  );
};

export default InjuryAndRecoveryForm; 