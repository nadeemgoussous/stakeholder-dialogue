/**
 * Dissemination Tips from IRENA Participatory Processes Toolkit Section 4.3
 *
 * This file contains educational content to help energy planners understand
 * best practices for disseminating scenario results to different audiences.
 *
 * Source: IRENA Participatory Processes for Strategic Energy Planning Toolkit
 */

import type { StakeholderId } from '../types/stakeholder';

/**
 * Implementation stages for dissemination tools
 */
export type ImplementationStage = 'framing' | 'development' | 'validation' | 'communication';

export interface ImplementationGuidance {
  stage: ImplementationStage;
  label: string;
  description: string;
}

/**
 * Core dissemination principle from the toolkit
 */
export interface DisseminationPrinciple {
  id: string;
  title: string;
  description: string;
  toolkitSection: string;
  strengths: string[];
  challenges: string[];
  limitations: string[];
  tools: DisseminationTool[];
  caseStudies: CaseStudy[];
  implementationStages: ImplementationGuidance[];
  resourceRequirements: string[];
  relevantStakeholders: StakeholderId[];
}

/**
 * Specific tool within a dissemination category
 */
export interface DisseminationTool {
  name: string;
  description: string;
  examples?: string[];
}

/**
 * Case study from the toolkit
 */
export interface CaseStudy {
  country: string;
  approach: string;
  description: string;
  audience?: string;
}

/**
 * Contextual tip based on stakeholder selection
 */
export interface ContextualTip {
  stakeholderId: StakeholderId;
  tips: string[];
  recommendedApproaches: string[];
  avoidApproaches: string[];
}

// ============================================================================
// SECTION 4.3.1: PUBLIC PRESENTATIONS AND REPORTS
// ============================================================================

export const publicPresentationsPrinciple: DisseminationPrinciple = {
  id: 'public-presentations',
  title: 'Public Presentations and Reports',
  description: 'Scenario practitioners use public presentations as a strategic tool throughout the energy scenario development process to inform, engage and, in many cases, gather feedback from stakeholders. These presentations, public hearings and reports are essential for effectively communicating with non-expert audiences and fostering broader stakeholder buy-in.',
  toolkitSection: '4.3.1',

  strengths: [
    'Provides opportunity to educate non-expert groups about energy scenario development, fostering greater understanding and engagement',
    'Serves as a platform to gather feedback from a broad audience, including stakeholders who might otherwise not participate',
    'Online presentations offer a highly efficient way to reach even larger and more diverse audiences'
  ],

  challenges: [
    'Crafting an appropriate narrative is key to effectively describing the energy scenario modelling process and its outcomes, especially for non-expert audiences',
    'Presenters must employ non-technical language and ensure clarity to communicate complex ideas in an accessible manner'
  ],

  limitations: [
    'Due to the nature of public presentations and the diverse audience, it may be necessary to limit the depth and complexity of the content',
    'The time available for presenting extensive results or content or answering questions can be constrained, potentially limiting the scope of the discussion'
  ],

  tools: [
    {
      name: 'Public Hearings',
      description: 'Formal gatherings provide a platform for government agencies or other project/scenario developers to present information and proposals related to energy plans or policies to the public. These hearings are also an opportunity for the public to give feedback, express concerns and ask questions.',
      examples: ['Can be advertised on social media', 'Chile held various public hearings for broad stakeholder engagement']
    },
    {
      name: 'Online Conferencing Tools',
      description: 'Virtual conferencing tools, such as webinar platforms, can broaden the outreach and delivery of information regarding energy plans and scenarios to a much wider audience compared to in-person events. They provide similar opportunities to public hearings with potentially lower financial and resource requirements.',
      examples: ['Brazil leveraged virtual debates during National Energy Plan 2050', 'Webinar platforms for Q&A sessions']
    },
    {
      name: 'Reports and Publications',
      description: 'Written publications can deliver highly detailed information about energy plans and scenarios, providing full narratives, details about assumptions and data, and visualisations showcasing different scenarios and results. Highly useful for stakeholders with required technical knowledge.',
      examples: ['Cyprus prepared concise policy briefs for ministries', 'Sector-specific briefs on employment and energy transition impacts']
    }
  ],

  caseStudies: [
    {
      country: 'Cyprus',
      approach: 'Policy Briefs',
      description: 'Prepared concise policy briefs tailored for ministries and national authorities, as well as sector-specific briefs addressing topics such as employment policy and energy transition impacts.',
      audience: 'Government ministries, national authorities'
    },
    {
      country: 'Brazil',
      approach: 'Virtual Debates',
      description: 'Leveraged virtual debates during the development of its National Energy Plan 2050 to highlight diverse perspectives and build consensus through participatory processes such as workshops and public consultations.',
      audience: 'Broad stakeholder groups'
    },
    {
      country: 'Chile',
      approach: 'Public Hearings',
      description: 'Held various public hearings to ensure broad stakeholder engagement in energy planning processes.',
      audience: 'General public, diverse stakeholders'
    }
  ],

  implementationStages: [
    { stage: 'framing', label: 'Framing', description: 'Present aims and objectives, timelines, etc.' },
    { stage: 'development', label: 'Development', description: 'Present policy questions and other information to stakeholders' },
    { stage: 'validation', label: 'Validation', description: 'Present draft results' },
    { stage: 'communication', label: 'Communication', description: 'Present scenarios to all types of stakeholders' }
  ],

  resourceRequirements: [
    'Planning teams capable of delivering clear and engaging content',
    'Skilled communication, possibly through dedicated communication and external relations teams',
    'Technological support to enhance presentations, especially for online formats',
    'Specific objectives outlined in advance',
    'Well-defined methodology for collecting and incorporating audience feedback'
  ],

  relevantStakeholders: ['policy-makers', 'public', 'csos-ngos', 'development-partners']
};

// ============================================================================
// SECTION 4.3.2: VISUALISATION TOOLS, GAMES AND SIMULATIONS
// ============================================================================

export const visualisationPrinciple: DisseminationPrinciple = {
  id: 'visualisation-tools',
  title: 'Visualisation Tools, Games and Simulations',
  description: 'Detailed energy system plans can be data-heavy and difficult to interpret for non-experts due to the highly technical nature of energy system planning. Visualising data, pathways and results can be vital to communicating complex ideas, policy-making implications and investment needs through charts, interactive dashboards, and simulations.',
  toolkitSection: '4.3.2',

  strengths: [
    'Interactive visualisations complement and enhance storytelling, capturing the audience\'s interest through engaging and dynamic presentations',
    'Provide an effective way to reach a broader audience, particularly non-expert groups, by making complex information more accessible and interactive'
  ],

  challenges: [
    'Creating effective visualisations requires dedicated training and expertise, which may not always be available within the planning team',
    'Outsourcing the task to specialised contractors incurs additional financial cost',
    'Ensuring high-quality visualisation while balancing personnel and financial constraints can be challenging'
  ],

  limitations: [
    'Interactive visualisations depend on reliable internet access',
    'May require accompanying educational resources, as seen in the Belgian case for the "My2050" app',
    'As a one-way communication tool, they may not fully address audience questions or provide opportunities for dialogue'
  ],

  tools: [
    {
      name: 'Data Visualisation Tools',
      description: 'Business intelligence (BI) tools and statistical software have been used to visualise quantitative data in colourful charts and graphs that can be easily read and navigated when hosted on online platforms or in static media.',
      examples: ['Tableau', 'PowerBI', 'R', 'Stata', 'Excel', 'Python', 'Online dashboards']
    },
    {
      name: 'Energy Calculators',
      description: 'Energy calculators allow users to manipulate different assumptions and triggers to form their own scenarios. It gives users the ability to see how adjusting different inputs can lead to different results and emissions, giving them a better understanding of plans and policies.',
      examples: ['Belgium "My2050" calculator', 'Kenya energy calculator', 'Household cost calculators']
    },
    {
      name: 'Simulations and Games',
      description: 'Simulations and games "gamify" scenario communication, allowing users to play games that navigate the energy transition by presenting different policies and behaviours in an interactive manner, leading to better understanding of technical concepts.',
      examples: ['IEA/Financial Times climate role-playing online game', 'COP Simulations', 'UAE interactive board game for policy makers']
    }
  ],

  caseStudies: [
    {
      country: 'Belgium',
      approach: 'My2050 Calculator',
      description: 'Interactive calculator enabling users to manipulate variables and assumptions, demonstrating how different inputs influence emissions and energy outcomes. Includes accompanying educational resources.',
      audience: 'General public, students, non-experts'
    },
    {
      country: 'Kenya',
      approach: 'Energy Calculator',
      description: 'Interactive calculator taking a hands-on approach, enabling users to manipulate variables and see how different inputs influence energy outcomes. Fosters deeper understanding of energy plans and policies.',
      audience: 'General public, communities'
    },
    {
      country: 'United Arab Emirates',
      approach: 'Interactive Board Game',
      description: 'Built an interactive board game to communicate scenario results to high-level policy makers, simplifying complex technical concepts in an engaging format.',
      audience: 'High-level policy makers'
    },
    {
      country: 'International (IEA)',
      approach: 'Climate Role-Playing Game',
      description: 'The International Energy Agency in collaboration with the Financial Times developed a climate role-playing online game that allows participants to explore different policies and behaviours interactively.',
      audience: 'Broad public, educators'
    },
    {
      country: 'International',
      approach: 'COP Simulations',
      description: 'Activities that allow participants to explore different policies and behaviours interactively and in-person, helping demystify intricate processes and foster broader engagement.',
      audience: 'Students, negotiators, advocates'
    }
  ],

  implementationStages: [
    { stage: 'framing', label: 'Framing', description: 'Present data on current statistics and existing scenarios/policies' },
    { stage: 'development', label: 'Development', description: 'Test and visualise early results and scenarios' },
    { stage: 'validation', label: 'Validation', description: 'Present draft results' },
    { stage: 'communication', label: 'Communication', description: 'Set up dashboards and interactive tools to increase outreach' }
  ],

  resourceRequirements: [
    'Access to appropriate technology, including necessary licences and subscriptions',
    'Sufficient knowledge and capacity to create and interpret the tools',
    'Clear instructions for audience on how to interpret and interact with tools',
    'Define key concepts related to energy scenarios',
    'Highlight information most relevant to different stakeholder groups'
  ],

  relevantStakeholders: ['public', 'csos-ngos', 'policy-makers', 'scientific', 'finance']
};

// ============================================================================
// KEY DISSEMINATION PRINCIPLES (Summary Tips)
// ============================================================================

export interface QuickTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  toolkitReference: string;
}

export const quickTips: QuickTip[] = [
  {
    id: 'match-audience',
    title: 'Match Format to Audience',
    description: 'Tailor the visualisation and communication of energy scenarios to the objectives and needs of target stakeholders. Experts benefit from detailed charts with downloadable data; non-experts find interactive calculators more engaging.',
    icon: 'target',
    toolkitReference: 'Section 4.3.2'
  },
  {
    id: 'non-technical-language',
    title: 'Use Non-Technical Language',
    description: 'Crafting an appropriate narrative is key. Presenters must employ non-technical language and ensure clarity to communicate complex ideas in an accessible manner, especially for non-expert audiences.',
    icon: 'message',
    toolkitReference: 'Section 4.3.1'
  },
  {
    id: 'interactive-engagement',
    title: 'Make It Interactive',
    description: 'Interactive visualisations complement and enhance storytelling, capturing interest through engaging presentations. Energy calculators let users manipulate assumptions and see how their choices affect outcomes.',
    icon: 'cursor',
    toolkitReference: 'Section 4.3.2'
  },
  {
    id: 'gamification',
    title: 'Consider Gamification',
    description: 'Gamified tools simplify complex technical concepts, making them more engaging and understandable for non-expert audiences. By presenting the energy transition in an interactive format, they help demystify intricate processes.',
    icon: 'game',
    toolkitReference: 'Section 4.3.2'
  },
  {
    id: 'feedback-methodology',
    title: 'Plan for Feedback',
    description: 'A well-defined methodology for collecting and incorporating audience feedback is essential to improve energy scenarios being developed. Public presentations serve as platforms to gather input from broad audiences.',
    icon: 'feedback',
    toolkitReference: 'Section 4.3.1'
  },
  {
    id: 'layer-communication',
    title: 'Layer Your Communication',
    description: 'Reports and publications deliver detailed information with full narratives and data, while presentations limit depth for broader accessibility. Use multiple formats to reach different audience levels.',
    icon: 'layers',
    toolkitReference: 'Section 4.3.1'
  },
  {
    id: 'online-reach',
    title: 'Leverage Online Tools',
    description: 'Online presentations and virtual conferencing tools offer efficient ways to reach larger and more diverse audiences with potentially lower financial requirements compared to in-person events.',
    icon: 'globe',
    toolkitReference: 'Section 4.3.1'
  },
  {
    id: 'educational-resources',
    title: 'Provide Educational Context',
    description: 'Interactive visualisations may require accompanying educational resources to be effective. Define key concepts and provide clear instructions on how to interpret and interact with tools.',
    icon: 'book',
    toolkitReference: 'Section 4.3.2'
  }
];

// ============================================================================
// STAKEHOLDER-CONTEXTUAL TIPS
// ============================================================================

export const contextualTips: ContextualTip[] = [
  {
    stakeholderId: 'policy-makers',
    tips: [
      'Use concise policy briefs tailored for ministerial audiences (Cyprus approach)',
      'Present clear recommendations with policy implications upfront',
      'Interactive dashboards can help explore trade-offs between policy goals',
      'The UAE used an interactive board game to engage high-level policy makers'
    ],
    recommendedApproaches: ['Policy briefs', 'Executive summaries', 'Interactive dashboards', 'Briefing presentations'],
    avoidApproaches: ['Dense technical reports without summaries', 'Academic paper formatting']
  },
  {
    stakeholderId: 'grid-operators',
    tips: [
      'Detailed technical reports with full methodology are appropriate for this expert audience',
      'Data visualisation tools like Tableau or PowerBI can present complex grid data effectively',
      'Include downloadable data for their own technical analysis',
      'Focus on operational implications and system reliability metrics'
    ],
    recommendedApproaches: ['Technical reports', 'Data dashboards', 'Detailed charts with raw data'],
    avoidApproaches: ['Oversimplified infographics', 'Gamified tools']
  },
  {
    stakeholderId: 'industry',
    tips: [
      'Business intelligence tools can visualise market opportunities and investment pipelines',
      'Sector-specific briefs address topics like employment and economic impacts (Cyprus approach)',
      'Present financial implications clearly with charts and projections',
      'Virtual presentations can efficiently reach diverse industry stakeholders'
    ],
    recommendedApproaches: ['Investment briefings', 'Market outlook reports', 'Sector-specific briefs'],
    avoidApproaches: ['Academic language', 'Ignoring financial metrics']
  },
  {
    stakeholderId: 'public',
    tips: [
      'Energy calculators like Belgium\'s My2050 or Kenya\'s calculator make scenarios personal and interactive',
      'Gamified tools simplify complex concepts and foster broader engagement',
      'Public hearings provide platforms for feedback and questions (Chile approach)',
      'Online tools can reach larger and more diverse audiences efficiently'
    ],
    recommendedApproaches: ['Interactive calculators', 'Infographics', 'Public hearings', 'Games and simulations'],
    avoidApproaches: ['Technical jargon', 'Data-heavy presentations', 'One-way communication without Q&A']
  },
  {
    stakeholderId: 'csos-ngos',
    tips: [
      'Interactive visualisations can show climate and equity impacts compellingly',
      'Scenario comparison tools help demonstrate ambition levels',
      'COP Simulations and role-playing games engage advocates effectively',
      'Provide data in formats that support their own advocacy communications'
    ],
    recommendedApproaches: ['Climate narratives', 'Comparison visualisations', 'Interactive tools', 'Advocacy-ready data'],
    avoidApproaches: ['Greenwashing', 'Hiding limitations', 'Defensive posture']
  },
  {
    stakeholderId: 'scientific',
    tips: [
      'Detailed reports with full methodology, assumptions, and data are essential',
      'Statistical software outputs (R, Stata, Python) are familiar formats',
      'Downloadable datasets enable peer review and replication',
      'Technical documentation should be comprehensive and transparent'
    ],
    recommendedApproaches: ['Technical reports', 'Open data repositories', 'Peer-review ready documentation'],
    avoidApproaches: ['Oversimplified visualisations', 'Black-box presentations without methodology']
  },
  {
    stakeholderId: 'finance',
    tips: [
      'Business intelligence dashboards can present investment pipelines and risk metrics',
      'Financial visualisations should include IRR, NPV, and risk-adjusted returns',
      'Interactive tools can allow stress-testing of assumptions',
      'Clear policy commitment timelines reduce perceived regulatory risk'
    ],
    recommendedApproaches: ['Investment prospectuses', 'Financial dashboards', 'Risk visualisations'],
    avoidApproaches: ['Vague policy commitments', 'Hiding risks', 'Unrealistic assumptions']
  },
  {
    stakeholderId: 'regional-bodies',
    tips: [
      'Dashboards can visualise cross-border flows and regional integration benefits',
      'Virtual debates can build consensus across multiple countries (Brazil approach)',
      'Technical reports should show alignment with regional master plans',
      'Data sharing platforms facilitate coordination'
    ],
    recommendedApproaches: ['Regional integration reports', 'Cross-border dashboards', 'Coordination platforms'],
    avoidApproaches: ['National-only framing', 'Ignoring regional interdependencies']
  },
  {
    stakeholderId: 'development-partners',
    tips: [
      'Policy briefs tailored to programmatic entry points are effective',
      'Visualisations should show alignment with SDGs and development outcomes',
      'Virtual presentations can efficiently update multiple partners',
      'Results frameworks and M&E indicators should be clearly presented'
    ],
    recommendedApproaches: ['Programmatic briefings', 'SDG alignment visualisations', 'Results dashboards'],
    avoidApproaches: ['Top-down presentations without country ownership', 'Ignoring capacity constraints']
  }
];

// ============================================================================
// ALL PRINCIPLES COMBINED
// ============================================================================

export const allDisseminationPrinciples: DisseminationPrinciple[] = [
  publicPresentationsPrinciple,
  visualisationPrinciple
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get contextual tips for a specific stakeholder
 */
export function getContextualTips(stakeholderId: StakeholderId): ContextualTip | undefined {
  return contextualTips.find(ct => ct.stakeholderId === stakeholderId);
}

/**
 * Get principles relevant to a specific stakeholder
 */
export function getRelevantPrinciples(stakeholderId: StakeholderId): DisseminationPrinciple[] {
  return allDisseminationPrinciples.filter(p =>
    p.relevantStakeholders.includes(stakeholderId)
  );
}

/**
 * Get all case studies
 */
export function getAllCaseStudies(): CaseStudy[] {
  return allDisseminationPrinciples.flatMap(p => p.caseStudies);
}
