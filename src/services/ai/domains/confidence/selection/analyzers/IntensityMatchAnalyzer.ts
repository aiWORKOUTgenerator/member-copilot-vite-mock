import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';
import { 
  SelectionAnalyzer, 
  FactorAnalysis, 
  SelectionAnalysisContext 
} from '../types/selection-analysis.types';

/**
 * Analyzes how well the selected intensity/energy level matches user's profile
 * Considers fitness level, experience, time of day, and recovery needs
 */
export class IntensityMatchAnalyzer implements SelectionAnalyzer {
  
  /**
   * Analyze intensity match of user's selections
   */
  async analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<FactorAnalysis> {
    const scores: number[] = [];
    const details: string[] = [];
    const suggestions: string[] = [];

    // 1. Fitness Level Alignment (30% weight)
    const fitnessScore = this.analyzeFitnessLevelAlignment(userProfile, workoutOptions);
    scores.push(fitnessScore.score * 0.3);
    details.push(...fitnessScore.details);
    if (fitnessScore.suggestions) suggestions.push(...fitnessScore.suggestions);

    // 2. Experience Level Match (25% weight)
    const experienceScore = this.analyzeExperienceLevelMatch(userProfile, workoutOptions);
    scores.push(experienceScore.score * 0.25);
    details.push(...experienceScore.details);
    if (experienceScore.suggestions) suggestions.push(...experienceScore.suggestions);

    // 3. Time of Day Optimization (20% weight)
    const timeScore = this.analyzeTimeOfDayOptimization(userProfile, workoutOptions, context);
    scores.push(timeScore.score * 0.2);
    details.push(...timeScore.details);
    if (timeScore.suggestions) suggestions.push(...timeScore.suggestions);

    // 4. Recovery Consideration (15% weight)
    const recoveryScore = this.analyzeRecoveryConsideration(userProfile, workoutOptions, context);
    scores.push(recoveryScore.score * 0.15);
    details.push(...recoveryScore.details);
    if (recoveryScore.suggestions) suggestions.push(...recoveryScore.suggestions);

    // 5. Energy Preference Alignment (10% weight)
    const preferenceScore = this.analyzeEnergyPreferenceAlignment(userProfile, workoutOptions);
    scores.push(preferenceScore.score * 0.1);
    details.push(...preferenceScore.details);
    if (preferenceScore.suggestions) suggestions.push(...preferenceScore.suggestions);

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
   * Analyze how well intensity matches user's fitness level
   */
  private analyzeFitnessLevelAlignment(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const fitnessLevel = userProfile.fitnessLevel || 'beginner';
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let fitnessScore = 0.8; // Base score

    // Adjust based on fitness level
    if (fitnessLevel === 'beginner') {
      if (energyLevel === 'high') {
        fitnessScore -= 0.4;
        details.push('High energy selection may be too intense for someone new to exercise');
        suggestions.push('Consider "Low Energy" or "Moderate" for a gentler introduction');
      } else if (energyLevel === 'low') {
        fitnessScore += 0.1;
        details.push('Low energy selection is perfect for someone new to exercise');
      }
    } else if (fitnessLevel === 'intermediate') {
      if (energyLevel === 'high') {
        fitnessScore -= 0.1;
        details.push('High energy may be challenging but manageable with some experience');
      } else if (energyLevel === 'low') {
        fitnessScore += 0.05;
        details.push('Low energy selection is appropriate for your experience level');
      }
    } else if (fitnessLevel === 'advanced') {
      if (energyLevel === 'low') {
        fitnessScore -= 0.3;
        details.push('Low energy selection may not provide sufficient challenge for advanced level');
        suggestions.push('Consider "High Energy" or "Moderate" for better challenge');
      } else if (energyLevel === 'high') {
        fitnessScore += 0.1;
        details.push('High energy selection is excellent for advanced fitness level');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, fitnessScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well intensity matches user's experience level
   */
  private analyzeExperienceLevelMatch(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const experience = this.getExperienceFromFitnessLevel(userProfile.fitnessLevel);
    const energyLevel = this.getEnergyValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let experienceScore = 0.8; // Base score

    // Adjust based on experience
    if (experience === 'beginner') {
      if (energyLevel === 'high') {
        experienceScore -= 0.3;
        details.push('High energy selection may be overwhelming for beginners');
        suggestions.push('Consider "Moderate" energy for better form and safety');
      } else if (energyLevel === 'low') {
        experienceScore += 0.1;
        details.push('Low energy selection allows focus on proper form and technique');
      }
    } else if (experience === 'intermediate') {
      if (energyLevel === 'high') {
        experienceScore += 0.05;
        details.push('High energy selection is appropriate for intermediate experience');
      } else if (energyLevel === 'low') {
        experienceScore -= 0.1;
        details.push('Low energy may not provide enough challenge for intermediate level');
      }
    } else if (experience === 'advanced') {
      if (energyLevel === 'low') {
        experienceScore -= 0.2;
        details.push('Low energy selection may not meet advanced training needs');
        suggestions.push('Consider "High Energy" for more challenging workouts');
      } else if (energyLevel === 'high') {
        experienceScore += 0.1;
        details.push('High energy selection matches advanced training expectations');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, experienceScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well intensity is optimized for time of day
   */
  private analyzeTimeOfDayOptimization(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): { score: number; details: string[]; suggestions?: string[] } {
    const energyLevel = this.getEnergyValue(workoutOptions);
    const timeOfDay = context.timeOfDay;
    const details: string[] = [];
    const suggestions: string[] = [];

    let timeScore = 0.8; // Base score

    if (timeOfDay === 'morning') {
      if (energyLevel === 'high') {
        timeScore += 0.1;
        details.push('High energy selection is excellent for morning workouts');
      } else if (energyLevel === 'low') {
        timeScore -= 0.1;
        details.push('Low energy selection may not provide enough morning energy boost');
        suggestions.push('Consider "Moderate" or "High Energy" for better morning activation');
      }
    } else if (timeOfDay === 'afternoon') {
      if (energyLevel === 'high') {
        timeScore += 0.05;
        details.push('High energy selection works well for afternoon workouts');
      } else if (energyLevel === 'low') {
        timeScore -= 0.05;
        details.push('Low energy selection is acceptable for afternoon but may be too gentle');
      }
    } else if (timeOfDay === 'evening') {
      if (energyLevel === 'high') {
        timeScore -= 0.2;
        details.push('High energy selection may interfere with evening recovery and sleep');
        suggestions.push('Consider "Low Energy" or "Moderate" for better evening recovery');
      } else if (energyLevel === 'low') {
        timeScore += 0.1;
        details.push('Low energy selection is perfect for evening workouts');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, timeScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well intensity considers recovery needs
   */
  private analyzeRecoveryConsideration(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): { score: number; details: string[]; suggestions?: string[] } {
    const energyLevel = this.getEnergyValue(workoutOptions);
    const previousWorkouts = context.previousWorkouts ?? 0;
    const details: string[] = [];
    const suggestions: string[] = [];

    let recoveryScore = 0.8; // Base score

    // Consider recent workout frequency
    if (previousWorkouts >= 5) {
      if (energyLevel === 'high') {
        recoveryScore -= 0.3;
        details.push('High energy selection may not allow adequate recovery after recent workouts');
        suggestions.push('Consider "Low Energy" or "Moderate" for better recovery');
      } else if (energyLevel === 'low') {
        recoveryScore += 0.1;
        details.push('Low energy selection supports recovery after recent workouts');
      }
    } else if (previousWorkouts >= 3) {
      if (energyLevel === 'high') {
        recoveryScore -= 0.1;
        details.push('High energy selection is acceptable but monitor recovery needs');
      }
    }

    // Consider injuries or limitations
    const injuries = userProfile.basicLimitations?.injuries || [];
    if (injuries.length > 0 && energyLevel === 'high') {
      recoveryScore -= 0.2;
      details.push('High energy selection may aggravate existing injuries');
      suggestions.push('Consider "Low Energy" or "Moderate" for safer training with injuries');
    }

    return { 
      score: Math.max(0, Math.min(1, recoveryScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well intensity aligns with user's energy preferences
   */
  private analyzeEnergyPreferenceAlignment(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const energyLevel = this.getEnergyValue(workoutOptions);
    const preferredEnergy = userProfile.preferences?.intensityPreference;
    const details: string[] = [];
    const suggestions: string[] = [];

    let preferenceScore = 0.8; // Base score

    if (preferredEnergy && preferredEnergy.toLowerCase() !== energyLevel.toLowerCase()) {
      preferenceScore -= 0.1;
      details.push(`You typically prefer ${preferredEnergy} workouts, but selected ${energyLevel}`);
      suggestions.push(`Consider ${preferredEnergy} energy for workouts you enjoy more`);
    } else if (preferredEnergy) {
      preferenceScore += 0.1;
      details.push(`Your ${energyLevel} selection matches your preferred energy level`);
    }

    return { 
      score: Math.max(0, Math.min(1, preferenceScore)), 
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
    const energyLevel = this.getEnergyValue(workoutOptions);

    if (score >= 0.85) {
      return `Excellent intensity match! Your ${energyLevel} energy selection is perfectly suited for your ${fitnessLevel} fitness level.`;
    } else if (score >= 0.7) {
      return `Good intensity match. Your ${energyLevel} selection generally works well for your profile.`;
    } else if (score >= 0.5) {
      return `Moderate intensity match. Your ${energyLevel} selection may need adjustment for optimal results.`;
    } else {
      return `Poor intensity match. Your ${energyLevel} selection may not be appropriate for your current fitness level and needs.`;
    }
  }

  /**
   * Generate impact description
   */
  private generateImpact(score: number, _userProfile: UserProfile): string {
    if (score >= 0.85) {
      return 'Your intensity selection will maximize workout effectiveness and enjoyment.';
    } else if (score >= 0.7) {
      return 'Your intensity selection will provide good results with minor adjustments possible.';
    } else if (score >= 0.5) {
      return 'Your intensity selection may limit workout effectiveness or cause unnecessary strain.';
    } else {
      return 'Your intensity selection may lead to poor performance or increased injury risk.';
    }
  }

  // Helper methods for extracting values from complex types
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
    return 'intensityMatch';
  }

  getWeight(): number {
    return 0.25;
  }

  getDescription(): string {
    return 'Analyzes how well selected intensity matches user profile and context';
  }
} 