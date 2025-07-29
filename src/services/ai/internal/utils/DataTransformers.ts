import { 
  ProfileData,
  ExperienceLevel,
  PhysicalActivity,
  PreferredActivity,
  Equipment,
  Location,
  Injury 
} from '../../../../components/Profile/types/profile.types';
import { 
  PerWorkoutOptions,
  WorkoutFocusConfigurationData,
  WorkoutIntensity,
  FitnessLevel 
} from '../../../../types/core';
import { calculateFitnessLevel } from '../../../../utils/fitnessLevelCalculator';
import { aiLogger } from '../../logging/AILogger';

/**
 * Transform profile data into standardized format for internal prompts
 */
export class ProfileDataTransformer {
  /**
   * Transform experience level to standardized format
   */
  static transformExperienceLevel(level: ExperienceLevel): string {
    const mapping: Record<ExperienceLevel, string> = {
      'New to Exercise': 'beginner',
      'Some Experience': 'intermediate',
      'Advanced Athlete': 'advanced'
    };
    return mapping[level] || 'intermediate';
  }

  /**
   * Transform physical activity to standardized format
   */
  static transformPhysicalActivity(activity: PhysicalActivity): string {
    const mapping: Record<PhysicalActivity, string> = {
      sedentary: 'low',
      light: 'low_moderate',
      moderate: 'moderate',
      very: 'moderate_high',
      extremely: 'high'
    };
    return mapping[activity] || 'moderate';
  }

  /**
   * Transform preferred activities to standardized format
   */
  static transformPreferredActivities(activities: PreferredActivity[]): string[] {
    return activities.map(activity => 
      activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
    );
  }

  /**
   * Transform equipment to standardized format
   */
  static transformEquipment(equipment: Equipment[]): string[] {
    return equipment.map(item => 
      item.toLowerCase().replace(/[^a-z0-9]/g, '_')
    );
  }

  /**
   * Transform locations to standardized format
   */
  static transformLocations(locations: Location[]): string[] {
    return locations.map(location => 
      location.toLowerCase().replace(/[^a-z0-9]/g, '_')
    );
  }

  /**
   * Transform injuries to standardized format
   */
  static transformInjuries(injuries: Injury[]): string[] {
    return injuries
      .filter(injury => injury !== 'No Injuries')
      .map(injury => injury.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  }

  /**
   * Calculate fitness metrics from profile data
   */
  static calculateFitnessMetrics(data: ProfileData): {
    fitnessLevel: FitnessLevel;
    intensity: WorkoutIntensity;
    activityLevel: string;
  } {
    const fitnessLevel = data.calculatedFitnessLevel || 
      calculateFitnessLevel(data.experienceLevel, data.physicalActivity);

    const intensity = data.calculatedWorkoutIntensity || 'moderate';
    const activityLevel = this.transformPhysicalActivity(data.physicalActivity);

    return {
      fitnessLevel,
      intensity,
      activityLevel
    };
  }
}

/**
 * Transform workout data into standardized format for internal prompts
 */
export class WorkoutDataTransformer {
  /**
   * Transform workout focus to standardized format
   */
  static transformWorkoutFocus(focus: string | WorkoutFocusConfigurationData): string {
    if (typeof focus === 'string') {
      return focus.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    return (focus.focus || 'general').toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Transform energy level to standardized format
   */
  static transformEnergyLevel(energy: number | { rating: number }): {
    rating: number;
    category: string;
  } {
    const rating = typeof energy === 'number' ? energy : energy.rating;
    const category = rating <= 3 ? 'low' : 
                    rating <= 5 ? 'moderate_low' :
                    rating <= 7 ? 'moderate' :
                    rating <= 8 ? 'moderate_high' : 'high';

    return { rating, category };
  }

  /**
   * Transform soreness data to standardized format
   */
  static transformSoreness(soreness: any): {
    rating: number;
    areas?: string[];
    category: string;
  } {
    if (!soreness) {
      return { rating: 0, category: 'none' };
    }

    const rating = typeof soreness === 'number' ? soreness :
                  soreness.rating || 0;

    const areas = Array.isArray(soreness) ? soreness :
                 soreness.areas || [];

    const category = rating <= 2 ? 'minimal' :
                    rating <= 4 ? 'mild' :
                    rating <= 6 ? 'moderate' :
                    rating <= 8 ? 'significant' : 'severe';

    return { rating, areas, category };
  }

  /**
   * Transform duration to standardized format
   */
  static transformDuration(duration: number | { duration: number }): {
    minutes: number;
    category: string;
  } {
    const minutes = typeof duration === 'number' ? duration : duration.duration;
    const category = minutes <= 15 ? 'short' :
                    minutes <= 30 ? 'moderate' :
                    minutes <= 45 ? 'standard' :
                    minutes <= 60 ? 'extended' : 'long';

    return { minutes, category };
  }

  /**
   * Calculate workout metrics from options
   */
  static calculateWorkoutMetrics(options: PerWorkoutOptions): {
    intensity: string;
    complexity: string;
    equipment: string[];
  } {
    // Calculate intensity based on energy and focus
    const energyLevel = this.transformEnergyLevel(options.customization_energy || 7);
    const focus = this.transformWorkoutFocus(options.customization_focus || 'general');
    
    const intensity = energyLevel.rating <= 4 ? 'light' :
                     energyLevel.rating <= 7 ? 'moderate' : 'intense';

    // Calculate complexity based on equipment and focus
    const equipment = (options.customization_equipment || [])
      .map(item => item.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    const complexity = equipment.length <= 2 ? 'simple' :
                      equipment.length <= 4 ? 'moderate' : 'complex';

    return {
      intensity,
      complexity,
      equipment
    };
  }
}

/**
 * Transform data for internal prompt system
 */
export class InternalPromptTransformer {
  /**
   * Transform profile and workout data into standardized format
   */
  static transformData(profileData: ProfileData, workoutData: PerWorkoutOptions) {
    try {
      // Transform profile data
      const fitnessMetrics = ProfileDataTransformer.calculateFitnessMetrics(profileData);
      const workoutMetrics = WorkoutDataTransformer.calculateWorkoutMetrics(workoutData);

      const transformedData = {
        profile: {
          experience: ProfileDataTransformer.transformExperienceLevel(profileData.experienceLevel),
          activity: ProfileDataTransformer.transformPhysicalActivity(profileData.physicalActivity),
          fitnessLevel: fitnessMetrics.fitnessLevel,
          intensity: fitnessMetrics.intensity,
          activityLevel: fitnessMetrics.activityLevel,
          preferredActivities: ProfileDataTransformer.transformPreferredActivities(profileData.preferredActivities),
          equipment: ProfileDataTransformer.transformEquipment(profileData.availableEquipment),
          locations: ProfileDataTransformer.transformLocations(profileData.availableLocations),
          injuries: ProfileDataTransformer.transformInjuries(profileData.injuries)
        },
        workout: {
          focus: WorkoutDataTransformer.transformWorkoutFocus(workoutData.customization_focus),
          energy: WorkoutDataTransformer.transformEnergyLevel(workoutData.customization_energy),
          duration: WorkoutDataTransformer.transformDuration(workoutData.customization_duration),
          soreness: WorkoutDataTransformer.transformSoreness(workoutData.customization_soreness),
          intensity: workoutMetrics.intensity,
          complexity: workoutMetrics.complexity,
          equipment: workoutMetrics.equipment
        }
      };

      aiLogger.debug('InternalPromptTransformer - Data transformed successfully', {
        hasProfileData: !!transformedData.profile,
        hasWorkoutData: !!transformedData.workout,
        fitnessLevel: transformedData.profile.fitnessLevel,
        workoutFocus: transformedData.workout.focus
      });

      return transformedData;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'data transformation',
        component: 'InternalPromptTransformer',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }
}