import { WorkoutGenerationRequest } from '../../../types/workout-generation.types';
import { GeneratedWorkout } from './types/external-ai.types';
import { logger } from '../../../utils/logger';
import { WorkoutRequestFactory } from '../factories/WorkoutRequestFactory';
import { PerWorkoutOptions } from '../../../types/core';
import { UserProfile } from '../../../types/user';

// Compatibility layer for legacy code
export class WorkoutGenerationService {
  constructor() {}

  /**
   * Generate a workout (compatibility layer)
   * Note: This service now delegates to the QuickWorkoutSetup feature
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Delegate to the main OpenAIStrategy which uses QuickWorkoutSetup feature
      const { openAIStrategy } = await import('./OpenAIStrategy');
      return await openAIStrategy.generateWorkout(request);

    } catch (error) {
      logger.error('WorkoutGenerationService: Failed to generate workout', error);
      throw new Error(`Workout generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate workout from Quick Workout data (legacy compatibility)
   */
  async generateFromQuickWorkout(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): Promise<GeneratedWorkout> {
    // Delegate to the main OpenAIStrategy which uses QuickWorkoutSetup feature
    const { openAIStrategy } = await import('./OpenAIStrategy');
    const request = WorkoutRequestFactory.createRequest({
      userProfile,
      workoutFocusData: quickWorkoutData,
      workoutType: 'quick'
    });
    return await openAIStrategy.generateWorkout(request);
  }
} 