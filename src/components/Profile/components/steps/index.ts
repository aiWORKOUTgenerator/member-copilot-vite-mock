import { lazy } from 'react';

// Lazy load step components for better performance
export const ExperienceStep = lazy(() => import('./ExperienceStep'));
export const TimeCommitmentStep = lazy(() => import('./TimeCommitmentStep'));
export const PreferencesStep = lazy(() => import('./PreferencesStep'));
export const GoalsStep = lazy(() => import('./GoalsStep'));
export const PersonalInfoStep = lazy(() => import('./PersonalInfoStep'));

// Step configuration for main ProfilePage
export const stepConfig = {
  1: {
    component: ExperienceStep,
    title: 'Experience & Activity',
    description: 'Tell us about your fitness background'
  },
  2: {
    component: TimeCommitmentStep,
    title: 'Time & Commitment',
    description: 'How much time can you dedicate?'
  },
  3: {
    component: PreferencesStep,
    title: 'Exercise Preferences',
    description: 'What activities do you enjoy?'
  },
  4: {
    component: GoalsStep,
    title: 'Goals & Timeline',
    description: 'What do you want to achieve?'
  },
  5: {
    component: PersonalInfoStep,
    title: 'Personal Information',
    description: 'Help us personalize your experience'
  }
} as const; 