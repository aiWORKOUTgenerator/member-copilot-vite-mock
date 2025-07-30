import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Target, 
  Shield, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Sparkles,
  Trophy,
  Bell
} from 'lucide-react';
import { ConfidenceFactors } from '../ConfidenceBreakdown';

export interface ImprovementSuggestion {
  id: string;
  action: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedScoreIncrease: number;
  quickFix: boolean;
  category: 'profile' | 'safety' | 'equipment' | 'goals' | 'preferences';
  deepLink?: string;
  timeRequired: 'immediate' | '5min' | '15min' | '30min';
  priority: number;
}

export interface ImprovementActionsProps {
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
  onActionClick?: (suggestion: ImprovementSuggestion) => void;
}

export const ImprovementActions: React.FC<ImprovementActionsProps> = ({
  confidence,
  factors,
  userProfile,
  onActionClick
}) => {
  const [showQuickFixes, setShowQuickFixes] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'improvement' | 'tip'>('success');

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Animate confidence score
    const duration = 1200;
    const steps = 50;
    const increment = confidence / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setAnimatedConfidence(confidence);
        clearInterval(timer);
        
        // Show appropriate notification after animation
        setTimeout(() => {
          if (confidence >= 0.9) {
            setNotificationType('success');
            setShowNotification(true);
          } else if (confidence >= 0.7) {
            setNotificationType('tip');
            setShowNotification(true);
          } else {
            setNotificationType('improvement');
            setShowNotification(true);
          }
        }, 500);
      } else {
        setAnimatedConfidence(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [confidence]);

  // Auto-hide notification
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Constants
  const EXCELLENT_THRESHOLD = 0.8;
  const GOOD_THRESHOLD = 0.6;
  const PERCENTAGE_MULTIPLIER = 100;

  const generateSuggestions = (): ImprovementSuggestion[] => {
    const suggestions: ImprovementSuggestion[] = [];

    // Profile-related suggestions
    if (!userProfile?.fitnessLevel) {
      suggestions.push({
        id: 'set-fitness-level',
        action: 'Set your fitness level',
        description: 'Help us understand your current fitness to provide better workouts',
        impact: 'high',
        estimatedScoreIncrease: 0.15,
        quickFix: true,
        category: 'profile',
        deepLink: '/profile/fitness-level',
        timeRequired: '5min',
        priority: 1
      });
    }

    if (!userProfile?.experience) {
      suggestions.push({
        id: 'set-experience',
        action: 'Specify your workout experience',
        description: 'Tell us about your exercise background for better personalization',
        impact: 'high',
        estimatedScoreIncrease: 0.12,
        quickFix: true,
        category: 'profile',
        deepLink: '/profile/experience',
        timeRequired: '5min',
        priority: 2
      });
    }

    // Safety-related suggestions
    if (!userProfile?.injuries?.length && !userProfile?.limitations?.length) {
      suggestions.push({
        id: 'complete-safety-assessment',
        action: 'Complete safety assessment',
        description: 'Report any injuries or limitations for safer workouts',
        impact: 'medium',
        estimatedScoreIncrease: 0.08,
        quickFix: false,
        category: 'safety',
        deepLink: '/profile/safety',
        timeRequired: '15min',
        priority: 3
      });
    }

    // Equipment suggestions
    if (!userProfile?.equipment?.length) {
      suggestions.push({
        id: 'add-equipment',
        action: 'Add your available equipment',
        description: 'List your equipment to get more targeted exercise options',
        impact: 'medium',
        estimatedScoreIncrease: 0.10,
        quickFix: true,
        category: 'equipment',
        deepLink: '/profile/equipment',
        timeRequired: '5min',
        priority: 4
      });
    }

    // Goal-related suggestions
    if (!userProfile?.goals?.length) {
      suggestions.push({
        id: 'set-fitness-goals',
        action: 'Set your fitness goals',
        description: 'Define what you want to achieve for better workout targeting',
        impact: 'high',
        estimatedScoreIncrease: 0.14,
        quickFix: true,
        category: 'goals',
        deepLink: '/profile/goals',
        timeRequired: '15min',
        priority: 5
      });
    }

    // Factor-specific suggestions based on low scores
    if (factors) {
      if (factors.profileMatch < GOOD_THRESHOLD) {
        suggestions.push({
          id: 'improve-profile-match',
          action: 'Update your profile preferences',
          description: 'Your profile could be more specific for better matching',
          impact: 'high',
          estimatedScoreIncrease: 0.18,
          quickFix: false,
          category: 'profile',
          deepLink: '/profile',
          timeRequired: '15min',
          priority: 6
        });
      }

      if (factors.safetyAlignment < GOOD_THRESHOLD) {
        suggestions.push({
          id: 'improve-safety',
          action: 'Review safety considerations',
          description: 'Update your safety profile for better workout safety',
          impact: 'medium',
          estimatedScoreIncrease: 0.12,
          quickFix: false,
          category: 'safety',
          deepLink: '/profile/safety',
          timeRequired: '15min',
          priority: 7
        });
      }

      if (factors.equipmentFit < GOOD_THRESHOLD) {
        suggestions.push({
          id: 'improve-equipment',
          action: 'Optimize equipment preferences',
          description: 'Refine your equipment list for better exercise options',
          impact: 'medium',
          estimatedScoreIncrease: 0.10,
          quickFix: true,
          category: 'equipment',
          deepLink: '/profile/equipment',
          timeRequired: '5min',
          priority: 8
        });
      }

      if (factors.goalAlignment < GOOD_THRESHOLD) {
        suggestions.push({
          id: 'refine-goals',
          action: 'Refine your fitness goals',
          description: 'Make your goals more specific for better targeting',
          impact: 'high',
          estimatedScoreIncrease: 0.16,
          quickFix: false,
          category: 'goals',
          deepLink: '/profile/goals',
          timeRequired: '15min',
          priority: 9
        });
      }
    }

    // Sort by priority (highest first)
    return suggestions.sort((a, b) => a.priority - b.priority);
  };

  const suggestions = generateSuggestions();
  const quickFixes = suggestions.filter(s => s.quickFix);
  const otherActions = suggestions.filter(s => !s.quickFix);

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getImpactIcon = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      default: return <Settings className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTimeIcon = (timeRequired: string) => {
    switch (timeRequired) {
      case 'immediate': return <Zap className="w-4 h-4 text-green-500" />;
      case '5min': return <Clock className="w-4 h-4 text-blue-500" />;
      case '15min': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <Target className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'equipment': return <Settings className="w-4 h-4" />;
      case 'goals': return <TrendingUp className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const handleSuggestionClick = (suggestion: ImprovementSuggestion) => {
    onActionClick?.(suggestion);
    // If no custom handler, open the deep link
    if (suggestion.deepLink && !onActionClick) {
      window.open(suggestion.deepLink, '_blank');
    }
  };

  const getTotalPotentialIncrease = () => {
    return suggestions.reduce((total, suggestion) => total + suggestion.estimatedScoreIncrease, 0);
  };

  if (confidence >= EXCELLENT_THRESHOLD) {
    return (
      <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl relative overflow-hidden">
          {/* Success notification */}
          {showNotification && (
            <div className="absolute top-4 right-4 animate-bounce">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Excellent!
              </div>
            </div>
          )}
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Excellent Confidence Score!</h3>
                <p className="text-sm text-green-600">You're all set for success</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {Math.round(animatedConfidence * 100)}%
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1500 ease-out shadow-sm"
                  style={{ width: `${animatedConfidence * 100}%` }}
                />
              </div>
            </div>
            
            <p className="text-green-700 mb-4 leading-relaxed">
              This workout is highly personalized to your profile and preferences. 
              You can proceed with confidence knowing it's tailored just for you!
            </p>
            
            <div className="bg-white/50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Pro Tips</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Keep your profile updated as your fitness journey evolves</li>
                <li>• Track your progress to see confidence improvements over time</li>
                <li>• Share your success with friends and family</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Success/Improvement Notification */}
      {showNotification && (
        <div className={`p-4 rounded-xl border shadow-lg transition-all duration-500 ease-out transform ${
          notificationType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : notificationType === 'tip'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-3">
            {notificationType === 'success' ? (
              <Trophy className="w-5 h-5 text-green-600" />
            ) : notificationType === 'tip' ? (
              <Lightbulb className="w-5 h-5 text-blue-600" />
            ) : (
              <Bell className="w-5 h-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {notificationType === 'success' 
                  ? 'Great match! This workout is tailored for you'
                  : notificationType === 'tip'
                  ? 'Good workout match - here are some tips'
                  : 'Try these improvements for better results'
                }
              </div>
              <div className="text-sm opacity-75">
                {notificationType === 'success' 
                  ? 'Your profile is well-configured for personalized workouts'
                  : notificationType === 'tip'
                  ? 'Small updates can make a big difference'
                  : 'These suggestions will help improve your experience'
                }
              </div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header with animated confidence score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Improve Your Confidence Score</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(animatedConfidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              Potential increase: +{Math.round(getTotalPotentialIncrease() * PERCENTAGE_MULTIPLIER)}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={showQuickFixes}
              onChange={(e) => setShowQuickFixes(e.target.checked)}
              className="rounded transition-colors group-hover:ring-2 group-hover:ring-blue-200"
            />
            <span className="group-hover:text-blue-600 transition-colors">Quick fixes only</span>
          </label>
        </div>
      </div>

      {/* Progress bar animation */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1500 ease-out shadow-sm"
          style={{ width: `${animatedConfidence * 100}%` }}
        />
      </div>

      {/* Quick Fixes */}
      {showQuickFixes && quickFixes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Quick Fixes (5 minutes or less)</h4>
          </div>
          
          <div className="grid gap-3">
            {quickFixes.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${getImpactColor(suggestion.impact)}`}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? 'slideInUp 0.5s ease-out forwards' : 'none'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="transition-transform duration-200 group-hover:scale-110">
                        {getImpactIcon(suggestion.impact)}
                      </div>
                      <h5 className="font-medium group-hover:text-blue-700 transition-colors">{suggestion.action}</h5>
                      <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium shadow-sm">
                        +{Math.round(suggestion.estimatedScoreIncrease * PERCENTAGE_MULTIPLIER)}%
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2 leading-relaxed">{suggestion.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        {getTimeIcon(suggestion.timeRequired)}
                        <span className="font-medium">{suggestion.timeRequired}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(suggestion.category)}
                        <span className="capitalize font-medium">{suggestion.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Actions */}
      {otherActions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Additional Improvements</h4>
          </div>
          
          <div className="grid gap-3">
            {otherActions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${getImpactColor(suggestion.impact)}`}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ 
                  animationDelay: `${(quickFixes.length + index) * 100}ms`,
                  animation: isVisible ? 'slideInUp 0.5s ease-out forwards' : 'none'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="transition-transform duration-200 group-hover:scale-110">
                        {getImpactIcon(suggestion.impact)}
                      </div>
                      <h5 className="font-medium group-hover:text-blue-700 transition-colors">{suggestion.action}</h5>
                      <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium shadow-sm">
                        +{Math.round(suggestion.estimatedScoreIncrease * PERCENTAGE_MULTIPLIER)}%
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2 leading-relaxed">{suggestion.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        {getTimeIcon(suggestion.timeRequired)}
                        <span className="font-medium">{suggestion.timeRequired}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(suggestion.category)}
                        <span className="capitalize font-medium">{suggestion.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No suggestions */}
      {suggestions.length === 0 && (
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-green-900 mb-2">Profile Complete!</h4>
            <p className="text-green-700 leading-relaxed">
              Your profile is well-configured. The confidence score reflects the best possible match with your current preferences.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-300 rounded-full translate-y-8 -translate-x-8"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Pro Tips</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Start with quick fixes for immediate improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Complete your safety assessment for better workout safety</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Update your profile regularly as your fitness journey evolves</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>More specific goals lead to better workout targeting</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 