import React from 'react';
import { Clock } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import { Tooltip } from '../../../shared';
import ProfileHeader from '../ProfileHeader';

const TimeCommitmentStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  getFieldError
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
    { 
      value: 'lightly', 
      label: 'Lightly Active',
      description: 'Start with easy, low-effort moves—think brisk walks around the block or gentle yoga stretches a few times a week.'
    },
    { 
      value: 'light-moderate', 
      label: 'Light to Moderately Active',
      description: 'A step up—regular brisk walks or casual bike rides most days.'
    },
    { 
      value: 'moderately', 
      label: 'Moderately Active',
      description: 'Add a bit more challenge: try steady bike rides, longer walks, or beginner-friendly aerobics classes 3–4 times weekly.'
    },
    { 
      value: 'active', 
      label: 'Active',
      description: 'Move up to workouts that get your heart pumping—jogging, swimming, or joining a recreational sports team most days.'
    },
    { 
      value: 'very', 
      label: 'Very Active',
      description: 'Make exercise part of your daily routine: go for runs, follow a solid strength workout plan, or take high-energy fitness classes.'
    },
    { 
      value: 'extremely', 
      label: 'Extremely Active',
      description: 'Push your limits with intense sessions every day—think competitive sports training, advanced weightlifting, or hardcore HIIT workouts.'
    }
  ];

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Time & Commitment"
        description="Help us understand how much time you can dedicate to your fitness journey"
      />

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
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
              Target Activity Level
            </div>
            <Tooltip 
              content="Choose your target activity level based on the types and intensity of exercises you'd like to do."
              showIcon={true}
              iconClassName="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <></>
            </Tooltip>
          </div>
          <OptionGrid
            options={intensityOptions}
            selectedValues={profileData.intensityLevel}
            onSelect={(value: string) => onInputChange('intensityLevel', value)}
            variant="default"
            columns={3}
            className="[&_button]:w-full"
            useTooltips={true}
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
                Great! We'll plan {profileData.preferredDuration} workouts, {profileData.timeCommitment} days per week at a {profileData.intensityLevel} activity level.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCommitmentStep; 