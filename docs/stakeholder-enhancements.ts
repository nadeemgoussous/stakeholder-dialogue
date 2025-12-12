// ============================================================================
// STAKEHOLDER PROFILE ENHANCEMENTS
// Additions to the existing STAKEHOLDER-PROFILES.md framework
// ============================================================================

// ----------------------------------------------------------------------------
// 1. INTERACTION TRIGGERS
// Captures metric combinations that trigger specific concerns
// ----------------------------------------------------------------------------

interface InteractionTrigger {
  id: string;
  metrics: MetricCondition[];
  operator: 'AND' | 'OR';
  concernText: string;
  explanation: string;
  suggestedResponse: string;
}

interface MetricCondition {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
}

// Example interaction triggers by stakeholder
const gridOperatorInteractions: InteractionTrigger[] = [
  {
    id: 'intermittency-risk',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 60, direction: 'above' },
      { metric: 'supply.capacity.battery.2040', threshold: 200, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'High renewable penetration without adequate storage creates system balancing challenges.',
    explanation: 'Variable generation requires flexibility resources. Without sufficient battery capacity, curtailment increases and reliability risks emerge.',
    suggestedResponse: 'We support the renewable ambition, but the storage deployment timeline needs acceleration. Consider front-loading battery investments or expanding interconnector capacity for regional balancing.'
  },
  {
    id: 'transmission-bottleneck',
    metrics: [
      { metric: 'supply.capacity.solarPV.2035', threshold: 1000, direction: 'above' },
      { metric: 'investment.transmission.2035', threshold: 500, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'Large solar deployment with limited transmission investment risks stranded capacity.',
    explanation: 'Solar resources are often geographically concentrated. Insufficient grid expansion leads to congestion and curtailment.',
    suggestedResponse: 'The generation buildout is ambitious, but transmission planning appears disconnected. We recommend a coordinated infrastructure roadmap before committing to this solar trajectory.'
  },
  {
    id: 'flexibility-gap',
    metrics: [
      { metric: 'supply.capacity.coal.retirementRate', threshold: 10, direction: 'above' },
      { metric: 'supply.capacity.battery.CAGR', threshold: 15, direction: 'below' },
      { metric: 'supply.capacity.interconnector.2035', threshold: 300, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'Rapid thermal retirement without compensating flexibility creates reliability concerns.',
    explanation: 'Dispatchable capacity provides system inertia and reserves. Retirement pace must align with flexibility resource deployment.',
    suggestedResponse: 'We need a clear flexibility roadmap before accelerating coal retirements. Either battery deployment must increase or interconnector expansion must be prioritized.'
  }
];

const developmentPartnerInteractions: InteractionTrigger[] = [
  {
    id: 'debt-sustainability-risk',
    metrics: [
      { metric: 'investment.cumulative.2030', threshold: 5000, direction: 'above' },
      { metric: 'investment.sovereignGuaranteeShare', threshold: 40, direction: 'above' },
      { metric: 'investment.privateSectorShare', threshold: 30, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'Large investment needs with high sovereign exposure and limited private participation raises debt sustainability concerns.',
    explanation: 'Development partners assess fiscal sustainability and contingent liabilities. Heavy reliance on sovereign guarantees constrains future borrowing capacity.',
    suggestedResponse: 'We need to see a credible private sector mobilization strategy before committing concessional resources at this scale. Consider risk mitigation instruments to reduce sovereign exposure.'
  },
  {
    id: 'access-climate-tension',
    metrics: [
      { metric: 'access.electrificationRate.2030', threshold: 90, direction: 'below' },
      { metric: 'renewableShare.2030', threshold: 70, direction: 'above' }
    ],
    operator: 'AND',
    concernText: 'High renewable ambition alongside access gaps suggests potential trade-off in resource allocation.',
    explanation: 'Universal access remains the primary SDG7 goal. Climate ambition should complement, not compete with, access investments.',
    suggestedResponse: 'We appreciate the climate ambition, but need to understand how this aligns with universal access timelines. Are resources being allocated efficiently across both objectives?'
  }
];

const csosNgosInteractions: InteractionTrigger[] = [
  {
    id: 'stranded-workers',
    metrics: [
      { metric: 'supply.capacity.coal.2030', threshold: 50, direction: 'below' },
      { metric: 'jobs.fossilFuel.transition.support', threshold: 1, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'Rapid coal phase-out without just transition provisions creates social risks.',
    explanation: 'Workers and communities dependent on fossil fuel industries need retraining, social protection, and economic diversification support.',
    suggestedResponse: 'We support the coal phase-out timeline, but this plan lacks a credible just transition framework. What provisions exist for affected workers and communities?'
  },
  {
    id: 'false-solution-risk',
    metrics: [
      { metric: 'supply.capacity.gas.2040', threshold: 500, direction: 'above' },
      { metric: 'emissions.reductionPercent2050', threshold: 80, direction: 'below' }
    ],
    operator: 'AND',
    concernText: 'Significant gas expansion alongside weak 2050 targets suggests lock-in risk.',
    explanation: 'New gas infrastructure has 30-40 year lifetimes. Building now risks stranded assets or continued emissions.',
    suggestedResponse: 'The gas buildout concerns us. What is the decommissioning timeline for this infrastructure, and how does it align with Paris-compatible pathways?'
  }
];

// ----------------------------------------------------------------------------
// 2. CONTEXT PROFILES
// Adjusts thresholds and priorities based on country development stage
// ----------------------------------------------------------------------------

type DevelopmentContext = 'least-developed' | 'emerging' | 'developed';

interface ContextProfile {
  id: DevelopmentContext;
  name: string;
  description: string;
  thresholdModifiers: ThresholdModifier[];
  priorityShifts: PriorityShift[];
}

interface ThresholdModifier {
  metric: string;
  multiplier: number;  // Applied to base threshold
  rationale: string;
}

interface PriorityShift {
  stakeholder: string;
  priorityAdjustments: { priority: string; weight: number }[];
}

const contextProfiles: ContextProfile[] = [
  {
    id: 'least-developed',
    name: 'Least Developed Countries',
    description: 'Low electrification rates, limited grid infrastructure, high reliance on concessional financing.',
    thresholdModifiers: [
      {
        metric: 'renewableShare.2030',
        multiplier: 0.7,  // Lower threshold (e.g., 50% becomes 35%)
        rationale: 'Access priorities may require faster deployment of any generation.'
      },
      {
        metric: 'investment.cumulative.2030',
        multiplier: 0.5,  // Lower threshold - smaller investments are significant
        rationale: 'Smaller economies mean lower absolute investment needs trigger concerns.'
      },
      {
        metric: 'access.electrificationRate.2030',
        multiplier: 0.8,  // Lower threshold - 80% becomes 64%
        rationale: 'Starting from low base, even 60-70% is ambitious.'
      },
      {
        metric: 'supply.capacity.battery.2040',
        multiplier: 0.5,
        rationale: 'Grid-scale storage is expensive; lower expectations for LDCs.'
      }
    ],
    priorityShifts: [
      {
        stakeholder: 'policy-makers',
        priorityAdjustments: [
          { priority: 'Energy access', weight: 1.5 },
          { priority: 'Affordability', weight: 1.3 },
          { priority: 'Climate commitments', weight: 0.8 }
        ]
      },
      {
        stakeholder: 'development-partners',
        priorityAdjustments: [
          { priority: 'Universal energy access', weight: 1.5 },
          { priority: 'Debt sustainability', weight: 1.3 },
          { priority: 'Climate impact', weight: 0.9 }
        ]
      }
    ]
  },
  {
    id: 'emerging',
    name: 'Emerging Economies',
    description: 'Growing demand, mixed generation portfolio, increasing private sector participation.',
    thresholdModifiers: [
      {
        metric: 'renewableShare.2030',
        multiplier: 1.0,  // Base thresholds apply
        rationale: 'Standard expectations for emerging economies.'
      },
      {
        metric: 'investment.privateSectorShare',
        multiplier: 1.0,
        rationale: 'Market maturity enables private participation.'
      },
      {
        metric: 'supply.capacity.coal.retirementRate',
        multiplier: 0.8,
        rationale: 'Existing coal assets may require managed transition.'
      }
    ],
    priorityShifts: [
      {
        stakeholder: 'industry',
        priorityAdjustments: [
          { priority: 'Competitive energy costs', weight: 1.3 },
          { priority: 'Supply reliability', weight: 1.2 },
          { priority: 'Local manufacturing', weight: 1.1 }
        ]
      },
      {
        stakeholder: 'finance',
        priorityAdjustments: [
          { priority: 'Currency risk', weight: 1.2 },
          { priority: 'Policy stability', weight: 1.3 }
        ]
      }
    ]
  },
  {
    id: 'developed',
    name: 'Developed Countries',
    description: 'High electrification, mature markets, focus on decarbonization and system transformation.',
    thresholdModifiers: [
      {
        metric: 'renewableShare.2030',
        multiplier: 1.3,  // Higher threshold - 50% becomes 65%
        rationale: 'Higher expectations for wealthy economies.'
      },
      {
        metric: 'emissions.reductionPercent2030',
        multiplier: 1.4,
        rationale: 'Developed countries expected to lead on climate.'
      },
      {
        metric: 'supply.capacity.coal.2030',
        multiplier: 0.5,  // Lower threshold - less coal acceptable
        rationale: 'Coal phase-out should be faster in developed economies.'
      }
    ],
    priorityShifts: [
      {
        stakeholder: 'csos-ngos',
        priorityAdjustments: [
          { priority: 'Climate ambition', weight: 1.4 },
          { priority: 'Just transition', weight: 1.2 }
        ]
      },
      {
        stakeholder: 'scientific',
        priorityAdjustments: [
          { priority: 'Paris alignment', weight: 1.3 },
          { priority: 'Sector coupling', weight: 1.2 }
        ]
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 3. EXPANDED RESPONSE TEMPLATES
// Adds conditional support, broader context, and next steps
// ----------------------------------------------------------------------------

interface ExpandedResponseTemplate {
  condition: string;
  
  // Existing fields
  initialReaction: string;
  appreciationPoints: string[];
  concernPoints: string[];
  questionsToAsk: string[];
  
  // New fields
  conditionalSupport?: ConditionalSupport;
  broaderContext?: BroaderContext;
  nextSteps?: NextStep[];
  quantitativeAnchors?: QuantitativeAnchor[];
}

interface ConditionalSupport {
  condition: string;           // "If X happens..."
  supportStatement: string;    // "...we would support this"
  requirements: string[];      // Specific requirements
}

interface BroaderContext {
  alignsWith?: string[];       // Policies/plans this aligns with
  conflictsWith?: string[];    // Policies/plans this conflicts with
  regionalImplications?: string;
}

interface NextStep {
  action: string;
  responsible: string;
  timeline: string;
}

interface QuantitativeAnchor {
  metric: string;
  value: number;
  unit: string;
  comparison: string;          // "1.5x our threshold", "below regional average"
  implication: string;
}

// Example expanded template for Grid Operators
const gridOperatorExpandedTemplates: ExpandedResponseTemplate[] = [
  {
    condition: 'highRenewableWithLowStorage',
    
    initialReaction: 'This renewable trajectory is ambitious. We need to discuss the flexibility strategy.',
    
    appreciationPoints: [
      'Clear commitment to clean energy transition',
      'Recognition of grid modernization needs'
    ],
    
    concernPoints: [
      'Storage deployment timeline appears disconnected from VRE growth',
      'Interconnector capacity may be insufficient for regional balancing',
      'System inertia concerns as synchronous generation declines'
    ],
    
    questionsToAsk: [
      'What flexibility resources beyond batteries are being considered?',
      'How will frequency response be maintained with reduced thermal fleet?',
      'What is the assumed curtailment rate in system modeling?'
    ],
    
    conditionalSupport: {
      condition: 'If battery deployment is front-loaded to 2030',
      supportStatement: 'We could support this renewable trajectory',
      requirements: [
        'Battery capacity reaches 500 MW by 2030 (vs. current 200 MW target)',
        'Interconnector expansion proceeds in parallel',
        'Demand response programs are operationalized by 2028'
      ]
    },
    
    broaderContext: {
      alignsWith: [
        'Regional Master Plan renewable targets',
        'Climate commitments under NDC'
      ],
      conflictsWith: [
        'Current Grid Development Plan 2025-2030 (assumes slower VRE growth)',
        'Utility financial recovery program (cost implications)'
      ],
      regionalImplications: 'May require renegotiation of interconnector wheeling agreements with neighbors.'
    },
    
    nextSteps: [
      {
        action: 'Joint technical working group on flexibility requirements',
        responsible: 'Grid operator + Ministry',
        timeline: 'Within 3 months'
      },
      {
        action: 'Detailed transmission expansion study',
        responsible: 'Grid operator',
        timeline: 'Within 6 months'
      },
      {
        action: 'Interconnector coordination meeting with neighbors',
        responsible: 'Regional body facilitation',
        timeline: 'Before Q3 2025'
      }
    ],
    
    quantitativeAnchors: [
      {
        metric: 'renewableShare.2040',
        value: 75,
        unit: '%',
        comparison: '1.5x current grid code limits for non-synchronous penetration',
        implication: 'Grid code revision required before this level is achievable'
      },
      {
        metric: 'supply.capacity.battery.2040',
        value: 200,
        unit: 'MW',
        comparison: '40% below what similar systems have deployed at this VRE level',
        implication: 'Significant curtailment risk without storage acceleration'
      }
    ]
  }
];

// Example expanded template for Development Partners
const developmentPartnerExpandedTemplates: ExpandedResponseTemplate[] = [
  {
    condition: 'highInvestmentWithAccessGaps',
    
    initialReaction: 'This is a substantial investment program. We need to understand the access and climate balance.',
    
    appreciationPoints: [
      'Comprehensive planning approach',
      'Recognition of climate finance opportunities',
      'Private sector mobilization targets'
    ],
    
    concernPoints: [
      'Universal access timeline appears secondary to grid-scale investments',
      'Sovereign guarantee exposure is concerning given debt levels',
      'Off-grid/mini-grid allocation seems insufficient for last-mile access'
    ],
    
    questionsToAsk: [
      'What is the access investment breakdown (grid extension vs. off-grid)?',
      'How will the financing gap be addressed?',
      'What risk mitigation instruments are being considered?'
    ],
    
    conditionalSupport: {
      condition: 'If universal access receives proportionate investment allocation',
      supportStatement: 'We could mobilize significant concessional resources',
      requirements: [
        'Minimum 30% of investment allocated to access (grid + off-grid)',
        'Clear private sector mobilization roadmap',
        'Sovereign guarantee exposure capped at 25% of total investment'
      ]
    },
    
    broaderContext: {
      alignsWith: [
        'Country Partnership Framework priorities',
        'Climate Investment Plan',
        'Regional integration objectives'
      ],
      conflictsWith: [
        'IMF debt sustainability recommendations',
        'Current guarantee headroom constraints'
      ],
      regionalImplications: 'Success here could unlock similar programs in neighboring countries.'
    },
    
    nextSteps: [
      {
        action: 'Access investment deep-dive',
        responsible: 'Government + World Bank',
        timeline: 'Within 2 months'
      },
      {
        action: 'Guarantee structure workshop',
        responsible: 'Development partners coordination group',
        timeline: 'Within 4 months'
      },
      {
        action: 'Private sector roundtable',
        responsible: 'IFC + local finance ministry',
        timeline: 'Before next donor conference'
      }
    ],
    
    quantitativeAnchors: [
      {
        metric: 'investment.cumulative.2030',
        value: 8500,
        unit: 'million USD',
        comparison: '2.3x current annual ODA flows to the sector',
        implication: 'Requires significant scale-up of development partner engagement'
      },
      {
        metric: 'access.electrificationRate.2030',
        value: 72,
        unit: '%',
        comparison: '18 percentage points below universal access',
        implication: 'SDG7 achievement at risk without acceleration'
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 4. STAKEHOLDER VARIANTS
// Captures diversity within stakeholder groups
// ----------------------------------------------------------------------------

type StakeholderVariant = 'conservative' | 'progressive' | 'pragmatic';

interface VariantProfile {
  variant: StakeholderVariant;
  description: string;
  thresholdModifiers: { metric: string; multiplier: number }[];
  toneAdjustment: ToneAdjustment;
  framingPreference: string;
}

interface ToneAdjustment {
  riskTolerance: 'low' | 'medium' | 'high';
  changeOpenness: 'resistant' | 'cautious' | 'embracing';
  collaborationStyle: 'defensive' | 'transactional' | 'partnership';
}

// Example variants for Grid Operators
const gridOperatorVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Emphasizes system security, prefers proven technologies, cautious on transition pace.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 0.8 },      // Concerns trigger earlier
      { metric: 'supply.capacity.battery.2040', multiplier: 1.3 }, // Wants more storage
      { metric: 'supply.capacity.coal.retirementRate', multiplier: 0.7 } // Slower retirement OK
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'cautious',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'System security must not be compromised. We need proven solutions before scaling.'
  },
  
  progressive: {
    variant: 'progressive',
    description: 'Sees opportunity in transition, open to innovation, willing to accept managed risk.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.2 },      // Higher tolerance
      { metric: 'supply.capacity.battery.2040', multiplier: 0.9 }, // Less storage required
      { metric: 'supply.capacity.interconnector.2040', multiplier: 1.2 } // Wants more interconnection
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'This transition creates opportunities for grid modernization. We should lead, not follow.'
  },
  
  pragmatic: {
    variant: 'pragmatic',
    description: 'Focuses on costs and practical implementation, seeks balanced solutions.',
    thresholdModifiers: [
      { metric: 'investment.transmission.cumulative', multiplier: 1.1 }, // Cost-conscious
      { metric: 'renewableShare.2030', multiplier: 1.0 },      // Baseline
      { metric: 'supply.capacity.battery.2040', multiplier: 1.0 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'Let\'s focus on what\'s achievable within budget and timeline constraints.'
  }
};

// Example variants for Policy Makers
const policyMakerVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Prioritizes energy security and affordability, cautious on climate ambition.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.8 }, // Lower investment tolerance
      { metric: 'emissions.reductionPercent2030', multiplier: 0.7 }, // Less ambitious OK
      { metric: 'jobs.total.2030', multiplier: 1.3 } // Wants more jobs
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'resistant',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We cannot compromise energy security or burden consumers with high costs.'
  },
  
  progressive: {
    variant: 'progressive',
    description: 'Champions climate leadership, willing to accept transition costs for long-term benefits.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.3 }, // Wants more renewables
      { metric: 'emissions.reductionPercent2030', multiplier: 1.2 }, // More ambitious
      { metric: 'investment.cumulative.2030', multiplier: 1.2 } // Higher investment acceptable
    ],
    toneAdjustment: {
      riskTolerance: 'high',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'This is our opportunity to demonstrate climate leadership and attract green investment.'
  },
  
  pragmatic: {
    variant: 'pragmatic',
    description: 'Balances multiple objectives, seeks politically feasible pathways.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 1.0 },
      { metric: 'jobs.total.2030', multiplier: 1.1 },
      { metric: 'emissions.reductionPercent2030', multiplier: 1.0 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'We need a plan that delivers on multiple fronts and can survive political cycles.'
  }
};

// ----------------------------------------------------------------------------
// 5. RESPONSE GENERATION HELPERS
// Functions to assemble sophisticated responses
// ----------------------------------------------------------------------------

interface ScenarioIndicators {
  [metric: string]: number;
}

interface ResponseGenerationConfig {
  stakeholder: string;
  variant: StakeholderVariant;
  context: DevelopmentContext;
  indicators: ScenarioIndicators;
}

/**
 * Applies context modifiers to base thresholds
 */
function applyContextModifiers(
  baseThreshold: number,
  metric: string,
  context: DevelopmentContext
): number {
  const profile = contextProfiles.find(p => p.id === context);
  if (!profile) return baseThreshold;
  
  const modifier = profile.thresholdModifiers.find(m => m.metric === metric);
  return modifier ? baseThreshold * modifier.multiplier : baseThreshold;
}

/**
 * Applies variant modifiers to adjusted thresholds
 */
function applyVariantModifiers(
  threshold: number,
  metric: string,
  stakeholder: string,
  variant: StakeholderVariant
): number {
  // Get the appropriate variant profile based on stakeholder
  let variantProfile: VariantProfile | undefined;
  
  if (stakeholder === 'grid-operators') {
    variantProfile = gridOperatorVariants[variant];
  } else if (stakeholder === 'policy-makers') {
    variantProfile = policyMakerVariants[variant];
  }
  // Add other stakeholders as needed
  
  if (!variantProfile) return threshold;
  
  const modifier = variantProfile.thresholdModifiers.find(m => m.metric === metric);
  return modifier ? threshold * modifier.multiplier : threshold;
}

/**
 * Evaluates interaction triggers for a stakeholder
 */
function evaluateInteractionTriggers(
  stakeholder: string,
  indicators: ScenarioIndicators,
  context: DevelopmentContext
): InteractionTrigger[] {
  let triggers: InteractionTrigger[] = [];
  
  if (stakeholder === 'grid-operators') {
    triggers = gridOperatorInteractions;
  } else if (stakeholder === 'development-partners') {
    triggers = developmentPartnerInteractions;
  } else if (stakeholder === 'csos-ngos') {
    triggers = csosNgosInteractions;
  }
  
  return triggers.filter(trigger => {
    const metricResults = trigger.metrics.map(condition => {
      const adjustedThreshold = applyContextModifiers(
        condition.threshold,
        condition.metric,
        context
      );
      const value = indicators[condition.metric] || 0;
      
      if (condition.direction === 'above') {
        return value > adjustedThreshold;
      } else {
        return value < adjustedThreshold;
      }
    });
    
    if (trigger.operator === 'AND') {
      return metricResults.every(r => r);
    } else {
      return metricResults.some(r => r);
    }
  });
}

/**
 * Constructs a multi-layered response
 */
function constructResponse(config: ResponseGenerationConfig): string {
  const { stakeholder, variant, context, indicators } = config;
  
  // 1. Get triggered interactions
  const triggeredInteractions = evaluateInteractionTriggers(
    stakeholder,
    indicators,
    context
  );
  
  // 2. Get variant profile for tone
  let variantProfile: VariantProfile | undefined;
  if (stakeholder === 'grid-operators') {
    variantProfile = gridOperatorVariants[variant];
  } else if (stakeholder === 'policy-makers') {
    variantProfile = policyMakerVariants[variant];
  }
  
  // 3. Build response sections
  const sections: string[] = [];
  
  // Opening framing based on variant
  if (variantProfile) {
    sections.push(`**Framing:** ${variantProfile.framingPreference}`);
  }
  
  // Triggered concerns with explanations
  if (triggeredInteractions.length > 0) {
    sections.push('\n**Key Concerns:**');
    triggeredInteractions.forEach(trigger => {
      sections.push(`- ${trigger.concernText}`);
      sections.push(`  *${trigger.explanation}*`);
    });
  }
  
  // Suggested responses
  if (triggeredInteractions.length > 0) {
    sections.push('\n**Our Position:**');
    triggeredInteractions.forEach(trigger => {
      sections.push(`"${trigger.suggestedResponse}"`);
    });
  }
  
  return sections.join('\n');
}

// ----------------------------------------------------------------------------
// 6. UPDATED STAKEHOLDER PROFILE INTERFACE
// Enhanced interface incorporating all additions
// ----------------------------------------------------------------------------

interface EnhancedStakeholderProfile {
  // Existing fields from STAKEHOLDER-PROFILES.md
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  whyEngage: string;
  benefitForThem: string;
  challenges: string[];
  goodPractices: string[];
  priorities: string[];
  typicalQuestions: string[];
  concernTriggers: ConcernTrigger[];
  positiveIndicators: PositiveIndicator[];
  responseTemplates: ResponseTemplate[];
  
  // NEW: Interaction triggers
  interactionTriggers: InteractionTrigger[];
  
  // NEW: Variant profiles
  variants: Record<StakeholderVariant, VariantProfile>;
  
  // NEW: Expanded response templates
  expandedResponseTemplates: ExpandedResponseTemplate[];
  
  // NEW: Context-specific adjustments
  contextAdjustments?: {
    [context in DevelopmentContext]?: {
      priorityShifts: { priority: string; weight: number }[];
      additionalConcerns?: string[];
    };
  };
}

// Existing interfaces for reference
interface ConcernTrigger {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  concernText: string;
  explanation: string;
}

interface PositiveIndicator {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  praiseText: string;
}

interface ResponseTemplate {
  condition: string;
  initialReaction: string;
  appreciationPoints: string[];
  concernPoints: string[];
  questionsToAsk: string[];
}

// ----------------------------------------------------------------------------
// EXPORT
// ----------------------------------------------------------------------------

export {
  // Types
  InteractionTrigger,
  MetricCondition,
  DevelopmentContext,
  ContextProfile,
  ThresholdModifier,
  PriorityShift,
  ExpandedResponseTemplate,
  ConditionalSupport,
  BroaderContext,
  NextStep,
  QuantitativeAnchor,
  StakeholderVariant,
  VariantProfile,
  ToneAdjustment,
  EnhancedStakeholderProfile,
  
  // Data
  contextProfiles,
  gridOperatorInteractions,
  developmentPartnerInteractions,
  csosNgosInteractions,
  gridOperatorVariants,
  policyMakerVariants,
  gridOperatorExpandedTemplates,
  developmentPartnerExpandedTemplates,
  
  // Functions
  applyContextModifiers,
  applyVariantModifiers,
  evaluateInteractionTriggers,
  constructResponse
};
