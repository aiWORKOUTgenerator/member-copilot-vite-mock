/**
 * AIContext Health Dashboard - MANDATORY SAFETY MEASURE
 * 
 * React component to display real-time AIContext health metrics and alerts.
 * Provides visibility into context health during refactoring.
 * 
 * CRITICAL: This dashboard must be visible during AIContext refactoring.
 */

import React, { useState, useEffect } from 'react';
import { aiContextMonitor, AIContextHealthMetrics, AIContextHealthAlert } from '../../services/ai/monitoring/AIContextMonitor';

interface HealthDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const AIContextHealthDashboard: React.FC<HealthDashboardProps> = ({ 
  isVisible = process.env.NODE_ENV === 'development',
  onClose 
}) => {
  const [metrics, setMetrics] = useState<AIContextHealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<AIContextHealthAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      setMetrics(aiContextMonitor.getMetrics());
      setAlerts(aiContextMonitor.getAlerts());
    };

    // Initial update
    updateMetrics();

    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        updateMetrics();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, autoRefresh]);

  if (!isVisible) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'initializing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-300';
      case 'high': return 'text-orange-800 bg-orange-200 border-orange-300';
      case 'medium': return 'text-yellow-800 bg-yellow-200 border-yellow-300';
      case 'low': return 'text-blue-800 bg-blue-200 border-blue-300';
      default: return 'text-gray-800 bg-gray-200 border-gray-300';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Collapsed View */}
      {!isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">AIContext Health</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-2 py-1 rounded ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? 'Auto' : 'Manual'}
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
              >
                Expand
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {metrics && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(metrics.serviceStatus)}`}>
                  {metrics.serviceStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Health:</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  aiContextMonitor.isHealthy() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {aiContextMonitor.isHealthy() ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Errors:</span>
                <span className="text-xs text-gray-800">{metrics.totalErrors}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Alerts:</span>
                <span className="text-xs text-gray-800">{alerts.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-2xl max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">AIContext Health Dashboard</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-2 py-1 rounded ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? 'Auto Refresh' : 'Manual Refresh'}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
              >
                Collapse
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                >
                  Close
                </button>
              )}
            </div>
          </div>

          {metrics && (
            <div className="space-y-4">
              {/* Service Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Service Status</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Current:</span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(metrics.serviceStatus)}`}>
                        {metrics.serviceStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Uptime:</span>
                      <span className="text-xs text-gray-800">{formatUptime(metrics.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Transitions:</span>
                      <span className="text-xs text-gray-800">{metrics.statusTransitionCount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Initialization</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Success Rate:</span>
                      <span className="text-xs text-gray-800">
                        {metrics.initializationAttempts > 0 
                          ? `${((metrics.initializationSuccesses / metrics.initializationAttempts) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Avg Time:</span>
                      <span className="text-xs text-gray-800">{formatDuration(metrics.averageInitializationTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Failures:</span>
                      <span className="text-xs text-gray-800">{metrics.initializationFailures}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance & Errors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Avg Response:</span>
                      <span className="text-xs text-gray-800">{formatDuration(metrics.averageResponseTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Memory:</span>
                      <span className="text-xs text-gray-800">{Math.round(metrics.memoryUsage / 1024 / 1024)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Active Consumers:</span>
                      <span className="text-xs text-gray-800">{metrics.activeConsumers}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Errors</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Total:</span>
                      <span className="text-xs text-gray-800">{metrics.totalErrors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Rate:</span>
                      <span className="text-xs text-gray-800">{metrics.errorRate}/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Consumer Errors:</span>
                      <span className="text-xs text-gray-800">{metrics.consumerErrors}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Flags</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Checks:</span>
                    <span className="text-xs text-gray-800">{metrics.featureFlagChecks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Success Rate:</span>
                    <span className="text-xs text-gray-800">
                      {metrics.featureFlagChecks > 0 
                        ? `${((metrics.featureFlagSuccesses / metrics.featureFlagChecks) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Failures:</span>
                    <span className="text-xs text-gray-800">{metrics.featureFlagFailures}</span>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              {alerts.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Alerts ({alerts.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {alerts.slice(-5).reverse().map((alert) => (
                      <div
                        key={alert.id}
                        className={`text-xs p-2 rounded border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{alert.message}</span>
                          <span className="text-xs opacity-75">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {alert.context && (
                          <div className="mt-1 text-xs opacity-75">
                            {JSON.stringify(alert.context, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment Issues */}
              {metrics.environmentIssues.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Environment Issues</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {metrics.environmentIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIContextHealthDashboard; 