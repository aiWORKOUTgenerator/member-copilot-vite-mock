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
    variableRequirements: 'core'
  },
  '15min': {
    duration: 15,
    name: 'Express',
    description: 'Efficient workout',
    exerciseCount: {
      warmup: 2,
      main: 4,
      cooldown: 2,
      total: 8
    },
    timeAllocation: {
      warmupPercent: 13, // 2 minutes
      mainPercent: 74,   // 11 minutes
      cooldownPercent: 13 // 2 minutes
    },
    complexity: 'standard',
    variableRequirements: 'standard'
  },
  '20min': {
    duration: 20,
    name: 'Focused',
    description: 'Balanced duration',
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
    variableRequirements: 'standard'
  },
  '30min': {
    duration: 30,
    name: 'Complete',
    description: 'Full workout experience',
    exerciseCount: {
      warmup: 3,
      main: 8,
      cooldown: 3,
      total: 14
    },
    timeAllocation: {
      warmupPercent: 13, // 4 minutes
      mainPercent: 74,   // 22 minutes
      cooldownPercent: 13 // 4 minutes
    },
    complexity: 'comprehensive',
    variableRequirements: 'enhanced'
  },
  '45min': {
    duration: 45,
    name: 'Extended',
    description: 'Maximum benefit',
    exerciseCount: {
      warmup: 4,
      main: 12,
      cooldown: 4,
      total: 20
    },
    timeAllocation: {
      warmupPercent: 11, // 5 minutes
      mainPercent: 78,   // 35 minutes
      cooldownPercent: 11 // 5 minutes
    },
    complexity: 'advanced',
    variableRequirements: 'full'
  }
};

// Helper functions
export const getDurationConfig = (duration: number): DurationConfig => {
  const configKey = `${duration}min`;
  return DURATION_CONFIGS[configKey] || DURATION_CONFIGS['30min']; // Default fallback
};

export const getExerciseCountForDuration = (duration: number) => {
  return getDurationConfig(duration).exerciseCount;
};

export const getTimeAllocationForDuration = (duration: number) => {
  const config = getDurationConfig(duration);
  return {
    warmup: Math.round(duration * config.timeAllocation.warmupPercent / 100),
    main: Math.round(duration * config.timeAllocation.mainPercent / 100),
    cooldown: Math.round(duration * config.timeAllocation.cooldownPercent / 100)
  };
};

// Main constants export for the feature
export const QUICK_WORKOUT_CONSTANTS = {
  SUPPORTED_DURATIONS: [5, 10, 15, 20, 30, 45],
  DEFAULT_DURATION: 30,
  MIN_DURATION: 5,
  MAX_DURATION: 45,
  REQUEST_TIMEOUT_MS: 30000,
  DURATION_CONFIGS,
  getDurationConfig,
  getExerciseCountForDuration,
  getTimeAllocationForDuration
} as const; 