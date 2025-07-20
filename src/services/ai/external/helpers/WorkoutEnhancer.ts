// Workout Enhancer - Handles enhancement of generated workouts with metadata and personalized notes
import { GeneratedWorkout } from '../types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { openAIConfig } from '../config/openai.config';
import { WORKOUT_GENERATOR_CONSTANTS } from '../constants/workout-generator-constants';

export class WorkoutEnhancer {
  /**
   * Enhance generated workout with metadata and personalized content
   */
  static enhanceWorkout(workout: GeneratedWorkout, request: WorkoutGenerationRequest): GeneratedWorkout {
    // Add AI-specific metadata
    workout.aiModel = openAIConfig.openai.model;
    workout.generatedAt = new Date();
    workout.confidence = Math.max(
      WORKOUT_GENERATOR_CONSTANTS.DEFAULT_CONFIDENCE_MIN, 
      workout.confidence ?? WORKOUT_GENERATOR_CONSTANTS.DEFAULT_CONFIDENCE_FALLBACK
    );

    // Enhance with user-specific notes
    if (!workout.personalizedNotes) {
      workout.personalizedNotes = [];
    }
    
    // Add fitness level appropriate notes
    WorkoutEnhancer.addFitnessLevelNotes(workout, request);
    
    // Add goal-specific notes
    WorkoutEnhancer.addGoalSpecificNotes(workout, request);
    
    // Add energy level appropriate notes
    WorkoutEnhancer.addEnergyLevelNotes(workout, request);

    // Ensure safety reminders
    WorkoutEnhancer.ensureSafetyReminders(workout);

    // Add progression tips if missing
    WorkoutEnhancer.ensureProgressionTips(workout);

    // Add appropriate tags
    WorkoutEnhancer.addWorkoutTags(workout, request);

    return workout;
  }

  /**
   * Add fitness level appropriate notes
   */
  private static addFitnessLevelNotes(workout: GeneratedWorkout, request: WorkoutGenerationRequest): void {
    if (request.userProfile.fitnessLevel === 'beginner' || request.userProfile.fitnessLevel === 'novice') {
      workout.personalizedNotes.push(
        'Focus on proper form rather than speed',
        'Take breaks whenever needed',
        'Build consistency before increasing intensity'
      );
    } else if (request.userProfile.fitnessLevel === 'advanced') {
      workout.personalizedNotes.push(
        'Challenge yourself with perfect form',
        'Consider adding resistance or complexity',
        'Track your progress for continuous improvement'
      );
    } else if (request.userProfile.fitnessLevel === 'adaptive') {
      workout.personalizedNotes.push(
        'Adjust intensity based on your current energy and recovery',
        'Listen to your body and modify as needed',
        'Focus on consistency over intensity today'
      );
    }
  }

  /**
   * Add goal-specific notes
   */
  private static addGoalSpecificNotes(workout: GeneratedWorkout, request: WorkoutGenerationRequest): void {
    if (request.userProfile.goals?.includes('weight_loss')) {
      workout.personalizedNotes.push(
        'Maintain elevated heart rate for calorie burn',
        'Focus on compound movements for maximum efficiency'
      );
    }
  }

  /**
   * Add energy level appropriate notes
   */
  private static addEnergyLevelNotes(workout: GeneratedWorkout, request: WorkoutGenerationRequest): void {
    if (request.constraints?.energyLevel && request.constraints.energyLevel <= 3) {
      workout.personalizedNotes.push(
        'Listen to your body and modify intensity as needed',
        'Even light movement is beneficial on low energy days'
      );
    }
  }

  /**
   * Ensure safety reminders are present
   */
  private static ensureSafetyReminders(workout: GeneratedWorkout): void {
    if (!workout.safetyReminders || workout.safetyReminders.length === 0) {
      workout.safetyReminders = [
        'Stop immediately if you feel pain',
        'Maintain proper form throughout',
        'Stay hydrated during your workout',
        'Listen to your body and rest when needed'
      ];
    }
  }

  /**
   * Ensure progression tips are present
   */
  private static ensureProgressionTips(workout: GeneratedWorkout): void {
    if (!workout.progressionTips || workout.progressionTips.length === 0) {
      workout.progressionTips = [
        'Gradually increase workout frequency',
        'Add 5-10% intensity each week',
        'Track your improvements over time',
        'Challenge yourself with new exercises'
      ];
    }
  }

  /**
   * Add appropriate tags to workout
   */
  private static addWorkoutTags(workout: GeneratedWorkout, request: WorkoutGenerationRequest): void {
    if (!workout.tags) {
      workout.tags = [];
    }
    
    workout.tags.push(
      `${request.preferences.duration}min`,
      request.preferences.intensity,
      request.userProfile.fitnessLevel,
      request.preferences.focus.toLowerCase().replace(/\s+/g, '_')
    );
  }
} 