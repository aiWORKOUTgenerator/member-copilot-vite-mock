import React from 'react';
import { User, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { PageHeader, SectionNavigation } from '../shared';
import { useProfileForm } from './hooks/useProfileForm';
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
    getTotalProgress
  } = useProfileForm();

  const handleSubmit = () => {
    if (isProfileComplete()) {
      onNavigate('waiver');
    }
  };

  const handleSectionChange = React.useCallback((index: number) => {
    setStep(index);
  }, [setStep]);



  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ExperienceStep 
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayToggle={handleArrayToggle}
            getFieldError={getFieldError}
          />
        );

      case 2:
        return (
          <TimeCommitmentStep 
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayToggle={handleArrayToggle}
            getFieldError={getFieldError}
          />
        );

      case 3:
        return (
          <PreferencesStep 
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayToggle={handleArrayToggle}
            getFieldError={getFieldError}
          />
        );

      case 4:
        return (
          <GoalsStep 
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayToggle={handleArrayToggle}
            getFieldError={getFieldError}
          />
        );

      case 5:
        return (
          <PersonalInfoStep 
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayToggle={handleArrayToggle}
            getFieldError={getFieldError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

          {/* Section Navigation */}
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

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of 5</span>
              <span className="text-sm font-medium text-gray-600">{Math.round(getTotalProgress())}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === 5 ? (
              <button
                onClick={handleSubmit}
                disabled={!isProfileComplete()}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                  !isProfileComplete() ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                Complete Profile
                <Target className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
                  !canProceedToNextStep() ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;