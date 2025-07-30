import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfidenceBreakdown, type ConfidenceFactors } from '../ConfidenceBreakdown';

// Constants
const PERCENTAGE_MULTIPLIER = 100;

// Mock the child components
jest.mock('../ConfidenceFactorCard', () => ({
      ConfidenceFactorCard: ({ name, score }: { name: string; score: number }) => (
      <div data-testid={`factor-${name.toLowerCase().replace(/\s+/g, '-')}`}>
        {name}: {Math.round(score * PERCENTAGE_MULTIPLIER)}%
      </div>
    )
}));

jest.mock('../ConfidenceTooltip', () => ({
  ConfidenceTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="confidence-tooltip">{children}</div>
  )
}));

describe('ConfidenceBreakdown', () => {
  const mockFactors: ConfidenceFactors = {
    profileMatch: 0.85,
    safetyAlignment: 0.92,
    equipmentFit: 0.78,
    goalAlignment: 0.88,
    structureQuality: 0.95
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('should render confidence breakdown with real factors', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('85% match')).toBeInTheDocument();
      expect(screen.getByText('How is this score calculated?')).toBeInTheDocument();
    });

    it('should handle missing factors gracefully', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.75}
        />
      );

      expect(screen.getByText('75% match')).toBeInTheDocument();
      expect(screen.getByText('How is this score calculated?')).toBeInTheDocument();
    });

    it('should display correct confidence level for different scores', () => {
      const { rerender } = render(
        <ConfidenceBreakdown
          confidence={0.9}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('90% match')).toBeInTheDocument();

      rerender(
        <ConfidenceBreakdown
          confidence={0.5}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('50% match')).toBeInTheDocument();
    });
  });

  describe('Factor Display', () => {
    it('should render all confidence factors when provided', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
        />
      );

      // Expand the details section
      fireEvent.click(screen.getByText('How is this score calculated?'));

      // Check that all factors are rendered
      expect(screen.getByTestId('factor-profile-match')).toBeInTheDocument();
      expect(screen.getByTestId('factor-safety-alignment')).toBeInTheDocument();
      expect(screen.getByTestId('factor-equipment-fit')).toBeInTheDocument();
      expect(screen.getByTestId('factor-goal-alignment')).toBeInTheDocument();
      expect(screen.getByTestId('factor-structure-quality')).toBeInTheDocument();
    });

    it('should not render factor breakdown when factors are not provided', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
        />
      );

      // Expand the details section
      fireEvent.click(screen.getByText('How is this score calculated?'));

      // Should not find factor breakdown section
      expect(screen.queryByText('Factor Breakdown')).not.toBeInTheDocument();
    });
  });

  describe('Tutorial Functionality', () => {
    it('should show tutorial for first-time users when showTutorial is true', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
          showTutorial={true}
        />
      );

      expect(screen.getByText('Welcome to Your AI Workout!')).toBeInTheDocument();
      expect(screen.getByText('This workout was personalized just for you using AI. Let\'s learn how to understand your confidence score.')).toBeInTheDocument();
    });

    it('should not show tutorial if user has already seen it', () => {
      localStorage.setItem('workout-confidence-tutorial', 'completed');

      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
          showTutorial={true}
        />
      );

      expect(screen.queryByText('Welcome to Your AI Workout!')).not.toBeInTheDocument();
      expect(screen.getByText('85% match')).toBeInTheDocument();
    });

    it('should complete tutorial when user clicks through all steps', async () => {
      const onTutorialComplete = jest.fn();

      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
          showTutorial={true}
          onTutorialComplete={onTutorialComplete}
        />
      );

      // Click through all tutorial steps
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText(i === 3 ? 'Finish' : 'Next'));
        await waitFor(() => {
          if (i < 3) {
            expect(screen.getByText(i === 0 ? 'Confidence Score Explained' : i === 1 ? 'What Affects Your Score' : 'You\'re All Set!')).toBeInTheDocument();
          }
        });
      }

      expect(onTutorialComplete).toHaveBeenCalled();
      expect(localStorage.getItem('workout-confidence-tutorial')).toBe('completed');
    });

    it('should skip tutorial when user clicks skip', () => {
      const onTutorialComplete = jest.fn();

      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
          showTutorial={true}
          onTutorialComplete={onTutorialComplete}
        />
      );

      fireEvent.click(screen.getByText('Skip'));

      expect(onTutorialComplete).toHaveBeenCalled();
      expect(localStorage.getItem('workout-confidence-tutorial')).toBe('completed');
    });
  });

  describe('Expandable Details', () => {
    it('should expand details when clicked', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
        />
      );

      // Click to expand
      fireEvent.click(screen.getByText('How is this score calculated?'));

      // Details should be visible
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
      expect(screen.getByText('Excellent Match')).toBeInTheDocument();
    });

    it('should show correct confidence level description', () => {
      const { rerender } = render(
        <ConfidenceBreakdown
          confidence={0.9}
          factors={mockFactors}
        />
      );

      fireEvent.click(screen.getByText('How is this score calculated?'));

      expect(screen.getByText(/Excellent match - This workout is highly personalized/)).toBeInTheDocument();

      // Test with lower confidence
      rerender(
        <ConfidenceBreakdown
          confidence={0.5}
          factors={mockFactors}
        />
      );

      fireEvent.click(screen.getByText('How is this score calculated?'));

      expect(screen.getByText(/Needs-review match - This workout is highly personalized/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
        />
      );

      // Check for summary element (details/summary pattern)
      const summary = screen.getByText('How is this score calculated?');
      expect(summary.closest('summary')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <ConfidenceBreakdown
          confidence={0.85}
          factors={mockFactors}
        />
      );

      const summary = screen.getByText('How is this score calculated?').closest('summary');
      expect(summary).toBeInTheDocument();
      
      if (summary) {
        // Should be focusable
        summary.focus();
        expect(summary).toHaveFocus();

        // Should be expandable with Enter key
        fireEvent.keyDown(summary, { key: 'Enter' });
        expect(screen.getByText('85% confidence')).toBeInTheDocument();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle confidence score of 0', () => {
      render(
        <ConfidenceBreakdown
          confidence={0}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('0% match')).toBeInTheDocument();
    });

    it('should handle confidence score of 1', () => {
      render(
        <ConfidenceBreakdown
          confidence={1}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('100% match')).toBeInTheDocument();
    });

    it('should handle undefined confidence gracefully', () => {
      render(
        <ConfidenceBreakdown
          confidence={undefined as unknown as number}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('NaN% match')).toBeInTheDocument();
    });
  });
}); 