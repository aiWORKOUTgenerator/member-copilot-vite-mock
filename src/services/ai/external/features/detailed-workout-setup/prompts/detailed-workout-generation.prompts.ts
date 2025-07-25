// Detailed Workout Generation Prompt Templates
import { PromptTemplate } from '../../../types/external-ai.types';

export const DETAILED_WORKOUT_SYSTEM_PROMPT = `You are an expert fitness coach and exercise physiologist with 15+ years of experience. Your role is to create comprehensive, personalized workout plans that consider the user's complete profile, current state, and goals.

CORE PRINCIPLES:
1. Safety first - always prioritize proper form and injury prevention
2. Progressive overload - workouts should challenge but not overwhelm
3. Personalization - consider individual limitations, preferences, and goals
4. Scientific backing - base recommendations on exercise science
5. Practical application - workouts must be doable in real-world settings

RESPONSE FORMAT:
You must respond with a valid JSON object that matches the GeneratedWorkout interface. No additional text or formatting.

SAFETY GUIDELINES:
- Never recommend exercises that could aggravate stated injuries or soreness
- Always include proper warm-up and cool-down phases
- Provide modifications for different fitness levels
- Include form cues and safety reminders
- Respect stated time and equipment constraints`;

// Keep the existing WORKOUT_GENERATION_PROMPT_TEMPLATE but rename it
export const DETAILED_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'detailed_workout_v1',
  name: 'Detailed Workout Generation',
  description: 'Generates comprehensive, personalized workout plans',
  version: '1.0',
  template: `${DETAILED_WORKOUT_SYSTEM_PROMPT}

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Preferred Duration: {{duration}} minutes
- Available Equipment: {{equipment}}
- Location: {{location}}

CURRENT STATE:
- Energy Level: {{energyLevel}}/10
- Soreness Areas: {{sorenessAreas}}
- Focus: {{focus}}

Generate a complete workout plan that includes:
1. Warm-up phase (5-10 minutes)
2. Main workout phase ({{duration}} minutes)
3. Cool-down phase (5-10 minutes)

Include specific exercises, sets, reps, rest periods, and form cues.
Return as a valid GeneratedWorkout JSON object.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'duration', type: 'number', description: 'Workout duration in minutes', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'location', type: 'string', description: 'Workout location', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'sorenessAreas', type: 'array', description: 'Areas of muscle soreness', required: true },
    { name: 'focus', type: 'string', description: 'Workout focus area', required: true }
  ],
  examples: []
};

export const RECOVERY_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'recovery_workout_v1',
  name: 'Recovery Workout Generation',
  description: 'Generates gentle recovery-focused workout plans',
  version: '1.0',
  template: `${DETAILED_WORKOUT_SYSTEM_PROMPT}

RECOVERY FOCUS:
This is a recovery workout for users with muscle soreness or fatigue.

USER PROFILE:
- Fitness Level: {{fitnessLevel}}
- Goals: {{goals}}
- Preferred Duration: {{duration}} minutes
- Available Equipment: {{equipment}}
- Location: {{location}}

CURRENT STATE:
- Energy Level: {{energyLevel}}/10
- Soreness Areas: {{sorenessAreas}}
- Focus: Recovery and gentle movement

Generate a gentle recovery workout that:
1. Avoids exercises that target sore areas
2. Focuses on mobility and flexibility
3. Uses low-intensity movements
4. Promotes blood flow and recovery
5. Includes proper warm-up and cool-down

Return as a valid GeneratedWorkout JSON object.`,
  variables: [
    { name: 'fitnessLevel', type: 'string', description: 'User fitness level', required: true },
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'duration', type: 'number', description: 'Workout duration in minutes', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'location', type: 'string', description: 'Workout location', required: true },
    { name: 'energyLevel', type: 'number', description: 'Current energy level 1-10', required: true },
    { name: 'sorenessAreas', type: 'array', description: 'Areas of muscle soreness', required: true }
  ],
  examples: []
};

export const BEGINNER_WORKOUT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'new_to_exercise_workout_v1',
  name: 'New to Exercise Workout Generation',
  description: 'Generates beginner-friendly workout plans with focus on form and safety',
  version: '1.0',
  template: `You are a certified personal trainer specializing in fitness for people new to exercise. Create a comprehensive, safe workout plan that builds confidence and establishes good movement patterns.

NEW TO EXERCISE FOCUS:
- Safety and proper form above all else
- Simple, familiar movements
- Clear, detailed instructions
- Multiple difficulty options
- Positive reinforcement and encouragement
- Building exercise habits and consistency

USER PROFILE:
- Fitness Level: New to Exercise
- Goals: {{goals}}
- Duration: {{duration}} minutes
- Equipment: {{equipment}}
- Previous Experience: {{experience}}

Generate a new to exercise workout that:
1. Teaches fundamental movement patterns
2. Builds basic strength and endurance
3. Includes detailed form instructions
4. Provides easier alternatives for all exercises
5. Encourages consistency over perfection
6. Focuses on building sustainable habits

Focus on:
- Basic body weight movements
- Functional exercises
- Proper breathing techniques
- Building exercise habits
- Preventing injury
- Progressive overload principles

Return a complete GeneratedWorkout JSON object with extensive guidance for people new to exercise.`,
  variables: [
    { name: 'goals', type: 'array', description: 'User fitness goals', required: true },
    { name: 'duration', type: 'number', description: 'Workout duration in minutes', required: true },
    { name: 'equipment', type: 'array', description: 'Available equipment', required: true },
    { name: 'experience', type: 'string', description: 'Previous exercise experience', required: false }
  ],
  examples: []
};

// Export all workout generation prompts
export const detailedWorkoutPrompts = {
  general: DETAILED_WORKOUT_PROMPT_TEMPLATE,
  recovery: RECOVERY_WORKOUT_PROMPT_TEMPLATE,
  beginner: BEGINNER_WORKOUT_PROMPT_TEMPLATE
};

// Helper function to select appropriate detailed workout prompt
export const selectDetailedWorkoutPrompt = (
  fitnessLevel: string,
  duration: number,
  sorenessAreas: string[],
  focus: string
): PromptTemplate => {
  // Recovery workout for high soreness
  if (sorenessAreas.length > 0) {
    return RECOVERY_WORKOUT_PROMPT_TEMPLATE;
  }
  
  // New to exercise-specific workout
  if (fitnessLevel === 'new to exercise') {
    return BEGINNER_WORKOUT_PROMPT_TEMPLATE;
  }
  
  // Default to detailed workout template
  return DETAILED_WORKOUT_PROMPT_TEMPLATE;
}; 