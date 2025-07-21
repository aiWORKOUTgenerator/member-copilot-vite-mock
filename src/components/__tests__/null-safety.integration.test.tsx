/**
 * Null Safety Integration Tests
 * 
 * Tests that verify components handle null/undefined data gracefully
 * and don't crash during initial load or state transitions.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AIProvider } from '../../contexts/AIContext';

// Import components to test
import ExperienceStep from '../Profile/components/steps/ExperienceStep';
import GoalsStep from '../Profile/components/steps/GoalsStep';
import PersonalInfoStep from '../Profile/components/steps/PersonalInfoStep';
import EnergyLevelSection from '../quickWorkout/components/EnergyLevelSection';
import WorkoutDurationSection from '../quickWorkout/components/WorkoutDurationSection';
import MuscleSorenessSection from '../quickWorkout/components/MuscleSorenessSection';
import WorkoutFocusSection from '../quickWorkout/components/WorkoutFocusSection';
import CrossComponentAnalysisPanel from '../quickWorkout/components/CrossComponentAnalysisPanel';

// Mock dependencies
jest.mock('../../hooks/usePersistedState', () => ({
  useEnhancedPersistedState: () => ({
    state: null,
    setState: jest.fn(),
    metadata: { lastSaved: null },
    hasUnsavedChanges: false,
    forceSave: jest.fn()
  })
}));

jest.mock('../../contexts/AIContext', () => ({
  ...jest.requireActual('../../contexts/AIContext'),
  useAI: () => ({
    serviceStatus: 'ready',
    getEnergyInsights: jest.fn(() => []),
    getSorenessInsights: jest.fn(() => []),
    isFeatureEnabled: jest.fn(() => true)
  })
}));

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <AIProvider>
      {children}
    </AIProvider>
  </MemoryRouter>
);

// Common test props
const mockProps = {
  profileData: null,
  onInputChange: jest.fn(),
  onArrayToggle: jest.fn(),
  getFieldError: jest.fn(),
  focusData: null,
  viewMode: 'complex' as const,
  userProfile: undefined,
  _aiContext: undefined
};

describe('Null Safety Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Step Components', () => {
    test('ExperienceStep handles null profileData gracefully', async () => {
      render(
        <TestWrapper>
          <ExperienceStep {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
      });

      // Should not throw any errors
      expect(screen.getByText('Experience & Activity')).toBeInTheDocument();
    });

    test('GoalsStep handles null profileData gracefully', async () => {
      render(
        <TestWrapper>
          <GoalsStep {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
      });

      // Should not throw any errors
      expect(screen.getByText('Goals & Timeline')).toBeInTheDocument();
    });

    test('PersonalInfoStep handles null profileData gracefully', async () => {
      render(
        <TestWrapper>
          <PersonalInfoStep {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
      });

      // Should not throw any errors
      expect(screen.getByText('Personal Metrics & Health')).toBeInTheDocument();
    });

    test('Profile steps handle undefined profileData gracefully', async () => {
      const undefinedProps = { ...mockProps, profileData: undefined };

      render(
        <TestWrapper>
          <ExperienceStep {...undefinedProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
      });
    });

    test('Profile steps handle partial profileData gracefully', async () => {
      const partialData = {
        experienceLevel: 'New to Exercise',
        // Missing other required fields
      };

      render(
        <TestWrapper>
          <ExperienceStep {...mockProps} profileData={partialData as any} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText('Experience & Activity')).toBeInTheDocument();
      
      // Should show the experience level that exists
      expect(screen.getByText('New to Exercise')).toBeInTheDocument();
    });
  });

  describe('Quick Workout Components', () => {
    test('EnergyLevelSection handles null focusData gracefully', async () => {
      render(
        <TestWrapper>
          <EnergyLevelSection {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading energy level data...')).toBeInTheDocument();
      });
    });

    test('WorkoutDurationSection handles null focusData gracefully', async () => {
      render(
        <TestWrapper>
          <WorkoutDurationSection {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading duration data...')).toBeInTheDocument();
      });
    });

    test('MuscleSorenessSection handles null focusData gracefully', async () => {
      render(
        <TestWrapper>
          <MuscleSorenessSection {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading soreness data...')).toBeInTheDocument();
      });
    });

    test('WorkoutFocusSection handles null focusData gracefully', async () => {
      render(
        <TestWrapper>
          <WorkoutFocusSection {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading focus data...')).toBeInTheDocument();
      });
    });

    test('CrossComponentAnalysisPanel handles null focusData gracefully', async () => {
      render(
        <TestWrapper>
          <CrossComponentAnalysisPanel {...mockProps} />
        </TestWrapper>
      );

      // Should return null instead of crashing
      expect(screen.queryByText('Cross-Component Analysis')).not.toBeInTheDocument();
    });

    test('Quick workout components handle undefined focusData gracefully', async () => {
      const undefinedProps = { ...mockProps, focusData: undefined };

      render(
        <TestWrapper>
          <EnergyLevelSection {...undefinedProps} />
        </TestWrapper>
      );

      // Should show loading state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Loading energy level data...')).toBeInTheDocument();
      });
    });

    test('Quick workout components handle partial focusData gracefully', async () => {
      const partialData = {
        energyLevel: 5,
        // Missing other required fields
      };

      render(
        <TestWrapper>
          <EnergyLevelSection {...mockProps} focusData={partialData as any} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText('Energy Level')).toBeInTheDocument();
      
      // Should show the energy level that exists
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });
  });

  describe('State Transition Tests', () => {
    test('Components handle null to data transitions gracefully', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ExperienceStep {...mockProps} />
        </TestWrapper>
      );

      // Initially shows loading state
      expect(screen.getByText('Loading profile data...')).toBeInTheDocument();

      // Transition to having data
      const dataProps = {
        ...mockProps,
        profileData: {
          experienceLevel: 'Some Experience',
          physicalActivity: 'moderate'
        }
      };

      rerender(
        <TestWrapper>
          <ExperienceStep {...dataProps} />
        </TestWrapper>
      );

      // Should now show the actual content
      await waitFor(() => {
        expect(screen.queryByText('Loading profile data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Some Experience')).toBeInTheDocument();
    });

    test('Components handle data to null transitions gracefully', async () => {
      const dataProps = {
        ...mockProps,
        profileData: {
          experienceLevel: 'Some Experience',
          physicalActivity: 'moderate'
        }
      };

      const { rerender } = render(
        <TestWrapper>
          <ExperienceStep {...dataProps} />
        </TestWrapper>
      );

      // Initially shows data
      expect(screen.getByText('Some Experience')).toBeInTheDocument();

      // Transition to null
      rerender(
        <TestWrapper>
          <ExperienceStep {...mockProps} />
        </TestWrapper>
      );

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
      });
    });
  });

  describe('Array Safety Tests', () => {
    test('Components handle null arrays gracefully', async () => {
      const dataWithNullArrays = {
        ...mockProps,
        profileData: {
          experienceLevel: 'Some Experience',
          physicalActivity: 'moderate',
          preferredActivities: null,
          availableLocations: null,
          availableEquipment: null
        }
      };

      render(
        <TestWrapper>
          <ExperienceStep {...dataWithNullArrays} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText('Experience & Activity')).toBeInTheDocument();
    });

    test('Components handle undefined arrays gracefully', async () => {
      const dataWithUndefinedArrays = {
        ...mockProps,
        profileData: {
          experienceLevel: 'Some Experience',
          physicalActivity: 'moderate',
          preferredActivities: undefined,
          availableLocations: undefined,
          availableEquipment: undefined
        }
      };

      render(
        <TestWrapper>
          <ExperienceStep {...dataWithUndefinedArrays} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText('Experience & Activity')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Tests', () => {
    test('Components do not throw errors with null data', async () => {
      // This test ensures no unhandled errors are thrown
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <ExperienceStep {...mockProps} />
          <GoalsStep {...mockProps} />
          <PersonalInfoStep {...mockProps} />
          <EnergyLevelSection {...mockProps} />
          <WorkoutDurationSection {...mockProps} />
          <MuscleSorenessSection {...mockProps} />
          <WorkoutFocusSection {...mockProps} />
        </TestWrapper>
      );

      // Wait for all components to render
      await waitFor(() => {
        expect(screen.getAllByText(/Loading.*data/)).toHaveLength(6);
      });

      // Should not have any console errors
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tests', () => {
    test('Components render quickly with null data', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <ExperienceStep {...mockProps} />
          <GoalsStep {...mockProps} />
          <PersonalInfoStep {...mockProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Loading.*data/)).toHaveLength(3);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
}); 