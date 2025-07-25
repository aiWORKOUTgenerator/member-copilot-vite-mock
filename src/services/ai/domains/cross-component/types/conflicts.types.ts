import { PerWorkoutOptions } from '../../../../../types';
import { GlobalAIContext } from '../../../core/types/AIServiceTypes';

export interface CrossComponentConflict {
  id: string;
  components: string[];
  type: 'safety' | 'efficiency' | 'goal_alignment' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string;
  confidence: number;
  impact: 'performance' | 'safety' | 'effectiveness';
  metadata?: Record<string, unknown>;
}

export interface ConflictDetectionRule {
  condition: (options: PerWorkoutOptions, context: GlobalAIContext) => boolean;
  generateConflict: (options: PerWorkoutOptions, context: GlobalAIContext) => CrossComponentConflict;
} 