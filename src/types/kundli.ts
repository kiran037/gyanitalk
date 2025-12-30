// src/types/kundli.ts

export interface BirthDetails {
  name: string;
  contactNo: string;
  countryCode: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM (24hr)
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number | string; // Accept both, will be converted to string for DB
  language?: 'hi' | 'en' | 'ta' | 'te' | 'mr' | 'bn' | 'gu' | 'kn' | 'ml' | 'or' | 'pa';
}

export interface IntakeFormData {
  name: string;
  contactNo: string;
  countryCode: string;
  gender: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  userId?: number;
  maritalStatus?: string;
  occupation?: string;
  topicOfConcern?: string;
}

export interface KundliSession {
  sessionId: string;
  userId?: number;
  intakeFormId?: number;
  kundliData: any;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
}

export interface PaidKundliRequest {
  intakeFormId: number;
  reportType: 'small' | 'ai_prediction' | 'detailed' | 'year_prediction' | 'advanced';
  language: string;
}

export interface MatchingRequest {
  male: BirthDetails;
  female: BirthDetails;
  matchType: 'north' | 'south';
  language: string;
}

export interface RateLimitInfo {
  identifier: string;
  count: number;
  resetAt: Date;
}

export interface PricingOption {
  type: string;
  name: string;
  price: number;
  pages?: number;
  description: string;
  features: string[];
}

export const KUNDLI_PRICING: Record<string, PricingOption> = {
  small: {
    type: 'small',
    name: 'Basic Report',
    price: 99,
    pages: 15,
    description: 'Essential planetary positions and predictions',
    features: [
      'Birth chart with planetary positions',
      'Basic predictions for career and relationships',
      'Planetary strengths and weaknesses',
      'Auspicious time periods',
      'Lucky gemstone recommendations'
    ]
  },
  ai_prediction: {
    type: 'ai_prediction',
    name: 'AI-Powered Analysis',
    price: 199,
    pages: 25,
    description: 'Advanced AI-based personalized predictions',
    features: [
      'Everything in Basic Report',
      'AI-powered detailed life predictions',
      'Personality analysis based on planets',
      'Career path recommendations',
      'Relationship compatibility insights',
      'Health and wellness guidance'
    ]
  },
  detailed: {
    type: 'detailed',
    name: 'Detailed Report',
    price: 299,
    pages: 40,
    description: 'Comprehensive analysis with dashas and yogas',
    features: [
      'Everything in AI-Powered Analysis',
      'Vimshottari Dasha predictions',
      'Yogas and planetary combinations',
      'Dosha analysis (Mangal, Kaal Sarp, etc.)',
      'Remedies and gemstone recommendations',
      'Transit predictions for next 2 years'
    ]
  },
  year_prediction: {
    type: 'year_prediction',
    name: 'Year Prediction',
    price: 399,
    pages: 50,
    description: 'Month-by-month predictions for the year',
    features: [
      'Everything in Detailed Report',
      'Month-by-month predictions for 1 year',
      'Important dates and events',
      'Career opportunities timeline',
      'Financial forecast',
      'Health precautions by month',
      'Relationship timeline'
    ]
  },
  advanced: {
    type: 'advanced',
    name: 'Premium Complete',
    price: 599,
    pages: 75,
    description: 'Most comprehensive report with all analyses',
    features: [
      'Everything in Year Prediction',
      'Detailed divisional charts (D9, D10, D12)',
      'Past life karma analysis',
      'Spiritual path guidance',
      'Advanced remedies and rituals',
      'Numerology analysis',
      '5-year predictions',
      'Free consultation call (15 mins)'
    ]
  }
};

export const MATCHING_PRICING: PricingOption = {
  type: 'detailed_matching',
  name: 'Detailed Matching Report',
  price: 199,
  pages: 30,
  description: 'Complete compatibility analysis with detailed report',
  features: [
    'Ashtakoot Guna Milan (36 points)',
    'Detailed Guna breakdown',
    'Mangal Dosha analysis',
    'Dasha compatibility',
    'Children prospects',
    'Remedies for doshas',
    'Best marriage dates and muhurat',
    'Detailed PDF report'
  ]
};

export const FREE_LIMITS = {
  withoutLogin: 3,
  withLogin: 5,
  resetHours: 24
};

// Helper type for saved kundli in localStorage
export interface SavedKundli {
  name: string;
  contactNo: string;
  countryCode: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string; // Always string for consistency
  gender: 'male' | 'female' | 'other';
}

// Response types
export interface KundliGenerateResponse {
  success: boolean;
  data?: {
    sessionId: string;
    intakeFormId: number;
    kundaliId: number;
    userId: number;
    kundli: {
      name: string;
      birthDate: string;
      birthTime: string;
      birthPlace: string;
      ascendant: string;
      moonSign: string;
      sunSign: string;
      planetPositions: any[];
      houses: any[];
    };
    chart?: string;
  };
  isFreeTier: boolean;
  remainingFreeGenerations: number;
  resetAt: Date;
  upgradeToPaid?: {
    message: string;
    options: PricingOption[];
  };
  error?: string;
  message?: string;
  meta?: {
    totalApis: number;
    successfulApis: number;
    failedApis: number;
    generationTime: string;
  };
}

export interface PaidKundliResponse {
  success: boolean;
  data?: {
    kundaliId: number;
    pdfUrl: string;
    reportType: string;
    transactionId: number;
  };
  payment?: {
    amountDeducted: number;
    currentBalance: number;
  };
  error?: string;
  message?: string;
  requiresLogin?: boolean;
  requiresPayment?: boolean;
  currentBalance?: number;
  requiredAmount?: number;
}

// Helper function to normalize timezone
export function normalizeTimezone(timezone: number | string): string {
  if (typeof timezone === 'number') {
    return timezone.toString();
  }
  return timezone;
}

// Helper function to parse timezone for API calls
export function parseTimezoneForAPI(timezone: number | string): string {
  const normalized = normalizeTimezone(timezone);
  // Ensure it's in valid format (e.g., "5.5" not "5.50")
  return parseFloat(normalized).toString();
}