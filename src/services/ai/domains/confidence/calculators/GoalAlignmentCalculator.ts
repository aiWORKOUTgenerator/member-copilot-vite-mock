// Goal Alignment Calculator - Analyzes workout-to-goals alignment
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { ConfidenceContext, FactorCalculator } from '../types/confidence.types';

/**
 * Calculates how well a workout aligns with user's fitness goals
 * Considers primary goal, workout focus, and exercise selection
 */
export class GoalAlignmentCalculator implements FactorCalculator {
  
  /**
   * Calculate goal alignment score (0-1)
   */
  async calculate(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<number> {
    // For now, return a default goal alignment score
    // This will be implemented with actual goal matching logic
    return 0.9;
  }

  /**
   * Get factor name
   */
  getFactorName(): string {
    return 'goalAlignment';
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
    return 'Measures how well the workout aligns with the user\'s primary fitness goals';
  }
} 