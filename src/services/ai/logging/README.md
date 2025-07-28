# AI Logger Service

## Overview

The AI Logger Service provides structured, centralized logging for all AI-related operations in the application. It replaces scattered console statements with a unified logging system that supports environment-aware behavior, log level filtering, and AIDevTools integration.

**Enhanced with real-time streaming capabilities for Sprint 6.**

## Features

### 🎯 **Structured Logging**
- **Type-safe interfaces** for all log data
- **Consistent formatting** across all AI operations
- **Structured metadata** for better debugging and monitoring

### 🌍 **Environment Awareness**
- **Development mode**: Full logging with debug information
- **Production mode**: Errors and warnings only
- **Configurable log levels** for different environments

### 🔧 **AIDevTools Integration**
- **Special formatting** for development tools
- **Grouped output** for better readability
- **Error and warning highlighting**

### 📊 **Log History**
- **In-memory log storage** for debugging
- **Configurable history size** (default: 1000 entries)
- **Timestamp tracking** for all entries

### 🚀 **Real-time Streaming (Sprint 6)**
- **Live log streaming** with event emitter pattern
- **Advanced filtering** by level, component, context, type, time range, and search terms
- **Configurable streaming** with debouncing and batching
- **Export capabilities** in JSON and CSV formats
- **Metadata extraction** for enhanced log analysis

## Quick Start

### Basic Usage

```typescript
import { aiLogger } from '../services/ai/logging/AILogger';

// Basic logging
aiLogger.info('AI service started');
aiLogger.warn('Performance degradation detected');
aiLogger.error({ 
  error: new Error('API call failed'), 
  context: 'workout_generation', 
  component: 'OpenAIService', 
  severity: 'high', 
  userImpact: true, 
  timestamp: new Date().toISOString() 
});
```

### Real-time Streaming (Sprint 6)

```typescript
// Subscribe to log stream
const stream = aiLogger.getLogStream();
const unsubscribe = stream.on('log-entry', (entry) => {
  console.log('New log:', entry);
});

// Unsubscribe when done
unsubscribe();
```

### Advanced Filtering (Sprint 6)

```typescript
// Filter by multiple criteria
const filtered = aiLogger.getFilteredLogs({
  logLevel: ['error', 'warn'],
  component: ['OpenAIService'],
  timeRange: { start: new Date(Date.now() - 3600000), end: new Date() },
  searchTerm: 'API call failed'
});
```

### Stream Configuration (Sprint 6)

```typescript
// Configure streaming behavior
aiLogger.setLogStreamConfig({
  enableLiveStreaming: true,
  batchSize: 5,
  debounceMs: 200,
  maxLogEntries: 2000
});
```

### Log Export (Sprint 6)

```typescript
// Export logs in different formats
const jsonLogs = aiLogger.exportLogs('json');
const csvLogs = aiLogger.exportLogs('csv');
```

### AI-Specific Logging

```typescript
// Log initialization
aiLogger.initialization({
  serviceName: 'AIService',
  userProfile: { fitnessLevel: 'intermediate', goals: ['strength'] },
  featureFlags: { ai_service_unified: true },
  environment: { isDevelopment: true, isConfigured: true, hasApiKey: true },
  timestamp: new Date().toISOString(),
  duration: 150,
  success: true
});

// Log performance metrics
aiLogger.performance({
  operation: 'workout_generation',
  duration: 1250,
  component: 'OpenAIService',
  timestamp: new Date().toISOString()
});

// Log AI analysis
aiLogger.analysis('user_preferences', {
  fitnessLevel: 'intermediate',
  goals: ['strength', 'endurance'],
  preferences: { duration: 'medium', intensity: 'high' }
});

// Log AI recommendations
aiLogger.recommendation('workout_plan', {
  type: 'strength_training',
  exercises: ['squats', 'deadlifts', 'bench_press'],
  duration: 45,
  intensity: 'high'
});

// Log user interactions
aiLogger.interaction('workout_customization', 'duration_changed', {
  oldValue: 30,
  newValue: 45,
  userPreference: 'more_time'
});
```

## API Reference

### Core Methods

#### `initialization(data: InitData)`
Logs AI service initialization events.

#### `featureFlag(flag: string, enabled: boolean, context?: string)`
Logs feature flag changes.

#### `performance(data: PerformanceData)`
Logs performance metrics with automatic warnings for slow operations.

#### `error(data: Omit<ErrorData, 'timestamp'>)`
Logs errors with structured data and severity levels.

### AI-Specific Methods

#### `migration(data: MigrationData)`
Logs context migration events.

#### `analysis(operation: string, data: Record<string, unknown>)`
Logs AI analysis operations.

#### `recommendation(type: string, data: Record<string, unknown>)`
Logs AI recommendation events.

#### `interaction(component: string, action: string, data?: Record<string, unknown>)`
Logs user interactions with AI components.

### Utility Methods

#### `debug(message: string, data?: Record<string, unknown>)`
Debug-level logging (development only).

#### `info(message: string, data?: Record<string, unknown>)`
Info-level logging.

#### `warn(message: string, data?: Record<string, unknown>)`
Warning-level logging.

### Configuration Methods

#### `setLogLevel(level: 'debug' | 'info' | 'warn' | 'error')`
Sets the minimum log level for output.

#### `enableAIDevTools(enabled: boolean)`
Enables/disables AIDevTools integration.

#### `getLogHistory()`
Returns the in-memory log history for debugging.

### Enhanced Methods (Sprint 6)

#### `getLogStream()`
Returns LogEventEmitter for real-time log consumption.

#### `getFilteredLogs(filters: LogFilters)`
Returns filtered log entries based on criteria.

#### `setLogStreamConfig(config: Partial<LogStreamConfig>)`
Configures streaming parameters.

#### `getLogStreamConfig()`
Returns current streaming configuration.

#### `clearLogHistory()`
Clears all logs and pending streams.

#### `exportLogs(format: 'json' | 'csv')`
Exports logs in specified format.

## Log Levels

### Debug (`🔍`)
- **Usage**: Detailed debugging information
- **Production**: Disabled
- **Development**: Full output

### Info (`ℹ️`)
- **Usage**: General information and successful operations
- **Production**: Enabled
- **Development**: Full output

### Warn (`⚠️`)
- **Usage**: Warnings and potential issues
- **Production**: Enabled
- **Development**: Full output with AIDevTools grouping

### Error (`❌`)
- **Usage**: Errors and failures
- **Production**: Enabled
- **Development**: Full output with AIDevTools grouping

## Enhanced Features (Sprint 6)

### Real-time Streaming
The enhanced logging system provides real-time streaming capabilities for live debugging:

```typescript
// Subscribe to individual log entries
stream.on('log-entry', (entry) => {
  console.log('New log entry:', entry);
});

// Subscribe to log batches
stream.on('log-batch', (batch) => {
  console.log('Log batch:', batch);
});
```

### Advanced Filtering
Comprehensive filtering capabilities for focused debugging:

```typescript
interface LogFilters {
  logLevel?: LogLevel[];           // Filter by log levels
  component?: string[];            // Filter by components
  context?: string[];              // Filter by contexts
  timeRange?: { start: Date; end: Date }; // Filter by time range
  searchTerm?: string;             // Search in messages and data
  type?: string[];                 // Filter by log types
}
```

### Stream Configuration
Configurable streaming behavior for different use cases:

```typescript
interface LogStreamConfig {
  enableLiveStreaming: boolean;    // Enable/disable streaming
  maxLogEntries: number;           // Maximum log history size
  autoScroll: boolean;             // Auto-scroll in UI
  batchSize: number;               // Batch size for processing
  debounceMs: number;              // Debounce delay in milliseconds
}
```

## Integration Examples

### AIMigrationProvider Integration

```typescript
// Replace console.log statements
aiLogger.migration({
  fromContext: 'legacy',
  toContext: 'composed',
  userId,
  success: true,
  featureFlags: refactoringFeatureFlags.getAllFlags(),
  timestamp: new Date().toISOString()
});

// Replace console.error statements
aiLogger.error({
  error: new Error('Migration failed'),
  context: 'migration_check',
  component: 'AIMigrationProvider',
  severity: 'high',
  userImpact: true,
  timestamp: new Date().toISOString()
});
```

### AIContext Integration

```typescript
// Log initialization
aiLogger.initialization({
  serviceName: 'AIContext',
  userProfile: currentUserProfile,
  featureFlags: featureFlags,
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isConfigured: environmentStatus.isConfigured,
    hasApiKey: environmentStatus.hasApiKey
  },
  timestamp: new Date().toISOString(),
  duration: initializationDuration,
  success: serviceStatus === 'ready'
});

// Log performance issues
aiLogger.performance({
  operation: 'context_initialization',
  duration: initializationDuration,
  component: 'AIContext',
  timestamp: new Date().toISOString()
});
```

### Real-time Debugging Integration

```typescript
// Set up real-time log monitoring
const setupLogMonitoring = () => {
  const stream = aiLogger.getLogStream();
  
  // Monitor errors in real-time
  stream.on('log-entry', (entry) => {
    if (entry.level === 'error') {
      console.error('🚨 Real-time error detected:', entry);
      // Trigger alerts or notifications
    }
  });
  
  // Monitor performance issues
  stream.on('log-entry', (entry) => {
    if (entry.type === 'performance' && entry.data?.duration > 1000) {
      console.warn('🐌 Performance issue detected:', entry);
    }
  });
};
```

## Performance Considerations

### Streaming Performance
- **Latency**: <100ms for log emission
- **Debouncing**: Configurable (default: 300ms)
- **Batching**: Configurable batch size (default: 10)
- **Memory**: Efficient event emitter with automatic cleanup

### Filtering Performance
- **Complexity**: O(n) for single filters, optimized for multiple filters
- **Memory**: In-place filtering without data duplication
- **Search**: Case-insensitive text search across message and data

### Export Performance
- **JSON Export**: Fast serialization with proper formatting
- **CSV Export**: Efficient string concatenation with headers
- **Memory**: Streaming export for large log histories

## Best Practices

### 1. Use Structured Data
```typescript
// Good: Structured data with context
aiLogger.info('User preference updated', {
  component: 'UserProfile',
  context: 'preferences',
  oldValue: previousPreference,
  newValue: currentPreference,
  userId: user.id
});

// Avoid: Unstructured messages
aiLogger.info('User preference updated');
```

### 2. Leverage Real-time Streaming
```typescript
// Set up real-time monitoring for critical operations
const monitorCriticalOperations = () => {
  const stream = aiLogger.getLogStream();
  
  stream.on('log-entry', (entry) => {
    if (entry.component === 'OpenAIService' && entry.level === 'error') {
      // Trigger immediate alert
      sendAlert('AI Service Error', entry);
    }
  });
};
```

### 3. Use Advanced Filtering
```typescript
// Focus debugging on specific issues
const debugPerformanceIssues = () => {
  const performanceLogs = aiLogger.getFilteredLogs({
    type: ['performance'],
    timeRange: { start: new Date(Date.now() - 3600000), end: new Date() }
  });
  
  const slowOperations = performanceLogs.filter(log => 
    log.data?.duration > 1000
  );
  
  console.log('Slow operations in the last hour:', slowOperations);
};
```

### 4. Export for Analysis
```typescript
// Export logs for external analysis
const exportLogsForAnalysis = () => {
  const jsonLogs = aiLogger.exportLogs('json');
  const csvLogs = aiLogger.exportLogs('csv');
  
  // Save to file or send to external service
  saveToFile('ai-logs.json', jsonLogs);
  saveToFile('ai-logs.csv', csvLogs);
};
```

## Troubleshooting

### Common Issues

#### 1. Logs Not Appearing
- Check log level configuration
- Verify environment settings
- Ensure AIDevTools is enabled in development

#### 2. Streaming Not Working
- Verify `enableLiveStreaming` is true
- Check stream subscription is active
- Ensure proper event handling

#### 3. Filtering Not Working
- Verify filter criteria are correct
- Check data types match expected formats
- Ensure log entries have required metadata

#### 4. Performance Issues
- Adjust batch size and debounce settings
- Monitor memory usage with large log histories
- Consider clearing logs periodically

### Debug Mode
Enable debug mode for detailed logging information:

```typescript
aiLogger.setLogLevel('debug');
aiLogger.enableAIDevTools(true);
```

## Future Enhancements

### Planned Features
- **Log Aggregation**: Centralized log collection and analysis
- **Performance Monitoring**: Real-time performance metrics from logs
- **Alert System**: Automated alerts based on log patterns
- **Log Retention**: Configurable log retention policies
- **Search and Filter**: Advanced log search capabilities

### Integration Opportunities
- **Performance Monitoring**: Real-time performance metrics from logs
- **Health Monitoring**: Service health status from log patterns
- **Feature Flag Management**: Flag changes and analytics from logs
- **Context Inspector**: State changes and debugging from logs

## Conclusion

The AI Logger Service provides a comprehensive, feature-rich logging solution for AI operations. With the enhanced capabilities from Sprint 6, it now supports real-time streaming, advanced filtering, and export functionality while maintaining full backward compatibility.

The system is designed to scale with your application's needs and provides the foundation for advanced debugging and monitoring capabilities in the AIDevTools suite. 