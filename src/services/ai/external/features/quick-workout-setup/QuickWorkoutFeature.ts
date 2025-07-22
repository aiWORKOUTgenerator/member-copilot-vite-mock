// QuickWorkoutSetup Feature - Main Orchestrator
// Coordinates the complete quick workout generation workflow

import { OpenAIService } from '../../OpenAIService';
import { UserProfile } from '../../../types';
import { 
  QuickWorkoutParams, 
  QuickWorkoutResult, 
  WorkflowContext,
  QuickWorkoutMetadata,
  FeatureMetrics,
  FeatureCapabilities,
  isQuickWorkoutParams,
  DEFAULT_QUICK_WORKOUT_PARAMS
} from './types/quick-workout.types';
import { DurationStrategy } from './workflow/DurationStrategy';
import { PromptSelector } from './workflow/PromptSelector';
import { ResponseProcessor } from './workflow/ResponseProcessor';
import { QUICK_WORKOUT_CONSTANTS } from './constants/quick-workout.constants';
// Feature metadata (defined inline to avoid circular import)
const FEATURE_METADATA = {
  name: 'QuickWorkoutSetup',
  version: '1.0.0',
  description: 'AI-powered quick workout generation with duration-specific optimization',
  supportedDurations: [5, 10, 15, 20, 30, 45],
  capabilities: [
    'duration-specific-optimization',
    'context-aware-prompts',
    'workout-structure-normalization',
    'equipment-integration',
    'fitness-level-adaptation'
  ]
} as const;

/**
 * Dependencies for QuickWorkoutFeature
 */
export interface QuickWorkoutFeatureDependencies {
  openAIService: OpenAIService;
  durationStrategy?: DurationStrategy;
  promptSelector?: PromptSelector;
  responseProcessor?: ResponseProcessor;
}

/**
 * Main orchestrator for QuickWorkoutSetup feature
 * Coordinates duration strategy, prompt selection, AI generation, and response processing
 */
export class QuickWorkoutFeature {
  private readonly durationStrategy: DurationStrategy;
  private readonly promptSelector: PromptSelector;
  private readonly responseProcessor: ResponseProcessor;
  private readonly openAIService: OpenAIService;
  
  // Feature metrics
  private metrics: FeatureMetrics = {
    averageGenerationTime: 0,
    successRate: 0,
    errorRate: 0,
    durationUsage: {},
    mostPopularDuration: 30,
    averageConfidence: 0.8,
    averageStructureScore: 85
  };
  
  private generationHistory: Array<{
    duration: number;
    success: boolean;
    generationTime: number;
    confidence: number;
    structureScore: number;
  }> = [];

  constructor(dependencies: QuickWorkoutFeatureDependencies) {
    this.openAIService = dependencies.openAIService;
    this.durationStrategy = dependencies.durationStrategy || new DurationStrategy();
    this.promptSelector = dependencies.promptSelector || new PromptSelector();
    this.responseProcessor = dependencies.responseProcessor || new ResponseProcessor();
    
    console.log('🎯 QuickWorkoutFeature: Initialized with all workflow components');
  }

  /**
   * Main entry point: Generate a quick workout from parameters
   */
  async generateWorkout(
    params: QuickWorkoutParams, 
    userProfile: UserProfile
  ): Promise<QuickWorkoutResult> {
    const generationStartTime = Date.now();
    console.log(`🚀 QuickWorkoutFeature: Starting workout generation for ${params.duration}min workout`);

    try {
      // Validate input parameters
      this.validateInput(params, userProfile);

      // Create workflow context
      const context = this.createWorkflowContext(params, userProfile, generationStartTime);

      // Execute the complete workflow
      const result = await this.executeWorkflow(context);

      // Update metrics
      this.updateMetrics(result, Date.now() - generationStartTime, true);

      console.log(`✅ QuickWorkoutFeature: Workout generated successfully in ${Date.now() - generationStartTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ QuickWorkoutFeature: Workout generation failed:', error);
      
      // Update error metrics
      this.updateMetrics(null, Date.now() - generationStartTime, false);
      
      throw this.createFeatureError(error, params);
    }
  }

  /**
   * Execute the complete workflow
   */
  private async executeWorkflow(context: WorkflowContext): Promise<QuickWorkoutResult> {
    console.log('🔄 QuickWorkoutFeature: Executing complete workflow');

    // Step 1: Duration Strategy - Select optimal duration configuration
    console.log('1️⃣ QuickWorkoutFeature: Executing duration strategy');
    const durationResult = this.durationStrategy.selectStrategy(context.params, context.userProfile);
    
    if (!this.durationStrategy.validateStrategy(durationResult, context.params)) {
      throw new Error('Duration strategy validation failed');
    }

    // Update context with duration result
    context.selectedDuration = durationResult.adjustedDuration;
    context.durationConfig = durationResult.config;

    // Step 2: Prompt Selection - Build context-aware prompt
    console.log('2️⃣ QuickWorkoutFeature: Executing prompt selection');
    const promptResult = this.promptSelector.selectPrompt(durationResult, context.params, context.userProfile);
    
    if (!this.promptSelector.validateSelection(promptResult)) {
      throw new Error('Prompt selection validation failed');
    }

    // Update context with prompt result
    context.promptVariables = promptResult.variables;
    context.selectedPromptId = promptResult.promptId;

    // Step 3: AI Generation - Generate workout using OpenAI
    console.log('3️⃣ QuickWorkoutFeature: Executing AI generation');
    const aiResponse = await this.openAIService.generateFromTemplate(
      {
        id: promptResult.promptId,
        template: promptResult.promptTemplate,
        name: `QuickWorkout ${durationResult.adjustedDuration}min`,
        description: `Quick workout generation for ${durationResult.adjustedDuration} minutes`,
        variables: Object.keys(promptResult.variables).map(key => ({
          name: key,
          type: typeof promptResult.variables[key] as any,
          description: `Variable: ${key}`,
          required: true
        })),
        examples: [],
        version: '1.0.0'
      },
      promptResult.variables,
      {
        cacheKey: `quick_workout_${context.userProfile.fitnessLevel}_${durationResult.adjustedDuration}_${JSON.stringify(context.params)}`,
        timeout: QUICK_WORKOUT_CONSTANTS.REQUEST_TIMEOUT_MS
      }
    );

    // Step 4: Response Processing - Process and validate AI response
    console.log('4️⃣ QuickWorkoutFeature: Executing response processing');
    const processingResult = await this.responseProcessor.process(
      aiResponse,
      durationResult,
      context.params,
      context.generationStartTime
    );

    // Step 5: Create final result with metadata
    console.log('5️⃣ QuickWorkoutFeature: Creating final result');
    const result = this.createQuickWorkoutResult(
      processingResult,
      durationResult,
      promptResult,
      context
    );

    console.log(`✅ QuickWorkoutFeature: Workflow completed successfully`);
    return result;
  }

  /**
   * Create workflow context
   */
  private createWorkflowContext(
    params: QuickWorkoutParams,
    userProfile: UserProfile,
    generationStartTime: number
  ): WorkflowContext {
    return {
      params,
      userProfile,
      selectedDuration: params.duration,
      durationConfig: this.durationStrategy.getDurationConfig(params.duration),
      promptVariables: {},
      selectedPromptId: '',
      generationStartTime,
      retryCount: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Create the final QuickWorkoutResult
   */
  private createQuickWorkoutResult(
    processingResult: any,
    durationResult: any,
    promptResult: any,
    context: WorkflowContext
  ): QuickWorkoutResult {
    const generationTime = Date.now() - context.generationStartTime;

    // Create metadata
    const metadata: QuickWorkoutMetadata = {
      generatedAt: new Date(),
      generationTime,
      aiModel: 'gpt-4o',
      durationConfig: durationResult.config,
      promptTemplate: promptResult.promptId,
      originalDuration: context.params.duration,
      adjustedDuration: durationResult.adjustedDuration,
      durationAdjustmentReason: durationResult.adjustmentReason,
      featuresUsed: [
        'duration-strategy',
        'prompt-selection',
        'response-processing',
        'workout-normalization'
      ],
      fallbacksUsed: []
    };

    // Create duration optimization info
    const durationOptimization = this.durationStrategy.createDurationOptimization(
      context.params,
      durationResult
    );

    // Generate personalized notes
    const personalizedNotes = [
      ...durationResult.recommendations,
      ...promptResult.contextFactors,
      `Generated using ${durationResult.config.name} template (${durationResult.config.complexity} complexity)`
    ];

    // Generate safety reminders
    const safetyReminders = [
      'Always warm up before exercising and cool down afterwards',
      'Listen to your body and stop if you experience pain or excessive fatigue',
      'Stay hydrated throughout your workout',
      'Focus on proper form over speed or intensity'
    ];

    if (context.params.sorenessAreas.length > 0) {
      safetyReminders.push(`Avoid intense work on sore areas: ${context.params.sorenessAreas.join(', ')}`);
    }

    return {
      workout: processingResult.workout,
      metadata,
      confidence: processingResult.workout.confidence || 0.8,
      reasoning: promptResult.selectionReasoning,
      durationOptimization,
      personalizedNotes,
      safetyReminders
    };
  }

  /**
   * Validate input parameters
   */
  private validateInput(params: QuickWorkoutParams, userProfile: UserProfile): void {
    if (!isQuickWorkoutParams(params)) {
      throw new Error('Invalid QuickWorkoutParams provided');
    }

    if (!userProfile) {
      throw new Error('UserProfile is required for workout generation');
    }

    // Validate duration
    if (params.duration < QUICK_WORKOUT_CONSTANTS.MIN_DURATION || 
        params.duration > QUICK_WORKOUT_CONSTANTS.MAX_DURATION) {
      throw new Error(`Duration must be between ${QUICK_WORKOUT_CONSTANTS.MIN_DURATION} and ${QUICK_WORKOUT_CONSTANTS.MAX_DURATION} minutes`);
    }

    // Validate energy level
    if (params.energyLevel < 1 || params.energyLevel > 10) {
      throw new Error('Energy level must be between 1 and 10');
    }

    // Validate fitness level
    if (!['new to exercise', 'some experience', 'advanced athlete'].includes(params.fitnessLevel)) {
      throw new Error('Invalid fitness level provided');
    }
  }

  /**
   * Create feature-specific error
   */
  private createFeatureError(error: unknown, params: QuickWorkoutParams): Error {
    const baseMessage = error instanceof Error ? error.message : String(error);
    
    return new Error(
      `QuickWorkoutSetup feature failed: ${baseMessage} ` +
      `(Duration: ${params.duration}min, Fitness: ${params.fitnessLevel}, Energy: ${params.energyLevel}/10)`
    );
  }

  /**
   * Update feature metrics
   */
  private updateMetrics(
    result: QuickWorkoutResult | null,
    generationTime: number,
    success: boolean
  ): void {
    this.generationHistory.push({
      duration: result?.durationOptimization.actualDuration || 0,
      success,
      generationTime,
      confidence: result?.confidence || 0,
      structureScore: result ? 85 : 0 // Would come from processing result
    });

    // Update duration usage
    if (result) {
      const duration = result.durationOptimization.actualDuration;
      this.metrics.durationUsage[duration] = (this.metrics.durationUsage[duration] || 0) + 1;
    }

    // Recalculate metrics
    const recentHistory = this.generationHistory.slice(-100); // Last 100 generations
    
    this.metrics.averageGenerationTime = recentHistory.reduce((sum, h) => sum + h.generationTime, 0) / recentHistory.length;
    this.metrics.successRate = recentHistory.filter(h => h.success).length / recentHistory.length;
    this.metrics.errorRate = 1 - this.metrics.successRate;
    this.metrics.averageConfidence = recentHistory.filter(h => h.success).reduce((sum, h) => sum + h.confidence, 0) / recentHistory.filter(h => h.success).length || 0;
    this.metrics.averageStructureScore = recentHistory.filter(h => h.success).reduce((sum, h) => sum + h.structureScore, 0) / recentHistory.filter(h => h.success).length || 0;
    
    // Find most popular duration
    const durationCounts = Object.entries(this.metrics.durationUsage);
    if (durationCounts.length > 0) {
      this.metrics.mostPopularDuration = parseInt(
        durationCounts.reduce((max, current) => current[1] > max[1] ? current : max)[0]
      );
    }
  }

  /**
   * Get feature capabilities
   */
  getCapabilities(): FeatureCapabilities {
    return {
      supportedDurations: QUICK_WORKOUT_CONSTANTS.SUPPORTED_DURATIONS,
      supportedFitnessLevels: ['new to exercise', 'some experience', 'advanced athlete'],
      supportedFocusAreas: ['Quick Sweat', 'Strength Building', 'Core & Abs Focus', 'Flexibility & Mobility', 'Cardio Blast'],
      supportedEquipment: ['Body Weight', 'Dumbbells', 'Resistance Bands', 'Kettlebell', 'Pull-up Bar'],
      contextAwareness: true,
      durationOptimization: true,
      equipmentAdaptation: true,
      fitnessLevelScaling: true,
      cacheSupport: true,
      fallbackSupport: true,
      metricsTracking: true
    };
  }

  /**
   * Get feature metrics
   */
  getMetrics(): FeatureMetrics {
    return { ...this.metrics };
  }

  /**
   * Get feature metadata
   */
  getMetadata() {
    return FEATURE_METADATA;
  }

  /**
   * Health check for the feature
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with minimal parameters
      const testParams: QuickWorkoutParams = {
        ...DEFAULT_QUICK_WORKOUT_PARAMS,
        duration: 10,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 5,
        sorenessAreas: [],
        equipment: []
      };

      const testProfile: UserProfile = {
        fitnessLevel: 'some experience',
        goals: ['general fitness'],
        basicLimitations: {
          availableEquipment: [],
          timeConstraints: 10
        }
      } as UserProfile;

      // Test duration strategy
      const durationResult = this.durationStrategy.selectStrategy(testParams, testProfile);
      if (!durationResult || !durationResult.config) {
        return false;
      }

      // Test prompt selection
      const promptResult = this.promptSelector.selectPrompt(durationResult, testParams, testProfile);
      if (!promptResult || !promptResult.promptTemplate) {
        return false;
      }

      console.log('✅ QuickWorkoutFeature: Health check passed');
      return true;

    } catch (error) {
      console.error('❌ QuickWorkoutFeature: Health check failed:', error);
      return false;
    }
  }

  /**
   * Reset feature metrics
   */
  resetMetrics(): void {
    this.metrics = {
      averageGenerationTime: 0,
      successRate: 0,
      errorRate: 0,
      durationUsage: {},
      mostPopularDuration: 30,
      averageConfidence: 0.8,
      averageStructureScore: 85
    };
    this.generationHistory = [];
    
    console.log('🔄 QuickWorkoutFeature: Metrics reset');
  }
} 