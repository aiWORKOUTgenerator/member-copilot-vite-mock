import { WorkoutGenerationRequest } from '../../../../../types/workout-generation.types';
import { DetailedWorkoutParams, DetailedWorkoutResult } from '../types/detailed-workout.types';
import { DETAILED_WORKOUT_CONSTANTS } from '../constants/detailed-workout.constants';

export class DetailedWorkoutServiceAdapter {
  /**
   * Adapts a legacy WorkoutGenerationRequest to the new DetailedWorkoutParams format
   */
  static adaptQuickWorkoutRequest(request: WorkoutGenerationRequest): DetailedWorkoutParams {
    const { preferences = {}, userProfile, constraints = {} } = request;

    // Map workout structure based on preferences
    const workoutStructure = this.determineWorkoutStructure(preferences);

    // Map intensity preference
    const intensityPreference = this.mapIntensityPreference(preferences.intensity);

    return {
      // Enhanced parameters beyond QuickWorkout
      duration: preferences.duration ?? 30,
      fitnessLevel: userProfile.fitnessLevel,
      focus: preferences.focus ?? 'general',
      energyLevel: constraints.energyLevel ?? 5,
      sorenessAreas: constraints.sorenessAreas ?? [],
      equipment: constraints.availableEquipment ?? ['Body Weight'],

      // Detailed-specific parameters
      trainingGoals: this.extractTrainingGoals(userProfile.goals),
      experienceLevel: this.mapExperienceLevel(userProfile.fitnessLevel),
      timeAvailable: preferences.duration ?? 30,
      intensityPreference,
      workoutStructure
    };
  }

  /**
   * Adapts a DetailedWorkoutResult back to the legacy GeneratedWorkout format
   */
  static adaptToLegacyFormat(result: DetailedWorkoutResult): any {
    // Return the core workout object with enhanced metadata
    return {
      ...result.workout,
      metadata: {
        ...result.workout.metadata,
        complexity: result.metadata.complexity,
        estimatedCalories: result.metadata.estimatedCalories,
        recommendations: result.recommendations.map(rec => ({
          type: rec.type,
          message: rec.description,
          priority: rec.priority
        }))
      }
    };
  }

  /**
   * Determines the workout structure based on preferences and constraints
   */
  private static determineWorkoutStructure(preferences: any): 'traditional' | 'circuit' | 'interval' {
    const duration = preferences.duration ?? 30;
    const intensity = preferences.intensity ?? 'moderate';

    if (duration <= 20 || intensity === 'high') {
      return 'circuit';
    }

    if (duration >= 45 && intensity === 'moderate') {
      return 'interval';
    }

    return 'traditional';
  }

  /**
   * Maps legacy intensity values to standardized preferences
   */
  private static mapIntensityPreference(intensity?: string): 'low' | 'moderate' | 'high' {
    switch (intensity?.toLowerCase()) {
      case 'easy':
      case 'light':
      case 'low':
        return 'low';
      case 'hard':
      case 'intense':
      case 'high':
        return 'high';
      default:
        return 'moderate';
    }
  }

  /**
   * Extracts and normalizes training goals from user profile
   */
  private static extractTrainingGoals(goals: string[]): string[] {
    const normalizedGoals = goals.map(goal => goal.toLowerCase());
    const validGoals = DETAILED_WORKOUT_CONSTANTS.WORKOUT_TYPES;

    return normalizedGoals.filter(goal => 
      validGoals.some(validGoal => goal.includes(validGoal))
    );
  }

  /**
   * Maps fitness level to standardized experience level
   */
  private static mapExperienceLevel(fitnessLevel: string): string {
    switch (fitnessLevel.toLowerCase()) {
      case 'new to exercise':
      case 'beginner':
        return 'beginner';
      case 'some experience':
      case 'intermediate':
        return 'intermediate';
      case 'advanced athlete':
      case 'advanced':
        return 'advanced';
      default:
        return 'intermediate';
    }
  }
} 