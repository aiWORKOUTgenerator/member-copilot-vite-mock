// Data Transformation Utilities for PerWorkoutOptions
import {
  PerWorkoutOptions,
  CategoryRatingData,
  DurationConfigurationData,
  WorkoutFocusConfigurationData,
  OptionDefinition,
  TrainingLoadData
} from '../types/core';
import { ProfileData } from '../components/Profile/types/profile.types';
import { UserProfile, FitnessLevel } from '../types/user';

// Type definitions for data transformation
export type SorenessData = string[] | CategoryRatingData | undefined;
export type DurationData = number | DurationConfigurationData | undefined;
export type FocusData = string | WorkoutFocusConfigurationData | undefined;
export type EquipmentData = string[] | OptionDefinition | undefined;
export type AreasData = string[] | OptionDefinition | undefined;
export type TrainingLoadDataInput = TrainingLoadData | undefined;

export interface LegacyDataFormat {
  energy?: number;
  soreness?: string[] | Record<string, { selected: boolean; rating: number }>;
  focus?: string;
  duration?: number;
  equipment?: string[];
  areas?: string[];
  trainingLoad?: {
    activities?: Array<{ type: string; intensity: string; duration: number; date: string }>;
    volume?: number;
    intensity?: string;
  };
  [key: string]: unknown;
}

export interface LegacyOutputFormat {
  energy: number;
  soreness: string[];
  focus: string;
  duration: number;
  equipment: string[];
  areas: string[];
  trainingLoad: {
    recentActivities: Array<{ type: string; intensity: string; duration: number; date: string }>;
    weeklyVolume: number;
    averageIntensity: string;
  };
  [key: string]: unknown;
}

/**
 * Data transformation utilities for converting between different PerWorkoutOptions formats
 * This ensures type safety and proper handling of union types
 */

export const dataTransformers = {
  /**
   * Extract soreness areas from CategoryRatingData or string array
   */
  extractSorenessAreas: (data: SorenessData): string[] => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    // Handle CategoryRatingData format
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .filter(([_, config]) => config && typeof config === 'object' && config.selected === true)
        .map(([area]) => area);
    }

    return [];
  },

  /**
   * Extract injury regions from CategoryRatingData
   */
  extractInjuryRegions: (data: CategoryRatingData | undefined): string[] => {
    if (!data || !data.categories) return [];
    
    // Filter out pain categories and 'no_injuries', return only body regions
    return data.categories.filter(cat => 
      !cat.startsWith('pain_') && cat !== 'no_injuries'
    );
  },

  /**
   * Extract training load metrics from TrainingLoadData
   */
  extractTrainingLoadMetrics: (data: TrainingLoadData | undefined): {
    weeklyVolume: number;
    averageIntensity: 'light' | 'moderate' | 'intense';
    activityCount: number;
  } => {
    if (!data) {
      return {
        weeklyVolume: 0,
        averageIntensity: 'moderate',
        activityCount: 0
      };
    }

    return {
      weeklyVolume: data.weeklyVolume || 0,
      averageIntensity: data.averageIntensity || 'moderate',
      activityCount: data.recentActivities?.length || 0
    };
  },

  /**
   * Extract duration value from number or DurationConfigurationData
   */
  extractDurationValue: (data: DurationData): number => {
    if (!data) return 0;

    if (typeof data === 'number') {
      return data;
    }

    // Handle DurationConfigurationData format
    if (typeof data === 'object' && data !== null && 'duration' in data) {
      return (data as DurationConfigurationData).duration || 0;
    }

    return 0;
  },

  /**
   * Extract focus value from string or WorkoutFocusConfigurationData
   */
  extractFocusValue: (data: FocusData): string => {
    if (!data) return 'strength';

    if (typeof data === 'string') {
      return data;
    }

    // Handle WorkoutFocusConfigurationData format
    if (typeof data === 'object' && data !== null && 'focus' in data) {
      return data.focus || 'strength';
    }

    return 'strength';
  },

  /**
   * Extract equipment list from string array or OptionDefinition
   */
  extractEquipmentList: (data: EquipmentData): string[] => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    // Handle OptionDefinition format
    if (typeof data === 'object' && data !== null) {
      if ('specificEquipment' in data && Array.isArray(data.specificEquipment)) {
        return data.specificEquipment;
      }
      if ('equipment' in data && Array.isArray(data.equipment)) {
        return data.equipment;
      }
    }

    return [];
  },

  /**
   * Extract areas list from string array or OptionDefinition
   */
  extractAreasList: (data: AreasData): string[] => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    // Handle OptionDefinition format
    if (typeof data === 'object' && data !== null) {
      if ('selectedAreas' in data && Array.isArray(data.selectedAreas)) {
        return data.selectedAreas;
      }
      if ('areas' in data && Array.isArray(data.areas)) {
        return data.areas;
      }
    }

    return [];
  },

  /**
   * Normalize PerWorkoutOptions to ensure consistent structure
   */
  normalizePerWorkoutOptions: (options: Partial<PerWorkoutOptions>): PerWorkoutOptions => {
    const areas = dataTransformers.extractAreasList(options.customization_areas);
    
    // Convert primitive energy to CategoryRatingData format
    const energyData: CategoryRatingData = typeof options.customization_energy === 'number' 
      ? { rating: options.customization_energy, categories: [] }
      : options.customization_energy || { rating: 3, categories: [] };
    
    // Convert primitive soreness to CategoryRatingData format
    const sorenessAreas = dataTransformers.extractSorenessAreas(options.customization_soreness);
    const sorenessData: CategoryRatingData = {
      rating: sorenessAreas.length > 0 ? 5 : 1,
      categories: sorenessAreas
    };
    
    return {
      customization_energy: energyData,
      customization_soreness: sorenessData,
      customization_focus: dataTransformers.extractFocusValue(options.customization_focus),
      customization_duration: dataTransformers.extractDurationValue(options.customization_duration),
      customization_equipment: dataTransformers.extractEquipmentList(options.customization_equipment),
      customization_areas: areas,
      customization_injury: options.customization_injury,
      customization_trainingLoad: options.customization_trainingLoad
    };
  },

  /**
   * Validate data structure and return safe defaults if invalid
   */
  validateAndTransform: {
    soreness: (data: SorenessData): string[] => {
      try {
        return dataTransformers.extractSorenessAreas(data);
      } catch (error) {
        console.warn('Invalid soreness data format:', data);
        return [];
      }
    },

    duration: (data: DurationData): number => {
      try {
        const result = dataTransformers.extractDurationValue(data);
        return result || 30; // Return 30 if result is 0 or undefined
      } catch (error) {
        console.warn('Invalid duration data format:', data);
        return 30; // Default 30 minutes
      }
    },

    focus: (data: FocusData): string => {
      try {
        return dataTransformers.extractFocusValue(data);
      } catch (error) {
        console.warn('Invalid focus data format:', data);
        return 'strength'; // Default focus
      }
    },

    equipment: (data: EquipmentData): string[] => {
      try {
        return dataTransformers.extractEquipmentList(data);
      } catch (error) {
        console.warn('Invalid equipment data format:', data);
        return [];
      }
    },

    areas: (data: AreasData): string[] => {
      try {
        return dataTransformers.extractAreasList(data);
      } catch (error) {
        console.warn('Invalid areas data format:', data);
        return [];
      }
    },

    trainingLoad: (data: TrainingLoadDataInput): TrainingLoadData => {
      try {
        if (!data) {
          return {
            recentActivities: [],
            weeklyVolume: 0,
            averageIntensity: 'moderate'
          };
        }

        if (typeof data === 'object' && data !== null) {
          return {
            recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [],
            weeklyVolume: typeof data.weeklyVolume === 'number' ? data.weeklyVolume : 0,
            averageIntensity: ['light', 'moderate', 'intense'].includes(data.averageIntensity) 
              ? data.averageIntensity 
              : 'moderate'
          };
        }

        return {
          recentActivities: [],
          weeklyVolume: 0,
          averageIntensity: 'moderate'
        };
      } catch (error) {
        console.warn('Invalid training load data format:', data);
        return {
          recentActivities: [],
          weeklyVolume: 0,
          averageIntensity: 'moderate'
        };
      }
    }
  },

  /**
   * Check if data has valid structure for specific type
   */
  isValidFormat: {
    soreness: (data: SorenessData): data is string[] | CategoryRatingData => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return Object.values(data).some(value =>
          typeof value === 'object' && value !== null && 'selected' in value
        );
      }
      return false;
    },

    duration: (data: DurationData): data is number | DurationConfigurationData => {
      if (!data) return false;
      if (typeof data === 'number') return true;
      if (typeof data === 'object' && data !== null) {
        return 'totalDuration' in data && typeof data.totalDuration === 'number';
      }
      return false;
    },

    focus: (data: FocusData): data is string | WorkoutFocusConfigurationData => {
      if (!data) return false;
      if (typeof data === 'string') return true;
      if (typeof data === 'object' && data !== null) {
        return 'focus' in data && typeof data.focus === 'string';
      }
      return false;
    },

    equipment: (data: EquipmentData): data is string[] | OptionDefinition => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return ('specificEquipment' in data && Array.isArray(data.specificEquipment)) ||
               ('equipment' in data && Array.isArray(data.equipment));
      }
      return false;
    },

    areas: (data: AreasData): data is string[] | OptionDefinition => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return ('selectedAreas' in data && Array.isArray(data.selectedAreas)) ||
               ('areas' in data && Array.isArray(data.areas));
      }
      return false;
    },

    trainingLoad: (data: TrainingLoadDataInput): data is TrainingLoadData => {
      if (!data) return false;
      if (typeof data === 'object' && data !== null) {
        return (
          'recentActivities' in data &&
          'weeklyVolume' in data &&
          'averageIntensity' in data &&
          Array.isArray(data.recentActivities) &&
          typeof data.weeklyVolume === 'number' &&
          ['light', 'moderate', 'intense'].includes(data.averageIntensity)
        );
      }
      return false;
    }
  }
};

// ============================================================================
// PROFILE DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * ProfileData to UserProfile conversion utilities
 */
export const profileTransformers = {
  // Cache for memoized transformations
  _transformCache: new Map<string, UserProfile>(),
  _lastProfileData: null as ProfileData | null,
  _lastUserProfile: null as UserProfile | null,

  // Conversion helpers
  convertAgeToNumber: (age?: string): number | undefined => {
    if (!age) return undefined;
    const ageRange = age.split('-');
    if (ageRange.length === 2) {
      return Math.floor((parseInt(ageRange[0]) + parseInt(ageRange[1])) / 2);
    } else if (ageRange[0] === '65+') {
      return 70; // Default for 65+
    }
    return undefined;
  },

  convertHeightToCm: (height?: string): number | undefined => {
    if (!height) return undefined;
    const heightStr = height.toLowerCase();
    if (heightStr.includes("'") && heightStr.includes('"')) {
      // Imperial format: 5'8" -> convert to cm
      const match = heightStr.match(/(\d+)'(\d+)"/);
      if (match) {
        const feet = parseInt(match[1]);
        const inches = parseInt(match[2]);
        return Math.round((feet * 12 + inches) * 2.54);
      }
    } else if (heightStr.includes('cm')) {
      // Metric format: 173cm
      const match = heightStr.match(/(\d+)cm/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return undefined;
  },

  convertWeightToKg: (weight?: string): number | undefined => {
    if (!weight) return undefined;
    const weightStr = weight.toLowerCase();
    if (weightStr.includes('lbs') || weightStr.includes('lb')) {
      // Imperial format: 150 lbs -> convert to kg
      const match = weightStr.match(/(\d+)\s*lbs?/);
      if (match) {
        return Math.round(parseInt(match[1]) * 0.453592);
      }
    } else if (weightStr.includes('kg')) {
      // Metric format: 68 kg
      const match = weightStr.match(/(\d+)\s*kg/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return undefined;
  },

  /**
   * Convert ProfileData experience level to UserProfile fitness level
   */
  convertExperienceToFitnessLevel: (experienceLevel: ProfileData['experienceLevel']): FitnessLevel => {
    switch (experienceLevel.toLowerCase()) {
      case 'new to exercise':
        return 'beginner';
      case 'some experience':
        return 'intermediate';
      case 'advanced athlete':
        return 'advanced';
      default:
        console.warn(`Unknown experience level: ${experienceLevel}, defaulting to 'intermediate'`);
        return 'intermediate';
    }
  },

  /**
   * Convert ProfileData primary goal to UserProfile goal format
   */
  convertPrimaryGoal: (primaryGoal: ProfileData['primaryGoal']): string => {
    const goal = primaryGoal.toLowerCase();

    // Map specific goals to standardized formats
    if (goal.includes('strength')) return 'strength';
    if (goal.includes('cardio') || goal.includes('endurance')) return 'cardio';
    if (goal.includes('flexibility') || goal.includes('mobility')) return 'flexibility';
    if (goal.includes('weight') || goal.includes('fat')) return 'weight_loss';
    if (goal.includes('muscle') || goal.includes('build')) return 'muscle_gain';
    if (goal.includes('athletic') || goal.includes('performance')) return 'athletic_performance';
    if (goal.includes('energy')) return 'energy_levels';
    if (goal.includes('toning')) return 'body_toning';
    if (goal.includes('sleep')) return 'sleep_quality';
    if (goal.includes('stress')) return 'stress_reduction';
    if (goal.includes('functional')) return 'functional_fitness';
    if (goal.includes('general') || goal.includes('health')) return 'general_fitness';

    console.warn(`Unknown primary goal: ${primaryGoal}, defaulting to 'general_fitness'`);
    return 'general_fitness';
  },

  /**
   * Convert ProfileData primary goal to workout style preferences
   */
  convertGoalToWorkoutStyle: (primaryGoal: ProfileData['primaryGoal']): string[] => {
    const goal = primaryGoal.toLowerCase();

    if (goal.includes('strength')) return ['strength_training'];
    if (goal.includes('cardio') || goal.includes('endurance')) return ['cardio'];
    if (goal.includes('flexibility') || goal.includes('mobility')) return ['flexibility'];
    if (goal.includes('weight') || goal.includes('fat')) return ['strength_training', 'cardio'];
    if (goal.includes('muscle') || goal.includes('build')) return ['strength_training'];
    if (goal.includes('athletic') || goal.includes('performance')) return ['strength_training', 'cardio'];
    if (goal.includes('energy')) return ['cardio', 'strength_training'];
    if (goal.includes('toning')) return ['strength_training', 'cardio'];
    if (goal.includes('sleep')) return ['flexibility', 'cardio'];
    if (goal.includes('stress')) return ['flexibility', 'cardio'];
    if (goal.includes('functional')) return ['functional_training'];
    if (goal.includes('general') || goal.includes('health')) return ['balanced'];

    return ['balanced'];
  },

  /**
   * Convert ProfileData experience level to intensity preference
   */
  convertExperienceToIntensity: (experienceLevel: ProfileData['experienceLevel']): 'low' | 'moderate' | 'high' => {
    switch (experienceLevel.toLowerCase()) {
      case 'new to exercise':
        return 'low';
      case 'some experience':
        return 'moderate';
      case 'advanced athlete':
        return 'high';
      default:
        return 'moderate';
    }
  },

  /**
   * Convert ProfileData duration to time constraints
   */
  convertDurationToTimeConstraints: (preferredDuration: ProfileData['preferredDuration']): number => {
    if (!preferredDuration) {
      return 60; // Default duration
    }
    const durationParts = preferredDuration.split('-');
    const maxDuration = parseInt(durationParts[1]) || 60;
    return maxDuration;
  },

  /**
   * Convert ProfileData equipment to normalized equipment list
   */
  convertEquipmentToNormalized: (availableEquipment: ProfileData['availableEquipment']): string[] => {
    if (!availableEquipment || !availableEquipment.length) {
      return ['body_weight'];
    }

    return availableEquipment.map(eq => {
      const normalized = eq.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      if (!normalized) {
        console.warn(`Failed to normalize equipment: ${eq}`);
        return 'body_weight';
      }

      return normalized;
    });
  },

  /**
   * Convert ProfileData injuries to filtered injury list
   */
  convertInjuriesToFiltered: (injuries: ProfileData['injuries']): string[] => {
    if (!injuries || !injuries.length) {
      return [];
    }

    return injuries.filter(injury => injury !== 'No Injuries');
  },

  /**
   * Convert ProfileData locations to normalized location list
   */
  convertLocationsToNormalized: (availableLocations: ProfileData['availableLocations']): string[] => {
    if (!availableLocations || !availableLocations.length) {
      return ['home'];
    }

    return availableLocations.map(location => {
      const normalized = location.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      if (!normalized) {
        console.warn(`Failed to normalize location: ${location}`);
        return 'home';
      }

      return normalized;
    });
  },

  /**
   * Convert ProfileData to UserProfile with comprehensive validation and memoization
   */
  convertProfileToUserProfile: (profileData: ProfileData): UserProfile => {
    try {
      // Quick return if same object reference
      if (profileData === profileTransformers._lastProfileData) {
        return profileTransformers._lastUserProfile!;
      }

      // Generate cache key from essential fields
      const cacheKey = JSON.stringify({
        experienceLevel: profileData.experienceLevel,
        primaryGoal: profileData.primaryGoal,
        availableEquipment: profileData.availableEquipment,
        preferredDuration: profileData.preferredDuration,
        injuries: profileData.injuries
      });

      // Check cache
      const cached = profileTransformers._transformCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Only log on actual conversion, not cache hits
      console.log('🔄 Converting ProfileData to UserProfile:', {
        experienceLevel: profileData.experienceLevel,
        primaryGoal: profileData.primaryGoal,
        hasEquipment: !!profileData.availableEquipment?.length
      });

      // Check for minimum required fields for meaningful conversion
      if (!profileData.experienceLevel || !profileData.primaryGoal) {
        console.warn('Missing required fields (experienceLevel or primaryGoal), using fallback profile');
        return profileTransformers.createFallbackUserProfile();
      }

      // Convert core data with defensive programming
      const fitnessLevel = profileData.calculatedFitnessLevel || profileTransformers.convertExperienceToFitnessLevel(profileData.experienceLevel);
      const primaryGoal = profileTransformers.convertPrimaryGoal(profileData.primaryGoal);
      const workoutStyle = profileTransformers.convertGoalToWorkoutStyle(profileData.primaryGoal);
      const intensityPreference = profileData.calculatedWorkoutIntensity;
      const timeConstraints = profileTransformers.convertDurationToTimeConstraints(profileData.preferredDuration || '30-45 min');
      const equipmentConstraints = profileTransformers.convertEquipmentToNormalized(profileData.availableEquipment || ['Body Weight']);
      const locationConstraints = profileTransformers.convertLocationsToNormalized(profileData.availableLocations || ['Home']);
      const injuries = profileTransformers.convertInjuriesToFiltered(profileData.injuries || []);

      // Create transformed profile with all required fields
      const userProfile: UserProfile = {
        fitnessLevel,
        goals: [primaryGoal],
        preferences: {
          workoutStyle: workoutStyle || ['balanced'],
          timePreference: 'morning',
          intensityPreference: intensityPreference || 'moderate',
          advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries,
          availableEquipment: equipmentConstraints.length > 0 ? equipmentConstraints : ['bodyweight'],
          availableLocations: locationConstraints.length > 0 ? locationConstraints : ['home']
        },
        enhancedLimitations: {
          timeConstraints,
          equipmentConstraints: equipmentConstraints.length > 0 ? equipmentConstraints : ['bodyweight'],
          locationConstraints: locationConstraints.length > 0 ? locationConstraints : ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: timeConstraints,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: profileData.experienceLevel === 'New to Exercise',
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        },
        // Add optional personal metrics
        age: profileTransformers.convertAgeToNumber(profileData.age),
        height: profileTransformers.convertHeightToCm(profileData.height),
        weight: profileTransformers.convertWeightToKg(profileData.weight),
        gender: profileData.gender
      };

      // Cache the result
      profileTransformers._transformCache.set(cacheKey, userProfile);
      profileTransformers._lastProfileData = profileData;
      profileTransformers._lastUserProfile = userProfile;

      console.log('✅ ProfileData successfully converted to UserProfile');
      return userProfile;
    } catch (error) {
      console.error('❌ Error converting ProfileData to UserProfile:', error);
      return profileTransformers.createFallbackUserProfile();
    }
  },

  // Simple conversion function for MVP - no caching complexity
  convertProfileToUserProfileSimple: (profileData: ProfileData): UserProfile => {
    return profileTransformers.convertProfileToUserProfile(profileData);
  },

  /**
   * Create a safe fallback UserProfile when conversion fails
   */
  createFallbackUserProfile: (): UserProfile => ({
    fitnessLevel: 'beginner',
    goals: ['general_fitness'],
    preferences: {
      workoutStyle: ['balanced'],
      timePreference: 'morning',
      intensityPreference: 'moderate',
      advancedFeatures: false,
      aiAssistanceLevel: 'moderate'
    },
    basicLimitations: {
      injuries: [],
      availableEquipment: ['bodyweight'],
      availableLocations: ['home']
    },
    enhancedLimitations: {
      timeConstraints: 30,
      equipmentConstraints: ['bodyweight'],
      locationConstraints: ['home'],
      recoveryNeeds: {
        restDays: 2,
        sleepHours: 7,
        hydrationLevel: 'moderate'
      },
      mobilityLimitations: [],
      progressionRate: 'moderate'
    },
    workoutHistory: {
      estimatedCompletedWorkouts: 0,
      averageDuration: 30,
      preferredFocusAreas: [],
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.7,
      consistencyScore: 0.5,
      plateauRisk: 'low'
    },
    learningProfile: {
      prefersSimplicity: true,
      explorationTendency: 'moderate',
      feedbackPreference: 'simple',
      learningStyle: 'visual',
      motivationType: 'intrinsic',
      adaptationSpeed: 'moderate'
    }
  }),
};

/**
 * Legacy compatibility functions for backward compatibility
 */
export const legacyTransformers = {
  /**
   * Convert old format to new format (for migration)
   */
  convertLegacyFormat: (legacyData: LegacyDataFormat): Partial<PerWorkoutOptions> => {
    const converted: Partial<PerWorkoutOptions> = {};

    // Handle legacy energy format
    if (legacyData.energy !== undefined) {
      const energyValue = typeof legacyData.energy === 'number' ? legacyData.energy : 3;
      converted.customization_energy = { rating: energyValue, categories: [] };
    }

    // Handle legacy soreness format
    if (legacyData.soreness !== undefined) {
      let sorenessCategories: string[] = [];
      if (Array.isArray(legacyData.soreness)) {
        sorenessCategories = legacyData.soreness;
      } else if (typeof legacyData.soreness === 'object' && legacyData.soreness !== null) {
        // Convert object format to array
        sorenessCategories = Object.keys(legacyData.soreness).filter(
          key => {
            const sorenessObj = legacyData.soreness as Record<string, { selected: boolean; rating: number }>;
            return sorenessObj[key] && sorenessObj[key].selected === true;
          }
        );
      }
      converted.customization_soreness = { 
        rating: sorenessCategories.length > 0 ? 5 : 1, 
        categories: sorenessCategories 
      };
    }

    // Handle legacy focus format
    if (legacyData.focus !== undefined) {
      converted.customization_focus = typeof legacyData.focus === 'string' ? legacyData.focus : 'strength';
    }

    // Handle legacy duration format
    if (legacyData.duration !== undefined) {
      converted.customization_duration = typeof legacyData.duration === 'number' ? legacyData.duration : 30;
    }

    // Handle legacy equipment format
    if (legacyData.equipment !== undefined) {
      converted.customization_equipment = Array.isArray(legacyData.equipment) ? legacyData.equipment : [];
    }

    // Handle legacy areas format
    if (legacyData.areas !== undefined) {
      converted.customization_areas = Array.isArray(legacyData.areas) ? legacyData.areas : [];
    }

    return converted;
  },

  /**
   * Convert new format to legacy format (for backward compatibility)
   */
  convertToLegacyFormat: (newData: PerWorkoutOptions): LegacyOutputFormat => {
    return {
      energy: newData.customization_energy?.rating || 3,
      soreness: newData.customization_soreness?.categories || [],
      focus: dataTransformers.extractFocusValue(newData.customization_focus),
      duration: dataTransformers.extractDurationValue(newData.customization_duration),
      equipment: newData.customization_equipment || [],
      areas: newData.customization_areas || [],
      trainingLoad: {
        recentActivities: newData.customization_trainingLoad?.recentActivities || [],
        weeklyVolume: newData.customization_trainingLoad?.weeklyVolume || 0,
        averageIntensity: newData.customization_trainingLoad?.averageIntensity || 'moderate'
      }
    };
  }
};

export default dataTransformers; 