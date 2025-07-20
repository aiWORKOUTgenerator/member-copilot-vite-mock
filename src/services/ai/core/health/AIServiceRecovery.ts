// AI Service Recovery
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  AIServiceRecoveryResult,
  AIServiceConfig,
  DomainServiceHealth
} from '../types/AIServiceTypes';

/**
 * Manages recovery operations for AI Service components and domain services
 */
export class AIServiceRecovery extends AIServiceComponent {
  private domainServices: Map<string, any>;
  private config: AIServiceConfig;
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRecoveryAttempts: number = 3;
  private recoveryCooldown: number = 60000; // 1 minute

  constructor(domainServices: Map<string, any>, config: AIServiceConfig) {
    super('AIServiceRecovery');
    this.domainServices = domainServices;
    this.config = config;
    
    this.log('info', 'AIServiceRecovery initialized', {
      domainServicesCount: domainServices.size,
      maxRecoveryAttempts: this.maxRecoveryAttempts,
      recoveryCooldown: this.recoveryCooldown
    });
  }

  /**
   * Attempt to recover a specific service
   */
  async attemptServiceRecovery(serviceName: string): Promise<string | null> {
    this.log('info', `Attempting recovery for service: ${serviceName}`);

    try {
      // Check if service exists
      if (!this.domainServices.has(serviceName)) {
        this.log('error', `Service not found: ${serviceName}`);
        return null;
      }

      const service = this.domainServices.get(serviceName);
      const attempts = this.recoveryAttempts.get(serviceName) || 0;

      // Check if we've exceeded max attempts
      if (attempts >= this.maxRecoveryAttempts) {
        this.log('warn', `Max recovery attempts exceeded for ${serviceName}`, {
          attempts,
          maxAttempts: this.maxRecoveryAttempts
        });
        return null;
      }

      // Attempt recovery based on service type
      const recoveryMethod = this.determineRecoveryMethod(service);
      const result = await this.executeRecovery(service, serviceName, recoveryMethod);

      if (result) {
        // Reset recovery attempts on successful recovery
        this.recoveryAttempts.set(serviceName, 0);
        this.log('info', `Service recovery successful: ${serviceName}`, {
          method: recoveryMethod,
          attempts: attempts + 1
        });
        return recoveryMethod;
      } else {
        // Increment recovery attempts
        this.recoveryAttempts.set(serviceName, attempts + 1);
        this.log('warn', `Service recovery failed: ${serviceName}`, {
          method: recoveryMethod,
          attempts: attempts + 1,
          maxAttempts: this.maxRecoveryAttempts
        });
        return null;
      }

    } catch (error) {
      this.handleError(error as Error, 'attemptServiceRecovery', { serviceName });
      return null;
    }
  }

  /**
   * Force recovery of all services
   */
  async forceRecovery(): Promise<AIServiceRecoveryResult> {
    this.log('info', 'Starting forced recovery of all services');

    const startTime = Date.now();
    const results: AIServiceRecoveryResult = {
      success: false,
      timestamp: new Date(),
      executionTime: 0,
      recoveredServices: [],
      failedServices: [],
      errors: [],
      recommendations: []
    };

    try {
      const serviceNames = Array.from(this.domainServices.keys());
      
      for (const serviceName of serviceNames) {
        try {
          const recoveryMethod = await this.attemptServiceRecovery(serviceName);
          
          if (recoveryMethod) {
            results.recoveredServices.push({
              serviceName,
              recoveryMethod,
              timestamp: new Date()
            });
          } else {
            results.failedServices.push({
              serviceName,
              reason: 'Recovery attempt failed',
              timestamp: new Date()
            });
          }

        } catch (error) {
          results.errors.push({
            serviceName,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date()
          });
        }
      }

      results.success = results.recoveredServices.length > 0;
      results.executionTime = Date.now() - startTime;

      // Generate recommendations
      results.recommendations = this.generateRecoveryRecommendations(results);

      this.log('info', 'Forced recovery completed', {
        success: results.success,
        recoveredCount: results.recoveredServices.length,
        failedCount: results.failedServices.length,
        errorsCount: results.errors.length,
        executionTime: results.executionTime
      });

    } catch (error) {
      results.errors.push({
        serviceName: 'overall',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      
      results.executionTime = Date.now() - startTime;
      
      this.log('error', 'Forced recovery failed', {
        error: error instanceof Error ? error.message : String(error),
        executionTime: results.executionTime
      });
    }

    return results;
  }

  /**
   * Reset a specific service
   */
  resetService(service: any, serviceName: string): boolean {
    this.log('info', `Resetting service: ${serviceName}`);

    try {
      // Check if service has reset method
      if (typeof service.reset === 'function') {
        service.reset();
        this.log('info', `Service reset successful: ${serviceName}`, { method: 'reset' });
        return true;
      }

      // Check if service has initialize method
      if (typeof service.initialize === 'function') {
        service.initialize();
        this.log('info', `Service re-initialization successful: ${serviceName}`, { method: 'initialize' });
        return true;
      }

      // Check if service has clear method
      if (typeof service.clear === 'function') {
        service.clear();
        this.log('info', `Service clear successful: ${serviceName}`, { method: 'clear' });
        return true;
      }

      // Check if service has dispose method
      if (typeof service.dispose === 'function') {
        service.dispose();
        this.log('info', `Service disposal successful: ${serviceName}`, { method: 'dispose' });
        return true;
      }

      // Fallback: try to create a new instance if service has a constructor
      if (typeof service.constructor === 'function' && service.constructor.name !== 'Object') {
        try {
          const newService = new service.constructor();
          this.domainServices.set(serviceName, newService);
          this.log('info', `Service re-creation successful: ${serviceName}`, { method: 'recreate' });
          return true;
        } catch (error) {
          this.log('error', `Service re-creation failed: ${serviceName}`, {
            error: error instanceof Error ? error.message : String(error)
          });
          return false;
        }
      }

      this.log('warn', `No reset method found for service: ${serviceName}`);
      return false;

    } catch (error) {
      this.handleError(error as Error, 'resetService', { serviceName });
      return false;
    }
  }

  /**
   * Get recovery statistics for a service
   */
  getRecoveryStats(serviceName: string): {
    attempts: number;
    maxAttempts: number;
    lastAttempt: Date | null;
    successRate: number;
  } {
    const attempts = this.recoveryAttempts.get(serviceName) || 0;
    
    return {
      attempts,
      maxAttempts: this.maxRecoveryAttempts,
      lastAttempt: null, // Would be tracked in a real implementation
      successRate: attempts > 0 ? (attempts >= this.maxRecoveryAttempts ? 0 : 100) : 100
    };
  }

  /**
   * Reset recovery attempts for a service
   */
  resetRecoveryAttempts(serviceName: string): void {
    this.recoveryAttempts.set(serviceName, 0);
    this.log('info', `Recovery attempts reset for service: ${serviceName}`);
  }

  /**
   * Set maximum recovery attempts
   */
  setMaxRecoveryAttempts(maxAttempts: number): void {
    this.maxRecoveryAttempts = maxAttempts;
    this.log('info', 'Maximum recovery attempts updated', { maxAttempts });
  }

  /**
   * Set recovery cooldown period
   */
  setRecoveryCooldown(cooldown: number): void {
    this.recoveryCooldown = cooldown;
    this.log('info', 'Recovery cooldown updated', { cooldown });
  }

  /**
   * Get all recovery statistics
   */
  getAllRecoveryStats(): Record<string, {
    attempts: number;
    maxAttempts: number;
    lastAttempt: Date | null;
    successRate: number;
  }> {
    const stats: Record<string, any> = {};
    
    for (const serviceName of this.domainServices.keys()) {
      stats[serviceName] = this.getRecoveryStats(serviceName);
    }
    
    return stats;
  }

  /**
   * Determine the best recovery method for a service
   */
  private determineRecoveryMethod(service: any): string {
    // Check for specific recovery methods in order of preference
    if (typeof service.reset === 'function') {
      return 'reset';
    }
    
    if (typeof service.initialize === 'function') {
      return 'initialize';
    }
    
    if (typeof service.clear === 'function') {
      return 'clear';
    }
    
    if (typeof service.dispose === 'function') {
      return 'dispose';
    }
    
    if (typeof service.constructor === 'function' && service.constructor.name !== 'Object') {
      return 'recreate';
    }
    
    return 'none';
  }

  /**
   * Execute recovery using the specified method
   */
  private async executeRecovery(service: any, serviceName: string, method: string): Promise<boolean> {
    try {
      switch (method) {
        case 'reset':
          if (typeof service.reset === 'function') {
            service.reset();
            return true;
          }
          break;
          
        case 'initialize':
          if (typeof service.initialize === 'function') {
            service.initialize();
            return true;
          }
          break;
          
        case 'clear':
          if (typeof service.clear === 'function') {
            service.clear();
            return true;
          }
          break;
          
        case 'dispose':
          if (typeof service.dispose === 'function') {
            service.dispose();
            return true;
          }
          break;
          
        case 'recreate':
          if (typeof service.constructor === 'function' && service.constructor.name !== 'Object') {
            const newService = new service.constructor();
            this.domainServices.set(serviceName, newService);
            return true;
          }
          break;
          
        default:
          this.log('warn', `No recovery method available for service: ${serviceName}`);
          return false;
      }
      
      return false;
      
    } catch (error) {
      this.log('error', `Recovery execution failed for ${serviceName}`, {
        method,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Generate recovery recommendations based on results
   */
  private generateRecoveryRecommendations(results: AIServiceRecoveryResult): string[] {
    const recommendations: string[] = [];

    // Check for services that failed recovery
    if (results.failedServices.length > 0) {
      const failedNames = results.failedServices.map(s => s.serviceName).join(', ');
      recommendations.push(`Manual intervention required for failed services: ${failedNames}`);
    }

    // Check for services with errors
    if (results.errors.length > 0) {
      const errorNames = results.errors.map(e => e.serviceName).join(', ');
      recommendations.push(`Services with errors need investigation: ${errorNames}`);
    }

    // Check recovery success rate
    const totalServices = results.recoveredServices.length + results.failedServices.length;
    if (totalServices > 0) {
      const successRate = (results.recoveredServices.length / totalServices) * 100;
      if (successRate < 50) {
        recommendations.push('Low recovery success rate. Consider system-wide restart or manual intervention.');
      }
    }

    // Check for services that might need configuration updates
    if (results.failedServices.length > 0) {
      recommendations.push('Review service configurations for failed services.');
    }

    return recommendations;
  }

  /**
   * Check if a service is in recovery cooldown
   */
  private isInCooldown(serviceName: string): boolean {
    // This would be enhanced with actual cooldown tracking
    return false;
  }

  /**
   * Get services that need recovery
   */
  getServicesNeedingRecovery(): string[] {
    const servicesNeedingRecovery: string[] = [];
    
    for (const [serviceName, attempts] of this.recoveryAttempts.entries()) {
      if (attempts > 0 && attempts < this.maxRecoveryAttempts) {
        servicesNeedingRecovery.push(serviceName);
      }
    }
    
    return servicesNeedingRecovery;
  }

  /**
   * Get services that have exceeded max recovery attempts
   */
  getServicesExceededMaxAttempts(): string[] {
    const servicesExceeded: string[] = [];
    
    for (const [serviceName, attempts] of this.recoveryAttempts.entries()) {
      if (attempts >= this.maxRecoveryAttempts) {
        servicesExceeded.push(serviceName);
      }
    }
    
    return servicesExceeded;
  }
} 