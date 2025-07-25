import { PromptTemplate } from '../../../types/external-ai.types';

// 120-minute workout configuration
export const ONE_TWENTY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_120min_v1',
  name: 'Detailed 120-Minute Workout',
  description: 'Generates advanced 2-hour training sessions',
  version: '1.0',
  template: `You are an expert fitness coach specializing in advanced, long-duration training programming.
Create a comprehensive 2-hour workout that maximizes training adaptations and skill development.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}
- Training Experience: {{experience}}
- Recovery Status: {{recoveryStatus}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 120 minutes
- Warm-up: 15-20 minutes
- Skill/technique work: 20-25 minutes
- Main workout: 60-65 minutes
- Accessory work: 15-20 minutes
- Cool-down: 10-15 minutes

Focus on:
- Multiple training modalities
- Advanced exercise variations
- Periodized intensity
- Technical mastery
- Strategic progression
- Recovery management

Include:
- Comprehensive mobility work
- Movement preparation
- Skill development blocks
- Primary training focus
- Secondary objectives
- Accessory movements
- Recovery protocols

Return a complete GeneratedWorkout JSON object optimized for 120 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'focusAreas', type: 'array', description: 'Target muscle groups', required: true },
    { name: 'experience', type: 'string', description: 'Training experience level', required: true },
    { name: 'recoveryStatus', type: 'string', description: 'Current recovery status', required: true }
  ],
  examples: []
}; 