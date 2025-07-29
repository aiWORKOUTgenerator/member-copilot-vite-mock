// Profile Match Calculator - Analyzes workout-to-user profile alignment
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout, Exercise } from '../../../../../types/workout-generation.types';
import { ConfidenceContext, FactorCalculator } from '../types/confidence.types';

/**
 * Calculates how well a workout matches the user's fitness profile
 * Considers fitness level, experience, energy level, and workout intensity
 */
export class ProfileMatchCalculator implements FactorCalculator {
  
  /**
   * Calculate profile match score (0-1)
   */
  async calculate(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<number> {
    const scores: number[] = [];

    // 1. Fitness Level Alignment (25% weight)
    const fitnessScore = this.calculateFitnessLevelAlignment(userProfile, workoutData);
    scores.push(fitnessScore * 0.25);

    // 2. Experience Level Match (25% weight)
    const experienceScore = this.calculateExperienceLevelMatch(userProfile, workoutData);
    scores.push(experienceScore * 0.25);

    // 3. Energy Level Compatibility (25% weight)
    const energyScore = this.calculateEnergyLevelCompatibility(userProfile, workoutData, context);
    scores.push(energyScore * 0.25);

    // 4. Workout Intensity Match (25% weight)
    const intensityScore = this.calculateIntensityMatch(userProfile, workoutData);
    scores.push(intensityScore * 0.25);

    // Return weighted average
    return scores.reduce((sum, score) => sum + score, 0);
  }

  /**
   * Calculate fitness level alignment score
   */
  private calculateFitnessLevelAlignment(userProfile: UserProfile, workoutData: GeneratedWorkout): number {
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    const workoutIntensity = this.estimateWorkoutIntensity(workoutData);

    // Fitness level to expected intensity mapping
    const fitnessIntensityMap: Record<string, string> = {
      'beginner': 'low',
      'novice': 'low-medium',
      'intermediate': 'medium',
      'advanced': 'medium-high',
      'adaptive': 'medium' // Default for adaptive
    };

    const expectedIntensity = fitnessIntensityMap[userFitnessLevel || 'intermediate'];
    
    // Intensity compatibility scoring
    const intensityCompatibility: Record<string, Record<string, number>> = {
      'low': { 'low': 1.0, 'low-medium': 0.8, 'medium': 0.6, 'medium-high': 0.4, 'high': 0.2 },
      'low-medium': { 'low': 0.8, 'low-medium': 1.0, 'medium': 0.9, 'medium-high': 0.7, 'high': 0.5 },
      'medium': { 'low': 0.6, 'low-medium': 0.9, 'medium': 1.0, 'medium-high': 0.9, 'high': 0.7 },
      'medium-high': { 'low': 0.4, 'low-medium': 0.7, 'medium': 0.9, 'medium-high': 1.0, 'high': 0.9 },
      'high': { 'low': 0.2, 'low-medium': 0.5, 'medium': 0.7, 'medium-high': 0.9, 'high': 1.0 }
    };

    return intensityCompatibility[expectedIntensity]?.[workoutIntensity] || 0.5;
  }

  /**
   * Calculate experience level match score
   */
  private calculateExperienceLevelMatch(userProfile: UserProfile, workoutData: GeneratedWorkout): number {
    // Use fitnessLevel as proxy for experience level since UserProfile doesn't have experienceLevel
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    const workoutComplexity = this.estimateWorkoutComplexity(workoutData);

    // Fitness level to expected complexity mapping
    const fitnessComplexityMap: Record<string, string> = {
      'beginner': 'simple',
      'novice': 'simple',
      'intermediate': 'moderate',
      'advanced': 'complex',
      'adaptive': 'moderate'
    };

    const expectedComplexity = fitnessComplexityMap[userFitnessLevel || 'intermediate'];

    // Complexity compatibility scoring
    const complexityCompatibility: Record<string, Record<string, number>> = {
      'simple': { 'simple': 1.0, 'moderate': 0.7, 'complex': 0.4 },
      'moderate': { 'simple': 0.8, 'moderate': 1.0, 'complex': 0.8 },
      'complex': { 'simple': 0.6, 'moderate': 0.9, 'complex': 1.0 }
    };

    return complexityCompatibility[expectedComplexity]?.[workoutComplexity] || 0.5;
  }

  /**
   * Calculate energy level compatibility score
   */
  private calculateEnergyLevelCompatibility(userProfile: UserProfile, workoutData: GeneratedWorkout, context: ConfidenceContext): number {
    // Derive energy level from user profile characteristics
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    
    // Map fitness level to energy level (1-10 scale)
    const fitnessToEnergyMap: Record<string, number> = {
      'beginner': 3,    // Lower energy for beginners
      'novice': 4,      // Slightly higher for novices
      'intermediate': 6, // Moderate energy for intermediates
      'advanced': 8,    // Higher energy for advanced users
      'adaptive': 5     // Default moderate energy for adaptive
    };
    
    const userEnergyLevel = fitnessToEnergyMap[userFitnessLevel || 'intermediate'] || 5;
    const workoutDuration = workoutData.totalDuration / 60; // Convert seconds to minutes
    const workoutIntensity = this.estimateWorkoutIntensity(workoutData);

    // Energy level to recommended workout characteristics
    const energyRecommendations: Record<number, { maxDuration: number; preferredIntensity: string }> = {
      1: { maxDuration: 15, preferredIntensity: 'low' },
      2: { maxDuration: 20, preferredIntensity: 'low' },
      3: { maxDuration: 30, preferredIntensity: 'low-medium' },
      4: { maxDuration: 40, preferredIntensity: 'medium' },
      5: { maxDuration: 45, preferredIntensity: 'medium' },
      6: { maxDuration: 50, preferredIntensity: 'medium' },
      7: { maxDuration: 55, preferredIntensity: 'medium-high' },
      8: { maxDuration: 60, preferredIntensity: 'medium-high' },
      9: { maxDuration: 60, preferredIntensity: 'high' },
      10: { maxDuration: 60, preferredIntensity: 'high' }
    };

    const recommendation = energyRecommendations[userEnergyLevel] || energyRecommendations[5];

    // Calculate duration compatibility (0-1)
    const durationScore = Math.max(0, 1 - Math.abs(workoutDuration - recommendation.maxDuration) / recommendation.maxDuration);

    // Calculate intensity compatibility (0-1)
    const intensityCompatibility: Record<string, Record<string, number>> = {
      'low': { 'low': 1.0, 'low-medium': 0.8, 'medium': 0.6, 'medium-high': 0.4, 'high': 0.2 },
      'low-medium': { 'low': 0.8, 'low-medium': 1.0, 'medium': 0.9, 'medium-high': 0.7, 'high': 0.5 },
      'medium': { 'low': 0.6, 'low-medium': 0.9, 'medium': 1.0, 'medium-high': 0.9, 'high': 0.7 },
      'medium-high': { 'low': 0.4, 'low-medium': 0.7, 'medium': 0.9, 'medium-high': 1.0, 'high': 0.9 },
      'high': { 'low': 0.2, 'low-medium': 0.5, 'medium': 0.7, 'medium-high': 0.9, 'high': 1.0 }
    };

    const intensityScore = intensityCompatibility[recommendation.preferredIntensity]?.[workoutIntensity] || 0.5;

    // Consider environmental factors from context
    let environmentalAdjustment = 0;
    if (context.environmentalFactors?.timeOfDay === 'morning') {
      // Morning workouts might need different energy considerations
      environmentalAdjustment += 0.05;
    } else if (context.environmentalFactors?.timeOfDay === 'evening') {
      // Evening workouts might be more suitable for higher energy
      environmentalAdjustment -= 0.05;
    }

    // Return average of duration and intensity scores with environmental adjustment
    return Math.max(0, Math.min(1, (durationScore + intensityScore) / 2 + environmentalAdjustment));
  }

  /**
   * Calculate intensity match score
   */
  private calculateIntensityMatch(userProfile: UserProfile, workoutData: GeneratedWorkout): number {
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    const workoutIntensity = this.estimateWorkoutIntensity(workoutData);

    // Fitness level to preferred intensity mapping
    const fitnessIntensityPreferences: Record<string, string[]> = {
      'beginner': ['low', 'low-medium'],
      'novice': ['low-medium', 'medium'],
      'intermediate': ['medium', 'medium-high'],
      'advanced': ['medium-high', 'high'],
      'adaptive': ['medium'] // Default for adaptive
    };

    const preferredIntensities = fitnessIntensityPreferences[userFitnessLevel || 'intermediate'] || ['medium'];

    // Check if workout intensity is in preferred range
    if (preferredIntensities.includes(workoutIntensity)) {
      return 1.0;
    }

    // Calculate distance from preferred range
    const intensityLevels = ['low', 'low-medium', 'medium', 'medium-high', 'high'];
    const workoutIndex = intensityLevels.indexOf(workoutIntensity);
    const preferredIndices = preferredIntensities.map(intensity => intensityLevels.indexOf(intensity));
    const minDistance = Math.min(...preferredIndices.map(prefIndex => Math.abs(workoutIndex - prefIndex)));

    // Score based on distance (0.5 for adjacent, 0.25 for 2 away, etc.)
    return Math.max(0.1, 1 - (minDistance * 0.25));
  }

  /**
   * Estimate workout intensity based on exercise characteristics
   */
  private estimateWorkoutIntensity(workoutData: GeneratedWorkout): string {
    // Get all exercises from all phases
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 'medium';
    }

    let totalIntensity = 0;
    let exerciseCount = 0;

    allExercises.forEach((exercise: Exercise) => {
      // Estimate intensity based on exercise intensity and duration
      const exerciseIntensity = exercise.intensity;
      const duration = exercise.duration ?? 0;

      let intensity = 0.5; // Default medium

      // Intensity-based estimation
      if (exerciseIntensity === 'high') {
        intensity = 0.9;
      } else if (exerciseIntensity === 'moderate') {
        intensity = 0.7;
      } else if (exerciseIntensity === 'low') {
        intensity = 0.3;
      }

      // Duration adjustment
      if (duration > 60) intensity += 0.1;
      if (duration < 30) intensity -= 0.1;

      totalIntensity += Math.max(0, Math.min(1, intensity));
      exerciseCount++;
    });

    const averageIntensity = exerciseCount > 0 ? totalIntensity / exerciseCount : 0.5;

    // Map to intensity levels
    if (averageIntensity >= 0.8) return 'high';
    if (averageIntensity >= 0.6) return 'medium-high';
    if (averageIntensity >= 0.4) return 'medium';
    if (averageIntensity >= 0.2) return 'low-medium';
    return 'low';
  }

  /**
   * Estimate workout complexity based on exercise characteristics
   */
  private estimateWorkoutComplexity(workoutData: GeneratedWorkout): string {
    // Get all exercises from all phases
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 'moderate';
    }

    let complexityScore = 0;
    let exerciseCount = 0;

    allExercises.forEach((exercise: Exercise) => {
      let exerciseComplexity = 0.5; // Default moderate

      // Complexity based on exercise name and intensity
      const name = exercise.name?.toLowerCase() || '';
      const exerciseIntensity = exercise.intensity;

      if (name.includes('compound') || name.includes('multi-joint')) {
        exerciseComplexity += 0.3;
      }
      if (name.includes('isolation') || name.includes('single-joint')) {
        exerciseComplexity -= 0.2;
      }
      if (name.includes('balance') || name.includes('stability')) {
        exerciseComplexity += 0.2;
      }
      if (exerciseIntensity === 'high' && name.includes('interval')) {
        exerciseComplexity += 0.2;
      }

      complexityScore += Math.max(0, Math.min(1, exerciseComplexity));
      exerciseCount++;
    });

    const averageComplexity = exerciseCount > 0 ? complexityScore / exerciseCount : 0.5;

    // Map to complexity levels
    if (averageComplexity >= 0.7) return 'complex';
    if (averageComplexity >= 0.4) return 'moderate';
    return 'simple';
  }

  /**
   * Get factor name
   */
  getFactorName(): string {
    return 'profileMatch';
  }

  /**
   * Get factor weight
   */
  getWeight(): number {
    return 0.25; // 25% weight
  }

  /**
   * Get factor description
   */
  getDescription(): string {
    return 'Measures how well the workout aligns with the user\'s fitness level, experience, energy level, and preferred intensity';
  }
} 