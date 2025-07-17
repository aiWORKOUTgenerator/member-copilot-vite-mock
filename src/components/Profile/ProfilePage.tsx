import React, { useEffect, useRef } from 'react';
import { User, ChevronLeft, ChevronRight, Target, Loader2, Save, AlertTriangle } from 'lucide-react';
import { PageHeader, SectionNavigation, ErrorBoundary } from '../shared';
import { useProfileForm } from './hooks/useProfileForm';
import { useAnalytics, formatDuration } from '../../hooks/useAnalytics';
import { ProfilePageProps } from './types/profile.types';
import ExperienceStep from './components/steps/ExperienceStep';
import TimeCommitmentStep from './components/steps/TimeCommitmentStep';
import PreferencesStep from './components/steps/PreferencesStep';
import GoalsStep from './components/steps/GoalsStep';
import PersonalInfoStep from './components/steps/PersonalInfoStep';

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const {
    currentStep,
    profileData,
    handleInputChange,
    handleArrayToggle,
    getFieldError,
    canProceedToNextStep,
    nextStep,
    prevStep,
    setStep,
    isProfileComplete,
    getTotalProgress,
    isLoading,
    error,
    hasUnsavedChanges,
    lastSaved,
    restoreFromBackup
  } = useProfileForm();

  const { trackProfileEvent } = useAnalytics();
  const stepStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Track step changes
  useEffect(() => {
    const stepTitle = stepTitles[currentStep - 1];
    trackProfileEvent('profile_step_started', { step: currentStep, title: stepTitle });

    // Track duration of previous step
    if (stepStartTimeRef.current) {
      const duration = formatDuration(stepStartTimeRef.current);
      trackProfileEvent('profile_step_completed', { step: currentStep - 1, duration });
    }

    stepStartTimeRef.current = Date.now();
  }, [currentStep, trackProfileEvent]);

  // Track form abandonment
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isProfileComplete()) {
        trackProfileEvent('profile_abandoned', {
          step: currentStep,
          reason: 'page_hidden'
        });
      }
    };

    const handleBeforeUnload = () => {
      if (!isProfileComplete()) {
        trackProfileEvent('profile_abandoned', {
          step: currentStep,
          reason: 'page_closed'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep, isProfileComplete, trackProfileEvent]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when not in an input field
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.tagName === 'SELECT') {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (canProceedToNextStep() && !isLoading) {
            e.preventDefault();
            nextStep();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (currentStep > 1 && !isLoading) {
            e.preventDefault();
            prevStep();
          }
          break;
        case 'Enter':
          if (currentStep === 5 && isProfileComplete() && !isLoading) {
            e.preventDefault();
            handleSubmit();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, canProceedToNextStep, isLoading, nextStep, prevStep, isProfileComplete]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle auto-save recovery on page load
  useEffect(() => {
    const hasBackup = localStorage.getItem('profileData_backup');
    if (hasBackup) {
      const shouldRestore = window.confirm(
        'We found unsaved changes from your previous session. Would you like to restore them?'
      );
      if (shouldRestore) {
        restoreFromBackup();
      }
    }
  }, [restoreFromBackup]);

  const handleSubmit = async () => {
    if (isProfileComplete()) {
      // Track profile completion
      const totalTime = formatDuration(sessionStartTimeRef.current);
      trackProfileEvent('profile_completed', {
        totalTime,
        completionRate: getTotalProgress()
      });
      onNavigate('waiver');
    }
  };

  const handleSectionChange = React.useCallback((index: number) => {
    setStep(index);
  }, [setStep]);

  const handleFieldChange = async (field: keyof typeof profileData, value: string | string[]) => {
    await handleInputChange(field, value);
    trackProfileEvent('profile_field_changed', {
      field,
      step: currentStep
    });
  };

  const handleFieldError = (field: keyof typeof profileData) => {
    const error = getFieldError(field);
    if (error) {
      trackProfileEvent('profile_validation_error', {
        field,
        error,
        step: currentStep
      });
    }
    return error;
  };

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  const renderStep = () => {
    const commonProps = {
      profileData,
      onInputChange: handleFieldChange,
      onArrayToggle: handleArrayToggle,
      getFieldError: handleFieldError
    };

    switch (currentStep) {
      case 1:
        return <ExperienceStep {...commonProps} />;
      case 2:
        return <TimeCommitmentStep {...commonProps} />;
      case 3:
        return <PreferencesStep {...commonProps} />;
      case 4:
        return <GoalsStep {...commonProps} />;
      case 5:
        return <PersonalInfoStep {...commonProps} />;
      default:
        return null;
    }
  };

  const stepTitles = [
    'Experience & Activity',
    'Time & Commitment',
    'Preferences & Resources',
    'Goals & Timeline',
    'Metrics & Health'
  ];

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const date = new Date(lastSaved);
    return date.toLocaleTimeString();
  };

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
        role="main"
        aria-label="Profile Creation Form"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <PageHeader
              title="Create Your Fitness Profile"
              subtitle="Help us understand your fitness journey so we can create the perfect workout plan tailored just for you."
              icon={User}
              gradient="from-blue-600 to-purple-600"
              className="mb-8"
            />

            {/* Auto-save Status */}
            <div 
              className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                hasUnsavedChanges
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
              role="status"
              aria-live="polite"
            >
              {hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span>Saving changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>All changes saved</span>
                  {lastSaved && (
                    <span className="text-sm text-gray-500 ml-2">
                      Last saved at {formatLastSaved()}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Section Navigation */}
            <nav aria-label="Profile Steps">
              <SectionNavigation
                sections={[
                  { step: 1, title: 'Experience & Activity', color: 'from-blue-500 to-purple-600' },
                  { step: 2, title: 'Time & Commitment', color: 'from-green-500 to-blue-600' },
                  { step: 3, title: 'Preferences & Resources', color: 'from-purple-500 to-pink-600' },
                  { step: 4, title: 'Goals & Timeline', color: 'from-orange-500 to-red-600' },
                  { step: 5, title: 'Metrics & Health', color: 'from-teal-500 to-green-600' }
                ]}
                currentSection={currentStep - 1}
                onSectionChange={handleSectionChange}
                variant="steps"
              />
            </nav>

            {/* Progress Bar */}
            <div className="mb-8" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={getTotalProgress()}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600" aria-label={`Current Step ${currentStep} of 5`}>
                  Step {currentStep} of 5
                </span>
                <span className="text-sm font-medium text-gray-600" aria-label={`${Math.round(getTotalProgress())}% Complete`}>
                  {Math.round(getTotalProgress())}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTotalProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div 
              className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative"
              role="region"
              aria-label={`Step ${currentStep}: ${stepTitles[currentStep - 1]}`}
            >
              {isLoading && (
                <div 
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" aria-hidden="true" />
                    <span className="text-gray-700 font-medium">Loading...</span>
                  </div>
                </div>
              )}
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center" role="navigation" aria-label="Form Navigation">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Previous Step"
                aria-disabled={currentStep === 1 || isLoading}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                Previous
              </button>

              {currentStep === 5 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isProfileComplete() || isLoading || hasUnsavedChanges}
                  className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                    !isProfileComplete() || isLoading || hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                  }`}
                  aria-label="Complete Profile"
                  aria-disabled={!isProfileComplete() || isLoading || hasUnsavedChanges}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Save className="w-5 h-5 animate-pulse" aria-hidden="true" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <Target className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceedToNextStep() || isLoading}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                    !canProceedToNextStep() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                  }`}
                  aria-label={`Next Step: ${stepTitles[currentStep]}`}
                  aria-disabled={!canProceedToNextStep() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;