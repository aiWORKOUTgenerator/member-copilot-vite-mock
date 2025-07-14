import React from 'react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';

const ExperienceStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  getFieldError
}) => {
  const experienceOptions: OptionConfig[] = [
    {
      value: 'Beginner',
      label: 'New to Exercise',
      description: 'New to fitness or returning after a break'
    },
    {
      value: 'Intermediate',
      label: 'Some Experience',
      description: 'Regular exercise routine for 6+ months'
    },
    {
      value: 'Advanced',
      label: 'Advanced Athlete',
      description: 'Consistent training for 2+ years'
    }
  ];

  const physicalActivityOptions: OptionConfig[] = [
    {
      value: 'sedentary',
      label: 'SEDENTARY',
      description: 'Little to no activity; mostly sitting with minimal or no exercise.'
    },
    {
      value: 'light',
      label: 'LIGHT ACTIVITY',
      description: 'Occasional light activity like walking, gardening, or housework.'
    },
    {
      value: 'moderate',
      label: 'MODERATELY ACTIVE',
      description: 'Regular light to moderate activity 3–4 times a week, such as walking or cycling.'
    },
    {
      value: 'very',
      label: 'VERY ACTIVE',
      description: 'Daily intense activity such as running, HIIT, competitive sports, or physical labor.'
    }
  ];

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Experience & Activity"
        description="Help us understand your current fitness level and activity patterns"
      />

      <div className="space-y-8">
        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Experience Level
          </div>
          <OptionGrid
            options={experienceOptions}
            selectedValues={profileData.experienceLevel}
            onSelect={(value: string) => onInputChange('experienceLevel', value)}
            columns={3}
            variant="default"
            error={getFieldError ? getFieldError('experienceLevel') : undefined}
            aria-label="Select your fitness experience level"
          />
        </div>

        <div>
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm">
              Physical Activity Assessment
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How would you best describe your <span className="uppercase font-bold">physical activity</span> over the last 90 days?
              </h3>
              <p className="text-sm text-blue-700">
                Please select the option that most accurately represents your typical activity level over the past 3 months.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <OptionGrid
              options={physicalActivityOptions}
              selectedValues={profileData.physicalActivity}
              onSelect={(value: string) => onInputChange('physicalActivity', value)}
              columns={3}
              variant="default"
              error={getFieldError ? getFieldError('physicalActivity') : undefined}
              aria-label="Select your current physical activity level"
            />
          </div>
        </div>

        {/* Progress Indication */}
        {profileData.experienceLevel && profileData.physicalActivity && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">
                Great! We'll tailor your workout recommendations based on your {profileData.experienceLevel.toLowerCase()} level and your recent activity patterns.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceStep; 