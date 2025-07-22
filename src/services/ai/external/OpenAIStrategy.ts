// OpenAI Strategy - Implements AIStrategy interface for OpenAI integration
import { 
  AIStrategy, 
  GeneratedWorkout, 
  EnhancedRecommendation, 
  UserPreferenceAnalysis
} from './types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../types/workout-generation.types';
import { PrioritizedRecommendation, GlobalAIContext } from '../core/types/AIServiceTypes';
import { AIInsight } from '../../../types/insights';
import { OpenAIService } from './OpenAIService';
import { 
  selectRecommendationPrompt 
} from './prompts/recommendation.prompts';
import { 
  isFeatureEnabled, 
  isLegacyQuickWorkoutDisabled, 
  isNewQuickWorkoutFeatureForced,
  getQuickWorkoutSystemPreference,
  validateQuickWorkoutSetupConfig
} from './config/openai.config';
import { logger } from '../../../utils/logger';
import { WorkoutVariableBuilder } from './helpers/WorkoutVariableBuilder';
import { ErrorHandler } from './helpers/ErrorHandler';
import { OPENAI_STRATEGY_CONSTANTS } from './constants/openai-constants';
import { 
  createInsightEnhancementPrompt,
  createUserAnalysisPrompt,
  parseEnhancedInsights,
  parseUserAnalysis,
  createBasicUserAnalysis
} from './helpers/AIAnalysisHelpers';
import { enhanceGeneratedWorkout } from './helpers/WorkoutEnhancementHelpers';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';

// ✅ NEW: Import QuickWorkoutSetup feature
import { QuickWorkoutFeature, QuickWorkoutParams } from './features/quick-workout-setup/index';


export class OpenAIStrategy implements AIStrategy {
  private openAIService?: OpenAIService;
  private fallbackStrategy?: AIStrategy;
  // ✅ NEW: QuickWorkoutSetup feature instance
  private quickWorkoutFeature?: QuickWorkoutFeature;

  constructor(
    openAIService?: OpenAIService,
    fallbackStrategy?: AIStrategy
  ) {
    try {
      this.openAIService = openAIService ?? new OpenAIService();
      
      // ✅ NEW: Initialize QuickWorkoutSetup feature
      if (this.openAIService) {
        this.quickWorkoutFeature = new QuickWorkoutFeature({
          openAIService: this.openAIService
        });
        console.log('🎯 OpenAIStrategy: QuickWorkoutSetup feature initialized');
      }
    } catch (error) {
      console.warn('⚠️  Failed to create OpenAIService, using fallback strategy:', error);
      this.openAIService = undefined;
      this.quickWorkoutFeature = undefined;
    }
    this.fallbackStrategy = fallbackStrategy;
  }

  // Generate AI-powered recommendations
  async generateRecommendations(context: GlobalAIContext): Promise<PrioritizedRecommendation[]> {
    try {
      if (!isFeatureEnabled('openai_enhanced_recommendations')) {
        return this.fallbackToRuleBased('recommendations', context);
      }

      // Select appropriate prompt based on context
      const prompt = selectRecommendationPrompt(
        'enhanced',
        context.userProfile.fitnessLevel,
        'detailed'
      );

      // Prepare prompt variables using helper
      const variables = {
        ...WorkoutVariableBuilder.buildRecommendationVariables(context),
        detectedIssues: this.analyzeCurrentIssues(context),
        optimizationOpportunities: this.findOptimizationOpportunities(context)
      };

      // Check if OpenAIService is available
      if (!this.openAIService) {
        return this.fallbackToRuleBased('recommendations', context);
      }

      // Generate recommendations using OpenAI
      const recommendations = await this.openAIService.generateFromTemplate(
        prompt,
        variables,
        {
          cacheKey: `recommendations_${context.userProfile.fitnessLevel}_${Date.now()}`,
          timeout: OPENAI_STRATEGY_CONSTANTS.RECOMMENDATION_TIMEOUT
        }
      );

      // Validate and convert to PrioritizedRecommendation format
      return this.convertToStandardRecommendations(recommendations as EnhancedRecommendation[], context);

    } catch (error) {
      logger.error('OpenAI recommendations failed:', error);
      return ErrorHandler.handleRecommendationError(error, context, this.fallbackStrategy);
    }
  }

  // ✅ ENHANCED: Generate AI-powered workout with feature-first approach
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Check if OpenAIService is available
      if (!this.openAIService) {
        throw new Error('OpenAI service not available. Please configure VITE_OPENAI_API_KEY for AI-powered workouts.');
      }

      // ✅ NEW: Try to use QuickWorkoutSetup feature if available and applicable
      if (this.quickWorkoutFeature && this.isQuickWorkoutApplicable(request)) {
        console.log('🎯 OpenAIStrategy: Using QuickWorkoutSetup feature for workout generation');
        return await this.generateWorkoutUsingFeature(request);
      }

      // ✅ FALLBACK: Use legacy approach if feature not available or not applicable
      console.log('🔄 OpenAIStrategy: Using legacy workout generation approach');
      return await this.generateWorkoutLegacy(request);

    } catch (error) {
      // Enhanced error logging with actionable information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      
      logger.error('OpenAI workout generation failed:', {
        error: errorMessage,
        stack: errorStack,
        requestKeys: Object.keys(request),
        hasUserProfile: !!request.userProfile,
        userProfileKeys: request.userProfile ? Object.keys(request.userProfile) : 'N/A',
        fitnessLevel: request.userProfile?.fitnessLevel || 'MISSING'
      });
      
      // Create more specific error based on the type
      if (errorMessage.includes('userProfile is required')) {
        throw new Error('Workout generation failed: User profile is incomplete. Please complete your profile before generating workouts.');
      } else if (errorMessage.includes('fitnessLevel is required')) {
        throw new Error('Workout generation failed: Fitness level is missing from profile. Please update your profile with your experience level.');
      } else {
        throw ErrorHandler.createWorkoutError(error, request);
      }
    }
  }

  // ✅ NEW: Generate workout using QuickWorkoutSetup feature
  private async generateWorkoutUsingFeature(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    if (!this.quickWorkoutFeature) {
      throw new Error('QuickWorkoutSetup feature not available');
    }

    // Convert WorkoutGenerationRequest to QuickWorkoutParams
    const quickWorkoutParams = this.convertToQuickWorkoutParams(request);
    
    // Generate workout using feature
    const result = await this.quickWorkoutFeature.generateWorkout(quickWorkoutParams, request.userProfile);
    
    // Return the generated workout
    return result.workout;
  }

  // ✅ NEW: Convert WorkoutGenerationRequest to QuickWorkoutParams
  private convertToQuickWorkoutParams(request: WorkoutGenerationRequest): QuickWorkoutParams {
    const preferences = request.preferences ?? {
      duration: 30,
      focus: 'general',
      intensity: 'moderate' as const,
      equipment: [],
      location: 'home' as const
    };

    const constraints = request.constraints ?? {
      energyLevel: 5,
      sorenessAreas: []
    };

    return {
      duration: preferences.duration,
      fitnessLevel: this.mapFitnessLevel(request.userProfile.fitnessLevel),
      focus: preferences.focus,
      energyLevel: constraints.energyLevel,
      sorenessAreas: constraints.sorenessAreas,
      equipment: preferences.equipment,
      location: preferences.location,
      intensity: preferences.intensity
    };
  }

  // ✅ NEW: Map system fitness levels to QuickWorkout fitness levels
  private mapFitnessLevel(systemLevel: string): 'new to exercise' | 'some experience' | 'advanced athlete' {
    const mapping: Record<string, 'new to exercise' | 'some experience' | 'advanced athlete'> = {
      'beginner': 'new to exercise',
      'novice': 'new to exercise', 
      'intermediate': 'some experience',
      'advanced': 'advanced athlete',
      'adaptive': 'some experience'
    };
    
    return mapping[systemLevel] || 'some experience';
  }

  // ✅ ENHANCED: Check if QuickWorkoutSetup feature is applicable with feature flags
  private isQuickWorkoutApplicable(request: WorkoutGenerationRequest): boolean {
    // Check feature flags first
    const systemPreference = getQuickWorkoutSystemPreference();
    
    if (systemPreference === 'new') {
      console.log('🎯 OpenAIStrategy: New QuickWorkoutSetup feature forced via feature flag');
      return true;
    }
    
    if (systemPreference === 'legacy') {
      console.log('🔄 OpenAIStrategy: Legacy system forced via feature flag');
      return false;
    }
    
    // Hybrid mode - check if feature is applicable for quick workouts (5-45 minutes)
    const duration = request.preferences?.duration ?? 30;
    const supportedDurations = [5, 10, 15, 20, 30, 45];
    
    // Check if duration is supported or close to supported
    const isSupported = supportedDurations.some(d => Math.abs(d - duration) <= 5);
    
    // Check if we have required data
    const hasRequiredData = !!(
      request.userProfile &&
      request.userProfile.fitnessLevel &&
      request.preferences
    );

    const applicable = isSupported && hasRequiredData;
    
    if (!applicable) {
      console.log(`🔄 OpenAIStrategy: QuickWorkout not applicable - Duration: ${duration}, HasData: ${hasRequiredData}`);
    }

    return applicable;
  }

  // ✅ ENHANCED: Legacy workout generation approach with feature flag checks
  private async generateWorkoutLegacy(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    // Check if legacy system is disabled
    if (isLegacyQuickWorkoutDisabled()) {
      throw new Error('Legacy QuickWorkoutSetup system is disabled. Please use the new feature-first system.');
    }
    
    // Validate request and configuration
    this.validateWorkoutRequest(request);
    
    // Prepare variables using helper
    const variables = WorkoutVariableBuilder.buildWorkoutVariables(request);
    
    // Execute workout generation
    const workout = await this.executeWorkoutGeneration(request, variables);
    
    // Enhance and validate the generated workout
    return this.enhanceGeneratedWorkout(workout, request);
  }

  // Enhance existing insights with AI
  async enhanceInsights(insights: AIInsight[], context: GlobalAIContext): Promise<AIInsight[]> {
    try {
      if (!isFeatureEnabled('openai_enhanced_recommendations') || insights.length === 0) {
        return insights;
      }

      // Check if OpenAIService is available
      if (!this.openAIService) {
        return insights; // Return original insights if service not available
      }

      // Create enhancement prompt using helper
      const enhancementPrompt = createInsightEnhancementPrompt(context, insights);

      const enhanced = await this.openAIService.makeRequest([
        { role: 'system', content: enhancementPrompt }
      ], {
        maxTokens: OPENAI_STRATEGY_CONSTANTS.INSIGHT_ENHANCEMENT_MAX_TOKENS,
        temperature: OPENAI_STRATEGY_CONSTANTS.RECOMMENDATION_TEMPERATURE,
        cacheKey: `enhanced_insights_${context.userProfile.fitnessLevel}_${JSON.stringify(insights)}`
      });

      const enhancedContent = enhanced.choices[0]?.message?.content;
      return parseEnhancedInsights(enhancedContent, insights);

    } catch (error) {
      ErrorHandler.logError(error, 'enhanceInsights', { insights, context });
      return insights; // Return original insights on failure
    }
  }

  // Analyze user preferences using AI
  async analyzeUserPreferences(context: GlobalAIContext): Promise<UserPreferenceAnalysis> {
    try {
      if (!isFeatureEnabled('openai_user_analysis')) {
        return createBasicUserAnalysis(context);
      }

      // Check if OpenAIService is available
      if (!this.openAIService) {
        return createBasicUserAnalysis(context); // Use fallback if service not available
      }

      const analysisPrompt = createUserAnalysisPrompt(context);

      const analysis = await this.openAIService.makeRequest([
        { role: 'system', content: analysisPrompt }
      ], {
        maxTokens: OPENAI_STRATEGY_CONSTANTS.USER_ANALYSIS_MAX_TOKENS,
        temperature: OPENAI_STRATEGY_CONSTANTS.USER_ANALYSIS_TEMPERATURE,
        cacheKey: `user_analysis_${context.userProfile.fitnessLevel}_${JSON.stringify(context.sessionHistory)}`
      });

      const analysisContent = analysis.choices[0]?.message?.content;
      return parseUserAnalysis(analysisContent, context);

    } catch (error) {
      ErrorHandler.logError(error, 'analyzeUserPreferences', { context });
      return createBasicUserAnalysis(context);
    }
  }

  // ✅ ENHANCED: Get comprehensive QuickWorkoutSetup system information
  getQuickWorkoutFeatureInfo() {
    const systemPreference = getQuickWorkoutSystemPreference();
    const configValidation = validateQuickWorkoutSetupConfig();
    
    return {
      // Feature availability
      hasFeature: !!this.quickWorkoutFeature,
      isInitialized: !!this.quickWorkoutFeature,
      
      // System configuration
      currentSystem: systemPreference,
      configValidation,
      
      // Feature capabilities (if available)
      capabilities: this.quickWorkoutFeature ? this.quickWorkoutFeature.getCapabilities() : null,
      metrics: this.quickWorkoutFeature ? this.quickWorkoutFeature.getMetrics() : null,
      metadata: this.quickWorkoutFeature ? this.quickWorkoutFeature.getMetadata() : null,
      
      // Feature flags
      featureFlags: {
        legacyDisabled: isLegacyQuickWorkoutDisabled(),
        newSystemForced: isNewQuickWorkoutFeatureForced(),
        hybridMode: systemPreference === 'hybrid'
      },
      
      // Recommendations
      recommendations: configValidation.recommendations
    };
  }

  // ✅ NEW: Health check including feature health
  async healthCheck(): Promise<{
    overall: boolean;
    openAIService: boolean;
    quickWorkoutFeature: boolean;
  }> {
    const openAIServiceHealthy = this.openAIService ? true : false;
    const quickWorkoutFeatureHealthy = this.quickWorkoutFeature ? await this.quickWorkoutFeature.healthCheck() : false;
    
    return {
      overall: openAIServiceHealthy,
      openAIService: openAIServiceHealthy,
      quickWorkoutFeature: quickWorkoutFeatureHealthy
    };
  }

  // Private helper methods (existing methods preserved)
  private analyzeCurrentIssues(context: GlobalAIContext): string {
    const issues: string[] = [];
    
    const energyLevel = context.currentSelections.customization_energy ?? OPENAI_STRATEGY_CONSTANTS.DEFAULT_ENERGY_LEVEL;
    const duration = context.currentSelections.customization_duration ?? OPENAI_STRATEGY_CONSTANTS.DEFAULT_WORKOUT_DURATION;
    const focus = context.currentSelections.customization_focus ?? '';

    if (energyLevel <= OPENAI_STRATEGY_CONSTANTS.ENERGY_THRESHOLD_LOW && 
        (typeof duration === 'number' && duration > OPENAI_STRATEGY_CONSTANTS.DEFAULT_WORKOUT_DURATION)) {
      issues.push('Low energy level with long workout duration');
    }

    if (energyLevel <= OPENAI_STRATEGY_CONSTANTS.ENERGY_THRESHOLD_LOW && 
        (focus === 'Quick Sweat' || focus === 'Core & Abs Focus')) {
      issues.push('Low energy level with high-intensity focus');
    }

    return issues.join('; ') || 'No significant issues detected';
  }

  private findOptimizationOpportunities(context: GlobalAIContext): string {
    const opportunities: string[] = [];
    
    const energyLevel = context.currentSelections.customization_energy ?? OPENAI_STRATEGY_CONSTANTS.DEFAULT_ENERGY_LEVEL;
    const equipment = context.currentSelections.customization_equipment ?? '';
    
    if (energyLevel >= OPENAI_STRATEGY_CONSTANTS.ENERGY_THRESHOLD_FOR_COMPLEX_CIRCUITS && 
        (Array.isArray(equipment) && equipment.length > 0)) {
      opportunities.push('High energy with diverse equipment - opportunity for complex circuits');
    }

    if (context.userProfile.goals?.includes('weight_loss') && 
        energyLevel >= OPENAI_STRATEGY_CONSTANTS.ENERGY_THRESHOLD_FOR_WEIGHT_LOSS) {
      opportunities.push('Good energy level for effective weight loss workout');
    }

    return opportunities.join('; ') || 'Consider matching intensity to energy level';
  }

  private convertToStandardRecommendations(
    aiRecommendations: EnhancedRecommendation[],
    _context: GlobalAIContext
  ): PrioritizedRecommendation[] {
    if (!Array.isArray(aiRecommendations)) {
      return [];
    }

    return aiRecommendations.map(rec => ({
      id: rec.id,
      priority: rec.priority,
      category: rec.category,
      targetComponent: rec.targetComponent,
      title: rec.title,
      description: rec.description,
      reasoning: rec.personalizedReasoning ?? rec.reasoning,
      confidence: rec.confidence,
      action: rec.action,
      risk: rec.risk
    }));
  }

  // Validate workout generation request
  private validateWorkoutRequest(request: WorkoutGenerationRequest): void {
    if (!isFeatureEnabled('openai_workout_generation')) {
      throw new Error(OPENAI_STRATEGY_CONSTANTS.ERROR_MESSAGES.WORKOUT_GENERATION_DISABLED);
    }
    
    // Validate userProfile exists and has required fields
    if (!request.userProfile) {
      throw new Error('OpenAIStrategy: userProfile is required for workout generation. Please ensure the user profile is complete.');
    }
    
    if (!request.userProfile.fitnessLevel) {
      throw new Error(`OpenAIStrategy: userProfile.fitnessLevel is required but missing. Available userProfile fields: ${Object.keys(request.userProfile).join(', ')}`);
    }
    
    // Log validation success for debugging
    console.log('✅ Workout request validation passed:', {
      hasUserProfile: !!request.userProfile,
      fitnessLevel: request.userProfile.fitnessLevel,
      hasPreferences: !!request.preferences,
      requestKeys: Object.keys(request)
    });
  }

  // Execute workout generation with OpenAI
  private async executeWorkoutGeneration(
    request: WorkoutGenerationRequest, 
    variables: Record<string, string | number | string[] | boolean>
  ): Promise<GeneratedWorkout> {
    // Check if OpenAIService is available
    if (!this.openAIService) {
      throw new Error('OpenAI service not available for workout generation');
    }

    // Ensure request has preferences, use defaults if missing
    const preferences = request.preferences ?? {
      duration: 30,
      focus: 'general',
      intensity: 'moderate' as const,
      equipment: [],
      location: 'home' as const
    };

    // ALWAYS use simplified quick workout prompt for consistency
    const prompt = QUICK_WORKOUT_PROMPT_TEMPLATE;

    // Generate workout using OpenAI
    const result = await this.openAIService.generateFromTemplate(
      prompt,
      variables,
      {
        cacheKey: `workout_${request.userProfile.fitnessLevel}_${JSON.stringify(variables)}`,
        timeout: OPENAI_STRATEGY_CONSTANTS.WORKOUT_GENERATION_TIMEOUT
      }
    );
    
    // ✅ FIXED: Normalize the workout to fix duration calculation issues
    const normalizedWorkout = this.normalizeWorkoutStructure(result as any);
    
    return normalizedWorkout;
  }

  // Enhance and validate generated workout
  private enhanceGeneratedWorkout(
    workout: GeneratedWorkout, 
    request: WorkoutGenerationRequest
  ): GeneratedWorkout {
    return enhanceGeneratedWorkout(workout, request);
  }

  private async fallbackToRuleBased(
    _operation: string,
    context: GlobalAIContext
  ): Promise<PrioritizedRecommendation[]> {
    if (this.fallbackStrategy) {
      return await this.fallbackStrategy.generateRecommendations(context);
    }
    return [];
  }

  // Helper to normalize the workout structure to ensure consistent phases and durations
  private normalizeWorkoutStructure(workout: any): GeneratedWorkout {
    console.log('🔍 DEBUG: OpenAIStrategy.normalizeWorkoutStructure called with workout:', {
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
    
    // Handle phases at root level
    if (workout.warmup || workout.mainWorkout || workout.cooldown) {
      warmup = workout.warmup;
      mainWorkout = workout.mainWorkout;
      cooldown = workout.cooldown;
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

  // Helper to create a workout phase from exercises
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
          name: exercise.name || exercise.activityName || `Exercise ${index + 1}`,
          description: exercise.description || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'}`,
          duration: exerciseDuration,
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

  // Helper to create a default workout phase
  private createDefaultPhase(name: string, duration: number): any {
    let exerciseDuration = duration * 60; // Convert minutes to seconds
    
    // ✅ FIXED: Apply the same intelligent duration validation
    if (exerciseDuration >= 1 && exerciseDuration <= 10) {
      console.warn(`Default phase "${name}" has duration ${exerciseDuration} which appears to be in minutes. Converting to seconds.`);
      exerciseDuration = exerciseDuration * 60;
    }
    
    return {
      name,
      duration: exerciseDuration,
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
}

// Export singleton instance
export const openAIStrategy = new OpenAIStrategy(); 