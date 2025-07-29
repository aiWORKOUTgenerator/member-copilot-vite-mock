import { 
  InternalPromptContext,
  InternalPromptConfig,
  InternalRecommendation,
  WorkoutTemplate 
} from '../types/internal-prompt.types';
import { DomainPromptGenerator } from './DomainPromptGenerator';
import { InternalRecommendationStrategy } from '../strategies/InternalRecommendationStrategy';
import { ValidationService } from '../utils/ValidationService';
import { aiLogger } from '../../logging/AILogger';

/**
 * Fallback generator for pure internal workout generation
 */
export class InternalFallbackGenerator {
  private domainGenerator: DomainPromptGenerator;
  private recommendationStrategy: InternalRecommendationStrategy;

  constructor() {
    this.domainGenerator = new DomainPromptGenerator();
    this.recommendationStrategy = new InternalRecommendationStrategy();
  }

  /**
   * Generate workout using pure internal generation
   */
  public async generateWorkout(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<WorkoutTemplate> {
    try {
      // Validate context
      const validation = ValidationService.validateContext(context, config);
      if (!validation.isValid) {
        throw new Error('Invalid context for workout generation');
      }

      // Generate recommendations
      const recommendations = await this.recommendationStrategy.generateRecommendations(
        context,
        config
      );

      // Generate personalized prompt
      const prompt = await this.domainGenerator.generatePrompt(
        context,
        config
      );

      // Generate workout template
      const template = await this.generateWorkoutTemplate(
        context,
        recommendations,
        prompt
      );

      aiLogger.debug('InternalFallbackGenerator - Workout generated', {
        templateType: template.type,
        exerciseCount: template.exercises.length,
        recommendationCount: recommendations.length
      });

      return template;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'fallback generation',
        component: 'InternalFallbackGenerator',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Generate workout template from context and recommendations
   */
  private async generateWorkoutTemplate(
    context: InternalPromptContext,
    recommendations: InternalRecommendation[],
    prompt: string
  ): Promise<WorkoutTemplate> {
    // Get high-confidence exercise recommendations
    const exerciseRecs = recommendations.filter(rec => 
      rec.type === 'exercise' && rec.confidence >= 0.8
    );

    // Calculate target exercise count based on duration
    const targetExercises = this.calculateTargetExercises(
      context.workout.duration,
      context.profile.experienceLevel
    );

    // Generate exercises
    const exercises = await this.generateExercises(
      context,
      exerciseRecs,
      targetExercises
    );

    // Calculate rest periods
    const restPeriods = this.calculateRestPeriods(
      context.profile.experienceLevel,
      context.workout.intensity || 'moderate'
    );

    // Build template
    return {
      type: this.determineWorkoutType(context),
      focus: context.workout.focus,
      duration: context.workout.duration,
      intensity: context.workout.intensity || 'moderate',
      warmupDuration: this.calculateWarmupDuration(context.workout.duration),
      cooldownDuration: this.calculateCooldownDuration(context.workout.duration),
      exercises,
      restPeriods,
      equipment: context.workout.equipment || [],
      notes: this.generateWorkoutNotes(context, recommendations),
      generatedFrom: {
        prompt,
        recommendations: recommendations.map(rec => rec.content)
      }
    };
  }

  /**
   * Calculate target number of exercises
   */
  private calculateTargetExercises(
    duration: number,
    experienceLevel: string
  ): number {
    // Base calculation on duration
    let baseCount = Math.floor(duration / 5);

    // Adjust for experience level
    switch (experienceLevel.toLowerCase()) {
      case 'beginner':
      case 'new to exercise':
        baseCount = Math.min(baseCount, 8);
        break;
      
      case 'intermediate':
      case 'some experience':
        baseCount = Math.min(baseCount, 12);
        break;
      
      case 'advanced':
      case 'advanced athlete':
        baseCount = Math.min(baseCount, 15);
        break;
      
      default:
        baseCount = Math.min(baseCount, 10);
    }

    return Math.max(4, baseCount); // Minimum 4 exercises
  }

  /**
   * Generate exercises for workout
   */
  private async generateExercises(
    context: InternalPromptContext,
    exerciseRecs: InternalRecommendation[],
    targetCount: number
  ): Promise<Array<{
    name: string;
    sets: number;
    reps: number;
    duration?: number;
    equipment?: string[];
    notes?: string[];
  }>> {
    const exercises = [];
    const usedExercises = new Set<string>();

    // Add recommended exercises first
    for (const rec of exerciseRecs) {
      if (exercises.length >= targetCount) break;
      
      const exercise = this.parseExerciseRecommendation(rec);
      if (exercise && !usedExercises.has(exercise.name)) {
        exercises.push(exercise);
        usedExercises.add(exercise.name);
      }
    }

    // Add default exercises if needed
    while (exercises.length < targetCount) {
      const exercise = this.generateDefaultExercise(
        context,
        Array.from(usedExercises)
      );
      if (exercise && !usedExercises.has(exercise.name)) {
        exercises.push(exercise);
        usedExercises.add(exercise.name);
      }
    }

    return exercises;
  }

  /**
   * Parse exercise from recommendation
   */
  private parseExerciseRecommendation(
    recommendation: InternalRecommendation
  ): {
    name: string;
    sets: number;
    reps: number;
    duration?: number;
    equipment?: string[];
    notes?: string[];
  } | null {
    try {
      const content = recommendation.content.toLowerCase();
      
      // Extract exercise name
      const nameMatch = content.match(/^([\w\s-]+)(?:\s*\(|$)/);
      if (!nameMatch) return null;
      
      const name = nameMatch[1].trim();

      // Extract sets and reps
      const setsMatch = content.match(/(\d+)\s*(?:set|sets)/);
      const repsMatch = content.match(/(\d+)\s*(?:rep|reps)/);
      
      const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
      const reps = repsMatch ? parseInt(repsMatch[1]) : 12;

      // Extract duration
      const durationMatch = content.match(/(\d+)\s*(?:second|seconds|sec|s)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : undefined;

      // Extract equipment
      const equipmentMatch = content.match(/using\s+([\w\s,]+)(?:\)|$)/);
      const equipment = equipmentMatch 
        ? equipmentMatch[1].split(/,\s*/).map(e => e.trim())
        : undefined;

      // Extract notes
      const notesMatch = content.match(/\((.*?)\)/g);
      const notes = notesMatch 
        ? notesMatch.map(note => note.slice(1, -1).trim())
        : undefined;

      return {
        name,
        sets,
        reps,
        ...(duration && { duration }),
        ...(equipment && { equipment }),
        ...(notes && { notes })
      };

    } catch (error) {
      aiLogger.warn('Failed to parse exercise recommendation', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'exercise parsing',
        component: 'InternalFallbackGenerator',
        metadata: { recommendation }
      });
      return null;
    }
  }

  /**
   * Generate default exercise
   */
  private generateDefaultExercise(
    context: InternalPromptContext,
    usedExercises: string[]
  ): {
    name: string;
    sets: number;
    reps: number;
    equipment?: string[];
  } {
    // Default exercise templates by focus
    const templates: Record<string, Array<{
      name: string;
      equipment?: string[];
    }>> = {
      strength: [
        { name: 'Push-ups', equipment: ['body weight'] },
        { name: 'Squats', equipment: ['body weight'] },
        { name: 'Lunges', equipment: ['body weight'] },
        { name: 'Plank', equipment: ['body weight'] }
      ],
      cardio: [
        { name: 'High Knees', equipment: ['body weight'] },
        { name: 'Mountain Climbers', equipment: ['body weight'] },
        { name: 'Jumping Jacks', equipment: ['body weight'] },
        { name: 'Burpees', equipment: ['body weight'] }
      ],
      flexibility: [
        { name: 'Forward Fold', equipment: ['body weight'] },
        { name: 'Cat-Cow Stretch', equipment: ['body weight'] },
        { name: 'Downward Dog', equipment: ['body weight'] },
        { name: 'Child\'s Pose', equipment: ['body weight'] }
      ]
    };

    // Get templates for focus
    const focusTemplates = templates[context.workout.focus] || templates.strength;

    // Find unused exercise
    const availableExercises = focusTemplates.filter(e => 
      !usedExercises.includes(e.name)
    );

    // Select random exercise
    const exercise = availableExercises.length > 0
      ? availableExercises[Math.floor(Math.random() * availableExercises.length)]
      : focusTemplates[0];

    return {
      name: exercise.name,
      sets: 3,
      reps: 12,
      equipment: exercise.equipment
    };
  }

  /**
   * Calculate rest periods
   */
  private calculateRestPeriods(
    experienceLevel: string,
    intensity: string
  ): {
    betweenSets: number;
    betweenExercises: number;
  } {
    let baseRest = 60; // Base rest in seconds

    // Adjust for experience level
    switch (experienceLevel.toLowerCase()) {
      case 'beginner':
      case 'new to exercise':
        baseRest = 90;
        break;
      
      case 'advanced':
      case 'advanced athlete':
        baseRest = 45;
        break;
    }

    // Adjust for intensity
    switch (intensity) {
      case 'light':
        baseRest *= 1.2;
        break;
      
      case 'intense':
        baseRest *= 0.8;
        break;
    }

    return {
      betweenSets: Math.round(baseRest * 0.7),
      betweenExercises: Math.round(baseRest)
    };
  }

  /**
   * Calculate warmup duration
   */
  private calculateWarmupDuration(workoutDuration: number): number {
    return Math.max(5, Math.round(workoutDuration * 0.1));
  }

  /**
   * Calculate cooldown duration
   */
  private calculateCooldownDuration(workoutDuration: number): number {
    return Math.max(5, Math.round(workoutDuration * 0.08));
  }

  /**
   * Determine workout type
   */
  private determineWorkoutType(context: InternalPromptContext): string {
    if (context.workout.focus === 'cardio') {
      return 'cardio';
    }

    if (context.workout.focus === 'flexibility') {
      return 'flexibility';
    }

    if (context.workout.intensity === 'intense') {
      return 'hiit';
    }

    return 'strength';
  }

  /**
   * Generate workout notes
   */
  private generateWorkoutNotes(
    context: InternalPromptContext,
    recommendations: InternalRecommendation[]
  ): string[] {
    const notes: string[] = [];

    // Add injury warnings
    if (context.profile.injuries?.length) {
      notes.push(
        'Please modify exercises as needed based on your injuries.',
        'Stop any exercise that causes pain.'
      );
    }

    // Add soreness notes
    if (context.workout.soreness?.rating >= 7) {
      notes.push(
        'High soreness detected - focus on proper form and reduced intensity.',
        'Take extra time to warm up affected areas.'
      );
    }

    // Add high-priority recommendations
    const highPriorityRecs = recommendations
      .filter(rec => rec.priority === 'high' && rec.confidence >= 0.9)
      .map(rec => rec.content);

    notes.push(...highPriorityRecs);

    // Add experience-based notes
    if (context.profile.experienceLevel.toLowerCase().includes('beginner')) {
      notes.push(
        'Focus on proper form rather than speed or weight.',
        'Take breaks as needed between exercises.'
      );
    }

    return notes;
  }
}