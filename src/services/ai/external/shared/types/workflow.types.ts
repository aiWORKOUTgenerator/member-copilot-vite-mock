// Workflow Types - Advanced Orchestration System
// These types define the structure for complex, multi-step AI workflows

// ===== CORE WORKFLOW TYPES =====

export type WorkflowStepType = 'sequential' | 'parallel' | 'conditional' | 'feature-call' | 'custom';

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  feature?: string; // Which feature to call
  operation?: string; // Which operation in the feature
  params?: any; // Parameters for the step
  dependencies?: string[]; // Step IDs this step depends on
  timeout?: number; // Step-specific timeout in ms
  retries?: number; // Number of retries for this step
  condition?: WorkflowCondition; // For conditional steps
  parallel?: WorkflowStep[]; // For parallel execution
  sequential?: WorkflowStep[]; // For sequential execution
  fallback?: WorkflowStep; // Fallback step on failure
}

export interface WorkflowCondition {
  type: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'exists' | 'custom';
  field: string; // Path to field in workflow context
  value?: any; // Expected value
  customValidator?: (context: WorkflowContext) => boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number; // Exponential backoff multiplier
  initialDelay: number; // Initial delay in ms
  maxDelay: number; // Maximum delay in ms
  retryableErrors?: string[]; // Only retry these error types
}

export interface ErrorHandlingStrategy {
  onStepFailure: 'stop' | 'continue' | 'retry' | 'fallback';
  onWorkflowFailure: 'rollback' | 'cleanup' | 'ignore';
  rollbackSteps?: string[]; // Steps to rollback on failure
  cleanupSteps?: string[]; // Steps to run for cleanup
}

// ===== WORKFLOW CONFIGURATION =====

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  steps: WorkflowStep[];
  errorHandling: ErrorHandlingStrategy;
  timeout: number; // Global timeout in ms
  retryPolicy: RetryPolicy;
  maxConcurrency?: number; // Max parallel steps
  metadata?: Record<string, any>;
}

// ===== WORKFLOW EXECUTION =====

export interface WorkflowContext {
  workflowId: string;
  executionId: string;
  startTime: Date;
  userId?: string;
  data: Record<string, any>; // Shared data across steps
  stepResults: Record<string, any>; // Results from completed steps
  features: Map<string, any>; // Available features
  metrics: WorkflowMetrics;
}

export interface WorkflowTask {
  stepId: string;
  feature: string;
  operation: string;
  params: any;
  context: WorkflowContext;
}

export interface WorkflowStepResult {
  stepId: string;
  status: WorkflowExecutionStatus;
  result?: any;
  error?: Error;
  duration: number;
  retryCount: number;
  timestamp: Date;
}

export interface WorkflowResult {
  workflowId: string;
  executionId: string;
  status: WorkflowExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: WorkflowStepResult[];
  finalResult?: any;
  error?: Error;
  metrics: WorkflowMetrics;
}

// ===== WORKFLOW METRICS AND MONITORING =====

export interface WorkflowMetrics {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  parallelExecutions: number;
  retryCount: number;
  cacheHits: number;
  cacheMisses: number;
  featureCallCount: Record<string, number>;
  averageStepDuration: number;
  slowestStep?: { stepId: string; duration: number };
  fastestStep?: { stepId: string; duration: number };
}

// ===== WORKFLOW EVENTS =====

export type WorkflowEventType = 
  | 'workflow-started'
  | 'workflow-completed' 
  | 'workflow-failed'
  | 'workflow-cancelled'
  | 'step-started'
  | 'step-completed'
  | 'step-failed'
  | 'step-retrying'
  | 'step-skipped';

export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  executionId: string;
  stepId?: string;
  timestamp: Date;
  data?: any;
}

// ===== WORKFLOW TEMPLATES =====

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ai-generation' | 'data-processing' | 'analysis' | 'integration';
  template: WorkflowConfig;
  parameterSchema: Record<string, any>; // JSON Schema for parameters
  examples: WorkflowTemplateExample[];
}

export interface WorkflowTemplateExample {
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedResult: any;
}

// ===== CONDITIONAL WORKFLOW TYPES =====

export interface ConditionalTasks {
  condition: WorkflowCondition;
  ifTrue: WorkflowStep[];
  ifFalse?: WorkflowStep[];
}

// ===== WORKFLOW REGISTRY =====

export interface WorkflowRegistry {
  registerWorkflow(config: WorkflowConfig): void;
  getWorkflow(id: string): WorkflowConfig | undefined;
  listWorkflows(): WorkflowConfig[];
  validateWorkflow(config: WorkflowConfig): WorkflowValidationResult;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ===== FEATURE INTEGRATION TYPES =====

export interface FeatureCapability {
  featureName: string;
  operations: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  estimatedDuration?: number; // In milliseconds
  cacheable?: boolean;
}

export interface FeatureRegistry {
  registerFeature(feature: FeatureCapability): void;
  getFeature(name: string): FeatureCapability | undefined;
  listFeatures(): FeatureCapability[];
} 