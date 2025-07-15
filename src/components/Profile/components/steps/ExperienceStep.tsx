import React from 'react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import { Tooltip } from '../../../shared';
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
      description: 'New to fitness or returning after a break. We\'ll focus on building basic habits and proper form with gentle progression.'
    },
    {
      value: 'Intermediate',
      label: 'Some Experience',
      description: 'Regular exercise routine for 6+ months. You\'re comfortable with basic movements and ready for more structured programming.'
    },
    {
      value: 'Advanced',
      label: 'Advanced Athlete',
      description: 'Consistent training for 2+ years with solid technique. You\'re ready for complex programming and advanced training methods.'
    }
  ];

  const physicalActivityOptions: OptionConfig[] = [
    {
      value: 'sedentary',
      label: 'SEDENTARY',
      description: 'Little to no physical activity beyond daily living. Mostly sitting with minimal or no structured exercise.'
    },
    {
      value: 'light',
      label: 'LIGHT ACTIVITY',
      description: 'Occasional light activities like leisurely walking, light housework, or gentle stretching 1-2 times per week.'
    },
    {
      value: 'moderate',
      label: 'MODERATELY ACTIVE',
      description: 'Regular light to moderate activity 3-4 times per week such as brisk walking, cycling, or recreational sports.'
    },
    {
      value: 'very',
      label: 'VERY ACTIVE',
      description: 'Consistent daily activity including structured exercise, sports, or physically demanding work. You prioritize fitness in your routine.'
    },
    {
      value: 'extremely',
      label: 'EXTREMELY ACTIVE',
      description: 'Intense activity multiple times a day, including athletic training or heavy labor.'
    },
    {
      value: 'varies',
      label: 'VARIES',
      description: 'Activity level changes weekly, from light to intense exercise.'
    }
  ];

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Experience & Activity"
        description="Help us understand your current fitness level and activity patterns to create the perfect workout plan"
      />

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm">
              Experience Level
            </div>
            <Tooltip 
              content="Your fitness experience helps us determine appropriate exercise complexity, intensity progression, and safety considerations for your workouts."
              showIcon={true}
              iconClassName="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <></>
            </Tooltip>
          </div>
          <OptionGrid
            options={experienceOptions}
            selectedValues={profileData.experienceLevel}
            onSelect={(value: string) => onInputChange('experienceLevel', value)}
            columns={3}
            variant="default"
            useTooltips={true}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('experienceLevel') : undefined}
            aria-label="Select your fitness experience level"
          />
        </div>

                <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm">
              Current Activity Level
            </div>
            <Tooltip 
              content="How would you best describe your physical activity over the last 90 days? Please select the option that most accurately represents your typical activity level over the past 3 months."
              showIcon={true}
              iconClassName="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <></>
            </Tooltip>
          </div>
          
          <div>
            <OptionGrid
              options={physicalActivityOptions}
              selectedValues={profileData.physicalActivity}
              onSelect={(value: string) => onInputChange('physicalActivity', value)}
              columns={3}
              variant="default"
              useTooltips={true}
              className="[&_button]:w-full"
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
                Perfect! We'll tailor your workout recommendations based on your {profileData.experienceLevel.toLowerCase()} level and your recent activity patterns.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceStep; 