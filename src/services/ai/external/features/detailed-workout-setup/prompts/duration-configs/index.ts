import { TWENTY_MIN_CONFIG } from './20min.config';
import { THIRTY_MIN_CONFIG } from './30min.config';
import { FORTYFIVE_MIN_CONFIG } from './45min.config';
import { SIXTY_MIN_CONFIG } from './60min.config';
import { NINETY_MIN_CONFIG } from './90min.config';
import { ONE_TWENTY_MIN_CONFIG } from './120min.config';
import { ONE_FIFTY_MIN_CONFIG } from './150min.config';

export const DURATION_CONFIGS = {
  20: TWENTY_MIN_CONFIG,
  30: THIRTY_MIN_CONFIG,
  45: FORTYFIVE_MIN_CONFIG,
  60: SIXTY_MIN_CONFIG,
  90: NINETY_MIN_CONFIG,
  120: ONE_TWENTY_MIN_CONFIG,
  150: ONE_FIFTY_MIN_CONFIG
} as const;

export type SupportedDuration = keyof typeof DURATION_CONFIGS; 