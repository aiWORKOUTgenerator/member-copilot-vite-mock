import { Exercise } from './types';

/* eslint-disable max-lines */
// Exercise Categories
export const CATEGORIES = [
  'All',
  'Upper Body', 
  'Lower Body', 
  'Core & Abs', 
  'Full Body',
  'Cardio',
  'Flexibility & Mobility', 
  'Recovery'
] as const;

// Difficulty Levels
export const DIFFICULTIES = [
  'All',
  'beginner', 
  'intermediate', 
  'advanced'
] as const;

// Equipment Types
export const EQUIPMENT_TYPES = [
  'Dumbbells',
  'Barbell',
  'Kettlebells',
  'Resistance Bands',
  'Pull-up Bar',
  'Medicine Ball',
  'Jump Rope',
  'Yoga Mat',
  'Bench',
  'TRX/Suspension Trainer',
  'Foam Roller'
] as const;

// Comprehensive exercise database
export const EXERCISE_DATABASE: Exercise[] = [
  // Upper Body - Bodyweight
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
    secondaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Classic bodyweight exercise targeting chest and arms',
    instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
    tips: ['Keep core tight', 'Don\'t let hips sag']
  },
  {
    id: 'diamond-push-ups',
    name: 'Diamond Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Shoulders', 'Core'],
    difficulty: 'intermediate',
    description: 'Advanced push-up variation targeting triceps',
    instructions: ['Form diamond with hands', 'Perform push-up', 'Focus on triceps engagement']
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Shoulders', 'Triceps'],
    difficulty: 'intermediate',
    description: 'Shoulder-focused push-up variation'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'Upper Body',
    equipment: ['Pull-up Bar'],
    primaryMuscles: ['Back', 'Biceps'],
    secondaryMuscles: ['Shoulders', 'Core'],
    difficulty: 'intermediate',
    description: 'Upper body pulling exercise for back strength'
  },
  {
    id: 'chin-ups',
    name: 'Chin-ups',
    category: 'Upper Body',
    equipment: ['Pull-up Bar'],
    primaryMuscles: ['Biceps', 'Back'],
    secondaryMuscles: ['Shoulders', 'Core'],
    difficulty: 'intermediate',
    description: 'Pull-up variation with underhand grip targeting biceps'
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'Upper Body',
    equipment: ['Pull-up Bar'],
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Shoulders'],
    difficulty: 'intermediate',
    description: 'Bodyweight tricep and chest exercise'
  },

  // Upper Body - Equipment
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Chest Press',
    category: 'Upper Body',
    equipment: ['Dumbbells', 'Bench'],
    primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
    difficulty: 'beginner',
    description: 'Compound upper body pushing exercise'
  },
  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    category: 'Upper Body',
    equipment: ['Dumbbells'],
    primaryMuscles: ['Back', 'Biceps'],
    difficulty: 'beginner',
    description: 'Unilateral back exercise'
  },
  {
    id: 'barbell-press',
    name: 'Barbell Bench Press',
    category: 'Upper Body',
    equipment: ['Barbell', 'Bench'],
    primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
    difficulty: 'intermediate',
    description: 'Classic compound chest exercise'
  },
  {
    id: 'kettlebell-swings',
    name: 'Kettlebell Swings',
    category: 'Upper Body',
    equipment: ['Kettlebells'],
    primaryMuscles: ['Back', 'Shoulders'],
    secondaryMuscles: ['Core', 'Glutes'],
    difficulty: 'intermediate',
    description: 'Dynamic hip hinge movement'
  },

  // Lower Body - Bodyweight
  {
    id: 'squats',
    name: 'Squats',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Core', 'Hamstrings'],
    difficulty: 'beginner',
    description: 'Fundamental lower body movement',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Keep chest up', 'Return to standing']
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Unilateral leg exercise for balance and strength'
  },
  {
    id: 'jump-squats',
    name: 'Jump Squats',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Core', 'Calves'],
    difficulty: 'intermediate',
    description: 'Explosive squat variation for power development'
  },
  {
    id: 'wall-sits',
    name: 'Wall Sits',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    difficulty: 'beginner',
    description: 'Isometric leg exercise for endurance'
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Calves'],
    difficulty: 'beginner',
    description: 'Isolation exercise for calf strength'
  },
  {
    id: 'glute-bridges',
    name: 'Glute Bridges',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Hip thrust exercise for glute activation'
  },

  // Lower Body - Equipment
  {
    id: 'dumbbell-squats',
    name: 'Dumbbell Squats',
    category: 'Lower Body',
    equipment: ['Dumbbells'],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Core', 'Hamstrings'],
    difficulty: 'beginner',
    description: 'Weighted squat variation'
  },
  {
    id: 'barbell-squats',
    name: 'Barbell Squats',
    category: 'Lower Body',
    equipment: ['Barbell'],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Core', 'Hamstrings'],
    difficulty: 'intermediate',
    description: 'Classic compound leg exercise'
  },
  {
    id: 'dumbbell-lunges',
    name: 'Dumbbell Lunges',
    category: 'Lower Body',
    equipment: ['Dumbbells'],
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    difficulty: 'intermediate',
    description: 'Weighted lunge variation'
  },

  // Core & Abs - Bodyweight
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Abs'],
    difficulty: 'beginner',
    description: 'Basic abdominal exercise'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Abs', 'Obliques'],
    difficulty: 'intermediate',
    description: 'Dynamic core exercise targeting abs and obliques'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Obliques'],
    difficulty: 'intermediate',
    description: 'Rotational core exercise'
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Lower Abs'],
    difficulty: 'intermediate',
    description: 'Lower abdominal isolation exercise'
  },
  {
    id: 'planks',
    name: 'Planks',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Static core stability exercise'
  },
  {
    id: 'side-planks',
    name: 'Side Planks',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Obliques', 'Core'],
    difficulty: 'intermediate',
    description: 'Unilateral core stability exercise'
  },
  {
    id: 'dead-bugs',
    name: 'Dead Bugs',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Anti-extension core exercise'
  },
  {
    id: 'bird-dogs',
    name: 'Bird Dogs',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Anti-rotation core exercise'
  },

  // Full Body - Bodyweight
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'Full Body',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'intermediate',
    description: 'High-intensity full body exercise'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'Full Body',
    equipment: [],
    primaryMuscles: ['Core', 'Shoulders'],
    secondaryMuscles: ['Legs'],
    difficulty: 'intermediate',
    description: 'Dynamic plank variation with running motion'
  },
  {
    id: 'bear-crawls',
    name: 'Bear Crawls',
    category: 'Full Body',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'intermediate',
    description: 'Quadrupedal movement pattern'
  },
  {
    id: 'inchworms',
    name: 'Inchworms',
    category: 'Full Body',
    equipment: [],
    primaryMuscles: ['Core', 'Shoulders', 'Hamstrings'],
    difficulty: 'intermediate',
    description: 'Dynamic stretching and core exercise'
  },

  // Full Body - Equipment
  {
    id: 'thrusters',
    name: 'Thrusters',
    category: 'Full Body',
    equipment: ['Dumbbells'],
    primaryMuscles: ['Full Body'],
    difficulty: 'advanced',
    description: 'Combined squat and press movement'
  },
  {
    id: 'clean-and-press',
    name: 'Clean and Press',
    category: 'Full Body',
    equipment: ['Dumbbells'],
    primaryMuscles: ['Full Body'],
    difficulty: 'advanced',
    description: 'Olympic-style compound movement'
  },

  // Cardio - Bodyweight
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Classic cardio exercise'
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Core'],
    difficulty: 'beginner',
    description: 'Running in place with high knee lift'
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Hamstrings'],
    difficulty: 'beginner',
    description: 'Running in place with heel to glute contact'
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    category: 'Cardio',
    equipment: ['Jump Rope'],
    primaryMuscles: ['Calves', 'Shoulders'],
    secondaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Classic cardio exercise with rope'
  },
  {
    id: 'box-jumps',
    name: 'Box Jumps',
    category: 'Cardio',
    equipment: ['Bench'],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Calves'],
    difficulty: 'intermediate',
    description: 'Explosive jumping exercise'
  },
  {
    id: 'sprint-intervals',
    name: 'Sprint Intervals',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'intermediate',
    description: 'High-intensity interval training'
  },

  // Flexibility & Mobility
  {
    id: 'cat-cow-stretches',
    name: 'Cat-Cow Stretches',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Back', 'Core'],
    difficulty: 'beginner',
    description: 'Gentle spinal mobility exercise'
  },
  {
    id: 'childs-pose',
    name: 'Child\'s Pose',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Back', 'Hips'],
    difficulty: 'beginner',
    description: 'Restorative stretching pose'
  },
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Shoulders', 'Hamstrings', 'Calves'],
    difficulty: 'beginner',
    description: 'Yoga pose for shoulder and hamstring flexibility'
  },
  {
    id: 'pigeon-pose',
    name: 'Pigeon Pose',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Hips', 'Glutes'],
    difficulty: 'intermediate',
    description: 'Deep hip opening stretch'
  },
  {
    id: 'thread-the-needle',
    name: 'Thread the Needle',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Shoulders', 'Back'],
    difficulty: 'beginner',
    description: 'Shoulder and thoracic spine stretch'
  },

  // Recovery Exercises
  {
    id: 'light-walking',
    name: 'Light Walking',
    category: 'Recovery',
    equipment: [],
    primaryMuscles: ['Legs'],
    difficulty: 'beginner',
    description: 'Gentle movement for active recovery'
  },
  {
    id: 'gentle-stretching',
    name: 'Gentle Stretching',
    category: 'Recovery',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Low-intensity stretching for recovery'
  },
  {
    id: 'foam-rolling',
    name: 'Foam Rolling',
    category: 'Recovery',
    equipment: ['Foam Roller'],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Self-myofascial release technique'
  },
  {
    id: 'static-stretching',
    name: 'Static Stretching',
    category: 'Recovery',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Hold stretches for muscle recovery'
  }
];

// Utility functions for filtering
export const filterExercisesByEquipment = (
  exercises: Exercise[], 
  availableEquipment: string[]
): Exercise[] => {
  return exercises.filter(exercise => {
    if (exercise.equipment.length === 0) return true;
    if (!availableEquipment || availableEquipment.length === 0) return true;
    return exercise.equipment.some(eq => availableEquipment.includes(eq));
  });
};

export const filterExercisesBySearch = (
  exercises: Exercise[], 
  searchTerm: string
): Exercise[] => {
  if (!searchTerm.trim()) return exercises;
  
  const term = searchTerm.toLowerCase();
  return exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(term) ||
    exercise.description.toLowerCase().includes(term) ||
    exercise.category.toLowerCase().includes(term) ||
    exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(term))
  );
};

export const filterExercisesByCategory = (
  exercises: Exercise[], 
  category: string
): Exercise[] => {
  if (category === 'All') return exercises;
  return exercises.filter(exercise => exercise.category === category);
};

export const filterExercisesByDifficulty = (
  exercises: Exercise[], 
  difficulty: string
): Exercise[] => {
  if (difficulty === 'All') return exercises;
  return exercises.filter(exercise => exercise.difficulty === difficulty);
};
