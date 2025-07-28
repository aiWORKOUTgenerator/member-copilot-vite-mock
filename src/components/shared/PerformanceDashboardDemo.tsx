import React, { useState } from 'react';
import PerformanceDashboard from './PerformanceDashboard';
import { aiLogger } from '../../services/ai/logging/AILogger';
import type { PerformanceAlert } from '../../services/ai/utils/AIPerformanceMonitor';

const PerformanceDashboardDemo: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [showHistoricalData, setShowHistoricalData] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);

  const handleAlertClick = (alert: PerformanceAlert) => {
    setSelectedAlert(alert);
    aiLogger.info('Performance alert selected in demo', {
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
      component: 'PerformanceDashboardDemo'
    });
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    aiLogger.info('Performance dashboard refresh interval changed', {
      newInterval: interval,
      component: 'PerformanceDashboardDemo'
    });
  };

  const handleHistoricalDataToggle = (enabled: boolean) => {
    setShowHistoricalData(enabled);
    aiLogger.info('Historical data display toggled', {
      enabled,
      component: 'PerformanceDashboardDemo'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Dashboard Demo
          </h1>
          <p className="text-lg text-gray-600">
            Real-time performance monitoring for AI service debugging and optimization
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Refresh Interval Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1000}>1 second</option>
                <option value={2000}>2 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How often to update performance metrics
              </p>
            </div>

            {/* Historical Data Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historical Data
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="historical-data"
                  checked={showHistoricalData}
                  onChange={(e) => handleHistoricalDataToggle(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="historical-data" className="ml-2 text-sm text-gray-700">
                  Show historical data charts
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enable/disable historical data visualization
              </p>
            </div>

            {/* Demo Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Actions
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    aiLogger.warn('Simulated performance warning', {
                      component: 'PerformanceDashboardDemo',
                      context: 'demo_action',
                      type: 'simulated_warning'
                    });
                  }}
                  className="w-full bg-yellow-600 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                >
                  Simulate Warning
                </button>
                <button
                  onClick={() => {
                    aiLogger.error({
                      error: new Error('Simulated performance error'),
                      context: 'demo_action',
                      component: 'PerformanceDashboardDemo',
                      severity: 'high',
                      userImpact: false,
                      timestamp: new Date().toISOString()
                    });
                  }}
                  className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Simulate Error
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="mb-8">
          <PerformanceDashboard
            refreshInterval={refreshInterval}
            showHistoricalData={showHistoricalData}
            onAlertClick={handleAlertClick}
          />
        </div>

        {/* Selected Alert Details */}
        {selectedAlert && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Alert Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Type:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Severity:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.severity}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Message:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.message}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Timestamp:</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedAlert.timestamp.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Data</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Metric:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.metric}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Current Value:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.value}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Threshold:</dt>
                    <dd className="text-sm text-gray-900">{selectedAlert.threshold}</dd>
                  </div>
                </dl>
                
                {selectedAlert.recommendations && selectedAlert.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedAlert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAlert(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* Feature Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Dashboard Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">📊 Real-time Metrics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Execution time tracking</li>
                <li>• Cache hit rate monitoring</li>
                <li>• Error rate analysis</li>
                <li>• Memory usage tracking</li>
                <li>• Throughput measurement</li>
                <li>• Response time percentiles</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">🚨 Performance Alerts</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated threshold monitoring</li>
                <li>• Severity-based alerting</li>
                <li>• Actionable recommendations</li>
                <li>• Real-time alert updates</li>
                <li>• Historical alert tracking</li>
                <li>• Click-to-inspect functionality</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">📈 Data Visualization</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Historical data charts</li>
                <li>• Trend analysis</li>
                <li>• Performance status indicators</li>
                <li>• Time range selection</li>
                <li>• Interactive metric selection</li>
                <li>• Export capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboardDemo; 