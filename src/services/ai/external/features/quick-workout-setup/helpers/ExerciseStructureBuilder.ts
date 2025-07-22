// QuickWorkoutSetup Feature - Exercise Structure Builder
// Handles exercise structure creation, phase building, and workout composition

import { Exercise, WorkoutPhase } from '../../../types/external-ai.types';
import { DurationConfig } from '../constants/quick-workout.constants';
import { QuickWorkoutParams } from '../types/quick-workout.types';
import { DurationCalculator } from './DurationCalculator';

/**
 * Exercise structure building utilities for QuickWorkoutSetup feature
 */
export class ExerciseStructureBuilder {

  /**
   * Build complete workout phase structure
   */
  static buildWorkoutPhases(
    config: DurationConfig,
    params: QuickWorkoutParams
  ): {
    warmup: WorkoutPhase;
    mainWorkout: WorkoutPhase;
    cooldown: WorkoutPhase;
  } {
    const phaseDurations = DurationCalculator.calculatePhaseDurations(config);

    return {
      warmup: this.buildWarmupPhase(phaseDurations.warmup, config, params),
      mainWorkout: this.buildMainWorkoutPhase(phaseDurations.main, config, params),
      cooldown: this.buildCooldownPhase(phaseDurations.cooldown, config, params)
    };
  }

  /**
   * Build warm-up phase
   */
  static buildWarmupPhase(
    duration: number,
    config: DurationConfig,
    params: QuickWorkoutParams
  ): WorkoutPhase {
    const exerciseCount = config.exerciseCount.warmup;
    const restTime = DurationCalculator.calculateOptimalRestTime(params, duration / exerciseCount);
    const exerciseDuration = DurationCalculator.calculateExerciseDuration(duration, exerciseCount, restTime);

    const exercises = this.generateWarmupExercises(exerciseCount, exerciseDuration, restTime, params);

    return {
      name: 'Warm-up',
      duration,
      exercises,
      instructions: 'Start with gentle movements to prepare your body for exercise. Focus on increasing heart rate and loosening joints.',
      tips: [
        'Move slowly and controlled during warm-up',
        'Focus on full range of motion',
        'Breathe deeply throughout'
      ]
    };
  }

  /**
   * Build main workout phase
   */
  static buildMainWorkoutPhase(
    duration: number,
    config: DurationConfig,
    params: QuickWorkoutParams
  ): WorkoutPhase {
    const exerciseCount = config.exerciseCount.main;
    const restTime = DurationCalculator.calculateOptimalRestTime(params, duration / exerciseCount);
    const exerciseDuration = DurationCalculator.calculateExerciseDuration(duration, exerciseCount, restTime);

    const exercises = this.generateMainWorkoutExercises(exerciseCount, exerciseDuration, restTime, params, config);

    return {
      name: 'Main Workout',
      duration,
      exercises,
      instructions: `Complete ${exerciseCount} exercises focusing on ${params.focus.toLowerCase()}. Maintain proper form and adjust intensity based on your energy level.`,
      tips: [
        'Focus on proper form over speed',
        'Adjust intensity based on your energy level',
        'Take extra rest if needed between exercises'
      ]
    };
  }

  /**
   * Build cool-down phase
   */
  static buildCooldownPhase(
    duration: number,
    config: DurationConfig,
    params: QuickWorkoutParams
  ): WorkoutPhase {
    const exerciseCount = config.exerciseCount.cooldown;
    const restTime = Math.min(15, DurationCalculator.calculateOptimalRestTime(params, duration / exerciseCount));
    const exerciseDuration = DurationCalculator.calculateExerciseDuration(duration, exerciseCount, restTime);

    const exercises = this.generateCooldownExercises(exerciseCount, exerciseDuration, restTime, params);

    return {
      name: 'Cool-down',
      duration,
      exercises,
      instructions: 'Gradually lower your heart rate with gentle stretches and breathing exercises. Hold stretches for 15-30 seconds.',
      tips: [
        'Hold stretches for 15-30 seconds',
        'Breathe deeply and relax',
        'Focus on areas that feel tight'
      ]
    };
  }

  /**
   * Generate warm-up exercises
   */
  private static generateWarmupExercises(
    count: number,
    duration: number,
    restTime: number,
    params: QuickWorkoutParams
  ): Exercise[] {
    const warmupExercises = [
      {
        name: 'Arm Circles',
        description: 'Stand with feet shoulder-width apart. Extend arms to sides and make small circles, gradually increasing size.',
        primaryMuscles: ['shoulders', 'arms'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Leg Swings',
        description: 'Hold onto a wall or chair for balance. Swing one leg forward and back, then side to side.',
        primaryMuscles: ['legs', 'hips'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Torso Twists',
        description: 'Stand with feet hip-width apart. Place hands on hips and rotate torso left and right.',
        primaryMuscles: ['core', 'back'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Marching in Place',
        description: 'March in place, lifting knees to hip height. Swing arms naturally.',
        primaryMuscles: ['legs', 'core'],
        movementType: 'cardio' as const
      },
      {
        name: 'Shoulder Rolls',
        description: 'Roll shoulders forward and backward in large circles.',
        primaryMuscles: ['shoulders', 'upper back'],
        movementType: 'flexibility' as const
      }
    ];

    return this.selectAndBuildExercises(warmupExercises, count, duration, restTime, params, 'warmup');
  }

  /**
   * Generate main workout exercises
   */
  private static generateMainWorkoutExercises(
    count: number,
    duration: number,
    restTime: number,
    params: QuickWorkoutParams,
    config: DurationConfig
  ): Exercise[] {
    let exercisePool = [];

    // Select exercises based on focus area
    if (params.focus.includes('Strength')) {
      exercisePool = this.getStrengthExercises(params.equipment);
    } else if (params.focus.includes('Cardio') || params.focus.includes('Quick Sweat')) {
      exercisePool = this.getCardioExercises(params.equipment);
    } else if (params.focus.includes('Core')) {
      exercisePool = this.getCoreExercises(params.equipment);
    } else if (params.focus.includes('Flexibility')) {
      exercisePool = this.getFlexibilityExercises(params.equipment);
    } else {
      // General/mixed workout
      exercisePool = [
        ...this.getStrengthExercises(params.equipment).slice(0, 3),
        ...this.getCardioExercises(params.equipment).slice(0, 2),
        ...this.getCoreExercises(params.equipment).slice(0, 2)
      ];
    }

    return this.selectAndBuildExercises(exercisePool, count, duration, restTime, params, 'main');
  }

  /**
   * Generate cool-down exercises
   */
  private static generateCooldownExercises(
    count: number,
    duration: number,
    restTime: number,
    params: QuickWorkoutParams
  ): Exercise[] {
    const cooldownExercises = [
      {
        name: 'Forward Fold Stretch',
        description: 'Stand with feet hip-width apart. Slowly fold forward, letting arms hang naturally.',
        primaryMuscles: ['hamstrings', 'back'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Chest Stretch',
        description: 'Clasp hands behind back and lift arms away from body, opening chest.',
        primaryMuscles: ['chest', 'shoulders'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Quad Stretch',
        description: 'Stand on one leg, pull other heel toward glutes. Hold wall for balance if needed.',
        primaryMuscles: ['quadriceps'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Deep Breathing',
        description: 'Sit or stand comfortably. Take slow, deep breaths, inhaling for 4 counts and exhaling for 6.',
        primaryMuscles: ['respiratory'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Shoulder Stretch',
        description: 'Pull one arm across chest, hold with other arm. Feel stretch in shoulder and back.',
        primaryMuscles: ['shoulders', 'upper back'],
        movementType: 'flexibility' as const
      }
    ];

    return this.selectAndBuildExercises(cooldownExercises, count, duration, restTime, params, 'cooldown');
  }

  /**
   * Get strength exercises based on available equipment
   */
  private static getStrengthExercises(equipment: string[]) {
    const bodyweightStrength = [
      {
        name: 'Push-ups',
        description: 'Start in plank position. Lower chest to floor, then push back up.',
        primaryMuscles: ['chest', 'shoulders', 'triceps'],
        secondaryMuscles: ['core'],
        movementType: 'strength' as const
      },
      {
        name: 'Squats',
        description: 'Stand with feet shoulder-width apart. Lower hips back and down, then return to standing.',
        primaryMuscles: ['quadriceps', 'glutes'],
        secondaryMuscles: ['hamstrings', 'core'],
        movementType: 'strength' as const
      },
      {
        name: 'Lunges',
        description: 'Step forward into lunge position. Lower back knee toward floor, then return to standing.',
        primaryMuscles: ['quadriceps', 'glutes'],
        secondaryMuscles: ['hamstrings', 'calves'],
        movementType: 'strength' as const
      },
      {
        name: 'Plank',
        description: 'Hold body in straight line from head to heels, supporting weight on forearms and toes.',
        primaryMuscles: ['core'],
        secondaryMuscles: ['shoulders', 'back'],
        movementType: 'strength' as const
      }
    ];

    const dumbbellStrength = [
      {
        name: 'Dumbbell Rows',
        description: 'Hinge at hips, pull dumbbells to ribs, squeeze shoulder blades together.',
        primaryMuscles: ['back', 'biceps'],
        secondaryMuscles: ['shoulders'],
        movementType: 'strength' as const
      },
      {
        name: 'Dumbbell Press',
        description: 'Press dumbbells overhead from shoulder height.',
        primaryMuscles: ['shoulders', 'triceps'],
        secondaryMuscles: ['core'],
        movementType: 'strength' as const
      }
    ];

    let exercises = [...bodyweightStrength];
    
    if (equipment.includes('Dumbbells')) {
      exercises = [...exercises, ...dumbbellStrength];
    }

    return exercises;
  }

  /**
   * Get cardio exercises
   */
  private static getCardioExercises(equipment: string[]) {
    return [
      {
        name: 'Jumping Jacks',
        description: 'Jump feet apart while raising arms overhead, then return to starting position.',
        primaryMuscles: ['full body'],
        movementType: 'cardio' as const
      },
      {
        name: 'High Knees',
        description: 'Run in place, bringing knees up to hip height.',
        primaryMuscles: ['legs', 'core'],
        movementType: 'cardio' as const
      },
      {
        name: 'Burpees',
        description: 'Squat down, jump back to plank, do push-up, jump feet to hands, jump up.',
        primaryMuscles: ['full body'],
        movementType: 'cardio' as const
      },
      {
        name: 'Mountain Climbers',
        description: 'In plank position, alternate bringing knees to chest rapidly.',
        primaryMuscles: ['core', 'shoulders'],
        secondaryMuscles: ['legs'],
        movementType: 'cardio' as const
      }
    ];
  }

  /**
   * Get core exercises
   */
  private static getCoreExercises(equipment: string[]) {
    return [
      {
        name: 'Crunches',
        description: 'Lie on back, knees bent. Lift shoulders off ground, engaging abs.',
        primaryMuscles: ['abs'],
        movementType: 'strength' as const
      },
      {
        name: 'Russian Twists',
        description: 'Sit with knees bent, lean back slightly. Rotate torso side to side.',
        primaryMuscles: ['obliques', 'abs'],
        movementType: 'strength' as const
      },
      {
        name: 'Dead Bug',
        description: 'Lie on back, arms up, knees at 90 degrees. Lower opposite arm and leg.',
        primaryMuscles: ['core'],
        movementType: 'strength' as const
      },
      {
        name: 'Bicycle Crunches',
        description: 'Lie on back, bring opposite elbow to knee in cycling motion.',
        primaryMuscles: ['abs', 'obliques'],
        movementType: 'strength' as const
      }
    ];
  }

  /**
   * Get flexibility exercises
   */
  private static getFlexibilityExercises(equipment: string[]) {
    return [
      {
        name: 'Cat-Cow Stretch',
        description: 'On hands and knees, arch and round spine alternately.',
        primaryMuscles: ['spine', 'core'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Child\'s Pose',
        description: 'Kneel and sit back on heels, extend arms forward on ground.',
        primaryMuscles: ['back', 'shoulders'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Hip Flexor Stretch',
        description: 'Lunge position, push hips forward to stretch hip flexors.',
        primaryMuscles: ['hip flexors'],
        movementType: 'flexibility' as const
      },
      {
        name: 'Spinal Twist',
        description: 'Sit with legs extended, cross one leg over, twist toward bent knee.',
        primaryMuscles: ['spine', 'obliques'],
        movementType: 'flexibility' as const
      }
    ];
  }

  /**
   * Select and build exercises from pool
   */
  private static selectAndBuildExercises(
    exercisePool: any[],
    count: number,
    duration: number,
    restTime: number,
    params: QuickWorkoutParams,
    phaseType: 'warmup' | 'main' | 'cooldown'
  ): Exercise[] {
    // Select exercises avoiding sore areas
    const availableExercises = exercisePool.filter(ex => {
      if (params.sorenessAreas.length === 0) return true;
      
      const exerciseMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
      return !exerciseMuscles.some(muscle => 
        params.sorenessAreas.some(soreArea => 
          muscle.toLowerCase().includes(soreArea.toLowerCase()) ||
          soreArea.toLowerCase().includes(muscle.toLowerCase())
        )
      );
    });

    // Select the required number of exercises
    const selectedExercises = availableExercises.slice(0, count);
    
    // If we don't have enough exercises, repeat some
    while (selectedExercises.length < count && availableExercises.length > 0) {
      selectedExercises.push(availableExercises[selectedExercises.length % availableExercises.length]);
    }

    // Build Exercise objects
    return selectedExercises.map((ex, index) => {
      const setsAndReps = DurationCalculator.calculateSetsAndReps(
        duration,
        params.fitnessLevel,
        params.focus
      );

      const modifications = this.generateModifications(ex, params.fitnessLevel);
      const commonMistakes = this.generateCommonMistakes(ex);

      return {
        id: `${phaseType}_exercise_${index + 1}`,
        name: ex.name,
        description: ex.description,
        duration: duration,
        sets: phaseType === 'cooldown' ? 1 : setsAndReps.sets,
        reps: phaseType === 'cooldown' ? 1 : setsAndReps.reps,
        restTime: index === selectedExercises.length - 1 ? 0 : restTime,
        equipment: this.getExerciseEquipment(ex, params.equipment),
        form: ex.description,
        modifications,
        commonMistakes,
        primaryMuscles: ex.primaryMuscles || [],
        secondaryMuscles: ex.secondaryMuscles || [],
        movementType: ex.movementType,
        personalizedNotes: this.generatePersonalizedNotes(ex, params),
        difficultyAdjustments: this.generateDifficultyAdjustments(ex, params.fitnessLevel)
      };
    });
  }

  /**
   * Generate exercise modifications based on fitness level
   */
  private static generateModifications(exercise: any, fitnessLevel: string) {
    const modifications = [];

    if (fitnessLevel === 'new to exercise') {
      if (exercise.name === 'Push-ups') {
        modifications.push({
          type: 'easier' as const,
          description: 'Knee push-ups',
          instructions: 'Perform push-ups from knees instead of toes'
        });
      }
      if (exercise.name === 'Burpees') {
        modifications.push({
          type: 'easier' as const,
          description: 'Step-back burpees',
          instructions: 'Step back into plank instead of jumping'
        });
      }
    }

    if (fitnessLevel === 'advanced athlete') {
      if (exercise.name === 'Push-ups') {
        modifications.push({
          type: 'harder' as const,
          description: 'Diamond push-ups',
          instructions: 'Form diamond shape with hands for increased difficulty'
        });
      }
      if (exercise.name === 'Squats') {
        modifications.push({
          type: 'harder' as const,
          description: 'Jump squats',
          instructions: 'Add explosive jump at top of movement'
        });
      }
    }

    return modifications;
  }

  /**
   * Generate common mistakes for exercises
   */
  private static generateCommonMistakes(exercise: any): string[] {
    const mistakes: Record<string, string[]> = {
      'Push-ups': ['Sagging hips', 'Not going full range of motion', 'Flaring elbows too wide'],
      'Squats': ['Knees caving inward', 'Not sitting back enough', 'Coming up on toes'],
      'Plank': ['Sagging hips', 'Holding breath', 'Looking up instead of down'],
      'Burpees': ['Not fully extending in jump', 'Sloppy push-up form', 'Landing hard on feet']
    };

    return mistakes[exercise.name] || ['Poor form', 'Moving too fast', 'Not breathing properly'];
  }

  /**
   * Get equipment needed for exercise
   */
  private static getExerciseEquipment(exercise: any, availableEquipment: string[]): string[] {
    // Most exercises are bodyweight unless specified
    if (exercise.name.includes('Dumbbell')) {
      return availableEquipment.includes('Dumbbells') ? ['Dumbbells'] : [];
    }
    
    return [];
  }

  /**
   * Generate personalized notes
   */
  private static generatePersonalizedNotes(exercise: any, params: QuickWorkoutParams): string[] {
    const notes: string[] = [];

    if (params.energyLevel <= 3) {
      notes.push('Take your time and focus on form over intensity');
    }

    if (params.fitnessLevel === 'new to exercise') {
      notes.push('Start with the easier modification if needed');
    }

    if (exercise.movementType === 'cardio' && params.energyLevel <= 4) {
      notes.push('Reduce intensity if feeling fatigued');
    }

    return notes;
  }

  /**
   * Generate difficulty adjustments
   */
  private static generateDifficultyAdjustments(exercise: any, fitnessLevel: string) {
    const adjustments = [];

    adjustments.push({
      level: 'new to exercise' as const,
      modification: 'Reduce reps by 25% and take longer rest periods',
      reasoning: 'Allow more time to learn proper form and build endurance'
    });

    adjustments.push({
      level: 'some experience' as const,
      modification: 'Perform as prescribed with focus on form',
      reasoning: 'Standard difficulty appropriate for this level'
    });

    adjustments.push({
      level: 'advanced athlete' as const,
      modification: 'Increase reps by 20% or add advanced variation',
      reasoning: 'Higher challenge appropriate for advanced fitness level'
    });

    return adjustments;
  }
} 