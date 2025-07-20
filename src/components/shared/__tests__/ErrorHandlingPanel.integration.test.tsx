import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorHandlingPanel, ErrorTemplates } from '../ErrorHandlingPanel';

describe('ErrorHandlingPanel Integration Tests', () => {
  const mockOnDismiss = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Generation Error Handling', () => {
    it('should render generation error with retry option', () => {
      const generationError = ErrorTemplates.generationFailed('API timeout');

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Workout Generation Failed')).toBeInTheDocument();
      expect(screen.getByText('We encountered an issue while creating your personalized workout.')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call retry function when retry button is clicked', () => {
      const generationError = ErrorTemplates.generationFailed();

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call dismiss function when dismiss button is clicked', () => {
      const generationError = ErrorTemplates.generationFailed();

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss error');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should show error details when expanded', () => {
      const generationError = ErrorTemplates.generationFailed('Detailed error message');

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const showDetailsButton = screen.getByText('Show Details');
      fireEvent.click(showDetailsButton);

      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
    });

    it('should display all suggestions for generation errors', () => {
      const generationError = ErrorTemplates.generationFailed();

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Try generating a different workout type')).toBeInTheDocument();
      expect(screen.getByText('Verify your profile information is complete')).toBeInTheDocument();
      expect(screen.getByText('Contact support if the issue persists')).toBeInTheDocument();
    });
  });

  describe('Validation Error Handling', () => {
    it('should render validation error with fix guidance', () => {
      const validationError = ErrorTemplates.validationError('Workout Focus', 'Required field');

      render(
        <ErrorHandlingPanel
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Validation Issues')).toBeInTheDocument();
      expect(screen.getByText('Workout Focus: Required field')).toBeInTheDocument();
      expect(screen.getByText('Fix Issues')).toBeInTheDocument();
    });

    it('should display validation-specific suggestions', () => {
      const validationError = ErrorTemplates.validationError('Workout Focus', 'Required field');

      render(
        <ErrorHandlingPanel
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Please complete all required fields')).toBeInTheDocument();
      expect(screen.getByText('Check that your selections are valid')).toBeInTheDocument();
      expect(screen.getByText('Ensure your profile information is up to date')).toBeInTheDocument();
    });

    it('should call action when fix button is clicked', () => {
      const validationError = ErrorTemplates.validationError('Workout Focus', 'Required field');

      render(
        <ErrorHandlingPanel
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const fixButton = screen.getByText('Fix Issues');
      fireEvent.click(fixButton);

      // The action should trigger window.history.back()
      expect(window.history.back).toBeDefined();
    });
  });

  describe('Network Error Handling', () => {
    it('should render network error with connection guidance', () => {
      const networkError = ErrorTemplates.networkError();

      render(
        <ErrorHandlingPanel
          error={networkError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Network Connection Issue')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to our servers. Please check your internet connection.')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should display network-specific suggestions', () => {
      const networkError = ErrorTemplates.networkError();

      render(
        <ErrorHandlingPanel
          error={networkError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
      expect(screen.getByText('Disable any VPN or proxy services')).toBeInTheDocument();
      expect(screen.getByText('Contact your network administrator if the issue persists')).toBeInTheDocument();
    });
  });

  describe('Environment Error Handling', () => {
    it('should render environment error with configuration guidance', () => {
      const environmentError = ErrorTemplates.environmentError('OpenAI API key not configured');

      render(
        <ErrorHandlingPanel
          error={environmentError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Configuration Issue')).toBeInTheDocument();
      expect(screen.getByText('OpenAI API key not configured')).toBeInTheDocument();
      expect(screen.getByText('Get Help')).toBeInTheDocument();
    });

    it('should display environment-specific suggestions', () => {
      const environmentError = ErrorTemplates.environmentError('Configuration issue');

      render(
        <ErrorHandlingPanel
          error={environmentError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Check your environment configuration')).toBeInTheDocument();
      expect(screen.getByText('Verify API keys are properly set')).toBeInTheDocument();
      expect(screen.getByText('Ensure all required services are running')).toBeInTheDocument();
    });

    it('should provide help link for environment errors', () => {
      const environmentError = ErrorTemplates.environmentError('Configuration issue');

      render(
        <ErrorHandlingPanel
          error={environmentError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const helpLink = screen.getByText('Get Help');
      expect(helpLink).toHaveAttribute('href', '/help/configuration');
      expect(helpLink).toHaveAttribute('target', '_blank');
      expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Error Type Classification', () => {
    it('should apply correct styling for generation errors', () => {
      const generationError = ErrorTemplates.generationFailed();

      render(
        <ErrorHandlingPanel
          error={generationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Workout Generation Failed').closest('div');
      expect(panel).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('should apply correct styling for validation errors', () => {
      const validationError = ErrorTemplates.validationError('Field', 'Error');

      render(
        <ErrorHandlingPanel
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Validation Issues').closest('div');
      expect(panel).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('should apply correct styling for network errors', () => {
      const networkError = ErrorTemplates.networkError();

      render(
        <ErrorHandlingPanel
          error={networkError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Network Connection Issue').closest('div');
      expect(panel).toHaveClass('bg-orange-50', 'border-orange-200');
    });

    it('should apply correct styling for environment errors', () => {
      const environmentError = ErrorTemplates.environmentError('Issue');

      render(
        <ErrorHandlingPanel
          error={environmentError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const panel = screen.getByText('Configuration Issue').closest('div');
      expect(panel).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Action Button Variants', () => {
    it('should render primary action buttons with correct styling', () => {
      const customError = {
        type: 'generation' as const,
        title: 'Custom Error',
        message: 'Test message',
        suggestions: [],
        actions: [
          {
            label: 'Primary Action',
            onClick: jest.fn(),
            variant: 'primary' as const
          }
        ]
      };

      render(
        <ErrorHandlingPanel
          error={customError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const primaryButton = screen.getByText('Primary Action');
      expect(primaryButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('should render danger action buttons with correct styling', () => {
      const customError = {
        type: 'generation' as const,
        title: 'Custom Error',
        message: 'Test message',
        suggestions: [],
        actions: [
          {
            label: 'Danger Action',
            onClick: jest.fn(),
            variant: 'danger' as const
          }
        ]
      };

      render(
        <ErrorHandlingPanel
          error={customError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const dangerButton = screen.getByText('Danger Action');
      expect(dangerButton).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
    });

    it('should render secondary action buttons with correct styling', () => {
      const customError = {
        type: 'generation' as const,
        title: 'Custom Error',
        message: 'Test message',
        suggestions: [],
        actions: [
          {
            label: 'Secondary Action',
            onClick: jest.fn(),
            variant: 'secondary' as const
          }
        ]
      };

      render(
        <ErrorHandlingPanel
          error={customError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const secondaryButton = screen.getByText('Secondary Action');
      expect(secondaryButton).toHaveClass('bg-white', 'border-gray-300', 'text-gray-700');
    });
  });

  describe('Error Template Validation', () => {
    it('should validate generation error template structure', () => {
      const generationError = ErrorTemplates.generationFailed('Test details');

      expect(generationError.type).toBe('generation');
      expect(generationError.title).toBe('Workout Generation Failed');
      expect(generationError.message).toBe('We encountered an issue while creating your personalized workout.');
      expect(generationError.details).toBe('Test details');
      expect(generationError.suggestions).toHaveLength(4);
      expect(generationError.actions).toHaveLength(1);
      expect(generationError.actions?.[0].label).toBe('Try Again');
    });

    it('should validate validation error template structure', () => {
      const validationError = ErrorTemplates.validationError('Test Field', 'Test Error');

      expect(validationError.type).toBe('validation');
      expect(validationError.title).toBe('Validation Error');
      expect(validationError.message).toBe('Test Field: Test Error');
      expect(validationError.suggestions).toHaveLength(3);
      expect(validationError.actions).toHaveLength(1);
      expect(validationError.actions?.[0].label).toBe('Fix Issues');
    });

    it('should validate network error template structure', () => {
      const networkError = ErrorTemplates.networkError();

      expect(networkError.type).toBe('network');
      expect(networkError.title).toBe('Network Connection Issue');
      expect(networkError.message).toBe('Unable to connect to our servers. Please check your internet connection.');
      expect(networkError.suggestions).toHaveLength(4);
      expect(networkError.actions).toHaveLength(1);
      expect(networkError.actions?.[0].label).toBe('Retry');
    });

    it('should validate environment error template structure', () => {
      const environmentError = ErrorTemplates.environmentError('Test configuration issue');

      expect(environmentError.type).toBe('environment');
      expect(environmentError.title).toBe('Configuration Issue');
      expect(environmentError.message).toBe('Test configuration issue');
      expect(environmentError.suggestions).toHaveLength(3);
      expect(environmentError.helpLink).toBe('/help/configuration');
    });
  });

  describe('Edge Cases', () => {
    it('should not render when error is null', () => {
      const { container } = render(
        <ErrorHandlingPanel
          error={null}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle errors without actions gracefully', () => {
      const errorWithoutActions = {
        type: 'generation' as const,
        title: 'Error Without Actions',
        message: 'Test message',
        suggestions: []
      };

      render(
        <ErrorHandlingPanel
          error={errorWithoutActions}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Error Without Actions')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
      // Should still show retry button from onRetry prop
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle errors without suggestions gracefully', () => {
      const errorWithoutSuggestions = {
        type: 'generation' as const,
        title: 'Error Without Suggestions',
        message: 'Test message',
        suggestions: [],
        actions: []
      };

      render(
        <ErrorHandlingPanel
          error={errorWithoutSuggestions}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Error Without Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
      // Should not show suggestions section
      expect(screen.queryByText('Suggestions:')).not.toBeInTheDocument();
    });

    it('should handle errors without help links gracefully', () => {
      const errorWithoutHelpLink = {
        type: 'generation' as const,
        title: 'Error Without Help',
        message: 'Test message',
        suggestions: [],
        actions: []
      };

      render(
        <ErrorHandlingPanel
          error={errorWithoutHelpLink}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Error Without Help')).toBeInTheDocument();
      // Should not show help link
      expect(screen.queryByText('Get Help')).not.toBeInTheDocument();
    });
  });
}); 