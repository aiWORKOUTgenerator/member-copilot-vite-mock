// Educational Content System - Learning Resources
// Provides contextual educational content based on user selections and profile

import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';

// Constants
const LOW_SCORE_THRESHOLD = 0.6;

export interface EducationalContentTemplate {
  id: string;
  title: string;
  content: string;
  category: 'selection' | 'fitness' | 'safety' | 'equipment' | 'goals';
  priority: number;
  learnMoreUrl?: string;
  conditions: EducationalCondition[];
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface EducationalCondition {
  factor: string;
  operator: 'lt' | 'lte' | 'eq' | 'gte' | 'gt';
  value: number | string | boolean;
  field?: string;
}

export interface EducationalContext {
  userProfile: UserProfile;
  workoutOptions: PerWorkoutOptions;
  factorScores: Record<string, number>;
  overallScore: number;
}

// General Selection Education
export const SELECTION_EDUCATION: EducationalContentTemplate[] = [
  {
    id: 'selection-basics',
    title: 'Understanding Workout Selection',
    content: 'Your workout selections directly impact the effectiveness and safety of your training. Consider how each choice aligns with your goals, fitness level, and available resources.',
    category: 'selection',
    priority: 1,
    learnMoreUrl: '/education/workout-selection-basics',
    conditions: [],
    targetAudience: 'all'
  },
  {
    id: 'selection-progressive-disclosure',
    title: 'Progressive Workout Planning',
    content: 'Start with foundational movements and gradually increase complexity. This approach builds confidence, prevents injury, and ensures long-term progress.',
    category: 'selection',
    priority: 2,
    learnMoreUrl: '/education/progressive-training',
    conditions: [
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'beginner' }
    ],
    targetAudience: 'beginner'
  }
];

// Fitness Education
export const FITNESS_EDUCATION: EducationalContentTemplate[] = [
  {
    id: 'fitness-goal-setting',
    title: 'Setting Realistic Fitness Goals',
    content: 'Effective goal setting involves creating specific, measurable, and achievable targets. Consider your current fitness level and available time when planning.',
    category: 'fitness',
    priority: 1,
    learnMoreUrl: '/education/goal-setting',
    conditions: [
      { factor: 'goalAlignment', operator: 'lt', value: 0.7 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'fitness-intensity-understanding',
    title: 'Understanding Workout Intensity',
    content: 'Intensity refers to how hard you work during exercise. It should match your fitness level and goals, balancing challenge with safety.',
    category: 'fitness',
    priority: 2,
    learnMoreUrl: '/education/intensity-guide',
    conditions: [
      { factor: 'intensityMatch', operator: 'lt', value: 0.7 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'fitness-duration-optimization',
    title: 'Optimizing Workout Duration',
    content: 'Workout duration should balance effectiveness with your available time. Quality often matters more than quantity.',
    category: 'fitness',
    priority: 2,
    learnMoreUrl: '/education/workout-duration',
    conditions: [
      { factor: 'durationFit', operator: 'lt', value: 0.7 }
    ],
    targetAudience: 'all'
  }
];

// Safety Education
export const SAFETY_EDUCATION: EducationalContentTemplate[] = [
  {
    id: 'safety-injury-prevention',
    title: 'Injury Prevention Fundamentals',
    content: 'Proper form, adequate warm-up, and listening to your body are essential for preventing injuries and maintaining long-term fitness.',
    category: 'safety',
    priority: 1,
    learnMoreUrl: '/education/injury-prevention',
    conditions: [
      { factor: 'recoveryRespect', operator: 'lt', value: 0.7 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'safety-recovery-importance',
    title: 'The Importance of Recovery',
    content: 'Recovery is when your body adapts and grows stronger. Adequate rest, sleep, and nutrition are crucial for progress.',
    category: 'safety',
    priority: 2,
    learnMoreUrl: '/education/recovery-basics',
    conditions: [
      { factor: 'recoveryRespect', operator: 'lt', value: 0.6 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'safety-beginner-guidance',
    title: 'Safe Progression for Beginners',
    content: 'Start slowly and focus on proper form. It\'s better to do fewer repetitions correctly than many with poor technique.',
    category: 'safety',
    priority: 1,
    learnMoreUrl: '/education/beginner-safety',
    conditions: [
      { factor: 'userProfile.fitnessLevel', operator: 'eq', value: 'beginner' }
    ],
    targetAudience: 'beginner'
  }
];

// Equipment Education
export const EQUIPMENT_EDUCATION: EducationalContentTemplate[] = [
  {
    id: 'equipment-bodyweight-basics',
    title: 'Effective Bodyweight Training',
    content: 'Bodyweight exercises can be highly effective and require minimal equipment. Focus on proper form and progressive difficulty.',
    category: 'equipment',
    priority: 1,
    learnMoreUrl: '/education/bodyweight-exercises',
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.6 },
      { factor: 'userProfile.basicLimitations.availableEquipment', operator: 'lt', value: 2 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'equipment-space-optimization',
    title: 'Working Out in Small Spaces',
    content: 'Limited space doesn\'t mean limited results. Choose exercises that work well in your available area.',
    category: 'equipment',
    priority: 2,
    learnMoreUrl: '/education/small-space-workouts',
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.6 },
      { factor: 'userProfile.basicLimitations.availableLocations', operator: 'lt', value: 2 }
    ],
    targetAudience: 'all'
  },
  {
    id: 'equipment-investment-guide',
    title: 'Smart Equipment Investment',
    content: 'Consider your goals and space when choosing equipment. Start with versatile, affordable options.',
    category: 'equipment',
    priority: 3,
    learnMoreUrl: '/education/equipment-guide',
    conditions: [
      { factor: 'equipmentOptimization', operator: 'lt', value: 0.5 }
    ],
    targetAudience: 'all'
  }
];

// Goal-Specific Education
export const GOAL_EDUCATION: EducationalContentTemplate[] = [
  {
    id: 'goal-weight-loss-science',
    title: 'Weight Loss Science',
    content: 'Weight loss requires a calorie deficit. Cardio burns more calories during exercise, while strength training increases metabolic rate long-term.',
    category: 'goals',
    priority: 1,
    learnMoreUrl: '/education/weight-loss-science',
    conditions: [
      { factor: 'userProfile.goals', operator: 'eq', value: 'weight loss' }
    ],
    targetAudience: 'all'
  },
  {
    id: 'goal-strength-building',
    title: 'Building Strength and Muscle',
    content: 'Strength training with progressive overload is key to building muscle. Focus on compound movements and proper form.',
    category: 'goals',
    priority: 1,
    learnMoreUrl: '/education/strength-building',
    conditions: [
      { factor: 'userProfile.goals', operator: 'eq', value: 'strength' }
    ],
    targetAudience: 'all'
  },
  {
    id: 'goal-flexibility-mobility',
    title: 'Improving Flexibility and Mobility',
    content: 'Flexibility training improves range of motion and can prevent injury. Include both static and dynamic stretching.',
    category: 'goals',
    priority: 1,
    learnMoreUrl: '/education/flexibility-training',
    conditions: [
      { factor: 'userProfile.goals', operator: 'eq', value: 'flexibility' }
    ],
    targetAudience: 'all'
  },
  {
    id: 'goal-endurance-building',
    title: 'Building Endurance',
    content: 'Endurance training improves cardiovascular health and stamina. Gradually increase duration and intensity.',
    category: 'goals',
    priority: 1,
    learnMoreUrl: '/education/endurance-training',
    conditions: [
      { factor: 'userProfile.goals', operator: 'eq', value: 'endurance' }
    ],
    targetAudience: 'all'
  }
];

// All educational content combined
export const ALL_EDUCATIONAL_CONTENT: EducationalContentTemplate[] = [
  ...SELECTION_EDUCATION,
  ...FITNESS_EDUCATION,
  ...SAFETY_EDUCATION,
  ...EQUIPMENT_EDUCATION,
  ...GOAL_EDUCATION
];

// Helper function to evaluate educational conditions
export const evaluateEducationalCondition = (
  condition: EducationalCondition,
  context: EducationalContext
): boolean => {
  const { factor, operator, value, field } = condition;
  
  let actualValue: unknown;
  
  if (field) {
    // Handle nested object access - simplified approach
    const fieldPath = field.split('.');
    let current: unknown = context;
    for (const key of fieldPath) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        current = undefined;
        break;
      }
    }
    actualValue = current;
  } else {
    // Handle factor scores
    actualValue = context.factorScores[factor];
  }
  
  switch (operator) {
    case 'lt':
      return (actualValue as number) < (value as number);
    case 'lte':
      return (actualValue as number) <= (value as number);
    case 'eq':
      return actualValue === value;
    case 'gte':
      return (actualValue as number) >= (value as number);
    case 'gt':
      return (actualValue as number) > (value as number);
    default:
      return false;
  }
};

// Helper function to evaluate all conditions for educational content
export const evaluateEducationalConditions = (
  content: EducationalContentTemplate,
  context: EducationalContext
): boolean => {
  return content.conditions.every(condition => 
    evaluateEducationalCondition(condition, context)
  );
};

// Helper function to check if content matches target audience
export const matchesTargetAudience = (
  content: EducationalContentTemplate,
  userFitnessLevel: string
): boolean => {
  return content.targetAudience === 'all' || content.targetAudience === userFitnessLevel;
};

// Main function to get applicable educational content
export const getApplicableEducationalContent = (
  context: EducationalContext,
  maxContent: number = 3
): EducationalContentTemplate[] => {
  const applicableContent = ALL_EDUCATIONAL_CONTENT.filter(content =>
    evaluateEducationalConditions(content, context) &&
    matchesTargetAudience(content, context.userProfile.fitnessLevel)
  );
  
  // Sort by priority
  const sortedContent = applicableContent.sort((a, b) => a.priority - b.priority);
  
  return sortedContent.slice(0, maxContent);
};

// Function to get educational content for a specific category
export const getCategoryEducationalContent = (
  category: string,
  context: EducationalContext,
  maxContent: number = 2
): EducationalContentTemplate[] => {
  const categoryContent = ALL_EDUCATIONAL_CONTENT.filter(content =>
    content.category === category &&
    evaluateEducationalConditions(content, context) &&
    matchesTargetAudience(content, context.userProfile.fitnessLevel)
  );
  
  return categoryContent
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxContent);
};

// Function to get educational content for low-scoring factors
export const getLowScoreEducationalContent = (
  context: EducationalContext,
  maxContent: number = 2
): EducationalContentTemplate[] => {
  const lowScoreFactors = Object.entries(context.factorScores)
    .filter(([_, score]) => score < LOW_SCORE_THRESHOLD)
    .map(([factor, _]) => factor);
  
  const relevantContent = ALL_EDUCATIONAL_CONTENT.filter(content =>
    content.conditions.some(condition => 
      lowScoreFactors.includes(condition.factor)
    ) &&
    evaluateEducationalConditions(content, context) &&
    matchesTargetAudience(content, context.userProfile.fitnessLevel)
  );
  
  return relevantContent
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxContent);
};

// Function to get beginner-specific educational content
export const getBeginnerEducationalContent = (
  context: EducationalContext,
  maxContent: number = 2
): EducationalContentTemplate[] => {
  const beginnerContent = ALL_EDUCATIONAL_CONTENT.filter(content =>
    content.targetAudience === 'beginner' &&
    evaluateEducationalConditions(content, context)
  );
  
  return beginnerContent
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxContent);
}; 