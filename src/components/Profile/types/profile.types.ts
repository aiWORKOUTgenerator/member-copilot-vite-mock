// Temporary types definition - TODO: Re-export from schema once import issues are resolved
export type ProfileData = {
  // Experience & Activity
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'very';
  
  // Time & Commitment
  preferredDuration: '15-30 min' | '30-45 min' | '45-60 min' | '60+ min';
  timeCommitment: '2-3' | '3-4' | '4-5' | '6-7';
  intensityLevel: 'low' | 'moderate' | 'high';
  
  // Exercise Preferences
  preferredActivities: Array<'Walking/Power Walking' | 'Running/Jogging' | 'Swimming' | 'Cycling/Mountain Biking' |
    'Rock Climbing/Bouldering' | 'Yoga' | 'Pilates' | 'Hiking' | 'Dancing' |
    'Team Sports' | 'Golf' | 'Martial Arts'>;
  availableEquipment: Array<'Gym Membership' | 'Home Gym' | 'Dumbbells or Free Weights' |
    'Resistance Bands' | 'Treadmill or Cardio Machines' | 'Yoga Mat' |
    'Body Weight' | 'Kettlebells' | 'Access to Parks/Outdoor Spaces' |
    'Swimming Pool' | 'Mountain Bike' | 'Road Bike (Cycling)'>;
  
  // Goals & Timeline
  primaryGoal: 'Weight Loss' | 'Strength' | 'Cardio Health' | 'Flexibility & Mobility' |
    'General Health' | 'Muscle Gain' | 'Athletic Performance' | 'Energy Levels' |
    'Body Toning' | 'Sleep Quality' | 'Stress Reduction' | 'Functional Fitness';
  goalTimeline: '1 month' | '3 months' | '6 months' | '1 year+';
  
  // Personal Information
  age: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  height: string;
  weight: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Health & Safety
  hasCardiovascularConditions: 'No' | 'Yes - but cleared for exercise' | 'Yes - and need medical clearance' | 'Prefer not to answer';
  injuries: Array<'No Injuries' | 'Lower Back' | 'Knee' | 'Shoulder' | 'Neck' |
    'Ankle' | 'Wrist or Elbow' | 'Hip' | 'Foot or Arch'>;
};

export type StepValidationErrors = Record<string, string[]>;

// Validation result interface
export interface ValidationResult {
  success: boolean;
  errors: StepValidationErrors;
  data?: unknown;
}

export interface StepProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string | string[]) => void;
  onArrayToggle: (field: keyof ProfileData, value: string) => void;
  getFieldError?: (field: keyof ProfileData) => string | undefined;
  validateField?: (field: keyof ProfileData, value: unknown) => boolean;
}

export interface ProfilePageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
}

export interface StepConfig {
  component: React.LazyExoticComponent<React.ComponentType<StepProps>>;
  title: string;
  description: string;
  validation?: {
    required: boolean;
    dependencies?: (keyof ProfileData)[];
  };
}

export interface ProfileFormHookReturn {
  profileData: ProfileData;
  handleInputChange: (field: keyof ProfileData, value: string | string[]) => void;
  handleArrayToggle: (field: keyof ProfileData, value: string) => void;
  resetForm: () => void;
  isComplete: boolean;
  getCompletionPercentage: () => number;
  currentStep: number;
  touchedFields: string[];
  stepCompletion: Record<number, { progress: number; isComplete: boolean }>;
  getFieldError: (field: keyof ProfileData) => string | undefined;
  canProceedToNextStep: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  isProfileComplete: () => boolean;
  getTotalProgress: () => number;
  isLoading: boolean;
  error: Error | null;
  hasUnsavedChanges: boolean;
  lastSaved: number;
  restoreFromBackup: () => boolean;
}

export interface ValidationHookReturn {
  // Core validation state
  errors: StepValidationErrors;
  touchedFields: string[];
  
  // Core validation methods
  validateCurrentStep: (step: number, data: Partial<ProfileData>) => boolean;
  validateField: (field: keyof ProfileData, value: unknown) => boolean;
  validateComplete: (data: ProfileData) => boolean;
  
  // Error management
  clearFieldError: (field: keyof ProfileData) => void;
  clearAllErrors: () => void;
  getFieldError: (field: keyof ProfileData) => string | undefined;
  getFieldErrors: (field: keyof ProfileData) => string[];
  
  // Validation state queries
  hasErrors: () => boolean;
  isFieldValid: (field: keyof ProfileData) => boolean;
  getErrorCount: () => number;
  getErrorsByStep: (step: number) => StepValidationErrors;
  hasErrorsInStep: (step: number) => boolean;
  
  // Touch state management
  markFieldAsTouched: (field: keyof ProfileData) => void;
  markFieldAsUntouched: (field: keyof ProfileData) => void;
  isFieldTouched: (field: keyof ProfileData) => boolean;
  
  // Step validation helpers
  validateStepComplete: (step: number, data: Partial<ProfileData>) => boolean;
}

// Utility types for component props
export type ProfileFieldKey = keyof ProfileData;
export type ProfileFieldValue<K extends ProfileFieldKey> = ProfileData[K];

// Event handler types
export type FieldChangeHandler = (field: ProfileFieldKey, value: string | string[]) => void;
export type ArrayToggleHandler = (field: ProfileFieldKey, value: string) => void;
export type StepChangeHandler = (step: number) => void;

// Form state types
export interface FormState {
  currentStep: number;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt?: Date;
}

// Analytics event types (for future implementation)
export interface AnalyticsEvents {
  'profile_step_started': { step: number; title: string };
  'profile_step_completed': { step: number; duration: number };
  'profile_field_changed': { field: string; step: number };
  'profile_validation_error': { field: string; error: string; step: number };
  'profile_completed': { totalTime: number; completionRate: number };
  'profile_abandoned': { step: number; reason?: string };
} 