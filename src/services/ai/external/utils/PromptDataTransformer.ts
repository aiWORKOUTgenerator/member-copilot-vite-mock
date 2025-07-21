import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/enhanced-workout-types';

/**
 * Centralized data transformer for workout generation prompts
 * Ensures consistent data mapping between validation and prompt generation
 */
export class PromptDataTransformer {
  /**
   * Transform ProfileData to prompt variables with guaranteed completeness
   * This is the single source of truth for profile data mapping
   */
  static transformProfileData(profileData: ProfileData): Record<string, any> {
    // Defensive validation - this should never fail if ReviewPage validation passed
    if (!profileData) {
      console.error('❌ ProfileData is null in PromptDataTransformer');
      throw new Error('ProfileData is required for workout generation');
    }

    return {
      // Experience & Activity (Direct mapping)
      experienceLevel: profileData.experienceLevel,
      physicalActivity: profileData.physicalActivity,
      fitnessLevel: profileData.calculatedFitnessLevel,
      
      // Time & Commitment (Direct mapping)
      preferredDuration: profileData.preferredDuration,
      timeCommitment: profileData.timeCommitment,
      intensityLevel: profileData.intensityLevel,
      
      // Preferences (Array handling)
      preferredActivities: Array.isArray(profileData.preferredActivities) ? 
        profileData.preferredActivities.join(', ') : 
        'Not specified',
      availableLocations: Array.isArray(profileData.availableLocations) ? 
        profileData.availableLocations.join(', ') : 
        'Not specified',
      availableEquipment: Array.isArray(profileData.availableEquipment) ? 
        profileData.availableEquipment : 
        ['Body Weight'],
      
      // Goals & Timeline (Direct mapping)
      primaryGoal: profileData.primaryGoal,
      goalTimeline: profileData.goalTimeline,
      
      // Personal Information (Direct mapping)
      age: profileData.age,
      height: profileData.height,
      weight: profileData.weight,
      gender: profileData.gender,
      
      // Health & Safety (Array handling for injuries)
      hasCardiovascularConditions: profileData.hasCardiovascularConditions,
      injuries: Array.isArray(profileData.injuries) ? 
        profileData.injuries.join(', ') : 
        'No Injuries'
    };
  }

  /**
   * Transform workout focus data to prompt variables
   */
  static transformWorkoutFocusData(workoutFocusData: PerWorkoutOptions): Record<string, any> {
    if (!workoutFocusData) {
      throw new Error('WorkoutFocusData is required for workout generation');
    }

    // Transform soreness data
    const sorenessAreas = workoutFocusData.customization_soreness ? 
      Object.keys(workoutFocusData.customization_soreness)
        .filter(key => workoutFocusData.customization_soreness?.[key]?.selected)
        .map(key => `${key} (Level ${workoutFocusData.customization_soreness?.[key]?.rating || 0})`) :
      [];

    return {
      energyLevel: workoutFocusData.customization_energy,
      duration: workoutFocusData.customization_duration,
      focus: workoutFocusData.customization_focus,
      sorenessAreas: sorenessAreas,
      equipment: Array.isArray(workoutFocusData.customization_equipment) ? 
        workoutFocusData.customization_equipment :
        ['Body Weight']
    };
  }

  /**
   * Combine all data sources into complete prompt variables
   * This is the main method used by workout generation
   */
  static transformToPromptVariables(
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions,
    additionalContext?: Record<string, any>
  ): Record<string, any> {
    const profileVars = this.transformProfileData(profileData);
    const workoutVars = this.transformWorkoutFocusData(workoutFocusData);
    
    // 🔍 DEBUG: Log data source counts
    console.log(`🔍 PromptDataTransformer: ${Object.keys(profileVars).length} profile + ${Object.keys(workoutVars).length} workout + ${Object.keys(additionalContext || {}).length} context variables`);
    
    // 🔍 DEBUG: Log specific profile transformation results
    console.log('🔍 PromptDataTransformer - Profile transformation:');
    console.log('  INPUT  experienceLevel:', profileData.experienceLevel);
    console.log('  INPUT  primaryGoal:', profileData.primaryGoal);
    console.log('  OUTPUT experienceLevel:', profileVars.experienceLevel);
    console.log('  OUTPUT primaryGoal:', profileVars.primaryGoal);
    
    // Extract location properly from available locations array
    const locationValue = Array.isArray(profileVars.availableLocations) ? 
      profileVars.availableLocations[0] || 'Home' : 
      profileVars.availableLocations || 'Home';
    
    // 🔍 DEBUG: Check what additionalContext contains that might override profile data
    console.log('🔍 PromptDataTransformer - Field conflict check:');
    console.log('  additionalContext has experienceLevel:', 'experienceLevel' in (additionalContext || {}));
    console.log('  additionalContext has primaryGoal:', 'primaryGoal' in (additionalContext || {}));
    console.log('  profileVars.experienceLevel:', profileVars.experienceLevel);
    console.log('  profileVars.primaryGoal:', profileVars.primaryGoal);

    // Set defaults first, then profile data, then workout data, then additional context (highest priority)
    const result = {
      // Set defaults for optional environmental factors first
      location: locationValue,
      timeOfDay: 'morning', // Could be enhanced later
      noiseLevel: 'moderate',
      spaceLimitations: [],
      weather: 'indoor',
      temperature: 'comfortable',
      previousWorkout: 'none',
      dietaryRestrictions: 'none',
      
      // Profile data (middle priority)
      ...profileVars,
      
      // Workout data (higher priority)
      ...workoutVars,
      
      // Additional context (highest priority - can override profile/workout data)
      // CAREFUL: This can override profile data if there are conflicting keys
      ...additionalContext
    };

    // 🔍 DEBUG: Check if the critical fields got overridden  
    console.log('🔍 PromptDataTransformer - After merge check:');
    console.log('  result.experienceLevel:', (result as any).experienceLevel);
    console.log('  result.primaryGoal:', (result as any).primaryGoal);
    console.log('  experienceLevel overridden?', (result as any).experienceLevel !== profileVars.experienceLevel);
    console.log('  primaryGoal overridden?', (result as any).primaryGoal !== profileVars.primaryGoal);
    
    // 🔍 DEBUG: Log critical fields only
    console.log('🔍 PromptDataTransformer - Critical fields:', {
      experienceLevel: (result as any).experienceLevel ? '✅' : '❌',
      fitnessLevel: (result as any).fitnessLevel ? '✅' : '❌',
      primaryGoal: (result as any).primaryGoal ? '✅' : '❌',
      energyLevel: (result as any).energyLevel ? '✅' : '❌',
      focus: (result as any).focus ? '✅' : '❌',
      duration: (result as any).duration ? '✅' : '❌',
      sorenessAreas: (result as any).sorenessAreas ? '✅' : '❌',
      equipment: (result as any).equipment ? '✅' : '❌'
    });
    
    return result;
  }

  /**
   * Validate that all required prompt variables are present
   * Used for debugging and ensuring data completeness
   */
  static validatePromptVariables(variables: Record<string, any>): {
    isValid: boolean;
    missingRequired: string[];
    totalFields: number;
    populatedFields: number;
  } {
    const requiredFields = [
      'experienceLevel', 'fitnessLevel', 'primaryGoal', 'energyLevel', 
      'sorenessAreas', 'duration', 'focus', 'equipment'
    ];

    const missingRequired = requiredFields.filter(field => 
      !variables[field] || variables[field] === 'Not specified'
    );

    const allExpectedFields = [
      // Profile fields (15)
      'experienceLevel', 'physicalActivity', 'fitnessLevel',
      'preferredDuration', 'timeCommitment', 'intensityLevel',
      'preferredActivities', 'availableLocations', 'availableEquipment',
      'primaryGoal', 'goalTimeline', 'age', 'height', 'weight', 'gender',
      'hasCardiovascularConditions', 'injuries',
      // Workout focus fields (4)
      'energyLevel', 'duration', 'focus', 'sorenessAreas'
    ];

    const populatedFields = allExpectedFields.filter(field => 
      variables[field] && variables[field] !== 'Not specified' && variables[field] !== ''
    ).length;

    return {
      isValid: missingRequired.length === 0,
      missingRequired,
      totalFields: allExpectedFields.length,
      populatedFields
    };
  }

  /**
   * Debug method to log transformation results
   */
  static debugTransformation(
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions
  ): void {
    console.log('🔍 PromptDataTransformer Debug:');
    
    try {
      const variables = this.transformToPromptVariables(profileData, workoutFocusData);
      const validation = this.validatePromptVariables(variables);
      
      console.log(`✅ Transformation successful: ${validation.populatedFields}/${validation.totalFields} fields populated`);
      
      if (validation.missingRequired.length > 0) {
        console.warn('⚠️ Missing required fields:', validation.missingRequired);
      }
      
      console.log('📋 Transformed variables - CRITICAL FIELDS:');
      console.log('  experienceLevel:', variables.experienceLevel);
      console.log('  primaryGoal:', variables.primaryGoal);
      console.log('  fitnessLevel:', variables.fitnessLevel);
      console.log('  focus:', variables.focus);
      console.log('  duration:', variables.duration);
      console.log('  energyLevel:', variables.energyLevel);
      
    } catch (error) {
      console.error('❌ Transformation failed:', error);
    }
  }
} 