/**
 * Dissemination Format Templates
 *
 * Text-based template structures for different communication formats.
 * Educational focus: teach users how to create materials, not auto-generate them.
 *
 * Based on IRENA Participatory Processes Toolkit Section 4.3
 */

export interface DisseminationTemplate {
  id: string;
  name: string;
  description: string;
  bestFor: string[];  // Which stakeholder groups
  characteristics: {
    length: string;
    tone: string;
    technicalLevel: string;
    effort: 'low' | 'medium' | 'high';
  };
  howToUse: string[];
  sections: TemplateSection[];
  exampleText: string;
  toolkitReference?: string;
}

export interface TemplateSection {
  heading: string;
  description: string;
  keyPoints: string[];
  dataFields: string[];  // Scenario data merge fields
}

export const disseminationTemplates: DisseminationTemplate[] = [
  {
    id: 'policy-brief',
    name: 'Policy Brief',
    description: 'Concise 2-4 page document highlighting key findings and policy implications',
    bestFor: ['Policy Makers', 'Development Partners', 'Regional Bodies'],
    characteristics: {
      length: '2-4 pages (800-1500 words)',
      tone: 'Formal, action-oriented',
      technicalLevel: 'Medium - assume policy literacy, not technical expertise',
      effort: 'medium'
    },
    howToUse: [
      'Start with executive summary - decision makers may only read this section',
      'Use bullet points and clear headings for scannability',
      'Lead with policy implications, not technical details',
      'Include 1-2 simple visualizations maximum',
      'End with clear recommendations and next steps',
      'Keep language accessible - avoid jargon or define technical terms',
      'Customize examples to local policy context and priorities'
    ],
    sections: [
      {
        heading: 'Executive Summary',
        description: 'One paragraph capturing the essence - what, why, and so what',
        keyPoints: [
          'Scenario name and ambition level',
          'Top-line finding (e.g., "achieves 70% renewable electricity by 2040")',
          'Key trade-off or decision point',
          'Primary recommendation'
        ],
        dataFields: ['scenarioName', 'country', 'renewableShare2040', 'totalInvestment']
      },
      {
        heading: 'Context and Objectives',
        description: 'Why this scenario matters - link to national goals and commitments',
        keyPoints: [
          'Alignment with national development plan',
          'Contribution to NDC/net-zero targets',
          'Response to specific energy challenges (access, reliability, cost)',
          'Regional coordination context'
        ],
        dataFields: ['country', 'emissionsReduction2030', 'emissionsReduction2050']
      },
      {
        heading: 'Key Findings',
        description: 'Main results organized by policy relevance, not technology',
        keyPoints: [
          'Energy security implications (domestic supply vs imports)',
          'Economic impacts (investment needs, jobs, industrial competitiveness)',
          'Climate performance (emissions trajectory, Paris alignment)',
          'Social considerations (affordability, access, land use)'
        ],
        dataFields: [
          'renewableShare2030',
          'renewableShare2040',
          'totalInvestment',
          'totalJobs2030',
          'totalJobs2040',
          'emissionsReduction2030',
          'emissionsReduction2050',
          'landUse2040'
        ]
      },
      {
        heading: 'Implementation Requirements',
        description: 'What needs to happen - policies, regulations, investments',
        keyPoints: [
          'Policy and regulatory reforms needed',
          'Investment mobilization strategy (public, private, concessional)',
          'Infrastructure development (grid, storage, interconnectors)',
          'Institutional capacity and coordination',
          'Timeline for key decisions'
        ],
        dataFields: ['annualInvestment', 'batteryCapacity2030', 'interconnectorCapacity2040']
      },
      {
        heading: 'Risks and Mitigation',
        description: 'What could go wrong and how to address it',
        keyPoints: [
          'Financing risks (fiscal space, debt sustainability, currency)',
          'Technical risks (grid integration, reliability)',
          'Political economy risks (vested interests, public acceptance)',
          'External risks (technology costs, regional coordination)',
          'Proposed mitigation measures for each'
        ],
        dataFields: ['totalInvestment', 'renewableShare2040']
      },
      {
        heading: 'Recommendations',
        description: 'Actionable next steps prioritized by urgency',
        keyPoints: [
          'Immediate actions (0-12 months)',
          'Near-term priorities (1-3 years)',
          'Medium-term foundations (3-5 years)',
          'Stakeholder engagement approach',
          'Monitoring and review framework'
        ],
        dataFields: []
      }
    ],
    exampleText: `POLICY BRIEF: [Scenario Name] - Energy Transition Pathway for [Country]

EXECUTIVE SUMMARY
The [Scenario Name] scenario demonstrates a pathway to [X]% renewable electricity by [Year], requiring $[Y] million in cumulative investment. This transition would reduce power sector emissions by [Z]% by [Year], create approximately [N] jobs, and position [Country] as a regional clean energy leader. Key policy decisions on [specific issue] are needed by [year] to maintain the timeline.

CONTEXT AND OBJECTIVES
[Country]'s National Development Plan targets [goal] by [year]. This scenario explores how the power sector can contribute while ensuring reliability and affordability...

[Continue with remaining sections, replacing bracketed fields with actual scenario data]

---

CUSTOMIZATION CHECKLIST:
☐ Replace all [bracketed fields] with scenario data
☐ Add local policy references (NDC commitments, national plans, etc.)
☐ Adjust recommendations to match institutional mandates
☐ Include 1-2 charts (capacity mix evolution, emissions trajectory)
☐ Add ministry/agency logos and branding
☐ Cite data sources and modeling assumptions
☐ Review with policy stakeholders before distribution`,
    toolkitReference: 'Section 4.3 - Public presentations and reports'
  },

  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Visual one-pager for general audiences communicating key numbers and concepts',
    bestFor: ['Public & Communities', 'CSOs & NGOs', 'Industry'],
    characteristics: {
      length: '1 page (primarily visual)',
      tone: 'Accessible, engaging',
      technicalLevel: 'Low - assume no technical background',
      effort: 'high'
    },
    howToUse: [
      'Design for scanning, not reading - most people spend 5-10 seconds',
      'Use the "inverted pyramid" - most important info at top',
      'Limit text to short phrases and key numbers',
      'Use icons and visual metaphors (wind turbine = wind power)',
      'Choose 3-5 key messages maximum - resist cramming everything',
      'Test with non-technical audience before finalizing',
      'Make it shareable on social media (consider dimensions)',
      'Provide both digital and print-ready versions'
    ],
    sections: [
      {
        heading: 'Headline',
        description: 'One sentence capturing the core message',
        keyPoints: [
          'Use active voice and strong verbs',
          'Include the most compelling number or outcome',
          'Make it relevant to audience concerns (jobs, bills, climate)',
          'Keep it under 10 words if possible'
        ],
        dataFields: ['scenarioName', 'renewableShare2040', 'emissionsReduction2050']
      },
      {
        heading: 'Key Numbers (3-5 visual callouts)',
        description: 'Most important figures as large text with icons',
        keyPoints: [
          'Renewable share by target year (with icon)',
          'Jobs created (construction + operations)',
          'Emissions reduction (% or comparison to cars)',
          'Investment required (relatable comparison)',
          'One surprise/interest fact (e.g., "enough solar to power X homes")'
        ],
        dataFields: [
          'renewableShare2040',
          'totalJobs2030',
          'emissionsReduction2040',
          'totalInvestment',
          'solarCapacity2040'
        ]
      },
      {
        heading: 'Visual Comparison',
        description: 'Before/after or scenario comparison graphic',
        keyPoints: [
          'Energy mix transformation (pie/bar charts)',
          'Emissions trajectory (line chart)',
          'Geographic spread of projects (map)',
          'Timeline of major milestones (roadmap)'
        ],
        dataFields: ['capacity2025', 'capacity2040', 'emissions2025', 'emissions2040']
      },
      {
        heading: 'What This Means For You',
        description: 'Personal relevance section',
        keyPoints: [
          'Jobs in your community',
          'Cleaner air and health benefits',
          'Energy security and reliability',
          'Lower long-term costs'
        ],
        dataFields: ['operationsJobs2040', 'emissionsReduction2040']
      },
      {
        heading: 'Call to Action / Learn More',
        description: 'How to engage or get more information',
        keyPoints: [
          'Link to full report or website',
          'QR code for mobile access',
          'Contact for questions',
          'Social media handles'
        ],
        dataFields: []
      }
    ],
    exampleText: `INFOGRAPHIC STRUCTURE OUTLINE:

[TOP BANNER - Eye-catching color with country flag/logo]

HEADLINE (Large, bold):
"[Country]'s Clean Energy Future: [X]% Renewable Electricity by [Year]"

[THREE LARGE VISUAL CALLOUTS - Icons + Numbers]:
🔌 [X]% RENEWABLE ENERGY    👷 [Y] JOBS CREATED    🌍 [Z]% LESS EMISSIONS
    by [Year]                Construction + Operations   vs. Today

[MIDDLE SECTION - Visual comparison]:
ENERGY MIX TRANSFORMATION
[2025 pie chart] ➜ [2040 pie chart]
(Fossil: X% ➜ Y%)  (Renewables: A% ➜ B%)

[BOTTOM SECTION - Personal relevance]:
WHAT THIS MEANS FOR YOU:
✓ [N] permanent jobs in your region
✓ Cleaner air = better health for families
✓ Reliable, affordable electricity
✓ [Country] becomes regional clean energy leader

[FOOTER]:
Learn more: [website] | [QR code] | Questions? [email]

---

DESIGN NOTES:
• Use high-contrast colors for accessibility
• Icons should be culturally appropriate
• Test on mobile screens (most people will view digitally)
• Provide in local languages
• Consider animated version for social media
• Design tools: Canva (easy), Adobe Illustrator (professional), Piktochart (templates)`,
    toolkitReference: 'Section 4.3 - Data visualization tools'
  },

  {
    id: 'investment-briefing',
    name: 'Investment Briefing',
    description: 'Technical document for financial institutions highlighting bankability and risk',
    bestFor: ['Financial Institutions', 'Industry', 'Development Partners'],
    characteristics: {
      length: '4-8 pages plus financial annexes',
      tone: 'Professional, risk-focused',
      technicalLevel: 'High - assume financial literacy',
      effort: 'high'
    },
    howToUse: [
      'Lead with investment opportunity, not policy goals',
      'Address risks upfront - financiers assume you are hiding them otherwise',
      'Include detailed financial assumptions and sensitivities',
      'Provide comparables - how does this compare to similar projects?',
      'Be specific about risk mitigation - PPAs, guarantees, insurance',
      'Distinguish between bankable projects and concept-stage ideas',
      'Include regulatory and policy stability assessment',
      'Provide clear contact for follow-up and due diligence'
    ],
    sections: [
      {
        heading: 'Investment Opportunity Overview',
        description: 'Executive summary for investment decision makers',
        keyPoints: [
          'Total investment envelope and breakdown by technology',
          'Expected returns and financial structure',
          'Policy support and revenue certainty mechanisms',
          'Strategic rationale (market growth, regional positioning)',
          'Pipeline timeline and investment phasing'
        ],
        dataFields: [
          'totalInvestment',
          'annualInvestment2025',
          'annualInvestment2030',
          'solarCapacity2040',
          'windCapacity2040'
        ]
      },
      {
        heading: 'Market Fundamentals',
        description: 'Demand drivers and market structure',
        keyPoints: [
          'Electricity demand growth trajectory and drivers',
          'Current supply-demand balance and gaps',
          'Market structure (single buyer, competitive market, IPPs)',
          'Offtaker creditworthiness and payment history',
          'Regional interconnection and export potential'
        ],
        dataFields: ['demandGrowth', 'peakDemand2030', 'peakDemand2040']
      },
      {
        heading: 'Project Pipeline and Technology Mix',
        description: 'Specific investment opportunities',
        keyPoints: [
          'Breakdown by technology (solar, wind, hydro, storage, grid)',
          'Project sizing and staging',
          'Site identification status and resource assessment',
          'Technology cost assumptions and sensitivities',
          'Local content and supply chain opportunities'
        ],
        dataFields: [
          'solarCapacity2030',
          'windCapacity2030',
          'batteryCapacity2030',
          'interconnectorCapacity2030'
        ]
      },
      {
        heading: 'Revenue Model and Policy Support',
        description: 'How projects will generate returns',
        keyPoints: [
          'PPA structure and tariff methodology',
          'Contract duration and inflation indexation',
          'Government guarantees and credit enhancement',
          'Feed-in tariffs, auctions, or direct negotiation',
          'Regulatory stability and track record'
        ],
        dataFields: []
      },
      {
        heading: 'Risk Assessment',
        description: 'Comprehensive risk analysis - this is what they care about most',
        keyPoints: [
          'Offtaker risk (payment delays, creditworthiness)',
          'Currency risk (hard currency revenue vs local costs)',
          'Political and regulatory risk (stability, changes in policy)',
          'Construction and technology risk (delays, performance)',
          'Environmental and social risk (permitting, community)',
          'Counterparty risk (developer capacity, O&M)',
          'Each risk with mitigation measures'
        ],
        dataFields: []
      },
      {
        heading: 'Financial Structure and Returns',
        description: 'Expected financial performance',
        keyPoints: [
          'Equity/debt mix and expected IRR',
          'Debt tenor and financing sources (commercial, DFI, climate funds)',
          'Sensitivity analysis (demand, costs, policy)',
          'Comparable project benchmarks',
          'ESG compliance and climate finance eligibility'
        ],
        dataFields: ['totalInvestment']
      },
      {
        heading: 'Next Steps',
        description: 'How to engage and process',
        keyPoints: [
          'Government commitment and enabling actions',
          'Procurement process and timeline',
          'Due diligence support available',
          'Contact information for follow-up',
          'Indicative timeline to financial close'
        ],
        dataFields: []
      }
    ],
    exampleText: `INVESTMENT BRIEFING: [Country] Renewable Energy Investment Opportunity

EXECUTIVE SUMMARY
[Country] is seeking $[X] million in private investment to deploy [Y] MW of renewable energy capacity by [Year]. The government has committed to [specific policy support], providing revenue certainty through [PPA/FIT structure]. This investment would serve a growing market with electricity demand projected to reach [Z] GWh by [Year].

MARKET FUNDAMENTALS
Electricity demand in [Country] is growing at [X]% annually, driven by [industrial growth/electrification/regional exports]. Current installed capacity of [Y] MW faces a supply gap of [Z] MW during peak hours...

[Continue with remaining sections]

RISK MITIGATION SUMMARY:
• Offtaker Risk: Government guarantee on PPA payments, escrow account for 3 months
• Currency Risk: USD-denominated PPAs with FX adjustment mechanism
• Regulatory Risk: Stabilization clause protecting against policy changes for 20 years
• Construction Risk: Turnkey EPC contract with performance guarantees

FINANCIAL PROJECTIONS:
[Table with investment phasing, expected IRR, debt service coverage ratios]

---

REQUIRED ANNEXES:
☐ Detailed financial model (Excel)
☐ Legal and regulatory framework assessment
☐ Resource assessment reports (solar/wind)
☐ Grid integration studies
☐ Environmental and social impact assessment (ESIA) summary
☐ Comparable project benchmarks
☐ Government commitment letters`,
    toolkitReference: 'Section 4.3 - Business intelligence dashboards'
  },

  {
    id: 'climate-narrative',
    name: 'Climate Impact Narrative',
    description: 'Story-driven document for CSOs, NGOs, and climate-focused audiences',
    bestFor: ['CSOs & NGOs', 'Public & Communities', 'Development Partners'],
    characteristics: {
      length: '3-6 pages',
      tone: 'Engaging, mission-driven',
      technicalLevel: 'Medium - balance accessibility with substance',
      effort: 'medium'
    },
    howToUse: [
      'Lead with the human story or climate imperative, not statistics',
      'Use concrete examples and case studies, not abstract concepts',
      'Frame numbers in relatable terms (cars off road, homes powered)',
      'Address justice and equity dimensions explicitly',
      'Acknowledge trade-offs and challenges honestly',
      'Connect to broader movements (Paris Agreement, SDGs)',
      'Include voices from affected communities',
      'End with clear call to action for advocacy'
    ],
    sections: [
      {
        heading: 'The Climate Imperative',
        description: 'Why this scenario matters for climate and people',
        keyPoints: [
          'Local impacts of climate change already being felt',
          'Connection to national and international commitments',
          'Window of opportunity for ambitious action',
          'Co-benefits beyond emissions (health, jobs, energy access)'
        ],
        dataFields: ['country', 'emissionsReduction2030', 'emissionsReduction2050']
      },
      {
        heading: 'The Vision: What This Scenario Achieves',
        description: 'Paint a picture of the future, not just statistics',
        keyPoints: [
          'Emissions reduction in context (equivalent cars, forests)',
          'Air quality improvements and health benefits',
          'Energy independence and security',
          'Green jobs and economic transformation',
          'Regional climate leadership position'
        ],
        dataFields: [
          'renewableShare2040',
          'emissionsReduction2040',
          'totalJobs2040',
          'coalPhaseoutYear'
        ]
      },
      {
        heading: 'Paris Alignment and Ambition',
        description: 'How this scenario relates to climate science and targets',
        keyPoints: [
          'Contribution to 1.5°C pathway',
          'Comparison to NDC and net-zero targets',
          'Consistency with IPCC scenarios',
          'Areas where ambition could be increased',
          'Long-term trajectory beyond 2050'
        ],
        dataFields: ['emissionsReduction2030', 'emissionsReduction2050', 'emissions2050']
      },
      {
        heading: 'Just Transition Considerations',
        description: 'Who is affected and how are they supported',
        keyPoints: [
          'Workers in fossil fuel industries (numbers, transition support)',
          'Communities affected by mine/plant closures',
          'Communities hosting new renewable projects (consultation, benefits)',
          'Energy affordability for vulnerable populations',
          'Gender equity in green jobs and decision-making'
        ],
        dataFields: ['coalCapacity2025', 'coalCapacity2040', 'constructionJobs', 'operationsJobs']
      },
      {
        heading: 'Gaps and Challenges',
        description: 'Honest assessment of what is missing or at risk',
        keyPoints: [
          'Where scenario falls short of climate science recommendations',
          'Assumptions that may be optimistic or risky',
          'Equity concerns not fully addressed',
          'Implementation barriers (finance, capacity, political will)',
          'External factors beyond government control'
        ],
        dataFields: []
      },
      {
        heading: 'Call to Action',
        description: 'What advocates and citizens can do',
        keyPoints: [
          'Policy asks (specific, achievable, time-bound)',
          'Monitoring and accountability mechanisms',
          'Public engagement opportunities',
          'Coalition building across stakeholders',
          'Media and communication strategies'
        ],
        dataFields: []
      }
    ],
    exampleText: `CLIMATE IMPACT NARRATIVE: [Country]'s Renewable Energy Transition

THE CLIMATE IMPERATIVE
Communities across [Country] are already experiencing the impacts of climate change - [specific local examples: droughts, floods, heat waves]. At the same time, [Country] faces an energy crisis with [X]% of the population lacking reliable electricity access. The [Scenario Name] demonstrates that these challenges can be solved together: a pathway to [Y]% renewable electricity by [Year] that also expands access, creates jobs, and cuts emissions by [Z]%.

THE VISION: A CLEANER, FAIRER ENERGY SYSTEM
Imagine [Country] in [Year]. Solar panels cover [X] hectares - enough to power [Y] million homes. Wind turbines generate clean electricity in [regions]. Over [N] people work in the renewable energy sector, many in communities that previously relied on [coal/diesel]. The air is cleaner: power sector emissions have dropped by [Z]%, equivalent to taking [A] cars off the road. And [Country] has become a clean energy exporter, selling surplus renewable power to neighbors.

This is not a distant dream - it is achievable with decisions we make today.

[Continue with remaining sections...]

CALL TO ACTION
This scenario shows what is possible. Now we need political will to make it happen. We call on:

✓ Government: Commit to [specific policy] by [date]
✓ Parliament: Pass renewable energy law with [specific provisions]
✓ Development Partners: Prioritize concessional finance for [specific projects]
✓ Civil Society: Join the [Country] Clean Energy Coalition
✓ Citizens: Demand climate action from your representatives

Together, we can build a cleaner, fairer energy future for [Country].

---

FRAMING TIPS FOR CLIMATE AUDIENCES:
• Emphasize ambition and urgency, not just technical feasibility
• Use moral/justice framing, not just economic arguments
• Acknowledge imperfections while supporting progress
• Connect to lived experiences, not abstract targets
• Build solidarity with global climate movement`,
    toolkitReference: 'Section 4.3 - Public presentations and storytelling with data'
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DisseminationTemplate | undefined {
  return disseminationTemplates.find(t => t.id === id);
}

/**
 * Get templates suitable for a stakeholder group
 */
export function getTemplatesForStakeholder(stakeholderId: string): DisseminationTemplate[] {
  const stakeholderNameMap: Record<string, string> = {
    'policy-makers': 'Policy Makers',
    'grid-operators': 'Grid Operators',
    'industry': 'Industry',
    'public': 'Public & Communities',
    'csos-ngos': 'CSOs & NGOs',
    'scientific': 'Scientific Institutions',
    'finance': 'Financial Institutions',
    'regional-bodies': 'Regional Bodies',
    'development-partners': 'Development Partners'
  };

  const stakeholderName = stakeholderNameMap[stakeholderId];
  if (!stakeholderName) return [];

  return disseminationTemplates.filter(template =>
    template.bestFor.some(audience =>
      audience.toLowerCase().includes(stakeholderName.toLowerCase().split(' ')[0])
    )
  );
}
