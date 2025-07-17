import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
  showIcon?: boolean;
  iconClassName?: string;
  'aria-label'?: string;
}

// Standard delay for all tooltips
const TOOLTIP_DELAY = 1000;

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'bottom',
  delay = TOOLTIP_DELAY,
  className = '',
  maxWidth = 'max-w-md',
  showIcon = false,
  iconClassName = 'w-4 h-4 text-gray-400 hover:text-gray-600',
  'aria-label': ariaLabel
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip becomes visible
      setTimeout(() => calculatePosition(), 0);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let newPosition = position;

    // Check if tooltip goes outside viewport and adjust position
    // Use larger margins for landscape layout and prefer top/bottom for better landscape utilization
    const margin = 20;
    
    switch (position) {
      case 'top':
        if (rect.top - tooltipRect.height < margin) {
          newPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (rect.bottom + tooltipRect.height > viewport.height - margin) {
          newPosition = 'top';
        }
        break;
      case 'left':
        if (rect.left - tooltipRect.width < margin) {
          // Prefer top/bottom over right for better landscape layout
          newPosition = rect.top > viewport.height / 2 ? 'top' : 'bottom';
        }
        break;
      case 'right':
        if (rect.right + tooltipRect.width > viewport.width - margin) {
          // Prefer top/bottom over left for better landscape layout
          newPosition = rect.top > viewport.height / 2 ? 'top' : 'bottom';
        }
        break;
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    // Handle touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      const handleTouchStart = (e: TouchEvent) => {
        const target = e.target as Node;
        if (triggerRef.current?.contains(target)) {
          e.preventDefault();
          if (isVisible) {
            hideTooltip();
          } else {
            showTooltip();
          }
        } else if (isVisible && !tooltipRef.current?.contains(target)) {
          hideTooltip();
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl shadow-xl pointer-events-none transition-all duration-200 ease-in-out whitespace-normal leading-relaxed min-w-[200px] text-center';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-3`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-3`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-3`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-3`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-3`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1`;
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  // If showIcon is true, render just an info icon with tooltip
  if (showIcon) {
    return (
      <div className="relative inline-block">
        <div
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className="cursor-help inline-block"
          tabIndex={0}
          role="button"
          aria-label={ariaLabel || "More information"}
          aria-describedby={isVisible ? tooltipId.current : undefined}
        >
          <Info className={iconClassName} />
        </div>
        
        {isVisible && (
          <div
            ref={tooltipRef}
            id={tooltipId.current}
            className={`${getPositionClasses()} ${maxWidth} ${className}`}
            style={{
              opacity: isVisible ? 1 : 0,
              visibility: isVisible ? 'visible' : 'hidden'
            }}
            role="tooltip"
            aria-hidden={!isVisible}
          >
            <div className={getArrowClasses()}></div>
            {content}
          </div>
        )}
      </div>
    );
  }

  // Default behavior: wrap children with tooltip
  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="cursor-help"
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        aria-describedby={isVisible ? tooltipId.current : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId.current}
          className={`${getPositionClasses()} ${maxWidth} ${className}`}
          style={{
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? 'visible' : 'hidden'
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <div className={getArrowClasses()}></div>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 