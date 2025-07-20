// Tests for AIServiceHealthChecker
import { AIServiceHealthChecker } from '../AIServiceHealthChecker';
import { AIServiceConfig } from '../../types/AIServiceTypes';

describe('AIServiceHealthChecker', () => {
  let healthChecker: AIServiceHealthChecker;
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
    
    // Healthy service
    mockDomainServices.set('healthyService', {
      getHealthStatus: () => ({ status: 'healthy', details: { uptime: 3600 } }),
      name: 'HealthyService'
    });

    // Degraded service
    mockDomainServices.set('degradedService', {
      getHealthStatus: () => ({ status: 'degraded', details: { warnings: ['High memory usage'] } }),
      name: 'DegradedService'
    });

    // Unhealthy service
    mockDomainServices.set('unhealthyService', {
      getHealthStatus: () => ({ status: 'unhealthy', details: { errors: ['Connection failed'] } }),
      name: 'UnhealthyService'
    });

    // Service with isHealthy method
    mockDomainServices.set('isHealthyService', {
      isHealthy: () => true,
      name: 'IsHealthyService'
    });

    // Service with checkHealth method
    mockDomainServices.set('checkHealthService', {
      checkHealth: () => ({ status: 'healthy', details: { responseTime: 100 } }),
      name: 'CheckHealthService'
    });

    // Service with no health methods
    mockDomainServices.set('basicService', {
      name: 'BasicService',
      someMethod: () => 'test'
    });

    // Null service
    mockDomainServices.set('nullService', null);

    healthChecker = new AIServiceHealthChecker(mockDomainServices, config);
  });

  describe('Health Checking', () => {
    it('should check overall health correctly', () => {
      const healthStatus = healthChecker.checkOverallHealth();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('unhealthy'); // Because we have an unhealthy service
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
      expect(healthStatus.domainServices).toBeDefined();
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.totalServices).toBe(7);
      expect(healthStatus.details.healthyServices).toBeGreaterThan(0);
      expect(healthStatus.details.degradedServices).toBeGreaterThan(0);
      expect(healthStatus.details.unhealthyServices).toBeGreaterThan(0);
    });

    it('should check domain service health correctly', () => {
      const domainHealth = healthChecker.checkDomainServiceHealth();

      expect(domainHealth).toBeDefined();
      expect(domainHealth.healthyService).toBeDefined();
      expect(domainHealth.healthyService.status).toBe('healthy');
      expect(domainHealth.degradedService).toBeDefined();
      expect(domainHealth.degradedService.status).toBe('degraded');
      expect(domainHealth.unhealthyService).toBeDefined();
      expect(domainHealth.unhealthyService.status).toBe('unhealthy');
    });

    it('should handle services with different health check methods', () => {
      const domainHealth = healthChecker.checkDomainServiceHealth();

      // Service with getHealthStatus method
      expect(domainHealth.healthyService.status).toBe('healthy');
      expect(domainHealth.healthyService.details.checkMethod).toBe('getHealthStatus');

      // Service with isHealthy method
      expect(domainHealth.isHealthyService.status).toBe('healthy');
      expect(domainHealth.isHealthyService.details.checkMethod).toBe('isHealthy');

      // Service with checkHealth method
      expect(domainHealth.checkHealthService.status).toBe('healthy');
      expect(domainHealth.checkHealthService.details.checkMethod).toBe('checkHealth');

      // Service with no health methods
      expect(domainHealth.basicService.status).toBe('healthy');
      expect(domainHealth.basicService.details.checkMethod).toBe('propertyCheck');
    });

    it('should handle null services correctly', () => {
      const domainHealth = healthChecker.checkDomainServiceHealth();

      expect(domainHealth.nullService).toBeDefined();
      expect(domainHealth.nullService.status).toBe('unhealthy');
      expect(domainHealth.nullService.error).toBe('Service is null or undefined');
    });

    it('should perform comprehensive health check', async () => {
      const comprehensiveHealth = await healthChecker.performComprehensiveHealthCheck();

      expect(comprehensiveHealth).toBeDefined();
      expect(comprehensiveHealth.overallStatus).toBe('unhealthy');
      expect(comprehensiveHealth.timestamp).toBeInstanceOf(Date);
      expect(comprehensiveHealth.executionTime).toBeGreaterThan(0);
      expect(comprehensiveHealth.domainServices).toBeDefined();
      expect(comprehensiveHealth.systemResources).toBeDefined();
      expect(comprehensiveHealth.recommendations).toBeInstanceOf(Array);
      expect(comprehensiveHealth.errors).toBeInstanceOf(Array);
    });

    it('should determine overall status correctly', () => {
      // Test with all healthy services
      const allHealthyServices = new Map();
      allHealthyServices.set('service1', { getHealthStatus: () => ({ status: 'healthy' }) });
      allHealthyServices.set('service2', { getHealthStatus: () => ({ status: 'healthy' }) });
      
      const healthyChecker = new AIServiceHealthChecker(allHealthyServices, config);
      const healthStatus = healthyChecker.checkOverallHealth();
      expect(healthStatus.status).toBe('healthy');

      // Test with mixed services
      const mixedServices = new Map();
      mixedServices.set('service1', { getHealthStatus: () => ({ status: 'healthy' }) });
      mixedServices.set('service2', { getHealthStatus: () => ({ status: 'degraded' }) });
      
      const mixedChecker = new AIServiceHealthChecker(mixedServices, config);
      const mixedHealthStatus = mixedChecker.checkOverallHealth();
      expect(mixedHealthStatus.status).toBe('degraded');
    });
  });

  describe('Health Check Management', () => {
    it('should get last health check timestamp', () => {
      expect(healthChecker.getLastHealthCheck()).toBeNull();

      healthChecker.checkOverallHealth();
      expect(healthChecker.getLastHealthCheck()).toBeInstanceOf(Date);
    });

    it('should get next health check time', () => {
      const nextCheck = healthChecker.getNextHealthCheck();
      expect(nextCheck).toBeInstanceOf(Date);
      expect(nextCheck.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set health check interval', () => {
      const newInterval = 60000; // 1 minute
      healthChecker.setHealthCheckInterval(newInterval);
      
      const nextCheck = healthChecker.getNextHealthCheck();
      const expectedTime = Date.now() + newInterval;
      expect(nextCheck.getTime()).toBeCloseTo(expectedTime, -2); // Within 100ms
    });

    it('should force immediate health check', async () => {
      const healthStatus = await healthChecker.forceHealthCheck();
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('unhealthy');
    });

    it('should get health check statistics', () => {
      const stats = healthChecker.getHealthCheckStats();
      expect(stats).toBeDefined();
      expect(stats.totalChecks).toBe(0); // Would be tracked in real implementation
      expect(stats.lastCheck).toBeNull();
      expect(stats.nextCheck).toBeInstanceOf(Date);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.successRate).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in health checking gracefully', () => {
      // Create a service that throws an error
      const errorService = new Map();
      errorService.set('errorService', {
        getHealthStatus: () => { throw new Error('Health check failed'); }
      });

      const errorChecker = new AIServiceHealthChecker(errorService, config);
      const healthStatus = errorChecker.checkOverallHealth();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.details.error).toBeDefined();
    });

    it('should handle errors in comprehensive health check', async () => {
      // Create a service that throws an error
      const errorService = new Map();
      errorService.set('errorService', {
        getHealthStatus: () => { throw new Error('Health check failed'); }
      });

      const errorChecker = new AIServiceHealthChecker(errorService, config);
      const comprehensiveHealth = await errorChecker.performComprehensiveHealthCheck();

      expect(comprehensiveHealth.overallStatus).toBe('unhealthy');
      expect(comprehensiveHealth.errors.length).toBeGreaterThan(0);
    });
  });
}); 