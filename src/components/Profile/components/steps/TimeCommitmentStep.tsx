import React from 'react';
import { Clock } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { SectionHeader } from '../../../shared';
import { OptionGrid, OptionConfig } from '../../shared';

const TimeCommitmentStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  onArrayToggle,
  getFieldError,
  validateField
}) => {
  const durationOptions: OptionConfig[] = [
    { value: '15-30 min', label: '15-30 min' },
    { value: '30-45 min', label: '30-45 min' },
    { value: '45-60 min', label: '45-60 min' },
    { value: '60+ min', label: '60+ min' }
  ];

  const commitmentOptions: OptionConfig[] = [
    { value: '2-3', label: '2-3 days per week', description: 'Light commitment' },
    { value: '3-4', label: '3-4 days per week', description: 'Moderate commitment' },
    { value: '4-5', label: '4-5 days per week', description: 'High commitment' },
    { value: '6-7', label: '6-7 days per week', description: 'Maximum commitment' }
  ];

  const intensityOptions: OptionConfig[] = [
    { value: 'low', label: 'Low Intensity', description: 'Gentle, easy-paced workouts' },
    { value: 'moderate', label: 'Moderate Intensity', description: 'Balanced challenge level' },
    { value: 'high', label: 'High Intensity', description: 'Challenging, vigorous workouts' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Time & Commitment</h2>
      </div>

      <div className="space-y-8">
        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Preferred Workout Duration
          </div>
          <OptionGrid
            options={durationOptions}
            selectedValues={profileData.preferredDuration}
            onSelect={(value: string) => onInputChange('preferredDuration', value)}
            variant="default"
            columns={4}
            error={getFieldError ? getFieldError('preferredDuration') : undefined}
            aria-label="Select your preferred workout duration"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Time Commitment
          </div>
          <OptionGrid
            options={commitmentOptions}
            selectedValues={profileData.timeCommitment}
            onSelect={(value: string) => onInputChange('timeCommitment', value)}
            variant="default"
            columns={2}
            error={getFieldError ? getFieldError('timeCommitment') : undefined}
            aria-label="Select your time commitment level"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Target Activity Level
          </div>
          <OptionGrid
            options={intensityOptions}
            selectedValues={profileData.intensityLevel}
            onSelect={(value: string) => onInputChange('intensityLevel', value)}
            variant="default"
            columns={3}
            error={getFieldError ? getFieldError('intensityLevel') : undefined}
            aria-label="Select your target activity level"
          />
        </div>

        {/* Progress Indication */}
        {profileData.preferredDuration && profileData.timeCommitment && profileData.intensityLevel && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Great! We'll plan {profileData.preferredDuration} workouts, {profileData.timeCommitment} with {profileData.intensityLevel} intensity.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCommitmentStep; 