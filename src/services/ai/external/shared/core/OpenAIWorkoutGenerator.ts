// OpenAI Workout Generator - Specialized service for generating AI-powered workouts
import { OpenAIService } from './OpenAIService';
import { WorkoutGenerationRequest, GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { PerWorkoutOptions, UserProfile } from '../../../../../types';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { WorkoutVariableBuilder } from '../../helpers/WorkoutVariableBuilder';
import { WorkoutValidator } from '../../helpers/WorkoutValidator';
import { WorkoutEnhancer } from '../../helpers/WorkoutEnhancer';
import { logger } from '../../../../../utils/logger';
import { WorkoutRequestFactory } from '../../../factories/WorkoutRequestFactory';

export class OpenAIWorkoutGenerator {
  constructor(private openAIService: OpenAIService) {}

  /**
   * Generate workout using OpenAI
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Enhance request with additional context
      const enhancedRequest = WorkoutRequestFactory.createRequest({
        ...request,
        ...WorkoutRequestFactory.createDefaultEnhancements(request.userProfile, request.workoutFocusData)
      });
      
      // ✅ FIXED: Use centralized WorkoutVariableBuilder instead of WorkoutRequestConverter
      const promptVariables = WorkoutVariableBuilder.buildWorkoutVariables(enhancedRequest);

      // ALWAYS use simplified quick workout prompt for consistency
      const prompt = QUICK_WORKOUT_PROMPT_TEMPLATE;

      // Generate workout using OpenAI
      const result = await this.openAIService.generateFromTemplate(
        prompt,
        promptVariables,
        {
          cacheKey: `workout_${enhancedRequest.userProfile.fitnessLevel}_${JSON.stringify(promptVariables)}`,
          timeout: 30000
        }
      );

      // Validate and enhance the generated workout
      const generatedWorkout = result as GeneratedWorkout;
      const validatedWorkout = WorkoutValidator.validateWorkout(generatedWorkout, enhancedRequest);
      const enhancedWorkout = WorkoutEnhancer.enhanceWorkout(validatedWorkout, enhancedRequest);

      logger.info('OpenAIWorkoutGenerator: Workout generated successfully', {
        workoutId: enhancedWorkout.id,
        duration: enhancedWorkout.totalDuration,
        exercises: enhancedWorkout.mainWorkout?.exercises?.length ?? 0
      });

      return enhancedWorkout;

    } catch (error) {
      logger.error('OpenAIWorkoutGenerator: Failed to generate workout', error);
      throw new Error(`Workout generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate workout from quick workout data
   */
  async generateFromQuickWorkout(quickWorkoutData: PerWorkoutOptions, userProfile: UserProfile): Promise<GeneratedWorkout> {
    const request = WorkoutRequestFactory.fromQuickWorkout(quickWorkoutData, userProfile);
    return this.generateWorkout(request);
  }

  // Public utility methods
  getGenerationMetrics() {
    return {
      serviceMetrics: this.openAIService.getMetrics()
    };
  }
}

// Export singleton instance
export const openAIWorkoutGenerator = new OpenAIWorkoutGenerator(new OpenAIService()); 