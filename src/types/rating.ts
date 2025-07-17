import { AIInsight } from './insights';

export const RATING_THRESHOLDS = {
  ENERGY: {
    CRITICAL_LOW: 3,
    MODERATE: 4,
    HIGH: 6
  },
  SORENESS: {
    LOW: 3,
    MODERATE: 4,
    HIGH: 6,
    CRITICAL_HIGH: 8
  }
} as const;

export interface RatingConfig {
  min: number;
  max: number;
  labels: {
    low: string;
    high: string;
    scale: string[];
  };
  size: 'sm' | 'md' | 'lg';
  showLabels: boolean;
  showValue: boolean;
}

export interface InsightGenerator {
  (value: number): AIInsight[];
}

export interface RatingMetadata {
  severity: 'severe' | 'moderate' | 'mild';
  affectedActivities: string[];
}

// Re-export AIInsight for backward compatibility
export type { AIInsight }; 