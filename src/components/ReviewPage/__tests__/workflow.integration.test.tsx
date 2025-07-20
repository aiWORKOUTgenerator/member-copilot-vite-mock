// React import not needed for this test file
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewPage } from '../ReviewPage';
import { ValidationService } from '../utils/validationService';
import { ErrorTemplates } from '../../shared/ErrorHandlingPanel';
import { ProfileData } from '../../Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { GeneratedWorkout } from '../../../services/ai/external/types/external-ai.types';

// Mock the workout generation hook
const mockWorkoutGeneration = {
  generateWorkout: jest.fn(),
  regenerateWorkout: jest.fn(),
  clearWorkout: jest.fn(),
  retryGeneration: jest.fn(),
  canRegenerate: false,
  hasError: false,
  isGenerating: false,
  state: {
    isGenerating: false,
    generatedWorkout: null,
    error: null,
    generationProgress: 0,
    lastGenerated: null
  },
  status: 'idle' as 'idle' | 'validating' | 'generating' | 'enhancing' | 'complete' | 'error'
};

// Mock navigation function
const mockOnNavigate = jest.fn();
const mockOnWorkoutGenerated = jest.fn();

// Mock waiver data
const mockWaiverData = {
  fullName: 'John Doe',
  dateOfBirth: '1990-01-01',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '555-1234',
  medicalConditions: 'None',
  medications: 'None',
  physicianApproval: true,
  understandRisks: true,
  assumeResponsibility: true,
  followInstructions: true,
  reportInjuries: true,
  releaseFromLiability: true,
  signature: 'John Doe',
  signatureDate: new Date().toISOString()
};

// Sample test data
const sampleProfileData: ProfileData = {
  experienceLevel: 'Some Experience',
  primaryGoal: 'Strength',
  physicalActivity: 'moderate',
  preferredDuration: '30-45 min',
  timeCommitment: '3-4',
  intensityLevel: 'moderately',
  goalTimeline: '3 months',
  preferredActivities: ['Running/Jogging', 'Swimming'],
  availableEquipment: ['Dumbbells', 'Resistance Bands'],
  availableLocations: ['Home', 'Gym'],
  age: '26-35',
  height: '175',
  weight: '70',
  gender: 'male',
  hasCardiovascularConditions: 'No',
  injuries: ['No Injuries']
};

const sampleQuickWorkoutData: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 30,
  customization_energy: 7
};

const sampleDetailedWorkoutData: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 45,
  customization_energy: 8,
  customization_areas: ['Upper Body', 'Lower Body'],
  customization_equipment: ['Dumbbells', 'Resistance Bands']
};

const sampleGeneratedWorkout: GeneratedWorkout = {
  id: 'test-workout-1',
  title: 'Test Workout',
  description: 'A test workout for integration testing',
  totalDuration: 45,
  estimatedCalories: 300,
  difficulty: 'some experience',
  equipment: ['Body Weight'],
  warmup: {
    name: 'Warm Up',
    duration: 5,
    exercises: [
      {
        id: 'arm-circles',
        name: 'Arm Circles',
        description: 'Warm up your shoulders',
        duration: 60,
        form: 'Stand with feet shoulder-width apart and make circular motions with your arms',
        modifications: [],
        commonMistakes: ['Moving too fast', 'Not engaging core'],
        primaryMuscles: ['Shoulders'],
        secondaryMuscles: ['Arms'],
        movementType: 'flexibility'
      }
    ],
    instructions: 'Start with gentle arm circles to warm up your shoulders',
    tips: ['Keep movements controlled', 'Breathe steadily']
  },
  mainWorkout: {
    name: 'Main Workout',
    duration: 35,
    exercises: [
      {
        id: 'push-ups',
        name: 'Push-ups',
        description: 'Upper body strength',
        sets: 3,
        repetitions: 10,
        restTime: 60,
        form: 'Start in plank position, lower body to ground, push back up',
        modifications: [],
        commonMistakes: ['Sagging hips', 'Not going low enough'],
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Triceps', 'Shoulders'],
        movementType: 'strength'
      }
    ],
    instructions: 'Perform push-ups with proper form',
    tips: ['Keep your core engaged', 'Maintain straight body alignment']
  },
  cooldown: {
    name: 'Cool Down',
    duration: 5,
    exercises: [
      {
        id: 'stretching',
        name: 'Stretching',
        description: 'Cool down stretches',
        duration: 120,
        form: 'Hold each stretch for 30 seconds',
        modifications: [],
        commonMistakes: ['Bouncing during stretches', 'Holding breath'],
        primaryMuscles: ['Full Body'],
        secondaryMuscles: [],
        movementType: 'flexibility'
      }
    ],
    instructions: 'Perform gentle stretches to cool down',
    tips: ['Hold each stretch for 30 seconds', 'Breathe deeply']
  },
  reasoning: 'This workout focuses on upper body strength with proper warm-up and cool-down',
  personalizedNotes: ['Good for beginners', 'Can be modified for different fitness levels'],
  progressionTips: ['Increase repetitions gradually', 'Add resistance when ready'],
  safetyReminders: ['Stop if you feel pain', 'Maintain proper form'],
  generatedAt: new Date(),
  aiModel: 'gpt-4',
  confidence: 0.85,
  tags: ['strength', 'upper-body', 'beginner-friendly']
};

describe('ReviewPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quick Workout Workflow', () => {
    it('should render quick workout review page with valid data', () => {
      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText('Quick Workout Review')).toBeInTheDocument();
      expect(screen.getByText('Generate Quick Workout')).toBeInTheDocument();
      expect(screen.getByText('Ready to Generate')).toBeInTheDocument();
    });

    it('should show validation errors for missing quick workout data', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength'
        // Missing duration and energy
      };

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={incompleteData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText('Workout Duration')).toBeInTheDocument();
      expect(screen.getByText('Energy Level')).toBeInTheDocument();
      expect(screen.getByText(/Issue.*to Fix/)).toBeInTheDocument();
    });

    it('should generate quick workout successfully', async () => {
      mockWorkoutGeneration.generateWorkout.mockResolvedValue(sampleGeneratedWorkout);

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const generateButton = screen.getByText('Generate Quick Workout');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockWorkoutGeneration.generateWorkout).toHaveBeenCalledWith({
          workoutType: 'quick',
          profileData: sampleProfileData,
          workoutFocusData: sampleQuickWorkoutData,
          userProfile: expect.any(Object),
          waiverData: mockWaiverData
        });
      });

      await waitFor(() => {
        expect(mockOnWorkoutGenerated).toHaveBeenCalledWith(sampleGeneratedWorkout);
        expect(mockOnNavigate).toHaveBeenCalledWith('results');
      });
    });
  });

  describe('Detailed Workout Workflow', () => {
    it('should render detailed workout review page with valid data', () => {
      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleDetailedWorkoutData}
          workoutType="detailed"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText('Detailed Workout Review')).toBeInTheDocument();
      expect(screen.getByText('Generate Detailed Workout')).toBeInTheDocument();
      expect(screen.getByText('Ready to Generate')).toBeInTheDocument();
      expect(screen.getByText('Detailed Workout Setup Progress')).toBeInTheDocument();
    });

    it('should show detailed workout progression validation', () => {
      const incompleteDetailedData: PerWorkoutOptions = {
        customization_focus: 'strength',
        customization_duration: 45,
        customization_energy: 8
        // Missing areas and equipment
      };

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={incompleteDetailedData}
          workoutType="detailed"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText('Focus Areas')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
      expect(screen.getByText(/Step 3 of 6/)).toBeInTheDocument();
    });

    it('should show complete detailed workout progression when all data is valid', () => {
      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleDetailedWorkoutData}
          workoutType="detailed"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText(/Step 6 of 6/)).toBeInTheDocument();
      expect(screen.getByText('Generate Detailed Workout')).toBeInTheDocument();
    });

    it('should generate detailed workout successfully', async () => {
      mockWorkoutGeneration.generateWorkout.mockResolvedValue(sampleGeneratedWorkout);

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleDetailedWorkoutData}
          workoutType="detailed"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const generateButton = screen.getByText('Generate Detailed Workout');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockWorkoutGeneration.generateWorkout).toHaveBeenCalledWith({
          workoutType: 'detailed',
          profileData: sampleProfileData,
          workoutFocusData: sampleDetailedWorkoutData,
          userProfile: expect.any(Object),
          waiverData: mockWaiverData
        });
      });
    });
  });

  describe('Validation Service Integration', () => {
    it('should validate quick workout data correctly', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should validate detailed workout data correctly', () => {
      const result = ValidationService.validateWorkoutData(
        sampleDetailedWorkoutData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true);
      // May have info messages for high energy level, which is expected
      expect(result.summary.errors).toBe(0);
    });

    it('should detect missing profile data', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        null,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.field === 'Profile Information')).toBe(true);
    });

    it('should detect missing detailed workout requirements', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData, // Missing areas and equipment
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.field === 'Focus Areas')).toBe(true);
      expect(result.issues.some(issue => issue.field === 'Equipment')).toBe(true);
    });

    it('should provide actionable guidance for validation issues', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        null,
        'quick',
        mockOnNavigate
      );

      const profileIssue = result.issues.find(issue => issue.field === 'Profile Information');
      expect(profileIssue?.action).toBeDefined();
      expect(profileIssue?.action?.label).toBe('Complete Profile');
    });
  });

  describe('Error Handling Integration', () => {
    it('should display generation error with retry option', async () => {
      const errorMessage = 'Failed to generate workout';
      mockWorkoutGeneration.generateWorkout.mockRejectedValue(new Error(errorMessage));

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const generateButton = screen.getByText('Generate Quick Workout');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Workout Generation Failed')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should handle network errors appropriately', () => {
      const networkError = ErrorTemplates.networkError();
      
      expect(networkError.type).toBe('network');
      expect(networkError.suggestions).toContain('Check your internet connection');
      expect(networkError.actions).toHaveLength(1);
    });

    it('should handle validation errors appropriately', () => {
      const validationError = ErrorTemplates.validationError('Workout Focus', 'Required field');
      
      expect(validationError.type).toBe('validation');
      expect(validationError.message).toContain('Workout Focus');
      expect(validationError.actions).toHaveLength(1);
    });
  });

  describe('Cross-Component Validation', () => {
    it('should validate duration vs energy level compatibility', () => {
      const highEnergyLongDuration: PerWorkoutOptions = {
        ...sampleQuickWorkoutData,
        customization_duration: 90,
        customization_energy: 9
      };

      const result = ValidationService.validateWorkoutData(
        highEnergyLongDuration,
        sampleProfileData,
        'quick'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Intensity' && 
        issue.severity === 'warning'
      )).toBe(true);
    });

    it('should validate equipment vs focus compatibility', () => {
      const strengthWithBodyWeight: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_equipment: ['Body Weight']
      };

      const result = ValidationService.validateWorkoutData(
        strengthWithBodyWeight,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Equipment' && 
        issue.severity === 'warning'
      )).toBe(true);
    });

    it('should validate experience level vs workout focus', () => {
      const beginnerStrength: PerWorkoutOptions = {
        ...sampleQuickWorkoutData,
        customization_focus: 'strength'
      };

      const beginnerProfile: ProfileData = {
        ...sampleProfileData,
        experienceLevel: 'New to Exercise'
      };

      const result = ValidationService.validateWorkoutData(
        beginnerStrength,
        beginnerProfile,
        'quick'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Experience Level' && 
        issue.severity === 'info'
      )).toBe(true);
    });
  });

  describe('Data Persistence and Navigation', () => {
    it('should navigate back to workout focus page', () => {
      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const backButton = screen.getByText('Back to Workout Focus');
      fireEvent.click(backButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('focus');
    });

    it('should provide edit links for profile and workout focus', () => {
      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const editProfileLink = screen.getByText('Edit Profile Information');
      const editWorkoutLink = screen.getByText('Modify Workout Focus');

      fireEvent.click(editProfileLink);
      expect(mockOnNavigate).toHaveBeenCalledWith('profile');

      fireEvent.click(editWorkoutLink);
      expect(mockOnNavigate).toHaveBeenCalledWith('focus');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during workout generation', async () => {
      mockWorkoutGeneration.isGenerating = true;
      mockWorkoutGeneration.state.generationProgress = 50;
      mockWorkoutGeneration.status = 'generating';

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      expect(screen.getByText('Generating Quick Workout...')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show loading state for generate button during loading', () => {
      mockWorkoutGeneration.isGenerating = true;

      render(
        <ReviewPage
          onNavigate={mockOnNavigate}
          profileData={sampleProfileData}
          workoutFocusData={sampleQuickWorkoutData}
          workoutType="quick"
          workoutGeneration={mockWorkoutGeneration}
          onWorkoutGenerated={mockOnWorkoutGenerated}
          waiverData={mockWaiverData}
        />
      );

      const generateButton = screen.getByText('Generating Quick Workout...');
      expect(generateButton).toBeInTheDocument();
    });
  });
}); 