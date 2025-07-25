import React, { useCallback } from 'react';
import { ValidationResult, TrainingActivity, TrainingLoadData } from '../../../../../../../types/core';

interface TrainingLoadFormProps {
  value: TrainingLoadData | undefined;
  onChange: (value: TrainingLoadData) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

export const TrainingLoadForm: React.FC<TrainingLoadFormProps> = ({
  value = {
    recentActivities: [],
    weeklyVolume: 0,
    averageIntensity: 'moderate'
  },
  onChange,
  onValidation,
  disabled = false
}) => {
  const activityTypes = [
    'Strength Training',
    'Cardio',
    'HIIT',
    'Yoga/Stretching',
    'Sports',
    'Other'
  ];

  const handleAddActivity = useCallback((type: string) => {
    const newActivity: TrainingActivity = {
      type,
      intensity: 'moderate',
      duration: 60,
      date: new Date().toISOString().split('T')[0]
    };

    const newActivities = [...value.recentActivities, newActivity];
    
    // Calculate new weekly volume and average intensity
    const totalMinutes = newActivities.reduce((sum, act) => sum + act.duration, 0);
    const intensityScores = newActivities.map(act => 
      act.intensity === 'intense' ? 3 : act.intensity === 'moderate' ? 2 : 1
    );
    const avgIntensityScore = intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length;

    onChange({
      recentActivities: newActivities,
      weeklyVolume: totalMinutes,
      averageIntensity: avgIntensityScore >= 2.5 ? 'intense' : avgIntensityScore >= 1.5 ? 'moderate' : 'light'
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Activity added'
      });
    }
  }, [value, onChange, onValidation]);

  const handleRemoveActivity = useCallback((index: number) => {
    const newActivities = value.recentActivities.filter((_, i) => i !== index);
    
    // Recalculate metrics
    const totalMinutes = newActivities.reduce((sum, act) => sum + act.duration, 0);
    const intensityScores = newActivities.map(act => 
      act.intensity === 'intense' ? 3 : act.intensity === 'moderate' ? 2 : 1
    );
    const avgIntensityScore = intensityScores.length > 0
      ? intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length
      : 2; // Default to moderate if no activities

    onChange({
      recentActivities: newActivities,
      weeklyVolume: totalMinutes,
      averageIntensity: avgIntensityScore >= 2.5 ? 'intense' : avgIntensityScore >= 1.5 ? 'moderate' : 'light'
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Activity removed'
      });
    }
  }, [value, onChange, onValidation]);

  const handleActivityUpdate = useCallback((index: number, updates: Partial<TrainingActivity>) => {
    const newActivities = value.recentActivities.map((activity, i) =>
      i === index ? { ...activity, ...updates } : activity
    );
    
    // Recalculate metrics
    const totalMinutes = newActivities.reduce((sum, act) => sum + act.duration, 0);
    const intensityScores = newActivities.map(act => 
      act.intensity === 'intense' ? 3 : act.intensity === 'moderate' ? 2 : 1
    );
    const avgIntensityScore = intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length;

    onChange({
      recentActivities: newActivities,
      weeklyVolume: totalMinutes,
      averageIntensity: avgIntensityScore >= 2.5 ? 'intense' : avgIntensityScore >= 1.5 ? 'moderate' : 'light'
    });

    if (onValidation) {
      onValidation({
        isValid: true,
        message: 'Activity updated'
      });
    }
  }, [value, onChange, onValidation]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recent Training Activities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activityTypes.map(type => (
            <button
              key={type}
              onClick={() => handleAddActivity(type)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                bg-gray-50 text-gray-700 border border-gray-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}
                transition-colors duration-200
              `}
            >
              + Add {type}
            </button>
          ))}
        </div>
      </div>

      {value.recentActivities.length > 0 && (
        <div className="space-y-4">
          {value.recentActivities.map((activity, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">{activity.type}</h4>
                <button
                  onClick={() => handleRemoveActivity(index)}
                  disabled={disabled}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={activity.duration}
                    onChange={(e) => handleActivityUpdate(index, { duration: parseInt(e.target.value, 10) })}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={activity.date}
                    onChange={(e) => handleActivityUpdate(index, { date: e.target.value })}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Intensity
                </label>
                <div className="flex space-x-2">
                  {(['light', 'moderate', 'intense'] as const).map(intensity => (
                    <button
                      key={intensity}
                      onClick={() => handleActivityUpdate(index, { intensity })}
                      disabled={disabled}
                      className={`
                        px-3 py-1 rounded text-xs font-medium flex-1
                        ${activity.intensity === intensity
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 mb-2">Training Load Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Weekly Volume: {Math.round(value.weeklyVolume / 60 * 10) / 10} hours</p>
              <p>Average Intensity: {value.averageIntensity.charAt(0).toUpperCase() + value.averageIntensity.slice(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Descriptions */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Understanding Your Training State:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Light Intensity: Easy, recovery-focused activities</li>
          <li>Moderate Intensity: Standard training intensity</li>
          <li>Intense: High-effort, challenging sessions</li>
        </ul>
        <p className="mt-2 mb-1 font-medium">Training Load Impact:</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Low weekly volume allows for higher intensity workouts</li>
          <li>Moderate volume is good for balanced training</li>
          <li>High volume may require recovery-focused sessions</li>
        </ul>
        <p className="mt-2 text-sm text-gray-500">
          Track your recent activities to help optimize workout recommendations and prevent overtraining.
        </p>
      </div>
    </div>
  );
};

export default TrainingLoadForm; 