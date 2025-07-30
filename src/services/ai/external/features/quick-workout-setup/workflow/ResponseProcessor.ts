// QuickWorkoutSetup Feature - Response Processor
// Handles AI response parsing, workout structure normalization, and validation

import { GeneratedWorkout } from '../../../types/external-ai.types';
import { 
  QuickWorkoutParams, 
  ResponseProcessingResult, 
  FeatureValidationResult,
  DurationStrategyResult,
  ValidationError,
  ValidationWarning
} from '../types/quick-workout.types';
import { ResponseParser } from './parsing/ResponseParser';
import { WorkoutNormalizer } from './normalization/WorkoutNormalizer';
import { ConfidenceServiceFactory } from '../../../../domains/confidence/ConfidenceServiceFactory';
import { ConfidenceContext } from '../../../../domains/confidence/types/confidence.types';
import { UserProfile } from '../../../../../../types/user';

/**
 * Response processor for AI workout generation responses
 * Handles parsing, normalization, and validation of generated workouts
 */
export class ResponseProcessor {
  private readonly parser: ResponseParser;
  private readonly normalizer: WorkoutNormalizer;

  // Validation constants
  private static readonly DURATION_TOLERANCE_SECONDS = 5 * 60; // 5 minutes in seconds
  private static readonly ERROR_PENALTY = 4 * 5; // 20 points
  private static readonly WARNING_PENALTY = 5; // 5 points
  private static readonly MAX_VALIDATION_SCORE = 10 * 10; // 100 points
  
  // Structure scoring constants
  private static readonly PHASE_COMPLETENESS_POINTS = 2 * 5; // 10 points per phase
  private static readonly EXERCISE_POINTS_PER_EXERCISE = 5; // 5 points per exercise
  private static readonly MAX_EXERCISE_POINTS = 4 * 10; // 40 points max
  private static readonly METADATA_POINTS = {
    title: 5,
    description: 5,
    reasoning: 2 * 5, // 10 points
    personalizedNotes: 5,
    safetyReminders: 5
  };
  
  // Completeness scoring constants
  private static readonly REQUIRED_FIELDS_WEIGHT = 5 * 10; // 50 points
  private static readonly ENHANCEMENT_FIELDS_WEIGHT = 5 * 10; // 50 points
  
  // Consistency scoring constants
  private static readonly DURATION_DIFF_PENALTIES = {
    high: { threshold: 5 * 60, penalty: 4 * 5 }, // 5+ minute difference, 20 penalty
    medium: { threshold: 2 * 60, penalty: 2 * 5 } // 2+ minute difference, 10 penalty
  };
  private static readonly EXERCISE_COUNT_PENALTIES = {
    high: { threshold: 3, penalty: 3 * 5 }, // 3+ difference, 15 penalty
    medium: { threshold: 1, penalty: 5 } // 1+ difference, 5 penalty
  };

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
    generationStartTime: number,
    userProfile?: UserProfile
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
      
      // Calculate confidence using the new confidence service
      let confidence = 0.8; // Default fallback
      let confidenceFactors: {
        profileMatch: number;
        safetyAlignment: number;
        equipmentFit: number;
        goalAlignment: number;
        structureQuality: number;
      } | undefined = undefined;

      if (userProfile && ConfidenceServiceFactory.isConfidenceEnabled(userProfile)) {
        try {
          console.log('🎯 ResponseProcessor.process - Calculating confidence');
          const confidenceContext: ConfidenceContext = {
            workoutType: 'quick',
            generationSource: 'external',
            environmentalFactors: {
              location: params.location === 'outdoor' ? 'outdoor' : 'indoor',
              timeOfDay: 'morning', // Default, could be enhanced with actual time
            },
            userPreferences: {
              intensity: params.fitnessLevel === 'advanced athlete' ? 'high' : 
                        params.fitnessLevel === 'some experience' ? 'moderate' : 'low',
              duration: params.duration,
              focus: params.focus || 'general fitness'
            }
          };

          const confidenceResult = await ConfidenceServiceFactory.calculateConfidence(
            userProfile,
            normalizationResult.workout,
            confidenceContext
          );

          if (confidenceResult) {
            confidence = confidenceResult.confidence;
            confidenceFactors = confidenceResult.confidenceFactors;
            
            // Update workout with confidence factors
            normalizationResult.workout.confidence = confidence;
            normalizationResult.workout.confidenceFactors = confidenceFactors;
            
            console.log('✅ ResponseProcessor.process - Confidence calculated', {
              confidence: confidence.toFixed(3),
              factors: confidenceFactors
            });
          }
        } catch (error) {
          console.warn('⚠️ ResponseProcessor.process - Confidence calculation failed, using fallback:', error);
          // Keep the fallback confidence value
        }
      } else {
        console.log('ℹ️ ResponseProcessor.process - Confidence calculation disabled or no user profile');
      }
      
      // Calculate processing metrics
      const processingTime = Date.now() - processingStartTime;
      const totalGenerationTime = Date.now() - generationStartTime;
      const structureScore = this.calculateStructureScore(normalizationResult.workout);
      const completenessScore = this.calculateCompletenessScore(normalizationResult.workout);
      const consistencyScore = this.calculateConsistencyScore(normalizationResult.workout, durationResult);

      console.log(`✅ ResponseProcessor: Processing completed in ${processingTime}ms (total generation: ${totalGenerationTime}ms)`);

      return {
        workout: normalizationResult.workout,
        processingTime,
        totalGenerationTime,
        validationPassed: validation.isValid,
        normalizationApplied: fixesApplied.length > 0,
        issuesFound,
        fixesApplied,
        structureScore,
        completenessScore,
        consistencyScore,
        confidence,
        confidenceFactors
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
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
    
    if (Math.abs(totalPhaseDuration - expectedDuration) > ResponseProcessor.DURATION_TOLERANCE_SECONDS) {
      warnings.push({ 
        field: 'duration', 
        message: `Total phase duration (${Math.round(totalPhaseDuration/60)}min) differs from expected (${params.duration}min)`,
        recommendation: 'Consider adjusting phase durations'
      });
    }

    // Calculate validation score
    const errorPenalty = errors.length * ResponseProcessor.ERROR_PENALTY;
    const warningPenalty = warnings.length * ResponseProcessor.WARNING_PENALTY;
    const score = Math.max(0, ResponseProcessor.MAX_VALIDATION_SCORE - errorPenalty - warningPenalty);

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
    if (workout.warmup) score += ResponseProcessor.PHASE_COMPLETENESS_POINTS;
    if (workout.mainWorkout) score += ResponseProcessor.PHASE_COMPLETENESS_POINTS;
    if (workout.cooldown) score += ResponseProcessor.PHASE_COMPLETENESS_POINTS;
    
    // Exercise completeness (40 points)
    const totalExercises = (workout.warmup?.exercises?.length || 0) + 
                          (workout.mainWorkout?.exercises?.length || 0) + 
                          (workout.cooldown?.exercises?.length || 0);
    score += Math.min(ResponseProcessor.MAX_EXERCISE_POINTS, totalExercises * ResponseProcessor.EXERCISE_POINTS_PER_EXERCISE);
    
    // Metadata completeness (30 points)
    if (workout.title) score += ResponseProcessor.METADATA_POINTS.title;
    if (workout.description) score += ResponseProcessor.METADATA_POINTS.description;
    if (workout.reasoning) score += ResponseProcessor.METADATA_POINTS.reasoning;
    if (workout.personalizedNotes?.length) score += ResponseProcessor.METADATA_POINTS.personalizedNotes;
    if (workout.safetyReminders?.length) score += ResponseProcessor.METADATA_POINTS.safetyReminders;
    
    return Math.min(ResponseProcessor.MAX_VALIDATION_SCORE, score);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(workout: GeneratedWorkout): number {
    let score = 0;
    
    // Required fields (50 points)
    const requiredFields = ['id', 'title', 'description', 'warmup', 'mainWorkout', 'cooldown'];
    const presentFields = requiredFields.filter(field => workout[field as keyof GeneratedWorkout]);
    score += (presentFields.length / requiredFields.length) * ResponseProcessor.REQUIRED_FIELDS_WEIGHT;
    
    // Optional enhancement fields (50 points)
    const enhancementFields = ['reasoning', 'personalizedNotes', 'progressionTips', 'safetyReminders'];
    const presentEnhancements = enhancementFields.filter(field => {
      const value = workout[field as keyof GeneratedWorkout];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });
    score += (presentEnhancements.length / enhancementFields.length) * ResponseProcessor.ENHANCEMENT_FIELDS_WEIGHT;
    
    return Math.min(ResponseProcessor.MAX_VALIDATION_SCORE, score);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(workout: GeneratedWorkout, durationResult: DurationStrategyResult): number {
    let score = ResponseProcessor.MAX_VALIDATION_SCORE;
    
    // Duration consistency
    const totalPhaseDuration = (workout.warmup?.duration || 0) + 
                              (workout.mainWorkout?.duration || 0) + 
                              (workout.cooldown?.duration || 0);
    const expectedDuration = durationResult.adjustedDuration * 60;
    const durationDiff = Math.abs(totalPhaseDuration - expectedDuration);
    
    if (durationDiff > ResponseProcessor.DURATION_DIFF_PENALTIES.high.threshold) {
      score -= ResponseProcessor.DURATION_DIFF_PENALTIES.high.penalty;
    } else if (durationDiff > ResponseProcessor.DURATION_DIFF_PENALTIES.medium.threshold) {
      score -= ResponseProcessor.DURATION_DIFF_PENALTIES.medium.penalty;
    }
    
    // Exercise count consistency with duration config
    const config = durationResult.config;
    const actualExerciseCount = (workout.warmup?.exercises?.length || 0) + 
                               (workout.mainWorkout?.exercises?.length || 0) + 
                               (workout.cooldown?.exercises?.length || 0);
    
    const expectedExerciseCount = config.exerciseCount.total;
    const exerciseCountDiff = Math.abs(actualExerciseCount - expectedExerciseCount);
    
    if (exerciseCountDiff > ResponseProcessor.EXERCISE_COUNT_PENALTIES.high.threshold) {
      score -= ResponseProcessor.EXERCISE_COUNT_PENALTIES.high.penalty;
    } else if (exerciseCountDiff > ResponseProcessor.EXERCISE_COUNT_PENALTIES.medium.threshold) {
      score -= ResponseProcessor.EXERCISE_COUNT_PENALTIES.medium.penalty;
    }
    
    return Math.max(0, score);
  }
} 