import { 
  InternalPromptContext, 
  InternalPromptConfig, 
  InternalRecommendation,
  PromptTemplate 
} from '../types/internal-prompt.types';
import { 
  EnergyAIService, 
  SorenessAIService, 
  FocusAIService, 
  DurationAIService, 
  EquipmentAIService, 
  CrossComponentAIService 
} from '../../domains';
import { GlobalAIContext } from '../../core/types/AIServiceTypes';
import { PromptSelector } from './PromptSelector';
import { aiLogger } from '../../logging/AILogger';

/**
 * Generator for personalized prompts using domain services
 */
export class DomainPromptGenerator {
  private energyService: EnergyAIService;
  private sorenessService: SorenessAIService;
  private focusService: FocusAIService;
  private durationService: DurationAIService;
  private equipmentService: EquipmentAIService;
  private crossComponentService: CrossComponentAIService;

  constructor() {
    this.energyService = new EnergyAIService();
    this.sorenessService = new SorenessAIService();
    this.focusService = new FocusAIService();
    this.durationService = new DurationAIService();
    this.equipmentService = new EquipmentAIService();
    this.crossComponentService = new CrossComponentAIService();
  }

  public async generatePrompt(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<string> {
    try {
      // Generate domain-specific recommendations
      const recommendations = await this.generateDomainRecommendations(context);

      // Select appropriate prompt template using static method
      const template = PromptSelector.selectPromptTemplate(context, recommendations, config);

      // Generate personalized prompt
      const personalizedPrompt = await this.generatePersonalizedPrompt(
        template,
        context,
        recommendations
      );

      aiLogger.debug('DomainPromptGenerator - Prompt generated', {
        templateType: template.useCase,
        recommendationCount: recommendations.length,
        promptLength: personalizedPrompt.length
      });

      return personalizedPrompt;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'prompt generation',
        component: 'DomainPromptGenerator',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Generate domain-specific recommendations
   */
  private async generateDomainRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const recommendations: InternalRecommendation[] = [];

    // Run domain service analysis in parallel
    const [
      energyRecs,
      sorenessRecs,
      focusRecs,
      durationRecs,
      equipmentRecs,
      crossRecs
    ] = await Promise.all([
      this.generateEnergyRecommendations(context),
      this.generateSorenessRecommendations(context),
      this.generateFocusRecommendations(context),
      this.generateDurationRecommendations(context),
      this.generateEquipmentRecommendations(context),
      this.generateCrossComponentRecommendations(context)
    ]);

    // Combine all recommendations
    recommendations.push(
      ...energyRecs,
      ...sorenessRecs,
      ...focusRecs,
      ...durationRecs,
      ...equipmentRecs,
      ...crossRecs
    );

    return recommendations;
  }

  /**
   * Generate personalized prompt from template
   */
  private async generatePersonalizedPrompt(
    template: PromptTemplate,
    context: InternalPromptContext,
    recommendations: InternalRecommendation[]
  ): Promise<string> {
    let prompt = template.template;

    // Replace template variables
    prompt = prompt.replace(/\{focus\}/g, context.workout.focus);
    prompt = prompt.replace(/\{duration\}/g, context.workout.duration.toString());
    prompt = prompt.replace(/\{energy\}/g, (context.workout.energyLevel || 3).toString());

    // Add equipment if available
    if (context.workout.equipment?.length) {
      prompt = prompt.replace(
        /\{equipment\}/g,
        context.workout.equipment.join(', ')
      );
    }

    // Add personalized sections
    prompt = await this.addPersonalizedSections(prompt, context, recommendations);

    return prompt;
  }

  /**
   * Add personalized sections to the prompt
   */
  private async addPersonalizedSections(
    prompt: string,
    context: InternalPromptContext,
    recommendations: InternalRecommendation[]
  ): Promise<string> {
    const sections: string[] = [];

    // Add user profile context
    if (context.profile.primaryGoal) {
      sections.push(`User Goal: ${context.profile.primaryGoal}`);
    }

    if (context.profile.injuries && context.profile.injuries.length > 0) {
      sections.push(`Injuries to Avoid: ${context.profile.injuries.join(', ')}`);
    }

    // Add high-priority recommendations
    const highPriorityRecs = recommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 3);

    if (highPriorityRecs.length > 0) {
      const recSection = highPriorityRecs
        .map(rec => `- ${rec.content}`)
        .join('\n');
      sections.push(`Key Recommendations:\n${recSection}`);
    }

    // Combine sections
    return `${prompt}\n\nPersonalized Context:\n${sections.join('\n')}`;
  }

  /**
   * Generate energy-based recommendations
   */
  private async generateEnergyRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Extract energy level from context
    const energyLevel = context.workout.energyLevel || 3; // Default to moderate
    
    const insights = await this.energyService.analyze(energyLevel, globalContext);

    return insights.map(insight => ({
      type: 'intensity',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'profile',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Generate soreness-based recommendations
   */
  private async generateSorenessRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    if (!context.workout.soreness) {
      return [];
    }

    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Extract soreness areas from context
    const sorenessAreas = context.workout.soreness.areas || [];

    const insights = await this.sorenessService.analyze(sorenessAreas, globalContext);

    return insights.map(insight => ({
      type: 'focus',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'workout',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Generate focus-based recommendations
   */
  private async generateFocusRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Extract focus from context
    const focus = context.workout.focus;

    const insights = await this.focusService.analyze(focus, globalContext);

    return insights.map(insight => ({
      type: 'focus',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'combined',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Generate duration-based recommendations
   */
  private async generateDurationRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Extract duration from context
    const duration = context.workout.duration;

    const insights = await this.durationService.analyze(duration, globalContext);

    return insights.map(insight => ({
      type: 'duration',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'workout',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Generate equipment-based recommendations
   */
  private async generateEquipmentRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Extract equipment from context
    const equipment = context.workout.equipment || [];

    const insights = await this.equipmentService.analyze(equipment, globalContext);

    return insights.map(insight => ({
      type: 'equipment',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'profile',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Generate cross-component recommendations
   */
  private async generateCrossComponentRecommendations(
    context: InternalPromptContext
  ): Promise<InternalRecommendation[]> {
    const globalContext: GlobalAIContext = this.createGlobalContext(context);
    
    // Create options object for cross-component analysis
    const options = {
      customization_focus: context.workout.focus,
      customization_duration: context.workout.duration,
      customization_energy: { rating: context.workout.energyLevel || 3, categories: [] },
      customization_equipment: context.workout.equipment || [],
      customization_soreness: context.workout.soreness ? {
        rating: context.workout.soreness.rating,
        categories: context.workout.soreness.areas || []
      } : undefined
    };

    const result = await this.crossComponentService.analyzeInteractions(options, globalContext);

    return result.recommendations.map(insight => ({
      type: 'general',
      content: insight.recommendation || insight.message,
      confidence: insight.confidence || 0.7,
      context: insight.metadata || {},
      source: 'combined',
      priority: this.mapConfidenceToPriority(insight.confidence)
    }));
  }

  /**
   * Create GlobalAIContext from InternalPromptContext
   */
  private createGlobalContext(context: InternalPromptContext): GlobalAIContext {
    return {
      userProfile: {
        fitnessLevel: context.profile.fitnessLevel,
        goals: [context.profile.primaryGoal], // Convert primaryGoal to goals array
        preferences: {
          workoutStyle: context.profile.preferredActivities || [],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: context.profile.injuries || [],
          availableEquipment: context.profile.availableEquipment || [],
          availableLocations: context.profile.availableLocations || []
        },
        enhancedLimitations: {
          timeConstraints: context.workout.duration,
          equipmentConstraints: context.workout.equipment || [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: context.workout.duration,
          preferredFocusAreas: [context.workout.focus],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.8,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      },
      currentSelections: {
        customization_focus: context.workout.focus,
        customization_duration: context.workout.duration,
        customization_energy: {
          rating: context.workout.energyLevel || 3,
          categories: []
        },
        customization_equipment: context.workout.equipment || [],
        customization_soreness: context.workout.soreness ? {
          rating: context.workout.soreness.rating,
          categories: context.workout.soreness.areas || []
        } : undefined
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: true
      }
    };
  }

  /**
   * Map confidence level to priority
   */
  private mapConfidenceToPriority(confidence?: number): 'high' | 'medium' | 'low' {
    if (!confidence) return 'medium';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }
}