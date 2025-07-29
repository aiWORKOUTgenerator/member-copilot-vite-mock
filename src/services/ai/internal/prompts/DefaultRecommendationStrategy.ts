import { 
  InternalPromptConfig, 
  InternalPromptContext,
  InternalRecommendation,
  RecommendationStrategy 
} from '../types/internal-prompt.types';
import { 
  EnergyAIService,
  SorenessAIService,
  FocusAIService,
  DurationAIService,
  EquipmentAIService,
  CrossComponentAIService 
} from '../../domains';
import { aiLogger } from '../../logging/AILogger';

/**
 * Default recommendation strategy that uses domain services
 */
export class DefaultRecommendationStrategy implements RecommendationStrategy {
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

  /**
   * Analyze context using domain services
   */
  public async analyze(
    context: InternalPromptContext, 
    config?: InternalPromptConfig
  ): Promise<InternalRecommendation[]> {
    try {
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
        this.analyzeEnergy(context),
        this.analyzeSoreness(context),
        this.analyzeFocus(context),
        this.analyzeDuration(context),
        this.analyzeEquipment(context),
        this.analyzeCrossComponent(context)
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

      // Filter by confidence threshold
      const threshold = config?.confidenceThreshold || 0.7;
      const filteredRecs = recommendations.filter(rec => rec.confidence >= threshold);

      aiLogger.debug('DefaultRecommendationStrategy - Analysis complete', {
        totalRecommendations: recommendations.length,
        filteredRecommendations: filteredRecs.length,
        confidenceThreshold: threshold
      });

      return filteredRecs;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'domain service analysis',
        component: 'DefaultRecommendationStrategy',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Validate recommendations
   */
  public validate(recommendations: InternalRecommendation[]): boolean {
    if (!recommendations.length) {
      return false;
    }

    // Validate each recommendation
    for (const rec of recommendations) {
      if (!this.validateRecommendation(rec)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Prioritize recommendations
   */
  public prioritize(recommendations: InternalRecommendation[]): InternalRecommendation[] {
    return recommendations.sort((a, b) => {
      // Sort by priority first
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  /**
   * Analyze energy level using EnergyAIService
   */
  private async analyzeEnergy(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    const { energy, intensity } = context.workout;
    const { fitnessLevel, activityLevel } = context.profile;

    const insights = await this.energyService.analyzeEnergyLevel({
      currentEnergy: energy.rating,
      fitnessLevel,
      activityLevel,
      targetIntensity: intensity
    });

    return insights.map(insight => ({
      type: 'intensity',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'profile',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Analyze soreness using SorenessAIService
   */
  private async analyzeSoreness(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    if (!context.workout.soreness) {
      return [];
    }

    const insights = await this.sorenessService.analyzeSoreness({
      sorenessLevel: context.workout.soreness.rating,
      affectedAreas: context.workout.soreness.areas || [],
      fitnessLevel: context.profile.fitnessLevel,
      targetFocus: context.workout.focus
    });

    return insights.map(insight => ({
      type: 'focus',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'workout',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Analyze workout focus using FocusAIService
   */
  private async analyzeFocus(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    const insights = await this.focusService.analyzeFocus({
      targetFocus: context.workout.focus,
      fitnessLevel: context.profile.fitnessLevel,
      experience: context.profile.experience,
      preferredActivities: context.profile.preferredActivities
    });

    return insights.map(insight => ({
      type: 'focus',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'combined',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Analyze duration using DurationAIService
   */
  private async analyzeDuration(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    const insights = await this.durationService.analyzeDuration({
      targetDuration: context.workout.duration.minutes,
      fitnessLevel: context.profile.fitnessLevel,
      energyLevel: context.workout.energy.rating,
      focus: context.workout.focus
    });

    return insights.map(insight => ({
      type: 'duration',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'workout',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Analyze equipment using EquipmentAIService
   */
  private async analyzeEquipment(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    const insights = await this.equipmentService.analyzeEquipment({
      availableEquipment: context.profile.equipment,
      targetFocus: context.workout.focus,
      fitnessLevel: context.profile.fitnessLevel,
      locations: context.profile.locations
    });

    return insights.map(insight => ({
      type: 'equipment',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'profile',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Analyze cross-component factors using CrossComponentAIService
   */
  private async analyzeCrossComponent(context: InternalPromptContext): Promise<InternalRecommendation[]> {
    const insights = await this.crossComponentService.analyzeCrossComponent({
      fitnessLevel: context.profile.fitnessLevel,
      focus: context.workout.focus,
      energy: context.workout.energy.rating,
      duration: context.workout.duration.minutes,
      equipment: context.workout.equipment,
      soreness: context.workout.soreness?.rating || 0
    });

    return insights.map(insight => ({
      type: 'general',
      content: insight.recommendation,
      confidence: insight.confidence,
      context: insight.context,
      source: 'combined',
      priority: insight.priority as 'high' | 'medium' | 'low'
    }));
  }

  /**
   * Validate a single recommendation
   */
  private validateRecommendation(rec: InternalRecommendation): boolean {
    // Validate required fields
    if (!rec.type || !rec.content || rec.confidence === undefined || !rec.source || !rec.priority) {
      return false;
    }

    // Validate confidence range
    if (rec.confidence < 0 || rec.confidence > 1) {
      return false;
    }

    // Validate type
    const validTypes = ['exercise', 'intensity', 'duration', 'equipment', 'focus', 'general'];
    if (!validTypes.includes(rec.type)) {
      return false;
    }

    // Validate source
    const validSources = ['profile', 'workout', 'combined'];
    if (!validSources.includes(rec.source)) {
      return false;
    }

    // Validate priority
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(rec.priority)) {
      return false;
    }

    return true;
  }
}