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
import { getDurationConfig, DURATION_CONFIGS } from '../constants/quick-workout.constants';

// Registry of all duration-specific prompts
export const DURATION_PROMPTS: Record<string, PromptTemplate> = {
  '5min': QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE,
  '10min': MINI_SESSION_WORKOUT_PROMPT_TEMPLATE,
  '15min': EXPRESS_WORKOUT_PROMPT_TEMPLATE,
  '20min': FOCUSED_WORKOUT_PROMPT_TEMPLATE,
  '30min': COMPLETE_WORKOUT_PROMPT_TEMPLATE,
  '45min': EXTENDED_WORKOUT_PROMPT_TEMPLATE
};

/**
 * Smart prompt selection based on workout duration
 * This is the main entry point for duration-specific workout generation
 */
export const selectDurationSpecificPrompt = (
  duration: number,
  fitnessLevel?: string,
  sorenessAreas?: string[],
  focus?: string
): PromptTemplate => {
  // Find the closest supported duration
  const supportedDurations = [5, 10, 15, 20, 30, 45];
  const closestDuration = supportedDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );

  const durationKey = `${closestDuration}min`;
  const prompt = DURATION_PROMPTS[durationKey];

  if (!prompt) {
    // Fallback to 30min if no specific prompt found
    console.warn(`No prompt found for duration ${duration}min, falling back to 30min`);
    return DURATION_PROMPTS['30min'];
  }

  return prompt;
};

/**
 * Get prompt information for a specific duration
 */
export const getPromptInfo = (duration: number) => {
  const supportedDurations = [5, 10, 15, 20, 30, 45];
  const closestDuration = supportedDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );

  const durationKey = `${closestDuration}min`;
  const config = DURATION_CONFIGS[durationKey];
  const prompt = DURATION_PROMPTS[durationKey];

  return {
    duration: closestDuration,
    config,
    prompt,
    isExactMatch: closestDuration === duration,
    supportedDurations
  };
};

/**
 * Validate if a duration is supported
 */
export const validateDurationSupport = (duration: number): {
  supported: boolean;
  recommendation?: string;
  closestSupported?: number;
} => {
  const supportedDurations = [5, 10, 15, 20, 30, 45];
  const isSupported = supportedDurations.includes(duration);

  if (isSupported) {
    return { supported: true };
  }

  const closestDuration = supportedDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );

  return {
    supported: false,
    closestSupported: closestDuration,
    recommendation: `Duration ${duration}min not directly supported. Closest supported duration is ${closestDuration}min.`
  };
};

/**
 * Get all supported durations
 */
export const getSupportedDurations = () => {
  return Object.keys(DURATION_CONFIGS).map(key => parseInt(key.replace('min', '')));
}; 