// Stakeholder Profile Schema
// Based on CLAUDE.md and STAKEHOLDER-PROFILES.md

export interface StakeholderProfile {
  id: string;
  name: string;
  icon: string;                    // Path to toolkit icon
  color: string;                   // For UI consistency

  // From toolkit Chapter 3
  description: string;
  whyEngage: string;
  benefitForThem: string;
  challenges: string[];
  goodPractices: string[];

  // For response generation
  priorities: string[];
  typicalQuestions: string[];
  concernTriggers: ConcernTrigger[];
  positiveIndicators: PositiveIndicator[];

  // For rule-based responses
  responseTemplates: ResponseTemplate[];
}

export interface ConcernTrigger {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  concernText: string;
  explanation: string;
}

export interface PositiveIndicator {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  praiseText: string;
}

export interface ResponseTemplate {
  condition: string;           // e.g., "highInvestment"
  initialReaction: string;
  appreciationPoints: string[];
  concernPoints: string[];
  questionsToAsk: string[];
}

// Stakeholder IDs
export type StakeholderId =
  | 'policy-makers'
  | 'grid-operators'
  | 'industry'
  | 'public'
  | 'csos-ngos'
  | 'scientific'
  | 'finance'
  | 'regional-bodies'
  | 'development-partners';
