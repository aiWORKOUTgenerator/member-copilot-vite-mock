// Workout Validator - Handles validation of generated workouts
import { GeneratedWorkout } from '../types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { logger } from '../../../../utils/logger';

export class WorkoutValidator {
  /**
   * Validate generated workout structure and content
   */
  static validateWorkout(workout: GeneratedWorkout, request: WorkoutGenerationRequest): GeneratedWorkout {
    // Validate basic structure
    if (!workout.warmup || !workout.mainWorkout || !workout.cooldown) {
      throw new Error('Invalid workout structure: missing phases');
    }

    // Validate duration
    if (Math.abs(workout.totalDuration - request.preferences.duration) > 5) {
      logger.warn('Workout duration mismatch, adjusting...');
      workout.totalDuration = request.preferences.duration;
    }

    // Validate exercises have required properties
    const allExercises = [
      ...workout.warmup.exercises,
      ...workout.mainWorkout.exercises,
      ...workout.cooldown.exercises
    ];

    for (const exercise of allExercises) {
      if (!exercise.name || !exercise.description) {
        throw new Error(`Invalid exercise: ${exercise.name || 'unnamed'}`);
      }
    }

    // Validate equipment matches request
    const workoutEquipment = workout.equipment ?? [];
    const requestEquipment = request.preferences.equipment;
    
    if (requestEquipment.length > 0) {
      const hasMatchingEquipment = workoutEquipment.some(eq => 
        requestEquipment.includes(eq)
      );
      
      if (!hasMatchingEquipment && requestEquipment.length > 0) {
        logger.warn('Workout equipment mismatch with request');
      }
    }

    return workout;
  }

  /**
   * Count total exercises in workout
   */
  static countExercises(workout: GeneratedWorkout): number {
    return workout.warmup.exercises.length + 
           workout.mainWorkout.exercises.length + 
           workout.cooldown.exercises.length;
  }
} 