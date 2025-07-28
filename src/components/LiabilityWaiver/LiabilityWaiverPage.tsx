import React, { Suspense, useEffect } from 'react';
import { Shield, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Save, Loader2 } from 'lucide-react';
import { PageHeader, SectionNavigation, ErrorBoundary } from '../shared';
import { useWaiverForm } from './hooks/useWaiverForm';
import { LiabilityWaiverPageProps } from './types/liability-waiver.types';
import { PersonalInfoStep, RiskAcknowledgmentStep, ReleaseSignatureStep } from './components/steps';
import { aiLogger } from '../../services/ai/logging/AILogger';
import { markOnboardingComplete } from '../../utils/pageDetermination';

const LiabilityWaiverPage: React.FC<LiabilityWaiverPageProps> = ({ onNavigate }) => {
  const {
    currentSection,
    waiverData,
    handleInputChange,
    getFieldError,
    canProceedToNextSection,
    nextSection,
    prevSection,
    setSection,
    isWaiverComplete,
    getTotalProgress,
    isLoading,
    error,
    hasUnsavedChanges,
    lastSaved,
    forceSave
  } = useWaiverForm();

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

  // Clean up any existing backup data
  useEffect(() => {
    localStorage.removeItem('waiverData_backup');
  }, []);

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

  // Removed backup functionality

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  const handleSubmit = () => {
    if (isWaiverComplete()) {
      forceSave(); // Ensure all changes are saved before proceeding
      markOnboardingComplete(); // Mark onboarding as complete
      aiLogger.info('Waiver completed and onboarding marked as complete', { waiverData });
      onNavigate('focus');
    }
  };

  const handleSectionChange = React.useCallback((index: number) => {
    if (hasUnsavedChanges) {
      forceSave(); // Save changes before switching sections
    }
    setSection(index + 1); // Convert 0-based index to 1-based section number
  }, [setSection, hasUnsavedChanges, forceSave]);

  const renderSection = () => {
    const commonProps = {
      waiverData,
      onInputChange: handleInputChange,
      getFieldError
    };

    switch (currentSection) {
      case 1:
        return <PersonalInfoStep {...commonProps} />;
      case 2:
        return <RiskAcknowledgmentStep {...commonProps} />;
      case 3:
        return <ReleaseSignatureStep {...commonProps} />;
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

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50"
        role="main"
        aria-label="Liability Waiver Form"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Liability Waiver & Release"
            subtitle="Please read carefully and complete this liability waiver before proceeding to your workout generation. This is required for your safety and legal protection."
            icon={Shield}
            gradient="from-red-600 to-orange-600"
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
          <SectionNavigation
            sections={[
              { 
                step: 1, 
                title: 'Personal Information', 
                color: 'from-red-500 to-orange-600'
              },
              { 
                step: 2, 
                title: 'Risk Acknowledgment', 
                color: 'from-orange-500 to-red-600'
              },
              { 
                step: 3, 
                title: 'Release & Signature', 
                color: 'from-purple-500 to-red-600'
              }
            ]}
            currentSection={currentSection - 1} // Convert 1-based to 0-based for navigation
            onSectionChange={handleSectionChange}
            variant="steps"
          />

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Section {currentSection} of 3</span>
              <span className="text-sm font-medium text-gray-600">{Math.round(getTotalProgress())}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                <span className="ml-2 text-gray-600">Saving...</span>
              </div>
            )}

            <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
              {renderSection()}
            </Suspense>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => currentSection === 1 ? onNavigate('profile') : prevSection()}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentSection === 1 ? 'Back to Profile' : 'Previous'}
            </button>

            {currentSection === 3 ? (
              <button
                onClick={handleSubmit}
                disabled={!isWaiverComplete() || isLoading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  isWaiverComplete() && !isLoading
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Complete Waiver & Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={nextSection}
                disabled={!canProceedToNextSection() || isLoading}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                  !canProceedToNextSection() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-orange-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form Validation Status */}
          {currentSection === 3 && (
            <div className="mt-6 text-center">
              {isWaiverComplete() ? (
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">All required fields completed</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="text-sm">Please complete all required fields and acknowledgments</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default LiabilityWaiverPage; 