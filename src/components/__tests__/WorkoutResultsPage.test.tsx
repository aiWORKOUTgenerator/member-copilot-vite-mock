import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkoutResultsPage from '../WorkoutResultsPage';
import { GeneratedWorkout } from '../../services/ai/external/types/external-ai.types';
import { UseWorkoutGenerationReturn } from '../../hooks/useWorkoutGeneration';

// Mock the confidence components with simple implementations
jest.mock('../confidence', () => ({
  ConfidenceBreakdown: ({ confidence, factors }: any) => (
    <div data-testid="confidence-breakdown">
      <p>Confidence: {Math.round(confidence * 100)}%</p>
      <p>Factors: {factors ? 'Available' : 'Not available'}</p>
    </div>
  ),
  ConfidenceExplanation: ({ confidence, factors, userProfile }: any) => (
    <div data-testid="confidence-explanation">
      <p data-testid="explanation-confidence">Confidence: {Math.round(confidence * 100)}%</p>
      <p data-testid="explanation-factors">Factors: {factors ? 'Available' : 'Not available'}</p>
      <p data-testid="explanation-profile">User Profile: {userProfile ? 'Available' : 'Not available'}</p>
    </div>
  ),
  ImprovementActions: ({ confidence, factors, userProfile, onActionClick }: any) => (
    <div data-testid="improvement-actions">
      <p data-testid="actions-confidence">Confidence: {Math.round(confidence * 100)}%</p>
      <p data-testid="actions-test-action">Test Action</p>
      <button 
        data-testid="action-button"
        onClick={() => onActionClick && onActionClick({ 
          action: 'update_profile',
          deepLink: 'profile',
          category: 'profile',
          impact: 'high'
        })}
      >
        Update Profile
      </button>
    </div>
  ),
  ConfidenceHelp: ({ isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="confidence-help-modal">
        <div>Help Modal Content</div>
        <button data-testid="close-help-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  )
}));

// Mock the WorkoutDisplay component
jest.mock('../WorkoutDisplay', () => ({
  WorkoutDisplay: ({ workout }: any) => (
    <div data-testid="workout-display">
      <h1>{workout.title}</h1>
      <p>{workout.description}</p>
    </div>
  )
}));

describe('WorkoutResultsPage - Transparency Features', () => {
  const mockWorkout: GeneratedWorkout = {
    id: 'test-workout-1',
    title: 'Test Workout',
    description: 'A test workout for transparency features',
    totalDuration: 30,
    estimatedCalories: 250,
    difficulty: 'some experience',
    equipment: ['dumbbells'],
    warmup: {
      name: 'Warmup',
      duration: 300,
      exercises: [],
      instructions: 'Begin with light movements',
      tips: ['Keep movements controlled']
    },
    mainWorkout: {
      name: 'Main Workout',
      duration: 1200,
      exercises: [],
      instructions: 'Complete all sets',
      tips: ['Maintain form']
    },
    cooldown: {
      name: 'Cooldown',
      duration: 300,
      exercises: [],
      instructions: 'End with stretching',
      tips: ['Hold each stretch']
    },
    reasoning: 'This workout is designed for intermediate fitness level',
    personalizedNotes: ['Focus on form over speed'],
    progressionTips: ['Increase reps gradually'],
    safetyReminders: ['Stop if you feel pain'],
    generatedAt: new Date(),
    aiModel: 'gpt-4',
    confidence: 0.85,
    confidenceFactors: {
      profileMatch: 0.9,
      safetyAlignment: 0.8,
      equipmentFit: 0.85,
      goalAlignment: 0.9,
      structureQuality: 0.8
    },
    tags: ['strength', 'intermediate']
  };

  const mockWorkoutGeneration: UseWorkoutGenerationReturn = {
    state: {
      status: 'complete',
      generationProgress: 100,
      error: null,
      retryCount: 0,
      lastError: null,
      generatedWorkout: mockWorkout,
      lastGenerated: new Date()
    },
    status: 'complete',
    generateWorkout: jest.fn(),
    regenerateWorkout: jest.fn(),
    clearWorkout: jest.fn(),
    retryGeneration: jest.fn(),
    canRegenerate: true,
    hasError: false,
    isGenerating: false
  };

  const mockProps = {
    onNavigate: jest.fn(),
    generatedWorkout: mockWorkout,
    workoutGeneration: mockWorkoutGeneration,
    onWorkoutUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render transparency features section', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    expect(screen.getByText('Understanding Your Confidence Score')).toBeInTheDocument();
    expect(screen.getByText('Why This Score?')).toBeInTheDocument();
    expect(screen.getByTestId('improvement-actions')).toBeInTheDocument();
  });

  it('should show confidence explanation when "Why This Score?" is clicked', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Click the explanation button
    fireEvent.click(screen.getByText('Why This Score?'));
    
    // Now explanation should be visible
    expect(screen.getByTestId('confidence-explanation')).toBeInTheDocument();
    expect(screen.getByTestId('explanation-confidence')).toHaveTextContent('Confidence: 85%');
    expect(screen.getByTestId('explanation-factors')).toHaveTextContent('Factors: Available');
    expect(screen.getByTestId('explanation-profile')).toHaveTextContent('User Profile: Available');
  });

  it('should show improvement actions', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Improvement actions should be rendered
    expect(screen.getByTestId('improvement-actions')).toBeInTheDocument();
    expect(screen.getByTestId('actions-confidence')).toHaveTextContent('Confidence: 85%');
    expect(screen.getByTestId('actions-test-action')).toHaveTextContent('Test Action');
  });

  it('should show help modal when help button is clicked', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Click the help button
    fireEvent.click(screen.getByText('Help'));
    
    // Help modal should be visible
    expect(screen.getByTestId('confidence-help-modal')).toBeInTheDocument();
  });

  it('should close help modal when close button is clicked', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Open help modal
    fireEvent.click(screen.getByText('Help'));
    expect(screen.getByTestId('confidence-help-modal')).toBeInTheDocument();
    
    // Close help modal
    fireEvent.click(screen.getByTestId('close-help-modal'));
    expect(screen.queryByTestId('confidence-help-modal')).not.toBeInTheDocument();
  });

  it('should handle improvement action clicks', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Click the action button in the improvement actions component
    fireEvent.click(screen.getByTestId('action-button'));
    
    // The mock should have been called
    expect(mockProps.onNavigate).toHaveBeenCalledWith('profile');
  });

  it('should show quick action buttons', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Use getAllByText to get all instances and check they exist
    const updateProfileButtons = screen.getAllByText('Update Profile');
    expect(updateProfileButtons.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Adjust Preferences')).toBeInTheDocument();
    expect(screen.getByText('Generate New Workout →')).toBeInTheDocument();
  });

  it('should navigate to profile when "Update Profile" is clicked', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    // Click the first "Update Profile" button (the one in the quick actions section)
    const updateProfileButtons = screen.getAllByText('Update Profile');
    fireEvent.click(updateProfileButtons[1]); // The second one is in the quick actions
    expect(mockProps.onNavigate).toHaveBeenCalledWith('profile');
  });

  it('should navigate to focus when "Adjust Preferences" is clicked', () => {
    render(<WorkoutResultsPage {...mockProps} />);
    
    fireEvent.click(screen.getByText('Adjust Preferences'));
    expect(mockProps.onNavigate).toHaveBeenCalledWith('focus');
  });

  it('should handle workout without confidence factors gracefully', () => {
    const workoutWithoutFactors = {
      ...mockWorkout,
      confidenceFactors: undefined
    };
    
    render(<WorkoutResultsPage {...mockProps} generatedWorkout={workoutWithoutFactors} />);
    
    // Should still render transparency features
    expect(screen.getByText('Understanding Your Confidence Score')).toBeInTheDocument();
    expect(screen.getByTestId('improvement-actions')).toBeInTheDocument();
  });
}); 