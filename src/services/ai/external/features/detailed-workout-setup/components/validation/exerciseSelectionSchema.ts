import { z } from 'zod';

// Validation schema for exercise selection
export const exerciseSelectionSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  focus: z.union([
    z.string(),
    z.object({
      focus: z.string(),
      label: z.string(),
      selected: z.boolean().optional(),
      metadata: z.object({
        intensity: z.enum(['low', 'moderate', 'high']),
        equipment: z.enum(['minimal', 'moderate', 'full-gym']),
        experience: z.enum(['new to exercise', 'some experience', 'advanced athlete']),
        duration_compatibility: z.array(z.number())
      })
    })
  ]).optional(),
  equipment: z.array(z.string()).optional(),
  duration: z.union([
    z.number(),
    z.object({
      duration: z.number(),
      warmupDuration: z.number(),
      mainDuration: z.number(),
      cooldownDuration: z.number(),
      selected: z.boolean().optional(),
      label: z.string().optional(),
      metadata: z.object({
        intensity: z.enum(['low', 'moderate', 'high']).optional(),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional()
      }).optional()
    })
  ]).optional()
});

export type ExerciseSelectionData = z.infer<typeof exerciseSelectionSchema>; 