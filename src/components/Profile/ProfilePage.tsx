import React, { useEffect, useRef } from 'react';
import { User, ChevronLeft, ChevronRight, Target, Loader2, Save, AlertTriangle } from 'lucide-react';
import { PageHeader, SectionNavigation, ErrorBoundary } from '../shared';
import { useProfileForm } from './hooks/useProfileForm';
import { ProfilePageProps, ProfileData } from './types/profile.types';
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
    lastSaved
  } = useProfileForm();

  // State to control auto-save message visibility
  const [showSaveMessage, setShowSaveMessage] = React.useState(false);

  // Show save message when data is saved
  useEffect(() => {
    if (!hasUnsavedChanges && lastSaved) {
      setShowSaveMessage(true);
      const timer = setTimeout(() => {
        setShowSaveMessage(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, lastSaved]);

  // Simple field change handler
  const handleFieldChange = async (field: keyof ProfileData, value: string | string[]) => {
    await handleInputChange(field, value);
  };

  const handleFieldError = (field: keyof ProfileData) => {
    return getFieldError(field);
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

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const date = new Date(lastSaved);
    return date.toLocaleTimeString();
  };

  const handleSubmit = async () => {
    if (isProfileComplete()) {
      onNavigate('waiver');
    }
  };

  const handleSectionChange = (step: number) => {
    setStep(step + 1); // +1 because step is 0-based index from SectionNavigation
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
                  : showSaveMessage
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'opacity-0 pointer-events-none'
              }`}
              role="status"
              aria-live="polite"
            >
              {hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span>Saving changes...</span>
                </>
              ) : showSaveMessage ? (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>All changes saved</span>
                  {lastSaved && (
                    <span className="text-sm text-gray-500 ml-2">
                      Last saved at {formatLastSaved()}
                    </span>
                  )}
                </>
              ) : null}
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
              className="mb-8"
            />
            </nav>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Saving...</span>
                </div>
              )}

              {/* Step Content */}
              <div className="min-h-[400px]">
                {renderStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1 || isLoading}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of 5
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getTotalProgress()}%` }}
                    />
                  </div>
                </div>

                {currentStep === 5 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!isProfileComplete() || isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Complete Profile
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep() || isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;