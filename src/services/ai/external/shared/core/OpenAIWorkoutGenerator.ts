// OpenAI Workout Generator - Specialized service for generating AI-powered workouts
import { WorkoutGenerationRequest, GeneratedWorkout } from '../../../types/workout-generation.types';
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { OpenAIService } from './OpenAIService';
import { WorkoutRequestConverter } from './helpers/WorkoutRequestConverter';
import { WorkoutRequestAdapter } from '../../../types/workout-generation.types';
import { WorkoutVariationGenerator } from './helpers/WorkoutVariationGenerator';
import { WorkoutValidator } from './helpers/WorkoutValidator';
import { WorkoutEnhancer } from './helpers/WorkoutEnhancer';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { logger } from '../../../utils/logger';
import { WorkoutVariableBuilder } from './helpers/WorkoutVariableBuilder';
import { WORKOUT_GENERATOR_CONSTANTS } from './constants/workout-generator-constants';

export class OpenAIWorkoutGenerator {
  private openAIService: OpenAIService;
  private generatedWorkouts = new Map<string, GeneratedWorkout>();

  constructor(openAIService?: OpenAIService) {
    this.openAIService = openAIService ?? new OpenAIService();
  }

  // Generate workout from Quick Workout form data
  async generateFromQuickWorkout(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): Promise<GeneratedWorkout> {
    try {
      // Convert Quick Workout data to WorkoutGenerationRequest using helper
      const request = WorkoutRequestConverter.convertQuickWorkoutToRequest(quickWorkoutData, userProfile);
      
      // Generate workout using OpenAI
      return await this.generateWorkout(request);
      
    } catch (error) {
      logger.error('Quick Workout generation failed:', error);
      throw new Error(`Failed to generate workout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate workout using OpenAI
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Enhance request with additional context
      const enhancedRequest = WorkoutRequestAdapter.enhanceRequest(request);
      
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

  // Generate workout variations
  async generateWorkoutVariations(
    originalRequest: WorkoutGenerationRequest,
    variationCount: number = 3
  ): Promise<GeneratedWorkout[]> {
    try {
      const variations: GeneratedWorkout[] = [];
      
      for (let i = 0; i < variationCount; i++) {
        // Create slight variations in the request using helper
        const modifiedRequest = WorkoutVariationGenerator.createVariation(originalRequest, i);
        
        // Generate workout with modified request
        const variation = await this.generateWorkout(modifiedRequest);
        variations.push(variation);
      }

      return variations;

    } catch (error) {
      logger.error('Workout variation generation failed:', error);
      throw error;
    }
  }

  // Generate workout adapted for specific constraints
  async generateAdaptedWorkout(
    baseRequest: WorkoutGenerationRequest,
    adaptations: {
      newDuration?: number;
      newEquipment?: string[];
      newIntensity?: 'low' | 'moderate' | 'high';
      newFocus?: string;
    }
  ): Promise<GeneratedWorkout> {
    try {
      // Create adapted request using helper
      const adaptedRequest = WorkoutVariationGenerator.createAdaptedRequest(baseRequest, adaptations);

      return await this.generateWorkout(adaptedRequest);

    } catch (error) {
      logger.error('Adapted workout generation failed:', error);
      throw error;
    }
  }

  // Generate progressive workout series
  async generateProgressiveWorkouts(
    baseRequest: WorkoutGenerationRequest,
    weekCount: number = 4
  ): Promise<GeneratedWorkout[]> {
    try {
      const progressiveWorkouts: GeneratedWorkout[] = [];
      
      for (let week = 1; week <= weekCount; week++) {
        const progressiveRequest = WorkoutVariationGenerator.createProgressiveRequest(baseRequest, week);
        const workout = await this.generateWorkout(progressiveRequest);
        
        // Add progression metadata
        workout.tags = [...(workout.tags ?? []), `week_${week}`, 'progressive'];
        progressiveWorkouts.push(workout);
      }

      return progressiveWorkouts;

    } catch (error) {
      logger.error('Progressive workout generation failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateCacheKey(request: WorkoutGenerationRequest): string {
    // Ensure request has AI enhancements, create defaults if missing
    const enhancedRequest = request.preferences 
      ? request 
      : WorkoutRequestAdapter.enhanceRequest(request, WorkoutRequestAdapter.createDefaultEnhancements(request.userProfile, request.workoutFocusData));

    const keyData = {
      fitnessLevel: request.userProfile.fitnessLevel,
      duration: enhancedRequest.preferences!.duration,
      focus: enhancedRequest.preferences!.focus,
      intensity: enhancedRequest.preferences!.intensity,
      equipment: enhancedRequest.preferences!.equipment.sort(),
      energyLevel: enhancedRequest.constraints?.energyLevel ?? 5,
      sorenessAreas: enhancedRequest.constraints?.sorenessAreas?.sort() ?? []
    };
    
    return JSON.stringify(keyData);
  }

  private isCacheValid(workout: GeneratedWorkout): boolean {
    return Date.now() - workout.generatedAt.getTime() < WORKOUT_GENERATOR_CONSTANTS.CACHE_TIMEOUT_MS;
  }

  private createWorkoutGenerationError(error: Error | unknown, request: WorkoutGenerationRequest): Error {
    const userFriendlyMessage = this.getUserFriendlyErrorMessage(error);
    const context = {
      fitnessLevel: request.userProfile.fitnessLevel,
      duration: request.preferences?.duration ?? 'unknown',
      focus: request.preferences?.focus ?? 'unknown'
    };
    
    logger.error('Workout generation error', { error: error instanceof Error ? error.message : String(error), context });
    
    return new Error(`Workout generation failed: ${userFriendlyMessage}`);
  }

  private getUserFriendlyErrorMessage(error: Error | unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('rate limit')) {
      return 'AI service is busy. Please try again in a moment.';
    }
    
    if (errorMessage.includes('authentication')) {
      return 'AI service configuration issue. Please contact support.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Request took too long. Please try again.';
    }
    
    if (errorMessage.includes('Invalid workout structure')) {
      return 'Generated workout was invalid. Please try again.';
    }
    
    return 'AI service temporarily unavailable. Please try again later.';
  }

  // Public utility methods
  getGenerationMetrics() {
    return {
      cacheSize: this.generatedWorkouts.size,
      totalGenerated: this.generatedWorkouts.size,
      serviceMetrics: this.openAIService.getMetrics()
    };
  }

  clearCache() {
    this.generatedWorkouts.clear();
    logger.info('Workout generator cache cleared');
  }
}

// Export singleton instance
export const openAIWorkoutGenerator = new OpenAIWorkoutGenerator(); 