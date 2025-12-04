// Adjustment Calculator Schema
// Based on DATA-SCHEMAS.md
// DIRECTIONAL ONLY - NOT precise calculations

export interface AdjustableParameters {
  // Only high-level, non-technical adjustments
  renewableShareTarget2030: number;    // % (slider 0-100)
  renewableShareTarget2040: number;    // % (slider 0-100)

  // Approximate investment level (qualitative only)
  investmentLevel: 'low' | 'base' | 'high';

  // Timeline adjustments
  coalPhaseoutYear: number | null;     // Year or null for no phase-out
}

export interface DirectionalImpacts {
  jobs: DirectionalChange;
  landUse: DirectionalChange;
  emissions: DirectionalChange;
  stakeholderSentiment: Record<string, SentimentChange>;
}

export interface DirectionalChange {
  direction: 'increase' | 'decrease' | 'unchanged';
  magnitude: 'negligible' | 'moderate' | 'significant';
  explanation: string;
}

export interface SentimentChange {
  direction: 'more_positive' | 'more_negative' | 'unchanged';
  positiveFactors: string[];
  negativeFactors: string[];
}
