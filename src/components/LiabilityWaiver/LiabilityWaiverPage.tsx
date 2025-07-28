import React, { Suspense, useEffect } from 'react';
import { Shield, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { PageHeader, SectionNavigation } from '../shared';
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
    hasUnsavedChanges,
    lastSaved,
    forceSave
  } = useWaiverForm();

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
    switch (currentSection) {
      case 1:
        return (
          <PersonalInfoStep
            waiverData={waiverData}
            onInputChange={handleInputChange}
            getFieldError={getFieldError}
          />
        );

      case 2:
        return (
          <RiskAcknowledgmentStep
            waiverData={waiverData}
            onInputChange={handleInputChange}
            getFieldError={getFieldError}
          />
        );

      case 3:
        return (
          <ReleaseSignatureStep
            waiverData={waiverData}
            onInputChange={handleInputChange}
            getFieldError={getFieldError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
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

          {/* Save Status Indicator */}
          <div className="flex items-center justify-end mb-4 text-sm">
            {hasUnsavedChanges ? (
              <span className="text-orange-600 flex items-center gap-1">
                <Save className="w-4 h-4" />
                Saving...
              </span>
            ) : (
              <span className="text-gray-600 flex items-center gap-1">
                <Save className="w-4 h-4" />
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
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
            <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
              {renderSection()}
            </Suspense>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => currentSection === 1 ? onNavigate('profile') : prevSection()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentSection === 1 ? 'Back to Profile' : 'Previous'}
            </button>

            {currentSection === 3 ? (
              <button
                onClick={handleSubmit}
                disabled={!isWaiverComplete()}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  isWaiverComplete()
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
                disabled={!canProceedToNextSection()}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                  !canProceedToNextSection() ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-orange-700'
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
  );
};

export default LiabilityWaiverPage; 