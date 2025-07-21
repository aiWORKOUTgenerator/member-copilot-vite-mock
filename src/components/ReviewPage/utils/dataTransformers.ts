import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { ProfileData } from '../../Profile/types/profile.types';
import { DisplayWorkoutFocus } from '../types';

export const convertWorkoutFocusToDisplay = (
  workoutFocusData: PerWorkoutOptions | null, 
  workoutType?: 'quick' | 'detailed'
): DisplayWorkoutFocus | null => {
  if (!workoutFocusData) return null;
  
  // Determine workout type display name
  const getWorkoutTypeDisplay = () => {
    if (workoutType === 'quick') return 'Quick Workout';
    if (workoutType === 'detailed') return 'Detailed Workout';
    return 'Balanced Training'; // fallback
  };
  
  // Extract focus value properly - handle both string and object formats
  const extractFocusValue = (focusData: any): string => {
    if (!focusData) return 'Not specified';
    
    // If it's already a string, return it
    if (typeof focusData === 'string') {
      return focusData;
    }
    
    // If it's an object (WorkoutFocusConfigurationData), extract the focus property
    if (typeof focusData === 'object' && focusData.focus) {
      return focusData.focus;
    }
    
    // If it's an object with focusLabel, use that
    if (typeof focusData === 'object' && focusData.focusLabel) {
      return focusData.focusLabel;
    }
    
    // If it's an object with label, use that
    if (typeof focusData === 'object' && focusData.label) {
      return focusData.label;
    }
    
    // Fallback to string conversion
    return String(focusData);
  };
  
  const workoutFocus = extractFocusValue(workoutFocusData.customization_focus);
  
  // 🔍 DEBUG: Log the focus extraction
  console.log('🔍 convertWorkoutFocusToDisplay - Focus extraction:', {
    originalFocus: workoutFocusData.customization_focus,
    originalType: typeof workoutFocusData.customization_focus,
    extractedFocus: workoutFocus,
    isObject: typeof workoutFocusData.customization_focus === 'object',
    hasObjectFocus: typeof workoutFocusData.customization_focus === 'object' && workoutFocusData.customization_focus?.focus
  });
  
  return {
    workoutFocus: workoutFocus,
    workoutIntensity: String('Not specified'), // Will be populated from profile data
    workoutType: getWorkoutTypeDisplay(),
    duration: workoutFocusData.customization_duration ? 
      `${workoutFocusData.customization_duration} minutes` : 'Not specified',
    focusAreas: Array.isArray(workoutFocusData.customization_areas) ? 
      workoutFocusData.customization_areas : [],
    equipment: Array.isArray(workoutFocusData.customization_equipment) ? 
      workoutFocusData.customization_equipment : [],
    energyLevel: workoutFocusData.customization_energy ? 
      `${workoutFocusData.customization_energy}/10` : 'Not specified',
    currentSoreness: workoutFocusData.customization_soreness ? 
      Object.keys(workoutFocusData.customization_soreness)
        .filter(key => workoutFocusData.customization_soreness?.[key]?.selected)
        .map(key => ({
          area: key === 'general' ? 'General Soreness' : key,
          level: workoutFocusData.customization_soreness?.[key]?.rating || 0
        })) : [],
    includeExercises: [],
    excludeExercises: []
  };
};

export const validateWorkoutFocusData = (data: PerWorkoutOptions | null, workoutType?: 'quick' | 'detailed'): boolean => {
  if (!data) return false;
  
  // Basic requirements for all workout types
  const hasBasicRequirements = !!(
    data.customization_focus &&
    data.customization_duration &&
    data.customization_energy !== undefined
  );
  
  if (!hasBasicRequirements) return false;
  
  // For quick workouts, basic requirements are sufficient
  if (workoutType === 'quick') {
    return true;
  }
  
  // For detailed workouts, require additional fields with complex data structure validation
  if (workoutType === 'detailed') {
    // Validate focus areas - handle both array and hierarchical data structures
    const hasValidAreas = (() => {
      if (Array.isArray(data.customization_areas)) {
        return data.customization_areas.length > 0;
      }
      if (typeof data.customization_areas === 'object' && data.customization_areas !== null) {
        // Handle HierarchicalSelectionData format
        const selectedAreas = Object.values(data.customization_areas).filter((item: any) => item?.selected);
        return selectedAreas.length > 0;
      }
      return false;
    })();
    
    // Validate equipment - handle both array and EquipmentSelectionData structures
    const hasValidEquipment = (() => {
      if (Array.isArray(data.customization_equipment)) {
        return data.customization_equipment.length > 0;
      }
      if (typeof data.customization_equipment === 'object' && data.customization_equipment !== null) {
        // Handle EquipmentSelectionData format
        const equipment = data.customization_equipment.specificEquipment || [];
        return Array.isArray(equipment) && equipment.length > 0;
      }
      return false;
    })();
    
    return hasValidAreas && hasValidEquipment;
  }
  
  // Default validation (when workoutType is not specified) - be more lenient
  return hasBasicRequirements;
};

export const getMissingDataWarnings = (
  profileData: ProfileData | null, 
  workoutFocusData: PerWorkoutOptions | null, 
  workoutType?: 'quick' | 'detailed'
): string[] => {
  const warnings = [];
  
  if (!profileData) {
    warnings.push('Profile information is missing. Please complete your profile.');
  }
  
  if (!workoutFocusData) {
    warnings.push('Workout focus preferences are missing. Please set your workout preferences.');
    return warnings;
  }
  
  // Check basic requirements for all workout types
  if (!workoutFocusData.customization_focus) {
    warnings.push('Workout focus is required. Please select your primary workout goal.');
  }
  
  if (!workoutFocusData.customization_duration) {
    warnings.push('Workout duration is required. Please specify how long you want to work out.');
  }
  
  if (workoutFocusData.customization_energy === undefined) {
    warnings.push('Energy level is required. Please rate your current energy level.');
  }
  
  // Additional requirements for detailed workouts with complex data structure validation
  if (workoutType === 'detailed') {
    // Validate focus areas with detailed guidance
    const hasValidAreas = (() => {
      if (Array.isArray(workoutFocusData.customization_areas)) {
        return workoutFocusData.customization_areas.length > 0;
      }
      if (typeof workoutFocusData.customization_areas === 'object' && workoutFocusData.customization_areas !== null) {
        const selectedAreas = Object.values(workoutFocusData.customization_areas).filter((item: any) => item?.selected);
        return selectedAreas.length > 0;
      }
      return false;
    })();
    
    if (!hasValidAreas) {
      warnings.push('Focus areas are required for detailed workouts. Please select at least one muscle group to target for personalized exercise recommendations.');
    }
    
    // Validate equipment with detailed guidance
    const hasValidEquipment = (() => {
      if (Array.isArray(workoutFocusData.customization_equipment)) {
        return workoutFocusData.customization_equipment.length > 0;
      }
      if (typeof workoutFocusData.customization_equipment === 'object' && workoutFocusData.customization_equipment !== null) {
        const equipment = workoutFocusData.customization_equipment.specificEquipment || [];
        return Array.isArray(equipment) && equipment.length > 0;
      }
      return false;
    })();
    
    if (!hasValidEquipment) {
      warnings.push('Equipment selection is required for detailed workouts. Please specify what equipment you have available to receive targeted exercise recommendations.');
    }
    
    // Additional detailed workout specific validations
    if (workoutFocusData.customization_duration) {
      const duration = typeof workoutFocusData.customization_duration === 'number' 
        ? workoutFocusData.customization_duration 
        : workoutFocusData.customization_duration?.totalDuration;
      
      if (duration && duration < 15) {
        warnings.push('Detailed workouts work best with at least 15 minutes. Consider increasing duration for better results.');
      }
      
      if (duration && duration > 90) {
        warnings.push('Workouts longer than 90 minutes may lead to fatigue. Consider breaking into multiple sessions.');
      }
    }
    
    // Validate energy level appropriateness for detailed workouts
    if (workoutFocusData.customization_energy !== undefined) {
      if (workoutFocusData.customization_energy <= 2) {
        warnings.push('Low energy level detected. Consider a lighter workout or recovery session.');
      }
      
      if (workoutFocusData.customization_energy >= 8) {
        warnings.push('High energy level detected. You may be ready for a more intense detailed workout.');
      }
    }
  }
  
  return warnings;
};

export const getActivityLevelDescription = (activity: string): string => {
  switch (activity) {
    case 'sedentary': return 'Little to no physical activity beyond daily living';
    case 'light': return 'Occasional light activities like walking';
    case 'moderate': return 'Regular light to moderate activity 3-4 times per week';
    case 'very': return 'Consistent daily activity including structured exercise';
    case 'extremely': return 'Intense activity multiple times a day';
    case 'varies': return 'Activity level changes weekly, from light to intense exercise';
    default: return 'Activity level changes weekly';
  }
};

export const getActivityLevelDisplay = (activity: string): string => {
  switch (activity) {
    case 'sedentary': return 'Sedentary';
    case 'light': return 'Light Activity';
    case 'moderate': return 'Moderately Active';
    case 'very': return 'Very Active';
    case 'extremely': return 'Extremely Active';
    default: return 'Varies';
  }
};

export const getIntensityDescription = (intensity: string): string => {
  if (intensity === 'lightly' || intensity === 'light-moderate') {
    return 'Low Intensity - Comfortable pace, can easily hold a conversation';
  } else if (intensity === 'moderately' || intensity === 'active') {
    return 'Moderate Intensity - Challenging but sustainable';
  } else {
    return 'High Intensity - Pushing limits, brief conversations only';
  }
};

export const calculateTimeInvestment = (preferredDuration: string, timeCommitment: string) => {
  // Extract min duration from format like '30-45 min'
  const [minDuration, maxDuration] = preferredDuration
    .replace(' min', '')
    .split('-')
    .map(n => parseInt(n));
  
  // Extract weekly days from format like '3-4'
  const [minDays, maxDays] = timeCommitment
    .split('-')
    .map(n => parseInt(n));

  const minWeekly = minDuration * minDays;
  const maxWeekly = maxDuration * maxDays;

  // WHO target comparison
  const WHO_TARGET = 150; // minutes per week
  let targetStatus;
  let statusColor;

  if (maxWeekly < WHO_TARGET) {
    targetStatus = 'Below WHO target';
    statusColor = 'text-yellow-600 bg-yellow-50';
  } else if (minWeekly >= WHO_TARGET) {
    targetStatus = 'Exceeds WHO target';
    statusColor = 'text-green-600 bg-green-50';
  } else {
    targetStatus = 'Meets WHO target';
    statusColor = 'text-blue-600 bg-blue-50';
  }

  return {
    minWeekly,
    maxWeekly,
    targetStatus,
    statusColor
  };
};

export const getGoalFocusDescription = (goal: string): string => {
  switch (goal) {
    case 'Weight Loss': return 'Sustainable weight loss through balanced training';
    case 'Strength': return 'Build functional strength and power';
    case 'Cardio Health': return 'Enhance cardiovascular endurance';
    case 'Flexibility & Mobility': return 'Increase range of motion and mobility';
    case 'General Health': return 'Maintain overall wellness';
    case 'Muscle Gain': return 'Build lean muscle mass';
    default: return 'Customized training focus';
  }
};

export const getEnvironmentDescription = (location: string): string => {
  switch (location) {
    case 'Gym': return 'Commercial Gym';
    case 'Home Gym': return 'Home Gym Setup';
    case 'Home': return 'Home Space';
    case 'Parks/Outdoor Spaces': return 'Outdoor Areas';
    case 'Swimming Pool': return 'Pool Access';
    case 'Running Track': return 'Track Access';
    default: return location;
  }
};

export const getTrainingStyle = (preferredActivities: string[], availableEquipment: string[]): string => {
  const hasCardio = preferredActivities.some(act => 
    ['Running/Jogging', 'Swimming', 'Cycling/Mountain Biking'].includes(act)
  );
  const hasStrength = availableEquipment.some(eq => 
    ['Dumbbells', 'Resistance Bands', 'Kettlebells'].includes(eq)
  );
  const hasFlexibility = preferredActivities.some(act => 
    ['Yoga', 'Pilates'].includes(act)
  );

  const styles = [];
  if (hasCardio) styles.push('Cardio-focused');
  if (hasStrength) styles.push('Strength Training');
  if (hasFlexibility) styles.push('Flexibility Work');
  if (styles.length === 0) styles.push('General Fitness');

  return styles.join(' + ');
};

/**
 * Validate detailed workout step-by-step progression
 * Provides specific guidance for detailed workout requirements
 */
export const validateDetailedWorkoutProgression = (
  workoutFocusData: PerWorkoutOptions | null,
  profileData: ProfileData | null
): {
  isValid: boolean;
  step: number;
  totalSteps: number;
  currentStep: string;
  nextStep: string;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let step = 0;
  const totalSteps = 6;
  
  // Step 1: Basic workout focus
  if (workoutFocusData?.customization_focus) {
    step = 1;
  } else {
    issues.push('Select your primary workout goal (strength, cardio, etc.)');
    recommendations.push('Choose a focus that aligns with your fitness goals');
    return { isValid: false, step: 0, totalSteps, currentStep: 'Workout Focus', nextStep: 'Duration', issues, recommendations };
  }
  
  // Step 2: Duration
  if (workoutFocusData?.customization_duration) {
    step = 2;
  } else {
    issues.push('Set your workout duration');
    recommendations.push('Choose a duration that fits your schedule and energy level');
    return { isValid: false, step: 1, totalSteps, currentStep: 'Duration', nextStep: 'Energy Level', issues, recommendations };
  }
  
  // Step 3: Energy level
  if (workoutFocusData?.customization_energy !== undefined) {
    step = 3;
  } else {
    issues.push('Rate your current energy level');
    recommendations.push('This helps customize workout intensity to your current state');
    return { isValid: false, step: 2, totalSteps, currentStep: 'Energy Level', nextStep: 'Focus Areas', issues, recommendations };
  }
  
  // Step 4: Focus areas (detailed workout specific)
  const hasValidAreas = (() => {
    if (Array.isArray(workoutFocusData?.customization_areas)) {
      return (workoutFocusData?.customization_areas || []).length > 0;
    }
    if (typeof workoutFocusData?.customization_areas === 'object' && workoutFocusData?.customization_areas !== null) {
      const selectedAreas = Object.values(workoutFocusData.customization_areas).filter((item: any) => item?.selected);
      return selectedAreas.length > 0;
    }
    return false;
  })();
  
  if (hasValidAreas) {
    step = 4;
  } else {
    issues.push('Select focus areas for targeted training');
    recommendations.push('Choose 2-3 muscle groups for optimal detailed workout results');
    return { isValid: false, step: 3, totalSteps, currentStep: 'Focus Areas', nextStep: 'Equipment', issues, recommendations };
  }
  
  // Step 5: Equipment (detailed workout specific)
  const hasValidEquipment = (() => {
    if (Array.isArray(workoutFocusData?.customization_equipment)) {
      return (workoutFocusData?.customization_equipment || []).length > 0;
    }
    if (typeof workoutFocusData?.customization_equipment === 'object' && workoutFocusData?.customization_equipment !== null) {
      const equipment = workoutFocusData.customization_equipment.specificEquipment || [];
      return Array.isArray(equipment) && equipment.length > 0;
    }
    return false;
  })();
  
  if (hasValidEquipment) {
    step = 5;
  } else {
    issues.push('Select available equipment');
    recommendations.push('Specify what equipment you have access to for personalized exercises');
    return { isValid: false, step: 4, totalSteps, currentStep: 'Equipment', nextStep: 'Profile Data', issues, recommendations };
  }
  
  // Step 6: Profile data (for enhanced detailed workouts)
  if (profileData?.experienceLevel && profileData?.physicalActivity) {
    step = 6;
  } else {
    issues.push('Complete your profile for enhanced recommendations');
    recommendations.push('Add your experience level and activity preferences for better customization');
    return { isValid: false, step: 5, totalSteps, currentStep: 'Profile Data', nextStep: 'Ready', issues, recommendations };
  }
  
  return { 
    isValid: true, 
    step: 6, 
    totalSteps, 
    currentStep: 'Complete', 
    nextStep: 'Generate Workout', 
    issues: [], 
    recommendations: ['All requirements met! Ready to generate your detailed workout.'] 
  };
};

export const getEnergyLevelDescription = (energyStr: string): string => {
  const level = parseInt(energyStr);
  const description = level <= 3 ? 'Low - Consider a lighter workout' :
                    level <= 6 ? 'Moderate - Good for standard workout' :
                    'High - Ready for challenging workout';
  return `${energyStr} (${description})`;
}; 