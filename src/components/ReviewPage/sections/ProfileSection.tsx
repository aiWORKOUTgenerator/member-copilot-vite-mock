import React from 'react';
import { User, Activity, Clock, Calendar, Zap, Settings, Home, Dumbbell, Target, Heart, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProfileData } from '../../Profile/types/profile.types';
import { ProfileSection as ProfileSectionComponent, DataRow } from '../components';
import { 
  getActivityLevelDisplay, 
  getActivityLevelDescription, 
  getIntensityDescription, 
  calculateTimeInvestment, 
  getGoalFocusDescription, 
  getEnvironmentDescription, 
  getTrainingStyle 
} from '../utils';
import { calculateWorkoutIntensity, getFitnessLevelDescription, getWorkoutIntensityDetails } from '../../../utils/fitnessLevelCalculator';
import { mapExperienceLevelToFitnessLevel } from '../../../utils/configUtils';
import { aiLogger } from '../../../services/ai/logging/AILogger';

interface ProfileSectionProps {
  profileData: ProfileData;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profileData }) => {
  // Safety check for profileData
  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Profile data not available</p>
      </div>
    );
  }

  // Calculate workout intensity if not already set
  const calculatedWorkoutIntensity = profileData.calculatedWorkoutIntensity || 
    (profileData.experienceLevel && profileData.intensityLevel ? 
      calculateWorkoutIntensity(
        mapExperienceLevelToFitnessLevel(profileData.experienceLevel),
        profileData.intensityLevel
      ) : 
      undefined
    );

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Fitness Profile</h2>
        <p className="text-gray-600">The foundation that shapes your workout framework</p>
      </div>

      {/* Experience & Activity */}
      <ProfileSectionComponent title="Experience & Activity" icon={Activity} gradient="from-blue-500 to-purple-500">
        <div className="space-y-3">
          <DataRow 
            label="Experience Level" 
            value={profileData.experienceLevel || 'Not specified'} 
            icon={User} 
          />
          <DataRow 
            label="Current Activity Level" 
            value={profileData.physicalActivity ? getActivityLevelDisplay(profileData.physicalActivity) : 'Not specified'} 
            icon={Activity} 
          />
          <DataRow 
            label="Activity Description" 
            value={profileData.physicalActivity ? getActivityLevelDescription(profileData.physicalActivity) : 'Not specified'} 
          />
          <DataRow 
            label="Calculated Fitness Level" 
            value={profileData.calculatedFitnessLevel ? 
              `${profileData.calculatedFitnessLevel.charAt(0).toUpperCase() + profileData.calculatedFitnessLevel.slice(1)}` : 
              'Not calculated - please complete experience and activity levels'
            }
          />
          {profileData.calculatedFitnessLevel && (
            <DataRow 
              label="Fitness Level Description" 
              value={getFitnessLevelDescription(profileData.calculatedFitnessLevel)}
            />
          )}
        </div>
      </ProfileSectionComponent>

      {/* Time & Intensity */}
      <ProfileSectionComponent title="Time & Intensity" icon={Clock} gradient="from-green-500 to-teal-500">
        <div className="space-y-3">
          <DataRow 
            label="Preferred Duration" 
            value={profileData.preferredDuration || 'Not specified'} 
            icon={Clock}
          />
          <DataRow 
            label="Weekly Commitment" 
            value={profileData.timeCommitment ? `${profileData.timeCommitment} days per week` : 'Not specified'}
            icon={Calendar} 
          />
          <DataRow 
            label="Workout Intensity" 
            value={profileData.calculatedWorkoutIntensity ? 
              `${profileData.calculatedWorkoutIntensity.charAt(0).toUpperCase() + profileData.calculatedWorkoutIntensity.slice(1)} Intensity` : 
              'Not calculated - please complete time and intensity preferences'
            }
            icon={Zap} 
          />
          {profileData.calculatedWorkoutIntensity && (
            <DataRow 
              label="Intensity Description" 
              value={getWorkoutIntensityDetails(profileData.calculatedWorkoutIntensity).description}
            />
          )}
          <DataRow 
            label="Target Activity Level" 
            value={profileData.intensityLevel ? 
              profileData.intensityLevel.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
              'Not specified'
            }
            icon={Target}
          />
          <DataRow 
            label="Time Investment" 
            value={(() => {
              if (!profileData.preferredDuration || !profileData.timeCommitment) {
                return 'Not calculated - please complete profile';
              }
              
              try {
                const { minWeekly, maxWeekly, targetStatus, statusColor } = calculateTimeInvestment(
                  profileData.preferredDuration, 
                  profileData.timeCommitment
                );
                
                return (
                  <div className="space-y-1">
                    <div>{minWeekly} - {maxWeekly} minutes per week</div>
                    <div className={`text-sm px-2 py-1 rounded-full inline-block ${statusColor}`}>
                      {targetStatus} (150 min/week)
                    </div>
                  </div>
                );
              } catch (error) {
                aiLogger.error({
                  error: error instanceof Error ? error : new Error(String(error)),
                  context: 'time investment calculation',
                  component: 'ProfileSection',
                  severity: 'low',
                  userImpact: false
                });
                return 'Error calculating time investment';
              }
            })()}
            icon={Clock} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Preferences & Resources */}
      <ProfileSectionComponent title="Preferences & Resources" icon={Settings} gradient="from-purple-500 to-pink-500">
        <div className="space-y-3">
          <DataRow 
            label="Preferred Activities" 
            value={profileData.preferredActivities?.map(activity => (
              <span key={activity} className="inline-block px-2 py-1 m-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                {activity}
              </span>
            )) || 'Not specified'}
            icon={Activity} 
          />
          <DataRow 
            label="Available Training Locations" 
            value={profileData.availableLocations?.map(location => (
              <span key={location} className="inline-block px-2 py-1 m-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {location}
              </span>
            )) || 'Not specified'}
            icon={Home} 
          />
          <DataRow 
            label="Available Equipment" 
            value={profileData.availableEquipment?.map(equipment => (
              <span key={equipment} className="inline-block px-2 py-1 m-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                {equipment}
              </span>
            )) || 'Not specified'}
            icon={Dumbbell} 
          />
          <DataRow 
            label="Workout Environment" 
            value={(() => {
              try {
                const environments = profileData.availableLocations?.map(getEnvironmentDescription) || [];
                return environments.length > 0 ? 
                  environments.join(' • ') : 
                  'Body Weight';
              } catch (error) {
                aiLogger.error({
                  error: error instanceof Error ? error : new Error(String(error)),
                  context: 'environment description',
                  component: 'ProfileSection',
                  severity: 'low',
                  userImpact: false
                });
                return 'Body Weight';
              }
            })()}
            icon={Home} 
          />
          <DataRow 
            label="Training Style" 
            value={(() => {
              try {
                return getTrainingStyle(profileData.preferredActivities || [], profileData.availableEquipment || []);
              } catch (error) {
                aiLogger.error({
                  error: error instanceof Error ? error : new Error(String(error)),
                  context: 'training style calculation',
                  component: 'ProfileSection',
                  severity: 'low',
                  userImpact: false
                });
                return 'Not calculated';
              }
            })()}
            icon={Dumbbell} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Goals & Timeline */}
      <ProfileSectionComponent title="Goals & Timeline" icon={Target} gradient="from-orange-500 to-red-500">
        <div className="space-y-3">
          <DataRow label="Primary Goal" value={profileData.primaryGoal || 'Not specified'} icon={Target} />
          <DataRow label="Timeline" value={profileData.goalTimeline || 'Not specified'} icon={Clock} />
          <DataRow 
            label="Goal Focus" 
            value={profileData.primaryGoal ? getGoalFocusDescription(profileData.primaryGoal) : 'Not specified'} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Physical Metrics */}
      <ProfileSectionComponent title="Physical Metrics" icon={User} gradient="from-green-500 to-teal-500">
        <div className="space-y-3">
          <DataRow label="Age" value={profileData.age ? `${profileData.age} years` : 'Not specified'} />
          <DataRow label="Height" value={profileData.height || 'Not specified'} />
          <DataRow label="Weight" value={profileData.weight ? `${profileData.weight} lbs` : 'Not specified'} />
          <DataRow label="Gender" value={profileData.gender || 'Not specified'} />
        </div>
      </ProfileSectionComponent>

      {/* Health & Safety */}
      <ProfileSectionComponent title="Health & Safety" icon={Heart} gradient="from-red-500 to-pink-500">
        <div className="space-y-3">
          <DataRow 
            label="Cardiovascular Conditions" 
            value={profileData.hasCardiovascularConditions || 'Not specified'} 
            icon={profileData.hasCardiovascularConditions === 'No' ? CheckCircle : AlertTriangle}
          />
          <DataRow 
            label="Current Injuries" 
            value={profileData.injuries || 'Not specified'} 
            icon={profileData.injuries?.[0] === 'No Injuries' ? CheckCircle : AlertTriangle}
          />
        </div>
      </ProfileSectionComponent>
    </div>
  );
}; 