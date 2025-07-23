import { DataTransformerBase } from '../core/DataTransformerBase';
import { ProfileDataTransformer, TransformedProfileData } from './ProfileDataTransformer';
import { WorkoutFocusTransformer, WorkoutFocusData, TransformedWorkoutData } from './WorkoutFocusTransformer';
import { filterAvailableEquipment } from '../../../../../utils/equipmentRecommendations';

export interface PromptVariables extends TransformedProfileData, TransformedWorkoutData {
  timestamp: string;
  version: string;
  location: string;
  timeOfDay: string;
  noiseLevel: string;
  spaceLimitations: string[];
  weather: string;
  temperature: string;
  previousWorkout: string;
  dietaryRestrictions: string;
}

export class PromptVariableComposer extends DataTransformerBase<{
  profileData: any;
  workoutData: WorkoutFocusData;
  additionalContext?: Record<string, any>;
}, PromptVariables> {
  private profileTransformer: ProfileDataTransformer;
  private workoutTransformer: WorkoutFocusTransformer;

  constructor(debugMode = false) {
    super(debugMode);
    this.profileTransformer = new ProfileDataTransformer(debugMode);
    this.workoutTransformer = new WorkoutFocusTransformer(debugMode);
  }

  transform(input: {
    profileData: any;
    workoutData: WorkoutFocusData;
    additionalContext?: Record<string, any>;
  }): PromptVariables {
    try {
      // Transform profile data
      const profileData = this.profileTransformer.transform(input.profileData);
      
      // Transform workout data
      const workoutData = this.workoutTransformer.transform(input.workoutData);

      // Extract location from available locations array
      const locationValue = Array.isArray(profileData.availableLocations) ? 
        profileData.availableLocations[0] || 'Home' : 
        'Home';

      // Filter equipment based on focus and location
      let filteredEquipment = ['Body Weight']; // Default fallback
      
      if (workoutData.focus && profileData.availableEquipment) {
        try {
          filteredEquipment = filterAvailableEquipment(
            workoutData.focus,
            profileData.availableEquipment,
            profileData.availableLocations
          );
          
          this.log('Equipment filtering:', {
            focus: workoutData.focus,
            availableEquipment: profileData.availableEquipment,
            availableLocations: profileData.availableLocations,
            filteredEquipment
          });
        } catch (error) {
          this.log('⚠️ Equipment filtering failed, using fallback:', error);
          filteredEquipment = ['Body Weight'];
        }
      }

      // Set defaults first, then profile data, then workout data, then additional context
      const result: PromptVariables = {
        // Set defaults for optional environmental factors first
        location: locationValue,
        timeOfDay: 'morning',
        noiseLevel: 'moderate',
        spaceLimitations: [],
        weather: 'indoor',
        temperature: 'comfortable',
        previousWorkout: 'none',
        dietaryRestrictions: 'none',
        
        // Profile data (middle priority)
        ...profileData,
        
        // Workout data (higher priority)
        ...workoutData,
        
        // Override equipment with filtered equipment
        equipment: filteredEquipment,
        
        // Additional context (highest priority)
        ...input.additionalContext,

        // Required metadata
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      // Log transformation results for debugging
      this.log('Prompt variables composed successfully', {
        input: {
          hasProfileData: !!input.profileData,
          hasWorkoutData: !!input.workoutData,
          hasAdditionalContext: !!input.additionalContext,
          totalInputFields: Object.keys(input).length
        },
        output: {
          experienceLevel: result.experienceLevel,
          primaryGoal: result.primaryGoal,
          focus: result.focus,
          duration: result.duration,
          energyLevel: result.energyLevel,
          equipmentCount: result.equipment.length,
          totalOutputFields: Object.keys(result).length
        }
      });

      return result;

    } catch (error) {
      this.log('Prompt variables composition failed', error);
      return this.handleError(error as Error);
    }
  }

  public transformToPromptVariables(
    profileData: any,
    workoutData: WorkoutFocusData,
    additionalContext?: Record<string, any>
  ): PromptVariables {
    return this.transform({ profileData, workoutData, additionalContext });
  }
} 