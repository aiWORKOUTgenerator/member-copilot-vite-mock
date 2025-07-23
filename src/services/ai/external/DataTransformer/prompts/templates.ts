import { PromptTemplate } from '../types/external-ai.types';
import { CORE_REQUIRED_FIELDS } from '../types/profile.types';

export const WORKOUT_TEMPLATES: Record<string, PromptTemplate> = {
  default: {
    id: 'default-workout',
    template: `You are a professional fitness trainer creating a personalized workout plan. 
Create a workout plan based on the following information:

Experience Level: {{experienceLevel}}
Primary Goal: {{primaryGoal}}
Fitness Level: {{calculatedFitnessLevel}}
Physical Activity: {{physicalActivity}}
Age: {{age}}
Height: {{height}}
Weight: {{weight}}
Gender: {{gender}}
Preferred Duration: {{preferredDuration}}
Time Commitment: {{timeCommitment}}
Intensity Level: {{intensityLevel}}
Preferred Activities: {{preferredActivities}}
Available Locations: {{availableLocations}}
Available Equipment: {{availableEquipment}}
Goal Timeline: {{goalTimeline}}
Cardiovascular Conditions: {{hasCardiovascularConditions}}
Injuries: {{injuries}}

Focus Area: {{focus}}
Duration: {{duration}} minutes
Energy Level: {{energyLevel}}/10

Return the workout plan as a JSON object with the following structure:
{
  "id": "unique-id",
  "name": "workout-name",
  "description": "workout-description",
  "warmup": {
    "name": "warmup-name",
    "duration": duration-in-minutes,
    "exercises": [
      {
        "id": "exercise-id",
        "name": "exercise-name",
        "sets": number-of-sets,
        "reps": reps-per-set,
        "duration": duration-in-seconds,
        "rest": rest-in-seconds,
        "difficulty": "{{calculatedFitnessLevel}}",
        "equipment": ["equipment-needed"],
        "focusAreas": ["focus-areas"],
        "instructions": "detailed-instructions"
      }
    ]
  },
  "mainWorkout": {
    "name": "main-workout-name",
    "duration": duration-in-minutes,
    "exercises": [/* same structure as warmup exercises */]
  },
  "cooldown": {
    "name": "cooldown-name",
    "duration": duration-in-minutes,
    "exercises": [/* same structure as warmup exercises */]
  },
  "totalDuration": total-duration-in-minutes,
  "difficulty": "{{calculatedFitnessLevel}}",
  "focusAreas": ["primary-focus", "secondary-focus"],
  "equipment": ["equipment-needed"],
  "tags": ["relevant-tags"],
  "confidence": confidence-score-between-0-and-1,
  "generatedAt": "ISO-date-string",
  "metadata": {
    "userProfile": {
      "fitnessLevel": "{{calculatedFitnessLevel}}",
      "goals": ["{{primaryGoal}}"]
    }
  }
}`,
    variables: [
      // Core required fields
      ...CORE_REQUIRED_FIELDS.map(field => ({ name: field, required: true })),
      // Optional fields
      { name: 'age', required: false },
      { name: 'height', required: false },
      { name: 'weight', required: false },
      { name: 'gender', required: false },
      { name: 'physicalActivity', required: false },
      { name: 'preferredDuration', required: false },
      { name: 'timeCommitment', required: false },
      { name: 'intensityLevel', required: false },
      { name: 'preferredActivities', required: false },
      { name: 'availableLocations', required: false },
      { name: 'availableEquipment', required: false },
      { name: 'goalTimeline', required: false },
      { name: 'hasCardiovascularConditions', required: false },
      { name: 'injuries', required: false },
      { name: 'focus', required: true },
      { name: 'duration', required: true },
      { name: 'energyLevel', required: true }
    ]
  },

  quick: {
    id: 'quick-workout',
    template: `You are a professional fitness trainer creating a quick workout plan. 
Create a focused workout based on the following key information:

Experience Level: {{experienceLevel}}
Primary Goal: {{primaryGoal}}
Fitness Level: {{calculatedFitnessLevel}}
Focus Area: {{focus}}
Duration: {{duration}} minutes
Energy Level: {{energyLevel}}/10
Available Equipment: {{availableEquipment}}
Injuries: {{injuries}}

Return the workout plan as a JSON object with the same structure as the default template.`,
    variables: [
      // Core required fields
      ...CORE_REQUIRED_FIELDS.map(field => ({ name: field, required: true })),
      // Quick workout specific fields
      { name: 'focus', required: true },
      { name: 'duration', required: true },
      { name: 'energyLevel', required: true },
      { name: 'availableEquipment', required: false },
      { name: 'injuries', required: false }
    ]
  }
}; 