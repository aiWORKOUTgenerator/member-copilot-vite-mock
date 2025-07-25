import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout } from '../../../types/external-ai.types';

/**
 * Strategy for handling responses that are already objects
 */
export class DirectJSONStrategy implements ParseStrategy {
  canHandle(response: unknown): boolean {
    return typeof response === 'object' && 
           response !== null && 
           !Array.isArray(response);
  }

  async parse(response: unknown): Promise<GeneratedWorkout> {
    console.log('🔍 DirectJSONStrategy: Processing object response');
    
    // Validate basic workout structure
    const workout = response as any;
    
    if (!workout.id || !workout.title) {
      throw new Error('Missing required fields: id or title');
    }

    if (!workout.warmup || !workout.mainWorkout || !workout.cooldown) {
      throw new Error('Missing required workout phases');
    }

    // Validate exercise arrays
    if (!Array.isArray(workout.warmup.exercises) || 
        !Array.isArray(workout.mainWorkout.exercises) || 
        !Array.isArray(workout.cooldown.exercises)) {
      throw new Error('Invalid exercise arrays in workout phases');
    }

    // Add default values for optional fields if missing
    return {
      ...workout,
      description: workout.description || 'AI-generated workout',
      estimatedCalories: workout.estimatedCalories || 200,
      difficulty: workout.difficulty || 'some experience',
      equipment: Array.isArray(workout.equipment) ? workout.equipment : [],
      reasoning: workout.reasoning || 'Generated based on user preferences',
      personalizedNotes: Array.isArray(workout.personalizedNotes) ? workout.personalizedNotes : [],
      progressionTips: Array.isArray(workout.progressionTips) ? workout.progressionTips : [],
      safetyReminders: Array.isArray(workout.safetyReminders) ? workout.safetyReminders : [],
      generatedAt: workout.generatedAt || new Date(),
      aiModel: workout.aiModel || 'gpt-4o',
      confidence: workout.confidence || 0.8,
      tags: Array.isArray(workout.tags) ? workout.tags : []
    };
  }

  getPriority(): number {
    return 100; // Highest priority - direct object is most efficient
  }
} 