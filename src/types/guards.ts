// Type Guards for PerWorkoutOptions and Related Data Structures
import { 
  PerWorkoutOptions, 
  CategoryRatingData, 
  DurationConfigurationData, 
  WorkoutFocusConfigurationData, 
  EquipmentSelectionData,
  HierarchicalSelectionData
} from './enhanced-workout-types';
import { dataTransformers } from '../utils/dataTransformers';
import { ProfileData } from '../components/Profile/types/profile.types';
import { UserProfile, FitnessLevel } from './user';

// ============================================================================
// PROFILE DATA TYPE GUARDS
// ============================================================================

/**
 * Type guard for ProfileData experience level
 */
export const isValidExperienceLevel = (level: any): level is ProfileData['experienceLevel'] => {
  return ['New to Exercise', 'Some Experience', 'Advanced Athlete'].includes(level);
};

/**
 * Type guard for ProfileData physical activity
 */
export const isValidPhysicalActivity = (activity: any): activity is ProfileData['physicalActivity'] => {
  return ['sedentary', 'light', 'moderate', 'very', 'extremely', 'varies'].includes(activity);
};

/**
 * Type guard for ProfileData preferred duration
 */
export const isValidPreferredDuration = (duration: any): duration is ProfileData['preferredDuration'] => {
  return ['15-30 min', '30-45 min', '45-60 min', '60+ min'].includes(duration);
};

/**
 * Type guard for ProfileData time commitment
 */
export const isValidTimeCommitment = (commitment: any): commitment is ProfileData['timeCommitment'] => {
  return ['2-3', '3-4', '4-5', '6-7'].includes(commitment);
};

/**
 * Type guard for ProfileData intensity level
 */
export const isValidIntensityLevel = (intensity: any): intensity is ProfileData['intensityLevel'] => {
  return ['lightly', 'light-moderate', 'moderately', 'active', 'very', 'extremely'].includes(intensity);
};

/**
 * Type guard for ProfileData primary goal
 */
export const isValidPrimaryGoal = (goal: any): goal is ProfileData['primaryGoal'] => {
  return [
    'Weight Loss', 'Strength', 'Cardio Health', 'Flexibility & Mobility',
    'General Health', 'Muscle Gain', 'Athletic Performance', 'Energy Levels',
    'Body Toning', 'Sleep Quality', 'Stress Reduction', 'Functional Fitness'
  ].includes(goal);
};

/**
 * Type guard for ProfileData goal timeline
 */
export const isValidGoalTimeline = (timeline: any): timeline is ProfileData['goalTimeline'] => {
  return ['1 month', '3 months', '6 months', '1 year+'].includes(timeline);
};

/**
 * Type guard for ProfileData age
 */
export const isValidAge = (age: any): age is ProfileData['age'] => {
  return ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].includes(age);
};

/**
 * Type guard for ProfileData gender
 */
export const isValidGender = (gender: any): gender is ProfileData['gender'] => {
  return ['male', 'female', 'other', 'prefer-not-to-say'].includes(gender);
};

/**
 * Type guard for ProfileData cardiovascular conditions
 */
export const isValidCardiovascularConditions = (conditions: any): conditions is ProfileData['hasCardiovascularConditions'] => {
  return [
    'No', 'Yes - but cleared for exercise', 'Yes - and need medical clearance', 'Prefer not to answer'
  ].includes(conditions);
};

/**
 * Type guard for ProfileData injuries
 */
export const isValidInjuries = (injuries: any): injuries is ProfileData['injuries'] => {
  if (!Array.isArray(injuries)) return false;
  const validInjuries = [
    'No Injuries', 'Lower Back', 'Knee', 'Shoulder', 'Neck',
    'Ankle', 'Wrist or Elbow', 'Hip', 'Foot or Arch'
  ];
  return injuries.every(injury => validInjuries.includes(injury));
};

/**
 * Type guard for ProfileData preferred activities
 */
export const isValidPreferredActivities = (activities: any): activities is ProfileData['preferredActivities'] => {
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
export const isValidAvailableLocations = (locations: any): locations is ProfileData['availableLocations'] => {
  if (!Array.isArray(locations)) return false;
  const validLocations = [
    'Gym', 'Home Gym', 'Home', 'Parks/Outdoor Spaces', 'Swimming Pool', 'Running Track'
  ];
  return locations.every(location => validLocations.includes(location));
};

/**
 * Type guard for ProfileData available equipment
 */
export const isValidAvailableEquipment = (equipment: any): equipment is ProfileData['availableEquipment'] => {
  if (!Array.isArray(equipment)) return false;
  const validEquipment = [
    'Barbells & Weight Plates', 'Strength Machines',
    'Cardio Machines (Treadmill, Elliptical, Bike)', 'Functional Training Area (Kettlebells, Resistance Bands, TRX)',
    'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)', 'Pool (If available)',
    'Dumbbells', 'Resistance Bands', 'Kettlebells',
    'Cardio Machine (Treadmill, Bike)', 'Yoga Mat & Stretching Space',
    'Body Weight', 'Yoga Mat', 'Suspension Trainer/TRX', 'No equipment required'
  ];
  return equipment.every(eq => validEquipment.includes(eq));
};

/**
 * Comprehensive type guard for ProfileData - More lenient for partial data
 */
export const isValidProfileData = (data: any): data is ProfileData => {
  if (!data || typeof data !== 'object') return false;
  
  // Check that all required fields exist (but allow empty/undefined values)
  const requiredFields = [
    'experienceLevel', 'physicalActivity', 'preferredDuration', 'timeCommitment',
    'intensityLevel', 'preferredActivities', 'availableLocations', 'availableEquipment',
    'primaryGoal', 'goalTimeline', 'age', 'height', 'weight', 'gender',
    'hasCardiovascularConditions', 'injuries'
  ];
  
  // Ensure all required fields exist
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`ProfileData missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate experience level if present
  if (data.experienceLevel && !isValidExperienceLevel(data.experienceLevel)) {
    console.warn(`Invalid experience level: ${data.experienceLevel}`);
    return false;
  }
  
  // Validate physical activity if present
  if (data.physicalActivity && !isValidPhysicalActivity(data.physicalActivity)) {
    console.warn(`Invalid physical activity: ${data.physicalActivity}`);
    return false;
  }
  
  // Validate preferred duration if present
  if (data.preferredDuration && !isValidPreferredDuration(data.preferredDuration)) {
    console.warn(`Invalid preferred duration: ${data.preferredDuration}`);
    return false;
  }
  
  // Validate time commitment if present
  if (data.timeCommitment && !isValidTimeCommitment(data.timeCommitment)) {
    console.warn(`Invalid time commitment: ${data.timeCommitment}`);
    return false;
  }
  
  // Validate intensity level if present
  if (data.intensityLevel && !isValidIntensityLevel(data.intensityLevel)) {
    console.warn(`Invalid intensity level: ${data.intensityLevel}`);
    return false;
  }
  
  // Validate primary goal if present
  if (data.primaryGoal && !isValidPrimaryGoal(data.primaryGoal)) {
    console.warn(`Invalid primary goal: ${data.primaryGoal}`);
    return false;
  }
  
  // Validate goal timeline if present
  if (data.goalTimeline && !isValidGoalTimeline(data.goalTimeline)) {
    console.warn(`Invalid goal timeline: ${data.goalTimeline}`);
    return false;
  }
  
  // Validate age if present
  if (data.age && !isValidAge(data.age)) {
    console.warn(`Invalid age: ${data.age}`);
    return false;
  }
  
  // Validate gender if present
  if (data.gender && !isValidGender(data.gender)) {
    console.warn(`Invalid gender: ${data.gender}`);
    return false;
  }
  
  // Validate cardiovascular conditions if present
  if (data.hasCardiovascularConditions && !isValidCardiovascularConditions(data.hasCardiovascularConditions)) {
    console.warn(`Invalid cardiovascular conditions: ${data.hasCardiovascularConditions}`);
    return false;
  }
  
  // Validate string fields are strings
  if (data.height !== undefined && typeof data.height !== 'string') {
    console.warn(`Height must be a string, got: ${typeof data.height}`);
    return false;
  }
  
  if (data.weight !== undefined && typeof data.weight !== 'string') {
    console.warn(`Weight must be a string, got: ${typeof data.weight}`);
    return false;
  }
  
  // Validate array fields are arrays (but allow empty arrays)
  if (data.preferredActivities !== undefined && !Array.isArray(data.preferredActivities)) {
    console.warn(`Preferred activities must be an array, got: ${typeof data.preferredActivities}`);
    return false;
  }
  
  if (data.availableLocations !== undefined && !Array.isArray(data.availableLocations)) {
    console.warn(`Available locations must be an array, got: ${typeof data.availableLocations}`);
    return false;
  }
  
  if (data.availableEquipment !== undefined && !Array.isArray(data.availableEquipment)) {
    console.warn(`Available equipment must be an array, got: ${typeof data.availableEquipment}`);
    return false;
  }
  
  if (data.injuries !== undefined && !Array.isArray(data.injuries)) {
    console.warn(`Injuries must be an array, got: ${typeof data.injuries}`);
    return false;
  }
  
  // If arrays have content, validate the content
  if (data.preferredActivities && data.preferredActivities.length > 0 && !isValidPreferredActivities(data.preferredActivities)) {
    console.warn(`Invalid preferred activities: ${data.preferredActivities}`);
    return false;
  }
  
  if (data.availableLocations && data.availableLocations.length > 0 && !isValidAvailableLocations(data.availableLocations)) {
    console.warn(`Invalid available locations: ${data.availableLocations}`);
    return false;
  }
  
  if (data.availableEquipment && data.availableEquipment.length > 0 && !isValidAvailableEquipment(data.availableEquipment)) {
    console.warn(`Invalid available equipment: ${data.availableEquipment}`);
    return false;
  }
  
  if (data.injuries && data.injuries.length > 0 && !isValidInjuries(data.injuries)) {
    console.warn(`Invalid injuries: ${data.injuries}`);
    return false;
  }
  
  return true;
};

// ============================================================================
// USER PROFILE TYPE GUARDS
// ============================================================================

/**
 * Type guard for UserProfile fitness level
 */
export const isValidFitnessLevel = (level: any): level is FitnessLevel => {
  return ['new to exercise', 'some experience', 'advanced athlete'].includes(level);
};

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
    typeof profile.learningProfile.adaptationSpeed === 'string'
  );
};

// ============================================================================
// CONVERSION VALIDATION UTILITIES
// ============================================================================

/**
 * Validate ProfileData to UserProfile conversion
 */
export const validateProfileConversion = (profileData: ProfileData, userProfile: UserProfile): boolean => {
  try {
    // Validate that fitness level was converted correctly
    const expectedFitnessLevel = profileData.experienceLevel.toLowerCase() as FitnessLevel;
    if (userProfile.fitnessLevel !== expectedFitnessLevel) {
      console.warn('Fitness level conversion mismatch:', {
        expected: expectedFitnessLevel,
        actual: userProfile.fitnessLevel
      });
      return false;
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