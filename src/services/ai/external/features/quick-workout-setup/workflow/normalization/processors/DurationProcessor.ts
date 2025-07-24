import { GeneratedWorkout } from '../../../../../../../types/external-ai.types';
import { 
  NormalizationProcessor, 
  NormalizationContext, 
  ProcessorResult 
} from '../types/normalization.types';

/**
 * Processor for handling workout duration normalization
 */
export class DurationProcessor implements NormalizationProcessor {
  async process(workout: GeneratedWorkout, context: NormalizationContext): Promise<ProcessorResult> {
    const issues: string[] = [];
    const fixes: string[] = [];
    const modifiedWorkout = { ...workout };

    const targetDuration = context.durationResult.adjustedDuration * 60; // Convert to seconds

    // Normalize total duration
    if (!modifiedWorkout.totalDuration || modifiedWorkout.totalDuration !== targetDuration) {
      modifiedWorkout.totalDuration = targetDuration;
      issues.push('Total duration mismatch with target');
      fixes.push(`Set total duration to ${targetDuration} seconds`);
    }

    // Get phase allocations from duration config
    const { warmupPercent, mainPercent, cooldownPercent } = context.durationResult.config.timeAllocation;
    
    // Calculate target durations for each phase
    const warmupDuration = Math.round((targetDuration * warmupPercent) / 100);
    const mainDuration = Math.round((targetDuration * mainPercent) / 100);
    const cooldownDuration = Math.round((targetDuration * cooldownPercent) / 100);

    // Normalize warmup phase duration
    if (modifiedWorkout.warmup) {
      if (modifiedWorkout.warmup.duration !== warmupDuration) {
        modifiedWorkout.warmup.duration = warmupDuration;
        fixes.push(`Adjusted warmup duration to ${warmupDuration} seconds`);
      }

      // Check for minutes instead of seconds
      if (modifiedWorkout.warmup.duration >= 1 && modifiedWorkout.warmup.duration <= 10) {
        modifiedWorkout.warmup.duration *= 60;
        issues.push('Warmup duration appears to be in minutes');
        fixes.push('Converted warmup duration from minutes to seconds');
      }
    }

    // Normalize main workout phase duration
    if (modifiedWorkout.mainWorkout) {
      if (modifiedWorkout.mainWorkout.duration !== mainDuration) {
        modifiedWorkout.mainWorkout.duration = mainDuration;
        fixes.push(`Adjusted main workout duration to ${mainDuration} seconds`);
      }

      // Check for minutes instead of seconds
      if (modifiedWorkout.mainWorkout.duration >= 1 && modifiedWorkout.mainWorkout.duration <= 10) {
        modifiedWorkout.mainWorkout.duration *= 60;
        issues.push('Main workout duration appears to be in minutes');
        fixes.push('Converted main workout duration from minutes to seconds');
      }
    }

    // Normalize cooldown phase duration
    if (modifiedWorkout.cooldown) {
      if (modifiedWorkout.cooldown.duration !== cooldownDuration) {
        modifiedWorkout.cooldown.duration = cooldownDuration;
        fixes.push(`Adjusted cooldown duration to ${cooldownDuration} seconds`);
      }

      // Check for minutes instead of seconds
      if (modifiedWorkout.cooldown.duration >= 1 && modifiedWorkout.cooldown.duration <= 10) {
        modifiedWorkout.cooldown.duration *= 60;
        issues.push('Cooldown duration appears to be in minutes');
        fixes.push('Converted cooldown duration from minutes to seconds');
      }
    }

    // Validate total duration after adjustments
    const actualTotalDuration = (modifiedWorkout.warmup?.duration || 0) +
                              (modifiedWorkout.mainWorkout?.duration || 0) +
                              (modifiedWorkout.cooldown?.duration || 0);

    if (Math.abs(actualTotalDuration - targetDuration) > 60) { // 1-minute tolerance
      issues.push(`Total phase duration (${actualTotalDuration}s) differs from target (${targetDuration}s)`);
    }

    return { modifiedWorkout, issues, fixes };
  }

  getProcessorName(): string {
    return 'DurationProcessor';
  }
} 