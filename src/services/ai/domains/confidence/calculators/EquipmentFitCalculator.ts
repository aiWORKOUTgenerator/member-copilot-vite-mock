// Equipment Fit Calculator - Analyzes equipment availability alignment
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout, Exercise } from '../../../../../types/workout-generation.types';
import { ConfidenceContext, FactorCalculator } from '../types/confidence.types';

/**
 * Calculates how well a workout matches available equipment
 * Considers equipment requirements vs. user's available equipment
 */
export class EquipmentFitCalculator implements FactorCalculator {
  
  /**
   * Calculate equipment fit score (0-1)
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

    let equipmentScore = 1.0;

    // Analyze each exercise for equipment requirements
    allExercises.forEach((exercise: Exercise) => {
      const requiredEquipment = exercise.equipment || [];
      
      // Check if user has the required equipment
      const userEquipment = userProfile.basicLimitations?.availableEquipment || [];
      const availableEquipment = userEquipment.map((eq: string) => eq.toLowerCase());
      
      // Calculate equipment match for this exercise
      let exerciseEquipmentScore = 1.0;
      
      if (requiredEquipment.length > 0) {
        const matchedEquipment = requiredEquipment.filter(eq => 
          availableEquipment.includes(eq.toLowerCase())
        );
        
        // Score based on percentage of required equipment available
        exerciseEquipmentScore = matchedEquipment.length / requiredEquipment.length;
      }
      
      // Reduce overall score based on equipment mismatch
      equipmentScore -= (1 - exerciseEquipmentScore) * 0.1;
    });

    // Consider workout type from context
    if (context.workoutType === 'detailed') {
      // Detailed workouts typically require more specialized equipment
      equipmentScore -= 0.05;
    }

    // Consider environmental factors
    if (context.environmentalFactors?.location === 'outdoor') {
      // Outdoor workouts might have different equipment requirements
      equipmentScore -= 0.03;
    }

    // Ensure score stays within 0-1 range
    return Math.max(0.1, Math.min(1.0, equipmentScore));
  }

  /**
   * Get factor name
   */
  getFactorName(): string {
    return 'equipmentFit';
  }

  /**
   * Get factor weight
   */
  getWeight(): number {
    return 0.15; // 15% weight
  }

  /**
   * Get factor description
   */
  getDescription(): string {
    return 'Measures how well the workout\'s equipment requirements match the user\'s available equipment';
  }
} 