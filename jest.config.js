// Jest Configuration for AI Service Feature-First Architecture
// Part of Phase 4: Testing & QA

const { defaults } = require('jest-config');

module.exports = {
  // Basic configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  
  // Test discovery
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  
  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Module path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
    '^@utils/(.*)$': '<rootDir>/__tests__/utils/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/jest.setup.ts',
    '<rootDir>/__tests__/setup/global.setup.ts'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable when running coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
    '!src/main.ts', // Entry point
    '!src/**/*.config.ts'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover'
  ],
  
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific thresholds for critical paths
    './src/services/ai/external/shared/orchestration/': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85
    },
    './src/services/ai/external/shared/communication/': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85
    },
    './src/services/ai/external/shared/infrastructure/performance/': {
      branches: 80,
      functions: 85,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout
  testTimeout: 60000, // 60 seconds for integration and chaos tests
  
  // Projects configuration for different test types
  projects: [
    // Unit tests - fast, isolated
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/unit/**/*.test.ts'
      ],
      testTimeout: 10000,
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup/unit.setup.ts']
    },
    
    // Integration tests - slower, with external dependencies
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/integration/**/*.test.ts'
      ],
      testTimeout: 120000, // 2 minutes
      setupFilesAfterEnv: [
        '<rootDir>/__tests__/setup/integration.setup.ts'
      ],
      // Slower tests can run with less parallelism
      maxWorkers: '50%'
    },
    
    // Chaos engineering tests - system resilience
    {
      displayName: 'chaos',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/chaos/**/*.test.ts'
      ],
      testTimeout: 300000, // 5 minutes
      setupFilesAfterEnv: [
        '<rootDir>/__tests__/setup/chaos.setup.ts'
      ],
      // Run chaos tests sequentially to avoid conflicts
      maxWorkers: 1,
      // Skip chaos tests unless explicitly requested
      testPathIgnorePatterns: process.env.CHAOS_TESTS === 'true' ? [] : ['<rootDir>/__tests__/chaos/']
    },
    
    // Performance tests - load and stress testing
    {
      displayName: 'performance',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/performance/**/*.test.ts'
      ],
      testTimeout: 600000, // 10 minutes
      setupFilesAfterEnv: [
        '<rootDir>/__tests__/setup/performance.setup.ts'
      ],
      maxWorkers: 1,
      // Skip performance tests unless explicitly requested
      testPathIgnorePatterns: process.env.PERFORMANCE_TESTS === 'true' ? [] : ['<rootDir>/__tests__/performance/']
    },
    
    // End-to-end tests - full system testing
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/e2e/**/*.test.ts'
      ],
      testTimeout: 180000, // 3 minutes
      setupFilesAfterEnv: [
        '<rootDir>/__tests__/setup/e2e.setup.ts'
      ],
      maxWorkers: 2,
      // Skip e2e tests unless explicitly requested
      testPathIgnorePatterns: process.env.E2E_TESTS === 'true' ? [] : ['<rootDir>/__tests__/e2e/']
    }
  ],
  
  // Global configuration
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true
      }
    }
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/docker/',
    '<rootDir>/docs/',
    '<rootDir>/tmp/'
  ],
  
  // Watch configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/logs/'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Verbose output for debugging
  verbose: process.env.JEST_VERBOSE === 'true',
  
  // Fail fast in CI
  bail: process.env.CI === 'true' ? 1 : 0,
  
  // Reporters
  reporters: [
    'default',
    // JUnit reporter for CI integration
    process.env.CI === 'true' && [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        uniqueOutputName: 'false',
        suiteName: 'AI Service Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ],
    // Custom performance reporter for performance tests
    process.env.PERFORMANCE_TESTS === 'true' && '<rootDir>/__tests__/reporters/performance.reporter.js'
  ].filter(Boolean),
  
  // Error handling
  errorOnDeprecated: true,
  
  // Node options for memory-intensive tests
  ...(process.env.CHAOS_TESTS === 'true' || process.env.PERFORMANCE_TESTS === 'true' ? {
    maxWorkers: 1,
    workerIdleMemoryLimit: '1GB'
  } : {}),
  
  // Test result processor for custom reporting
  testResultsProcessor: '<rootDir>/__tests__/processors/results.processor.js',
  
  // Custom environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    SUPPRESS_NO_CONFIG_WARNING: 'true'
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'ci') {
  module.exports = {
    ...module.exports,
    collectCoverage: true,
    coverageReporters: ['text', 'lcov', 'clover'],
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: './coverage',
        outputName: 'junit.xml'
      }]
    ],
    maxWorkers: '50%',
    cache: false
  };
}

if (process.env.NODE_ENV === 'development') {
  module.exports = {
    ...module.exports,
    watch: true,
    watchman: true,
    notify: true,
    notifyMode: 'failure',
    collectCoverage: false,
    verbose: true
  };
}

// Debug configuration
if (process.env.DEBUG_TESTS === 'true') {
  module.exports = {
    ...module.exports,
    detectOpenHandles: true,
    detectLeaks: true,
    logHeapUsage: true,
    verbose: true,
    bail: false,
    testTimeout: 0 // Disable timeout for debugging
  };
} 