import { 
  PerWorkoutOptions, 
  DurationConfigurationData, 
  EquipmentSelectionData, 
  WorkoutFocusConfigurationData,
  HierarchicalSelectionData,
  IncludeExercisesData,
  ExcludeExercisesData,
  UserProfile,
  AIRecommendationContext,
  ValidationResult,
  MigrationUtils
} from '../types/enhanced-workout-types';

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
              fitnessLevel: currentValue <= 30 ? 'beginner' : currentValue <= 60 ? 'intermediate' : 'advanced',
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
              userExperience: 'intermediate',
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
                difficultyLevel: 'intermediate',
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
              difficultyLevel: 'intermediate',
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
    if (userProfile.fitnessLevel === 'advanced' && !migrationUtils.isComplexObject(currentValue)) {
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
      analysis.reasons.push('Comprehensive AI assistance works best with detailed data');
      analysis.benefits.push('Enhanced AI recommendations and insights');
    }

    // Component-specific logic
    switch (configKey) {
      case 'customization_duration':
        if (userProfile.history?.completedWorkouts && userProfile.history.completedWorkouts > 10) {
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
        if (userProfile.limitations?.injuries && userProfile.limitations.injuries.length > 0) {
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
      experience: 'intermediate',
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
      experience: 'beginner',
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
      experience: 'beginner',
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
      experience: 'beginner',
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
  const gymEquipment = ['barbell', 'cable_machine', 'leg_press', 'smith_machine'];
  const homeEquipment = ['dumbbells', 'resistance_bands', 'bodyweight'];
  
  const hasGymEquipment = equipment.some(eq => gymEquipment.includes(eq));
  const hasHomeEquipment = equipment.some(eq => homeEquipment.includes(eq));
  
  if (hasGymEquipment && !hasHomeEquipment) return 'gym';
  if (hasHomeEquipment && !hasGymEquipment) return 'home';
  return 'mixed';
}

function inferContexts(equipment: string[]): string[] {
  const contexts: string[] = [];
  
  const strengthEquipment = ['barbell', 'dumbbells', 'kettlebells', 'resistance_bands'];
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
  if (equipment.includes('bodyweight')) {
    contexts.push('bodyweight');
  }
  
  return contexts.length > 0 ? contexts : ['general'];
}

function inferSpaceRequired(equipment: string[]): 'minimal' | 'moderate' | 'large' {
  const largeEquipment = ['barbell', 'squat_rack', 'bench', 'cable_machine'];
  const moderateEquipment = ['dumbbells', 'kettlebells', 'pull_up_bar'];
  
  if (equipment.some(eq => largeEquipment.includes(eq))) return 'large';
  if (equipment.some(eq => moderateEquipment.includes(eq))) return 'moderate';
  return 'minimal';
}

function getRecoveryTime(area: string): number {
  const recoveryMap: Record<string, number> = {
    'Upper Body': 48,
    'Lower Body': 72,
    'Core': 24,
    'Full Body': 48,
    'Cardio': 12,
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
    'barbell': ['barbell', 'bb'],
    'kettlebells': ['kettlebell', 'kb'],
    'resistance_bands': ['band', 'resistance'],
    'bodyweight': ['push', 'pull', 'squat', 'lunge', 'plank']
  };
  
  Object.entries(equipmentMap).forEach(([equip, keywords]) => {
    if (keywords.some(keyword => exerciseText.includes(keyword))) {
      equipment.push(equip);
    }
  });
  
  return equipment.length > 0 ? equipment : ['general'];
}

// AI recommendation engine
export const aiRecommendationEngine = {
  generateRecommendations: (options: PerWorkoutOptions, userProfile: UserProfile) => {
    const recommendations = {
      immediate: [] as string[],
      contextual: [] as string[],
      learning: [] as string[],
      optimization: [] as string[]
    };

    // Duration-energy compatibility analysis
    const duration = typeof options.customization_duration === 'number' 
      ? options.customization_duration 
      : options.customization_duration?.totalDuration;
      
    if (options.customization_energy && options.customization_energy <= 2 && duration && duration > 45) {
      recommendations.immediate.push("Consider reducing workout duration due to low energy levels");
      recommendations.optimization.push("Try a 30-minute high-efficiency workout instead");
    }

    // Equipment-focus synergy analysis
    if (Array.isArray(options.customization_equipment) && 
        options.customization_equipment.includes("Bodyweight Only") && 
        options.customization_focus === 'strength') {
      recommendations.contextual.push("For strength goals, consider adding resistance equipment");
      recommendations.optimization.push("Resistance bands can provide progressive overload for bodyweight training");
    }

    // Sleep-intensity adaptation with learning
    if (options.customization_sleep && options.customization_sleep <= 2 && options.customization_focus === 'power') {
      recommendations.immediate.push("Poor sleep detected - consider recovery or flexibility work instead");
      recommendations.learning.push("Poor sleep impacts power output by up to 30% - track sleep for better planning");
    }

    // User profile-based recommendations
    if (userProfile.fitnessLevel === 'beginner' && duration && duration > 45) {
      recommendations.contextual.push("As a beginner, consider shorter workouts to build consistency");
      recommendations.learning.push("Start with 20-30 minute sessions and gradually increase duration");
    }

    // Time constraint analysis
    if (userProfile.limitations?.timeConstraints && duration && duration > userProfile.limitations.timeConstraints) {
      recommendations.immediate.push(`Workout duration exceeds your ${userProfile.limitations.timeConstraints} minute limit`);
      recommendations.optimization.push("Consider high-intensity interval training for time efficiency");
    }

    return recommendations;
  },

  parseAIRecommendation: (
    configKey: string,
    recommendation: string,
    options: PerWorkoutOptions,
    userProfile: UserProfile
  ): any => {
    // Simple implementation - in real app this would use NLP
    if (recommendation.includes('reduce') && configKey === 'customization_duration') {
      const current = typeof options.customization_duration === 'number' 
        ? options.customization_duration 
        : options.customization_duration?.totalDuration || 45;
      return Math.max(15, current - 15);
    }
    
    if (recommendation.includes('resistance') && configKey === 'customization_equipment') {
      return ['resistance_bands', 'bodyweight'];
    }
    
    if (recommendation.includes('flexibility') && configKey === 'customization_focus') {
      return 'flexibility';
    }
    
    return null;
  },

  analyzeCrossComponentConflicts: (
    options: PerWorkoutOptions,
    userProfile: UserProfile
  ) => {
    const conflicts: string[] = [];
    const optimizations: string[] = [];
    const missingComplements: string[] = [];

    // Duration vs Energy conflict
    const duration = typeof options.customization_duration === 'number' 
      ? options.customization_duration 
      : options.customization_duration?.totalDuration;
    
    if (duration && options.customization_energy && duration > 45 && options.customization_energy <= 2) {
      conflicts.push("Long workout duration conflicts with low energy level");
      optimizations.push("Reduce duration to 30 minutes or focus on recovery");
    }

    // Equipment vs Focus mismatch
    if (Array.isArray(options.customization_equipment) && 
        options.customization_equipment.includes("Bodyweight Only") && 
        options.customization_focus === 'strength') {
      conflicts.push("Bodyweight-only equipment may limit strength training effectiveness");
      optimizations.push("Add resistance bands or weights for better strength gains");
    }

    // Missing complementary selections
    if (options.customization_focus === 'strength' && !options.customization_areas) {
      missingComplements.push("Strength training would benefit from specific muscle group targeting");
    }

    if (options.customization_energy && options.customization_energy <= 2 && !options.customization_sleep) {
      missingComplements.push("Low energy may be related to sleep quality - consider tracking sleep");
    }

    return { conflicts, optimizations, missingComplements };
  }
};

export default migrationUtils; 