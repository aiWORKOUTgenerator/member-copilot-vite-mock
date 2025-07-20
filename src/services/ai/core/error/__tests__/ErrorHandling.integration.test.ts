// Integration tests for Error Handling components
import { AIServiceErrorHandler } from '../AIServiceErrorHandler';
import { AIServiceErrorRecovery } from '../AIServiceErrorRecovery';
import { GlobalAIContext, PerWorkoutOptions } from '../../types/AIServiceTypes';

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

describe('Error Handling Integration', () => {
  let errorHandler: AIServiceErrorHandler;
  let errorRecovery: AIServiceErrorRecovery;
  let mockDomainServices: Map<string, any>;
  let mockContext: GlobalAIContext;
  let mockSelections: PerWorkoutOptions;

  beforeEach(() => {
    // Create mock domain services
    mockDomainServices = new Map([
      ['energy', {
        initialize: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(),
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }],
      ['soreness', {
        reset: jest.fn(),
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }],
      ['focus', {
        initialize: jest.fn().mockResolvedValue(undefined),
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }],
      ['duration', {
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }],
      ['equipment', {
        initialize: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(),
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }],
      ['crossComponent', {
        reset: jest.fn(),
        getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
      }]
    ]);

    // Reset all mock functions to ensure clean state
    mockDomainServices.forEach(service => {
      if (service.initialize) service.initialize.mockClear();
      if (service.reset) service.reset.mockClear();
      if (service.getHealthStatus) service.getHealthStatus.mockClear();
    });

    errorHandler = new AIServiceErrorHandler({
      enableReporting: true,
      fallbackToLegacy: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000
    });

    errorRecovery = new AIServiceErrorRecovery(mockDomainServices, {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryableErrors: [
        'timeout',
        'network',
        'connection',
        'service unavailable',
        'temporarily unavailable',
        'temporary',
        'retry'
      ]
    });

    mockContext = {
      userProfile: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        preferences: {
          workoutDuration: 45,
          preferredExercises: ['push-ups', 'squats'],
          equipment: ['dumbbells', 'resistance bands']
        }
      },
      currentSelections: {
        energy: 7,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 45,
        equipment: ['dumbbells']
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: false
      }
    };

    mockSelections = {
      energy: 7,
      soreness: ['legs', 'back'],
      focus: 'strength',
      duration: 45,
      equipment: ['dumbbells']
    };
  });

  describe('Error Handler and Recovery Integration', () => {
    it('should handle service errors with recovery attempts', async () => {
      // Simulate a service error
      const serviceError = new Error('Energy service timeout');
      errorHandler.handleError(serviceError, 'energy-service');
      
      // Attempt recovery
      const recoveryResult = await errorRecovery.attemptRecovery(serviceError, 'energy-service');
      
      // Verify error was handled
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(1);
      expect(errorStats.errorsByType.performance_error).toBe(1);
      
      // Verify recovery was attempted
      expect(recoveryResult).toBe(true);
      
      // Verify service was reinitialized
      expect(mockDomainServices.get('energy').initialize).toHaveBeenCalled();
    });

    it('should handle analysis errors with fallback and recovery', async () => {
      // Simulate an analysis error
      const analysisError = new Error('Analysis failed: unable to generate insights');
      
      // Handle analysis error with fallback
      const analysisResult = await errorHandler.handleAnalysisError(
        analysisError,
        mockSelections,
        mockContext
      );
      
      // Verify error was handled
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(1);
      expect(errorStats.errorsByType.analysis_failure).toBe(1);
      
      // Verify fallback analysis was generated
      expect(analysisResult).toBeDefined();
      expect(analysisResult?.confidence).toBe(0.1);
      expect(analysisResult?.reasoning).toContain('Minimal analysis generated');
      
      // Attempt recovery
      const recoveryResult = await errorRecovery.attemptRecovery(analysisError, 'analysis');
      expect(recoveryResult).toBe(false); // Analysis errors are not retryable
    });

    it('should handle validation errors without recovery', async () => {
      // Simulate a validation error
      const validationError = new Error('Validation failed: invalid energy level');
      errorHandler.handleValidationError(validationError, { expected: 5 }, { actual: 10 }, 'validation');
      
      // Verify error was handled
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(1);
      expect(errorStats.errorsByType.validation_error).toBe(1);
      expect(errorStats.errorsBySeverity.high).toBe(1);
      
      // Attempt recovery (should fail for validation errors)
      const recoveryResult = await errorRecovery.attemptRecovery(validationError, 'validation');
      expect(recoveryResult).toBe(false);
    });

    it('should handle circuit breaker integration', async () => {
      // Add enough critical errors to open circuit breaker
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error('Critical service failure'), 'energy-service');
      }
      
      // Verify circuit breaker is open
      expect(errorHandler.isCircuitBreakerOpen()).toBe(true);
      expect(errorHandler.isHealthy()).toBe(false);
      
      // Verify fallback is triggered
      const anyError = new Error('Any error');
      expect(errorHandler.shouldFallbackToLegacy(anyError)).toBe(true);
      
      // Attempt recovery (should still work for service recovery)
      const recoveryResult = await errorRecovery.attemptRecovery(new Error('Energy timeout'), 'energy-service');
      expect(recoveryResult).toBe(true);
      
      // Close circuit breaker
      errorHandler.closeCircuitBreaker();
      expect(errorHandler.isCircuitBreakerOpen()).toBe(false);
    });

    it('should handle retry logic with error classification', async () => {
      // Create a function that fails with retryable errors
      let callCount = 0;
      const failingFunction = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Service temporarily unavailable');
        }
        return Promise.resolve('success');
      });
      
      // Execute with retry
      const result = await errorRecovery.executeWithRetry(failingFunction, 'test-operation');
      
      // Verify function was called multiple times
      expect(failingFunction).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
      
      // Verify no errors were logged (since retry succeeded)
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(0);
    });

    it('should handle retry failure with error logging', async () => {
      // Create a function that always fails with retryable errors
      const alwaysFailingFunction = jest.fn().mockRejectedValue(new Error('Service unavailable'));
      
      // Execute with retry (should fail after max retries)
      await expect(
        errorRecovery.executeWithRetry(alwaysFailingFunction, 'test-operation')
      ).rejects.toThrow('Service unavailable');
      
      // Verify function was called multiple times
      expect(alwaysFailingFunction).toHaveBeenCalledTimes(4); // Initial + 3 retries
      
      // Log the final error
      errorHandler.handleError(new Error('Service unavailable'), 'test-operation');
      
      // Verify error was logged
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(1);
    });

    it('should handle force recovery with error handling', async () => {
      // Make some services fail
      mockDomainServices.get('energy').initialize.mockRejectedValue(new Error('Init failed'));
      mockDomainServices.get('soreness').reset.mockImplementation(() => {
        throw new Error('Reset failed');
      });
      
      // Force recovery
      const recoveryResult = await errorRecovery.forceRecovery();
      
      // Verify recovery results
      expect(recoveryResult.success).toBe(false);
      expect(recoveryResult.failedServices).toContain('energy');
      expect(recoveryResult.failedServices).toContain('soreness');
      expect(recoveryResult.errors).toContain('energy: Init failed');
      expect(recoveryResult.errors).toContain('soreness: Reset failed');
      
      // Log recovery errors
      recoveryResult.errors.forEach(error => {
        errorHandler.handleError(new Error(error), 'recovery');
      });
      
      // Verify recovery errors were logged
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBe(2);
      expect(errorStats.errorsByType.recovery_error).toBe(2);
    });

    it('should handle error patterns and recommendations', async () => {
      // Add multiple validation errors to trigger pattern detection
      for (let i = 0; i < 6; i++) {
        errorHandler.handleError(new Error('Validation failed'), 'validation');
      }
      
      // Add some performance errors
      for (let i = 0; i < 4; i++) {
        errorHandler.handleError(new Error('Performance timeout'), 'performance');
      }
      
      // Get recommendations
      const recommendations = errorHandler.getRecommendations();
      
      // Verify recommendations are generated
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('validation'))).toBe(true);
      expect(recommendations.some(rec => rec.includes('Performance'))).toBe(true);
      
      // Verify error patterns are detected
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.errorsByType.validation_error).toBe(6);
      expect(errorStats.errorsByType.performance_error).toBe(4);
    });

    it('should handle complete error lifecycle', async () => {
      // 1. Initial state
      expect(errorHandler.isHealthy()).toBe(true);
      expect(errorHandler.getErrorStats().totalErrors).toBe(0);
      
      // 2. Service error occurs
      const serviceError = new Error('Energy service timeout');
      errorHandler.handleError(serviceError, 'energy-service');
      
      // 3. Verify error is logged
      expect(errorHandler.getErrorStats().totalErrors).toBe(1);
      expect(errorHandler.getLastError()?.message).toBe('Energy service timeout');
      
      // 4. Attempt recovery
      const recoveryResult = await errorRecovery.attemptRecovery(serviceError, 'energy-service');
      expect(recoveryResult).toBe(true);
      
      // 5. Verify recovery stats
      const recoveryStats = errorRecovery.getRecoveryStats();
      expect(recoveryStats.totalAttempts).toBe(1);
      expect(recoveryStats.successfulRecoveries).toBe(1);
      
      // 6. Reset components
      errorHandler.reset();
      errorRecovery.reset();
      
      // 7. Verify reset state
      expect(errorHandler.getErrorStats().totalErrors).toBe(0);
      expect(errorHandler.getLastError()).toBeUndefined();
      expect(errorRecovery.getRecoveryStats().totalAttempts).toBe(0);
    });

    it('should handle legacy fallback integration', async () => {
      // Simulate analysis failure
      const analysisError = new Error('Analysis failed');
      
      // Handle with legacy fallback
      const analysisResult = await errorHandler.handleAnalysisError(
        analysisError,
        mockSelections,
        mockContext,
        { analyze: jest.fn().mockResolvedValue({ id: 'legacy' }) }
      );
      
      // Verify fallback was attempted
      expect(analysisResult).toBeDefined();
      
      // Attempt legacy fallback through recovery
      const legacyResult = await errorRecovery.fallbackToLegacy('analysis', mockContext);
      expect(legacyResult).toBeDefined();
      expect(legacyResult.confidence).toBe(0.1);
    });

    it('should handle error rate monitoring', async () => {
      // Add many errors quickly to increase error rate
      for (let i = 0; i < 200; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), 'test');
      }
      
      // Verify error rate is high
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.errorRate).toBeGreaterThan(3); // More than 3 errors per minute
      
      // Verify service is unhealthy
      expect(errorHandler.isHealthy()).toBe(false);
      
      // Verify recommendations include error rate warning
      const recommendations = errorHandler.getRecommendations();
      expect(recommendations.some(rec => rec.includes('error rate'))).toBe(true);
    });
  });

  describe('Error Recovery Statistics Integration', () => {
    it('should track recovery attempts and success rates', async () => {
      // Perform various recovery attempts
      await errorRecovery.attemptRecovery(new Error('Energy timeout'), 'energy-service');
      await errorRecovery.attemptRecovery(new Error('Soreness timeout'), 'soreness-service');
      await errorRecovery.attemptRecovery(new Error('Service temporarily unavailable'), 'validation');
      
      // Get recovery statistics
      const recoveryStats = errorRecovery.getRecoveryStats();
      
      // Verify statistics
      expect(recoveryStats.totalAttempts).toBe(3);
      expect(recoveryStats.successfulRecoveries).toBe(2); // energy and soreness
      expect(recoveryStats.failedRecoveries).toBe(1); // validation
      expect(recoveryStats.successRate).toBe(2/3);
      expect(recoveryStats.recentAttempts.length).toBe(3);
      // Note: averageRecoveryTime might be 0 in test environment due to fast execution
    });

    it('should handle recovery attempt history limits', async () => {
      // Add many recovery attempts to test history limits
      for (let i = 0; i < 150; i++) {
        await errorRecovery.attemptRecovery(new Error(`Error ${i}`), 'test-service');
      }
      
      // Verify history is limited
      const recoveryStats = errorRecovery.getRecoveryStats();
      expect(recoveryStats.totalAttempts).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handler Statistics Integration', () => {
    it('should track error patterns across components', async () => {
      // Add errors from different components
      errorHandler.handleError(new Error('Energy error'), 'energy');
      errorHandler.handleError(new Error('Soreness error'), 'soreness');
      errorHandler.handleError(new Error('Focus error'), 'focus');
      errorHandler.handleError(new Error('Energy error 2'), 'energy');
      errorHandler.handleError(new Error('Energy error 3'), 'energy');
      
      // Get error statistics
      const errorStats = errorHandler.getErrorStats();
      
      // Verify component tracking
      expect(errorStats.errorsByComponent['energy']).toBe(3);
      expect(errorStats.errorsByComponent['soreness']).toBe(1);
      expect(errorStats.errorsByComponent['focus']).toBe(1);
      
      // Verify total errors
      expect(errorStats.totalErrors).toBe(5);
    });

    it('should handle error log size limits', async () => {
      // Add many errors to test log size limits
      for (let i = 0; i < 1500; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), 'test');
      }
      
      // Verify log is limited
      const errorStats = errorHandler.getErrorStats();
      expect(errorStats.totalErrors).toBeLessThanOrEqual(1000);
    });
  });
}); 