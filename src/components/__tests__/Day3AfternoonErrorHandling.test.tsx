/**
 * Day 3 Afternoon Error Handling Tests
 * Tests the critical error fixes and ErrorBoundary enhancements
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutDisplay } from '../WorkoutDisplay/WorkoutDisplay';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { GeneratedWorkout } from '../../services/ai/external/types/external-ai.types';

// Mock workout data for testing
const createMockWorkout = (overrides: Partial<GeneratedWorkout> = {}): GeneratedWorkout => ({
  id: 'test-workout-1',
  title: 'Test Workout',
  description: 'A test workout for error handling',
  totalDuration: 45,
  difficulty: 'moderate',
  estimatedCalories: 300,
  confidence: 0.85,
  generatedAt: new Date(),
  aiModel: 'test-model',
  tags: ['test'],
  warmup: {
    duration: 10,
    exercises: [
      {
        id: 'warmup-1',
        name: 'Light Jogging',
        description: 'Easy jogging in place',
        duration: 5,
        sets: 1,
        reps: null,
        weight: null,
        equipment: [],
        primaryMuscles: ['legs'],
        secondaryMuscles: [],
        instructions: ['Start with light jogging'],
        modifications: [],
        notes: ''
      }
    ]
  },
  mainWorkout: {
    duration: 30,
    exercises: [
      {
        id: 'main-1',
        name: 'Push-ups',
        description: 'Standard push-ups',
        duration: null,
        sets: 3,
        reps: 10,
        weight: null,
        equipment: [],
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        instructions: ['Get in plank position', 'Lower your body', 'Push back up'],
        modifications: [],
        notes: ''
      }
    ]
  },
  cooldown: {
    duration: 5,
    exercises: [
      {
        id: 'cooldown-1',
        name: 'Stretching',
        description: 'Light stretching',
        duration: 5,
        sets: 1,
        reps: null,
        weight: null,
        equipment: [],
        primaryMuscles: ['full_body'],
        secondaryMuscles: [],
        instructions: ['Stretch all major muscle groups'],
        modifications: [],
        notes: ''
      }
    ]
  },
  personalizedNotes: ['Test note'],
  progressionTips: ['Test tip'],
  safetyReminders: ['Test reminder'],
  ...overrides
});

describe('Day 3 Afternoon - Error Handling and Crash Prevention', () => {
  describe('WorkoutDisplay Component Safety', () => {
    it('should handle undefined workout gracefully', () => {
      const mockOnRegenerate = jest.fn();
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();

      render(
        <WorkoutDisplay
          workout={undefined as any}
          onRegenerate={mockOnRegenerate}
          onDownload={mockOnDownload}
          onShare={mockOnShare}
          isRegenerating={false}
        />
      );

      // Should show the fallback UI
      expect(screen.getByText('No workout data available')).toBeInTheDocument();
      expect(screen.getByText('Generate Workout')).toBeInTheDocument();
    });

    it('should handle workout with missing properties gracefully', () => {
      const incompleteWorkout = {
        id: 'incomplete-workout',
        title: undefined,
        description: undefined,
        totalDuration: undefined,
        difficulty: undefined,
        estimatedCalories: undefined,
        confidence: undefined,
        generatedAt: undefined,
        aiModel: undefined,
        tags: undefined,
        warmup: undefined,
        mainWorkout: undefined,
        cooldown: undefined,
        personalizedNotes: undefined,
        progressionTips: undefined,
        safetyReminders: undefined
      } as any;

      const mockOnRegenerate = jest.fn();
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();

      render(
        <WorkoutDisplay
          workout={incompleteWorkout}
          onRegenerate={mockOnRegenerate}
          onDownload={mockOnDownload}
          onShare={mockOnShare}
          isRegenerating={false}
        />
      );

      // Should not crash and should show default values
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Your personalized workout plan')).toBeInTheDocument();
      expect(screen.getByText('0 min')).toBeInTheDocument();
      expect(screen.getAllByText('Moderate')).toHaveLength(2); // Appears in difficulty and badge
      expect(screen.getAllByText('0')).toHaveLength(2); // Appears in exercises and calories
    });

    it('should handle workout with missing exercise arrays gracefully', () => {
      const workoutWithMissingExercises = createMockWorkout({
        warmup: { duration: 10, exercises: undefined as any },
        mainWorkout: { duration: 30, exercises: undefined as any },
        cooldown: { duration: 5, exercises: undefined as any }
      });

      const mockOnRegenerate = jest.fn();
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();

      render(
        <WorkoutDisplay
          workout={workoutWithMissingExercises}
          onRegenerate={mockOnRegenerate}
          onDownload={mockOnDownload}
          onShare={mockOnShare}
          isRegenerating={false}
        />
      );

      // Should not crash and should show 0 exercises
      expect(screen.getByText('0')).toBeInTheDocument(); // Exercise count
      expect(screen.getByText('Warm-up (0)')).toBeInTheDocument();
      expect(screen.getByText('Main Workout (0)')).toBeInTheDocument();
      expect(screen.getByText('Cool-down (0)')).toBeInTheDocument();
    });

    it('should handle workout with null exercise arrays gracefully', () => {
      const workoutWithNullExercises = createMockWorkout({
        warmup: { duration: 10, exercises: null as any },
        mainWorkout: { duration: 30, exercises: null as any },
        cooldown: { duration: 5, exercises: null as any }
      });

      const mockOnRegenerate = jest.fn();
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();

      render(
        <WorkoutDisplay
          workout={workoutWithNullExercises}
          onRegenerate={mockOnRegenerate}
          onDownload={mockOnDownload}
          onShare={mockOnShare}
          isRegenerating={false}
        />
      );

      // Should not crash and should show 0 exercises
      expect(screen.getByText('0')).toBeInTheDocument(); // Exercise count
    });
  });

  describe('ErrorBoundary Component', () => {
    // Component that throws an error for testing
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error for ErrorBoundary');
      }
      return <div>No error</div>;
    };

    it('should catch errors and display fallback UI', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should display custom fallback when provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show custom fallback
      expect(screen.getByText('Custom error message')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should call onError callback when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onErrorMock = jest.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should call onError callback
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );

      consoleSpy.mockRestore();
    });

    it('should allow recovery by resetting error state', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Test that ErrorBoundary can be reset
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Create a new ErrorBoundary instance without error
      rerender(
        <ErrorBoundary key="new-instance">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show normal content after recovery
      expect(screen.getByText('No error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should show development error details in development mode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error details in development
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText('Test error for ErrorBoundary')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('WorkoutDisplay with ErrorBoundary Integration', () => {
    it('should handle WorkoutDisplay errors gracefully with ErrorBoundary', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onErrorMock = jest.fn();

      // Create a workout that might cause issues
      const problematicWorkout = createMockWorkout({
        warmup: {
          duration: 10,
          exercises: [
            {
              id: 'problematic-exercise',
              name: 'Problem Exercise',
              description: 'This exercise has issues',
              duration: null,
              sets: 3,
              reps: 10,
              weight: null,
              equipment: undefined as any, // This might cause issues
              primaryMuscles: undefined as any,
              secondaryMuscles: undefined as any,
              instructions: undefined as any,
              modifications: undefined as any,
              notes: undefined as any
            }
          ]
        }
      });

      const mockOnRegenerate = jest.fn();
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <WorkoutDisplay
            workout={problematicWorkout}
            onRegenerate={mockOnRegenerate}
            onDownload={mockOnDownload}
            onShare={mockOnShare}
            isRegenerating={false}
          />
        </ErrorBoundary>
      );

      // Should either display the workout or catch any errors
      // The component should not crash the entire application
      expect(screen.getByText('Test Workout')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
}); 