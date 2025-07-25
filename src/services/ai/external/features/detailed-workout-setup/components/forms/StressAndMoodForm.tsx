import React, { useCallback } from 'react';
import { ValidationResult, CategoryRatingData } from '../../../../../../../types/core';

interface StressAndMoodFormProps {
  value: CategoryRatingData | undefined;
  onChange: (value: CategoryRatingData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const StressAndMoodForm: React.FC<StressAndMoodFormProps> = ({
  value = { rating: 3, categories: ['neutral'] },
  onChange,
  onValidation,
  disabled = false
}) => {
  const moodOptions = [
    { label: 'Energized', value: 'energized', rating: 4 },
    { label: 'Motivated', value: 'motivated', rating: 4 },
    { label: 'Calm', value: 'calm', rating: 3 },
    { label: 'Neutral', value: 'neutral', rating: 3 },
    { label: 'Anxious', value: 'anxious', rating: 2 },
    { label: 'Stressed', value: 'stressed', rating: 2 },
    { label: 'Fatigued', value: 'fatigued', rating: 1 },
    { label: 'Overwhelmed', value: 'overwhelmed', rating: 1 }
  ];

  const handleStressLevelChange = useCallback((level: number) => {
    const newCategories = value.categories.filter(cat => !cat.startsWith('stress_'));
    newCategories.push(`stress_${level >= 7 ? 'high' : level >= 4 ? 'moderate' : 'low'}`);
    
    onChange({
      rating: level,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Stress level updated'
      });
    }
  }, [value, onChange, onValidation]);

  const handleMoodSelect = useCallback((mood: string) => {
    const selectedMood = moodOptions.find(m => m.value === mood);
    if (!selectedMood) return;

    const newCategories = value.categories.filter(cat => !moodOptions.some(m => m.value === cat));
    newCategories.push(mood);

    onChange({
      rating: selectedMood.rating,
      categories: newCategories
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Mood updated'
      });
    }
  }, [value, moodOptions, onChange, onValidation]);

  const getStressLevel = (): number => {
    const stressCategory = value.categories.find(cat => cat.startsWith('stress_'));
    if (!stressCategory) return 3;
    if (stressCategory.endsWith('high')) return 8;
    if (stressCategory.endsWith('moderate')) return 5;
    return 2;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Stress Level
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={getStressLevel()}
              onChange={(e) => handleStressLevelChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-16 text-right">
              {getStressLevel()}/10
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Low Stress</span>
            <span>High Stress</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Mood
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moodOptions.map(mood => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${value.categories.includes(mood.value)
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                border transition-colors duration-200
              `}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your State:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Low Stress (1-3): Feeling relaxed and at ease</li>
          <li>Moderate Stress (4-6): Some tension but manageable</li>
          <li>High Stress (7-10): Significant tension or pressure</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Mood Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Positive moods (Energized, Motivated) may support higher intensity</li>
          <li>Neutral moods (Calm, Neutral) are good for steady workouts</li>
          <li>Challenging moods (Anxious, Stressed) might need modified intensity</li>
        </ul>
      </div>
    </div>
  );
};

export default StressAndMoodForm; 