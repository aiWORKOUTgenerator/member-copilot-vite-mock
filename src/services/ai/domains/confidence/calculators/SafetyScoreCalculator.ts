// Safety Score Calculator - Analyzes workout safety alignment
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout, Exercise } from '../../../../../types/workout-generation.types';
import { ConfidenceContext, FactorCalculator } from '../types/confidence.types';

/**
 * Calculates how well a workout accommodates user safety concerns
 * Considers injuries, soreness areas, and exercise safety
 */
export class SafetyScoreCalculator implements FactorCalculator {
  
  /**
   * Calculate safety alignment score (0-1)
   */
  async calculate(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<number> {
    // Get all exercises from all phases
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 0.5; // Default score for empty workout
    }

    let safetyScore = 1.0;

    // Analyze each exercise for safety considerations
    allExercises.forEach((exercise: Exercise) => {
      // Check for high-risk exercise patterns
      const exerciseName = exercise.name?.toLowerCase() || '';
      const exerciseIntensity = exercise.intensity;
      
      // Reduce score for potentially risky exercises
      if (exerciseName.includes('jump') || exerciseName.includes('plyometric')) {
        safetyScore -= 0.1; // Jumping exercises can be risky
      }
      
      if (exerciseName.includes('deadlift') || exerciseName.includes('squat')) {
        // These are generally safe but require proper form
        safetyScore -= 0.05;
      }
      
      if (exerciseName.includes('overhead') || exerciseName.includes('press')) {
        safetyScore -= 0.08; // Overhead movements can strain shoulders
      }

      // Consider exercise intensity in safety assessment
      if (exerciseIntensity === 'high') {
        safetyScore -= 0.05; // High intensity exercises carry more risk
      }
    });

    // Consider user's fitness level in safety assessment
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    if (userFitnessLevel === 'beginner' || userFitnessLevel === 'novice') {
      // Beginners need more conservative safety margins
      safetyScore -= 0.1;
    }

    // Consider workout intensity and duration
    const totalDuration = workoutData.totalDuration / 60; // Convert to minutes
    if (totalDuration > 60) {
      // Longer workouts increase fatigue risk
      safetyScore -= 0.05;
    }

    // Consider environmental factors from context
    if (context.environmentalFactors?.location === 'outdoor') {
      safetyScore -= 0.03; // Outdoor workouts have additional environmental risks
    }

    // Consider workout type from context
    if (context.workoutType === 'detailed') {
      // Detailed workouts are typically more complex and may carry more risk
      safetyScore -= 0.02;
    }

    // Ensure score stays within 0-1 range
    return Math.max(0.1, Math.min(1.0, safetyScore));
  }

  /**
   * Get factor name
   */
  getFactorName(): string {
    return 'safetyAlignment';
  }

  /**
   * Get factor weight
   */
  getWeight(): number {
    return 0.20; // 20% weight
  }

  /**
   * Get factor description
   */
  getDescription(): string {
    return 'Measures how well the workout accommodates user injuries, soreness areas, and safety concerns';
  }
} 