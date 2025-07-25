import { PerWorkoutOptions } from '../../../../../types';
import { GlobalAIContext } from '../../../core/types/AIServiceTypes';
import { ConflictDetectionRule, CrossComponentConflict } from '../types/conflicts.types';

export class ConflictAnalyzer {
  constructor(private readonly rules: ConflictDetectionRule[]) {}

  async detectConflicts(options: PerWorkoutOptions, context: GlobalAIContext): Promise<CrossComponentConflict[]> {
    const conflicts: CrossComponentConflict[] = [];
    
    for (const rule of this.rules) {
      if (rule.condition(options, context)) {
        conflicts.push(rule.generateConflict(options, context));
      }
    }
    
    return this.sortConflicts(conflicts);
  }

  private sortConflicts(conflicts: CrossComponentConflict[]): CrossComponentConflict[] {
    return conflicts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }
} 