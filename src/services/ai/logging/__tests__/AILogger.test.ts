/**
 * AI Logger Service Tests
 * 
 * Comprehensive tests for the structured logging service
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { AILoggerService, aiLogger } from '../AILogger';
import type { InitData, PerformanceData, ErrorData, MigrationData, LogFilters, LogStreamConfig } from '../AILogger';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
  log: jest.fn()
};

describe('AILoggerService', () => {
  let logger: AILoggerService;

  beforeEach(() => {
    // Reset singleton instance
    (AILoggerService as any).instance = undefined;
    
    // Mock console methods
    global.console = mockConsole as any;
    
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Create new instance
    logger = AILoggerService.getInstance();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Restore environment after creating logger
    process.env.NODE_ENV = originalEnv;
  });

  afterEach(() => {
    // Restore console
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AILoggerService.getInstance();
      const instance2 = AILoggerService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Log Level Management', () => {
    it('should set log level correctly', () => {
      logger.setLogLevel('debug');
      
      // Should log info message about level change
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ Log level changed'),
        expect.objectContaining({ newLevel: 'debug' })
      );
    });

    it('should respect log level filtering', () => {
      logger.setLogLevel('warn');
      
      // Debug and info should not be logged
      logger.debug('Debug message');
      logger.info('Info message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      
      // Warn and error should be logged
      logger.warn('Warning message');
      logger.error({ error: new Error('Test'), context: 'test', component: 'test', severity: 'medium', userImpact: false, timestamp: new Date().toISOString() });
      
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('Initialization Logging', () => {
    it('should log successful initialization', () => {
      const initData: InitData = {
        serviceName: 'TestService',
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['strength']
        },
        featureFlags: { test_flag: true },
        environment: {
          isDevelopment: true,
          isConfigured: true,
          hasApiKey: true
        },
        timestamp: new Date().toISOString(),
        duration: 150,
        success: true
      };

      logger.initialization(initData);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ AI Service Initialization: TestService - SUCCESS'),
        expect.objectContaining({
          ...initData,
          type: 'initialization'
        })
      );
    });

    it('should log failed initialization', () => {
      const initData: InitData = {
        serviceName: 'TestService',
        featureFlags: {},
        environment: {
          isDevelopment: true,
          isConfigured: false,
          hasApiKey: false
        },
        timestamp: new Date().toISOString(),
        success: false,
        error: 'Configuration error'
      };

      logger.initialization(initData);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ❌ AI Service Initialization: TestService - FAILED'),
        expect.objectContaining({
          ...initData,
          type: 'initialization'
        })
      );
    });
  });

  describe('Feature Flag Logging', () => {
    it('should log feature flag changes', () => {
      logger.featureFlag('test_flag', true, 'test_context');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ Feature Flag: test_flag = true'),
        expect.objectContaining({
          flag: 'test_flag',
          enabled: true,
          context: 'test_context',
          type: 'feature_flag'
        })
      );
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const perfData: PerformanceData = {
        operation: 'test_operation',
        duration: 500,
        memoryUsage: 1024,
        cacheHit: true,
        tokenUsage: 100,
        component: 'TestComponent',
        timestamp: new Date().toISOString()
      };

      logger.performance(perfData);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ Performance: test_operation - 500ms'),
        expect.objectContaining({
          ...perfData,
          type: 'performance'
        })
      );
    });

    it('should log slow operations as warnings', () => {
      const perfData: PerformanceData = {
        operation: 'slow_operation',
        duration: 1500,
        component: 'TestComponent',
        timestamp: new Date().toISOString()
      };

      logger.performance(perfData);

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ⚠️ Performance: slow_operation - 1500ms'),
        expect.objectContaining({
          ...perfData,
          type: 'performance'
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should log errors with structured data', () => {
      const errorData: ErrorData = {
        error: new Error('Test error'),
        context: 'test_context',
        component: 'TestComponent',
        severity: 'high',
        userImpact: true,
        timestamp: new Date().toISOString(),
        metadata: { additional: 'data' }
      };

      logger.error(errorData);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ❌ Error in TestComponent: Test error'),
        expect.objectContaining({
          ...errorData,
          type: 'error'
        })
      );
    });
  });

  describe('Migration Logging', () => {
    it('should log successful migrations', () => {
      const migrationData: MigrationData = {
        fromContext: 'legacy',
        toContext: 'composed',
        userId: 'test_user',
        success: true,
        duration: 200,
        featureFlags: { migration_enabled: true },
        timestamp: new Date().toISOString()
      };

      logger.migration(migrationData);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ Migration: legacy → composed - SUCCESS'),
        expect.objectContaining({
          ...migrationData,
          type: 'migration'
        })
      );
    });

    it('should log failed migrations', () => {
      const migrationData: MigrationData = {
        fromContext: 'legacy',
        toContext: 'composed',
        success: false,
        error: 'Migration failed',
        featureFlags: { migration_enabled: true },
        timestamp: new Date().toISOString()
      };

      logger.migration(migrationData);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ❌ Migration: legacy → composed - FAILED'),
        expect.objectContaining({
          ...migrationData,
          type: 'migration'
        })
      );
    });
  });

  describe('AI-Specific Logging', () => {
    it('should log analysis operations', () => {
      logger.analysis('workout_analysis', { 
        workoutType: 'strength',
        duration: 45,
        complexity: 'intermediate'
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ AI Analysis: workout_analysis'),
        expect.objectContaining({
          operation: 'workout_analysis',
          workoutType: 'strength',
          duration: 45,
          complexity: 'intermediate',
          type: 'analysis'
        })
      );
    });

    it('should log recommendations', () => {
      logger.recommendation('exercise_suggestion', {
        exercise: 'push-ups',
        sets: 3,
        reps: 10
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ AI Recommendation: exercise_suggestion'),
        expect.objectContaining({
          type: 'exercise_suggestion',
          exercise: 'push-ups',
          sets: 3,
          reps: 10,
          type: 'recommendation'
        })
      );
    });

    it('should log interactions', () => {
      // Set log level to debug to allow interaction logs
      logger.setLogLevel('debug');
      
      // Clear previous calls
      jest.clearAllMocks();
      
      logger.interaction('EnergyLevelSection', 'level_changed', {
        oldLevel: 5,
        newLevel: 7
      });

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] 🔍 AI Interaction: EnergyLevelSection - level_changed'),
        expect.objectContaining({
          component: 'EnergyLevelSection',
          action: 'level_changed',
          oldLevel: 5,
          newLevel: 7,
          type: 'interaction'
        })
      );
    });
  });

  describe('Log History', () => {
    it('should maintain log history', () => {
      logger.info('Test message 1');
      logger.warn('Test message 2');
      logger.error({ error: new Error('Test'), context: 'test', component: 'test', severity: 'medium', userImpact: false, timestamp: new Date().toISOString() });

      const history = logger.getLogHistory();
      
      expect(history).toHaveLength(3);
      expect(history[0].message).toBe('Test message 1');
      expect(history[1].message).toBe('Test message 2');
      expect(history[2].message).toContain('Error in test: Test');
    });

    it('should limit history size', () => {
      // Set a small max history size for testing
      (logger as any).maxHistorySize = 3;
      
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      logger.info('Message 4'); // Should remove Message 1

      const history = logger.getLogHistory();
      expect(history).toHaveLength(3);
      expect(history[0].message).toBe('Message 2');
      expect(history[2].message).toBe('Message 4');
    });
  });

  describe('AIDevTools Integration', () => {
    it('should enable AIDevTools logging', () => {
      logger.enableAIDevTools(true);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ AIDevTools logging'),
        expect.objectContaining({ enabled: true })
      );
    });

    it('should format AIDevTools output for errors and warnings', () => {
      // Mock development environment for AIDevTools
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Reset logger to pick up new environment
      (AILoggerService as any).instance = undefined;
      const devLogger = AILoggerService.getInstance();
      
      devLogger.enableAIDevTools(true);
      
      // Clear previous calls
      jest.clearAllMocks();
      
      devLogger.error({ 
        error: new Error('Test error'), 
        context: 'test', 
        component: 'test', 
        severity: 'high', 
        userImpact: true, 
        timestamp: new Date().toISOString() 
      });

      expect(mockConsole.group).toHaveBeenCalledWith('🔧 AIDevTools - ERROR');
      expect(mockConsole.groupEnd).toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Environment Awareness', () => {
    it('should skip debug logs in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Reset logger to pick up new environment
      (AILoggerService as any).instance = undefined;
      const prodLogger = AILoggerService.getInstance();
      
      prodLogger.debug('Debug message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Utility Methods', () => {
    it('should provide basic logging methods', () => {
      // Set log level to debug to allow all logs
      logger.setLogLevel('debug');
      
      // Clear previous calls
      jest.clearAllMocks();
      
      logger.debug('Debug message', { debug: 'data' });
      logger.info('Info message', { info: 'data' });
      logger.warn('Warning message', { warn: 'data' });

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] 🔍 Debug message'),
        { debug: 'data' }
      );
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ℹ️ Info message'),
        { info: 'data' }
      );
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ⚠️ Warning message'),
        { warn: 'data' }
      );
    });
  });

  describe('Enhanced Log Collection (Sprint 6)', () => {
    describe('Log Streaming', () => {
      it('should provide log stream', () => {
        const stream = logger.getLogStream();
        expect(stream).toBeDefined();
        expect(typeof stream.on).toBe('function');
        expect(typeof stream.emit).toBe('function');
      });

      it('should emit log entries to stream', (done) => {
        const stream = logger.getLogStream();
        const testMessage = 'Test log message';
        
        stream.on('log-entry', (entry) => {
          expect(entry.message).toBe(testMessage);
          expect(entry.level).toBe('info');
          expect(entry.timestamp).toBeDefined();
          done();
        });

        logger.info(testMessage);
      });

      it('should emit log batches', (done) => {
        const stream = logger.getLogStream();
        let batchCount = 0;
        
        stream.on('log-batch', (batch) => {
          batchCount++;
          expect(Array.isArray(batch)).toBe(true);
          expect(batch.length).toBeGreaterThan(0);
          
          if (batchCount >= 1) {
            done();
          }
        });

        // Send multiple logs to trigger batching
        logger.info('Log 1');
        logger.info('Log 2');
        logger.info('Log 3');
        logger.info('Log 4');
        logger.info('Log 5');
      }, 10000); // Increase timeout

      it('should respect debounce configuration', (done) => {
        const stream = logger.getLogStream();
        let emitCount = 0;
        
        stream.on('log-entry', () => {
          emitCount++;
        });

        // Set short debounce for testing
        logger.setLogStreamConfig({ debounceMs: 50 });
        
        // Send multiple logs quickly
        logger.info('Log 1');
        logger.info('Log 2');
        logger.info('Log 3');

        // Should be batched due to debouncing
        setTimeout(() => {
          // We expect 4 logs: 3 test logs + 1 config change log
          expect(emitCount).toBe(4);
          done();
        }, 200); // Increase timeout to account for debounce
      }, 10000); // Increase timeout

      it('should allow unsubscribing from stream', () => {
        const stream = logger.getLogStream();
        const callback = jest.fn();
        
        // Test that we can subscribe
        const unsubscribe = stream.on('log-entry', callback);
        expect(typeof unsubscribe).toBe('function');
        
        // Test that we can unsubscribe
        unsubscribe();
        
        // Test that the callback is no longer called
        logger.info('Test message after unsubscribe');
        
        // The callback should not be called since we unsubscribed
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('Log Stream Configuration', () => {
      it('should get default configuration', () => {
        const config = logger.getLogStreamConfig();
        
        expect(config.enableLiveStreaming).toBe(true);
        expect(config.maxLogEntries).toBe(1000);
        expect(config.autoScroll).toBe(true);
        expect(config.batchSize).toBe(10);
        expect(config.debounceMs).toBe(300);
      });

      it('should update configuration', () => {
        const newConfig: Partial<LogStreamConfig> = {
          enableLiveStreaming: false,
          batchSize: 5,
          debounceMs: 100
        };
        
        logger.setLogStreamConfig(newConfig);
        const config = logger.getLogStreamConfig();
        
        expect(config.enableLiveStreaming).toBe(false);
        expect(config.batchSize).toBe(5);
        expect(config.debounceMs).toBe(100);
        expect(config.maxLogEntries).toBe(1000); // Should remain unchanged
      });

      it('should disable streaming when configured', (done) => {
        const stream = logger.getLogStream();
        const callback = jest.fn();
        
        stream.on('log-entry', callback);
        
        logger.setLogStreamConfig({ enableLiveStreaming: false });
        logger.info('Test message');
        
        // Should not emit due to disabled streaming
        setTimeout(() => {
          expect(callback).not.toHaveBeenCalled();
          done();
        }, 100);
      }, 10000); // Increase timeout
    });

    describe('Log History Management', () => {
      it('should clear log history', () => {
        logger.info('Test message');
        expect(logger.getLogHistory().length).toBeGreaterThan(0);
        
        logger.clearLogHistory();
        expect(logger.getLogHistory().length).toBe(0);
      });

      it('should export logs as JSON', () => {
        logger.info('Test message', { component: 'TestComponent' });
        
        const jsonExport = logger.exportLogs('json');
        const parsed = JSON.parse(jsonExport);
        
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
        expect(parsed[0]).toHaveProperty('message');
        expect(parsed[0]).toHaveProperty('timestamp');
        expect(parsed[0]).toHaveProperty('level');
      });

      it('should export logs as CSV', () => {
        logger.info('Test message', { component: 'TestComponent' });
        
        const csvExport = logger.exportLogs('csv');
        const lines = csvExport.split('\n');
        
        expect(lines.length).toBeGreaterThan(1);
        expect(lines[0]).toContain('Timestamp,Level,Message,Component,Context,Type');
        expect(lines[1]).toContain('Test message');
      });
    });

    describe('Data Extraction', () => {
      it('should extract component from log data', () => {
        logger.info('Test message', { component: 'TestComponent' });
        
        const history = logger.getLogHistory();
        const lastEntry = history[history.length - 1];
        
        expect(lastEntry.component).toBe('TestComponent');
      });

      it('should extract context from log data', () => {
        logger.info('Test message', { context: 'test_context' });
        
        const history = logger.getLogHistory();
        const lastEntry = history[history.length - 1];
        
        expect(lastEntry.context).toBe('test_context');
      });

      it('should extract type from log data', () => {
        logger.info('Test message', { type: 'test_type' });
        
        const history = logger.getLogHistory();
        const lastEntry = history[history.length - 1];
        
        expect(lastEntry.type).toBe('test_type');
      });

      it('should handle missing data gracefully', () => {
        logger.info('Test message');
        
        const history = logger.getLogHistory();
        const lastEntry = history[history.length - 1];
        
        expect(lastEntry.component).toBeUndefined();
        expect(lastEntry.context).toBeUndefined();
        expect(lastEntry.type).toBeUndefined();
      });
    });

    describe('Log Filtering', () => {
      beforeEach(() => {
        // Clear any existing logs
        logger.clearLogHistory();
        
        // Add some test logs
        logger.info('Info message 1', { component: 'TestComponent', context: 'test' });
        logger.warn('Warning message', { component: 'TestComponent', context: 'test' });
        logger.error({ 
          error: new Error('Test error'), 
          context: 'error_test', 
          component: 'ErrorComponent', 
          severity: 'high', 
          userImpact: true, 
          timestamp: new Date().toISOString() 
        });
        logger.debug('Debug message', { component: 'DebugComponent', type: 'debug' });
      });

      it('should filter by log level', () => {
        const filters: LogFilters = { logLevel: ['error', 'warn'] };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(2);
        expect(filtered.every(log => ['error', 'warn'].includes(log.level))).toBe(true);
      });

      it('should filter by component', () => {
        const filters: LogFilters = { component: ['TestComponent'] };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(2);
        expect(filtered.every(log => log.component === 'TestComponent')).toBe(true);
      });

      it('should filter by context', () => {
        const filters: LogFilters = { context: ['test'] };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(2);
        expect(filtered.every(log => log.context === 'test')).toBe(true);
      });

      it('should filter by type', () => {
        // Clear logs first
        logger.clearLogHistory();
        
        // Add a log with explicit type
        logger.info('Test message', { type: 'test_type' });
        
        const filters: LogFilters = { type: ['test_type'] };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(1);
        expect(filtered[0].type).toBe('test_type');
      });

      it('should filter by time range', () => {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const oneMinuteFromNow = new Date(now.getTime() + 60000);
        
        const filters: LogFilters = { 
          timeRange: { start: oneMinuteAgo, end: oneMinuteFromNow } 
        };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBeGreaterThan(0);
        filtered.forEach(log => {
          const logTime = new Date(log.timestamp);
          expect(logTime >= oneMinuteAgo).toBe(true);
          expect(logTime <= oneMinuteFromNow).toBe(true);
        });
      });

      it('should filter by search term', () => {
        const filters: LogFilters = { searchTerm: 'error' };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(1);
        expect(filtered[0].message).toContain('error');
      });

      it('should combine multiple filters', () => {
        const filters: LogFilters = { 
          logLevel: ['info', 'warn'],
          component: ['TestComponent']
        };
        const filtered = logger.getFilteredLogs(filters);
        
        expect(filtered.length).toBe(2);
        expect(filtered.every(log => 
          ['info', 'warn'].includes(log.level) && log.component === 'TestComponent'
        )).toBe(true);
      });
    });
  });
});

describe('aiLogger Singleton', () => {
  it('should provide the singleton instance', () => {
    // Reset singleton to ensure clean state
    (AILoggerService as any).instance = undefined;
    
    const instance1 = AILoggerService.getInstance();
    const instance2 = aiLogger;
    
    expect(aiLogger).toBeDefined();
    expect(aiLogger).toBeInstanceOf(AILoggerService);
    expect(instance1).toStrictEqual(instance2);
  });
}); 