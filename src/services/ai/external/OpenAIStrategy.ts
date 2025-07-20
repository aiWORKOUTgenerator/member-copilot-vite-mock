// OpenAI Strategy - Implements AIStrategy interface for OpenAI integration
import { 
  AIStrategy, 
  GeneratedWorkout, 
  EnhancedRecommendation, 
  UserPreferenceAnalysis
} from './types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../types/workout-generation.types';
import { PrioritizedRecommendation, GlobalAIContext } from '../core/AIService';
import { AIInsight } from '../../../types/insights';
import { OpenAIService } from './OpenAIService';
import { 
  selectWorkoutPrompt 
} from './prompts/workout-generation.prompts';
import { 
  selectRecommendationPrompt 
} from './prompts/recommendation.prompts';
import { isFeatureEnabled } from './config/openai.config';
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


export class OpenAIStrategy implements AIStrategy {
  private openAIService: OpenAIService;
  private fallbackStrategy?: AIStrategy;

  constructor(
    openAIService?: OpenAIService,
    fallbackStrategy?: AIStrategy
  ) {
    this.openAIService = openAIService ?? new OpenAIService();
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

  // Generate AI-powered workout
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Validate request and configuration
      this.validateWorkoutRequest(request);
      
      // Prepare variables using helper
      const variables = WorkoutVariableBuilder.buildWorkoutVariables(request);
      
      // Execute workout generation
      const workout = await this.executeWorkoutGeneration(request, variables);
      
      // Enhance and validate the generated workout
      return this.enhanceGeneratedWorkout(workout, request);

    } catch (error) {
      logger.error('OpenAI workout generation failed:', error);
      throw ErrorHandler.createWorkoutError(error, request);
    }
  }

  // Enhance existing insights with AI
  async enhanceInsights(insights: AIInsight[], context: GlobalAIContext): Promise<AIInsight[]> {
    try {
      if (!isFeatureEnabled('openai_enhanced_recommendations') || insights.length === 0) {
        return insights;
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

  // Private helper methods
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
    
    if (!request.userProfile) {
      throw new Error(OPENAI_STRATEGY_CONSTANTS.ERROR_MESSAGES.MISSING_USER_PROFILE);
    }
    
    if (!request.preferences) {
      throw new Error(OPENAI_STRATEGY_CONSTANTS.ERROR_MESSAGES.MISSING_PREFERENCES);
    }
  }

  // Execute workout generation with OpenAI
  private async executeWorkoutGeneration(
    request: WorkoutGenerationRequest, 
    variables: Record<string, string | number | string[] | boolean>
  ): Promise<GeneratedWorkout> {
    // Ensure request has preferences, use defaults if missing
    const preferences = request.preferences ?? {
      duration: 30,
      focus: 'general',
      intensity: 'moderate' as const,
      equipment: [],
      location: 'home' as const
    };

    // Select appropriate workout prompt
    const prompt = selectWorkoutPrompt(
      request.userProfile.fitnessLevel,
      preferences.duration,
      request.constraints?.sorenessAreas ?? [],
      preferences.focus
    );

    // Generate workout using OpenAI
    const result = await this.openAIService.generateFromTemplate(
      prompt,
      variables,
      {
        cacheKey: `workout_${request.userProfile.fitnessLevel}_${JSON.stringify(variables)}`,
        timeout: OPENAI_STRATEGY_CONSTANTS.WORKOUT_GENERATION_TIMEOUT
      }
    );
    
    return result as GeneratedWorkout;
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
}

// Export singleton instance
export const openAIStrategy = new OpenAIStrategy(); 