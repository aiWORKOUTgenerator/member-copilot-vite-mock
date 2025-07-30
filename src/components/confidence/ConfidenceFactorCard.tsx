import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { ReactNode } from 'react';

export interface FactorCardProps {
  name: string;
  score: number;
  weight: number;
  description: string;
  icon: ReactNode;
  details: string[];
  improvements?: string[];
}

export const ConfidenceFactorCard: React.FC<FactorCardProps> = ({
  name,
  score,
  weight,
  description,
  icon,
  details,
  improvements
}) => {
  // Constants
  const EXCELLENT_THRESHOLD = 0.8;
  const GOOD_THRESHOLD = 0.6;
  const PERCENTAGE_MULTIPLIER = 100;
  
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= EXCELLENT_THRESHOLD) return 'text-green-400';
    if (score >= GOOD_THRESHOLD) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= EXCELLENT_THRESHOLD) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= GOOD_THRESHOLD) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= EXCELLENT_THRESHOLD) return 'Excellent';
    if (score >= GOOD_THRESHOLD) return 'Good';
    return 'Needs Improvement';
  };

  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="bg-white/10 rounded-lg p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-white/80">{icon}</div>
          <span className="text-sm font-medium text-white">{name}</span>
          <div className="relative group">
            <Info className="w-3 h-3 text-white/60 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${scoreColor}`}>
            {Math.round(score * PERCENTAGE_MULTIPLIER)}%
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${scoreGradient}`}
            style={{ width: `${score * PERCENTAGE_MULTIPLIER}%` }}
          />
        </div>
                  <span className="text-xs text-white/60">
            {Math.round(weight * PERCENTAGE_MULTIPLIER)}% weight
          </span>
      </div>

      {/* Score Label */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${scoreColor}`}>
          {scoreLabel}
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/20">
          {/* Details */}
          <div className="mb-3">
            <h6 className="text-xs font-medium text-white/80 mb-2">What this measures:</h6>
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-xs text-white/70 flex items-start gap-2">
                  <span className="w-1 h-1 bg-white/40 rounded-full mt-1.5 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          {improvements && improvements.length > 0 && (
            <div>
              <h6 className="text-xs font-medium text-white/80 mb-2">Suggestions for improvement:</h6>
              <ul className="space-y-1">
                {improvements.map((improvement, index) => (
                  <li key={index} className="text-xs text-yellow-300 flex items-start gap-2">
                    <span className="w-1 h-1 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No improvements needed */}
          {score >= EXCELLENT_THRESHOLD && (
            <div className="text-xs text-green-300 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-400 rounded-full" />
              This factor is well-aligned with your profile
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 