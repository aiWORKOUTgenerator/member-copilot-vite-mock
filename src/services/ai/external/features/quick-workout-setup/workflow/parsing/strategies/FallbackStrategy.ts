import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout, Exercise, WorkoutPhase } from '../../../../../types/external-ai.types';

/**
 * Strategy for handling cases where other strategies fail
 */
export class FallbackStrategy implements ParseStrategy {
  canHandle(response: unknown): boolean {
    return true; // Always can handle as last resort
  }

  async parse(response: unknown): Promise<GeneratedWorkout> {
    console.log('🚨 FallbackStrategy: Creating fallback workout structure');
    
    // Try to extract meaningful information from text if it's a string
    const exercises = typeof response === 'string' 
      ? this.extractExercisesFromText(response)
      : [];

    // Create workout phases
    const warmup = this.createPhase('Warm-up', 300, exercises.slice(0, 2));
    const mainWorkout = this.createPhase('Main Workout', 1200, exercises.slice(2, -2));
    const cooldown = this.createPhase('Cool-down', 300, exercises.slice(-2));

    return {
      id: `fallback_${Date.now()}`,
      title: 'AI Generated Workout',
      description: typeof response === 'string' 
        ? response.substring(0, 200) + (response.length > 200 ? '...' : '')
        : 'Workout generated with fallback structure',
      totalDuration: 1800, // 30 minutes default
      estimatedCalories: 200,
      difficulty: 'some experience',
      equipment: [],
      warmup,
      mainWorkout,
      cooldown,
      reasoning: 'Fallback workout created due to response parsing issues',
      personalizedNotes: ['This workout was generated using fallback structure'],
      progressionTips: [],
      safetyReminders: ['Please ensure proper form throughout the workout'],
      generatedAt: new Date(),
      aiModel: 'fallback',
      confidence: 0.5,
      tags: ['fallback']
    };
  }

  private extractExercisesFromText(text: string): Exercise[] {
    const exercises: Exercise[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Look for exercise patterns in the text
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      // Look for lines that might be exercises (contain numbers, common exercise keywords)
      if (trimmedLine.match(/\d+/) && 
          (trimmedLine.toLowerCase().includes('push') || 
           trimmedLine.toLowerCase().includes('squat') || 
           trimmedLine.toLowerCase().includes('jump') || 
           trimmedLine.toLowerCase().includes('plank') || 
           trimmedLine.toLowerCase().includes('lunge') ||
           trimmedLine.toLowerCase().includes('crunch') ||
           trimmedLine.toLowerCase().includes('burpee'))) {
        exercises.push(this.createExercise(trimmedLine, index));
      }
    });

    return exercises;
  }

  private createPhase(name: string, duration: number, exercises: Exercise[]): WorkoutPhase {
    // If no exercises were extracted, create a default one
    if (exercises.length === 0) {
      exercises = [this.createExercise(`${name} Exercise`, 0)];
    }

    // Distribute duration among exercises
    const exerciseDuration = Math.floor(duration / exercises.length);
    exercises = exercises.map(ex => ({
      ...ex,
      duration: exerciseDuration
    }));

    return {
      name,
      duration,
      exercises,
      instructions: `Complete ${name.toLowerCase()} phase`,
      tips: []
    };
  }

  private createExercise(name: string, index: number): Exercise {
    return {
      id: `exercise_${index + 1}`,
      name,
      description: `Perform ${name.toLowerCase()}`,
      duration: 60, // Default duration, will be adjusted in createPhase
      form: `Perform ${name.toLowerCase()} with proper form`,
      modifications: [],
      commonMistakes: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      movementType: 'strength',
      personalizedNotes: [],
      difficultyAdjustments: []
    };
  }

  getPriority(): number {
    return 1; // Lowest priority
  }
} 