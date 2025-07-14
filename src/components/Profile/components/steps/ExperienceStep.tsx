import React from 'react';
import { Dumbbell } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { SectionHeader } from '../../../shared';
import { OptionGrid, OptionConfig } from '../../shared';

const ExperienceStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  onArrayToggle,
  getFieldError,
  validateField
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Experience & Activity</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Experience Level
          </div>
          <OptionGrid
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' }
            ]}
            selectedValues={profileData.experienceLevel}
            onSelect={(value: string) => onInputChange('experienceLevel', value)}
            columns={3}
            variant="default"
            error={getFieldError ? getFieldError('experienceLevel') : undefined}
            aria-label="Select your fitness experience level"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Current Physical Activity Level
          </div>
          <OptionGrid
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'light', label: 'Light Activity' },
              { value: 'moderate', label: 'Moderately Active' },
              { value: 'very', label: 'Very Active' }
            ]}
            selectedValues={profileData.physicalActivity}
            onSelect={(value: string) => onInputChange('physicalActivity', value)}
            columns={4}
            variant="default"
            error={getFieldError ? getFieldError('physicalActivity') : undefined}
            aria-label="Select your current physical activity level"
          />
        </div>
      </div>
    </div>
  );
};

export default ExperienceStep; 