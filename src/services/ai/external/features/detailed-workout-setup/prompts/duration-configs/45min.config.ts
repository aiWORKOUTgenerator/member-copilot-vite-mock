import { PromptTemplate } from '../../../../types/external-ai.types';

// 45-minute workout configuration
export const FORTYFIVE_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_45min_v1',
  name: 'Detailed 45-Minute Workout',
  description: 'Generates comprehensive 45-minute workouts',
  version: '1.0',
  template: `You are an expert fitness coach specializing in balanced workout programming.
Create a comprehensive 45-minute workout that provides a complete training experience.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 45 minutes
- Warm-up: 7-8 minutes
- Main workout: 32-33 minutes
- Cool-down: 5-6 minutes

Focus on:
- Progressive intensity
- Balanced muscle groups
- Proper rest periods
- Form and technique

Return a complete GeneratedWorkout JSON object optimized for 45 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'focusAreas', type: 'array', description: 'Target muscle groups', required: true }
  ],
  examples: []
}; 