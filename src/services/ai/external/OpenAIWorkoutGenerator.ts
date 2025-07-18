// OpenAI Workout Generator - Specialized service for generating AI-powered workouts
import { 
  WorkoutGenerationRequest, 
  GeneratedWorkout, 
  WorkoutPreferences, 
  WorkoutConstraints,
  Exercise,
  WorkoutPhase
} from './types/external-ai.types';
import { OpenAIService } from './OpenAIService';
import { selectWorkoutPrompt } from './prompts/workout-generation.prompts';
import { openAIConfig, isFeatureEnabled } from './config/openai.config';
import { logger } from '../../../utils/logger';
import { PerWorkoutOptions, UserProfile } from '../../../types';

export class OpenAIWorkoutGenerator {
  private openAIService: OpenAIService;
  private generatedWorkouts = new Map<string, GeneratedWorkout>();

  constructor(openAIService?: OpenAIService) {
    this.openAIService = openAIService || new OpenAIService();
  }

  // Generate workout from Quick Workout form data
  async generateFromQuickWorkout(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): Promise<GeneratedWorkout> {
    try {
      // Convert Quick Workout data to WorkoutGenerationRequest
      const request = this.convertQuickWorkoutToRequest(quickWorkoutData, userProfile);
      
      // Generate workout using OpenAI
      return await this.generateWorkout(request);
      
    } catch (error) {
      logger.error('Quick Workout generation failed:', error);
      throw new Error(`Failed to generate workout: ${error.message}`);
    }
  }

  // Main workout generation method
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      if (!isFeatureEnabled('openai_workout_generation')) {
        throw new Error('OpenAI workout generation is disabled');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.generatedWorkouts.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        logger.info('Returning cached workout');
        return cached;
      }

      // Select appropriate prompt based on request
      const prompt = selectWorkoutPrompt(
        request.userProfile.fitnessLevel,
        request.preferences.duration,
        request.constraints?.sorenessAreas || [],
        request.preferences.focus
      );

      // Prepare variables for prompt
      const variables = this.preparePromptVariables(request);

      // Generate workout using OpenAI
      const generatedWorkout = await this.openAIService.generateFromTemplate(
        prompt,
        variables,
        {
          cacheKey: `workout_${cacheKey}`,
          timeout: 30000
        }
      );

      // Validate and enhance the generated workout
      const validatedWorkout = this.validateWorkout(generatedWorkout, request);
      const enhancedWorkout = this.enhanceWorkout(validatedWorkout, request);

      // Cache the result
      this.generatedWorkouts.set(cacheKey, enhancedWorkout);

      logger.info('Workout generated successfully', {
        duration: enhancedWorkout.totalDuration,
        exerciseCount: this.countExercises(enhancedWorkout),
        difficulty: enhancedWorkout.difficulty
      });

      return enhancedWorkout;

    } catch (error) {
      logger.error('Workout generation failed:', error);
      throw this.createWorkoutGenerationError(error, request);
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
        // Create slight variations in the request
        const modifiedRequest = this.createVariation(originalRequest, i);
        
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
      // Create adapted request
      const adaptedRequest: WorkoutGenerationRequest = {
        ...baseRequest,
        preferences: {
          ...baseRequest.preferences,
          duration: adaptations.newDuration || baseRequest.preferences.duration,
          equipment: adaptations.newEquipment || baseRequest.preferences.equipment,
          intensity: adaptations.newIntensity || baseRequest.preferences.intensity,
          focus: adaptations.newFocus || baseRequest.preferences.focus
        }
      };

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
        const progressiveRequest = this.createProgressiveRequest(baseRequest, week);
        const workout = await this.generateWorkout(progressiveRequest);
        
        // Add progression metadata
        workout.tags = [...(workout.tags || []), `week_${week}`, 'progressive'];
        progressiveWorkouts.push(workout);
      }

      return progressiveWorkouts;

    } catch (error) {
      logger.error('Progressive workout generation failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private convertQuickWorkoutToRequest(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): WorkoutGenerationRequest {
    // Extract preferences from Quick Workout data
    const preferences: WorkoutPreferences = {
      duration: quickWorkoutData.customization_duration || 30,
      focus: quickWorkoutData.customization_focus || 'General Fitness',
      intensity: this.mapEnergyToIntensity(quickWorkoutData.customization_energy || 5),
      equipment: quickWorkoutData.customization_equipment || [],
      location: 'home', // Default for Quick Workout
      music: true,
      voiceGuidance: false
    };

    // Extract constraints
    const constraints: WorkoutConstraints = {
      timeOfDay: 'morning', // Default
      energyLevel: quickWorkoutData.customization_energy || 5,
      sorenessAreas: quickWorkoutData.customization_soreness || [],
      spaceLimitations: ['small_space'], // Common for Quick Workout
      noiselevel: 'moderate'
    };

    return {
      userProfile,
      workoutOptions: quickWorkoutData,
      preferences,
      constraints,
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    };
  }

  private mapEnergyToIntensity(energyLevel: number): 'low' | 'moderate' | 'high' {
    if (energyLevel <= 3) return 'low';
    if (energyLevel <= 7) return 'moderate';
    return 'high';
  }

  private preparePromptVariables(request: WorkoutGenerationRequest): Record<string, any> {
    return {
      // User profile
      fitnessLevel: request.userProfile.fitnessLevel,
      goals: request.userProfile.goals || [],
      preferredIntensity: request.preferences.intensity,

      // Current state
      energyLevel: request.constraints?.energyLevel || 5,
      sorenessAreas: request.constraints?.sorenessAreas || [],
      duration: request.preferences.duration,
      focus: request.preferences.focus,

      // Preferences & constraints
      equipment: request.preferences.equipment,
      location: request.preferences.location,
      timeOfDay: request.constraints?.timeOfDay || 'morning',
      noiseLevel: request.constraints?.noiselevel || 'moderate',
      spaceLimitations: request.constraints?.spaceLimitations || [],

      // Environmental factors
      weather: request.environmentalFactors?.weather || 'indoor',
      temperature: request.environmentalFactors?.temperature || 'comfortable',

      // Special considerations
      injuries: request.constraints?.injuries || [],
      previousWorkout: 'None provided'
    };
  }

  private validateWorkout(workout: GeneratedWorkout, request: WorkoutGenerationRequest): GeneratedWorkout {
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
    const workoutEquipment = workout.equipment || [];
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

  private enhanceWorkout(workout: GeneratedWorkout, request: WorkoutGenerationRequest): GeneratedWorkout {
    // Add AI-specific metadata
    workout.aiModel = openAIConfig.openai.model;
    workout.generatedAt = new Date();
    workout.confidence = Math.max(0.7, workout.confidence || 0.8);

    // Enhance with user-specific notes
    if (!workout.personalizedNotes) {
      workout.personalizedNotes = [];
    }
    
    // Add fitness level appropriate notes
    if (request.userProfile.fitnessLevel === 'new to exercise') {
      workout.personalizedNotes.push(
        'Focus on proper form rather than speed',
        'Take breaks whenever needed',
        'Build consistency before increasing intensity'
      );
    } else if (request.userProfile.fitnessLevel === 'advanced athlete') {
      workout.personalizedNotes.push(
        'Challenge yourself with perfect form',
        'Consider adding resistance or complexity',
        'Track your progress for continuous improvement'
      );
    }

    // Add goal-specific notes
    if (request.userProfile.goals?.includes('weight_loss')) {
      workout.personalizedNotes.push(
        'Maintain elevated heart rate for calorie burn',
        'Focus on compound movements for maximum efficiency'
      );
    }

    // Add energy level appropriate notes
    if (request.constraints?.energyLevel && request.constraints.energyLevel <= 3) {
      workout.personalizedNotes.push(
        'Listen to your body and modify intensity as needed',
        'Even light movement is beneficial on low energy days'
      );
    }

    // Ensure safety reminders
    if (!workout.safetyReminders || workout.safetyReminders.length === 0) {
      workout.safetyReminders = [
        'Stop immediately if you feel pain',
        'Maintain proper form throughout',
        'Stay hydrated during your workout',
        'Listen to your body and rest when needed'
      ];
    }

    // Add progression tips if missing
    if (!workout.progressionTips || workout.progressionTips.length === 0) {
      workout.progressionTips = [
        'Gradually increase workout frequency',
        'Add 5-10% intensity each week',
        'Track your improvements over time',
        'Challenge yourself with new exercises'
      ];
    }

    // Add appropriate tags
    if (!workout.tags) {
      workout.tags = [];
    }
    
    workout.tags.push(
      `${request.preferences.duration}min`,
      request.preferences.intensity,
      request.userProfile.fitnessLevel,
      request.preferences.focus.toLowerCase().replace(/\s+/g, '_')
    );

    return workout;
  }

  private createVariation(
    originalRequest: WorkoutGenerationRequest,
    variationIndex: number
  ): WorkoutGenerationRequest {
    const variations = ['circuit', 'intervals', 'strength_focus', 'cardio_focus'];
    const variationType = variations[variationIndex % variations.length];
    
    return {
      ...originalRequest,
      preferences: {
        ...originalRequest.preferences,
        focus: `${originalRequest.preferences.focus} - ${variationType}`
      }
    };
  }

  private createProgressiveRequest(
    baseRequest: WorkoutGenerationRequest,
    week: number
  ): WorkoutGenerationRequest {
    // Gradually increase intensity and complexity
    const intensityProgression = ['low', 'moderate', 'moderate', 'high'];
    const durationProgression = [0.9, 1.0, 1.1, 1.2]; // 90%, 100%, 110%, 120%
    
    return {
      ...baseRequest,
      preferences: {
        ...baseRequest.preferences,
        intensity: intensityProgression[Math.min(week - 1, 3)] as 'low' | 'moderate' | 'high',
        duration: Math.round(baseRequest.preferences.duration * durationProgression[Math.min(week - 1, 3)])
      }
    };
  }

  private generateCacheKey(request: WorkoutGenerationRequest): string {
    const keyData = {
      fitnessLevel: request.userProfile.fitnessLevel,
      duration: request.preferences.duration,
      focus: request.preferences.focus,
      intensity: request.preferences.intensity,
      equipment: request.preferences.equipment.sort(),
      energyLevel: request.constraints?.energyLevel || 5,
      sorenessAreas: request.constraints?.sorenessAreas?.sort() || []
    };
    
    return JSON.stringify(keyData);
  }

  private isCacheValid(workout: GeneratedWorkout): boolean {
    const cacheTimeout = 30 * 60 * 1000; // 30 minutes
    return Date.now() - workout.generatedAt.getTime() < cacheTimeout;
  }

  private countExercises(workout: GeneratedWorkout): number {
    return workout.warmup.exercises.length + 
           workout.mainWorkout.exercises.length + 
           workout.cooldown.exercises.length;
  }

  private createWorkoutGenerationError(error: any, request: WorkoutGenerationRequest): Error {
    const userFriendlyMessage = this.getUserFriendlyErrorMessage(error);
    const context = {
      fitnessLevel: request.userProfile.fitnessLevel,
      duration: request.preferences.duration,
      focus: request.preferences.focus
    };
    
    logger.error('Workout generation error', { error: error.message, context });
    
    return new Error(`Workout generation failed: ${userFriendlyMessage}`);
  }

  private getUserFriendlyErrorMessage(error: any): string {
    if (error.message?.includes('rate limit')) {
      return 'AI service is busy. Please try again in a moment.';
    }
    
    if (error.message?.includes('authentication')) {
      return 'AI service configuration issue. Please contact support.';
    }
    
    if (error.message?.includes('timeout')) {
      return 'Request took too long. Please try again.';
    }
    
    if (error.message?.includes('Invalid workout structure')) {
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

// Export class for custom instances
export { OpenAIWorkoutGenerator }; 