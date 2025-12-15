/**
 * Stakeholder Profiles for IRENA Scenario Dialogue Tool
 *
 * Based on IRENA's Participatory Processes for Strategic Energy Planning toolkit
 * Chapter 3: Stakeholder Engagement
 *
 * This file contains detailed profiles for 9 stakeholder groups that energy planners
 * typically engage with during scenario development and communication.
 */

import type { StakeholderProfile } from '../types/stakeholder';

/**
 * 1. Policy Makers & Regulators
 * Government officials responsible for energy policy, laws, and regulations
 */
export const policyMakers: StakeholderProfile = {
  id: 'policy-makers',
  name: 'Policy Makers & Regulators',
  icon: 'icons/policy-makers.svg',
  color: '#c94f4f',

  description: 'Government officials responsible for laws, policies and regulations across energy, transport, industry, environment, and climate-focused departments.',

  whyEngage: 'Active involvement throughout scenario development keeps scenarios relevant, realistic and aligned with policy needs.',

  benefitForThem: 'Understanding scenario trade-offs helps decision making and assessment of policy measure implications.',

  challenges: [
    'Limited understanding of scenario concept and purpose',
    'Balancing different political visions and priorities',
    'Not necessarily energy system specialists',
    'Time constraints limit engagement capacity'
  ],

  goodPractices: [
    'Prepare succinct briefs addressing direct concerns',
    'Explain what modelling can and cannot do',
    'Use non-biased intermediaries to facilitate',
    'Conduct capacity-building for decision-makers'
  ],

  priorities: [
    'Alignment with national development goals',
    'Energy security and reliability',
    'Affordability for consumers',
    'Political feasibility',
    'Job creation and economic development',
    'Climate commitment compliance (e.g., NDCs, net-zero targets)'
  ],

  typicalQuestions: [
    'How does this align with our climate commitments?',
    'What are the implications for electricity tariffs?',
    'How many jobs will be created?',
    'What is the timeline for key investment decisions?',
    'How does this compare to regional peers?'
  ],

  concernTriggers: [
    {
      metric: 'investment.cumulative.2050',
      threshold: 10000,
      direction: 'above',
      concernText: 'The total investment requirement of {value} million USD is substantial.',
      explanation: 'Policy makers need to understand financing strategy and fiscal implications.'
    },
    {
      metric: 'jobs.total.2030',
      threshold: 2000,
      direction: 'below',
      concernText: 'Job creation appears limited with only {value} jobs by 2030.',
      explanation: 'Employment is a key political priority.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'jobs.total.2030',
      threshold: 5000,
      direction: 'above',
      praiseText: 'Strong job creation potential of {value} jobs supports employment goals.'
    },
    {
      metric: 'emissions.reductionPercent2030',
      threshold: 20,
      direction: 'above',
      praiseText: 'Significant emissions reduction of {value}% demonstrates climate leadership.'
    }
  ],

  responseTemplates: [
    {
      condition: 'highInvestment',
      initialReaction: 'This is an ambitious plan. We need to understand the financing strategy.',
      appreciationPoints: [
        'Clear long-term vision for the sector',
        'Alignment with regional integration goals'
      ],
      concernPoints: [
        'Total investment requirement needs careful fiscal planning',
        'Timeline for major decisions needs political alignment'
      ],
      questionsToAsk: [
        'What is the proposed financing mix (public/private/concessional)?',
        'What are the tariff implications for households?',
        'How does this align with our fiscal space?'
      ]
    }
  ]
};

/**
 * 2. Grid Operators
 * Entities responsible for operating and developing power networks
 */
export const gridOperators: StakeholderProfile = {
  id: 'grid-operators',
  name: 'Grid Operators',
  icon: 'icons/grid-operators.svg',
  color: '#4a90a4',

  description: 'Entities responsible for operating and developing power networks (transmission and distribution).',

  whyEngage: 'Deep understanding of grid dynamics, infrastructure limitations and operational challenges. Technical expertise and real-time data make them essential for grid stability.',

  benefitForThem: 'Ensuring their development plans are considered in national planning and that plans are consistent with infrastructure capabilities.',

  challenges: [
    'Established mid-term plans may conflict with scenarios',
    'Weak collaboration across voltage levels',
    'Grid role often underestimated by policy makers',
    'Need to reconcile multiple operator perspectives'
  ],

  goodPractices: [
    'Engage early to incorporate existing plans',
    'Include distribution-level operators',
    'Involve regulators for grid permits',
    'Prioritize cost-efficient solutions'
  ],

  priorities: [
    'System reliability and security of supply',
    'Manageable renewable integration pace',
    'Transmission infrastructure planning',
    'Interconnector development coordination',
    'Storage and flexibility resources'
  ],

  typicalQuestions: [
    'What transmission upgrades are assumed?',
    'What flexibility resources support high renewable shares?',
    'How are interconnector flows coordinated with neighbors?',
    'What is the battery storage deployment timeline?',
    'How will distribution networks handle new loads?'
  ],

  concernTriggers: [
    {
      metric: 'renewableShare.2040',
      threshold: 70,
      direction: 'above',
      concernText: 'Variable renewable share of {value}% by 2040 requires significant grid upgrades.',
      explanation: 'Grid operators need time and investment for infrastructure adaptation.'
    },
    {
      metric: 'supply.capacity.battery.2035',
      threshold: 100,
      direction: 'below',
      concernText: 'Limited battery storage of {value} MW may constrain renewable integration.',
      explanation: 'Flexibility resources are essential for variable renewable management.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'supply.capacity.interconnector.2040',
      threshold: 500,
      direction: 'above',
      praiseText: 'Strong interconnector expansion of {value} MW enables regional balancing.'
    },
    {
      metric: 'supply.capacity.battery.2040',
      threshold: 300,
      direction: 'above',
      praiseText: 'Adequate battery deployment of {value} MW supports system flexibility.'
    }
  ],

  responseTemplates: []
};

/**
 * 3. Industry & Business
 * Energy-intensive industries, manufacturers, renewable energy developers
 */
export const industry: StakeholderProfile = {
  id: 'industry',
  name: 'Industry & Business',
  icon: 'icons/industry.svg',
  color: '#7b8a3e',

  description: 'Energy-intensive industries, manufacturers, SMEs, renewable energy developers, and energy service providers.',

  whyEngage: 'Central to energy transition due to significant energy use, emissions, and innovation potential. Technical expertise on decarbonization barriers.',

  benefitForThem: 'Preserve business interests, anticipate policy changes, position competitively, support climate disclosures.',

  challenges: [
    'Diverse interests across industrial sectors',
    'Competitiveness concerns about energy costs',
    'Limited capacity for engagement',
    'Short-term focus vs long-term planning'
  ],

  goodPractices: [
    'Segment by industry type for targeted engagement',
    'Highlight opportunities alongside challenges',
    'Involve industry associations',
    'Provide early visibility into policy direction'
  ],

  priorities: [
    'Reliable electricity supply',
    'Competitive energy costs',
    'Predictable policy environment',
    'Clean energy supply chain opportunities',
    'Realistic demand growth assumptions'
  ],

  typicalQuestions: [
    'What are the projected industrial electricity costs?',
    'How reliable will supply be for continuous operations?',
    'What local manufacturing opportunities exist?',
    'Are industrial demand projections realistic?',
    'What incentives exist for industrial efficiency?'
  ],

  concernTriggers: [
    {
      metric: 'investment.cumulative.2030',
      threshold: 3000,
      direction: 'above',
      concernText: 'High investment costs of {value} million USD may translate to higher industrial tariffs.',
      explanation: 'Industry competitiveness depends on energy costs.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'supply.capacity.solarPV.2030',
      threshold: 500,
      direction: 'above',
      praiseText: 'Large solar pipeline of {value} MW creates opportunities for local businesses.'
    },
    {
      metric: 'jobs.construction.total',
      threshold: 10000,
      direction: 'above',
      praiseText: 'Significant construction activity of {value} job-years benefits local contractors.'
    }
  ],

  responseTemplates: []
};

/**
 * 4. Public & Communities
 * General public, local communities, indigenous communities
 */
export const publicCommunities: StakeholderProfile = {
  id: 'public',
  name: 'Public & Communities',
  icon: 'icons/public.svg',
  color: '#e8a54b',

  description: 'General public, local communities affected by infrastructure, indigenous communities, and vulnerable households.',

  whyEngage: 'Essential for social acceptance and just transition. Local knowledge identifies barriers and opportunities.',

  benefitForThem: 'Ensuring concerns are heard, participating in decisions affecting their lives, benefiting from local opportunities.',

  challenges: [
    'Diverse and fragmented stakeholder landscape',
    'Power imbalances in participation',
    'Limited technical capacity',
    'Time and resource constraints for engagement'
  ],

  goodPractices: [
    'Use accessible language and formats',
    'Ensure geographic representation',
    'Provide capacity building support',
    'Demonstrate how input influenced decisions'
  ],

  priorities: [
    'Electricity access and affordability',
    'Local jobs and economic benefits',
    'Land use impacts',
    'Fair distribution of costs and benefits',
    'Health and environmental improvements'
  ],

  typicalQuestions: [
    'How will this affect electricity bills?',
    'Will there be jobs for local people?',
    'What land will be used for projects?',
    'How will affected communities be supported?',
    'When will our area get electricity?'
  ],

  concernTriggers: [
    {
      metric: 'landUse.totalNewLand.2040',
      threshold: 10000,
      direction: 'above',
      concernText: 'Large land requirements of {value} hectares affect many communities.',
      explanation: 'Land acquisition is often contentious and requires careful consultation.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'jobs.operations.2040',
      threshold: 3000,
      direction: 'above',
      praiseText: 'Permanent jobs of {value} positions provide stable employment for communities.'
    },
    {
      metric: 'emissions.reductionPercent2040',
      threshold: 50,
      direction: 'above',
      praiseText: 'Major air quality improvements from {value}% emissions reduction benefit public health.'
    }
  ],

  responseTemplates: []
};

/**
 * 5. CSOs & NGOs
 * Civil society organizations, environmental groups, advocacy organizations
 */
export const csosNgos: StakeholderProfile = {
  id: 'csos-ngos',
  name: 'CSOs & NGOs',
  icon: 'icons/csos-ngos.svg',
  color: '#6b4c9a',

  description: 'Trade unions, environmental groups, humanitarian organizations, charities, and think tanks working on energy, climate, and development.',

  whyEngage: 'Represent public interests, provide evidence-based research, highlight overlooked issues, can support or oppose projects.',

  benefitForThem: 'Ensuring representation of social and environmental concerns, shaping a just transition.',

  challenges: [
    'Diverse agendas across organizations',
    'May advocate for positions beyond technical feasibility',
    'Resource constraints limit participation',
    'Balancing advocacy with constructive engagement'
  ],

  goodPractices: [
    'Engage early and transparently',
    'Acknowledge legitimate concerns',
    'Provide access to technical data',
    'Create space for alternative perspectives'
  ],

  priorities: [
    'Climate ambition and Paris alignment',
    'Just transition for workers',
    'Environmental protection',
    'Energy access for vulnerable populations',
    'Transparency in planning',
    'Gender equity'
  ],

  typicalQuestions: [
    'Is this scenario Paris-compatible?',
    'What happens to fossil fuel workers?',
    'How were communities consulted?',
    'What environmental assessments are planned?',
    'How does this address energy poverty?'
  ],

  concernTriggers: [
    {
      metric: 'supply.emissions.2050',
      threshold: 30,
      direction: 'above',
      concernText: 'Remaining emissions of {value} Mt CO2 in 2050 may be incompatible with net-zero.',
      explanation: 'CSOs focus on climate ambition and long-term targets.'
    },
    {
      metric: 'renewableShare.2030',
      threshold: 50,
      direction: 'below',
      concernText: 'Renewable share of {value}% appears unambitious.',
      explanation: 'CSOs often advocate for faster transition.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'emissions.reductionPercent.2050',
      threshold: 80,
      direction: 'above',
      praiseText: 'Deep emissions reduction of {value}% shows serious climate commitment.'
    },
    {
      metric: 'renewableShare.2040',
      threshold: 80,
      direction: 'above',
      praiseText: 'Ambitious renewable share of {value}% aligns with climate science.'
    }
  ],

  responseTemplates: []
};

/**
 * 6. Scientific Institutions
 * Universities, research institutions, energy experts
 */
export const scientificInstitutions: StakeholderProfile = {
  id: 'scientific',
  name: 'Scientific Institutions',
  icon: 'icons/scientific.svg',
  color: '#3d7ea6',

  description: 'Universities, research institutions, energy experts, economists, and social scientists.',

  whyEngage: 'Build modelling capacity, provide expertise and feedback, enable robust scenarios through rigorous methodologies.',

  benefitForThem: 'Policy impact, funding opportunities, data access, partnerships with decision makers.',

  challenges: [
    'Academic timelines vs policy deadlines',
    'Balancing rigor with policy relevance',
    'Limited resources for engagement',
    'Competing research priorities'
  ],

  goodPractices: [
    'Involve early in methodology design',
    'Provide access to data and models',
    'Support peer review processes',
    'Acknowledge contributions publicly'
  ],

  priorities: [
    'Methodological rigor',
    'Data quality and transparency',
    'Uncertainty quantification',
    'Model validation',
    'Alignment with research findings'
  ],

  typicalQuestions: [
    'What are the key uncertainties?',
    'How sensitive are results to assumptions?',
    'What discount rate was used?',
    'Has the model been validated?',
    'What are the technology cost assumptions?'
  ],

  concernTriggers: [
    {
      metric: 'supply.capacity.solarPV.CAGR',
      threshold: 25,
      direction: 'above',
      concernText: 'Solar growth rate of {value}% exceeds historical precedents.',
      explanation: 'Scientists scrutinize whether assumptions are evidence-based.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'methodology.sensitivityIncluded',
      threshold: 1,
      direction: 'above',
      praiseText: 'Sensitivity analysis strengthens confidence in results.'
    }
  ],

  responseTemplates: []
};

/**
 * 7. Financial Institutions
 * Banks, DFIs, MDBs, climate funds, investors
 */
export const financialInstitutions: StakeholderProfile = {
  id: 'finance',
  name: 'Financial Institutions',
  icon: 'icons/finance.svg',
  color: '#2e5a3a',

  description: 'Banks, DFIs, MDBs, climate funds, private equity, and institutional investors.',

  whyEngage: 'Critical for mobilizing capital. Risk assessments shape what projects are bankable.',

  benefitForThem: 'Visibility into policy direction and pipeline, opportunity to shape bankable structures.',

  challenges: [
    'Risk aversion and return requirements',
    'Currency and sovereign risk concerns',
    'Limited familiarity with sector specifics',
    'Long approval processes'
  ],

  goodPractices: [
    'Present clear project pipelines',
    'Address risk mitigation explicitly',
    'Highlight revenue certainty mechanisms',
    'Involve early in project structuring'
  ],

  priorities: [
    'Project bankability',
    'Revenue certainty (PPAs, offtake)',
    'Currency and sovereign risk',
    'Policy stability',
    'ESG compliance',
    'Climate finance eligibility'
  ],

  typicalQuestions: [
    'What is the financing gap?',
    'What offtake arrangements are assumed?',
    'How will currency risk be managed?',
    'What guarantees provide revenue certainty?',
    'Are projects IFC/Equator Principles compliant?'
  ],

  concernTriggers: [
    {
      metric: 'investment.cumulative.2030',
      threshold: 5000,
      direction: 'above',
      concernText: 'Large financing requirements of {value} million USD need clear mobilization strategy.',
      explanation: 'Financiers assess whether investment needs are realistic.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'supply.capacity.solarPV.2030',
      threshold: 500,
      direction: 'above',
      praiseText: 'Significant solar pipeline of {value} MW is increasingly bankable.'
    }
  ],

  responseTemplates: []
};

/**
 * 8. Regional Bodies
 * Power pools, economic communities, regional integration bodies
 */
export const regionalBodies: StakeholderProfile = {
  id: 'regional-bodies',
  name: 'Regional Bodies',
  icon: 'icons/regional-bodies.svg',
  color: '#1a5276',

  description: 'Regional power pools, economic communities, regional development banks, and integration bodies coordinating cross-border energy cooperation.',

  whyEngage: 'Essential for cross-border trade, regulatory harmonization, and regional investment optimization.',

  benefitForThem: 'Ensuring national plans align with regional master plans, identifying trade opportunities.',

  challenges: [
    'Coordinating multiple national interests',
    'Varying levels of member state capacity',
    'Limited enforcement mechanisms',
    'Funding constraints for regional infrastructure'
  ],

  goodPractices: [
    'Align with regional master plans',
    'Coordinate timing with neighbors',
    'Share data and assumptions',
    'Highlight regional benefits'
  ],

  priorities: [
    'Alignment with regional master plans',
    'Cross-border trade optimization',
    'Interconnector coordination',
    'Regional reserve sharing',
    'Technical standard harmonization'
  ],

  typicalQuestions: [
    'How do projections align with regional master plans?',
    'What interconnector flows are assumed?',
    'Is there coordination with neighbors on timing?',
    'What regional reserve sharing is assumed?',
    'Are standards compatible with regional codes?'
  ],

  concernTriggers: [
    {
      metric: 'regional.importDependence.2040',
      threshold: 30,
      direction: 'above',
      concernText: 'High import dependence of {value}% raises regional coordination questions.',
      explanation: 'Regional bodies assess interdependencies and security.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'regional.exportPotential.2040',
      threshold: 2000,
      direction: 'above',
      praiseText: 'Export potential of {value} GWh positions country as regional clean energy hub.'
    },
    {
      metric: 'supply.capacity.interconnector.2040',
      threshold: 500,
      direction: 'above',
      praiseText: 'Strong interconnector capacity of {value} MW enables regional integration.'
    }
  ],

  responseTemplates: []
};

/**
 * 9. Development Partners
 * Bilateral agencies, multilateral banks, climate funds
 */
export const developmentPartners: StakeholderProfile = {
  id: 'development-partners',
  name: 'Development Partners',
  icon: 'icons/development-partners.svg',
  color: '#117a65',

  description: 'Bilateral agencies, multilateral development banks, climate funds, and technical assistance providers supporting energy transitions.',

  whyEngage: 'Major source of concessional financing. Their criteria shape what projects receive support.',

  benefitForThem: 'Alignment with country strategies, pipeline visibility, development impact demonstration.',

  challenges: [
    'Multiple partners with different priorities',
    'Complex approval and procurement processes',
    'Coordination across sectors',
    'Balancing development and financial goals'
  ],

  goodPractices: [
    'Align with partner country strategies',
    'Demonstrate development impact',
    'Address debt sustainability explicitly',
    'Coordinate across partner agencies'
  ],

  priorities: [
    'Universal energy access (SDG7)',
    'Climate impact and Paris alignment',
    'Debt sustainability',
    'Sovereign guarantee requirements',
    'Private sector mobilization',
    'Gender and social inclusion',
    'Institutional capacity building'
  ],

  typicalQuestions: [
    'How does this contribute to universal access?',
    'What is the climate mitigation impact?',
    'What is the debt sustainability analysis?',
    'Who is guaranteeing the PPAs?',
    'What sovereign exposure is required?',
    'How will private investment be mobilized?',
    'What capacity building is needed?',
    'How are gender considerations incorporated?'
  ],

  concernTriggers: [
    {
      metric: 'investment.cumulative.2030',
      threshold: 4000,
      direction: 'above',
      concernText: 'Large investment requirements of {value} million USD raise debt sustainability questions.',
      explanation: 'Development partners assess debt sustainability and guarantee exposure.'
    },
    {
      metric: 'access.electrificationRate.2030',
      threshold: 80,
      direction: 'below',
      concernText: 'Electrification trajectory of {value}% may fall short of universal access goals.',
      explanation: 'Universal access is a core development partner priority.'
    },
    {
      metric: 'investment.sovereignGuaranteeShare',
      threshold: 50,
      direction: 'above',
      concernText: 'High sovereign guarantee requirements of {value}% create fiscal risk.',
      explanation: 'Development partners monitor contingent liabilities closely.'
    }
  ],

  positiveIndicators: [
    {
      metric: 'emissions.reductionPercent2030',
      threshold: 30,
      direction: 'above',
      praiseText: 'Strong emissions reduction of {value}% supports climate finance eligibility.'
    },
    {
      metric: 'investment.privateSectorShare',
      threshold: 40,
      direction: 'above',
      praiseText: 'Significant private sector mobilization of {value}% reduces public financing burden.'
    }
  ],

  responseTemplates: []
};

/**
 * Export all stakeholder profiles as an array for iteration
 */
export const stakeholderProfiles: StakeholderProfile[] = [
  policyMakers,
  gridOperators,
  industry,
  publicCommunities,
  csosNgos,
  scientificInstitutions,
  financialInstitutions,
  regionalBodies,
  developmentPartners
];

/**
 * Helper function to get a stakeholder profile by ID
 */
export function getStakeholderById(id: string): StakeholderProfile | undefined {
  return stakeholderProfiles.find(profile => profile.id === id);
}

/**
 * Helper function to get all stakeholder IDs
 */
export function getAllStakeholderIds(): string[] {
  return stakeholderProfiles.map(profile => profile.id);
}
