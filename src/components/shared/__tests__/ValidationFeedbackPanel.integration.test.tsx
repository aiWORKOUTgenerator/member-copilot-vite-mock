import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationFeedbackPanel } from '../ValidationFeedbackPanel';
import { ValidationIssue } from '../../ReviewPage/utils/validationService';

describe('ValidationFeedbackPanel Integration Tests', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Severity Handling', () => {
    it('should render error issues with correct styling and actions', () => {
      const errorIssues: ValidationIssue[] = [
        {
          field: 'Profile Information',
          message: 'Complete profile information is required.',
          severity: 'error',
          action: {
            label: 'Complete Profile',
            onClick: jest.fn()
          },
          helpText: 'Your profile helps us create personalized workouts.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={errorIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Required Information Missing')).toBeInTheDocument();
      expect(screen.getByText('1 Error')).toBeInTheDocument();
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      expect(screen.getByText('Complete profile information is required.')).toBeInTheDocument();
      expect(screen.getByText('Complete Profile')).toBeInTheDocument();
      expect(screen.getByText('Your profile helps us create personalized workouts.')).toBeInTheDocument();
    });

    it('should call action when action button is clicked', () => {
      const mockAction = jest.fn();
      const errorIssues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error',
          action: {
            label: 'Set Focus',
            onClick: mockAction
          }
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={errorIssues}
          onDismiss={mockOnDismiss}
        />
      );

      const actionButton = screen.getByText('Set Focus');
      fireEvent.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Warning Severity Handling', () => {
    it('should render warning issues with correct styling', () => {
      const warningIssues: ValidationIssue[] = [
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning',
          helpText: 'Consider breaking into multiple sessions.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={warningIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Recommendations for Better Results')).toBeInTheDocument();
      expect(screen.getByText('1 Warning')).toBeInTheDocument();
      expect(screen.getByText('Workout Duration')).toBeInTheDocument();
      expect(screen.getByText('Very long workouts may lead to fatigue.')).toBeInTheDocument();
      expect(screen.getByText('Consider breaking into multiple sessions.')).toBeInTheDocument();
    });

    it('should not show action buttons for warnings without actions', () => {
      const warningIssues: ValidationIssue[] = [
        {
          field: 'Equipment',
          message: 'Body weight-only training may limit strength development.',
          severity: 'warning',
          helpText: 'Consider adding resistance equipment.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={warningIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByRole('button', { name: /Set|Complete|Update/ })).not.toBeInTheDocument();
    });
  });

  describe('Info Severity Handling', () => {
    it('should render info issues with correct styling', () => {
      const infoIssues: ValidationIssue[] = [
        {
          field: 'Experience Level',
          message: 'Strength training for beginners should focus on form.',
          severity: 'info',
          helpText: 'We\'ll prioritize bodyweight exercises and proper form instruction.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={infoIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Additional Information Available')).toBeInTheDocument();
      expect(screen.getByText('1 Info')).toBeInTheDocument();
      expect(screen.getByText('Experience Level')).toBeInTheDocument();
      expect(screen.getByText('Strength training for beginners should focus on form.')).toBeInTheDocument();
      expect(screen.getByText('We\'ll prioritize bodyweight exercises and proper form instruction.')).toBeInTheDocument();
    });
  });

  describe('Mixed Severity Handling', () => {
    it('should render mixed severity issues correctly', () => {
      const mixedIssues: ValidationIssue[] = [
        {
          field: 'Profile Information',
          message: 'Complete profile information is required.',
          severity: 'error',
          action: {
            label: 'Complete Profile',
            onClick: jest.fn()
          }
        },
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning',
          helpText: 'Consider breaking into multiple sessions.'
        },
        {
          field: 'Experience Level',
          message: 'Strength training for beginners should focus on form.',
          severity: 'info',
          helpText: 'We\'ll prioritize bodyweight exercises.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={mixedIssues}
          onDismiss={mockOnDismiss}
        />
      );

      // Should show error styling since there are errors
      expect(screen.getByText('Required Information Missing')).toBeInTheDocument();
      expect(screen.getByText('1 Error')).toBeInTheDocument();
      expect(screen.getByText('1 Warning')).toBeInTheDocument();
      expect(screen.getByText('1 Info')).toBeInTheDocument();
    });

    it('should prioritize error styling when errors are present', () => {
      const mixedIssues: ValidationIssue[] = [
        {
          field: 'Profile Information',
          message: 'Complete profile information is required.',
          severity: 'error',
          action: {
            label: 'Complete Profile',
            onClick: jest.fn()
          }
        },
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={mixedIssues}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Required Information Missing').closest('div');
      expect(panel).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('should use warning styling when only warnings are present', () => {
      const warningIssues: ValidationIssue[] = [
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning'
        },
        {
          field: 'Equipment',
          message: 'Body weight-only training may limit strength development.',
          severity: 'warning'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={warningIssues}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Recommendations for Better Results').closest('div');
      expect(panel).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('should use info styling when only info is present', () => {
      const infoIssues: ValidationIssue[] = [
        {
          field: 'Experience Level',
          message: 'Strength training for beginners should focus on form.',
          severity: 'info'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={infoIssues}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Additional Information Available').closest('div');
      expect(panel).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Help Text Display', () => {
    it('should show help text when showHelp is true', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error',
          helpText: 'Choose whether you want to focus on strength, cardio, flexibility, or other goals.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          showHelp={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Choose whether you want to focus on strength, cardio, flexibility, or other goals.')).toBeInTheDocument();
    });

    it('should hide help text when showHelp is false', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error',
          helpText: 'Choose whether you want to focus on strength, cardio, flexibility, or other goals.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          showHelp={false}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Choose whether you want to focus on strength, cardio, flexibility, or other goals.')).not.toBeInTheDocument();
    });

    it('should show help text by default', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error',
          helpText: 'Choose whether you want to focus on strength, cardio, flexibility, or other goals.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Choose whether you want to focus on strength, cardio, flexibility, or other goals.')).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should call onDismiss when dismiss button is clicked', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss validation feedback');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
        />
      );

      expect(screen.queryByLabelText('Dismiss validation feedback')).not.toBeInTheDocument();
    });
  });

  describe('Summary Actions', () => {
    it('should show summary actions when errors are present', () => {
      const errorIssues: ValidationIssue[] = [
        {
          field: 'Profile Information',
          message: 'Complete profile information is required.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={errorIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Please address all errors to continue with workout generation.')).toBeInTheDocument();
      expect(screen.getByText('View Help Guide')).toBeInTheDocument();
    });

    it('should not show summary actions when only warnings are present', () => {
      const warningIssues: ValidationIssue[] = [
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={warningIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Please address all errors to continue with workout generation.')).not.toBeInTheDocument();
      expect(screen.queryByText('View Help Guide')).not.toBeInTheDocument();
    });

    it('should not show summary actions when only info is present', () => {
      const infoIssues: ValidationIssue[] = [
        {
          field: 'Experience Level',
          message: 'Strength training for beginners should focus on form.',
          severity: 'info'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={infoIssues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Please address all errors to continue with workout generation.')).not.toBeInTheDocument();
      expect(screen.queryByText('View Help Guide')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should not render when no issues are provided', () => {
      const { container } = render(
        <ValidationFeedbackPanel
          issues={[]}
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle issues without help text gracefully', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Workout Focus')).toBeInTheDocument();
      expect(screen.getByText('Please select your workout focus.')).toBeInTheDocument();
      // Should not show help text section
      expect(screen.queryByText('Help:')).not.toBeInTheDocument();
    });

    it('should handle issues without actions gracefully', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Duration',
          message: 'Very long workouts may lead to fatigue.',
          severity: 'warning',
          helpText: 'Consider breaking into multiple sessions.'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Workout Duration')).toBeInTheDocument();
      expect(screen.getByText('Very long workouts may lead to fatigue.')).toBeInTheDocument();
      // Should not show action button
      expect(screen.queryByRole('button', { name: /Set|Complete|Update/ })).not.toBeInTheDocument();
    });

    it('should handle custom className prop', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          className="custom-class"
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Required Information Missing').closest('div');
      expect(panel).toHaveClass('custom-class');
    });

    it('should handle custom title prop', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          title="Custom Validation Title"
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Custom Validation Title')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for dismiss button', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss validation feedback');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      const issues: ValidationIssue[] = [
        {
          field: 'Workout Focus',
          message: 'Please select your workout focus.',
          severity: 'error'
        }
      ];

      render(
        <ValidationFeedbackPanel
          issues={issues}
          onDismiss={mockOnDismiss}
        />
      );

      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      
      // Should have proper list structure for issues
      const issueItems = screen.getAllByRole('listitem');
      expect(issueItems.length).toBeGreaterThan(0);
    });
  });
}); 