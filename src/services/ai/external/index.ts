// External AI Service Layer - OpenAI Integration
// Feature-First Architecture with Advanced Workflow Orchestration (Phase 3)

// ===== SHARED COMPONENTS =====
// Core AI Services (includes advanced workflow orchestration)
export * from './shared/core';

// Infrastructure Components (selective exports)
export { openAIConfig } from './shared/infrastructure/config';
export { OpenAICacheManager } from './shared/infrastructure/cache';
export { OpenAIMetricsTracker } from './shared/infrastructure/metrics';
export { OpenAIErrorHandler, ErrorHandler } from './shared/infrastructure/error-handling';
export { OpenAIRequestHandler } from './shared/infrastructure/request-handling';

// Shared Utilities (selective exports)
export { PromptDataTransformer } from './shared/utils';
export * from './shared/utils/workout-validation';

// Shared Types (includes workflow types)
export * from './shared/types';

// Shared Constants (selective exports)
export * from './shared/constants';

// ===== FEATURES =====
// Feature-First Organization
export * from './features/quick-workout-setup';

// ===== ADVANCED WORKFLOW CAPABILITIES =====
// Phase 3: Advanced workflow orchestration and integration
export {
  WorkflowOrchestrator,
  FeatureBus,
  AdvancedWorkflowIntegration,
  WORKFLOW_TEMPLATES,
  createWorkflowFromTemplate
} from './shared/core';

// ===== LEGACY SUPPORT =====
// Backward compatibility - will be deprecated in future versions
export * from './prompts/index';
export * from './utils/index'; 