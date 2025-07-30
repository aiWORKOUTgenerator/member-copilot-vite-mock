import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionAnalysisDisplay } from '../SelectionAnalysisDisplay';

// Mock the child components
jest.mock('../FactorCard', () => ({
  FactorCard: ({ factor, data, isVisible }: any) => (
    <div data-testid={`factor-card-${factor}`} className={isVisible ? 'visible' : 'hidden'}>
      {factor}: {data.score}
    </div>
  )
}));

jest.mock('../InsightMessage', () => ({
  InsightMessage: ({ insight, isVisible }: any) => (
    <div data-testid={`insight-${insight.id}`} className={isVisible ? 'visible' : 'hidden'}>
      {insight.title}
    </div>
  )
}));

jest.mock('../SuggestionList', () => ({
  SuggestionList: ({ suggestions, isVisible }: any) => (
    <div data-testid="suggestion-list" className={isVisible ? 'visible' : 'hidden'}>
      {suggestions.length} suggestions
    </div>
  )
}));

jest.mock('../AnimatedScore', () => ({
  AnimatedScore: ({ targetScore }: any) => (
    <span data-testid="animated-score">{Math.round(targetScore * 100)}%</span>
  )
}));

const mockAnalysis = {
  overallScore: 0.85,
  factors: {
    goalAlignment: { score: 0.9, status: 'excellent', reasoning: 'Great alignment' },
    intensityMatch: { score: 0.8, status: 'good', reasoning: 'Good match' },
    durationFit: { score: 0.7, status: 'good', reasoning: 'Fits well' },
    recoveryRespect: { score: 0.9, status: 'excellent', reasoning: 'Respects recovery' },
    equipmentOptimization: { score: 0.8, status: 'good', reasoning: 'Optimized' }
  },
  insights: [
    {
      id: 'insight-1',
      type: 'positive',
      title: 'Excellent Selections!',
      message: 'Your workout selections are perfectly aligned.',
      factor: 'overall',
      priority: 1,
      actionable: false
    },
    {
      id: 'insight-2',
      type: 'suggestion',
      title: 'Consider Equipment',
      message: 'You could optimize your equipment usage.',
      factor: 'equipmentOptimization',
      priority: 2,
      actionable: true
    }
  ],
  suggestions: [
    {
      id: 'suggestion-1',
      action: 'Try different equipment',
      description: 'Consider using more of your available equipment',
      impact: 'medium',
      estimatedScoreIncrease: 0.1,
      quickFix: true,
      category: 'equipment',
      timeRequired: '5min',
      priority: 1
    }
  ],
  educationalContent: [
    {
      id: 'edu-1',
      title: 'Understanding Workout Selection',
      content: 'Learn how your choices impact workout effectiveness.',
      category: 'selection',
      priority: 1
    }
  ]
};

describe('SelectionAnalysisDisplay', () => {
  const defaultProps = {
    analysis: null,
    analysisProgress: 0,
    generationProgress: 0,
    isGenerating: false
  };

  it('renders nothing when no analysis and not generating', () => {
    const { container } = render(<SelectionAnalysisDisplay {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when generating without analysis', () => {
    render(<SelectionAnalysisDisplay {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByText('Analyzing Your Selections...')).toBeInTheDocument();
    expect(screen.getByText('Analyzing your workout selections...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows analysis results when available', () => {
    render(<SelectionAnalysisDisplay {...defaultProps} analysis={mockAnalysis} />);
    
    expect(screen.getByText('Selection Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('animated-score')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows progress indicator when generating with progress', () => {
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        isGenerating={true}
        analysisProgress={50}
      />
    );
    
    expect(screen.getByText('Checking intensity match...')).toBeInTheDocument();
  });

  it('displays factors in partial mode (30-70% generation progress)', () => {
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={50}
      />
    );
    
    // Should show first 3 factors in partial mode
    expect(screen.getByTestId('factor-card-goalAlignment')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-intensityMatch')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-durationFit')).toBeInTheDocument();
    
    // Should not show last 2 factors in partial mode
    expect(screen.queryByTestId('factor-card-recoveryRespect')).not.toBeInTheDocument();
    expect(screen.queryByTestId('factor-card-equipmentOptimization')).not.toBeInTheDocument();
  });

  it('displays all factors in full mode (70%+ generation progress)', () => {
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={80}
      />
    );
    
    // Should show all factors in full mode
    expect(screen.getByTestId('factor-card-goalAlignment')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-intensityMatch')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-durationFit')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-recoveryRespect')).toBeInTheDocument();
    expect(screen.getByTestId('factor-card-equipmentOptimization')).toBeInTheDocument();
  });

  it('shows limited insights in minimal mode', () => {
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={20}
      />
    );
    
    // Should show only 1 insight in minimal mode
    expect(screen.getByTestId('insight-insight-1')).toBeInTheDocument();
    expect(screen.queryByTestId('insight-insight-2')).not.toBeInTheDocument();
  });

  it('shows more insights in partial mode', () => {
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={50}
      />
    );
    
    // Should show 2 insights in partial mode
    expect(screen.getByTestId('insight-insight-1')).toBeInTheDocument();
    expect(screen.getByTestId('insight-insight-2')).toBeInTheDocument();
  });

  it('shows suggestions only in full mode', () => {
    // Should not show suggestions in minimal mode
    const { rerender } = render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={20}
      />
    );
    
    expect(screen.queryByTestId('suggestion-list')).not.toBeInTheDocument();
    
    // Should show suggestions in full mode
    rerender(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={80}
      />
    );
    
    expect(screen.getByTestId('suggestion-list')).toBeInTheDocument();
    expect(screen.getByText('1 suggestions')).toBeInTheDocument();
  });

  it('shows educational content only in full mode', () => {
    // Should not show educational content in minimal mode
    const { rerender } = render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={20}
      />
    );
    
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
    
    // Should show educational content in full mode
    rerender(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        generationProgress={80}
      />
    );
    
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    expect(screen.getByText('Understanding Workout Selection')).toBeInTheDocument();
  });

  it('handles empty analysis data gracefully', () => {
    const emptyAnalysis = {
      ...mockAnalysis,
      insights: [],
      suggestions: [],
      educationalContent: []
    };
    
    render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={emptyAnalysis}
        generationProgress={80}
      />
    );
    
    expect(screen.getByText('Selection Analysis')).toBeInTheDocument();
    expect(screen.queryByText('Key Insights')).not.toBeInTheDocument();
    expect(screen.queryByText('Improvement Suggestions')).not.toBeInTheDocument();
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for visibility', () => {
    const { container } = render(
      <SelectionAnalysisDisplay 
        {...defaultProps} 
        analysis={mockAnalysis}
        analysisProgress={100}
      />
    );
    
    const displayElement = container.firstChild as HTMLElement;
    expect(displayElement).toHaveClass('selection-analysis-display', 'visible');
  });
}); 