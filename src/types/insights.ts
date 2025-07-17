// Shared insight types used across rating and AI modules
export interface AIInsight {
  type: 'critical_warning' | 'warning' | 'opportunity';
  message: string;
  recommendation: string;
} 