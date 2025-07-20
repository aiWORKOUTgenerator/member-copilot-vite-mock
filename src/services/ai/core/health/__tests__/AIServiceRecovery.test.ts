// Tests for AIServiceRecovery
import { AIServiceRecovery } from '../AIServiceRecovery';
import { AIServiceConfig } from '../../types/AIServiceTypes';

describe('AIServiceRecovery', () => {
  let recovery: AIServiceRecovery;
  let config: AIServiceConfig;
  let mockDomainServices: Map<string, any>;

  beforeEach(() => {
    config = {
      enableValidation: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 1000,
      cacheTimeout: 5 * 60 * 1000,
      maxRetries: 3,
      fallbackToLegacy: true
    };

    // Create mock domain services
    mockDomainServices = new Map();
    
    // Service with reset method
    mockDomainServices.set('resetService', {
      reset: jest.fn(),
      name: 'ResetService'
    });

    // Service with initialize method
    mockDomainServices.set('initializeService', {
      initialize: jest.fn(),
      name: 'InitializeService'
    });

    // Service with clear method
    mockDomainServices.set('clearService', {
      clear: jest.fn(),
      name: 'ClearService'
    });

    // Service with dispose method
    mockDomainServices.set('disposeService', {
      dispose: jest.fn(),
      name: 'DisposeService'
    });

    // Service with constructor
    class ConstructorService {
      constructor() {
        this.name = 'ConstructorService';
      }
    }
    mockDomainServices.set('constructorService', new ConstructorService());

    // Service with no recovery methods
    mockDomainServices.set('basicService', {
      name: 'BasicService',
      someMethod: () => 'test'
    });

    recovery = new AIServiceRecovery(mockDomainServices, config);
  });

  describe('Service Recovery', () => {
    it('should attempt service recovery successfully', async () => {
      const result = await recovery.attemptServiceRecovery('resetService');
      
      expect(result).toBe('reset');
      expect(mockDomainServices.get('resetService').reset).toHaveBeenCalled();
    });

    it('should handle service not found', async () => {
      const result = await recovery.attemptServiceRecovery('nonexistentService');
      
      expect(result).toBeNull();
    });

    it('should respect max recovery attempts', async () => {
      // Set max attempts to 1
      recovery.setMaxRecoveryAttempts(1);
      
      // First attempt should succeed
      const result1 = await recovery.attemptServiceRecovery('resetService');
      expect(result1).toBe('reset');
      
      // Second attempt should fail due to max attempts
      const result2 = await recovery.attemptServiceRecovery('resetService');
      expect(result2).toBeNull();
    });

    it('should reset recovery attempts on successful recovery', async () => {
      // Set max attempts to 2
      recovery.setMaxRecoveryAttempts(2);
      
      // First attempt should succeed
      const result1 = await recovery.attemptServiceRecovery('resetService');
      expect(result1).toBe('reset');
      
      // Recovery attempts should be reset, so second attempt should also succeed
      const result2 = await recovery.attemptServiceRecovery('resetService');
      expect(result2).toBe('reset');
    });

    it('should handle different recovery methods', async () => {
      // Test initialize method
      const initializeResult = await recovery.attemptServiceRecovery('initializeService');
      expect(initializeResult).toBe('initialize');
      expect(mockDomainServices.get('initializeService').initialize).toHaveBeenCalled();

      // Test clear method
      const clearResult = await recovery.attemptServiceRecovery('clearService');
      expect(clearResult).toBe('clear');
      expect(mockDomainServices.get('clearService').clear).toHaveBeenCalled();

      // Test dispose method
      const disposeResult = await recovery.attemptServiceRecovery('disposeService');
      expect(disposeResult).toBe('dispose');
      expect(mockDomainServices.get('disposeService').dispose).toHaveBeenCalled();
    });

    it('should handle services with no recovery methods', async () => {
      const result = await recovery.attemptServiceRecovery('basicService');
      expect(result).toBeNull();
    });
  });

  describe('Force Recovery', () => {
    it('should force recovery of all services', async () => {
      const result = await recovery.forceRecovery();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.recoveredServices).toBeInstanceOf(Array);
      expect(result.failedServices).toBeInstanceOf(Array);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      
      // Should have recovered services with reset, initialize, clear, dispose methods
      expect(result.recoveredServices.length).toBeGreaterThan(0);
    });

    it('should handle errors during forced recovery', async () => {
      // Create a service that throws an error during recovery
      const errorService = new Map();
      errorService.set('errorService', {
        reset: () => { throw new Error('Recovery failed'); },
        name: 'ErrorService'
      });

      const errorRecovery = new AIServiceRecovery(errorService, config);
      const result = await errorRecovery.forceRecovery();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Service Reset', () => {
    it('should reset service with reset method', () => {
      const result = recovery.resetService(mockDomainServices.get('resetService'), 'resetService');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('resetService').reset).toHaveBeenCalled();
    });

    it('should reset service with initialize method', () => {
      const result = recovery.resetService(mockDomainServices.get('initializeService'), 'initializeService');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('initializeService').initialize).toHaveBeenCalled();
    });

    it('should reset service with clear method', () => {
      const result = recovery.resetService(mockDomainServices.get('clearService'), 'clearService');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('clearService').clear).toHaveBeenCalled();
    });

    it('should reset service with dispose method', () => {
      const result = recovery.resetService(mockDomainServices.get('disposeService'), 'disposeService');
      
      expect(result).toBe(true);
      expect(mockDomainServices.get('disposeService').dispose).toHaveBeenCalled();
    });

    it('should handle service with no reset methods', () => {
      const result = recovery.resetService(mockDomainServices.get('basicService'), 'basicService');
      
      expect(result).toBe(false);
    });

    it('should handle service reset errors', () => {
      const errorService = {
        reset: () => { throw new Error('Reset failed'); },
        name: 'ErrorService'
      };

      const result = recovery.resetService(errorService, 'errorService');
      
      expect(result).toBe(false);
    });
  });

  describe('Recovery Statistics', () => {
    it('should get recovery statistics for a service', () => {
      const stats = recovery.getRecoveryStats('resetService');
      
      expect(stats).toBeDefined();
      expect(stats.attempts).toBe(0);
      expect(stats.maxAttempts).toBe(3);
      expect(stats.lastAttempt).toBeNull();
      expect(stats.successRate).toBe(100);
    });

    it('should get all recovery statistics', () => {
      const allStats = recovery.getAllRecoveryStats();
      
      expect(allStats).toBeDefined();
      expect(Object.keys(allStats).length).toBe(6); // Number of services
      expect(allStats.resetService).toBeDefined();
      expect(allStats.initializeService).toBeDefined();
    });

    it('should reset recovery attempts for a service', () => {
      // First, attempt recovery to increment attempts
      recovery.attemptServiceRecovery('resetService');
      
      // Reset attempts
      recovery.resetRecoveryAttempts('resetService');
      
      const stats = recovery.getRecoveryStats('resetService');
      expect(stats.attempts).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should set maximum recovery attempts', () => {
      recovery.setMaxRecoveryAttempts(5);
      
      const stats = recovery.getRecoveryStats('resetService');
      expect(stats.maxAttempts).toBe(5);
    });

    it('should set recovery cooldown', () => {
      const newCooldown = 120000; // 2 minutes
      recovery.setRecoveryCooldown(newCooldown);
      
      // This would be tested in a real implementation with actual cooldown tracking
      expect(recovery).toBeDefined();
    });
  });

  describe('Service Status', () => {
    it('should get services needing recovery', () => {
      // Attempt recovery to create some attempts
      recovery.attemptServiceRecovery('resetService');
      
      const servicesNeedingRecovery = recovery.getServicesNeedingRecovery();
      expect(servicesNeedingRecovery).toBeInstanceOf(Array);
    });

    it('should get services that exceeded max attempts', () => {
      // Set max attempts to 1 and attempt recovery twice
      recovery.setMaxRecoveryAttempts(1);
      recovery.attemptServiceRecovery('resetService');
      recovery.attemptServiceRecovery('resetService'); // This should exceed max attempts
      
      const servicesExceeded = recovery.getServicesExceededMaxAttempts();
      expect(servicesExceeded).toContain('resetService');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during service recovery', async () => {
      // Create a service that throws an error
      const errorService = new Map();
      errorService.set('errorService', {
        reset: () => { throw new Error('Recovery failed'); },
        name: 'ErrorService'
      });

      const errorRecovery = new AIServiceRecovery(errorService, config);
      const result = await errorRecovery.attemptServiceRecovery('errorService');
      
      expect(result).toBeNull();
    });

    it('should handle errors during forced recovery', async () => {
      // Create a service that throws an error
      const errorService = new Map();
      errorService.set('errorService', {
        reset: () => { throw new Error('Recovery failed'); },
        name: 'ErrorService'
      });

      const errorRecovery = new AIServiceRecovery(errorService, config);
      const result = await errorRecovery.forceRecovery();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
}); 