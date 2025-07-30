import React, { useState, useEffect, useRef } from 'react';
import './FactorCardMicroInteractions.css';

interface FactorCardMicroInteractionsProps {
  factor: string;
  score: number;
  status: string;
  isVisible: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const FactorCardMicroInteractions: React.FC<FactorCardMicroInteractionsProps> = ({
  factor,
  score,
  status,
  isVisible,
  isExpanded,
  onToggle,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate progress bar on mount
  useEffect(() => {
    if (isVisible && progressRef.current) {
      const progressBar = progressRef.current;
      progressBar.style.width = '0%';
      
      setTimeout(() => {
        progressBar.style.width = `${Math.round(score * 100)}%`;
      }, 100);
    }
  }, [isVisible, score]);

  // Handle ripple effect
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipplePosition({ x, y });
    setShowRipple(true);
    setIsPressed(true);
    
    setTimeout(() => {
      setShowRipple(false);
      setIsPressed(false);
    }, 600);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!cardRef.current) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setRipplePosition({ x, y });
    setShowRipple(true);
    setIsPressed(true);
    
    setTimeout(() => {
      setShowRipple(false);
      setIsPressed(false);
    }, 600);
  };

  const getFactorIcon = (factor: string): string => {
    const icons: Record<string, string> = {
      goalAlignment: '🎯',
      intensityMatch: '⚡',
      durationFit: '⏱️',
      recoveryRespect: '🛡️',
      equipmentOptimization: '🏋️'
    };
    return icons[factor] || '📊';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      excellent: '#10b981',
      good: '#3b82f6',
      warning: '#f59e0b',
      poor: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div
      ref={cardRef}
      className={`factor-card-micro ${status} ${isVisible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={onToggle}
    >
      {/* Ripple Effect */}
      {showRipple && (
        <div
          className="ripple-effect"
          style={{
            left: ripplePosition.x,
            top: ripplePosition.y,
            backgroundColor: getStatusColor(status)
          }}
        />
      )}

      {/* Card Content */}
      <div className="factor-card-content">
        <div className="factor-header">
          <div className="factor-icon-container">
            <span className="factor-icon">{getFactorIcon(factor)}</span>
            {isHovered && (
              <div className="icon-glow" style={{ backgroundColor: getStatusColor(status) }} />
            )}
          </div>
          
          <div className="factor-info">
            <h5 className="factor-name">{factor.replace(/([A-Z])/g, ' $1').trim()}</h5>
            <div className="factor-score">
              <span className="score-percentage">{Math.round(score * 100)}%</span>
              <span className="score-status">{status}</span>
            </div>
          </div>
          
          <div className="factor-indicator">
            <div className="progress-track">
              <div
                ref={progressRef}
                className="progress-fill"
                style={{ backgroundColor: getStatusColor(status) }}
              />
            </div>
          </div>
          
          <button className="expand-button">
            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        </div>
        
        {/* Expandable Content */}
        <div className={`factor-details ${isExpanded ? 'expanded' : ''}`}>
          {children}
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <div 
          className="hover-glow"
          style={{ 
            background: `radial-gradient(circle, ${getStatusColor(status)}20 0%, transparent 70%)`
          }}
        />
      )}

      {/* Status Indicator */}
      <div className="status-indicator" style={{ backgroundColor: getStatusColor(status) }} />
    </div>
  );
}; 