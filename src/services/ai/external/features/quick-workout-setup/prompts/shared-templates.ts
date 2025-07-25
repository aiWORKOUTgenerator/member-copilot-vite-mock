// Shared templates and components for duration-specific workout prompts
import { DurationConfig } from '../constants/quick-workout.constants';

export const BASE_SYSTEM_IDENTITY = `You are an expert fitness coach specializing in time-efficient, personalized workout generation.`;

export const CORE_PRINCIPLES = `
CORE PRINCIPLES:
1. Safety - ensure exercises are appropriate for user's current state
2. Effectiveness - maximize results within available time
3. Adaptability - provide modifications based on limitations
4. Personalization - consider individual goals and preferences
5. Practicality - workouts must be achievable in real-world settings`;

export const RESPONSE_FORMAT = `
RESPONSE FORMAT:
You must respond with a valid JSON object that matches the GeneratedWorkout interface. No additional text or formatting.`;

// Variable sets based on complexity requirements
export const VARIABLE_SETS = {
  core: [
    { name: 'energyLevel', type: 'number' as const, description: 'Current energy level 1-10', required: true },
    { name: 'focus', type: 'string' as const, description: 'Workout focus area', required: true },
    { name: 'equipment', type: 'array' as const, description: 'Available equipment', required: true },
    { name: 'fitnessLevel', type: 'string' as const, description: 'User fitness level', required: true },
    { name: 'sorenessAreas', type: 'array' as const, description: 'Areas of muscle soreness', required: true }
  ],
  standard: [
    // Core variables plus:
    { name: 'primaryGoal', type: 'string' as const, description: 'Primary fitness goal', required: true },
    { name: 'location', type: 'string' as const, description: 'Workout location', required: false },
    { name: 'timeOfDay', type: 'string' as const, description: 'Time of day preference', required: false }
  ],
  enhanced: [
    // Standard variables plus:
    { name: 'age', type: 'string' as const, description: 'User age range', required: false },
    { name: 'injuries', type: 'array' as const, description: 'Current injuries or limitations', required: false },
    { name: 'spaceLimitations', type: 'array' as const, description: 'Space constraints', required: false },
    // ✅ SURGICAL FIX: Add derived variables that PromptSelector computes
    { name: 'hasSoreness', type: 'boolean' as const, description: 'Whether user has any soreness', required: false },
    { name: 'sorenessCount', type: 'number' as const, description: 'Number of sore areas', required: false },
    { name: 'hasEquipment', type: 'boolean' as const, description: 'Whether user has equipment', required: false },
    { name: 'equipmentCount', type: 'number' as const, description: 'Number of equipment items', required: false },
    { name: 'isMinimal', type: 'boolean' as const, description: 'Whether workout is minimal complexity', required: false },
    { name: 'isSimple', type: 'boolean' as const, description: 'Whether workout is simple complexity', required: false },
    { name: 'isStandard', type: 'boolean' as const, description: 'Whether workout is standard complexity', required: false },
    { name: 'isAdvanced', type: 'boolean' as const, description: 'Whether workout is advanced complexity', required: false },
    { name: 'durationAdjusted', type: 'boolean' as const, description: 'Whether duration was adjusted', required: false }
  ],
  full: [
    // Enhanced variables plus:
    { name: 'hasCardiovascularConditions', type: 'string' as const, description: 'Cardiovascular health status', required: false },
    { name: 'previousWorkout', type: 'string' as const, description: 'Previous workout details', required: false },
    { name: 'preferredActivities', type: 'array' as const, description: 'Preferred workout activities', required: false }
  ]
};

// Exercise structure templates by complexity
export const EXERCISE_STRUCTURES = {
  minimal: {
    required: ['id', 'name', 'description', 'duration'],
    optional: ['equipment', 'form', 'primaryMuscles']
  },
  simple: {
    required: ['id', 'name', 'description', 'duration', 'equipment', 'form'],
    optional: ['modifications', 'primaryMuscles', 'commonMistakes']
  },
  standard: {
    required: ['id', 'name', 'description', 'duration', 'sets', 'reps', 'restTime', 'equipment', 'form'],
    optional: ['modifications', 'commonMistakes', 'primaryMuscles', 'secondaryMuscles', 'personalizedNotes']
  },
  comprehensive: {
    required: ['id', 'name', 'description', 'duration', 'sets', 'reps', 'restTime', 'equipment', 'form', 'modifications'],
    optional: ['commonMistakes', 'primaryMuscles', 'secondaryMuscles', 'movementType', 'personalizedNotes', 'difficultyAdjustments']
  },
  advanced: {
    required: ['id', 'name', 'description', 'duration', 'sets', 'reps', 'restTime', 'equipment', 'form', 'modifications', 'commonMistakes', 'primaryMuscles', 'secondaryMuscles', 'movementType', 'personalizedNotes', 'difficultyAdjustments'],
    optional: []
  }
};

// Generate duration-specific system prompt
export const generateSystemPrompt = (config: DurationConfig): string => {
  const durationFocus = {
    5: 'ultra-efficient, desk-break workouts that provide instant energy and movement',
    10: 'short, effective sessions that fit into busy schedules',
    15: 'express workouts that provide comprehensive movement and energy',
    20: 'focused sessions with balanced structure and variety',
    30: 'complete workout experiences with full warm-up, training, and recovery phases',
    45: 'extended sessions with maximum exercise variety and progressive challenge'
  }[config.duration] || 'time-optimized workouts';

  return `${BASE_SYSTEM_IDENTITY} Your specialty is ${config.name.toLowerCase()} (${config.duration}-minute) workouts - ${durationFocus}.

${CORE_PRINCIPLES}

DURATION-SPECIFIC FOCUS:
- Total Duration: EXACTLY ${config.duration} minutes
- Exercise Count: ${config.exerciseCount.total} total exercises (${config.exerciseCount.warmup} warm-up + ${config.exerciseCount.main} main + ${config.exerciseCount.cooldown} cool-down)
- Complexity Level: ${config.complexity}
- Time Distribution: ${config.timeAllocation.warmupPercent}% warm-up, ${config.timeAllocation.mainPercent}% main workout, ${config.timeAllocation.cooldownPercent}% cool-down

${RESPONSE_FORMAT}`;
};

// Generate workout structure template for specific duration
export const generateWorkoutStructure = (config: DurationConfig): string => {
  const exerciseTemplate = getExerciseTemplate(config.complexity);

  return `
GENERATE A ${config.duration.toString().toUpperCase()}-MINUTE WORKOUT with this exact structure:
{
  "id": "unique_workout_id",
  "title": "Engaging ${config.duration}-minute workout title",
  "description": "Brief description emphasizing ${config.name.toLowerCase()} workout benefits",
  "totalDuration": ${config.duration},
  "estimatedCalories": "calculated_estimate",
  "difficulty": "{{fitnessLevel}}",
  "equipment": ["required_equipment"],
  "warmup": {
    "name": "Warm-up",
    "exercises": [
      // EXACTLY ${config.exerciseCount.warmup} warm-up exercises
      ${exerciseTemplate}
    ],
    "instructions": "Phase-specific guidance",
    "tips": ["Warm-up tips"]
  },
  "mainWorkout": {
    "name": "Main Workout", 
    "exercises": [
      // EXACTLY ${config.exerciseCount.main} main workout exercises
      ${exerciseTemplate}
    ],
    "instructions": "Main workout guidance",
    "tips": ["Performance tips"]
  },
  "cooldown": {
    "name": "Cool-down", 
    "exercises": [
      // EXACTLY ${config.exerciseCount.cooldown} cool-down exercises
      ${exerciseTemplate}
    ],
    "instructions": "Cool-down guidance",
    "tips": ["Recovery tips"]
  },
  "reasoning": "Brief explanation of exercise selection for ${config.duration}-minute format",
  "personalizedNotes": ["User-specific guidance"],
  "progressionTips": ["How to advance this workout"],
  "safetyReminders": ["Safety considerations"],
  "generatedAt": "2024-current-timestamp",
  "aiModel": "gpt-4o",
  "confidence": 0.85,
  "tags": ["${config.name.toLowerCase().replace(' ', '_')}", "${config.duration}min"]
}

CRITICAL DURATION FORMATTING REQUIREMENTS:
- Individual exercise durations MUST be in SECONDS (not minutes)
- Example: For a 90-second exercise, use "duration": 90 (not "duration": 1.5 or "duration": "1.5 minutes")
- All duration fields in the JSON response must be numeric values representing seconds
- The UI will automatically convert seconds to "Xm Ys" format for display
- Phase durations will be calculated automatically based on exercise durations and rest periods
- WARNING: If you use minutes instead of seconds, the workout will be 60x shorter than intended
- VALIDATION: All exercise durations must be between 30 and 600 seconds (30s to 10m)
- CRITICAL: DO NOT include "duration" field in phase objects (warmup, mainWorkout, cooldown) - these will be calculated automatically
- CRITICAL: Only include "duration" field in individual exercise objects, and always use seconds`;
};

// Get exercise template based on complexity
const getExerciseTemplate = (complexity: string): string => {
  const structure = EXERCISE_STRUCTURES[complexity as keyof typeof EXERCISE_STRUCTURES];
  
  if (complexity === 'minimal') {
    return `{
        "id": "unique_exercise_id",
        "name": "Exercise name", 
        "description": "Clear, concise description",
        "duration": 60,
        "equipment": ["if_needed"],
        "form": "Key form cue",
        "primaryMuscles": ["target_muscles"]
      }`;
  }
  
  if (complexity === 'simple') {
    return `{
        "id": "unique_exercise_id",
        "name": "Exercise name",
        "description": "Clear description with benefits", 
        "duration": 90,
        "equipment": ["if_needed"],
        "form": "Essential form cues",
        "modifications": [{"type": "easier", "description": "Simpler version"}],
        "primaryMuscles": ["target_muscles"],
        "commonMistakes": ["Key mistake to avoid"]
      }`;
  }
  
  return `{
        "id": "unique_exercise_id",
        "name": "Exercise name",
        "description": "Detailed description",
        "duration": 120, 
        "sets": 1,
        "reps": 10,
        "restTime": 30,
        "equipment": ["if_needed"],
        "form": "Comprehensive form cues",
        "modifications": [
          {"type": "easier|harder|injury", "description": "Modification", "instructions": "How to modify"}
        ],
        "commonMistakes": ["Mistakes to avoid"],
        "primaryMuscles": ["target_muscles"],
        "secondaryMuscles": ["supporting_muscles"],
        "movementType": "cardio|strength|flexibility|balance",
        "personalizedNotes": ["User-specific tips"],
        "difficultyAdjustments": [
          {"level": "new to exercise|some experience|advanced athlete", "modification": "Adjustment", "reasoning": "Why"}
        ]
      }`;
};

// Generate variables array based on requirements
export const getVariablesForRequirement = (requirement: string) => {
  let variables = [...VARIABLE_SETS.core];
  
  if (requirement === 'standard' || requirement === 'enhanced' || requirement === 'full') {
    variables = [...variables, ...VARIABLE_SETS.standard];
  }
  
  if (requirement === 'enhanced' || requirement === 'full') {
    variables = [...variables, ...VARIABLE_SETS.enhanced];
  }
  
  if (requirement === 'full') {
    variables = [...variables, ...VARIABLE_SETS.full];
  }
  
  return variables;
}; 