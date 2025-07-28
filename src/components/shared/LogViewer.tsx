import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { aiLogger } from '../../services/ai/logging/AILogger';
import type { LogEntry, LogFilters, LogStreamConfig, LogLevel } from '../../services/ai/logging/AILogger';

// Types for the Log Viewer
interface LogViewerProps {
  className?: string;
  initialFilters?: Partial<LogFilters>;
  initialConfig?: Partial<LogStreamConfig>;
  onLogSelect?: (log: LogEntry) => void;
  onFilterChange?: (filters: LogFilters) => void;
}

interface LogViewerState {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  selectedLog: LogEntry | null;
  filters: LogFilters;
  config: LogStreamConfig;
  isStreaming: boolean;
  searchTerm: string;
  showFilters: boolean;
  exportFormat: 'json' | 'csv';
}

// Log Level Badge Component
const LogLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelStyles(level)}`}>
      {level.toUpperCase()}
    </span>
  );
};

// Log Entry Component
const LogEntryItem: React.FC<{
  log: LogEntry;
  isSelected: boolean;
  onSelect: (log: LogEntry) => void;
}> = ({ log, isSelected, onSelect }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div
      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onSelect(log)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <LogLevelBadge level={log.level} />
          <span className="text-sm text-gray-500 flex-shrink-0">
            {formatTimestamp(log.timestamp)}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {log.message}
          </span>
        </div>
        {log.component && (
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {log.component}
          </span>
        )}
      </div>
      {log.context && (
        <div className="mt-1 text-xs text-gray-500">
          Context: {log.context}
        </div>
      )}
    </div>
  );
};

// Filter Controls Component
const FilterControls: React.FC<{
  filters: LogFilters;
  onFilterChange: (filters: LogFilters) => void;
  availableComponents: string[];
  availableContexts: string[];
  availableTypes: string[];
}> = ({ filters, onFilterChange, availableComponents, availableContexts, availableTypes }) => {
  const logLevels = ['error', 'warn', 'info', 'debug'];

  const updateFilter = useCallback((key: keyof LogFilters, value: LogFilters[keyof LogFilters]) => {
    onFilterChange({ ...filters, [key]: value });
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Filters</h3>
      
      {/* Log Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Log Level
        </label>
        <div className="flex flex-wrap gap-2">
          {logLevels.map(level => (
            <label key={level} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.logLevel?.includes(level as LogLevel) || false}
                onChange={(e) => {
                  const currentLevels = filters.logLevel || [];
                  const newLevels = e.target.checked
                    ? [...currentLevels, level as LogLevel]
                    : currentLevels.filter(l => l !== level);
                  updateFilter('logLevel', newLevels.length > 0 ? newLevels : undefined);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Component Filter */}
      {availableComponents.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component
          </label>
          <select
            multiple
            value={filters.component || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter('component', selected.length > 0 ? selected : undefined);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableComponents.map(component => (
              <option key={component} value={component}>
                {component}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Context Filter */}
      {availableContexts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context
          </label>
          <select
            multiple
            value={filters.context || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter('context', selected.length > 0 ? selected : undefined);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableContexts.map(context => (
              <option key={context} value={context}>
                {context}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Type Filter */}
      {availableTypes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            multiple
            value={filters.type || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter('type', selected.length > 0 ? selected : undefined);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Term */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.searchTerm || ''}
          onChange={(e) => updateFilter('searchTerm', e.target.value || undefined)}
          placeholder="Search log messages and data..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({})}
        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

// Log Details Component
const LogDetails: React.FC<{ log: LogEntry | null }> = ({ log }) => {
  if (!log) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-gray-500 text-center">Select a log entry to view details</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-6 flex-shrink-0">
        <h3 className="text-xl font-semibold text-gray-900">Log Details</h3>
        <LogLevelBadge level={log.level} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <p className="text-sm text-gray-900 font-medium">{log.message}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Timestamp</label>
            <p className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</p>
          </div>

          {log.component && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Component</label>
              <p className="text-sm text-gray-900 font-medium">{log.component}</p>
            </div>
          )}

          {log.context && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Context</label>
              <p className="text-sm text-gray-900 font-medium">{log.context}</p>
            </div>
          )}

          {log.type && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <p className="text-sm text-gray-900 font-medium">{log.type}</p>
            </div>
          )}

          {log.data && (
            <div className="bg-gray-50 p-4 rounded-lg flex-1 flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Data</label>
              <div className="bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm flex-1">
                <pre className="text-xs text-gray-800 p-4 overflow-auto font-mono leading-relaxed whitespace-pre-wrap h-full">
                  {JSON.stringify(log.data as Record<string, unknown>, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

// Main Log Viewer Component
export const LogViewer: React.FC<LogViewerProps> = ({
  className = '',
  initialFilters = {},
  initialConfig = {},
  onLogSelect,
  onFilterChange
}) => {
  const [state, setState] = useState<LogViewerState>({
    logs: [],
    filteredLogs: [],
    selectedLog: null,
    filters: initialFilters,
    config: {
      enableLiveStreaming: true,
      maxLogEntries: 1000,
      autoScroll: true,
      batchSize: 10,
      debounceMs: 300,
      ...initialConfig
    },
    isStreaming: false,
    searchTerm: '',
    showFilters: false,
    exportFormat: 'json'
  });

  // Get available filter options from logs
  const availableComponents = useMemo(() => {
    const components = new Set<string>();
    state.logs.forEach(log => {
      if (log.component) components.add(log.component);
    });
    return Array.from(components).sort();
  }, [state.logs]);

  const availableContexts = useMemo(() => {
    const contexts = new Set<string>();
    state.logs.forEach(log => {
      if (log.context) contexts.add(log.context);
    });
    return Array.from(contexts).sort();
  }, [state.logs]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    state.logs.forEach(log => {
      if (log.type) types.add(log.type);
    });
    return Array.from(types).sort();
  }, [state.logs]);

  // Apply filters to logs
  const applyFilters = useCallback((logs: LogEntry[], filters: LogFilters): LogEntry[] => {
    return logs.filter(log => {
      // Log level filter
      if (filters.logLevel && filters.logLevel.length > 0) {
        if (!filters.logLevel.includes(log.level)) return false;
      }

      // Component filter
      if (filters.component && filters.component.length > 0) {
        if (!log.component || !filters.component.includes(log.component)) return false;
      }

      // Context filter
      if (filters.context && filters.context.length > 0) {
        if (!log.context || !filters.context.includes(log.context)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!log.type || !filters.type.includes(log.type)) return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const messageLower = log.message.toLowerCase();
        const dataString = JSON.stringify(log.data || '').toLowerCase();
        
        if (!messageLower.includes(searchLower) && !dataString.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, []);

  // Update filtered logs when logs or filters change
  useEffect(() => {
    const filtered = applyFilters(state.logs, state.filters);
    setState(prev => ({ ...prev, filteredLogs: filtered }));
  }, [state.logs, state.filters, applyFilters]);

  // Set up log streaming
  useEffect(() => {
    const stream = aiLogger.getLogStream();
    
    const handleLogEntry = (entry: LogEntry) => {
      setState(prev => ({
        ...prev,
        logs: prev.logs.length >= prev.config.maxLogEntries
          ? [...prev.logs.slice(1), entry]
          : [...prev.logs, entry]
      }));
    };

    if (state.config.enableLiveStreaming) {
      stream.on('log-entry', handleLogEntry);
      setState(prev => ({ ...prev, isStreaming: true }));
    }

    return () => {
      stream.removeAllListeners();
      setState(prev => ({ ...prev, isStreaming: false }));
    };
  }, [state.config.enableLiveStreaming, state.config.maxLogEntries]);

  // Handle log selection
  const handleLogSelect = useCallback((log: LogEntry) => {
    setState(prev => ({ ...prev, selectedLog: log }));
    onLogSelect?.(log);
  }, [onLogSelect]);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: LogFilters) => {
    setState(prev => ({ ...prev, filters }));
    onFilterChange?.(filters);
  }, [onFilterChange]);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = state.exportFormat === 'json' 
      ? aiLogger.exportLogs('json')
      : aiLogger.exportLogs('csv');
    
    // Check if we're in a browser environment with URL.createObjectURL support
    if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
      const blob = new Blob([exportData], { 
        type: state.exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-logs.${state.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Fallback for environments without URL.createObjectURL (like tests)
      console.log('Export data:', exportData);
    }
  }, [state.exportFormat]);

  // Handle clear logs
  const handleClearLogs = useCallback(() => {
    aiLogger.clearLogHistory();
    setState(prev => ({ 
      ...prev, 
      logs: [], 
      filteredLogs: [], 
      selectedLog: null 
    }));
  }, []);

  return (
    <div className={`log-viewer ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">AI Log Viewer</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${state.isStreaming ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {state.isStreaming ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={state.exportFormat}
              onChange={(e) => setState(prev => ({ ...prev, exportFormat: e.target.value as 'json' | 'csv' }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Export
            </button>
            
            <button
              onClick={handleClearLogs}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              {state.showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {state.filteredLogs.length} of {state.logs.length} logs
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 h-full">
        {/* Filters Panel */}
        {state.showFilters && (
          <div className="xl:col-span-1">
            <FilterControls
              filters={state.filters}
              onFilterChange={handleFilterChange}
              availableComponents={availableComponents}
              availableContexts={availableContexts}
              availableTypes={availableTypes}
            />
          </div>
        )}

        {/* Logs List */}
        <div className={`${state.showFilters ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
            <div className="border-b border-gray-200 p-4 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">Logs</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {state.filteredLogs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No logs match the current filters
                </div>
              ) : (
                state.filteredLogs.map(log => (
                  <LogEntryItem
                    key={log.id}
                    log={log}
                    isSelected={state.selectedLog?.id === log.id}
                    onSelect={handleLogSelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Log Details */}
        <div className="xl:col-span-2">
          <div className="h-full">
            <LogDetails log={state.selectedLog} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer; 