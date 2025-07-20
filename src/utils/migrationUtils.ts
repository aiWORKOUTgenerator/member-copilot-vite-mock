import { 
  PerWorkoutOptions, 
  DurationConfigurationData, 
  EquipmentSelectionData, 
  WorkoutFocusConfigurationData,
  HierarchicalSelectionData,
  IncludeExercisesData,
  ExcludeExercisesData,
  AIRecommendationContext,
  MigrationUtils
} from '../types/enhanced-workout-types';
import { UserProfile } from '../types/user';
import { ProfileData } from '../components/Profile/types/profile.types';

/**
 * Migrates profile data to the latest version
 * @param data The profile data to migrate
 * @returns The migrated profile data
 */
export function migrateProfileData(data: Partial<ProfileData>): ProfileData {
  const migratedData = { ...data };

  // Ensure all required fields exist with proper defaults
  if (!Array.isArray(migratedData.availableLocations)) {
    migratedData.availableLocations = [];
  }

  // Ensure all array fields are properly initialized
  if (!Array.isArray(migratedData.preferredActivities)) {
    migratedData.preferredActivities = [];
  }
  if (!Array.isArray(migratedData.availableEquipment)) {
    migratedData.availableEquipment = [];
  }
  if (!Array.isArray(migratedData.injuries)) {
    migratedData.injuries = ['No Injuries'];
  }

  // Ensure all string fields have proper defaults
  migratedData.experienceLevel = migratedData.experienceLevel || 'New to Exercise';
  migratedData.physicalActivity = migratedData.physicalActivity || 'sedentary';
  migratedData.preferredDuration = migratedData.preferredDuration || '30-45 min';
  migratedData.timeCommitment = migratedData.timeCommitment || '2-3';
  migratedData.intensityLevel = migratedData.intensityLevel || 'lightly';
  migratedData.primaryGoal = migratedData.primaryGoal || 'General Health';
  migratedData.goalTimeline = migratedData.goalTimeline || '3 months';
  migratedData.age = migratedData.age || '26-35';
  migratedData.height = migratedData.height || '';
  migratedData.weight = migratedData.weight || '';
  migratedData.gender = migratedData.gender || 'prefer-not-to-say';
  migratedData.hasCardiovascularConditions = migratedData.hasCardiovascularConditions || 'No';

  return migratedData as ProfileData;
}

// Migration utilities for progressive enhancement
export const migrationUtils: MigrationUtils = {
  migrateToComplexStructure: (configKey: string, currentValue: any): any => {
    switch (configKey) {
      case 'customization_duration':
        if (typeof currentValue === 'number') {
          return {
            selected: true,
            totalDuration: currentValue,
            label: `${currentValue} min workout`,
            value: currentValue,
            description: `${currentValue} minute workout session`,
            warmUp: {
              included: false,
              duration: Math.min(5, Math.floor(currentValue * 0.1)),
              percentage: 10,
              type: 'dynamic'
            },
            coolDown: {
              included: false,
              duration: Math.min(5, Math.floor(currentValue * 0.1)),
              percentage: 10,
              type: 'static_stretch'
            },
            workingTime: currentValue,
            configuration: 'duration-only',
            validation: {
              isValid: true,
              recommendations: []
            },
            metadata: {
              intensityLevel: currentValue <= 30 ? 'low' : currentValue <= 60 ? 'moderate' : 'high',
              fitnessLevel: currentValue <= 30 ? 'new to exercise' : currentValue <= 60 ? 'some experience' : 'advanced athlete',
              workoutDensity: currentValue / 10 // rough estimate
            }
          } as DurationConfigurationData;
        }
        return currentValue;

      case 'customization_focus':
        if (typeof currentValue === 'string') {
          const focusMetadata = getFocusMetadata(currentValue);
          return {
            selected: true,
            focus: currentValue,
            focusLabel: formatFocusLabel(currentValue),
            label: formatFocusLabel(currentValue),
            value: currentValue,
            description: `${formatFocusLabel(currentValue)} focused workout`,
            configuration: 'focus-only',
            metadata: focusMetadata,
            validation: {
              isValid: true,
              recommendations: []
            }
          } as WorkoutFocusConfigurationData;
        }
        return currentValue;

      case 'customization_equipment':
        if (Array.isArray(currentValue)) {
          return {
            location: inferLocation(currentValue),
            contexts: inferContexts(currentValue),
            specificEquipment: currentValue,
            disclosureLevel: 1,
            lastUpdated: new Date(),
            metadata: {
              spaceRequired: inferSpaceRequired(currentValue),
              userExperience: 'some experience',
              aiRecommendations: []
            },
            userPreferences: {
              budgetRange: 'medium',
              spaceConstraints: []
            }
          } as EquipmentSelectionData;
        }
        return currentValue;

      case 'customization_areas':
        if (Array.isArray(currentValue)) {
          const hierarchicalData: HierarchicalSelectionData = {};
          currentValue.forEach(area => {
            hierarchicalData[area] = {
              selected: true,
              label: area,
              description: `Focus on ${area.toLowerCase()} development`,
              level: 'primary',
              metadata: {
                anatomicalGroup: area.toLowerCase().replace(/\s+/g, '_'),
                difficultyLevel: 'some experience',
                recoveryTime: getRecoveryTime(area),
                synergisticMuscles: getSynergisticMuscles(area),
                aiWeight: 1.0
              },
              selectionContext: {
                reason: 'user_selected',
                confidence: 1.0,
                alternatives: []
              }
            };
          });
          return hierarchicalData;
        }
        return currentValue;

      case 'customization_include':
        if (typeof currentValue === 'string') {
          return {
            customExercises: currentValue,
            libraryExercises: [],
            metadata: {
              primaryMuscleGroups: extractMuscleGroups(currentValue),
              equipmentUsed: extractEquipment(currentValue),
              difficultyLevel: 'some experience',
              estimatedTime: Math.max(5, Math.floor(currentValue.split(',').length * 2))
            }
          } as IncludeExercisesData;
        }
        return currentValue;

      case 'customization_exclude':
        if (typeof currentValue === 'string') {
          return {
            customExercises: currentValue,
            libraryExercises: [],
            metadata: {
              exclusionReasons: ['preference'],
              alternativeSuggestions: [],
              temporaryExclusion: false
            }
          } as ExcludeExercisesData;
        }
        return currentValue;

      default:
        return currentValue;
    }
  },

  migrateToSimpleStructure: (configKey: string, currentValue: any): any => {
    switch (configKey) {
      case 'customization_duration':
        if (typeof currentValue === 'object' && currentValue?.totalDuration) {
          return currentValue.totalDuration;
        }
        return currentValue;

      case 'customization_focus':
        if (typeof currentValue === 'object' && currentValue?.focus) {
          return currentValue.focus;
        }
        return currentValue;

      case 'customization_equipment':
        if (typeof currentValue === 'object' && currentValue?.specificEquipment) {
          return currentValue.specificEquipment;
        }
        return currentValue;

      case 'customization_areas':
        if (typeof currentValue === 'object' && !Array.isArray(currentValue)) {
          return Object.keys(currentValue).filter(key => currentValue[key]?.selected);
        }
        return currentValue;

      case 'customization_include':
        if (typeof currentValue === 'object' && currentValue?.customExercises) {
          return currentValue.customExercises;
        }
        return currentValue;

      case 'customization_exclude':
        if (typeof currentValue === 'object' && currentValue?.customExercises) {
          return currentValue.customExercises;
        }
        return currentValue;

      default:
        return currentValue;
    }
  },

  isComplexObject: (value: any): boolean => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  shouldEnhanceComponent: (
    configKey: string,
    userProfile: UserProfile,
    currentValue: any,
    usageHistory: Record<string, number>
  ) => {
    const analysis = {
      shouldEnhance: false,
      confidence: 0,
      reasons: [] as string[],
      benefits: [] as string[]
    };

    // User expertise analysis
    if (userProfile.fitnessLevel === 'advanced athlete' && !migrationUtils.isComplexObject(currentValue)) {
      analysis.shouldEnhance = true;
      analysis.confidence += 0.3;
      analysis.reasons.push('Advanced users benefit from detailed controls');
      analysis.benefits.push('More precise workout customization');
    }

    // Usage pattern analysis
    const usageCount = usageHistory[configKey] || 0;
    if (usageCount > 5 && !migrationUtils.isComplexObject(currentValue)) {
      analysis.shouldEnhance = true;
      analysis.confidence += 0.2;
      analysis.reasons.push('Frequent usage indicates readiness for advanced features');
      analysis.benefits.push('Unlock advanced customization options');
    }

    // Goal-specific analysis
    if (userProfile.goals.includes('professional') && !migrationUtils.isComplexObject(currentValue)) {
      analysis.shouldEnhance = true;
      analysis.confidence += 0.4;
      analysis.reasons.push('Professional goals require advanced features');
      analysis.benefits.push('Professional-grade workout planning');
    }

    // Preference analysis
    if (userProfile.preferences.advancedFeatures && !migrationUtils.isComplexObject(currentValue)) {
      analysis.shouldEnhance = true;
      analysis.confidence += 0.3;
      analysis.reasons.push('User has enabled advanced features');
      analysis.benefits.push('Access to all customization options');
    }

    // AI assistance level
    if (userProfile.preferences.aiAssistanceLevel === 'comprehensive' && !migrationUtils.isComplexObject(currentValue)) {
      analysis.shouldEnhance = true;
      analysis.confidence += 0.2;
      analysis.reasons.push('High AI assistance works best with detailed data');
      analysis.benefits.push('Enhanced AI recommendations and insights');
    }

    // Component-specific logic
    switch (configKey) {
      case 'customization_duration':
        if (userProfile.workoutHistory?.estimatedCompletedWorkouts && userProfile.workoutHistory.estimatedCompletedWorkouts > 10) {
          analysis.shouldEnhance = true;
          analysis.confidence += 0.1;
          analysis.reasons.push('Experience with workout timing suggests readiness for structure planning');
          analysis.benefits.push('Detailed warm-up and cool-down planning');
        }
        break;

      case 'customization_equipment':
        if (userProfile.preferences.workoutStyle?.includes('strength_training')) {
          analysis.shouldEnhance = true;
          analysis.confidence += 0.2;
          analysis.reasons.push('Strength training benefits from detailed equipment configuration');
          analysis.benefits.push('Precise weight and equipment tracking');
        }
        break;

      case 'customization_areas':
        if (userProfile.basicLimitations?.injuries && userProfile.basicLimitations.injuries.length > 0) {
          analysis.shouldEnhance = true;
          analysis.confidence += 0.3;
          analysis.reasons.push('Injury history requires detailed muscle group analysis');
          analysis.benefits.push('Safer workout planning with injury considerations');
        }
        break;
    }

    analysis.confidence = Math.min(analysis.confidence, 1.0);
    return analysis;
  }
};

// Helper functions for metadata inference
function getFocusMetadata(focus: string) {
  const focusMap: Record<string, any> = {
    'strength': {
      intensity: 'high',
      equipment: 'moderate',
      experience: 'some experience',
      duration_compatibility: [30, 45, 60, 75],
      category: 'strength_power',
      primaryBenefit: 'Build muscle strength and power',
      secondaryBenefits: ['Improved bone density', 'Enhanced metabolism'],
      restRequirements: {
        betweenSets: 60,
        betweenExercises: 120,
        postWorkout: 24
      }
    },
    'endurance': {
      intensity: 'moderate',
      equipment: 'minimal',
      experience: 'new to exercise',
      duration_compatibility: [20, 30, 45, 60],
      category: 'conditioning_cardio',
      primaryBenefit: 'Improve cardiovascular endurance',
      secondaryBenefits: ['Better heart health', 'Increased stamina'],
      restRequirements: {
        betweenSets: 30,
        betweenExercises: 60,
        postWorkout: 12
      }
    },
    'weight_loss': {
      intensity: 'variable',
      equipment: 'minimal',
      experience: 'new to exercise',
      duration_compatibility: [30, 45, 60],
      category: 'conditioning_cardio',
      primaryBenefit: 'Burn calories for weight loss',
      secondaryBenefits: ['Improved fitness', 'Better body composition'],
      restRequirements: {
        betweenSets: 45,
        betweenExercises: 90,
        postWorkout: 18
      }
    },
    'flexibility': {
      intensity: 'low',
      equipment: 'minimal',
      experience: 'new to exercise',
      duration_compatibility: [15, 20, 30, 45],
      category: 'functional_recovery',
      primaryBenefit: 'Improve range of motion',
      secondaryBenefits: ['Reduced injury risk', 'Better posture'],
      restRequirements: {
        betweenSets: 10,
        betweenExercises: 30,
        postWorkout: 6
      }
    }
  };

  return focusMap[focus] || focusMap['strength'];
}

function formatFocusLabel(focus: string): string {
  const labelMap: Record<string, string> = {
    'strength': 'Strength Training',
    'endurance': 'Endurance Training',
    'weight_loss': 'Weight Loss',
    'flexibility': 'Flexibility & Mobility',
    'power': 'Power & Explosiveness',
    'recovery': 'Recovery & Wellness'
  };

  return labelMap[focus] || focus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function inferLocation(equipment: string[]): string {
  if (equipment.includes('Full Gym') || equipment.includes('Barbells & Weight Plates')) {
    return 'gym';
  }
  if (equipment.includes('Body Weight')) {
    return 'outdoor';
  }
  return 'home';
}

function inferSpaceRequired(equipment: string[]): string {
  if (equipment.includes('Full Gym')) return 'large';
  if (equipment.includes('Dumbbells') || equipment.includes('Kettlebells')) return 'medium';
  return 'small';
}

function inferContexts(equipment: string[]): string[] {
  const contexts: string[] = [];
  
  const strengthEquipment = ['barbells & weight plates', 'dumbbells', 'kettlebells', 'resistance_bands'];
  const cardioEquipment = ['treadmill', 'bike', 'rowing_machine'];
  const functionalEquipment = ['medicine_ball', 'suspension_trainer', 'stability_ball'];
  
  if (equipment.some(eq => strengthEquipment.includes(eq))) {
    contexts.push('strength');
  }
  if (equipment.some(eq => cardioEquipment.includes(eq))) {
    contexts.push('cardio');
  }
  if (equipment.some(eq => functionalEquipment.includes(eq))) {
    contexts.push('functional');
  }
  if (equipment.includes('body weight')) {
    contexts.push('body weight');
  }
  
  return contexts.length > 0 ? contexts : ['general'];
}

function getRecoveryTime(area: string): number {
  const recoveryMap: Record<string, number> = {
    'Upper Body': 48,
    'Lower Body': 72,
    'Core': 24,
    'Full Body': 48,
    'Cardio': 24,
    'Functional': 24
  };
  
  return recoveryMap[area] || 48;
}

function getSynergisticMuscles(area: string): string[] {
  const synergyMap: Record<string, string[]> = {
    'Upper Body': ['chest', 'shoulders', 'triceps', 'back', 'biceps'],
    'Lower Body': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    'Core': ['abs', 'obliques', 'lower_back', 'hip_flexors'],
    'Full Body': ['all_major_groups'],
    'Cardio': ['heart', 'lungs', 'circulatory_system'],
    'Functional': ['stabilizers', 'core', 'proprioceptors']
  };
  
  return synergyMap[area] || [];
}

function extractMuscleGroups(exercises: string): string[] {
  const exerciseText = exercises.toLowerCase();
  const muscleGroups: string[] = [];
  
  const muscleMap: Record<string, string[]> = {
    'chest': ['push', 'press', 'fly', 'dip'],
    'back': ['pull', 'row', 'lat', 'chin'],
    'shoulders': ['shoulder', 'press', 'raise', 'shrug'],
    'arms': ['curl', 'tricep', 'bicep', 'arm'],
    'legs': ['squat', 'lunge', 'leg', 'calf'],
    'core': ['plank', 'crunch', 'abs', 'core']
  };
  
  Object.entries(muscleMap).forEach(([muscle, keywords]) => {
    if (keywords.some(keyword => exerciseText.includes(keyword))) {
      muscleGroups.push(muscle);
    }
  });
  
  return muscleGroups.length > 0 ? muscleGroups : ['general'];
}

function extractEquipment(exercises: string): string[] {
  const exerciseText = exercises.toLowerCase();
  const equipment: string[] = [];
  
  const equipmentMap: Record<string, string[]> = {
    'dumbbells': ['dumbbell', 'db'],
    'barbells & weight plates': ['barbell', 'bb'],
    'kettlebells': ['kettlebell', 'kb'],
    'resistance_bands': ['band', 'resistance'],
    'body weight': ['push', 'pull', 'squat', 'lunge', 'plank']
  };
  
  Object.entries(equipmentMap).forEach(([equip, keywords]) => {
    if (keywords.some(keyword => exerciseText.includes(keyword))) {
      equipment.push(equip);
    }
  });
  
  return equipment.length > 0 ? equipment : ['general'];
}

// Legacy AI recommendation engine has been removed
// All components should now use the new AI service architecture
// See: src/services/ai/core/AIService.ts for the new implementation

export default migrationUtils; 