// QuickWorkoutSetup Feature - Duration Calculator
// Handles duration calculations, phase distribution, and time allocation

import { DurationConfig } from '../constants/quick-workout.constants';
import { QuickWorkoutParams } from '../types/quick-workout.types';

/**
 * Duration calculation utilities for QuickWorkoutSetup feature
 */
export class DurationCalculator {

  /**
   * Calculate phase durations based on configuration percentages
   */
  static calculatePhaseDurations(config: DurationConfig): {
    warmup: number;
    main: number;
    cooldown: number;
    total: number;
  } {
    const totalSeconds = config.duration * 60;
    
    const warmupSeconds = Math.round(totalSeconds * (config.timeAllocation.warmupPercent / 100));
    const cooldownSeconds = Math.round(totalSeconds * (config.timeAllocation.cooldownPercent / 100));
    const mainSeconds = totalSeconds - warmupSeconds - cooldownSeconds;

    return {
      warmup: warmupSeconds,
      main: Math.max(mainSeconds, 0), // Ensure non-negative
      cooldown: cooldownSeconds,
      total: totalSeconds
    };
  }

  /**
   * Calculate exercise duration based on phase duration and exercise count
   */
  static calculateExerciseDuration(
    phaseDurationSeconds: number,
    exerciseCount: number,
    restTimePerExercise: number = 30
  ): number {
    if (exerciseCount <= 0) return 0;
    
    // Total rest time (no rest after last exercise)
    const totalRestTime = Math.max(0, (exerciseCount - 1) * restTimePerExercise);
    
    // Available time for actual exercises
    const availableExerciseTime = phaseDurationSeconds - totalRestTime;
    
    // Duration per exercise
    const exerciseDuration = Math.max(30, Math.floor(availableExerciseTime / exerciseCount));
    
    return exerciseDuration;
  }

  /**
   * Calculate optimal rest time based on intensity and fitness level
   */
  static calculateOptimalRestTime(
    params: QuickWorkoutParams,
    exerciseDuration: number
  ): number {
    let baseRestTime = 30; // seconds

    // Adjust based on fitness level
    if (params.fitnessLevel === 'new to exercise') {
      baseRestTime = 45; // More rest for beginners
    } else if (params.fitnessLevel === 'advanced athlete') {
      baseRestTime = 20; // Less rest for advanced
    }

    // Adjust based on energy level
    if (params.energyLevel <= 3) {
      baseRestTime += 15; // More rest when low energy
    } else if (params.energyLevel >= 8) {
      baseRestTime -= 10; // Less rest when high energy
    }

    // Adjust based on exercise duration (longer exercises need more rest)
    if (exerciseDuration > 120) { // 2+ minutes
      baseRestTime += 15;
    } else if (exerciseDuration < 60) { // Less than 1 minute
      baseRestTime -= 10;
    }

    // Ensure reasonable bounds
    return Math.max(10, Math.min(baseRestTime, 90));
  }

  /**
   * Calculate total workout time including exercises and rest
   */
  static calculateTotalWorkoutTime(
    phases: Array<{
      exerciseCount: number;
      exerciseDuration: number;
      restTime: number;
    }>
  ): number {
    return phases.reduce((total, phase) => {
      const exerciseTime = phase.exerciseCount * phase.exerciseDuration;
      const restTime = Math.max(0, (phase.exerciseCount - 1) * phase.restTime);
      return total + exerciseTime + restTime;
    }, 0);
  }

  /**
   * Distribute time across exercises within a phase
   */
  static distributePhaseTime(
    totalPhaseTime: number,
    exercises: Array<{
      name: string;
      priority: 'high' | 'medium' | 'low';
      minDuration?: number;
      maxDuration?: number;
    }>,
    restTimePerExercise: number = 30
  ): Array<{
    name: string;
    duration: number;
    restTime: number;
  }> {
    if (exercises.length === 0) return [];

    // Calculate available time for exercises (excluding rest)
    const totalRestTime = Math.max(0, (exercises.length - 1) * restTimePerExercise);
    const availableExerciseTime = totalPhaseTime - totalRestTime;

    // Sort exercises by priority
    const sortedExercises = [...exercises].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Allocate time based on priority
    const results: Array<{ name: string; duration: number; restTime: number }> = [];
    let remainingTime = availableExerciseTime;

    // First pass: Allocate minimum durations
    for (const exercise of sortedExercises) {
      const minDuration = exercise.minDuration || 30;
      const allocatedDuration = Math.min(minDuration, remainingTime);
      
      results.push({
        name: exercise.name,
        duration: allocatedDuration,
        restTime: restTimePerExercise
      });
      
      remainingTime -= allocatedDuration;
    }

    // Second pass: Distribute remaining time based on priority
    if (remainingTime > 0) {
      const highPriorityCount = sortedExercises.filter(e => e.priority === 'high').length;
      const mediumPriorityCount = sortedExercises.filter(e => e.priority === 'medium').length;
      const lowPriorityCount = sortedExercises.filter(e => e.priority === 'low').length;

      // Calculate bonus time allocation
      const highPriorityBonus = Math.floor(remainingTime * 0.5 / Math.max(1, highPriorityCount));
      const mediumPriorityBonus = Math.floor(remainingTime * 0.3 / Math.max(1, mediumPriorityCount));
      const lowPriorityBonus = Math.floor(remainingTime * 0.2 / Math.max(1, lowPriorityCount));

      // Apply bonus time
      for (let i = 0; i < results.length; i++) {
        const exercise = sortedExercises[i];
        let bonus = 0;
        
        if (exercise.priority === 'high') bonus = highPriorityBonus;
        else if (exercise.priority === 'medium') bonus = mediumPriorityBonus;
        else bonus = lowPriorityBonus;

        // Respect maximum duration if specified
        const maxDuration = exercise.maxDuration || Infinity;
        const newDuration = Math.min(results[i].duration + bonus, maxDuration);
        results[i].duration = newDuration;
      }
    }

    // Set rest time to 0 for last exercise
    if (results.length > 0) {
      results[results.length - 1].restTime = 0;
    }

    return results;
  }

  /**
   * Calculate calories burned estimation
   */
  static estimateCaloriesBurned(
    durationMinutes: number,
    intensity: 'low' | 'moderate' | 'high',
    userWeight: number = 70 // kg, default average
  ): number {
    // MET (Metabolic Equivalent of Task) values for different intensities
    const metValues = {
      low: 3.5,      // Light exercise
      moderate: 6.0, // Moderate exercise
      high: 8.5      // Vigorous exercise
    };

    const met = metValues[intensity];
    
    // Calories = MET × weight(kg) × time(hours)
    const calories = met * userWeight * (durationMinutes / 60);
    
    return Math.round(calories);
  }

  /**
   * Calculate workout intensity score based on parameters
   */
  static calculateIntensityScore(
    params: QuickWorkoutParams,
    config: DurationConfig
  ): number {
    let score = 5; // Base score (1-10 scale)

    // Adjust based on energy level
    score += (params.energyLevel - 5) * 0.5;

    // Adjust based on fitness level
    if (params.fitnessLevel === 'new to exercise') {
      score -= 2;
    } else if (params.fitnessLevel === 'advanced athlete') {
      score += 2;
    }

    // Adjust based on soreness
    if (params.sorenessAreas.length > 0) {
      score -= params.sorenessAreas.length * 0.5;
    }

    // Adjust based on duration (longer workouts can be less intense)
    if (config.duration <= 10) {
      score += 1; // Short workouts tend to be more intense
    } else if (config.duration >= 45) {
      score -= 0.5; // Long workouts tend to be less intense
    }

    // Adjust based on equipment availability
    if (params.equipment.length === 0) {
      score -= 0.5; // Body weight workouts might be slightly less intense
    }

    // Ensure score stays within bounds
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }

  /**
   * Calculate recommended sets and reps based on duration and goals
   */
  static calculateSetsAndReps(
    exerciseDuration: number,
    fitnessLevel: string,
    focus: string
  ): { sets: number; reps: number; restBetweenSets: number } {
    let sets = 2;
    let reps = 12;
    let restBetweenSets = 30;

    // Adjust based on fitness level
    if (fitnessLevel === 'new to exercise') {
      sets = Math.max(1, sets - 1);
      reps = Math.max(8, reps - 2);
      restBetweenSets += 15;
    } else if (fitnessLevel === 'advanced athlete') {
      sets += 1;
      reps += 3;
      restBetweenSets -= 10;
    }

    // Adjust based on focus
    if (focus.includes('Strength')) {
      reps = Math.max(6, reps - 4);
      sets += 1;
      restBetweenSets += 15;
    } else if (focus.includes('Cardio') || focus.includes('Quick Sweat')) {
      reps += 5;
      restBetweenSets -= 10;
    } else if (focus.includes('Core')) {
      reps += 8;
      sets = Math.max(2, sets);
    }

    // Ensure we can fit the sets within the exercise duration
    const timePerSet = (exerciseDuration - (sets - 1) * restBetweenSets) / sets;
    const timePerRep = timePerSet / reps;

    // If reps would be too fast (less than 2 seconds per rep), reduce reps
    if (timePerRep < 2) {
      reps = Math.max(6, Math.floor(timePerSet / 2));
    }

    // If sets don't fit, reduce sets
    const totalTimeNeeded = sets * (reps * 2) + (sets - 1) * restBetweenSets;
    if (totalTimeNeeded > exerciseDuration) {
      sets = Math.max(1, Math.floor(exerciseDuration / (reps * 2 + restBetweenSets)));
    }

    return {
      sets: Math.max(1, sets),
      reps: Math.max(6, reps),
      restBetweenSets: Math.max(10, Math.min(60, restBetweenSets))
    };
  }

  /**
   * Validate duration calculations
   */
  static validateDurationCalculation(
    requestedDuration: number,
    calculatedDuration: number,
    tolerance: number = 60 // seconds
  ): {
    isValid: boolean;
    difference: number;
    percentageDifference: number;
    recommendation?: string;
  } {
    const requestedSeconds = requestedDuration * 60;
    const difference = Math.abs(calculatedDuration - requestedSeconds);
    const percentageDifference = (difference / requestedSeconds) * 100;

    const isValid = difference <= tolerance;

    let recommendation: string | undefined;
    if (!isValid) {
      if (calculatedDuration > requestedSeconds) {
        recommendation = `Calculated duration is ${Math.round(difference)}s longer than requested. Consider reducing exercise durations or rest times.`;
      } else {
        recommendation = `Calculated duration is ${Math.round(difference)}s shorter than requested. Consider adding exercises or increasing durations.`;
      }
    }

    return {
      isValid,
      difference,
      percentageDifference: Math.round(percentageDifference * 10) / 10,
      recommendation
    };
  }
} 