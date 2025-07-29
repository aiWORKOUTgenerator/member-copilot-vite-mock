// Equipment Fit Calculator - Analyzes equipment availability alignment
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout } from '../../../../../types/workout-generation.types';
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
    // For now, return a default equipment fit score
    // This will be implemented with actual equipment matching logic
    return 0.85;
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