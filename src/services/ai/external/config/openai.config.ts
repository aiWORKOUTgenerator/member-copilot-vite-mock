// OpenAI Configuration Management - Refactored for Testability
import { OpenAIConfig, ExternalAIServiceConfig } from '../types/external-ai.types';

// Environment abstraction layer
interface EnvironmentAdapter {
  getMode(): string;
  getApiKey(): string;
  getOrgId(): string | undefined;
  getBaseUrl(): string;
  isDevelopment(): boolean;
}

// Vite environment adapter (for production)
export class ViteEnvironmentAdapter implements EnvironmentAdapter {
  private getViteEnv(): any {
    // Try to access Vite environment variables safely
    try {
      // Primary: Access Vite environment variables through import.meta.env
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return {
          MODE: import.meta.env.MODE || 'development',
          VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
          VITE_OPENAI_ORG_ID: import.meta.env.VITE_OPENAI_ORG_ID,
          VITE_OPENAI_BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
        };
      }
    } catch (error) {
      // Silently fall back to other methods if import.meta is not available
    }
    
    // Fallback: Access through window.__VITE_ENV__ (for SSR scenarios)
    if (typeof window !== 'undefined' && (window as any).__VITE_ENV__) {
      return (window as any).__VITE_ENV__;
    }
    
    // Fallback for Node.js environments
    if (typeof process !== 'undefined' && process.env) {
      return {
        MODE: process.env.NODE_ENV || 'development',
        VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
        VITE_OPENAI_ORG_ID: process.env.VITE_OPENAI_ORG_ID,
        VITE_OPENAI_BASE_URL: process.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
      };
    }
    
    return null;
  }

  getMode(): string {
    const env = this.getViteEnv();
    return env ? env.MODE || 'development' : 'development';
  }

  getApiKey(): string {
    const env = this.getViteEnv();
    const apiKey = env ? env.VITE_OPENAI_API_KEY || '' : '';
    
    // Development fallback: provide mock API key if none is available
    if (!apiKey && this.isDevelopment()) {
      console.warn('⚠️  No OpenAI API key found in development environment');
      console.warn('   Using mock API key for development. AI features will be limited.');
      console.warn('   To enable full AI features, add VITE_OPENAI_API_KEY to your .env file');
      return 'sk-mock-development-key-for-testing-only';
    }
    
    return apiKey;
  }

  getOrgId(): string | undefined {
    const env = this.getViteEnv();
    return env ? env.VITE_OPENAI_ORG_ID : undefined;
  }

  getBaseUrl(): string {
    const env = this.getViteEnv();
    return env ? env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1' : 'https://api.openai.com/v1';
  }

  isDevelopment(): boolean {
    return this.getMode() === 'development';
  }
}

// Test environment adapter
class TestEnvironmentAdapter implements EnvironmentAdapter {
  constructor(private testEnv: Record<string, string> = {}) {}

  getMode(): string {
    return this.testEnv.MODE || 'test';
  }

  getApiKey(): string {
    return this.testEnv.VITE_OPENAI_API_KEY || '';
  }

  getOrgId(): string | undefined {
    return this.testEnv.VITE_OPENAI_ORG_ID;
  }

  getBaseUrl(): string {
    return this.testEnv.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isDevelopment(): boolean {
    return this.getMode() === 'development';
  }
}

// Configuration Constants - Extracted from magic numbers
export const OPENAI_CONFIG_CONSTANTS = {
  // Time constants
  DEFAULT_TIMEOUT_MS: 30 * 1000,
  MAX_TIMEOUT_MS: 60 * 1000,
  RETRY_DELAY_MS: 1 * 1000,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_PRODUCTION_MS: 10 * 60 * 1000, // 10 minutes
  CACHE_TTL_TEST_MS: 1000, // 1 second for tests
  
  // Rate limiting
  MAX_REQUESTS_DEV: 20,
  MAX_REQUESTS_PROD: 100,
  MAX_REQUESTS_TEST: 5,
  RATE_LIMIT_WARNING_THRESHOLD: 200,
  
  // Retry configuration
  MAX_RETRIES_DEV: 3,
  MAX_RETRIES_PROD: 2,
  MAX_RETRIES_TEST: 1,
  
  // Token limits
  MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
  
  // Cost estimation (per 1K tokens)
  PRICING: {
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'gpt-4o': 0.005,
    'gpt-3.5-turbo': 0.0015
  } as const,
  
  // Supported models
  SUPPORTED_MODELS: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'] as const
} as const;

// Configuration validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Default environment adapter
let environmentAdapter: EnvironmentAdapter = new ViteEnvironmentAdapter();

// Allow environment adapter to be overridden for testing
export const setEnvironmentAdapter = (adapter: EnvironmentAdapter): void => {
  environmentAdapter = adapter;
};

// Create test adapter helper
export const createTestEnvironmentAdapter = (env: Record<string, string> = {}): TestEnvironmentAdapter => {
  return new TestEnvironmentAdapter(env);
};

// Environment variable validation
const validateEnvironmentVariables = (adapter: EnvironmentAdapter = environmentAdapter): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const apiKey = adapter.getApiKey();
  const mode = adapter.getMode();
  
  // Enhanced debugging for development
  if (adapter.isDevelopment()) {
    console.group('OpenAI Environment Validation');
    console.log('Environment Mode:', mode);
    console.log('API Key Present:', !!apiKey);
    console.log('API Key Length:', apiKey ? apiKey.length : 0);
    console.log('API Key Prefix:', apiKey ? apiKey.substring(0, 7) + '...' : 'N/A');
    
    // Debug environment access methods
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      console.log('import.meta.env.VITE_OPENAI_API_KEY present:', !!import.meta.env.VITE_OPENAI_API_KEY);
    }
    if (typeof process !== 'undefined' && process.env) {
      console.log('process.env.VITE_OPENAI_API_KEY present:', !!process.env.VITE_OPENAI_API_KEY);
    }
    console.groupEnd();
  }
  
  if (!apiKey) {
    const errorMessage = 'Missing OpenAI API key';
    errors.push(errorMessage);
    if (adapter.isDevelopment()) {
      console.error('❌ OpenAI API key not found in environment variables');
      console.error('   Please ensure VITE_OPENAI_API_KEY is set in your .env file');
      console.error('   External AI features will be disabled');
    }
  } else if (apiKey === 'sk-mock-development-key-for-testing-only') {
    if (adapter.isDevelopment()) {
      console.warn('⚠️  Using mock API key for development');
      console.warn('   AI features will be limited. Add real API key to .env for full functionality');
      warnings.push('Using mock API key for development');
    }
  } else if (adapter.isDevelopment()) {
    console.log('✅ OpenAI API key found and loaded successfully');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Default OpenAI configuration factory
const createDefaultOpenAIConfig = (adapter: EnvironmentAdapter = environmentAdapter): OpenAIConfig => ({
  apiKey: adapter.getApiKey(),
  model: 'gpt-4o',
  maxTokens: OPENAI_CONFIG_CONSTANTS.MAX_TOKENS,
  temperature: OPENAI_CONFIG_CONSTANTS.DEFAULT_TEMPERATURE,
  organizationId: adapter.getOrgId(),
  baseURL: adapter.getBaseUrl()
});

// Configuration presets
const createDevelopmentConfig = (adapter: EnvironmentAdapter = environmentAdapter): ExternalAIServiceConfig => ({
  openai: createDefaultOpenAIConfig(adapter),
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: false, // Disabled in dev for cost control
    openai_real_time_coaching: false,
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV,
    timeoutMs: OPENAI_CONFIG_CONSTANTS.DEFAULT_TIMEOUT_MS,
    retryAttempts: OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_DEV,
    cacheTimeoutMs: OPENAI_CONFIG_CONSTANTS.CACHE_TTL_MS
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
});

const createProductionConfig = (adapter: EnvironmentAdapter = environmentAdapter): ExternalAIServiceConfig => ({
  openai: createDefaultOpenAIConfig(adapter),
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true,
    openai_real_time_coaching: false, // Gradual rollout
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_PROD,
    timeoutMs: OPENAI_CONFIG_CONSTANTS.DEFAULT_TIMEOUT_MS,
    retryAttempts: OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_PROD,
    cacheTimeoutMs: OPENAI_CONFIG_CONSTANTS.CACHE_TTL_PRODUCTION_MS
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
});

const createTestConfig = (adapter: EnvironmentAdapter = environmentAdapter): ExternalAIServiceConfig => ({
  openai: {
    ...createDefaultOpenAIConfig(adapter),
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
    maxRequestsPerMinute: OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_TEST,
    timeoutMs: 5000,
    retryAttempts: OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_TEST,
    cacheTimeoutMs: OPENAI_CONFIG_CONSTANTS.CACHE_TTL_TEST_MS
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
});

// Main configuration getter - now testable!
export const getOpenAIConfig = (adapter: EnvironmentAdapter = environmentAdapter): ExternalAIServiceConfig => {
  const envValidation = validateEnvironmentVariables(adapter);
  
  if (!envValidation.isValid && adapter.isDevelopment()) {
    console.error('Environment validation failed', { errors: envValidation.errors });
  }
  
  const env = adapter.getMode();
  
  switch (env) {
    case 'development':
      return createDevelopmentConfig(adapter);
    case 'production':
      return createProductionConfig(adapter);
    case 'test':
      return createTestConfig(adapter);
    default:
      if (adapter.isDevelopment()) {
        console.warn(`Unknown environment mode: ${env}, falling back to development`);
      }
      return createDevelopmentConfig(adapter);
  }
};

// Enhanced configuration validation
export const validateConfig = (config: ExternalAIServiceConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check API key
  if (!config.openai.apiKey) {
    const errorMessage = 'OpenAI API key is required';
    errors.push(errorMessage);
    if (environmentAdapter.isDevelopment()) {
      console.error(errorMessage);
    }
  }
  
  // Check model availability
  if (!OPENAI_CONFIG_CONSTANTS.SUPPORTED_MODELS.includes(config.openai.model)) {
    const errorMessage = `Unsupported OpenAI model: ${config.openai.model}`;
    errors.push(errorMessage);
    if (environmentAdapter.isDevelopment()) {
      console.error(errorMessage);
    }
  }
  
  // Check performance limits
  if (config.performance.maxRequestsPerMinute <= 0) {
    const errorMessage = 'Max requests per minute must be positive';
    errors.push(errorMessage);
    if (environmentAdapter.isDevelopment()) {
      console.error(errorMessage);
    }
  }
  
  // Check timeout settings
  if (config.performance.timeoutMs > OPENAI_CONFIG_CONSTANTS.MAX_TIMEOUT_MS) {
    const warningMessage = 'Long timeout may impact user experience';
    warnings.push(warningMessage);
    if (environmentAdapter.isDevelopment()) {
      console.warn(warningMessage);
    }
  }
  
  // Check rate limits
  if (config.performance.maxRequestsPerMinute > OPENAI_CONFIG_CONSTANTS.RATE_LIMIT_WARNING_THRESHOLD) {
    const warningMessage = 'High rate limit may impact API quota';
    warnings.push(warningMessage);
    if (environmentAdapter.isDevelopment()) {
      console.warn(warningMessage);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Cost estimation utilities
export const estimateTokenCost = (tokens: number, model: string): number => {
  const pricing = OPENAI_CONFIG_CONSTANTS.PRICING;
  
  return (tokens / 1000) * (pricing[model as keyof typeof pricing] ?? 0.01);
};

// Enhanced configuration monitoring
export const getConfigHealth = (config: ExternalAIServiceConfig): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const validation = validateConfig(config);
  const issues: string[] = [...validation.errors];
  const recommendations: string[] = [...validation.warnings];
  
  // Check API key
  if (!config.openai.apiKey) {
    issues.push('Missing OpenAI API key');
    recommendations.push('Set VITE_OPENAI_API_KEY environment variable');
  }
  
  // Check rate limits
  if (config.performance.maxRequestsPerMinute > OPENAI_CONFIG_CONSTANTS.RATE_LIMIT_WARNING_THRESHOLD) {
    recommendations.push('Consider reducing rate limit to avoid API quota issues');
  }
  
  // Check timeout settings
  if (config.performance.timeoutMs > OPENAI_CONFIG_CONSTANTS.MAX_TIMEOUT_MS) {
    recommendations.push('Long timeout may impact user experience');
  }
  
  // Check fallback configuration
  if (!config.fallback.enabled) {
    recommendations.push('Enable fallback for better reliability');
  }
  
  // Log health status only in development
  if (environmentAdapter.isDevelopment()) {
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
  apiKey: environmentAdapter.getApiKey(),
  organizationId: environmentAdapter.getOrgId(),
  baseURL: environmentAdapter.getBaseUrl(),
  
  // Model Configuration
  defaultModel: 'gpt-4o',
  fallbackModel: 'gpt-3.5-turbo',
  
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
    openai_debug_mode: environmentAdapter.isDevelopment(),
    openai_detailed_logging: environmentAdapter.isDevelopment(),
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
  if (environmentAdapter.getMode() === 'production' && currentSystem === 'new') {
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

// Export the main configuration (lazy-loaded to ensure proper environment detection)
let _openAIConfig: ExternalAIServiceConfig | null = null;
export const openAIConfig = (): ExternalAIServiceConfig => {
  if (!_openAIConfig) {
    _openAIConfig = getOpenAIConfig();
  }
  return _openAIConfig;
};

// Export configuration presets for testing
export const configPresets = {
  development: createDevelopmentConfig,
  production: createProductionConfig,
  test: createTestConfig
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
export const debugConfig = (adapter: EnvironmentAdapter = environmentAdapter): void => {
  if (adapter.isDevelopment()) {
    const config = getOpenAIConfig(adapter);
    const debugInfo = {
      environment: adapter.getMode(),
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
  const adapter = new ViteEnvironmentAdapter();
  const apiKey = adapter.getApiKey();
  const isDev = adapter.isDevelopment();
  
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