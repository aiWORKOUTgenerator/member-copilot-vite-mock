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
    // Get user goals
    const userGoals = userProfile.goals || [];
    const workoutFocus = workoutData.mainWorkout?.name?.toLowerCase() || '';
    const workoutDescription = workoutData.description?.toLowerCase() || '';

    if (userGoals.length === 0) {
      return 0.7; // Default score if no goals specified
    }

    let goalAlignmentScore = 0.0;
    let goalCount = 0;

    // Analyze each user goal against workout characteristics
    userGoals.forEach((goal: string) => {
      goalCount++;
      const goalScore = this.calculateGoalScore(goal, workoutFocus, workoutDescription);
      goalAlignmentScore += goalScore;
    });

    // Calculate average goal alignment
    const averageGoalAlignment = goalCount > 0 ? goalAlignmentScore / goalCount : 0.7;

    // Consider workout type from context
    let contextAdjustment = 0;
    if (context.workoutType === 'detailed') {
      // Detailed workouts are typically more goal-specific
      contextAdjustment += 0.05;
    }

    // Consider user preferences
    const userPreferences = userProfile.preferences?.workoutStyle || [];
    if (userPreferences.length > 0) {
      const hasMatchingStyle = userPreferences.some(style => 
        workoutFocus.includes(style.toLowerCase()) || workoutDescription.includes(style.toLowerCase())
      );
      if (hasMatchingStyle) {
        contextAdjustment += 0.05;
      }
    }

    // Return final score with adjustments
    return Math.max(0.1, Math.min(1.0, averageGoalAlignment + contextAdjustment));
  }

  /**
   * Calculate individual goal score based on goal type and workout characteristics
   */
  private calculateGoalScore(goal: string, workoutFocus: string, workoutDescription: string): number {
    const goalLower = goal.toLowerCase();
    
    if (this.isStrengthGoal(goalLower)) {
      return this.calculateStrengthGoalScore(workoutFocus, workoutDescription);
    }
    
    if (this.isCardioGoal(goalLower)) {
      return this.calculateCardioGoalScore(workoutFocus, workoutDescription);
    }
    
    if (this.isWeightLossGoal(goalLower)) {
      return this.calculateWeightLossGoalScore(workoutFocus, workoutDescription);
    }
    
    if (this.isFlexibilityGoal(goalLower)) {
      return this.calculateFlexibilityGoalScore(workoutFocus, workoutDescription);
    }
    
    // General fitness goals
    return 0.8; // Good alignment for general fitness goals
  }

  private isStrengthGoal(goalLower: string): boolean {
    return goalLower.includes('strength') || goalLower.includes('muscle');
  }

  private isCardioGoal(goalLower: string): boolean {
    return goalLower.includes('cardio') || goalLower.includes('endurance') || goalLower.includes('stamina');
  }

  private isWeightLossGoal(goalLower: string): boolean {
    return goalLower.includes('weight') || goalLower.includes('fat') || goalLower.includes('loss');
  }

  private isFlexibilityGoal(goalLower: string): boolean {
    return goalLower.includes('flexibility') || goalLower.includes('mobility') || goalLower.includes('stretch');
  }

  private calculateStrengthGoalScore(workoutFocus: string, workoutDescription: string): number {
    if (this.hasStrengthFocus(workoutFocus, workoutDescription)) {
      return 1.0;
    } else if (this.hasCardioFocus(workoutFocus, workoutDescription)) {
      return 0.3; // Lower alignment for cardio when strength is goal
    } else {
      return 0.6; // Moderate alignment for general workouts
    }
  }

  private calculateCardioGoalScore(workoutFocus: string, workoutDescription: string): number {
    if (this.hasCardioFocus(workoutFocus, workoutDescription)) {
      return 1.0;
    } else if (this.hasStrengthFocus(workoutFocus, workoutDescription)) {
      return 0.4; // Lower alignment for strength when cardio is goal
    } else {
      return 0.7; // Moderate alignment for general workouts
    }
  }

  private calculateWeightLossGoalScore(workoutFocus: string, workoutDescription: string): number {
    if (this.hasCardioFocus(workoutFocus, workoutDescription) || 
        workoutFocus.includes('hiit') || workoutDescription.includes('calorie') || workoutDescription.includes('burn')) {
      return 1.0;
    } else if (workoutFocus.includes('strength')) {
      return 0.8; // Good alignment as strength training also helps with weight loss
    } else {
      return 0.6; // Moderate alignment for general workouts
    }
  }

  private calculateFlexibilityGoalScore(workoutFocus: string, workoutDescription: string): number {
    if (workoutFocus.includes('yoga') || workoutFocus.includes('stretch') ||
        workoutDescription.includes('flexibility') || workoutDescription.includes('mobility')) {
      return 1.0;
    } else {
      return 0.3; // Lower alignment for non-flexibility focused workouts
    }
  }

  private hasStrengthFocus(workoutFocus: string, workoutDescription: string): boolean {
    return workoutFocus.includes('strength') || workoutFocus.includes('muscle') ||
           workoutDescription.includes('strength') || workoutDescription.includes('muscle');
  }

  private hasCardioFocus(workoutFocus: string, workoutDescription: string): boolean {
    return workoutFocus.includes('cardio') || workoutFocus.includes('endurance') ||
           workoutDescription.includes('cardio') || workoutDescription.includes('endurance');
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