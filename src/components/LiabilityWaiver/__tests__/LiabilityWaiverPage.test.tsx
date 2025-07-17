import { render, screen, fireEvent } from '@testing-library/react';
import LiabilityWaiverPage from '../LiabilityWaiverPage';

jest.mock('../hooks/useWaiverForm', () => ({
  useWaiverForm: () => ({
    currentSection: 1,
    waiverData: {},
    handleInputChange: jest.fn(),
    getFieldError: jest.fn(),
    canProceedToNextSection: () => false,
    nextSection: jest.fn(),
    prevSection: jest.fn(),
    setSection: jest.fn(),
    isWaiverComplete: () => false,
    getTotalProgress: () => 0
  })
}));

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

  it('renders the page header', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Liability Waiver & Release')).toBeInTheDocument();
  });

  it('renders section navigation', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    expect(screen.getByTestId('section-navigation')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Risk Acknowledgment')).toBeInTheDocument();
    expect(screen.getByText('Release & Signature')).toBeInTheDocument();
  });

  it('renders personal info step by default', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    expect(screen.getByTestId('personal-info-step')).toBeInTheDocument();
  });

  it('shows validation message when trying to proceed with empty fields', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('allows navigation back to profile', () => {
    render(<LiabilityWaiverPage onNavigate={mockOnNavigate} />);
    const backButton = screen.getByRole('button', { name: /back to profile/i });
    fireEvent.click(backButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('profile');
  });
}); 