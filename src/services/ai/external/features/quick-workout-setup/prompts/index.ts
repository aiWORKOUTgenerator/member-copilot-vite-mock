// QuickWorkoutSetup Feature - Prompts Module
// This module provides duration-specific prompt templates and selection logic

// Export shared templates and utilities
export * from './shared-templates';

// Import duration-specific prompt templates
import { QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/5min.config';
import { MINI_SESSION_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/10min.config';
import { EXPRESS_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/15min.config'; 
import { FOCUSED_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/20min.config';
import { COMPLETE_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/30min.config';
import { EXTENDED_WORKOUT_PROMPT_TEMPLATE } from './duration-configs/45min.config';

import { PromptTemplate } from '../../../types/external-ai.types';

// Duration-specific prompt mapping
export const DURATION_PROMPTS: Record<number, PromptTemplate> = {
  5: QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE,
  10: MINI_SESSION_WORKOUT_PROMPT_TEMPLATE,
  15: EXPRESS_WORKOUT_PROMPT_TEMPLATE,
  20: FOCUSED_WORKOUT_PROMPT_TEMPLATE,
  30: COMPLETE_WORKOUT_PROMPT_TEMPLATE,
  45: EXTENDED_WORKOUT_PROMPT_TEMPLATE
};

/**
 * Select duration-specific prompt template
 */
export function selectDurationSpecificPrompt(duration: number): PromptTemplate {
  const prompt = DURATION_PROMPTS[duration];
  
  if (!prompt) {
    // Find closest supported duration
    const supportedDurations = Object.keys(DURATION_PROMPTS).map(Number).sort((a, b) => a - b);
    const closestDuration = supportedDurations.reduce((prev, curr) => 
      Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
    );
    
    console.warn(`Duration ${duration}min not directly supported, using ${closestDuration}min template`);
    return DURATION_PROMPTS[closestDuration];
  }
  
  return prompt;
}

/**
 * Get prompt information for a specific duration
 */
export function getPromptInfo(duration: number): {
  prompt: PromptTemplate;
  isExactMatch: boolean;
  supportedDurations: number[];
} {
  const isExactMatch = duration in DURATION_PROMPTS;
  const prompt = selectDurationSpecificPrompt(duration);
  const supportedDurations = Object.keys(DURATION_PROMPTS).map(Number);
  
  return {
    prompt,
    isExactMatch,
    supportedDurations
  };
}

/**
 * Get all available prompt templates
 */
export function getAllPrompts(): Record<string, PromptTemplate> {
  return DURATION_PROMPTS;
}

/**
 * Get supported durations
 */
export function getSupportedDurations(): number[] {
  return Object.keys(DURATION_PROMPTS).map(Number).sort((a, b) => a - b);
} 