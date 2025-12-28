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
import DisseminationTemplates from './DisseminationTemplates';
import CommunityImpactCalculator from './CommunityImpactCalculator';

type CommunicateView = 'strategies' | 'templates' | 'community-calculator';

export default function CommunicateTab() {
  const { scenario } = useScenario();
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderId | null>(null);
  const [currentView, setCurrentView] = useState<CommunicateView>('strategies');

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

  // If no scenario loaded, show prompt to load one
  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
            Communication Strategies
          </h1>
        </div>

        {/* No Scenario Loaded Message */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Load a Scenario to Get Started
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Communication strategies and templates are customized based on your scenario data.
            Please load a scenario first to access this tab.
          </p>
          <div className="bg-white border border-gray-300 rounded-lg p-6 text-left max-w-md mx-auto">
            <p className="text-sm font-semibold text-gray-800 mb-3">To load a scenario:</p>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Go to the <strong>Input</strong> tab</li>
              <li>Click <strong>"Load Rwanda Example"</strong> for a quick start</li>
              <li>Or upload your own scenario data (JSON or Excel template)</li>
              <li>Return here to generate communication materials</li>
            </ol>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              💡 <em>This ensures your dissemination strategies and templates include actual metrics
              from your energy scenario (renewable share, investment needs, emissions, jobs, etc.)</em>
            </p>
          </div>
        </div>

        {/* Toolkit Reference */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            About This Tool
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            This Communication tab is based on <strong>IRENA's Participatory Processes for Strategic
            Energy Planning toolkit, Section 4.3: Knowledge Dissemination</strong>.
          </p>
          <p className="text-sm text-gray-700">
            It helps you create stakeholder-specific communication materials using your scenario data.
          </p>
        </div>
      </div>
    );
  }

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

      {/* View Switcher */}
      <div className="mb-8">
        <div className="flex gap-4 border-b border-gray-300">
          <button
            onClick={() => setCurrentView('strategies')}
            className={`px-6 py-3 font-semibold transition-colors ${
              currentView === 'strategies'
                ? 'text-irena-blue border-b-2 border-irena-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Dissemination Strategies
          </button>
          <button
            onClick={() => setCurrentView('templates')}
            className={`px-6 py-3 font-semibold transition-colors ${
              currentView === 'templates'
                ? 'text-irena-blue border-b-2 border-irena-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Format Templates
          </button>
        </div>
      </div>

      {/* Conditional View: Strategies, Templates, or Community Calculator */}
      {currentView === 'community-calculator' ? (
        <CommunityImpactCalculator
          scenario={scenario}
          onBack={() => setCurrentView('strategies')}
        />
      ) : currentView === 'strategies' ? (
        <>
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

          {/* Demo Tool Button (Public & Communities only) */}
          {selectedStakeholder === 'public' && (
            <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏡</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    Try the Interactive Demo: Community Impact Calculator
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    See a working example of how to translate your scenario into personal impacts
                    (bills, jobs, air quality) that communities care about. Based on successful examples
                    from Belgium and Kenya.
                  </p>
                  <button
                    onClick={() => setCurrentView('community-calculator')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                  >
                    Launch Community Calculator Demo →
                  </button>
                </div>
              </div>
            </div>
          )}

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
        </>
      ) : (
        <DisseminationTemplates
          selectedStakeholderId={selectedStakeholder ?? undefined}
          scenarioData={getScenarioData()}
          scenarioName={scenario?.metadata?.name || 'Your Scenario'}
          country={scenario?.metadata?.country || 'Your Country'}
        />
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
