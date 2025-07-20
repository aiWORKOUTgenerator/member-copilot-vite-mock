// Workout Variable Builder - Handles preparation of variables for OpenAI requests
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { GlobalAIContext } from '../../core/AIService';

export class WorkoutVariableBuilder {
  /**
   * Build variables for workout generation requests
   */
  static buildWorkoutVariables(request: WorkoutGenerationRequest) {
    // Use default preferences if not provided
    const preferences = request.preferences ?? {
      duration: 30,
      focus: 'general',
      intensity: 'moderate' as const,
      equipment: [],
      location: 'home' as const
    };

    return {
      // User profile
      fitnessLevel: request.userProfile.fitnessLevel,
      goals: request.userProfile.goals ?? [],
      preferredIntensity: preferences.intensity,

      // Current state
      energyLevel: request.constraints?.energyLevel ?? 5,
      sorenessAreas: request.constraints?.sorenessAreas ?? [],
      duration: preferences.duration,
      focus: preferences.focus,

      // Preferences & constraints
      equipment: preferences.equipment,
      location: preferences.location,
      timeOfDay: request.constraints?.timeOfDay ?? 'morning',
      noiseLevel: request.constraints?.noiselevel ?? 'moderate',
      spaceLimitations: request.constraints?.spaceLimitations ?? [],

      // Environmental factors
      weather: request.environmentalFactors?.weather ?? 'indoor',
      temperature: request.environmentalFactors?.temperature ?? 'comfortable',

      // Special considerations
      injuries: request.constraints?.injuries ?? [],
      previousWorkout: 'None provided'
    };
  }

  /**
   * Build variables for recommendation generation
   */
  static buildRecommendationVariables(context: GlobalAIContext) {
    return {
      fitnessLevel: context.userProfile.fitnessLevel,
      goals: context.userProfile.goals ?? [],
      energyLevel: context.currentSelections.customization_energy ?? 5,
      sorenessAreas: context.currentSelections.customization_soreness ?? [],
      availableTime: context.currentSelections.customization_duration ?? 30,
      equipment: context.currentSelections.customization_equipment ?? [],
      location: context.environmentalFactors?.location ?? 'home',
      workoutFocus: context.currentSelections.customization_focus ?? 'general',
      duration: context.currentSelections.customization_duration ?? 30,
      selectedEquipment: context.currentSelections.customization_equipment ?? []
    };
  }

  /**
   * Build variables for insight enhancement
   */
  static buildInsightEnhancementVariables(context: GlobalAIContext, insights: Record<string, unknown>[]) {
    return {
      insights: JSON.stringify(insights),
      fitnessLevel: context.userProfile.fitnessLevel,
      goals: context.userProfile.goals?.join(', ') ?? '',
      energyLevel: context.currentSelections.customization_energy ?? 5
    };
  }
} 