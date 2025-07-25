import { PerWorkoutOptions } from '../../../../../types';
import { GlobalAIContext } from '../../../core/types/AIServiceTypes';

export interface Synergy {
  id: string;
  components: string[];
  type: string;
  description: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface SynergyDetectionRule {
  condition: (options: PerWorkoutOptions, context: GlobalAIContext) => boolean;
  generateSynergy: (options: PerWorkoutOptions, context: GlobalAIContext) => Synergy;
} 