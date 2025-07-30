import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';
import { 
  SelectionAnalyzer, 
  FactorAnalysis, 
  SelectionAnalysisContext 
} from '../types/selection-analysis.types';

/**
 * Analyzes how well selections respect user's recovery needs and limitations
 * Considers injuries, recent workouts, age, and health conditions
 */
export class RecoveryRespectAnalyzer implements SelectionAnalyzer {
  
  /**
   * Analyze recovery respect of user's selections
   */
  async analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<FactorAnalysis> {
    const scores: number[] = [];
    const details: string[] = [];
    const suggestions: string[] = [];

    // 1. Injury and Limitation Consideration (35% weight)
    const injuryScore = this.analyzeInjuryConsideration(userProfile, workoutOptions);
    scores.push(injuryScore.score * 0.35);
    details.push(...injuryScore.details);
    if (injuryScore.suggestions) suggestions.push(...injuryScore.suggestions);

    // 2. Recent Workout Recovery (30% weight)
    const recentScore = this.analyzeRecentWorkoutRecovery(userProfile, workoutOptions, context);
    scores.push(recentScore.score * 0.3);
    details.push(...recentScore.details);
    if (recentScore.suggestions) suggestions.push(...recentScore.suggestions);

    // 3. Age and Recovery Capacity (20% weight)
    const ageScore = this.analyzeAgeRecoveryCapacity(userProfile, workoutOptions);
    scores.push(ageScore.score * 0.2);
    details.push(...ageScore.details);
    if (ageScore.suggestions) suggestions.push(...ageScore.suggestions);

    // 4. Health Condition Accommodation (15% weight)
    const healthScore = this.analyzeHealthConditionAccommodation(userProfile, workoutOptions);
    scores.push(healthScore.score * 0.15);
    details.push(...healthScore.details);
    if (healthScore.suggestions) suggestions.push(...healthScore.suggestions);

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
   * Analyze how well selections consider injuries and limitations
   */
  private analyzeInjuryConsideration(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const injuries = userProfile.basicLimitations?.injuries || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let injuryScore = 1.0; // Start with perfect score

    if (injuries.length === 0) {
      details.push('No injuries reported - selections are appropriate');
      return { score: injuryScore, details };
    }

    // Analyze each injury
    injuries.forEach((condition: string) => {
      const conditionLower = condition.toLowerCase();
      
      // Check for high-impact activities with joint issues
      if (this.isJointIssue(conditionLower)) {
        if (this.isHighImpactFocus(workoutFocus) || energyLevel === 'high') {
          injuryScore -= 0.3;
          details.push(`High-impact selection may aggravate ${condition}`);
          suggestions.push('Consider "Low Impact" or "Moderate" energy for joint safety');
        }
      }
      
      // Check for back issues
      if (this.isBackIssue(conditionLower)) {
        if (this.isStrengthFocus(workoutFocus)) {
          injuryScore -= 0.2;
          details.push(`Strength focus may strain ${condition}`);
          suggestions.push('Consider "General Fitness" or "Flexibility" focus for back safety');
        }
      }
      
      // Check for cardiovascular issues
      if (this.isCardiovascularIssue(conditionLower)) {
        if (this.isCardioFocus(workoutFocus) || energyLevel === 'high') {
          injuryScore -= 0.4;
          details.push(`High-intensity cardio may stress ${condition}`);
          suggestions.push('Consider "Low Energy" or "General Fitness" for cardiovascular safety');
        }
      }
      
      // Check for mobility issues
      if (this.isMobilityIssue(conditionLower)) {
        if (this.isComplexFocus(workoutFocus)) {
          injuryScore -= 0.2;
          details.push(`Complex movements may challenge ${condition}`);
          suggestions.push('Consider "Beginner Friendly" or "General Fitness" for better mobility');
        }
      }
    });

    return { 
      score: Math.max(0, Math.min(1, injuryScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well selections consider recent workout recovery
   */
  private analyzeRecentWorkoutRecovery(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): { score: number; details: string[]; suggestions?: string[] } {
    const previousWorkouts = context.previousWorkouts ?? 0;
    const workoutFocus = this.getFocusValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const duration = this.getDurationValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let recoveryScore = 1.0; // Start with perfect score

    // Consider workout frequency
    if (previousWorkouts >= 5) {
      recoveryScore -= 0.4;
      details.push('Very high workout frequency detected - recovery may be compromised');
      suggestions.push('Consider "Low Energy" or "Recovery" focus for better adaptation');
    } else if (previousWorkouts >= 3) {
      recoveryScore -= 0.2;
      details.push('High workout frequency - monitor recovery needs');
      if (energyLevel === 'high') {
        recoveryScore -= 0.1;
        suggestions.push('Consider "Moderate" energy to support recovery');
      }
    } else if (previousWorkouts === 0) {
      details.push('No recent workouts - recovery is not a concern');
    }

    // Consider workout type variety
    if (previousWorkouts > 0) {
      const isSameFocus = this.isRepeatingFocus(workoutFocus, userProfile);
      if (isSameFocus && energyLevel === 'high') {
        recoveryScore -= 0.2;
        details.push('Repeating high-intensity focus may lead to overtraining');
        suggestions.push('Consider different focus or "Moderate" energy for variety');
      }
    }

    // Consider duration with frequency
    if (previousWorkouts >= 3 && duration === 'long') {
      recoveryScore -= 0.1;
      details.push('Long duration with frequent workouts may limit recovery');
      suggestions.push('Consider "Medium" or "Short" duration for better recovery');
    }

    return { 
      score: Math.max(0, Math.min(1, recoveryScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well selections consider age-related recovery capacity
   */
  private analyzeAgeRecoveryCapacity(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const age = userProfile.age;
    const workoutFocus = this.getFocusValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let ageScore = 1.0; // Start with perfect score

    if (!age) {
      details.push('Age not specified - assuming appropriate recovery capacity');
      return { score: ageScore, details };
    }

    // Adjust for age-related recovery considerations
    if (age >= 50) {
      if (energyLevel === 'high') {
        ageScore -= 0.2;
        details.push('High energy selection may require longer recovery at your age');
        suggestions.push('Consider "Moderate" energy for better recovery');
      }
      if (this.isHighImpactFocus(workoutFocus)) {
        ageScore -= 0.1;
        details.push('High-impact focus may stress joints more at your age');
        suggestions.push('Consider "Low Impact" or "General Fitness" for joint health');
      }
    } else if (age >= 40) {
      if (energyLevel === 'high' && this.isHighImpactFocus(workoutFocus)) {
        ageScore -= 0.1;
        details.push('High-intensity high-impact may require more recovery');
      }
    } else if (age >= 65) {
      if (energyLevel === 'high') {
        ageScore -= 0.3;
        details.push('High energy selection may be too intense for your age');
        suggestions.push('Consider "Low Energy" or "Moderate" for safer training');
      }
      if (this.isComplexFocus(workoutFocus)) {
        ageScore -= 0.2;
        details.push('Complex movements may challenge balance and coordination');
        suggestions.push('Consider "Beginner Friendly" or "General Fitness" for safety');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, ageScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well selections accommodate health conditions
   */
  private analyzeHealthConditionAccommodation(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const injuries = userProfile.basicLimitations?.injuries || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let healthScore = 1.0; // Start with perfect score

    if (injuries.length === 0) {
      details.push('No health conditions reported - selections are appropriate');
      return { score: healthScore, details };
    }

    // Analyze each health condition
    injuries.forEach((condition: string) => {
      const conditionLower = condition.toLowerCase();
      
      // Check for respiratory conditions
      if (this.isRespiratoryCondition(conditionLower)) {
        if (energyLevel === 'high' || this.isCardioFocus(workoutFocus)) {
          healthScore -= 0.3;
          details.push(`High-intensity selection may stress ${condition}`);
          suggestions.push('Consider "Low Energy" or "Moderate" for respiratory safety');
        }
      }
      
      // Check for metabolic conditions
      if (this.isMetabolicCondition(conditionLower)) {
        if (energyLevel === 'low') {
          healthScore -= 0.1;
          details.push(`Low energy may not provide sufficient metabolic stimulus for ${condition}`);
          suggestions.push('Consider "Moderate" energy for better metabolic health');
        }
      }
      
      // Check for neurological conditions
      if (this.isNeurologicalCondition(conditionLower)) {
        if (this.isComplexFocus(workoutFocus)) {
          healthScore -= 0.2;
          details.push(`Complex movements may challenge ${condition}`);
          suggestions.push('Consider "Simple" or "General Fitness" focus for safety');
        }
      }
    });

    return { 
      score: Math.max(0, Math.min(1, healthScore)), 
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
    const _injuries = userProfile.basicLimitations?.injuries || [];
    const energyLevel = this.getEnergyValue(workoutOptions);

    if (score >= 0.85) {
      return `Excellent recovery consideration! Your ${energyLevel} selection respects your recovery needs and limitations.`;
    } else if (score >= 0.7) {
      return `Good recovery consideration. Your selections generally respect your recovery needs.`;
    } else if (score >= 0.5) {
      return `Moderate recovery consideration. Some selections may not optimally respect your recovery needs.`;
    } else {
      return `Poor recovery consideration. Your selections may not adequately respect your recovery needs and could lead to overtraining or injury.`;
    }
  }

  /**
   * Generate impact description
   */
  private generateImpact(score: number, _userProfile: UserProfile): string {
    if (score >= 0.85) {
      return 'Your selections will support optimal recovery and long-term health.';
    } else if (score >= 0.7) {
      return 'Your selections will generally support recovery with minor adjustments possible.';
    } else if (score >= 0.5) {
      return 'Your selections may compromise recovery and increase injury risk.';
    } else {
      return 'Your selections may significantly impact recovery and increase injury risk.';
    }
  }

  // Helper methods for condition classification
  private isJointIssue(condition: string): boolean {
    return condition.includes('knee') || condition.includes('shoulder') || 
           condition.includes('hip') || condition.includes('ankle') || 
           condition.includes('joint') || condition.includes('arthritis');
  }

  private isBackIssue(condition: string): boolean {
    return condition.includes('back') || condition.includes('spine') || 
           condition.includes('disc') || condition.includes('hernia');
  }

  private isCardiovascularIssue(condition: string): boolean {
    return condition.includes('heart') || condition.includes('cardio') || 
           condition.includes('blood pressure') || condition.includes('circulation');
  }

  private isMobilityIssue(condition: string): boolean {
    return condition.includes('mobility') || condition.includes('flexibility') || 
           condition.includes('range of motion') || condition.includes('stiffness');
  }

  private isRespiratoryCondition(condition: string): boolean {
    return condition.includes('asthma') || condition.includes('breathing') || 
           condition.includes('lung') || condition.includes('respiratory');
  }

  private isMetabolicCondition(condition: string): boolean {
    return condition.includes('diabetes') || condition.includes('metabolic') || 
           condition.includes('insulin') || condition.includes('blood sugar');
  }

  private isNeurologicalCondition(condition: string): boolean {
    return condition.includes('balance') || condition.includes('coordination') || 
           condition.includes('neurological') || condition.includes('cognitive');
  }

  private isHighImpactFocus(focus: string): boolean {
    return focus.includes('high intensity') || focus.includes('quick sweat') || 
           focus.includes('jump') || focus.includes('plyometric');
  }

  private isStrengthFocus(focus: string): boolean {
    return focus.includes('strength') || focus.includes('muscle') || focus.includes('power');
  }

  private isCardioFocus(focus: string): boolean {
    return focus.includes('cardio') || focus.includes('endurance') || focus.includes('sweat');
  }

  private isComplexFocus(focus: string): boolean {
    return focus.includes('advanced') || focus.includes('complex') || focus.includes('skill');
  }

  private isRepeatingFocus(_focus: string, _userProfile: UserProfile): boolean {
    // This would need to be enhanced with actual workout history
    // For now, return false as a conservative estimate
    return false;
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

  getAnalyzerName(): string {
    return 'recoveryRespect';
  }

  getWeight(): number {
    return 0.15;
  }

  getDescription(): string {
    return 'Analyzes how well selections respect user recovery needs and limitations';
  }
} 