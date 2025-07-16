import { z } from 'zod';

// Base schema for the profile data with comprehensive validation
export const profileSchema = z.object({
  // Experience & Activity
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Please select your experience level'),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'very', 'extremely', 'varies']).describe('Please select your current activity level'),
  
  // Time & Commitment
  preferredDuration: z.enum(['15-30 min', '30-45 min', '45-60 min', '60+ min']).describe('Please select your preferred workout duration'),
  timeCommitment: z.enum(['2-3', '3-4', '4-5', '6-7']).describe('Please select your time commitment'),
  intensityLevel: z.enum(['lightly', 'light-moderate', 'moderately', 'active', 'very', 'extremely']).describe('Please select your target intensity level'),
  
  // Exercise Preferences
  preferredActivities: z.array(z.enum([
    'Walking/Power Walking', 'Running/Jogging', 'Swimming', 'Cycling/Mountain Biking',
    'Rock Climbing/Bouldering', 'Yoga', 'Pilates', 'Hiking', 'Dancing',
    'Team Sports', 'Golf', 'Martial Arts'
  ])).min(1, 'Please select at least one preferred activity'),
  availableEquipment: z.array(z.enum([
    'Gym Membership', 'Home Gym', 'Dumbbells or Free Weights',
    'Resistance Bands', 'Treadmill or Cardio Machines', 'Yoga Mat',
    'Body Weight', 'Kettlebells', 'Access to Parks/Outdoor Spaces',
    'Swimming Pool', 'Mountain Bike', 'Road Bike (Cycling)'
  ])).min(1, 'Please select your available equipment'),
  
  // Goals
  primaryGoal: z.enum([
    'Weight Loss', 'Strength', 'Cardio Health', 'Flexibility & Mobility',
    'General Health', 'Muscle Gain', 'Athletic Performance', 'Energy Levels',
    'Body Toning', 'Sleep Quality', 'Stress Reduction', 'Functional Fitness'
  ]).describe('Please select your primary goal'),
  goalTimeline: z.enum(['1 month', '3 months', '6 months', '1 year+']).describe('Please select your goal timeline'),
  
  // Personal Info
  age: z.enum(['18-25', '26-35', '36-45', '46-55', '56-65', '65+']).describe('Please select your age range'),
  height: z.string().min(1, 'Please enter your height'),
  weight: z.string().min(1, 'Please enter your weight'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).describe('Please select your gender'),
  
  // Health & Safety
  hasCardiovascularConditions: z.enum([
    'No', 
    'Yes - cleared for exercise', 
    'Yes - need medical clearance', 
    'Prefer not to answer'
  ]).describe('Please answer the cardiovascular health question'),
  injuries: z.array(z.enum([
    'No Injuries', 'Lower Back', 'Knee', 'Shoulder', 'Neck',
    'Ankle', 'Wrist or Elbow', 'Hip', 'Foot or Arch'
  ])).min(1, 'Please indicate any current injuries or select "No Injuries"')
});

// Step-specific validation schemas for progressive validation
export const stepSchemas = {
  1: profileSchema.pick({
    experienceLevel: true,
    physicalActivity: true
  }),
  2: profileSchema.pick({
    preferredDuration: true,
    timeCommitment: true,
    intensityLevel: true
  }),
  3: profileSchema.pick({
    preferredActivities: true,
    availableEquipment: true
  }),
  4: profileSchema.pick({
    primaryGoal: true,
    goalTimeline: true
  }),
  5: profileSchema.pick({
    age: true,
    height: true,
    weight: true,
    gender: true,
    hasCardiovascularConditions: true,
    injuries: true
  })
};

// Legacy step schemas for backward compatibility
export const profileStepSchemas = {
  step1: stepSchemas[1],
  step2: stepSchemas[2],
  step3: stepSchemas[3],
  step4: stepSchemas[4],
  step5: stepSchemas[5]
};

// Generate TypeScript types from schema
export type ProfileData = z.infer<typeof profileSchema>;
export type StepValidationErrors = Record<string, string[]>;

// Legacy types for backward compatibility
export type ProfileStep1Data = z.infer<typeof stepSchemas[1]>;
export type ProfileStep2Data = z.infer<typeof stepSchemas[2]>;
export type ProfileStep3Data = z.infer<typeof stepSchemas[3]>;
export type ProfileStep4Data = z.infer<typeof stepSchemas[4]>;
export type ProfileStep5Data = z.infer<typeof stepSchemas[5]>;

// Validation result interface
export interface ValidationResult {
  success: boolean;
  errors: StepValidationErrors;
  data?: unknown;
}

// Helper function to convert Zod error to our error format
const formatZodError = (error: z.ZodError): StepValidationErrors => {
  const errors: StepValidationErrors = {};
  
  if (error.issues) {
    error.issues.forEach((issue: z.ZodIssue) => {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });
  }
  
  return errors;
};

// Enhanced step validation function
export const validateStep = (step: number | keyof typeof profileStepSchemas, data: Partial<ProfileData>): ValidationResult => {
  // Handle both new numeric and legacy string step identifiers
  let schema;
  if (typeof step === 'number') {
    schema = stepSchemas[step as keyof typeof stepSchemas];
  } else {
    schema = profileStepSchemas[step];
  }
  
  if (!schema) {
    return { success: true, errors: {} };
  }

  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }

  return { 
    success: false, 
    errors: formatZodError(result.error) 
  };
};

// Full profile validation function
export const validateFullProfile = (data: ProfileData): ValidationResult => {
  const result = profileSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }

  return { 
    success: false, 
    errors: formatZodError(result.error) 
  };
};

// Field-specific validation function
export const validateField = (field: keyof ProfileData, value: unknown): ValidationResult => {
  // Create a minimal schema for just this field
  const fieldSchema = profileSchema.pick({ [field]: true });
  const testData = { [field]: value } as Partial<ProfileData>;
  
  const result = fieldSchema.safeParse(testData);
  
  if (result.success) {
    return { success: true, errors: {} };
  }

  return { 
    success: false, 
    errors: formatZodError(result.error) 
  };
};

// Get step number for a given field (useful for error handling)
export const getStepForField = (field: keyof ProfileData): number => {
  const stepFieldMap: Record<keyof ProfileData, number> = {
    experienceLevel: 1,
    physicalActivity: 1,
    preferredDuration: 2,
    timeCommitment: 2,
    intensityLevel: 2,
    preferredActivities: 3,
    availableEquipment: 3,
    primaryGoal: 4,
    goalTimeline: 4,
    age: 5,
    height: 5,
    weight: 5,
    gender: 5,
    hasCardiovascularConditions: 5,
    injuries: 5
  };
  
  return stepFieldMap[field] || 1;
};

// Helper to check if a step is complete
export const isStepComplete = (step: number, data: Partial<ProfileData>): boolean => {
  const result = validateStep(step, data);
  return result.success;
};

// Helper to get completion percentage
export const getCompletionPercentage = (data: Partial<ProfileData>): number => {
  const totalSteps = Object.keys(stepSchemas).length;
  let completedSteps = 0;
  
  for (let step = 1; step <= totalSteps; step++) {
    if (isStepComplete(step, data)) {
      completedSteps++;
    }
  }
  
  return Math.round((completedSteps / totalSteps) * 100);
};

// Helper to get the first incomplete step
export const getFirstIncompleteStep = (data: Partial<ProfileData>): number => {
  const totalSteps = Object.keys(stepSchemas).length;
  
  for (let step = 1; step <= totalSteps; step++) {
    if (!isStepComplete(step, data)) {
      return step;
    }
  }
  
  return totalSteps; // All steps complete
};

// Default values with proper typing
export const defaultProfileData: ProfileData = {
  experienceLevel: 'Beginner',
  physicalActivity: 'sedentary',
  preferredDuration: '30-45 min',
  timeCommitment: '2-3',
  intensityLevel: 'lightly',
  preferredActivities: [],
  availableEquipment: [],
  primaryGoal: 'General Health',
  goalTimeline: '3 months',
  age: '26-35',
  height: '',
  weight: '',
  gender: 'prefer-not-to-say',
  hasCardiovascularConditions: 'No',
  injuries: ['No Injuries']
}; 