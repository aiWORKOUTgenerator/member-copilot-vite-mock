import { PromptTemplate } from '../types/external-ai.types';

export const WORKOUT_TEMPLATES: Record<string, PromptTemplate> = {
  default: {
    id: 'default-workout',
    template: `You are a professional fitness trainer creating a personalized workout plan. 
Create a workout plan based on the following information:

Experience Level: {{experienceLevel}}
Primary Goal: {{primaryGoal}}
Age: {{age}}
Height: {{height}}
Weight: {{weight}}
Gender: {{gender}}
Physical Activity Level: {{physicalActivity}}
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
        "difficulty": "some experience",
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
  "difficulty": "{{experienceLevel}}",
  "focusAreas": ["primary-focus", "secondary-focus"],
  "equipment": ["equipment-needed"],
  "tags": ["relevant-tags"],
  "confidence": confidence-score-between-0-and-1,
  "generatedAt": "ISO-date-string",
  "metadata": {
    "userProfile": {
      "fitnessLevel": "{{experienceLevel}}",
      "goals": ["{{primaryGoal}}"]
    }
  }
}`,
    variables: [
      { name: 'experienceLevel', required: true },
      { name: 'primaryGoal', required: true },
      { name: 'age', required: true },
      { name: 'height', required: false },
      { name: 'weight', required: false },
      { name: 'gender', required: false },
      { name: 'physicalActivity', required: true },
      { name: 'preferredDuration', required: true },
      { name: 'timeCommitment', required: true },
      { name: 'intensityLevel', required: true },
      { name: 'preferredActivities', required: false },
      { name: 'availableLocations', required: true },
      { name: 'availableEquipment', required: true },
      { name: 'goalTimeline', required: false },
      { name: 'hasCardiovascularConditions', required: true },
      { name: 'injuries', required: true },
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
Focus Area: {{focus}}
Duration: {{duration}} minutes
Energy Level: {{energyLevel}}/10
Available Equipment: {{availableEquipment}}
Injuries: {{injuries}}

Return the workout plan as a JSON object with the same structure as the default template.`,
    variables: [
      { name: 'experienceLevel', required: true },
      { name: 'primaryGoal', required: true },
      { name: 'focus', required: true },
      { name: 'duration', required: true },
      { name: 'energyLevel', required: true },
      { name: 'availableEquipment', required: true },
      { name: 'injuries', required: true }
    ]
  }
}; 