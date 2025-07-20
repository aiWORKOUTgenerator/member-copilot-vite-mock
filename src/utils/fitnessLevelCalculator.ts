// Fitness Level Calculator
// Calculates fitness level based on Experience Level and Current Activity Level

export type ExperienceLevel = 'New to Exercise' | 'Some Experience' | 'Advanced Athlete';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extremely' | 'varies';
export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';

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