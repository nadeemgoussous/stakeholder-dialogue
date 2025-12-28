/**
 * Scenario Comparison Tool - Interactive Demo
 *
 * Teaching example showing how to compare scenarios against benchmarks
 * to communicate ambition levels to CSOs, NGOs, and scientific audiences.
 *
 * Compares: Business as Usual vs User's Scenario vs High Ambition
 */

import { useState } from 'react';
import type { ScenarioInput } from '../../types/scenario';
import { calculateJobs } from '../../utils/calculations';
import type { StakeholderId } from '../../types/stakeholder';

interface ScenarioComparisonProps {
  scenario: ScenarioInput;
  selectedStakeholder?: StakeholderId;
  onBack: () => void;
}

interface ComparisonScenario {
  id: 'bau' | 'user' | 'high-ambition';
  name: string;
  description: string;
  reShare2030: number;
  reShare2050: number;
  emissionsReduction: number; // % reduction from baseline
  totalInvestment: number; // billions USD
  jobsCreated: number;
  color: string;
}

/**
 * Generate BAU and High Ambition benchmarks based on user's scenario
 * These are illustrative - real analysis would use country-specific data
 */
function generateBenchmarks(scenario: ScenarioInput): {
  bau: ComparisonScenario;
  userScenario: ComparisonScenario;
  highAmbition: ComparisonScenario;
} {
  const milestones = scenario.milestones || [];
  const baseline = milestones[0];
  const milestone2030 = milestones.find(m => m.year === 2030) || milestones[Math.floor(milestones.length / 2)];
  const target = milestones[milestones.length - 1];

  // User scenario values
  const userReShare2030 = milestone2030?.reShare || 30;
  const userReShare2050 = target?.reShare || 60;

  // Calculate jobs from user scenario
  const jobs = calculateJobs(scenario);
  // Note: emissions are derived from milestone data, not separate calculation

  const targetYear = target?.year || 2050;
  const userJobs = jobs.total[targetYear] || 0;

  // Calculate emissions reduction
  const baselineEmissions = baseline?.emissions?.total || 10;
  const targetEmissions = target?.emissions?.total || 5;
  const userEmissionsReduction = Math.round((1 - targetEmissions / baselineEmissions) * 100);

  // Total investment (cumulative)
  const userInvestment = (target?.investment?.cumulative || 5000) / 1000; // Convert to billions

  // BAU: Minimal progress (15-25% RE by 2050, minimal investment)
  const bauReShare2030 = Math.max(baseline?.reShare || 10, userReShare2030 * 0.4);
  const bauReShare2050 = Math.max(baseline?.reShare || 10, userReShare2050 * 0.35);

  // High Ambition: Net-zero aligned (80-100% RE, 2x investment)
  const highAmbitionReShare2030 = Math.min(100, userReShare2030 * 1.4);
  const highAmbitionReShare2050 = Math.min(100, Math.max(85, userReShare2050 * 1.3));

  return {
    bau: {
      id: 'bau',
      name: 'Business as Usual',
      description: 'Continuation of current policies and investments',
      reShare2030: Math.round(bauReShare2030),
      reShare2050: Math.round(bauReShare2050),
      emissionsReduction: Math.round(userEmissionsReduction * 0.2),
      totalInvestment: Math.round(userInvestment * 0.3 * 10) / 10,
      jobsCreated: Math.round(userJobs * 0.25),
      color: '#6b7280', // gray
    },
    userScenario: {
      id: 'user',
      name: scenario.metadata?.scenarioName || 'Your Scenario',
      description: 'Based on your loaded scenario data',
      reShare2030: Math.round(userReShare2030),
      reShare2050: Math.round(userReShare2050),
      emissionsReduction: userEmissionsReduction,
      totalInvestment: Math.round(userInvestment * 10) / 10,
      jobsCreated: userJobs,
      color: '#0078a7', // IRENA blue
    },
    highAmbition: {
      id: 'high-ambition',
      name: 'High Ambition',
      description: 'Paris-aligned pathway (1.5°C compatible)',
      reShare2030: Math.round(highAmbitionReShare2030),
      reShare2050: Math.round(highAmbitionReShare2050),
      emissionsReduction: Math.min(95, Math.round(userEmissionsReduction * 1.5)),
      totalInvestment: Math.round(userInvestment * 2 * 10) / 10,
      jobsCreated: Math.round(userJobs * 1.8),
      color: '#10b981', // green
    },
  };
}

/**
 * Generate stakeholder-specific narrative interpretation
 */
function generateNarrative(
  stakeholder: StakeholderId | undefined,
  benchmarks: ReturnType<typeof generateBenchmarks>
): string {
  const { bau, userScenario, highAmbition } = benchmarks;
  const gap = highAmbition.reShare2050 - userScenario.reShare2050;
  const improvement = userScenario.reShare2050 - bau.reShare2050;

  const baseNarrative = `Your scenario achieves ${userScenario.reShare2050}% renewable energy by 2050, ` +
    `which is ${improvement} percentage points above Business as Usual. ` +
    `Compared to a High Ambition pathway, there's a ${gap} percentage point gap.`;

  switch (stakeholder) {
    case 'csos-ngos':
      return baseNarrative + ` From a climate justice perspective, closing this gap is essential ` +
        `for limiting global warming to 1.5°C and protecting vulnerable communities. ` +
        `Your scenario creates ${userScenario.jobsCreated.toLocaleString()} jobs, demonstrating that ` +
        `climate action and economic development can go hand in hand.`;

    case 'scientific':
      return baseNarrative + ` Scientifically, the High Ambition pathway aligns with IPCC AR6 ` +
        `recommendations for limiting warming to 1.5°C. The ${gap}% gap represents additional ` +
        `emissions of approximately ${Math.round(gap * 0.5)}% of cumulative carbon budget. ` +
        `Further analysis should examine sectoral coupling and grid integration requirements.`;

    case 'policy-makers':
      return baseNarrative + ` This positions your country as a moderate climate actor. ` +
        `Closing the gap to High Ambition would require an additional $${
          (highAmbition.totalInvestment - userScenario.totalInvestment).toFixed(1)
        } billion in investment but could unlock additional climate finance.`;

    case 'finance':
      return baseNarrative + ` Your scenario represents $${userScenario.totalInvestment} billion ` +
        `in investment opportunity. The High Ambition pathway doubles this to $${
          highAmbition.totalInvestment
        } billion, with stronger returns from avoided carbon costs and stranded assets.`;

    default:
      return baseNarrative + ` The comparison shows room for increased ambition while ` +
        `demonstrating significant progress from Business as Usual.`;
  }
}

export default function ScenarioComparison({
  scenario,
  selectedStakeholder,
  onBack,
}: ScenarioComparisonProps) {
  const [highlightedScenario, setHighlightedScenario] = useState<'bau' | 'user' | 'high-ambition' | null>(null);

  const benchmarks = generateBenchmarks(scenario);
  const scenarios = [benchmarks.bau, benchmarks.userScenario, benchmarks.highAmbition];
  const narrative = generateNarrative(selectedStakeholder, benchmarks);

  // Get target year from scenario
  const targetYear = scenario.milestones?.[scenario.milestones.length - 1]?.year || 2050;

  // Export comparison as CSV
  const exportCSV = () => {
    const headers = ['Metric', 'Business as Usual', scenario.metadata?.scenarioName || 'Your Scenario', 'High Ambition'];
    const rows = [
      ['RE Share 2030 (%)', benchmarks.bau.reShare2030, benchmarks.userScenario.reShare2030, benchmarks.highAmbition.reShare2030],
      [`RE Share ${targetYear} (%)`, benchmarks.bau.reShare2050, benchmarks.userScenario.reShare2050, benchmarks.highAmbition.reShare2050],
      ['Emissions Reduction (%)', benchmarks.bau.emissionsReduction, benchmarks.userScenario.emissionsReduction, benchmarks.highAmbition.emissionsReduction],
      ['Total Investment ($ billion)', benchmarks.bau.totalInvestment, benchmarks.userScenario.totalInvestment, benchmarks.highAmbition.totalInvestment],
      ['Jobs Created', benchmarks.bau.jobsCreated, benchmarks.userScenario.jobsCreated, benchmarks.highAmbition.jobsCreated],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `"Scenario: ${scenario.metadata?.scenarioName || 'Your Scenario'}"`,
      `"Country: ${scenario.metadata?.country || 'N/A'}"`,
      `"Generated: ${new Date().toISOString().split('T')[0]}"`,
      '',
      '"DISCLAIMER: These are illustrative benchmarks for comparison purposes only."',
      '"BAU and High Ambition scenarios use simplified assumptions and should not replace detailed modeling."',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenario-comparison-${scenario.metadata?.scenarioName?.toLowerCase().replace(/\s+/g, '-') || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-irena-blue hover:underline mb-4 flex items-center gap-2"
        >
          ← Back to Strategies
        </button>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          📊 Scenario Comparison Tool
        </h2>
        <p className="text-gray-700 mb-4">
          Compare your scenario against Business as Usual and High Ambition benchmarks
          to communicate ambition level and identify gaps.
        </p>

        {/* Demo Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>📚 This is a Teaching Example</strong> - This tool demonstrates how to frame
            scenarios relative to benchmarks for climate-focused audiences. BAU and High Ambition
            are illustrative—customize with country-specific data for real communications.
          </p>
        </div>
      </div>

      {/* Scenario Context */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>Your Scenario:</strong> {scenario.metadata?.scenarioName || 'Loaded Scenario'} |
          <strong> Country:</strong> {scenario.metadata?.country || 'N/A'} |
          <strong> Target Year:</strong> {targetYear}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Metric
                </th>
                {scenarios.map((s) => (
                  <th
                    key={s.id}
                    className={`px-4 py-3 text-center text-sm font-semibold border-b cursor-pointer transition-colors ${
                      highlightedScenario === s.id ? 'bg-opacity-20' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}20` : undefined,
                      color: s.color,
                    }}
                    onMouseEnter={() => setHighlightedScenario(s.id)}
                    onMouseLeave={() => setHighlightedScenario(null)}
                  >
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs font-normal text-gray-600">{s.description}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* RE Share 2030 */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  Renewable Energy Share (2030)
                </td>
                {scenarios.map((s) => (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-center text-lg font-bold ${
                      highlightedScenario === s.id ? 'bg-opacity-10' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}10` : undefined,
                      color: s.color,
                    }}
                  >
                    {s.reShare2030}%
                  </td>
                ))}
              </tr>

              {/* RE Share Target Year */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  Renewable Energy Share ({targetYear})
                </td>
                {scenarios.map((s) => (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-center text-lg font-bold ${
                      highlightedScenario === s.id ? 'bg-opacity-10' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}10` : undefined,
                      color: s.color,
                    }}
                  >
                    {s.reShare2050}%
                  </td>
                ))}
              </tr>

              {/* Emissions Reduction */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  Emissions Reduction by {targetYear}
                </td>
                {scenarios.map((s) => (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-center text-lg font-bold ${
                      highlightedScenario === s.id ? 'bg-opacity-10' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}10` : undefined,
                      color: s.color,
                    }}
                  >
                    {s.emissionsReduction}%
                  </td>
                ))}
              </tr>

              {/* Investment */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  Total Investment (USD billion)
                </td>
                {scenarios.map((s) => (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-center text-lg font-bold ${
                      highlightedScenario === s.id ? 'bg-opacity-10' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}10` : undefined,
                      color: s.color,
                    }}
                  >
                    ${s.totalInvestment}B
                  </td>
                ))}
              </tr>

              {/* Jobs */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  Jobs Created
                </td>
                {scenarios.map((s) => (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-center text-lg font-bold ${
                      highlightedScenario === s.id ? 'bg-opacity-10' : ''
                    }`}
                    style={{
                      backgroundColor: highlightedScenario === s.id ? `${s.color}10` : undefined,
                      color: s.color,
                    }}
                  >
                    {s.jobsCreated.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparison Bar */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Renewable Energy Share by {targetYear}
        </h3>
        <div className="space-y-4">
          {scenarios.map((s) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                {s.name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${s.reShare2050}%`,
                    backgroundColor: s.color,
                  }}
                >
                  <span className="text-white font-bold text-sm">
                    {s.reShare2050}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Narrative Interpretation */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          {selectedStakeholder === 'csos-ngos' ? '🌱 Climate Justice Perspective' :
           selectedStakeholder === 'scientific' ? '🔬 Scientific Analysis' :
           selectedStakeholder === 'finance' ? '💰 Investment Perspective' :
           selectedStakeholder === 'policy-makers' ? '🏛️ Policy Perspective' :
           '📊 Interpretation'}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {narrative}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ ILLUSTRATIVE BENCHMARKS ONLY</strong><br />
          BAU and High Ambition scenarios use simplified assumptions based on your scenario data.
          For formal communications, develop country-specific benchmarks using official NDC targets,
          IEA/IRENA scenarios, or IPCC pathways. Always verify with detailed energy system modeling.
        </p>
      </div>

      {/* Export */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📥</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Export Comparison Data
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Download the comparison table as a CSV file for use in presentations,
              reports, or further analysis.
            </p>
            <button
              onClick={exportCSV}
              className="bg-irena-orange hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              📥 Export as CSV
            </button>
          </div>
        </div>
      </div>

      {/* Educational Context */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Why Scenario Comparison Works
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Comparing scenarios against benchmarks is effective for climate-focused audiences because:
        </p>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
          <li><strong>Provides context</strong> - "60% RE" means more when shown relative to alternatives</li>
          <li><strong>Identifies gaps</strong> - Shows where additional ambition could make a difference</li>
          <li><strong>Builds urgency</strong> - BAU comparison highlights costs of inaction</li>
          <li><strong>Enables advocacy</strong> - CSOs can use gaps to push for stronger policies</li>
          <li><strong>Supports science communication</strong> - Connects scenarios to IPCC pathways</li>
        </ul>
        <p className="text-sm text-gray-700 mt-4">
          <strong>Tip:</strong> For CSO audiences, emphasize the emissions gap and job co-benefits.
          For scientific audiences, add uncertainty ranges and reference peer-reviewed scenarios.
        </p>
      </div>
    </div>
  );
}
