import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';
import { 
  SelectionAnalyzer, 
  FactorAnalysis, 
  SelectionAnalysisContext 
} from '../types/selection-analysis.types';

/**
 * Analyzes how well the selected duration fits user's profile and context
 * Considers fitness level, goals, time availability, and workout type
 */
export class DurationFitAnalyzer implements SelectionAnalyzer {
  
  /**
   * Analyze duration fit of user's selections
   */
  async analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    _context: SelectionAnalysisContext
  ): Promise<FactorAnalysis> {
    const scores: number[] = [];
    const details: string[] = [];
    const suggestions: string[] = [];

    // 1. Fitness Level Duration Match (30% weight)
    const fitnessScore = this.analyzeFitnessLevelDurationMatch(userProfile, workoutOptions);
    scores.push(fitnessScore.score * 0.3);
    details.push(...fitnessScore.details);
    if (fitnessScore.suggestions) suggestions.push(...fitnessScore.suggestions);

    // 2. Goal Achievement Duration (25% weight)
    const goalScore = this.analyzeGoalAchievementDuration(userProfile, workoutOptions);
    scores.push(goalScore.score * 0.25);
    details.push(...goalScore.details);
    if (goalScore.suggestions) suggestions.push(...goalScore.suggestions);

    // 3. Workout Type Duration Optimization (25% weight)
    const typeScore = this.analyzeWorkoutTypeDurationOptimization(userProfile, workoutOptions);
    scores.push(typeScore.score * 0.25);
    details.push(...typeScore.details);
    if (typeScore.suggestions) suggestions.push(...typeScore.suggestions);

    // 4. Time Availability Consideration (20% weight)
    const availabilityScore = this.analyzeTimeAvailabilityConsideration(userProfile, workoutOptions);
    scores.push(availabilityScore.score * 0.2);
    details.push(...availabilityScore.details);
    if (availabilityScore.suggestions) suggestions.push(...availabilityScore.suggestions);

    const overallScore = scores.reduce((sum, score) => sum + score, 0);
    const status = this.getStatus(overallScore);
    const reasoning = this.generateReasoning(overallScore, userProfile, workoutOptions);
    const impact = this.generateImpact(overallScore, userProfile);

    return {
      score: overallScore,
      status,
      reasoning,
      impact,
      details,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Analyze how well duration matches user's fitness level
   */
  private analyzeFitnessLevelDurationMatch(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const fitnessLevel = userProfile.fitnessLevel || 'beginner';
    const duration = this.getDurationValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let fitnessScore = 0.8; // Base score

    // Adjust based on fitness level
    if (fitnessLevel === 'beginner') {
      if (duration === 'long') {
        fitnessScore -= 0.4;
        details.push('Long duration may be overwhelming for someone new to exercise');
        suggestions.push('Consider "Short" or "Medium" duration for easier adaptation');
      } else if (duration === 'short') {
        fitnessScore += 0.1;
        details.push('Short duration is perfect for building exercise habits');
      }
    } else if (fitnessLevel === 'intermediate') {
      if (duration === 'long') {
        fitnessScore -= 0.1;
        details.push('Long duration is manageable with some experience');
      } else if (duration === 'short') {
        fitnessScore += 0.05;
        details.push('Short duration works well for your experience level');
      }
    } else if (fitnessLevel === 'advanced') {
      if (duration === 'short') {
        fitnessScore -= 0.2;
        details.push('Short duration may not provide sufficient training stimulus for advanced level');
        suggestions.push('Consider "Medium" or "Long" duration for better training effect');
      } else if (duration === 'long') {
        fitnessScore += 0.1;
        details.push('Long duration supports advanced training needs');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, fitnessScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well duration supports goal achievement
   */
  private analyzeGoalAchievementDuration(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const userGoals = userProfile.goals || [];
    const duration = this.getDurationValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let goalScore = 0.8; // Base score

    if (userGoals.length === 0) {
      details.push('No specific goals set - duration selection is acceptable');
      return { score: goalScore, details };
    }

    userGoals.forEach((goal: string) => {
      const goalLower = goal.toLowerCase();
      
      if (this.isWeightLossGoal(goalLower)) {
        if (duration === 'short') {
          goalScore -= 0.2;
          details.push('Short duration may limit calorie burn for weight loss');
          suggestions.push('Consider "Medium" or "Long" duration for better weight loss results');
        } else if (duration === 'long') {
          goalScore += 0.1;
          details.push('Long duration supports weight loss goals through increased calorie burn');
        }
      } else if (this.isStrengthGoal(goalLower)) {
        if (duration === 'short') {
          goalScore -= 0.1;
          details.push('Short duration may limit strength training volume');
        } else if (duration === 'long') {
          goalScore += 0.05;
          details.push('Long duration allows for comprehensive strength training');
        }
      } else if (this.isCardioGoal(goalLower)) {
        if (duration === 'short') {
          goalScore -= 0.3;
          details.push('Short duration may not provide sufficient cardio stimulus');
          suggestions.push('Consider "Medium" or "Long" duration for better cardio development');
        } else if (duration === 'long') {
          goalScore += 0.2;
          details.push('Long duration is excellent for cardio development');
        }
      } else if (this.isFlexibilityGoal(goalLower)) {
        if (duration === 'short') {
          goalScore -= 0.1;
          details.push('Short duration may limit flexibility work');
        } else if (duration === 'long') {
          goalScore += 0.1;
          details.push('Long duration allows for comprehensive flexibility work');
        }
      }
    });

    return { 
      score: Math.max(0, Math.min(1, goalScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well duration is optimized for workout type
   */
  private analyzeWorkoutTypeDurationOptimization(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const workoutFocus = this.getFocusValue(workoutOptions);
    const duration = this.getDurationValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let typeScore = 0.8; // Base score

    // Analyze duration optimization for different workout types
    if (this.isHighIntensityFocus(workoutFocus)) {
      if (duration === 'long' && energyLevel === 'high') {
        typeScore -= 0.3;
        details.push('Long duration with high energy may lead to overtraining');
        suggestions.push('Consider "Medium" duration for high-intensity workouts');
      } else if (duration === 'short' && energyLevel === 'high') {
        typeScore += 0.1;
        details.push('Short duration is perfect for high-intensity training');
      }
    } else if (this.isStrengthFocus(workoutFocus)) {
      if (duration === 'short') {
        typeScore -= 0.2;
        details.push('Short duration may limit strength training effectiveness');
        suggestions.push('Consider "Medium" or "Long" duration for strength training');
      } else if (duration === 'long') {
        typeScore += 0.1;
        details.push('Long duration supports comprehensive strength training');
      }
    } else if (this.isCardioFocus(workoutFocus)) {
      if (duration === 'short') {
        typeScore -= 0.3;
        details.push('Short duration may not provide sufficient cardio stimulus');
        suggestions.push('Consider "Medium" or "Long" duration for cardio training');
      } else if (duration === 'long') {
        typeScore += 0.2;
        details.push('Long duration is excellent for cardio development');
      }
    } else if (this.isFlexibilityFocus(workoutFocus)) {
      if (duration === 'short') {
        typeScore -= 0.1;
        details.push('Short duration may limit flexibility work');
      } else if (duration === 'long') {
        typeScore += 0.1;
        details.push('Long duration allows for comprehensive flexibility work');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, typeScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well duration considers time availability
   */
  private analyzeTimeAvailabilityConsideration(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const duration = this.getDurationValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let availabilityScore = 0.8; // Base score

    // Since preferredWorkoutDuration is not available in the current type,
    // we'll use a simplified approach based on fitness level
    const fitnessLevel = userProfile.fitnessLevel;
    
    if (fitnessLevel === 'beginner' && duration === 'long') {
      availabilityScore -= 0.1;
      details.push('Long duration may be challenging to maintain for beginners');
      suggestions.push('Consider "Medium" duration for better consistency');
    } else if (fitnessLevel === 'advanced' && duration === 'short') {
      availabilityScore -= 0.1;
      details.push('Short duration may not meet advanced training needs');
      suggestions.push('Consider "Medium" or "Long" duration for better results');
    }

    return { 
      score: Math.max(0, Math.min(1, availabilityScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Get status based on score
   */
  private getStatus(score: number): 'excellent' | 'good' | 'warning' | 'poor' {
    if (score >= 0.85) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'warning';
    return 'poor';
  }

  /**
   * Generate reasoning for the score
   */
  private generateReasoning(
    score: number, 
    userProfile: UserProfile, 
    workoutOptions: PerWorkoutOptions
  ): string {
    const fitnessLevel = userProfile.fitnessLevel || 'beginner';
    const duration = this.getDurationValue(workoutOptions);
    const workoutFocus = this.getFocusValue(workoutOptions);

    if (score >= 0.85) {
      return `Excellent duration fit! Your ${duration} selection is perfectly suited for your ${fitnessLevel} level and ${workoutFocus} focus.`;
    } else if (score >= 0.7) {
      return `Good duration fit. Your ${duration} selection generally works well for your profile and goals.`;
    } else if (score >= 0.5) {
      return `Moderate duration fit. Your ${duration} selection may need adjustment for optimal results.`;
    } else {
      return `Poor duration fit. Your ${duration} selection may not be appropriate for your current needs and goals.`;
    }
  }

  /**
   * Generate impact description
   */
  private generateImpact(score: number, _userProfile: UserProfile): string {
    if (score >= 0.85) {
      return 'Your duration selection will maximize workout effectiveness and goal achievement.';
    } else if (score >= 0.7) {
      return 'Your duration selection will provide good results with minor optimizations possible.';
    } else if (score >= 0.5) {
      return 'Your duration selection may limit workout effectiveness or goal progress.';
    } else {
      return 'Your duration selection may significantly impact workout quality and goal achievement.';
    }
  }

  // Helper methods for goal and focus classification
  private isWeightLossGoal(goal: string): boolean {
    return goal.includes('weight') || goal.includes('fat') || goal.includes('slim') || goal.includes('lean');
  }

  private isStrengthGoal(goal: string): boolean {
    return goal.includes('strength') || goal.includes('muscle') || goal.includes('power') || goal.includes('build');
  }

  private isCardioGoal(goal: string): boolean {
    return goal.includes('cardio') || goal.includes('endurance') || goal.includes('stamina') || goal.includes('heart');
  }

  private isFlexibilityGoal(goal: string): boolean {
    return goal.includes('flexibility') || goal.includes('mobility') || goal.includes('stretch') || goal.includes('yoga');
  }

  private isHighIntensityFocus(focus: string): boolean {
    return focus.includes('high intensity') || focus.includes('quick sweat') || focus.includes('burn');
  }

  private isStrengthFocus(focus: string): boolean {
    return focus.includes('strength') || focus.includes('muscle') || focus.includes('power');
  }

  private isCardioFocus(focus: string): boolean {
    return focus.includes('cardio') || focus.includes('endurance') || focus.includes('sweat') || focus.includes('burn');
  }

  private isFlexibilityFocus(focus: string): boolean {
    return focus.includes('flexibility') || focus.includes('mobility') || focus.includes('stretch') || focus.includes('yoga');
  }

  // Helper methods for extracting values from complex types
  private getDurationValue(workoutOptions: PerWorkoutOptions): string {
    const duration = workoutOptions.customization_duration;
    if (typeof duration === 'number') {
      if (duration <= 20) return 'short';
      if (duration <= 45) return 'medium';
      return 'long';
    }
    if (duration?.duration) {
      if (duration.duration <= 20) return 'short';
      if (duration.duration <= 45) return 'medium';
      return 'long';
    }
    return 'medium'; // default
  }

  private getFocusValue(workoutOptions: PerWorkoutOptions): string {
    const focus = workoutOptions.customization_focus;
    if (typeof focus === 'string') return focus;
    if (focus?.focus) return focus.focus;
    return 'general';
  }

  private getEnergyValue(workoutOptions: PerWorkoutOptions): string {
    const energy = workoutOptions.customization_energy?.rating;
    if (energy <= 3) return 'low';
    if (energy <= 7) return 'moderate';
    return 'high';
  }

  getAnalyzerName(): string {
    return 'durationFit';
  }

  getWeight(): number {
    return 0.2;
  }

  getDescription(): string {
    return 'Analyzes how well selected duration fits user profile and goals';
  }
} 