import React, { useCallback, useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface Section {
  step: number;
  title: string;
  color: string;
  icon?: LucideIcon;
  description?: string;
}

interface SectionNavigationProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  variant?: 'steps' | 'tabs';
  className?: string;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  currentSection,
  onSectionChange,
  variant = 'steps',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if (index < sections.length - 1) {
          onSectionChange(index + 1);
          const nextButton = containerRef.current?.querySelector(`[data-index="${index + 1}"]`) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          onSectionChange(index - 1);
          const prevButton = containerRef.current?.querySelector(`[data-index="${index - 1}"]`) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        onSectionChange(0);
        const firstButton = containerRef.current?.querySelector('[data-index="0"]') as HTMLButtonElement;
        firstButton?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = sections.length - 1;
        onSectionChange(lastIndex);
        const lastButton = containerRef.current?.querySelector(`[data-index="${lastIndex}"]`) as HTMLButtonElement;
        lastButton?.focus();
        break;
    }
  }, [sections.length, onSectionChange]);

  // Scroll active section into view
  useEffect(() => {
    const activeButton = containerRef.current?.querySelector(`[data-index="${currentSection}"]`) as HTMLButtonElement;
    if (activeButton && typeof activeButton.scrollIntoView === 'function') {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentSection]);

  if (variant === 'steps') {
    return (
      <div 
        ref={containerRef}
        className={`flex flex-wrap justify-center gap-3 ${className}`}
        role="tablist"
        aria-label="Profile Steps"
      >
        {sections.map((section, index) => {
          const isActive = index === currentSection;
          const isCompleted = index < currentSection;
          const isDisabled = index > currentSection + 1;

          return (
            <button
              key={section.title}
              onClick={() => !isDisabled && onSectionChange(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 min-w-[200px] ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                  : isCompleted
                  ? 'bg-white text-green-600 hover:bg-gray-50 shadow-md border border-green-200'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md border border-gray-100'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`step-${section.step}-content`}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              data-index={index}
            >
              <span className="sr-only">
                {isCompleted ? 'Completed - ' : ''}
                {isActive ? 'Current Step - ' : ''}
              </span>
              {section.title}
              {section.description && (
                <span className="sr-only"> - {section.description}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex gap-2 overflow-x-auto ${className}`}
      role="tablist"
      aria-label="Navigation Tabs"
    >
      {sections.map((section, index) => {
        const isActive = index === currentSection;
        return (
          <button
            key={section.title}
            onClick={() => onSectionChange(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r text-white shadow-md ' + section.color
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-${section.step}-content`}
            tabIndex={isActive ? 0 : -1}
            data-index={index}
          >
            {section.title}
            {section.description && (
              <span className="sr-only"> - {section.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}; 