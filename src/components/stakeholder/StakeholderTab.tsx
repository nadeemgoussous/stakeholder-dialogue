import { useState } from 'react';
import { stakeholderProfiles } from '../../data/stakeholder-profiles';
import type { StakeholderProfile } from '../../types/stakeholder';

interface StakeholderTabProps {
  onStakeholderSelected?: (stakeholder: StakeholderProfile) => void;
}

export default function StakeholderTab({ onStakeholderSelected }: StakeholderTabProps) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderProfile | null>(null);

  const handleStakeholderClick = (stakeholder: StakeholderProfile) => {
    setSelectedStakeholder(stakeholder);
    onStakeholderSelected?.(stakeholder);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          Stakeholder Dialogue
        </h2>
        <p className="text-gray-600 text-lg">
          Select a stakeholder group to explore their perspective on your scenario
        </p>
      </div>

      {/* Stakeholder Icon Grid */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Select Stakeholder Group
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {stakeholderProfiles.map((stakeholder) => (
            <button
              key={stakeholder.id}
              onClick={() => handleStakeholderClick(stakeholder)}
              className={`
                stakeholder-button
                flex flex-col items-center justify-center
                p-4 rounded-lg border-2 transition-all
                hover:shadow-md hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  selectedStakeholder?.id === stakeholder.id
                    ? 'border-current shadow-lg scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{
                color: selectedStakeholder?.id === stakeholder.id ? stakeholder.color : '#6b7280',
                borderColor: selectedStakeholder?.id === stakeholder.id ? stakeholder.color : undefined,
              }}
              aria-pressed={selectedStakeholder?.id === stakeholder.id}
              aria-label={`Select ${stakeholder.name}`}
            >
              {/* Icon Placeholder */}
              <div
                className="w-16 h-16 mb-2 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: stakeholder.color }}
              >
                {stakeholder.name.charAt(0)}
              </div>

              {/* Stakeholder Name */}
              <span className="text-xs text-center font-medium leading-tight">
                {stakeholder.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Stakeholder Details */}
      {selectedStakeholder && (
        <div
          className="card"
          style={{ borderLeftColor: selectedStakeholder.color, borderLeftWidth: '4px' }}
        >
          <div className="flex items-start gap-4 mb-6">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ backgroundColor: selectedStakeholder.color }}
            >
              {selectedStakeholder.name.charAt(0)}
            </div>

            {/* Header */}
            <div className="flex-1">
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: selectedStakeholder.color }}
              >
                {selectedStakeholder.name}
              </h3>
              <p className="text-gray-700">
                {selectedStakeholder.description}
              </p>
            </div>
          </div>

          {/* Key Priorities */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span
                className="w-1 h-5 rounded"
                style={{ backgroundColor: selectedStakeholder.color }}
              ></span>
              Key Priorities
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedStakeholder.priorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Typical Questions */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span
                className="w-1 h-5 rounded"
                style={{ backgroundColor: selectedStakeholder.color }}
              ></span>
              Typical Questions They Ask
            </h4>
            <ul className="space-y-2">
              {selectedStakeholder.typicalQuestions.map((question, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-gray-400">❓</span>
                  <span className="italic">{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Engage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Why Engage This Group?</h4>
            <p className="text-gray-700 mb-3">{selectedStakeholder.whyEngage}</p>

            <h4 className="font-semibold text-gray-900 mb-2">What's In It For Them?</h4>
            <p className="text-gray-700">{selectedStakeholder.benefitForThem}</p>
          </div>

          {/* Next Step Button */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              className="btn-primary px-8 py-3 text-lg"
              style={{ backgroundColor: selectedStakeholder.color }}
              onClick={() => {
                // Future: Navigate to prediction input
                console.log('Proceeding to predict response for:', selectedStakeholder.name);
              }}
            >
              Predict Their Response →
            </button>
          </div>
        </div>
      )}

      {/* Instruction Text (when no stakeholder selected) */}
      {!selectedStakeholder && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">
            Click on a stakeholder group above to see their perspective and priorities
          </p>
        </div>
      )}
    </div>
  );
}
