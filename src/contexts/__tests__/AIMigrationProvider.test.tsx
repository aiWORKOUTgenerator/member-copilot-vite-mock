import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIMigrationProvider, useMigrationStatus } from '../AIMigrationProvider';
import { refactoringFeatureFlags } from '../../services/ai/featureFlags/RefactoringFeatureFlags';
import { aiContextMonitor } from '../../services/ai/monitoring/AIContextMonitor';

// Mock the context providers
jest.mock('../AIContext', () => ({
  AIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="legacy-context">Legacy Context: {children}</div>
  ),
  useAI: () => ({
    serviceStatus: 'ready',
    environmentStatus: { issues: [], recommendations: [] }
  })
}));

jest.mock('../composition/AIComposedProvider', () => ({
  AIComposedProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-context">Composed Context: {children}</div>
  )
}));

// Mock the feature flags
jest.mock('../../services/ai/featureFlags/RefactoringFeatureFlags', () => ({
  refactoringFeatureFlags: {
    shouldUseComposedContext: jest.fn(),
    getFlag: jest.fn(),
    registerRollbackTrigger: jest.fn(),
    triggerRollback: jest.fn()
  }
}));

// Mock the monitor
jest.mock('../../services/ai/monitoring/AIContextMonitor', () => ({
  aiContextMonitor: {
    registerMigrationCallback: jest.fn(),
    unregisterMigrationCallback: jest.fn()
  }
}));

// Test component to verify context is working
const TestComponent: React.FC = () => {
  return (
    <div>
      <div data-testid="test-content">Test Content</div>
    </div>
  );
};

// Separate component for testing migration status
const MigrationStatusComponent: React.FC = () => {
  const { isUsingComposed, migrationEnabled } = useMigrationStatus();
  return (
    <div data-testid="migration-status">
      Using Composed: {isUsingComposed ? 'true' : 'false'}
      Migration Enabled: {migrationEnabled ? 'true' : 'false'}
    </div>
  );
};

describe('AIMigrationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset feature flags to default state
    (refactoringFeatureFlags.getFlag as jest.Mock).mockImplementation((flag: string) => {
      const defaults: Record<string, any> = {
        migrateToComposedContext: false,
        migrateToComposedContextPercentage: 0,
        migrateToComposedContextUserSegments: []
      };
      return defaults[flag] ?? false;
    });
  });

  describe('Migration Logic', () => {
    it('should use legacy context when migration is disabled', () => {
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockReturnValue(false);

      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(screen.getByTestId('legacy-context')).toBeInTheDocument();
      expect(screen.queryByTestId('composed-context')).not.toBeInTheDocument();
    });

    it('should use composed context when migration is enabled', () => {
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockReturnValue(true);

      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(screen.getByTestId('composed-context')).toBeInTheDocument();
      expect(screen.queryByTestId('legacy-context')).not.toBeInTheDocument();
    });

    it('should handle user ID targeting correctly', () => {
      const mockShouldUseComposed = jest.fn();
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock) = mockShouldUseComposed;

      render(
        <AIMigrationProvider userId="test-user-123">
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(mockShouldUseComposed).toHaveBeenCalledWith('test-user-123');
    });

    it('should handle percentage rollout correctly', () => {
      (refactoringFeatureFlags.getFlag as jest.Mock).mockImplementation((flag: string) => {
        if (flag === 'migrateToComposedContext') return true;
        if (flag === 'migrateToComposedContextPercentage') return 25;
        return false;
      });

      render(
        <AIMigrationProvider userId="test-user-50">
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(refactoringFeatureFlags.shouldUseComposedContext).toHaveBeenCalledWith('test-user-50');
    });
  });

  describe('Monitoring Integration', () => {
    it('should register migration callbacks when monitoring is enabled', () => {
      render(
        <AIMigrationProvider enableMonitoring={true}>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(aiContextMonitor.registerMigrationCallback).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function)
      });
    });

    it('should not register callbacks when monitoring is disabled', () => {
      render(
        <AIMigrationProvider enableMonitoring={false}>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(aiContextMonitor.registerMigrationCallback).not.toHaveBeenCalled();
    });

    it('should unregister callbacks on unmount', () => {
      const { unmount } = render(
        <AIMigrationProvider enableMonitoring={true}>
          <TestComponent />
        </AIMigrationProvider>
      );

      unmount();

      expect(aiContextMonitor.unregisterMigrationCallback).toHaveBeenCalled();
    });
  });

  describe('Rollback Integration', () => {
    it('should register rollback trigger', () => {
      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(refactoringFeatureFlags.registerRollbackTrigger).toHaveBeenCalledWith(
        'migration_provider',
        expect.any(Function)
      );
    });

    it('should handle rollback correctly', async () => {
      const mockRegisterRollback = jest.fn();
      (refactoringFeatureFlags.registerRollbackTrigger as jest.Mock) = mockRegisterRollback;

      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      // Get the rollback callback
      const rollbackCallback = mockRegisterRollback.mock.calls[0][1];
      
      // Simulate rollback
      await act(async () => {
        rollbackCallback();
      });

      // Verify the provider switches to legacy context
      await waitFor(() => {
        expect(screen.getByTestId('legacy-context')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle migration check errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockImplementation(() => {
        throw new Error('Migration check failed');
      });

      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AI Logger] ❌ Error in AIMigrationProvider: Migration check failed'),
        expect.objectContaining({
          component: 'AIMigrationProvider',
          context: 'migration_check',
          severity: 'high',
          userImpact: true
        })
      );
      expect(screen.getByTestId('legacy-context')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should fallback to legacy context on errors', () => {
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      render(
        <AIMigrationProvider>
          <TestComponent />
        </AIMigrationProvider>
      );

      expect(screen.getByTestId('legacy-context')).toBeInTheDocument();
    });
  });

  describe('useMigrationStatus Hook', () => {
    it('should return correct migration status', () => {
      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockReturnValue(true);
      (refactoringFeatureFlags.getFlag as jest.Mock).mockImplementation((flag: string) => {
        const flags: Record<string, any> = {
          migrateToComposedContext: true,
          migrateToComposedContextPercentage: 25,
          migrateToComposedContextUserSegments: ['test']
        };
        return flags[flag] ?? false;
      });

      render(
        <AIMigrationProvider>
          <MigrationStatusComponent />
        </AIMigrationProvider>
      );

      expect(screen.getByTestId('migration-status')).toHaveTextContent('Using Composed: true');
      expect(screen.getByTestId('migration-status')).toHaveTextContent('Migration Enabled: true');
    });

    it('should provide rollback trigger function', () => {
      const TestComponentWithRollback: React.FC = () => {
        const { triggerRollback } = useMigrationStatus();
        return (
          <button data-testid="rollback-button" onClick={triggerRollback}>
            Rollback
          </button>
        );
      };

      render(
        <AIMigrationProvider>
          <TestComponentWithRollback />
        </AIMigrationProvider>
      );

      const rollbackButton = screen.getByTestId('rollback-button');
      rollbackButton.click();

      expect(refactoringFeatureFlags.triggerRollback).toHaveBeenCalledWith('manual_rollback');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance when using composed context', async () => {
      const performanceSpy = jest.spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1500); // end time

      (refactoringFeatureFlags.shouldUseComposedContext as jest.Mock).mockReturnValue(true);

      const { unmount } = render(
        <AIMigrationProvider enableMonitoring={true}>
          <TestComponent />
        </AIMigrationProvider>
      );

      // Wait for the component to mount and then unmount
      await act(async () => {
        unmount();
      });

      // The performance.now should be called at least twice (start and end)
      expect(performanceSpy).toHaveBeenCalled();
      performanceSpy.mockRestore();
    });
  });
}); 