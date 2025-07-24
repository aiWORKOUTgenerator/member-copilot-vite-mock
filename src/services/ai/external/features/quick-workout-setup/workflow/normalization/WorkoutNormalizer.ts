import { GeneratedWorkout } from '../../../../../../types/external-ai.types';
import { DurationStrategyResult } from '../../../types/quick-workout.types';
import { 
  NormalizationResult, 
  NormalizationProcessor, 
  NormalizationContext 
} from './types/normalization.types';
import { MetadataProcessor } from './processors/MetadataProcessor';
import { DurationProcessor } from './processors/DurationProcessor';
import { ExerciseProcessor } from './processors/ExerciseProcessor';

/**
 * Main normalizer that coordinates specialized processors
 */
export class WorkoutNormalizer {
  private processors: NormalizationProcessor[] = [];

  constructor() {
    this.initializeProcessors();
  }

  private initializeProcessors(): void {
    this.processors = [
      new MetadataProcessor(),
      new DurationProcessor(),
      new ExerciseProcessor()
    ];
  }

  /**
   * Normalize workout structure using all processors
   */
  async normalize(
    workout: GeneratedWorkout,
    durationResult: DurationStrategyResult,
    originalResponse: unknown
  ): Promise<NormalizationResult> {
    const startTime = Date.now();
    const allIssues: string[] = [];
    const allFixes: string[] = [];

    console.log('🔧 WorkoutNormalizer: Starting normalization with', this.processors.length, 'processors');

    const context: NormalizationContext = {
      durationResult,
      originalResponse,
      startTime
    };

    let currentWorkout = { ...workout };

    // Process through each processor sequentially
    for (const processor of this.processors) {
      try {
        console.log('🔄 Processing with:', processor.getProcessorName());
        
        const result = await processor.process(currentWorkout, context);
        
        currentWorkout = result.modifiedWorkout;
        allIssues.push(...result.issues);
        allFixes.push(...result.fixes);

        console.log(`✅ ${processor.getProcessorName()}: ${result.fixes.length} fixes applied`);
      } catch (error) {
        const errorMsg = `${processor.getProcessorName()} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allIssues.push(errorMsg);
        console.error('❌ WorkoutNormalizer:', errorMsg);
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ WorkoutNormalizer: Completed in ${processingTime}ms with ${allFixes.length} total fixes`);

    return {
      workout: currentWorkout as GeneratedWorkout,
      issuesFound: allIssues,
      fixesApplied: allFixes,
      processingTime
    };
  }
} 