import { z } from 'zod';

// Define enum arrays as constants first
export const WORKOUT_FOCUS_OPTIONS = [
  'Energizing Boost',
  'Improve Posture',
  'Stress Reduction',
  'Quick Sweat',
  'Gentle Recovery & Mobility'
] as const;

export const WORKOUT_TYPE_OPTIONS = [
  'HIIT', 'Straight Sets', 'Circuit Training'
] as const;

export const DURATION_OPTIONS = [
  '30 minutes', '45 minutes', '60 minutes', '90+ minutes'
] as const;

export const FOCUS_AREAS_OPTIONS = [
  'Cardio', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Flexibility'
] as const;

export const EQUIPMENT_OPTIONS = [
  'Full Gym', 'Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Bodyweight Only', 'Kettlebell'
] as const;

export const ENERGY_LEVEL_OPTIONS = [1, 2, 3, 4, 5] as const;

export const SORENESS_OPTIONS = [
  'No Soreness', 'Back', 'Legs', 'Shoulders', 'Upper Body', 'Lower Body'
] as const;

export const INCLUDE_EXERCISES_OPTIONS = [
  'High Knees', 'Mountain Climbers', 'Plank', 'Russian Twists',
  'Squats', 'Lunges', 'Stretches', 'Core exercises',
  'Calf raises', 'Jumping Jacks', 'Burpees', 'Agility drills',
  'Core twists', 'Balance exercises', 'Kicks', 'Punches', 'Balance poses'
] as const;

export const EXCLUDE_EXERCISES_OPTIONS = [
  'Deadlifts', 'Heavy squats', 'Sit-ups', 'Jumping exercises',
  'Deep squats', 'Overhead presses', 'Pull-ups', 'Heavy lifting',
  'Inverted exercises', 'Running', 'Plyometrics', 'Push-ups',
  'Hip flexor stretches'
] as const;

export const workoutFocusSchema = z.object({
  // Basic workout info - allow empty string for unset values
  workoutFocus: z.union([z.enum(WORKOUT_FOCUS_OPTIONS), z.literal('')]),
  workoutDuration: z.union([z.number().min(5).max(45), z.literal('')]),
  workoutType: z.union([z.enum(WORKOUT_TYPE_OPTIONS), z.literal('')]),
  duration: z.union([z.enum(DURATION_OPTIONS), z.literal('')]),
  
  // Focus areas
  focusAreas: z.array(z.enum(FOCUS_AREAS_OPTIONS)),
  
  // Equipment
  equipment: z.array(z.enum(EQUIPMENT_OPTIONS)),
  
  // Current state
  energyLevel: z.union([z.number().min(1).max(5), z.literal('')]),
  sorenessLevel: z.union([z.number().min(1).max(10), z.literal('')]),
  sleepQuality: z.string().default('Good (6-8 hours)'),
  stressLevel: z.string().default('Moderate Stress'),
  
  // Physical limitations
  currentSoreness: z.array(z.enum(SORENESS_OPTIONS)),
  
  // Exercise preferences
  includeExercises: z.array(z.enum(INCLUDE_EXERCISES_OPTIONS)),
  excludeExercises: z.array(z.enum(EXCLUDE_EXERCISES_OPTIONS))
});

// Quick workout schema (subset for quick flow)
export const quickWorkoutSchema = workoutFocusSchema.pick({
  workoutFocus: true,
  workoutDuration: true,
  energyLevel: true,
  sorenessLevel: true
});

// Section-based schemas for detailed workflow
export const workoutSectionSchemas = {
  basics: workoutFocusSchema.pick({
    workoutFocus: true,
    workoutDuration: true,
    energyLevel: true
  }),
  details: workoutFocusSchema.pick({
    workoutType: true,
    duration: true,
    focusAreas: true
  }),
  equipment: workoutFocusSchema.pick({
    equipment: true,
    currentSoreness: true
  }),
  preferences: workoutFocusSchema.pick({
    includeExercises: true,
    excludeExercises: true
  })
};

// Inferred TypeScript types
export type WorkoutFocusData = z.infer<typeof workoutFocusSchema>;
export type QuickWorkoutData = z.infer<typeof quickWorkoutSchema>;
export type WorkoutBasicsData = z.infer<typeof workoutSectionSchemas.basics>;
export type WorkoutDetailsData = z.infer<typeof workoutSectionSchemas.details>;
export type WorkoutEquipmentData = z.infer<typeof workoutSectionSchemas.equipment>;
export type WorkoutPreferencesData = z.infer<typeof workoutSectionSchemas.preferences>;

// Default values - using empty strings for unset values to match original behavior
export const defaultWorkoutFocusData: WorkoutFocusData = {
  workoutFocus: '',
  workoutDuration: '',
  workoutType: '',
  duration: '',
  focusAreas: [],
  equipment: [],
  energyLevel: '',
  sorenessLevel: '',
  sleepQuality: 'Good (6-8 hours)',
  stressLevel: 'Moderate Stress',
  currentSoreness: [],
  includeExercises: [],
  excludeExercises: []
}; 