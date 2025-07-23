// OpenAI Workout Generator - Compatibility layer for legacy code
import { WorkoutGenerationRequest } from '../../../types/workout-generation.types';
import { GeneratedWorkout } from './types/external-ai.types';
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { logger } from '../../../utils/logger';
import { WorkoutRequestFactory } from '../factories/WorkoutRequestFactory';

export class OpenAIWorkoutGenerator {
  constructor() {}

  /**
   * Generate workout using OpenAI
   * Note: This service now delegates to the QuickWorkoutSetup feature
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Delegate to the main OpenAIStrategy which uses QuickWorkoutSetup feature
      const { openAIStrategy } = await import('./OpenAIStrategy');
      return await openAIStrategy.generateWorkout(request);

    } catch (error) {
      logger.error('OpenAIWorkoutGenerator: Failed to generate workout', error);
      throw new Error(`Workout generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate workout from quick workout data
   * Note: This method now delegates to the QuickWorkoutSetup feature
   */
  async generateFromQuickWorkout(quickWorkoutData: PerWorkoutOptions, userProfile: UserProfile): Promise<GeneratedWorkout> {
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

// Export singleton instance
export const openAIWorkoutGenerator = new OpenAIWorkoutGenerator(); 