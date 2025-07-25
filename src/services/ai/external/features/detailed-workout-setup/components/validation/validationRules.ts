// Required fields for validation
export const REQUIRED_FIELDS = ['energy', 'soreness'] as const;

// Validation rules
export const VALIDATION_RULES = {
  energy: {
    required: true,
    min: 1,
    max: 10,
    message: 'Energy level is required and must be between 1 and 10'
  },
  soreness: {
    required: true,
    message: 'Soreness assessment is required'
  },
  sleep: {
    required: false,
    min: 0,
    max: 24,
    message: 'Sleep duration must be between 0 and 24 hours'
  },
  stress: {
    required: false,
    message: 'Invalid stress level format'
  },
  trainingLoad: {
    required: false,
    message: 'Invalid training load format'
  }
} as const; 