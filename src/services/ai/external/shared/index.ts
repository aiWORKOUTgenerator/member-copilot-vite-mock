// Shared Components - Main Export
// This file provides organized exports for all shared AI service components

// Core AI Services
export * from './core';

// Infrastructure Components (selective exports for clean API)
export { openAIConfig } from './infrastructure/config';
export { OpenAICacheManager } from './infrastructure/cache';
export { OpenAIMetricsTracker } from './infrastructure/metrics';
export { OpenAIErrorHandler, ErrorHandler } from './infrastructure/error-handling';
export { OpenAIRequestHandler } from './infrastructure/request-handling';

// Shared Utilities (selective exports)
export { PromptDataTransformer } from './utils';
export * from './utils/workout-validation';

// Shared Types
export * from './types';

// Shared Constants (selective exports)
export * from './constants'; 