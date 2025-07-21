import { WorkoutGenerationRequest, WorkoutRequestAdapter, GeneratedWorkout } from '../../../types/workout-generation.types';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { OpenAIService } from './OpenAIService';
import { dataTransformers } from '../../../utils/dataTransformers';
import { logger } from '../../../utils/logger';
import { WORKOUT_GENERATION_CONSTANTS } from './constants/workout-generation-constants';
import { validateWorkoutRequest, createValidationErrorMessage, createValidationWarningMessage } from './utils/workout-validation';
import { WorkoutCacheManager } from './utils/cache-manager';
import { WorkoutVariableBuilder } from './helpers/WorkoutVariableBuilder';

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

        // ✅ FIXED: Use centralized WorkoutVariableBuilder instead of local methods
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

        // ✅ FIXED: Parse and normalize AI response
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

    throw lastError || new Error('Workout generation failed after all retry attempts');
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
    // 🔍 DEBUG: Log the AI response structure
    console.log('🔍 WorkoutGenerationService.parseAIResponse - Input:', {
      hasResponse: !!aiResponse,
      responseType: typeof aiResponse,
      isObject: aiResponse && typeof aiResponse === 'object',
      isString: typeof aiResponse === 'string',
      topLevelKeys: aiResponse && typeof aiResponse === 'object' ? Object.keys(aiResponse) : 'N/A',
      hasWorkoutPlan: !!(aiResponse?.workoutPlan),
      hasWorkout: !!(aiResponse?.workout),
      hasData: !!(aiResponse?.data),
      hasPhases: !!(aiResponse?.phases),
      hasWarmup: !!(aiResponse?.warmup || aiResponse?.warmUp),
      hasMainWorkout: !!(aiResponse?.mainWorkout),
      hasCooldown: !!(aiResponse?.cooldown),
      stringLength: typeof aiResponse === 'string' ? aiResponse.length : 'N/A',
      stringPreview: typeof aiResponse === 'string' ? aiResponse.substring(0, 200) + '...' : 'N/A'
    });
    
    // Handle string responses (text that wasn't parsed as JSON)
    if (typeof aiResponse === 'string') {
      console.log('🔍 WorkoutGenerationService.parseAIResponse - Handling string response, attempting manual parsing');
      
      // Try to extract JSON from the string
      try {
        // Look for JSON object in the string
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('🔍 WorkoutGenerationService.parseAIResponse - Successfully extracted JSON from string');
          return this.normalizeWorkoutStructure(parsed);
        }
      } catch (error) {
        console.warn('🔍 WorkoutGenerationService.parseAIResponse - Failed to extract JSON from string:', error);
      }
      
      // If JSON extraction fails, create a basic workout from the text
      console.log('🔍 WorkoutGenerationService.parseAIResponse - Creating basic workout from text response');
      return this.createBasicWorkoutFromText(aiResponse);
    }
    
    // Handle nested response structure (e.g., { workoutPlan: { ... } })
    if (aiResponse && typeof aiResponse === 'object') {
      // Check if response is nested under workoutPlan
      if (aiResponse.workoutPlan && typeof aiResponse.workoutPlan === 'object') {
        console.log('🔍 WorkoutGenerationService.parseAIResponse - Using workoutPlan nested structure');
        return this.normalizeWorkoutStructure(aiResponse.workoutPlan);
      }
      
      // Check if response is nested under workout
      if (aiResponse.workout && typeof aiResponse.workout === 'object') {
        console.log('🔍 WorkoutGenerationService.parseAIResponse - Using workout nested structure');
        return this.normalizeWorkoutStructure(aiResponse.workout);
      }
      
      // Check if response is nested under data
      if (aiResponse.data && typeof aiResponse.data === 'object') {
        console.log('🔍 WorkoutGenerationService.parseAIResponse - Using data nested structure');
        return this.normalizeWorkoutStructure(aiResponse.data);
      }
      
      // ✅ FIXED: Handle AI response with different property names
      if (aiResponse.workoutName || aiResponse.phases || aiResponse.warmUp || aiResponse.mainWorkout || aiResponse.cooldown) {
        console.log('🔍 WorkoutGenerationService.parseAIResponse - Using direct structure with recognized properties');
        return this.normalizeWorkoutStructure(aiResponse);
      }
      
      // If response looks like a workout already, normalize it
      if (this.isWorkoutStructure(aiResponse)) {
        console.log('🔍 WorkoutGenerationService.parseAIResponse - Using direct workout structure');
        return this.normalizeWorkoutStructure(aiResponse);
      }
    }
    
    // If we can't parse it, throw an error
    const errorMessage = `Invalid AI response format: ${JSON.stringify(aiResponse).substring(0, 200)}...`;
    console.error('🔍 WorkoutGenerationService.parseAIResponse - Parse failed:', errorMessage);
    throw new Error(errorMessage);
  }
  
  /**
   * Create a basic workout structure from text response
   */
  private createBasicWorkoutFromText(textResponse: string): GeneratedWorkout {
    console.log('🔍 WorkoutGenerationService.createBasicWorkoutFromText - Creating fallback workout');
    
    return {
      id: `workout_${Date.now()}`,
      title: 'AI-Generated Workout',
      description: 'A personalized workout based on your preferences',
      totalDuration: 30,
      estimatedCalories: 200,
      difficulty: 'some experience',
      equipment: ['Body Weight'],
      warmup: this.createDefaultPhase('Warm-up', 5),
      mainWorkout: this.createDefaultPhase('Main Workout', 20),
      cooldown: this.createDefaultPhase('Cool-down', 5),
      reasoning: textResponse.length > 500 ? textResponse.substring(0, 500) + '...' : textResponse,
      personalizedNotes: ['This workout was generated from a text response'],
      progressionTips: ['Focus on proper form', 'Increase intensity gradually'],
      safetyReminders: ['Stop if you feel pain', 'Stay hydrated'],
      generatedAt: new Date(),
      aiModel: 'gpt-4o',
      confidence: 0.7,
      tags: ['ai_generated', 'fallback']
    };
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
    console.log('🔍 DEBUG: normalizeWorkoutStructure called with workout:', {
      hasWorkout: !!workout,
      workoutKeys: workout ? Object.keys(workout) : 'N/A',
      hasWarmup: !!(workout?.warmup),
      hasMainWorkout: !!(workout?.mainWorkout),
      hasCooldown: !!(workout?.cooldown),
      warmupDuration: workout?.warmup?.duration,
      mainWorkoutDuration: workout?.mainWorkout?.duration,
      cooldownDuration: workout?.cooldown?.duration
    });
    
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

    // ✅ FIXED: Recalculate phase durations based on exercises to ensure accuracy
    if (warmup && warmup.exercises && Array.isArray(warmup.exercises)) {
      console.log(`🔍 DEBUG: Recalculating warm-up phase duration`);
      console.log(`🔍 DEBUG: Original warm-up duration: ${warmup.duration}`);
      // ✅ FIXED: Check if AI generated phase duration in minutes and convert
      if (warmup.duration && warmup.duration >= 1 && warmup.duration <= 10) {
        console.warn(`Warm-up phase has duration ${warmup.duration} which appears to be in minutes. Converting to seconds.`);
        warmup.duration = warmup.duration * 60;
      }
      warmup = this.createPhaseFromExercises('Warm-up', warmup.exercises);
      console.log(`🔍 DEBUG: Final warm-up duration: ${warmup.duration}`);
    }
    if (mainWorkout && mainWorkout.exercises && Array.isArray(mainWorkout.exercises)) {
      console.log(`🔍 DEBUG: Recalculating main workout phase duration`);
      console.log(`🔍 DEBUG: Original main workout duration: ${mainWorkout.duration}`);
      // ✅ FIXED: Check if AI generated phase duration in minutes and convert
      if (mainWorkout.duration && mainWorkout.duration >= 1 && mainWorkout.duration <= 10) {
        console.warn(`Main workout phase has duration ${mainWorkout.duration} which appears to be in minutes. Converting to seconds.`);
        mainWorkout.duration = mainWorkout.duration * 60;
      }
      mainWorkout = this.createPhaseFromExercises('Main Workout', mainWorkout.exercises);
      console.log(`🔍 DEBUG: Final main workout duration: ${mainWorkout.duration}`);
    }
    if (cooldown && cooldown.exercises && Array.isArray(cooldown.exercises)) {
      console.log(`🔍 DEBUG: Recalculating cool-down phase duration`);
      console.log(`🔍 DEBUG: Original cool-down duration: ${cooldown.duration}`);
      // ✅ FIXED: Check if AI generated phase duration in minutes and convert
      if (cooldown.duration && cooldown.duration >= 1 && cooldown.duration <= 10) {
        console.warn(`Cool-down phase has duration ${cooldown.duration} which appears to be in minutes. Converting to seconds.`);
        cooldown.duration = cooldown.duration * 60;
      }
      cooldown = this.createPhaseFromExercises('Cool-down', cooldown.exercises);
      console.log(`🔍 DEBUG: Final cool-down duration: ${cooldown.duration}`);
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
      aiModel: workout.aiModel || 'gpt-4o',
      confidence: workout.confidence || 0.8,
      tags: Array.isArray(workout.tags) ? workout.tags : []
    };
  }

  /**
   * Create a workout phase from an array of exercises
   */
  private createPhaseFromExercises(name: string, exercises: any[]): any {
    console.log(`🔍 DEBUG: Creating phase "${name}" with ${exercises.length} exercises`);
    
    // Calculate total duration including exercise time and rest periods
    const totalDuration = exercises.reduce((sum, ex, index) => {
      let exerciseDuration = ex.duration || ex.durationMinutes || 60;
      const restTime = ex.restTime || ex.rest || 30;
      
      console.log(`🔍 DEBUG: Exercise "${ex.name}" - original duration: ${exerciseDuration}, rest: ${restTime}`);
      
      // ✅ FIXED: More intelligent duration detection
      // If duration is between 1-10, it's likely in minutes and needs conversion
      // If duration is already 60+ seconds, it's already in seconds
      if (exerciseDuration >= 1 && exerciseDuration <= 10) {
        console.warn(`Exercise "${ex.name}" has duration ${exerciseDuration} which appears to be in minutes. Converting to seconds.`);
        exerciseDuration = exerciseDuration * 60;
      }
      
      // Add exercise duration
      let phaseTime = exerciseDuration;
      
      // Add rest time after each exercise (except the last one)
      if (index < exercises.length - 1) {
        phaseTime += restTime;
      }
      
      console.log(`🔍 DEBUG: Exercise "${ex.name}" - final duration: ${exerciseDuration}, phase time: ${phaseTime}, running sum: ${sum + phaseTime}`);
      
      return sum + phaseTime;
    }, 0);
    
    console.log(`🔍 DEBUG: Phase "${name}" total duration: ${totalDuration} seconds`);
    
    return {
      name,
      duration: totalDuration,
      exercises: exercises.map((exercise, index) => {
        let exerciseDuration = exercise.duration || exercise.durationMinutes || 60;
        
        // ✅ FIXED: Apply the same intelligent duration fix to individual exercises
        if (exerciseDuration >= 1 && exerciseDuration <= 10) {
          exerciseDuration = exerciseDuration * 60;
        }
        
        return {
          id: exercise.id || `exercise_${index + 1}`,
          name: exercise.name || exercise.activityName || `Exercise ${index + 1}`, // ✅ FIXED: Handle activityName
          description: exercise.description || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'}`,
          duration: exerciseDuration, // ✅ FIXED: Use corrected duration
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
        };
      }),
      instructions: `Complete ${name.toLowerCase()} phase with proper form`,
      tips: []
    };
  }

  /**
   * Create a default workout phase
   */
  private createDefaultPhase(name: string, duration: number): any {
    let exerciseDuration = duration * 60; // Convert minutes to seconds
    
    // ✅ FIXED: Apply the same intelligent duration validation
    if (exerciseDuration >= 1 && exerciseDuration <= 10) {
      console.warn(`Default phase "${name}" has duration ${exerciseDuration} which appears to be in minutes. Converting to seconds.`);
      exerciseDuration = exerciseDuration * 60;
    }
    
    return {
      name,
      duration: exerciseDuration, // Phase duration should match exercise duration
      exercises: [
        {
          id: `exercise_1`,
          name: `${name} Exercise`,
          description: `Perform ${name.toLowerCase()} exercises`,
          duration: exerciseDuration,
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