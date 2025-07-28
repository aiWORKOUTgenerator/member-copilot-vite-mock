import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { aiLogger } from '../../services/ai/logging/AILogger';
import { featureFlagService, FeatureFlag, ABTestResults } from '../../services/ai/featureFlags/FeatureFlagService';
import { refactoringFeatureFlags, RefactoringFeatureFlags } from '../../services/ai/featureFlags/RefactoringFeatureFlags';
import { useAIFeatureFlags } from '../../contexts/composition/AIFeatureFlagsProvider';

// Types for the Feature Flag Dashboard
interface FeatureFlagDashboardProps {
  className?: string;
  onFlagUpdate?: (flagId: string, updates: Partial<FeatureFlag>) => void;
  onExperimentUpdate?: (experimentId: string, updates: any) => void;
}

interface FeatureFlagDashboardState {
  flags: FeatureFlag[];
  refactoringFlags: RefactoringFeatureFlags;
  selectedFlag: FeatureFlag | null;
  showCreateModal: boolean;
  showExperimentModal: boolean;
  experiments: ABTestResults[];
  analytics: Record<string, FlagAnalytics>;
  searchTerm: string;
  filterStatus: 'all' | 'enabled' | 'disabled' | 'experimental';
  sortBy: 'name' | 'status' | 'rollout' | 'updated';
  sortOrder: 'asc' | 'desc';
}

interface FlagAnalytics {
  flagId: string;
  totalChecks: number;
  enabledChecks: number;
  disabledChecks: number;
  conversionRate: number;
  userSatisfaction: number;
  performanceImpact: number;
  lastUpdated: Date;
}

interface CreateFlagRequest {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  userGroups?: string[];
  experimentId?: string;
  owner?: string;
  notes?: string;
}

interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  flagId: string;
  controlGroup: number; // percentage
  treatmentGroup: number; // percentage
  metrics: string[];
  duration: number; // days
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

// Utility function for formatting percentages
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Utility function for getting status color
const getStatusColor = (enabled: boolean): string => {
  return enabled 
    ? 'text-green-600 bg-green-100 border-green-200' 
    : 'text-red-600 bg-red-100 border-red-200';
};

// Utility function for getting status icon
const getStatusIcon = (enabled: boolean): string => {
  return enabled ? '🟢' : '🔴';
};

// Flag Card Component
const FlagCard: React.FC<{
  flag: FeatureFlag;
  analytics?: FlagAnalytics;
  onSelect: (flag: FeatureFlag) => void;
  onToggle: (flagId: string, enabled: boolean) => void;
  isSelected: boolean;
}> = ({ flag, analytics, onSelect, onToggle, isSelected }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onSelect(flag)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">{flag.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{flag.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(flag.enabled)}`}>
            {getStatusIcon(flag.enabled)} {flag.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(flag.id, !flag.enabled);
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              flag.enabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {flag.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Rollout:</span>
          <span className="ml-2 font-medium">{formatPercentage(flag.rolloutPercentage)}</span>
        </div>
        <div>
          <span className="text-gray-600">ID:</span>
          <span className="ml-2 font-mono text-xs text-gray-500">{flag.id}</span>
        </div>
      </div>
      
      {analytics && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Checks:</span>
              <span className="ml-1 font-medium">{analytics.totalChecks}</span>
            </div>
            <div>
              <span className="text-gray-600">Enabled:</span>
              <span className="ml-1 font-medium">{analytics.enabledChecks}</span>
            </div>
            <div>
              <span className="text-gray-600">Rate:</span>
              <span className="ml-1 font-medium">{formatPercentage(analytics.conversionRate)}</span>
            </div>
          </div>
        </div>
      )}
      
      {flag.metadata?.owner && (
        <div className="mt-2 text-xs text-gray-500">
          Owner: {flag.metadata.owner}
        </div>
      )}
    </div>
  );
};

// Flag Details Component
const FlagDetails: React.FC<{
  flag: FeatureFlag;
  analytics?: FlagAnalytics;
  onUpdate: (flagId: string, updates: Partial<FeatureFlag>) => void;
}> = ({ flag, analytics, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<FeatureFlag>>(flag);

  const handleSave = () => {
    onUpdate(flag.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(flag);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Flag Details</h3>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editData.description || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rollout Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editData.rolloutPercentage || 0}
              onChange={(e) => setEditData(prev => ({ ...prev, rolloutPercentage: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={editData.enabled || false}
              onChange={(e) => setEditData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
              Enabled
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Description</h4>
            <p className="text-sm text-gray-900 mt-1">{flag.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Status</h4>
              <p className="text-sm text-gray-900 mt-1">
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Rollout</h4>
              <p className="text-sm text-gray-900 mt-1">
                {formatPercentage(flag.rolloutPercentage)}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Flag ID</h4>
              <p className="text-sm font-mono text-gray-900 mt-1">{flag.id}</p>
            </div>
            
            {flag.metadata?.owner && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Owner</h4>
                <p className="text-sm text-gray-900 mt-1">{flag.metadata.owner}</p>
              </div>
            )}
          </div>
          
          {analytics && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Analytics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-600">Total Checks</span>
                  <p className="text-lg font-semibold text-gray-900">{analytics.totalChecks}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Enabled Checks</span>
                  <p className="text-lg font-semibold text-gray-900">{analytics.enabledChecks}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Conversion Rate</span>
                  <p className="text-lg font-semibold text-gray-900">{formatPercentage(analytics.conversionRate)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">User Satisfaction</span>
                  <p className="text-lg font-semibold text-gray-900">{analytics.userSatisfaction}/10</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Create Flag Modal Component
const CreateFlagModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (flag: CreateFlagRequest) => void;
}> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState<CreateFlagRequest>({
    id: '',
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 0,
    owner: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
    setFormData({
      id: '',
      name: '',
      description: '',
      enabled: false,
      rolloutPercentage: 0,
      owner: '',
      notes: ''
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Feature Flag</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flag ID</label>
            <input
              type="text"
              required
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ai_enhanced_recommendations"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enhanced AI Recommendations"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enable enhanced AI-powered workout recommendations"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rollout Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.rolloutPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, rolloutPercentage: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ai_team"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
              Enable immediately
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Create Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Feature Flag Dashboard Component
export const FeatureFlagDashboard: React.FC<FeatureFlagDashboardProps> = ({
  className = '',
  onFlagUpdate,
  onExperimentUpdate
}) => {
  const { refreshFlags } = useAIFeatureFlags();
  const [state, setState] = useState<FeatureFlagDashboardState>({
    flags: [],
    refactoringFlags: refactoringFeatureFlags.getAllFlags(),
    selectedFlag: null,
    showCreateModal: false,
    showExperimentModal: false,
    experiments: [],
    analytics: {},
    searchTerm: '',
    filterStatus: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Load flags and analytics
  useEffect(() => {
    const loadFlags = () => {
      try {
        const flags = featureFlagService.exportConfiguration();
        const flagArray = Object.values(flags);
        
        // Generate mock analytics for demo
        const analytics: Record<string, FlagAnalytics> = {};
        flagArray.forEach(flag => {
          analytics[flag.id] = {
            flagId: flag.id,
            totalChecks: Math.floor(Math.random() * 1000) + 100,
            enabledChecks: Math.floor(Math.random() * 500) + 50,
            disabledChecks: Math.floor(Math.random() * 500) + 50,
            conversionRate: Math.random() * 0.8 + 0.2,
            userSatisfaction: Math.random() * 3 + 7,
            performanceImpact: Math.random() * 2 - 1,
            lastUpdated: new Date()
          };
        });
        
        setState(prev => ({
          ...prev,
          flags: flagArray,
          analytics
        }));
      } catch (error) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'feature flag dashboard',
          component: 'FeatureFlagDashboard',
          severity: 'medium',
          userImpact: false,
          timestamp: new Date().toISOString()
        });
      }
    };

    loadFlags();
  }, []);

  // Filter and sort flags
  const filteredAndSortedFlags = useMemo(() => {
    let filtered = state.flags.filter(flag => {
      const matchesSearch = flag.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           flag.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           flag.id.toLowerCase().includes(state.searchTerm.toLowerCase());
      
      const matchesStatus = state.filterStatus === 'all' ||
                           (state.filterStatus === 'enabled' && flag.enabled) ||
                           (state.filterStatus === 'disabled' && !flag.enabled) ||
                           (state.filterStatus === 'experimental' && flag.rolloutPercentage < 100);
      
      return matchesSearch && matchesStatus;
    });

    // Sort flags
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.enabled;
          bValue = b.enabled;
          break;
        case 'rollout':
          aValue = a.rolloutPercentage;
          bValue = b.rolloutPercentage;
          break;
        case 'updated':
          aValue = a.metadata?.startDate || new Date(0);
          bValue = b.metadata?.startDate || new Date(0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.flags, state.searchTerm, state.filterStatus, state.sortBy, state.sortOrder]);

  // Handle flag toggle
  const handleFlagToggle = useCallback((flagId: string, enabled: boolean) => {
    try {
      featureFlagService.updateFlag(flagId, { enabled });
      
      setState(prev => ({
        ...prev,
        flags: prev.flags.map(flag => 
          flag.id === flagId ? { ...flag, enabled } : flag
        )
      }));
      
      aiLogger.info('Feature flag toggled', {
        flagId,
        enabled,
        component: 'FeatureFlagDashboard'
      });
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'feature flag toggle',
        component: 'FeatureFlagDashboard',
        severity: 'medium',
        userImpact: false,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Handle flag update
  const handleFlagUpdate = useCallback((flagId: string, updates: Partial<FeatureFlag>) => {
    try {
      featureFlagService.updateFlag(flagId, updates);
      
      setState(prev => ({
        ...prev,
        flags: prev.flags.map(flag => 
          flag.id === flagId ? { ...flag, ...updates } : flag
        ),
        selectedFlag: prev.selectedFlag?.id === flagId 
          ? { ...prev.selectedFlag, ...updates }
          : prev.selectedFlag
      }));
      
      onFlagUpdate?.(flagId, updates);
      
      aiLogger.info('Feature flag updated', {
        flagId,
        updates,
        component: 'FeatureFlagDashboard'
      });
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'feature flag update',
        component: 'FeatureFlagDashboard',
        severity: 'medium',
        userImpact: false,
        timestamp: new Date().toISOString()
      });
    }
  }, [onFlagUpdate]);

  const handleRefresh = useCallback(() => {
    try {
      refreshFlags();
      // Reload flags from service
      const flags = featureFlagService.exportConfiguration();
      const flagArray = Object.values(flags);
      
      setState(prev => ({
        ...prev,
        flags: flagArray
      }));
      
      aiLogger.info('Feature flags refreshed', {
        component: 'FeatureFlagDashboard'
      });
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'feature flag refresh',
        component: 'FeatureFlagDashboard',
        severity: 'medium',
        userImpact: false,
        timestamp: new Date().toISOString()
      });
    }
  }, [refreshFlags]);

  // Handle flag creation
  const handleFlagCreate = useCallback((flagData: CreateFlagRequest) => {
    try {
      const newFlag: FeatureFlag = {
        id: flagData.id,
        name: flagData.name,
        description: flagData.description,
        enabled: flagData.enabled,
        rolloutPercentage: flagData.rolloutPercentage / 100, // Convert to decimal
        userGroups: flagData.userGroups,
        metadata: {
          experimentId: flagData.experimentId,
          startDate: new Date(),
          owner: flagData.owner,
          notes: flagData.notes
        }
      };
      
      // Add to service
      featureFlagService.importConfiguration({ [newFlag.id]: newFlag });
      
      setState(prev => ({
        ...prev,
        flags: [...prev.flags, newFlag],
        showCreateModal: false
      }));
      
      aiLogger.info('Feature flag created', {
        flagId: newFlag.id,
        flagName: newFlag.name,
        component: 'FeatureFlagDashboard'
      });
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'feature flag creation',
        component: 'FeatureFlagDashboard',
        severity: 'medium',
        userImpact: false,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return (
    <div className={`feature-flag-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
            <span className="text-sm text-gray-600">
              {state.flags.length} total flags
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Create New Flag
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search flags..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={state.filterStatus}
              onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Flags</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="rollout">Rollout</option>
              <option value="updated">Last Updated</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={state.sortOrder}
              onChange={(e) => setState(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Flags List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">
                Flags ({filteredAndSortedFlags.length})
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredAndSortedFlags.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No flags match the current filters
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredAndSortedFlags.map(flag => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      analytics={state.analytics[flag.id]}
                      onSelect={(flag) => setState(prev => ({ ...prev, selectedFlag: flag }))}
                      onToggle={handleFlagToggle}
                      isSelected={state.selectedFlag?.id === flag.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flag Details */}
        <div className="lg:col-span-1">
          {state.selectedFlag ? (
            <FlagDetails
              flag={state.selectedFlag}
              analytics={state.analytics[state.selectedFlag.id]}
              onUpdate={handleFlagUpdate}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500">Select a flag to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Flag Modal */}
      <CreateFlagModal
        open={state.showCreateModal}
        onClose={() => setState(prev => ({ ...prev, showCreateModal: false }))}
        onCreate={handleFlagCreate}
      />
    </div>
  );
};

export default FeatureFlagDashboard; 