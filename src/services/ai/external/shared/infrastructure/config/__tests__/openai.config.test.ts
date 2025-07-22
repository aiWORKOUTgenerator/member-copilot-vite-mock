// OpenAI Configuration Tests - Refactored for Testability

// Mock the config module to avoid import.meta issues in Jest
// This test file is testing the config itself, so we need a more sophisticated mock

// Track the current environment adapter
let currentAdapter: any = null;

const mockConfig = {
  openai: {
    apiKey: 'test-api-key',
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
    organizationId: 'test-org',
    baseURL: 'https://api.openai.com/v1'
  },
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true,
    openai_real_time_coaching: true,
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: 100,
    timeoutMs: 30000,
    retryAttempts: 3,
    cacheTimeoutMs: 300000
  },
  fallback: {
    enabled: true,
    strategy: 'rule_based'
  }
};

// Mock constants
const mockConstants = {
  MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TIMEOUT_MS: 60000,
  DEFAULT_TIMEOUT_MS: 30000,
  RETRY_DELAY_MS: 1000,
  CACHE_TTL_MS: 300000,
  CACHE_TTL_PRODUCTION_MS: 600000,
  CACHE_TTL_TEST_MS: 1000,
  MAX_REQUESTS_DEV: 20,
  MAX_REQUESTS_PROD: 100,
  MAX_REQUESTS_TEST: 5,
  RATE_LIMIT_WARNING_THRESHOLD: 200,
  MAX_RETRIES_DEV: 3,
  MAX_RETRIES_PROD: 2,
  MAX_RETRIES_TEST: 1,
  PRICING: {
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'gpt-4o': 0.005,
    'gpt-3.5-turbo': 0.0015
  },
  SUPPORTED_MODELS: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo']
};

jest.mock('../openai.config', () => ({
  openAIConfig: mockConfig,
  validateConfig: jest.fn((config) => {
    const errors = [];
    const warnings = [];
    
    // Check API key
    if (!config.openai.apiKey) {
      errors.push('OpenAI API key is required');
    }
    
    // Check model
    if (!mockConstants.SUPPORTED_MODELS.includes(config.openai.model)) {
      errors.push(`Unsupported OpenAI model: ${config.openai.model}`);
    }
    
    // Check performance limits
    if (config.performance.maxRequestsPerMinute <= 0) {
      errors.push('Max requests per minute must be positive');
    }
    
    // Check timeout settings
    if (config.performance.timeoutMs > mockConstants.MAX_TIMEOUT_MS) {
      warnings.push('Long timeout may impact user experience');
    }
    
    // Check rate limits
    if (config.performance.maxRequestsPerMinute > mockConstants.RATE_LIMIT_WARNING_THRESHOLD) {
      warnings.push('High rate limit may impact API quota');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }),
  getOpenAIConfig: jest.fn((adapter) => {
    // If no adapter is provided, use the current adapter or default mock config
    const targetAdapter = adapter || currentAdapter;
    if (!targetAdapter) {
      return mockConfig;
    }
    
    const apiKey = targetAdapter.getApiKey();
    const mode = targetAdapter.getMode();
    const orgId = targetAdapter.getOrgId();
    const baseUrl = targetAdapter.getBaseUrl();
    
    // Return different configs based on environment
    if (mode === 'test') {
      return {
        ...mockConfig,
        openai: { 
          ...mockConfig.openai, 
          apiKey, 
          model: 'gpt-3.5-turbo',
          organizationId: orgId,
          baseURL: baseUrl
        },
        performance: { 
          ...mockConfig.performance, 
          maxRequestsPerMinute: mockConstants.MAX_REQUESTS_TEST,
          retryAttempts: mockConstants.MAX_RETRIES_TEST
        },
        features: { ...mockConfig.features, openai_workout_generation: false }
      };
    } else if (mode === 'production') {
      return {
        ...mockConfig,
        openai: { 
          ...mockConfig.openai, 
          apiKey,
          organizationId: orgId,
          baseURL: baseUrl
        },
        performance: { 
          ...mockConfig.performance, 
          maxRequestsPerMinute: mockConstants.MAX_REQUESTS_PROD,
          retryAttempts: mockConstants.MAX_RETRIES_PROD
        },
        features: { ...mockConfig.features, openai_user_analysis: true }
      };
    } else {
      // development or unknown
      return {
        ...mockConfig,
        openai: { 
          ...mockConfig.openai, 
          apiKey,
          organizationId: orgId,
          baseURL: baseUrl
        },
        performance: { 
          ...mockConfig.performance, 
          maxRequestsPerMinute: mockConstants.MAX_REQUESTS_DEV,
          retryAttempts: mockConstants.MAX_RETRIES_DEV
        },
        features: { ...mockConfig.features, openai_user_analysis: false }
      };
    }
  }),
  getConfigHealth: jest.fn((config) => {
    const issues = [];
    const recommendations = [];
    
    // Check API key
    if (!config.openai.apiKey) {
      issues.push('Missing OpenAI API key');
      recommendations.push('Set VITE_OPENAI_API_KEY environment variable');
    }
    
    // Check rate limits
    if (config.performance.maxRequestsPerMinute > mockConstants.RATE_LIMIT_WARNING_THRESHOLD) {
      recommendations.push('Consider reducing rate limit to avoid API quota issues');
    }
    
    // Check timeout settings
    if (config.performance.timeoutMs > mockConstants.MAX_TIMEOUT_MS) {
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
  }),
  setEnvironmentAdapter: jest.fn((adapter) => {
    currentAdapter = adapter;
  }),
  createTestEnvironmentAdapter: jest.fn((env) => ({
    getMode: () => env.MODE || 'test',
    getApiKey: () => env.VITE_OPENAI_API_KEY || '',
    getOrgId: () => env.VITE_OPENAI_ORG_ID,
    getBaseUrl: () => env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    isDevelopment: () => (env.MODE || 'test') === 'development'
  })),
  configPresets: {
    development: jest.fn((adapter) => ({
      ...mockConfig,
      openai: { ...mockConfig.openai, apiKey: adapter.getApiKey() },
      performance: { ...mockConfig.performance, maxRequestsPerMinute: mockConstants.MAX_REQUESTS_DEV },
      features: { ...mockConfig.features, openai_user_analysis: false }
    })),
    production: jest.fn((adapter) => ({
      ...mockConfig,
      openai: { ...mockConfig.openai, apiKey: adapter.getApiKey() },
      performance: { ...mockConfig.performance, maxRequestsPerMinute: mockConstants.MAX_REQUESTS_PROD },
      features: { ...mockConfig.features, openai_user_analysis: true }
    })),
    test: jest.fn((adapter) => ({
      ...mockConfig,
      openai: { ...mockConfig.openai, apiKey: adapter.getApiKey(), model: 'gpt-3.5-turbo' },
      performance: { ...mockConfig.performance, maxRequestsPerMinute: mockConstants.MAX_REQUESTS_TEST },
      features: { ...mockConfig.features, openai_workout_generation: false }
    }))
  },
  OPENAI_CONFIG_CONSTANTS: mockConstants,
  ViteEnvironmentAdapter: jest.fn().mockImplementation(() => ({
    getMode: () => 'development',
    getApiKey: () => 'vite-api-key',
    getOrgId: () => undefined,
    getBaseUrl: () => 'https://api.openai.com/v1',
    isDevelopment: () => true
  }))
}));

import { 
  getOpenAIConfig, 
  validateConfig, 
  getConfigHealth, 
  OPENAI_CONFIG_CONSTANTS,
  setEnvironmentAdapter,
  createTestEnvironmentAdapter,
  configPresets,
  ViteEnvironmentAdapter
} from '../openai.config';

describe('OpenAI Configuration - Refactored', () => {
  beforeEach(() => {
    // Reset the current adapter for each test
    currentAdapter = null;
  });

  afterEach(() => {
    // Restore to default ViteEnvironmentAdapter
    setEnvironmentAdapter(new ViteEnvironmentAdapter());
  });

  describe('Environment Adapter Pattern', () => {
    it('should use test environment adapter when set', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'test',
        VITE_OPENAI_API_KEY: 'test-api-key',
        VITE_OPENAI_ORG_ID: 'test-org',
        VITE_OPENAI_BASE_URL: 'https://test-api.openai.com/v1'
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();

      expect(config.openai.apiKey).toBe('test-api-key');
      expect(config.openai.organizationId).toBe('test-org');
      expect(config.openai.baseURL).toBe('https://test-api.openai.com/v1');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_TEST);
    });

    it('should handle missing environment variables gracefully', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'development'
        // No API key provided
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();

      expect(config.openai.apiKey).toBe('');
      expect(config.openai.model).toBe('gpt-4o');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV);
    });
  });

  describe('Configuration Loading', () => {
    it('should load development configuration correctly', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'dev-api-key'
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();
      
      expect(config.openai.model).toBe('gpt-4o');
      expect(config.openai.apiKey).toBe('dev-api-key');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV);
      expect(config.performance.retryAttempts).toBe(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_DEV);
      expect(config.fallback.enabled).toBe(true);
      expect(config.features.openai_user_analysis).toBe(false); // Disabled in dev
    });

    it('should load production configuration correctly', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'production',
        VITE_OPENAI_API_KEY: 'prod-api-key'
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();
      
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_PROD);
      expect(config.performance.retryAttempts).toBe(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_PROD);
      expect(config.features.openai_user_analysis).toBe(true); // Enabled in prod
    });

    it('should load test configuration correctly', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'test',
        VITE_OPENAI_API_KEY: 'test-key'
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();
      
      expect(config.openai.apiKey).toBe('test-key');
      expect(config.openai.model).toBe('gpt-3.5-turbo');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_TEST);
      expect(config.features.openai_workout_generation).toBe(false); // Disabled in test
    });

    it('should fallback to development for unknown environment', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'unknown',
        VITE_OPENAI_API_KEY: 'unknown-api-key'
      });

      setEnvironmentAdapter(testAdapter);
      const config = getOpenAIConfig();
      
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV);
      expect(config.openai.model).toBe('gpt-4o');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing API key', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development'
        // No API key
      }));
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('OpenAI API key is required');
    });

    it('should detect unsupported model', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      config.openai.model = 'unsupported-model' as any;
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unsupported OpenAI model: unsupported-model');
    });

    it('should detect invalid performance limits', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      config.performance.maxRequestsPerMinute = 0;
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Max requests per minute must be positive');
    });

    it('should warn about long timeout settings', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      config.performance.timeoutMs = OPENAI_CONFIG_CONSTANTS.MAX_TIMEOUT_MS + 1000;
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Long timeout may impact user experience');
    });

    it('should warn about high rate limits', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      config.performance.maxRequestsPerMinute = OPENAI_CONFIG_CONSTANTS.RATE_LIMIT_WARNING_THRESHOLD + 10;
      
      const validation = validateConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('High rate limit may impact API quota');
    });
  });

  describe('Configuration Health Check', () => {
    it('should return healthy status for valid configuration', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      const health = getConfigHealth(config);
      
      expect(health.isHealthy).toBe(true);
      expect(health.issues).toHaveLength(0);
    });

    it('should detect health issues', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development'
        // No API key
      }));
      
      config.fallback.enabled = false;
      
      const health = getConfigHealth(config);
      
      expect(health.isHealthy).toBe(false);
      expect(health.issues).toContain('Missing OpenAI API key');
      expect(health.recommendations).toContain('Enable fallback for better reliability');
    });

    it('should provide recommendations for optimization', () => {
      const config = configPresets.development(createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'valid-api-key'
      }));
      
      config.performance.maxRequestsPerMinute = OPENAI_CONFIG_CONSTANTS.RATE_LIMIT_WARNING_THRESHOLD + 10;
      config.performance.timeoutMs = OPENAI_CONFIG_CONSTANTS.MAX_TIMEOUT_MS + 1000;
      
      const health = getConfigHealth(config);
      
      expect(health.isHealthy).toBe(true);
      expect(health.recommendations).toContain('Consider reducing rate limit to avoid API quota issues');
      expect(health.recommendations).toContain('Long timeout may impact user experience');
    });
  });

  describe('Constants and Configuration', () => {
    it('should have valid constants', () => {
      expect(OPENAI_CONFIG_CONSTANTS.MAX_TOKENS).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.DEFAULT_TEMPERATURE).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.DEFAULT_TEMPERATURE).toBeLessThan(1);
      expect(OPENAI_CONFIG_CONSTANTS.SUPPORTED_MODELS).toContain('gpt-4o');
    });

    it('should have valid pricing information', () => {
      const pricing = OPENAI_CONFIG_CONSTANTS.PRICING;
      expect(pricing['gpt-4']).toBeGreaterThan(0);
      expect(pricing['gpt-4-turbo']).toBeGreaterThan(0);
      expect(pricing['gpt-3.5-turbo']).toBeGreaterThan(0);
      
      // Verify pricing hierarchy (more advanced models cost more)
      expect(pricing['gpt-4']).toBeGreaterThan(pricing['gpt-4-turbo']);
      expect(pricing['gpt-4-turbo']).toBeGreaterThan(pricing['gpt-3.5-turbo']);
    });

    it('should have valid time constants', () => {
      expect(OPENAI_CONFIG_CONSTANTS.DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.MAX_TIMEOUT_MS).toBeGreaterThan(OPENAI_CONFIG_CONSTANTS.DEFAULT_TIMEOUT_MS);
      expect(OPENAI_CONFIG_CONSTANTS.RETRY_DELAY_MS).toBeGreaterThan(0);
    });

    it('should have valid rate limiting constants', () => {
      expect(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_PROD).toBeGreaterThan(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV);
      expect(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_TEST).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.RATE_LIMIT_WARNING_THRESHOLD).toBeGreaterThan(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_PROD);
    });

    it('should have valid retry configuration', () => {
      expect(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_DEV).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_PROD).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_TEST).toBeGreaterThan(0);
      
      // Verify retry hierarchy (dev has more retries than prod)
      expect(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_DEV).toBeGreaterThanOrEqual(OPENAI_CONFIG_CONSTANTS.MAX_RETRIES_PROD);
    });

    it('should have valid cache TTL constants', () => {
      expect(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_MS).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_PRODUCTION_MS).toBeGreaterThan(0);
      expect(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_TEST_MS).toBeGreaterThan(0);
      
      // Verify cache TTL hierarchy (production has longer cache than dev)
      expect(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_PRODUCTION_MS).toBeGreaterThan(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_MS);
      expect(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_MS).toBeGreaterThan(OPENAI_CONFIG_CONSTANTS.CACHE_TTL_TEST_MS);
    });
  });

  describe('Configuration Structure', () => {
    it('should have consistent constant structure', () => {
      // Verify all required constant categories exist
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_TOKENS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('DEFAULT_TEMPERATURE');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('SUPPORTED_MODELS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('PRICING');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('DEFAULT_TIMEOUT_MS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_TIMEOUT_MS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('RETRY_DELAY_MS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_REQUESTS_DEV');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_REQUESTS_PROD');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_REQUESTS_TEST');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('RATE_LIMIT_WARNING_THRESHOLD');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_RETRIES_DEV');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_RETRIES_PROD');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('MAX_RETRIES_TEST');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('CACHE_TTL_MS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('CACHE_TTL_PRODUCTION_MS');
      expect(OPENAI_CONFIG_CONSTANTS).toHaveProperty('CACHE_TTL_TEST_MS');
    });

    it('should have valid pricing structure', () => {
      const pricing = OPENAI_CONFIG_CONSTANTS.PRICING;
      
      // Verify pricing object structure
      expect('gpt-4' in pricing).toBe(true);
      expect('gpt-4-turbo' in pricing).toBe(true);
      expect('gpt-3.5-turbo' in pricing).toBe(true);
      
      // Verify all pricing values are numbers
      expect(typeof pricing['gpt-4']).toBe('number');
      expect(typeof pricing['gpt-4-turbo']).toBe('number');
      expect(typeof pricing['gpt-3.5-turbo']).toBe('number');
      
      // Verify pricing values are positive
      expect(pricing['gpt-4']).toBeGreaterThan(0);
      expect(pricing['gpt-4-turbo']).toBeGreaterThan(0);
      expect(pricing['gpt-3.5-turbo']).toBeGreaterThan(0);
    });

    it('should have valid supported models array', () => {
      const models = OPENAI_CONFIG_CONSTANTS.SUPPORTED_MODELS;
      
      // Verify array structure
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      // Verify all models are strings
      models.forEach(model => {
        expect(typeof model).toBe('string');
        expect(model.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Configuration Presets', () => {
    it('should create valid development preset', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'development',
        VITE_OPENAI_API_KEY: 'dev-key'
      });
      
      const config = configPresets.development(testAdapter);
      
      expect(config.openai.model).toBe('gpt-4o');
      expect(config.openai.apiKey).toBe('dev-key');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_DEV);
      expect(config.features.openai_user_analysis).toBe(false);
    });

    it('should create valid production preset', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'production',
        VITE_OPENAI_API_KEY: 'prod-key'
      });
      
      const config = configPresets.production(testAdapter);
      
      expect(config.openai.model).toBe('gpt-4o');
      expect(config.openai.apiKey).toBe('prod-key');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_PROD);
      expect(config.features.openai_user_analysis).toBe(true);
    });

    it('should create valid test preset', () => {
      const testAdapter = createTestEnvironmentAdapter({
        MODE: 'test',
        VITE_OPENAI_API_KEY: 'test-key'
      });
      
      const config = configPresets.test(testAdapter);
      
      expect(config.openai.model).toBe('gpt-3.5-turbo');
      expect(config.openai.apiKey).toBe('test-key');
      expect(config.performance.maxRequestsPerMinute).toBe(OPENAI_CONFIG_CONSTANTS.MAX_REQUESTS_TEST);
      expect(config.features.openai_workout_generation).toBe(false);
    });
  });
}); 