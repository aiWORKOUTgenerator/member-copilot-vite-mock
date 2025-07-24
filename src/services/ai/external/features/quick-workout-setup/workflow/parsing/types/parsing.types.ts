import { GeneratedWorkout } from '../../../../../../types/external-ai.types';

/**
 * Interface for parsing strategies
 */
export interface ParseStrategy {
  canHandle(response: unknown): boolean;
  parse(response: unknown): Promise<GeneratedWorkout>;
  getPriority(): number;
}

/**
 * Result of parsing operation
 */
export interface ParseResult {
  success: boolean;
  data?: GeneratedWorkout;
  strategy: string;
  issues: string[];
  processingTime: number;
  metrics?: {
    contentLength?: number;
    truncationPoint?: number;
    validationScore?: number;
  };
}

/**
 * Validation result for response structure
 */
export interface ResponseValidation {
  isValid: boolean;
  issues: string[];
  structure: {
    hasValidStructure: boolean;
    missingFields: string[];
    invalidFields: string[];
    contentLength?: number;
    truncationPoint?: number;
  };
} 