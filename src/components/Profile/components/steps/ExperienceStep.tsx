import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';

const ExperienceStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  getFieldError
}) => {
  const [showExperienceInfo, setShowExperienceInfo] = React.useState(false);
  const [showActivityInfo, setShowActivityInfo] = React.useState(false);

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
      label: 'Sedentary',
      description: 'Little to no physical activity beyond daily living. Mostly sitting with minimal or no structured exercise.'
    },
    {
      value: 'light',
      label: 'Light Activity',
      description: 'Occasional light activities like leisurely walking, light housework, or gentle stretching 1-2 times per week.'
    },
    {
      value: 'moderate',
      label: 'Moderately Active',
      description: 'Regular light to moderate activity 3-4 times per week such as brisk walking, cycling, or recreational sports.'
    },
    {
      value: 'very',
      label: 'Very Active',
      description: 'Consistent daily activity including structured exercise, sports, or physically demanding work. You prioritize fitness in your routine.'
    },
    {
      value: 'extremely',
      label: 'Extremely Active',
      description: 'Intense activity multiple times a day, including athletic training or heavy labor.'
    },
    {
      value: 'varies',
      label: 'Varies',
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
            <button 
              onClick={() => setShowExperienceInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle experience level information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Experience Information Panel */}
          <div className={`mb-6 bg-blue-50 border border-blue-100 rounded-lg p-6 ${showExperienceInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-blue-800 font-semibold mb-3">Experience Level</h4>
              <p className="text-gray-700 mb-4">
                Your fitness experience helps us determine appropriate exercise complexity, intensity progression, and safety considerations for your workouts.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">Why this matters:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Determines exercise complexity and progression rate
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Helps set appropriate starting weights and intensities
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Guides the level of instruction and form cues provided
                  </li>
                </ul>
              </div>
            </div>
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
            <button 
              onClick={() => setShowActivityInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle activity level information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Activity Information Panel */}
          <div className={`mb-6 bg-blue-50 border border-blue-100 rounded-lg p-6 ${showActivityInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-blue-800 font-semibold mb-3">Current Activity Level</h4>
              <p className="text-gray-700 mb-4">
                How would you best describe your physical activity over the last 90 days? Please select the option that most accurately represents your typical activity level over the past 3 months.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">This helps us:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Establish your current fitness baseline
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Set appropriate workout frequency and intensity
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Plan realistic progression that matches your lifestyle
                  </li>
                </ul>
              </div>
            </div>
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-800 font-medium">
                Great! We'll tailor your plan to match your experience and activity level.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceStep; 