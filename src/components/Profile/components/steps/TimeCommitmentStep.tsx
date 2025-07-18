import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';

const TimeCommitmentStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  getFieldError
}) => {
  const [showDurationInfo, setShowDurationInfo] = React.useState(false);
  const [showCommitmentInfo, setShowCommitmentInfo] = React.useState(false);
  const [showIntensityInfo, setShowIntensityInfo] = React.useState(false);

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
      label: 'Become Lightly Active',
      description: 'Build a foundation of regular movement with gentle activities like walking, light stretching, and basic body weight exercises.'
    },
    { 
      value: 'light-moderate', 
      label: 'Become Light to Moderately Active',
      description: 'Develop consistent exercise habits with regular walks, beginner-friendly workouts, and recreational activities.'
    },
    { 
      value: 'moderately', 
      label: 'Become Moderately Active',
      description: 'Establish a solid fitness routine with regular cardio, strength training, and structured workout programs.'
    },
    { 
      value: 'active', 
      label: 'Become Very Active',
      description: 'Build an active lifestyle with challenging workouts, sports participation, and high-energy fitness activities.'
    },
    { 
      value: 'very', 
      label: 'Become Extremely Active',
      description: 'Achieve peak fitness with intense training, competitive sports, and advanced workout programs.'
    },
    { 
      value: 'extremely', 
      label: 'Become Elite Athlete',
      description: 'Reach elite performance levels with specialized training, competitive athletics, and maximum intensity workouts.'
    }
  ];

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Time & Intensity"
        description="Help us understand your schedule and preferred workout intensity"
      />

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
              Preferred Workout Duration
            </div>
            <button 
              onClick={() => setShowDurationInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle duration information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Duration Information Panel */}
          <div className={`mb-6 bg-green-50 border border-green-100 rounded-lg p-6 ${showDurationInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-green-800 font-semibold mb-3">Workout Duration</h4>
              <p className="text-gray-700 mb-4">
                Choose how long you'd like your typical workout sessions to last. This helps us design workouts that fit your schedule while meeting your fitness goals.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">Duration considerations:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Includes warm-up and cool-down time
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Can be adjusted based on workout type
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Affects exercise selection and intensity
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <OptionGrid
            options={durationOptions}
            selectedValues={profileData.preferredDuration}
            onSelect={(value: string) => onInputChange('preferredDuration', value)}
            variant="default"
            columns={4}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('preferredDuration') : undefined}
            aria-label="Select your preferred workout duration"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
              Weekly Time Commitment
            </div>
            <button 
              onClick={() => setShowCommitmentInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle commitment information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Commitment Information Panel */}
          <div className={`mb-6 bg-green-50 border border-green-100 rounded-lg p-6 ${showCommitmentInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-green-800 font-semibold mb-3">Weekly Commitment</h4>
              <p className="text-gray-700 mb-4">
                Select how many days per week you can commit to working out. This helps us create a sustainable schedule that balances progress with recovery.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">We'll use this to:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Plan optimal workout frequency
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Balance exercise and recovery days
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Create a sustainable long-term schedule
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <OptionGrid
            options={commitmentOptions}
            selectedValues={profileData.timeCommitment}
            onSelect={(value: string) => onInputChange('timeCommitment', value)}
            variant="default"
            columns={4}
            useTooltips={true}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('timeCommitment') : undefined}
            aria-label="Select your weekly time commitment"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
              Target Activity Level
            </div>
            <button 
              onClick={() => setShowIntensityInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle intensity information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Intensity Information Panel */}
          <div className={`mb-6 bg-green-50 border border-green-100 rounded-lg p-6 ${showIntensityInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-green-800 font-semibold mb-3">Target Activity Level</h4>
              <p className="text-gray-700 mb-4">
                Choose your long-term fitness goal. This helps us plan your progression from your current activity level to where you want to be.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">This determines:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Your progression timeline and milestones
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    How quickly we increase workout intensity
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    The types of activities we'll introduce over time
                  </li>
                </ul>
              </div>
            </div>
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
                Great! We'll plan {profileData.preferredDuration} workouts, {profileData.timeCommitment} days per week, progressing toward your goal of becoming {profileData.intensityLevel}.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCommitmentStep; 