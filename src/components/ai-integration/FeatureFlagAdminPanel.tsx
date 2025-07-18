import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Users, BarChart3, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { featureFlagService, FeatureFlag, ABTestResults } from '../../services/ai/featureFlags/FeatureFlagService';
import { useMigrationStatus, useAIHealth } from '../../contexts/AIContext';

interface FeatureFlagAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureFlagAdminPanel: React.FC<FeatureFlagAdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flags' | 'analytics' | 'monitoring'>('flags');
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [abTestResults, setABTestResults] = useState<Record<string, ABTestResults>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { migrationStatus, migrationReport } = useMigrationStatus();
  const { serviceStatus, performanceMetrics } = useAIHealth();

  // Load flag configuration and analytics
  useEffect(() => {
    if (isOpen) {
      loadFlagData();
    }
  }, [isOpen]);

  const loadFlagData = async () => {
    setIsLoading(true);
    try {
      const flagConfig = featureFlagService.exportConfiguration();
      setFlags(flagConfig);
      
      // Load A/B test results for each flag
      const results: Record<string, ABTestResults> = {};
      Object.keys(flagConfig).forEach(flagId => {
        const analytics = featureFlagService.getAnalytics(flagId);
        if (analytics) {
          results[flagId] = analytics;
        }
      });
      setABTestResults(results);
    } catch (error) {
      console.error('Failed to load flag data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRolloutChange = async (flagId: string, newPercentage: number) => {
    const success = featureFlagService.increaseRollout(flagId, newPercentage);
    if (success) {
      await loadFlagData(); // Refresh data
    }
  };

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    const success = featureFlagService.updateFlag(flagId, { enabled });
    if (success) {
      await loadFlagData(); // Refresh data
    }
  };

  const emergencyRollback = async (flagId: string) => {
    const success = featureFlagService.disableFlag(flagId);
    if (success) {
      await loadFlagData(); // Refresh data
      alert(`Emergency rollback completed for ${flagId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-bold">AI Feature Flag Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'flags', label: 'Feature Flags', icon: Settings },
              { id: 'analytics', label: 'A/B Testing', icon: BarChart3 },
              { id: 'monitoring', label: 'Monitoring', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Loading flag data...</div>
            </div>
          ) : (
            <>
              {activeTab === 'flags' && (
                <FeatureFlagsTab
                  flags={flags}
                  onRolloutChange={handleRolloutChange}
                  onToggleFlag={handleToggleFlag}
                  onEmergencyRollback={emergencyRollback}
                />
              )}
              
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  flags={flags}
                  abTestResults={abTestResults}
                />
              )}
              
              {activeTab === 'monitoring' && (
                <MonitoringTab
                  migrationStatus={migrationStatus}
                  migrationReport={migrationReport}
                  serviceStatus={serviceStatus}
                  performanceMetrics={performanceMetrics}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature Flags Management Tab
const FeatureFlagsTab: React.FC<{
  flags: Record<string, FeatureFlag>;
  onRolloutChange: (flagId: string, percentage: number) => void;
  onToggleFlag: (flagId: string, enabled: boolean) => void;
  onEmergencyRollback: (flagId: string) => void;
}> = ({ flags, onRolloutChange, onToggleFlag, onEmergencyRollback }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Service Feature Flags</h3>
        <div className="text-sm text-gray-600">
          {Object.values(flags).filter(f => f.enabled).length} of {Object.keys(flags).length} flags enabled
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(flags).map(([flagId, flag]) => (
          <FlagControlCard
            key={flagId}
            flagId={flagId}
            flag={flag}
            onRolloutChange={onRolloutChange}
            onToggleFlag={onToggleFlag}
            onEmergencyRollback={onEmergencyRollback}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Flag Control Card
const FlagControlCard: React.FC<{
  flagId: string;
  flag: FeatureFlag;
  onRolloutChange: (flagId: string, percentage: number) => void;
  onToggleFlag: (flagId: string, enabled: boolean) => void;
  onEmergencyRollback: (flagId: string) => void;
}> = ({ flagId, flag, onRolloutChange, onToggleFlag, onEmergencyRollback }) => {
  const [rolloutValue, setRolloutValue] = useState(flag.rolloutPercentage);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{flag.name}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              flag.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {flag.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={flag.enabled}
              onChange={(e) => onToggleFlag(flagId, e.target.checked)}
              className="rounded"
            />
            Enabled
          </label>
          
          <button
            onClick={() => onEmergencyRollback(flagId)}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            disabled={!flag.enabled}
          >
            Emergency Rollback
          </button>
        </div>
      </div>

      {flag.enabled && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Rollout Percentage</span>
              <span className="text-sm text-gray-600">{rolloutValue}% of users</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={rolloutValue}
                onChange={(e) => setRolloutValue(Number(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => onRolloutChange(flagId, rolloutValue)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                disabled={rolloutValue === flag.rolloutPercentage}
              >
                Update
              </button>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Experiment ID:</span> {flag.metadata?.experimentId || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Owner:</span> {flag.metadata?.owner || 'N/A'}
              </div>
            </div>
            {flag.metadata?.notes && (
              <div className="mt-2">
                <span className="font-medium">Notes:</span> {flag.metadata.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// A/B Testing Analytics Tab
const AnalyticsTab: React.FC<{
  flags: Record<string, FeatureFlag>;
  abTestResults: Record<string, ABTestResults>;
}> = ({ flags, abTestResults }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">A/B Testing Results</h3>
      
      <div className="grid gap-6">
        {Object.entries(abTestResults).map(([flagId, results]) => (
          <ABTestResultCard
            key={flagId}
            flagId={flagId}
            flagName={flags[flagId]?.name || flagId}
            results={results}
          />
        ))}
        
        {Object.keys(abTestResults).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No A/B test results available yet. Results will appear as users interact with the AI features.
          </div>
        )}
      </div>
    </div>
  );
};

// A/B Test Result Card
const ABTestResultCard: React.FC<{
  flagId: string;
  flagName: string;
  results: ABTestResults;
}> = ({ flagId, flagName, results }) => {
  const getChangeIndicator = (control: number, treatment: number) => {
    const change = ((treatment - control) / control) * 100;
    const isPositive = change > 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? '↗' : '↘'
    };
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{flagName}</h4>
        <div className="flex items-center gap-2">
          {results.winner && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              results.winner === 'treatment' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {results.winner === 'treatment' ? 'New AI Wins' : 'Legacy Wins'}
            </span>
          )}
          <span className="text-sm text-gray-600">
            {(results.statisticalSignificance * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Control Group (Legacy) */}
        <div className="space-y-3">
          <h5 className="font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Control (Legacy AI)
          </h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Users:</span>
              <span className="font-medium">{results.controlGroup.users.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate:</span>
              <span className="font-medium">{(results.controlGroup.conversionRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Response Time:</span>
              <span className="font-medium">{results.controlGroup.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User Satisfaction:</span>
              <span className="font-medium">{results.controlGroup.userSatisfaction.toFixed(1)}/5</span>
            </div>
          </div>
        </div>
        
        {/* Treatment Group (New AI) */}
        <div className="space-y-3">
          <h5 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Treatment (New AI)
          </h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Users:</span>
              <span className="font-medium">{results.treatmentGroup.users.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{(results.treatmentGroup.conversionRate * 100).toFixed(1)}%</span>
                {(() => {
                  const change = getChangeIndicator(results.controlGroup.conversionRate, results.treatmentGroup.conversionRate);
                  return (
                    <span className={`text-xs ${change.color}`}>
                      {change.icon}{change.value}%
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Response Time:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{results.treatmentGroup.avgResponseTime}ms</span>
                {(() => {
                  const change = getChangeIndicator(results.controlGroup.avgResponseTime, results.treatmentGroup.avgResponseTime);
                  return (
                    <span className={`text-xs ${change.color}`}>
                      {change.icon}{change.value}%
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User Satisfaction:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{results.treatmentGroup.userSatisfaction.toFixed(1)}/5</span>
                {(() => {
                  const change = getChangeIndicator(results.controlGroup.userSatisfaction, results.treatmentGroup.userSatisfaction);
                  return (
                    <span className={`text-xs ${change.color}`}>
                      {change.icon}{change.value}%
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Monitoring and Health Tab
const MonitoringTab: React.FC<{
  migrationStatus: any;
  migrationReport: any;
  serviceStatus: string;
  performanceMetrics: any;
}> = ({ migrationStatus, migrationReport, serviceStatus, performanceMetrics }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">AI Service Monitoring</h3>
      
      {/* Service Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Service Status</span>
          </div>
          <div className={`text-lg font-semibold ${
            serviceStatus === 'ready' ? 'text-green-600' : 'text-red-600'
          }`}>
            {serviceStatus === 'ready' ? 'Healthy' : 'Issues Detected'}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium">Response Time</span>
          </div>
          <div className="text-lg font-semibold text-green-600">
            {performanceMetrics.responseTime}ms
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Cache Hit Rate</span>
          </div>
          <div className="text-lg font-semibold text-purple-600">
            {(performanceMetrics.cacheHitRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Migration Status */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-3">Migration Progress</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(migrationStatus).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center gap-2">
              {enabled ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm capitalize">
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Flags:</span>
            <div className="font-medium">{migrationReport.totalFlags}</div>
          </div>
          <div>
            <span className="text-gray-600">Enabled Flags:</span>
            <div className="font-medium">{migrationReport.enabledFlags}</div>
          </div>
          <div>
            <span className="text-gray-600">Error Rate:</span>
            <div className="font-medium">{(performanceMetrics.errorRate * 100).toFixed(3)}%</div>
          </div>
          <div>
            <span className="text-gray-600">Uptime:</span>
            <div className="font-medium">99.9%</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 