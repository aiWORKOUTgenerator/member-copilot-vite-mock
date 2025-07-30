// Insight Message Templates - Educational Content System
// Provides contextual, personalized insights based on user selections and profile

import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';

export interface InsightTemplate {
  title: string;
  explanation: string;
  suggestion?: string;
  learnMore?: string;
  priority: number;
  category: 'goals' | 'intensity' | 'duration' | 'recovery' | 'equipment';
}

export interface InsightContext {
  userProfile: UserProfile;
  workoutOptions: PerWorkoutOptions;
  factorScore: number;
  factorName: string;
}

export type InsightTemplateSelector = (context: InsightContext) => InsightTemplate | null;

// Goal Alignment Templates
export const GOAL_ALIGNMENT_TEMPLATES: Record<string, Record<string, InsightTemplate>> = {
  poor: {
    weightLoss_strength: {
      title: "Selection-Goal Mismatch",
      explanation: "Strength training alone may not optimize calorie burn for weight loss. While building muscle is beneficial, cardio and HIIT workouts typically burn more calories during the session.",
      suggestion: "Consider 'Quick Sweat' or 'Cardio' focus for better weight loss results, or combine strength with cardio intervals.",
      learnMore: "/education/weight-loss-workout-selection",
      priority: 1,
      category: 'goals'
    },
    strength_cardio: {
      title: "Goal-Focus Misalignment",
      explanation: "Cardio workouts are excellent for heart health and endurance, but may not be the most efficient path to building strength and muscle mass.",
      suggestion: "Try 'Strength' or 'Power' focus for better muscle building results, or consider a balanced approach.",
      learnMore: "/education/strength-training-basics",
      priority: 1,
      category: 'goals'
    },
    flexibility_strength: {
      title: "Flexibility Goal Overlooked",
      explanation: "Strength training is valuable, but it may not address your flexibility goals. Static stretching and mobility work are essential for improving range of motion.",
      suggestion: "Consider 'Flexibility' focus or add dedicated stretching sessions to your routine.",
      learnMore: "/education/flexibility-training",
      priority: 2,
      category: 'goals'
    }
  },
  warning: {
    weightLoss_moderate: {
      title: "Moderate Intensity for Weight Loss",
      explanation: "Moderate intensity workouts can support weight loss, but higher intensity intervals often provide better results in less time.",
      suggestion: "Consider increasing intensity to 'High' for more efficient calorie burn, or extend your workout duration.",
      learnMore: "/education/intensity-for-weight-loss",
      priority: 2,
      category: 'goals'
    }
  },
  good: {
    strength_strength: {
      title: "Excellent Goal Alignment",
      explanation: "Your strength focus perfectly matches your strength-building goals. This selection will effectively target muscle growth and strength development.",
      suggestion: "Consider progressive overload techniques to maximize your strength gains.",
      learnMore: "/education/progressive-overload",
      priority: 3,
      category: 'goals'
    }
  }
};

// Intensity Match Templates
export const INTENSITY_MATCH_TEMPLATES: Record<string, Record<string, InsightTemplate>> = {
  poor: {
    beginner_high: {
      title: "Intensity Too High for Experience",
      explanation: "High intensity workouts can be overwhelming for beginners and may lead to burnout or injury. It's important to build a foundation first.",
      suggestion: "Start with 'Low' or 'Moderate' intensity to build endurance and proper form before progressing.",
      learnMore: "/education/beginner-workout-progression",
      priority: 1,
      category: 'intensity'
    },
    advanced_low: {
      title: "Intensity Below Your Level",
      explanation: "Low intensity workouts may not provide sufficient challenge for your fitness level, potentially limiting your progress and results.",
      suggestion: "Consider 'Moderate' or 'High' intensity to maintain progress and continue challenging your body.",
      learnMore: "/education/advanced-workout-intensity",
      priority: 1,
      category: 'intensity'
    }
  },
  warning: {
    intermediate_high: {
      title: "High Intensity Challenge",
      explanation: "High intensity workouts can be effective but ensure you have adequate recovery time and proper form to prevent injury.",
      suggestion: "Monitor your recovery and consider alternating with moderate intensity sessions.",
      learnMore: "/education/recovery-and-intensity",
      priority: 2,
      category: 'intensity'
    }
  },
  good: {
    intermediate_moderate: {
      title: "Perfect Intensity Match",
      explanation: "Moderate intensity aligns well with your intermediate fitness level, providing effective training without overwhelming your system.",
      suggestion: "Consider gradually increasing intensity as you build confidence and strength.",
      learnMore: "/education/intensity-progression",
      priority: 3,
      category: 'intensity'
    }
  }
};

// Duration Fit Templates
export const DURATION_FIT_TEMPLATES: Record<string, Record<string, InsightTemplate>> = {
  poor: {
    beginner_45: {
      title: "Duration May Be Too Long",
      explanation: "45-minute workouts can be challenging for beginners and may lead to fatigue or poor form. It's better to start shorter and build up.",
      suggestion: "Start with 20-30 minute sessions to build endurance and proper technique.",
      learnMore: "/education/beginner-workout-duration",
      priority: 1,
      category: 'duration'
    },
    advanced_15: {
      title: "Short Duration for Your Level",
      explanation: "15-minute workouts may not provide sufficient training stimulus for your advanced fitness level, limiting your progress potential.",
      suggestion: "Consider 30-45 minute sessions for more comprehensive training and better results.",
      learnMore: "/education/advanced-workout-planning",
      priority: 1,
      category: 'duration'
    }
  },
  warning: {
    intermediate_45: {
      title: "Longer Workout Consideration",
      explanation: "45-minute workouts can be effective but ensure you have adequate time and energy to maintain quality throughout the session.",
      suggestion: "Consider breaking into shorter sessions if time or energy is limited.",
      learnMore: "/education/workout-scheduling",
      priority: 2,
      category: 'duration'
    }
  },
  good: {
    intermediate_30: {
      title: "Optimal Duration Selection",
      explanation: "30 minutes provides an excellent balance of training stimulus and time efficiency for your fitness level.",
      suggestion: "Focus on workout quality and intensity to maximize your 30-minute sessions.",
      learnMore: "/education/time-efficient-workouts",
      priority: 3,
      category: 'duration'
    }
  }
};

// Recovery Respect Templates
export const RECOVERY_RESPECT_TEMPLATES: Record<string, Record<string, InsightTemplate>> = {
  poor: {
    injury_high: {
      title: "High Intensity with Injury Risk",
      explanation: "High intensity workouts may aggravate existing injuries or limitations. It's crucial to prioritize safety and proper recovery.",
      suggestion: "Consider 'Low' or 'Moderate' intensity and focus on proper form and injury-safe movements.",
      learnMore: "/education/workout-injury-prevention",
      priority: 1,
      category: 'recovery'
    },
    recent_workout: {
      title: "Insufficient Recovery Time",
      explanation: "Working out too soon after your last session may not allow adequate recovery, potentially leading to decreased performance or injury.",
      suggestion: "Consider taking a rest day or choosing a lighter, recovery-focused session.",
      learnMore: "/education/recovery-timing",
      priority: 1,
      category: 'recovery'
    }
  },
  warning: {
    age_recovery: {
      title: "Recovery Considerations",
      explanation: "As we age, recovery becomes increasingly important. Consider incorporating more rest days and recovery-focused sessions.",
      suggestion: "Listen to your body and don't hesitate to take extra recovery time when needed.",
      learnMore: "/education/aging-and-recovery",
      priority: 2,
      category: 'recovery'
    }
  },
  good: {
    proper_recovery: {
      title: "Excellent Recovery Awareness",
      explanation: "Your selections show good awareness of recovery needs, which will help maintain long-term progress and prevent injury.",
      suggestion: "Continue monitoring your recovery and adjust intensity as needed.",
      learnMore: "/education/recovery-monitoring",
      priority: 3,
      category: 'recovery'
    }
  }
};

// Equipment Optimization Templates
export const EQUIPMENT_OPTIMIZATION_TEMPLATES: Record<string, Record<string, InsightTemplate>> = {
  poor: {
    limited_equipment: {
      title: "Equipment Limitations",
      explanation: "Your available equipment may limit the variety and effectiveness of your workouts. Consider bodyweight alternatives or equipment upgrades.",
      suggestion: "Explore bodyweight exercises or consider investing in basic equipment like resistance bands or dumbbells.",
      learnMore: "/education/bodyweight-workouts",
      priority: 1,
      category: 'equipment'
    },
    space_constraints: {
      title: "Space Considerations",
      explanation: "Limited space may restrict certain movements and exercises. Consider space-efficient alternatives.",
      suggestion: "Focus on exercises that work well in your available space, such as bodyweight movements or compact equipment.",
      learnMore: "/education/small-space-workouts",
      priority: 1,
      category: 'equipment'
    }
  },
  warning: {
    equipment_variety: {
      title: "Equipment Variety Opportunity",
      explanation: "While your current equipment works, adding variety could enhance your workouts and prevent plateaus.",
      suggestion: "Consider incorporating different equipment or exercise variations to keep your routine fresh.",
      learnMore: "/education/workout-variety",
      priority: 2,
      category: 'equipment'
    }
  },
  good: {
    optimal_equipment: {
      title: "Excellent Equipment Utilization",
      explanation: "Your equipment selection allows for effective, varied workouts that can support your fitness goals.",
      suggestion: "Continue exploring different exercises and variations with your available equipment.",
      learnMore: "/education/equipment-workout-ideas",
      priority: 3,
      category: 'equipment'
    }
  }
};

// Template Selection Functions
export const selectGoalAlignmentTemplate = (context: InsightContext): InsightTemplate | null => {
  const { userProfile, workoutOptions, factorScore } = context;
  const goals = userProfile.goals || [];
  const focus = workoutOptions.customization_focus;
  
  if (factorScore < 0.5) {
    // Poor alignment
    if (goals.includes('weight loss') && focus === 'strength') {
      return GOAL_ALIGNMENT_TEMPLATES.poor.weightLoss_strength;
    }
    if (goals.includes('strength') && focus === 'cardio') {
      return GOAL_ALIGNMENT_TEMPLATES.poor.strength_cardio;
    }
    if (goals.includes('flexibility') && focus === 'strength') {
      return GOAL_ALIGNMENT_TEMPLATES.poor.flexibility_strength;
    }
  } else if (factorScore < 0.7) {
    // Warning alignment
    if (goals.includes('weight loss')) {
      return GOAL_ALIGNMENT_TEMPLATES.warning.weightLoss_moderate;
    }
  } else {
    // Good alignment
    if (goals.includes('strength') && focus === 'strength') {
      return GOAL_ALIGNMENT_TEMPLATES.good.strength_strength;
    }
  }
  
  return null;
};

export const selectIntensityMatchTemplate = (context: InsightContext): InsightTemplate | null => {
  const { userProfile, workoutOptions, factorScore } = context;
  const fitnessLevel = userProfile.fitnessLevel;
  const energy = workoutOptions.customization_energy?.rating ?? 5;
  
  if (factorScore < 0.5) {
    // Poor match
    if (fitnessLevel === 'beginner' && energy > 7) {
      return INTENSITY_MATCH_TEMPLATES.poor.beginner_high;
    }
    if (fitnessLevel === 'advanced' && energy < 4) {
      return INTENSITY_MATCH_TEMPLATES.poor.advanced_low;
    }
  } else if (factorScore < 0.7) {
    // Warning match
    if (fitnessLevel === 'intermediate' && energy > 7) {
      return INTENSITY_MATCH_TEMPLATES.warning.intermediate_high;
    }
  } else {
    // Good match
    if (fitnessLevel === 'intermediate' && energy >= 5 && energy <= 7) {
      return INTENSITY_MATCH_TEMPLATES.good.intermediate_moderate;
    }
  }
  
  return null;
};

export const selectDurationFitTemplate = (context: InsightContext): InsightTemplate | null => {
  const { userProfile, workoutOptions, factorScore } = context;
  const fitnessLevel = userProfile.fitnessLevel;
  const duration = workoutOptions.customization_duration;
  
  // Extract duration value, handling both number and DurationConfigurationData
  const durationValue = typeof duration === 'number' ? duration : duration?.duration;
  
  if (factorScore < 0.5) {
    // Poor fit
    if (fitnessLevel === 'beginner' && durationValue && durationValue > 30) {
      return DURATION_FIT_TEMPLATES.poor.beginner_45;
    }
    if (fitnessLevel === 'advanced' && durationValue && durationValue < 20) {
      return DURATION_FIT_TEMPLATES.poor.advanced_15;
    }
  } else if (factorScore < 0.7) {
    // Warning fit
    if (fitnessLevel === 'intermediate' && durationValue && durationValue > 30) {
      return DURATION_FIT_TEMPLATES.warning.intermediate_45;
    }
  } else {
    // Good fit
    if (fitnessLevel === 'intermediate' && durationValue && durationValue >= 20 && durationValue <= 30) {
      return DURATION_FIT_TEMPLATES.good.intermediate_30;
    }
  }
  
  return null;
};

export const selectRecoveryRespectTemplate = (context: InsightContext): InsightTemplate | null => {
  const { userProfile, workoutOptions, factorScore } = context;
  const injuries = userProfile.basicLimitations?.injuries ?? [];
  const energy = workoutOptions.customization_energy?.rating ?? 5;
  // Use age from userProfile directly, not from recoveryNeeds
  const age = userProfile.age ?? 30;
  
  if (factorScore < 0.5) {
    // Poor recovery respect
    if (injuries.length > 0 && energy > 7) {
      return RECOVERY_RESPECT_TEMPLATES.poor.injury_high;
    }
    // Note: Recent workout detection would need additional context
  } else if (factorScore < 0.7) {
    // Warning recovery respect
    if (age > 40) {
      return RECOVERY_RESPECT_TEMPLATES.warning.age_recovery;
    }
  } else {
    // Good recovery respect
    return RECOVERY_RESPECT_TEMPLATES.good.proper_recovery;
  }
  
  return null;
};

export const selectEquipmentOptimizationTemplate = (context: InsightContext): InsightTemplate | null => {
  const { userProfile, workoutOptions, factorScore } = context;
  const _workoutOptions = workoutOptions; // Prefix with underscore to indicate unused
  const equipment = userProfile.basicLimitations?.availableEquipment ?? [];
  const locations = userProfile.basicLimitations?.availableLocations ?? [];
  
  if (factorScore < 0.5) {
    // Poor optimization
    if (equipment.length < 2) {
      return EQUIPMENT_OPTIMIZATION_TEMPLATES.poor.limited_equipment;
    }
    if (locations.length === 0) {
      return EQUIPMENT_OPTIMIZATION_TEMPLATES.poor.space_constraints;
    }
  } else if (factorScore < 0.7) {
    // Warning optimization
    return EQUIPMENT_OPTIMIZATION_TEMPLATES.warning.equipment_variety;
  } else {
    // Good optimization
    return EQUIPMENT_OPTIMIZATION_TEMPLATES.good.optimal_equipment;
  }
  
  return null;
};

// Main template selector
export const selectInsightTemplate = (context: InsightContext): InsightTemplate | null => {
  const { factorName } = context;
  
  switch (factorName) {
    case 'goalAlignment':
      return selectGoalAlignmentTemplate(context);
    case 'intensityMatch':
      return selectIntensityMatchTemplate(context);
    case 'durationFit':
      return selectDurationFitTemplate(context);
    case 'recoveryRespect':
      return selectRecoveryRespectTemplate(context);
    case 'equipmentOptimization':
      return selectEquipmentOptimizationTemplate(context);
    default:
      return null;
  }
}; 