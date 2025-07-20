// Workout Enhancement Helpers - Phase 3D
import { GeneratedWorkout } from '../types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';

/**
 * Enhance and validate generated workout
 */
export const enhanceGeneratedWorkout = (
  workout: GeneratedWorkout, 
  request: WorkoutGenerationRequest
): GeneratedWorkout => {
  // Basic enhancement - in production, you'd want more sophisticated enhancement
  if (!workout) {
    throw new Error('Generated workout is invalid or empty');
  }

  // Ensure workout has required properties
  const enhancedWorkout: GeneratedWorkout = {
    ...workout,
    exercises: workout.exercises || [],
    duration: workout.duration || request.preferences?.duration || 30,
    intensity: workout.intensity || 'moderate',
    focus: workout.focus || request.preferences?.focus || 'general',
    equipment: workout.equipment || request.preferences?.equipment || [],
    instructions: workout.instructions || 'Follow the workout as prescribed',
    warmup: workout.warmup || '5-10 minutes of light cardio',
    cooldown: workout.cooldown || '5-10 minutes of stretching'
  };

  // Validate exercise structure
  enhancedWorkout.exercises = enhancedWorkout.exercises.map((exercise, index) => ({
    ...exercise,
    id: exercise.id || `exercise_${index + 1}`,
    name: exercise.name || `Exercise ${index + 1}`,
    duration: exercise.duration || 3,
    category: exercise.category || 'general',
    instructions: exercise.instructions || 'Perform as directed',
    sets: exercise.sets || 1,
    reps: exercise.reps || 10
  }));

  return enhancedWorkout;
}; 