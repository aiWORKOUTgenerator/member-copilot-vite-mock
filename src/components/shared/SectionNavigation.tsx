import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Section {
  step: number;
  title: string;
  color: string;
  progress?: number;
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
      <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
        {sections.map((section, index) => {
          const isActive = index === currentSection;
          const isCompleted = section.progress === 100;
          const isPending = index > currentSection;

          return (
            <button
              key={section.title}
              onClick={() => onSectionChange(index)}
              className={`flex-1 relative p-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r shadow-lg scale-105 text-white ' + section.color
                  : isCompleted
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isActive
                      ? 'bg-white bg-opacity-20 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {section.step}
                </div>
                <div className="text-left">
                  <div
                    className={`font-medium ${
                      isActive ? 'text-white' : isCompleted ? 'text-green-700' : 'text-gray-900'
                    }`}
                  >
                    {section.title}
                  </div>
                  {section.description && (
                    <div
                      className={`text-sm ${
                        isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                      }`}
                    >
                      {section.description}
                    </div>
                  )}
                </div>
              </div>
              {section.progress !== undefined && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-white bg-opacity-50'
                        : isCompleted
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
              )}
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