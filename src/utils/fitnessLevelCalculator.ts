// Fitness Level Calculator
// Calculates fitness level based on Experience Level and Current Activity Level

export type ExperienceLevel = 'New to Exercise' | 'Some Experience' | 'Advanced Athlete';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extremely' | 'varies';
export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';
export type TargetActivityLevel = 'lightly' | 'light-moderate' | 'moderately' | 'active' | 'very' | 'extremely';
export type WorkoutIntensity = 'low' | 'moderate' | 'high';

/**
 * Calculate fitness level based on experience and activity level
 * Uses a 5-level model that combines both factors for accurate assessment
 */
export function calculateFitnessLevel(
  experienceLevel: ExperienceLevel,
  activityLevel: ActivityLevel
): FitnessLevel {
  // Special case: Adaptive level for users with varying activity
  if (activityLevel === 'varies') {
    return 'adaptive';
  }

  // Level 1: Beginner (New to Exercise/Sedentary)
  if (experienceLevel === 'New to Exercise' && 
      (activityLevel === 'sedentary' || activityLevel === 'light')) {
    return 'beginner';
  }

  // Level 2: Novice (New to Exercise/Moderate Activity or Some Experience/Sedentary)
  if ((experienceLevel === 'New to Exercise' && activityLevel === 'moderate') ||
      (experienceLevel === 'Some Experience' && 
       (activityLevel === 'sedentary' || activityLevel === 'light'))) {
    return 'novice';
  }

  // Level 3: Intermediate (Some Experience/Moderate-to-Active)
  if (experienceLevel === 'Some Experience' && 
      (activityLevel === 'moderate' || activityLevel === 'very')) {
    return 'intermediate';
  }

  // Level 4: Advanced (Advanced Athlete/Active-to-Extremely Active)
  if ((experienceLevel === 'Advanced Athlete') ||
      (experienceLevel === 'Some Experience' && activityLevel === 'extremely')) {
    return 'advanced';
  }

  // Default fallback for edge cases
  return 'intermediate';
}

/**
 * Get description for fitness level
 */
export function getFitnessLevelDescription(fitnessLevel: FitnessLevel): string {
  const descriptions = {
    beginner: 'Minimal current fitness. Starting foundational movements, low intensity.',
    novice: 'Basic fitness. Has either some foundational skills or regular but gentle activity. Moderate intensity recommended.',
    intermediate: 'Established fitness routine, moderate-to-high intensity manageable, can safely progress.',
    advanced: 'High fitness, accustomed to intense training, able to handle advanced workouts regularly.',
    adaptive: 'Requires adaptive workout intensity, tailored day-to-day based on current energy and soreness assessments.'
  };
  
  return descriptions[fitnessLevel];
}

/**
 * Get recommended intensity range for fitness level
 */
export function getFitnessLevelIntensityRange(fitnessLevel: FitnessLevel): {
  min: number;
  max: number;
  description: string;
} {
  const ranges = {
    beginner: { min: 1, max: 4, description: 'Low intensity, focus on form and building habits' },
    novice: { min: 2, max: 6, description: 'Moderate intensity, gradual progression' },
    intermediate: { min: 4, max: 8, description: 'Moderate-to-high intensity, structured progression' },
    advanced: { min: 6, max: 10, description: 'High intensity, advanced training methods' },
    adaptive: { min: 1, max: 10, description: 'Variable intensity based on daily assessment' }
  };
  
  return ranges[fitnessLevel];
}

/**
 * Validate that the calculated fitness level makes sense
 */
export function validateFitnessLevelCalculation(
  experienceLevel: ExperienceLevel,
  activityLevel: ActivityLevel,
  calculatedFitnessLevel: FitnessLevel
): boolean {
  // Recalculate to verify
  const expectedFitnessLevel = calculateFitnessLevel(experienceLevel, activityLevel);
  return expectedFitnessLevel === calculatedFitnessLevel;
} 

/**
 * Calculate workout intensity based on fitness level and target activity level
 * Formula: Target Workout Intensity = User's Fitness Level + Desired Target Activity Adjustment
 */
export function calculateWorkoutIntensity(
  fitnessLevel: FitnessLevel,
  targetActivityLevel: TargetActivityLevel
): WorkoutIntensity {
  // Convert fitness level to numeric (1-5)
  const fitnessLevelNumeric = getFitnessLevelNumeric(fitnessLevel);
  
  // Get target activity adjustment (0-5)
  const targetActivityAdjustment = getTargetActivityAdjustment(targetActivityLevel);
  
  // Calculate final intensity (1-10 scale)
  const calculatedIntensity = Math.min(10, fitnessLevelNumeric + targetActivityAdjustment);
  
  // Convert to workout intensity category
  return convertIntensityToCategory(calculatedIntensity);
}

/**
 * Convert fitness level to numeric value (1-5)
 */
function getFitnessLevelNumeric(fitnessLevel: FitnessLevel): number {
  const fitnessLevelMap = {
    beginner: 1,
    novice: 2,
    intermediate: 3,
    advanced: 4,
    adaptive: 3 // Default to intermediate for adaptive
  };
  
  return fitnessLevelMap[fitnessLevel];
}

/**
 * Get target activity adjustment value (0-5)
 */
function getTargetActivityAdjustment(targetActivityLevel: TargetActivityLevel): number {
  const adjustmentMap = {
    'lightly': 0,
    'light-moderate': 1,
    'moderately': 2,
    'active': 3,
    'very': 4,
    'extremely': 5
  };
  
  return adjustmentMap[targetActivityLevel];
}

/**
 * Convert numeric intensity (1-10) to workout intensity category
 * Based on user specification:
 * 1-2 (Very Low Intensity): Gentle movement and stretching
 * 3-4 (Low Intensity): Comfortable, easy-paced activities  
 * 5-6 (Moderate Intensity): Challenging but manageable, building fitness
 * 7-8 (High Intensity): Vigorous and demanding, pushing limits
 * 9-10 (Very High Intensity): Advanced and rigorous workouts, maximal effort
 */
function convertIntensityToCategory(intensity: number): WorkoutIntensity {
  if (intensity <= 4) {
    return 'low';
  } else if (intensity <= 6) {
    return 'moderate';
  } else {
    return 'high';
  }
}

/**
 * Get intensity description and range for calculated workout intensity
 */
export function getWorkoutIntensityDetails(intensity: WorkoutIntensity): {
  description: string;
  range: string;
  guidance: string;
} {
  const details = {
    low: {
      description: 'Low Intensity Workouts',
      range: '1-4/10',
      guidance: 'Gentle movement and stretching, comfortable easy-paced activities'
    },
    moderate: {
      description: 'Moderate Intensity Workouts',
      range: '5-6/10',
      guidance: 'Challenging but manageable, building fitness with structured progression'
    },
    high: {
      description: 'High Intensity Workouts',
      range: '7-10/10',
      guidance: 'Vigorous and demanding, pushing limits with advanced training methods'
    }
  };
  
  return details[intensity];
} 