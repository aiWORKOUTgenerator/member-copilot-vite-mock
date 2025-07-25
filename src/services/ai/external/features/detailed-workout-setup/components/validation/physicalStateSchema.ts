import { z } from 'zod';

// Validation schema for physical state
export const physicalStateSchema = z.object({
  energy: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  soreness: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  injury: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  sleep: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  stress: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  trainingLoad: z.object({
    recentActivities: z.array(z.object({
      type: z.string(),
      intensity: z.enum(['light', 'moderate', 'intense']),
      duration: z.number(),
      date: z.string()
    })),
    weeklyVolume: z.number(),
    averageIntensity: z.enum(['light', 'moderate', 'intense'])
  }).optional(),
  areas: z.array(z.string()).optional(),
  restPeriods: z.enum(['short', 'moderate', 'long']).optional()
});

export type PhysicalStateData = z.infer<typeof physicalStateSchema>; 