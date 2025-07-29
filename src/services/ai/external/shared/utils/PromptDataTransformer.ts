import { ProfileData } from '../../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions, CategoryRatingData, WorkoutFocusConfigurationData } from '../../../../../types/core';
import { filterAvailableEquipment } from '../../../../../utils/equipmentRecommendations';
import { ValidationResult } from '../../../../../types/core';

// Type definitions for prompt variables
export interface PromptVariables {
  // Experience & Activity
  experienceLevel: string;
  physicalActivity: string;
  fitnessLevel?: string;
  
  // Time & Commitment
  preferredDuration: string;
  timeCommitment: string;
  intensityLevel: string;
  
  // Preferences
  preferredActivities: string;
  availableLocations: string;
  availableEquipment: string[];
  
  // Goals & Timeline
  primaryGoal: string;
  goalTimeline: string;
  
  // Personal Information
  age: string;
  height: string;
  weight: string;
  gender: string;
  
  // Health & Safety
  hasCardiovascularConditions: string;
  injuries: string;
  
  // Workout-specific
  focus?: string;
  duration?: number;
  equipment?: string[];
  energyLevel?: number;
  sorenessAreas?: string[];
  location?: string;
  timeOfDay?: string;
  noiseLevel?: string;
  spaceLimitations?: string[];
  weather?: string;
  temperature?: string;
  previousWorkout?: string;
  dietaryRestrictions?: string;
  intensity?: string;
}

export interface FocusData {
  focus?: string;
  focusLabel?: string;
  label?: string;
}

export interface SorenessVariables {
  hasSoreness: boolean;
  sorenessCount: number;
}

export interface EquipmentVariables {
  hasEquipment: boolean;
  equipmentCount: number;
}

export interface ExperienceLevelFlags {
  isMinimal: boolean;
  isSimple: boolean; 
  isStandard: boolean;
  isAdvanced: boolean;
}

export interface DurationAdjustment {
  durationAdjusted: boolean;
  originalDuration?: number;
  adjustmentReason?: string;
}

export interface AdditionalContext {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Centralized data transformer for workout generation prompts
 * Ensures consistent data mapping between validation and prompt generation
 */
export class PromptDataTransformer {
  /**
   * Transform ProfileData to prompt variables with guaranteed completeness
   * This is the single source of truth for profile data mapping
   */
  static transformProfileData(profileData: ProfileData): Partial<PromptVariables> {
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
  static transformWorkoutFocusData(workoutFocusData: PerWorkoutOptions): Partial<PromptVariables> {
    // Defensive validation - this should never fail if ReviewPage validation passed
    if (!workoutFocusData) {
      console.error('❌ WorkoutFocusData is null in PromptDataTransformer');
      throw new Error('WorkoutFocusData is required for workout generation');
    }

    // Extract focus value properly - handle both string and object formats
    const extractFocusValue = (focusData: string | WorkoutFocusConfigurationData | FocusData | undefined): string => {
      if (!focusData) return 'general';
      
      // If it's already a string, return it
      if (typeof focusData === 'string') {
        return focusData;
      }
      
      // If it's an object (WorkoutFocusConfigurationData), extract the focus property
      if (typeof focusData === 'object' && 'focus' in focusData && focusData.focus) {
        return focusData.focus;
      }
      
      // If it's an object with focusLabel, use that
      if (typeof focusData === 'object' && 'focusLabel' in focusData && focusData.focusLabel) {
        return focusData.focusLabel;
      }
      
      // If it's an object with label, use that
      if (typeof focusData === 'object' && 'label' in focusData && focusData.label) {
        return focusData.label;
      }
      
      // Fallback to string conversion
      return String(focusData);
    };
    
    const focus = extractFocusValue(workoutFocusData.customization_focus);
    
    // Extract duration value properly
    const extractDurationValue = (durationData: number | { duration: number } | undefined): number => {
      if (!durationData) return 30; // Default duration
      
      if (typeof durationData === 'number') {
        return durationData;
      }
      
      if (typeof durationData === 'object' && 'duration' in durationData) {
        return durationData.duration;
      }
      
      return 30; // Fallback
    };
    
    const duration = extractDurationValue(workoutFocusData.customization_duration);
    
    // Extract energy level from CategoryRatingData
    const extractEnergyLevel = (energyData: CategoryRatingData | number | undefined): number => {
      if (!energyData) return 5; // Default energy level
      
      if (typeof energyData === 'number') {
        return energyData;
      }
      
      if (typeof energyData === 'object' && 'rating' in energyData) {
        return energyData.rating;
      }
      
      return 5; // Fallback
    };
    
    const energyLevel = extractEnergyLevel(workoutFocusData.customization_energy);
    
    // Extract soreness areas from CategoryRatingData
    const extractSorenessAreas = (sorenessData: CategoryRatingData | string[] | undefined): string[] => {
      if (!sorenessData) return [];
      
      if (Array.isArray(sorenessData)) {
        return sorenessData;
      }
      
      if (typeof sorenessData === 'object' && 'categories' in sorenessData) {
        return sorenessData.categories;
      }
      
      return [];
    };
    
    const sorenessAreas = extractSorenessAreas(workoutFocusData.customization_soreness);
    
    return {
      focus,
      duration,
      energyLevel,
      sorenessAreas,
      equipment: workoutFocusData.customization_equipment ?? ['Body Weight'],
      location: workoutFocusData.customization_location ?? 'Home',
      intensity: workoutFocusData.customization_intensity ?? 'moderate'
    };
  }

  /**
   * Transform profile and workout data to prompt variables with additional context
   */
  static transformToPromptVariables(
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions,
    additionalContext?: AdditionalContext
  ): PromptVariables {
    const profileVars = this.transformProfileData(profileData);
    const workoutVars = this.transformWorkoutFocusData(workoutFocusData);
    
    // Log data source counts for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 PromptDataTransformer: ${Object.keys(profileVars).length} profile + ${Object.keys(workoutVars).length} workout + ${Object.keys(additionalContext || {}).length} context variables`);
    }
    
    // Extract location properly from available locations array
    const locationValue = Array.isArray(profileData.availableLocations) ? 
      profileData.availableLocations[0] ?? 'Home' : 
      (profileVars.availableLocations ?? 'Home');
    
    // Check for field conflicts in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PromptDataTransformer - Field conflict check:');
      console.log('  additionalContext has experienceLevel:', 'experienceLevel' in (additionalContext || {}));
      console.log('  additionalContext has primaryGoal:', 'primaryGoal' in (additionalContext || {}));
    }

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
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 PromptDataTransformer - Equipment filtering:');
          console.log('  INPUT focus:', workoutFocusData.customization_focus);
          console.log('  INPUT availableEquipment:', profileData.availableEquipment);
          console.log('  INPUT availableLocations:', profileData.availableLocations);
          console.log('  OUTPUT filteredEquipment:', filteredEquipment);
        }
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
    } as PromptVariables;

    // Check if the critical fields got overridden in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PromptDataTransformer - After merge check:');
      console.log('  result.experienceLevel:', result.experienceLevel);
      console.log('  result.primaryGoal:', result.primaryGoal);
      console.log('  result.equipment:', result.equipment);
      console.log('  experienceLevel overridden?', result.experienceLevel !== profileVars.experienceLevel);
      console.log('  primaryGoal overridden?', result.primaryGoal !== profileVars.primaryGoal);
      console.log('  equipment filtered?', JSON.stringify(result.equipment) !== JSON.stringify(workoutVars.equipment));
      
      // Log critical fields only
      console.log('🔍 PromptDataTransformer - Critical fields:', {
        experienceLevel: result.experienceLevel ? '✅' : '❌',
        fitnessLevel: result.fitnessLevel ? '✅' : '❌',
        primaryGoal: result.primaryGoal ? '✅' : '❌',
        energyLevel: result.energyLevel ? '✅' : '❌',
        focus: result.focus ? '✅' : '❌',
        duration: result.duration ? '✅' : '❌',
        sorenessAreas: result.sorenessAreas ? '✅' : '❌',
        equipment: result.equipment ? '✅' : '❌'
      });
    }

    return result;
  }

  /**
   * Compute derived variables from base prompt variables
   */
  static computeDerivedVariables(
    variables: Partial<PromptVariables>,
    originalDuration?: number
  ): Partial<PromptVariables> {
    const derived: Partial<PromptVariables> = {};
    
    // Compute experience level flags
    if (variables.experienceLevel && variables.duration) {
      const flags = this.computeExperienceLevelFlags(variables.experienceLevel, variables.duration);
      Object.assign(derived, flags);
    }
    
    // Compute soreness variables
    if (variables.sorenessAreas) {
      const sorenessVars = this.computeSorenessVariables(variables.sorenessAreas);
      Object.assign(derived, sorenessVars);
    }
    
    // Compute equipment variables
    if (variables.equipment) {
      const equipmentVars = this.computeEquipmentVariables(variables.equipment);
      Object.assign(derived, equipmentVars);
    }
    
    // Compute duration adjustment
    if (variables.duration && originalDuration) {
      const durationAdj = this.computeDurationAdjustment(variables.duration, originalDuration);
      Object.assign(derived, durationAdj);
    }
    
    return derived;
  }

  /**
   * Compute soreness-related variables
   */
  static computeSorenessVariables(sorenessAreas: string[]): SorenessVariables {
    return {
      hasSoreness: sorenessAreas.length > 0,
      sorenessCount: sorenessAreas.length
    };
  }

  /**
   * Compute equipment-related variables
   */
  static computeEquipmentVariables(equipment: string[]): EquipmentVariables {
    return {
      hasEquipment: equipment.length > 0 && !equipment.includes('Body Weight'),
      equipmentCount: equipment.length
    };
  }

  /**
   * Compute experience level flags based on experience and duration
   */
  static computeExperienceLevelFlags(experienceLevel: string, duration: number): ExperienceLevelFlags {
    const getComplexityFromDuration = (dur: number): string => {
      if (dur <= 20) return 'minimal';
      if (dur <= 45) return 'simple';
      if (dur <= 90) return 'standard';
      return 'advanced';
    };
    
    const mapExperienceToComplexity = (exp: string): string => {
      switch (exp.toLowerCase()) {
        case 'new to exercise': return 'minimal';
        case 'some experience': return 'simple';
        case 'advanced athlete': return 'advanced';
        default: return 'standard';
      }
    };
    
    const durationComplexity = getComplexityFromDuration(duration);
    const experienceComplexity = mapExperienceToComplexity(experienceLevel);
    
    return {
      isMinimal: durationComplexity === 'minimal' || experienceComplexity === 'minimal',
      isSimple: durationComplexity === 'simple' || experienceComplexity === 'simple',
      isStandard: durationComplexity === 'standard' || experienceComplexity === 'standard',
      isAdvanced: durationComplexity === 'advanced' || experienceComplexity === 'advanced'
    };
  }

  /**
   * Compute duration adjustment information
   */
  static computeDurationAdjustment(requestedDuration: number, actualDuration: number): DurationAdjustment {
    const tolerance = 5; // 5 minute tolerance
    const adjusted = Math.abs(requestedDuration - actualDuration) > tolerance;
    
    return {
      durationAdjusted: adjusted,
      originalDuration: adjusted ? requestedDuration : undefined,
      adjustmentReason: adjusted ? 'AI optimization' : undefined
    };
  }

  /**
   * Validate prompt variables for completeness
   */
  static validatePromptVariables(variables: Partial<PromptVariables>): ValidationResult {
    const requiredFields: (keyof PromptVariables)[] = [
      'experienceLevel',
      'fitnessLevel', 
      'primaryGoal',
      'age',
      'height',
      'weight',
      'gender'
    ];
    
    const missingRequired = requiredFields.filter(field => !variables[field]);
    const errors = missingRequired.map(field => `Missing required field: ${field}`);
    const warnings: string[] = [];
    
    return {
      isValid: missingRequired.length === 0,
      errors,
      warnings,
      missingFields: missingRequired,
      populatedFields: Object.keys(variables).filter(key => variables[key as keyof PromptVariables])
    };
  }

  /**
   * Debug transformation process
   */
  static debugTransformation(
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions
  ): void {
    console.log('🔍 PromptDataTransformer Debug:');
    console.log('Profile Data:', {
      experienceLevel: profileData.experienceLevel,
      primaryGoal: profileData.primaryGoal,
      age: profileData.age,
      availableEquipment: profileData.availableEquipment
    });
    
    console.log('Workout Focus Data:', {
      focus: workoutFocusData.customization_focus,
      duration: workoutFocusData.customization_duration,
      equipment: workoutFocusData.customization_equipment
    });
    
    const result = this.transformToPromptVariables(profileData, workoutFocusData);
    console.log('Transformed Result:', {
      experienceLevel: result.experienceLevel,
      primaryGoal: result.primaryGoal,
      focus: result.focus,
      duration: result.duration,
      equipment: result.equipment
    });
  }

  /**
   * Test equipment filtering functionality
   */
  static testEquipmentFiltering(): void {
    console.log('🧪 Testing Equipment Filtering:');
    
    const testCases = [
      {
        focus: 'strength',
        availableEquipment: ['Body Weight', 'Dumbbells', 'Resistance Bands'],
        expected: ['Dumbbells', 'Resistance Bands']
      },
      {
        focus: 'cardio',
        availableEquipment: ['Body Weight', 'Treadmill', 'Bike'],
        expected: ['Treadmill', 'Bike']
      }
    ];
    
    testCases.forEach((testCase, index) => {
      try {
        const result = filterAvailableEquipment(
          testCase.focus,
          testCase.availableEquipment,
          ['Home']
        );
        console.log(`Test ${index + 1}:`, {
          input: testCase,
          output: result,
          passed: JSON.stringify(result) === JSON.stringify(testCase.expected)
        });
      } catch (error) {
        console.error(`Test ${index + 1} failed:`, error);
      }
    });
  }
} 