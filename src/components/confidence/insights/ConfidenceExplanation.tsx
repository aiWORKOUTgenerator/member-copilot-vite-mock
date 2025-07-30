import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Info, 
  TrendingUp, 
  Shield, 
  Target, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Award
} from 'lucide-react';
import { ConfidenceFactors } from '../ConfidenceBreakdown';

export interface ConfidenceExplanationProps {
  confidence: number;
  factors?: ConfidenceFactors;
  userProfile?: {
    fitnessLevel?: string;
    experience?: string;
    goals?: string[];
    equipment?: string[];
    injuries?: string[];
    limitations?: string[];
  };
}

export const ConfidenceExplanation: React.FC<ConfidenceExplanationProps> = ({
  confidence,
  factors,
  userProfile
}) => {
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Animate confidence score from 0 to actual value
    const duration = 1500;
    const steps = 60;
    const increment = confidence / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setAnimatedConfidence(confidence);
        clearInterval(timer);
      } else {
        setAnimatedConfidence(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [confidence]);

  const toggleFactor = (factorName: string) => {
    setExpandedFactors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factorName)) {
        newSet.delete(factorName);
      } else {
        newSet.add(factorName);
      }
      return newSet;
    });
  };

  const getFactorIcon = (factorName: string) => {
    switch (factorName) {
      case 'profileMatch': return <Target className="w-5 h-5 text-blue-500" />;
      case 'safetyAlignment': return <Shield className="w-5 h-5 text-green-500" />;
      case 'equipmentFit': return <Settings className="w-5 h-5 text-purple-500" />;
      case 'goalAlignment': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'structureQuality': return <Award className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFactorColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getFactorStatus = (score: number) => {
    if (score >= 0.8) return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Excellent' };
    if (score >= 0.6) return { icon: <Target className="w-4 h-4 text-yellow-500" />, text: 'Good' };
    return { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'Needs Improvement' };
  };

  const getFactorExplanation = (factorName: string, score: number) => {
    const baseExplanations: Record<string, string> = {
      profileMatch: 'How well this workout matches your fitness level, experience, and preferences.',
      safetyAlignment: 'How well the workout considers your injuries, limitations, and safety needs.',
      equipmentFit: 'How well the exercises use your available equipment and space.',
      goalAlignment: 'How well the workout targets your specific fitness goals.',
      structureQuality: 'How well the workout is structured for progression and effectiveness.'
    };

    const baseExplanation = baseExplanations[factorName] || 'This factor measures workout quality and personalization.';
    
    // Add score-specific context
    if (score >= 0.8) {
      return `${baseExplanation} This factor is performing excellently.`;
    } else if (score >= 0.6) {
      return `${baseExplanation} This factor has room for improvement.`;
    } else {
      return `${baseExplanation} This factor needs attention to improve your workout experience.`;
    }
  };

  const getFactorDetails = (factorName: string, score: number) => {
    const baseDetails: Record<string, string[]> = {
      profileMatch: [
        `Matches your ${userProfile?.fitnessLevel || 'fitness'} level`,
        'Considers your workout experience',
        'Aligns with your available time',
        'Fits your energy level preferences'
      ],
      safetyAlignment: [
        'Considers any reported injuries',
        'Accounts for physical limitations',
        'Includes proper warm-up and cool-down',
        'Uses safe exercise progressions'
      ],
      equipmentFit: [
        `Uses your available equipment: ${userProfile?.equipment?.join(', ') || 'none specified'}`,
        'Adapts to your space limitations',
        'Considers equipment quality and condition',
        'Provides alternatives when needed'
      ],
      goalAlignment: [
        `Targets your goals: ${userProfile?.goals?.join(', ') || 'general fitness'}`,
        'Includes appropriate exercise types',
        'Sets realistic progression expectations',
        'Balances different fitness aspects'
      ],
      structureQuality: [
        'Proper exercise sequencing',
        'Appropriate rest periods',
        'Balanced muscle group targeting',
        'Effective time utilization'
      ]
    };

    const details = baseDetails[factorName] || ['Factor analysis complete', 'Quality assessment done'];
    
    // Add score-specific details
    if (score >= 0.8) {
      details.push('✅ This factor is well-optimized for your needs');
    } else if (score >= 0.6) {
      details.push('⚠️ Consider updating your profile for better matching');
    } else {
      details.push('❌ This factor needs immediate attention');
      details.push('💡 Update your profile or preferences to improve this score');
    }
    
    return details;
  };

  if (!factors) {
    return (
      <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-gray-500" />
            <h4 className="font-medium text-gray-900">Confidence Score: {Math.round(animatedConfidence * 100)}%</h4>
          </div>
          <p className="text-gray-600">
            This workout has been personalized based on your profile. Detailed factor breakdown is not available for this workout.
          </p>
        </div>
      </div>
    );
  }

  const factorEntries = Object.entries(factors);
  const sortedFactors = factorEntries.sort(([,a], [,b]) => b - a);

  return (
    <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header with animated confidence score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {Math.round(animatedConfidence * 100)}%
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Confidence Score Breakdown</h4>
              <p className="text-sm text-gray-600">
                How this workout matches your profile and preferences
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(animatedConfidence * 100)}%
            </div>
            <div className="text-sm text-gray-500">Overall Match</div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1500 ease-out shadow-sm"
              style={{ width: `${animatedConfidence * 100}%` }}
            />
          </div>
        </div>

        {/* Factor breakdown with staggered animations */}
        <div className="space-y-4">
          {sortedFactors.map(([factorName, score], index) => {
            const isExpanded = expandedFactors.has(factorName);
            const status = getFactorStatus(score);
            
            return (
              <div
                key={factorName}
                className={`transition-all duration-500 ease-out transform ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${getFactorColor(score)}`}>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleFactor(factorName)}
                  >
                    <div className="flex items-center gap-3">
                      {getFactorIcon(factorName)}
                      <div>
                        <h5 className="font-medium capitalize">
                          {factorName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h5>
                        <p className="text-sm opacity-75">{getFactorExplanation(factorName, score)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{Math.round(score * 100)}%</div>
                        <div className="text-xs opacity-75">{status.text}</div>
                      </div>
                      {status.icon}
                      <div className="transition-transform duration-300">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable details with smooth animation */}
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pt-4 border-t border-current border-opacity-20">
                      <h6 className="font-medium mb-3">Details:</h6>
                      <ul className="space-y-2">
                        {getFactorDetails(factorName, score).map((detail, detailIndex) => (
                          <li 
                            key={detailIndex}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {score < 0.6 && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800">Improvement Needed</span>
                          </div>
                          <p className="text-sm text-red-700">
                            This factor could be improved by updating your profile information or adjusting your preferences.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h5 className="font-medium text-blue-900">How to Improve Your Score</h5>
          </div>
          <p className="text-sm text-blue-800">
            Higher confidence scores mean better workout personalization. Update your profile, 
            add equipment, or adjust preferences to improve your score.
          </p>
        </div>
      </div>
    </div>
  );
}; 