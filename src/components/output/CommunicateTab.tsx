/**
 * Communication Tab - Dissemination Strategy Recommender
 *
 * Educational tool to help energy planners choose effective dissemination
 * formats for different stakeholder audiences.
 *
 * Based on IRENA Participatory Processes Toolkit Section 4.3
 */

import { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { stakeholderProfiles } from '../../data/stakeholder-profiles';
import { getDisseminationStrategy } from '../../data/dissemination-strategies';
import type { StakeholderId } from '../../types/stakeholder';
import DisseminationStrategyDisplay from './DisseminationStrategyDisplay';

export default function CommunicateTab() {
  const { scenario } = useScenario();
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderId | null>(null);

  // Prepare scenario data for populating key messages
  const getScenarioData = (): Record<string, string | number> => {
    if (!scenario) {
      return {
        reShare2030: 'N/A',
        reShare2050: 'N/A',
        investment2050: 'N/A',
        jobs2030: 'N/A',
        emissionsReduction: 'N/A',
        totalCapacity: 'N/A',
        batteryCapacity: 'N/A',
      };
    }

    // Extract key metrics from scenario
    const milestones = scenario.milestones || [];
    const milestone2030 = milestones.find(m => m.year === 2030);
    const milestone2050 = milestones.find(m => m.year === 2050);

    // Calculate total installed capacity (sum of all categories)
    const totalCapacity2050 = milestone2050?.capacity?.total
      ? (milestone2050.capacity.total.renewables || 0) +
        (milestone2050.capacity.total.fossil || 0) +
        (milestone2050.capacity.total.storage || 0) +
        (milestone2050.capacity.total.other || 0)
      : 0;

    return {
      reShare2030: milestone2030?.reShare?.toFixed(0) || 'N/A',
      reShare2050: milestone2050?.reShare?.toFixed(0) || 'N/A',
      investment2050: milestone2050?.investment?.cumulative?.toFixed(0) || 'N/A',
      jobs2030: '5,000', // Would come from derived metrics
      emissionsReduction: milestone2050?.emissions?.total && milestones[0]?.emissions?.total
        ? Math.round((1 - milestone2050.emissions.total / milestones[0].emissions.total) * 100)
        : 'N/A',
      totalCapacity: totalCapacity2050 > 0 ? totalCapacity2050.toFixed(0) : 'N/A',
      batteryCapacity: milestone2030?.capacity?.total?.storage?.toFixed(0) || 'N/A',
    };
  };

  const selectedStrategy = selectedStakeholder ? getDisseminationStrategy(selectedStakeholder) : null;
  const selectedProfile = selectedStakeholder ? stakeholderProfiles.find(p => p.id === selectedStakeholder) : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
          Communication Strategies
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Learn which dissemination formats work best for each stakeholder group, based on IRENA's
          Participatory Processes Toolkit.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>Educational Focus:</strong> This tool teaches you which formats resonate with different
            audiences. Use the guidance below to create your own materials customized to your local context.
          </p>
        </div>
      </div>

      {/* Stakeholder Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Select Stakeholder Audience
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stakeholderProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedStakeholder(profile.id as StakeholderId)}
              className={`stakeholder-selector-btn p-4 rounded-lg border-2 transition-all ${
                selectedStakeholder === profile.id
                  ? 'border-current shadow-lg transform scale-105'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              style={{
                borderColor: selectedStakeholder === profile.id ? profile.color : undefined,
                backgroundColor: selectedStakeholder === profile.id ? `${profile.color}15` : 'white',
              }}
              aria-pressed={selectedStakeholder === profile.id}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon placeholder - would use actual SVG */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${profile.color}30` }}
                >
                  <span className="text-2xl" role="img" aria-label={profile.name}>
                    {getStakeholderEmoji(profile.id as StakeholderId)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800">{profile.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Display */}
      {selectedStrategy && selectedProfile && scenario ? (
        <DisseminationStrategyDisplay
          strategy={selectedStrategy}
          profile={selectedProfile}
          scenarioData={getScenarioData()}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            Select a stakeholder group above to see recommended communication strategies
          </p>
        </div>
      )}

      {/* Toolkit Reference */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          About This Tool
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          This Communication tab is based on <strong>IRENA's Participatory Processes for Strategic
          Energy Planning toolkit, Section 4.3: Knowledge Dissemination</strong>.
        </p>
        <p className="text-sm text-gray-700 mb-3">
          The toolkit emphasizes that effective dissemination requires:
        </p>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
          <li>Matching format to audience technical level and time availability</li>
          <li>Using interactive tools to make scenarios personal and relatable</li>
          <li>Layering communication (headlines → details for those interested)</li>
          <li>Telling stories with data, not just presenting numbers</li>
          <li>Considering gamification for broad public engagement</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Helper function to get emoji icons for stakeholders
 * (In production, would use actual SVG icons from public/icons/)
 */
function getStakeholderEmoji(id: StakeholderId): string {
  const emojiMap: Record<StakeholderId, string> = {
    'policy-makers': '🏛️',
    'grid-operators': '⚡',
    'industry': '🏭',
    'public': '👥',
    'csos-ngos': '🌱',
    'scientific': '🔬',
    'finance': '💰',
    'regional-bodies': '🌍',
    'development-partners': '🤝',
  };
  return emojiMap[id] || '📄';
}
