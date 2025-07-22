import { WorkoutGenerationRequest, WorkoutPreferences, WorkoutConstraints, EnvironmentalFactors } from '../../../types/workout-generation.types';
import { WorkoutType, PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { UserProfile } from '../../../types/user';
import { ProfileData } from '../../../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../../../components/LiabilityWaiver/types/liability-waiver.types';
import { WorkoutRequestValidator } from '../validation/core/WorkoutRequestValidator';
import { dataTransformers } from '../../../utils/dataTransformers';

/**
 * WorkoutRequestFactory - Single source of truth for creating workout requests
 * Consolidates request creation patterns and ensures validation
 */
export class WorkoutRequestFactory {
  /**
   * Create a workout request with built-in validation
   */
  static createRequest(params: CreateWorkoutRequestParams): WorkoutGenerationRequest {
    // Determine request type if not specified
    const workoutType = params.workoutType ?? this.inferWorkoutType(params);
    
    // Create base request structure
    const request: WorkoutGenerationRequest = {
      workoutType,
      profileData: params.profileData,
      workoutFocusData: params.workoutFocusData,
      userProfile: params.userProfile,
      waiverData: params.waiverData,
      preferences: this.createPreferences(params),
      constraints: this.createConstraints(params),
      environmentalFactors: this.createEnvironmentalFactors(params)
    };

    // Validate immediately
    const validation = WorkoutRequestValidator.validate(request);
    if (!validation.isValid) {
      throw new WorkoutRequestError(
        `Invalid request parameters: ${validation.errors.join(', ')}`
      );
    }

    return request;
  }

  /**
   * Create request from Quick Workout data (replaces WorkoutRequestConverter)
   */
  static fromQuickWorkout(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): WorkoutGenerationRequest {
    return this.createRequest({
      workoutType: 'quick',
      profileData: {} as ProfileData, // Will be enhanced by AI service
      workoutFocusData: quickWorkoutData,
      userProfile
    });
  }

  /**
   * Create request from app components (replaces WorkoutRequestAdapter.createBasicRequest)
   */
  static fromAppComponents(
    workoutType: WorkoutType,
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions,
    userProfile: UserProfile,
    waiverData?: LiabilityWaiverData
  ): WorkoutGenerationRequest {
    return this.createRequest({
      workoutType,
      profileData,
      workoutFocusData,
      userProfile,
      waiverData
    });
  }

  /**
   * Create default enhancements for a request
   */
  static createDefaultEnhancements(
    userProfile: UserProfile,
    workoutFocusData: PerWorkoutOptions
  ): {
    preferences: WorkoutPreferences;
    constraints: WorkoutConstraints;
    environmentalFactors: EnvironmentalFactors;
  } {
    return {
      preferences: {
        duration: dataTransformers.extractDurationValue(workoutFocusData.customization_duration) ?? 30,
        focus: dataTransformers.extractFocusValue(workoutFocusData.customization_focus) ?? 'General Fitness',
        intensity: this.mapEnergyToIntensity(workoutFocusData.customization_energy ?? 5),
        equipment: dataTransformers.extractEquipmentList(workoutFocusData.customization_equipment),
        location: 'home', // Default for now
        music: true,
        voiceGuidance: false
      },
      constraints: {
        timeOfDay: 'morning', // Default for now
        energyLevel: workoutFocusData.customization_energy ?? 5,
        sorenessAreas: dataTransformers.extractSorenessAreas(workoutFocusData.customization_soreness),
        spaceLimitations: ['small_space'], // Common for Quick Workout
        noiselevel: 'moderate'
      },
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    };
  }

  private static inferWorkoutType(params: CreateWorkoutRequestParams): WorkoutType {
    // Infer workout type from duration and other characteristics
    const duration = params.workoutFocusData?.customization_duration;
    if (duration && Number(duration) <= 30) {
      return 'quick';
    }
    return 'detailed';
  }

  private static createPreferences(params: CreateWorkoutRequestParams): WorkoutPreferences {
    const { workoutFocusData } = params;
    return {
      duration: dataTransformers.extractDurationValue(workoutFocusData.customization_duration) ?? 30,
      focus: dataTransformers.extractFocusValue(workoutFocusData.customization_focus) ?? 'General Fitness',
      intensity: this.mapEnergyToIntensity(workoutFocusData.customization_energy ?? 5),
      equipment: dataTransformers.extractEquipmentList(workoutFocusData.customization_equipment),
      location: 'home', // Default for now
      music: true,
      voiceGuidance: false
    };
  }

  private static createConstraints(params: CreateWorkoutRequestParams): WorkoutConstraints {
    const { workoutFocusData } = params;
    return {
      timeOfDay: 'morning', // Default for now
      energyLevel: workoutFocusData.customization_energy ?? 5,
      sorenessAreas: dataTransformers.extractSorenessAreas(workoutFocusData.customization_soreness),
      spaceLimitations: ['small_space'], // Common for Quick Workout
      noiselevel: 'moderate'
    };
  }

  private static createEnvironmentalFactors(_params: CreateWorkoutRequestParams): EnvironmentalFactors {
    return {
      weather: 'indoor',
      temperature: 20,
      airQuality: 'good'
    };
  }

  private static mapEnergyToIntensity(energy: number): 'low' | 'moderate' | 'high' {
    if (energy <= 3) return 'low';
    if (energy <= 7) return 'moderate';
    return 'high';
  }
}

// Supporting types
interface CreateWorkoutRequestParams {
  workoutType?: WorkoutType;
  profileData: ProfileData;
  workoutFocusData: PerWorkoutOptions;
  userProfile: UserProfile;
  waiverData?: LiabilityWaiverData;
}

class WorkoutRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutRequestError';
  }
} 