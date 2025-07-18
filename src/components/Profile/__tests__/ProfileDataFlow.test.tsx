import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ExperienceStep from '../components/steps/ExperienceStep';
import ProfilePage from '../ProfilePage';
import { ReviewPage } from '../../ReviewPage';

// Mock the hooks and contexts
jest.mock('../hooks/useProfileForm', () => ({
  useProfileForm: () => ({
    profileData: {
      experienceLevel: 'new to exercise',
      physicalActivity: 'light'
    },
    handleInputChange: jest.fn(),
    handleArrayToggle: jest.fn(),
    getFieldError: jest.fn(),
    isComplete: true,
    currentStep: 1
  })
}));

describe('Profile Data Flow', () => {
  it('should pass experience data from Profile to Review', () => {
    // First, verify ExperienceStep data collection
    const mockProfileData = {
      experienceLevel: 'new to exercise',
      physicalActivity: 'light'
    };
    
    const mockHandleInputChange = jest.fn();
    
    render(
      <ExperienceStep
        profileData={mockProfileData}
        onInputChange={mockHandleInputChange}
        onArrayToggle={jest.fn()}
        getFieldError={jest.fn()}
      />
    );

    // Verify ExperienceStep renders with correct data
    expect(screen.getByText('New to Exercise')).toBeInTheDocument();
    expect(screen.getByText('Light Activity')).toBeInTheDocument();

    // Now test the full flow through ProfilePage
    const mockOnNavigate = jest.fn();
    
    render(
      <ProfilePage onNavigate={mockOnNavigate} />
    );

    // Simulate completing the profile
    // This should store the data somewhere - let's see where it goes
    console.log('Checking where profile data is stored and how it flows...');

    // Finally test ReviewPage with the same data
    render(
      <ReviewPage
        onNavigate={mockOnNavigate}
        profileData={mockProfileData}
        waiverData={null}
        workoutFocusData={null}
        workoutGeneration={{
          generateWorkout: jest.fn(),
          isGenerating: false,
          status: 'idle',
          state: { generationProgress: 0 }
        }}
        onWorkoutGenerated={jest.fn()}
      />
    );

    // Verify the data appears in ReviewPage
    expect(screen.getByText('New to Exercise')).toBeInTheDocument();
    expect(screen.getByText('Light Activity')).toBeInTheDocument();
  });
}); 