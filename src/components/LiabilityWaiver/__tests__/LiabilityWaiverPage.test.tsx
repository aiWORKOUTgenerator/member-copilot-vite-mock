import React from 'react';
import { render, screen } from '@testing-library/react';
import LiabilityWaiverPage from '../LiabilityWaiverPage';

// Mock the hooks
jest.mock('../hooks/useWaiverForm', () => ({
  useWaiverForm: () => ({
    currentSection: 1,
    waiverData: {
      fullName: '',
      dateOfBirth: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalConditions: '',
      medications: '',
      physicianApproval: false,
      understandRisks: false,
      assumeResponsibility: false,
      followInstructions: false,
      reportInjuries: false,
      releaseFromLiability: false,
      signature: '',
      signatureDate: ''
    },
    sectionCompletion: {
      1: { progress: 0, isComplete: false },
      2: { progress: 0, isComplete: false },
      3: { progress: 0, isComplete: false }
    },
    handleInputChange: jest.fn(),
    getFieldError: jest.fn(),
    canProceedToNextSection: jest.fn().mockReturnValue(false),
    nextSection: jest.fn(),
    prevSection: jest.fn(),
    setSection: jest.fn(),
    isWaiverComplete: jest.fn().mockReturnValue(false),
    getTotalProgress: jest.fn().mockReturnValue(0)
  })
}));

// Mock the shared components
jest.mock('../../shared', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
  SectionNavigation: ({ sections }: { sections: any[] }) => (
    <div data-testid="section-navigation">
      {sections.map((section, index) => (
        <div key={index}>{section.title}</div>
      ))}
    </div>
  )
}));

// Mock the step components
jest.mock('../components/steps', () => ({
  PersonalInfoStep: () => <div data-testid="personal-info-step">Personal Info</div>,
  RiskAcknowledgmentStep: () => <div data-testid="risk-acknowledgment-step">Risk Acknowledgment</div>,
  ReleaseSignatureStep: () => <div data-testid="release-signature-step">Release & Signature</div>
}));

describe('LiabilityWaiverPage', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders liability waiver page', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Liability Waiver & Release')).toBeInTheDocument();
  });

  test('renders step navigation', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('section-navigation')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Risk Acknowledgment')).toBeInTheDocument();
    expect(screen.getByText('Release & Signature')).toBeInTheDocument();
  });

  test('renders personal info step by default', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('personal-info-step')).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Section 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Back to Profile')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});

// TODO: Add more comprehensive tests
// - Test step navigation
// - Test form validation
// - Test submission flow
// - Test error handling 