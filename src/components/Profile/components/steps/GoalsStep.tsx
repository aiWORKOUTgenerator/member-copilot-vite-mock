import React from 'react';
import { Target } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { SectionHeader } from '../../../shared';
import { OptionGrid, OptionConfig } from '../../shared';

const GoalsStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  onArrayToggle,
  getFieldError,
  validateField
}) => {
  const goalOptions: OptionConfig[] = [
    { value: 'weight-loss', label: 'Weight Loss', description: 'Reduce body weight and fat' },
    { value: 'muscle-gain', label: 'Muscle Gain', description: 'Build lean muscle mass' },
    { value: 'endurance', label: 'Improve Endurance', description: 'Enhance cardiovascular fitness' },
    { value: 'strength', label: 'Increase Strength', description: 'Build power and strength' },
    { value: 'flexibility', label: 'Improve Flexibility', description: 'Enhance mobility and range of motion' },
    { value: 'general', label: 'General Fitness', description: 'Overall health and wellness' }
  ];

  const timelineOptions: OptionConfig[] = [
    { value: '1 month', label: '1 month' },
    { value: '3 months', label: '3 months' },
    { value: '6 months', label: '6 months' },
    { value: '1 year+', label: '1 year+' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Goals & Timeline</h2>
      </div>

      <div className="space-y-8">
        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Primary Goal
          </div>
          <OptionGrid
            options={goalOptions}
            selectedValues={profileData.primaryGoal}
            onSelect={(value: string) => onInputChange('primaryGoal', value)}
            variant="default"
            columns={2}
            error={getFieldError ? getFieldError('primaryGoal') : undefined}
            aria-label="Select your primary fitness goal"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Goal Timeline
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
                Perfect! We'll create a {profileData.goalTimeline.toLowerCase()} plan focused on {profileData.primaryGoal.replace('-', ' ')}.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsStep; 