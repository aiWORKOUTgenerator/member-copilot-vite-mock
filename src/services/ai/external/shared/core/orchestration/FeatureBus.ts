// Feature Bus - Advanced Inter-Feature Communication System
// Enables loose coupling between features while supporting complex interaction patterns

import { logger } from '../../../../../../utils/logger';

// ===== FEATURE BUS TYPES =====

export type FeatureEventType = 
  | 'workout-generated'
  | 'user-preferences-analyzed' 
  | 'recommendations-created'
  | 'equipment-evaluated'
  | 'performance-metrics-updated'
  | 'error-occurred'
  | 'cache-invalidated'
  | 'feature-registered'
  | 'feature-unregistered';

export interface FeatureEvent<TData = any> {
  type: FeatureEventType;
  source: string; // Which feature triggered the event
  timestamp: Date;
  correlationId?: string; // For tracking related events
  data: TData;
  metadata?: Record<string, any>;
}

export interface EventHandler<TData = any> {
  (event: FeatureEvent<TData>): Promise<void> | void;
}

export interface FeatureRequest<TRequest = any> {
  id: string;
  feature: string;
  operation: string;
  data: TRequest;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface FeatureResponse<TResponse = any> {
  requestId: string;
  success: boolean;
  data?: TResponse;
  error?: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FeatureSubscription {
  id: string;
  eventType: FeatureEventType;
  handler: EventHandler;
  feature: string; // Which feature is subscribing
  filter?: (event: FeatureEvent) => boolean;
  priority?: number; // Higher numbers execute first
}

// ===== FEATURE CAPABILITY REGISTRY =====

export interface FeatureOperationDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, any>; // JSON Schema
  outputSchema?: Record<string, any>; // JSON Schema
  estimatedDuration?: number; // In milliseconds
  cacheable?: boolean;
  retryable?: boolean;
}

export interface FeatureCapabilityDefinition {
  name: string;
  version: string;
  description: string;
  operations: FeatureOperationDefinition[];
  dependencies?: string[]; // Other features this depends on
  provides?: string[]; // Events this feature can emit
  consumes?: string[]; // Events this feature listens to
}

// ===== MAIN FEATURE BUS IMPLEMENTATION =====

export class FeatureBus {
  private eventHandlers = new Map<FeatureEventType, FeatureSubscription[]>();
  private featureRegistry = new Map<string, any>();
  private featureCapabilities = new Map<string, FeatureCapabilityDefinition>();
  private activeRequests = new Map<string, Promise<FeatureResponse>>();
  private eventHistory: FeatureEvent[] = [];
  private metrics = {
    eventsPublished: 0,
    requestsProcessed: 0,
    errorsOccurred: 0,
    averageRequestDuration: 0
  };

  constructor() {
    logger.info('FeatureBus initialized');
  }

  // ===== EVENT SUBSCRIPTION AND PUBLISHING =====

  /**
   * Subscribe to specific feature events
   */
  subscribe<TData = any>(
    eventType: FeatureEventType, 
    handler: EventHandler<TData>,
    options: {
      feature: string;
      filter?: (event: FeatureEvent<TData>) => boolean;
      priority?: number;
    }
  ): string {
    const subscription: FeatureSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      handler: handler as EventHandler,
      feature: options.feature,
      filter: options.filter as ((event: FeatureEvent) => boolean) | undefined,
      priority: options.priority || 0
    };

    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(subscription);
    
    // Sort by priority (higher priority first)
    handlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    logger.info('Feature subscribed to event', {
      subscriptionId: subscription.id,
      feature: options.feature,
      eventType
    });

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.eventHandlers) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        logger.info('Unsubscribed from event', { subscriptionId, eventType });
        return true;
      }
    }
    return false;
  }

  /**
   * Publish events to subscribers
   */
  async publish<TData = any>(
    eventType: FeatureEventType, 
    data: TData,
    options: {
      source: string;
      correlationId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const event: FeatureEvent<TData> = {
      type: eventType,
      source: options.source,
      timestamp: new Date(),
      correlationId: options.correlationId,
      data,
      metadata: options.metadata
    };

    // Store in history
    this.eventHistory.push(event);
    this.metrics.eventsPublished++;

    // Keep history size manageable
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-500);
    }

    logger.info('Publishing event', {
      eventType,
      source: options.source,
      correlationId: options.correlationId
    });

    const subscriptions = this.eventHandlers.get(eventType) || [];
    const handlerPromises: Promise<void>[] = [];

    for (const subscription of subscriptions) {
      // Apply filter if provided
      if (subscription.filter && !subscription.filter(event)) {
        continue;
      }

      const handlerPromise = this.executeEventHandler(subscription, event);
      handlerPromises.push(handlerPromise);
    }

    // Execute all handlers
    try {
      await Promise.all(handlerPromises);
      logger.info('Event published successfully', {
        eventType,
        handlerCount: handlerPromises.length
      });
    } catch (error) {
      this.metrics.errorsOccurred++;
      logger.error('Error publishing event', {
        eventType,
        error: error.message
      });
      throw error;
    }
  }

  private async executeEventHandler(subscription: FeatureSubscription, event: FeatureEvent): Promise<void> {
    try {
      const result = subscription.handler(event);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      logger.error('Error in event handler', {
        subscriptionId: subscription.id,
        feature: subscription.feature,
        eventType: subscription.eventType,
        error: error.message
      });
      
      // Publish error event
      await this.publish('error-occurred', {
        originalEvent: event,
        error: error.message,
        handler: subscription.feature
      }, {
        source: 'feature-bus'
      });
    }
  }

  // ===== REQUEST-RESPONSE COMMUNICATION =====

  /**
   * Send request to another feature and wait for response
   */
  async request<TRequest = any, TResponse = any>(
    feature: string,
    operation: string,
    data: TRequest,
    options: {
      timeout?: number;
      priority?: 'low' | 'normal' | 'high';
      correlationId?: string;
      retries?: number;
    } = {}
  ): Promise<TResponse> {
    const request: FeatureRequest<TRequest> = {
      id: this.generateRequestId(),
      feature,
      operation,
      data,
      timeout: options.timeout || 30000,
      priority: options.priority || 'normal',
      correlationId: options.correlationId,
      metadata: { retries: options.retries || 0 }
    };

    logger.info('Sending feature request', {
      requestId: request.id,
      feature,
      operation,
      priority: request.priority
    });

    const startTime = Date.now();

    try {
      const response = await this.executeFeatureRequest(request);
      const duration = Date.now() - startTime;
      
      this.metrics.requestsProcessed++;
      this.updateAverageRequestDuration(duration);

      if (!response.success) {
        throw new Error(`Feature request failed: ${response.error}`);
      }

      logger.info('Feature request completed', {
        requestId: request.id,
        duration,
        success: response.success
      });

      return response.data!;

    } catch (error) {
      this.metrics.errorsOccurred++;
      logger.error('Feature request failed', {
        requestId: request.id,
        feature,
        operation,
        error: error.message
      });
      throw error;
    }
  }

  private async executeFeatureRequest<TRequest, TResponse>(
    request: FeatureRequest<TRequest>
  ): Promise<FeatureResponse<TResponse>> {
    const feature = this.featureRegistry.get(request.feature);
    
    if (!feature) {
      return {
        requestId: request.id,
        success: false,
        error: `Feature not found: ${request.feature}`,
        duration: 0,
        timestamp: new Date()
      };
    }

    if (typeof feature[request.operation] !== 'function') {
      return {
        requestId: request.id,
        success: false,
        error: `Operation not found: ${request.operation} in feature ${request.feature}`,
        duration: 0,
        timestamp: new Date()
      };
    }

    const startTime = Date.now();

    try {
      // Execute the operation with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), request.timeout)
      );

      const operationPromise = feature[request.operation](request.data);
      const result = await Promise.race([operationPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      return {
        requestId: request.id,
        success: true,
        data: result,
        duration,
        timestamp: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        requestId: request.id,
        success: false,
        error: error.message,
        duration,
        timestamp: new Date()
      };
    }
  }

  // ===== FEATURE REGISTRATION AND DISCOVERY =====

  /**
   * Register a feature with its capabilities
   */
  registerFeature(
    name: string, 
    featureInstance: any, 
    capabilities: FeatureCapabilityDefinition
  ): void {
    this.featureRegistry.set(name, featureInstance);
    this.featureCapabilities.set(name, capabilities);

    logger.info('Feature registered', {
      featureName: name,
      version: capabilities.version,
      operationCount: capabilities.operations.length
    });

    // Publish feature registration event
    this.publish('feature-registered', {
      featureName: name,
      capabilities
    }, {
      source: 'feature-bus'
    });
  }

  /**
   * Unregister a feature
   */
  unregisterFeature(name: string): boolean {
    const removed = this.featureRegistry.delete(name) && this.featureCapabilities.delete(name);
    
    if (removed) {
      logger.info('Feature unregistered', { featureName: name });
      
      // Publish feature unregistration event
      this.publish('feature-unregistered', {
        featureName: name
      }, {
        source: 'feature-bus'
      });
    }

    return removed;
  }

  /**
   * Discover available features and their capabilities
   */
  discoverFeatures(): FeatureCapabilityDefinition[] {
    return Array.from(this.featureCapabilities.values());
  }

  /**
   * Get specific feature capabilities
   */
  getFeatureCapabilities(featureName: string): FeatureCapabilityDefinition | undefined {
    return this.featureCapabilities.get(featureName);
  }

  /**
   * Check if feature supports operation
   */
  hasOperation(featureName: string, operationName: string): boolean {
    const capabilities = this.featureCapabilities.get(featureName);
    return capabilities?.operations.some(op => op.name === operationName) || false;
  }

  // ===== MONITORING AND DIAGNOSTICS =====

  /**
   * Get event history for debugging
   */
  getEventHistory(options: {
    eventType?: FeatureEventType;
    source?: string;
    limit?: number;
    since?: Date;
  } = {}): FeatureEvent[] {
    let events = this.eventHistory;

    if (options.eventType) {
      events = events.filter(e => e.type === options.eventType);
    }

    if (options.source) {
      events = events.filter(e => e.source === options.source);
    }

    if (options.since) {
      events = events.filter(e => e.timestamp >= options.since!);
    }

    return events.slice(-(options.limit || 100));
  }

  /**
   * Get bus metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeSubscriptions: Array.from(this.eventHandlers.values())
        .reduce((total, subs) => total + subs.length, 0),
      registeredFeatures: this.featureRegistry.size,
      activeRequests: this.activeRequests.size
    };
  }

  /**
   * Health check for the feature bus
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const metrics = this.getMetrics();
    const errorRate = metrics.requestsProcessed > 0 
      ? metrics.errorsOccurred / metrics.requestsProcessed 
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (errorRate > 0.1) {
      status = 'degraded';
    }
    if (errorRate > 0.3 || metrics.averageRequestDuration > 10000) {
      status = 'unhealthy';
    }

    return {
      status,
      details: {
        errorRate,
        averageRequestDuration: metrics.averageRequestDuration,
        registeredFeatures: metrics.registeredFeatures,
        activeSubscriptions: metrics.activeSubscriptions
      }
    };
  }

  // ===== UTILITY METHODS =====

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateAverageRequestDuration(newDuration: number): void {
    const currentAvg = this.metrics.averageRequestDuration;
    const totalRequests = this.metrics.requestsProcessed;
    
    this.metrics.averageRequestDuration = 
      (currentAvg * (totalRequests - 1) + newDuration) / totalRequests;
  }
} 