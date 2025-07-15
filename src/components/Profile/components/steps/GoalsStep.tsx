import React from 'react';
import { Target } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import { Tooltip } from '../../../shared';
import ProfileHeader from '../ProfileHeader';

const GoalsStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  getFieldError
}) => {
  const goalOptions: OptionConfig[] = [
    { 
      value: 'Weight Loss', 
      label: 'Weight Loss',
      description: 'Focus on sustainable weight loss through balanced nutrition and effective exercise combinations'
    },
    { 
      value: 'Strength', 
      label: 'Increase Strength',
      description: 'Build functional strength and power through progressive resistance training'
    },
    { 
      value: 'Cardio Health', 
      label: 'Improve Cardio Health',
      description: 'Enhance cardiovascular endurance and heart health through targeted aerobic exercises'
    },
    { 
      value: 'Flexibility & Mobility', 
      label: 'Improve Flexibility & Mobility',
      description: 'Increase range of motion, reduce stiffness, and improve overall movement quality'
    },
    { 
      value: 'General Health', 
      label: 'General Health',
      description: 'Maintain overall wellness with balanced workouts covering strength, cardio, and flexibility'
    },
    { 
      value: 'Muscle Gain', 
      label: 'Gain Muscle Mass',
      description: 'Build lean muscle mass through structured strength training and proper nutrition'
    },
    { 
      value: 'Athletic Performance', 
      label: 'Athletic Performance',
      description: 'Enhance sport-specific abilities through targeted training and conditioning'
    },
    { 
      value: 'Energy Levels', 
      label: 'Increase Energy Levels',
      description: 'Boost daily energy and vitality through consistent physical activity'
    },
    { 
      value: 'Body Toning', 
      label: 'Body Toning',
      description: 'Define and sculpt muscles while maintaining a lean physique'
    },
    { 
      value: 'Sleep Quality', 
      label: 'Improve Sleep Quality',
      description: 'Enhance sleep patterns through appropriate exercise timing and intensity'
    },
    { 
      value: 'Stress Reduction', 
      label: 'Reduce Stress & Anxiety',
      description: 'Manage stress and improve mental well-being through physical activity'
    },
    { 
      value: 'Functional Fitness', 
      label: 'Improve Functional Fitness',
      description: 'Enhancing your ability to perform everyday activities more safely and efficiently—lifting groceries, climbing stairs, playing with kids—while reducing injury risk'
    }
  ];

  const timelineOptions: OptionConfig[] = [
    { value: '1 month', label: '1 month' },
    { value: '3 months', label: '3 months' },
    { value: '6 months', label: '6 months' },
    { value: '1 year+', label: '1 year+' }
  ];

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Goals & Timeline"
        description="Help us understand what you want to achieve through your fitness journey"
      />

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm">
              Primary Goal
            </div>
            <Tooltip 
              content="Choose your main fitness goal. We'll customize your workout plan to help you achieve this specific objective."
              showIcon={true}
              iconClassName="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <></>
            </Tooltip>
          </div>
          <OptionGrid
            options={goalOptions}
            selectedValues={profileData.primaryGoal}
            onSelect={(value: string) => onInputChange('primaryGoal', value)}
            variant="default"
            columns={2}
            useTooltips={true}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('primaryGoal') : undefined}
            aria-label="Select your primary fitness goal"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm">
              Goal Timeline
            </div>
            <Tooltip 
              content="Select a realistic timeframe for achieving your primary goal. This helps us pace your progression appropriately."
              showIcon={true}
              iconClassName="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <></>
            </Tooltip>
          </div>
          <OptionGrid
            options={timelineOptions}
            selectedValues={profileData.goalTimeline}
            onSelect={(value: string) => onInputChange('goalTimeline', value)}
            variant="default"
            columns={4}
            error={getFieldError ? getFieldError('goalTimeline') : undefined}
            aria-label="Select your goal timeline"
          />
        </div>

        {/* Progress Indication */}
        {profileData.primaryGoal && profileData.goalTimeline && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-orange-800 font-medium">
                Perfect! We'll create a {profileData.goalTimeline.toLowerCase().replace('months', 'month')} plan focused on {profileData.primaryGoal}.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsStep; 