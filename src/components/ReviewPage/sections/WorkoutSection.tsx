import React from 'react';
import { Sparkles, Target, Clock, Battery, AlertTriangle, Activity, Dumbbell } from 'lucide-react';
import { PerWorkoutOptions } from '../../../types/core';
import { ProfileData } from '../../Profile/types/profile.types';
import { WORKOUT_FOCUS_MUSCLE_GROUPS } from '../../../types/workout-focus.types';
import { WORKOUT_EQUIPMENT_OPTIONS, filterAvailableEquipment } from '../../../utils/equipmentRecommendations';
import { DataRow } from '../components';
import { DisplayWorkoutFocus } from '../types';
import { getEnergyLevelDescription } from '../utils';

interface WorkoutSectionProps {
  profileData: ProfileData;
  displayWorkoutFocus: DisplayWorkoutFocus;
}

export const WorkoutSection: React.FC<Omit<WorkoutSectionProps, 'workoutFocusData'>> = ({ 
  profileData, 
  displayWorkoutFocus 
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Workout */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          <DataRow 
            label="Primary Focus" 
            value={String(displayWorkoutFocus?.workoutFocus)} 
            icon={Target} 
          />
          <DataRow 
            label="Duration" 
            value={String(displayWorkoutFocus?.duration)} 
            icon={Clock} 
          />
          <DataRow 
            label="Energy Level" 
            value={getEnergyLevelDescription(String(displayWorkoutFocus?.energyLevel || ''))} 
            icon={Battery} 
          />
          <DataRow 
            label="Muscle Soreness" 
            value={(() => {
              if (!displayWorkoutFocus?.currentSoreness.length) {
                return ['No reported soreness'];
              }
              return displayWorkoutFocus.currentSoreness.map(soreness => 
                soreness.area === 'General Soreness' 
                  ? `Level ${soreness.level}/10 (General)`
                  : `${soreness.area} (Level ${soreness.level})`
              );
            })()} 
            icon={AlertTriangle} 
          />
        </div>
      </div>

      {/* Training Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          <DataRow 
            label="Equipment Needed" 
            value={(() => {
              if (!displayWorkoutFocus?.workoutFocus || !profileData?.availableEquipment) {
                return ['Body Weight'];
              }

              // Filter equipment based on what the user has available
              const filteredEquipment = filterAvailableEquipment(
                String(displayWorkoutFocus.workoutFocus),
                profileData.availableEquipment,
                profileData.availableLocations
              );
              
              return filteredEquipment;
            })()} 
            icon={Dumbbell} 
          />
          {/* Equipment Options */}
          {displayWorkoutFocus?.workoutFocus && WORKOUT_EQUIPMENT_OPTIONS[displayWorkoutFocus.workoutFocus] && (
            <div className="text-sm text-gray-600 italic pl-4 border-l-2 border-gray-200">
              All possible equipment: {WORKOUT_EQUIPMENT_OPTIONS[displayWorkoutFocus.workoutFocus].equipment.join(', ')}
            </div>
          )}
          {displayWorkoutFocus?.workoutFocus && WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus] && (
            <>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Target Muscle Groups</h4>
                {WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus].primaryMuscleGroups.map((group, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="text-sm font-medium text-gray-700">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-gray-600 mt-1">{group.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Workout Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold">Workout Summary</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Focus:</span>
            <span className="font-medium">{displayWorkoutFocus?.workoutFocus}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{displayWorkoutFocus?.duration}</span>
          </div>
          <div className="flex justify-between">
            <span>Energy Level:</span>
            <span className="font-medium">{displayWorkoutFocus?.energyLevel}</span>
          </div>
          {displayWorkoutFocus?.currentSoreness.length > 0 && (
            <div className="flex justify-between">
              <span>Soreness:</span>
              <span className="font-medium">
                {displayWorkoutFocus.currentSoreness.map(soreness => 
                  soreness.area === 'General Soreness' 
                    ? `Level ${soreness.level}/10`
                    : `${soreness.area} (${soreness.level})`
                ).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 