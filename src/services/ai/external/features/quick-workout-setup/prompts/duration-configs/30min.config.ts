// 30-Minute Complete Workout Generation Prompt
import { PromptTemplate } from '../../../../types/external-ai.types';
import { DURATION_CONFIGS } from '../../constants/quick-workout.constants';
import { generateSystemPrompt, generateWorkoutStructure, getVariablesForRequirement } from '../shared-templates';

const CONFIG = DURATION_CONFIGS['30min'];

export const COMPLETE_WORKOUT_SYSTEM_PROMPT = generateSystemPrompt(CONFIG);

// 🔍 DEBUG: Estimate token count
const estimateTokenCount = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

const templateText = `${COMPLETE_WORKOUT_SYSTEM_PROMPT}

COMPLETE WORKOUT SPECIALIZATION:
Comprehensive 30-minute sessions that provide the full workout experience with optimal structure. These workouts:
- Include thorough warm-up, diverse training, and comprehensive cool-down
- Allow adequate time for proper exercise execution and rest
- Accommodate multiple fitness goals within a single session
- Provide significant fitness benefits across strength, cardio, and flexibility
- Balance intensity with recovery for optimal adaptation

USER CONTEXT:
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

${generateWorkoutStructure(CONFIG)}

CRITICAL REQUIREMENTS FOR 30-MINUTE WORKOUTS:
1. EXACTLY 14 total exercises (3 warm-up + 8 main + 3 cool-down)
2. Warm-up: 4 minutes with thorough preparation and activation
3. Main workout: 22 minutes with diverse exercise blocks and adequate recovery
4. Cool-down: 4 minutes with comprehensive stretching and relaxation
5. Each exercise should be 120-150 seconds duration (use numeric values in seconds: 120, 135, 150)
6. Include 4-5 different movement patterns and exercise types
7. Allow 30-60 seconds rest between strength exercises, 15-30 seconds between cardio
8. Target all major muscle groups with multiple approaches
9. Include both compound and isolation exercises
10. Provide exercise variety to maintain engagement
11. Build in intensity waves (build, peak, recover, build again)
12. Consider individual limitations and provide modifications
13. Include educational elements and form focus
14. Plan realistic timing including setup and transitions

COMPREHENSIVE WORKOUT STRUCTURE:
- Warm-up: Gentle mobility → Dynamic activation → Movement-specific preparation
- Main workout: 
  * Foundation block (exercises 1-2): Basic strength/movement patterns
  * Build block (exercises 3-4): Compound movements with increased intensity  
  * Peak block (exercises 5-6): Highest intensity cardio or strength challenge
  * Integration block (exercises 7-8): Core/stability work and skill development
- Cool-down: Active recovery → Targeted stretching → Relaxation/restoration

EXERCISE VARIETY MANDATES:
- Include both push and pull movements
- Target upper body, lower body, and core in separate exercises
- Mix strength training and cardiovascular conditioning
- Include unilateral (single-limb) and bilateral movements
- Incorporate different exercise tempos (explosive, controlled, isometric)
- Use various equipment if available (bodyweight, weights, bands, etc.)
- Include functional movement patterns relevant to daily activities

INTENSITY AND PROGRESSION:
- Gradual warm-up building to training readiness
- Progressive overload through main workout blocks
- Strategic placement of high-intensity intervals
- Active recovery between demanding exercises
- Systematic cool-down from training state to rest

PERSONALIZATION PRIORITIES:
- Adapt exercise selection and complexity to fitness level
- Scale intensity based on energy level (low energy = moderate intensity focus)
- Avoid exercises that could aggravate injuries or sore areas
- Consider age-related modifications (joint-friendly alternatives for older users)
- Accommodate space limitations with appropriate exercise substitutions
- Match workout focus to stated primary goal (strength, weight loss, conditioning, etc.)`;

export const COMPLETE_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'complete_30min_v1',
  name: '30-Minute Complete Workout',
  description: 'Full workout experience with comprehensive warm-up, training, and recovery phases',
  version: '1.0',
  template: templateText,
  variables: getVariablesForRequirement(CONFIG.variableRequirements),
  examples: [
    {
      input: {
        energyLevel: 8,
        focus: 'Cardio',
        equipment: ['Dumbbells', 'Yoga Mat'],
        fitnessLevel: 'some experience',
        sorenessAreas: [],
        primaryGoal: 'Weight Loss',
        location: 'home',
        age: '25-35',
        injuries: [],
        spaceLimitations: ['small_space']
      },
      expectedOutput: {
        id: 'cardio_complete_30min',
        title: '30-Minute Complete Cardio Burn',
        description: 'High-energy cardio-focused workout with strength elements for maximum calorie burn',
        totalDuration: 30,
        difficulty: 'some experience',
        warmup: { 
          exercises: [
            { name: 'Marching in Place with Arm Swings' },
            { name: 'Dynamic Leg Swings' }, 
            { name: 'Light Dumbbell Circles' }
          ] 
        },
        mainWorkout: { 
          exercises: [
            { name: 'Dumbbell Squats' },
            { name: 'Modified Burpees' },
            { name: 'Dumbbell Thrusters' },
            { name: 'High Knees in Place' },
            { name: 'Dumbbell Renegade Rows' },
            { name: 'Jump Squats (small space)' },
            { name: 'Dumbbell Deadlifts' },
            { name: 'Plank to Downward Dog' }
          ] 
        },
        cooldown: { 
          exercises: [
            { name: 'Standing Forward Fold' },
            { name: 'Seated Spinal Twists' },
            { name: 'Deep Breathing Relaxation' }
          ] 
        }
      },
      description: 'High-energy cardio session optimized for small space and weight loss'
    }
  ]
}; 

// 🔍 DEBUG: Log token estimates
console.log('🔍 30min Template Token Estimates:', {
  systemPromptTokens: estimateTokenCount(COMPLETE_WORKOUT_SYSTEM_PROMPT),
  totalTemplateTokens: estimateTokenCount(templateText),
  recommendedMaxTokens: estimateTokenCount(templateText) * 2, // Double for response
  currentMaxTokens: 4000, // Updated development setting
  warning: estimateTokenCount(templateText) * 2 > 4000 ? 
    'Template likely to exceed token limit' : 
    'Token limit should be sufficient'
}); 