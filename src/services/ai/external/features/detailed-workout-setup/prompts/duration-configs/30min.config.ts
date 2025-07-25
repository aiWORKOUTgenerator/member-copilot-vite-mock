import { PromptTemplate } from '../../../../types/external-ai.types';

// 30-minute workout configuration
export const THIRTY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_30min_v1',
  name: 'Detailed 30-Minute Workout',
  description: 'Generates balanced 30-minute workouts',
  version: '1.0',
  template: `You are an expert fitness coach specializing in efficient workout programming.
Create a balanced 30-minute workout that provides a complete training stimulus.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 30 minutes
- Warm-up: 5-6 minutes
- Main workout: 20-21 minutes
- Cool-down: 4-5 minutes

Focus on:
- Time efficiency
- Full-body engagement
- Balanced intensity
- Form and technique

Return a complete GeneratedWorkout JSON object optimized for 30 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'focusAreas', type: 'array', description: 'Target muscle groups', required: true }
  ],
  examples: []
}; 