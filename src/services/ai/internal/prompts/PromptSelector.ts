import { 
  InternalPromptContext,
  InternalPromptConfig,
  InternalRecommendation,
  PromptTemplate 
} from '../types/internal-prompt.types';
import { ValidationService } from '../utils/ValidationService';
import { aiLogger } from '../../logging/AILogger';

/**
 * Enhanced prompt selector with profile context integration
 */
export class PromptSelector {
  private static readonly DEFAULT_TEMPLATES: Record<string, PromptTemplate> = {
    beginner: {
      template: `Create a {focus} workout for a beginner with {duration} minutes available.
Focus on proper form and basic movements.
Energy level is {energy}/10.
{recommendations}`,
      useCase: 'beginner_workout',
      confidence: 0.9
    },
    intermediate: {
      template: `Design a {focus} workout for an intermediate athlete.
Duration: {duration} minutes
Current energy: {energy}/10
Include progressive overload and form cues.
{recommendations}`,
      useCase: 'intermediate_workout',
      confidence: 0.85
    },
    advanced: {
      template: `Create an advanced {focus} workout for {duration} minutes.
Current energy level: {energy}/10
Incorporate complex movements and intensity variations.
{recommendations}`,
      useCase: 'advanced_workout',
      confidence: 0.8
    },
    recovery: {
      template: `Design a recovery-focused {focus} workout.
Duration: {duration} minutes
Energy level: {energy}/10
Focus on mobility and active recovery.
{recommendations}`,
      useCase: 'recovery_workout',
      confidence: 0.95
    },
    equipment_focused: {
      template: `Create a {focus} workout using: {equipment}.
Duration: {duration} minutes
Energy level: {energy}/10
Maximize equipment usage for variety.
{recommendations}`,
      useCase: 'equipment_workout',
      confidence: 0.85
    }
  };

  /**
   * Select the best prompt template based on context
   */
  public static selectPromptTemplate(
    context: InternalPromptContext,
    recommendations: InternalRecommendation[],
    config?: InternalPromptConfig
  ): PromptTemplate {
    try {
      // Validate inputs
      const validation = ValidationService.validateContext(context, config);
      if (!validation.isValid) {
        throw new Error('Invalid context for prompt selection');
      }

      const recValidation = ValidationService.validateRecommendations(recommendations);
      if (!recValidation.isValid) {
        throw new Error('Invalid recommendations for prompt selection');
      }

      // Determine template selection factors
      const factors = this.determineTemplateFactors(context, recommendations);

      // Select base template
      let selectedTemplate = this.selectBaseTemplate(factors);

      // Enhance template with recommendations
      selectedTemplate = this.enhanceTemplateWithRecommendations(
        selectedTemplate,
        recommendations,
        factors
      );

      aiLogger.debug('PromptSelector - Template selected', {
        templateUseCase: selectedTemplate.useCase,
        confidence: selectedTemplate.confidence,
        factors
      });

      return selectedTemplate;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'prompt selection',
        component: 'PromptSelector',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Determine factors for template selection
   */
  private static determineTemplateFactors(
    context: InternalPromptContext,
    recommendations: InternalRecommendation[]
  ): {
    experienceLevel: string;
    focusType: string;
    intensityLevel: string;
    recoveryNeeded: boolean;
    equipmentFocused: boolean;
    complexityLevel: string;
  } {
    // Get high-priority recommendations
    const highPriorityRecs = recommendations.filter(rec => 
      rec.priority === 'high' && rec.confidence >= 0.8
    );

    // Check for recovery recommendations
    const recoveryNeeded = highPriorityRecs.some(rec =>
      rec.type === 'focus' && 
      rec.content.toLowerCase().includes('recovery')
    );

    // Check for equipment focus
    const equipmentRecs = recommendations.filter(rec => rec.type === 'equipment');
    const equipmentFocused = equipmentRecs.length >= 2 && 
      equipmentRecs.every(rec => rec.confidence >= 0.7);

    // Determine complexity level
    const complexityLevel = this.determineComplexityLevel(context, recommendations);

    return {
      experienceLevel: context.profile.experienceLevel,
      focusType: context.workout.focus,
      intensityLevel: context.workout.intensity || 'moderate',
      recoveryNeeded,
      equipmentFocused,
      complexityLevel
    };
  }

  /**
   * Select base template based on factors
   */
  private static selectBaseTemplate(factors: {
    experienceLevel: string;
    focusType: string;
    intensityLevel: string;
    recoveryNeeded: boolean;
    equipmentFocused: boolean;
    complexityLevel: string;
  }): PromptTemplate {
    // Check for recovery needs first
    if (factors.recoveryNeeded) {
      return this.DEFAULT_TEMPLATES.recovery;
    }

    // Check for equipment focus
    if (factors.equipmentFocused) {
      return this.DEFAULT_TEMPLATES.equipment_focused;
    }

    // Select based on experience level
    switch (factors.experienceLevel.toLowerCase()) {
      case 'beginner':
      case 'new to exercise':
        return this.DEFAULT_TEMPLATES.beginner;
      
      case 'intermediate':
      case 'some experience':
        return this.DEFAULT_TEMPLATES.intermediate;
      
      case 'advanced':
      case 'advanced athlete':
        return this.DEFAULT_TEMPLATES.advanced;
      
      default:
        return this.DEFAULT_TEMPLATES.intermediate;
    }
  }

  /**
   * Enhance template with recommendations
   */
  private static enhanceTemplateWithRecommendations(
    template: PromptTemplate,
    recommendations: InternalRecommendation[],
    factors: {
      experienceLevel: string;
      focusType: string;
      intensityLevel: string;
      recoveryNeeded: boolean;
      equipmentFocused: boolean;
      complexityLevel: string;
    }
  ): PromptTemplate {
    // Sort recommendations by priority and confidence
    const sortedRecs = recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      return priorityDiff !== 0 ? priorityDiff : (b.confidence - a.confidence);
    });

    // Build recommendation string
    const recString = sortedRecs
      .filter(rec => rec.confidence >= 0.7)
      .map(rec => `- ${rec.content}`)
      .join('\n');

    // Enhance template with recommendations
    const enhancedTemplate = {
      ...template,
      template: template.template.replace(
        '{recommendations}',
        `Additional considerations:\n${recString}`
      )
    };

    // Adjust confidence based on recommendation quality
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / 
      recommendations.length;
    
    enhancedTemplate.confidence = (template.confidence + avgConfidence) / 2;

    return enhancedTemplate;
  }

  /**
   * Determine workout complexity level
   */
  private static determineComplexityLevel(
    context: InternalPromptContext,
    recommendations: InternalRecommendation[]
  ): string {
    // Base complexity on experience level
    let baseComplexity = context.profile.experienceLevel === 'Advanced Athlete' ? 'high' :
                        context.profile.experienceLevel === 'Some Experience' ? 'moderate' : 'low';

    // Adjust based on recommendations
    const complexityRecs = recommendations.filter(rec => 
      rec.type === 'exercise' && rec.confidence >= 0.8
    );

    if (complexityRecs.length > 0) {
      const complexityIndicators = {
        high: ['advanced', 'complex', 'challenging'],
        moderate: ['intermediate', 'moderate', 'standard'],
        low: ['basic', 'simple', 'beginner']
      };

      // Count complexity indicators in recommendations
      const counts = { high: 0, moderate: 0, low: 0 };
      complexityRecs.forEach(rec => {
        Object.entries(complexityIndicators).forEach(([level, indicators]) => {
          if (indicators.some(i => rec.content.toLowerCase().includes(i))) {
            counts[level as keyof typeof counts]++;
          }
        });
      });

      // Adjust complexity based on recommendation analysis
      const maxCount = Math.max(...Object.values(counts));
      const suggestedComplexity = Object.entries(counts)
        .find(([_, count]) => count === maxCount)?.[0] || baseComplexity;

      // Only increase complexity if experience level supports it
      if (baseComplexity === 'high' || 
         (baseComplexity === 'moderate' && suggestedComplexity !== 'high')) {
        baseComplexity = suggestedComplexity;
      }
    }

    return baseComplexity;
  }
}