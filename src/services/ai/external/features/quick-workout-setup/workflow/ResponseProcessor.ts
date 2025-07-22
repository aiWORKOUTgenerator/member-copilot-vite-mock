// QuickWorkoutSetup Feature - Response Processor
// Handles AI response parsing, workout structure normalization, and validation

import { GeneratedWorkout, WorkoutPhase, Exercise } from '../../../types/external-ai.types';
import { 
  QuickWorkoutParams, 
  ResponseProcessingResult, 
  FeatureValidationResult,
  QuickWorkoutMetadata,
  DurationStrategyResult 
} from '../types/quick-workout.types';

/**
 * Response processor for AI workout generation responses
 * Handles parsing, normalization, and validation of generated workouts
 */
export class ResponseProcessor {

  /**
   * Process AI response into a validated workout structure
   */
  async process(
    aiResponse: unknown,
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    generationStartTime: number
  ): Promise<ResponseProcessingResult> {
    console.log('🔄 ResponseProcessor: Processing AI response');
    
    const processingStartTime = Date.now();
    const issuesFound: string[] = [];
    const fixesApplied: string[] = [];

    try {
      // Parse the AI response
      const parsedWorkout = this.parseAIResponse(aiResponse);
      
      // Normalize workout structure (fix duration issues)
      const normalizedWorkout = this.normalizeWorkoutStructure(parsedWorkout, durationResult, issuesFound, fixesApplied);
      
      // Validate the workout
      const validation = this.validateWorkout(normalizedWorkout, params);
      
      // Calculate processing metrics
      const processingTime = Date.now() - processingStartTime;
      const structureScore = this.calculateStructureScore(normalizedWorkout);
      const completenessScore = this.calculateCompletenessScore(normalizedWorkout);
      const consistencyScore = this.calculateConsistencyScore(normalizedWorkout, durationResult);

      console.log(`✅ ResponseProcessor: Processing completed in ${processingTime}ms`);

      return {
        workout: normalizedWorkout,
        processingTime,
        validationPassed: validation.isValid,
        normalizationApplied: fixesApplied.length > 0,
        issuesFound,
        fixesApplied,
        structureScore,
        completenessScore,
        consistencyScore
      };

    } catch (error) {
      console.error('❌ ResponseProcessor: Processing failed:', error);
      throw new Error(`Response processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse AI response with multiple strategies
   */
  private parseAIResponse(response: unknown): any {
    console.log('📝 ResponseProcessor: Parsing AI response');

    if (typeof response === 'string') {
      return this.parseStringResponse(response);
    }

    if (typeof response === 'object' && response !== null) {
      return response;
    }

    throw new Error('Invalid AI response format');
  }

  /**
   * Parse string response with multiple JSON extraction strategies
   */
  private parseStringResponse(content: string): any {
    console.log(`📝 ResponseProcessor: Parsing string response (${content.length} chars)`);

    // Strategy 1: Try direct JSON parsing
    try {
      return JSON.parse(content);
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: Extract JSON from markdown code blocks
    try {
      const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 3: Extract JSON from any code blocks
    try {
      const codeMatch = content.match(/```\s*\n([\s\S]*?)\n```/);
      if (codeMatch) {
        return JSON.parse(codeMatch[1]);
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 4: Find JSON object in text
    try {
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 5: Create basic workout from text if all JSON parsing fails
    console.warn('📝 ResponseProcessor: All JSON parsing failed, creating basic workout from text');
    return this.createBasicWorkoutFromText(content);
  }

  /**
   * Create a basic workout structure from text response
   */
  private createBasicWorkoutFromText(textResponse: string): any {
    return {
      id: `workout_${Date.now()}`,
      title: 'AI Generated Workout',
      description: 'Workout generated from AI text response',
      totalDuration: 30,
      warmup: {
        name: 'Warm-up',
        duration: 300, // 5 minutes in seconds
        exercises: [{
          name: 'Dynamic Warm-up',
          description: textResponse.substring(0, 200),
          duration: 300
        }]
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 1200, // 20 minutes in seconds
        exercises: [{
          name: 'Main Exercise',
          description: textResponse,
          duration: 1200
        }]
      },
      cooldown: {
        name: 'Cool-down',
        duration: 300, // 5 minutes in seconds
        exercises: [{
          name: 'Cool-down Stretch',
          description: 'Gentle stretching and relaxation',
          duration: 300
        }]
      }
    };
  }

  /**
   * Normalize workout structure and fix duration issues
   * This incorporates the duration normalization logic from OpenAIStrategy
   */
  private normalizeWorkoutStructure(
    workout: any, 
    durationResult: DurationStrategyResult,
    issuesFound: string[],
    fixesApplied: string[]
  ): GeneratedWorkout {
    console.log('🔧 ResponseProcessor: Normalizing workout structure');

    // Handle different phase structures
    let warmup, mainWorkout, cooldown;
    
    // Handle phases at root level
    if (workout.warmup || workout.mainWorkout || workout.cooldown) {
      warmup = workout.warmup;
      mainWorkout = workout.mainWorkout;
      cooldown = workout.cooldown;
    }

    // ✅ FIXED: Recalculate phase durations based on exercises to ensure accuracy
    if (warmup && warmup.exercises && Array.isArray(warmup.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating warm-up phase duration');
      
      // Check if AI generated phase duration in minutes and convert
      if (warmup.duration && warmup.duration >= 1 && warmup.duration <= 10) {
        issuesFound.push(`Warm-up phase has duration ${warmup.duration} which appears to be in minutes`);
        fixesApplied.push('Converted warm-up duration from minutes to seconds');
        warmup.duration = warmup.duration * 60;
      }
      
      warmup = this.createPhaseFromExercises('Warm-up', warmup.exercises, issuesFound, fixesApplied);
    }

    if (mainWorkout && mainWorkout.exercises && Array.isArray(mainWorkout.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating main workout phase duration');
      
      // Check if AI generated phase duration in minutes and convert
      if (mainWorkout.duration && mainWorkout.duration >= 1 && mainWorkout.duration <= 10) {
        issuesFound.push(`Main workout phase has duration ${mainWorkout.duration} which appears to be in minutes`);
        fixesApplied.push('Converted main workout duration from minutes to seconds');
        mainWorkout.duration = mainWorkout.duration * 60;
      }
      
      mainWorkout = this.createPhaseFromExercises('Main Workout', mainWorkout.exercises, issuesFound, fixesApplied);
    }

    if (cooldown && cooldown.exercises && Array.isArray(cooldown.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating cool-down phase duration');
      
      // Check if AI generated phase duration in minutes and convert
      if (cooldown.duration && cooldown.duration >= 1 && cooldown.duration <= 10) {
        issuesFound.push(`Cool-down phase has duration ${cooldown.duration} which appears to be in minutes`);
        fixesApplied.push('Converted cool-down duration from minutes to seconds');
        cooldown.duration = cooldown.duration * 60;
      }
      
      cooldown = this.createPhaseFromExercises('Cool-down', cooldown.exercises, issuesFound, fixesApplied);
    }

    // Create default phases if missing
    if (!warmup) {
      warmup = this.createDefaultPhase('Warm-up', 5, issuesFound, fixesApplied);
      fixesApplied.push('Created default warm-up phase');
    }
    
    if (!mainWorkout) {
      mainWorkout = this.createDefaultPhase('Main Workout', 20, issuesFound, fixesApplied);
      fixesApplied.push('Created default main workout phase');
    }
    
    if (!cooldown) {
      cooldown = this.createDefaultPhase('Cool-down', 5, issuesFound, fixesApplied);
      fixesApplied.push('Created default cool-down phase');
    }

    // Create normalized workout structure
    const normalizedWorkout: GeneratedWorkout = {
      id: workout.id || `workout_${Date.now()}`,
      title: workout.title || workout.name || workout.workoutName || 'Generated Workout',
      description: workout.description || 'AI-generated workout plan',
      totalDuration: workout.totalDuration || workout.duration || durationResult.adjustedDuration,
      estimatedCalories: workout.estimatedCalories || this.estimateCalories(durationResult.adjustedDuration),
      difficulty: workout.difficulty || 'some experience',
      equipment: Array.isArray(workout.equipment) ? workout.equipment : [],
      warmup,
      mainWorkout,
      cooldown,
      reasoning: workout.reasoning || 'AI-generated workout based on your profile and preferences',
      personalizedNotes: Array.isArray(workout.personalizedNotes) ? workout.personalizedNotes : [],
      progressionTips: Array.isArray(workout.progressionTips) ? workout.progressionTips : [],
      safetyReminders: Array.isArray(workout.safetyReminders) ? workout.safetyReminders : [],
      generatedAt: workout.generatedAt || new Date(),
      aiModel: workout.aiModel || 'gpt-4o',
      confidence: workout.confidence || 0.8,
      tags: Array.isArray(workout.tags) ? workout.tags : []
    };

    console.log(`✅ ResponseProcessor: Normalized workout with ${fixesApplied.length} fixes applied`);
    return normalizedWorkout;
  }

  /**
   * Create a workout phase from exercises with accurate duration calculation
   */
  private createPhaseFromExercises(
    name: string, 
    exercises: any[],
    issuesFound: string[],
    fixesApplied: string[]
  ): WorkoutPhase {
    console.log(`🔧 ResponseProcessor: Creating phase "${name}" with ${exercises.length} exercises`);
    
    // Calculate total duration including exercise time and rest periods
    const totalDuration = exercises.reduce((sum, ex, index) => {
      let exerciseDuration = ex.duration || ex.durationMinutes || 60;
      const restTime = ex.restTime || ex.rest || 30;
      
      // ✅ FIXED: More intelligent duration detection
      if (exerciseDuration >= 1 && exerciseDuration <= 10) {
        issuesFound.push(`Exercise "${ex.name}" has duration ${exerciseDuration} which appears to be in minutes`);
        fixesApplied.push(`Converted exercise "${ex.name}" duration from minutes to seconds`);
        exerciseDuration = exerciseDuration * 60;
      }
      
      // Add exercise duration
      let phaseTime = exerciseDuration;
      
      // Add rest time after each exercise (except the last one)
      if (index < exercises.length - 1) {
        phaseTime += restTime;
      }
      
      return sum + phaseTime;
    }, 0);
    
    console.log(`🔧 ResponseProcessor: Phase "${name}" total duration: ${totalDuration} seconds`);
    
    return {
      name,
      duration: totalDuration,
      exercises: exercises.map((exercise, index) => this.normalizeExercise(exercise, index, issuesFound, fixesApplied)),
      instructions: `Complete ${name.toLowerCase()} phase with proper form`,
      tips: []
    };
  }

  /**
   * Normalize individual exercise structure
   */
  private normalizeExercise(
    exercise: any, 
    index: number,
    issuesFound: string[],
    fixesApplied: string[]
  ): Exercise {
    let exerciseDuration = exercise.duration || exercise.durationMinutes || 60;
    
    // ✅ FIXED: Apply the same intelligent duration fix to individual exercises
    if (exerciseDuration >= 1 && exerciseDuration <= 10) {
      issuesFound.push(`Exercise duration appears to be in minutes: ${exerciseDuration}`);
      fixesApplied.push(`Converted exercise duration to seconds: ${exerciseDuration * 60}`);
      exerciseDuration = exerciseDuration * 60;
    }
    
    return {
      id: exercise.id || `exercise_${index + 1}`,
      name: exercise.name || exercise.activityName || `Exercise ${index + 1}`,
      description: exercise.description || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'}`,
      duration: exerciseDuration,
      sets: exercise.sets || 1,
      reps: exercise.reps || exercise.repetitions || 10,
      restTime: exercise.rest || exercise.restTime || 30,
      equipment: exercise.equipment || exercise.equipmentNeeded ? [exercise.equipmentNeeded] : [],
      form: exercise.form || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'} with proper form`,
      modifications: exercise.modifications || [],
      commonMistakes: exercise.commonMistakes || [],
      primaryMuscles: exercise.primaryMuscles || [],
      secondaryMuscles: exercise.secondaryMuscles || [],
      movementType: exercise.movementType || 'strength' as const,
      personalizedNotes: exercise.personalizedNotes || [],
      difficultyAdjustments: exercise.difficultyAdjustments || []
    };
  }

  /**
   * Create a default workout phase
   */
  private createDefaultPhase(
    name: string, 
    durationMinutes: number,
    issuesFound: string[],
    fixesApplied: string[]
  ): WorkoutPhase {
    const duration = durationMinutes * 60; // Convert to seconds
    
    issuesFound.push(`Missing ${name.toLowerCase()} phase in AI response`);
    fixesApplied.push(`Created default ${name.toLowerCase()} phase`);
    
    return {
      name,
      duration,
      exercises: [{
        id: `exercise_1`,
        name: `${name} Exercise`,
        description: `Perform ${name.toLowerCase()} exercises`,
        duration,
        form: `Perform ${name.toLowerCase()} exercises with proper form`,
        modifications: [],
        commonMistakes: [],
        primaryMuscles: [],
        secondaryMuscles: [],
        movementType: 'strength' as const,
        personalizedNotes: [],
        difficultyAdjustments: []
      }],
      instructions: `Complete ${name.toLowerCase()} phase`,
      tips: []
    };
  }

  /**
   * Validate the processed workout
   */
  private validateWorkout(workout: GeneratedWorkout, params: QuickWorkoutParams): FeatureValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check required fields
    if (!workout.id) errors.push({ field: 'id', message: 'Workout ID is required', severity: 'error' });
    if (!workout.title) errors.push({ field: 'title', message: 'Workout title is required', severity: 'error' });
    
    // Check phases
    if (!workout.warmup) errors.push({ field: 'warmup', message: 'Warmup phase is required', severity: 'error' });
    if (!workout.mainWorkout) errors.push({ field: 'mainWorkout', message: 'Main workout phase is required', severity: 'error' });
    if (!workout.cooldown) errors.push({ field: 'cooldown', message: 'Cooldown phase is required', severity: 'error' });

    // Check duration consistency
    const totalPhaseDuration = (workout.warmup?.duration || 0) + (workout.mainWorkout?.duration || 0) + (workout.cooldown?.duration || 0);
    const expectedDuration = params.duration * 60; // Convert to seconds
    
    if (Math.abs(totalPhaseDuration - expectedDuration) > 300) { // 5 minute tolerance
      warnings.push({ 
        field: 'duration', 
        message: `Total phase duration (${Math.round(totalPhaseDuration/60)}min) differs from expected (${params.duration}min)`,
        recommendation: 'Consider adjusting phase durations'
      });
    }

    // Calculate validation score
    const maxScore = 100;
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    const score = Math.max(0, maxScore - errorPenalty - warningPenalty);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(workout: GeneratedWorkout): number {
    let score = 0;
    
    // Phase completeness (30 points)
    if (workout.warmup) score += 10;
    if (workout.mainWorkout) score += 10;
    if (workout.cooldown) score += 10;
    
    // Exercise completeness (40 points)
    const totalExercises = (workout.warmup?.exercises?.length || 0) + 
                          (workout.mainWorkout?.exercises?.length || 0) + 
                          (workout.cooldown?.exercises?.length || 0);
    score += Math.min(40, totalExercises * 5);
    
    // Metadata completeness (30 points)
    if (workout.title) score += 5;
    if (workout.description) score += 5;
    if (workout.reasoning) score += 10;
    if (workout.personalizedNotes?.length) score += 5;
    if (workout.safetyReminders?.length) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(workout: GeneratedWorkout): number {
    let score = 0;
    const maxScore = 100;
    
    // Required fields (50 points)
    const requiredFields = ['id', 'title', 'description', 'warmup', 'mainWorkout', 'cooldown'];
    const presentFields = requiredFields.filter(field => workout[field as keyof GeneratedWorkout]);
    score += (presentFields.length / requiredFields.length) * 50;
    
    // Optional enhancement fields (50 points)
    const enhancementFields = ['reasoning', 'personalizedNotes', 'progressionTips', 'safetyReminders'];
    const presentEnhancements = enhancementFields.filter(field => {
      const value = workout[field as keyof GeneratedWorkout];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });
    score += (presentEnhancements.length / enhancementFields.length) * 50;
    
    return Math.min(maxScore, score);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(workout: GeneratedWorkout, durationResult: DurationStrategyResult): number {
    let score = 100;
    
    // Duration consistency
    const totalPhaseDuration = (workout.warmup?.duration || 0) + 
                              (workout.mainWorkout?.duration || 0) + 
                              (workout.cooldown?.duration || 0);
    const expectedDuration = durationResult.adjustedDuration * 60;
    const durationDiff = Math.abs(totalPhaseDuration - expectedDuration);
    
    if (durationDiff > 300) score -= 20; // 5+ minute difference
    else if (durationDiff > 120) score -= 10; // 2+ minute difference
    
    // Exercise count consistency with duration config
    const config = durationResult.config;
    const actualExerciseCount = (workout.warmup?.exercises?.length || 0) + 
                               (workout.mainWorkout?.exercises?.length || 0) + 
                               (workout.cooldown?.exercises?.length || 0);
    
    const expectedExerciseCount = config.exerciseCount.total;
    const exerciseCountDiff = Math.abs(actualExerciseCount - expectedExerciseCount);
    
    if (exerciseCountDiff > 3) score -= 15;
    else if (exerciseCountDiff > 1) score -= 5;
    
    return Math.max(0, score);
  }

  /**
   * Estimate calories for workout duration
   */
  private estimateCalories(durationMinutes: number): number {
    // Rough estimate: 7-10 calories per minute for moderate intensity
    return Math.round(durationMinutes * 8.5);
  }
} 