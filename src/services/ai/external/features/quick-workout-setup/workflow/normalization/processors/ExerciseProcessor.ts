import { GeneratedWorkout, Exercise } from '../../../../../../../types/external-ai.types';
import { 
  NormalizationProcessor, 
  NormalizationContext, 
  ProcessorResult 
} from '../types/normalization.types';

/**
 * Processor for handling exercise normalization
 */
export class ExerciseProcessor implements NormalizationProcessor {
  async process(workout: GeneratedWorkout, context: NormalizationContext): Promise<ProcessorResult> {
    const issues: string[] = [];
    const fixes: string[] = [];
    const modifiedWorkout = { ...workout };

    // Process each phase
    ['warmup', 'mainWorkout', 'cooldown'].forEach(phaseName => {
      const phase = modifiedWorkout[phaseName as keyof GeneratedWorkout];
      if (phase && Array.isArray(phase.exercises)) {
        phase.exercises = phase.exercises.map((exercise, index) => 
          this.normalizeExercise(exercise, index, phaseName, issues, fixes)
        );
      }
    });

    return { modifiedWorkout, issues, fixes };
  }

  private normalizeExercise(
    exercise: Exercise,
    index: number,
    phaseName: string,
    issues: string[],
    fixes: string[]
  ): Exercise {
    const normalized: Exercise = { ...exercise };

    // Ensure required fields
    if (!normalized.id) {
      normalized.id = `${phaseName}_exercise_${index + 1}`;
      issues.push(`Missing exercise ID in ${phaseName}`);
      fixes.push(`Generated exercise ID: ${normalized.id}`);
    }

    if (!normalized.name) {
      normalized.name = `${phaseName} Exercise ${index + 1}`;
      issues.push(`Missing exercise name in ${phaseName}`);
      fixes.push(`Generated exercise name: ${normalized.name}`);
    }

    if (!normalized.description) {
      normalized.description = `Perform ${normalized.name.toLowerCase()}`;
      fixes.push(`Generated description for ${normalized.name}`);
    }

    // Ensure duration is in seconds
    if (normalized.duration && normalized.duration >= 1 && normalized.duration <= 10) {
      normalized.duration *= 60;
      issues.push(`Exercise duration appears to be in minutes: ${normalized.name}`);
      fixes.push(`Converted exercise duration to seconds: ${normalized.name}`);
    }

    // Ensure arrays exist
    normalized.modifications = Array.isArray(normalized.modifications) ? normalized.modifications : [];
    normalized.commonMistakes = Array.isArray(normalized.commonMistakes) ? normalized.commonMistakes : [];
    normalized.primaryMuscles = Array.isArray(normalized.primaryMuscles) ? normalized.primaryMuscles : [];
    normalized.secondaryMuscles = Array.isArray(normalized.secondaryMuscles) ? normalized.secondaryMuscles : [];
    normalized.personalizedNotes = Array.isArray(normalized.personalizedNotes) ? normalized.personalizedNotes : [];
    normalized.difficultyAdjustments = Array.isArray(normalized.difficultyAdjustments) ? normalized.difficultyAdjustments : [];

    // Set defaults for missing fields
    if (!normalized.form) {
      normalized.form = `Perform ${normalized.name.toLowerCase()} with proper form`;
      fixes.push(`Generated form instructions for ${normalized.name}`);
    }

    if (!normalized.movementType) {
      normalized.movementType = 'strength';
      fixes.push(`Set default movement type for ${normalized.name}`);
    }

    // Ensure numeric fields have valid values
    if (typeof normalized.repetitions !== 'number' || normalized.repetitions < 1) {
      normalized.repetitions = 10;
      fixes.push(`Set default repetitions for ${normalized.name}`);
    }

    if (typeof normalized.sets !== 'number' || normalized.sets < 1) {
      normalized.sets = 1;
      fixes.push(`Set default sets for ${normalized.name}`);
    }

    if (typeof normalized.restTime !== 'number' || normalized.restTime < 0) {
      normalized.restTime = 30; // 30 seconds default rest
      fixes.push(`Set default rest time for ${normalized.name}`);
    }

    return normalized;
  }

  getProcessorName(): string {
    return 'ExerciseProcessor';
  }
} 