import { 
  WorkoutGenerationRequest,
  WorkoutPreferences,
  WorkoutConstraints,
  EnvironmentalFactors
} from '../../../types/workout-generation.types';
import { UserProfile } from '../../../types/user';
import { PerWorkoutOptions } from '../../../types/core';
import { WORKOUT_GENERATION_CONSTANTS } from '../external/constants/workout-generation-constants';
import { ProfileData } from '../../../components/Profile/types/profile.types';

export class WorkoutRequestFactory {
  /**
   * Create a workout generation request with default values
   */
  static createRequest(params: {
    workoutType: 'quick' | 'detailed';
    userProfile: UserProfile;
    workoutFocusData: PerWorkoutOptions;
  }): WorkoutGenerationRequest {
    const { workoutType, userProfile, workoutFocusData } = params;

    // Create a minimal ProfileData from UserProfile
    const profileData: ProfileData = {
      experienceLevel: this.mapFitnessToExperience(userProfile.fitnessLevel),
      physicalActivity: 'moderate',
      preferredDuration: '30-45 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      preferredActivities: [],
      availableLocations: ['Home'],
      availableEquipment: ['Body Weight'],
      primaryGoal: this.mapGoalToProfileGoal(userProfile.goals[0]),
      goalTimeline: '3 months',
      age: '26-35',
      height: '5\'8"',
      weight: '150',
      gender: userProfile.gender || 'prefer-not-to-say',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };

    return {
      workoutType,
      userProfile,
      workoutFocusData,
      profileData,
      preferences: this.createDefaultPreferences(workoutFocusData),
      constraints: this.createDefaultConstraints(workoutFocusData),
      environmentalFactors: this.createDefaultEnvironmentalFactors()
    };
  }

  /**
   * Create default preferences from workout focus data
   */
  private static createDefaultPreferences(workoutFocusData: PerWorkoutOptions): WorkoutPreferences {
    return {
      duration: typeof workoutFocusData.customization_duration === 'number' 
        ? workoutFocusData.customization_duration 
        : workoutFocusData.customization_duration?.duration ?? WORKOUT_GENERATION_CONSTANTS.DEFAULT_WORKOUT_DURATION,
      focus: typeof workoutFocusData.customization_focus === 'string'
        ? workoutFocusData.customization_focus
        : workoutFocusData.customization_focus?.focus ?? WORKOUT_GENERATION_CONSTANTS.DEFAULT_FOCUS,
      intensity: 'moderate',
      equipment: Array.isArray(workoutFocusData.customization_equipment)
        ? [...workoutFocusData.customization_equipment]
        : [...WORKOUT_GENERATION_CONSTANTS.DEFAULT_EQUIPMENT],
      location: (workoutFocusData.customization_location || 'home') as 'home' | 'gym' | 'outdoor'
    };
  }

  /**
   * Create default constraints from workout focus data
   */
  private static createDefaultConstraints(workoutFocusData: PerWorkoutOptions): WorkoutConstraints {
    return {
      maxDuration: typeof workoutFocusData.customization_duration === 'number'
        ? workoutFocusData.customization_duration + 5
        : workoutFocusData.customization_duration?.duration ? workoutFocusData.customization_duration.duration + 5 : undefined,
      minDuration: typeof workoutFocusData.customization_duration === 'number'
        ? workoutFocusData.customization_duration - 5
        : workoutFocusData.customization_duration?.duration ? workoutFocusData.customization_duration.duration - 5 : undefined,
      intensityLimit: workoutFocusData.customization_intensity as 'low' | 'moderate' | 'high' | undefined
    };
  }

  /**
   * Create default environmental factors
   */
  private static createDefaultEnvironmentalFactors(): EnvironmentalFactors {
    return {
      location: 'indoor',
      timeOfDay: 'morning'
    };
  }

  /**
   * Map fitness level to experience level
   */
  private static mapFitnessToExperience(fitnessLevel: string): 'New to Exercise' | 'Some Experience' | 'Advanced Athlete' {
    switch (fitnessLevel) {
      case 'beginner':
        return 'New to Exercise';
      case 'novice':
      case 'intermediate':
        return 'Some Experience';
      case 'advanced':
      case 'adaptive':
        return 'Advanced Athlete';
      default:
        return 'New to Exercise';
    }
  }

  /**
   * Map user goal to profile goal
   */
  private static mapGoalToProfileGoal(goal: string | undefined): ProfileData['primaryGoal'] {
    switch (goal?.toLowerCase()) {
      case 'weight loss':
        return 'Weight Loss';
      case 'strength':
        return 'Strength';
      case 'cardio':
      case 'cardiovascular':
        return 'Cardio Health';
      case 'flexibility':
      case 'mobility':
        return 'Flexibility & Mobility';
      case 'muscle gain':
      case 'muscle building':
        return 'Muscle Gain';
      case 'athletic performance':
      case 'performance':
        return 'Athletic Performance';
      case 'energy':
      case 'energy levels':
        return 'Energy Levels';
      case 'toning':
      case 'body toning':
        return 'Body Toning';
      case 'sleep':
      case 'sleep quality':
        return 'Sleep Quality';
      case 'stress':
      case 'stress reduction':
        return 'Stress Reduction';
      case 'functional':
      case 'functional fitness':
        return 'Functional Fitness';
      default:
        return 'General Health';
    }
  }
} 