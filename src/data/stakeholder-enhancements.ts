/**
 * STAKEHOLDER PROFILE ENHANCEMENTS
 *
 * This module extends the base stakeholder profiles with:
 * 1. Multi-metric interaction triggers
 * 2. Development context profiles (LDC, emerging, developed)
 * 3. Stakeholder variants (conservative, progressive, pragmatic)
 * 4. Expanded response templates with conditional support
 * 5. Response generation helpers
 *
 * These enhancements enable more sophisticated, context-aware
 * stakeholder responses that account for:
 * - Complex metric combinations (e.g., high RE + low storage)
 * - Country development stage
 * - Individual stakeholder personalities
 * - Quantitative anchors and next steps
 */

import type {
  InteractionTrigger,
  DevelopmentContext,
  ContextProfile,
  StakeholderVariant,
  VariantProfile,
} from '../types/stakeholder';

// NOTE: These types are defined but not yet implemented:
// ExpandedResponseTemplate, ThresholdModifier, PriorityShift,
// ConditionalSupport, BroaderContext, NextStep, QuantitativeAnchor
// They remain in types/stakeholder.ts for future enhancement features

// ============================================================================
// 1. INTERACTION TRIGGERS (Multi-metric conditions)
// ============================================================================

/**
 * POLICY MAKERS & REGULATORS
 * Concerned with political feasibility, climate commitments, and affordability
 */
export const policyMakersInteractions: InteractionTrigger[] = [
  {
    id: 'ambitious-but-expensive',
    metrics: [
      { metric: 'renewableShare.2030', threshold: 60, direction: 'above' },
      { metric: 'investment.cumulative.2030', threshold: 5000, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'High renewable ambition combined with substantial investment requirements raises affordability and feasibility questions.',
    explanation: 'Policy makers must balance climate leadership with fiscal constraints and consumer affordability.',
    suggestedResponse: 'We support the renewable ambition, but need a clear financing strategy that doesn\'t compromise energy access or burden consumers. What instruments can mobilize private capital to reduce fiscal pressure?'
  },
  {
    id: 'jobs-transition-mismatch',
    metrics: [
      { metric: 'supply.capacity.coal.2030', threshold: 50, direction: 'below' },
      { metric: 'jobs.renewable.2030', threshold: 5000, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Rapid coal phase-out without corresponding renewable job creation creates political risks.',
    explanation: 'Employment is a key political priority. Fossil fuel job losses must be compensated by clean energy job creation.',
    suggestedResponse: 'The coal phase-out pace concerns us politically. Where is the just transition strategy? We need local content requirements and reskilling programs before accelerating thermal retirements.'
  },
  {
    id: 'ndc-achievement-risk',
    metrics: [
      { metric: 'emissions.reductionPercent2030', threshold: 20, direction: 'below' },
      { metric: 'supply.capacity.coal.2040', threshold: 500, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Modest emissions reduction alongside continued coal expansion jeopardizes NDC compliance and climate commitments.',
    explanation: 'International climate commitments create reputational and financial risks if not met.',
    suggestedResponse: 'This trajectory puts our NDC at risk. We need clarity on how this aligns with Paris commitments and what it means for climate finance access.'
  }
];

/**
 * GRID OPERATORS
 * Concerned with system reliability, intermittency management, and infrastructure readiness
 */
export const gridOperatorsInteractions: InteractionTrigger[] = [
  {
    id: 'intermittency-risk',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 60, direction: 'above' },
      { metric: 'supply.capacity.battery.2040', threshold: 200, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
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
    type: 'concern',
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
    type: 'concern',
    concernText: 'Rapid thermal retirement without compensating flexibility creates reliability concerns.',
    explanation: 'Dispatchable capacity provides system inertia and reserves. Retirement pace must align with flexibility resource deployment.',
    suggestedResponse: 'We need a clear flexibility roadmap before accelerating coal retirements. Either battery deployment must increase or interconnector expansion must be prioritized.'
  }
];

/**
 * INDUSTRY & BUSINESS
 * Concerned with energy costs, supply reliability, and investment climate
 */
export const industryInteractions: InteractionTrigger[] = [
  {
    id: 'cost-competitiveness-risk',
    metrics: [
      { metric: 'investment.cumulative.2030', threshold: 5000, direction: 'above' },
      { metric: 'supply.capacity.battery.2030', threshold: 100, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'High investment costs without sufficient energy storage could increase tariffs and affect industrial competitiveness.',
    explanation: 'Industry needs predictable, affordable, and reliable power. High tariffs from expensive transition threaten competitiveness.',
    suggestedResponse: 'We need guarantees that tariff increases will be managed. Consider phased implementation and industrial tariff protections during transition.'
  },
  {
    id: 'supply-chain-opportunity',
    metrics: [
      { metric: 'supply.capacity.solarPV.2040', threshold: 1500, direction: 'above' },
      { metric: 'supply.capacity.wind.2040', threshold: 800, direction: 'above' }
    ],
    operator: 'OR',
    type: 'appreciation', // Business opportunity
    concernText: 'Large renewable deployment creates supply chain and manufacturing opportunities if local content policies are implemented.',
    explanation: 'Significant renewable buildouts can catalyze domestic manufacturing and create high-value jobs.',
    suggestedResponse: 'This renewable trajectory is an opportunity for industrial development. What local content requirements will be mandated? We want to see clear pathways for domestic manufacturing participation.'
  },
  {
    id: 'reliability-concerns',
    metrics: [
      { metric: 'renewableShare.2030', threshold: 50, direction: 'above' },
      { metric: 'supply.capacity.gas.2030', threshold: 200, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'High renewable share with limited dispatchable backup raises concerns about supply reliability for industrial processes.',
    explanation: 'Energy-intensive industries require 24/7 reliable power. VRE growth must be matched with dispatchable capacity or storage.',
    suggestedResponse: 'We support clean energy, but need assurances on power quality and reliability. Our processes cannot tolerate frequent outages or voltage fluctuations.'
  }
];

/**
 * PUBLIC & COMMUNITIES
 * Concerned with health impacts, affordability, and local benefits
 */
export const publicInteractions: InteractionTrigger[] = [
  {
    id: 'clean-air-victory',
    metrics: [
      { metric: 'supply.capacity.coal.2035', threshold: 100, direction: 'below' },
      { metric: 'renewableShare.2035', threshold: 60, direction: 'above' }
    ],
    operator: 'AND',
    type: 'appreciation', // Positive health outcomes
    concernText: 'Rapid coal retirement and renewable growth dramatically improves air quality and public health outcomes.',
    explanation: 'Coal pollution causes respiratory illness, premature deaths, and healthcare costs. Clean energy transition delivers immediate health benefits.',
    suggestedResponse: 'This is what we\'ve been advocating for! The health benefits from reduced coal pollution will save thousands of lives and reduce healthcare burdens on families.'
  },
  {
    id: 'affordability-threat',
    metrics: [
      { metric: 'investment.cumulative.2030', threshold: 8000, direction: 'above' },
      { metric: 'investment.privateSectorShare', threshold: 40, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Large public investment could increase electricity tariffs, burdening households.',
    explanation: 'Consumers are sensitive to electricity price increases, especially low-income households.',
    suggestedResponse: 'We support clean energy, but are worried about affordability. What protections exist for vulnerable households? Will there be lifeline tariffs or subsidy programs?'
  },
  {
    id: 'infrastructure-impacts',
    metrics: [
      { metric: 'land.total.2040', threshold: 5000, direction: 'above' },
      { metric: 'supply.capacity.solarPV.2040', threshold: 2000, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Large-scale renewable projects require significant land, potentially affecting communities and livelihoods.',
    explanation: 'Solar and wind farms can displace agricultural land, affect property values, and change community character.',
    suggestedResponse: 'We need to understand where these projects will be located. Have communities been consulted? What compensation and benefit-sharing arrangements are planned?'
  }
];

/**
 * CSOs & NGOs
 * Concerned with climate ambition, just transition, and environmental justice
 */
export const csosNgosInteractions: InteractionTrigger[] = [
  {
    id: 'stranded-workers',
    metrics: [
      { metric: 'supply.capacity.coal.2030', threshold: 50, direction: 'below' },
      { metric: 'jobs.fossilFuel.transition.support', threshold: 1, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
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
    type: 'concern',
    concernText: 'Significant gas expansion alongside weak 2050 targets suggests lock-in risk.',
    explanation: 'New gas infrastructure has 30-40 year lifetimes. Building now risks stranded assets or continued emissions.',
    suggestedResponse: 'The gas buildout concerns us. What is the decommissioning timeline for this infrastructure, and how does it align with Paris-compatible pathways?'
  },
  {
    id: 'climate-leadership',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 80, direction: 'above' },
      { metric: 'emissions.reductionPercent2040', threshold: 50, direction: 'above' }
    ],
    operator: 'AND',
    type: 'appreciation', // This is positive feedback, not a concern
    concernText: 'This scenario demonstrates strong climate leadership and positions the country as a regional clean energy champion.',
    explanation: 'Ambitious renewable targets and emissions reductions align with 1.5°C pathways and unlock international support.',
    suggestedResponse: 'This is the kind of climate ambition we need! This plan could position the country as a regional leader and unlock substantial climate finance. We fully support this trajectory.'
  }
];

/**
 * SCIENTIFIC INSTITUTIONS
 * Concerned with evidence-based pathways, feasibility validation, and research opportunities
 */
export const scientificInteractions: InteractionTrigger[] = [
  {
    id: 'model-validation-needed',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 75, direction: 'above' },
      { metric: 'supply.capacity.battery.2040', threshold: 200, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'This renewable penetration level exceeds typical flexibility thresholds. Detailed dispatch modeling needed to validate feasibility.',
    explanation: 'High VRE shares without sufficient storage may encounter stability limits not captured in planning models.',
    suggestedResponse: 'We recommend detailed power system simulations to validate this renewable trajectory. Our institute can support hourly dispatch modeling and grid stability analysis.'
  },
  {
    id: 'research-collaboration-opportunity',
    metrics: [
      { metric: 'supply.capacity.wind.2040', threshold: 1000, direction: 'above' },
      { metric: 'supply.capacity.solarPV.2040', threshold: 2000, direction: 'above' }
    ],
    operator: 'OR',
    type: 'appreciation', // Research opportunity
    concernText: 'Large-scale renewable deployment creates valuable research opportunities on grid integration, forecasting, and optimization.',
    explanation: 'Major transitions generate data and insights valuable for academic research and regional knowledge sharing.',
    suggestedResponse: 'This transition presents significant research opportunities. We propose a collaborative monitoring program to track integration challenges and share lessons regionally.'
  },
  {
    id: 'paris-alignment-check',
    metrics: [
      { metric: 'emissions.reductionPercent2040', threshold: 40, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Emissions trajectory may be insufficient for 1.5°C alignment. Carbon budget analysis recommended.',
    explanation: 'Scientific consensus requires steep near-term emissions reductions for Paris alignment.',
    suggestedResponse: 'Our modeling suggests this trajectory exceeds safe carbon budgets. We recommend accelerating the transition timeline or strengthening 2030 milestones.'
  }
];

/**
 * FINANCIAL INSTITUTIONS
 * Concerned with bankability, execution risk, and return predictability
 */
export const financeInteractions: InteractionTrigger[] = [
  {
    id: 'execution-risk',
    metrics: [
      { metric: 'investment.cumulative.2030', threshold: 5000, direction: 'above' },
      { metric: 'investment.yearOverYearGrowth', threshold: 50, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Rapid investment scaling creates execution and absorption capacity risks.',
    explanation: 'Very fast investment ramps can overwhelm institutional capacity, creating project delays and cost overruns.',
    suggestedResponse: 'This investment timeline is aggressive. What evidence exists that the enabling environment (permitting, grid access, skilled labor) can absorb this pace? We need confidence in execution capacity before committing capital.'
  },
  {
    id: 'policy-stability-concern',
    metrics: [
      { metric: 'renewableShare.2030', threshold: 50, direction: 'above' },
      { metric: 'investment.privateSectorShare', threshold: 60, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'High private sector reliance for ambitious targets requires stable, long-term policy frameworks.',
    explanation: 'Private capital requires regulatory certainty and credible offtake agreements.',
    suggestedResponse: 'We can mobilize this capital if the policy framework is credible. Are long-term PPAs available? What revenue guarantees exist? Currency risk hedging?'
  },
  {
    id: 'green-finance-opportunity',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 70, direction: 'above' },
      { metric: 'emissions.reductionPercent2040', threshold: 50, direction: 'above' }
    ],
    operator: 'AND',
    type: 'appreciation', // This is positive feedback, not a concern
    concernText: 'Strong decarbonization trajectory unlocks green bonds, climate funds, and concessional finance opportunities.',
    explanation: 'Ambitious climate-aligned pathways attract lower-cost capital from ESG-focused investors and climate funds.',
    suggestedResponse: 'This trajectory qualifies for substantial green finance. We see opportunities for green bond issuance and blended finance structures. Let\'s discuss innovative financial instruments.'
  }
];

/**
 * REGIONAL BODIES
 * Concerned with cross-border trade, interconnection planning, and regional harmonization
 */
export const regionalBodiesInteractions: InteractionTrigger[] = [
  {
    id: 'regional-trade-opportunity',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 70, direction: 'above' },
      { metric: 'supply.capacity.hydro.total', threshold: 500, direction: 'above' }
    ],
    operator: 'AND',
    type: 'appreciation', // Regional integration opportunity
    concernText: 'High renewable share with strong hydro resources creates valuable cross-border trading opportunities.',
    explanation: 'Countries with flexible hydro can provide balancing services to neighbors with high VRE, creating mutual benefits.',
    suggestedResponse: 'This energy mix positions you as a potential regional balancing hub. We should discuss interconnector expansion and wheeling agreements to enable cross-border trade.'
  },
  {
    id: 'interconnection-mismatch',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 65, direction: 'above' },
      { metric: 'supply.capacity.interconnector.2040', threshold: 200, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'High renewable ambition without corresponding interconnection investment limits regional integration benefits.',
    explanation: 'Interconnectors enable resource sharing and system cost reduction but require coordinated planning.',
    suggestedResponse: 'Your renewable ambition aligns with the regional master plan, but interconnection investment appears insufficient. We recommend accelerating cross-border transmission projects.'
  },
  {
    id: 'master-plan-alignment',
    metrics: [
      { metric: 'supply.capacity.total.2040', threshold: 3000, direction: 'above' }
    ],
    operator: 'AND',
    type: 'concern',
    concernText: 'Large-scale generation expansion should be coordinated with regional generation planning to avoid overcapacity.',
    explanation: 'Uncoordinated national plans can lead to regional oversupply and stranded assets.',
    suggestedResponse: 'This expansion is substantial. Let\'s ensure alignment with the regional generation master plan to optimize investments across borders.'
  }
];

/**
 * DEVELOPMENT PARTNERS
 * Concerned with access, debt sustainability, and climate finance mobilization
 */
export const developmentPartnersInteractions: InteractionTrigger[] = [
  {
    id: 'debt-sustainability-risk',
    metrics: [
      { metric: 'investment.cumulative.2030', threshold: 5000, direction: 'above' },
      { metric: 'investment.sovereignGuaranteeShare', threshold: 40, direction: 'above' },
      { metric: 'investment.privateSectorShare', threshold: 30, direction: 'below' }
    ],
    operator: 'AND',
    type: 'concern',
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
    type: 'concern',
    concernText: 'High renewable ambition alongside access gaps suggests potential trade-off in resource allocation.',
    explanation: 'Universal access remains the primary SDG7 goal. Climate ambition should complement, not compete with, access investments.',
    suggestedResponse: 'We appreciate the climate ambition, but need to understand how this aligns with universal access timelines. Are resources being allocated efficiently across both objectives?'
  },
  {
    id: 'climate-finance-opportunity',
    metrics: [
      { metric: 'renewableShare.2040', threshold: 75, direction: 'above' },
      { metric: 'access.electrificationRate.2030', threshold: 95, direction: 'above' }
    ],
    operator: 'AND',
    type: 'appreciation', // Concessional finance opportunity
    concernText: 'Strong performance on both climate and access objectives unlocks significant concessional finance and results-based payments.',
    explanation: 'Scenarios that achieve both SDG7 and Paris alignment attract substantial development partner support.',
    suggestedResponse: 'This scenario achieves our dual priorities excellently. We can mobilize significant concessional resources, including climate funds and results-based finance. Let\'s discuss a coordinated support package.'
  }
];

// ============================================================================
// 2. DEVELOPMENT CONTEXT PROFILES
// Adjusts thresholds and priorities based on country development stage
// ============================================================================

export const contextProfiles: ContextProfile[] = [
  {
    id: 'least-developed',
    name: 'Least Developed Countries',
    description: 'Low electrification rates, limited grid infrastructure, high reliance on concessional financing.',
    thresholdModifiers: [
      {
        metric: 'renewableShare.2030',
        multiplier: 0.7,
        rationale: 'Access priorities may require faster deployment of any generation.'
      },
      {
        metric: 'investment.cumulative.2030',
        multiplier: 0.5,
        rationale: 'Smaller economies mean lower absolute investment needs trigger concerns.'
      },
      {
        metric: 'access.electrificationRate.2030',
        multiplier: 0.8,
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
        multiplier: 1.0,
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
        multiplier: 1.3,
        rationale: 'Higher expectations for wealthy economies.'
      },
      {
        metric: 'emissions.reductionPercent2030',
        multiplier: 1.4,
        rationale: 'Developed countries expected to lead on climate.'
      },
      {
        metric: 'supply.capacity.coal.2030',
        multiplier: 0.5,
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

// ============================================================================
// 3. STAKEHOLDER VARIANTS
// Personality variations within each stakeholder group
// ============================================================================

/**
 * POLICY MAKERS Variants
 */
export const policyMakersVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Prioritizes energy security and affordability, cautious on climate ambition.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.8 },
      { metric: 'emissions.reductionPercent2030', multiplier: 0.7 },
      { metric: 'jobs.total.2030', multiplier: 1.3 }
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
      { metric: 'renewableShare.2030', multiplier: 1.3 },
      { metric: 'emissions.reductionPercent2030', multiplier: 1.2 },
      { metric: 'investment.cumulative.2030', multiplier: 1.2 }
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

/**
 * GRID OPERATORS Variants
 */
export const gridOperatorsVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Emphasizes system security, prefers proven technologies, cautious on transition pace.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 0.8 },
      { metric: 'supply.capacity.battery.2040', multiplier: 1.3 },
      { metric: 'supply.capacity.coal.retirementRate', multiplier: 0.7 }
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
      { metric: 'renewableShare.2030', multiplier: 1.2 },
      { metric: 'supply.capacity.battery.2040', multiplier: 0.9 },
      { metric: 'supply.capacity.interconnector.2040', multiplier: 1.2 }
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
      { metric: 'investment.transmission.cumulative', multiplier: 1.1 },
      { metric: 'renewableShare.2030', multiplier: 1.0 },
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

/**
 * INDUSTRY Variants
 */
export const industryVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Prioritizes cost stability and reliability, cautious about transition impacts on competitiveness.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.8 },
      { metric: 'renewableShare.2030', multiplier: 0.9 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'resistant',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We need stable, affordable energy. Rapid transitions threaten industrial competitiveness.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Sees opportunities in clean energy supply chains, early adopter of corporate sustainability.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.2 },
      { metric: 'supply.capacity.solarPV.2040', multiplier: 1.3 }
    ],
    toneAdjustment: {
      riskTolerance: 'high',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'Clean energy transition creates supply chain opportunities. We want to be manufacturing leaders.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Balances sustainability goals with business viability, seeks phased transition.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'investment.cumulative.2030', multiplier: 1.0 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'We support clean energy if implementation is gradual and doesn\'t compromise reliability.'
  }
};

/**
 * PUBLIC & COMMUNITIES Variants
 */
export const publicVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Prioritizes affordability and skeptical of infrastructure disruption.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.7 },
      { metric: 'land.total.2040', multiplier: 0.8 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'resistant',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We want clean energy but can\'t afford higher electricity bills or disrupted communities.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Prioritizes health and climate benefits, willing to accept short-term disruption.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.3 },
      { metric: 'emissions.reductionPercent2040', multiplier: 1.2 }
    ],
    toneAdjustment: {
      riskTolerance: 'high',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'Clean air and climate action are worth the investment. Our children\'s future depends on this.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Supports clean energy with safeguards on affordability and community impacts.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'investment.cumulative.2030', multiplier: 1.0 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'We support the transition if vulnerable households are protected and communities benefit.'
  }
};

/**
 * CSOs & NGOs Variants
 */
export const csosNgosVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Emphasizes just transition and social protection, cautious on pace if workers at risk.',
    thresholdModifiers: [
      { metric: 'supply.capacity.coal.retirementRate', multiplier: 0.7 },
      { metric: 'jobs.fossilFuel.transition.support', multiplier: 1.5 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'cautious',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We support transition only if workers and communities are protected.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Champions rapid decarbonization and climate justice, maximalist on ambition.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.4 },
      { metric: 'emissions.reductionPercent2040', multiplier: 1.3 },
      { metric: 'supply.capacity.coal.2030', multiplier: 0.5 }
    ],
    toneAdjustment: {
      riskTolerance: 'high',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'Climate emergency demands maximum ambition. Half measures are insufficient.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Balances climate goals with social considerations, seeks inclusive pathways.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.1 },
      { metric: 'emissions.reductionPercent2030', multiplier: 1.1 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'We need ambitious climate action that leaves no one behind.'
  }
};

/**
 * SCIENTIFIC INSTITUTIONS Variants
 */
export const scientificVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Emphasizes rigorous validation, cautious about claims beyond modeling evidence.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 0.9 },
      { metric: 'supply.capacity.battery.2040', multiplier: 1.2 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'cautious',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We need comprehensive modeling validation before endorsing this trajectory.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Champions evidence-based climate action, willing to support ambitious scenarios.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.2 },
      { metric: 'emissions.reductionPercent2040', multiplier: 1.3 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'The science demands urgent action. This scenario aligns with climate imperatives.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Focuses on technical feasibility and practical implementation pathways.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'supply.capacity.battery.2040', multiplier: 1.0 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'Let\'s focus on what\'s technically achievable with available resources and technology.'
  }
};

/**
 * FINANCIAL INSTITUTIONS Variants
 */
export const financeVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Risk-averse, requires strong guarantees and proven business models.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.8 },
      { metric: 'investment.yearOverYearGrowth', multiplier: 0.7 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'resistant',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'We need strong guarantees and proven track records before deploying capital at scale.'
  },
  progressive: {
    variant: 'progressive',
    description: 'ESG-focused, willing to accept green premium for climate-aligned investments.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.3 },
      { metric: 'emissions.reductionPercent2040', multiplier: 1.2 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'Green investments align with our ESG mandates. We\'re ready to support ambitious climate action.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Balances returns with sustainability, seeks blended finance structures.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'investment.privateSectorShare', multiplier: 1.1 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'We can support this if risk-return profiles are acceptable and enabling conditions are met.'
  }
};

/**
 * REGIONAL BODIES Variants
 */
export const regionalBodiesVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Prioritizes coordination and avoiding unilateral actions that disrupt regional plans.',
    thresholdModifiers: [
      { metric: 'supply.capacity.interconnector.2040', multiplier: 1.3 },
      { metric: 'renewableShare.2030', multiplier: 0.9 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'cautious',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'National plans must align with regional master plans to avoid suboptimal outcomes.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Sees ambitious national plans as catalysts for regional transformation.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.2 },
      { metric: 'supply.capacity.interconnector.2040', multiplier: 1.3 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'Ambitious national plans can drive regional integration and create trade opportunities.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Focuses on practical coordination mechanisms and infrastructure optimization.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'supply.capacity.interconnector.2040', multiplier: 1.1 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'Let\'s coordinate to maximize regional benefits and avoid duplication.'
  }
};

/**
 * DEVELOPMENT PARTNERS Variants
 */
export const developmentPartnersVariants: Record<StakeholderVariant, VariantProfile> = {
  conservative: {
    variant: 'conservative',
    description: 'Emphasizes debt sustainability and fiscal prudence, cautious on ambitious programs.',
    thresholdModifiers: [
      { metric: 'investment.cumulative.2030', multiplier: 0.8 },
      { metric: 'investment.sovereignGuaranteeShare', multiplier: 0.7 }
    ],
    toneAdjustment: {
      riskTolerance: 'low',
      changeOpenness: 'cautious',
      collaborationStyle: 'defensive'
    },
    framingPreference: 'Debt sustainability must be preserved. We cannot support programs that create fiscal risks.'
  },
  progressive: {
    variant: 'progressive',
    description: 'Champions climate and access goals, willing to mobilize substantial concessional resources.',
    thresholdModifiers: [
      { metric: 'renewableShare.2040', multiplier: 1.3 },
      { metric: 'access.electrificationRate.2030', multiplier: 1.2 }
    ],
    toneAdjustment: {
      riskTolerance: 'high',
      changeOpenness: 'embracing',
      collaborationStyle: 'partnership'
    },
    framingPreference: 'This ambition aligns with our mandates. We can mobilize substantial support for dual access-climate goals.'
  },
  pragmatic: {
    variant: 'pragmatic',
    description: 'Balances ambition with fiscal realism, seeks efficient resource allocation.',
    thresholdModifiers: [
      { metric: 'renewableShare.2030', multiplier: 1.0 },
      { metric: 'access.electrificationRate.2030', multiplier: 1.1 }
    ],
    toneAdjustment: {
      riskTolerance: 'medium',
      changeOpenness: 'cautious',
      collaborationStyle: 'transactional'
    },
    framingPreference: 'We support this if implementation is realistic and resources are allocated efficiently.'
  }
};

// ============================================================================
// 4. RESPONSE GENERATION HELPERS
// ============================================================================

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
export function applyContextModifiers(
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
export function applyVariantModifiers(
  threshold: number,
  metric: string,
  stakeholder: string,
  variant: StakeholderVariant
): number {
  const variantMap: Record<string, Record<StakeholderVariant, VariantProfile>> = {
    'policy-makers': policyMakersVariants,
    'grid-operators': gridOperatorsVariants,
    'industry': industryVariants,
    'public': publicVariants,
    'csos-ngos': csosNgosVariants,
    'scientific': scientificVariants,
    'finance': financeVariants,
    'regional-bodies': regionalBodiesVariants,
    'development-partners': developmentPartnersVariants,
  };

  const variantProfile = variantMap[stakeholder]?.[variant];
  if (!variantProfile) return threshold;

  const modifier = variantProfile.thresholdModifiers.find(m => m.metric === metric);
  return modifier ? threshold * modifier.multiplier : threshold;
}

/**
 * Evaluates interaction triggers for a stakeholder
 */
export function evaluateInteractionTriggers(
  stakeholder: string,
  indicators: ScenarioIndicators,
  context: DevelopmentContext
): InteractionTrigger[] {
  const triggerMap: Record<string, InteractionTrigger[]> = {
    'policy-makers': policyMakersInteractions,
    'grid-operators': gridOperatorsInteractions,
    'industry': industryInteractions,
    'public': publicInteractions,
    'csos-ngos': csosNgosInteractions,
    'scientific': scientificInteractions,
    'finance': financeInteractions,
    'regional-bodies': regionalBodiesInteractions,
    'development-partners': developmentPartnersInteractions,
  };

  const triggers = triggerMap[stakeholder] || [];

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
 * Constructs a multi-layered response using interaction triggers and variant profile
 */
export function constructEnhancedResponse(config: ResponseGenerationConfig): string {
  const { stakeholder, variant, context, indicators } = config;

  // 1. Get triggered interactions
  const triggeredInteractions = evaluateInteractionTriggers(
    stakeholder,
    indicators,
    context
  );

  // 2. Get variant profile for tone
  const variantMap: Record<string, Record<StakeholderVariant, VariantProfile>> = {
    'policy-makers': policyMakersVariants,
    'grid-operators': gridOperatorsVariants,
    'industry': industryVariants,
    'public': publicVariants,
    'csos-ngos': csosNgosVariants,
    'scientific': scientificVariants,
    'finance': financeVariants,
    'regional-bodies': regionalBodiesVariants,
    'development-partners': developmentPartnersVariants,
  };

  const variantProfile = variantMap[stakeholder]?.[variant];

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
