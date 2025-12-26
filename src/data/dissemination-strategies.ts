/**
 * Dissemination Strategies for IRENA Scenario Dialogue Tool
 *
 * Based on IRENA's Participatory Processes Toolkit Section 4.3
 * Knowledge Dissemination Techniques
 *
 * This file defines recommended dissemination formats and approaches for
 * each stakeholder group to help energy planners effectively communicate
 * their scenario results.
 */

import type { StakeholderId } from '../types/stakeholder';

export interface DisseminationFormat {
  name: string;
  description: string;
  level: 'primary' | 'secondary' | 'tertiary';
  effort: 'low' | 'medium' | 'high';
  examples: string[];
}

export interface DisseminationStrategy {
  stakeholderId: StakeholderId;
  stakeholderName: string;

  // Why this stakeholder needs specific communication approach
  whyThisMatters: string;

  // Communication context
  technicalLevel: 'low' | 'medium' | 'high';
  timeAvailable: 'limited' | 'moderate' | 'extensive';
  decisionInfluence: 'low' | 'medium' | 'high';

  // Recommended formats
  formats: DisseminationFormat[];

  // Key messages to emphasize (templates - will be populated with scenario data)
  keyMessages: string[];

  // What to avoid
  avoidances: string[];

  // Storytelling approach
  narrativeFraming: string;

  // Toolkit reference methods
  toolkitMethods: string[];
}

/**
 * 1. Policy Makers & Regulators
 * Government officials responsible for energy policy decisions
 */
export const policyMakersDissemination: DisseminationStrategy = {
  stakeholderId: 'policy-makers',
  stakeholderName: 'Policy Makers & Regulators',

  whyThisMatters: 'Policy makers need concise, decision-ready information that clearly shows alignment with national goals, fiscal implications, and political feasibility. They have limited time and need to see the big picture quickly.',

  technicalLevel: 'medium',
  timeAvailable: 'limited',
  decisionInfluence: 'high',

  formats: [
    {
      name: 'Policy Brief (2-4 pages)',
      description: 'Executive summary format with clear recommendations, key trade-offs, and policy implications. Use bullet points, charts, and visual hierarchy.',
      level: 'primary',
      effort: 'medium',
      examples: [
        'One-page scenario summary with 3 key metrics',
        'Two-pager comparing scenarios on policy priorities',
        'Decision memo format with clear ask/decision points'
      ]
    },
    {
      name: 'Interactive Dashboard',
      description: 'Web-based tool allowing policy makers to explore trade-offs between goals (jobs vs investment, emissions vs costs). Based on toolkit examples like Belgium My2050.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Scenario comparison slider (business-as-usual to ambitious)',
        'Goal trade-off explorer (NDC targets vs investment levels)',
        'Timeline visualization of key milestones'
      ]
    },
    {
      name: 'Briefing Deck (10-15 slides)',
      description: 'Presentation format for ministerial briefings. Lead with conclusions, then supporting evidence. Use visuals over text.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Scenario overview with 3 headline findings',
        'Comparison to regional peers',
        'Timeline of required policy decisions'
      ]
    }
  ],

  keyMessages: [
    'Scenario achieves {reShare2030}% renewable energy by 2030, aligned with NDC commitments',
    'Requires ${investment2050}M total investment, creating {jobs2030} jobs by 2030',
    'Reduces emissions by {emissionsReduction}% compared to business-as-usual',
    'Positions country as regional leader in clean energy transition',
    'Delivers co-benefits: energy security, job creation, climate action'
  ],

  avoidances: [
    'Dense technical jargon without plain-language explanation',
    'Overwhelming with model methodology details',
    'Presenting data without clear policy implications',
    'Hiding uncertainties or limitations',
    'Using academic paper formatting instead of policy brief style'
  ],

  narrativeFraming: 'Frame as strategic opportunity for national development, leadership, and meeting international commitments. Emphasize alignment with existing policies and political priorities.',

  toolkitMethods: [
    'Policy briefs and reports (Section 4.3.1)',
    'Interactive scenario calculators (Belgium My2050 example)',
    'Public presentations with decision-ready conclusions'
  ]
};

/**
 * 2. Grid Operators
 * Transmission and distribution system operators
 */
export const gridOperatorsDissemination: DisseminationStrategy = {
  stakeholderId: 'grid-operators',
  stakeholderName: 'Grid Operators',

  whyThisMatters: 'Grid operators are technical experts who need detailed operational implications, system integration analysis, and reliability assurances. They will scrutinize technical feasibility.',

  technicalLevel: 'high',
  timeAvailable: 'extensive',
  decisionInfluence: 'high',

  formats: [
    {
      name: 'Technical Appendix',
      description: 'Detailed methodology, assumptions, constraints, and technical validation. Include dispatch profiles, capacity factors, reserve margins.',
      level: 'primary',
      effort: 'high',
      examples: [
        'Hourly/sub-hourly dispatch profiles for representative days',
        'VRE integration analysis (ramp rates, curtailment)',
        'Grid stability and inertia assessment',
        'Transmission expansion requirements'
      ]
    },
    {
      name: 'System Integration Study',
      description: 'Focused analysis on how variable renewables integrate with existing grid infrastructure. Address flexibility, storage, interconnection.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Flexibility requirement analysis',
        'Storage sizing and dispatch optimization',
        'Interconnection benefit quantification',
        'Ancillary services provision'
      ]
    },
    {
      name: 'Operations Dashboard',
      description: 'Real-time visualization of scenario operations (for demonstration). Shows typical day dispatch, peak demand management, reserve provision.',
      level: 'tertiary',
      effort: 'high',
      examples: [
        'Typical day dispatch curve by technology',
        'Seasonal variability analysis',
        'Load duration curve comparison'
      ]
    }
  ],

  keyMessages: [
    'VRE share of {reShare2030}% in 2030 is manageable with {batteryCapacity} MW storage and regional interconnection',
    'System maintains {reserveMargin}% reserve margin throughout transition',
    'Flexibility requirements met through combination of storage, gas peakers, and demand response',
    'Grid reinforcement focused on {key regions/corridors} to accommodate new generation',
    'Phased approach allows grid to adapt incrementally without reliability risks'
  ],

  avoidances: [
    'Ignoring sub-annual variability and dispatch constraints',
    'Presenting only annual average capacity factors',
    'Oversimplifying grid integration challenges',
    'Not addressing inertia, frequency response, voltage control',
    'Failing to specify transmission/distribution infrastructure needs'
  ],

  narrativeFraming: 'Frame as technical challenge that is solvable with proper planning and investment. Emphasize grid modernization opportunities and learning from international best practices.',

  toolkitMethods: [
    'Technical reports with detailed methodology',
    'Data visualization tools (load curves, dispatch profiles)',
    'Workshops and technical exchanges'
  ]
};

/**
 * 3. Industry & Business
 * Energy-intensive industries and project developers
 */
export const industryDissemination: DisseminationStrategy = {
  stakeholderId: 'industry',
  stakeholderName: 'Industry & Business',

  whyThisMatters: 'Industry stakeholders need to understand market opportunities, investment risks, regulatory certainty, and competitive positioning. Show them the business case.',

  technicalLevel: 'medium',
  timeAvailable: 'moderate',
  decisionInfluence: 'high',

  formats: [
    {
      name: 'Investment Briefing',
      description: 'Market analysis showing pipeline of opportunities, policy support mechanisms, and risk mitigation. Format like investor pitch deck.',
      level: 'primary',
      effort: 'medium',
      examples: [
        'Technology deployment roadmap (MW by year)',
        'Policy incentives timeline (feed-in tariffs, tax credits, auctions)',
        'Market size quantification (total investment, annual tenders)',
        'Regulatory framework overview'
      ]
    },
    {
      name: 'Business Case Analysis',
      description: 'Template financial model for renewable energy projects under this scenario. Show IRR, payback, revenue certainty.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Reference project economics (solar/wind farm)',
        'PPA price assumptions and escalation',
        'Local content requirements and benefits',
        'Risk factors and mitigation strategies'
      ]
    },
    {
      name: 'Market Outlook Report',
      description: 'Narrative report on how the scenario creates business opportunities. Comparable to industry association reports.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Sector-by-sector opportunity assessment',
        'Supply chain development needs',
        'Skills and labor force planning',
        'Regional competitive positioning'
      ]
    }
  ],

  keyMessages: [
    '{totalCapacity} MW of new capacity deployment by 2050 represents ${investment} market opportunity',
    'Clear regulatory roadmap provides investment certainty for developers',
    'Local content requirements create {jobs} direct jobs in manufacturing and installation',
    'Competitive procurement (auctions) ensures cost-effective deployment',
    'Early movers benefit from capacity building support and policy incentives'
  ],

  avoidances: [
    'Vague or uncertain policy commitments',
    'Ignoring permitting, land access, and social license challenges',
    'Unrealistic cost assumptions',
    'Not addressing grid connection and PPA risks',
    'Overpromising without clear implementation roadmap'
  ],

  narrativeFraming: 'Frame as investable market with clear policy support and growing demand. Emphasize long-term stability, co-benefits for local economy, and competitive advantage.',

  toolkitMethods: [
    'Investment briefings and market reports',
    'Interactive calculators for project economics',
    'Stakeholder workshops and industry forums'
  ]
};

/**
 * 4. Public & Communities
 * General public and local communities affected by projects
 */
export const publicDissemination: DisseminationStrategy = {
  stakeholderId: 'public',
  stakeholderName: 'Public & Communities',

  whyThisMatters: 'The public needs accessible, relatable information that shows personal benefits (bills, air quality, jobs) and addresses local concerns. Use storytelling and interactive tools.',

  technicalLevel: 'low',
  timeAvailable: 'limited',
  decisionInfluence: 'medium',

  formats: [
    {
      name: 'Interactive Community Impact Calculator',
      description: 'Web tool allowing citizens to see personalized impact on electricity bills, local jobs, air quality. Based on Kenya/Belgium examples.',
      level: 'primary',
      effort: 'high',
      examples: [
        'Household bill calculator (input usage, see projected bill changes)',
        'Local jobs estimator (jobs in your region)',
        'Air quality improvement timeline',
        'Renewable energy in your community map'
      ]
    },
    {
      name: 'Infographic (1-page visual)',
      description: 'Simple visual story using icons, charts, and minimal text. Focus on 3-5 key messages that matter to daily life.',
      level: 'secondary',
      effort: 'low',
      examples: [
        'Journey from today to 2050 (visual timeline)',
        'What this means for your family (bills, jobs, health)',
        'Your role in the transition (rooftop solar, EVs)',
        'Success stories from other countries'
      ]
    },
    {
      name: 'Community Meetings & Town Halls',
      description: 'In-person engagement with Q&A, visual aids, and interactive polling. Address concerns directly.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Scenario overview presentation (15 min)',
        'Live polling on priorities (jobs, bills, environment)',
        'Small group discussions on local impacts',
        'Feedback collection and response'
      ]
    }
  ],

  keyMessages: [
    'Your electricity will become cleaner: {reShare2050}% renewable by 2050',
    'This creates {jobs2030} new jobs in your region by 2030',
    'Air quality improves as we reduce fossil fuel use by {fossilReduction}%',
    'Your community can participate: rooftop solar, energy cooperatives, green jobs training',
    'Electricity remains affordable with gradual transition and efficiency improvements'
  ],

  avoidances: [
    'Technical jargon and acronyms (MW, GWh, NDC)',
    'Abstract global benefits without local connection',
    'Hiding costs or challenges (be honest about transition)',
    'Top-down communication without listening',
    'One-way information dump without engagement'
  ],

  narrativeFraming: 'Frame as community opportunity for cleaner air, local jobs, and energy independence. Use stories of real people and places. Make it personal and tangible.',

  toolkitMethods: [
    'Interactive calculators (Kenya energy calculator example)',
    'Infographics and visual storytelling',
    'Gamification and simulations (UAE board game)',
    'Public meetings and consultations'
  ]
};

/**
 * 5. CSOs & NGOs
 * Civil society organizations and environmental advocacy groups
 */
export const csosDissemination: DisseminationStrategy = {
  stakeholderId: 'csos-ngos',
  stakeholderName: 'CSOs & NGOs',

  whyThisMatters: 'CSOs/NGOs are influential advocates and watchdogs. They need to understand climate ambition, equity implications, and how to hold decision-makers accountable.',

  technicalLevel: 'medium',
  timeAvailable: 'moderate',
  decisionInfluence: 'medium',

  formats: [
    {
      name: 'Climate Impact Narrative',
      description: 'Story-driven report connecting scenario to climate goals, equity, and justice. Show alignment with Paris Agreement, NDC, net-zero.',
      level: 'primary',
      effort: 'medium',
      examples: [
        'Emissions trajectory vs Paris-compatible pathway',
        'Comparison to regional/global leaders',
        'Justice and equity assessment (who benefits, who pays)',
        'Vulnerable community protections'
      ]
    },
    {
      name: 'Scenario Comparison Tool',
      description: 'Interactive visualization comparing business-as-usual vs ambitious scenarios on climate and equity metrics.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Side-by-side scenario comparison table',
        'Ambition gap analysis vs net-zero pathways',
        'Co-benefits quantification (health, jobs, ecosystems)',
        'Trade-off explorer (speed vs cost vs equity)'
      ]
    },
    {
      name: 'Advocacy Toolkit',
      description: 'Resources for CSOs to use in advocacy: talking points, social media graphics, petition language, policy asks.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Key messages for media and social media',
        'Infographics for advocacy campaigns',
        'Policy recommendations and demands',
        'Engagement opportunities (public consultations, hearings)'
      ]
    }
  ],

  keyMessages: [
    'Scenario achieves {emissionsReduction}% emissions reduction, contributing to Paris Agreement goals',
    'Delivers climate justice: {renewableJobs} green jobs, cleaner air in frontline communities',
    'Goes beyond business-as-usual: {reShare2050}% renewable by 2050 vs {BAU}% under current policies',
    'Creates accountability: clear milestones at 2030 ({reShare2030}% RE), 2040, 2050',
    'Protects vulnerable communities: {specific protections from scenario}'
  ],

  avoidances: [
    'Greenwashing or overstating climate benefits',
    'Ignoring equity and just transition concerns',
    'Not comparing to science-based targets or peer countries',
    'Defensive posture when challenged on ambition',
    'Treating CSOs as adversaries rather than partners'
  ],

  narrativeFraming: 'Frame as climate leadership opportunity with co-benefits for health, equity, and prosperity. Acknowledge remaining gaps and invite collaboration on strengthening ambition.',

  toolkitMethods: [
    'Public reports and policy briefs',
    'Interactive scenario comparisons',
    'Social media and visual storytelling',
    'Multi-stakeholder dialogues and consultations'
  ]
};

/**
 * 6. Scientific Institutions
 * Universities, research centers, and technical experts
 */
export const scientificDissemination: DisseminationStrategy = {
  stakeholderId: 'scientific',
  stakeholderName: 'Scientific Institutions',

  whyThisMatters: 'Researchers need rigorous methodology, transparent assumptions, reproducible results, and peer-reviewed quality. They will validate and critique your work.',

  technicalLevel: 'high',
  timeAvailable: 'extensive',
  decisionInfluence: 'medium',

  formats: [
    {
      name: 'Technical Report (Full Model Documentation)',
      description: 'Comprehensive documentation of methodology, data sources, assumptions, validation, sensitivity analysis. Peer-review ready.',
      level: 'primary',
      effort: 'high',
      examples: [
        'Model structure and equations',
        'Data provenance and quality assessment',
        'Calibration and validation results',
        'Sensitivity and uncertainty analysis',
        'Comparison to other models/studies'
      ]
    },
    {
      name: 'Scientific Paper',
      description: 'Journal article format for publication in energy policy or modeling journals. Follow IMRAD structure (Intro, Methods, Results, Discussion).',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Scenario development methodology paper',
        'Novel approaches or insights',
        'Country case study for journal',
        'Model comparison or validation study'
      ]
    },
    {
      name: 'Open Data & Code Repository',
      description: 'GitHub or Zenodo repository with model code, input data, and results for reproducibility. Follow FAIR principles (Findable, Accessible, Interoperable, Reusable).',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Model code (OSeMOSYS, LEAP scripts)',
        'Input data files with metadata',
        'Results database',
        'README with instructions to reproduce'
      ]
    }
  ],

  keyMessages: [
    'Model based on {modelName} framework with {temporalResolution} resolution',
    'Validated against historical {validationPeriod} data with {accuracy} accuracy',
    'Key uncertainties: {listUncertainties} addressed through sensitivity analysis',
    'Results consistent with IPCC/IEA/IRENA global scenarios',
    'Contributions to knowledge: {novelInsights}'
  ],

  avoidances: [
    'Black-box modeling without transparent assumptions',
    'Cherry-picking results or hiding limitations',
    'Not documenting data sources and preprocessing',
    'Ignoring model validation and uncertainty',
    'Using outdated or non-peer-reviewed methods without justification'
  ],

  narrativeFraming: 'Frame as contribution to scientific understanding with rigor, transparency, and reproducibility. Invite collaboration and critique to improve quality.',

  toolkitMethods: [
    'Technical reports and peer-reviewed publications',
    'Academic workshops and conferences',
    'Open data platforms and repositories',
    'Collaborative modeling and model intercomparison'
  ]
};

/**
 * 7. Financial Institutions
 * Banks, development finance institutions, and private investors
 */
export const financeDissemination: DisseminationStrategy = {
  stakeholderId: 'finance',
  stakeholderName: 'Financial Institutions',

  whyThisMatters: 'Financiers need to see bankable projects, risk-adjusted returns, policy certainty, and alignment with ESG criteria. Show them the investment case.',

  technicalLevel: 'medium',
  timeAvailable: 'moderate',
  decisionInfluence: 'high',

  formats: [
    {
      name: 'Investment Prospectus',
      description: 'Professional investment document showing project pipeline, returns, risks, and mitigation. Similar to IPO prospectus or DFI project proposal.',
      level: 'primary',
      effort: 'high',
      examples: [
        'Project pipeline by technology and year',
        'Financial projections (IRR, NPV, payback)',
        'Risk assessment matrix',
        'Policy and regulatory framework',
        'ESG alignment and impact metrics'
      ]
    },
    {
      name: 'Risk Assessment & Mitigation Strategy',
      description: 'Detailed analysis of investment risks (policy, technical, market, currency) with mitigation measures.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Political and regulatory risk analysis',
        'Currency and macroeconomic risk',
        'Technology and performance risk',
        'Market and offtaker risk',
        'Risk mitigation instruments (guarantees, insurance)'
      ]
    },
    {
      name: 'Financial Model (Excel)',
      description: 'Downloadable financial model with assumptions, cash flows, and sensitivity analysis. Allows financiers to stress-test.',
      level: 'tertiary',
      effort: 'high',
      examples: [
        'Project-level financial model (solar/wind farm)',
        'Sector financial sustainability model',
        'Macroeconomic impact model',
        'Debt sustainability analysis'
      ]
    }
  ],

  keyMessages: [
    '${investment2050}M total investment opportunity across {technologies}',
    'Strong policy commitment: {listPolicySupportMechanisms}',
    'Attractive returns: {typical IRR}% IRR for {technology} projects',
    'Risk mitigation: Government guarantees, DFI co-financing, insurance available',
    'ESG alignment: Contributes to SDG 7 (energy), SDG 13 (climate), creates {jobs} jobs'
  ],

  avoidances: [
    'Unrealistic financial assumptions or returns',
    'Downplaying political and regulatory risks',
    'Not addressing currency and macroeconomic risks',
    'Lack of clear policy commitment or timelines',
    'Ignoring debt sustainability and fiscal space'
  ],

  narrativeFraming: 'Frame as attractive investment opportunity with strong policy support, manageable risks, and alignment with ESG mandates. Emphasize first-mover advantages and DFI backing.',

  toolkitMethods: [
    'Investment briefings and prospectuses',
    'Financial models and business cases',
    'Investor forums and roadshows',
    'Risk assessment frameworks'
  ]
};

/**
 * 8. Regional Bodies
 * Regional power pools and integration organizations
 */
export const regionalBodiesDissemination: DisseminationStrategy = {
  stakeholderId: 'regional-bodies',
  stakeholderName: 'Regional Bodies',

  whyThisMatters: 'Regional bodies coordinate cross-border power trade and grid planning. They need to see how your scenario fits with regional integration plans.',

  technicalLevel: 'high',
  timeAvailable: 'moderate',
  decisionInfluence: 'medium',

  formats: [
    {
      name: 'Regional Integration Report',
      description: 'Analysis of how national scenario aligns with regional power pool master plan. Show cross-border flows, shared resources.',
      level: 'primary',
      effort: 'high',
      examples: [
        'Interconnection capacity and utilization',
        'Cross-border power trade projections',
        'Regional resource optimization opportunities',
        'Alignment with regional master plan milestones'
      ]
    },
    {
      name: 'Cross-Border Impact Analysis',
      description: 'Quantify impacts on neighboring countries: import/export, prices, reliability, emissions.',
      level: 'secondary',
      effort: 'high',
      examples: [
        'Net import/export by year and season',
        'Price impacts on regional market',
        'Reliability contributions (reserves, balancing)',
        'Coordinated resource planning benefits'
      ]
    },
    {
      name: 'Coordination Plan',
      description: 'Roadmap for coordination with neighbors on planning, operations, and investment. Identify joint opportunities.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Transmission expansion coordination',
        'Shared renewable resource zones',
        'Coordinated flexibility provision',
        'Joint procurement opportunities'
      ]
    }
  ],

  keyMessages: [
    'Scenario aligns with {regionalPool} master plan {year} update',
    'Enables {MWh/year} cross-border trade, reducing regional costs by {percent}%',
    'Coordinated planning unlocks {MW} of shared renewable resources',
    'Interconnection investments provide regional reliability benefits',
    'Supports regional climate and energy access goals'
  ],

  avoidances: [
    'Planning in isolation without regional coordination',
    'Ignoring transmission constraints and cross-border flows',
    'Not aligning timelines with regional investment cycles',
    'Overstating national self-sufficiency vs regional cooperation',
    'Duplicating resource planning (uncoordinated renewable zones)'
  ],

  narrativeFraming: 'Frame as contribution to regional energy security, cost optimization, and climate goals. Emphasize win-win cooperation and shared benefits.',

  toolkitMethods: [
    'Regional planning reports and studies',
    'Technical coordination workshops',
    'Regional stakeholder consultations',
    'Data sharing platforms and dashboards'
  ]
};

/**
 * 9. Development Partners
 * Bilateral and multilateral development agencies
 */
export const developmentPartnersDissemination: DisseminationStrategy = {
  stakeholderId: 'development-partners',
  stakeholderName: 'Development Partners',

  whyThisMatters: 'Development partners provide financing, technical assistance, and capacity building. They need to see alignment with their mandates, country ownership, and programmatic entry points.',

  technicalLevel: 'medium',
  timeAvailable: 'moderate',
  decisionInfluence: 'high',

  formats: [
    {
      name: 'Programmatic Briefing',
      description: 'Presentation showing how scenario informs programming priorities. Identify TA needs, financing gaps, capacity building.',
      level: 'primary',
      effort: 'medium',
      examples: [
        'Country-led process and ownership',
        'Alignment with national development plan and NDC',
        'Programmatic entry points (policy, investment, capacity)',
        'Financing gap analysis and blended finance opportunities',
        'Technical assistance priorities'
      ]
    },
    {
      name: 'Alignment Assessment',
      description: 'Analysis of how scenario aligns with development partner priorities (climate, energy access, gender, jobs).',
      level: 'secondary',
      effort: 'medium',
      examples: [
        'SDG contributions (SDG 7, 8, 13, etc.)',
        'Climate finance eligibility and mobilization',
        'Equity and inclusion impacts',
        'Capacity building needs and opportunities',
        'Results framework and M&E indicators'
      ]
    },
    {
      name: 'Capacity Building Plan',
      description: 'Roadmap for strengthening national capacity to implement scenario. Identify training, tools, systems.',
      level: 'tertiary',
      effort: 'medium',
      examples: [
        'Institutional strengthening needs',
        'Training programs (modeling, planning, procurement)',
        'Decision support tools and systems',
        'South-South knowledge exchange',
        'Long-term sustainability of capacity'
      ]
    }
  ],

  keyMessages: [
    'Scenario reflects country-led participatory process with {stakeholderCount} stakeholder groups engaged',
    'Aligns with National Development Plan, NDC, and SEforALL goals',
    'Requires ${financingGap}M in concessional finance and TA support',
    'Delivers SDG impacts: {energyAccess}% access, {jobs} jobs, {emissionsReduction}% emissions reduction',
    'Capacity building priorities: {listPriorities}'
  ],

  avoidances: [
    'Top-down scenario without country ownership',
    'Not showing stakeholder engagement process',
    'Ignoring capacity constraints and implementation barriers',
    'Unrealistic financing assumptions',
    'Not aligning with partner mandates and results frameworks'
  ],

  narrativeFraming: 'Frame as country-owned plan with clear implementation roadmap. Emphasize partnership, capacity building, and sustainable development outcomes aligned with partner priorities.',

  toolkitMethods: [
    'Programmatic briefings and country strategies',
    'Results frameworks and M&E systems',
    'Capacity building programs',
    'Multi-stakeholder platforms and dialogues'
  ]
};

/**
 * Complete dissemination strategies map
 */
export const disseminationStrategies: Record<StakeholderId, DisseminationStrategy> = {
  'policy-makers': policyMakersDissemination,
  'grid-operators': gridOperatorsDissemination,
  'industry': industryDissemination,
  'public': publicDissemination,
  'csos-ngos': csosDissemination,
  'scientific': scientificDissemination,
  'finance': financeDissemination,
  'regional-bodies': regionalBodiesDissemination,
  'development-partners': developmentPartnersDissemination,
};

/**
 * Helper function to get dissemination strategy by stakeholder ID
 */
export function getDisseminationStrategy(stakeholderId: StakeholderId): DisseminationStrategy {
  return disseminationStrategies[stakeholderId];
}

/**
 * Helper function to populate key messages with scenario data
 */
export function populateKeyMessages(
  messages: string[],
  scenarioData: Record<string, string | number>
): string[] {
  return messages.map(template => {
    let populated = template;
    Object.entries(scenarioData).forEach(([key, value]) => {
      populated = populated.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return populated;
  });
}
