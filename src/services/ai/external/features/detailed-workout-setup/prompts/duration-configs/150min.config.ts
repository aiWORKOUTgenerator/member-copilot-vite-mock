import { PromptTemplate } from '../../../../types/external-ai.types';

// 150-minute workout configuration
export const ONE_FIFTY_MIN_CONFIG: PromptTemplate = {
  id: 'detailed_150min_v1',
  name: 'Detailed 150-Minute Workout',
  description: 'Generates elite 2.5-hour training sessions',
  version: '1.0',
  template: `You are an expert fitness coach specializing in elite-level, extended training programming.
Create a comprehensive 2.5-hour workout suitable for advanced athletes and specialized training goals.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Equipment: {{equipment}}
- Energy Level: {{energyLevel}}/10
- Focus Areas: {{focusAreas}}
- Training Experience: {{experience}}
- Recovery Status: {{recoveryStatus}}
- Previous Training Load: {{trainingLoad}}

WORKOUT REQUIREMENTS:
- Total Duration: Exactly 150 minutes
- Warm-up: 20-25 minutes
- Movement preparation: 15-20 minutes
- Skill/technique work: 25-30 minutes
- Main workout: 50-55 minutes
- Accessory/specialty work: 20-25 minutes
- Cool-down/recovery: 15-20 minutes

Focus on:
- Multiple training phases
- Advanced exercise complexes
- Periodized loading
- Technical excellence
- Strategic progression
- Recovery optimization
- Energy system development

Include:
- Comprehensive mobility system
- CNS preparation
- Movement skill development
- Primary training blocks
- Secondary skill work
- Accessory development
- Recovery protocols
- Performance monitoring

Return a complete GeneratedWorkout JSON object optimized for 150 minutes.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'focusAreas', type: 'array', description: 'Target muscle groups', required: true },
    { name: 'experience', type: 'string', description: 'Training experience level', required: true },
    { name: 'recoveryStatus', type: 'string', description: 'Current recovery status', required: true },
    { name: 'trainingLoad', type: 'object', description: 'Previous training load metrics', required: true }
  ],
  examples: []
}; 