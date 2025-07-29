# WorkflowOrchestrator API Reference

## 📋 **Overview**

The `WorkflowOrchestrator` is the core engine for coordinating complex, multi-step AI workflows. It provides sophisticated execution patterns including sequential, parallel, and conditional processing with comprehensive error handling and monitoring.

## 🎯 **Class Definition**

```typescript
class WorkflowOrchestrator {
  constructor(features?: Map<string, any>)
  
  // Core Execution Methods
  executeWorkflow(config: WorkflowConfig): Promise<WorkflowResult>
  executeSequential(tasks: WorkflowTask[]): Promise<WorkflowResult>
  executeParallel(tasks: WorkflowTask[], maxConcurrency?: number): Promise<WorkflowResult[]>
  executeConditional(condition: WorkflowCondition, tasks: ConditionalTasks): Promise<WorkflowResult>
  
  // Workflow Management
  pauseWorkflow(workflowId: string): Promise<void>
  resumeWorkflow(workflowId: string): Promise<void>
  cancelWorkflow(workflowId: string): Promise<void>
  getWorkflowStatus(workflowId: string): WorkflowStatus | undefined
  
  // Event System
  on(eventType: WorkflowEventType, listener: (event: WorkflowEvent) => void): void
  off(eventType: WorkflowEventType, listener: (event: WorkflowEvent) => void): void
  
  // Feature Management
  registerFeature(name: string, feature: any): void
  getFeature(name: string): any | undefined
  listFeatures(): string[]
}
```

## 🚀 **Core Methods**

### **executeWorkflow(config: WorkflowConfig): Promise<WorkflowResult>**

Executes a complete workflow based on the provided configuration.

**Parameters:**
```typescript
interface WorkflowConfig {
  id: string;                    // Unique workflow identifier
  name: string;                  // Human-readable workflow name
  steps: WorkflowStep[];         // Ordered list of workflow steps
  timeout?: number;              // Global timeout in milliseconds
  retryPolicy?: RetryPolicy;     // Retry configuration
  metadata?: Record<string, any>; // Additional workflow metadata
}

interface WorkflowStep {
  id: string;                    // Unique step identifier
  name: string;                  // Human-readable step name
  type: WorkflowStepType;        // Step execution type
  feature?: string;              // Feature to execute (for feature steps)
  operation?: string;            // Operation to call on feature
  params?: any;                  // Parameters to pass to operation
  dependencies?: string[];       // Step IDs this step depends on
  timeout?: number;              // Step-specific timeout
  retries?: number;              // Number of retry attempts
  condition?: WorkflowCondition; // Conditional execution logic
  fallback?: WorkflowStep;       // Fallback step on failure
}
```

**Returns:**
```typescript
interface WorkflowResult {
  workflowId: string;
  success: boolean;
  steps: WorkflowStepResult[];
  startTime: Date;
  endTime: Date;
  duration: number;
  metadata: Record<string, any>;
  errors?: WorkflowError[];
}
```

**Example: Basic Workflow Execution**
```typescript
const orchestrator = new WorkflowOrchestrator();

const basicWorkflow: WorkflowConfig = {
  id: 'basic-workout-generation',
  name: 'Basic Workout Generation',
  steps: [
    {
      id: 'generate-workout',
      name: 'Generate Quick Workout',
      type: 'feature',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: {
        duration: 30,
        fitnessLevel: 'intermediate',
        focus: 'strength'
      }
    }
  ],
  timeout: 30000
};

const result = await orchestrator.executeWorkflow(basicWorkflow);
console.log('Workout generated:', result.steps[0].result);
```

### **executeSequential(tasks: WorkflowTask[]): Promise<WorkflowResult>**

Executes tasks in sequential order, waiting for each to complete before starting the next.

**Example: Sequential Processing**
```typescript
const tasks = [
  {
    id: 'analyze-user',
    name: 'Analyze User Profile',
    feature: 'user-analysis',
    operation: 'analyzeProfile',
    params: { userId: 'user123' }
  },
  {
    id: 'generate-workout',
    name: 'Generate Personalized Workout',
    feature: 'quick-workout-setup',
    operation: 'generateWorkout',
    params: { /* will be populated from previous step */ }
  }
];

const result = await orchestrator.executeSequential(tasks);
```

### **executeParallel(tasks: WorkflowTask[], maxConcurrency?: number): Promise<WorkflowResult[]>**

Executes tasks in parallel with optional concurrency control.

**Example: Parallel Enhancement**
```typescript
const enhancementTasks = [
  {
    id: 'equipment-analysis',
    feature: 'equipment-analyzer',
    operation: 'analyzeEquipment',
    params: { workout: baseWorkout }
  },
  {
    id: 'safety-validation',
    feature: 'safety-validator',
    operation: 'validateSafety',
    params: { workout: baseWorkout }
  },
  {
    id: 'generate-recommendations',
    feature: 'recommender',
    operation: 'generateRecommendations',
    params: { workout: baseWorkout }
  }
];

// Execute with max 3 concurrent tasks
const results = await orchestrator.executeParallel(enhancementTasks, 3);
```

### **executeConditional(condition: WorkflowCondition, tasks: ConditionalTasks): Promise<WorkflowResult>**

Executes tasks based on conditional logic.

**Example: Conditional Execution**
```typescript
const condition: WorkflowCondition = {
  type: 'expression',
  expression: 'userProfile.fitnessLevel === "advanced"'
};

const conditionalTasks: ConditionalTasks = {
  ifTrue: [
    {
      id: 'advanced-workout',
      feature: 'advanced-generator',
      operation: 'generateAdvanced',
      params: { intensity: 'high' }
    }
  ],
  ifFalse: [
    {
      id: 'basic-workout',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: { intensity: 'moderate' }
    }
  ]
};

const result = await orchestrator.executeConditional(condition, conditionalTasks);
```

## 🔄 **Workflow Management**

### **Active Workflow Control**

```typescript
// Pause a running workflow
await orchestrator.pauseWorkflow('workout-generation-123');

// Resume a paused workflow
await orchestrator.resumeWorkflow('workout-generation-123');

// Cancel a workflow
await orchestrator.cancelWorkflow('workout-generation-123');

// Check workflow status
const status = orchestrator.getWorkflowStatus('workout-generation-123');
console.log('Current status:', status?.status); // 'running', 'paused', 'completed', 'failed'
```

## 📊 **Event System**

The orchestrator emits events throughout the workflow lifecycle:

```typescript
// Listen for workflow events
orchestrator.on('workflow-started', (event) => {
  console.log(`Workflow ${event.workflowId} started`);
});

orchestrator.on('step-completed', (event) => {
  console.log(`Step ${event.stepId} completed in ${event.duration}ms`);
});

orchestrator.on('workflow-completed', (event) => {
  console.log(`Workflow ${event.workflowId} completed successfully`);
  console.log('Performance metrics:', event.metrics);
});

orchestrator.on('workflow-failed', (event) => {
  console.error(`Workflow ${event.workflowId} failed:`, event.error);
});
```

### **Available Events**

- `workflow-started` - Workflow execution begins
- `workflow-completed` - Workflow completes successfully
- `workflow-failed` - Workflow fails with error
- `workflow-paused` - Workflow is paused
- `workflow-resumed` - Workflow is resumed
- `step-started` - Individual step begins
- `step-completed` - Individual step completes
- `step-failed` - Individual step fails

## 🎯 **Advanced Patterns**

### **Complex Workflow with Dependencies**

```typescript
const complexWorkflow: WorkflowConfig = {
  id: 'comprehensive-fitness-analysis',
  name: 'Comprehensive Fitness Analysis',
  steps: [
    // Foundation step - no dependencies
    {
      id: 'user-analysis',
      name: 'Analyze User Profile',
      type: 'feature',
      feature: 'user-analyzer',
      operation: 'analyzeProfile',
      params: { userId: '{{userId}}' }
    },
    
    // Parallel enhancement steps - depend on user analysis
    {
      id: 'workout-generation',
      name: 'Generate Base Workout',
      type: 'feature',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      dependencies: ['user-analysis'],
      params: {
        duration: '{{duration}}',
        preferences: '{{user-analysis.result.preferences}}'
      }
    },
    {
      id: 'equipment-analysis',
      name: 'Analyze Available Equipment',
      type: 'feature',
      feature: 'equipment-analyzer',
      operation: 'analyzeEquipment',
      dependencies: ['user-analysis'],
      params: {
        available: '{{equipment}}',
        preferences: '{{user-analysis.result.equipment_preferences}}'
      }
    },
    
    // Final enhancement - depends on both previous steps
    {
      id: 'workout-enhancement',
      name: 'Enhance Workout with Equipment',
      type: 'feature',
      feature: 'workout-enhancer',
      operation: 'enhanceWorkout',
      dependencies: ['workout-generation', 'equipment-analysis'],
      params: {
        baseWorkout: '{{workout-generation.result}}',
        equipmentAnalysis: '{{equipment-analysis.result}}'
      }
    }
  ],
  timeout: 60000,
  retryPolicy: {
    maxAttempts: 3,
    backoffMultiplier: 1.5,
    initialDelay: 1000
  }
};

// Execute with parameter substitution
const result = await orchestrator.executeWorkflow(complexWorkflow, {
  userId: 'user123',
  duration: 30,
  equipment: ['dumbbells', 'resistance-bands']
});
```

### **Error Handling and Fallbacks**

```typescript
const resilientWorkflow: WorkflowConfig = {
  id: 'resilient-workout-generation',
  name: 'Resilient Workout Generation',
  steps: [
    {
      id: 'ai-workout-generation',
      name: 'AI-Powered Workout Generation',
      type: 'feature',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: { duration: 30, focus: 'strength' },
      retries: 2,
      fallback: {
        id: 'template-workout-generation',
        name: 'Template-Based Workout Generation',
        type: 'feature',
        feature: 'template-generator',
        operation: 'generateFromTemplate',
        params: { template: 'strength-30min' }
      }
    }
  ]
};

const result = await orchestrator.executeWorkflow(resilientWorkflow);
```

## 📈 **Performance Monitoring**

```typescript
// Get performance metrics for a workflow
orchestrator.on('workflow-completed', (event) => {
  const metrics = event.metrics;
  
  console.log('Performance Metrics:');
  console.log(`Total Duration: ${metrics.totalDuration}ms`);
  console.log(`Step Count: ${metrics.stepCount}`);
  console.log(`Success Rate: ${metrics.successRate}%`);
  console.log(`Average Step Duration: ${metrics.avgStepDuration}ms`);
  console.log(`Parallel Efficiency: ${metrics.parallelEfficiency}%`);
  
  // Step-by-step breakdown
  metrics.stepMetrics.forEach(step => {
    console.log(`${step.name}: ${step.duration}ms (${step.status})`);
  });
});
```

## 🔧 **Configuration Best Practices**

### **Timeout Configuration**
```typescript
const timeoutConfig: WorkflowConfig = {
  id: 'timeout-example',
  name: 'Timeout Configuration Example',
  timeout: 45000, // Global 45s timeout
  steps: [
    {
      id: 'quick-step',
      name: 'Quick Operation',
      timeout: 5000, // 5s timeout for this step
      // ... step configuration
    },
    {
      id: 'slow-step',
      name: 'Potentially Slow Operation',
      timeout: 30000, // 30s timeout for this step
      // ... step configuration
    }
  ]
};
```

### **Retry Policy Configuration**
```typescript
const retryConfig: RetryPolicy = {
  maxAttempts: 3,           // Try up to 3 times
  initialDelay: 1000,       // Start with 1s delay
  backoffMultiplier: 2,     // Double delay each retry
  maxDelay: 10000,          // Cap at 10s delay
  retryableErrors: [        // Only retry specific errors
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMIT_ERROR'
  ]
};
```

## 🎯 **TypeScript Integration**

Full TypeScript support with comprehensive type definitions:

```typescript
import {
  WorkflowOrchestrator,
  WorkflowConfig,
  WorkflowResult,
  WorkflowStepType,
  WorkflowEvent
} from '@/services/ai/external/shared/core/orchestration';

// Type-safe workflow configuration
const typedWorkflow: WorkflowConfig = {
  id: 'typed-workflow',
  name: 'Type-Safe Workflow',
  steps: [
    {
      id: 'step1',
      name: 'Typed Step',
      type: WorkflowStepType.FEATURE, // Strongly typed
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: {
        duration: 30, // Type-checked parameters
        fitnessLevel: 'intermediate'
      }
    }
  ]
};

// Type-safe result handling
const result: WorkflowResult = await orchestrator.executeWorkflow(typedWorkflow);
```

## 📞 **Support and Examples**

- **[Workflow Templates](../workflows/templates.md)** - Pre-built workflow configurations
- **[Integration Examples](../../integration/advanced/)** - Advanced integration patterns
- **[Performance Tuning](../../production/performance/)** - Optimization strategies
- **[Troubleshooting](../../troubleshooting/)** - Common issues and solutions

---

**The WorkflowOrchestrator provides enterprise-grade workflow coordination with production-ready resilience patterns.** 