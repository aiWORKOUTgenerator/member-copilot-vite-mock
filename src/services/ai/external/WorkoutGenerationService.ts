import { WorkoutGenerationRequest, WorkoutRequestAdapter, GeneratedWorkout } from '../../../types/workout-generation.types';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { OpenAIService } from './OpenAIService';
import { dataTransformers } from '../../../utils/dataTransformers';
import { logger } from '../../../utils/logger';
import { WORKOUT_GENERATION_CONSTANTS } from './constants/workout-generation-constants';
import { validateWorkoutRequest, createValidationErrorMessage, createValidationWarningMessage } from './utils/workout-validation';
import { WorkoutCacheManager } from './utils/cache-manager';

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
   * Now uses unified WorkoutGenerationRequest interface
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    const startTime = Date.now();
    
    try {
      // Validate unified request structure
      const validation = WorkoutRequestAdapter.validateRequest(request);
      if (!validation.isValid) {
        throw new Error(`Invalid workout request: ${validation.errors.join(', ')}`);
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
   * Enhance request with AI-generated insights if not provided
   */
  private enhanceRequestWithAIInsights(request: WorkoutGenerationRequest): WorkoutGenerationRequest {
    // If AI enhancements are already provided, use them
    if (request.preferences && request.constraints && request.environmentalFactors) {
      return request;
    }

    // Create default enhancements based on user profile and workout data
    const defaultEnhancements = WorkoutRequestAdapter.createDefaultEnhancements(
      request.userProfile,
      request.workoutFocusData
    );

    // Enhance the request with defaults
    return WorkoutRequestAdapter.enhanceRequest(request, {
      preferences: request.preferences || defaultEnhancements.preferences,
      constraints: request.constraints || defaultEnhancements.constraints,
      environmentalFactors: request.environmentalFactors || defaultEnhancements.environmentalFactors
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

        // Prepare the prompt variables based on workout type
        const promptVariables = workoutType === 'quick' 
          ? this.prepareQuickWorkoutVariables(request)
          : this.prepareDetailedWorkoutVariables(request);

        // Generate the workout using OpenAI with timeout
        const aiResponse = await Promise.race([
          this.openAIService.generateFromTemplate(
            promptTemplate,
            promptVariables,
            { timeout: WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS }
          ),
          this.createTimeoutPromise(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS)
        ]);

        // ✅ FIXED: Parse and normalize AI response
        const generatedWorkout = this.parseAIResponse(aiResponse);
        return generatedWorkout;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on validation errors or user errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Log retry attempt
        logger.warn(`Workout generation attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxAttempts: WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS
        });

        // Wait before retry (exponential backoff)
        if (attempt < WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS) {
          const delay = WORKOUT_GENERATION_CONSTANTS.RETRY_DELAY_MS * Math.pow(WORKOUT_GENERATION_CONSTANTS.BACKOFF_MULTIPLIER, attempt - 1);
          await this.delay(Math.min(delay, WORKOUT_GENERATION_CONSTANTS.MAX_BACKOFF_DELAY_MS));
        }
      }
    }

    // All retries failed
    throw new Error(`${WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.RETRY_FAILED}. Last error: ${lastError?.message}`);
  }

  /**
   * Prepare variables for quick workout generation
   */
  private prepareQuickWorkoutVariables(request: WorkoutGenerationRequest) {
    const { workoutFocusData, userProfile } = request;
    
    return {
      experienceLevel: userProfile.fitnessLevel,
      primaryGoal: userProfile.goals?.[0] ?? 'general fitness',
      availableEquipment: dataTransformers.extractEquipmentList(workoutFocusData.customization_equipment),
      energyLevel: workoutFocusData.customization_energy ?? 5,
      sorenessAreas: Object.keys(workoutFocusData.customization_soreness ?? {}),
      duration: dataTransformers.extractDurationValue(workoutFocusData.customization_duration) ?? 30,
      focus: dataTransformers.extractFocusValue(workoutFocusData.customization_focus) ?? 'general'
    };
  }

  /**
   * Prepare variables for detailed workout generation
   */
  private prepareDetailedWorkoutVariables(request: WorkoutGenerationRequest) {
    const { profileData, workoutFocusData, userProfile } = request;
    
    return {
      // Profile data
      experienceLevel: profileData.experienceLevel,
      physicalActivity: profileData.physicalActivity,
      preferredDuration: profileData.preferredDuration,
      timeCommitment: profileData.timeCommitment,
      intensityLevel: profileData.calculatedWorkoutIntensity,
      preferredActivities: profileData.preferredActivities,
      availableEquipment: profileData.availableEquipment,
      primaryGoal: profileData.primaryGoal,
      goalTimeline: profileData.goalTimeline,
      age: profileData.age,
      height: profileData.height,
      weight: profileData.weight,
      gender: profileData.gender,
      hasCardiovascularConditions: profileData.hasCardiovascularConditions,
      injuries: profileData.injuries,
      
      // Workout focus data
      energyLevel: workoutFocusData.customization_energy,
      sorenessAreas: Object.keys(workoutFocusData.customization_soreness ?? {}),
      duration: dataTransformers.extractDurationValue(workoutFocusData.customization_duration),
      focus: dataTransformers.extractFocusValue(workoutFocusData.customization_focus),
      equipment: dataTransformers.extractEquipmentList(workoutFocusData.customization_equipment),
      
      // ✅ FIXED: Add missing required variables for detailed workout templates
      fitnessLevel: userProfile.fitnessLevel,
      goals: userProfile.goals,
      location: userProfile.basicLimitations.availableLocations[0] || 'home'
    };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(isCacheHit: boolean, responseTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = Date.now();
    
    if (isCacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
    
    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = totalTime / this.metrics.totalRequests;
  }

  /**
   * Handle errors with proper logging and context
   */
  private handleError(error: unknown, request: WorkoutGenerationRequest): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const requestType = request.workoutType;
    
    logger.error('Workout generation failed', {
      error: errorMessage,
      requestType,
      userProfile: request.userProfile.fitnessLevel,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Determine if an error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('validation') || 
             message.includes('invalid') || 
             message.includes('authentication') ||
             message.includes('unauthorized');
    }
    return false;
  }

  /**
   * Create a timeout promise for request cancellation
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Parse and normalize AI response to ensure it matches GeneratedWorkout structure
   */
  private parseAIResponse(aiResponse: any): GeneratedWorkout {
    // Handle nested response structure (e.g., { workoutPlan: { ... } })
    if (aiResponse && typeof aiResponse === 'object') {
      // Check if response is nested under workoutPlan
      if (aiResponse.workoutPlan && typeof aiResponse.workoutPlan === 'object') {
        return this.normalizeWorkoutStructure(aiResponse.workoutPlan);
      }
      
      // Check if response is nested under workout
      if (aiResponse.workout && typeof aiResponse.workout === 'object') {
        return this.normalizeWorkoutStructure(aiResponse.workout);
      }
      
      // Check if response is nested under data
      if (aiResponse.data && typeof aiResponse.data === 'object') {
        return this.normalizeWorkoutStructure(aiResponse.data);
      }
      
      // ✅ FIXED: Handle AI response with different property names
      if (aiResponse.workoutName || aiResponse.phases || aiResponse.warmUp || aiResponse.mainWorkout || aiResponse.cooldown) {
        return this.normalizeWorkoutStructure(aiResponse);
      }
      
      // If response looks like a workout already, normalize it
      if (this.isWorkoutStructure(aiResponse)) {
        return this.normalizeWorkoutStructure(aiResponse);
      }
    }
    
    // If we can't parse it, throw an error
    throw new Error(`Invalid AI response format: ${JSON.stringify(aiResponse).substring(0, 200)}...`);
  }

  /**
   * Check if an object has workout-like structure
   */
  private isWorkoutStructure(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Check for basic workout properties
    const hasBasicProps = obj.title || obj.name;
    
    // Check for workout phases in various formats
    const hasPhases = obj.warmup || obj.mainWorkout || obj.cooldown || 
                     (obj.phases && Array.isArray(obj.phases)) ||
                     (obj.exercises && Array.isArray(obj.exercises));
    
    // Check for workout plan wrapper
    const hasWorkoutPlan = obj.workoutPlan && typeof obj.workoutPlan === 'object';
    
    return hasBasicProps && (hasPhases || hasWorkoutPlan);
  }

  /**
   * Normalize workout structure to match GeneratedWorkout interface
   */
  private normalizeWorkoutStructure(workout: any): GeneratedWorkout {
    // Handle different phase structures
    let warmup, mainWorkout, cooldown;
    
    // ✅ FIXED: Handle various phase structures
    if (workout.phases && Array.isArray(workout.phases)) {
      // Handle phases with activities instead of exercises
      const phases = workout.phases.map((phase: any) => ({
        ...phase,
        name: phase.name || phase.phaseName,
        duration: phase.duration || phase.durationMinutes, // ✅ FIXED: Handle durationMinutes
        exercises: phase.exercises || phase.activities || []
      }));
      
      // Convert phases array to individual properties
      warmup = phases.find((phase: any) => 
        (phase.name?.toLowerCase().includes('warm') || 
         phase.phaseName?.toLowerCase().includes('warm') ||
         phase.name?.toLowerCase().includes('warmup') ||
         phase.phaseName?.toLowerCase().includes('warmup'))
      );
      mainWorkout = phases.find((phase: any) => 
        (phase.name?.toLowerCase().includes('main') || 
         phase.phaseName?.toLowerCase().includes('main') ||
         phase.name?.toLowerCase().includes('workout') ||
         phase.phaseName?.toLowerCase().includes('workout'))
      );
      cooldown = phases.find((phase: any) => 
        (phase.name?.toLowerCase().includes('cool') || 
         phase.phaseName?.toLowerCase().includes('cool') ||
         phase.name?.toLowerCase().includes('cooldown') ||
         phase.phaseName?.toLowerCase().includes('cooldown'))
      );
    } else if (workout.exercises && Array.isArray(workout.exercises)) {
      // Handle case where exercises are at root level
      const exercises = workout.exercises;
      const warmupExercises = exercises.filter((ex: any) => 
        ex.name?.toLowerCase().includes('warm') || 
        ex.category?.toLowerCase().includes('warm')
      );
      const mainExercises = exercises.filter((ex: any) => 
        !ex.name?.toLowerCase().includes('warm') && 
        !ex.name?.toLowerCase().includes('cool') &&
        !ex.category?.toLowerCase().includes('warm') &&
        !ex.category?.toLowerCase().includes('cool')
      );
      const cooldownExercises = exercises.filter((ex: any) => 
        ex.name?.toLowerCase().includes('cool') || 
        ex.category?.toLowerCase().includes('cool')
      );
      
      warmup = warmupExercises.length > 0 ? this.createPhaseFromExercises('Warm-up', warmupExercises) : null;
      mainWorkout = mainExercises.length > 0 ? this.createPhaseFromExercises('Main Workout', mainExercises) : null;
      cooldown = cooldownExercises.length > 0 ? this.createPhaseFromExercises('Cool-down', cooldownExercises) : null;
    } else if (workout.activities && Array.isArray(workout.activities)) {
      // Handle case where activities are at root level
      const activities = workout.activities;
      const warmupActivities = activities.filter((act: any) => 
        act.name?.toLowerCase().includes('warm') || 
        act.category?.toLowerCase().includes('warm')
      );
      const mainActivities = activities.filter((act: any) => 
        !act.name?.toLowerCase().includes('warm') && 
        !act.name?.toLowerCase().includes('cool') &&
        !act.category?.toLowerCase().includes('warm') &&
        !act.category?.toLowerCase().includes('cool')
      );
      const cooldownActivities = activities.filter((act: any) => 
        act.name?.toLowerCase().includes('cool') || 
        act.category?.toLowerCase().includes('cool')
      );
      
      warmup = warmupActivities.length > 0 ? this.createPhaseFromExercises('Warm-up', warmupActivities) : null;
      mainWorkout = mainActivities.length > 0 ? this.createPhaseFromExercises('Main Workout', mainActivities) : null;
      cooldown = cooldownActivities.length > 0 ? this.createPhaseFromExercises('Cool-down', cooldownActivities) : null;
    } else if (workout.warmUp || workout.mainWorkout || workout.cooldown) {
      // ✅ FIXED: Handle phases at root level with different property names
      warmup = workout.warmUp || workout.warmup;
      mainWorkout = workout.mainWorkout;
      cooldown = workout.cooldown;
    } else {
      warmup = workout.warmup;
      mainWorkout = workout.mainWorkout;
      cooldown = workout.cooldown;
    }

    // ✅ FIXED: Create default phases if none found
    if (!warmup && !mainWorkout && !cooldown) {
      // If we have any exercises at all, create a main workout phase
      if (workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
        mainWorkout = this.createPhaseFromExercises('Main Workout', workout.exercises);
        warmup = this.createDefaultPhase('Warm-up', 5);
        cooldown = this.createDefaultPhase('Cool-down', 5);
      } else {
        // Create all default phases
        warmup = this.createDefaultPhase('Warm-up', 5);
        mainWorkout = this.createDefaultPhase('Main Workout', 20);
        cooldown = this.createDefaultPhase('Cool-down', 5);
      }
    }

    return {
      id: workout.id || `workout_${Date.now()}`,
      title: workout.title || workout.name || workout.workoutName || 'Generated Workout',
      description: workout.description || 'AI-generated workout plan',
      totalDuration: workout.totalDuration || workout.duration || 30,
      estimatedCalories: workout.estimatedCalories || 200,
      difficulty: workout.difficulty || 'some experience',
      equipment: Array.isArray(workout.equipment) ? workout.equipment : [],
      warmup: warmup || this.createDefaultPhase('Warm-up', 5),
      mainWorkout: mainWorkout || this.createDefaultPhase('Main Workout', 20),
      cooldown: cooldown || this.createDefaultPhase('Cool-down', 5),
      reasoning: workout.reasoning || 'AI-generated workout based on your profile and preferences',
      personalizedNotes: Array.isArray(workout.personalizedNotes) ? workout.personalizedNotes : [],
      progressionTips: Array.isArray(workout.progressionTips) ? workout.progressionTips : [],
      safetyReminders: Array.isArray(workout.safetyReminders) ? workout.safetyReminders : [],
      generatedAt: workout.generatedAt || new Date(),
      aiModel: workout.aiModel || 'gpt-4-turbo',
      confidence: workout.confidence || 0.8,
      tags: Array.isArray(workout.tags) ? workout.tags : []
    };
  }

  /**
   * Create a workout phase from an array of exercises
   */
  private createPhaseFromExercises(name: string, exercises: any[]): any {
    const totalDuration = exercises.reduce((sum, ex) => sum + (ex.duration || ex.durationMinutes || 60), 0);
    
    return {
      name,
      duration: totalDuration,
      exercises: exercises.map((exercise, index) => ({
        id: exercise.id || `exercise_${index + 1}`,
        name: exercise.name || exercise.activityName || `Exercise ${index + 1}`, // ✅ FIXED: Handle activityName
        description: exercise.description || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'}`,
        duration: exercise.duration || exercise.durationMinutes || 60, // ✅ FIXED: Handle durationMinutes
        sets: exercise.sets || 1,
        reps: exercise.reps || exercise.repetitions || 10,
        restTime: exercise.rest || exercise.restTime || 30,
        equipment: exercise.equipment || exercise.equipmentNeeded ? [exercise.equipmentNeeded] : [],
        form: exercise.form || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'} with proper form`,
        modifications: exercise.modifications || [],
        commonMistakes: exercise.commonMistakes || [],
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        movementType: exercise.movementType || 'strength' as const,
        personalizedNotes: exercise.personalizedNotes || [],
        difficultyAdjustments: exercise.difficultyAdjustments || []
      })),
      instructions: `Complete ${name.toLowerCase()} phase with proper form`,
      tips: []
    };
  }

  /**
   * Create a default workout phase
   */
  private createDefaultPhase(name: string, duration: number): any {
    return {
      name,
      duration: duration, // ✅ FIXED: Use number instead of string
      exercises: [
        {
          id: `exercise_1`,
          name: `${name} Exercise`,
          description: `Perform ${name.toLowerCase()} exercises`,
          duration: duration * 60,
          form: `Perform ${name.toLowerCase()} exercises with proper form`,
          modifications: [],
          commonMistakes: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          movementType: 'strength' as const,
          personalizedNotes: [],
          difficultyAdjustments: []
        }
      ],
      instructions: `Complete ${name.toLowerCase()} phase`,
      tips: []
    };
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance metrics
   */
  getMetrics(): WorkoutGenerationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? this.metrics.cacheHits / totalRequests : 0;
    
    return {
      size: this.cacheManager.getStats().size,
      hitRate
    };
  }

  /**
   * Clear the workout cache
   */
  clearCache(): void {
    this.cacheManager.clearCache();
    logger.info('Workout cache cleared');
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if OpenAI service is available
      const openAIHealth = await this.openAIService.healthCheck();
      
      // Check cache health
      const cacheStats = this.getCacheStats();
      
      // Check error rate
      const errorRate = this.metrics.totalRequests > 0 
        ? this.metrics.errorCount / this.metrics.totalRequests 
        : 0;
      
      const isHealthy = openAIHealth && errorRate < 0.1; // Less than 10% error rate
      
      logger.info('Workout generation service health check', {
        openAIHealth,
        cacheSize: cacheStats.size,
        errorRate,
        isHealthy
      });
      
      return isHealthy;
    } catch (error) {
      logger.error('Workout generation service health check failed', { error });
      return false;
    }
  }
} 