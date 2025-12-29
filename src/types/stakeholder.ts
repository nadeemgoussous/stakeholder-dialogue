// Stakeholder Profile Schema
// Based on CLAUDE.md and STAKEHOLDER-PROFILES.md
// Enhanced with interaction triggers, context profiles, and variants

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

  // ENHANCED: Multi-metric interaction triggers
  interactionTriggers?: InteractionTrigger[];

  // ENHANCED: Variant profiles (conservative/progressive/pragmatic)
  variants?: Record<StakeholderVariant, VariantProfile>;

  // ENHANCED: Expanded response templates with conditional support
  expandedResponseTemplates?: ExpandedResponseTemplate[];

  // ENHANCED: Context-specific adjustments by development stage
  contextAdjustments?: {
    [context in DevelopmentContext]?: {
      priorityShifts: { priority: string; weight: number }[];
      additionalConcerns?: string[];
    };
  };
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

// ============================================================================
// ENHANCED STAKEHOLDER TYPES
// Multi-metric interactions, context awareness, and variant personalities
// ============================================================================

// Development context for threshold adjustments
export type DevelopmentContext = 'least-developed' | 'emerging' | 'developed';

// Stakeholder personality variants
export type StakeholderVariant = 'conservative' | 'progressive' | 'pragmatic';

// Multi-metric condition for interaction triggers
export interface MetricCondition {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
}

// Interaction trigger - combines multiple metrics
export interface InteractionTrigger {
  id: string;
  metrics: MetricCondition[];
  operator: 'AND' | 'OR';
  type: 'concern' | 'appreciation'; // Distinguishes positive from negative triggers
  concernText: string; // Will be renamed to 'text' in future, but keeping for compatibility
  explanation: string;
  suggestedResponse: string;
}

// Threshold modifier for context profiles
export interface ThresholdModifier {
  metric: string;
  multiplier: number;
  rationale: string;
}

// Priority shift for context profiles
export interface PriorityShift {
  stakeholder: string;
  priorityAdjustments: { priority: string; weight: number }[];
}

// Context profile - adjusts behavior by development stage
export interface ContextProfile {
  id: DevelopmentContext;
  name: string;
  description: string;
  thresholdModifiers: ThresholdModifier[];
  priorityShifts: PriorityShift[];
}

// Conditional support for expanded responses
export interface ConditionalSupport {
  condition: string;
  supportStatement: string;
  requirements: string[];
}

// Broader context for expanded responses
export interface BroaderContext {
  alignsWith?: string[];
  conflictsWith?: string[];
  regionalImplications?: string;
}

// Next steps for expanded responses
export interface NextStep {
  action: string;
  responsible: string;
  timeline: string;
}

// Quantitative anchor for expanded responses
export interface QuantitativeAnchor {
  metric: string;
  value: number;
  unit: string;
  comparison: string;
  implication: string;
}

// Expanded response template with additional fields
export interface ExpandedResponseTemplate {
  condition: string;
  initialReaction: string;
  appreciationPoints: string[];
  concernPoints: string[];
  questionsToAsk: string[];
  conditionalSupport?: ConditionalSupport;
  broaderContext?: BroaderContext;
  nextSteps?: NextStep[];
  quantitativeAnchors?: QuantitativeAnchor[];
}

// Tone adjustment for variant profiles
export interface ToneAdjustment {
  riskTolerance: 'low' | 'medium' | 'high';
  changeOpenness: 'resistant' | 'cautious' | 'embracing';
  collaborationStyle: 'defensive' | 'transactional' | 'partnership';
}

// Variant profile - personality variations within stakeholder group
export interface VariantProfile {
  variant: StakeholderVariant;
  description: string;
  thresholdModifiers: { metric: string; multiplier: number }[];
  toneAdjustment: ToneAdjustment;
  framingPreference: string;
}
