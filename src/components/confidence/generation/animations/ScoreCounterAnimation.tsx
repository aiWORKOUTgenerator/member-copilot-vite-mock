import React, { useState, useEffect, useRef } from 'react';
import './ScoreCounterAnimation.css';

interface ScoreCounterAnimationProps {
  targetScore: number;
  duration?: number;
  steps?: number;
  onComplete?: () => void;
  showCelebration?: boolean;
  className?: string;
}

export const ScoreCounterAnimation: React.FC<ScoreCounterAnimationProps> = ({
  targetScore,
  duration = 1500,
  steps = 60,
  onComplete,
  showCelebration = true,
  className = ''
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const animationRef = useRef<number>();
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayScore(0);
    
    const increment = targetScore / steps;
    let current = 0;
    let step = 0;
    
    const animate = () => {
      step++;
      current += increment;
      
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        setIsAnimating(false);
        
        // Trigger celebration for high scores
        if (showCelebration && targetScore >= 0.85) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        onComplete?.();
        return;
      }
      
      setDisplayScore(current);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetScore, duration, steps, onComplete, showCelebration]);

  const percentage = Math.round(displayScore * 100);
  const scoreClass = targetScore >= 0.85 ? 'excellent' : 
                    targetScore >= 0.7 ? 'good' : 
                    targetScore >= 0.5 ? 'warning' : 'poor';

  return (
    <div className={`score-counter-animation ${className}`}>
      <span className={`animated-score ${scoreClass} ${isAnimating ? 'animating' : ''}`}>
        {percentage}%
      </span>
      
      {/* Celebration Confetti */}
      {showConfetti && (
        <div ref={confettiRef} className="confetti-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`confetti-piece confetti-${i % 5}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Pulse Ring for Excellent Scores */}
      {targetScore >= 0.85 && !isAnimating && (
        <div className="pulse-ring" />
      )}
    </div>
  );
}; 