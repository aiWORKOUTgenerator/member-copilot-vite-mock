import React, { useState, useCallback } from 'react';
import LogViewer from './LogViewer';
import PerformanceDashboard from './PerformanceDashboard';
import FeatureFlagDashboard from './FeatureFlagDashboard';
import { aiLogger } from '../../services/ai/logging/AILogger';
import type { LogEntry } from '../../services/ai/logging/AILogger';
import type { PerformanceAlert } from '../../services/ai/utils/AIPerformanceMonitor';

// Types for the AIDevTools Suite
interface AIDevToolsSuiteProps {
  className?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

interface AIDevToolsSuiteState {
  activeTab: 'logs' | 'performance' | 'flags' | 'health' | 'context';
  isCollapsed: boolean;
  logFilters: any;
  performanceConfig: any;
  selectedLog: LogEntry | null;
  selectedAlert: PerformanceAlert | null;
}

// Tab Configuration
const TABS = [
  { id: 'logs', name: 'Logs', icon: '📋', description: 'Real-time log streaming and filtering' },
  { id: 'performance', name: 'Performance', icon: '📊', description: 'Performance monitoring and alerts' },
  { id: 'flags', name: 'Feature Flags', icon: '🚩', description: 'Feature flag management and A/B testing' },
  { id: 'health', name: 'Health', icon: '🏥', description: 'AI service health monitoring' },
  { id: 'context', name: 'Context', icon: '🔍', description: 'Interactive context state inspection' }
] as const;

// Tab Icon Component
const TabIcon: React.FC<{ icon: string; isActive: boolean }> = ({ icon, isActive }) => (
  <span className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
    {icon}
  </span>
);

// Tab Component
const Tab: React.FC<{
  tab: typeof TABS[number];
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <TabIcon icon={tab.icon} isActive={isActive} />
    <span className="font-medium">{tab.name}</span>
  </button>
);

// Health Status Component
const HealthStatus: React.FC = () => {
  const [healthData, setHealthData] = useState({
    overall: 'healthy',
    components: {
      openai: { status: 'healthy', responseTime: 150, lastCheck: new Date() },
      workoutGeneration: { status: 'healthy', successRate: 0.98, lastCheck: new Date() },
      featureFlags: { status: 'healthy', flagCount: 12, lastCheck: new Date() },
      analytics: { status: 'healthy', dataPoints: 1250, lastCheck: new Date() }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'unhealthy': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'unhealthy': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Health Status</h3>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(healthData.overall)}`}>
            {getStatusIcon(healthData.overall)} {healthData.overall.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Component Health */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Component Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(healthData.components).map(([name, component]) => (
            <div key={name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(component.status)}`}>
                  {getStatusIcon(component.status)} {component.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {component.responseTime && (
                  <div>Response Time: {component.responseTime}ms</div>
                )}
                {component.successRate && (
                  <div>Success Rate: {(component.successRate * 100).toFixed(1)}%</div>
                )}
                {component.flagCount && (
                  <div>Active Flags: {component.flagCount}</div>
                )}
                {component.dataPoints && (
                  <div>Data Points: {component.dataPoints}</div>
                )}
                <div>Last Check: {component.lastCheck.toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Context Inspector Component
const ContextInspector: React.FC = () => {
  const [contextData, setContextData] = useState({
    currentState: {
      userProfile: { fitnessLevel: 'some experience', goals: ['strength'] },
      featureFlags: { ai_service_unified: true, ai_cross_component_analysis: true },
      serviceStatus: 'ready',
      lastUpdate: new Date()
    },
    stateHistory: [
      { timestamp: new Date(Date.now() - 5000), action: 'Feature flag updated', details: 'ai_service_unified: true' },
      { timestamp: new Date(Date.now() - 10000), action: 'User profile loaded', details: 'Fitness level: some experience' },
      { timestamp: new Date(Date.now() - 15000), action: 'Service initialized', details: 'Status: ready' }
    ]
  });

  const [selectedPath, setSelectedPath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'json'>('tree');

  return (
    <div className="space-y-6">
      {/* Context Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Context State</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">User Profile</h4>
            <div className="text-sm text-gray-900">
              <div>Level: {contextData.currentState.userProfile.fitnessLevel}</div>
              <div>Goals: {contextData.currentState.userProfile.goals.join(', ')}</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Flags</h4>
            <div className="text-sm text-gray-900">
              {Object.entries(contextData.currentState.featureFlags).map(([flag, enabled]) => (
                <div key={flag} className={enabled ? 'text-green-600' : 'text-red-600'}>
                  {flag}: {enabled ? 'ON' : 'OFF'}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Service Status</h4>
            <div className="text-sm text-gray-900">
              <div>Status: {contextData.currentState.serviceStatus}</div>
              <div>Last Update: {contextData.currentState.lastUpdate.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* State History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">State History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contextData.stateHistory.map((entry, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 border border-gray-100 rounded">
              <span className="text-xs text-gray-500 flex-shrink-0 w-16">
                {entry.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{entry.action}</div>
                <div className="text-xs text-gray-600">{entry.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">View Mode</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              JSON View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AIDevTools Suite Component
export const AIDevToolsSuite: React.FC<AIDevToolsSuiteProps> = ({
  className = '',
  isVisible = true,
  onClose
}) => {
  const [state, setState] = useState<AIDevToolsSuiteState>({
    activeTab: 'logs',
    isCollapsed: false,
    logFilters: {},
    performanceConfig: { refreshInterval: 5000, showHistoricalData: true },
    selectedLog: null,
    selectedAlert: null
  });

  // Handle tab change
  const handleTabChange = useCallback((tabId: typeof TABS[number]['id']) => {
    setState(prev => ({ ...prev, activeTab: tabId }));
    aiLogger.info('AIDevTools tab changed', {
      tabId,
      component: 'AIDevToolsSuite'
    });
  }, []);

  // Handle log selection
  const handleLogSelect = useCallback((log: LogEntry) => {
    setState(prev => ({ ...prev, selectedLog: log }));
    aiLogger.debug('Log selected in AIDevTools', {
      logId: log.id,
      logLevel: log.level,
      component: 'AIDevToolsSuite'
    });
  }, []);

  // Handle alert selection
  const handleAlertSelect = useCallback((alert: PerformanceAlert) => {
    setState(prev => ({ ...prev, selectedAlert: alert }));
    aiLogger.warn('Performance alert selected in AIDevTools', {
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
      component: 'AIDevToolsSuite'
    });
  }, []);

  // Handle collapse toggle
  const handleCollapseToggle = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`ai-dev-tools-suite fixed inset-4 z-50 ${className}`}>
      {state.isCollapsed ? (
        // Collapsed state - floating button
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-3">
          <button
            onClick={handleCollapseToggle}
            className="flex items-center space-x-2 text-sm"
          >
            <span>🔧</span>
            <span>AI DevTools</span>
          </button>
        </div>
      ) : (
        // Expanded state - full interface
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-[90vw] h-[85vh] max-w-7xl flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔧</span>
                <h2 className="text-lg font-semibold">AI DevTools</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCollapseToggle}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-sm">−</span>
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-sm">×</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-1 p-2">
              {TABS.map(tab => (
                <Tab
                  key={tab.id}
                  tab={tab}
                  isActive={state.activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.activeTab === 'logs' && (
              <div className="h-full">
                <LogViewer
                  onLogSelect={handleLogSelect}
                  onFilterChange={(filters) => setState(prev => ({ ...prev, logFilters: filters }))}
                />
              </div>
            )}

            {state.activeTab === 'performance' && (
              <div className="h-full">
                <PerformanceDashboard
                  refreshInterval={state.performanceConfig.refreshInterval}
                  showHistoricalData={state.performanceConfig.showHistoricalData}
                  onAlertClick={handleAlertSelect}
                />
              </div>
            )}

            {state.activeTab === 'flags' && (
              <div className="h-full">
                <FeatureFlagDashboard
                  onFlagUpdate={(flagId, updates) => {
                    aiLogger.info('Feature flag updated via AIDevTools', {
                      flagId,
                      updates,
                      component: 'AIDevToolsSuite'
                    });
                  }}
                />
              </div>
            )}

            {state.activeTab === 'health' && (
              <div className="h-full">
                <HealthStatus />
              </div>
            )}

            {state.activeTab === 'context' && (
              <div className="h-full">
                <ContextInspector />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Development Mode</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDevToolsSuite; 