// Workout Variable Builder - Handles preparation of variables for OpenAI requests
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { GlobalAIContext } from '../../core/AIService';

export class WorkoutVariableBuilder {
  /**
   * Build variables for workout generation requests
   */
  static buildWorkoutVariables(request: WorkoutGenerationRequest) {
    // Validate required data
    if (!request.userProfile) {
      throw new Error('WorkoutVariableBuilder: userProfile is required but was not provided. Please ensure the user profile is complete before generating workouts.');
    }
    
    if (!request.userProfile.fitnessLevel) {
      throw new Error(`WorkoutVariableBuilder: userProfile.fitnessLevel is required but was not provided. Current userProfile: ${JSON.stringify(request.userProfile, null, 2)}`);
    }

    // Validate profileData exists
    if (!request.profileData) {
      throw new Error('WorkoutVariableBuilder: profileData is required but was not provided. Please ensure the profile data is complete before generating workouts.');
    }

    // Use default preferences if not provided
    const preferences = request.preferences ?? {
      duration: 30,
      focus: 'general',
      intensity: 'moderate' as const,
      equipment: [],
      location: 'home' as const
    };

    return {
      // Profile Data Variables (from request.profileData)
      experienceLevel: request.profileData.experienceLevel || 'Not specified',
      physicalActivity: request.profileData.physicalActivity || 'Not specified',
      preferredDuration: request.profileData.preferredDuration || 'Not specified',
      timeCommitment: request.profileData.timeCommitment ? `${request.profileData.timeCommitment} days per week` : 'Not specified',
      intensityLevel: request.profileData.intensityLevel || 'Not specified',
      preferredActivities: request.profileData.preferredActivities || [],
      availableEquipment: request.profileData.availableEquipment || [],
      primaryGoal: request.profileData.primaryGoal || 'Not specified',
      goalTimeline: request.profileData.goalTimeline || 'Not specified',
      age: request.profileData.age ? `${request.profileData.age} years` : 'Not specified',
      height: request.profileData.height || 'Not specified',
      weight: request.profileData.weight ? `${request.profileData.weight} lbs` : 'Not specified',
      gender: request.profileData.gender || 'Not specified',
      hasCardiovascularConditions: request.profileData.hasCardiovascularConditions || 'Not specified',
      injuries: request.profileData.injuries || [],

      // User Profile Variables (from request.userProfile)
      fitnessLevel: request.userProfile.fitnessLevel,
      goals: request.userProfile.goals ?? [],
      preferredIntensity: preferences.intensity,

      // Current State Variables (from request.constraints and preferences)
      energyLevel: request.constraints?.energyLevel ?? 5,
      sorenessAreas: request.constraints?.sorenessAreas ?? [],
      duration: preferences.duration,
      focus: preferences.focus,

      // Preferences & Constraints Variables
      equipment: preferences.equipment,
      location: preferences.location,
      timeOfDay: request.constraints?.timeOfDay ?? 'morning',
      noiseLevel: request.constraints?.noiselevel ?? 'moderate',
      spaceLimitations: request.constraints?.spaceLimitations ?? [],

      // Environmental Variables
      weather: request.environmentalFactors?.weather ?? 'indoor',
      temperature: request.environmentalFactors?.temperature ?? 'comfortable',

      // Special Considerations
      previousWorkout: 'None provided',
      dietaryRestrictions: 'None specified'
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