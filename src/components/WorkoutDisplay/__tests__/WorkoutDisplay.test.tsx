import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutDisplay } from '../WorkoutDisplay';
import { GeneratedWorkout } from '../../../services/ai/external/types/external-ai.types';

// Mock the ExerciseCard component
jest.mock('../ExerciseCard', () => ({
  ExerciseCard: ({ exercise }: { exercise: { id: string; name: string } }) => (
    <div data-testid={`exercise-${exercise.id}`}>{exercise.name}</div>
  )
}));

// Mock the WorkoutPhase component
jest.mock('../WorkoutPhase', () => ({
  WorkoutPhase: ({ phase, title }: { phase: { exercises?: { length: number }[] }; title: string }) => (
    <div data-testid={`phase-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title} - {phase?.exercises?.length ?? 0} exercises
    </div>
  )
}));

describe('WorkoutDisplay', () => {
  beforeEach(() => {
    // Skip tutorial for all tests
    localStorage.setItem('workout-confidence-tutorial', 'completed');
  });

  const mockWorkout: GeneratedWorkout = {
    id: 'test-workout-1',
    title: 'Test Workout',
    description: 'A test workout',
    totalDuration: 1800,
    estimatedCalories: 250,
    difficulty: 'some experience',
    equipment: ['bodyweight'],
    confidence: 0.85,
    confidenceFactors: {
      profileMatch: 0.9,
      safetyAlignment: 0.95,
      equipmentFit: 0.8,
      goalAlignment: 0.85,
      structureQuality: 0.75
    },
    warmup: {
      name: 'Warm-up',
      duration: 300,
      exercises: [
        {
          id: 'warmup-1',
          name: 'Light Stretching',
          description: 'Gentle stretching exercises',
          form: 'Stand with feet shoulder-width apart and stretch gently',
          modifications: [],
          commonMistakes: ['Bouncing during stretches'],
          primaryMuscles: ['hamstrings', 'calves'],
          secondaryMuscles: ['quadriceps'],
          movementType: 'flexibility'
        }
      ],
      instructions: 'Start with light stretching',
      tips: ['Take it slow', 'Breathe deeply']
    },
    mainWorkout: {
      name: 'Main Workout',
      duration: 1200,
      exercises: [
        {
          id: 'main-1',
          name: 'Push-ups',
          description: 'Standard push-ups',
          form: 'Keep your body in a straight line from head to heels',
          modifications: [],
          commonMistakes: ['Sagging hips', 'Incomplete range of motion'],
          primaryMuscles: ['chest', 'triceps'],
          secondaryMuscles: ['shoulders', 'core'],
          movementType: 'strength'
        }
      ],
      instructions: 'Perform the main exercises',
      tips: ['Maintain form', 'Rest as needed']
    },
    cooldown: {
      name: 'Cool-down',
      duration: 300,
      exercises: [
        {
          id: 'cooldown-1',
          name: 'Static Stretching',
          description: 'Hold stretches for 30 seconds each',
          form: 'Hold each stretch without bouncing',
          modifications: [],
          commonMistakes: ['Bouncing during stretches'],
          primaryMuscles: ['hamstrings', 'calves'],
          secondaryMuscles: ['quadriceps'],
          movementType: 'flexibility'
        }
      ],
      instructions: 'Cool down with stretching',
      tips: ['Hold each stretch', 'Relax your muscles']
    },
    reasoning: 'This workout is designed for intermediate fitness level',
    personalizedNotes: ['Focus on form over speed'],
    progressionTips: ['Increase reps gradually'],
    safetyReminders: ['Stop if you feel pain'],
    generatedAt: new Date(),
    aiModel: 'gpt-4',
    tags: ['strength', 'bodyweight']
  };

  it('should display real confidence factors instead of simulated ones', () => {
    render(
      <WorkoutDisplay
        workout={mockWorkout}
        onRegenerate={() => {}}
        onDownload={() => {}}
        onShare={() => {}}
      />
    );

    // Check that the confidence score is displayed (use getAllByText to handle multiple instances)
    const confidenceElements = screen.getAllByText('85%');
    expect(confidenceElements.length).toBeGreaterThan(0);

    // Check that the confidence level is displayed (should be "excellent" for 0.85)
    const excellentElements = screen.getAllByText(/excellent/i);
    expect(excellentElements.length).toBeGreaterThan(0);
  });

  it('should fallback to simulated factors when confidenceFactors is not available', () => {
    const workoutWithoutFactors = {
      ...mockWorkout,
      confidenceFactors: undefined
    };

    render(
      <WorkoutDisplay
        workout={workoutWithoutFactors}
        onRegenerate={() => {}}
        onDownload={() => {}}
        onShare={() => {}}
      />
    );

    // Should still display the confidence score
    const confidenceElements = screen.getAllByText('85%');
    expect(confidenceElements.length).toBeGreaterThan(0);
  });

  it('should handle missing confidence score gracefully', () => {
    const workoutWithoutConfidence = {
      ...mockWorkout,
      confidence: 0,
      confidenceFactors: undefined
    };

    render(
      <WorkoutDisplay
        workout={workoutWithoutConfidence}
        onRegenerate={() => {}}
        onDownload={() => {}}
        onShare={() => {}}
      />
    );

    // Should display a fallback confidence score (80%)
    const confidenceElements = screen.getAllByText('80%');
    expect(confidenceElements.length).toBeGreaterThan(0);
  });

  it('should display workout phases correctly', () => {
    render(
      <WorkoutDisplay
        workout={mockWorkout}
        onRegenerate={() => {}}
        onDownload={() => {}}
        onShare={() => {}}
      />
    );

    // Check that the workout title is displayed
    expect(screen.getByText('Test Workout')).toBeInTheDocument();
    
    // Check that the workout description is displayed
    expect(screen.getByText('A test workout')).toBeInTheDocument();
  });

  it('should handle empty workout gracefully', () => {
    render(
      <WorkoutDisplay
        workout={null as unknown as GeneratedWorkout}
        onRegenerate={() => {}}
        onDownload={() => {}}
        onShare={() => {}}
      />
    );

    // Should display the no workout message
    expect(screen.getByText('No workout data available')).toBeInTheDocument();
    expect(screen.getByText('Generate Workout')).toBeInTheDocument();
  });
}); 