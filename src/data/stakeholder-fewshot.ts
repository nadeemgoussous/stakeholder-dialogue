/**
 * Few-Shot Examples for WebLLM Stakeholder Response Enhancement
 *
 * These examples teach the small LLM how each stakeholder group speaks.
 * Each example is kept SHORT (2-3 sentences) to stay within token limits.
 *
 * Pattern: Show 1-2 examples of stakeholder voice, then ask for new response.
 */

export interface FewShotExample {
  scenario: string;  // Brief scenario description
  response: string;  // How this stakeholder would respond
}

export interface StakeholderFewShot {
  stakeholderId: string;
  voiceDescription: string;  // How they talk (tone, vocabulary)
  examples: FewShotExample[];
}

/**
 * Few-shot examples for all 9 stakeholder groups
 * Each has 2 examples showing their unique voice and concerns
 */
export const STAKEHOLDER_FEWSHOTS: Record<string, StakeholderFewShot> = {
  'policy-makers': {
    stakeholderId: 'policy-makers',
    voiceDescription: 'Formal, balanced, focused on policy coherence and political feasibility',
    examples: [
      {
        scenario: '70% renewables by 2030, high upfront costs',
        response: 'This aligns with our national commitments, but we need to ensure the investment timeline matches our fiscal planning cycle. How will this integrate with existing power sector reforms?'
      },
      {
        scenario: '50% renewables, gradual coal phase-out by 2045',
        response: 'A measured approach that balances energy security with decarbonization. We must ensure this transition plan has cross-party support to survive election cycles.'
      }
    ]
  },

  'grid-operators': {
    stakeholderId: 'grid-operators',
    voiceDescription: 'Technical, risk-focused, concerned with system stability and reliability',
    examples: [
      {
        scenario: '80% renewables, 400 MWh battery storage',
        response: 'The 400 MWh storage is insufficient for this VRE penetration level. We need detailed frequency response studies and at minimum 1,500 MWh to maintain N-1 contingency standards.'
      },
      {
        scenario: '55% renewables with new interconnector',
        response: 'The interconnector improves our reserve margin situation. However, we require clarity on the ramping requirements during evening solar drop-off periods.'
      }
    ]
  },

  'industry': {
    stakeholderId: 'industry',
    voiceDescription: 'Business-oriented, focused on costs, competitiveness, and supply chain',
    examples: [
      {
        scenario: 'Aggressive renewable transition, carbon pricing',
        response: 'We support decarbonization but need transition support. A sudden carbon price shock could push energy-intensive operations offshore. What trade protection measures are planned?'
      },
      {
        scenario: 'Solar manufacturing incentives included',
        response: 'The local content requirements create real opportunities. We can pivot our manufacturing capacity if there are long-term offtake guarantees for domestic panels.'
      }
    ]
  },

  'public': {
    stakeholderId: 'public',
    voiceDescription: 'Accessible language, focused on bills, jobs, health, and local impacts',
    examples: [
      {
        scenario: 'Large solar farm near rural community',
        response: 'We want to know: will our electricity bills go down? How many local jobs will there be during construction and after? What about the farmland being used?'
      },
      {
        scenario: 'Coal plant closure with retraining program',
        response: 'Our families have worked at the plant for generations. The retraining program sounds good on paper, but will there actually be jobs paying similar wages nearby?'
      }
    ]
  },

  'csos-ngos': {
    stakeholderId: 'csos-ngos',
    voiceDescription: 'Advocacy-focused, emphasizing climate ambition, justice, and transparency',
    examples: [
      {
        scenario: '65% renewables by 2035',
        response: 'This falls short of Paris-aligned pathways. The science demands at least 80% by 2035. Why are we still leaving room for fossil fuel expansion in 2030?'
      },
      {
        scenario: 'High ambition with community benefit sharing',
        response: 'Finally, a plan that recognizes frontline communities deserve direct benefits! We support this but will monitor implementation closely to ensure promises are kept.'
      }
    ]
  },

  'scientific': {
    stakeholderId: 'scientific',
    voiceDescription: 'Evidence-based, methodological, focused on data quality and validation',
    examples: [
      {
        scenario: 'Optimistic solar cost projections',
        response: 'The assumed 40% cost reduction by 2030 needs validation against peer-reviewed literature. What sensitivity analysis has been conducted on these assumptions?'
      },
      {
        scenario: 'Comprehensive scenario with multiple pathways',
        response: 'The multi-pathway approach is methodologically sound. We recommend publishing the full model documentation for academic peer review before policy adoption.'
      }
    ]
  },

  'financial': {
    stakeholderId: 'financial',
    voiceDescription: 'Investment-focused, emphasizing bankability, risk, and returns',
    examples: [
      {
        scenario: 'Large renewable portfolio, unclear PPA structure',
        response: 'The project pipeline is attractive, but bankability depends on PPA creditworthiness. Who are the offtakers and what sovereign guarantees are available?'
      },
      {
        scenario: 'Green bond issuance with clear taxonomy',
        response: 'This qualifies for our green finance framework. With the EU taxonomy alignment, we can offer concessional rates. Lets discuss blended finance structures.'
      }
    ]
  },

  'regional-bodies': {
    stakeholderId: 'regional-bodies',
    voiceDescription: 'Regional perspective, focused on cross-border trade and harmonization',
    examples: [
      {
        scenario: 'High renewable surplus potential',
        response: 'This positions the country as a potential regional clean energy exporter. Have you coordinated with neighboring countries on transmission interconnection planning?'
      },
      {
        scenario: 'Isolated grid development',
        response: 'We encourage considering regional integration benefits. Pooled reserves could reduce the storage requirements significantly while improving system resilience.'
      }
    ]
  },

  'development-partners': {
    stakeholderId: 'development-partners',
    voiceDescription: 'Development-focused, balancing ambition with debt sustainability',
    examples: [
      {
        scenario: '$5 billion investment requirement',
        response: 'We can mobilize climate finance for this, but the debt sustainability analysis is critical. What is the grant-to-loan ratio assumption in your financing plan?'
      },
      {
        scenario: 'Just transition elements included',
        response: 'The inclusion of just transition components strengthens the case for concessional financing. We can bring this to our climate investment committee as a priority project.'
      }
    ]
  }
};

/**
 * Get few-shot examples for a stakeholder
 */
export function getFewShotExamples(stakeholderId: string): StakeholderFewShot | null {
  return STAKEHOLDER_FEWSHOTS[stakeholderId] || null;
}

/**
 * Build a few-shot prompt section for a stakeholder
 * Returns a formatted string with examples
 */
export function buildFewShotSection(stakeholderId: string): string {
  const fewshot = STAKEHOLDER_FEWSHOTS[stakeholderId];
  if (!fewshot) return '';

  let section = `Voice: ${fewshot.voiceDescription}\n\nExamples:\n`;

  fewshot.examples.forEach((ex, i) => {
    section += `\n${i + 1}. Scenario: ${ex.scenario}\nResponse: "${ex.response}"\n`;
  });

  return section;
}
