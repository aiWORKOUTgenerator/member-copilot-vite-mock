import { 
  InternalPromptContext,
  InternalPromptConfig,
  InternalRecommendation,
  WorkoutTemplate 
} from './types/internal-prompt.types';
import { InternalRecommendationStrategy } from './strategies/InternalRecommendationStrategy';
import { DomainPromptGenerator } from './prompts/DomainPromptGenerator';
import { InternalFallbackGenerator } from './prompts/InternalFallbackGenerator';
import { ValidationService } from './utils/ValidationService';
import { aiLogger } from '../logging/AILogger';

/**
 * Engine for orchestrating the recommendation flow
 */
export class RecommendationEngine {
  private recommendationStrategy: InternalRecommendationStrategy;
  private promptGenerator: DomainPromptGenerator;
  private fallbackGenerator: InternalFallbackGenerator;

  constructor() {
    this.recommendationStrategy = new InternalRecommendationStrategy();
    this.promptGenerator = new DomainPromptGenerator();
    this.fallbackGenerator = new InternalFallbackGenerator();
  }

  /**
   * Generate workout with recommendations
   */
  public async generateWorkout(
    context: InternalPromptContext,
    config?: InternalPromptConfig & {
      useExternalAI?: boolean;
      fallbackToInternal?: boolean;
    }
  ): Promise<{
    template: WorkoutTemplate;
    recommendations: InternalRecommendation[];
    prompt: string;
  }> {
    try {
      // Validate context
      const validation = ValidationService.validateContext(context, config);
      if (!validation.isValid) {
        throw new Error('Invalid context for workout generation');
      }

      // Generate recommendations
      const recommendations = await this.recommendationStrategy.generateRecommendations(
        context,
        config
      );

      // Validate recommendations
      const recValidation = ValidationService.validateRecommendations(recommendations);
      if (!recValidation.isValid) {
        throw new Error('Invalid recommendations generated');
      }

      // Generate prompt
      const prompt = await this.promptGenerator.generatePrompt(
        context,
        config
      );

      // Generate workout template
      let template: WorkoutTemplate;

      if (config?.useExternalAI) {
        try {
          // External AI generation would be called here
          throw new Error('External AI unavailable');
        } catch (error) {
          if (!config?.fallbackToInternal) {
            throw error;
          }
          aiLogger.warn('External AI failed, falling back to internal generation', {
            error: error instanceof Error ? error : new Error(String(error)),
            context: 'workout generation',
            component: 'RecommendationEngine'
          });
          template = await this.fallbackGenerator.generateWorkout(context, config);
        }
      } else {
        template = await this.fallbackGenerator.generateWorkout(context, config);
      }

      aiLogger.debug('RecommendationEngine - Workout generated', {
        templateType: template.type,
        exerciseCount: template.exercises.length,
        recommendationCount: recommendations.length,
        usedExternalAI: config?.useExternalAI,
        usedFallback: config?.fallbackToInternal
      });

      return {
        template,
        recommendations,
        prompt
      };

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout generation',
        component: 'RecommendationEngine',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Generate recommendations only
   */
  public async generateRecommendations(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<InternalRecommendation[]> {
    try {
      // Validate context
      const validation = ValidationService.validateContext(context, config);
      if (!validation.isValid) {
        throw new Error('Invalid context for recommendation generation');
      }

      // Generate recommendations
      const recommendations = await this.recommendationStrategy.generateRecommendations(
        context,
        config
      );

      // Validate recommendations
      const recValidation = ValidationService.validateRecommendations(recommendations);
      if (!recValidation.isValid) {
        throw new Error('Invalid recommendations generated');
      }

      aiLogger.debug('RecommendationEngine - Recommendations generated', {
        recommendationCount: recommendations.length,
        highPriorityCount: recommendations.filter(r => r.priority === 'high').length,
        averageConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
      });

      return recommendations;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'recommendation generation',
        component: 'RecommendationEngine',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Generate prompt only
   */
  public async generatePrompt(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<string> {
    try {
      // Validate context
      const validation = ValidationService.validateContext(context, config);
      if (!validation.isValid) {
        throw new Error('Invalid context for prompt generation');
      }

      // Generate recommendations
      const recommendations = await this.recommendationStrategy.generateRecommendations(
        context,
        config
      );

      // Generate prompt
      const prompt = await this.promptGenerator.generatePrompt(
        context,
        config
      );

      aiLogger.debug('RecommendationEngine - Prompt generated', {
        promptLength: prompt.length,
        recommendationCount: recommendations.length
      });

      return prompt;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'prompt generation',
        component: 'RecommendationEngine',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Analyze workout context
   */
  public async analyzeContext(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<{
    recommendations: InternalRecommendation[];
    analysis: {
      intensity: {
        suggested: string;
        confidence: number;
      };
      complexity: {
        level: string;
        confidence: number;
      };
      duration: {
        suggested: number;
        confidence: number;
      };
      focus: {
        areas: string[];
        confidence: number;
      };
    };
  }> {
    try {
      // Generate recommendations
      const recommendations = await this.recommendationStrategy.generateRecommendations(
        context,
        config
      );

      // Analyze intensity
      const intensityRecs = recommendations.filter(rec => 
        rec.type === 'intensity' && rec.confidence >= 0.7
      );
      const suggestedIntensity = this.analyzeSuggestedValue(intensityRecs);

      // Analyze complexity
      const exerciseRecs = recommendations.filter(rec => 
        rec.type === 'exercise' && rec.confidence >= 0.7
      );
      const complexity = this.analyzeComplexity(exerciseRecs, context);

      // Analyze duration
      const durationRecs = recommendations.filter(rec => 
        rec.type === 'duration' && rec.confidence >= 0.7
      );
      const suggestedDuration = this.analyzeSuggestedDuration(durationRecs, context);

      // Analyze focus areas
      const focusRecs = recommendations.filter(rec => 
        rec.type === 'focus' && rec.confidence >= 0.7
      );
      const focusAreas = this.analyzeFocusAreas(focusRecs, context);

      return {
        recommendations,
        analysis: {
          intensity: {
            suggested: suggestedIntensity.value || context.workout.intensity || 'moderate',
            confidence: suggestedIntensity.confidence
          },
          complexity: {
            level: complexity.level,
            confidence: complexity.confidence
          },
          duration: {
            suggested: suggestedDuration.value,
            confidence: suggestedDuration.confidence
          },
          focus: {
            areas: focusAreas.areas,
            confidence: focusAreas.confidence
          }
        }
      };

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'context analysis',
        component: 'RecommendationEngine',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Analyze suggested value from recommendations
   */
  private analyzeSuggestedValue(
    recommendations: InternalRecommendation[]
  ): {
    value: string | null;
    confidence: number;
  } {
    if (!recommendations.length) {
      return { value: null, confidence: 0 };
    }

    // Get highest confidence recommendation
    const bestRec = recommendations.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return {
      value: bestRec.content,
      confidence: bestRec.confidence
    };
  }

  /**
   * Analyze workout complexity
   */
  private analyzeComplexity(
    recommendations: InternalRecommendation[],
    context: InternalPromptContext
  ): {
    level: string;
    confidence: number;
  } {
    // Base complexity on experience level
    let baseLevel = context.profile.experienceLevel === 'Advanced Athlete' ? 'high' :
                   context.profile.experienceLevel === 'Some Experience' ? 'moderate' : 'low';
    let confidence = 0.7; // Base confidence

    if (recommendations.length > 0) {
      const complexityIndicators = {
        high: ['advanced', 'complex', 'challenging'],
        moderate: ['intermediate', 'moderate', 'standard'],
        low: ['basic', 'simple', 'beginner']
      };

      // Count complexity indicators
      const counts = { high: 0, moderate: 0, low: 0 };
      let totalConfidence = 0;

      recommendations.forEach(rec => {
        Object.entries(complexityIndicators).forEach(([level, indicators]) => {
          if (indicators.some(i => rec.content.toLowerCase().includes(i))) {
            counts[level as keyof typeof counts]++;
            totalConfidence += rec.confidence;
          }
        });
      });

      // Find dominant complexity
      const maxCount = Math.max(...Object.values(counts));
      const suggestedLevel = Object.entries(counts)
        .find(([_, count]) => count === maxCount)?.[0];

      if (suggestedLevel) {
        // Only increase complexity if experience supports it
        if (baseLevel === 'high' || 
           (baseLevel === 'moderate' && suggestedLevel !== 'high')) {
          baseLevel = suggestedLevel;
          confidence = totalConfidence / recommendations.length;
        }
      }
    }

    return {
      level: baseLevel,
      confidence: Math.min(1, confidence)
    };
  }

  /**
   * Analyze suggested duration
   */
  private analyzeSuggestedDuration(
    recommendations: InternalRecommendation[],
    context: InternalPromptContext
  ): {
    value: number;
    confidence: number;
  } {
    const currentDuration = context.workout.duration;
    let suggestedDuration = currentDuration;
    let confidence = 0.7; // Base confidence

    if (recommendations.length > 0) {
      // Extract duration values from recommendations
      const durationMatches = recommendations
        .map(rec => {
          const match = rec.content.match(/(\d+)\s*(?:minute|min)/);
          return match ? {
            value: parseInt(match[1]),
            confidence: rec.confidence
          } : null;
        })
        .filter((match): match is { value: number; confidence: number } => 
          match !== null
        );

      if (durationMatches.length > 0) {
        // Calculate weighted average
        const totalWeight = durationMatches.reduce((sum, m) => sum + m.confidence, 0);
        const weightedSum = durationMatches.reduce(
          (sum, m) => sum + (m.value * m.confidence),
          0
        );

        suggestedDuration = Math.round(weightedSum / totalWeight);
        confidence = totalWeight / durationMatches.length;
      }
    }

    return {
      value: suggestedDuration,
      confidence: Math.min(1, confidence)
    };
  }

  /**
   * Analyze focus areas
   */
  private analyzeFocusAreas(
    recommendations: InternalRecommendation[],
    context: InternalPromptContext
  ): {
    areas: string[];
    confidence: number;
  } {
    const areas = new Set<string>([context.workout.focus]);
    let totalConfidence = 0.7; // Base confidence

    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        // Extract focus areas from recommendation
        const content = rec.content.toLowerCase();
        const focusMatches = content.match(/focus\s+on\s+([\w\s,]+)(?:\.|$)/);
        
        if (focusMatches) {
          const focusAreas = focusMatches[1]
            .split(/,|\sand\s/)
            .map(area => area.trim())
            .filter(area => area.length > 0);

          focusAreas.forEach(area => areas.add(area));
          totalConfidence += rec.confidence;
        }
      });

      totalConfidence /= (recommendations.length + 1); // +1 for base confidence
    }

    return {
      areas: Array.from(areas),
      confidence: Math.min(1, totalConfidence)
    };
  }
}