import React from 'react';
import { Sparkles, Target, Clock, Battery, AlertTriangle, Activity, Dumbbell } from 'lucide-react';
import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { ProfileData } from '../../Profile/types/profile.types';
import { WORKOUT_FOCUS_MUSCLE_GROUPS } from '../../../types/workout-focus.types';
import { WORKOUT_EQUIPMENT_OPTIONS, filterAvailableEquipment } from '../../../utils/equipmentRecommendations';
import { ProfileSection as ProfileSectionComponent, DataRow } from '../components';
import { DisplayWorkoutFocus } from '../types';
import { getEnergyLevelDescription } from '../utils';

interface WorkoutSectionProps {
  workoutFocusData: PerWorkoutOptions;
  profileData: ProfileData;
  displayWorkoutFocus: DisplayWorkoutFocus;
}

export const WorkoutSection: React.FC<WorkoutSectionProps> = ({ 
  workoutFocusData, 
  profileData, 
  displayWorkoutFocus 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Workout Focus</h2>
        <p className="text-gray-600">Your specific selections for this workout session</p>
      </div>

      {/* Quick Workout */}
      <ProfileSectionComponent title="Quick Workout" icon={Sparkles} gradient="from-purple-500 to-indigo-500">
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
                `${soreness.area} (Level ${soreness.level})`
              );
            })()} 
            icon={AlertTriangle} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Training Details */}
      <ProfileSectionComponent title="Training Details" icon={Activity} gradient="from-teal-500 to-blue-500">
        <div className="space-y-3">
          <DataRow 
            label="Equipment Needed" 
            value={(() => {
              if (!displayWorkoutFocus?.workoutFocus || !profileData?.availableEquipment) {
                return ['Body Weight'];
              }

              // Filter equipment based on what the user has available
              return filterAvailableEquipment(
                String(displayWorkoutFocus.workoutFocus),
                profileData.availableEquipment,
                profileData.availableLocations
              );
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
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Training Emphasis</h4>
                <div className="text-sm text-gray-600">
                  {WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus].emphasis}
                </div>
              </div>
            </>
          )}
        </div>
      </ProfileSectionComponent>

      {/* Workout Summary Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Workout Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80">Focus</div>
            <div className="font-medium">{String(displayWorkoutFocus?.workoutFocus)}</div>
          </div>
          <div>
            <div className="opacity-80">Duration</div>
            <div className="font-medium">{String(displayWorkoutFocus?.duration)}</div>
          </div>
          <div>
            <div className="opacity-80">Energy</div>
            <div className="font-medium">{String(displayWorkoutFocus?.energyLevel)}</div>
          </div>
          <div>
            <div className="opacity-80">Soreness</div>
            <div className="font-medium">
              {displayWorkoutFocus?.currentSoreness.length ? 
                `${displayWorkoutFocus.currentSoreness.length} area(s)` : 
                'None reported'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 