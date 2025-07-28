import { z } from 'zod';

// Base schema for the liability waiver data with comprehensive validation
export const waiverSchema = z.object({
  // Personal Information
  fullName: z.string().max(100, 'Full name must be less than 100 characters').optional(),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().max(100, 'Emergency contact name must be less than 100 characters').optional(),
  emergencyContactPhone: z.string().max(15, 'Phone number must be less than 15 digits').optional(),
  medicalConditions: z.string().max(500, 'Medical conditions description must be less than 500 characters').optional(),
  medications: z.string().max(500, 'Medications description must be less than 500 characters').optional(),
  physicianApproval: z.boolean().refine(val => val === true, 'Medical clearance acknowledgment is required'),
  
  // Risk Acknowledgment
  understandRisks: z.boolean().refine(val => val === true, 'You must acknowledge that you understand the risks'),
  assumeResponsibility: z.boolean().refine(val => val === true, 'You must assume responsibility for any risks'),
  followInstructions: z.boolean().refine(val => val === true, 'You must agree to follow all instructions'),
  reportInjuries: z.boolean().refine(val => val === true, 'You must agree to report injuries immediately'),
  
  // Release & Signature
  releaseFromLiability: z.boolean().refine(val => val === true, 'You must agree to the release of liability'),
  signature: z.string().min(2, 'Digital signature is required').max(100, 'Signature must be less than 100 characters'),
  signatureDate: z.string().min(1, 'Signature date is required')
});

// Step-specific validation schemas for progressive validation
export const stepSchemas = {
  1: waiverSchema.pick({
    fullName: true,
    dateOfBirth: true,
    emergencyContactName: true,
    emergencyContactPhone: true,
    medicalConditions: true,
    medications: true,
    physicianApproval: true
  }),
  2: waiverSchema.pick({
    understandRisks: true,
    assumeResponsibility: true,
    followInstructions: true,
    reportInjuries: true
  }),
  3: waiverSchema.pick({
    releaseFromLiability: true,
    signature: true,
    signatureDate: true
  })
};

// Generate TypeScript types from schema
export type LiabilityWaiverData = z.infer<typeof waiverSchema>;
export type StepValidationErrors = Record<string, string[]>;

// Step-specific types
export type Step1Data = z.infer<typeof stepSchemas[1]>;
export type Step2Data = z.infer<typeof stepSchemas[2]>;
export type Step3Data = z.infer<typeof stepSchemas[3]>;

// Validation result interface
export interface ValidationResult {
  success: boolean;
  errors: StepValidationErrors;
  data?: any;
}

// Helper function to convert Zod error to our error format
const formatZodError = (error: any): StepValidationErrors => {
  const errors: StepValidationErrors = {};
  
  if (error.issues) {
    error.issues.forEach((issue: any) => {
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
export const validateSection = (section: number, data: Partial<LiabilityWaiverData>): ValidationResult => {
  const schema = stepSchemas[section as keyof typeof stepSchemas];
  
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

// Full waiver validation function
export const validateFullWaiver = (data: LiabilityWaiverData): ValidationResult => {
  const result = waiverSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }

  return { 
    success: false, 
    errors: formatZodError(result.error) 
  };
};

// Field-specific validation function
export const validateField = (field: keyof LiabilityWaiverData, value: any): ValidationResult => {
  // Create a minimal schema for just this field using type assertion
  const fieldSchema = waiverSchema.pick({ [field]: true } as any);
  const testData = { [field]: value } as Partial<LiabilityWaiverData>;
  
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
export const getSectionForField = (field: keyof LiabilityWaiverData): number => {
  const stepFieldMap: Record<keyof LiabilityWaiverData, number> = {
    fullName: 1,
    dateOfBirth: 1,
    emergencyContactName: 1,
    emergencyContactPhone: 1,
    medicalConditions: 1,
    medications: 1,
    physicianApproval: 1,
    understandRisks: 2,
    assumeResponsibility: 2,
    followInstructions: 2,
    reportInjuries: 2,
    releaseFromLiability: 3,
    signature: 3,
    signatureDate: 3
  };
  
  return stepFieldMap[field] || 1;
};

// Helper to check if a step is complete
export const isSectionComplete = (section: number, data: Partial<LiabilityWaiverData>): boolean => {
  const result = validateSection(section, data);
  return result.success;
};

// Helper to get completion percentage
export const getCompletionPercentage = (data: Partial<LiabilityWaiverData>): number => {
  const totalSteps = Object.keys(stepSchemas).length;
  let completedSteps = 0;
  
  for (let step = 1; step <= totalSteps; step++) {
    if (isSectionComplete(step, data)) {
      completedSteps++;
    }
  }
  
  return Math.round((completedSteps / totalSteps) * 100);
};

// Helper to get the first incomplete step
export const getFirstIncompleteSection = (data: Partial<LiabilityWaiverData>): number => {
  const totalSteps = Object.keys(stepSchemas).length;
  
  for (let step = 1; step <= totalSteps; step++) {
    if (!isSectionComplete(step, data)) {
      return step;
    }
  }
  
  return totalSteps; // All steps complete
};

// Default values with proper typing
export const defaultWaiverData: LiabilityWaiverData = {
  fullName: '',
  dateOfBirth: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalConditions: '',
  medications: '',
  physicianApproval: false,
  understandRisks: false,
  assumeResponsibility: false,
  followInstructions: false,
  reportInjuries: false,
  releaseFromLiability: false,
  signature: '',
  signatureDate: new Date().toISOString().split('T')[0]
}; 