import { DataTransformerBase } from '../core/DataTransformerBase';
import { VALIDATION_RULES, CORE_REQUIRED_FIELDS } from '../constants/ValidationRules';
import { DEFAULT_VALUES, DERIVED_VALUE_MAPS } from '../constants/DefaultValues';
import type { ProfileFields } from '../types/profile.types';

export type TransformedProfileData = ProfileFields;

export class ProfileDataTransformer extends DataTransformerBase<any, TransformedProfileData> {
  transform(input: any): TransformedProfileData {
    // Defensive validation - this should never fail if ReviewPage validation passed
    if (!input) {
      this.log('❌ ProfileData is null in ProfileDataTransformer');
      throw new Error('ProfileData is required for workout generation');
    }

    try {
      // Start with default values
      const defaultProfile = DEFAULT_VALUES.profile;

      // Transform with fallbacks to defaults
      const transformedData = {
        // Experience & Activity
        experienceLevel: input.experienceLevel || defaultProfile.experienceLevel,
        physicalActivity: input.physicalActivity || defaultProfile.physicalActivity,
        
        // Time & Commitment
        preferredDuration: input.preferredDuration || defaultProfile.preferredDuration,
        timeCommitment: input.timeCommitment || defaultProfile.timeCommitment,
        intensityLevel: input.intensityLevel || defaultProfile.intensityLevel,
        
        // Preferences (Array handling)
        preferredActivities: Array.isArray(input.preferredActivities) ? 
          input.preferredActivities : 
          defaultProfile.preferredActivities,
        availableLocations: Array.isArray(input.availableLocations) ? 
          input.availableLocations : 
          defaultProfile.availableLocations,
        availableEquipment: Array.isArray(input.availableEquipment) ? 
          input.availableEquipment : 
          defaultProfile.availableEquipment,
        
        // Goals
        primaryGoal: input.primaryGoal || defaultProfile.primaryGoal,
        goalTimeline: input.goalTimeline || defaultProfile.goalTimeline,
        
        // Personal Information
        age: input.age || defaultProfile.age,
        gender: input.gender || defaultProfile.gender,
        height: input.height || defaultProfile.height,
        weight: input.weight || defaultProfile.weight,
        
        // Health & Safety
        hasCardiovascularConditions: input.hasCardiovascularConditions || defaultProfile.hasCardiovascularConditions,
        injuries: Array.isArray(input.injuries) ? 
          input.injuries : 
          defaultProfile.injuries
      };

      // Calculate derived fields
      const calculatedFitnessLevel = DERIVED_VALUE_MAPS.calculateFitnessLevel(
        transformedData.experienceLevel,
        transformedData.physicalActivity
      );

      const calculatedWorkoutIntensity = DERIVED_VALUE_MAPS.calculateWorkoutIntensity(
        transformedData.intensityLevel,
        transformedData.timeCommitment
      );

      // Add derived fields
      const result: TransformedProfileData = {
        ...transformedData,
        calculatedFitnessLevel,
        calculatedWorkoutIntensity
      };

      // Log transformation results for debugging
      this.log('Profile transformation successful', {
        input: {
          hasExperienceLevel: !!input.experienceLevel,
          hasPrimaryGoal: !!input.primaryGoal,
          totalFields: Object.keys(input).length,
          providedFields: Object.keys(input)
        },
        output: {
          experienceLevel: result.experienceLevel,
          primaryGoal: result.primaryGoal,
          calculatedFitnessLevel: result.calculatedFitnessLevel,
          calculatedWorkoutIntensity: result.calculatedWorkoutIntensity,
          totalFields: Object.keys(result).length,
          defaultsUsed: Object.keys(result).filter(key => 
            !input[key] && result[key as keyof TransformedProfileData] === defaultProfile[key as keyof typeof defaultProfile]
          )
        }
      });

      // Validate core required fields
      const missingCoreFields = CORE_REQUIRED_FIELDS.filter(field => !result[field as keyof TransformedProfileData]);
      if (missingCoreFields.length > 0) {
        throw new Error(`Missing required core fields: ${missingCoreFields.join(', ')}`);
      }

      return result;

    } catch (error) {
      this.log('Profile transformation failed', error);
      return this.handleError(error as Error);
    }
  }
} 