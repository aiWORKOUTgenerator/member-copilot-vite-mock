// Suggestion Database - Educational Content System
// Provides contextual, actionable suggestions based on user selections and profile

import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';

export interface SuggestionTemplate {
  id: string;
  action: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedScoreIncrease: number;
  quickFix: boolean;
  category: 'goals' | 'intensity' | 'duration' | 'recovery' | 'equipment';
  timeRequired: 'immediate' | '5min' | '15min' | '30min';
  priority: number;
  conditions: SuggestionCondition[];
}

export interface SuggestionCondition {
  factor: string;
  operator: 'lt' | 'lte' | 'eq' | 'gte' | 'gt';
  value: number | string | boolean;
  field?: string; // For nested object access
}

export interface SuggestionContext {
  userProfile: UserProfile;
  workoutOptions: PerWorkoutOptions;
  factorScores: Record<string, number>;
  overallScore: number;
}

// Goal Alignment Suggestions
export const GOAL_ALIGNMENT_SUGGESTIONS: SuggestionTemplate[] = [
  {
    id: 'goal-weight-loss-cardio',
    action: 'Switch to Cardio Focus',
    description: 'Cardio workouts burn more calories during the session, making them more effective for weight loss goals.',
    impact: 'high',
    estimatedScoreIncrease: 0.3,
    quickFix: true,
    category: 'goals',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'goalAlignment', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.goals', operator: 'eq', value: 'weight loss' },
      { factor: 'workoutOptions.customization_focus', operator: 'eq', value: 'strength' }
    ]
  },
  {
    id: 'goal-strength-focus',
    action: 'Choose Strength Focus',
    description: 'Strength training is essential for building muscle mass and increasing metabolic rate.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'goals',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'goalAlignment', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.goals', operator: 'eq', value: 'strength' },
      { factor: 'workoutOptions.customization_focus', operator: 'eq', value: 'cardio' }
    ]
  },
  {
    id: 'goal-flexibility-session',
    action: 'Add Flexibility Session',
    description: 'Include dedicated flexibility training to improve range of motion and prevent injury.',
    impact: 'medium',
    estimatedScoreIncrease: 0.2,
    quickFix: false,
    category: 'goals',
    timeRequired: '15min',
    priority: 2,
    conditions: [
      { factor: 'goalAlignment', operator: 'lt', value: 0.6 },
      { factor: 'userProfile.goals', operator: 'eq', value: 'flexibility' }
    ]
  }
];

// Intensity Match Suggestions
export const INTENSITY_MATCH_SUGGESTIONS: SuggestionTemplate[] = [
  {
    id: 'intensity-beginner-reduce',
    action: 'Reduce Intensity Level',
    description: 'Start with lower intensity to build proper form and endurance before progressing.',
    impact: 'high',
    estimatedScoreIncrease: 0.3,
    quickFix: true,
    category: 'intensity',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'intensityMatch', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'beginner' },
      { factor: 'workoutOptions.customization_energy.rating', operator: 'gt', value: 7 }
    ]
  },
  {
    id: 'intensity-advanced-increase',
    action: 'Increase Intensity Level',
    description: 'Higher intensity will provide the challenge needed for your advanced fitness level.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'intensity',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'intensityMatch', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'advanced' },
      { factor: 'workoutOptions.customization_energy.rating', operator: 'lt', value: 4 }
    ]
  },
  {
    id: 'intensity-progressive-overload',
    action: 'Implement Progressive Overload',
    description: 'Gradually increase intensity over time to continue making progress.',
    impact: 'medium',
    estimatedScoreIncrease: 0.15,
    quickFix: false,
    category: 'intensity',
    timeRequired: '30min',
    priority: 2,
    conditions: [
      { factor: 'intensityMatch', operator: 'lt', value: 0.7 },
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'intermediate' }
    ]
  }
];

// Duration Fit Suggestions
export const DURATION_FIT_SUGGESTIONS: SuggestionTemplate[] = [
  {
    id: 'duration-beginner-shorten',
    action: 'Shorten Workout Duration',
    description: 'Start with shorter sessions to build endurance and maintain proper form.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'duration',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'durationFit', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'beginner' },
      { factor: 'workoutOptions.customization_duration', operator: 'gt', value: 30 }
    ]
  },
  {
    id: 'duration-advanced-extend',
    action: 'Extend Workout Duration',
    description: 'Longer sessions will provide sufficient training stimulus for your advanced level.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'duration',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'durationFit', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'advanced' },
      { factor: 'workoutOptions.customization_duration', operator: 'lt', value: 20 }
    ]
  },
  {
    id: 'duration-time-management',
    action: 'Optimize Time Management',
    description: 'Plan your workout schedule to accommodate longer sessions when needed.',
    impact: 'medium',
    estimatedScoreIncrease: 0.15,
    quickFix: false,
    category: 'duration',
    timeRequired: '15min',
    priority: 2,
    conditions: [
      { factor: 'durationFit', operator: 'lt', value: 0.7 },
      { factor: 'userProfile.enhancedLimitations.timeConstraints', operator: 'lt', value: 45 }
    ]
  }
];

// Recovery Respect Suggestions
export const RECOVERY_RESPECT_SUGGESTIONS: SuggestionTemplate[] = [
  {
    id: 'recovery-injury-modify',
    action: 'Modify for Injury Safety',
    description: 'Choose lower intensity and injury-safe movements to prevent aggravating existing conditions.',
    impact: 'high',
    estimatedScoreIncrease: 0.3,
    quickFix: true,
    category: 'recovery',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'recoveryRespect', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.basicLimitations.injuries', operator: 'gt', value: 0 }
    ]
  },
  {
    id: 'recovery-rest-day',
    action: 'Take a Rest Day',
    description: 'Allow adequate recovery time to prevent overtraining and improve performance.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'recovery',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'recoveryRespect', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.workoutHistory.estimatedCompletedWorkouts', operator: 'gt', value: 3 }
    ]
  },
  {
    id: 'recovery-sleep-optimize',
    action: 'Optimize Sleep Schedule',
    description: 'Ensure adequate sleep to support recovery and muscle growth.',
    impact: 'medium',
    estimatedScoreIncrease: 0.15,
    quickFix: false,
    category: 'recovery',
    timeRequired: '30min',
    priority: 2,
    conditions: [
      { factor: 'recoveryRespect', operator: 'lt', value: 0.7 },
      { factor: 'userProfile.enhancedLimitations.recoveryNeeds.sleepHours', operator: 'lt', value: 7 }
    ]
  }
];

// Equipment Optimization Suggestions
export const EQUIPMENT_OPTIMIZATION_SUGGESTIONS: SuggestionTemplate[] = [
  {
    id: 'equipment-bodyweight-focus',
    action: 'Focus on Bodyweight Exercises',
    description: 'Bodyweight exercises can be highly effective and require minimal equipment.',
    impact: 'high',
    estimatedScoreIncrease: 0.25,
    quickFix: true,
    category: 'equipment',
    timeRequired: 'immediate',
    priority: 1,
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.5 },
      { factor: 'userProfile.basicLimitations.availableEquipment', operator: 'lt', value: 2 }
    ]
  },
  {
    id: 'equipment-invest-basics',
    action: 'Invest in Basic Equipment',
    description: 'Consider purchasing resistance bands or dumbbells for more workout variety.',
    impact: 'medium',
    estimatedScoreIncrease: 0.2,
    quickFix: false,
    category: 'equipment',
    timeRequired: '30min',
    priority: 2,
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.6 },
      { factor: 'userProfile.basicLimitations.availableEquipment', operator: 'lt', value: 3 }
    ]
  },
  {
    id: 'equipment-space-optimize',
    action: 'Optimize for Small Space',
    description: 'Choose exercises that work well in limited space without compromising effectiveness.',
    impact: 'medium',
    estimatedScoreIncrease: 0.15,
    quickFix: false,
    category: 'equipment',
    timeRequired: '15min',
    priority: 2,
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.6 },
      { factor: 'userProfile.basicLimitations.availableLocations', operator: 'lt', value: 2 }
    ]
  }
];

// All suggestions combined
export const ALL_SUGGESTIONS: SuggestionTemplate[] = [
  ...GOAL_ALIGNMENT_SUGGESTIONS,
  ...INTENSITY_MATCH_SUGGESTIONS,
  ...DURATION_FIT_SUGGESTIONS,
  ...RECOVERY_RESPECT_SUGGESTIONS,
  ...EQUIPMENT_OPTIMIZATION_SUGGESTIONS
];

// Helper function to evaluate conditions
export const evaluateCondition = (
  condition: SuggestionCondition,
  context: SuggestionContext
): boolean => {
  const { factor, operator, value, field } = condition;
  
  let actualValue: any;
  
  if (field) {
    // Handle nested object access
    const fieldPath = field.split('.');
    actualValue = fieldPath.reduce((obj, key) => obj?.[key], context);
  } else {
    // Handle factor scores
    actualValue = context.factorScores[factor];
  }
  
  switch (operator) {
    case 'lt':
      return actualValue < value;
    case 'lte':
      return actualValue <= value;
    case 'eq':
      return actualValue === value;
    case 'gte':
      return actualValue >= value;
    case 'gt':
      return actualValue > value;
    default:
      return false;
  }
};

// Helper function to evaluate all conditions for a suggestion
export const evaluateSuggestionConditions = (
  suggestion: SuggestionTemplate,
  context: SuggestionContext
): boolean => {
  return suggestion.conditions.every(condition => 
    evaluateCondition(condition, context)
  );
};

// Main function to get applicable suggestions
export const getApplicableSuggestions = (
  context: SuggestionContext,
  maxSuggestions: number = 5
): SuggestionTemplate[] => {
  const applicableSuggestions = ALL_SUGGESTIONS.filter(suggestion =>
    evaluateSuggestionConditions(suggestion, context)
  );
  
  // Sort by priority and impact
  const sortedSuggestions = applicableSuggestions.sort((a, b) => {
    // Primary sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // Secondary sort by impact (high > medium > low)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
  
  return sortedSuggestions.slice(0, maxSuggestions);
};

// Function to get suggestions for a specific factor
export const getFactorSuggestions = (
  factorName: string,
  context: SuggestionContext,
  maxSuggestions: number = 3
): SuggestionTemplate[] => {
  const factorSuggestions = ALL_SUGGESTIONS.filter(suggestion =>
    suggestion.category === factorName && 
    evaluateSuggestionConditions(suggestion, context)
  );
  
  return factorSuggestions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxSuggestions);
};

// Function to get quick fix suggestions
export const getQuickFixSuggestions = (
  context: SuggestionContext,
  maxSuggestions: number = 3
): SuggestionTemplate[] => {
  const quickFixes = ALL_SUGGESTIONS.filter(suggestion =>
    suggestion.quickFix && 
    evaluateSuggestionConditions(suggestion, context)
  );
  
  return quickFixes
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxSuggestions);
}; 