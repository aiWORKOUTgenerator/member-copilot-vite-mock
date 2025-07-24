import { GeneratedWorkout } from '../../../../../../../types/external-ai.types';
import { 
  NormalizationProcessor, 
  NormalizationContext, 
  ProcessorResult 
} from '../types/normalization.types';

/**
 * Processor for handling workout metadata normalization
 */
export class MetadataProcessor implements NormalizationProcessor {
  async process(workout: GeneratedWorkout, context: NormalizationContext): Promise<ProcessorResult> {
    const issues: string[] = [];
    const fixes: string[] = [];
    const modifiedWorkout = { ...workout };

    // Ensure required metadata fields
    if (!modifiedWorkout.id) {
      modifiedWorkout.id = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      issues.push('Missing workout ID');
      fixes.push('Generated unique workout ID');
    }

    if (!modifiedWorkout.title || modifiedWorkout.title === 'AI Generated Workout') {
      const duration = context.durationResult.adjustedDuration;
      modifiedWorkout.title = `${duration}-Minute AI Workout`;
      if (!workout.title) {
        issues.push('Missing workout title');
        fixes.push('Generated descriptive workout title');
      }
    }

    if (!modifiedWorkout.description) {
      modifiedWorkout.description = `A personalized ${context.durationResult.adjustedDuration}-minute workout designed for your fitness level and goals.`;
      issues.push('Missing workout description');
      fixes.push('Generated workout description');
    }

    // Ensure metadata consistency
    if (!modifiedWorkout.generatedAt) {
      modifiedWorkout.generatedAt = new Date();
      fixes.push('Set generation timestamp');
    }

    if (!modifiedWorkout.aiModel) {
      modifiedWorkout.aiModel = 'gpt-4o';
      fixes.push('Set AI model identifier');
    }

    if (typeof modifiedWorkout.confidence !== 'number') {
      modifiedWorkout.confidence = 0.8;
      fixes.push('Set default confidence score');
    }

    // Ensure arrays exist
    modifiedWorkout.personalizedNotes = Array.isArray(modifiedWorkout.personalizedNotes) 
      ? modifiedWorkout.personalizedNotes 
      : [];
    
    modifiedWorkout.progressionTips = Array.isArray(modifiedWorkout.progressionTips) 
      ? modifiedWorkout.progressionTips 
      : [];
    
    modifiedWorkout.safetyReminders = Array.isArray(modifiedWorkout.safetyReminders) 
      ? modifiedWorkout.safetyReminders 
      : [];

    modifiedWorkout.tags = Array.isArray(modifiedWorkout.tags) 
      ? modifiedWorkout.tags 
      : [];

    return { modifiedWorkout, issues, fixes };
  }

  getProcessorName(): string {
    return 'MetadataProcessor';
  }
} 