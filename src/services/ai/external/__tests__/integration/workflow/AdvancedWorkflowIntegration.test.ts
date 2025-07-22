// Advanced Workflow Integration - Comprehensive Tests
// These tests validate the Phase 3 workflow orchestration system

import { 
  AdvancedWorkflowIntegration,
  WorkflowOrchestrator,
  FeatureBus,
  COMPREHENSIVE_WORKOUT_WORKFLOW,
  createWorkflowFromTemplate
} from '../../../shared/core';
import type {
  ComprehensiveWorkoutParams,
  ComprehensiveWorkoutResult
} from '../../../shared/core/orchestration/AdvancedWorkflowIntegration';

// Mock logger to avoid actual logging during tests
jest.mock('../../../../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock the config to avoid import.meta issues in Jest
jest.mock('../../../shared/infrastructure/config/openai.config', () => ({
  openAIConfig: jest.fn(() => ({
    openai: {
      apiKey: 'test-api-key',
      organizationId: 'test-org',
      baseURL: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4',
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000
    }
  })),
  validateConfig: jest.fn(() => ({ isValid: true, errors: [] }))
}));

// Mock other potential problematic imports
jest.mock('../../../shared/core/OpenAIService', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    generateFromTemplate: jest.fn()
  }))
}));

jest.mock('../../../shared/core/OpenAIStrategy', () => ({
  OpenAIStrategy: jest.fn()
}));

jest.mock('../../../shared/core/OpenAIWorkoutGenerator', () => ({
  OpenAIWorkoutGenerator: jest.fn()
}));

jest.mock('../../../shared/core/OpenAIRecommendationEngine', () => ({
  OpenAIRecommendationEngine: jest.fn()
}));

describe('Phase 3: Advanced Workflow Integration', () => {
  let integration: AdvancedWorkflowIntegration;
  let orchestrator: WorkflowOrchestrator;
  let featureBus: FeatureBus;

  beforeEach(async () => {
    // Initialize fresh instances for each test
    integration = new AdvancedWorkflowIntegration();
    orchestrator = new WorkflowOrchestrator();
    featureBus = new FeatureBus();

    // Allow time for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    // Cleanup after each test
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('WorkflowOrchestrator', () => {
    test('should initialize with proper configuration', async () => {
      const activeWorkflows = orchestrator.getActiveWorkflows();
      expect(activeWorkflows).toEqual([]);
      expect(orchestrator).toBeInstanceOf(WorkflowOrchestrator);
    });

    test('should execute simple workflow successfully', async () => {
      const mockFeature = {
        testOperation: jest.fn().mockResolvedValue({ success: true, data: 'test result' })
      };

      orchestrator.registerFeature('test-feature', mockFeature);

      const simpleWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        timeout: 10000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'stop' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'test-step',
            name: 'Test Step',
            type: 'feature-call' as const,
            feature: 'test-feature',
            operation: 'testOperation',
            params: { test: 'data' }
          }
        ]
      };

      const result = await orchestrator.executeWorkflow(simpleWorkflow);

      expect(result.status).toBe('completed');
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].status).toBe('completed');
      expect(mockFeature.testOperation).toHaveBeenCalledWith({ test: 'data' });
    });

    test('should handle workflow failures gracefully', async () => {
      const mockFeature = {
        failingOperation: jest.fn().mockRejectedValue(new Error('Test failure'))
      };

      orchestrator.registerFeature('failing-feature', mockFeature);

      const failingWorkflow = {
        id: 'failing-workflow',
        name: 'Failing Workflow',
        version: '1.0.0',
        timeout: 10000,
        retryPolicy: {
          maxAttempts: 1,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'stop' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'failing-step',
            name: 'Failing Step',
            type: 'feature-call' as const,
            feature: 'failing-feature',
            operation: 'failingOperation',
            params: {}
          }
        ]
      };

      await expect(orchestrator.executeWorkflow(failingWorkflow)).rejects.toThrow();
    });

    test('should execute parallel steps concurrently', async () => {
      const mockFeature = {
        operation1: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { result: 'op1' };
        }),
        operation2: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
          return { result: 'op2' };
        })
      };

      orchestrator.registerFeature('parallel-feature', mockFeature);

      const parallelTasks = [
        {
          stepId: 'task1',
          feature: 'parallel-feature',
          operation: 'operation1',
          params: {},
          context: {
            workflowId: 'test',
            executionId: 'test',
            startTime: new Date(),
            data: {},
            stepResults: {},
            features: new Map([['parallel-feature', mockFeature]]),
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
          }
        },
        {
          stepId: 'task2',
          feature: 'parallel-feature',
          operation: 'operation2',
          params: {},
          context: {
            workflowId: 'test',
            executionId: 'test',
            startTime: new Date(),
            data: {},
            stepResults: {},
            features: new Map([['parallel-feature', mockFeature]]),
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
          }
        }
      ];

      const startTime = Date.now();
      const results = await orchestrator.executeParallel(parallelTasks, 5);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('completed');
      expect(results[1].status).toBe('completed');
      
      // Should complete in less time than sequential execution (100 + 150 = 250ms)
      expect(duration).toBeLessThan(200);
    });
  });

  describe('FeatureBus', () => {
    test('should register and discover features', async () => {
      const mockFeature = { testMethod: jest.fn() };
      const capabilities = {
        name: 'test-feature',
        version: '1.0.0',
        description: 'Test feature',
        operations: [
          {
            name: 'testMethod',
            description: 'Test method',
            cacheable: false,
            retryable: true
          }
        ]
      };

      featureBus.registerFeature('test-feature', mockFeature, capabilities);

      const discoveredFeatures = featureBus.discoverFeatures();
      expect(discoveredFeatures).toHaveLength(1);
      expect(discoveredFeatures[0].name).toBe('test-feature');
      expect(discoveredFeatures[0].version).toBe('1.0.0');
    });

    test('should handle feature communication via events', async () => {
      const eventHandler = jest.fn();
      
      featureBus.subscribe('workout-generated', eventHandler, {
        feature: 'test-subscriber'
      });

      await featureBus.publish('workout-generated', { workoutId: 'test-123' }, {
        source: 'test-publisher'
      });

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'workout-generated',
          source: 'test-publisher',
          data: { workoutId: 'test-123' }
        })
      );
    });

    test('should handle request-response communication', async () => {
      const mockFeature = {
        getData: jest.fn().mockResolvedValue({ result: 'test data' })
      };
      
      const capabilities = {
        name: 'data-feature',
        version: '1.0.0',
        description: 'Data feature',
        operations: [
          {
            name: 'getData',
            description: 'Get test data',
            cacheable: false,
            retryable: true
          }
        ]
      };

      featureBus.registerFeature('data-feature', mockFeature, capabilities);

      const result = await featureBus.request('data-feature', 'getData', { param: 'test' });

      expect(result).toEqual({ result: 'test data' });
      expect(mockFeature.getData).toHaveBeenCalledWith({ param: 'test' });
    });

    test('should provide health check functionality', async () => {
      const healthStatus = await featureBus.healthCheck();

      expect(healthStatus).toHaveProperty('status');
      expect(healthStatus).toHaveProperty('details');
      expect(healthStatus.status).toBe('healthy');
    });
  });

  describe('Comprehensive Workflow Integration', () => {
    test('should generate comprehensive workout successfully', async () => {
      const params: ComprehensiveWorkoutParams = {
        userId: 'test-user-123',
        duration: 30,
        focus: 'strength',
        equipment: ['dumbbells', 'bench'],
        fitnessLevel: 'intermediate',
        preferences: {
          intensity: 'medium',
          restTime: 60,
          coachingStyle: 'encouraging'
        },
        goals: ['build-strength', 'improve-endurance'],
        limitations: []
      };

      const result = await integration.generateComprehensiveWorkout(params);

      // Validate result structure
      expect(result).toHaveProperty('workflowId');
      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('baseWorkout');
      expect(result).toHaveProperty('userAnalysis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('detailedWorkout');
      expect(result).toHaveProperty('metadata');

      // Validate metadata
      expect(result.metadata).toHaveProperty('totalExecutionTime');
      expect(result.metadata).toHaveProperty('featuresUsed');
      expect(result.metadata.totalExecutionTime).toBeGreaterThan(0);
      expect(result.metadata.featuresUsed).toBeInstanceOf(Array);

      // Validate workflow execution
      expect(result.workflowId).toBe('comprehensive-workout-generation');
      expect(typeof result.executionId).toBe('string');
    }, 15000); // Extend timeout for comprehensive test

    test('should handle real-time workout adaptation', async () => {
      const adaptationParams = {
        userId: 'test-user-123',
        workoutId: 'workout-456',
        currentExercise: { name: 'Push-ups', sets: 3, reps: 12 },
        performanceData: { fatigue: 0.7, heartRate: 150 },
        userFeedback: { difficulty: 'hard', enjoyment: 'medium' }
      };

      const result = await integration.adaptWorkoutInRealTime(adaptationParams);

      expect(result).toHaveProperty('workflowId');
      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('completed');
    }, 10000);

    test('should provide comprehensive health status', async () => {
      const healthStatus = await integration.getHealthStatus();

      expect(healthStatus).toHaveProperty('orchestrator');
      expect(healthStatus).toHaveProperty('featureBus');
      expect(healthStatus).toHaveProperty('registeredFeatures');
      expect(healthStatus).toHaveProperty('activeWorkflows');

      expect(healthStatus.orchestrator.status).toBe('healthy');
      expect(healthStatus.featureBus.status).toBe('healthy');
      expect(healthStatus.registeredFeatures).toBeInstanceOf(Array);
      expect(healthStatus.registeredFeatures.length).toBeGreaterThan(0);
    });

    test('should provide workflow capability discovery', () => {
      const capabilities = integration.discoverCapabilities();

      expect(capabilities).toHaveProperty('features');
      expect(capabilities).toHaveProperty('workflows');
      expect(capabilities).toHaveProperty('integrationPatterns');

      expect(capabilities.features).toBeInstanceOf(Array);
      expect(capabilities.workflows).toBeInstanceOf(Array);
      expect(capabilities.integrationPatterns).toContain('sequential-execution');
      expect(capabilities.integrationPatterns).toContain('parallel-execution');
      expect(capabilities.integrationPatterns).toContain('event-driven-communication');
    });
  });

  describe('Workflow Templates', () => {
    test('should create workflow from template with parameter substitution', () => {
      const parameters = {
        userId: 'test-user-456',
        duration: 45,
        focus: 'cardio',
        equipment: ['treadmill', 'weights']
      };

      const workflowConfig = createWorkflowFromTemplate('comprehensive-workout', parameters);

      expect(workflowConfig).not.toBeNull();
      expect(workflowConfig!.id).toBe('comprehensive-workout-generation');
      expect(workflowConfig!.name).toBe('Comprehensive Workout Generation');
      expect(workflowConfig!.steps).toHaveLength(COMPREHENSIVE_WORKOUT_WORKFLOW.steps.length);
    });

    test('should validate comprehensive workout workflow template', () => {
      expect(COMPREHENSIVE_WORKOUT_WORKFLOW.id).toBe('comprehensive-workout-generation');
      expect(COMPREHENSIVE_WORKOUT_WORKFLOW.steps).toHaveLength(6);
      
      // Validate step structure
      const stepIds = COMPREHENSIVE_WORKOUT_WORKFLOW.steps.map(step => step.id);
      expect(stepIds).toContain('analyze-user-preferences');
      expect(stepIds).toContain('generate-base-workout');
      expect(stepIds).toContain('parallel-enhancement');
      expect(stepIds).toContain('generate-detailed-workout');
      expect(stepIds).toContain('finalize-workout');

      // Validate parallel step structure
      const parallelStep = COMPREHENSIVE_WORKOUT_WORKFLOW.steps.find(step => step.id === 'parallel-enhancement');
      expect(parallelStep).toBeDefined();
      expect(parallelStep!.type).toBe('parallel');
      expect(parallelStep!.parallel).toHaveLength(3);
    });

    test('should handle workflow execution with dependencies', async () => {
      const mockFeature = {
        step1: jest.fn().mockResolvedValue({ result: 'step1-complete' }),
        step2: jest.fn().mockResolvedValue({ result: 'step2-complete' }),
        step3: jest.fn().mockResolvedValue({ result: 'step3-complete' })
      };

      orchestrator.registerFeature('dependency-feature', mockFeature);

      const dependencyWorkflow = {
        id: 'dependency-test',
        name: 'Dependency Test',
        version: '1.0.0',
        timeout: 10000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'stop' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            type: 'feature-call' as const,
            feature: 'dependency-feature',
            operation: 'step1',
            params: {}
          },
          {
            id: 'step2',
            name: 'Step 2',
            type: 'feature-call' as const,
            feature: 'dependency-feature',
            operation: 'step2',
            params: {},
            dependencies: ['step1']
          },
          {
            id: 'step3',
            name: 'Step 3',
            type: 'feature-call' as const,
            feature: 'dependency-feature',
            operation: 'step3',
            params: {},
            dependencies: ['step1', 'step2']
          }
        ]
      };

      const result = await orchestrator.executeWorkflow(dependencyWorkflow);

      expect(result.status).toBe('completed');
      expect(result.steps).toHaveLength(3);
      
      // Verify execution order by checking that dependent steps have access to previous results
      expect(mockFeature.step1).toHaveBeenCalled();
      expect(mockFeature.step2).toHaveBeenCalled();
      expect(mockFeature.step3).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle feature timeouts gracefully', async () => {
      const mockFeature = {
        slowOperation: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { result: 'slow-complete' };
        })
      };

      orchestrator.registerFeature('slow-feature', mockFeature);

      const timeoutWorkflow = {
        id: 'timeout-test',
        name: 'Timeout Test',
        version: '1.0.0',
        timeout: 1000, // 1 second timeout
        retryPolicy: {
          maxAttempts: 1,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'stop' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'slow-step',
            name: 'Slow Step',
            type: 'feature-call' as const,
            feature: 'slow-feature',
            operation: 'slowOperation',
            params: {},
            timeout: 500 // Step timeout shorter than operation
          }
        ]
      };

      await expect(orchestrator.executeWorkflow(timeoutWorkflow)).rejects.toThrow();
    }, 3000);

    test('should execute fallback steps on failure', async () => {
      const mockFeature = {
        failingOperation: jest.fn().mockRejectedValue(new Error('Primary operation failed')),
        fallbackOperation: jest.fn().mockResolvedValue({ result: 'fallback-success' })
      };

      orchestrator.registerFeature('fallback-feature', mockFeature);

      const fallbackWorkflow = {
        id: 'fallback-test',
        name: 'Fallback Test',
        version: '1.0.0',
        timeout: 10000,
        retryPolicy: {
          maxAttempts: 1,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'fallback' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'primary-step',
            name: 'Primary Step',
            type: 'feature-call' as const,
            feature: 'fallback-feature',
            operation: 'failingOperation',
            params: {},
            fallback: {
              id: 'fallback-step',
              name: 'Fallback Step',
              type: 'feature-call' as const,
              feature: 'fallback-feature',
              operation: 'fallbackOperation',
              params: {}
            }
          }
        ]
      };

      const result = await orchestrator.executeWorkflow(fallbackWorkflow);

      expect(result.status).toBe('completed');
      expect(mockFeature.failingOperation).toHaveBeenCalled();
      expect(mockFeature.fallbackOperation).toHaveBeenCalled();
    });
  });

  describe('Performance and Metrics', () => {
    test('should track workflow execution metrics', async () => {
      const mockFeature = {
        trackedOperation: jest.fn().mockResolvedValue({ result: 'tracked' })
      };

      orchestrator.registerFeature('tracked-feature', mockFeature);

      const trackedWorkflow = {
        id: 'metrics-test',
        name: 'Metrics Test',
        version: '1.0.0',
        timeout: 10000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
          maxDelay: 5000
        },
        errorHandling: {
          onStepFailure: 'stop' as const,
          onWorkflowFailure: 'cleanup' as const
        },
        steps: [
          {
            id: 'tracked-step',
            name: 'Tracked Step',
            type: 'feature-call' as const,
            feature: 'tracked-feature',
            operation: 'trackedOperation',
            params: {}
          }
        ]
      };

      const result = await orchestrator.executeWorkflow(trackedWorkflow);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalSteps).toBe(1);
      expect(result.metrics.completedSteps).toBe(1);
      expect(result.metrics.failedSteps).toBe(0);
      expect(result.metrics.averageStepDuration).toBeGreaterThan(0);
    });

    test('should provide integration metrics', () => {
      const metrics = integration.getMetrics();

      expect(metrics).toHaveProperty('featureBus');
      expect(metrics).toHaveProperty('workflows');
      expect(metrics.featureBus).toHaveProperty('eventsPublished');
      expect(metrics.featureBus).toHaveProperty('requestsProcessed');
      expect(metrics.workflows).toHaveProperty('totalExecuted');
    });
  });
});

// Helper function to create mock workflow context
function createMockWorkflowContext() {
  return {
    workflowId: 'test-workflow',
    executionId: 'test-execution',
    startTime: new Date(),
    data: {},
    stepResults: {},
    features: new Map(),
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