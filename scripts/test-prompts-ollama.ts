/**
 * Large-Scale Prompt Testing via Ollama
 *
 * Tests the few-shot prompts against SmolLM2 with many scenario variations.
 * Logs all responses to a JSON file for quality analysis.
 *
 * Usage: npx tsx scripts/test-prompts-ollama.ts
 */

import fs from 'fs';
import path from 'path';

// ============ CONFIGURATION ============
const CONFIG = {
  model: 'smollm2:1.7b',
  ollamaUrl: 'http://localhost:11434',
  outputFile: 'test-results/prompt-test-results.json',
  maxTokens: 600,
  temperature: 0.7,
};

// ============ STAKEHOLDER DATA ============
const STAKEHOLDERS = [
  {
    id: 'policy-makers',
    name: 'Policy Makers & Regulators',
    priorities: ['Policy coherence', 'Political feasibility', 'Energy security'],
    voiceDescription: 'Formal, balanced, focused on policy coherence and political feasibility',
    examples: [
      { scenario: '70% renewables by 2030, high upfront costs', response: 'This aligns with our national commitments, but we need to ensure the investment timeline matches our fiscal planning cycle. How will this integrate with existing power sector reforms?' },
      { scenario: '50% renewables, gradual coal phase-out by 2045', response: 'A measured approach that balances energy security with decarbonization. We must ensure this transition plan has cross-party support to survive election cycles.' }
    ]
  },
  {
    id: 'grid-operators',
    name: 'Grid Operators',
    priorities: ['Grid stability', 'Reliability', 'Cost-effective operations'],
    voiceDescription: 'Technical, risk-focused, concerned with system stability and reliability',
    examples: [
      { scenario: '80% renewables, 400 MWh battery storage', response: 'The 400 MWh storage is insufficient for this VRE penetration level. We need detailed frequency response studies and at minimum 1,500 MWh to maintain N-1 contingency standards.' },
      { scenario: '55% renewables with new interconnector', response: 'The interconnector improves our reserve margin situation. However, we require clarity on the ramping requirements during evening solar drop-off periods.' }
    ]
  },
  {
    id: 'industry',
    name: 'Industry & Business',
    priorities: ['Energy costs', 'Supply reliability', 'Competitiveness'],
    voiceDescription: 'Business-oriented, focused on costs, competitiveness, and supply chain',
    examples: [
      { scenario: 'Aggressive renewable transition, carbon pricing', response: 'We support decarbonization but need transition support. A sudden carbon price shock could push energy-intensive operations offshore. What trade protection measures are planned?' },
      { scenario: 'Solar manufacturing incentives included', response: 'The local content requirements create real opportunities. We can pivot our manufacturing capacity if there are long-term offtake guarantees for domestic panels.' }
    ]
  },
  {
    id: 'public',
    name: 'Public & Communities',
    priorities: ['Electricity affordability', 'Local jobs', 'Health impacts'],
    voiceDescription: 'Accessible language, focused on bills, jobs, health, and local impacts',
    examples: [
      { scenario: 'Large solar farm near rural community', response: 'We want to know: will our electricity bills go down? How many local jobs will there be during construction and after? What about the farmland being used?' },
      { scenario: 'Coal plant closure with retraining program', response: 'Our families have worked at the plant for generations. The retraining program sounds good on paper, but will there actually be jobs paying similar wages nearby?' }
    ]
  },
  {
    id: 'csos-ngos',
    name: 'CSOs & NGOs',
    priorities: ['Climate ambition', 'Just transition', 'Transparency'],
    voiceDescription: 'Advocacy-focused, emphasizing climate ambition, justice, and transparency',
    examples: [
      { scenario: '65% renewables by 2035', response: 'This falls short of Paris-aligned pathways. The science demands at least 80% by 2035. Why are we still leaving room for fossil fuel expansion in 2030?' },
      { scenario: 'High ambition with community benefit sharing', response: 'Finally, a plan that recognizes frontline communities deserve direct benefits! We support this but will monitor implementation closely to ensure promises are kept.' }
    ]
  },
  {
    id: 'scientific',
    name: 'Scientific Institutions',
    priorities: ['Evidence-based policy', 'Data quality', 'Peer review'],
    voiceDescription: 'Evidence-based, methodological, focused on data quality and validation',
    examples: [
      { scenario: 'Optimistic solar cost projections', response: 'The assumed 40% cost reduction by 2030 needs validation against peer-reviewed literature. What sensitivity analysis has been conducted on these assumptions?' },
      { scenario: 'Comprehensive scenario with multiple pathways', response: 'The multi-pathway approach is methodologically sound. We recommend publishing the full model documentation for academic peer review before policy adoption.' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Institutions',
    priorities: ['Bankability', 'Risk-adjusted returns', 'Policy certainty'],
    voiceDescription: 'Investment-focused, emphasizing bankability, risk, and returns',
    examples: [
      { scenario: 'Large renewable portfolio, unclear PPA structure', response: 'The project pipeline is attractive, but bankability depends on PPA creditworthiness. Who are the offtakers and what sovereign guarantees are available?' },
      { scenario: 'Green bond issuance with clear taxonomy', response: 'This qualifies for our green finance framework. With the EU taxonomy alignment, we can offer concessional rates. Lets discuss blended finance structures.' }
    ]
  },
  {
    id: 'regional-bodies',
    name: 'Regional Bodies',
    priorities: ['Cross-border trade', 'Regional harmonization', 'Interconnection'],
    voiceDescription: 'Regional perspective, focused on cross-border trade and harmonization',
    examples: [
      { scenario: 'High renewable surplus potential', response: 'This positions the country as a potential regional clean energy exporter. Have you coordinated with neighboring countries on transmission interconnection planning?' },
      { scenario: 'Isolated grid development', response: 'We encourage considering regional integration benefits. Pooled reserves could reduce the storage requirements significantly while improving system resilience.' }
    ]
  },
  {
    id: 'development-partners',
    name: 'Development Partners',
    priorities: ['Climate alignment', 'Debt sustainability', 'Institutional capacity'],
    voiceDescription: 'Development-focused, balancing ambition with debt sustainability',
    examples: [
      { scenario: '$5 billion investment requirement', response: 'We can mobilize climate finance for this, but the debt sustainability analysis is critical. What is the grant-to-loan ratio assumption in your financing plan?' },
      { scenario: 'Just transition elements included', response: 'The inclusion of just transition components strengthens the case for concessional financing. We can bring this to our climate investment committee as a priority project.' }
    ]
  }
];

// ============ SCENARIO VARIATIONS ============
const SCENARIOS = [
  { reShare: 40, storage: 100, country: 'Kenya', context: 'low ambition' },
  { reShare: 55, storage: 300, country: 'Ghana', context: 'moderate transition' },
  { reShare: 70, storage: 500, country: 'Morocco', context: 'ambitious target' },
  { reShare: 82, storage: 800, country: 'Chile', context: 'high renewable' },
  { reShare: 95, storage: 2000, country: 'Costa Rica', context: 'near-zero carbon' },
  { reShare: 45, storage: 50, country: 'Nigeria', context: 'early transition' },
  { reShare: 60, storage: 400, country: 'South Africa', context: 'coal phase-out' },
  { reShare: 75, storage: 600, country: 'Vietnam', context: 'rapid growth' },
  { reShare: 35, storage: 0, country: 'Pakistan', context: 'fossil-heavy' },
  { reShare: 88, storage: 1500, country: 'Uruguay', context: 'wind-dominant' },
];

// ============ PROMPT BUILDER ============
function buildPrompt(stakeholder: typeof STAKEHOLDERS[0], scenario: typeof SCENARIOS[0]): { system: string; user: string } {
  const fewShotSection = `Voice: ${stakeholder.voiceDescription}

Examples:

1. Scenario: ${stakeholder.examples[0].scenario}
Response: "${stakeholder.examples[0].response}"

2. Scenario: ${stakeholder.examples[1].scenario}
Response: "${stakeholder.examples[1].response}"
`;

  const system = `You are ${stakeholder.name}.

${fewShotSection}
Now respond to this scenario for ${scenario.country}:
- ${scenario.reShare}% renewable energy by 2030
- ${scenario.storage} MWh battery storage
- Context: ${scenario.context}
- Key concerns: ${stakeholder.priorities.slice(0, 2).join(', ')}

Write 2-3 sentences as ${stakeholder.name}. Match the voice and style from the examples above.
Output ONLY your response - no labels or formatting.`;

  const user = 'Write your response now.';

  return { system, user };
}

// ============ OLLAMA API ============
async function queryOllama(system: string, user: string): Promise<{ response: string; durationMs: number }> {
  const start = Date.now();

  const response = await fetch(`${CONFIG.ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.model,
      prompt: `${system}\n\n${user}`,
      stream: false,
      options: {
        temperature: CONFIG.temperature,
        num_predict: CONFIG.maxTokens,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - start;

  return { response: data.response?.trim() || '', durationMs };
}

// ============ MAIN TEST RUNNER ============
interface TestResult {
  stakeholderId: string;
  stakeholderName: string;
  scenario: typeof SCENARIOS[0];
  prompt: { system: string; user: string };
  response: string;
  durationMs: number;
  timestamp: string;
}

async function runTests(): Promise<void> {
  console.log('🚀 Starting large-scale prompt testing...\n');
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Stakeholders: ${STAKEHOLDERS.length}`);
  console.log(`Scenarios: ${SCENARIOS.length}`);
  console.log(`Total tests: ${STAKEHOLDERS.length * SCENARIOS.length}\n`);

  const results: TestResult[] = [];
  let completed = 0;
  const total = STAKEHOLDERS.length * SCENARIOS.length;

  for (const stakeholder of STAKEHOLDERS) {
    for (const scenario of SCENARIOS) {
      completed++;
      const prompt = buildPrompt(stakeholder, scenario);

      process.stdout.write(`[${completed}/${total}] ${stakeholder.id} + ${scenario.country}... `);

      try {
        const { response, durationMs } = await queryOllama(prompt.system, prompt.user);

        results.push({
          stakeholderId: stakeholder.id,
          stakeholderName: stakeholder.name,
          scenario,
          prompt,
          response,
          durationMs,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ ${durationMs}ms`);
      } catch (error) {
        console.log(`❌ Error: ${error}`);
        results.push({
          stakeholderId: stakeholder.id,
          stakeholderName: stakeholder.name,
          scenario,
          prompt,
          response: `ERROR: ${error}`,
          durationMs: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Save results
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify({
      config: CONFIG,
      runAt: new Date().toISOString(),
      totalTests: results.length,
      results
    }, null, 2)
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${results.filter(r => !r.response.startsWith('ERROR')).length}`);
  console.log(`Failed: ${results.filter(r => r.response.startsWith('ERROR')).length}`);

  const avgDuration = results.reduce((sum, r) => sum + r.durationMs, 0) / results.length;
  console.log(`Avg duration: ${avgDuration.toFixed(0)}ms`);

  console.log(`\nResults saved to: ${CONFIG.outputFile}`);

  // Print sample responses
  console.log('\n' + '='.repeat(60));
  console.log('📝 SAMPLE RESPONSES');
  console.log('='.repeat(60));

  for (const stakeholder of STAKEHOLDERS.slice(0, 3)) {
    const sample = results.find(r => r.stakeholderId === stakeholder.id);
    if (sample) {
      console.log(`\n[${sample.stakeholderName}] - ${sample.scenario.country} (${sample.scenario.reShare}% RE)`);
      console.log(`Response: "${sample.response.substring(0, 200)}${sample.response.length > 200 ? '...' : ''}"`);
    }
  }
}

// Run
runTests().catch(console.error);
