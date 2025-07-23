import { ProfileFields } from '../types/profile.types';
import { DEFAULT_VALUES, DERIVED_VALUE_MAPS } from '../constants/DefaultValues';
import { filterAvailableEquipment } from '../../../../../utils/equipmentRecommendations';

/**
 * Maps profile fields with proper type checking and defaults
 */
export function mapProfileFields(data: any): ProfileFields {
  const defaultProfile = DEFAULT_VALUES.profile;

  // Map fields with type checking and defaults
  const mappedData: Partial<ProfileFields> = {
    // Experience & Activity
    experienceLevel: data.experienceLevel || defaultProfile.experienceLevel,
    physicalActivity: data.physicalActivity || defaultProfile.physicalActivity,

    // Time & Commitment
    preferredDuration: data.preferredDuration || defaultProfile.preferredDuration,
    timeCommitment: data.timeCommitment || defaultProfile.timeCommitment,
    intensityLevel: data.intensityLevel || defaultProfile.intensityLevel,

    // Preferences (Array handling)
    preferredActivities: Array.isArray(data.preferredActivities) ? 
      data.preferredActivities : 
      defaultProfile.preferredActivities,
    availableLocations: Array.isArray(data.availableLocations) ? 
      data.availableLocations : 
      defaultProfile.availableLocations,

    // Goals
    primaryGoal: data.primaryGoal || defaultProfile.primaryGoal,
    goalTimeline: data.goalTimeline || defaultProfile.goalTimeline,

    // Personal Information
    age: data.age || defaultProfile.age,
    gender: data.gender || defaultProfile.gender,
    height: data.height || defaultProfile.height,
    weight: data.weight || defaultProfile.weight,

    // Health & Safety
    hasCardiovascularConditions: data.hasCardiovascularConditions || defaultProfile.hasCardiovascularConditions,
    injuries: Array.isArray(data.injuries) ? 
      data.injuries : 
      defaultProfile.injuries
  };

  // Calculate derived fields
  const calculatedFitnessLevel = DERIVED_VALUE_MAPS.calculateFitnessLevel(
    mappedData.experienceLevel!,
    mappedData.physicalActivity!
  );

  const calculatedWorkoutIntensity = DERIVED_VALUE_MAPS.calculateWorkoutIntensity(
    mappedData.intensityLevel!,
    mappedData.timeCommitment!
  );

  // Filter equipment based on location
  const availableEquipment = filterAvailableEquipment(
    mappedData.primaryGoal!,
    data.availableEquipment || defaultProfile.availableEquipment,
    mappedData.availableLocations!
  );

  // Return complete profile with derived fields
  return {
    ...mappedData,
    calculatedFitnessLevel,
    calculatedWorkoutIntensity,
    availableEquipment
  } as ProfileFields;
}

/**
 * Formats array values for display
 */
export function formatArrayValue(value: string[] | undefined, defaultValue: string[]): string {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultValue.join(', ');
  }
  return value.join(', ');
}

/**
 * Formats height value to consistent format
 */
export function formatHeight(value: string | undefined): string {
  if (!value) return DEFAULT_VALUES.profile.height;

  // Convert to standard format if needed
  if (value.includes('\'')) {
    // Already in imperial format
    return value;
  } else if (value.toLowerCase().includes('cm')) {
    // Already in metric format
    return value;
  } else {
    // Try to parse as number and convert to metric
    const height = parseInt(value);
    if (!isNaN(height)) {
      return `${height}cm`;
    }
  }

  return DEFAULT_VALUES.profile.height;
}

/**
 * Formats weight value to consistent format
 */
export function formatWeight(value: string | undefined): string {
  if (!value) return DEFAULT_VALUES.profile.weight;

  // Convert to standard format if needed
  if (value.toLowerCase().includes('lbs') || value.toLowerCase().includes('kg')) {
    // Already in proper format
    return value;
  } else {
    // Try to parse as number and convert to metric
    const weight = parseInt(value);
    if (!isNaN(weight)) {
      return `${weight}kg`;
    }
  }

  return DEFAULT_VALUES.profile.weight;
}

/**
 * Formats soreness data to consistent format
 */
export function formatSorenessData(data: Record<string, { selected: boolean; rating: number }> | undefined): string[] {
  if (!data) return [];

  return Object.entries(data)
    .filter(([_, info]) => info.selected)
    .map(([area, info]) => `${area} (Level ${info.rating})`);
} 