// 10-Minute Mini Session Workout Generation Prompt
import { PromptTemplate } from '../../../../types/external-ai.types';
import { DURATION_CONFIGS } from '../../constants/quick-workout.constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from '../shared-templates';

const CONFIG = DURATION_CONFIGS['10min'];

export const MINI_SESSION_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

// 🔍 DEBUG: Estimate token count
const estimateTokenCount = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

const templateText = `${MINI_SESSION_SYSTEM_PROMPT}

MINI SESSION SPECIALIZATION:
Efficient 10-minute sessions perfect for busy individuals who want effective workouts. These sessions:
- Maximize impact with compound movements
- Fit easily into lunch breaks or morning routines
- Require minimal equipment and space
- Provide noticeable energy boost and muscle activation
- Balance intensity with time constraints

USER CONTEXT:
- Energy Level: {{energyLevel}}/10
- Workout Focus: {{focus}}
- Available Equipment: {{equipment}}
- Fitness Level: {{fitnessLevel}}
- Soreness Areas: {{sorenessAreas}}

${generateWorkoutStructure(CONFIG)}

CRITICAL REQUIREMENTS FOR 10-MINUTE WORKOUTS:
1. EXACTLY 6 total exercises (2 warm-up + 3 main + 1 cool-down)
2. Warm-up: 1.5 minutes with dynamic movements to prepare the body
3. Main workout: 7 minutes with high-efficiency compound exercises
4. Cool-down: 1.5 minutes with essential stretching
5. Each exercise should be 60-120 seconds duration (use numeric values in seconds: 60, 75, 90, 105, 120)
6. Focus on bodyweight or minimal equipment exercises
7. Target major muscle groups with compound movements
8. Maintain moderate to moderately-high intensity
9. Include exercises that can be done in small spaces
10. Design for quick setup and minimal preparation
11. Ensure smooth transitions between exercises
12. Target cardiovascular and strength benefits simultaneously

EXERCISE SELECTION PRIORITIES:
- Compound movements that work multiple muscle groups
- Time-efficient exercises with high calorie burn potential  
- Movements that require minimal equipment or space
- Exercises appropriate for the user's energy level
- Include both strength and cardio elements
- Focus on functional movement patterns

INTENSITY AND PACING:
- Start with moderate activation exercises
- Build to moderately-high intensity in main workout
- Include brief active recovery between high-intensity exercises
- End with essential stretching for key muscle groups`;

export const MINI_SESSION_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'mini_session_10min_v1',
  name: '10-Minute Mini Session Workout',
  description: 'Short but effective workouts that fit into busy schedules',
  version: '1.0',
  template: templateText,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 6,
        focus: 'Full Body',
        equipment: ['None'],
        fitnessLevel: 'some experience',
        sorenessAreas: []
      },
      expectedOutput: {
        id: 'full_body_mini_10min',
        title: '10-Minute Full Body Energizer',
        description: 'Efficient full-body workout combining strength and cardio for maximum impact',
        totalDuration: 10,
        difficulty: 'some experience',
        warmup: { 
          exercises: [
            { name: 'Arm Circles and Leg Swings' }, 
            { name: 'Bodyweight Squats' }
          ] 
        },
        mainWorkout: { 
          exercises: [
            { name: 'Push-up to T' },
            { name: 'Jump Squats' }, 
            { name: 'Mountain Climbers' }
          ] 
        },
        cooldown: { exercises: [{ name: 'Full Body Stretch Flow' }] }
      },
      description: 'High-energy mini session for busy schedules'
    }
  ]
}; 

// 🔍 DEBUG: Log token estimates
console.log('🔍 10min Template Token Estimates:', {
  systemPromptTokens: estimateTokenCount(MINI_SESSION_SYSTEM_PROMPT),
  totalTemplateTokens: estimateTokenCount(templateText),
  recommendedMaxTokens: estimateTokenCount(templateText) * 2, // Double for response
  currentMaxTokens: 4000, // Updated development setting
  warning: estimateTokenCount(templateText) * 2 > 4000 ? 
    'Template likely to exceed token limit' : 
    'Token limit should be sufficient'
}); 