import type {
  ExperienceLevel,
  PhysicalActivity,
  PreferredDuration,
  TimeCommitment,
  IntensityLevel,
  PreferredActivity,
  AvailableLocation,
  PrimaryGoal,
  GoalTimeline,
  AgeRange,
  Gender,
  CardiovascularCondition,
  Injury,
  FitnessLevel,
  WorkoutIntensity
} from '../types/profile.types';

export const DEFAULT_VALUES = {
  profile: {
    // Experience & Activity
    experienceLevel: 'Some Experience' as ExperienceLevel,
    physicalActivity: 'moderate' as PhysicalActivity,
    calculatedFitnessLevel: 'intermediate' as FitnessLevel,

    // Time & Commitment
    preferredDuration: '30-45 min' as PreferredDuration,
    timeCommitment: '3-4' as TimeCommitment,
    intensityLevel: 'moderately' as IntensityLevel,
    calculatedWorkoutIntensity: 'moderate' as WorkoutIntensity,

    // Preferences
    preferredActivities: ['Walking/Power Walking'] as PreferredActivity[],
    availableLocations: ['Home'] as AvailableLocation[],
    availableEquipment: ['Body Weight'],

    // Goals
    primaryGoal: 'General Health' as PrimaryGoal,
    goalTimeline: '3 months' as GoalTimeline,

    // Personal Info
    age: '26-35' as AgeRange,
    gender: 'prefer-not-to-say' as Gender,
    height: '170cm',
    weight: '70 kg',
    hasCardiovascularConditions: 'No' as CardiovascularCondition,
    injuries: ['No Injuries'] as Injury[]
  },

  workout: {
    customization_focus: 'general',
    customization_duration: 30,
    customization_energy: 7,
    customization_equipment: ['Body Weight']
  }
} as const;

// Mapping functions for derived values
export const DERIVED_VALUE_MAPS = {
  // Map experience level and physical activity to fitness level
  calculateFitnessLevel: (experienceLevel: ExperienceLevel, physicalActivity: PhysicalActivity): FitnessLevel => {
    // Special case: Adaptive level for users with varying activity
    if (physicalActivity === 'varies') {
      return 'adaptive';
    }

    // Level 1: Beginner
    if (experienceLevel === 'New to Exercise' && 
        (physicalActivity === 'sedentary' || physicalActivity === 'light')) {
      return 'beginner';
    }

    // Level 2: Novice
    if ((experienceLevel === 'New to Exercise' && physicalActivity === 'moderate') ||
        (experienceLevel === 'Some Experience' && 
         (physicalActivity === 'sedentary' || physicalActivity === 'light'))) {
      return 'novice';
    }

    // Level 3: Intermediate
    if (experienceLevel === 'Some Experience' && 
        (physicalActivity === 'moderate' || physicalActivity === 'very')) {
      return 'intermediate';
    }

    // Level 4: Advanced
    if ((experienceLevel === 'Advanced Athlete') ||
        (experienceLevel === 'Some Experience' && physicalActivity === 'extremely')) {
      return 'advanced';
    }

    // Default fallback for edge cases
    return 'intermediate';
  },

  // Map intensity level and time commitment to workout intensity
  calculateWorkoutIntensity: (intensityLevel: IntensityLevel, timeCommitment: TimeCommitment): WorkoutIntensity => {
    // High intensity if very active or high time commitment
    if (intensityLevel === 'extremely' || intensityLevel === 'very' || timeCommitment === '6-7') {
      return 'high';
    }

    // Low intensity if light activity or low time commitment
    if (intensityLevel === 'lightly' || intensityLevel === 'light-moderate' || timeCommitment === '2-3') {
      return 'low';
    }

    // Default to moderate
    return 'moderate';
  }
} as const; 