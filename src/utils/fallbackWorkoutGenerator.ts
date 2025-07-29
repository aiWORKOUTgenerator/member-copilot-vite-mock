import { UserProfile } from '../types/user';
import { PerWorkoutOptions } from '../types/core';
import { GeneratedWorkout, Exercise } from '../types/workout-generation.types';

/**
 * Generate a basic workout when AI service is unavailable
 */
export const generateFallbackWorkout = (userProfile: UserProfile, workoutOptions: PerWorkoutOptions): GeneratedWorkout => {
  console.log('🔄 Generating fallback workout due to AI service unavailability');
  
  const focusArea = workoutOptions.customization_focus || 'strength';
  const energyLevel = workoutOptions.customization_energy || 3;
  const duration = workoutOptions.customization_duration || 45;
  
  // Create a basic workout structure based on user's fitness level
  const exercises: Exercise[] = [];
  
  // Add exercises based on fitness level and focus
  if (userProfile.fitnessLevel === 'beginner' || userProfile.fitnessLevel === 'novice') {
    exercises.push(
      {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 12,
        duration: 60,
        equipment: ['body_weight'],
        instructions: ['Stand with feet shoulder-width apart', 'Lower into squat position', 'Return to standing'],
        tips: ['Keep chest up', 'Knees in line with toes'],
        intensity: 'low',
        restBetweenSets: 90
      },
      {
        name: 'Modified Push-ups',
        sets: 3,
        reps: 8,
        duration: 45,
        equipment: ['body_weight'],
        instructions: ['Start on knees in plank position', 'Lower chest to ground', 'Push back up'],
        tips: ['Keep core tight', 'Elbows at 45 degrees'],
        intensity: 'low',
        restBetweenSets: 90
      },
      {
        name: 'Plank Hold',
        sets: 3,
        reps: 1,
        duration: 30,
        equipment: ['body_weight'],
        instructions: ['Hold plank position', 'Keep body straight'],
        tips: ['Engage core', 'Look slightly forward'],
        intensity: 'moderate',
        restBetweenSets: 60
      }
    );
  } else if (userProfile.fitnessLevel === 'intermediate') {
    exercises.push(
      {
        name: 'Jump Squats',
        sets: 4,
        reps: 15,
        duration: 60,
        equipment: ['body_weight'],
        instructions: ['Squat down', 'Explode up into jump', 'Land softly'],
        tips: ['Land quietly', 'Use arms for momentum'],
        intensity: 'high',
        restBetweenSets: 60
      },
      {
        name: 'Push-ups',
        sets: 4,
        reps: 12,
        duration: 45,
        equipment: ['body_weight'],
        instructions: ['Start in plank', 'Lower chest to ground', 'Push back up'],
        tips: ['Keep body straight', 'Full range of motion'],
        intensity: 'moderate',
        restBetweenSets: 60
      },
      {
        name: 'Mountain Climbers',
        sets: 3,
        reps: 20,
        duration: 45,
        equipment: ['body_weight'],
        instructions: ['Start in plank', 'Drive knees to chest', 'Alternate legs'],
        tips: ['Keep hips low', 'Move quickly'],
        intensity: 'high',
        restBetweenSets: 45
      }
    );
  } else {
    exercises.push(
      {
        name: 'Burpees',
        sets: 5,
        reps: 15,
        duration: 60,
        equipment: ['body_weight'],
        instructions: ['Drop to plank', 'Perform push-up', 'Jump up explosively'],
        tips: ['Move quickly', 'Full extension at top'],
        intensity: 'high',
        restBetweenSets: 45
      },
      {
        name: 'Plyometric Push-ups',
        sets: 4,
        reps: 10,
        duration: 45,
        equipment: ['body_weight'],
        instructions: ['Lower into push-up', 'Push explosively', 'Hands leave ground'],
        tips: ['Land softly', 'Maintain form'],
        intensity: 'high',
        restBetweenSets: 60
      },
      {
        name: 'Plank to Down Dog',
        sets: 3,
        reps: 15,
        duration: 45,
        equipment: ['body_weight'],
        instructions: ['Hold plank', 'Pike hips up', 'Return to plank'],
        tips: ['Keep core tight', 'Full extension'],
        intensity: 'moderate',
        restBetweenSets: 30
      }
    );
  }

  return {
    id: `fallback-${Date.now()}`,
    title: `Basic ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} Workout`,
    description: 'A simple, effective workout using bodyweight exercises.',
    totalDuration: duration * 60, // Convert to seconds
    estimatedCalories: Math.round(duration * 7 * (energyLevel / 3)), // Rough estimate
    difficulty: userProfile.fitnessLevel,
    equipment: ['body_weight'],
    warmup: {
      name: 'Warm-up',
      duration: 300, // 5 minutes
      exercises: [
        {
          name: 'Light Jogging in Place',
          sets: 1,
          reps: 1,
          duration: 120,
          equipment: ['body_weight'],
          instructions: ['Jog lightly in place', 'Keep feet light'],
          tips: ['Stay relaxed', 'Breathe steadily'],
          intensity: 'low',
          restBetweenSets: 0
        },
        {
          name: 'Arm Circles',
          sets: 1,
          reps: 20,
          duration: 60,
          equipment: ['body_weight'],
          instructions: ['Circle arms forward', 'Circle arms backward'],
          tips: ['Full circles', 'Keep shoulders relaxed'],
          intensity: 'low',
          restBetweenSets: 0
        }
      ],
      instructions: 'Perform each exercise to warm up the body',
      tips: ['Move slowly', 'Focus on form']
    },
    mainWorkout: {
      name: 'Main Workout',
      duration: (duration - 10) * 60, // Subtract warm-up and cooldown time
      exercises,
      instructions: 'Complete all sets of each exercise before moving to the next',
      tips: ['Rest as needed', 'Stay hydrated']
    },
    cooldown: {
      name: 'Cool-down',
      duration: 300, // 5 minutes
      exercises: [
        {
          name: 'Walking in Place',
          sets: 1,
          reps: 1,
          duration: 120,
          equipment: ['body_weight'],
          instructions: ['Walk in place', 'Gradually slow pace'],
          tips: ['Deep breaths', 'Relax muscles'],
          intensity: 'low',
          restBetweenSets: 0
        },
        {
          name: 'Light Stretching',
          sets: 1,
          reps: 1,
          duration: 180,
          equipment: ['body_weight'],
          instructions: ['Stretch major muscle groups', 'Hold each stretch'],
          tips: ['No bouncing', 'Breathe deeply'],
          intensity: 'low',
          restBetweenSets: 0
        }
      ],
      instructions: 'Cool down with light movement and stretching',
      tips: ['Hold stretches 15-30 seconds', 'Breathe deeply']
    },
    reasoning: 'This workout is designed to be safe and effective when the AI service is unavailable.',
    personalizedNotes: [
      'This is a fallback workout designed to be safe for your fitness level.',
      'Focus on proper form and breathing throughout the exercises.',
      'If any exercise feels too challenging, reduce the number of repetitions.'
    ],
    progressionTips: [
      'Increase repetitions when exercises become easier',
      'Reduce rest periods as fitness improves',
      'Add complexity to exercises when comfortable'
    ],
    safetyReminders: [
      'Stop if you feel any sharp pain',
      'Stay hydrated throughout the workout',
      'Take extra rest if needed'
    ],
    generatedAt: new Date(),
    aiModel: 'fallback',
    confidence: 0.7,
    tags: ['fallback', 'bodyweight', focusArea, userProfile.fitnessLevel]
  };
};