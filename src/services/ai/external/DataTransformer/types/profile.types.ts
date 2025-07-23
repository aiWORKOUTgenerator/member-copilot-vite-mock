// Experience & Activity
export type ExperienceLevel = 'New to Exercise' | 'Some Experience' | 'Advanced Athlete';
export type PhysicalActivity = 'sedentary' | 'light' | 'moderate' | 'very' | 'extremely' | 'varies';
export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';

// Time & Commitment
export type PreferredDuration = '15-30 min' | '30-45 min' | '45-60 min' | '60+ min';
export type TimeCommitment = '2-3' | '3-4' | '4-5' | '6-7';
export type IntensityLevel = 'lightly' | 'light-moderate' | 'moderately' | 'active' | 'very' | 'extremely';
export type WorkoutIntensity = 'low' | 'moderate' | 'high';

// Activities & Locations
export type PreferredActivity = 
  | 'Walking/Power Walking'
  | 'Running/Jogging'
  | 'Swimming'
  | 'Cycling/Mountain Biking'
  | 'Rock Climbing/Bouldering'
  | 'Yoga'
  | 'Pilates'
  | 'Hiking'
  | 'Dancing'
  | 'Team Sports'
  | 'Golf'
  | 'Martial Arts';

export type AvailableLocation = 
  | 'Gym'
  | 'Home Gym'
  | 'Home'
  | 'Parks/Outdoor Spaces'
  | 'Swimming Pool'
  | 'Running Track';

// Goals
export type PrimaryGoal = 
  | 'Weight Loss'
  | 'Strength'
  | 'Cardio Health'
  | 'Flexibility & Mobility'
  | 'General Health'
  | 'Muscle Gain'
  | 'Athletic Performance'
  | 'Energy Levels'
  | 'Body Toning'
  | 'Sleep Quality'
  | 'Stress Reduction'
  | 'Functional Fitness';

export type GoalTimeline = '1 month' | '3 months' | '6 months' | '1 year+';

// Personal Info
export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type CardiovascularCondition = 
  | 'No'
  | 'Yes - but cleared for exercise'
  | 'Yes - and need medical clearance'
  | 'Prefer not to answer';

export type Injury = 
  | 'No Injuries'
  | 'Lower Back'
  | 'Knee'
  | 'Shoulder'
  | 'Neck'
  | 'Ankle'
  | 'Wrist or Elbow'
  | 'Hip'
  | 'Foot or Arch';

// Core Profile Interface
export interface ProfileFields {
  // Experience & Activity (Required Core Fields)
  experienceLevel: ExperienceLevel;
  physicalActivity: PhysicalActivity;
  calculatedFitnessLevel?: FitnessLevel; // Derived

  // Time & Commitment (Required Core Fields)
  preferredDuration: PreferredDuration;
  timeCommitment: TimeCommitment;
  intensityLevel: IntensityLevel;
  calculatedWorkoutIntensity?: WorkoutIntensity; // Derived

  // Preferences (Required Core Fields)
  preferredActivities: PreferredActivity[];
  availableLocations: AvailableLocation[];
  availableEquipment: string[]; // Dynamic based on location

  // Goals (Required Core Fields)
  primaryGoal: PrimaryGoal;
  goalTimeline: GoalTimeline;

  // Personal Info (Required Core Fields)
  age: AgeRange;
  gender: Gender;
  height: string; // Format: "5'8\" or 173cm"
  weight: string; // Format: "150 lbs or 68 kg"
  hasCardiovascularConditions: CardiovascularCondition;
  injuries: Injury[];
}

// Core Required Fields for Basic Functionality
export const CORE_REQUIRED_FIELDS = [
  'experienceLevel',
  'primaryGoal'
] as const;

// All Required Fields for Complete Functionality
export const ALL_REQUIRED_FIELDS = [
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
  'gender',
  'height',
  'weight',
  'hasCardiovascularConditions',
  'injuries'
] as const; 