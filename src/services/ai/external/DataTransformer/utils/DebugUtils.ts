import type { ProfileFields } from '../types/profile.types';
import type { WorkoutFocusData } from '../transformers/WorkoutFocusTransformer';
import type { PromptVariables } from '../transformers/PromptVariableComposer';
import { VALIDATION_RULES } from '../constants/ValidationRules';
import { validateProfileData } from '../validators/ProfileDataValidator';
import { validateWorkoutData } from '../validators/WorkoutDataValidator';
import { validatePromptVariables } from '../validators/PromptVariableValidator';

/**
 * Debug logs transformation results
 */
export function debugTransformation(
  profileData: any,
  workoutData: WorkoutFocusData,
  promptVariables?: PromptVariables
): void {
  console.group('🔍 Data Transformation Debug');
  
  try {
    // Debug profile data
    console.group('📥 Input Data');
    console.log('Profile Data:', {
      hasExperienceLevel: !!profileData?.experienceLevel,
      hasPrimaryGoal: !!profileData?.primaryGoal,
      totalFields: Object.keys(profileData || {}).length,
      fields: Object.keys(profileData || {})
    });
    console.log('Workout Data:', {
      hasFocus: !!workoutData?.customization_focus,
      hasDuration: !!workoutData?.customization_duration,
      hasEnergy: !!workoutData?.customization_energy,
      totalFields: Object.keys(workoutData || {}).length,
      fields: Object.keys(workoutData || {})
    });
    console.groupEnd();

    // Debug validation results
    console.group('🔍 Validation Results');
    const profileValidation = validateProfileData(profileData);
    const workoutValidation = validateWorkoutData(workoutData);

    console.log('Profile Validation:', {
      isValid: profileValidation.isValid,
      errors: profileValidation.errors,
      warnings: profileValidation.warnings,
      missingRequired: profileValidation.missingFields.filter(field => 
        VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]?.required
      ),
      missingOptional: profileValidation.missingFields.filter(field => 
        !VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]?.required
      )
    });

    console.log('Workout Validation:', {
      isValid: workoutValidation.isValid,
      errors: workoutValidation.errors,
      warnings: workoutValidation.warnings,
      missingFields: workoutValidation.missingFields
    });
    console.groupEnd();

    // Debug transformed data
    if (promptVariables) {
      console.group('📤 Transformed Data');
      const promptValidation = validatePromptVariables(promptVariables);
      
      console.log('Prompt Variables:', {
        experienceLevel: promptVariables.experienceLevel,
        primaryGoal: promptVariables.primaryGoal,
        focus: promptVariables.focus,
        duration: promptVariables.duration,
        energyLevel: promptVariables.energyLevel,
        totalFields: Object.keys(promptVariables).length
      });

      console.log('Validation:', {
        isValid: promptValidation.isValid,
        errors: promptValidation.errors,
        warnings: promptValidation.warnings,
        missingFields: promptValidation.missingFields
      });

      // Check for unresolved template variables
      const unresolvedFields = findUnresolvedVariables(promptVariables);
      if (unresolvedFields.length > 0) {
        console.warn('⚠️ Unresolved Template Variables:', unresolvedFields);
      }
      
      console.groupEnd();
    }

  } catch (error) {
    console.error('❌ Debug transformation failed:', error);
  }

  console.groupEnd();
}

/**
 * Finds unresolved template variables
 */
export function findUnresolvedVariables(data: Record<string, any>): string[] {
  const unresolved: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('{{')) {
      unresolved.push(`${key}: ${value}`);
    }
  });

  return unresolved;
}

/**
 * Logs transformation error with context
 */
export function logTransformationError(error: Error, context?: any): void {
  console.error('❌ Transformation Error:', {
    message: error.message,
    stack: error.stack,
    context: {
      ...context,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Tests equipment filtering with sample data
 */
export function testEquipmentFiltering(
  availableEquipment: string[] = ['Dumbbells', 'Resistance Bands', 'Kettlebells'],
  availableLocations: string[] = ['Home', 'Gym']
): void {
  console.group('🧪 Testing Equipment Filtering');
  
  try {
    const sampleFocusAreas = [
      'Strength',
      'Cardio',
      'Flexibility',
      'Balance'
    ];

    sampleFocusAreas.forEach(focus => {
      console.log(`Testing focus: ${focus}`, {
        availableEquipment,
        availableLocations,
        filteredEquipment: filterEquipment(focus, availableEquipment, availableLocations)
      });
    });

    console.log('✅ Equipment filtering tests completed');
  } catch (error) {
    console.error('❌ Equipment filtering tests failed:', error);
  }

  console.groupEnd();
}

/**
 * Helper function to filter equipment based on focus and location
 */
function filterEquipment(focus: string, equipment: string[], locations: string[]): string[] {
  // Always include body weight
  const filtered = ['Body Weight'];

  // Add location-specific equipment
  if (locations.includes('Gym')) {
    filtered.push(...equipment.filter(e => e !== 'Body Weight'));
  } else if (locations.includes('Home')) {
    filtered.push(...equipment.filter(e => 
      ['Dumbbells', 'Resistance Bands', 'Yoga Mat'].includes(e)
    ));
  }

  // Add focus-specific equipment
  if (focus === 'Strength') {
    filtered.push(...equipment.filter(e => 
      ['Dumbbells', 'Kettlebells', 'Barbell'].includes(e)
    ));
  } else if (focus === 'Cardio') {
    filtered.push(...equipment.filter(e => 
      ['Jump Rope', 'Resistance Bands'].includes(e)
    ));
  }

  return [...new Set(filtered)];
} 