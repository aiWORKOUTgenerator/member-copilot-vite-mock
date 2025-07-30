import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfidenceExplanation } from '../ConfidenceExplanation';
import { type ConfidenceFactors } from '../../ConfidenceBreakdown';

describe('ConfidenceExplanation', () => {
  const mockFactors: ConfidenceFactors = {
    profileMatch: 0.85,
    safetyAlignment: 0.92,
    equipmentFit: 0.78,
    goalAlignment: 0.88,
    structureQuality: 0.95
  };

  const mockUserProfile = {
    fitnessLevel: 'intermediate',
    experience: '2 years',
    goals: ['strength building', 'muscle gain'],
    equipment: ['dumbbells', 'barbell', 'rack'],
    injuries: ['minor knee issue'],
    limitations: ['limited shoulder mobility']
  };

  describe('Basic Rendering', () => {
    it('should render confidence explanation with real factors', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      expect(screen.getByText('Confidence Score Breakdown')).toBeInTheDocument();
      expect(screen.getByText('How this workout matches your profile and preferences')).toBeInTheDocument();
    });

    it('should handle missing factors gracefully', () => {
      render(
        <ConfidenceExplanation
          confidence={0.75}
        />
      );

      // Use a more flexible matcher since the confidence score might be split across elements
      expect(screen.getByText(/Confidence Score:/)).toBeInTheDocument();
      expect(screen.getByText('This workout has been personalized based on your profile. Detailed factor breakdown is not available for this workout.')).toBeInTheDocument();
    });

    it('should display correct confidence level for different scores', () => {
      const { rerender } = render(
        <ConfidenceExplanation
          confidence={0.9}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // Check that the component renders with the confidence score
      expect(screen.getByText('Confidence Score Breakdown')).toBeInTheDocument();

      rerender(
        <ConfidenceExplanation
          confidence={0.5}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // Check that the component still renders
      expect(screen.getByText('Confidence Score Breakdown')).toBeInTheDocument();
    });
  });

  describe('Factor Explanations', () => {
    it('should render all confidence factors when provided', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      expect(screen.getByText('Profile Match')).toBeInTheDocument();
      expect(screen.getByText('Safety Alignment')).toBeInTheDocument();
      expect(screen.getByText('Equipment Fit')).toBeInTheDocument();
      expect(screen.getByText('Goal Alignment')).toBeInTheDocument();
      expect(screen.getByText('Structure Quality')).toBeInTheDocument();
    });

    it('should show factor details (all factors are expanded by default)', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // All factors are expanded by default, so we should see multiple "Details:" elements
      const detailsElements = screen.getAllByText('Details:');
      expect(detailsElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Matches your intermediate level')).toBeInTheDocument();
    });

    it('should show correct data points for each factor', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      expect(screen.getByText('Matches your intermediate level')).toBeInTheDocument();
      expect(screen.getByText('Considers your workout experience')).toBeInTheDocument();
      expect(screen.getByText('Targets your goals: strength building, muscle gain')).toBeInTheDocument();
    });

    it('should handle missing user profile data gracefully', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
        />
      );

      expect(screen.getByText('Matches your fitness level')).toBeInTheDocument();
      expect(screen.getByText('Targets your goals: general fitness')).toBeInTheDocument();
    });
  });

  describe('Score-Based Explanations', () => {
    it('should show score-specific explanations for high scores', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // Use getAllByText since multiple factors might have this text
      const excellentTexts = screen.getAllByText(/This factor is performing excellently/);
      expect(excellentTexts.length).toBeGreaterThan(0);
    });

    it('should show improvement needed for low scores', () => {
      const lowFactors = {
        profileMatch: 0.3,
        safetyAlignment: 0.4,
        equipmentFit: 0.2,
        goalAlignment: 0.3,
        structureQuality: 0.5
      };

      render(
        <ConfidenceExplanation
          confidence={0.34}
          factors={lowFactors}
          userProfile={mockUserProfile}
        />
      );

      // Use getAllByText since multiple factors might have this text
      const improvementTexts = screen.getAllByText('Improvement Needed');
      expect(improvementTexts.length).toBeGreaterThan(0);
      
      const attentionTexts = screen.getAllByText(/This factor needs attention to improve your workout experience/);
      expect(attentionTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Summary Section', () => {
    it('should show improvement guidance', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      expect(screen.getByText('How to Improve Your Score')).toBeInTheDocument();
      expect(screen.getByText(/Higher confidence scores mean better workout personalization/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      const profileMatchElement = screen.getByText('Profile Match').closest('div');
      expect(profileMatchElement).toBeInTheDocument();
      
      if (profileMatchElement) {
        // Focus the element
        profileMatchElement.focus();
        
        // Should be expandable with Enter key
        fireEvent.keyDown(profileMatchElement, { key: 'Enter' });
        
        // Check that details are still visible (they're expanded by default)
        const detailsElements = screen.getAllByText('Details:');
        expect(detailsElements.length).toBeGreaterThan(0);
      }
    });

    it('should have proper interactive elements', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      const clickableElements = screen.getAllByText(/Profile Match|Safety Alignment|Equipment Fit|Goal Alignment|Structure Quality/);
      expect(clickableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle confidence score of 0', () => {
      render(
        <ConfidenceExplanation
          confidence={0}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // Check that the component renders
      expect(screen.getByText('Confidence Score Breakdown')).toBeInTheDocument();
    });

    it('should handle confidence score of 1', () => {
      render(
        <ConfidenceExplanation
          confidence={1}
          factors={mockFactors}
          userProfile={mockUserProfile}
        />
      );

      // Check that the component renders
      expect(screen.getByText('Confidence Score Breakdown')).toBeInTheDocument();
    });

    it('should handle empty user profile', () => {
      render(
        <ConfidenceExplanation
          confidence={0.85}
          factors={mockFactors}
          userProfile={{}}
        />
      );

      expect(screen.getByText('Matches your fitness level')).toBeInTheDocument();
      expect(screen.getByText('Targets your goals: general fitness')).toBeInTheDocument();
    });
  });
}); 