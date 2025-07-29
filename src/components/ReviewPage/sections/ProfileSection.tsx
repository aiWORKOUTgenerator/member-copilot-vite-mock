import React from 'react';
import { User, Activity, Clock, Calendar, Zap, Settings, Home, Dumbbell, Target, Heart, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProfileData } from '../../Profile/types/profile.types';
import { DataRow } from '../components';
import { SectionHeader } from '../components/SectionHeader';
import { 
  getActivityLevelDisplay, 
  getActivityLevelDescription, 
  getIntensityDescription, 
  calculateTimeInvestment, 
  getGoalFocusDescription, 
  getEnvironmentDescription, 
  getTrainingStyle 
} from '../utils';
import { calculateWorkoutIntensity, getFitnessLevelDescription, getWorkoutIntensityDetails, calculateFitnessLevel } from '../../../utils/fitnessLevelCalculator';
import { aiLogger } from '../../../services/ai/logging/AILogger';

// Section types for type safety
type SectionKey = 'profile' | 'timeIntensity' | 'preferences' | 'goals' | 'metrics' | 'health';

interface ProfileSectionProps {
  profileData: ProfileData;
  expandedSections: Record<SectionKey, boolean>;
  onToggleSection: (section: SectionKey) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  profileData,
  expandedSections,
  onToggleSection
}) => {
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
        profileData.calculatedFitnessLevel || 
          (profileData.experienceLevel && profileData.physicalActivity ? 
            calculateFitnessLevel(profileData.experienceLevel, profileData.physicalActivity) : 
            'intermediate'
          ),
        profileData.intensityLevel
      ) : 
      undefined
    );

  // Training Style
  const getTrainingStyleDisplay = (activities: string[]) => {
    const styles = activities.map(activity => activity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    return styles.join(', ');
  };

  // Time Investment
  const getTimeInvestmentDisplay = (timeCommitment?: string, preferredDuration?: string) => {
    if (!timeCommitment || !preferredDuration) {
      return 'Not calculated - please complete profile';
    }

    const daysPerWeek = parseInt(timeCommitment.split('-')[0], 10);
    const durationMinutes = parseInt(preferredDuration, 10);
    if (isNaN(daysPerWeek) || isNaN(durationMinutes)) {
      return 'Invalid duration format';
    }

    const minWeekly = durationMinutes * daysPerWeek;
    const maxWeekly = Math.round(durationMinutes * daysPerWeek * 1.2); // 20% buffer

    let targetStatus;
    let statusColor;
    if (minWeekly >= 150) {
      targetStatus = 'Exceeds Target';
      statusColor = 'text-green-700';
    } else if (minWeekly >= 120) {
      targetStatus = 'Meets Target';
      statusColor = 'text-blue-700';
    } else {
      targetStatus = 'Below Target';
      statusColor = 'text-yellow-700';
    }

    return `${minWeekly} - ${maxWeekly} minutes per week (${targetStatus})`;
  };

  // Equipment Display
  const getEquipmentDisplay = (equipment: string[]) => {
    return equipment.map(item => item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
  };

  // Environment Description
  const getEnvironmentDescription = (equipment: string[]) => {
    const hasGymEquipment = equipment.some(item => 
      item.includes('Barbells') || 
      item.includes('Machines') || 
      item.includes('Functional Training Area')
    );
    const hasHomeEquipment = equipment.some(item => 
      item.includes('Dumbbells') || 
      item.includes('Resistance Bands') || 
      item.includes('Bodyweight')
    );

    if (hasGymEquipment && hasHomeEquipment) {
      return 'Gym & Home Training';
    } else if (hasGymEquipment) {
      return 'Gym Training';
    } else if (hasHomeEquipment) {
      return 'Home Training';
    } else {
      return 'Bodyweight Training';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Fitness Profile</h2>
        <p className="text-gray-600">The foundation that shapes your workout framework</p>
      </div>

      {/* Experience & Activity */}
      <div className="space-y-4">
        <SectionHeader
          title="Experience & Activity"
          badge="A"
          badgeColor="purple"
          isExpanded={expandedSections.profile}
          onToggle={() => onToggleSection('profile')}
        />
        {expandedSections.profile && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
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
        )}
      </div>

      {/* Time & Intensity */}
      <div className="space-y-4">
        <SectionHeader
          title="Time & Intensity"
          badge="T"
          badgeColor="green"
          isExpanded={expandedSections.timeIntensity}
          onToggle={() => onToggleSection('timeIntensity')}
        />
        {expandedSections.timeIntensity && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
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
            {calculatedWorkoutIntensity && (
              <DataRow 
                label="Intensity Description" 
                value={getIntensityDescription(calculatedWorkoutIntensity)}
              />
            )}
          </div>
        )}
      </div>

      {/* Preferences & Resources */}
      <div className="space-y-4">
        <SectionHeader
          title="Preferences & Resources"
          badge="P"
          badgeColor="orange"
          isExpanded={expandedSections.preferences}
          onToggle={() => onToggleSection('preferences')}
        />
        {expandedSections.preferences && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
            <DataRow 
              label="Training Style" 
              value={getTrainingStyle(profileData.preferredActivities, profileData.availableEquipment)} 
              icon={Settings}
            />
            <DataRow 
              label="Training Environment" 
              value={getEnvironmentDescription(profileData.availableEquipment)} 
              icon={Home}
            />
            <DataRow 
              label="Available Equipment" 
              value={getEquipmentDisplay(profileData.availableEquipment)} 
              icon={Dumbbell}
            />
          </div>
        )}
      </div>

      {/* Goals & Timeline */}
      <div className="space-y-4">
        <SectionHeader
          title="Goals & Timeline"
          badge="G"
          badgeColor="blue"
          isExpanded={expandedSections.goals}
          onToggle={() => onToggleSection('goals')}
        />
        {expandedSections.goals && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
            <DataRow 
              label="Primary Goal" 
              value={profileData.primaryGoal || 'Not specified'} 
              icon={Target}
            />
            <DataRow 
              label="Goal Focus" 
              value={getGoalFocusDescription(profileData.primaryGoal)} 
            />
            <DataRow 
              label="Time Investment" 
              value={getTimeInvestmentDisplay(profileData.timeCommitment, profileData.preferredDuration)} 
              icon={Clock}
            />
          </div>
        )}
      </div>

      {/* Health & Safety */}
      <div className="space-y-4">
        <SectionHeader
          title="Health & Safety"
          badge="H"
          badgeColor="red"
          isExpanded={expandedSections.health}
          onToggle={() => onToggleSection('health')}
        />
        {expandedSections.health && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
            <DataRow 
              label="Health Status" 
              value={profileData.injuries.includes('No Injuries') ? 'No reported injuries or limitations' : 'Has reported injuries/limitations'} 
              icon={Heart}
              status={profileData.injuries.includes('No Injuries') ? 'success' : 'warning'}
              statusIcon={profileData.injuries.includes('No Injuries') ? CheckCircle : AlertTriangle}
            />
            {!profileData.injuries.includes('No Injuries') && (
              <DataRow 
                label="Reported Injuries" 
                value={profileData.injuries.join(', ')} 
                status="warning"
                statusIcon={AlertTriangle}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 