import React, { useState, useEffect } from 'react';
import { AnimatedScore } from './AnimatedScore';
import { FactorCard } from './FactorCard';
import { InsightMessage } from './InsightMessage';
import { SuggestionList } from './SuggestionList';
import styles from './SelectionAnalysisDisplay.module.css';

interface SelectionAnalysisResult {
  overallScore: number;
  factors: {
    goalAlignment: { score: number; status: string; reasoning: string };
    intensityMatch: { score: number; status: string; reasoning: string };
    durationFit: { score: number; status: string; reasoning: string };
    recoveryRespect: { score: number; status: string; reasoning: string };
    equipmentOptimization: { score: number; status: string; reasoning: string };
  };
  insights: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    factor: string;
    priority: number;
    actionable: boolean;
  }>;
  suggestions: Array<{
    id: string;
    action: string;
    description: string;
    impact: string;
    estimatedScoreIncrease: number;
    quickFix: boolean;
    category: string;
    timeRequired: string;
    priority: number;
  }>;
  educationalContent: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    priority: number;
    learnMoreUrl?: string;
  }>;
}

interface SelectionAnalysisDisplayProps {
  analysis: SelectionAnalysisResult | null;
  analysisProgress: number;
  generationProgress: number;
  isGenerating: boolean;
  className?: string;
}

type DisplayLevel = 'minimal' | 'partial' | 'full';

export const SelectionAnalysisDisplay: React.FC<SelectionAnalysisDisplayProps> = ({
  analysis,
  analysisProgress,
  generationProgress,
  isGenerating,
  className = ''
}) => {
  const [displayLevel, setDisplayLevel] = useState<DisplayLevel>('minimal');
  const [showDetails, setShowDetails] = useState(false);

  // Determine display level based on generation progress
  useEffect(() => {
    if (generationProgress < 30) {
      setDisplayLevel('minimal');
    } else if (generationProgress < 70) {
      setDisplayLevel('partial');
    } else {
      setDisplayLevel('full');
    }
  }, [generationProgress]);

  // Show details when analysis is complete
  useEffect(() => {
    if (analysisProgress >= 100 && analysis) {
      setShowDetails(true);
    }
  }, [analysisProgress, analysis]);

  if (!analysis && analysisProgress < 50) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>
            Analyzing your selections...
            <span className={styles.progressText}>{Math.round(analysisProgress)}%</span>
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.85) return styles.excellent;
    if (score >= 0.7) return styles.good;
    if (score >= 0.5) return styles.warning;
    return styles.poor;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.7) return 'Good';
    if (score >= 0.5) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header with overall score */}
      <div className={styles.header}>
        <div className={styles.scoreSection}>
          <h3 className={styles.title}>Selection Analysis</h3>
          <div className={`${styles.overallScore} ${getScoreColor(analysis.overallScore)}`}>
            <AnimatedScore 
              targetScore={analysis.overallScore} 
              className={styles.scoreNumber}
            />
            <span className={styles.scoreLabel}>
              {getScoreLabel(analysis.overallScore)}
            </span>
          </div>
        </div>
        
        {displayLevel !== 'minimal' && (
          <button
            className={styles.toggleButton}
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Show Less' : 'Show Details'}
          </button>
        )}
      </div>

      {/* Factor breakdown - shown in partial and full modes */}
      {displayLevel !== 'minimal' && (
        <div className={styles.factorsSection}>
          <h4 className={styles.sectionTitle}>Factor Breakdown</h4>
          <div className={styles.factorsGrid}>
            <FactorCard
              title="Goal Alignment"
              factor={analysis.factors.goalAlignment}
              className={getScoreColor(analysis.factors.goalAlignment.score)}
            />
            <FactorCard
              title="Intensity Match"
              factor={analysis.factors.intensityMatch}
              className={getScoreColor(analysis.factors.intensityMatch.score)}
            />
            <FactorCard
              title="Duration Fit"
              factor={analysis.factors.durationFit}
              className={getScoreColor(analysis.factors.durationFit.score)}
            />
            <FactorCard
              title="Recovery Respect"
              factor={analysis.factors.recoveryRespect}
              className={getScoreColor(analysis.factors.recoveryRespect.score)}
            />
            <FactorCard
              title="Equipment Optimization"
              factor={analysis.factors.equipmentOptimization}
              className={getScoreColor(analysis.factors.equipmentOptimization.score)}
            />
          </div>
        </div>
      )}

      {/* Detailed insights and suggestions - shown in full mode */}
      {displayLevel === 'full' && showDetails && (
        <div className={styles.detailsSection}>
          {/* Key Insights */}
          {analysis.insights.length > 0 && (
            <div className={styles.insightsSection}>
              <h4 className={styles.sectionTitle}>Key Insights</h4>
              <div className={styles.insightsList}>
                {analysis.insights
                  .sort((a, b) => b.priority - a.priority)
                  .slice(0, 3)
                  .map((insight) => (
                    <InsightMessage
                      key={insight.id}
                      insight={insight}
                      className={styles.insightItem}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className={styles.suggestionsSection}>
              <h4 className={styles.sectionTitle}>Quick Improvements</h4>
              <SuggestionList
                suggestions={analysis.suggestions}
                className={styles.suggestionsList}
              />
            </div>
          )}

          {/* Educational Content */}
          {analysis.educationalContent.length > 0 && (
            <div className={styles.educationSection}>
              <h4 className={styles.sectionTitle}>Learn More</h4>
              <div className={styles.educationList}>
                {analysis.educationalContent
                  .sort((a, b) => b.priority - a.priority)
                  .slice(0, 2)
                  .map((content) => (
                    <div key={content.id} className={styles.educationItem}>
                      <h5 className={styles.educationTitle}>{content.title}</h5>
                      <p className={styles.educationContent}>{content.content}</p>
                      {content.learnMoreUrl && (
                        <a 
                          href={content.learnMoreUrl}
                          className={styles.learnMoreLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn More →
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator during generation */}
      {isGenerating && (
        <div className={styles.progressIndicator}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className={styles.progressText}>
            Generating your workout... {Math.round(generationProgress)}%
          </p>
        </div>
      )}
    </div>
  );
}; 