/**
 * AI Logger Service - Structured Logging for AI Operations
 * 
 * Provides centralized, structured logging for all AI-related operations
 * with environment-aware behavior and AIDevTools integration.
 * 
 * Enhanced with real-time streaming capabilities for Sprint 6.
 */

export interface InitData {
  serviceName: string;
  userProfile?: {
    fitnessLevel?: string;
    goals?: string[];
  };
  featureFlags: Record<string, boolean>;
  environment: {
    isDevelopment: boolean;
    isConfigured: boolean;
    hasApiKey: boolean;
  };
  timestamp: string;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface PerformanceData {
  operation: string;
  duration: number;
  memoryUsage?: number;
  cacheHit?: boolean;
  tokenUsage?: number;
  component: string;
  timestamp: string;
}

export interface ErrorData {
  error: Error;
  context: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userImpact: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MigrationData {
  fromContext: string;
  toContext: string;
  userId?: string;
  success: boolean;
  duration?: number;
  error?: string;
  featureFlags: Record<string, unknown>;
  timestamp: string;
}

export interface AILogger {
  // Core logging methods
  initialization: (data: InitData) => void;
  featureFlag: (flag: string, enabled: boolean, context?: string) => void;
  performance: (data: PerformanceData) => void;
  error: (data: Omit<ErrorData, 'timestamp'>) => void;
  
  // AI-specific methods
  migration: (data: MigrationData) => void;
  analysis: (operation: string, data: Record<string, unknown>) => void;
  recommendation: (type: string, data: Record<string, unknown>) => void;
  interaction: (component: string, action: string, data?: Record<string, unknown>) => void;
  
  // Utility methods
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  
  // Configuration
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => void;
  enableAIDevTools: (enabled: boolean) => void;
  getLogHistory: () => LogEntry[];

  // Enhanced methods for Sprint 6
  getLogStream: () => LogEventEmitter;
  getFilteredLogs: (filters: LogFilters) => LogEntry[];
  setLogStreamConfig: (config: Partial<LogStreamConfig>) => void;
  getLogStreamConfig: () => LogStreamConfig;
  clearLogHistory: () => void;
  exportLogs: (format: 'json' | 'csv') => string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  component?: string;
  context?: string;
  type?: string;
}

// Enhanced interfaces for Sprint 6
export interface LogFilters {
  logLevel?: LogLevel[];
  component?: string[];
  context?: string[];
  timeRange?: { start: Date; end: Date };
  searchTerm?: string;
  type?: string[];
}

export interface LogStreamConfig {
  enableLiveStreaming: boolean;
  maxLogEntries: number;
  autoScroll: boolean;
  batchSize: number;
  debounceMs: number;
}

// Simple event emitter for log streaming
class LogEventEmitter {
  private listeners: Map<string, Set<(entry: LogEntry) => void>> = new Map();

  public on(event: string, callback: (entry: LogEntry) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  public emit(event: string, entry: LogEntry): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(entry);
        } catch (error) {
          console.error('Error in log stream callback:', error);
        }
      });
    }
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }
}

export class AILoggerService implements AILogger {
  private static instance: AILoggerService;
  private logLevel: LogLevel = 'info';
  private isDevelopment: boolean;
  private aiDevToolsEnabled: boolean = false;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  // Enhanced properties for Sprint 6
  private logStream: LogEventEmitter = new LogEventEmitter();
  private logStreamConfig: LogStreamConfig = {
    enableLiveStreaming: true,
    maxLogEntries: 1000,
    autoScroll: true,
    batchSize: 10,
    debounceMs: 300
  };
  private pendingLogs: LogEntry[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): AILoggerService {
    if (!AILoggerService.instance) {
      AILoggerService.instance = new AILoggerService();
    }
    return AILoggerService.instance;
  }

  /**
   * Get log stream for real-time log consumption
   */
  public getLogStream(): LogEventEmitter {
    return this.logStream;
  }

  /**
   * Get filtered logs based on criteria
   */
  public getFilteredLogs(filters: LogFilters): LogEntry[] {
    return this.logHistory.filter(entry => this.matchesFilters(entry, filters));
  }

  /**
   * Set log stream configuration
   */
  public setLogStreamConfig(config: Partial<LogStreamConfig>): void {
    this.logStreamConfig = { ...this.logStreamConfig, ...config };
    this.info('Log stream configuration updated', { config: this.logStreamConfig });
  }

  /**
   * Get current log stream configuration
   */
  public getLogStreamConfig(): LogStreamConfig {
    return { ...this.logStreamConfig };
  }

  /**
   * Get log history for debugging
   */
  public getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  public clearLogHistory(): void {
    this.logHistory = [];
    this.pendingLogs = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    // Don't log the clear operation to avoid infinite recursion
  }

  /**
   * Export logs in specified format
   */
  public exportLogs(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.logHistory, null, 2);
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Message', 'Component', 'Context', 'Type'];
      const rows = this.logHistory.map(entry => [
        entry.timestamp,
        entry.level,
        entry.message,
        entry.component || '',
        entry.context || '',
        entry.type || ''
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    return '';
  }

  /**
   * Check if log entry matches filters
   */
  private matchesFilters(entry: LogEntry, filters: LogFilters): boolean {
    // Log level filter
    if (filters.logLevel && filters.logLevel.length > 0) {
      if (!filters.logLevel.includes(entry.level)) {
        return false;
      }
    }

    // Component filter
    if (filters.component && filters.component.length > 0) {
      if (!entry.component || !filters.component.includes(entry.component)) {
        return false;
      }
    }

    // Context filter
    if (filters.context && filters.context.length > 0) {
      if (!entry.context || !filters.context.includes(entry.context)) {
        return false;
      }
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!entry.type || !filters.type.includes(entry.type)) {
        return false;
      }
    }

    // Time range filter
    if (filters.timeRange) {
      const entryTime = new Date(entry.timestamp);
      if (entryTime < filters.timeRange.start || entryTime > filters.timeRange.end) {
        return false;
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const messageLower = entry.message.toLowerCase();
      const dataString = JSON.stringify(entry.data || '').toLowerCase();
      
      if (!messageLower.includes(searchLower) && !dataString.includes(searchLower)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Emit log entry to stream with debouncing
   */
  private emitToStream(entry: LogEntry): void {
    if (!this.logStreamConfig.enableLiveStreaming) {
      return;
    }

    this.pendingLogs.push(entry);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced emission
    this.debounceTimer = setTimeout(() => {
      this.flushPendingLogs();
    }, this.logStreamConfig.debounceMs);
  }

  /**
   * Flush pending logs to stream
   */
  private flushPendingLogs(): void {
    if (this.pendingLogs.length === 0) {
      return;
    }

    // Emit individual logs for real-time updates
    this.pendingLogs.forEach(entry => {
      this.logStream.emit('log-entry', entry);
    });

    // Emit logs in batches
    const batchSize = this.logStreamConfig.batchSize;
    for (let i = 0; i < this.pendingLogs.length; i += batchSize) {
      const batch = this.pendingLogs.slice(i, i + batchSize);
      this.logStream.emit('log-batch', batch as any);
    }

    this.pendingLogs = [];
    this.debounceTimer = null;
  }

  /**
   * Log AI service initialization
   */
  public initialization(data: InitData): void {
    const message = `AI Service Initialization: ${data.serviceName} - ${data.success ? 'SUCCESS' : 'FAILED'}`;
    const level: LogLevel = data.success ? 'info' : 'error';
    
    this.log(level, message, {
      ...data,
      type: 'initialization'
    });
  }

  /**
   * Log feature flag changes
   */
  public featureFlag(flag: string, enabled: boolean, context?: string): void {
    const message = `Feature Flag: ${flag} = ${enabled}`;
    
    this.log('info', message, {
      flag,
      enabled,
      context,
      type: 'feature_flag'
    });
  }

  /**
   * Log performance metrics
   */
  public performance(data: PerformanceData): void {
    const message = `Performance: ${data.operation} - ${data.duration}ms`;
    const level: LogLevel = data.duration > 1000 ? 'warn' : 'info';
    
    this.log(level, message, {
      ...data,
      type: 'performance'
    });
  }

  /**
   * Log errors with structured data
   */
  public error(data: Omit<ErrorData, 'timestamp'>): void {
    const errorData: ErrorData = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    // Add null checking for error object
    const errorMessage = data.error?.message || 'Unknown error';
    const message = `Error in ${data.component}: ${errorMessage}`;
    
    this.log('error', message, {
      ...errorData,
      type: 'error'
    });
  }

  /**
   * Log migration events
   */
  public migration(data: MigrationData): void {
    const message = `Migration: ${data.fromContext} → ${data.toContext} - ${data.success ? 'SUCCESS' : 'FAILED'}`;
    const level: LogLevel = data.success ? 'info' : 'error';
    
    this.log(level, message, {
      ...data,
      type: 'migration'
    });
  }

  /**
   * Log AI analysis operations
   */
  public analysis(operation: string, data: Record<string, unknown>): void {
    const message = `AI Analysis: ${operation}`;
    
    this.log('info', message, {
      operation,
      ...data,
      type: 'analysis'
    });
  }

  /**
   * Log AI recommendations
   */
  public recommendation(type: string, data: Record<string, unknown>): void {
    const message = `AI Recommendation: ${type}`;
    
    this.log('info', message, {
      recommendationType: type,
      ...data,
      type: 'recommendation'
    });
  }

  /**
   * Log AI interactions
   */
  public interaction(component: string, action: string, data?: Record<string, unknown>): void {
    const message = `AI Interaction: ${component} - ${action}`;
    
    this.log('debug', message, {
      component,
      action,
      ...data,
      type: 'interaction'
    });
  }

  /**
   * Debug logging
   */
  public debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Info logging
   */
  public info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Warning logging
   */
  public warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('Log level changed', { newLevel: level });
  }

  /**
   * Enable/disable AIDevTools integration
   */
  public enableAIDevTools(enabled: boolean): void {
    this.aiDevToolsEnabled = enabled;
    this.info('AIDevTools logging', { enabled });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // Check if we should log based on current level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      component: this.extractComponent(data),
      context: this.extractContext(data),
      type: this.extractType(data)
    };

    // Add to history
    this.addToHistory(entry);

    // Output to console based on environment
    this.outputToConsole(entry);

    // Send to AIDevTools if enabled
    if (this.aiDevToolsEnabled && this.isDevelopment) {
      this.sendToAIDevTools(entry);
    }

    // Emit to stream for real-time consumption
    this.emitToStream(entry);
  }

  /**
   * Check if we should log based on current level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Limit history size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Output to console with environment-aware formatting
   */
  private outputToConsole(entry: LogEntry): void {
    if (!this.isDevelopment && entry.level === 'debug') {
      return; // Skip debug logs in production
    }

    const prefix = `[${entry.timestamp}] [AI Logger]`;
    const emoji = this.getLevelEmoji(entry.level);
    const formattedMessage = `${prefix} ${emoji} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage, entry.data);
        break;
      case 'info':
        console.info(formattedMessage, entry.data);
        break;
      case 'warn':
        console.warn(formattedMessage, entry.data);
        break;
      case 'error':
        console.error(formattedMessage, entry.data);
        break;
    }
  }

  /**
   * Send log entry to AIDevTools
   */
  private sendToAIDevTools(entry: LogEntry): void {
    // This would integrate with AIDevTools component
    // For now, we'll just log it as a special format
    if (entry.level === 'error' || entry.level === 'warn') {
      console.group(`🔧 AIDevTools - ${entry.level.toUpperCase()}`);
      console.log('Message:', entry.message);
      console.log('Data:', entry.data);
      console.log('Timestamp:', entry.timestamp);
      console.groupEnd();
    }
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '🔍';
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  /**
   * Generate unique ID for log entries
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract component from log data
   */
  private extractComponent(data?: unknown): string | undefined {
    if (data && typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;
      return dataObj.component as string || dataObj.context as string;
    }
    return undefined;
  }

  /**
   * Extract context from log data
   */
  private extractContext(data?: unknown): string | undefined {
    if (data && typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;
      return dataObj.context as string;
    }
    return undefined;
  }

  /**
   * Extract type from log data
   */
  private extractType(data?: unknown): string | undefined {
    if (data && typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;
      return dataObj.type as string;
    }
    return undefined;
  }
}

// Export singleton instance
export const aiLogger = AILoggerService.getInstance(); 