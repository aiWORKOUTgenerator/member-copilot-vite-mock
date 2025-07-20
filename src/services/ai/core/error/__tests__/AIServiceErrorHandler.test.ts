// Unit tests for AIServiceErrorHandler
import { AIServiceErrorHandler } from '../AIServiceErrorHandler';
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

describe('AIServiceErrorHandler', () => {
  let errorHandler: AIServiceErrorHandler;
  let mockContext: GlobalAIContext;
  let mockSelections: PerWorkoutOptions;

  beforeEach(() => {
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

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const handler = new AIServiceErrorHandler();
      expect(handler).toBeInstanceOf(AIServiceErrorHandler);
    });

    it('should initialize with custom config', () => {
      const handler = new AIServiceErrorHandler({
        enableReporting: false,
        fallbackToLegacy: false,
        maxRetries: 5
      });
      expect(handler).toBeInstanceOf(AIServiceErrorHandler);
    });
  });

  describe('handleError', () => {
    it('should handle general errors', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByComponent['test-component']).toBe(1);
    });

    it('should classify validation errors correctly', () => {
      const error = new Error('Validation failed: invalid input');
      errorHandler.handleError(error, 'validation-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.validation_error).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(1);
    });

    it('should classify context errors correctly', () => {
      const error = new Error('Context error: missing profile');
      errorHandler.handleError(error, 'context-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.context_error).toBe(1);
      expect(stats.errorsBySeverity.medium).toBe(1);
    });

    it('should classify performance errors correctly', () => {
      const error = new Error('Performance timeout: operation took too long');
      errorHandler.handleError(error, 'performance-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.performance_error).toBe(1);
      expect(stats.errorsBySeverity.medium).toBe(1);
    });

    it('should classify analysis errors correctly', () => {
      const error = new Error('Analysis failed: unable to generate insights');
      errorHandler.handleError(error, 'analysis-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.analysis_failure).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(1);
    });

    it('should classify recovery errors correctly', () => {
      const error = new Error('Recovery failed: service reset unsuccessful');
      errorHandler.handleError(error, 'recovery-component');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.recovery_error).toBe(1);
      expect(stats.errorsBySeverity.critical).toBe(1);
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors with expected and actual values', () => {
      const error = new Error('Validation failed');
      const expected = { field: 'energy', value: 5 };
      const actual = { field: 'energy', value: 10 };
      
      errorHandler.handleValidationError(error, expected, actual, 'validation-test');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.validation_error).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(1);
    });
  });

  describe('handleContextError', () => {
    it('should handle context errors', () => {
      const error = new Error('Context error');
      const context = { userId: 'test-user', sessionId: 'test-session' };
      
      errorHandler.handleContextError(error, context);
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.context_error).toBe(1);
      expect(stats.errorsBySeverity.medium).toBe(1);
    });
  });

  describe('handlePerformanceError', () => {
    it('should handle performance errors with metrics', () => {
      const error = new Error('Performance error');
      const metrics = { executionTime: 5000, memoryUsage: 1000000 };
      
      errorHandler.handlePerformanceError(error, metrics, 'performance-test');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.performance_error).toBe(1);
      expect(stats.errorsBySeverity.medium).toBe(1);
    });
  });

  describe('handleRecoveryError', () => {
    it('should handle recovery errors', () => {
      const error = new Error('Recovery failed');
      
      errorHandler.handleRecoveryError(error, 'test-service', 'reset');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType.recovery_error).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(1);
    });
  });

  describe('handleAnalysisError', () => {
    it('should handle analysis errors and return minimal analysis', async () => {
      const error = new Error('Analysis failed');
      
      const result = await errorHandler.handleAnalysisError(
        error,
        mockSelections,
        mockContext
      );
      
      expect(result).toBeDefined();
      expect(result?.confidence).toBe(0.1);
      expect(result?.reasoning).toContain('Minimal analysis generated');
    });

    it('should attempt legacy fallback when enabled', async () => {
      const error = new Error('Analysis failed');
      const legacyImplementations = {
        analyze: jest.fn().mockResolvedValue({ id: 'legacy-analysis' })
      };
      
      const result = await errorHandler.handleAnalysisError(
        error,
        mockSelections,
        mockContext,
        legacyImplementations
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('getErrorStats', () => {
    it('should return correct error statistics', () => {
      // Add some errors
      errorHandler.handleError(new Error('Error 1'), 'component1');
      errorHandler.handleError(new Error('Error 2'), 'component2');
      errorHandler.handleError(new Error('Validation failed'), 'validation');
      
      const stats = errorHandler.getErrorStats();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByComponent['component1']).toBe(1);
      expect(stats.errorsByComponent['component2']).toBe(1);
      expect(stats.errorsByComponent['validation']).toBe(1);
      expect(stats.errorsByType.validation_error).toBe(1);
      expect(stats.errorRate).toBeGreaterThan(0);
    });

    it('should filter recent errors correctly', () => {
      // Add an error
      errorHandler.handleError(new Error('Recent error'), 'test');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.recentErrors.length).toBe(1);
      expect(stats.recentErrors[0].message).toBe('Recent error');
    });
  });

  describe('isHealthy', () => {
    it('should return true when no errors', () => {
      expect(errorHandler.isHealthy()).toBe(true);
    });

    it('should return false when circuit breaker is open', () => {
      // Add enough critical errors to open circuit breaker
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error('Critical error'), 'test');
      }
      
      expect(errorHandler.isHealthy()).toBe(false);
    });

    it('should return false when error rate is too high', () => {
      // Add many errors quickly to increase error rate
      for (let i = 0; i < 10; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), 'test');
      }
      
      expect(errorHandler.isHealthy()).toBe(false);
    });
  });

  describe('getLastError', () => {
    it('should return undefined when no errors', () => {
      expect(errorHandler.getLastError()).toBeUndefined();
    });

    it('should return last error details', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      const lastError = errorHandler.getLastError();
      expect(lastError).toBeDefined();
      expect(lastError?.message).toBe('Test error');
      expect(lastError?.component).toBe('test-component');
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations based on error patterns', () => {
      // Add some errors to trigger recommendations
      for (let i = 0; i < 6; i++) {
        errorHandler.handleError(new Error('Validation failed'), 'validation');
      }
      
      const recommendations = errorHandler.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('validation'))).toBe(true);
    });
  });

  describe('shouldFallbackToLegacy', () => {
    it('should return false when fallback is disabled', () => {
      const handler = new AIServiceErrorHandler({ fallbackToLegacy: false });
      const error = new Error('Test error');
      
      expect(handler.shouldFallbackToLegacy(error)).toBe(false);
    });

    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout');
      expect(errorHandler.shouldFallbackToLegacy(error)).toBe(true);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network connection failed');
      expect(errorHandler.shouldFallbackToLegacy(error)).toBe(true);
    });

    it('should return true when circuit breaker is open', () => {
      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error('Critical error'), 'test');
      }
      
      const error = new Error('Any error');
      expect(errorHandler.shouldFallbackToLegacy(error)).toBe(true);
    });
  });

  describe('circuit breaker', () => {
    it('should open circuit breaker after threshold errors', () => {
      expect(errorHandler.isCircuitBreakerOpen()).toBe(false);
      
      // Add enough critical errors to open circuit breaker
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error('Critical error'), 'test');
      }
      
      expect(errorHandler.isCircuitBreakerOpen()).toBe(true);
    });

    it('should allow manual circuit breaker closure', () => {
      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error('Critical error'), 'test');
      }
      
      expect(errorHandler.isCircuitBreakerOpen()).toBe(true);
      
      errorHandler.closeCircuitBreaker();
      expect(errorHandler.isCircuitBreakerOpen()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset error handler state', () => {
      // Add some errors
      errorHandler.handleError(new Error('Error 1'), 'component1');
      errorHandler.handleError(new Error('Error 2'), 'component2');
      
      expect(errorHandler.getErrorStats().totalErrors).toBe(2);
      
      errorHandler.reset();
      
      expect(errorHandler.getErrorStats().totalErrors).toBe(0);
      expect(errorHandler.getLastError()).toBeUndefined();
      expect(errorHandler.isCircuitBreakerOpen()).toBe(false);
    });
  });

  describe('clearOldErrors', () => {
    it('should clear errors older than specified date', () => {
      // Add an error
      errorHandler.handleError(new Error('Old error'), 'test');
      
      expect(errorHandler.getErrorStats().totalErrors).toBe(1);
      
      // Clear errors older than now (should clear all)
      errorHandler.clearOldErrors(new Date());
      
      expect(errorHandler.getErrorStats().totalErrors).toBe(0);
    });
  });
}); 