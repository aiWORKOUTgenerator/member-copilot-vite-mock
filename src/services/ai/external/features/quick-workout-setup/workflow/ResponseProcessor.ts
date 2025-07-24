// QuickWorkoutSetup Feature - Response Processor
// Handles AI response parsing, workout structure normalization, and validation

import { GeneratedWorkout } from '../../../types/external-ai.types';
import { 
  QuickWorkoutParams, 
  ResponseProcessingResult, 
  FeatureValidationResult,
  DurationStrategyResult 
} from '../types/quick-workout.types';
import { ResponseParser } from './parsing/ResponseParser';
import { WorkoutNormalizer } from './normalization/WorkoutNormalizer';

/**
 * Response processor for AI workout generation responses
 * Handles parsing, normalization, and validation of generated workouts
 */
export class ResponseProcessor {
  private readonly parser: ResponseParser;
  private readonly normalizer: WorkoutNormalizer;

  constructor() {
    this.parser = new ResponseParser();
    this.normalizer = new WorkoutNormalizer();
  }

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
      // Parse the AI response using the new parsing layer
      console.log('🔍 ResponseProcessor.process - About to parse aiResponse');
      const parseResult = await this.parser.parse(aiResponse);
      
      // Add any parsing issues to our tracking
      issuesFound.push(...parseResult.issues);

      console.log('🔍 ResponseProcessor.process - Parsed workout result:', {
        strategy: parseResult.strategy,
        processingTime: parseResult.processingTime,
        contentLength: parseResult.metrics?.contentLength,
        truncationPoint: parseResult.metrics?.truncationPoint,
        validationScore: parseResult.metrics?.validationScore
      });
      
      if (!parseResult.success || !parseResult.data) {
        throw new Error('Parsing failed: ' + parseResult.issues.join(', '));
      }

      // Normalize workout structure using the new normalization layer
      console.log('🔧 ResponseProcessor.process - Normalizing workout structure');
      const normalizationResult = await this.normalizer.normalize(
        parseResult.data,
        durationResult,
        aiResponse
      );

      // Add normalization issues and fixes to our tracking
      issuesFound.push(...normalizationResult.issuesFound);
      fixesApplied.push(...normalizationResult.fixesApplied);
      
      // Validate the workout
      const validation = this.validateWorkout(normalizationResult.workout, params);
      
      // Calculate processing metrics
      const processingTime = Date.now() - processingStartTime;
      const structureScore = this.calculateStructureScore(normalizationResult.workout);
      const completenessScore = this.calculateCompletenessScore(normalizationResult.workout);
      const consistencyScore = this.calculateConsistencyScore(normalizationResult.workout, durationResult);

      console.log(`✅ ResponseProcessor: Processing completed in ${processingTime}ms`);

      return {
        workout: normalizationResult.workout,
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
} 