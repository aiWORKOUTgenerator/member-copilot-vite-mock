// OpenAI Strategy - Implements AIStrategy interface for OpenAI integration
/**
 * OpenAIStrategy - Primary implementation of AIStrategy for OpenAI integration
 * 
 * CONSOLIDATION NOTE (2024):
 * This file is the consolidated primary implementation of OpenAIStrategy.
 * Previously, there was a duplicate implementation in /shared/core/OpenAIStrategy.ts
 * which has been removed. This version includes:
 * - Full DetailedWorkoutFeature integration
 * - QuickWorkoutFeature support
 * - Enhanced error handling and validation
 * - Comprehensive feature flag support
 * - Unified workout generation approach
 * 
 * All imports should reference this location:
 * import { OpenAIStrategy } from '../services/ai/external/OpenAIStrategy';
 */
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
} from './features/recommendation-system';
import { 
  isFeatureEnabled, 
  isLegacyQuickWorkoutDisabled, 
  isNewQuickWorkoutFeatureForced,
  getQuickWorkoutSystemPreference,
  validateQuickWorkoutSetupConfig
} from './config/openai.config';
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

// ✅ NEW: Import QuickWorkoutSetup feature
import { QuickWorkoutFeature, QuickWorkoutParams } from './features/quick-workout-setup/index';
import { WorkoutRequestValidator } from '../validation/core/WorkoutRequestValidator';
import { DetailedWorkoutFeature } from './features/detailed-workout-setup/DetailedWorkoutFeature';
import { DetailedWorkoutServiceAdapter } from './features/detailed-workout-setup/helpers/DetailedWorkoutServiceAdapter';


export class OpenAIStrategy implements AIStrategy {
  private openAIService?: OpenAIService;
  private fallbackStrategy?: AIStrategy;
  // ✅ NEW: QuickWorkoutSetup feature instance
  private quickWorkoutFeature?: QuickWorkoutFeature;
  private detailedWorkoutFeature!: DetailedWorkoutFeature;

  constructor(
    openAIService?: OpenAIService,
    fallbackStrategy?: AIStrategy
  ) {
    try {
      this.openAIService = openAIService ?? new OpenAIService();
      
      // Initialize QuickWorkoutSetup feature
      if (this.openAIService) {
        try {
          this.quickWorkoutFeature = new QuickWorkoutFeature({
            openAIService: this.openAIService
          });
        } catch (featureError) {
          console.error('❌ OpenAIStrategy: QuickWorkoutFeature initialization failed:', featureError);
          console.error('❌ Error details:', {
            message: featureError instanceof Error ? featureError.message : 'Unknown error',
            stack: featureError instanceof Error ? featureError.stack : 'No stack trace',
            name: featureError instanceof Error ? featureError.name : 'Unknown error type'
          });
          this.quickWorkoutFeature = undefined;
        }
      }

      // Initialize DetailedWorkoutFeature
      if (this.openAIService) {
        this.detailedWorkoutFeature = new DetailedWorkoutFeature({
          openAIService: this.openAIService,
          logger: console
        });
      } else {
        // Create a fallback DetailedWorkoutFeature without OpenAIService
        this.detailedWorkoutFeature = new DetailedWorkoutFeature({
          openAIService: undefined,
          logger: console
        });
      }
    } catch (error) {
      console.warn('⚠️  Failed to create OpenAIService, using fallback strategy:', error);
      this.openAIService = undefined;
      this.quickWorkoutFeature = undefined;
      this.detailedWorkoutFeature = new DetailedWorkoutFeature({
        logger: console
      });
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
      console.error('OpenAI recommendations failed:', error);
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
      // Validate request using new validation system
      const validation = WorkoutRequestValidator.validate(request);
      if (!validation.isValid) {
        throw new Error(`Invalid workout request: ${validation.errors.join(', ')}`);
      }
      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn(`Workout request warnings: ${validation.warnings.join(', ')}`);
      }
      // Always use QuickWorkoutSetup feature (no fallback)
      if (!this.quickWorkoutFeature) {
        throw new Error('QuickWorkoutSetup feature is required but not available');
      }
      if (!this.isQuickWorkoutApplicable(request)) {
        throw new Error('Request not suitable for QuickWorkoutSetup feature');
      }
      return await this.generateWorkoutUsingFeature(request);
    } catch (error) {
      // Enhanced error logging with actionable information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('OpenAI workout generation failed:', {
        error: errorMessage,
        stack: errorStack,
        requestKeys: Object.keys(request),
        hasUserProfile: !!request.userProfile,
        userProfileKeys: request.userProfile ? Object.keys(request.userProfile) : 'N/A',
        fitnessLevel: request.userProfile?.fitnessLevel || 'MISSING'
      });
      throw error;
    }
  }

  // ✅ NEW: Generate workout using QuickWorkoutSetup feature
  private async generateWorkoutUsingFeature(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    if (!this.quickWorkoutFeature) {
      throw new Error('QuickWorkoutSetup feature not available');
    }

    // Check if this should use detailed workout feature
    if (this.shouldUseDetailedWorkout(request)) {
      return await this.generateDetailedWorkout(request);
    }

    // Convert WorkoutGenerationRequest to QuickWorkoutParams
    const quickWorkoutParams = this.convertToQuickWorkoutParams(request);
    
    // Generate workout using feature
    const result = await this.quickWorkoutFeature.generateWorkout(quickWorkoutParams, request.userProfile);
    
    // Return the generated workout
    return result.workout;
  }

  private shouldUseDetailedWorkout(request: WorkoutGenerationRequest): boolean {
    const duration = request.preferences?.duration ?? 30;
    const hasComplexRequirements = request.preferences?.intensity === 'high';
    
    return duration > 45 || hasComplexRequirements;
  }

  private async generateDetailedWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Convert request to detailed workout params
      const detailedParams = DetailedWorkoutServiceAdapter.adaptQuickWorkoutRequest(request);

      // Generate workout using detailed feature
      const result = await this.detailedWorkoutFeature.generateWorkout(detailedParams);

      // Convert back to legacy format
      return DetailedWorkoutServiceAdapter.adaptToLegacyFormat(result);
    } catch (error) {
      console.error('Failed to generate detailed workout:', error);
      // Fall back to quick workout if detailed generation fails
      console.log('Falling back to QuickWorkoutSetup feature');
      const quickWorkoutParams = this.convertToQuickWorkoutParams(request);
      const result = await this.quickWorkoutFeature?.generateWorkout(quickWorkoutParams, request.userProfile);
      if (!result) {
        throw new Error('Failed to generate workout using QuickWorkoutSetup feature');
      }
      return result.workout;
    }
  }

  // ✅ NEW: Convert WorkoutGenerationRequest to QuickWorkoutParams
  private convertToQuickWorkoutParams(request: WorkoutGenerationRequest): QuickWorkoutParams {
    console.log('🔍 DEBUG - convertToQuickWorkoutParams input:', {
      hasPreferences: !!request.preferences,
      preferencesDuration: request.preferences?.duration,
      hasWorkoutFocusData: !!request.workoutFocusData,
      hasSelections: !!request.selections,
      selectionsDuration: request.selections?.customization_duration,
      workoutFocusDuration: request.workoutFocusData?.customization_duration,
      durationType: typeof request.workoutFocusData?.customization_duration
    });
    
    // Handle legacy format (selections) vs structured format (workoutFocusData + preferences)
    let extractedDuration: number;
    
    if (request.selections && !request.preferences) {
      // Legacy format: extract from selections
      const duration = request.selections.customization_duration;
      extractedDuration = typeof duration === 'number' ? duration : 30;
      console.log('🔍 DEBUG - convertToQuickWorkoutParams using legacy format, duration:', extractedDuration);
    } else {
      // Structured format: use preferences or workoutFocusData
      extractedDuration = 
        request.preferences?.duration ||
        (typeof request.workoutFocusData?.customization_duration === 'number' 
          ? request.workoutFocusData.customization_duration 
          : request.workoutFocusData?.customization_duration?.duration) ||
        30;
      console.log('🔍 DEBUG - convertToQuickWorkoutParams using structured format, duration:', extractedDuration);
    }
    
    console.log('🔍 DEBUG - convertToQuickWorkoutParams extracted duration:', extractedDuration);
    // Handle legacy format (selections) vs structured format (workoutFocusData + preferences)
    let extractedFocus: string;
    let extractedEquipment: string[];
    let extractedLocation: 'home' | 'gym' | 'outdoor';
    let extractedIntensity: 'low' | 'moderate' | 'high';
    let energyLevel: number;
    let sorenessAreas: string[];
    
    if (request.selections && !request.preferences) {
      // Legacy format: extract from selections
      const focus = request.selections.customization_focus;
      extractedFocus = typeof focus === 'string' ? focus : 'general';
      extractedEquipment = Array.isArray(request.selections.customization_equipment) 
        ? request.selections.customization_equipment 
        : [];
      extractedLocation = 'home' as const;
      extractedIntensity = 'moderate' as const;
      energyLevel = typeof request.selections.customization_energy === 'number' 
        ? request.selections.customization_energy 
        : 5;
      sorenessAreas = request.selections.customization_soreness 
        ? Object.keys(request.selections.customization_soreness) 
        : [];
    } else {
      // Structured format: use preferences or workoutFocusData
      extractedFocus = 
        request.preferences?.focus ||
        (typeof request.workoutFocusData?.customization_focus === 'string' 
          ? request.workoutFocusData.customization_focus 
          : request.workoutFocusData?.customization_focus?.focus) ||
        'general';
      extractedEquipment = 
        request.preferences?.equipment ||
        request.workoutFocusData?.customization_equipment ||
        [];
      extractedLocation = 
        request.preferences?.location ||
        'home' as const;
      extractedIntensity = 
        request.preferences?.intensity ||
        'moderate' as const;
      energyLevel = request.workoutFocusData?.customization_energy ?? 5;
      sorenessAreas = request.workoutFocusData?.customization_soreness ? 
        Object.keys(request.workoutFocusData.customization_soreness) : [];
    }
    const params = {
      duration: extractedDuration,
      fitnessLevel: this.mapFitnessLevel(request.userProfile.fitnessLevel),
      focus: extractedFocus,
      energyLevel,
      sorenessAreas,
      equipment: extractedEquipment,
      location: extractedLocation,
      intensity: extractedIntensity
    };
    return params;
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
      return true;
    }
    
    if (systemPreference === 'legacy') {
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
    
    return applicable;
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

  /**
   * Get the OpenAIService instance
   */
  getOpenAIService(): OpenAIService | undefined {
    return this.openAIService;
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

    // Use new validation system
    const validation = WorkoutRequestValidator.validate(request);
    if (!validation.isValid) {
      throw new Error(`OpenAIStrategy: Invalid workout request - ${validation.errors.join(', ')}`);
    }

    // Log validation success for debugging
    console.log('✅ Workout request validation passed:', {
      hasUserProfile: !!request.userProfile,
      fitnessLevel: request.userProfile?.fitnessLevel,
      hasPreferences: !!request.preferences,
      requestKeys: Object.keys(request)
    });
  }

  // Execute workout generation with OpenAI




  private async fallbackToRuleBased(
    _operation: string,
    context: GlobalAIContext
  ): Promise<PrioritizedRecommendation[]> {
    if (this.fallbackStrategy) {
      return await this.fallbackStrategy.generateRecommendations(context);
    }
    return [];
  }
}

// Export singleton instance
export const openAIStrategy = new OpenAIStrategy(); 