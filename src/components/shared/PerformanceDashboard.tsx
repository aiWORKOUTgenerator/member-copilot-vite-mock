import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { aiLogger } from '../../services/ai/logging/AILogger';
import type { PerformanceMetrics, PerformanceAlert } from '../../services/ai/utils/AIPerformanceMonitor';

// Types for the Performance Dashboard
interface PerformanceDashboardProps {
  className?: string;
  refreshInterval?: number; // milliseconds
  showHistoricalData?: boolean;
  onAlertClick?: (alert: PerformanceAlert) => void;
}

interface PerformanceDashboardState {
  metrics: PerformanceMetrics | null;
  alerts: DashboardAlert[];
  historicalData: PerformanceMetrics[];
  timeRange: '1h' | '6h' | '24h' | '7d';
  isMonitoring: boolean;
  lastUpdate: Date | null;
  selectedMetric: keyof PerformanceMetrics | null;
}

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  onClick?: () => void;
  isSelected?: boolean;
}

// Extended interface for our dashboard alerts
interface DashboardAlert extends PerformanceAlert {
  id: string;
  metric?: keyof PerformanceMetrics;
  value?: number;
  threshold?: number;
  recommendations?: string[];
}

interface AlertCardProps {
  alert: DashboardAlert;
  onClick?: () => void;
}

// Utility function for formatting numbers
const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// Utility function for getting status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'fair':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'poor':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'critical':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

// Utility function for getting status icon
const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'excellent':
      return '🟢';
    case 'good':
      return '🔵';
    case 'fair':
      return '🟡';
    case 'poor':
      return '🟠';
    case 'critical':
      return '🔴';
    default:
      return '⚪';
  }
};

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  status,
  onClick,
  isSelected
}) => {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {getStatusIcon(status)} {status}
        </span>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatNumber(value)}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      
      {trend && (
        <div className={`flex items-center text-xs mt-1 ${getTrendColor(trend)}`}>
          <span className="mr-1">{getTrendIcon(trend)}</span>
          <span>
            {trendValue ? `${formatNumber(Math.abs(trendValue))}%` : 'No change'}
          </span>
        </div>
      )}
    </div>
  );
};

// Alert Card Component
const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <div
      className={`border-l-4 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${getSeverityColor(alert.severity)}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{alert.type}</h4>
            <p className="text-sm text-gray-600">{alert.message}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</span>
      </div>
      
      {alert.recommendations && alert.recommendations.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 font-medium">Recommendations:</p>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            {alert.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Performance Chart Component (simplified for now)
const PerformanceChart: React.FC<{
  data: PerformanceMetrics[];
  metric: keyof PerformanceMetrics;
  title: string;
}> = ({ data, metric, title }) => {
  // This would integrate with a charting library like Chart.js or Recharts
  // For now, we'll show a simple visualization
  const values = data.map(d => d[metric] as number);
  const maxValue = Math.max(...values, 1);
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {values.slice(-10).map((value, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-12 text-right">
              {formatNumber(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Performance Dashboard Component
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  refreshInterval = 5000, // 5 seconds
  showHistoricalData = true,
  onAlertClick
}) => {
  const [state, setState] = useState<PerformanceDashboardState>({
    metrics: null,
    alerts: [],
    historicalData: [],
    timeRange: '1h',
    isMonitoring: false,
    lastUpdate: null,
    selectedMetric: null
  });

  // Mock performance monitor - in real implementation, this would be injected
  const mockPerformanceMonitor = useMemo(() => ({
    getMetrics: (): PerformanceMetrics => ({
      averageExecutionTime: 150 + Math.random() * 100,
      cacheHitRate: 0.7 + Math.random() * 0.25,
      errorRate: Math.random() * 0.1,
      memoryUsage: 50 + Math.random() * 30,
      throughput: 10 + Math.random() * 20,
      responseTimeP95: 200 + Math.random() * 150,
      responseTimeP99: 400 + Math.random() * 300
    }),
    getAlerts: (): DashboardAlert[] => {
      const alerts: DashboardAlert[] = [];
      
      // Generate some mock alerts based on metrics
      const metrics = mockPerformanceMonitor.getMetrics();
      
      if (metrics.averageExecutionTime > 200) {
        alerts.push({
          id: `exec-time-${Date.now()}`,
          type: 'performance_degradation',
          severity: 'warning',
          metric: 'averageExecutionTime',
          value: metrics.averageExecutionTime,
          threshold: 200,
          message: `High execution time detected: ${formatNumber(metrics.averageExecutionTime)}ms`,
          timestamp: new Date(),
          metrics: { averageExecutionTime: metrics.averageExecutionTime },
          recommendations: [
            'Consider optimizing analysis algorithms',
            'Check for resource bottlenecks',
            'Review caching strategies'
          ]
        });
      }
      
      if (metrics.errorRate > 0.05) {
        alerts.push({
          id: `error-rate-${Date.now()}`,
          type: 'high_error_rate',
          severity: 'critical',
          metric: 'errorRate',
          value: metrics.errorRate,
          threshold: 0.05,
          message: `High error rate detected: ${formatNumber(metrics.errorRate * 100)}%`,
          timestamp: new Date(),
          metrics: { errorRate: metrics.errorRate },
          recommendations: [
            'Investigate error sources',
            'Implement better error handling',
            'Check service dependencies'
          ]
        });
      }
      
      return alerts;
    }
  }), []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const metrics = mockPerformanceMonitor.getMetrics();
    const alerts = mockPerformanceMonitor.getAlerts();
    
    setState(prev => ({
      ...prev,
      metrics,
      alerts,
      lastUpdate: new Date(),
      historicalData: showHistoricalData 
        ? [...prev.historicalData.slice(-50), metrics] // Keep last 50 data points
        : prev.historicalData
    }));
  }, [mockPerformanceMonitor, showHistoricalData]);

  // Start monitoring
  useEffect(() => {
    updateMetrics();
    
    const interval = setInterval(() => {
      updateMetrics();
    }, refreshInterval);
    
    setState(prev => ({ ...prev, isMonitoring: true }));
    
    return () => {
      clearInterval(interval);
      setState(prev => ({ ...prev, isMonitoring: false }));
    };
  }, [updateMetrics, refreshInterval]);

  // Calculate trends
  const calculateTrend = useCallback((metric: keyof PerformanceMetrics): { trend: 'up' | 'down' | 'stable'; value: number } => {
    if (state.historicalData.length < 2) {
      return { trend: 'stable', value: 0 };
    }
    
    const recent = state.historicalData.slice(-5);
    const older = state.historicalData.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) {
      return { trend: 'stable', value: 0 };
    }
    
    const recentAvg = recent.reduce((sum, m) => sum + (m[metric] as number), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (m[metric] as number), 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (Math.abs(change) < 5) {
      return { trend: 'stable', value: 0 };
    }
    
    return {
      trend: change > 0 ? 'up' : 'down',
      value: Math.abs(change)
    };
  }, [state.historicalData]);

  // Get metric status
  const getMetricStatus = useCallback((metric: keyof PerformanceMetrics, value: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
    const thresholds = {
      averageExecutionTime: { excellent: 100, good: 200, fair: 300, poor: 500 },
      cacheHitRate: { excellent: 0.9, good: 0.8, fair: 0.7, poor: 0.6 },
      errorRate: { excellent: 0.01, good: 0.03, fair: 0.05, poor: 0.1 },
      memoryUsage: { excellent: 30, good: 50, fair: 70, poor: 90 },
      throughput: { excellent: 50, good: 30, fair: 15, poor: 5 },
      responseTimeP95: { excellent: 150, good: 300, fair: 500, poor: 1000 },
      responseTimeP99: { excellent: 300, good: 600, fair: 1000, poor: 2000 }
    };
    
    const metricThresholds = thresholds[metric as keyof typeof thresholds];
    if (!metricThresholds) return 'fair';
    
    if (value <= metricThresholds.excellent) return 'excellent';
    if (value <= metricThresholds.good) return 'good';
    if (value <= metricThresholds.fair) return 'fair';
    if (value <= metricThresholds.poor) return 'poor';
    return 'critical';
  }, []);

  // Handle metric selection
  const handleMetricSelect = useCallback((metric: keyof PerformanceMetrics) => {
    setState(prev => ({
      ...prev,
      selectedMetric: prev.selectedMetric === metric ? null : metric
    }));
  }, []);

  // Handle alert click
  const handleAlertClick = useCallback((alert: DashboardAlert) => {
    onAlertClick?.(alert);
    aiLogger.warn('Performance alert clicked', {
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
      component: 'PerformanceDashboard'
    });
  }, [onAlertClick]);

  if (!state.metrics) {
    return (
      <div className={`performance-dashboard ${className}`}>
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Performance Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${state.isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {state.isMonitoring ? 'Monitoring' : 'Stopped'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={state.timeRange}
              onChange={(e) => setState(prev => ({ ...prev, timeRange: e.target.value as '1h' | '6h' | '24h' | '7d' }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            
            {state.lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {state.lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Key Metrics */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              title="Execution Time"
              value={state.metrics.averageExecutionTime}
              unit="ms"
              trend={calculateTrend('averageExecutionTime').trend}
              trendValue={calculateTrend('averageExecutionTime').value}
              status={getMetricStatus('averageExecutionTime', state.metrics.averageExecutionTime)}
              onClick={() => handleMetricSelect('averageExecutionTime')}
              isSelected={state.selectedMetric === 'averageExecutionTime'}
            />
            
            <MetricCard
              title="Cache Hit Rate"
              value={state.metrics.cacheHitRate * 100}
              unit="%"
              trend={calculateTrend('cacheHitRate').trend}
              trendValue={calculateTrend('cacheHitRate').value}
              status={getMetricStatus('cacheHitRate', state.metrics.cacheHitRate)}
              onClick={() => handleMetricSelect('cacheHitRate')}
              isSelected={state.selectedMetric === 'cacheHitRate'}
            />
            
            <MetricCard
              title="Error Rate"
              value={state.metrics.errorRate * 100}
              unit="%"
              trend={calculateTrend('errorRate').trend}
              trendValue={calculateTrend('errorRate').value}
              status={getMetricStatus('errorRate', state.metrics.errorRate)}
              onClick={() => handleMetricSelect('errorRate')}
              isSelected={state.selectedMetric === 'errorRate'}
            />
            
            <MetricCard
              title="Memory Usage"
              value={state.metrics.memoryUsage}
              unit="%"
              trend={calculateTrend('memoryUsage').trend}
              trendValue={calculateTrend('memoryUsage').value}
              status={getMetricStatus('memoryUsage', state.metrics.memoryUsage)}
              onClick={() => handleMetricSelect('memoryUsage')}
              isSelected={state.selectedMetric === 'memoryUsage'}
            />
            
            <MetricCard
              title="Throughput"
              value={state.metrics.throughput}
              unit="req/s"
              trend={calculateTrend('throughput').trend}
              trendValue={calculateTrend('throughput').value}
              status={getMetricStatus('throughput', state.metrics.throughput)}
              onClick={() => handleMetricSelect('throughput')}
              isSelected={state.selectedMetric === 'throughput'}
            />
            
            <MetricCard
              title="P95 Response"
              value={state.metrics.responseTimeP95}
              unit="ms"
              trend={calculateTrend('responseTimeP95').trend}
              trendValue={calculateTrend('responseTimeP95').value}
              status={getMetricStatus('responseTimeP95', state.metrics.responseTimeP95)}
              onClick={() => handleMetricSelect('responseTimeP95')}
              isSelected={state.selectedMetric === 'responseTimeP95'}
            />
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">Performance Alerts</h3>
              <span className="text-sm text-gray-500">
                {state.alerts.length} active alerts
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {state.alerts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No active alerts
                </div>
              ) : (
                state.alerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onClick={() => handleAlertClick(alert)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Data Chart */}
      {showHistoricalData && state.selectedMetric && state.historicalData.length > 0 && (
        <div className="mb-6">
          <PerformanceChart
            data={state.historicalData}
            metric={state.selectedMetric}
            title={`${state.selectedMetric} Over Time`}
          />
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Data Points:</span>
            <span className="ml-2 font-medium">{state.historicalData.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Active Alerts:</span>
            <span className="ml-2 font-medium">{state.alerts.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Monitoring Status:</span>
            <span className={`ml-2 font-medium ${state.isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
              {state.isMonitoring ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Refresh Interval:</span>
            <span className="ml-2 font-medium">{refreshInterval / 1000}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard; 