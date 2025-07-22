// Workflow Orchestrator - Advanced AI Workflow Coordination Engine
// This orchestrator coordinates complex, multi-step workflows across features

import {
  WorkflowConfig,
  WorkflowContext,
  WorkflowResult,
  WorkflowStep,
  WorkflowStepResult,
  WorkflowTask,
  WorkflowCondition,
  ConditionalTasks,
  WorkflowExecutionStatus,
  WorkflowEvent,
  WorkflowEventType,
  WorkflowMetrics,
  RetryPolicy
} from '../../types/workflow.types';
import { logger } from '../../../../../../utils/logger';

export class WorkflowOrchestrator {
  private activeWorkflows = new Map<string, WorkflowContext>();
  private eventListeners = new Map<WorkflowEventType, Array<(event: WorkflowEvent) => void>>();
  private featureRegistry = new Map<string, any>();

  constructor(private features: Map<string, any> = new Map()) {
    this.featureRegistry = features;
    logger.info('WorkflowOrchestrator initialized', { featureCount: features.size });
  }

  // ===== MAIN WORKFLOW EXECUTION =====

  /**
   * Execute a complete workflow with full orchestration
   */
  async executeWorkflow(config: WorkflowConfig, initialData: Record<string, any> = {}): Promise<WorkflowResult> {
    const executionId = this.generateExecutionId();
    const context = this.createWorkflowContext(config.id, executionId, initialData);
    
    logger.info(`Starting workflow execution`, {
      workflowId: config.id,
      executionId,
      stepCount: config.steps.length
    });

    this.activeWorkflows.set(executionId, context);
    this.emitEvent('workflow-started', config.id, executionId);

    try {
      // Execute all steps in the workflow
      const stepResults: WorkflowStepResult[] = [];
      
      for (const step of config.steps) {
        const stepResult = await this.executeWorkflowStep(step, context, config);
        stepResults.push(stepResult);
        
        // Update context with step result
        context.stepResults[step.id] = stepResult.result;
        context.metrics.completedSteps++;
        
        // Handle step failure based on error handling strategy
        if (stepResult.status === 'failed') {
          if (config.errorHandling.onStepFailure === 'stop') {
            throw stepResult.error;
          } else if (config.errorHandling.onStepFailure === 'fallback' && step.fallback) {
            const fallbackResult = await this.executeWorkflowStep(step.fallback, context, config);
            stepResults.push(fallbackResult);
          }
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - context.startTime.getTime();

      const result: WorkflowResult = {
        workflowId: config.id,
        executionId,
        status: 'completed',
        startTime: context.startTime,
        endTime,
        duration,
        steps: stepResults,
        finalResult: this.aggregateFinalResult(stepResults, config),
        metrics: this.calculateFinalMetrics(context.metrics, stepResults)
      };

      this.emitEvent('workflow-completed', config.id, executionId, result);
      logger.info(`Workflow completed successfully`, {
        workflowId: config.id,
        executionId,
        duration,
        stepCount: stepResults.length
      });

      return result;

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - context.startTime.getTime();

      const result: WorkflowResult = {
        workflowId: config.id,
        executionId,
        status: 'failed',
        startTime: context.startTime,
        endTime,
        duration,
        steps: [],
        error: error as Error,
        metrics: context.metrics
      };

      this.emitEvent('workflow-failed', config.id, executionId, { error: error.message });
      logger.error(`Workflow execution failed`, {
        workflowId: config.id,
        executionId,
        error: error.message,
        duration
      });

      throw result;

    } finally {
      this.activeWorkflows.delete(executionId);
    }
  }

  // ===== PARALLEL EXECUTION =====

  /**
   * Execute multiple tasks in parallel with concurrency control
   */
  async executeParallel(
    tasks: WorkflowTask[], 
    maxConcurrency: number = 5
  ): Promise<WorkflowStepResult[]> {
    logger.info(`Executing ${tasks.length} tasks in parallel`, { maxConcurrency });

    const results: WorkflowStepResult[] = [];
    const executing: Promise<WorkflowStepResult>[] = [];

    for (const task of tasks) {
      // Control concurrency
      if (executing.length >= maxConcurrency) {
        const completed = await Promise.race(executing);
        const index = executing.findIndex(p => p === Promise.resolve(completed));
        executing.splice(index, 1);
        results.push(completed);
      }

      // Start new task execution
      const taskPromise = this.executeFeatureCall(task);
      executing.push(taskPromise);
    }

    // Wait for remaining tasks
    const remainingResults = await Promise.all(executing);
    results.push(...remainingResults);

    logger.info(`Parallel execution completed`, {
      totalTasks: tasks.length,
      successCount: results.filter(r => r.status === 'completed').length,
      failureCount: results.filter(r => r.status === 'failed').length
    });

    return results;
  }

  // ===== SEQUENTIAL EXECUTION =====

  /**
   * Execute tasks sequentially with dependency management
   */
  async executeSequential(steps: WorkflowStep[], context: WorkflowContext): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = [];
    
    logger.info(`Executing ${steps.length} steps sequentially`);

    for (const step of steps) {
      // Check dependencies
      if (step.dependencies && !this.checkDependencies(step.dependencies, context)) {
        const result: WorkflowStepResult = {
          stepId: step.id,
          status: 'skipped',
          duration: 0,
          retryCount: 0,
          timestamp: new Date()
        };
        results.push(result);
        continue;
      }

      const result = await this.executeWorkflowStep(step, context, null);
      results.push(result);
      
      // Update context for next step
      context.stepResults[step.id] = result.result;
    }

    return results;
  }

  // ===== CONDITIONAL EXECUTION =====

  /**
   * Execute tasks based on conditions
   */
  async executeConditional(
    conditionalTasks: ConditionalTasks, 
    context: WorkflowContext
  ): Promise<WorkflowStepResult[]> {
    const conditionMet = this.evaluateCondition(conditionalTasks.condition, context);
    
    logger.info(`Evaluating conditional execution`, {
      condition: conditionalTasks.condition,
      result: conditionMet
    });

    const tasksToExecute = conditionMet 
      ? conditionalTasks.ifTrue 
      : (conditionalTasks.ifFalse || []);

    return this.executeSequential(tasksToExecute, context);
  }

  // ===== WORKFLOW STEP EXECUTION =====

  private async executeWorkflowStep(
    step: WorkflowStep, 
    context: WorkflowContext,
    config: WorkflowConfig | null
  ): Promise<WorkflowStepResult> {
    const startTime = new Date();
    
    this.emitEvent('step-started', context.workflowId, context.executionId, step.id);
    
    logger.info(`Executing workflow step`, {
      workflowId: context.workflowId,
      stepId: step.id,
      stepType: step.type
    });

    try {
      let result: any;

      switch (step.type) {
        case 'feature-call':
          if (!step.feature || !step.operation) {
            throw new Error(`Feature-call step missing feature or operation: ${step.id}`);
          }
          result = await this.executeFeatureCall({
            stepId: step.id,
            feature: step.feature,
            operation: step.operation,
            params: step.params || {},
            context
          });
          break;

        case 'parallel':
          if (!step.parallel) {
            throw new Error(`Parallel step missing parallel steps: ${step.id}`);
          }
          const parallelTasks = step.parallel.map(s => ({
            stepId: s.id,
            feature: s.feature!,
            operation: s.operation!,
            params: s.params || {},
            context
          }));
          result = await this.executeParallel(parallelTasks);
          break;

        case 'sequential':
          if (!step.sequential) {
            throw new Error(`Sequential step missing sequential steps: ${step.id}`);
          }
          result = await this.executeSequential(step.sequential, context);
          break;

        case 'conditional':
          if (!step.condition) {
            throw new Error(`Conditional step missing condition: ${step.id}`);
          }
          const conditionResult = this.evaluateCondition(step.condition, context);
          result = { conditionMet: conditionResult };
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        status: 'completed',
        result,
        duration,
        retryCount: 0,
        timestamp: startTime
      };

      this.emitEvent('step-completed', context.workflowId, context.executionId, step.id, result);
      
      logger.info(`Step completed successfully`, {
        stepId: step.id,
        duration
      });

      return stepResult;

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        status: 'failed',
        error: error as Error,
        duration,
        retryCount: 0,
        timestamp: startTime
      };

      this.emitEvent('step-failed', context.workflowId, context.executionId, step.id, { error: error.message });
      
      logger.error(`Step execution failed`, {
        stepId: step.id,
        error: error.message,
        duration
      });

      return stepResult;
    }
  }

  // ===== FEATURE INTEGRATION =====

  private async executeFeatureCall(task: WorkflowTask): Promise<WorkflowStepResult> {
    const startTime = new Date();
    
    try {
      const feature = this.featureRegistry.get(task.feature);
      if (!feature) {
        throw new Error(`Feature not found: ${task.feature}`);
      }

      if (typeof feature[task.operation] !== 'function') {
        throw new Error(`Operation not found: ${task.operation} in feature ${task.feature}`);
      }

      // Execute the feature operation
      const result = await feature[task.operation](task.params);

      // Update metrics
      task.context.metrics.featureCallCount[task.feature] = 
        (task.context.metrics.featureCallCount[task.feature] || 0) + 1;

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        stepId: task.stepId,
        status: 'completed',
        result,
        duration,
        retryCount: 0,
        timestamp: startTime
      };

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        stepId: task.stepId,
        status: 'failed',
        error: error as Error,
        duration,
        retryCount: 0,
        timestamp: startTime
      };
    }
  }

  // ===== UTILITY METHODS =====

  private createWorkflowContext(workflowId: string, executionId: string, initialData: Record<string, any>): WorkflowContext {
    return {
      workflowId,
      executionId,
      startTime: new Date(),
      data: initialData,
      stepResults: {},
      features: this.featureRegistry,
      metrics: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        parallelExecutions: 0,
        retryCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        featureCallCount: {},
        averageStepDuration: 0
      }
    };
  }

  private evaluateCondition(condition: WorkflowCondition, context: WorkflowContext): boolean {
    if (condition.customValidator) {
      return condition.customValidator(context);
    }

    const fieldValue = this.getFieldValue(condition.field, context);
    
    switch (condition.type) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }

  private getFieldValue(fieldPath: string, context: WorkflowContext): any {
    const parts = fieldPath.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private checkDependencies(dependencies: string[], context: WorkflowContext): boolean {
    return dependencies.every(depId => context.stepResults[depId] !== undefined);
  }

  private aggregateFinalResult(stepResults: WorkflowStepResult[], config: WorkflowConfig): any {
    // Default aggregation - can be customized based on workflow config
    const successfulResults = stepResults
      .filter(r => r.status === 'completed')
      .map(r => r.result);
    
    return {
      summary: {
        totalSteps: stepResults.length,
        successfulSteps: successfulResults.length,
        failedSteps: stepResults.filter(r => r.status === 'failed').length
      },
      results: successfulResults
    };
  }

  private calculateFinalMetrics(metrics: WorkflowMetrics, stepResults: WorkflowStepResult[]): WorkflowMetrics {
    const durations = stepResults.map(r => r.duration);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length || 0;
    
    const slowest = stepResults.reduce((prev, current) => 
      (prev.duration > current.duration) ? prev : current, stepResults[0]);
    
    const fastest = stepResults.reduce((prev, current) => 
      (prev.duration < current.duration) ? prev : current, stepResults[0]);

    return {
      ...metrics,
      totalSteps: stepResults.length,
      averageStepDuration: averageDuration,
      slowestStep: slowest ? { stepId: slowest.stepId, duration: slowest.duration } : undefined,
      fastestStep: fastest ? { stepId: fastest.stepId, duration: fastest.duration } : undefined
    };
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== EVENT SYSTEM =====

  on(eventType: WorkflowEventType, listener: (event: WorkflowEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  private emitEvent(type: WorkflowEventType, workflowId: string, executionId: string, stepId?: string, data?: any): void {
    const event: WorkflowEvent = {
      type,
      workflowId,
      executionId,
      stepId,
      timestamp: new Date(),
      data
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in workflow event listener', { error: error.message, eventType: type });
      }
    });
  }

  // ===== WORKFLOW MANAGEMENT =====

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(executionId: string): Promise<boolean> {
    const context = this.activeWorkflows.get(executionId);
    if (!context) {
      return false;
    }

    this.emitEvent('workflow-cancelled', context.workflowId, executionId);
    this.activeWorkflows.delete(executionId);
    
    logger.info(`Workflow cancelled`, { executionId });
    return true;
  }

  /**
   * Get status of active workflows
   */
  getActiveWorkflows(): Array<{ executionId: string; workflowId: string; startTime: Date }> {
    return Array.from(this.activeWorkflows.entries()).map(([executionId, context]) => ({
      executionId,
      workflowId: context.workflowId,
      startTime: context.startTime
    }));
  }

  /**
   * Register a feature for workflow execution
   */
  registerFeature(name: string, feature: any): void {
    this.featureRegistry.set(name, feature);
    logger.info(`Feature registered for workflows`, { featureName: name });
  }
} 