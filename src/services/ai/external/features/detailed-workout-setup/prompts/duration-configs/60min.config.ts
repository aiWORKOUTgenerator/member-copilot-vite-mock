import { PromptTemplate } from '../../../types/external-ai.types';

// 60-minute workout configuration
export const SIXTY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_60min_v1',
  name: 'Detailed 60-Minute Workout',
  description: 'Generates comprehensive 60-minute training sessions',
  version: '1.0',
  template: `You are an expert fitness coach specializing in comprehensive workout programming.
Create a thorough 60-minute workout that allows for proper technique and progression.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}
- Training Experience: {{experience}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 60 minutes
- Warm-up: 8-10 minutes
- Main workout: 42-45 minutes
- Cool-down: 7-8 minutes

Focus on:
- Proper exercise progression
- Multiple movement patterns
- Strategic rest periods
- Technical mastery
- Balanced muscle engagement

Include:
- Dynamic warm-up
- Skill development
- Main training block
- Accessory work
- Proper cool-down

Return a complete GeneratedWorkout JSON object optimized for 60 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'focusAreas', type: 'array', description: 'Target muscle groups', required: true },
    { name: 'experience', type: 'string', description: 'Training experience level', required: true }
  ],
  examples: []
}; 