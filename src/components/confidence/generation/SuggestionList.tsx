import React from 'react';
import styles from './SuggestionList.module.css';

interface Suggestion {
  id: string;
  action: string;
  description: string;
  impact: string;
  estimatedScoreIncrease: number;
  quickFix: boolean;
  category: string;
  timeRequired: string;
  priority: number;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  className?: string;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  className = ''
}) => {
  const sortedSuggestions = suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  const getImpactColor = (increase: number): string => {
    if (increase >= 0.2) return styles.highImpact;
    if (increase >= 0.1) return styles.mediumImpact;
    return styles.lowImpact;
  };

  const getTimeColor = (time: string): string => {
    if (time.includes('quick') || time.includes('immediate')) return styles.quickFix;
    if (time.includes('short')) return styles.shortTerm;
    return styles.longTerm;
  };

  return (
    <div className={`${styles.suggestionList} ${className}`}>
      {sortedSuggestions.map((suggestion) => (
        <div key={suggestion.id} className={styles.suggestionItem}>
          <div className={styles.header}>
            <h6 className={styles.action}>{suggestion.action}</h6>
            {suggestion.quickFix && (
              <span className={styles.quickFixBadge}>Quick Fix</span>
            )}
          </div>
          
          <p className={styles.description}>{suggestion.description}</p>
          
          <div className={styles.metadata}>
            <div className={styles.impact}>
              <span className={styles.label}>Impact:</span>
              <span className={`${styles.value} ${getImpactColor(suggestion.estimatedScoreIncrease)}`}>
                +{Math.round(suggestion.estimatedScoreIncrease * 100)}% score
              </span>
            </div>
            
            <div className={styles.timeRequired}>
              <span className={styles.label}>Time:</span>
              <span className={`${styles.value} ${getTimeColor(suggestion.timeRequired)}`}>
                {suggestion.timeRequired}
              </span>
            </div>
            
            <div className={styles.category}>
              <span className={styles.label}>Category:</span>
              <span className={styles.value}>{suggestion.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 