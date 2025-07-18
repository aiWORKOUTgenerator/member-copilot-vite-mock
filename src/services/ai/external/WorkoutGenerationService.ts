import { WorkoutGenerationRequest } from '../../../types/workout-results.types';
import { GeneratedWorkout } from './types/external-ai.types';
import { QUICK_WORKOUT_PROMPT_TEMPLATE } from './prompts/quick-workout-generation.prompts';
import { DETAILED_WORKOUT_PROMPT_TEMPLATE, selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { OpenAIService } from './OpenAIService';

export class WorkoutGenerationService {
  private openAIService: OpenAIService;

  constructor(openAIService: OpenAIService) {
    this.openAIService = openAIService;
  }

  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    const { workoutType, profileData, workoutFocusData, userProfile } = request;

    // Select the appropriate prompt template based on workout type
    const promptTemplate = workoutType === 'quick' 
      ? QUICK_WORKOUT_PROMPT_TEMPLATE
      : selectDetailedWorkoutPrompt(
          userProfile.fitnessLevel,
          workoutFocusData.customization_duration || 30,
          Object.keys(workoutFocusData.customization_soreness || {}),
          workoutFocusData.customization_focus || ''
        );

    // Prepare the prompt variables
    const promptVariables = workoutType === 'quick' 
      ? {
          experienceLevel: userProfile.fitnessLevel,
          primaryGoal: userProfile.goals[0],
          availableEquipment: workoutFocusData.customization_equipment || [],
          energyLevel: workoutFocusData.customization_energy || 5,
          sorenessAreas: Object.keys(workoutFocusData.customization_soreness || {}),
          duration: workoutFocusData.customization_duration || 30,
          focus: workoutFocusData.customization_focus || 'general'
        }
      : {
          // Detailed workout variables
          experienceLevel: profileData.experienceLevel,
          physicalActivity: profileData.physicalActivity,
          preferredDuration: profileData.preferredDuration,
          timeCommitment: profileData.timeCommitment,
          intensityLevel: profileData.intensityLevel,
          preferredActivities: profileData.preferredActivities,
          availableEquipment: profileData.availableEquipment,
          primaryGoal: profileData.primaryGoal,
          goalTimeline: profileData.goalTimeline,
          age: profileData.age,
          height: profileData.height,
          weight: profileData.weight,
          gender: profileData.gender,
          hasCardiovascularConditions: profileData.hasCardiovascularConditions,
          injuries: profileData.injuries,
          energyLevel: workoutFocusData.customization_energy,
          sorenessAreas: Object.keys(workoutFocusData.customization_soreness || {}),
          duration: workoutFocusData.customization_duration,
          focus: workoutFocusData.customization_focus,
          equipment: workoutFocusData.customization_equipment
        };

    // Generate the workout using OpenAI
    const generatedWorkout = await this.openAIService.generateWorkoutPlan(
      promptTemplate,
      promptVariables
    );

    return generatedWorkout;
  }
} 