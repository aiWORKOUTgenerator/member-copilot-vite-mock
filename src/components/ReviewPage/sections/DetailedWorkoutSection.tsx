import React from 'react';
import { Settings, Target, Clock, Battery, AlertTriangle, Activity, Dumbbell, Zap, Heart, Brain, Moon, TrendingUp } from 'lucide-react';
import { PerWorkoutOptions } from '../../../types/core';
import { ProfileData } from '../../Profile/types/profile.types';
import { ProfileSection as ProfileSectionComponent, DataRow } from '../components';
import { DETAILED_WORKOUT_CONSTANTS } from '../../../services/ai/external/features/detailed-workout-setup/constants/detailed-workout.constants';

interface DetailedWorkoutSectionProps {
  profileData: ProfileData;
  workoutFocusData: PerWorkoutOptions;
}

export const DetailedWorkoutSection: React.FC<DetailedWorkoutSectionProps> = ({ 
  profileData, 
  workoutFocusData 
}) => {
  // Helper functions to format data
  const formatDuration = (duration: number | any) => {
    if (typeof duration === 'number') {
      return `${duration} minutes`;
    }
    if (duration?.duration) {
      return `${duration.duration} minutes`;
    }
    return 'Not specified';
  };

  const formatFocus = (focus: string | any) => {
    if (typeof focus === 'string') {
      return focus;
    }
    if (focus?.label) {
      return focus.label;
    }
    if (focus?.focus) {
      return focus.focus;
    }
    return 'Not specified';
  };

  const formatEnergyLevel = (energy: number | any) => {
    if (typeof energy === 'number') {
      return `${energy}/10`;
    }
    if (energy?.rating) {
      return `${energy.rating}/10`;
    }
    return 'Not specified';
  };

  const formatSoreness = (soreness: string[] | any) => {
    if (!soreness || soreness.length === 0) {
      return ['No reported soreness'];
    }
    if (Array.isArray(soreness)) {
      return soreness.map(s => {
        if (typeof s === 'string') {
          const [area, intensity] = s.split('_');
          return intensity ? `${area} (${intensity})` : area;
        }
        return s;
      });
    }
    return ['Not specified'];
  };

  const formatEquipment = (equipment: string[] | any) => {
    if (!equipment || equipment.length === 0) {
      return ['No equipment selected'];
    }
    if (Array.isArray(equipment)) {
      return equipment;
    }
    return ['Not specified'];
  };

  const formatFocusAreas = (areas: string[] | any) => {
    if (!areas || areas.length === 0) {
      return ['No focus areas selected'];
    }
    if (Array.isArray(areas)) {
      return areas;
    }
    return ['Not specified'];
  };

  const formatRestPeriods = (restPeriods: string | any) => {
    if (!restPeriods) return 'Not specified';
    const periodMap: Record<string, string> = {
      'short': 'Short (30-60 seconds)',
      'moderate': 'Moderate (1-2 minutes)',
      'long': 'Long (2-3 minutes)'
    };
    return periodMap[restPeriods] || restPeriods;
  };

  const formatSleepQuality = (sleep: number | any) => {
    if (typeof sleep === 'number') {
      return `${sleep} hours`;
    }
    return 'Not specified';
  };

  const formatStressLevel = (stress: any) => {
    if (!stress) return 'Not specified';
    if (typeof stress === 'number') {
      return `${stress}/10`;
    }
    if (stress?.rating) {
      return `${stress.rating}/10`;
    }
    return 'Not specified';
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Workout Configuration</h2>
        <p className="text-gray-600">Your comprehensive workout setup and preferences</p>
      </div>

      {/* Training Structure */}
      <ProfileSectionComponent title="Training Structure" icon={Settings} gradient="from-blue-500 to-purple-500">
        <div className="space-y-3">
          <DataRow 
            label="Workout Focus" 
            value={formatFocus(workoutFocusData.customization_focus)} 
            icon={Target} 
          />
          <DataRow 
            label="Duration" 
            value={formatDuration(workoutFocusData.customization_duration)} 
            icon={Clock} 
          />
          <DataRow 
            label="Equipment" 
            value={formatEquipment(workoutFocusData.customization_equipment)} 
            icon={Dumbbell} 
          />
          <DataRow 
            label="Focus Areas" 
            value={formatFocusAreas(workoutFocusData.customization_areas)} 
            icon={Activity} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Physical State Assessment */}
      <ProfileSectionComponent title="Physical State" icon={Heart} gradient="from-red-500 to-pink-500">
        <div className="space-y-3">
          <DataRow 
            label="Energy Level" 
            value={formatEnergyLevel(workoutFocusData.customization_energy)} 
            icon={Battery} 
          />
          <DataRow 
            label="Muscle Soreness" 
            value={formatSoreness(workoutFocusData.customization_soreness)} 
            icon={AlertTriangle} 
          />
          <DataRow 
            label="Sleep Duration" 
            value={formatSleepQuality(workoutFocusData.customization_sleep)} 
            icon={Moon} 
          />
          <DataRow 
            label="Stress Level" 
            value={formatStressLevel(workoutFocusData.customization_stress)} 
            icon={Brain} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Training Details */}
      <ProfileSectionComponent title="Training Details" icon={Activity} gradient="from-teal-500 to-blue-500">
        <div className="space-y-3">
          <DataRow 
            label="Rest Periods" 
            value={formatRestPeriods(workoutFocusData.customization_restPeriods)} 
            icon={Clock} 
          />
          {workoutFocusData.customization_intensity && (
            <DataRow 
              label="Intensity Preference" 
              value={workoutFocusData.customization_intensity} 
              icon={Zap} 
            />
          )}
          {workoutFocusData.customization_include && workoutFocusData.customization_include.length > 0 && (
            <DataRow 
              label="Include Exercises" 
              value={workoutFocusData.customization_include} 
              icon={TrendingUp} 
            />
          )}
          {workoutFocusData.customization_exclude && workoutFocusData.customization_exclude.length > 0 && (
            <DataRow 
              label="Exclude Exercises" 
              value={workoutFocusData.customization_exclude} 
              icon={AlertTriangle} 
            />
          )}
        </div>
      </ProfileSectionComponent>

      {/* Workout Summary Card */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Detailed Workout Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80">Focus</div>
            <div className="font-medium">{formatFocus(workoutFocusData.customization_focus)}</div>
          </div>
          <div>
            <div className="opacity-80">Duration</div>
            <div className="font-medium">{formatDuration(workoutFocusData.customization_duration)}</div>
          </div>
          <div>
            <div className="opacity-80">Energy</div>
            <div className="font-medium">{formatEnergyLevel(workoutFocusData.customization_energy)}</div>
          </div>
          <div>
            <div className="opacity-80">Equipment</div>
            <div className="font-medium">
              {formatEquipment(workoutFocusData.customization_equipment).length} item(s)
            </div>
          </div>
          <div>
            <div className="opacity-80">Focus Areas</div>
            <div className="font-medium">
              {formatFocusAreas(workoutFocusData.customization_areas).length} area(s)
            </div>
          </div>
          <div>
            <div className="opacity-80">Soreness</div>
            <div className="font-medium">
              {formatSoreness(workoutFocusData.customization_soreness).length} area(s)
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Notes */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Configuration Notes</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• This detailed configuration provides comprehensive workout customization</p>
          <p>• Physical state assessment helps optimize workout intensity and exercise selection</p>
          <p>• Equipment and focus areas ensure targeted training</p>
          <p>• Rest periods and intensity preferences customize workout structure</p>
        </div>
      </div>
    </div>
  );
}; 