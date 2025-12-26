/**
 * Dissemination Strategy Display Component
 *
 * Shows recommended communication formats and strategies for a selected stakeholder
 */

import { populateKeyMessages } from '../../data/dissemination-strategies';
import type { DisseminationStrategy } from '../../data/dissemination-strategies';
import type { StakeholderProfile } from '../../types/stakeholder';

interface DisseminationStrategyDisplayProps {
  strategy: DisseminationStrategy;
  profile: StakeholderProfile;
  scenarioData: Record<string, string | number>;
}

export default function DisseminationStrategyDisplay({
  strategy,
  profile,
  scenarioData,
}: DisseminationStrategyDisplayProps) {
  const populatedMessages = populateKeyMessages(strategy.keyMessages, scenarioData);

  return (
    <div className="space-y-6">
      {/* Why This Matters */}
      <div
        className="p-6 rounded-lg border-l-4"
        style={{
          borderColor: profile.color,
          backgroundColor: `${profile.color}10`,
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: profile.color }}>
          Why This Matters for {profile.name}
        </h3>
        <p className="text-gray-700">{strategy.whyThisMatters}</p>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Technical Level</div>
            <div className="font-semibold text-gray-800 capitalize">{strategy.technicalLevel}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time Available</div>
            <div className="font-semibold text-gray-800 capitalize">{strategy.timeAvailable}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Decision Influence</div>
            <div className="font-semibold text-gray-800 capitalize">{strategy.decisionInfluence}</div>
          </div>
        </div>
      </div>

      {/* Recommended Formats */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Recommended Dissemination Formats
        </h3>
        <div className="space-y-4">
          {strategy.formats.map((format, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border-2 p-5 hover:shadow-md transition-shadow"
              style={{
                borderColor: format.level === 'primary' ? profile.color : '#e5e7eb',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{format.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        format.level === 'primary'
                          ? 'bg-green-100 text-green-800'
                          : format.level === 'secondary'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {format.level.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        format.effort === 'low'
                          ? 'bg-green-50 text-green-700'
                          : format.effort === 'medium'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {format.effort.toUpperCase()} EFFORT
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{format.description}</p>
                </div>
              </div>

              <div className="mt-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Examples:</h5>
                <ul className="space-y-1">
                  {format.examples.map((example, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Messages to Emphasize */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Key Messages to Emphasize
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These messages are customized based on your scenario data. Copy and adapt them for your materials.
        </p>
        <ul className="space-y-3">
          {populatedMessages.map((message, index) => (
            <li key={index} className="flex items-start">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3"
                style={{ backgroundColor: profile.color }}
              >
                {index + 1}
              </span>
              <span className="text-gray-700 flex-1">{message}</span>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
          onClick={() => {
            const text = populatedMessages.join('\n\n');
            navigator.clipboard.writeText(text);
          }}
        >
          📋 Copy All Messages
        </button>
      </div>

      {/* Narrative Framing */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          Narrative Framing Guidance
        </h3>
        <p className="text-gray-700 leading-relaxed">{strategy.narrativeFraming}</p>
      </div>

      {/* What to Avoid */}
      <div className="bg-red-50 rounded-lg border-l-4 border-red-400 p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">
          ⚠️ What to Avoid
        </h3>
        <ul className="space-y-2">
          {strategy.avoidances.map((avoidance, index) => (
            <li key={index} className="flex items-start text-red-800">
              <span className="mr-3 text-red-600 font-bold">✗</span>
              <span>{avoidance}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Toolkit Methods Reference */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          IRENA Toolkit Methods Referenced
        </h3>
        <ul className="space-y-2">
          {strategy.toolkitMethods.map((method, index) => (
            <li key={index} className="flex items-start text-gray-700">
              <span className="mr-3 text-blue-600">📚</span>
              <span className="text-sm">{method}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Demo Tools Navigation (for F028-F030) */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Interactive Tools & Templates
        </h3>
        <p className="text-gray-600 mb-4">
          Explore working examples and templates to help you create effective dissemination materials:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg text-left transition-all hover:shadow-md"
            disabled
            title="Coming in F029"
          >
            <div className="text-2xl mb-2">🧮</div>
            <div className="font-semibold text-gray-800 mb-1">Community Calculator</div>
            <div className="text-sm text-gray-500">Interactive demo tool</div>
            <div className="text-xs text-gray-400 mt-2">Coming soon (F029)</div>
          </button>

          <button
            className="p-4 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg text-left transition-all hover:shadow-md"
            disabled
            title="Coming in F030"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-800 mb-1">Scenario Comparison</div>
            <div className="text-sm text-gray-500">Ambition benchmarking</div>
            <div className="text-xs text-gray-400 mt-2">Coming soon (F030)</div>
          </button>

          <button
            className="p-4 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg text-left transition-all hover:shadow-md"
            disabled
            title="Coming in F028"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold text-gray-800 mb-1">Format Templates</div>
            <div className="text-sm text-gray-500">Briefing outlines</div>
            <div className="text-xs text-gray-400 mt-2">Coming soon (F028)</div>
          </button>
        </div>
      </div>
    </div>
  );
}
