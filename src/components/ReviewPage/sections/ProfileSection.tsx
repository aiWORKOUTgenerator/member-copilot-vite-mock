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

interface ProfileSectionProps {
  profileData: ProfileData;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profileData }) => {
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
            value={profileData.experienceLevel} 
            icon={User} 
          />
          <DataRow 
            label="Current Activity Level" 
            value={getActivityLevelDisplay(profileData.physicalActivity)} 
            icon={Activity} 
          />
          <DataRow 
            label="Activity Description" 
            value={getActivityLevelDescription(profileData.physicalActivity)} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Time & Intensity */}
      <ProfileSectionComponent title="Time & Intensity" icon={Clock} gradient="from-green-500 to-teal-500">
        <div className="space-y-3">
          <DataRow 
            label="Preferred Duration" 
            value={profileData.preferredDuration} 
            icon={Clock}
          />
          <DataRow 
            label="Weekly Commitment" 
            value={`${profileData.timeCommitment} days per week`}
            icon={Calendar} 
          />
          <DataRow 
            label="Intensity Level" 
            value={getIntensityDescription(profileData.intensityLevel)}
            icon={Zap} 
          />
          <DataRow 
            label="Time Investment" 
            value={(() => {
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
            value={profileData.preferredActivities.map(activity => (
              <span key={activity} className="inline-block px-2 py-1 m-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                {activity}
              </span>
            ))}
            icon={Activity} 
          />
          <DataRow 
            label="Available Training Locations" 
            value={profileData.availableLocations.map(location => (
              <span key={location} className="inline-block px-2 py-1 m-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {location}
              </span>
            ))}
            icon={Home} 
          />
          <DataRow 
            label="Available Equipment" 
            value={profileData.availableEquipment.map(equipment => (
              <span key={equipment} className="inline-block px-2 py-1 m-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                {equipment}
              </span>
            ))}
            icon={Dumbbell} 
          />
          <DataRow 
            label="Workout Environment" 
            value={(() => {
              const environments = profileData.availableLocations.map(getEnvironmentDescription);
              return environments.length > 0 ? 
                environments.join(' • ') : 
                'Body Weight';
            })()}
            icon={Home} 
          />
          <DataRow 
            label="Training Style" 
            value={getTrainingStyle(profileData.preferredActivities, profileData.availableEquipment)}
            icon={Dumbbell} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Goals & Timeline */}
      <ProfileSectionComponent title="Goals & Timeline" icon={Target} gradient="from-orange-500 to-red-500">
        <div className="space-y-3">
          <DataRow label="Primary Goal" value={profileData.primaryGoal} icon={Target} />
          <DataRow label="Timeline" value={profileData.goalTimeline} icon={Clock} />
          <DataRow 
            label="Goal Focus" 
            value={getGoalFocusDescription(profileData.primaryGoal)} 
          />
        </div>
      </ProfileSectionComponent>

      {/* Physical Metrics */}
      <ProfileSectionComponent title="Physical Metrics" icon={User} gradient="from-green-500 to-teal-500">
        <div className="space-y-3">
          <DataRow label="Age" value={`${profileData.age} years`} />
          <DataRow label="Height" value={profileData.height} />
          <DataRow label="Weight" value={`${profileData.weight} lbs`} />
          <DataRow label="Gender" value={profileData.gender} />
        </div>
      </ProfileSectionComponent>

      {/* Health & Safety */}
      <ProfileSectionComponent title="Health & Safety" icon={Heart} gradient="from-red-500 to-pink-500">
        <div className="space-y-3">
          <DataRow 
            label="Cardiovascular Conditions" 
            value={profileData.hasCardiovascularConditions} 
            icon={profileData.hasCardiovascularConditions === 'No' ? CheckCircle : AlertTriangle}
          />
          <DataRow 
            label="Current Injuries" 
            value={profileData.injuries} 
            icon={profileData.injuries[0] === 'No Injuries' ? CheckCircle : AlertTriangle}
          />
        </div>
      </ProfileSectionComponent>
    </div>
  );
}; 