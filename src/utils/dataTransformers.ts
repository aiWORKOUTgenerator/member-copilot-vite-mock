// Data Transformation Utilities for PerWorkoutOptions
import { 
  PerWorkoutOptions, 
  CategoryRatingData, 
  DurationConfigurationData, 
  WorkoutFocusConfigurationData, 
  EquipmentSelectionData,
  HierarchicalSelectionData
} from '../types/enhanced-workout-types';
import { ProfileData } from '../components/Profile/types/profile.types';
import { UserProfile, FitnessLevel } from '../types/user';
import { 
  isValidProfileData, 
  isValidUserProfile, 
  validateProfileConversion 
} from '../types/guards';

/**
 * Data transformation utilities for converting between different PerWorkoutOptions formats
 * This ensures type safety and proper handling of union types
 */

export const dataTransformers = {
  /**
   * Extract soreness areas from CategoryRatingData or string array
   */
  extractSorenessAreas: (data: string[] | CategoryRatingData | undefined): string[] => {
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
   * Extract duration value from number or DurationConfigurationData
   */
  extractDurationValue: (data: number | DurationConfigurationData | undefined): number => {
    if (!data) return 0;
    
    if (typeof data === 'number') {
      return data;
    }
    
    // Handle DurationConfigurationData format
    if (typeof data === 'object' && data !== null && 'totalDuration' in data) {
      return data.totalDuration || 0;
    }
    
    return 0;
  },

  /**
   * Extract focus value from string or WorkoutFocusConfigurationData
   */
  extractFocusValue: (data: string | WorkoutFocusConfigurationData | undefined): string => {
    if (!data) return '';
    
    if (typeof data === 'string') {
      return data;
    }
    
    // Handle WorkoutFocusConfigurationData format
    if (typeof data === 'object' && data !== null && 'focus' in data) {
      return data.focus || '';
    }
    
    return '';
  },

  /**
   * Extract equipment list from string array or EquipmentSelectionData
   */
  extractEquipmentList: (data: string[] | EquipmentSelectionData | undefined): string[] => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle EquipmentSelectionData format
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
   * Extract areas list from string array or HierarchicalSelectionData
   */
  extractAreasList: (data: string[] | HierarchicalSelectionData | undefined): string[] => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle HierarchicalSelectionData format
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
   * Normalize PerWorkoutOptions to ensure consistent format
   */
  normalizePerWorkoutOptions: (options: Partial<PerWorkoutOptions>): PerWorkoutOptions => {
    return {
      customization_energy: typeof options.customization_energy === 'number' ? options.customization_energy : 3,
      customization_soreness: dataTransformers.extractSorenessAreas(options.customization_soreness) as any,
      customization_focus: dataTransformers.extractFocusValue(options.customization_focus),
      customization_duration: dataTransformers.extractDurationValue(options.customization_duration),
      customization_equipment: dataTransformers.extractEquipmentList(options.customization_equipment),
      customization_areas: dataTransformers.extractAreasList(options.customization_areas)
    };
  },

  /**
   * Validate data structure and return safe defaults if invalid
   */
  validateAndTransform: {
    soreness: (data: any): string[] => {
      try {
        return dataTransformers.extractSorenessAreas(data);
      } catch (error) {
        console.warn('Invalid soreness data format:', data);
        return [];
      }
    },

    duration: (data: any): number => {
      try {
        const result = dataTransformers.extractDurationValue(data);
        return result || 30; // Return 30 if result is 0 or undefined
      } catch (error) {
        console.warn('Invalid duration data format:', data);
        return 30; // Default 30 minutes
      }
    },

    focus: (data: any): string => {
      try {
        return dataTransformers.extractFocusValue(data);
      } catch (error) {
        console.warn('Invalid focus data format:', data);
        return 'strength'; // Default focus
      }
    },

    equipment: (data: any): string[] => {
      try {
        return dataTransformers.extractEquipmentList(data);
      } catch (error) {
        console.warn('Invalid equipment data format:', data);
        return [];
      }
    },

    areas: (data: any): string[] => {
      try {
        return dataTransformers.extractAreasList(data);
      } catch (error) {
        console.warn('Invalid areas data format:', data);
        return [];
      }
    }
  },

  /**
   * Check if data has valid structure for specific type
   */
  isValidFormat: {
    soreness: (data: any): data is string[] | CategoryRatingData => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return Object.values(data).some(value => 
          typeof value === 'object' && value !== null && 'selected' in value
        );
      }
      return false;
    },

    duration: (data: any): data is number | DurationConfigurationData => {
      if (!data) return false;
      if (typeof data === 'number') return true;
      if (typeof data === 'object' && data !== null) {
        return 'totalDuration' in data && typeof data.totalDuration === 'number';
      }
      return false;
    },

    focus: (data: any): data is string | WorkoutFocusConfigurationData => {
      if (!data) return false;
      if (typeof data === 'string') return true;
      if (typeof data === 'object' && data !== null) {
        return 'focus' in data && typeof data.focus === 'string';
      }
      return false;
    },

    equipment: (data: any): data is string[] | EquipmentSelectionData => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return ('specificEquipment' in data && Array.isArray(data.specificEquipment)) ||
               ('equipment' in data && Array.isArray(data.equipment));
      }
      return false;
    },

    areas: (data: any): data is string[] | HierarchicalSelectionData => {
      if (!data) return false;
      if (Array.isArray(data)) return true;
      if (typeof data === 'object' && data !== null) {
        return ('selectedAreas' in data && Array.isArray(data.selectedAreas)) ||
               ('areas' in data && Array.isArray(data.areas));
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
   * Convert ProfileData to UserProfile with comprehensive validation
   */
  convertProfileToUserProfile: (profileData: ProfileData): UserProfile => {
    try {
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

      // For workout generation, we only need the essential fields
      // Skip the full ProfileData validation since we're only using a subset

      // Convert core data with defensive programming
      // Use calculated fitness level if available, otherwise fall back to conversion from experience level
      const fitnessLevel = profileData.calculatedFitnessLevel || profileTransformers.convertExperienceToFitnessLevel(profileData.experienceLevel);
      const primaryGoal = profileTransformers.convertPrimaryGoal(profileData.primaryGoal);
      const workoutStyle = profileTransformers.convertGoalToWorkoutStyle(profileData.primaryGoal);
      const intensityPreference = profileData.calculatedWorkoutIntensity;
      const timeConstraints = profileTransformers.convertDurationToTimeConstraints(profileData.preferredDuration || '30-45 min');
      const equipmentConstraints = profileTransformers.convertEquipmentToNormalized(profileData.availableEquipment || []);
      const locationConstraints = profileTransformers.convertLocationsToNormalized(profileData.availableLocations || []);
      const injuries = profileTransformers.convertInjuriesToFiltered(profileData.injuries || []);

      // Calculate duration range
      const durationParts = profileData.preferredDuration?.split('-') || ['30', '60'];
      const minDuration = parseInt(durationParts[0]) || 30;
      const maxDuration = parseInt(durationParts[1]) || 60;

      // Convert optional personal metrics
      let age: number | undefined;
      if (profileData.age) {
        const ageRange = profileData.age.split('-');
        if (ageRange.length === 2) {
          age = Math.floor((parseInt(ageRange[0]) + parseInt(ageRange[1])) / 2);
        } else if (ageRange[0] === '65+') {
          age = 70; // Default for 65+
        }
      }

      // Convert height and weight to numbers if present
      let height: number | undefined;
      let weight: number | undefined;
      
      if (profileData.height) {
        // Handle both imperial and metric formats
        const heightStr = profileData.height.toLowerCase();
        if (heightStr.includes("'") && heightStr.includes('"')) {
          // Imperial format: 5'8" -> convert to cm
          const match = heightStr.match(/(\d+)'(\d+)"/);
          if (match) {
            const feet = parseInt(match[1]);
            const inches = parseInt(match[2]);
            height = Math.round((feet * 12 + inches) * 2.54);
          }
        } else if (heightStr.includes('cm')) {
          // Metric format: 173cm
          const match = heightStr.match(/(\d+)cm/);
          if (match) {
            height = parseInt(match[1]);
          }
        }
      }

      if (profileData.weight) {
        // Handle both imperial and metric formats
        const weightStr = profileData.weight.toLowerCase();
        if (weightStr.includes('lbs') || weightStr.includes('lb')) {
          // Imperial format: 150 lbs -> convert to kg
          const match = weightStr.match(/(\d+)\s*lbs?/);
          if (match) {
            weight = Math.round(parseInt(match[1]) * 0.453592);
          }
        } else if (weightStr.includes('kg')) {
          // Metric format: 68 kg
          const match = weightStr.match(/(\d+)\s*kg/);
          if (match) {
            weight = parseInt(match[1]);
          }
        }
      }

      const userProfile: UserProfile = {
        fitnessLevel,
        goals: [primaryGoal],
        preferences: {
          workoutStyle: workoutStyle || ['balanced'],
          timePreference: 'morning', // Default, could be enhanced
          intensityPreference: intensityPreference || 'moderate',
          advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries,
          availableEquipment: equipmentConstraints,
          availableLocations: locationConstraints
        },
        enhancedLimitations: {
          timeConstraints,
          equipmentConstraints,
          locationConstraints,
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
          averageDuration: minDuration,
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
        age,
        height,
        weight,
        gender: profileData.gender
      };

      console.log('✅ ProfileData successfully converted to UserProfile:', {
        fitnessLevel: userProfile.fitnessLevel,
        goals: userProfile.goals,
        workoutStyle: userProfile.preferences.workoutStyle,
        intensityPreference: userProfile.preferences.intensityPreference
      });

      return userProfile;

    } catch (error) {
      console.error('❌ Error converting ProfileData to UserProfile:', error);
      console.error('ProfileData:', profileData);
      throw new Error(`Failed to convert ProfileData to UserProfile: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // Simple conversion function for MVP - no caching complexity
  convertProfileToUserProfileSimple: (profileData: ProfileData): UserProfile => {
    return profileTransformers.convertProfileToUserProfile(profileData);
  },

  /**
   * Create a safe fallback UserProfile when conversion fails
   */
  createFallbackUserProfile: (): UserProfile => {
    return {
      fitnessLevel: 'intermediate',
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
        availableEquipment: ['body_weight'],
        availableLocations: ['home']
      },
      enhancedLimitations: {
        timeConstraints: 60,
        equipmentConstraints: ['body_weight'],
        locationConstraints: [],
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
        averageDuration: 45,
        preferredFocusAreas: [],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.7,
        consistencyScore: 0.5,
        plateauRisk: 'low'
      },
      learningProfile: {
        prefersSimplicity: true,
        explorationTendency: 'moderate',
        feedbackPreference: 'detailed',
        learningStyle: 'visual',
        motivationType: 'intrinsic',
        adaptationSpeed: 'moderate'
      }
    };
  }
};

/**
 * Legacy compatibility functions for backward compatibility
 */
export const legacyTransformers = {
  /**
   * Convert old format to new format (for migration)
   */
  convertLegacyFormat: (legacyData: any): Partial<PerWorkoutOptions> => {
    const converted: Partial<PerWorkoutOptions> = {};
    
    // Handle legacy energy format
    if (legacyData.energy !== undefined) {
      converted.customization_energy = typeof legacyData.energy === 'number' ? legacyData.energy : 3;
    }
    
    // Handle legacy soreness format
    if (legacyData.soreness !== undefined) {
      if (Array.isArray(legacyData.soreness)) {
        converted.customization_soreness = legacyData.soreness as any;
      } else if (typeof legacyData.soreness === 'object') {
        // Convert object format to array
        converted.customization_soreness = Object.keys(legacyData.soreness).filter(
          key => legacyData.soreness[key] === true
        ) as any;
      }
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
  convertToLegacyFormat: (newData: PerWorkoutOptions): any => {
    return {
      energy: newData.customization_energy,
      soreness: newData.customization_soreness,
      focus: newData.customization_focus,
      duration: newData.customization_duration,
      equipment: newData.customization_equipment,
      areas: newData.customization_areas
    };
  }
};

export default dataTransformers; 