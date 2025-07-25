// OpenAI Configuration Management - Refactored for Testability
import { OpenAIConfig, ExternalAIServiceConfig } from '../types/external-ai.types';

// Helper function to get environment variables
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

export const openAIConfig = (): ExternalAIServiceConfig => {
  const config: ExternalAIServiceConfig = {
    openai: {
      apiKey: getEnvVar('VITE_OPENAI_API_KEY') || 'sk-mock-development-key-for-testing-only',
      model: (getEnvVar('VITE_OPENAI_MODEL') || 'gpt-4o') as 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o',
      maxTokens: parseInt(getEnvVar('VITE_OPENAI_MAX_TOKENS') || '8000'),
      temperature: parseFloat(getEnvVar('VITE_OPENAI_TEMPERATURE') || '0.7'),
      baseURL: getEnvVar('VITE_OPENAI_BASE_URL') || 'https://api.openai.com/v1',
      organizationId: getEnvVar('VITE_OPENAI_ORG_ID')
    },
    features: {
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true,
      openai_real_time_coaching: true,
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 60,
      timeoutMs: 30000,
      retryAttempts: 3,
      cacheTimeoutMs: 3600000
    },
    fallback: {
      enabled: true,
      strategy: 'cached'
    }
  };

  validateConfig(config.openai);
  return config;
};

export const validateConfig = (config: OpenAIConfig): boolean => {
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }
  if (!config.model) {
    throw new Error('OpenAI model not configured. Please set VITE_OPENAI_MODEL in your .env file.');
  }
  if (!config.maxTokens || config.maxTokens < 1) {
    throw new Error('Invalid maxTokens configuration. Please set VITE_OPENAI_MAX_TOKENS in your .env file.');
  }
  if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 1) {
    throw new Error('Invalid temperature configuration. Please set VITE_OPENAI_TEMPERATURE in your .env file.');
  }
  if (!config.baseURL) {
    throw new Error('OpenAI baseURL not configured. Please set VITE_OPENAI_BASE_URL in your .env file or ensure default is set.');
  }
  return true;
};

export const estimateTokenCost = (tokens: number, model: string): number => {
  // Cost per 1K tokens (as of 2024)
  const costPer1K = {
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'gpt-4o': 0.01
  }[model] || 0.01;

  return (tokens / 1000) * costPer1K;
};

// Enhanced configuration monitoring
export const getConfigHealth = (config: ExternalAIServiceConfig): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const validation = validateConfig(config.openai);
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check API key
  if (!config.openai.apiKey) {
    issues.push('Missing OpenAI API key');
    recommendations.push('Set VITE_OPENAI_API_KEY environment variable');
  }
  
  // Check rate limits
  if (config.performance.maxRequestsPerMinute > 20) { // Assuming a default maxRequestsPerMinute for health check
    recommendations.push('Consider reducing rate limit to avoid API quota issues');
  }
  
  // Check timeout settings
  if (config.performance.timeoutMs > 30000) { // Assuming a default timeoutMs for health check
    recommendations.push('Long timeout may impact user experience');
  }
  
  // Check fallback configuration
  if (!config.fallback.enabled) {
    recommendations.push('Enable fallback for better reliability');
  }
  
  // Log health status only in development
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') {
    if (issues.length > 0) {
      console.error('OpenAI configuration health check failed', { issues, recommendations });
    } else if (recommendations.length > 0) {
      console.warn('OpenAI configuration health check warnings', { recommendations });
    } else {
      console.info('OpenAI configuration health check passed');
    }
  }
  
  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations
  };
};

// OpenAI Configuration and Feature Flags
export const OPENAI_CONFIG = {
  // API Configuration
  apiKey: getEnvVar('VITE_OPENAI_API_KEY') || 'sk-mock-development-key-for-testing-only',
  organizationId: getEnvVar('VITE_OPENAI_ORG_ID'),
  baseURL: getEnvVar('VITE_OPENAI_BASE_URL') || 'https://api.openai.com/v1',
  
  // Model Configuration
  defaultModel: getEnvVar('VITE_OPENAI_MODEL') || 'gpt-4o',
  fallbackModel: 'gpt-4o',
  
  // Feature Flags
  features: {
    // Core AI Features
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true,
    openai_insight_enhancement: true,
    
    // ✅ NEW: Legacy System Control
    disable_legacy_quickworkout: true, // Set to true to disable legacy system
    force_new_quickworkout_feature: true, // Set to true to force new system only
    
    // Advanced Features
    openai_advanced_workout_optimization: true,
    openai_personalized_coaching: true,
    openai_workout_adaptation: true,
    
    // Performance Features
    openai_caching: true,
    openai_retry_logic: true,
    openai_fallback_strategies: true,
    
    // Development Features
    openai_debug_mode: typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development',
    openai_detailed_logging: typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development',
    openai_performance_monitoring: true
  },
  
  // Timeout Configuration
  timeouts: {
    workout_generation: 30000, // 30 seconds
    recommendations: 15000,    // 15 seconds
    user_analysis: 20000,      // 20 seconds
    insight_enhancement: 10000 // 10 seconds
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 1000 // Maximum cached items
  },
  
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000  // 10 seconds
  }
};

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (featureName: keyof typeof OPENAI_CONFIG.features): boolean => {
  return OPENAI_CONFIG.features[featureName] === true;
};

/**
 * ✅ NEW: Check if legacy QuickWorkoutSetup should be disabled
 */
export const isLegacyQuickWorkoutDisabled = (): boolean => {
  return isFeatureEnabled('disable_legacy_quickworkout');
};

/**
 * ✅ NEW: Check if new QuickWorkoutSetup feature should be forced
 */
export const isNewQuickWorkoutFeatureForced = (): boolean => {
  return isFeatureEnabled('force_new_quickworkout_feature');
};

/**
 * ✅ NEW: Get the current QuickWorkoutSetup system preference
 */
export const getQuickWorkoutSystemPreference = (): 'new' | 'legacy' | 'hybrid' => {
  if (isNewQuickWorkoutFeatureForced()) {
    return 'new';
  }
  if (isLegacyQuickWorkoutDisabled()) {
    return 'new';
  }
  return 'hybrid';
};

/**
 * ✅ NEW: Validate QuickWorkoutSetup system configuration
 */
export const validateQuickWorkoutSetupConfig = (): {
  isValid: boolean;
  currentSystem: 'new' | 'legacy' | 'hybrid';
  warnings: string[];
  recommendations: string[];
} => {
  const currentSystem = getQuickWorkoutSystemPreference();
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for conflicting configurations
  if (isLegacyQuickWorkoutDisabled() && !isNewQuickWorkoutFeatureForced()) {
    warnings.push('Legacy system is disabled but new system is not forced - this may cause issues');
    recommendations.push('Consider setting force_new_quickworkout_feature to true for consistency');
  }

  // Check for production safety
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'production' && currentSystem === 'new') {
    warnings.push('New QuickWorkoutSetup system is forced in production - ensure it is thoroughly tested');
    recommendations.push('Monitor system performance and user feedback closely');
  }

  return {
    isValid: warnings.length === 0,
    currentSystem,
    warnings,
    recommendations
  };
};

// Export configuration presets for testing
export const configPresets = {
  development: (): ExternalAIServiceConfig => ({
    openai: {
      apiKey: 'sk-mock-development-key-for-testing-only',
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.7
    },
    features: {
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true,
      openai_real_time_coaching: true,
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 60,
      timeoutMs: 30000,
      retryAttempts: 3,
      cacheTimeoutMs: 3600000
    },
    fallback: {
      enabled: true,
      strategy: 'cached'
    }
  }),
  production: (): ExternalAIServiceConfig => ({
    openai: {
      apiKey: 'sk-mock-production-key-for-testing-only',
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.7
    },
    features: {
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true,
      openai_real_time_coaching: false, // Gradual rollout
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 100,
      timeoutMs: 30000,
      retryAttempts: 2,
      cacheTimeoutMs: 1000000
    },
    fallback: {
      enabled: true,
      strategy: 'rule_based'
    }
  }),
  test: (): ExternalAIServiceConfig => ({
    openai: {
      apiKey: 'sk-mock-test-key-for-testing-only',
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.7
    },
    features: {
      openai_workout_generation: false,
      openai_enhanced_recommendations: false,
      openai_user_analysis: false,
      openai_real_time_coaching: false,
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 5,
      timeoutMs: 5000,
      retryAttempts: 1,
      cacheTimeoutMs: 1000
    },
    fallback: {
      enabled: true,
      strategy: 'rule_based'
    }
  })
};

// Configuration change detection
const configChangeListeners: ((config: ExternalAIServiceConfig) => void)[] = [];

export const onConfigChange = (listener: (config: ExternalAIServiceConfig) => void): void => {
  configChangeListeners.push(listener);
};

export const notifyConfigChange = (newConfig: ExternalAIServiceConfig): void => {
  configChangeListeners.forEach(listener => listener(newConfig));
};

// Enhanced development utilities
export const debugConfig = (): void => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') {
    const config = openAIConfig();
    const debugInfo = {
      environment: import.meta.env.MODE,
      apiKeyPresent: !!config.openai.apiKey,
      model: config.openai.model,
      featuresEnabled: Object.entries(config.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature),
      rateLimit: `${config.performance.maxRequestsPerMinute} requests/minute`,
      timeout: `${config.performance.timeoutMs}ms`,
      retryAttempts: config.performance.retryAttempts
    };
    
    console.group('OpenAI Configuration Debug');
    console.log(debugInfo);
    console.groupEnd();
  }
};

// Runtime environment check function
export const checkEnvironmentConfiguration = (): {
  isConfigured: boolean;
  hasApiKey: boolean;
  isDevelopment: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const apiKey = getEnvVar('VITE_OPENAI_API_KEY');
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!apiKey) {
    issues.push('No OpenAI API key found');
    recommendations.push('Add VITE_OPENAI_API_KEY to your .env file');
  } else if (apiKey === 'sk-mock-development-key-for-testing-only') {
    issues.push('Using mock API key (development only)');
    recommendations.push('Add real VITE_OPENAI_API_KEY to .env for full functionality');
  }
  
  if (isDev) {
    recommendations.push('Check browser console for detailed environment debugging');
  }
  
  return {
    isConfigured: Boolean(apiKey && apiKey !== 'sk-mock-development-key-for-testing-only'),
    hasApiKey: !!apiKey,
    isDevelopment: isDev,
    issues,
    recommendations
  };
};

// Safe initialization that won't break in test environments
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') {
    debugConfig();
  }
} catch (error) {
  // Silently ignore if import.meta is not available (e.g., in Jest)
} 