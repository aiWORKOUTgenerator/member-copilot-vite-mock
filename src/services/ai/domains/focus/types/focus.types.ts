// Focus AI Service Types and Constants
import { AIInsight } from '../../../../../types/insights';
import { GlobalAIContext } from '../../../core/AIService';

export interface FocusCategories {
  STRENGTH: string;
  CARDIO: string;
  FLEXIBILITY: string;
  ENDURANCE: string;
  MOBILITY: string;
  RECOVERY: string;
  BALANCE: string;
  POWER: string;
}

export interface FocusInsightRule {
  condition: (value: string | undefined, context: GlobalAIContext) => boolean;
  generateInsight: (value: string | undefined, context: GlobalAIContext) => AIInsight;
}

export const FOCUS_INSIGHT_CONSTANTS = {
  RANDOM_STRING_BASE_RADIX: 36,
  RANDOM_STRING_LENGTH: 5,
  RANDOM_STRING_START_INDEX: 2,
  MAX_HISTORY_ITEMS: 10,
  MIN_HISTORY_LENGTH: 5,
  MIN_DOMINANT_FOCUS_COUNT: 3,
  GOAL_ALIGNMENT_THRESHOLD: 0.7
} as const;

export const FOCUS_CATEGORIES: FocusCategories = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  FLEXIBILITY: 'flexibility',
  ENDURANCE: 'endurance',
  MOBILITY: 'mobility',
  RECOVERY: 'recovery',
  BALANCE: 'balance',
  POWER: 'power'
} as const;

export const COMPLEMENTARY_FOCUS = new Map<string, string[]>([
  ['strength', ['mobility', 'flexibility']],
  ['cardio', ['recovery', 'flexibility']],
  ['flexibility', ['strength', 'balance']],
  ['endurance', ['recovery', 'strength']],
  ['mobility', ['strength', 'balance']],
  ['recovery', ['flexibility', 'mobility']],
  ['balance', ['strength', 'flexibility']],
  ['power', ['mobility', 'recovery']]
]); 