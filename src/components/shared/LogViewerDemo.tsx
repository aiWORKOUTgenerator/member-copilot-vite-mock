import React, { useEffect } from 'react';
import LogViewer from './LogViewer';
import { aiLogger } from '../../services/ai/logging/AILogger';

const LogViewerDemo: React.FC = () => {
  useEffect(() => {
    // Generate some sample logs to demonstrate the component
    const generateSampleLogs = () => {
      const sampleLogs = [
        {
          level: 'info' as const,
          message: 'AI Service initialized successfully',
          data: { component: 'AIService', context: 'initialization', type: 'service_start' }
        },
        {
          level: 'debug' as const,
          message: 'Processing workout generation request',
          data: { component: 'WorkoutGenerator', context: 'generation', type: 'request' }
        },
        {
          level: 'warn' as const,
          message: 'High response time detected',
          data: { component: 'PerformanceMonitor', context: 'monitoring', type: 'performance' }
        },
        {
          level: 'error' as const,
          message: 'Failed to connect to OpenAI API',
          data: { component: 'OpenAIService', context: 'api_call', type: 'connection_error' }
        },
        {
          level: 'info' as const,
          message: 'Feature flag updated: enhanced_logging',
          data: { component: 'FeatureFlags', context: 'management', type: 'flag_update' }
        }
      ];

      // Log each sample with a delay to simulate real-time streaming
      sampleLogs.forEach((log, index) => {
        setTimeout(() => {
          if (log.level === 'error') {
            aiLogger.error({
              error: new Error(log.message),
              context: log.data?.context || 'demo',
              component: log.data?.component || 'LogViewerDemo',
              severity: 'medium',
              userImpact: false
            });
          } else {
            // For debug, info, warn - use the correct method signature
            aiLogger[log.level](log.message, log.data as Record<string, unknown>);
          }
        }, index * 1000);
      });
    };

    // Start generating logs after a short delay
    const timer = setTimeout(generateSampleLogs, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Log Viewer Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This demo showcases the enhanced Log Viewer component with real-time streaming, 
            advanced filtering, and export capabilities.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Demo Features
            </h2>
            <ul className="text-blue-800 space-y-1">
              <li>• Real-time log streaming with live indicator</li>
              <li>• Advanced filtering by log level, component, context, and type</li>
              <li>• Search functionality with highlighting</li>
              <li>• Interactive log selection with detailed view</li>
              <li>• Export capabilities in JSON and CSV formats</li>
              <li>• Responsive design with collapsible filters</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-md font-semibold text-yellow-900 mb-2">
              Sample Logs
            </h3>
            <p className="text-yellow-800 text-sm">
              Sample logs will be generated automatically every second to demonstrate the real-time streaming capabilities. 
              Try using the filters to see different log levels and components.
            </p>
          </div>
        </div>

        <LogViewer 
          className="shadow-lg"
          initialConfig={{
            maxLogEntries: 50,
            debounceMs: 200,
            batchSize: 5
          }}
          onLogSelect={(log) => {
            console.log('Selected log:', log);
          }}
          onFilterChange={(filters) => {
            console.log('Filters changed:', filters);
          }}
        />
      </div>
    </div>
  );
};

export default LogViewerDemo; 