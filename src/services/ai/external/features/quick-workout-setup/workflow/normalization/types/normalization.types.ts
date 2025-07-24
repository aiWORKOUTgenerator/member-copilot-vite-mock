import { GeneratedWorkout } from '../../../../../../../types/external-ai.types';
import { DurationStrategyResult } from '../../../../types/quick-workout.types';

/**
 * Result of normalization operation
 */
export interface NormalizationResult {
  workout: GeneratedWorkout;
  issuesFound: string[];
  fixesApplied: string[];
  processingTime: number;
}

/**
 * Interface for normalization processors
 */
export interface NormalizationProcessor {
  process(workout: GeneratedWorkout, context: NormalizationContext): Promise<ProcessorResult>;
  getProcessorName(): string;
}

/**
 * Context for normalization operations
 */
export interface NormalizationContext {
  durationResult: DurationStrategyResult;
  originalResponse: unknown;
  startTime: number;
}

/**
 * Result from individual processor
 */
export interface ProcessorResult {
  modifiedWorkout: GeneratedWorkout;
  issues: string[];
  fixes: string[];
} 