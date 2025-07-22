// AI Service Comprehensive Integration Tests
// Part of Phase 4: Testing & QA

import { describe, beforeAll, afterAll, beforeEach, it, expect, jest } from '@jest/globals';
import supertest from 'supertest';
import { Express } from 'express';
import { WorkflowOrchestrator } from '../../src/services/ai/external/shared/orchestration/WorkflowOrchestrator';
import { FeatureBus } from '../../src/services/ai/external/shared/communication/FeatureBus';
import { PerformanceInfrastructure } from '../../src/services/ai/external/shared/infrastructure/performance';
import { WorkflowConfig, WorkflowResult } from '../../src/services/ai/external/types/workflow.types';

// Test Data
const SAMPLE_WORKOUT_CONFIG: WorkflowConfig = {
  id: 'test-workout-generation',
  name: 'Test Workout Generation',
  description: 'Integration test workflow',
  steps: [
    {
      id: 'energy-assessment',
      name: 'Energy Assessment',
      type: 'feature',
      feature: 'QuickWorkoutSetup',
      operation: 'assessEnergyLevel',
      params: {
        currentEnergy: 7,
        timeOfDay: 'morning',
        sleepQuality: 8
      }
    },
    {
      id: 'focus-selection',
      name: 'Focus Selection',
      type: 'feature',
      feature: 'QuickWorkoutSetup',
      operation: 'selectFocusAreas',
      params: {
        primaryFocus: 'strength',
        secondaryFocus: 'cardio'
      },
      dependencies: ['energy-assessment']
    },
    {
      id: 'workout-generation',
      name: 'Generate Workout',
      type: 'feature',
      feature: 'QuickWorkoutSetup',
      operation: 'generateWorkout',
      params: {
        duration: 30,
        equipment: ['dumbbells', 'bodyweight']
      },
      dependencies: ['focus-selection']
    }
  ],
  timeout: 120000,
  retries: 2
};

// Mock implementations for testing
const mockAIService = {
  processRequest: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' })
};

describe('AI Service Integration Tests', () => {
  let app: Express;
  let request: supertest.SuperTest<supertest.Test>;
  let orchestrator: WorkflowOrchestrator;
  let featureBus: FeatureBus;
  let performanceInfrastructure: PerformanceInfrastructure;

  // ===== SETUP AND TEARDOWN =====
  beforeAll(async () => {
    // Initialize test environment
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
    
    // Initialize core services
    orchestrator = new WorkflowOrchestrator();
    featureBus = new FeatureBus();
    performanceInfrastructure = await import('../../src/services/ai/external/shared/infrastructure/performance')
      .then(module => module.createPerformanceInfrastructure());

    // Mock external dependencies
    jest.mock('../../src/services/ai/external/OpenAIService', () => mockAIService);

    // Setup test server
    const { createApp } = await import('../../src/app');
    app = createApp({
      orchestrator,
      featureBus,
      performanceInfrastructure
    });
    
    request = supertest(app);

    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup
    await performanceInfrastructure?.shutdown();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock responses
    mockAIService.processRequest.mockResolvedValue({
      success: true,
      data: { recommendation: 'Sample workout recommendation' }
    });
  });

  // ===== HEALTH CHECK TESTS =====
  describe('Health Check Integration', () => {
    it('should return healthy status for all components', async () => {
      const response = await request
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        services: {
          orchestrator: { status: 'healthy' },
          featureBus: { status: 'healthy' },
          database: { status: expect.stringMatching(/healthy|warning/) },
          redis: { status: expect.stringMatching(/healthy|warning/) }
        }
      });
    });

    it('should provide detailed health metrics', async () => {
      const response = await request
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('performance');
      expect(response.body.performance).toHaveProperty('averageResponseTime');
      expect(response.body.performance).toHaveProperty('requestCount');
    });
  });

  // ===== WORKFLOW ORCHESTRATION INTEGRATION =====
  describe('Workflow Orchestration Integration', () => {
    it('should execute a complete workout generation workflow', async () => {
      const startTime = Date.now();

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: SAMPLE_WORKOUT_CONFIG })
        .expect(200);

      const executionTime = Date.now() - startTime;

      expect(response.body).toMatchObject({
        success: true,
        workflowId: SAMPLE_WORKOUT_CONFIG.id,
        result: expect.any(Object),
        metadata: {
          executionTime: expect.any(Number),
          stepsCompleted: 3,
          stepsSkipped: 0,
          stepsError: 0
        }
      });

      // Performance assertions
      expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(response.body.metadata.executionTime).toBeLessThan(25000);
    });

    it('should handle parallel workflow execution', async () => {
      const parallelConfig: WorkflowConfig = {
        ...SAMPLE_WORKOUT_CONFIG,
        id: 'test-parallel-workflow',
        steps: [
          {
            id: 'parallel-group',
            name: 'Parallel Assessment',
            type: 'parallel',
            parallel: [
              {
                id: 'energy-check',
                name: 'Energy Check',
                type: 'feature',
                feature: 'QuickWorkoutSetup',
                operation: 'quickEnergyCheck',
                params: { currentEnergy: 7 }
              },
              {
                id: 'equipment-check',
                name: 'Equipment Check',
                type: 'feature',
                feature: 'QuickWorkoutSetup',
                operation: 'checkEquipment',
                params: { available: ['dumbbells'] }
              }
            ]
          }
        ]
      };

      const startTime = Date.now();
      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: parallelConfig })
        .expect(200);

      const executionTime = Date.now() - startTime;

      expect(response.body.success).toBe(true);
      // Parallel execution should be faster than sequential
      expect(executionTime).toBeLessThan(15000);
    });

    it('should handle workflow errors gracefully', async () => {
      // Configure mock to fail
      mockAIService.processRequest.mockRejectedValueOnce(new Error('AI Service unavailable'));

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: SAMPLE_WORKOUT_CONFIG })
        .expect(200); // Should still return 200 but with error details

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
        partialResults: expect.any(Object),
        metadata: {
          stepsCompleted: expect.any(Number),
          stepsError: expect.any(Number)
        }
      });
    });

    it('should implement circuit breaker for failing services', async () => {
      // Simulate repeated failures
      mockAIService.processRequest.mockRejectedValue(new Error('Service overloaded'));

      // Make multiple requests to trigger circuit breaker
      const requests = Array.from({ length: 6 }, () =>
        request.post('/api/v1/workflows/execute').send({ config: SAMPLE_WORKOUT_CONFIG })
      );

      const responses = await Promise.all(requests);

      // Should start failing fast after threshold
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.body.error).toContain('Circuit breaker');
    });
  });

  // ===== FEATURE BUS INTEGRATION =====
  describe('Feature Bus Integration', () => {
    it('should facilitate inter-feature communication', async () => {
      const response = await request
        .post('/api/v1/features/communicate')
        .send({
          from: 'QuickWorkoutSetup',
          to: 'EnergyAIService',
          type: 'request',
          payload: { userId: 'test-user', currentEnergy: 8 }
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('response');
    });

    it('should handle feature discovery', async () => {
      const response = await request
        .get('/api/v1/features/discover')
        .expect(200);

      expect(response.body).toHaveProperty('features');
      expect(response.body.features).toContain('QuickWorkoutSetup');
      expect(response.body.features).toContain('EnergyAIService');
    });

    it('should publish and handle events', async () => {
      const eventPayload = {
        type: 'workout.generated',
        data: { workoutId: 'test-123', userId: 'user-456' }
      };

      const response = await request
        .post('/api/v1/events/publish')
        .send(eventPayload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check event was processed
      const eventsResponse = await request
        .get('/api/v1/events/recent')
        .expect(200);

      expect(eventsResponse.body.events).toContainEqual(
        expect.objectContaining({
          type: 'workout.generated'
        })
      );
    });
  });

  // ===== PERFORMANCE INTEGRATION =====
  describe('Performance Integration', () => {
    it('should track and report performance metrics', async () => {
      // Execute several requests to generate metrics
      const requests = Array.from({ length: 5 }, () =>
        request.post('/api/v1/workflows/execute').send({ config: SAMPLE_WORKOUT_CONFIG })
      );

      await Promise.all(requests);

      // Check metrics endpoint
      const response = await request
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('ai_requests_total');
      expect(response.text).toContain('ai_request_duration_seconds');
      expect(response.text).toContain('workflow_execution_duration_seconds');
    });

    it('should provide performance dashboard data', async () => {
      const response = await request
        .get('/api/v1/performance/dashboard')
        .expect(200);

      expect(response.body).toMatchObject({
        timestamp: expect.any(String),
        overview: {
          totalWorkflows: expect.any(Number),
          activeWorkflows: expect.any(Number),
          averageResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
          throughput: expect.any(Number)
        },
        alerts: expect.any(Array),
        trends: expect.any(Array)
      });
    });

    it('should automatically optimize slow workflows', async () => {
      const slowConfig: WorkflowConfig = {
        ...SAMPLE_WORKOUT_CONFIG,
        id: 'slow-workflow',
        steps: SAMPLE_WORKOUT_CONFIG.steps.map(step => ({
          ...step,
          timeout: 60000 // Very generous timeout
        }))
      };

      const response = await request
        .post('/api/v1/workflows/optimize')
        .send({ config: slowConfig })
        .expect(200);

      expect(response.body).toMatchObject({
        originalConfig: expect.any(Object),
        optimizedConfig: expect.any(Object),
        optimizations: expect.any(Array),
        performance: {
          estimatedSpeedupPercent: expect.any(Number),
          estimatedMemoryReduction: expect.any(Number),
          estimatedCostReduction: expect.any(Number)
        }
      });

      expect(response.body.performance.estimatedSpeedupPercent).toBeGreaterThan(0);
    });
  });

  // ===== CACHING INTEGRATION =====
  describe('Caching Integration', () => {
    it('should cache workflow results appropriately', async () => {
      const cacheableConfig = {
        ...SAMPLE_WORKOUT_CONFIG,
        id: 'cacheable-workflow'
      };

      // First request - should miss cache
      const startTime1 = Date.now();
      const response1 = await request
        .post('/api/v1/workflows/execute')
        .send({ config: cacheableConfig })
        .expect(200);
      const duration1 = Date.now() - startTime1;

      // Second request - should hit cache
      const startTime2 = Date.now();
      const response2 = await request
        .post('/api/v1/workflows/execute')
        .send({ config: cacheableConfig })
        .expect(200);
      const duration2 = Date.now() - startTime2;

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      
      // Cached request should be significantly faster
      expect(duration2).toBeLessThan(duration1 * 0.5);
      
      // Check cache headers
      expect(response2.headers['x-cache']).toBe('HIT');
    });

    it('should invalidate cache when appropriate', async () => {
      const cacheKey = 'test-cache-invalidation';
      
      // Set cache
      await request
        .post('/api/v1/cache/set')
        .send({ key: cacheKey, value: { test: 'data' }, ttl: 3600 })
        .expect(200);

      // Verify cache exists
      const getResponse = await request
        .get(`/api/v1/cache/get/${cacheKey}`)
        .expect(200);
      
      expect(getResponse.body.found).toBe(true);

      // Invalidate cache
      await request
        .delete(`/api/v1/cache/invalidate/${cacheKey}`)
        .expect(200);

      // Verify cache is invalidated
      const getResponse2 = await request
        .get(`/api/v1/cache/get/${cacheKey}`)
        .expect(200);
      
      expect(getResponse2.body.found).toBe(false);
    });
  });

  // ===== ERROR HANDLING INTEGRATION =====
  describe('Error Handling Integration', () => {
    it('should handle malformed workflow configurations', async () => {
      const malformedConfig = {
        // Missing required fields
        id: 'malformed-workflow'
      };

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: malformedConfig })
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.stringContaining('validation'),
        details: expect.any(Array)
      });
    });

    it('should handle timeout scenarios', async () => {
      const timeoutConfig: WorkflowConfig = {
        ...SAMPLE_WORKOUT_CONFIG,
        id: 'timeout-workflow',
        timeout: 1000, // Very short timeout
        steps: [{
          id: 'slow-step',
          name: 'Slow Step',
          type: 'feature',
          feature: 'QuickWorkoutSetup',
          operation: 'slowOperation',
          params: {}
        }]
      };

      // Mock a slow operation
      mockAIService.processRequest.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 2000))
      );

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: timeoutConfig })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('timeout');
    });

    it('should provide detailed error information for debugging', async () => {
      mockAIService.processRequest.mockRejectedValueOnce(
        new Error('Detailed error for debugging')
      );

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: SAMPLE_WORKOUT_CONFIG })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('stack');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('requestId');
    });
  });

  // ===== LOAD TESTING =====
  describe('Load Testing Integration', () => {
    it('should handle concurrent workflow executions', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        request
          .post('/api/v1/workflows/execute')
          .send({ 
            config: {
              ...SAMPLE_WORKOUT_CONFIG,
              id: `concurrent-workflow-${i}`
            }
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Should handle concurrent load efficiently
      expect(totalTime).toBeLessThan(60000); // Within 1 minute
      
      // Average time per request should be reasonable
      const avgTimePerRequest = totalTime / concurrentRequests;
      expect(avgTimePerRequest).toBeLessThan(10000); // Less than 10 seconds average
    });

    it('should maintain performance under sustained load', async () => {
      const sustainedDuration = 30000; // 30 seconds
      const requestInterval = 1000; // 1 request per second
      const startTime = Date.now();
      let requestCount = 0;
      let errorCount = 0;

      const sustainedTest = async () => {
        while (Date.now() - startTime < sustainedDuration) {
          try {
            requestCount++;
            await request
              .post('/api/v1/workflows/execute')
              .send({ 
                config: {
                  ...SAMPLE_WORKOUT_CONFIG,
                  id: `sustained-${requestCount}`
                }
              });
          } catch (error) {
            errorCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
      };

      await sustainedTest();

      const errorRate = errorCount / requestCount;
      expect(errorRate).toBeLessThan(0.05); // Less than 5% error rate
      expect(requestCount).toBeGreaterThan(20); // Should have made reasonable requests
    });
  });

  // ===== DATA INTEGRITY TESTS =====
  describe('Data Integrity Integration', () => {
    it('should maintain workflow state consistency', async () => {
      const workflowId = 'consistency-test-workflow';
      
      // Start workflow
      const startResponse = await request
        .post('/api/v1/workflows/execute')
        .send({ 
          config: {
            ...SAMPLE_WORKOUT_CONFIG,
            id: workflowId
          }
        })
        .expect(200);

      expect(startResponse.body.success).toBe(true);

      // Check workflow state
      const stateResponse = await request
        .get(`/api/v1/workflows/state/${workflowId}`)
        .expect(200);

      expect(stateResponse.body).toMatchObject({
        workflowId,
        status: 'completed',
        stepsCompleted: expect.any(Number),
        result: expect.any(Object)
      });
    });

    it('should handle database transaction rollbacks correctly', async () => {
      // This would test database integration if we had it set up
      // For now, we'll test the transaction handling logic
      
      const transactionConfig = {
        ...SAMPLE_WORKOUT_CONFIG,
        id: 'transaction-test',
        transactional: true
      };

      // Mock a scenario where the last step fails
      mockAIService.processRequest
        .mockResolvedValueOnce({ success: true, data: 'step1' })
        .mockResolvedValueOnce({ success: true, data: 'step2' })
        .mockRejectedValueOnce(new Error('Final step failed'));

      const response = await request
        .post('/api/v1/workflows/execute')
        .send({ config: transactionConfig })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('transaction rolled back');
    });
  });

  // ===== MONITORING INTEGRATION =====
  describe('Monitoring Integration', () => {
    it('should generate proper audit logs', async () => {
      await request
        .post('/api/v1/workflows/execute')
        .send({ config: SAMPLE_WORKOUT_CONFIG })
        .expect(200);

      const auditResponse = await request
        .get('/api/v1/audit/recent')
        .expect(200);

      expect(auditResponse.body.logs).toContainEqual(
        expect.objectContaining({
          action: 'workflow.execute',
          workflowId: SAMPLE_WORKOUT_CONFIG.id,
          timestamp: expect.any(String),
          userId: expect.any(String)
        })
      );
    });

    it('should track feature usage metrics', async () => {
      // Execute workflow to generate metrics
      await request
        .post('/api/v1/workflows/execute')
        .send({ config: SAMPLE_WORKOUT_CONFIG })
        .expect(200);

      const metricsResponse = await request
        .get('/api/v1/metrics/features')
        .expect(200);

      expect(metricsResponse.body).toHaveProperty('QuickWorkoutSetup');
      expect(metricsResponse.body.QuickWorkoutSetup).toMatchObject({
        totalRequests: expect.any(Number),
        averageResponseTime: expect.any(Number),
        errorRate: expect.any(Number)
      });
    });
  });
});

// ===== HELPER FUNCTIONS =====
const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 100
): Promise<boolean> => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
};

const generateLoadTestData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    ...SAMPLE_WORKOUT_CONFIG,
    id: `load-test-${i}`,
    params: {
      ...SAMPLE_WORKOUT_CONFIG.steps[0].params,
      userId: `user-${i}`,
      sessionId: `session-${i}`
    }
  }));
};

export { waitForCondition, generateLoadTestData }; 