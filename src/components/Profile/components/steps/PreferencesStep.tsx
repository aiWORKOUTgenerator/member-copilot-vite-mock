import React from 'react';
import { Activity } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { SectionHeader } from '../../../shared';
import { OptionGrid, OptionConfig } from '../../shared';

const PreferencesStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  onArrayToggle,
  getFieldError,
  validateField
}) => {
  const workoutTypeOptions: OptionConfig[] = [
    { value: 'strength', label: 'Strength Training', description: 'Build muscle and power' },
    { value: 'cardio', label: 'Cardiovascular', description: 'Improve heart health and endurance' },
    { value: 'flexibility', label: 'Flexibility & Mobility', description: 'Enhance range of motion' },
    { value: 'mixed', label: 'Mixed Training', description: 'Combination of all types' }
  ];

  const activityOptions: OptionConfig[] = [
    { value: 'Running', label: 'Running' },
    { value: 'Walking', label: 'Walking' },
    { value: 'Cycling', label: 'Cycling' },
    { value: 'Swimming', label: 'Swimming' },
    { value: 'Yoga', label: 'Yoga' },
    { value: 'Pilates', label: 'Pilates' },
    { value: 'Weight Lifting', label: 'Weight Lifting' },
    { value: 'Bodyweight', label: 'Bodyweight' },
    { value: 'Dancing', label: 'Dancing' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Hiking', label: 'Hiking' },
    { value: 'Martial Arts', label: 'Martial Arts' }
  ];

  const equipmentOptions: OptionConfig[] = [
    { value: 'None (Bodyweight)', label: 'None (Bodyweight)' },
    { value: 'Dumbbells', label: 'Dumbbells' },
    { value: 'Resistance Bands', label: 'Resistance Bands' },
    { value: 'Yoga Mat', label: 'Yoga Mat' },
    { value: 'Pull-up Bar', label: 'Pull-up Bar' },
    { value: 'Kettlebells', label: 'Kettlebells' },
    { value: 'Barbell', label: 'Barbell' },
    { value: 'Gym Access', label: 'Gym Access' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Exercise Preferences & Resources</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
            Preferred Workout Type
          </div>
          <OptionGrid
            options={workoutTypeOptions}
            selectedValues={profileData.workoutType}
            onSelect={(value: string) => onInputChange('workoutType', value)}
            variant="default"
            columns={2}
            error={getFieldError ? getFieldError('workoutType') : undefined}
            aria-label="Select your preferred workout type"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Activities You Enjoy (Select all that apply)
          </div>
          <OptionGrid
            options={activityOptions}
            selectedValues={profileData.preferredActivities}
            onSelect={(value: string) => onArrayToggle('preferredActivities', value)}
            multiple={true}
            columns={3}
            variant="default"
            error={getFieldError ? getFieldError('preferredActivities') : undefined}
            aria-label="Select activities you enjoy"
          />
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Available Equipment
          </div>
          <OptionGrid
            options={equipmentOptions}
            selectedValues={profileData.availableEquipment}
            onSelect={(value: string) => onArrayToggle('availableEquipment', value)}
            multiple={true}
            columns={3}
            variant="default"
            error={getFieldError ? getFieldError('availableEquipment') : undefined}
            aria-label="Select your available equipment"
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep; 