import { WorkoutGenerationRequest, GeneratedWorkout } from '../../../types/workout-generation.types';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { OpenAIService } from './OpenAIService';
import { dataTransformers } from '../../../utils/dataTransformers';
import { logger } from '../../../utils/logger';
import { WORKOUT_GENERATION_CONSTANTS } from './constants/workout-generation-constants';
import { WorkoutCacheManager } from './utils/cache-manager';
import { WorkoutVariableBuilder } from './helpers/WorkoutVariableBuilder';
import { WorkoutRequestFactory } from '../factories/WorkoutRequestFactory';
import { WorkoutRequestValidator } from '../validation/core/WorkoutRequestValidator';
import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { UserProfile } from '../../../types/user';

// Performance metrics interface
interface WorkoutGenerationMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorCount: number;
  lastRequestTime: number;
}

export class WorkoutGenerationService {
  private openAIService: OpenAIService;
  private cacheManager: WorkoutCacheManager;
  private metrics: WorkoutGenerationMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorCount: 0,
    lastRequestTime: 0
  };

  constructor(openAIService: OpenAIService) {
    this.openAIService = openAIService;
    this.cacheManager = new WorkoutCacheManager();
  }

  /**
   * Generate a workout with comprehensive error handling, caching, and validation
   * Uses new validation system and factory pattern
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    const startTime = Date.now();
    
    try {
      // Validate request using new validation system
      const validation = WorkoutRequestValidator.validate(request);
      if (!validation.isValid) {
        throw new Error(`Invalid request parameters: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        logger.warn(`Workout request warnings: ${validation.warnings.join(', ')}`);
      }

      // Enhance request with AI-generated insights if not provided
      const enhancedRequest = this.enhanceRequestWithAIInsights(request);

      // Check cache first
      const cacheKey = this.cacheManager.generateCacheKey(enhancedRequest);
      const cachedWorkout = this.cacheManager.getCachedWorkout(cacheKey);
      if (cachedWorkout) {
        this.updateMetrics(true, Date.now() - startTime);
        logger.info('Workout served from cache');
        return cachedWorkout;
      }

      // Generate workout with retry logic
      const generatedWorkout = await this.generateWorkoutWithRetry(enhancedRequest);

      // Cache the result
      this.cacheManager.cacheWorkout(cacheKey, generatedWorkout);

      // Update metrics
      this.updateMetrics(false, Date.now() - startTime);

      logger.info('Workout generated successfully', {
        type: enhancedRequest.workoutType,
        duration: Date.now() - startTime,
        cacheKey
      });

      return generatedWorkout;

    } catch (error) {
      this.metrics.errorCount++;
      this.handleError(error, request);
      throw error;
    }
  }

  /**
   * Generate workout from Quick Workout data (legacy compatibility)
   */
  async generateFromQuickWorkout(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): Promise<GeneratedWorkout> {
    // Use factory to create request
    const request = WorkoutRequestFactory.fromQuickWorkout(quickWorkoutData, userProfile);
    return this.generateWorkout(request);
  }

  /**
   * Enhance request with AI-generated insights if not provided
   */
  private enhanceRequestWithAIInsights(request: WorkoutGenerationRequest): WorkoutGenerationRequest {
    // If AI enhancements are already provided, use them
    if (request.preferences && request.constraints && request.environmentalFactors) {
      return request;
    }

    // Create default enhancements based on user profile and workout data
    const defaultEnhancements = WorkoutRequestFactory.createDefaultEnhancements(
      request.userProfile,
      request.workoutFocusData
    );

    // Create enhanced request using factory
    return WorkoutRequestFactory.createRequest({
      workoutType: request.workoutType,
      profileData: request.profileData,
      workoutFocusData: request.workoutFocusData,
      userProfile: request.userProfile,
      waiverData: request.waiverData
    });
  }

  /**
   * Generate workout with retry logic for resilience
   */
  private async generateWorkoutWithRetry(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const { workoutType, workoutFocusData, userProfile } = request;

        // Select the appropriate prompt template based on workout type
        const promptTemplate = workoutType === 'quick' 
          ? QUICK_WORKOUT_PROMPT_TEMPLATE
          : selectDetailedWorkoutPrompt(
              userProfile.fitnessLevel,
              dataTransformers.extractDurationValue(workoutFocusData.customization_duration) ?? WORKOUT_GENERATION_CONSTANTS.DEFAULT_WORKOUT_DURATION,
              Object.keys(workoutFocusData.customization_soreness ?? {}),
              dataTransformers.extractFocusValue(workoutFocusData.customization_focus) ?? WORKOUT_GENERATION_CONSTANTS.DEFAULT_FOCUS
            );

        // Use centralized WorkoutVariableBuilder
        const promptVariables = WorkoutVariableBuilder.buildWorkoutVariables(request);

        // Generate the workout using OpenAI with timeout
        const aiResponse = await Promise.race([
          this.openAIService.generateFromTemplate(
            promptTemplate,
            promptVariables,
            { timeout: WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS }
          ),
          this.createTimeoutPromise(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS)
        ]);

        // Parse and normalize AI response
        const generatedWorkout = this.parseAIResponse(aiResponse);
        return generatedWorkout;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`Workout generation attempt ${attempt} failed:`, error);
        
        if (attempt < WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS) {
          await this.delay(WORKOUT_GENERATION_CONSTANTS.RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to generate workout after retries');
  }

  /**
   * Update service metrics
   */
  private updateMetrics(cacheHit: boolean, duration: number): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = duration;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + duration
    ) / this.metrics.totalRequests;

    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Handle errors with proper logging and context
   */
  private handleError(error: unknown, request: WorkoutGenerationRequest | undefined): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Workout generation failed:', {
      error: errorMessage,
      requestType: request?.workoutType,
      userFitnessLevel: request?.userProfile?.fitnessLevel,
      duration: request?.workoutFocusData?.customization_duration,
      metrics: this.metrics
    });
  }

  /**
   * Create a timeout promise for race conditions
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Workout generation timed out')), timeout);
    });
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse and normalize AI response
   */
  private parseAIResponse(response: unknown): GeneratedWorkout {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid AI response format');
    }
    return response as GeneratedWorkout;
  }

  /**
   * Get service metrics
   */
  getMetrics(): WorkoutGenerationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Reset service state (useful for testing)
   */
  resetService(): void {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorCount: 0,
      lastRequestTime: 0
    };
    this.cacheManager = new WorkoutCacheManager();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.openAIService.healthCheck();
  }
} 