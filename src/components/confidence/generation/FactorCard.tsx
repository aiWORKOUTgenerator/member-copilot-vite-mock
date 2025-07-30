import React from 'react';
import styles from './FactorCard.module.css';

interface FactorData {
  score: number;
  status: string;
  reasoning: string;
}

interface FactorCardProps {
  title: string;
  factor: FactorData;
  className?: string;
}

export const FactorCard: React.FC<FactorCardProps> = ({
  title,
  factor,
  className = ''
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return styles.excellent;
      case 'good': return styles.good;
      case 'warning': return styles.warning;
      case 'poor': return styles.poor;
      default: return styles.default;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'excellent': return '⭐';
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'poor': return '❌';
      default: return '•';
    }
  };

  return (
    <div className={`${styles.factorCard} ${className} ${getStatusColor(factor.status)}`}>
      <div className={styles.header}>
        <h5 className={styles.title}>{title}</h5>
        <span className={styles.statusIcon}>{getStatusIcon(factor.status)}</span>
      </div>
      
      <div className={styles.scoreSection}>
        <div className={styles.scoreBar}>
          <div 
            className={styles.scoreFill}
            style={{ width: `${factor.score * 100}%` }}
          />
        </div>
        <span className={styles.scoreText}>
          {Math.round(factor.score * 100)}%
        </span>
      </div>
      
      <p className={styles.reasoning}>{factor.reasoning}</p>
    </div>
  );
}; 