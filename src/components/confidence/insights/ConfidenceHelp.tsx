import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Target, 
  Shield, 
  Settings, 
  TrendingUp, 
  Award,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface ConfidenceHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfidenceHelp: React.FC<ConfidenceHelpProps> = ({
  isOpen,
  onClose
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  if (!isOpen) return null;

  const helpSections: HelpSection[] = [
    {
      id: 'overview',
      title: 'What is a Confidence Score?',
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your confidence score is a personalized rating that shows how well a workout matches your profile, 
            preferences, and goals. It's calculated by analyzing five key factors that determine workout quality and safety.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Score Ranges:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">90-100%:</span> Excellent match - Highly personalized
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">70-89%:</span> Good match - Well-suited with minor adjustments
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Below 70%:</span> Needs improvement - Consider updating preferences
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'factors',
      title: 'Understanding the Five Factors',
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">Profile Match (20% weight)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                How well the workout aligns with your fitness level, experience, and preferences.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Considers:</strong> Fitness level, workout experience, energy preferences, time availability
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-gray-900">Safety Alignment (20% weight)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                How well the workout considers your safety needs and limitations.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Considers:</strong> Injuries, physical limitations, experience level, health conditions
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-gray-900">Equipment Fit (20% weight)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                How well the workout uses your available equipment and space.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Considers:</strong> Available equipment, space constraints, equipment quality, alternatives
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-gray-900">Goal Alignment (20% weight)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                How well the workout supports your fitness goals and progression.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Considers:</strong> Primary goals, exercise types, progression patterns, long-term objectives
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h4 className="font-medium text-gray-900">Structure Quality (20% weight)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                How well-structured and complete the workout is.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Considers:</strong> Exercise balance, progression logic, rest periods, muscle targeting
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'improving',
      title: 'How to Improve Your Score',
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Quick Wins (5 minutes or less)</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Set your fitness level and experience</li>
              <li>• Add your available equipment</li>
              <li>• Specify your primary fitness goals</li>
              <li>• Update your energy preferences</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Deeper Improvements (10-15 minutes)</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete the safety assessment</li>
              <li>• Add specific injury or limitation details</li>
              <li>• Refine your fitness goals with specifics</li>
              <li>• Update equipment quality preferences</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Best Practices</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Be honest about your current fitness level</li>
              <li>• Report all injuries and limitations</li>
              <li>• Update your profile as you progress</li>
              <li>• Be specific about your goals</li>
              <li>• List all available equipment accurately</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Real Examples',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Example 1: High Confidence (95%)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Profile:</strong> Intermediate level, 2 years experience, goal: strength building</p>
              <p><strong>Equipment:</strong> Full home gym with barbell, rack, weights</p>
              <p><strong>Safety:</strong> No injuries, good form knowledge</p>
              <p><strong>Result:</strong> Workout perfectly matches profile and goals</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Example 2: Medium Confidence (75%)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Profile:</strong> Beginner level, limited experience, goal: weight loss</p>
              <p><strong>Equipment:</strong> Basic home setup (dumbbells, resistance bands)</p>
              <p><strong>Safety:</strong> Minor knee issue reported</p>
              <p><strong>Result:</strong> Good match but could be improved with more specific goals</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Example 3: Low Confidence (60%)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Profile:</strong> Incomplete profile, no experience specified</p>
              <p><strong>Equipment:</strong> No equipment listed</p>
              <p><strong>Safety:</strong> No safety assessment completed</p>
              <p><strong>Result:</strong> Workout generated with limited personalization</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <HelpCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-3">
              <h4 className="font-medium text-gray-900 mb-2">Why is my confidence score low?</h4>
              <p className="text-sm text-gray-600">
                Low scores usually indicate incomplete profile information or mismatches between your preferences and the generated workout. 
                Check the improvement suggestions for specific actions to take.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <h4 className="font-medium text-gray-900 mb-2">Can I still do a workout with a low confidence score?</h4>
              <p className="text-sm text-gray-600">
                Yes, but we recommend reviewing the workout carefully and considering the improvement suggestions. 
                Lower scores may indicate the workout needs modifications for your specific situation.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <h4 className="font-medium text-gray-900 mb-2">How often should I update my profile?</h4>
              <p className="text-sm text-gray-600">
                Update your profile whenever your fitness level, goals, equipment, or health status changes. 
                Regular updates ensure consistently high confidence scores.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <h4 className="font-medium text-gray-900 mb-2">What if I don't have the suggested equipment?</h4>
              <p className="text-sm text-gray-600">
                Update your equipment list to reflect what you actually have. The system will provide alternatives 
                or modify exercises to work with your available equipment.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">How accurate are the confidence scores?</h4>
              <p className="text-sm text-gray-600">
                Confidence scores are based on your profile data and workout analysis. More complete and accurate 
                profile information leads to more reliable scores. The system learns and improves over time.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Confidence Score Help</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {helpSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    expandedSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  {expandedSection === section.id ? (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {helpSections.map((section) => (
              <div
                key={section.id}
                className={`transition-all duration-300 ${
                  expandedSection === section.id ? 'block' : 'hidden'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  {section.icon}
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                </div>
                {section.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 