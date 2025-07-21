// Jest Setup for Live API Testing - Phase 3D
import { TextEncoder, TextDecoder } from 'util';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables loaded successfully

// Type declarations for global test utilities
declare global {
  var testUtils: {
    isLiveAPITest: boolean;
    originalConsoleLog: typeof console.log;
    originalConsoleWarn: typeof console.warn;
    originalConsoleError: typeof console.error;
  };
}

// Setup fetch for testing environment
if (typeof globalThis.fetch === 'undefined') {
  // Only mock fetch if live API testing is not enabled
  if (process.env.ENABLE_LIVE_API_TESTS !== 'true') {
    globalThis.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Mocked AI response for testing'
            }
          }]
        }),
        text: () => Promise.resolve('Mocked AI response for testing')
      });
    });
  } else {
    // For live API testing, use the real fetch implementation
    const { default: fetch } = require('node-fetch');
    globalThis.fetch = fetch;
  }
}

// Polyfill TextEncoder/TextDecoder for Node.js
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  // Cast to any to resolve type incompatibility between Node.js and DOM TextDecoder
  globalThis.TextDecoder = TextDecoder as any;
}

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Only show console output for live API tests
const isLiveAPITest = process.env.ENABLE_LIVE_API_TESTS === 'true';

if (!isLiveAPITest) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Restore console for live API tests
if (isLiveAPITest) {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}

// Global test utilities
globalThis.testUtils = {
  isLiveAPITest,
  originalConsoleLog,
  originalConsoleWarn,
  originalConsoleError
}; 