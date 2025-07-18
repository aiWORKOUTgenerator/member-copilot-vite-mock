import React, { useState, useMemo, useCallback } from 'react';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, ArrowRight, Settings } from 'lucide-react';
import { 
  OptionDefinition, 
  RatingScaleConfig, 
  CustomizationComponentProps,
  CustomizationConfig,
  UserProfile,
  PerWorkoutOptions,
  ValidationResult
} from '../../types/enhanced-workout-types';
import { AIRecommendationContext } from '../../types/ai';

// ============================================================================
// ENHANCED OPTION GRID - Eliminates 60% of repetitive code
// ============================================================================

interface OptionGridProps<T> {
  options: OptionDefinition<T>[];
  selected: T | T[];
  onSelect: (value: T) => void;
  multi?: boolean;
  columns?: { base: number; sm?: number; md?: number; lg?: number };
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  userProfile?: UserProfile;
  currentOptions?: Partial<PerWorkoutOptions>;
  aiRecommendations?: string[];
  onAIRecommendationApply?: (recommendation: string) => void;
  className?: string;
}

export function OptionGrid<T>({
  options,
  selected,
  onSelect,
  multi = false,
  columns = { base: 1, sm: 2, md: 3 },
  size = 'md',
  disabled = false,
  error,
  userProfile,
  currentOptions = {},
  aiRecommendations = [],
  onAIRecommendationApply,
  className = ''
}: OptionGridProps<T>) {
  const [hoveredOption, setHoveredOption] = useState<T | null>(null);
  
  // AI-enhanced option filtering and recommendation
  const enhancedOptions = useMemo(() => {
    return options.map(opt => {
      // Conditional rendering based on user profile
      const shouldShow = !opt.showIf || (userProfile && opt.showIf(userProfile, currentOptions));
      
      // AI recommendation matching
      const aiRecommended = aiRecommendations.some(rec => 
        rec.toLowerCase().includes(String(opt.value).toLowerCase()) ||
        rec.toLowerCase().includes(opt.label.toLowerCase())
      );
      
      return {
        ...opt,
        shouldShow,
        aiRecommended,
        userAligned: true // Could be enhanced with user preference analysis
      };
    }).filter(opt => opt.shouldShow);
  }, [options, userProfile, currentOptions, aiRecommendations]);

  // Dynamic grid classes
  const gridClasses = useMemo(() => {
    const baseClass = 'grid gap-3';
    const colClasses = [];
    
    colClasses.push(`grid-cols-${columns.base}`);
    if (columns.sm) colClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) colClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) colClasses.push(`lg:grid-cols-${columns.lg}`);
    
    return `${baseClass} ${colClasses.join(' ')} ${className}`;
  }, [columns, className]);

  // Size-specific styling
  const sizeClasses = useMemo(() => {
    const sizeMap = {
      sm: 'p-3 text-sm min-h-[3rem]',
      md: 'p-4 text-base min-h-[4rem]',
      lg: 'p-6 text-lg min-h-[5rem]'
    };
    return sizeMap[size];
  }, [size]);

  const handleOptionSelect = useCallback((value: T) => {
    if (disabled) return;
    onSelect(value);
  }, [disabled, onSelect]);

  return (
    <div className="option-grid-container">
      {/* AI Recommendations Panel */}
      {aiRecommendations.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">AI Recommendations</h4>
              <div className="space-y-2">
                {aiRecommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">{rec}</span>
                    {onAIRecommendationApply && (
                      <button
                        onClick={() => onAIRecommendationApply(rec)}
                        className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Option Grid */}
      <div className={gridClasses}>
        {enhancedOptions.map((opt, index) => {
          const isSelected = multi 
            ? Array.isArray(selected) && selected.includes(opt.value)
            : selected === opt.value;
          
          const isHovered = hoveredOption === opt.value;
          
          return (
            <button
              key={`${String(opt.value)}-${index}`}
              onClick={() => handleOptionSelect(opt.value)}
              onMouseEnter={() => setHoveredOption(opt.value)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={disabled || opt.disabled}
              className={`
                relative rounded-xl border-2 transition-all duration-300 text-left
                ${sizeClasses}
                ${isSelected 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                }
                ${opt.aiRecommended ? 'ring-2 ring-green-200' : ''}
                ${disabled || opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isHovered ? 'shadow-lg' : ''}
                ${error ? 'border-red-300' : ''}
              `}
              aria-pressed={isSelected}
              aria-describedby={opt.description ? `${String(opt.value)}-desc` : undefined}
            >
              {/* AI Recommendation Badge */}
              {opt.aiRecommended && (
                <div className="absolute top-2 right-2">
                  <Lightbulb className="w-4 h-4 text-green-500" />
                </div>
              )}
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
              )}
              
              {/* Option Content */}
              <div className={`flex items-start ${isSelected || opt.aiRecommended ? 'mt-1' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {opt.metadata?.icon && (
                      <opt.metadata.icon className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="font-semibold text-gray-900">{opt.label}</span>
                    {opt.metadata?.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {opt.metadata.badge}
                      </span>
                    )}
                  </div>
                  
                  {opt.sublabel && (
                    <div className="text-xs text-gray-500 mb-1">{opt.sublabel}</div>
                  )}
                  
                  {opt.description && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {opt.description}
                    </div>
                  )}
                  
                  {/* Difficulty Badge */}
                  {opt.metadata?.difficulty && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        opt.metadata.difficulty === 'new to exercise' ? 'bg-green-100 text-green-800' :
                        opt.metadata.difficulty === 'some experience' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {opt.metadata.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover Effect Overlay */}
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AI-ENHANCED RATING SCALE - Intelligent insights and recommendations
// ============================================================================

interface RatingScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  config: RatingScaleConfig;
  disabled?: boolean;
  error?: string;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  onAIInsight?: (insight: string) => void;
  className?: string;
}

export function RatingScale({ 
  value, 
  onChange, 
  config, 
  disabled = false,
  error,
  userProfile,
  aiContext,
  onAIInsight,
  className = ''
}: RatingScaleProps) {
  const { min, max, labels, size = 'md', orientation = 'horizontal', showLabels = true, showValue = true } = config;
  const [aiInsights, setAIInsights] = useState<string[]>([]);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  // Generate contextual insights based on rating
  const generateRatingInsights = useCallback((rating: number) => {
    // Use custom generateInsights function from aiContext if available
    if (aiContext?.generateInsights) {
      const customInsights = aiContext.generateInsights(rating);
      return customInsights.map((insight: { message: string }) => insight.message);
    }
    
    // Fallback to generic insights using the actual rating context
    const insights: string[] = [];
    const ratingContext = labels.low.toLowerCase();
    
    // Low rating insights
    if (rating <= 2) {
      insights.push(`Low ${ratingContext} may impact workout performance`);
      
      // Cross-component analysis
      if (aiContext?.currentSelections.customization_duration) {
        const duration = typeof aiContext.currentSelections.customization_duration === 'number'
          ? aiContext.currentSelections.customization_duration
          : aiContext.currentSelections.customization_duration?.totalDuration;
          
        if (duration && duration > 45) {
          insights.push('Consider reducing workout duration to match your current state');
        }
      }
      
      // User profile analysis
      if (userProfile?.fitnessLevel === 'new to exercise') {
        insights.push('This is normal for beginners - focus on consistency over intensity');
      }
    }
    
    // High rating insights
    if (rating >= 4) {
      insights.push(`High ${ratingContext} - great opportunity for challenging workouts`);
      
      // Only add energy-specific advice if the rating is actually about energy
      if (ratingContext.includes('energy') && aiContext?.currentSelections.customization_focus === 'recovery') {
        insights.push('Consider switching to a more intense focus given your high energy');
      }
    }
    
    // Medium rating insights
    if (rating === 3) {
      insights.push(`Moderate ${ratingContext} - perfect for balanced training`);
    }
    
    return insights;
  }, [config, labels, aiContext, userProfile]);
  
  const handleRatingChange = useCallback((rating: number) => {
    if (disabled) return;
    
    onChange(rating);
    
    // Generate AI insights
    const insights = generateRatingInsights(rating);
    setAIInsights(insights);
    
    if (insights.length > 0 && onAIInsight) {
      onAIInsight(insights[0]);
    }
  }, [disabled, onChange, generateRatingInsights, onAIInsight]);

  // Size-specific styling
  const buttonSize = useMemo(() => {
    const sizeMap = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg'
    };
    return sizeMap[size];
  }, [size]);

  const containerClasses = useMemo(() => {
    return `rating-scale-container ${className} ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`;
  }, [className, orientation]);

  return (
    <div className={containerClasses}>
      {/* AI Insights Display */}
      {aiInsights.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              {aiInsights.map((insight, index) => (
                <div key={index} className="mb-1 last:mb-0">{insight}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Rating Scale */}
      <div className="flex items-center justify-center">
        <div className={`flex items-center gap-4 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`}>
          {showLabels && (
            <div className="text-sm font-medium text-gray-700 text-center">
              {labels.low}
            </div>
          )}
          
          <div className={`flex gap-2 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`}>
            {Array.from({ length: max - min + 1 }, (_, i) => {
              const rating = min + i;
              const isSelected = value === rating;
              const isHovered = hoveredRating === rating;
              const label = config.labels.scale?.[i] || `${rating}`;
              
              return (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(null)}
                  disabled={disabled}
                  className={`
                    ${buttonSize} rounded-full border-2 transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:shadow-md hover:scale-105'
                    }
                    ${isHovered && !isSelected ? 'border-blue-300 shadow-sm' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  aria-pressed={isSelected}
                  aria-label={`Rating ${rating} out of ${max}: ${label}`}
                  title={label}
                >
                  {rating}
                </button>
              );
            })}
          </div>
          
          {showLabels && (
            <div className="text-sm font-medium text-gray-700 text-center">
              {labels.high}
            </div>
          )}
        </div>
      </div>
      
      {/* Current Value Display */}
      {showValue && value !== undefined && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            Current: <span className="font-semibold">{config.labels.scale?.[value - min] || value}</span>
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCED CUSTOMIZATION WRAPPER - Progressive disclosure management
// ============================================================================

interface CustomizationWrapperProps {
  config: CustomizationConfig;
  isEnhanced: boolean;
  userProfile: UserProfile;
  onEnhancementToggle: (enhance: boolean) => void;
  children: React.ReactNode;
  value?: any;
  error?: string;
  className?: string;
}

export function CustomizationWrapper({
  config,
  isEnhanced,
  userProfile,
  onEnhancementToggle,
  children,
  value,
  error,
  className = ''
}: CustomizationWrapperProps) {
  const [showEnhancementSuggestion, setShowEnhancementSuggestion] = useState(false);
  
  // Enhancement analysis
  const enhancementAnalysis = useMemo(() => {
    // This would use the shouldEnhanceComponent utility
    return {
      shouldEnhance: userProfile.fitnessLevel === 'advanced athlete' && !isEnhanced,
      confidence: 0.7,
      reasons: ['Advanced users benefit from detailed controls'],
      benefits: ['More precise workout customization', 'Better results tracking']
    };
  }, [userProfile, isEnhanced]);
  
  // Generate badge for current value
  const generateValueBadge = useCallback(() => {
    if (!value) return null;
    
    switch (config.key) {
      case 'customization_duration':
        if (typeof value === 'number') return `${value} min`;
        return `${value.totalDuration} min${value.configuration !== 'duration-only' ? ' + extras' : ''}`;
      case 'customization_focus':
        if (typeof value === 'string') return value.replace('_', ' ');
        return value.focusLabel || value.label;
      case 'customization_equipment':
        if (Array.isArray(value)) {
          return value.length === 1 ? value[0] : `${value.length} items`;
        }
        return `${value?.specificEquipment?.length || 0} items`;
      default:
        return null;
    }
  }, [config.key, value]);
  
  const IconComponent = config.icon;
  const valueBadge = generateValueBadge();
  
  return (
    <div className={`customization-wrapper ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
            <IconComponent className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">{config.label}</h3>
              {valueBadge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {valueBadge}
                </span>
              )}
              {config.required && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Required
                </span>
              )}
            </div>
            
            {config.metadata?.userBenefits && (
              <p className="text-sm text-gray-600 mt-1">
                {config.metadata.userBenefits[0]}
              </p>
            )}
          </div>
        </div>
        
        {/* Enhancement Controls */}
        {config.uiConfig?.progressiveEnhancement && (
          <div className="flex items-center gap-3">
            {enhancementAnalysis.shouldEnhance && !isEnhanced && (
              <button
                onClick={() => setShowEnhancementSuggestion(!showEnhancementSuggestion)}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Enhance</span>
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {isEnhanced ? 'Advanced' : 'Simple'}
              </span>
              <button
                onClick={() => onEnhancementToggle(!isEnhanced)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnhanced ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnhanced ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhancement Suggestion */}
      {showEnhancementSuggestion && enhancementAnalysis.shouldEnhance && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                Unlock Advanced Features
              </h4>
              <div className="space-y-2 mb-3">
                {enhancementAnalysis.reasons.map((reason, index) => (
                  <p key={index} className="text-sm text-yellow-700">• {reason}</p>
                ))}
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-sm font-medium text-yellow-800">Benefits:</p>
                {enhancementAnalysis.benefits.map((benefit, index) => (
                  <p key={index} className="text-sm text-yellow-700">• {benefit}</p>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onEnhancementToggle(true);
                    setShowEnhancementSuggestion(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Enable Advanced Mode
                </button>
                <button
                  onClick={() => setShowEnhancementSuggestion(false)}
                  className="px-4 py-2 text-yellow-700 text-sm hover:text-yellow-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="customization-content">
        {children}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Metadata Footer */}
      {config.metadata && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              {config.metadata.difficulty && (
                <span>
                  Difficulty: <span className="font-medium">{config.metadata.difficulty}</span>
                </span>
              )}
              {config.metadata.timeRequired && (
                <span>
                  Time: <span className="font-medium">{config.metadata.timeRequired} min</span>
                </span>
              )}
            </div>
            {config.metadata.tags && (
              <div className="flex gap-1">
                {config.metadata.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESSIVE DISCLOSURE CONTAINER - Smart complexity management
// ============================================================================

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4;
  maxLevel: number;
  onLevelChange: (level: number) => void;
  canProgress: boolean;
  className?: string;
}

export function ProgressiveDisclosure({
  title,
  children,
  level,
  maxLevel,
  onLevelChange,
  canProgress,
  className = ''
}: ProgressiveDisclosureProps) {
  return (
    <div className={`progressive-disclosure ${className}`}>
      {/* Level Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">Level {level} of {maxLevel}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(level / maxLevel) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="disclosure-content">
        {children}
      </div>
      
      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => onLevelChange(Math.max(1, level - 1))}
          disabled={level === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: maxLevel }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => onLevelChange(i + 1)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i + 1 === level ? 'bg-blue-500' :
                i + 1 < level ? 'bg-blue-300' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => onLevelChange(Math.min(maxLevel, level + 1))}
          disabled={level === maxLevel || !canProgress}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default { OptionGrid, RatingScale, CustomizationWrapper, ProgressiveDisclosure }; 