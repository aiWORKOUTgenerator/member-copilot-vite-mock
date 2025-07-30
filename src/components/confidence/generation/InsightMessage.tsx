import React from 'react';
import styles from './InsightMessage.module.css';

interface Insight {
  id: string;
  type: string;
  title: string;
  message: string;
  factor: string;
  priority: number;
  actionable: boolean;
}

interface InsightMessageProps {
  insight: Insight;
  className?: string;
}

export const InsightMessage: React.FC<InsightMessageProps> = ({
  insight,
  className = ''
}) => {
  const getInsightIcon = (type: string): string => {
    switch (type) {
      case 'positive': return '✅';
      case 'warning': return '⚠️';
      case 'improvement': return '💡';
      case 'educational': return '📚';
      default: return 'ℹ️';
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'positive': return styles.positive;
      case 'warning': return styles.warning;
      case 'improvement': return styles.improvement;
      case 'educational': return styles.educational;
      default: return styles.default;
    }
  };

  return (
    <div className={`${styles.insightMessage} ${className} ${getInsightColor(insight.type)}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{getInsightIcon(insight.type)}</span>
        <h6 className={styles.title}>{insight.title}</h6>
        {insight.actionable && (
          <span className={styles.actionableBadge}>Actionable</span>
        )}
      </div>
      
      <p className={styles.message}>{insight.message}</p>
      
      <div className={styles.metadata}>
        <span className={styles.factor}>Factor: {insight.factor}</span>
        <span className={styles.priority}>Priority: {insight.priority}</span>
      </div>
    </div>
  );
}; 