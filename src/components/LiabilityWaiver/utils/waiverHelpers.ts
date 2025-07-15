// Utility functions for liability waiver operations
import { LiabilityWaiverData } from '../types/liability-waiver.types';

// Calculate completion percentage
export const calculateCompletionPercentage = (waiverData: LiabilityWaiverData): number => {
  const totalFields = Object.keys(waiverData).length;
  let completedFields = 0;

  Object.entries(waiverData).forEach(([key, value]) => {
    // Define optional fields that don't count against completion
    const optionalFields = ['medicalConditions', 'medications', 'physicianApproval'];
    
    if (optionalFields.includes(key)) {
      // Optional fields are always considered "complete"
      completedFields++;
    } else if (typeof value === 'boolean') {
      // Boolean fields must be true to be considered complete
      if (value === true) completedFields++;
    } else if (typeof value === 'string') {
      // String fields must not be empty to be considered complete
      if (value.trim().length > 0) completedFields++;
    }
  });

  return Math.round((completedFields / totalFields) * 100);
};

// Check if waiver is complete
export const isWaiverComplete = (waiverData: LiabilityWaiverData): boolean => {
  const requiredFields = [
    'fullName', 'dateOfBirth', 'emergencyContactName', 'emergencyContactPhone',
    'understandRisks', 'assumeResponsibility', 'followInstructions', 'reportInjuries',
    'releaseFromLiability', 'signature', 'signatureDate'
  ];
  
  return requiredFields.every(field => {
    const value = waiverData[field as keyof LiabilityWaiverData];
    if (typeof value === 'boolean') {
      return value === true;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return false;
  });
};

// Format field values for display
export const formatFieldValue = (value: string | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return value || 'Not provided';
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return as-is if it doesn't match expected format
  return phoneNumber;
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Check if user is a minor (under 18)
export const isMinor = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < 18;
  }
  
  return age < 18;
};

// Generate waiver summary for review
export const generateWaiverSummary = (waiverData: LiabilityWaiverData) => {
  return {
    personalInfo: {
      fullName: waiverData.fullName,
      dateOfBirth: waiverData.dateOfBirth,
      emergencyContact: {
        name: waiverData.emergencyContactName,
        phone: formatPhoneNumber(waiverData.emergencyContactPhone)
      },
      medicalInfo: {
        conditions: waiverData.medicalConditions || 'None reported',
        medications: waiverData.medications || 'None reported',
        physicianApproval: formatFieldValue(waiverData.physicianApproval)
      }
    },
    acknowledgments: {
      understandRisks: waiverData.understandRisks,
      assumeResponsibility: waiverData.assumeResponsibility,
      followInstructions: waiverData.followInstructions,
      reportInjuries: waiverData.reportInjuries,
      releaseFromLiability: waiverData.releaseFromLiability
    },
    signature: {
      digitalSignature: waiverData.signature,
      signatureDate: waiverData.signatureDate
    }
  };
};

// Export waiver data as text for download/printing
export const exportWaiverAsText = (waiverData: LiabilityWaiverData): string => {
  const summary = generateWaiverSummary(waiverData);
  
  return `
LIABILITY WAIVER AND RELEASE FORM
AI Workout Generator

PERSONAL INFORMATION:
Full Name: ${summary.personalInfo.fullName}
Date of Birth: ${summary.personalInfo.dateOfBirth}
Emergency Contact: ${summary.personalInfo.emergencyContact.name}
Emergency Phone: ${summary.personalInfo.emergencyContact.phone}

MEDICAL INFORMATION:
Medical Conditions: ${summary.personalInfo.medicalInfo.conditions}
Current Medications: ${summary.personalInfo.medicalInfo.medications}
Physician Approval: ${summary.personalInfo.medicalInfo.physicianApproval}

ACKNOWLEDGMENTS:
☑ I understand the risks involved in exercise participation
☑ I voluntarily assume full responsibility for any risks
☑ I agree to follow all instructions and exercise within my limits
☑ I agree to report any injuries or adverse reactions immediately
☑ I release the AI Workout Generator from all liability

ELECTRONIC SIGNATURE:
Signature: ${summary.signature.digitalSignature}
Date: ${summary.signature.signatureDate}

By providing this electronic signature, I acknowledge that I have read, understood, 
and agree to be bound by all terms of this liability waiver and release agreement.
  `.trim();
};

// Validate that all required acknowledgments are true
export const validateAcknowledgments = (waiverData: LiabilityWaiverData): boolean => {
  const requiredAcknowledgments = [
    'understandRisks',
    'assumeResponsibility', 
    'followInstructions',
    'reportInjuries',
    'releaseFromLiability'
  ];
  
  return requiredAcknowledgments.every(
    field => waiverData[field as keyof LiabilityWaiverData] === true
  );
};

// Get step progress details
export const getStepProgress = (step: number, waiverData: LiabilityWaiverData) => {
  const stepFields = {
    1: ['fullName', 'dateOfBirth', 'emergencyContactName', 'emergencyContactPhone'],
    2: ['understandRisks', 'assumeResponsibility', 'followInstructions', 'reportInjuries'],
    3: ['releaseFromLiability', 'signature', 'signatureDate']
  };
  
  const fields = stepFields[step as keyof typeof stepFields] || [];
  const completed = fields.filter(field => {
    const value = waiverData[field as keyof LiabilityWaiverData];
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value.trim().length > 0;
    return false;
  }).length;
  
  return {
    completed,
    total: fields.length,
    percentage: Math.round((completed / fields.length) * 100)
  };
}; 