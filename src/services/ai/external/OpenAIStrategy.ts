// OpenAI Strategy - Implements AIStrategy interface for OpenAI integration
import { 
  AIStrategy, 
  WorkoutGenerationRequest, 
  GeneratedWorkout, 
  EnhancedRecommendation, 
  UserPreferenceAnalysis,
  ExternalAIError 
} from './types/external-ai.types';
import { AIInsight, PrioritizedRecommendation, GlobalAIContext } from '../core/AIService';
import { OpenAIService } from './OpenAIService';
import { 
  workoutGenerationPrompts, 
  selectWorkoutPrompt 
} from './prompts/workout-generation.prompts';
import { 
  recommendationPrompts, 
  selectRecommendationPrompt 
} from './prompts/recommendation.prompts';
import { openAIConfig, isFeatureEnabled } from './config/openai.config';
import { logger } from '../../../utils/logger';

export class OpenAIStrategy implements AIStrategy {
  private openAIService: OpenAIService;
  private fallbackStrategy?: AIStrategy;

  constructor(
    openAIService?: OpenAIService,
    fallbackStrategy?: AIStrategy
  ) {
    this.openAIService = openAIService || new OpenAIService();
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

      // Prepare prompt variables
      const variables = {
        fitnessLevel: context.userProfile.fitnessLevel,
        goals: context.userProfile.goals || [],
        energyLevel: context.currentSelections.customization_energy || 5,
        sorenessAreas: context.currentSelections.customization_soreness || [],
        availableTime: context.currentSelections.customization_duration || 30,
        equipment: context.currentSelections.customization_equipment || [],
        location: context.environmentalFactors?.location || 'home',
        workoutFocus: context.currentSelections.customization_focus || 'general',
        duration: context.currentSelections.customization_duration || 30,
        selectedEquipment: context.currentSelections.customization_equipment || [],
        detectedIssues: this.analyzeCurrentIssues(context),
        optimizationOpportunities: this.findOptimizationOpportunities(context)
      };

      // Generate recommendations using OpenAI
      const recommendations = await this.openAIService.generateFromTemplate(
        prompt,
        variables,
        {
          cacheKey: `recommendations_${context.userProfile.fitnessLevel}_${Date.now()}`,
          timeout: 15000
        }
      );

      // Validate and convert to PrioritizedRecommendation format
      return this.convertToStandardRecommendations(recommendations, context);

    } catch (error) {
      logger.error('OpenAI recommendations failed:', error);
      return this.handleRecommendationError(error, context);
    }
  }

  // Generate AI-powered workout
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      if (!isFeatureEnabled('openai_workout_generation')) {
        throw new Error('OpenAI workout generation is disabled');
      }

      // Select appropriate workout prompt
      const prompt = selectWorkoutPrompt(
        request.userProfile.fitnessLevel,
        request.preferences.duration,
        request.constraints?.sorenessAreas || [],
        request.preferences.focus
      );

      // Prepare comprehensive variables
      const variables = {
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

      // Generate workout using OpenAI
      const workout = await this.openAIService.generateFromTemplate(
        prompt,
        variables,
        {
          cacheKey: `workout_${request.userProfile.fitnessLevel}_${JSON.stringify(variables)}`,
          timeout: 30000
        }
      );

      // Validate and enhance workout
      return this.validateAndEnhanceWorkout(workout, request);

    } catch (error) {
      logger.error('OpenAI workout generation failed:', error);
      throw this.createWorkoutError(error, request);
    }
  }

  // Enhance existing insights with AI
  async enhanceInsights(insights: AIInsight[], context: GlobalAIContext): Promise<AIInsight[]> {
    try {
      if (!isFeatureEnabled('openai_enhanced_recommendations') || insights.length === 0) {
        return insights;
      }

      // Create enhancement prompt
      const enhancementPrompt = `
        You are an expert fitness coach. Enhance these existing fitness insights with personalized explanations and scientific context.
        
        Current insights: ${JSON.stringify(insights)}
        
        User context:
        - Fitness level: ${context.userProfile.fitnessLevel}
        - Goals: ${context.userProfile.goals?.join(', ')}
        - Energy level: ${context.currentSelections.customization_energy || 5}/10
        
        For each insight, provide:
        1. Enhanced explanation with scientific backing
        2. Personalized context for this specific user
        3. Actionable next steps
        
        Return the enhanced insights in the same format with additional detail.
      `;

      const enhanced = await this.openAIService.makeRequest([
        { role: 'system', content: enhancementPrompt }
      ], {
        maxTokens: 1000,
        temperature: 0.7,
        cacheKey: `enhanced_insights_${context.userProfile.fitnessLevel}_${JSON.stringify(insights)}`
      });

      const enhancedContent = enhanced.choices[0]?.message?.content;
      if (enhancedContent) {
        try {
          const parsedInsights = JSON.parse(enhancedContent);
          return Array.isArray(parsedInsights) ? parsedInsights : insights;
        } catch {
          return insights;
        }
      }

      return insights;

    } catch (error) {
      logger.error('Insight enhancement failed:', error);
      return insights; // Return original insights on failure
    }
  }

  // Analyze user preferences using AI
  async analyzeUserPreferences(context: GlobalAIContext): Promise<UserPreferenceAnalysis> {
    try {
      if (!isFeatureEnabled('openai_user_analysis')) {
        return this.createBasicUserAnalysis(context);
      }

      const analysisPrompt = `
        Analyze this user's fitness preferences and patterns to provide personalized insights:
        
        User Profile:
        - Fitness Level: ${context.userProfile.fitnessLevel}
        - Goals: ${context.userProfile.goals?.join(', ')}
        - Preferences: ${JSON.stringify(context.userProfile.preferences)}
        
        Session History:
        ${context.sessionHistory.map(s => `${s.component}: ${s.action}`).join('\n')}
        
        Current Selections:
        ${JSON.stringify(context.currentSelections)}
        
        Provide a comprehensive analysis including:
        1. Preferred workout styles
        2. Optimal workout times
        3. Motivation factors
        4. Challenge areas
        5. Strength areas
        6. Recommended progression plan
        7. Personality insights
        
        Return as a UserPreferenceAnalysis JSON object.
      `;

      const analysis = await this.openAIService.makeRequest([
        { role: 'system', content: analysisPrompt }
      ], {
        maxTokens: 1500,
        temperature: 0.8,
        cacheKey: `user_analysis_${context.userProfile.fitnessLevel}_${JSON.stringify(context.sessionHistory)}`
      });

      const analysisContent = analysis.choices[0]?.message?.content;
      if (analysisContent) {
        try {
          return JSON.parse(analysisContent) as UserPreferenceAnalysis;
        } catch {
          return this.createBasicUserAnalysis(context);
        }
      }

      return this.createBasicUserAnalysis(context);

    } catch (error) {
      logger.error('User preference analysis failed:', error);
      return this.createBasicUserAnalysis(context);
    }
  }

  // Private helper methods
  private analyzeCurrentIssues(context: GlobalAIContext): string {
    const issues: string[] = [];
    
    const energyLevel = context.currentSelections.customization_energy || 5;
    const duration = context.currentSelections.customization_duration || 30;
    const focus = context.currentSelections.customization_focus || '';

    if (energyLevel <= 3 && duration > 30) {
      issues.push('Low energy level with long workout duration');
    }

    if (energyLevel <= 3 && (focus === 'Quick Sweat' || focus === 'Core & Abs Focus')) {
      issues.push('Low energy level with high-intensity focus');
    }

    const sorenessAreas = context.currentSelections.customization_soreness || [];
    if (sorenessAreas.length > 0 && focus === 'Quick Sweat') {
      issues.push('High soreness with high-intensity workout');
    }

    return issues.join('; ') || 'No significant issues detected';
  }

  private findOptimizationOpportunities(context: GlobalAIContext): string {
    const opportunities: string[] = [];
    
    const energyLevel = context.currentSelections.customization_energy || 5;
    const equipment = context.currentSelections.customization_equipment || [];
    
    if (energyLevel >= 7 && equipment.length > 2) {
      opportunities.push('High energy with diverse equipment - opportunity for complex circuits');
    }

    if (context.userProfile.goals?.includes('weight_loss') && energyLevel >= 6) {
      opportunities.push('Good energy level for effective weight loss workout');
    }

    if (context.userProfile.fitnessLevel === 'new to exercise' && energyLevel >= 5) {
      opportunities.push('Good energy for skill-building and technique focus');
    }

    return opportunities.join('; ') || 'Consider matching intensity to energy level';
  }

  private convertToStandardRecommendations(
    aiRecommendations: EnhancedRecommendation[],
    context: GlobalAIContext
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
      reasoning: rec.personalizedReasoning || rec.reasoning,
      confidence: rec.confidence,
      action: rec.action
    }));
  }

  private async handleRecommendationError(
    error: any,
    context: GlobalAIContext
  ): Promise<PrioritizedRecommendation[]> {
    // Log error details
    logger.error('OpenAI recommendation error:', error);

    // Try fallback strategy if available
    if (this.fallbackStrategy) {
      try {
        return await this.fallbackStrategy.generateRecommendations(context);
      } catch (fallbackError) {
        logger.error('Fallback strategy also failed:', fallbackError);
      }
    }

    // Return basic safety recommendations
    return this.generateEmergencyRecommendations(context);
  }

  private generateEmergencyRecommendations(context: GlobalAIContext): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    const energyLevel = context.currentSelections.customization_energy || 5;
    const duration = context.currentSelections.customization_duration || 30;
    
    if (energyLevel <= 3 && duration > 30) {
      recommendations.push({
        id: 'emergency_energy_warning',
        priority: 'high',
        category: 'safety',
        targetComponent: 'duration',
        title: 'Consider shorter workout with low energy',
        description: 'Low energy levels may lead to poor performance and increased injury risk',
        reasoning: 'AI service unavailable - basic safety recommendation',
        confidence: 0.8
      });
    }

    return recommendations;
  }

  private validateAndEnhanceWorkout(
    workout: GeneratedWorkout,
    request: WorkoutGenerationRequest
  ): GeneratedWorkout {
    // Ensure workout has required structure
    if (!workout.warmup || !workout.mainWorkout || !workout.cooldown) {
      throw new Error('Invalid workout structure from AI');
    }

    // Validate duration matches request
    if (Math.abs(workout.totalDuration - request.preferences.duration) > 5) {
      workout.totalDuration = request.preferences.duration;
    }

    // Add AI-specific metadata
    workout.aiModel = openAIConfig.openai.model;
    workout.generatedAt = new Date();
    workout.confidence = Math.max(0.7, workout.confidence || 0.8);

    // Ensure safety reminders are present
    if (!workout.safetyReminders || workout.safetyReminders.length === 0) {
      workout.safetyReminders = [
        'Stop immediately if you feel pain',
        'Maintain proper form throughout',
        'Stay hydrated during your workout',
        'Listen to your body and rest when needed'
      ];
    }

    return workout;
  }

  private createWorkoutError(error: any, request: WorkoutGenerationRequest): Error {
    const userFriendlyMessage = this.getUserFriendlyErrorMessage(error);
    
    return new Error(`Workout generation failed: ${userFriendlyMessage}`);
  }

  private getUserFriendlyErrorMessage(error: any): string {
    if (error.type === 'rate_limit') {
      return 'AI service is temporarily busy. Please try again in a moment.';
    }
    
    if (error.type === 'authentication') {
      return 'AI service configuration issue. Please contact support.';
    }
    
    if (error.type === 'network') {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    return 'AI service temporarily unavailable. Please try again later.';
  }

  private createBasicUserAnalysis(context: GlobalAIContext): UserPreferenceAnalysis {
    return {
      preferredWorkoutStyles: [context.userProfile.fitnessLevel],
      optimalWorkoutTimes: ['morning'],
      motivationFactors: ['goal_achievement'],
      challengeAreas: ['consistency'],
      strengthAreas: ['enthusiasm'],
      recommendedProgression: {
        currentLevel: context.userProfile.fitnessLevel,
        nextMilestones: [{
          title: 'Consistency Building',
          description: 'Complete 3 workouts per week',
          estimatedWeeks: 4,
          successMetrics: ['workout_frequency', 'completion_rate']
        }],
        timeframe: '4-6 weeks',
        keyFocusAreas: ['habit_building'],
        potentialChallenges: ['time_management']
      },
      personalityInsights: {
        workoutStyle: 'structured',
        motivationType: 'intrinsic',
        preferredChallengeLevel: 'gradual',
        socialPreference: 'solo',
        feedbackStyle: 'encouraging'
      }
    };
  }

  private async fallbackToRuleBased(
    operation: string,
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