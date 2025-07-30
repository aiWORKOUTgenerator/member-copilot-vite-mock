import React, { useState, useCallback } from 'react';
import { 
  Award, 
  Target, 
  Shield, 
  Settings, 
  TrendingUp, 
  HelpCircle,
  ChevronDown,
  Star,
  CheckCircle
} from 'lucide-react';
import { ConfidenceFactorCard } from './ConfidenceFactorCard';
import { ConfidenceTooltip } from './ConfidenceTooltip';

export interface ConfidenceFactors {
  profileMatch: number;
  safetyAlignment: number;
  equipmentFit: number;
  goalAlignment: number;
  structureQuality: number;
}

export interface ConfidenceBreakdownProps {
  confidence: number;
  factors?: ConfidenceFactors;
  showTutorial?: boolean;
  onTutorialComplete?: () => void;
}

export const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({
  confidence,
  factors,
  showTutorial = false,
  onTutorialComplete
}) => {
  // Constants
  const EXCELLENT_THRESHOLD = 0.8;
  const GOOD_THRESHOLD = 0.6;
  const PERCENTAGE_MULTIPLIER = 100;
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('workout-confidence-tutorial') === 'completed';
  });

  // Tutorial steps for first-time users
  const tutorialSteps = [
    {
      title: "Welcome to Your AI Workout!",
      content: "This workout was personalized just for you using AI. Let's learn how to understand your confidence score.",
      icon: <Star className="w-6 h-6 text-yellow-400" />
    },
    {
      title: "Confidence Score Explained",
      content: "The percentage shows how well this workout matches your profile. Higher scores mean better personalization.",
      icon: <Award className="w-6 h-6 text-blue-400" />
    },
    {
      title: "What Affects Your Score",
      content: "Your fitness level, goals, available equipment, and safety considerations all influence the match quality.",
      icon: <Target className="w-6 h-6 text-green-400" />
    },
    {
      title: "You're All Set!",
      content: "You can always expand the details section to see more information about your workout's confidence score.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    }
  ];

  // Show tutorial for first-time users
  React.useEffect(() => {
    if (!hasSeenTutorial && showTutorial && confidence !== undefined) {
      setTutorialStep(0);
    }
  }, [hasSeenTutorial, showTutorial, confidence]);

  const completeTutorial = useCallback(() => {
    setHasSeenTutorial(true);
    localStorage.setItem('workout-confidence-tutorial', 'completed');
    onTutorialComplete?.();
  }, [onTutorialComplete]);

  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  }, [tutorialStep, tutorialSteps.length, completeTutorial]);

  const getConfidenceLevel = useCallback((confidence: number) => {
    if (confidence >= EXCELLENT_THRESHOLD) return { level: 'excellent', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (confidence >= GOOD_THRESHOLD) return { level: 'good', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    return { level: 'needs-review', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  }, [EXCELLENT_THRESHOLD, GOOD_THRESHOLD]);

  const getConfidenceGradient = useCallback((confidence: number) => {
    if (confidence >= EXCELLENT_THRESHOLD) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (confidence >= GOOD_THRESHOLD) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  }, [EXCELLENT_THRESHOLD, GOOD_THRESHOLD]);

  const confidenceLevel = getConfidenceLevel(confidence);
  const confidenceGradient = getConfidenceGradient(confidence);

  // Factor definitions with icons and descriptions
  const factorDefinitions = {
    profileMatch: {
      name: 'Profile Match',
      icon: <Target className="w-4 h-4" />,
      description: 'How well this workout matches your fitness level, experience, and preferences',
      details: [
        'Considers your current fitness level',
        'Matches your workout experience',
        'Aligns with your energy level',
        'Fits your available time'
      ]
    },
    safetyAlignment: {
      name: 'Safety Alignment',
      icon: <Shield className="w-4 h-4" />,
      description: 'How well the workout considers your safety needs and limitations',
      details: [
        'Accounts for any injuries or limitations',
        'Uses appropriate exercise intensity',
        'Includes proper warm-up and cool-down',
        'Considers your health conditions'
      ]
    },
    equipmentFit: {
      name: 'Equipment Fit',
      icon: <Settings className="w-4 h-4" />,
      description: 'How well the workout uses your available equipment',
      details: [
        'Uses equipment you have access to',
        'Provides alternatives when needed',
        'Matches your space limitations',
        'Considers equipment quality'
      ]
    },
    goalAlignment: {
      name: 'Goal Alignment',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'How well the workout supports your fitness goals',
      details: [
        'Targets your specific goals',
        'Uses appropriate exercise types',
        'Provides progressive challenge',
        'Supports long-term progress'
      ]
    },
    structureQuality: {
      name: 'Structure Quality',
      icon: <Award className="w-4 h-4" />,
      description: 'How well-structured and complete the workout is',
      details: [
        'Proper exercise sequencing',
        'Appropriate rest periods',
        'Complete workout phases',
        'Balanced muscle targeting'
      ]
    }
  };

  // Calculate factor weights (equal distribution for now)
  const factorWeights = {
    profileMatch: 0.2,
    safetyAlignment: 0.2,
    equipmentFit: 0.2,
    goalAlignment: 0.2,
    structureQuality: 0.2
  };

  if (!hasSeenTutorial && showTutorial) {
    const currentStep = tutorialSteps[tutorialStep];
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            {currentStep.icon}
            <h3 className="text-xl font-bold mt-4 mb-2">{currentStep.title}</h3>
            <p className="text-gray-600 mb-6">{currentStep.content}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={completeTutorial}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
              <div className="flex gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTutorialStep}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Moderate
        </span>
        <div className="relative group">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Award className="w-4 h-4" />
            <span>{Math.round(confidence * PERCENTAGE_MULTIPLIER)}% match</span>
          </div>
          <ConfidenceTooltip>
            How well this workout matches your preferences
          </ConfidenceTooltip>
        </div>
        <button
          className="p-1 text-white/70 hover:text-white transition-colors"
          title="Learn about confidence scores"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Confidence Details */}
      <details className="mb-6">
        <summary className="cursor-pointer text-white/80 hover:text-white text-sm flex items-center gap-2">
          <span>How is this score calculated?</span>
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 pl-4 border-l-2 border-white/20">
          {/* Overall Confidence Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-24 h-2 bg-white/20 rounded-full">
              <div
                className={`h-2 rounded-full transition-all ${confidenceGradient}`}
                style={{ width: `${confidence * PERCENTAGE_MULTIPLIER}%` }}
              />
            </div>
                          <span className="text-sm font-medium text-white">
                {Math.round(confidence * PERCENTAGE_MULTIPLIER)}% confidence
              </span>
          </div>

          {/* Confidence Level Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${confidenceLevel.bgColor} ${confidenceLevel.color} mb-4`}>
            <Star className="w-4 h-4" />
            {confidenceLevel.level.charAt(0).toUpperCase() + confidenceLevel.level.slice(1)} Match
          </div>

          {/* Factor Breakdown */}
          {factors && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-white mb-3">Factor Breakdown</h5>
              <div className="space-y-3">
                {Object.entries(factors).map(([key, score]) => {
                  const factor = factorDefinitions[key as keyof typeof factorDefinitions];
                  const weight = factorWeights[key as keyof typeof factorWeights];
                  
                  return (
                    <ConfidenceFactorCard
                      key={key}
                      name={factor.name}
                      score={score}
                      weight={weight}
                      description={factor.description}
                      icon={factor.icon}
                      details={factor.details}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Confidence Level Description */}
          <div className="text-sm text-white/80 mb-4">
            {confidenceLevel.level.charAt(0).toUpperCase() + confidenceLevel.level.slice(1)} match - This workout is highly personalized to your profile and preferences.
          </div>
        </div>
      </details>
    </div>
  );
}; 