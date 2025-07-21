// 20-Minute Focused Workout Generation Prompt
import { PromptTemplate } from '../../types/external-ai.types';
import { DURATION_CONFIGS } from './duration-constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from './shared-templates';

const CONFIG = DURATION_CONFIGS['20min'];

export const FOCUSED_WORKOUT_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

export const FOCUSED_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'focused_20min_v1',
  name: '20-Minute Focused Workout',
  description: 'Balanced duration sessions with full structure and exercise variety',
  version: '1.0',
  template: `${FOCUSED_WORKOUT_SYSTEM_PROMPT}

FOCUSED WORKOUT SPECIALIZATION:
Well-structured 20-minute sessions that provide comprehensive fitness benefits with proper progression. These workouts:
- Allow adequate time for proper warm-up and cool-down phases
- Include multiple exercise types and movement patterns
- Provide sufficient challenge without overwhelming the user
- Accommodate various fitness goals with focused training blocks
- Balance efficiency with thoroughness

USER CONTEXT:
- Energy Level: {{energyLevel}}/10
- Workout Focus: {{focus}}
- Available Equipment: {{equipment}}
- Fitness Level: {{fitnessLevel}}
- Soreness Areas: {{sorenessAreas}}
- Primary Goal: {{primaryGoal}}
- Location: {{location}}
- Time of Day: {{timeOfDay}}

${generateWorkoutStructure(CONFIG)}

CRITICAL REQUIREMENTS FOR 20-MINUTE WORKOUTS:
1. EXACTLY 10 total exercises (3 warm-up + 5 main + 2 cool-down)
2. Warm-up: 3 minutes with progressive activation, mobility, and preparation
3. Main workout: 14 minutes with diverse exercise selection and adequate rest
4. Cool-down: 3 minutes with comprehensive stretching and recovery
5. Each exercise should be 90-150 seconds including rest/transitions
6. Include 3-4 different movement patterns (push, pull, squat, hinge, lunge, core)
7. Balance strength, cardio, and stability components
8. Allow proper rest periods between high-intensity exercises (30-45 seconds)
9. Target all major muscle groups throughout the session
10. Include progression from basic to more complex movements
11. Accommodate equipment variety and space requirements
12. Provide clear intensity guidance for each exercise phase

WORKOUT FLOW STRATEGY:
- Warm-up: Gentle mobility → Dynamic activation → Movement preparation
- Main workout: Foundation strength → Compound movements → Cardio challenge → Core/stability → Integration exercise
- Cool-down: Active recovery → Targeted stretching

INTENSITY MANAGEMENT:
- Build intensity gradually through warm-up phase
- Peak intensity in middle of main workout (exercises 3-4)
- Include active recovery or lower intensity exercise after peak
- Taper intensity in final main exercise
- Focus on restoration in cool-down phase

EXERCISE VARIETY REQUIREMENTS:
- Include both bilateral and unilateral movements
- Mix upper body, lower body, and full-body exercises
- Combine strength-focused and cardio-focused movements
- Include isometric holds and dynamic movements
- Target different planes of movement (sagittal, frontal, transverse)

PERSONALIZATION FOCUS:
- Adapt exercise complexity to fitness level experience
- Scale intensity based on energy level and recovery state
- Modify exercises to avoid aggravating sore areas
- Consider goal-specific exercise selection (strength vs cardio vs flexibility focus)
- Account for equipment limitations with appropriate alternatives`,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 6,
        focus: 'Full Body',
        equipment: ['Resistance Bands', 'Yoga Mat'],
        fitnessLevel: 'some experience',
        sorenessAreas: ['lower back'],
        primaryGoal: 'General Fitness',
        location: 'home',
        timeOfDay: 'evening'
      },
      expectedOutput: {
        id: 'full_body_focused_20min',
        title: '20-Minute Focused Full Body Flow',
        description: 'Comprehensive full-body workout using resistance bands with lower back modifications',
        totalDuration: 20,
        difficulty: 'some experience',
        warmup: { 
          exercises: [
            { name: 'Gentle Cat-Cow Stretches' },
            { name: 'Band Arm Circles' }, 
            { name: 'Bodyweight Squats' }
          ] 
        },
        mainWorkout: { 
          exercises: [
            { name: 'Band Chest Press' },
            { name: 'Modified Squats (back-friendly)' },
            { name: 'Band Rows' },
            { name: 'Standing Side Crunches' },
            { name: 'Band Pull-Aparts' }
          ] 
        },
        cooldown: { 
          exercises: [
            { name: 'Gentle Spinal Twists' },
            { name: 'Hip Flexor Stretches' }
          ] 
        }
      },
      description: 'Balanced full-body session with lower back considerations'
    }
  ]
}; 