import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';
import { 
  SelectionAnalyzer, 
  FactorAnalysis, 
  SelectionAnalysisContext 
} from '../types/selection-analysis.types';

/**
 * Analyzes how well workout selections align with user's fitness goals
 * Considers goal types, workout focus, and intensity alignment
 */
export class GoalAlignmentAnalyzer implements SelectionAnalyzer {
  
  /**
   * Analyze goal alignment of user's selections
   */
  async analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    _context: SelectionAnalysisContext
  ): Promise<FactorAnalysis> {
    const scores: number[] = [];
    const details: string[] = [];
    const suggestions: string[] = [];

    // 1. Goal Type Alignment (40% weight)
    const goalTypeScore = this.analyzeGoalTypeAlignment(userProfile, workoutOptions);
    scores.push(goalTypeScore.score * 0.4);
    details.push(...goalTypeScore.details);
    if (goalTypeScore.suggestions) suggestions.push(...goalTypeScore.suggestions);

    // 2. Workout Focus Match (30% weight)
    const focusScore = this.analyzeWorkoutFocusMatch(userProfile, workoutOptions);
    scores.push(focusScore.score * 0.3);
    details.push(...focusScore.details);
    if (focusScore.suggestions) suggestions.push(...focusScore.suggestions);

    // 3. Intensity Goal Alignment (30% weight)
    const intensityScore = this.analyzeIntensityGoalAlignment(userProfile, workoutOptions);
    scores.push(intensityScore.score * 0.3);
    details.push(...intensityScore.details);
    if (intensityScore.suggestions) suggestions.push(...intensityScore.suggestions);

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
   * Analyze how well the workout type aligns with user's primary goals
   */
  private analyzeGoalTypeAlignment(
    userProfile: UserProfile, 
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const userGoals = userProfile.goals || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    if (userGoals.length === 0) {
      details.push('No specific fitness goals set in profile');
      suggestions.push('Set your primary fitness goals for better workout recommendations');
      return { score: 0.5, details, suggestions };
    }

    let goalAlignmentScore = 0;
    let matchedGoals = 0;

    userGoals.forEach((goal: string) => {
      const goalLower = goal.toLowerCase();
      const focusLower = workoutFocus.toLowerCase();

      if (this.isStrengthGoal(goalLower) && this.hasStrengthFocus(focusLower)) {
        goalAlignmentScore += 1;
        matchedGoals++;
        details.push(`Strength goal "${goal}" aligns with ${workoutFocus} focus`);
      } else if (this.isCardioGoal(goalLower) && this.hasCardioFocus(focusLower)) {
        goalAlignmentScore += 1;
        matchedGoals++;
        details.push(`Cardio goal "${goal}" aligns with ${workoutFocus} focus`);
      } else if (this.isWeightLossGoal(goalLower) && this.hasWeightLossFocus(focusLower)) {
        goalAlignmentScore += 1;
        matchedGoals++;
        details.push(`Weight loss goal aligns with ${workoutFocus} focus`);
      } else if (this.isFlexibilityGoal(goalLower) && this.hasFlexibilityFocus(focusLower)) {
        goalAlignmentScore += 1;
        matchedGoals++;
        details.push(`Flexibility goal aligns with ${workoutFocus} focus`);
      } else {
        details.push(`Goal "${goal}" may not be optimally served by ${workoutFocus} focus`);
        suggestions.push(`Consider ${this.getAlternativeFocus(goalLower)} for better goal alignment`);
      }
    });

    const score = userGoals.length > 0 ? goalAlignmentScore / userGoals.length : 0.5;
    
    if (matchedGoals === 0 && userGoals.length > 0) {
      suggestions.push('Your selected workout focus may not align with your primary goals');
    }

    return { score, details, suggestions: suggestions.length > 0 ? suggestions : undefined };
  }

  /**
   * Analyze how well the workout focus matches user's experience and preferences
   */
  private analyzeWorkoutFocusMatch(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const workoutFocus = this.getFocusValue(workoutOptions);
    const userExperience = this.getExperienceFromFitnessLevel(userProfile.fitnessLevel);
    const details: string[] = [];
    const suggestions: string[] = [];

    let focusScore = 0.8; // Base score

    // Adjust based on experience level
    if (userExperience === 'beginner' && this.isAdvancedFocus(workoutFocus)) {
      focusScore -= 0.3;
      details.push(`${workoutFocus} focus may be too advanced for beginner level`);
      suggestions.push('Consider "General Fitness" or "Beginner Friendly" focus');
    } else if (userExperience === 'advanced' && this.isBeginnerFocus(workoutFocus)) {
      focusScore -= 0.2;
      details.push(`${workoutFocus} focus may not provide enough challenge for advanced level`);
      suggestions.push('Consider "Strength" or "High Intensity" focus for more challenge');
    } else {
      details.push(`${workoutFocus} focus is appropriate for your ${userExperience} experience level`);
    }

    // Check for specific focus preferences
    const preferredFocus = userProfile.preferences?.workoutStyle?.[0];
    if (preferredFocus && preferredFocus.toLowerCase() !== workoutFocus.toLowerCase()) {
      focusScore -= 0.1;
      details.push(`You typically prefer ${preferredFocus} workouts, but selected ${workoutFocus}`);
    }

    return { 
      score: Math.max(0, Math.min(1, focusScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well the intensity level aligns with user's goals
   */
  private analyzeIntensityGoalAlignment(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const userGoals = userProfile.goals || [];
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let intensityScore = 0.8; // Base score

    // Analyze intensity alignment with goals
    userGoals.forEach((goal: string) => {
      const goalLower = goal.toLowerCase();
      
      if (this.isWeightLossGoal(goalLower)) {
        if (energyLevel === 'low') {
          intensityScore -= 0.2;
          details.push('Low energy selection may limit calorie burn for weight loss');
          suggestions.push('Consider "High Energy" for more effective weight loss');
        } else if (energyLevel === 'high') {
          intensityScore += 0.1;
          details.push('High energy selection is excellent for weight loss goals');
        }
      } else if (this.isStrengthGoal(goalLower)) {
        if (energyLevel === 'low') {
          intensityScore -= 0.1;
          details.push('Low energy may limit strength gains');
        } else if (energyLevel === 'high') {
          intensityScore += 0.1;
          details.push('High energy selection supports strength building');
        }
      } else if (this.isCardioGoal(goalLower)) {
        if (energyLevel === 'low') {
          intensityScore -= 0.3;
          details.push('Low energy selection may not provide sufficient cardio challenge');
          suggestions.push('Consider "Moderate" or "High Energy" for better cardio results');
        } else if (energyLevel === 'high') {
          intensityScore += 0.2;
          details.push('High energy selection is perfect for cardio goals');
        }
      }
    });

    return { 
      score: Math.max(0, Math.min(1, intensityScore)), 
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
    const _userGoals = userProfile.goals || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);

    if (score >= 0.85) {
      return `Excellent alignment! Your ${workoutFocus} focus and ${energyLevel} energy selection perfectly support your fitness goals.`;
    } else if (score >= 0.7) {
      return `Good alignment. Your selections generally support your goals, with room for minor optimizations.`;
    } else if (score >= 0.5) {
      return `Moderate alignment. Some selections may not optimally support your goals. Consider the suggestions below.`;
    } else {
      return `Poor alignment. Your current selections may not effectively support your fitness goals. Review the suggestions for better results.`;
    }
  }

  /**
   * Generate impact description
   */
  private generateImpact(score: number, _userProfile: UserProfile): string {
    if (score >= 0.85) {
      return 'Your selections will maximize progress toward your fitness goals.';
    } else if (score >= 0.7) {
      return 'Your selections will provide good progress, with some room for optimization.';
    } else if (score >= 0.5) {
      return 'Your selections may slow progress toward your goals. Consider adjustments.';
    } else {
      return 'Your selections may significantly limit progress toward your goals.';
    }
  }

  // Helper methods for goal classification
  private isStrengthGoal(goal: string): boolean {
    return goal.includes('strength') || goal.includes('muscle') || goal.includes('power') || goal.includes('build');
  }

  private isCardioGoal(goal: string): boolean {
    return goal.includes('cardio') || goal.includes('endurance') || goal.includes('stamina') || goal.includes('heart');
  }

  private isWeightLossGoal(goal: string): boolean {
    return goal.includes('weight') || goal.includes('fat') || goal.includes('slim') || goal.includes('lean');
  }

  private isFlexibilityGoal(goal: string): boolean {
    return goal.includes('flexibility') || goal.includes('mobility') || goal.includes('stretch') || goal.includes('yoga');
  }

  private hasStrengthFocus(focus: string): boolean {
    return focus.includes('strength') || focus.includes('muscle') || focus.includes('power');
  }

  private hasCardioFocus(focus: string): boolean {
    return focus.includes('cardio') || focus.includes('endurance') || focus.includes('sweat') || focus.includes('burn');
  }

  private hasWeightLossFocus(focus: string): boolean {
    return focus.includes('weight') || focus.includes('burn') || focus.includes('sweat') || focus.includes('fat');
  }

  private hasFlexibilityFocus(focus: string): boolean {
    return focus.includes('flexibility') || focus.includes('mobility') || focus.includes('stretch') || focus.includes('yoga');
  }

  private isAdvancedFocus(focus: string): boolean {
    return focus.includes('advanced') || focus.includes('intense') || focus.includes('power');
  }

  private isBeginnerFocus(focus: string): boolean {
    return focus.includes('beginner') || focus.includes('easy') || focus.includes('gentle');
  }

  private getAlternativeFocus(goal: string): string {
    if (this.isStrengthGoal(goal)) return 'Strength Training';
    if (this.isCardioGoal(goal)) return 'Cardio';
    if (this.isWeightLossGoal(goal)) return 'Quick Sweat';
    if (this.isFlexibilityGoal(goal)) return 'Flexibility';
    return 'General Fitness';
  }

  // Helper methods for extracting values from complex types
  private getFocusValue(workoutOptions: PerWorkoutOptions): string {
    const focus = workoutOptions.customization_focus;
    if (typeof focus === 'string') return focus;
    if (focus?.focus) return focus.focus;
    return 'general';
  }

  private getEnergyValue(workoutOptions: PerWorkoutOptions): string {
    const energy = workoutOptions.customization_energy?.rating;
    if (!energy || energy <= 3) return 'low';
    if (energy <= 7) return 'moderate';
    return 'high';
  }

  private getExperienceFromFitnessLevel(fitnessLevel: string): string {
    if (fitnessLevel === 'beginner' || fitnessLevel === 'novice') return 'beginner';
    if (fitnessLevel === 'intermediate') return 'intermediate';
    if (fitnessLevel === 'advanced' || fitnessLevel === 'adaptive') return 'advanced';
    return 'beginner';
  }

  getAnalyzerName(): string {
    return 'goalAlignment';
  }

  getWeight(): number {
    return 0.25;
  }

  getDescription(): string {
    return 'Analyzes how well workout selections align with user fitness goals';
  }
} 