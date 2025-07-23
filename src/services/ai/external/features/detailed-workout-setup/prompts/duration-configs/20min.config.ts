import { PromptTemplate } from '../../../../types/external-ai.types';

// 20-minute workout configuration
export const TWENTY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_20min_v1',
  name: 'Detailed 20-Minute Workout',
  description: 'Generates time-efficient 20-minute workouts',
  version: '1.0',
  template: `You are an expert fitness coach specializing in time-efficient workouts.
Create a focused 20-minute workout that maximizes results in minimal time.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 20 minutes
- Warm-up: 3-4 minutes
- Main workout: 14-15 minutes
- Cool-down: 2-3 minutes

Focus on:
- Compound movements
- Circuit-style training
- Minimal rest periods
- Maximum efficiency

Return a complete GeneratedWorkout JSON object optimized for 20 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true }
  ],
  examples: []
}; 