// Required fields for validation
export const REQUIRED_FIELDS = ['energy', 'soreness'] as const;

// Exercise selection required fields
export const EXERCISE_SELECTION_REQUIRED_FIELDS = ['focus', 'equipment'] as const;

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
  },
  // Exercise selection validation rules
  include: {
    required: false,
    message: 'Include exercises must be an array of exercise IDs'
  },
  exclude: {
    required: false,
    message: 'Exclude exercises must be an array of exercise IDs'
  },
  focus: {
    required: true,
    message: 'Workout focus is required'
  },
  equipment: {
    required: true,
    message: 'At least one equipment option is required'
  },
  duration: {
    required: false,
    min: 5,
    max: 180,
    message: 'Duration must be between 5 and 180 minutes'
  }
} as const; 