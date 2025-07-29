import { 
  InternalPromptContext, 
  InternalPromptVariables,
  PromptBuilder 
} from '../types/internal-prompt.types';
import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/core';
import { InternalPromptTransformer } from '../utils/DataTransformers';
import { UserProfileTransformer } from '../../external/DataTransformer/transformers/UserProfileTransformer';
import { aiLogger } from '../../logging/AILogger';

export class ProfilePromptBuilder implements PromptBuilder {
  private errors: string[] = [];
  private context: Partial<InternalPromptContext> | null = null;
  private userProfileTransformer: UserProfileTransformer;

  constructor() {
    this.userProfileTransformer = new UserProfileTransformer();
  }

  /**
   * Build internal prompt context from profile data
   */
  public buildContext(data: ProfileData): Partial<InternalPromptContext> {
    try {
      this.errors = [];

      // Validate required fields
      if (!this.validateProfileData(data)) {
        return {};
      }

      // Transform profile data using both transformers
      const transformedData = InternalPromptTransformer.transformData(data, {} as PerWorkoutOptions);
      const userProfile = this.userProfileTransformer.transform(data);

      // Map AI assistance level to internal format
      const aiAssistanceLevel = userProfile.preferences.aiAssistanceLevel === 'moderate' ? 'moderate' : 'low';

      // Build enhanced profile context
      const context: Partial<InternalPromptContext> = {
        profile: {
          fitnessLevel: transformedData.profile.fitnessLevel,
          experienceLevel: transformedData.profile.experience,
          primaryGoal: data.primaryGoal,
          injuries: transformedData.profile.injuries,
          preferredActivities: transformedData.profile.preferredActivities,
          availableEquipment: transformedData.profile.equipment,
          availableLocations: transformedData.profile.locations,
          calculatedWorkoutIntensity: transformedData.profile.intensity
        },
        preferences: {
          workoutStyle: userProfile.preferences.workoutStyle,
          timePreference: userProfile.preferences.timePreference,
          intensityPreference: userProfile.preferences.intensityPreference,
          advancedFeatures: userProfile.preferences.advancedFeatures,
          aiAssistanceLevel
        }
      };

      this.context = context;

      aiLogger.debug('ProfilePromptBuilder - Context built successfully', {
        hasProfile: !!context.profile,
        hasPreferences: !!context.preferences,
        fitnessLevel: context.profile?.fitnessLevel,
        experienceLevel: context.profile?.experienceLevel
      });

      return context;

    } catch (error) {
      this.handleError('Failed to build profile context', error);
      return {};
    }
  }

  /**
   * Build prompt variables from context
   */
  public buildVariables(context: InternalPromptContext): InternalPromptVariables {
    try {
      return {
        fitnessContext: {
          level: context.profile.fitnessLevel,
          experience: context.profile.experienceLevel,
          goal: context.profile.primaryGoal,
          limitations: context.profile.injuries
        },
        workoutContext: {
          focus: context.workout?.focus || 'general',
          duration: context.workout?.duration || 45,
          energy: context.workout?.energyLevel || 7,
          intensity: context.workout?.intensity || context.profile.calculatedWorkoutIntensity || 'moderate',
          equipment: context.profile.availableEquipment,
          targetAreas: context.workout?.areas
        },
        userPreferences: {
          style: context.preferences.workoutStyle,
          time: context.preferences.timePreference,
          intensity: context.preferences.intensityPreference,
          advanced: context.preferences.advancedFeatures,
          assistance: context.preferences.aiAssistanceLevel
        }
      };
    } catch (error) {
      this.handleError('Failed to build variables', error);
      throw error;
    }
  }

  /**
   * Validate the current context
   */
  public validate(): boolean {
    if (!this.context) {
      this.errors.push('No context available');
      return false;
    }

    const { profile, preferences } = this.context;

    if (!profile) {
      this.errors.push('Profile data is missing');
      return false;
    }

    if (!preferences) {
      this.errors.push('Preferences data is missing');
      return false;
    }

    // Validate required profile fields
    const requiredProfileFields: (keyof typeof profile)[] = [
      'fitnessLevel',
      'experienceLevel',
      'primaryGoal',
      'preferredActivities',
      'availableEquipment'
    ];

    for (const field of requiredProfileFields) {
      if (!profile[field]) {
        this.errors.push(`Required profile field missing: ${field}`);
        return false;
      }
    }

    // Validate required preferences fields
    const requiredPreferencesFields: (keyof typeof preferences)[] = [
      'workoutStyle',
      'intensityPreference',
      'aiAssistanceLevel'
    ];

    for (const field of requiredPreferencesFields) {
      if (!preferences[field]) {
        this.errors.push(`Required preferences field missing: ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get validation errors
   */
  public getErrors(): string[] {
    return this.errors;
  }

  private validateProfileData(data: ProfileData): boolean {
    if (!data) {
      this.errors.push('Profile data is null or undefined');
      return false;
    }

    const requiredFields: (keyof ProfileData)[] = [
      'experienceLevel',
      'primaryGoal',
      'preferredActivities',
      'availableEquipment',
      'injuries'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        this.errors.push(`Required field missing: ${field}`);
        return false;
      }
    }

    // Validate arrays have content
    if (!data.preferredActivities.length) {
      this.errors.push('No preferred activities specified');
      return false;
    }

    if (!data.availableEquipment.length) {
      this.errors.push('No available equipment specified');
      return false;
    }

    return true;
  }

  private handleError(message: string, error: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.errors.push(`${message}: ${errorMessage}`);

    aiLogger.error({
      error: error instanceof Error ? error : new Error(String(error)),
      context: 'profile prompt builder',
      component: 'ProfilePromptBuilder',
      severity: 'medium',
      userImpact: true,
      metadata: {
        errors: this.errors
      }
    });
  }
}