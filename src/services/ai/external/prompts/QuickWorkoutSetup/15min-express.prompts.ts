// 15-Minute Express Workout Generation Prompt
import { PromptTemplate } from '../../types/external-ai.types';
import { DURATION_CONFIGS } from './duration-constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from './shared-templates';

const CONFIG = DURATION_CONFIGS['15min'];

export const EXPRESS_WORKOUT_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

export const EXPRESS_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'express_15min_v1',
  name: '15-Minute Express Workout',
  description: 'Efficient, balanced workouts that provide comprehensive movement and energy',
  version: '1.0',
  template: `${EXPRESS_WORKOUT_SYSTEM_PROMPT}

EXPRESS WORKOUT SPECIALIZATION:
Balanced 15-minute sessions that deliver comprehensive fitness benefits efficiently. These workouts:
- Provide complete workout experience in minimal time
- Include proper warm-up, structured training, and cool-down
- Target multiple fitness components (strength, cardio, flexibility)
- Accommodate various fitness levels and goals
- Fit perfectly into morning routines or lunch breaks

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

CRITICAL REQUIREMENTS FOR 15-MINUTE WORKOUTS:
1. EXACTLY 8 total exercises (2 warm-up + 4 main + 2 cool-down)
2. Warm-up: 2 minutes with progressive activation and mobility
3. Main workout: 11 minutes with varied exercise types and intensities
4. Cool-down: 2 minutes with targeted stretching and recovery
5. Each exercise should be 90-120 seconds including rest/transitions
6. Include variety in movement patterns (push, pull, squat, lunge, core)
7. Balance strength and cardiovascular elements
8. Accommodate available equipment and space constraints
9. Scale intensity based on energy level and fitness experience
10. Include modifications for different fitness levels
11. Target major muscle groups efficiently
12. Ensure logical exercise progression and flow

EXERCISE STRUCTURE STRATEGY:
- Warm-up: Dynamic preparation + activation exercise
- Main workout: Foundation movement → compound exercise → cardio element → core/stability
- Cool-down: Active recovery movement + targeted stretching

INTENSITY PROGRESSION:
- Begin with gentle activation and mobility
- Progress to moderate intensity compound movements
- Peak with higher intensity cardio or strength exercise
- Taper with core work and flexibility
- End with restorative stretching

PERSONALIZATION PRIORITIES:
- Adapt exercise selection based on primary goal and focus
- Modify intensity based on energy level (3-4: gentler, 7-8: challenging)
- Consider soreness areas and provide alternatives
- Match complexity to fitness level experience
- Accommodate location and equipment constraints`,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 7,
        focus: 'Strength',
        equipment: ['Dumbbells'],
        fitnessLevel: 'some experience',
        sorenessAreas: ['shoulders'],
        primaryGoal: 'Build Muscle',
        location: 'home',
        timeOfDay: 'morning'
      },
      expectedOutput: {
        id: 'strength_express_15min',
        title: '15-Minute Express Strength Builder',
        description: 'Efficient strength-focused workout targeting major muscle groups with dumbbell exercises',
        totalDuration: 15,
        difficulty: 'some experience',
        warmup: { 
          exercises: [
            { name: 'Dynamic Arm Swings (avoiding overhead)' }, 
            { name: 'Bodyweight Squats' }
          ] 
        },
        mainWorkout: { 
          exercises: [
            { name: 'Dumbbell Goblet Squats' },
            { name: 'Modified Push-ups (shoulder-friendly)' },
            { name: 'Dumbbell Bent-over Rows' },
            { name: 'Dumbbell Deadlifts' }
          ] 
        },
        cooldown: { 
          exercises: [
            { name: 'Standing Forward Fold' },
            { name: 'Gentle Side Stretches' }
          ] 
        }
      },
      description: 'Strength-focused express session with shoulder considerations'
    }
  ]
}; 