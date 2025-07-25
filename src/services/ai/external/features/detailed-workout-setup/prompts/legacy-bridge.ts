// Legacy Bridge Prompts for Detailed Workout Setup
// This file provides backward compatibility for existing prompt templates

import { PromptTemplate } from '../../../types/external-ai.types';
import { DETAILED_WORKOUT_PROMPT_TEMPLATE } from './detailed-workout-generation.prompts';

/**
 * Legacy bridge for detailed workout prompts
 * Maintains compatibility with existing prompt templates
 */
export const LEGACY_DETAILED_WORKOUT_PROMPTS = {
  // Main detailed workout prompt
  detailed: DETAILED_WORKOUT_PROMPT_TEMPLATE,
  
  // Legacy prompt templates for backward compatibility
  legacy: {
    basic: {
      id: 'legacy_basic_workout',
      name: 'Basic Workout Generation',
      description: 'Legacy basic workout prompt template',
      version: '1.0',
      template: `Generate a basic workout plan for the user.
      
User Profile:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Duration: {{duration}} minutes
- Equipment: {{equipment}}

Generate a simple workout with warm-up, main exercises, and cool-down.`,
      variables: [
        { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
        { name: 'goals', type: 'string', description: 'User fitness goals', required: true },
        { name: 'duration', type: 'number', description: 'Workout duration', required: true },
        { name: 'equipment', type: 'string', description: 'Available equipment', required: true }
      ],
      examples: []
    },
    
    advanced: {
      id: 'legacy_advanced_workout',
      name: 'Advanced Workout Generation',
      description: 'Legacy advanced workout prompt template',
      version: '1.0',
      template: `Generate an advanced workout plan for experienced users.
      
User Profile:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Duration: {{duration}} minutes
- Equipment: {{equipment}}
- Focus: {{focus}}

Generate a challenging workout with progressive overload principles.`,
      variables: [
        { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
        { name: 'goals', type: 'string', description: 'User fitness goals', required: true },
        { name: 'duration', type: 'number', description: 'Workout duration', required: true },
        { name: 'equipment', type: 'string', description: 'Available equipment', required: true },
        { name: 'focus', type: 'string', description: 'Workout focus area', required: true }
      ],
      examples: []
    }
  }
};

/**
 * Get legacy prompt template by type
 */
export function getLegacyPrompt(type: 'basic' | 'advanced'): PromptTemplate {
  return LEGACY_DETAILED_WORKOUT_PROMPTS.legacy[type];
}

/**
 * Check if a prompt template is legacy
 */
export function isLegacyPrompt(template: PromptTemplate): boolean {
  return template.id.startsWith('legacy_');
}

/**
 * Convert legacy prompt to modern format
 */
export function convertLegacyPrompt(legacyTemplate: PromptTemplate): PromptTemplate {
  return {
    ...legacyTemplate,
    id: legacyTemplate.id.replace('legacy_', 'modern_'),
    version: '2.0',
    description: `Modernized version of ${legacyTemplate.description}`
  };
} 