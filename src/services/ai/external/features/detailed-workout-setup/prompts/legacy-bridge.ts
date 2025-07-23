import { 
  selectDetailedWorkoutPrompt,
  DETAILED_WORKOUT_PROMPT_TEMPLATE,
  RECOVERY_WORKOUT_PROMPT_TEMPLATE,
  BEGINNER_WORKOUT_PROMPT_TEMPLATE
} from '../../../prompts/detailed-workout-generation.prompts';

import { DetailedWorkoutParams } from '../types/detailed-workout.types';
import { PromptTemplate } from '../../../types/external-ai.types';

export class LegacyPromptBridge {
  static getPromptTemplate(params: DetailedWorkoutParams): PromptTemplate {
    // Bridge to existing legacy prompts until full implementation
    return selectDetailedWorkoutPrompt(
      params.fitnessLevel,
      params.duration,
      params.sorenessAreas,
      params.focus
    );
  }

  static getLegacyPromptByType(type: string): PromptTemplate {
    switch (type) {
      case 'recovery':
        return RECOVERY_WORKOUT_PROMPT_TEMPLATE;
      case 'beginner':
        return BEGINNER_WORKOUT_PROMPT_TEMPLATE;
      default:
        return DETAILED_WORKOUT_PROMPT_TEMPLATE;
    }
  }
} 