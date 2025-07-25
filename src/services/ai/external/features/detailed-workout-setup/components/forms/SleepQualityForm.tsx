import React, { useCallback } from 'react';
import { ValidationResult, CategoryRatingData } from '../../../../../../../types/core';

interface SleepQualityFormProps {
  value: CategoryRatingData | undefined;
  onChange: (value: CategoryRatingData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const SleepQualityForm: React.FC<SleepQualityFormProps> = ({
  value = { rating: 7, categories: ['good'] },
  onChange,
  onValidation,
  disabled = false
}) => {
  const qualityOptions = [
    { label: 'Excellent', value: 'excellent', rating: 9 },
    { label: 'Good', value: 'good', rating: 7 },
    { label: 'Fair', value: 'fair', rating: 5 },
    { label: 'Poor', value: 'poor', rating: 3 },
    { label: 'Very Poor', value: 'very_poor', rating: 1 }
  ];

  // Slider now represents hours of sleep (0-12)
  const handleSleepHoursChange = useCallback((hours: number) => {
    let sleepCategory = 'sleep_insufficient';
    if (hours > 8) sleepCategory = 'sleep_optimal';
    else if (hours >= 6) sleepCategory = 'sleep_adequate';
    // else remains 'sleep_insufficient'

    const newCategories = value.categories.filter(cat => !cat.startsWith('sleep_'));
    // Keep existing quality categories
    const qualityCategories = value.categories.filter(cat => qualityOptions.some(q => q.value === cat));
    newCategories.push(sleepCategory, ...qualityCategories);
    
    onChange({
      rating: hours,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Sleep hours updated'
      });
    }
  }, [value, onChange, onValidation]);

  const handleQualitySelect = useCallback((quality: string) => {
    const selectedQuality = qualityOptions.find(q => q.value === quality);
    if (!selectedQuality) return;

    const newCategories = value.categories.filter(cat => !qualityOptions.some(q => q.value === cat));
    // Keep existing sleep categories
    const sleepCategories = value.categories.filter(cat => cat.startsWith('sleep_'));
    newCategories.push(quality, ...sleepCategories);

    onChange({
      rating: value.rating, // Keep existing rating (hours)
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Quality updated'
      });
    }
  }, [value, qualityOptions, onChange, onValidation]);

  const getSleepHours = (): number => {
    // If the rating is within 0-12, treat as hours
    if (typeof value.rating === 'number' && value.rating >= 0 && value.rating <= 12) {
      return value.rating;
    }
    // Fallback: map category to default hours
    const sleepCategory = value.categories.find(cat => cat.startsWith('sleep_'));
    if (!sleepCategory) return 7;
    if (sleepCategory.endsWith('optimal')) return 9;
    if (sleepCategory.endsWith('adequate')) return 7;
    return 5;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hours of Sleep
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={getSleepHours()}
              onChange={(e) => handleSleepHoursChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-20 text-right">
              {getSleepHours()} hrs
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>0 hrs</span>
            <span>12 hrs</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Quality
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {qualityOptions.map(quality => (
            <button
              key={quality.value}
              onClick={() => handleQualitySelect(quality.value)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${value.categories.includes(quality.value)
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                border transition-colors duration-200
              `}
            >
              {quality.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your Sleep:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Less than 6 hours: Insufficient sleep</li>
          <li>6–8 hours: Adequate sleep</li>
          <li>More than 8 hours: Optimal sleep</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Quality Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Positive quality (Excellent, Good) may support higher intensity</li>
          <li>Neutral quality (Fair) is good for steady workouts</li>
          <li>Poor quality (Poor, Very Poor) might need modified intensity</li>
        </ul>
      </div>
    </div>
  );
};

export default SleepQualityForm; 