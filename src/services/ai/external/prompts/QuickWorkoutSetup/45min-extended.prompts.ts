// 45-Minute Extended Workout Generation Prompt  
import { PromptTemplate } from '../../types/external-ai.types';
import { DURATION_CONFIGS } from './duration-constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from './shared-templates';

const CONFIG = DURATION_CONFIGS['45min'];

export const EXTENDED_WORKOUT_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

export const EXTENDED_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'extended_45min_v1',
  name: '45-Minute Extended Workout',
  description: 'Comprehensive, full-featured workouts with maximum exercise variety and progressive challenge',
  version: '1.0',
  template: `${EXTENDED_WORKOUT_SYSTEM_PROMPT}

EXTENDED WORKOUT SPECIALIZATION:
Comprehensive 45-minute sessions that provide maximum benefit through:
- Full warm-up, training, and recovery phases
- Progressive exercise complexity throughout the session
- Multiple movement patterns and muscle groups
- Adequate rest periods for proper form and recovery
- Educational components for skill development
- Variety to prevent monotony and maintain engagement

USER PROFILE:
- Energy Level: {{energyLevel}}/10
- Workout Focus: {{focus}}
- Available Equipment: {{equipment}}
- Fitness Level: {{fitnessLevel}}
- Soreness Areas: {{sorenessAreas}}
- Primary Goal: {{primaryGoal}}
- Location: {{location}}
- Age Range: {{age}}
- Injuries: {{injuries}}
- Space Limitations: {{spaceLimitations}}
- Cardiovascular Health: {{hasCardiovascularConditions}}
- Previous Workout: {{previousWorkout}}
- Preferred Activities: {{preferredActivities}}

${generateWorkoutStructure(CONFIG)}

CRITICAL REQUIREMENTS FOR 45-MINUTE WORKOUTS:
1. EXACTLY 20 total exercises (4 warm-up + 12 main + 4 cool-down)
2. Warm-up: 5 minutes with mobility, activation, and light cardio
3. Main workout: 35 minutes with varied exercise types and intensities
4. Cool-down: 5 minutes with stretching and recovery
5. Include 3-4 different movement patterns (push, pull, squat, hinge, etc.)
6. Vary exercise types: strength, cardio, flexibility, balance
7. Progressive intensity throughout main workout
8. Adequate rest periods (30-90 seconds between exercises)
9. Target multiple muscle groups with compound movements
10. Include educational form cues and technique tips
11. Provide clear progression pathways for advancement
12. Ensure workout variety to maintain engagement
13. Consider cardiovascular health and injury limitations
14. Plan realistic timing for each exercise including transitions (all durations in seconds: 60, 90, 120, 150, 180, etc.)
15. Include motivational elements for session completion

EXERCISE PROGRESSION STRATEGY:
- Warm-up: Gentle activation → Dynamic preparation
- Main workout: Foundation movements → Progressive challenge → Peak intensity → Active recovery
- Cool-down: Gentle movement → Static stretching → Relaxation

VARIETY REQUIREMENTS:
- Include both bilateral and unilateral exercises
- Mix standing and floor-based movements  
- Combine strength, cardio, and mobility elements
- Target all major muscle groups across the session
- Vary exercise timing (strength holds, cardio intervals, flow movements)

PERSONALIZATION PRIORITIES:
- Adapt exercise selection based on stated goals
- Modify intensity based on energy level and fitness
- Avoid exercises that aggravate injuries or soreness
- Consider equipment limitations and space constraints
- Match complexity to experience level
- Include relevant progressions and regressions`,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 8,
        focus: 'Strength',
        equipment: ['Dumbbells', 'Resistance Bands', 'Yoga Mat'],
        fitnessLevel: 'advanced athlete',
        sorenessAreas: [],
        primaryGoal: 'Build Muscle',
        location: 'home gym',
        age: '25-35',
        injuries: [],
        spaceLimitations: []
      },
      expectedOutput: {
        id: 'advanced_strength_45min',
        title: '45-Minute Advanced Strength Builder',
        description: 'Comprehensive strength training with progressive overload and muscle building focus',
        totalDuration: 45,
        difficulty: 'advanced athlete',
        warmup: { 
          exercises: [
            { name: 'Dynamic Joint Circles' },
            { name: 'Activation Band Pulls' },
            { name: 'Bodyweight Squats' },
            { name: 'Arm Swings & Leg Swings' }
          ] 
        },
        mainWorkout: { 
          exercises: [
            { name: 'Dumbbell Goblet Squats' },
            { name: 'Push-up Variations' },
            { name: 'Single-Arm Dumbbell Rows' },
            { name: 'Dumbbell Romanian Deadlifts' },
            { name: 'Overhead Press' },
            { name: 'Plank to Push-up' },
            { name: 'Dumbbell Lunges' },
            { name: 'Resistance Band Chest Press' },
            { name: 'Dumbbell Renegade Rows' },
            { name: 'Bulgarian Split Squats' },
            { name: 'Band Pull-Aparts' },
            { name: 'Core Circuit Finisher' }
          ] 
        },
        cooldown: { 
          exercises: [
            { name: 'Standing Forward Fold' },
            { name: 'Hip Flexor Stretches' },
            { name: 'Shoulder Cross-Body Stretch' },
            { name: 'Seated Spinal Twist' }
          ] 
        }
      },
      description: 'High-energy advanced strength workout with comprehensive muscle targeting'
    }
  ]
}; 