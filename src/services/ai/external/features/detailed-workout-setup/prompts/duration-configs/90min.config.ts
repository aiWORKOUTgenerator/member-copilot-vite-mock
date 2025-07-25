import { PromptTemplate } from '../../../../types/external-ai.types';

// 90-minute workout configuration
export const NINETY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_90min_v1',
  name: 'Detailed 90-Minute Workout',
  description: 'Generates advanced 90-minute training sessions',
  version: '1.0',
  template: `You are an expert fitness coach specializing in advanced training programming.
Create a comprehensive 90-minute workout that maximizes training adaptations and results.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}
- Training Experience: {{experience}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 90 minutes
- Warm-up: 12-15 minutes
- Main workout: 65-70 minutes
- Cool-down: 8-10 minutes

Focus on:
- Multiple training modalities
- Advanced exercise variations
- Strategic rest periods
- Progressive overload
- Technical skill development

Include:
- Mobility work
- Activation exercises
- Main strength/skill work
- Accessory movements
- Recovery protocols

Return a complete GeneratedWorkout JSON object optimized for 90 minutes.`,
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