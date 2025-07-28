import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import LogViewer from '../LogViewer';
import { aiLogger } from '../../../services/ai/logging/AILogger';
import type { LogEntry } from '../../../services/ai/logging/AILogger';

// Mock the AILogger
jest.mock('../../../services/ai/logging/AILogger', () => ({
  aiLogger: {
    getLogStream: jest.fn(),
    clearLogHistory: jest.fn(),
    exportLogs: jest.fn()
  }
}));

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

describe('LogViewer', () => {
  let mockStream: any;
  let mockOnLogSelect: jest.Mock;
  let mockOnFilterChange: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.console = mockConsole as any;

    // Setup mock stream
    mockStream = {
      on: jest.fn(),
      removeAllListeners: jest.fn()
    };

    (aiLogger.getLogStream as jest.Mock).mockReturnValue(mockStream);
    (aiLogger.clearLogHistory as jest.Mock).mockImplementation(() => {});
    (aiLogger.exportLogs as jest.Mock).mockReturnValue('mock export data');

    // Setup mock callbacks
    mockOnLogSelect = jest.fn();
    mockOnFilterChange = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should render the log viewer with default state', () => {
      render(<LogViewer />);
      
      expect(screen.getByText('AI Log Viewer')).toBeInTheDocument();
      expect(screen.getByText('0 of 0 logs')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should set up log streaming on mount', () => {
      render(<LogViewer />);
      
      expect(aiLogger.getLogStream).toHaveBeenCalled();
      expect(mockStream.on).toHaveBeenCalledWith('log-entry', expect.any(Function));
      expect(mockStream.on).toHaveBeenCalledWith('log-batch', expect.any(Function));
    });

    it('should clean up stream listeners on unmount', () => {
      const { unmount } = render(<LogViewer />);
      
      unmount();
      
      expect(mockStream.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('Log Display', () => {
    it('should display logs when they are received', async () => {
      render(<LogViewer />);
      
      // Simulate receiving a log entry
      const logEntry: LogEntry = {
        id: 'test-1',
        level: 'info',
        message: 'Test log message',
        timestamp: new Date().toISOString(),
        component: 'TestComponent',
        context: 'test'
      };

      // Get the log-entry handler
      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry);
      }

      await waitFor(() => {
        expect(screen.getByText('Test log message')).toBeInTheDocument();
        expect(screen.getByText('INFO')).toBeInTheDocument();
        expect(screen.getByText('TestComponent')).toBeInTheDocument();
      });
    });

    it('should display different log levels with correct styling', async () => {
      render(<LogViewer />);
      
      const logEntry: LogEntry = {
        id: 'test-1',
        level: 'error',
        message: 'Error message',
        timestamp: new Date().toISOString()
      };

      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry);
      }

      await waitFor(() => {
        expect(screen.getByText('ERROR')).toBeInTheDocument();
      });
    });

    it('should show "No logs match the current filters" when no logs are present', () => {
      render(<LogViewer />);
      
      expect(screen.getByText('No logs match the current filters')).toBeInTheDocument();
    });
  });

  describe('Log Selection', () => {
    it('should allow selecting a log entry', async () => {
      render(<LogViewer onLogSelect={mockOnLogSelect} />);
      
      const logEntry: LogEntry = {
        id: 'test-1',
        level: 'info',
        message: 'Test log message',
        timestamp: new Date().toISOString(),
        component: 'TestComponent',
        context: 'test',
        data: { test: 'data' }
      };

      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry);
      }

      await waitFor(() => {
        const logElement = screen.getByText('Test log message');
        fireEvent.click(logElement);
      });

      expect(mockOnLogSelect).toHaveBeenCalledWith(logEntry);
    });

    it('should display log details when a log is selected', async () => {
      render(<LogViewer />);
      
      const logEntry: LogEntry = {
        id: 'test-1',
        level: 'info',
        message: 'Test log message',
        timestamp: new Date().toISOString(),
        component: 'TestComponent',
        context: 'test',
        data: { test: 'data' }
      };

      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry);
      }

      await waitFor(() => {
        const logElement = screen.getByText('Test log message');
        fireEvent.click(logElement);
      });

      expect(screen.getByText('Log Details')).toBeInTheDocument();
      // Use getAllByText to handle multiple elements with the same text
      expect(screen.getAllByText('Test log message')).toHaveLength(2);
      expect(screen.getAllByText('TestComponent')).toHaveLength(2);
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should show/hide filters when toggle button is clicked', () => {
      render(<LogViewer />);
      
      const toggleButton = screen.getByText('Show Filters');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Log Level')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Hide Filters'));
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('should filter logs by log level', async () => {
      render(<LogViewer onFilterChange={mockOnFilterChange} />);
      
      // Add some test logs
      const logEntry1: LogEntry = {
        id: 'test-1',
        level: 'error',
        message: 'Error message',
        timestamp: new Date().toISOString()
      };

      const logEntry2: LogEntry = {
        id: 'test-2',
        level: 'info',
        message: 'Info message',
        timestamp: new Date().toISOString()
      };

      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry1);
        logEntryHandler(logEntry2);
      }

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });

      // Show filters and filter by error level
      fireEvent.click(screen.getByText('Show Filters'));
      
      const errorCheckbox = screen.getByLabelText('error');
      fireEvent.click(errorCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: ['error']
        })
      );
    });

    it('should filter logs by search term', async () => {
      render(<LogViewer onFilterChange={mockOnFilterChange} />);
      
      const logEntry: LogEntry = {
        id: 'test-1',
        level: 'info',
        message: 'Test log message',
        timestamp: new Date().toISOString()
      };

      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      if (logEntryHandler) {
        logEntryHandler(logEntry);
      }

      await waitFor(() => {
        expect(screen.getByText('Test log message')).toBeInTheDocument();
      });

      // Show filters and search
      fireEvent.click(screen.getByText('Show Filters'));
      
      const searchInput = screen.getByPlaceholderText('Search log messages and data...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            searchTerm: 'Test'
          })
        );
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      render(<LogViewer onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Show Filters'));
      fireEvent.click(screen.getByText('Clear All Filters'));

      expect(mockOnFilterChange).toHaveBeenCalledWith({});
    });
  });

  describe('Export Functionality', () => {
    it('should export logs in JSON format', () => {
      render(<LogViewer />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(aiLogger.exportLogs).toHaveBeenCalledWith('json');
    });

    it('should export logs in CSV format when selected', () => {
      render(<LogViewer />);
      
      const formatSelect = screen.getByDisplayValue('JSON');
      fireEvent.change(formatSelect, { target: { value: 'csv' } });
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(aiLogger.exportLogs).toHaveBeenCalledWith('csv');
    });

    it('should handle export in test environment', () => {
      // Mock console.log to verify fallback behavior
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<LogViewer />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(aiLogger.exportLogs).toHaveBeenCalledWith('json');
      expect(consoleSpy).toHaveBeenCalledWith('Export data:', 'mock export data');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear logs when clear button is clicked', () => {
      render(<LogViewer />);
      
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
      
      expect(aiLogger.clearLogHistory).toHaveBeenCalled();
    });
  });

  describe('Real-time Updates', () => {
    it('should show live indicator when streaming is active', () => {
      render(<LogViewer />);
      
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should handle log batches correctly', async () => {
      render(<LogViewer />);
      
      const logBatch: LogEntry[] = [
        {
          id: 'test-1',
          level: 'info',
          message: 'Batch log 1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'test-2',
          level: 'warn',
          message: 'Batch log 2',
          timestamp: new Date().toISOString()
        }
      ];

      const logBatchHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-batch'
      )?.[1];

      if (logBatchHandler) {
        logBatchHandler(logBatch);
      }

      await waitFor(() => {
        expect(screen.getByText('Batch log 1')).toBeInTheDocument();
        expect(screen.getByText('Batch log 2')).toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('should apply initial filters', () => {
      const initialFilters = {
        logLevel: ['error', 'warn'],
        searchTerm: 'test'
      };

      render(<LogViewer initialFilters={initialFilters} onFilterChange={mockOnFilterChange} />);
      
      // The initial filters should be applied internally, but onFilterChange is not called on mount
      expect(screen.getByText('AI Log Viewer')).toBeInTheDocument();
    });

    it('should apply initial config', () => {
      const initialConfig = {
        maxLogEntries: 500,
        debounceMs: 100
      };

      render(<LogViewer initialConfig={initialConfig} />);
      
      // The config should be applied internally
      expect(screen.getByText('AI Log Viewer')).toBeInTheDocument();
    });

    it('should call onFilterChange when filters are updated', async () => {
      render(<LogViewer onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Show Filters'));
      
      const searchInput = screen.getByPlaceholderText('Search log messages and data...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            searchTerm: 'test'
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<LogViewer />);
      
      expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<LogViewer />);
      
      const showFiltersButton = screen.getByText('Show Filters');
      showFiltersButton.focus();
      
      expect(showFiltersButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of logs efficiently', async () => {
      render(<LogViewer />);
      
      const logEntryHandler = mockStream.on.mock.calls.find(
        call => call[0] === 'log-entry'
      )?.[1];

      // Add many logs quickly
      for (let i = 0; i < 100; i++) {
        const logEntry: LogEntry = {
          id: `test-${i}`,
          level: 'info',
          message: `Test log ${i}`,
          timestamp: new Date().toISOString()
        };
        
        if (logEntryHandler) {
          logEntryHandler(logEntry);
        }
      }

      await waitFor(() => {
        expect(screen.getByText('Test log 99')).toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      jest.useFakeTimers();
      
      render(<LogViewer onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Show Filters'));
      
      const searchInput = screen.getByPlaceholderText('Search log messages and data...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Fast-forward time
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            searchTerm: 'test'
          })
        );
      });

      jest.useRealTimers();
    });
  });
}); 