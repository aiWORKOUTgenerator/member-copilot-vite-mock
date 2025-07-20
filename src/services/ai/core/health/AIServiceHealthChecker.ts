// AI Service Health Checking
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  AIServiceHealthStatus, 
  AIServiceComprehensiveHealthResult,
  AIServiceConfig,
  DomainServiceHealth
} from '../types/AIServiceTypes';

/**
 * Manages health checking for AI Service components and domain services
 */
export class AIServiceHealthChecker extends AIServiceComponent {
  private domainServices: Map<string, any>;
  private config: AIServiceConfig;
  private lastHealthCheck: Date | null = null;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor(domainServices: Map<string, any>, config: AIServiceConfig) {
    super('AIServiceHealthChecker');
    this.domainServices = domainServices;
    this.config = config;
    
    this.log('info', 'AIServiceHealthChecker initialized', {
      domainServicesCount: domainServices.size,
      healthCheckInterval: this.healthCheckInterval
    });
  }

  /**
   * Check the overall health of the AI service
   */
  checkOverallHealth(): AIServiceHealthStatus {
    this.log('debug', 'Checking overall AI service health');

    try {
      const domainHealth = this.checkDomainServiceHealth();
      const overallStatus = this.determineOverallStatus(domainHealth);
      
      const healthStatus: AIServiceHealthStatus = {
        status: overallStatus,
        timestamp: new Date(),
        domainServices: domainHealth,
        lastCheck: this.lastHealthCheck,
        nextCheck: new Date(Date.now() + this.healthCheckInterval),
        details: {
          totalServices: this.domainServices.size,
          healthyServices: Object.values(domainHealth).filter(h => h.status === 'healthy').length,
          degradedServices: Object.values(domainHealth).filter(h => h.status === 'degraded').length,
          unhealthyServices: Object.values(domainHealth).filter(h => h.status === 'unhealthy').length
        }
      };

      this.lastHealthCheck = new Date();
      
      this.log('info', 'Overall health check completed', {
        status: overallStatus,
        healthyServices: healthStatus.details.healthyServices,
        degradedServices: healthStatus.details.degradedServices,
        unhealthyServices: healthStatus.details.unhealthyServices
      });

      return healthStatus;

    } catch (error) {
      this.handleError(error as Error, 'checkOverallHealth');
      
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        domainServices: {},
        lastCheck: this.lastHealthCheck,
        nextCheck: new Date(Date.now() + this.healthCheckInterval),
        details: {
          totalServices: 0,
          healthyServices: 0,
          degradedServices: 0,
          unhealthyServices: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Check health of individual domain services
   */
  checkDomainServiceHealth(): Record<string, DomainServiceHealth> {
    this.log('debug', 'Checking domain service health');

    const healthResults: Record<string, DomainServiceHealth> = {};

    for (const [serviceName, service] of this.domainServices.entries()) {
      try {
        const health = this.checkServiceHealth(service, serviceName);
        healthResults[serviceName] = health;
        
        this.log('debug', `Domain service health check: ${serviceName}`, {
          status: health.status,
          responseTime: health.responseTime,
          lastCheck: health.lastCheck
        });

      } catch (error) {
        this.log('error', `Error checking health for ${serviceName}`, {
          error: error instanceof Error ? error.message : String(error)
        });

        healthResults[serviceName] = {
          status: 'unhealthy',
          responseTime: -1,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : String(error),
          details: {
            serviceName,
            checkMethod: 'checkServiceHealth',
            timestamp: new Date()
          }
        };
      }
    }

    return healthResults;
  }

  /**
   * Check health of a specific service
   */
  checkServiceHealth(service: any, serviceName: string): DomainServiceHealth {
    const startTime = Date.now();
    
    try {
      // Check if service exists and has required methods
      if (!service) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date(),
          error: 'Service is null or undefined',
          details: {
            serviceName,
            checkMethod: 'existence',
            timestamp: new Date()
          }
        };
      }

      // Check if service has health check method
      if (typeof service.getHealthStatus === 'function') {
        const healthStatus = service.getHealthStatus();
        const responseTime = Date.now() - startTime;
        
        return {
          status: healthStatus.status || 'unknown',
          responseTime,
          lastCheck: new Date(),
          details: {
            serviceName,
            checkMethod: 'getHealthStatus',
            timestamp: new Date(),
            serviceDetails: healthStatus.details || {}
          }
        };
      }

      // Check if service has isHealthy method
      if (typeof service.isHealthy === 'function') {
        const isHealthy = service.isHealthy();
        const responseTime = Date.now() - startTime;
        
        return {
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          details: {
            serviceName,
            checkMethod: 'isHealthy',
            timestamp: new Date()
          }
        };
      }

      // Check if service has checkHealth method
      if (typeof service.checkHealth === 'function') {
        const healthResult = service.checkHealth();
        const responseTime = Date.now() - startTime;
        
        return {
          status: healthResult.status || 'unknown',
          responseTime,
          lastCheck: new Date(),
          details: {
            serviceName,
            checkMethod: 'checkHealth',
            timestamp: new Date(),
            serviceDetails: healthResult.details || {}
          }
        };
      }

      // Fallback: check if service has basic properties
      const hasRequiredProperties = this.checkServiceProperties(service);
      const responseTime = Date.now() - startTime;
      
      return {
        status: hasRequiredProperties ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date(),
        details: {
          serviceName,
          checkMethod: 'propertyCheck',
          timestamp: new Date(),
          hasRequiredProperties
        }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.log('error', `Error checking health for service ${serviceName}`, {
        error: error instanceof Error ? error.message : String(error),
        responseTime
      });

      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : String(error),
        details: {
          serviceName,
          checkMethod: 'error',
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Perform a comprehensive health check
   */
  async performComprehensiveHealthCheck(): Promise<AIServiceComprehensiveHealthResult> {
    this.log('info', 'Starting comprehensive health check');

    const startTime = Date.now();
    const results: AIServiceComprehensiveHealthResult = {
      overallStatus: 'unknown',
      timestamp: new Date(),
      executionTime: 0,
      domainServices: {},
      systemResources: {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0
      },
      recommendations: [],
      errors: []
    };

    try {
      // Check domain services
      results.domainServices = this.checkDomainServiceHealth();
      
      // Check system resources
      results.systemResources = await this.checkSystemResources();
      
      // Determine overall status
      results.overallStatus = this.determineOverallStatus(results.domainServices);
      
      // Generate recommendations
      results.recommendations = this.generateHealthRecommendations(results);
      
      results.executionTime = Date.now() - startTime;

      this.log('info', 'Comprehensive health check completed', {
        overallStatus: results.overallStatus,
        executionTime: results.executionTime,
        recommendationsCount: results.recommendations.length,
        errorsCount: results.errors.length
      });

    } catch (error) {
      results.errors.push({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        context: 'comprehensiveHealthCheck'
      });
      
      results.overallStatus = 'unhealthy';
      results.executionTime = Date.now() - startTime;
      
      this.log('error', 'Comprehensive health check failed', {
        error: error instanceof Error ? error.message : String(error),
        executionTime: results.executionTime
      });
    }

    return results;
  }

  /**
   * Check system resources
   */
  private async checkSystemResources(): Promise<{
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  }> {
    try {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      // CPU usage (simplified - in a real implementation, you'd use a more sophisticated method)
      const cpuUsage = 0; // Placeholder - would need a proper CPU monitoring library

      // Disk usage (simplified - in a real implementation, you'd check actual disk space)
      const diskUsage = 0; // Placeholder - would need a proper disk monitoring library

      return {
        memoryUsage: Math.round(memoryUsagePercent * 100) / 100,
        cpuUsage,
        diskUsage
      };

    } catch (error) {
      this.log('error', 'Error checking system resources', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        memoryUsage: -1,
        cpuUsage: -1,
        diskUsage: -1
      };
    }
  }

  /**
   * Determine overall health status based on domain service health
   */
  private determineOverallStatus(domainHealth: Record<string, DomainServiceHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(domainHealth).map(h => h.status);
    
    if (statuses.length === 0) {
      return 'unknown';
    }

    const unhealthyCount = statuses.filter(s => s === 'unhealthy').length;
    const degradedCount = statuses.filter(s => s === 'degraded').length;
    const healthyCount = statuses.filter(s => s === 'healthy').length;

    // If any service is unhealthy, overall status is unhealthy
    if (unhealthyCount > 0) {
      return 'unhealthy';
    }

    // If any service is degraded, overall status is degraded
    if (degradedCount > 0) {
      return 'degraded';
    }

    // If all services are healthy, overall status is healthy
    if (healthyCount === statuses.length) {
      return 'healthy';
    }

    // Default to degraded if we have unknown statuses
    return 'degraded';
  }

  /**
   * Check if a service has required properties
   */
  private checkServiceProperties(service: any): boolean {
    // Check for basic service properties
    const hasName = typeof service.name === 'string' || typeof service.constructor?.name === 'string';
    const hasMethods = typeof service === 'object' && service !== null;
    
    return hasName && hasMethods;
  }

  /**
   * Generate health recommendations based on health check results
   */
  private generateHealthRecommendations(results: AIServiceComprehensiveHealthResult): string[] {
    const recommendations: string[] = [];

    // Check for unhealthy services
    const unhealthyServices = Object.entries(results.domainServices)
      .filter(([_, health]) => health.status === 'unhealthy')
      .map(([name, _]) => name);

    if (unhealthyServices.length > 0) {
      recommendations.push(`Restart unhealthy services: ${unhealthyServices.join(', ')}`);
    }

    // Check for degraded services
    const degradedServices = Object.entries(results.domainServices)
      .filter(([_, health]) => health.status === 'degraded')
      .map(([name, _]) => name);

    if (degradedServices.length > 0) {
      recommendations.push(`Monitor degraded services: ${degradedServices.join(', ')}`);
    }

    // Check memory usage
    if (results.systemResources.memoryUsage > 80) {
      recommendations.push('High memory usage detected. Consider optimizing memory usage or increasing available memory.');
    }

    // Check response times
    const slowServices = Object.entries(results.domainServices)
      .filter(([_, health]) => health.responseTime > 1000) // More than 1 second
      .map(([name, health]) => `${name} (${health.responseTime}ms)`);

    if (slowServices.length > 0) {
      recommendations.push(`Slow response times detected: ${slowServices.join(', ')}`);
    }

    // Check for services with errors
    const servicesWithErrors = Object.entries(results.domainServices)
      .filter(([_, health]) => health.error)
      .map(([name, _]) => name);

    if (servicesWithErrors.length > 0) {
      recommendations.push(`Services with errors detected: ${servicesWithErrors.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Get the last health check timestamp
   */
  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck;
  }

  /**
   * Get the next scheduled health check time
   */
  getNextHealthCheck(): Date {
    return new Date(Date.now() + this.healthCheckInterval);
  }

  /**
   * Set the health check interval
   */
  setHealthCheckInterval(interval: number): void {
    this.healthCheckInterval = interval;
    this.log('info', 'Health check interval updated', { interval });
  }

  /**
   * Force an immediate health check
   */
  async forceHealthCheck(): Promise<AIServiceHealthStatus> {
    this.log('info', 'Forcing immediate health check');
    return this.checkOverallHealth();
  }

  /**
   * Get health check statistics
   */
  getHealthCheckStats(): {
    totalChecks: number;
    lastCheck: Date | null;
    nextCheck: Date;
    averageResponseTime: number;
    successRate: number;
  } {
    // This would be enhanced with actual statistics tracking
    return {
      totalChecks: 0, // Would be tracked in a real implementation
      lastCheck: this.lastHealthCheck,
      nextCheck: this.getNextHealthCheck(),
      averageResponseTime: 0, // Would be calculated from actual checks
      successRate: 100 // Would be calculated from actual checks
    };
  }
} 