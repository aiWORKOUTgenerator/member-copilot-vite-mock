// QuickWorkoutSetup Feature - Constants and Configuration
// Duration-specific workout constants and configurations

export interface DurationConfig {
  duration: number;
  name: string;
  description: string;
  exerciseCount: {
    warmup: number;
    main: number;
    cooldown: number;
    total: number;
  };
  timeAllocation: {
    warmupPercent: number;
    mainPercent: number;
    cooldownPercent: number;
  };
  complexity: 'minimal' | 'simple' | 'standard' | 'comprehensive' | 'advanced';
  variableRequirements: 'core' | 'standard' | 'enhanced' | 'full';
}

export const DURATION_CONFIGS: Record<string, DurationConfig> = {
  '5min': {
    duration: 5,
    name: 'Quick Break',
    description: 'Perfect for desk breaks',
    exerciseCount: {
      warmup: 1,
      main: 2,
      cooldown: 1,
      total: 4
    },
    timeAllocation: {
      warmupPercent: 20, // 1 minute
      mainPercent: 60,   // 3 minutes
      cooldownPercent: 20 // 1 minute
    },
    complexity: 'minimal',
    variableRequirements: 'core'
  },
  '10min': {
    duration: 10,
    name: 'Mini Session',
    description: 'Short but effective',
    exerciseCount: {
      warmup: 2,
      main: 3,
      cooldown: 1,
      total: 6
    },
    timeAllocation: {
      warmupPercent: 15, // 1.5 minutes
      mainPercent: 70,   // 7 minutes
      cooldownPercent: 15 // 1.5 minutes
    },
    complexity: 'simple',
    variableRequirements: 'standard'
  },
  '15min': {
    duration: 15,
    name: 'Express Workout',
    description: 'Quick but comprehensive',
    exerciseCount: {
      warmup: 2,
      main: 4,
      cooldown: 2,
      total: 8
    },
    timeAllocation: {
      warmupPercent: 13, // ~2 minutes
      mainPercent: 74,   // ~11 minutes
      cooldownPercent: 13 // ~2 minutes
    },
    complexity: 'standard',
    variableRequirements: 'standard'
  },
  '20min': {
    duration: 20,
    name: 'Focused Workout',
    description: 'Balanced and focused',
    exerciseCount: {
      warmup: 3,
      main: 5,
      cooldown: 2,
      total: 10
    },
    timeAllocation: {
      warmupPercent: 15, // 3 minutes
      mainPercent: 70,   // 14 minutes
      cooldownPercent: 15 // 3 minutes
    },
    complexity: 'standard',
    variableRequirements: 'enhanced'
  },
  '30min': {
    duration: 30,
    name: 'Complete Workout',
    description: 'Full comprehensive session',
    exerciseCount: {
      warmup: 3,
      main: 6,
      cooldown: 3,
      total: 12
    },
    timeAllocation: {
      warmupPercent: 17, // ~5 minutes
      mainPercent: 66,   // ~20 minutes
      cooldownPercent: 17 // ~5 minutes
    },
    complexity: 'comprehensive',
    variableRequirements: 'full'
  },
  '45min': {
    duration: 45,
    name: 'Extended Workout',
    description: 'Comprehensive extended session',
    exerciseCount: {
      warmup: 4,
      main: 8,
      cooldown: 3,
      total: 15
    },
    timeAllocation: {
      warmupPercent: 16, // ~7 minutes
      mainPercent: 68,   // ~31 minutes
      cooldownPercent: 16 // ~7 minutes
    },
    complexity: 'advanced',
    variableRequirements: 'full'
  }
};

/**
 * Get duration configuration by duration
 */
export const getDurationConfig = (duration: number): DurationConfig => {
  const supportedDurations = [5, 10, 15, 20, 30, 45];
  const closestDuration = supportedDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );
  
  const config = DURATION_CONFIGS[`${closestDuration}min`];
  if (!config) {
    throw new Error(`No configuration found for duration ${duration}min`);
  }
  
  return config;
};

/**
 * Get exercise count for duration
 */
export const getExerciseCountForDuration = (duration: number) => {
  return getDurationConfig(duration).exerciseCount;
};

/**
 * Get time allocation for duration
 */
export const getTimeAllocationForDuration = (duration: number) => {
  return getDurationConfig(duration).timeAllocation;
};

// Feature-specific constants
export const QUICK_WORKOUT_CONSTANTS = {
  // Supported durations
  SUPPORTED_DURATIONS: [5, 10, 15, 20, 30, 45],
  
  // Default values
  DEFAULT_DURATION: 30,
  DEFAULT_FITNESS_LEVEL: 'some experience' as const,
  DEFAULT_ENERGY_LEVEL: 5,
  
  // Duration mappings
  DURATION_CONFIGS,
  
  // Validation limits
  MIN_DURATION: 5,
  MAX_DURATION: 45,
  
  // Prompt selection thresholds
  DURATION_TOLERANCE: 2, // minutes
  
  // Feature capabilities
  CAPABILITIES: [
    'duration-specific-optimization',
    'context-aware-prompts',
    'workout-structure-normalization',
    'equipment-integration',
    'fitness-level-adaptation'
  ] as const,
  
  // Performance settings
  CACHE_TIMEOUT_MS: 10 * 60 * 1000, // 10 minutes
  REQUEST_TIMEOUT_MS: 30 * 1000,    // 30 seconds
  
  // Helper functions
  getDurationConfig,
  getExerciseCountForDuration,
  getTimeAllocationForDuration
} as const; 