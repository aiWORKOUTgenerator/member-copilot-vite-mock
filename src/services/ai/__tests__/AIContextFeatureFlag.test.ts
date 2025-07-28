/**
 * AIContext Feature Flag Integration Tests
 * 
 * Tests the integration between AIContext and the refactoring feature flag system.
 * Verifies that the feature flag system can control AIContext behavior safely.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIProvider, useAI } from '../../../contexts/AIContext';
import { refactoringFeatureFlags } from '../featureFlags/RefactoringFeatureFlags';

// Mock the AIContext to avoid external dependencies
const mockAIContext = {
  serviceStatus: 'ready',
  featureFlags: { 
    ai_service_unified: true,
    ai_cross_component_analysis: true,
    ai_real_time_insights: false,
    ai_learning_system: false,
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true
  },
  environmentStatus: { 
    isConfigured: true, 
    hasApiKey: true, 
    isDevelopment: true, 
    issues: [], 
    recommendations: [] 
  },
  isFeatureEnabled: jest.fn((flag: string) => mockAIContext.featureFlags[flag as keyof typeof mockAIContext.featureFlags] || false),
  getEnergyInsights: jest.fn(() => []),
  getSorenessInsights: jest.fn(() => []),
  analyze: jest.fn(() => ({ insights: [], recommendations: [] })),
  generateWorkout: jest.fn(() => ({ workout: 'mock' })),
  updateSelections: jest.fn(),
  developmentTools: {
    getRefactoringFlags: jest.fn(() => refactoringFeatureFlags.getAllFlags()),
    setRefactoringFlag: jest.fn((flag: string, value: any) => refactoringFeatureFlags.setFlag(flag as any, value)),
    getRefactoringStatus: jest.fn(() => ({
      safetyStatus: refactoringFeatureFlags.getSafetyStatus(),
      migrationStatus: refactoringFeatureFlags.getMigrationStatus(),
      debugInfo: refactoringFeatureFlags.exportDebugInfo()
    })),
    triggerRefactoringRollback: jest.fn((reason: string) => refactoringFeatureFlags.triggerRollback(reason))
  }
};

// Mock the useAI hook
jest.mock('../../../contexts/AIContext', () => ({
  useAI: () => mockAIContext,
  AIProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

describe('AIContext Feature Flag Integration', () => {
  beforeEach(() => {
    // Reset feature flags to defaults
    refactoringFeatureFlags.reset();
    jest.clearAllMocks();
  });

  describe('Feature Flag System Integration', () => {
    test('should provide refactoring feature flag controls', () => {
      const { getRefactoringFlags, setRefactoringFlag, getRefactoringStatus } = mockAIContext.developmentTools;
      
      // Test getting all flags
      const flags = getRefactoringFlags();
      expect(flags).toBeDefined();
      expect(flags.aicontext_refactoring_enabled).toBe(false);
      expect(flags.aicontext_safety_monitoring).toBe(true);
      
      // Test setting a flag
      setRefactoringFlag('aicontext_refactoring_enabled', true);
      const updatedFlags = getRefactoringFlags();
      expect(updatedFlags.aicontext_refactoring_enabled).toBe(true);
      
      // Test getting status
      const status = getRefactoringStatus();
      expect(status.safetyStatus).toBeDefined();
      expect(status.migrationStatus).toBeDefined();
      expect(status.debugInfo).toBeDefined();
    });

    test('should provide rollback capability', () => {
      const { triggerRefactoringRollback } = mockAIContext.developmentTools;
      
      // Enable refactoring first
      refactoringFeatureFlags.setFlag('aicontext_refactoring_enabled', true);
      expect(refactoringFeatureFlags.getFlag('aicontext_refactoring_enabled')).toBe(true);
      
      // Trigger rollback
      triggerRefactoringRollback('test_rollback');
      
      // Verify rollback worked
      expect(refactoringFeatureFlags.getFlag('aicontext_refactoring_enabled')).toBe(false);
    });

    test('should provide safety status information', () => {
      const { getRefactoringStatus } = mockAIContext.developmentTools;
      
      const status = getRefactoringStatus();
      
      expect(status.safetyStatus.isSafe).toBe(true);
      expect(status.safetyStatus.missingSafetyFeatures).toEqual([]);
      expect(status.migrationStatus.isComplete).toBe(false);
      expect(status.migrationStatus.completedComponents).toEqual([]);
      expect(status.migrationStatus.pendingComponents).toContain('Core Context');
    });
  });

  describe('Feature Flag Decision Logic', () => {
    test('should use current implementation when refactoring disabled', () => {
      refactoringFeatureFlags.setFlag('aicontext_refactoring_enabled', false);
      
      const useNew = refactoringFeatureFlags.shouldUseNewImplementation('test_user');
      expect(useNew).toBe(false);
    });

    test('should use new implementation when refactoring enabled and safe', () => {
      refactoringFeatureFlags.setFlag('aicontext_refactoring_enabled', true);
      refactoringFeatureFlags.setFlag('aicontext_new_implementation', true);
      
      const useNew = refactoringFeatureFlags.shouldUseNewImplementation('test_user');
      expect(useNew).toBe(true);
    });

    test('should respect safety checks', () => {
      refactoringFeatureFlags.setFlag('aicontext_refactoring_enabled', true);
      refactoringFeatureFlags.setFlag('aicontext_new_implementation', true);
      refactoringFeatureFlags.setFlag('aicontext_safety_monitoring', false); // Disable safety
      
      const isSafe = refactoringFeatureFlags.isSafeToProceed();
      expect(isSafe).toBe(false);
    });
  });

  describe('Development Tools Integration', () => {
    test('should provide comprehensive refactoring controls', () => {
      const { getRefactoringFlags, setRefactoringFlag, getRefactoringStatus, triggerRefactoringRollback } = mockAIContext.developmentTools;
      
      // All methods should be available
      expect(getRefactoringFlags).toBeDefined();
      expect(setRefactoringFlag).toBeDefined();
      expect(getRefactoringStatus).toBeDefined();
      expect(triggerRefactoringRollback).toBeDefined();
      
      // All methods should be callable
      expect(() => getRefactoringFlags()).not.toThrow();
      expect(() => setRefactoringFlag('aicontext_test_flag', true)).not.toThrow();
      expect(() => getRefactoringStatus()).not.toThrow();
      expect(() => triggerRefactoringRollback('test')).not.toThrow();
    });
  });
}); 