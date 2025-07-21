// QuickWorkoutSetup - Duration-Specific Workout Generation System
export * from './duration-constants';
export * from './shared-templates';

// Import duration-specific prompt templates
import { QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE } from './5min-quick-break.prompts';
import { MINI_SESSION_WORKOUT_PROMPT_TEMPLATE } from './10min-mini-session.prompts';
import { EXPRESS_WORKOUT_PROMPT_TEMPLATE } from './15min-express.prompts'; 
import { FOCUSED_WORKOUT_PROMPT_TEMPLATE } from './20min-focused.prompts';
import { COMPLETE_WORKOUT_PROMPT_TEMPLATE } from './30min-complete.prompts';
import { EXTENDED_WORKOUT_PROMPT_TEMPLATE } from './45min-extended.prompts';

import { PromptTemplate } from '../../types/external-ai.types';
import { getDurationConfig, DURATION_CONFIGS } from './duration-constants';

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
  const durationKey = `${duration}min`;
  
  // Check if we have a duration-specific prompt
  if (DURATION_PROMPTS[durationKey]) {
    console.log(`🎯 Using duration-specific prompt for ${duration} minutes`);
    return DURATION_PROMPTS[durationKey];
  }
  
  // Fallback logic for unsupported durations
  console.warn(`⚠️  No specific prompt for ${duration} minutes, using closest match`);
  
  // Find the closest duration
  const availableDurations = Object.keys(DURATION_CONFIGS)
    .map(key => DURATION_CONFIGS[key].duration)
    .sort((a, b) => a - b);
  
  const closestDuration = availableDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );
  
  const fallbackKey = `${closestDuration}min`;
  if (DURATION_PROMPTS[fallbackKey]) {
    console.log(`🔄 Falling back to ${closestDuration}-minute prompt for ${duration}-minute request`);
    return DURATION_PROMPTS[fallbackKey];
  }
  
  // Ultimate fallback - use 30-minute template as it's most balanced
  console.error(`❌ No suitable prompt found for ${duration} minutes, using 30-minute fallback`);
  return DURATION_PROMPTS['30min'];
};

/**
 * Get prompt configuration info for debugging/logging
 */
export const getPromptInfo = (duration: number) => {
  const config = getDurationConfig(duration);
  const durationKey = `${duration}min`;
  const hasSpecificPrompt = Boolean(DURATION_PROMPTS[durationKey]);
  
  return {
    duration,
    durationKey,
    hasSpecificPrompt,
    config,
    promptId: hasSpecificPrompt ? DURATION_PROMPTS[durationKey].id : 'fallback',
    exerciseCount: config.exerciseCount,
    complexity: config.complexity,
    variableRequirements: config.variableRequirements
  };
};

/**
 * Validate that a duration has appropriate prompt support
 */
export const validateDurationSupport = (duration: number): {
  supported: boolean;
  recommendation?: string;
  closestSupported?: number;
} => {
  const durationKey = `${duration}min`;
  const hasSpecificPrompt = Boolean(DURATION_PROMPTS[durationKey]);
  
  if (hasSpecificPrompt) {
    return { supported: true };
  }
  
  // Find closest supported duration
  const supportedDurations = Object.keys(DURATION_PROMPTS)
    .map(key => parseInt(key.replace('min', '')))
    .sort((a, b) => a - b);
  
  if (supportedDurations.length === 0) {
    return { 
      supported: false, 
      recommendation: 'No duration-specific prompts available' 
    };
  }
  
  const closestSupported = supportedDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );
  
  return {
    supported: false,
    recommendation: `Consider using ${closestSupported}-minute workout instead for optimized results`,
    closestSupported
  };
};

// Export individual prompt templates for direct access
export {
  QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE,
  MINI_SESSION_WORKOUT_PROMPT_TEMPLATE,
  EXPRESS_WORKOUT_PROMPT_TEMPLATE,
  FOCUSED_WORKOUT_PROMPT_TEMPLATE,
  COMPLETE_WORKOUT_PROMPT_TEMPLATE,
  EXTENDED_WORKOUT_PROMPT_TEMPLATE
};

// Export types for external use
export type { DurationConfig } from './duration-constants';

/**
 * Get all supported duration options for UI
 */
export const getSupportedDurations = () => {
  return Object.keys(DURATION_PROMPTS)
    .map(key => {
      const duration = parseInt(key.replace('min', ''));
      const config = getDurationConfig(duration);
      return {
        duration,
        name: config.name,
        description: config.description,
        exerciseCount: config.exerciseCount.total,
        complexity: config.complexity
      };
    })
    .sort((a, b) => a.duration - b.duration);
}; 