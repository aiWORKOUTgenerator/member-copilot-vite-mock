import React, { useState, useEffect } from 'react';
import styles from './AnimatedScore.module.css';

interface AnimatedScoreProps {
  targetScore: number;
  className?: string;
  duration?: number;
}

export const AnimatedScore: React.FC<AnimatedScoreProps> = ({
  targetScore,
  className = '',
  duration = 1500
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = targetScore / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [targetScore, duration]);

  const percentage = Math.round(displayScore * 100);

  return (
    <span className={`${styles.animatedScore} ${className}`}>
      {percentage}%
    </span>
  );
}; 