// OpenAI Configuration Management
import { OpenAIConfig, ExternalAIServiceConfig } from '../types/external-ai.types';

// Environment variable validation
const validateEnvironmentVariables = (): void => {
  const required = ['VITE_OPENAI_API_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing OpenAI environment variables: ${missing.join(', ')}`);
    console.warn('External AI features will be disabled');
  }
};

// Default OpenAI configuration
const createDefaultOpenAIConfig = (): OpenAIConfig => ({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4-turbo',
  maxTokens: 2000,
  temperature: 0.7,
  organizationId: import.meta.env.VITE_OPENAI_ORG_ID,
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

// Development configuration
const developmentConfig: ExternalAIServiceConfig = {
  openai: createDefaultOpenAIConfig(),
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: false, // Disabled in dev for cost control
    openai_real_time_coaching: false,
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: 20,
    timeoutMs: 30000,
    retryAttempts: 3,
    cacheTimeoutMs: 5 * 60 * 1000 // 5 minutes
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
};

// Production configuration
const productionConfig: ExternalAIServiceConfig = {
  openai: createDefaultOpenAIConfig(),
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true,
    openai_real_time_coaching: false, // Gradual rollout
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: 100,
    timeoutMs: 15000,
    retryAttempts: 2,
    cacheTimeoutMs: 10 * 60 * 1000 // 10 minutes
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
};

// Test configuration
const testConfig: ExternalAIServiceConfig = {
  openai: {
    ...createDefaultOpenAIConfig(),
    apiKey: 'test-key',
    model: 'gpt-3.5-turbo'
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
};

// Get configuration based on environment
export const getOpenAIConfig = (): ExternalAIServiceConfig => {
  validateEnvironmentVariables();
  
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return developmentConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return developmentConfig;
  }
};

// Configuration validation
export const validateConfig = (config: ExternalAIServiceConfig): boolean => {
  // Check API key
  if (!config.openai.apiKey) {
    console.error('OpenAI API key is required');
    return false;
  }
  
  // Check model availability
  const supportedModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  if (!supportedModels.includes(config.openai.model)) {
    console.error(`Unsupported OpenAI model: ${config.openai.model}`);
    return false;
  }
  
  // Check performance limits
  if (config.performance.maxRequestsPerMinute <= 0) {
    console.error('Max requests per minute must be positive');
    return false;
  }
  
  return true;
};

// Cost estimation utilities
export const estimateTokenCost = (tokens: number, model: string): number => {
  const pricing = {
    'gpt-4': 0.03, // per 1K tokens
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.0015
  };
  
  return (tokens / 1000) * (pricing[model as keyof typeof pricing] || 0.01);
};

// Configuration monitoring
export const getConfigHealth = (config: ExternalAIServiceConfig): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check API key
  if (!config.openai.apiKey) {
    issues.push('Missing OpenAI API key');
    recommendations.push('Set VITE_OPENAI_API_KEY environment variable');
  }
  
  // Check rate limits
  if (config.performance.maxRequestsPerMinute > 200) {
    recommendations.push('Consider reducing rate limit to avoid API quota issues');
  }
  
  // Check timeout settings
  if (config.performance.timeoutMs > 30000) {
    recommendations.push('Long timeout may impact user experience');
  }
  
  // Check fallback configuration
  if (!config.fallback.enabled) {
    recommendations.push('Enable fallback for better reliability');
  }
  
  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations
  };
};

// Feature flag helpers
export const isFeatureEnabled = (
  feature: keyof ExternalAIServiceConfig['features'],
  config?: ExternalAIServiceConfig
): boolean => {
  const currentConfig = config || getOpenAIConfig();
  return currentConfig.features[feature] && !!currentConfig.openai.apiKey;
};

// Export the main configuration
export const openAIConfig = getOpenAIConfig();

// Export configuration presets for testing
export const configPresets = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig
};

// Configuration change detection
const configChangeListeners: ((config: ExternalAIServiceConfig) => void)[] = [];

export const onConfigChange = (listener: (config: ExternalAIServiceConfig) => void): void => {
  configChangeListeners.push(listener);
};

export const notifyConfigChange = (newConfig: ExternalAIServiceConfig): void => {
  configChangeListeners.forEach(listener => listener(newConfig));
};

// Development utilities
export const debugConfig = (): void => {
  if (import.meta.env.MODE === 'development') {
    console.group('OpenAI Configuration');
    console.log('Environment:', import.meta.env.MODE);
    console.log('API Key present:', !!openAIConfig.openai.apiKey);
    console.log('Model:', openAIConfig.openai.model);
    console.log('Features enabled:', Object.entries(openAIConfig.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature));
    console.log('Rate limit:', openAIConfig.performance.maxRequestsPerMinute, 'requests/minute');
    console.groupEnd();
  }
};

// Initialize configuration debugging in development
if (import.meta.env.MODE === 'development') {
  debugConfig();
} 