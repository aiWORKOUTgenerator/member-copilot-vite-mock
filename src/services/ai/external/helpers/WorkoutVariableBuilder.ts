// Workout Variable Builder - Handles preparation of variables for OpenAI requests
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { PromptDataTransformer } from '../utils/PromptDataTransformer';

export class WorkoutVariableBuilder {
  /**
   * Build variables for workout generation requests
   * UPDATED: Now uses centralized PromptDataTransformer for consistency
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

    // Validate workoutFocusData exists
    if (!request.workoutFocusData) {
      throw new Error('WorkoutVariableBuilder: workoutFocusData is required but was not provided. Please ensure the workout focus data is complete before generating workouts.');
    }

    // 🔍 DEBUG: CRITICAL - Log exactly what we're receiving
    console.log('🔍 CRITICAL - WorkoutVariableBuilder received:');
    console.log('  request.profileData exists:', !!request.profileData);
    console.log('  request.profileData.experienceLevel:', request.profileData?.experienceLevel);
    console.log('  request.profileData.primaryGoal:', request.profileData?.primaryGoal);
    console.log('  experienceLevel type:', typeof request.profileData?.experienceLevel);
    console.log('  primaryGoal type:', typeof request.profileData?.primaryGoal);

    // 🔍 DEBUG: Check additionalContext before passing to PromptDataTransformer
    const additionalContext: Record<string, any> = {
      // Add any additional context from userProfile (filter out undefined values)
    };
    
    if (request.userProfile.fitnessLevel) {
      additionalContext.fitnessLevel = request.userProfile.fitnessLevel;
    }
    
    if (request.userProfile.goals && request.userProfile.goals.length > 0) {
      additionalContext.goals = request.userProfile.goals;
    }
    
    if (request.preferences?.intensity) {
      additionalContext.preferredIntensity = request.preferences.intensity;
    }
    
    console.log('🔍 WorkoutVariableBuilder - AdditionalContext being passed:');
    console.log('  hasPreferences:', !!request.preferences);
    console.log('  additionalContext keys:', Object.keys(additionalContext));
    console.log('  additionalContext.fitnessLevel:', additionalContext.fitnessLevel);

    // ✅ FIXED: Use centralized PromptDataTransformer instead of manual mapping
    // This ensures consistency with validation and eliminates "Not specified" issues
    const promptVariables = PromptDataTransformer.transformToPromptVariables(
      request.profileData,
      request.workoutFocusData,
      additionalContext
    );

    // 🔍 DEBUG: Log output data after transformation
    console.log('🔍 WorkoutVariableBuilder - Output from PromptDataTransformer:');
    console.log('  experienceLevel:', promptVariables.experienceLevel);
    console.log('  primaryGoal:', promptVariables.primaryGoal);
    console.log('  fitnessLevel:', promptVariables.fitnessLevel);
    console.log('  energyLevel:', promptVariables.energyLevel);
    console.log('  focus:', promptVariables.focus);
    console.log('  duration:', promptVariables.duration);
    console.log('  totalKeys:', Object.keys(promptVariables).length);

    // 🔍 DEBUG: Verify critical fields are present
    const criticalFields = ['experienceLevel', 'fitnessLevel', 'primaryGoal', 'energyLevel', 'focus', 'duration', 'sorenessAreas', 'equipment'];
    const presentFields = criticalFields.filter(field => promptVariables[field]).length;
    console.log(`🔍 WorkoutVariableBuilder: ${presentFields}/${criticalFields.length} critical fields present`);
    
    const validation = PromptDataTransformer.validatePromptVariables(promptVariables);
    console.log(`🔍 WorkoutVariableBuilder: ${validation.populatedFields}/${validation.totalFields} fields populated`);
    
    if (validation.missingRequired.length > 0) {
      console.warn('⚠️ Missing required fields:', validation.missingRequired);
    }

    return promptVariables;
  }

  /**
   * Build variables for recommendation generation
   * Temporary implementation to avoid import issues
   */
  static buildRecommendationVariables(context: any) {
    return {
      fitnessLevel: context.userProfile?.fitnessLevel || 'intermediate',
      goals: context.userProfile?.goals ?? [],
      energyLevel: context.currentSelections?.customization_energy ?? 5,
      sorenessAreas: context.currentSelections?.customization_soreness ?? [],
      availableTime: context.currentSelections?.customization_duration ?? 30,
      equipment: context.currentSelections?.customization_equipment ?? [],
      location: context.environmentalFactors?.location ?? 'home',
      workoutFocus: context.currentSelections?.customization_focus ?? 'general',
      duration: context.currentSelections?.customization_duration ?? 30,
      selectedEquipment: context.currentSelections?.customization_equipment ?? []
    };
  }

  /**
   * Build variables for insight enhancement  
   * Temporary implementation to avoid import issues
   */
  static buildInsightEnhancementVariables(context: any, insights: Record<string, unknown>[]) {
    return {
      insights: JSON.stringify(insights),
      fitnessLevel: context.userProfile?.fitnessLevel || 'intermediate',
      goals: context.userProfile?.goals?.join(', ') ?? '',
      energyLevel: context.currentSelections?.customization_energy ?? 5
    };
  }
} 