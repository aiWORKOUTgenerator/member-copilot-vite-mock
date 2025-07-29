// Structure Quality Calculator - Analyzes workout structure quality
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout, Exercise } from '../../../../../types/workout-generation.types';
import { ConfidenceContext, FactorCalculator } from '../types/confidence.types';

/**
 * Calculates the technical quality of workout structure
 * Considers exercise flow, rest periods, and workout balance
 */
export class StructureQualityCalculator implements FactorCalculator {
  
  /**
   * Calculate structure quality score (0-1)
   */
  async calculate(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<number> {
    let structureScore = 1.0;

    // 1. Check workout structure completeness (30% weight)
    const structureCompleteness = this.assessStructureCompleteness(workoutData);
    structureScore *= (0.7 + structureCompleteness * 0.3);

    // 2. Check exercise flow and progression (25% weight)
    const exerciseFlow = this.assessExerciseFlow(workoutData);
    structureScore *= (0.7 + exerciseFlow * 0.3);

    // 3. Check rest period adequacy (20% weight)
    const restPeriods = this.assessRestPeriods(workoutData);
    structureScore *= (0.7 + restPeriods * 0.3);

    // 4. Check workout balance (15% weight)
    const workoutBalance = this.assessWorkoutBalance(workoutData);
    structureScore *= (0.7 + workoutBalance * 0.3);

    // 5. Check exercise variety (10% weight)
    const exerciseVariety = this.assessExerciseVariety(workoutData);
    structureScore *= (0.7 + exerciseVariety * 0.3);

    // Consider user fitness level in structure assessment
    const userFitnessLevel = userProfile.fitnessLevel?.toLowerCase();
    if (userFitnessLevel === 'beginner' || userFitnessLevel === 'novice') {
      // Beginners need simpler, more structured workouts
      if (workoutData.mainWorkout?.exercises && workoutData.mainWorkout.exercises.length > 8) {
        structureScore -= 0.1; // Too many exercises for beginners
      }
    }

    // Consider workout type from context
    if (context.workoutType === 'detailed') {
      // Detailed workouts should have higher structure quality
      structureScore += 0.05;
    }

    return Math.max(0.1, Math.min(1.0, structureScore));
  }

  /**
   * Assess workout structure completeness
   */
  private assessStructureCompleteness(workoutData: GeneratedWorkout): number {
    let completeness = 0.0;
    let totalChecks = 0;

    // Check for warmup
    if (workoutData.warmup?.exercises && workoutData.warmup.exercises.length > 0) {
      completeness += 1.0;
    }
    totalChecks++;

    // Check for main workout
    if (workoutData.mainWorkout?.exercises && workoutData.mainWorkout.exercises.length > 0) {
      completeness += 1.0;
    }
    totalChecks++;

    // Check for cooldown
    if (workoutData.cooldown?.exercises && workoutData.cooldown.exercises.length > 0) {
      completeness += 1.0;
    }
    totalChecks++;

    // Check for workout description
    if (workoutData.description && workoutData.description.length > 10) {
      completeness += 0.5;
    }
    totalChecks++;

    return totalChecks > 0 ? completeness / totalChecks : 0.5;
  }

  /**
   * Assess exercise flow and progression
   */
  private assessExerciseFlow(workoutData: GeneratedWorkout): number {
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length < 3) {
      return 0.5; // Minimal flow assessment for very short workouts
    }

    let flowScore = 0.0;
    let exerciseCount = 0;

    // Check for logical exercise progression
    for (let i = 1; i < allExercises.length; i++) {
      const prevExercise = allExercises[i - 1];
      const currentExercise = allExercises[i];
      
      // Check if exercises flow logically (e.g., compound before isolation)
      const prevName = prevExercise.name?.toLowerCase() || '';
      const currentName = currentExercise.name?.toLowerCase() || '';
      
      if (prevName.includes('compound') && currentName.includes('isolation')) {
        flowScore += 1.0; // Good flow: compound before isolation
      } else if (prevName.includes('cardio') && currentName.includes('strength')) {
        flowScore += 0.5; // Moderate flow: cardio before strength
      } else {
        flowScore += 0.7; // Default flow score
      }
      
      exerciseCount++;
    }

    return exerciseCount > 0 ? flowScore / exerciseCount : 0.5;
  }

  /**
   * Assess rest period adequacy
   */
  private assessRestPeriods(workoutData: GeneratedWorkout): number {
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 0.5;
    }

    let restScore = 0.0;
    let exerciseCount = 0;

    allExercises.forEach((exercise: Exercise) => {
      const restTime = exercise.restBetweenSets || 0;
      
      // Assess rest period adequacy based on exercise intensity
      if (exercise.intensity === 'high' && restTime >= 60) {
        restScore += 1.0; // Adequate rest for high intensity
      } else if (exercise.intensity === 'moderate' && restTime >= 30) {
        restScore += 1.0; // Adequate rest for moderate intensity
      } else if (exercise.intensity === 'low' && restTime >= 15) {
        restScore += 1.0; // Adequate rest for low intensity
      } else if (restTime > 0) {
        restScore += 0.5; // Some rest provided
      } else {
        restScore += 0.2; // No rest specified
      }
      
      exerciseCount++;
    });

    return exerciseCount > 0 ? restScore / exerciseCount : 0.5;
  }

  /**
   * Assess workout balance
   */
  private assessWorkoutBalance(workoutData: GeneratedWorkout): number {
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 0.5;
    }

    let balanceScore = 0.0;

    // Check for exercise type balance
    const exerciseTypes = {
      strength: 0,
      cardio: 0,
      flexibility: 0,
      balance: 0
    };

    allExercises.forEach((exercise: Exercise) => {
      const name = exercise.name?.toLowerCase() || '';
      
      if (name.includes('push') || name.includes('pull') || name.includes('squat') || name.includes('deadlift')) {
        exerciseTypes.strength++;
      } else if (name.includes('jump') || name.includes('run') || name.includes('cardio')) {
        exerciseTypes.cardio++;
      } else if (name.includes('stretch') || name.includes('yoga') || name.includes('mobility')) {
        exerciseTypes.flexibility++;
      } else if (name.includes('balance') || name.includes('stability')) {
        exerciseTypes.balance++;
      }
    });

    // Calculate balance score based on variety
    const totalTypes = Object.values(exerciseTypes).filter(count => count > 0).length;
    balanceScore = totalTypes / 4; // Normalize to 0-1 scale

    return balanceScore;
  }

  /**
   * Assess exercise variety
   */
  private assessExerciseVariety(workoutData: GeneratedWorkout): number {
    const allExercises = [
      ...(workoutData.warmup?.exercises || []),
      ...(workoutData.mainWorkout?.exercises || []),
      ...(workoutData.cooldown?.exercises || [])
    ];

    if (allExercises.length === 0) {
      return 0.5;
    }

    // Count unique exercises
    const uniqueExercises = new Set(allExercises.map(exercise => exercise.name?.toLowerCase() || ''));
    const varietyRatio = uniqueExercises.size / allExercises.length;

    // Bonus for having a good number of exercises
    let varietyScore = varietyRatio;
    if (allExercises.length >= 5 && allExercises.length <= 12) {
      varietyScore += 0.1; // Good exercise count
    } else if (allExercises.length < 3) {
      varietyScore -= 0.2; // Too few exercises
    } else if (allExercises.length > 15) {
      varietyScore -= 0.1; // Too many exercises
    }

    return Math.max(0, Math.min(1, varietyScore));
  }

  /**
   * Get factor name
   */
  getFactorName(): string {
    return 'structureQuality';
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
    return 'Measures the technical quality of workout structure, exercise flow, and balance';
  }
} 