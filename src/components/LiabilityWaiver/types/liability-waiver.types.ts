// Import the Zod-inferred type from the schema
import type { LiabilityWaiverData } from '../schemas/waiverSchema';
export { LiabilityWaiverData };

export type StepValidationErrors = Record<string, string[]>;

export interface ValidationResult {
  success: boolean;
  errors: StepValidationErrors;
  data?: any;
}

export interface StepProps {
  waiverData: LiabilityWaiverData;
  onInputChange: (field: keyof LiabilityWaiverData, value: string | boolean) => void;
  getFieldError?: (field: keyof LiabilityWaiverData) => string | undefined;
  validateField?: (field: keyof LiabilityWaiverData, value: any) => boolean;
}

export interface LiabilityWaiverPageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
}

export interface StepConfig {
  component: React.LazyExoticComponent<React.ComponentType<StepProps>>;
  title: string;
  description: string;
  validation?: {
    required: boolean;
    dependencies?: (keyof LiabilityWaiverData)[];
  };
}

export interface WaiverFormHookReturn {
  waiverData: LiabilityWaiverData;
  handleInputChange: (field: keyof LiabilityWaiverData, value: string | boolean) => void;
  resetForm: () => void;
  isComplete: boolean;
  getCompletionPercentage: () => number;
  currentSection: number;
  touchedFields: string[];
  sectionCompletion: Record<number, { progress: number; isComplete: boolean }>;
  getFieldError: (field: keyof LiabilityWaiverData) => string | undefined;
  canProceedToNextSection: () => boolean;
  nextSection: () => void;
  prevSection: () => void;
  setSection: (section: number) => void;
  isWaiverComplete: () => boolean;
  getTotalProgress: () => number;
  // Enhanced features matching profile pattern
  isLoading: boolean;
  error: Error | null;
  hasUnsavedChanges: boolean;
  lastSaved: number;
  forceSave: () => void;
}

export interface ValidationHookReturn {
  // Core validation state
  errors: StepValidationErrors;
  touchedFields: string[];
  
  // Core validation methods
  validateCurrentSection: (section: number, data: Partial<LiabilityWaiverData>) => boolean;
  validateField: (field: keyof LiabilityWaiverData, value: any, section?: number) => boolean;
  validateComplete: (data: LiabilityWaiverData) => boolean;
  
  // Error management
  clearFieldError: (field: keyof LiabilityWaiverData) => void;
  clearAllErrors: () => void;
  getFieldError: (field: keyof LiabilityWaiverData) => string | undefined;
  getFieldErrors: (field: keyof LiabilityWaiverData) => string[];
  
  // Validation state queries
  hasErrors: () => boolean;
  isFieldValid: (field: keyof LiabilityWaiverData) => boolean;
  getErrorCount: () => number;
  getErrorsBySection: (section: number) => StepValidationErrors;
  hasErrorsInSection: (section: number) => boolean;
  
  // Touch state management
  markFieldAsTouched: (field: keyof LiabilityWaiverData) => void;
  markFieldAsUntouched: (field: keyof LiabilityWaiverData) => void;
  isFieldTouched: (field: keyof LiabilityWaiverData) => boolean;
  
  // Step validation helpers
  validateSectionComplete: (section: number, data: Partial<LiabilityWaiverData>) => boolean;
}

// Utility types for component props
export type WaiverFieldKey = keyof LiabilityWaiverData;
export type WaiverFieldValue<K extends WaiverFieldKey> = LiabilityWaiverData[K];

// Event handler types
export type FieldChangeHandler = (field: WaiverFieldKey, value: string | boolean) => void;
export type StepChangeHandler = (step: number) => void;

// Form state types
export interface FormState {
  currentStep: number;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt?: Date;
}

// Step configuration
export interface StepInfo {
  step: number;
  title: string;
  description: string;
  color: string;
  icon: React.ComponentType;
}

// Analytics event types (for future implementation)
export interface AnalyticsEvents {
  'waiver_step_started': { step: number; title: string };
  'waiver_step_completed': { step: number; duration: number };
  'waiver_field_changed': { field: string; step: number };
  'waiver_validation_error': { field: string; error: string; step: number };
  'waiver_completed': { totalTime: number; completionRate: number };
  'waiver_abandoned': { step: number; reason?: string };
} 