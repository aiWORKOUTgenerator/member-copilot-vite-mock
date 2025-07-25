// Core AI Services - Shared Components
// These are the fundamental AI service components used across features

export { OpenAIService } from './OpenAIService';
export { OpenAIStrategy } from './OpenAIStrategy';
export { OpenAIWorkoutGenerator } from './OpenAIWorkoutGenerator';
// Recommendation Engine moved to /features/recommendation-system/

// ===== ADVANCED WORKFLOW ORCHESTRATION =====
// Phase 3: Advanced workflow integration capabilities

export { WorkflowOrchestrator } from './orchestration/WorkflowOrchestrator';
export { FeatureBus } from './orchestration/FeatureBus';
export { AdvancedWorkflowIntegration } from './orchestration/AdvancedWorkflowIntegration';

// Workflow Templates and Utilities
export { 
  WORKFLOW_TEMPLATES,
  COMPREHENSIVE_WORKOUT_WORKFLOW,
  REALTIME_WORKOUT_ADAPTATION,
  PROGRESSIVE_TRAINING_PROGRAM,
  MULTI_USER_GROUP_WORKOUT,
  getWorkflowTemplate,
  listWorkflowTemplates,
  getTemplatesByCategory,
  createWorkflowFromTemplate
} from './orchestration/WorkflowTemplates';

// Re-export types that are fundamental to core services
export type { OpenAIServiceOptions } from '../../types/external-ai.types';

// Re-export workflow types
export type * from '../types/workflow.types';

// Re-export feature bus types
export type {
  FeatureEventType,
  FeatureEvent,
  EventHandler,
  FeatureRequest,
  FeatureResponse,
  FeatureCapabilityDefinition,
  FeatureOperationDefinition
} from './orchestration/FeatureBus'; 