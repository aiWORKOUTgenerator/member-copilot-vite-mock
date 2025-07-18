import { LucideIcon } from 'lucide-react';

export interface MuscleGroupTarget {
  name: string;
  description?: string;
}

export interface WorkoutFocusDetails {
  primaryMuscleGroups: MuscleGroupTarget[];
  emphasis: string;
}

export interface WorkoutFocusOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'new to exercise' | 'some experience';
  equipment: string[];
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  muscleGroups: string[];
  benefits: string[];
}

export const WORKOUT_FOCUS_MUSCLE_GROUPS: Record<string, WorkoutFocusDetails> = {
  'Energizing Boost': {
    primaryMuscleGroups: [
      {
        name: 'Full Body (Compound Movements)',
        description: 'Legs (quads, hamstrings, glutes), Chest, shoulders, and arms, Core and lower back'
      }
    ],
    emphasis: 'Dynamic movements that elevate heart rate and engage multiple muscle groups.'
  },
  'Improve Posture': {
    primaryMuscleGroups: [
      {
        name: 'Upper Back & Shoulders',
        description: 'Rhomboids, mid and lower trapezius (mid-back muscles), Posterior deltoids (rear shoulders)'
      },
      {
        name: 'Core',
        description: 'Deep core stabilizers (transverse abdominis)'
      }
    ],
    emphasis: 'Exercises to reverse rounded shoulders, strengthen back muscles, and support spinal alignment.'
  },
  'Stress Reduction': {
    primaryMuscleGroups: [
      {
        name: 'Full Body with Mindful Focus',
        description: 'Gentle engagement of legs, hips, and core, Neck, shoulders, and upper back relaxation'
      }
    ],
    emphasis: 'Movements paired with breathwork and gentle stretching for tension release and relaxation.'
  },
  'Quick Sweat': {
    primaryMuscleGroups: [
      {
        name: 'Lower Body & Large Muscle Groups',
        description: 'Legs (glutes, quads, hamstrings, calves), Back and chest (for higher calorie burn)'
      }
    ],
    emphasis: 'High-intensity intervals or circuits for maximum calorie burn in minimal time.'
  },
  'Gentle Recovery & Mobility': {
    primaryMuscleGroups: [
      {
        name: 'Full-Body Mobility',
        description: 'Hips, shoulders, spine (primary mobility areas), Gentle stretching of hamstrings, quads, calves, chest, and lower back'
      }
    ],
    emphasis: 'Gentle movements and stretching to enhance recovery, reduce soreness, and improve joint mobility.'
  },
  'Core & Abs Focus': {
    primaryMuscleGroups: [
      {
        name: 'Core Musculature',
        description: 'Rectus abdominis ("six-pack" muscles), Obliques (side abs), Transverse abdominis (deep stabilizers), Lower back (erector spinae)'
      }
    ],
    emphasis: 'Targeted movements to strengthen and tone core muscles, supporting posture and stability.'
  }
}; 