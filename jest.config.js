// Jest Configuration for AI Service Feature-First Architecture
// Part of Phase 4: Testing & QA

const { defaults } = require('jest-config');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000
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