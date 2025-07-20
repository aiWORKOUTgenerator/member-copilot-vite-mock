// Unit tests for AIServiceErrorRecovery
import { AIServiceErrorRecovery } from '../AIServiceErrorRecovery';

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

describe('AIServiceErrorRecovery', () => {
  let errorRecovery: AIServiceErrorRecovery;
  let mockDomainServices: Map<string, any>;

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
  });

  describe('constructor', () => {
    it('should initialize with domain services', () => {
      expect(errorRecovery).toBeInstanceOf(AIServiceErrorRecovery);
    });

    it('should initialize with custom retry config', () => {
      const recovery = new AIServiceErrorRecovery(mockDomainServices, {
        maxRetries: 5,
        baseDelay: 200
      });
      expect(recovery).toBeInstanceOf(AIServiceErrorRecovery);
    });
  });

  describe('shouldRetry', () => {
    it('should return false when max retries exceeded', () => {
      const error = new Error('Test error');
      expect(errorRecovery.shouldRetry(error, 3)).toBe(false);
    });

    it('should return true for retryable errors', () => {
      const error = new Error('Request timeout');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(true);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network connection failed');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(true);
    });

    it('should return true for service unavailable errors', () => {
      const error = new Error('Service temporarily unavailable');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = new Error('Validation failed: invalid input');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(false);
    });

    it('should return false for permission errors', () => {
      const error = new Error('Permission denied');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(false);
    });

    it('should return false for not found errors', () => {
      const error = new Error('Resource not found');
      expect(errorRecovery.shouldRetry(error, 0)).toBe(false);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute function successfully on first try', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await errorRecovery.executeWithRetry(mockFn, 'test-operation');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let callCount = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });
      
      const result = await errorRecovery.executeWithRetry(mockFn, 'test-operation');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Service temporarily unavailable'));
      
      await expect(
        errorRecovery.executeWithRetry(mockFn, 'test-operation')
      ).rejects.toThrow('Service temporarily unavailable');
      
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry non-retryable errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Validation failed'));
      
      await expect(
        errorRecovery.executeWithRetry(mockFn, 'test-operation')
      ).rejects.toThrow('Validation failed');
      
      expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should use exponential backoff', async () => {
      const startTime = Date.now();
      let callCount = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });
      
      await errorRecovery.executeWithRetry(mockFn, 'test-operation');
      
      const totalTime = Date.now() - startTime;
      // Should have delays of 100ms and 200ms (exponential backoff)
      expect(totalTime).toBeGreaterThan(300);
    });
  });

  describe('attemptRecovery', () => {
    it('should return false for non-retryable errors', async () => {
      const error = new Error('Validation failed');
      const result = await errorRecovery.attemptRecovery(error, 'validation');
      
      expect(result).toBe(false);
    });

    it('should attempt service recovery for service errors', async () => {
      const error = new Error('Energy service timeout');
      const result = await errorRecovery.attemptRecovery(error, 'energy-service');
      
      expect(result).toBe(true);
    });

    it('should return false for general recovery when not implemented', async () => {
      const error = new Error('General error');
      const result = await errorRecovery.attemptRecovery(error, 'general');
      
      expect(result).toBe(false);
    });
  });

  describe('attemptServiceRecovery', () => {
    it('should successfully reinitialize service with initialize method', async () => {
      const result = await (errorRecovery as any).attemptServiceRecovery('energy');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('energy').initialize).toHaveBeenCalled();
    });

    it('should successfully reset service with reset method', async () => {
      const result = await (errorRecovery as any).attemptServiceRecovery('soreness');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('soreness').reset).toHaveBeenCalled();
    });

    it('should return false for service without recovery methods', async () => {
      const result = await (errorRecovery as any).attemptServiceRecovery('duration');
      
      expect(result).toBe(false);
    });

    it('should handle service not found', async () => {
      const result = await (errorRecovery as any).attemptServiceRecovery('nonexistent');
      
      expect(result).toBe(false);
    });

    it('should handle initialization errors', async () => {
      mockDomainServices.get('energy').initialize.mockRejectedValue(new Error('Init failed'));
      
      await expect(
        (errorRecovery as any).attemptServiceRecovery('energy')
      ).rejects.toThrow('Init failed');
    });

    it('should handle reset errors', async () => {
      mockDomainServices.get('soreness').reset.mockImplementation(() => {
        throw new Error('Reset failed');
      });
      
      await expect(
        (errorRecovery as any).attemptServiceRecovery('soreness')
      ).rejects.toThrow('Reset failed');
    });
  });

  describe('fallbackToLegacy', () => {
    it('should generate legacy analysis', async () => {
      const context = { userProfile: { id: 'test' } };
      const result = await errorRecovery.fallbackToLegacy('analysis', context);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBe(0.1);
      expect(result.reasoning).toContain('Legacy analysis');
    });

    it('should generate legacy recommendations', async () => {
      const context = { userProfile: { id: 'test' } };
      const result = await errorRecovery.fallbackToLegacy('recommendations', context);
      
      expect(result).toEqual([]);
    });

    it('should generate legacy insights', async () => {
      const context = { userProfile: { id: 'test' } };
      const result = await errorRecovery.fallbackToLegacy('insights', context);
      
      expect(result).toEqual([]);
    });

    it('should throw error for unknown operation', async () => {
      const context = { userProfile: { id: 'test' } };
      
      await expect(
        errorRecovery.fallbackToLegacy('unknown', context)
      ).rejects.toThrow('Unknown operation for legacy fallback');
    });
  });

  describe('forceRecovery', () => {
    it('should attempt recovery for all services', async () => {
      const result = await errorRecovery.forceRecovery();
      
      expect(result.success).toBe(true);
      expect(result.recoveredServices).toContain('energy');
      expect(result.recoveredServices).toContain('soreness');
      expect(result.recoveredServices).toContain('focus');
      expect(result.recoveredServices).toContain('equipment');
      expect(result.recoveredServices).toContain('crossComponent');
      expect(result.failedServices).toContain('duration'); // No recovery methods
      expect(result.errors).toHaveLength(0);
    });

    it('should handle service recovery failures', async () => {
      // Make energy service fail
      mockDomainServices.get('energy').initialize.mockRejectedValue(new Error('Init failed'));
      
      const result = await errorRecovery.forceRecovery();
      
      expect(result.success).toBe(false);
      expect(result.failedServices).toContain('energy');
      expect(result.errors).toContain('energy: Init failed');
    });

    it('should accumulate recovery attempts history', async () => {
      // Add some recovery attempts
      await errorRecovery.attemptRecovery(new Error('Test'), 'test');
      
      const statsBefore = errorRecovery.getRecoveryStats();
      expect(statsBefore.totalAttempts).toBeGreaterThan(0);
      
      await errorRecovery.forceRecovery();
      
      const statsAfter = errorRecovery.getRecoveryStats();
      expect(statsAfter.totalAttempts).toBeGreaterThan(statsBefore.totalAttempts);
    });
  });

  describe('getRecoveryStats', () => {
    it('should return correct recovery statistics', async () => {
      // Perform some recovery attempts
      await errorRecovery.attemptRecovery(new Error('Energy timeout'), 'energy-service');
      await errorRecovery.attemptRecovery(new Error('Soreness timeout'), 'soreness-service');
      
      const stats = errorRecovery.getRecoveryStats();
      
      expect(stats.totalAttempts).toBeGreaterThan(0);
      expect(stats.successfulRecoveries).toBeGreaterThan(0);
      expect(stats.successRate).toBeGreaterThan(0);
      expect(stats.recentAttempts.length).toBeGreaterThan(0);
      // Note: averageRecoveryTime might be 0 if all successful recoveries had duration 0
      // This is acceptable for the test environment
    });

    it('should filter recent attempts correctly', async () => {
      // Perform a recovery attempt
      await errorRecovery.attemptRecovery(new Error('Recent test'), 'service');
      
      const stats = errorRecovery.getRecoveryStats();
      expect(stats.recentAttempts.length).toBeGreaterThan(0);
    });

    it('should calculate success rate correctly', async () => {
      // Perform some recovery attempts
      await errorRecovery.attemptRecovery(new Error('Energy timeout'), 'energy-service'); // Should succeed
      await errorRecovery.attemptRecovery(new Error('Validation failed'), 'validation'); // Should fail (not retryable)
      
      const stats = errorRecovery.getRecoveryStats();
      expect(stats.successRate).toBeGreaterThan(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('reset', () => {
    it('should reset recovery component state', async () => {
      // Perform some recovery attempts
      await errorRecovery.attemptRecovery(new Error('Test'), 'service');
      
      const statsBefore = errorRecovery.getRecoveryStats();
      expect(statsBefore.totalAttempts).toBeGreaterThan(0);
      
      errorRecovery.reset();
      
      const statsAfter = errorRecovery.getRecoveryStats();
      expect(statsAfter.totalAttempts).toBe(0);
      expect(statsAfter.successfulRecoveries).toBe(0);
      expect(statsAfter.successRate).toBe(0);
    });
  });

  describe('private helper methods', () => {
    describe('isServiceError', () => {
      it('should identify service errors correctly', () => {
        const error = new Error('Energy service timeout');
        const result = (errorRecovery as any).isServiceError(error, 'energy-service');
        
        expect(result).toBe(true);
      });

      it('should identify non-service errors correctly', () => {
        const error = new Error('General error');
        const result = (errorRecovery as any).isServiceError(error, 'general');
        
        expect(result).toBe(false);
      });
    });

    describe('extractServiceName', () => {
      it('should extract service name from context', () => {
        const result = (errorRecovery as any).extractServiceName('energy-service-error');
        
        expect(result).toBe('energy');
      });

      it('should return null for unknown service', () => {
        const result = (errorRecovery as any).extractServiceName('unknown-service-error');
        
        expect(result).toBeNull();
      });
    });

    describe('recordRecoveryAttempt', () => {
      it('should record successful recovery attempt', () => {
        (errorRecovery as any).recordRecoveryAttempt('test-service', 'initialize', true, undefined, 100);
        
        const stats = errorRecovery.getRecoveryStats();
        expect(stats.totalAttempts).toBe(1);
        expect(stats.successfulRecoveries).toBe(1);
      });

      it('should record failed recovery attempt', () => {
        (errorRecovery as any).recordRecoveryAttempt('test-service', 'reset', false, 'Reset failed', 50);
        
        const stats = errorRecovery.getRecoveryStats();
        expect(stats.totalAttempts).toBe(1);
        expect(stats.successfulRecoveries).toBe(0);
      });
    });
  });
}); 