import React from 'react';
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
  if (variant === 'steps') {
    return (
      <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
        {sections.map((section, index) => {
          const isActive = index === currentSection;

          return (
            <button
              key={section.title}
              onClick={() => onSectionChange(index)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 min-w-[200px] ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md border border-gray-100'
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 overflow-x-auto ${className}`}>
      {sections.map((section, index) => {
        const isActive = index === currentSection;
        return (
          <button
            key={section.title}
            onClick={() => onSectionChange(index)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r text-white shadow-md ' + section.color
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {section.title}
          </button>
        );
      })}
    </div>
  );
}; 