import { lazy } from 'react';

// Lazy load step components for better performance
export const PersonalInfoStep = lazy(() => import('./PersonalInfoStep'));
export const RiskAcknowledgmentStep = lazy(() => import('./RiskAcknowledgmentStep'));
export const ReleaseSignatureStep = lazy(() => import('./ReleaseSignatureStep'));

// Step configuration for main LiabilityWaiverPage
export const stepConfig = {
  1: {
    component: PersonalInfoStep,
    title: 'Personal Information',
    description: 'Basic information and medical history'
  },
  2: {
    component: RiskAcknowledgmentStep,
    title: 'Risk Acknowledgment',
    description: 'Understanding and accepting exercise risks'
  },
  3: {
    component: ReleaseSignatureStep,
    title: 'Release & Signature',
    description: 'Legal release and electronic signature'
  }
} as const; 