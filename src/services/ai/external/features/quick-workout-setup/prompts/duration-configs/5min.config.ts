// 5-Minute Quick Break Workout Generation Prompt
import { PromptTemplate } from '../../../../types/external-ai.types';
import { DURATION_CONFIGS } from '../../constants/quick-workout.constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from '../shared-templates';

const CONFIG = DURATION_CONFIGS['5min'];

export const QUICK_BREAK_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

// 🔍 DEBUG: Estimate token count
const estimateTokenCount = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

const templateText = `${QUICK_BREAK_SYSTEM_PROMPT}

QUICK BREAK SPECIALIZATION:
Perfect for office workers, students, or anyone needing an instant energy boost. These workouts:
- Can be done in office clothes
- Require minimal or no equipment  
- Focus on movement patterns that counteract sedentary postures
- Provide immediate energy and mental clarity
- Don't cause significant sweating

USER CONTEXT:
- Energy Level: {{energyLevel}}/10
- Workout Focus: {{focus}}
- Available Equipment: {{equipment}}
- Fitness Level: {{fitnessLevel}}
- Soreness Areas: {{sorenessAreas}}

${generateWorkoutStructure(CONFIG)}

CRITICAL REQUIREMENTS FOR 5-MINUTE WORKOUTS:
1. EXACTLY 4 total exercises (1 warm-up + 2 main + 1 cool-down)
2. Each exercise should be 45-90 seconds duration (use numeric values in seconds: 45, 60, 75, 90)
3. Focus on bodyweight compound movements
4. Minimize equipment requirements
5. Target energy boost and posture correction
6. Keep intensity moderate to avoid sweating
7. Include movements that counteract desk posture (hip flexor stretches, shoulder openers, spinal mobility)
8. Ensure smooth, quick transitions between exercises
9. Prioritize movements that can be done in small spaces
10. Design for immediate energy and mood enhancement

EXERCISE SELECTION PRIORITIES:
- Compound movements that activate multiple muscle groups
- Dynamic stretches for common tight areas (neck, shoulders, hips)
- Core activation exercises
- Movements that improve circulation
- Energizing but not exhausting exercises`;

export const QUICK_BREAK_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'quick_break_5min_v1',
  name: '5-Minute Quick Break Workout',
  description: 'Ultra-efficient desk-break workouts for instant energy and movement',
  version: '1.0',
  template: templateText,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 4,
        focus: 'Energy Boost',
        equipment: ['None'],
        fitnessLevel: 'some experience',
        sorenessAreas: ['shoulders', 'lower back']
      },
      expectedOutput: {
        id: 'desk_break_energy_5min',
        title: '5-Minute Desk Break Energy Boost',
        description: 'Quick energizing movements to combat desk fatigue and boost alertness',
        totalDuration: 5,
        difficulty: 'some experience',
        warmup: { exercises: [{ name: 'Neck and Shoulder Rolls' }] },
        mainWorkout: { exercises: [{ name: 'Standing Hip Circles' }, { name: 'Desk Push-ups' }] },
        cooldown: { exercises: [{ name: 'Deep Breathing Stretch' }] }
      },
      description: 'Office-friendly energy boost workout'
    }
  ]
}; 

// 🔍 DEBUG: Log token estimates
console.log('🔍 5min Template Token Estimates:', {
  systemPromptTokens: estimateTokenCount(QUICK_BREAK_SYSTEM_PROMPT),
  totalTemplateTokens: estimateTokenCount(templateText),
  recommendedMaxTokens: estimateTokenCount(templateText) * 2, // Double for response
  currentMaxTokens: 4000, // Updated development setting
  warning: estimateTokenCount(templateText) * 2 > 4000 ? 
    'Template likely to exceed token limit' : 
    'Token limit should be sufficient'
}); 