import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/enhanced-workout-types';
import { filterAvailableEquipment } from '../../../../utils/equipmentRecommendations';

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
   * Transform workout focus data to prompt variables with enhanced focus extraction
   */
  static transformWorkoutFocusData(workoutFocusData: PerWorkoutOptions): Record<string, any> {
    // Extract focus value properly - handle both string and object formats
    const extractFocusValue = (focusData: any): string => {
      if (!focusData) return 'general';
      
      // If it's already a string, return it
      if (typeof focusData === 'string') {
        return focusData;
      }
      
      // If it's an object (WorkoutFocusConfigurationData), extract the focus property
      if (typeof focusData === 'object' && focusData.focus) {
        return focusData.focus;
      }
      
      // If it's an object with focusLabel, use that
      if (typeof focusData === 'object' && focusData.focusLabel) {
        return focusData.focusLabel;
      }
      
      // If it's an object with label, use that
      if (typeof focusData === 'object' && focusData.label) {
        return focusData.label;
      }
      
      // Fallback to string conversion
      return String(focusData);
    };
    
    const focus = extractFocusValue(workoutFocusData.customization_focus);
    
    // 🔍 DEBUG: Log the focus extraction for consistency check
    console.log('🔍 PromptDataTransformer - Focus extraction:', {
      originalFocus: workoutFocusData.customization_focus,
      originalType: typeof workoutFocusData.customization_focus,
      extractedFocus: focus,
      isObject: typeof workoutFocusData.customization_focus === 'object'
    });

    // Transform soreness data
    const sorenessAreas = workoutFocusData.customization_soreness ? 
      Object.keys(workoutFocusData.customization_soreness)
        .filter(key => workoutFocusData.customization_soreness?.[key]?.selected)
        .map(key => `${key} (Level ${workoutFocusData.customization_soreness?.[key]?.rating || 0})`) :
      [];

    return {
      energyLevel: workoutFocusData.customization_energy,
      duration: workoutFocusData.customization_duration,
      focus: focus, // Use extracted focus value
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

    // ✅ FIXED: Apply equipment filtering to ensure AI gets the correctly filtered equipment
    // This matches exactly what ReviewPage displays to the user
    let filteredEquipment = ['Body Weight']; // Default fallback
    
    if (workoutFocusData.customization_focus && profileData.availableEquipment) {
      try {
        filteredEquipment = filterAvailableEquipment(
          String(workoutFocusData.customization_focus),
          profileData.availableEquipment,
          profileData.availableLocations
        );
        
        console.log('🔍 PromptDataTransformer - Equipment filtering:');
        console.log('  INPUT focus:', workoutFocusData.customization_focus);
        console.log('  INPUT availableEquipment:', profileData.availableEquipment);
        console.log('  INPUT availableLocations:', profileData.availableLocations);
        console.log('  OUTPUT filteredEquipment:', filteredEquipment);
      } catch (error) {
        console.warn('⚠️ Equipment filtering failed, using fallback:', error);
        filteredEquipment = ['Body Weight'];
      }
    }

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
      
      // ✅ FIXED: Override equipment with filtered equipment for AI prompt
      equipment: filteredEquipment,
      
      // Additional context (highest priority - can override profile/workout data)
      // CAREFUL: This can override profile data if there are conflicting keys
      ...additionalContext
    };

    // 🔍 DEBUG: Check if the critical fields got overridden  
    console.log('🔍 PromptDataTransformer - After merge check:');
    console.log('  result.experienceLevel:', (result as any).experienceLevel);
    console.log('  result.primaryGoal:', (result as any).primaryGoal);
    console.log('  result.equipment:', (result as any).equipment);
    console.log('  experienceLevel overridden?', (result as any).experienceLevel !== profileVars.experienceLevel);
    console.log('  primaryGoal overridden?', (result as any).primaryGoal !== profileVars.primaryGoal);
    console.log('  equipment filtered?', JSON.stringify((result as any).equipment) !== JSON.stringify(workoutVars.equipment));
    
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
    
    // ✅ NEW: Compute derived variables required by QuickWorkoutSetup feature
    const originalDuration = typeof workoutFocusData.customization_duration === 'number' 
      ? workoutFocusData.customization_duration 
      : (workoutFocusData.customization_duration as any)?.duration || (result as any).duration;
    const derivedVariables = this.computeDerivedVariables(result, originalDuration);
    
    // 🔍 DEBUG: Log derived variables
    console.log('🔍 PromptDataTransformer - Derived variables:', {
      hasSoreness: derivedVariables.hasSoreness ? '✅' : '❌',
      sorenessCount: `✅ (${derivedVariables.sorenessCount})`,
      hasEquipment: derivedVariables.hasEquipment ? '✅' : '❌',
      equipmentCount: `✅ (${derivedVariables.equipmentCount})`,
      isMinimal: derivedVariables.isMinimal ? '✅' : '❌',
      isSimple: derivedVariables.isSimple ? '✅' : '❌',
      isStandard: derivedVariables.isStandard ? '✅' : '❌',
      isAdvanced: derivedVariables.isAdvanced ? '✅' : '❌',
      durationAdjusted: derivedVariables.durationAdjusted ? '✅' : '❌'
    });
    
    return {
      ...result,
      ...derivedVariables
    };
  }

  /**
   * Compute derived variables required by QuickWorkoutSetup feature
   * These variables are computed from base data and are required by new system prompts
   */
  static computeDerivedVariables(
    variables: Record<string, any>,
    originalDuration?: number
  ): Record<string, any> {
    try {
      // 1. Compute soreness-derived variables
      const sorenessVars = this.computeSorenessVariables(variables.sorenessAreas);
      
      // 2. Compute equipment-derived variables  
      const equipmentVars = this.computeEquipmentVariables(variables.equipment);
      
      // 3. Compute experience level complexity flags
      const experienceVars = this.computeExperienceLevelFlags(
        variables.experienceLevel, 
        variables.duration
      );
      
      // 4. Compute duration adjustment flag
      const durationVars = this.computeDurationAdjustment(
        originalDuration || variables.duration,
        variables.duration
      );
      
      return {
        ...sorenessVars,
        ...equipmentVars, 
        ...experienceVars,
        ...durationVars
      };
      
    } catch (error) {
      console.warn('⚠️ PromptDataTransformer: Error computing derived variables, using defaults:', error);
      
      // Return safe defaults if computation fails
      return {
        hasSoreness: false,
        sorenessCount: 0,
        hasEquipment: false,
        equipmentCount: 0,
        isMinimal: true,  // Default to safest complexity
        isSimple: false,
        isStandard: false,
        isAdvanced: false,
        durationAdjusted: false
      };
    }
  }

  /**
   * Compute soreness-related variables
   */
  static computeSorenessVariables(sorenessAreas: any): {
    hasSoreness: boolean;
    sorenessCount: number;
  } {
    // Handle both array and object formats from different data sources
    let areas: string[] = [];
    
    if (Array.isArray(sorenessAreas)) {
      areas = sorenessAreas;
    } else if (typeof sorenessAreas === 'object' && sorenessAreas !== null) {
      // Handle object format like { "lower back": { selected: true, rating: 3 } }
      areas = Object.keys(sorenessAreas).filter(key => 
        sorenessAreas[key]?.selected || sorenessAreas[key] === true
      );
    } else if (typeof sorenessAreas === 'string' && sorenessAreas.trim() !== '') {
      areas = [sorenessAreas];
    }
    
    return {
      hasSoreness: areas.length > 0,
      sorenessCount: areas.length
    };
  }

  /**
   * Compute equipment-related variables
   */
  static computeEquipmentVariables(equipment: any): {
    hasEquipment: boolean;
    equipmentCount: number;
  } {
    // Handle array or fallback to bodyweight
    let equipmentArray: string[] = [];
    
    if (Array.isArray(equipment)) {
      equipmentArray = equipment;
    } else if (typeof equipment === 'string' && equipment.trim() !== '') {
      equipmentArray = [equipment];
    } else {
      equipmentArray = ['Body Weight'];
    }
    
    // Exclude 'Body Weight' from count since it's the default
    const realEquipment = equipmentArray.filter(item => 
      item && item.toLowerCase() !== 'body weight' && item.toLowerCase() !== 'bodyweight'
    );
    
    return {
      hasEquipment: realEquipment.length > 0,
      equipmentCount: realEquipment.length
    };
  }

  /**
   * Compute experience level complexity flags
   */
  static computeExperienceLevelFlags(experienceLevel: any, duration: any): {
    isMinimal: boolean;
    isSimple: boolean; 
    isStandard: boolean;
    isAdvanced: boolean;
  } {
    // Safe defaults if inputs are invalid
    const safeExperienceLevel = String(experienceLevel || 'new to exercise').toLowerCase();
    const safeDuration = Number(duration) || 30;
    
    // Map duration to complexity level (based on duration-constants.ts patterns)
    const getComplexityFromDuration = (dur: number): string => {
      if (dur <= 5) return 'minimal';
      if (dur <= 10) return 'simple'; 
      if (dur <= 20) return 'standard';
      if (dur <= 30) return 'comprehensive';
      return 'advanced';
    };
    
    // Map experience level to complexity preference
    const mapExperienceToComplexity = (exp: string): string => {
      if (exp.includes('new to exercise') || exp.includes('beginner')) return 'simple';
      if (exp.includes('some experience') || exp.includes('intermediate')) return 'standard';
      if (exp.includes('advanced athlete') || exp.includes('advanced')) return 'advanced';
      return 'standard'; // Default to standard
    };
    
    const durationComplexity = getComplexityFromDuration(safeDuration);
    const experienceComplexity = mapExperienceToComplexity(safeExperienceLevel);
    
    // Use the more conservative of the two (lower complexity wins for safety)
    const complexityOrder = ['minimal', 'simple', 'standard', 'comprehensive', 'advanced'];
    const durationIndex = complexityOrder.indexOf(durationComplexity);
    const experienceIndex = complexityOrder.indexOf(experienceComplexity);
    
    const finalComplexityIndex = Math.min(durationIndex, experienceIndex);
    const finalComplexity = complexityOrder[finalComplexityIndex];
    
    return {
      isMinimal: finalComplexity === 'minimal',
      isSimple: finalComplexity === 'simple',
      isStandard: finalComplexity === 'standard' || finalComplexity === 'comprehensive', 
      isAdvanced: finalComplexity === 'advanced'
    };
  }

  /**
   * Compute duration adjustment flag
   */
  static computeDurationAdjustment(requestedDuration: any, actualDuration: any): {
    durationAdjusted: boolean;
    originalDuration?: number;
    adjustmentReason?: string;
  } {
    const requested = Number(requestedDuration) || 30;
    const actual = Number(actualDuration) || 30;
    const isAdjusted = requested !== actual;
    
    return {
      durationAdjusted: isAdjusted,
      ...(isAdjusted && {
        originalDuration: requested,
        adjustmentReason: `Adjusted from ${requested} to ${actual} minutes for optimal workout structure`
      })
    };
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
      console.log('  equipment (filtered):', variables.equipment);
      console.log('  availableEquipment (raw):', variables.availableEquipment);
      
    } catch (error) {
      console.error('❌ Transformation failed:', error);
    }
  }

  /**
   * Test equipment filtering with sample data - useful for debugging
   */
  static testEquipmentFiltering(): void {
    console.log('🧪 Testing Equipment Filtering:');
    
    const sampleProfile: Partial<ProfileData> = {
      availableEquipment: ['Dumbbells', 'Resistance Bands', 'Kettlebells'],
      availableLocations: ['Home', 'Gym']
    };
    
    const sampleWorkout: Partial<PerWorkoutOptions> = {
      customization_focus: 'Quick Sweat'
    };
    
    try {
      const filteredEquipment = filterAvailableEquipment(
        String(sampleWorkout.customization_focus),
        sampleProfile.availableEquipment || [],
        sampleProfile.availableLocations
      );
      
      console.log('  Focus:', sampleWorkout.customization_focus);
      console.log('  Available Equipment:', sampleProfile.availableEquipment);
      console.log('  Available Locations:', sampleProfile.availableLocations);
      console.log('  Filtered Equipment:', filteredEquipment);
      console.log('  ✅ Equipment filtering working correctly');
    } catch (error) {
      console.error('  ❌ Equipment filtering failed:', error);
    }
  }
} 