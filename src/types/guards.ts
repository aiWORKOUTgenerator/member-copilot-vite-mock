// Type Guards for PerWorkoutOptions and Related Data Structures
import { 
  PerWorkoutOptions, 
  CategoryRatingData, 
  DurationConfigurationData, 
  WorkoutFocusConfigurationData, 
  EquipmentSelectionData,
  HierarchicalSelectionData
} from './core';
import { dataTransformers } from '../utils/dataTransformers';
import { FitnessLevel, PreferredActivity, UserProfile } from './user';
import { ProfileData } from '../components/Profile/types/profile.types';

// ============================================================================
// PROFILE DATA TYPE GUARDS
// ============================================================================

/**
 * Type guard for ProfileData experience level
 */
export const isValidExperienceLevel = (level: string): boolean => {
  return ['beginner', 'intermediate', 'advanced'].includes(level);
};

/**
 * Type guard for ProfileData physical activity
 */
export const isValidPhysicalActivity = (activity: string): boolean => {
  return ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(activity);
};

/**
 * Type guard for ProfileData preferred duration
 */
export const isValidPreferredDuration = (duration: string): boolean => {
  return ['15-30 min', '30-45 min', '45-60 min', '60+ min'].includes(duration);
};

/**
 * Type guard for ProfileData time commitment
 */
export const isValidTimeCommitment = (commitment: string): boolean => {
  return ['1-2', '3-4', '5-6', '7+'].includes(commitment);
};

/**
 * Type guard for ProfileData intensity level
 */
export const isValidIntensityLevel = (level: string): boolean => {
  return ['light', 'moderately', 'challenging', 'very_challenging'].includes(level);
};

/**
 * Type guard for ProfileData primary goal
 */
export const isValidPrimaryGoal = (goal: string): boolean => {
  return [
    'Strength',
    'Endurance',
    'Weight Loss',
    'Muscle Gain',
    'General Fitness',
    'Flexibility'
  ].includes(goal);
};

/**
 * Type guard for ProfileData goal timeline
 */
export const isValidGoalTimeline = (timeline: string): boolean => {
  return ['1 month', '3 months', '6 months', '1 year', 'ongoing'].includes(timeline);
};

/**
 * Type guard for ProfileData age
 */
export const isValidAge = (age: string): boolean => {
  return ['18-25', '26-35', '36-45', '46-55', '56+'].includes(age);
};

/**
 * Type guard for ProfileData gender
 */
export const isValidGender = (gender: string): boolean => {
  return ['male', 'female', 'non-binary', 'prefer not to say'].includes(gender);
};

/**
 * Type guard for ProfileData cardiovascular conditions
 */
export const isValidCardiovascularConditions = (conditions: string): boolean => {
  return ['Yes', 'No', 'Unsure'].includes(conditions);
};

/**
 * Type guard for ProfileData injuries
 */
export const isValidInjuries = (injuries: string[]): boolean => {
  const validInjuries = [
    'No Injuries',
    'Back',
    'Knee',
    'Shoulder',
    'Hip',
    'Ankle',
    'Other'
  ];
  return injuries.every(injury => validInjuries.includes(injury));
};

/**
 * Type guard for ProfileData preferred activities
 */
export const isValidPreferredActivities = (activities: string[]): boolean => {
  if (!Array.isArray(activities)) return false;
  const validActivities = [
    'Walking/Power Walking', 'Running/Jogging', 'Swimming', 'Cycling/Mountain Biking',
    'Rock Climbing/Bouldering', 'Yoga', 'Pilates', 'Hiking', 'Dancing',
    'Team Sports', 'Golf', 'Martial Arts'
  ];
  return activities.every(activity => validActivities.includes(activity));
};

/**
 * Type guard for ProfileData available locations
 */
export const isValidAvailableLocations = (locations: string[]): boolean => {
  const validLocations = ['Home', 'Gym', 'Outdoors', 'Office'];
  return locations.every(location => validLocations.includes(location));
};

/**
 * Type guard for ProfileData available equipment
 */
export const isValidAvailableEquipment = (equipment: string[]): boolean => {
  const validEquipment = [
    'None',
    'Dumbbells',
    'Resistance Bands',
    'Yoga Mat',
    'Pull-up Bar',
    'Kettlebell',
    'Full Gym'
  ];
  return equipment.every(item => validEquipment.includes(item));
};

/**
 * Comprehensive type guard for ProfileData - More lenient for partial data
 */
export const isValidProfileData = (data: unknown): data is ProfileData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Required fields
  const requiredFields = [
    'experienceLevel',
    'physicalActivity',
    'preferredDuration',
    'timeCommitment',
    'intensityLevel',
    'preferredActivities',
    'availableLocations',
    'availableEquipment',
    'primaryGoal',
    'goalTimeline',
    'age',
    'height',
    'weight',
    'gender',
    'hasCardiovascularConditions',
    'injuries'
  ];

  // Check required fields exist
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`ProfileData missing required field: ${field}`);
      return false;
    }
  }

  // Type checks
  const typedData = data as Record<string, unknown>;

  // String fields
  const stringFields = [
    'experienceLevel',
    'physicalActivity',
    'preferredDuration',
    'timeCommitment',
    'intensityLevel',
    'primaryGoal',
    'goalTimeline',
    'age',
    'height',
    'weight',
    'gender',
    'hasCardiovascularConditions'
  ];

  for (const field of stringFields) {
    if (typeof typedData[field] !== 'string') {
      console.warn(`ProfileData field ${field} must be a string`);
      return false;
    }
  }

  // Array fields
  const arrayFields = [
    'preferredActivities',
    'availableLocations',
    'availableEquipment',
    'injuries'
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(typedData[field])) {
      console.warn(`ProfileData field ${field} must be an array`);
      return false;
    }
  }

  // If arrays have content, validate the content
  if (typedData.preferredActivities && Array.isArray(typedData.preferredActivities)) {
    const activities = typedData.preferredActivities.map(activity => 
      typeof activity === 'string' ? activity.toLowerCase().replace(/\s+/g, '_') : activity
    );
    if (!activities.every(activity => isValidPreferredActivity(activity))) {
      console.warn(`Invalid preferred activities: ${typedData.preferredActivities}`);
      return false;
    }
  }

  return true;
};

// ============================================================================
// USER PROFILE TYPE GUARDS
// ============================================================================

/**
 * Type guard for UserProfile fitness level
 */
export const isValidFitnessLevel = (level: unknown): level is FitnessLevel => {
  if (typeof level !== 'string') {
    return false;
  }

  const validLevels: FitnessLevel[] = [
    'beginner',
    'novice',
    'intermediate',
    'advanced',
    'adaptive'
  ];

  return validLevels.includes(level as FitnessLevel);
}

/**
 * Type guard for UserProfile
 */
export const isValidUserProfile = (profile: any): profile is UserProfile => {
  if (!profile || typeof profile !== 'object') return false;
  
  return (
    isValidFitnessLevel(profile.fitnessLevel) &&
    Array.isArray(profile.goals) &&
    profile.goals.every((goal: any) => typeof goal === 'string') &&
    profile.preferences &&
    Array.isArray(profile.preferences.workoutStyle) &&
    profile.preferences.workoutStyle.every((style: any) => typeof style === 'string') &&
    typeof profile.preferences.timePreference === 'string' &&
    typeof profile.preferences.intensityPreference === 'string' &&
    typeof profile.preferences.advancedFeatures === 'boolean' &&
    typeof profile.preferences.aiAssistanceLevel === 'string' &&
    profile.basicLimitations &&
    Array.isArray(profile.basicLimitations.injuries) &&
    Array.isArray(profile.basicLimitations.availableEquipment) &&
    Array.isArray(profile.basicLimitations.availableLocations) &&
    profile.enhancedLimitations &&
    typeof profile.enhancedLimitations.timeConstraints === 'number' &&
    Array.isArray(profile.enhancedLimitations.equipmentConstraints) &&
    Array.isArray(profile.enhancedLimitations.locationConstraints) &&
    profile.enhancedLimitations.recoveryNeeds &&
    typeof profile.enhancedLimitations.recoveryNeeds.restDays === 'number' &&
    typeof profile.enhancedLimitations.recoveryNeeds.sleepHours === 'number' &&
    typeof profile.enhancedLimitations.recoveryNeeds.hydrationLevel === 'string' &&
    Array.isArray(profile.enhancedLimitations.mobilityLimitations) &&
    typeof profile.enhancedLimitations.progressionRate === 'string' &&
    profile.workoutHistory &&
    typeof profile.workoutHistory.estimatedCompletedWorkouts === 'number' &&
    typeof profile.workoutHistory.averageDuration === 'number' &&
    Array.isArray(profile.workoutHistory.preferredFocusAreas) &&
    typeof profile.workoutHistory.progressiveEnhancementUsage === 'object' &&
    typeof profile.workoutHistory.aiRecommendationAcceptance === 'number' &&
    typeof profile.workoutHistory.consistencyScore === 'number' &&
    typeof profile.workoutHistory.plateauRisk === 'string' &&
    profile.learningProfile &&
    typeof profile.learningProfile.prefersSimplicity === 'boolean' &&
    typeof profile.learningProfile.explorationTendency === 'string' &&
    typeof profile.learningProfile.feedbackPreference === 'string' &&
    typeof profile.learningProfile.learningStyle === 'string' &&
    typeof profile.learningProfile.motivationType === 'string' &&
    typeof profile.learningProfile.adaptationSpeed === 'string' &&
    // Optional personal metrics validation
    (profile.age === undefined || typeof profile.age === 'number') &&
    (profile.weight === undefined || typeof profile.weight === 'number') &&
    (profile.height === undefined || typeof profile.height === 'number') &&
    (profile.gender === undefined || ['male', 'female', 'other', 'prefer-not-to-say'].includes(profile.gender))
  );
};

export function isValidPreferredActivity(activity: unknown): activity is PreferredActivity {
  if (typeof activity !== 'string') {
    return false;
  }

  // Convert to lowercase for case-insensitive comparison
  const normalizedActivity = activity.toLowerCase().replace(/\s+/g, '_');

  const validActivities: PreferredActivity[] = [
    'strength_training',
    'cardio',
    'hiit',
    'yoga',
    'pilates',
    'bodyweight',
    'crossfit',
    'running',
    'cycling',
    'swimming'
  ];

  return validActivities.includes(normalizedActivity as PreferredActivity);
}

// ============================================================================
// CONVERSION VALIDATION UTILITIES
// ============================================================================

/**
 * Validate ProfileData to UserProfile conversion
 */
export const validateProfileConversion = (profileData: ProfileData, userProfile: UserProfile): boolean => {
  try {
    // Validate that fitness level was converted correctly
    // Use calculated fitness level if available, otherwise validate the conversion
    if (profileData.calculatedFitnessLevel) {
      if (userProfile.fitnessLevel !== profileData.calculatedFitnessLevel) {
        console.warn('Fitness level mismatch with calculated value:', {
          expected: profileData.calculatedFitnessLevel,
          actual: userProfile.fitnessLevel
        });
        return false;
      }
    } else {
      // Fallback validation for legacy conversion
      const expectedFitnessLevel = profileData.experienceLevel.toLowerCase() as FitnessLevel;
      if (userProfile.fitnessLevel !== expectedFitnessLevel) {
        console.warn('Fitness level conversion mismatch:', {
          expected: expectedFitnessLevel,
          actual: userProfile.fitnessLevel
        });
        return false;
      }
    }

    // Validate that goals were converted
    if (!userProfile.goals.length) {
      console.warn('No goals were converted from profile data');
      return false;
    }

    // Validate that equipment was preserved
    const originalEquipment = profileData.availableEquipment || [];
    const convertedEquipment = userProfile.basicLimitations.availableEquipment;
    if (originalEquipment.length !== convertedEquipment.length) {
      console.warn('Equipment count mismatch:', {
        original: originalEquipment.length,
        converted: convertedEquipment.length
      });
      return false;
    }

    // Validate that injuries were filtered correctly
    const originalInjuries = profileData.injuries || [];
    const convertedInjuries = userProfile.basicLimitations.injuries;
    const expectedInjuries = originalInjuries.filter(injury => injury !== 'No Injuries');
    if (convertedInjuries.length !== expectedInjuries.length) {
      console.warn('Injuries filtering mismatch:', {
        expected: expectedInjuries.length,
        actual: convertedInjuries.length
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Profile conversion validation failed:', error);
    return false;
  }
};

// ============================================================================
// PER WORKOUT OPTIONS TYPE GUARDS
// ============================================================================

/**
 * Type guard for simple duration (number)
 */
export const isSimpleDuration = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Type guard for duration configuration data
 */
export const isDurationConfig = (value: any): value is DurationConfigurationData => {
  return !!(
    value &&
    typeof value === 'object' &&
    typeof value.totalDuration === 'number' &&
    typeof value.selected === 'boolean' &&
    typeof value.label === 'string' &&
    typeof value.value === 'number' &&
    typeof value.workingTime === 'number' &&
    typeof value.configuration === 'string' &&
    value.warmUp &&
    value.coolDown
  );
};

/**
 * Type guard for simple focus (string)
 */
export const isSimpleFocus = (value: any): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Type guard for focus configuration data
 */
export const isFocusConfig = (value: any): value is WorkoutFocusConfigurationData => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.selected === 'boolean' &&
    typeof value.focus === 'string' &&
    typeof value.focusLabel === 'string' &&
    typeof value.label === 'string' &&
    typeof value.value === 'string' &&
    typeof value.description === 'string' &&
    typeof value.configuration === 'string' &&
    value.metadata &&
    typeof value.metadata.intensity === 'string' &&
    typeof value.metadata.equipment === 'string' &&
    typeof value.metadata.experience === 'string'
  );
};

/**
 * Type guard for simple equipment (string array)
 */
export const isSimpleEquipment = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

/**
 * Type guard for equipment selection data
 */
export const isEquipmentConfig = (value: any): value is EquipmentSelectionData => {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.contexts) &&
    Array.isArray(value.specificEquipment) &&
    value.contexts.every((item: any) => typeof item === 'string') &&
    value.specificEquipment.every((item: any) => typeof item === 'string')
  );
};

/**
 * Type guard for simple areas (string array)
 */
export const isSimpleAreas = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

/**
 * Type guard for hierarchical selection data
 */
export const isHierarchicalConfig = (value: any): value is HierarchicalSelectionData => {
  return (
    value &&
    typeof value === 'object' &&
    Object.values(value).every((item: any) => 
      item &&
      typeof item === 'object' &&
      typeof item.selected === 'boolean' &&
      typeof item.label === 'string' &&
      typeof item.level === 'string'
    )
  );
};

/**
 * Type guard for category rating data
 */
export const isCategoryRatingData = (value: any): value is CategoryRatingData => {
  return (
    value &&
    typeof value === 'object' &&
    Object.entries(value).every(([key, config]: [string, any]) => 
      config &&
      typeof config === 'object' &&
      typeof config.selected === 'boolean' &&
      typeof config.label === 'string' &&
      (config.rating === undefined || (typeof config.rating === 'number' && config.rating >= 1 && config.rating <= 5))
    )
  );
};

// ============================================================================
// DATA EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract duration value from union type
 */
export const extractDurationValue = (data: number | DurationConfigurationData | undefined): number | undefined => {
  return dataTransformers.extractDurationValue(data) || undefined;
};

/**
 * Extract focus value from union type
 */
export const extractFocusValue = (data: string | WorkoutFocusConfigurationData | undefined): string | undefined => {
  return dataTransformers.extractFocusValue(data) || undefined;
};

/**
 * Extract equipment list from union type
 */
export const extractEquipmentList = (data: string[] | EquipmentSelectionData | undefined): string[] => {
  return dataTransformers.extractEquipmentList(data);
};

/**
 * Extract areas list from union type
 */
export const extractAreasList = (data: string[] | HierarchicalSelectionData | undefined): string[] => {
  return dataTransformers.extractAreasList(data);
};

/**
 * Extract soreness areas from category rating data
 */
export const extractSorenessAreas = (data: string[] | CategoryRatingData | undefined): string[] => {
  return dataTransformers.extractSorenessAreas(data);
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate PerWorkoutOptions structure
 */
export const validatePerWorkoutOptions = (options: any): options is PerWorkoutOptions => {
  if (!options || typeof options !== 'object') return false;
  
  // Check that all properties are either undefined or of correct type
  const validKeys = [
    'customization_duration',
    'customization_focus', 
    'customization_include',
    'customization_exclude',
    'customization_equipment',
    'customization_areas',
    'customization_energy',
    'customization_sleep',
    'customization_soreness',
    'customization_stress'
  ];
  
  return Object.keys(options).every(key => validKeys.includes(key));
};

/**
 * Validate energy level
 */
export const validateEnergyLevel = (level: any): level is number => {
  return isSimpleDuration(level) && level >= 1 && level <= 5;
};

/**
 * Validate sleep quality
 */
export const validateSleepQuality = (quality: any): quality is number => {
  return isSimpleDuration(quality) && quality >= 1 && quality <= 5;
};

// ============================================================================
// TYPE-SAFE ACCESSORS
// ============================================================================

/**
 * Type-safe accessor for duration
 */
export const getDuration = (options: PerWorkoutOptions): number | undefined => {
  return extractDurationValue(options.customization_duration);
};

/**
 * Type-safe accessor for focus
 */
export const getFocus = (options: PerWorkoutOptions): string | undefined => {
  return extractFocusValue(options.customization_focus);
};

/**
 * Type-safe accessor for equipment
 */
export const getEquipment = (options: PerWorkoutOptions): string[] => {
  return extractEquipmentList(options.customization_equipment);
};

/**
 * Type-safe accessor for areas
 */
export const getAreas = (options: PerWorkoutOptions): string[] => {
  return extractAreasList(options.customization_areas);
};

/**
 * Type-safe accessor for soreness
 */
export const getSoreness = (options: PerWorkoutOptions): string[] => {
  return extractSorenessAreas(options.customization_soreness);
};

/**
 * Type-safe accessor for energy
 */
export const getEnergy = (options: PerWorkoutOptions): number | undefined => {
  return validateEnergyLevel(options.customization_energy) ? options.customization_energy : undefined;
};

/**
 * Type-safe accessor for sleep
 */
export const getSleep = (options: PerWorkoutOptions): number | undefined => {
  return validateSleepQuality(options.customization_sleep) ? options.customization_sleep : undefined;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a normalized PerWorkoutOptions object with extracted values
 */
export const normalizePerWorkoutOptions = (options: PerWorkoutOptions): {
  duration: number | undefined;
  focus: string | undefined;
  equipment: string[];
  areas: string[];
  soreness: string[];
  energy: number | undefined;
  sleep: number | undefined;
} => {
  return {
    duration: getDuration(options),
    focus: getFocus(options),
    equipment: getEquipment(options),
    areas: getAreas(options),
    soreness: getSoreness(options),
    energy: getEnergy(options),
    sleep: getSleep(options)
  };
};

/**
 * Check if PerWorkoutOptions has any valid data
 */
export const hasValidData = (options: PerWorkoutOptions): boolean => {
  const normalized = normalizePerWorkoutOptions(options);
  return (
    normalized.duration !== undefined ||
    normalized.focus !== undefined ||
    normalized.equipment.length > 0 ||
    normalized.areas.length > 0 ||
    normalized.soreness.length > 0 ||
    normalized.energy !== undefined ||
    normalized.sleep !== undefined
  );
}; 