import { useState } from 'react';
import { stakeholderProfiles } from '../../data/stakeholder-profiles';
import type { StakeholderProfile, DevelopmentContext, StakeholderVariant } from '../../types/stakeholder';
import type { StakeholderResponse } from '../../types/response';
import { StakeholderIcon } from './StakeholderIcon';
import PredictionInput from '../prediction/PredictionInput';
import CompareView from '../prediction/CompareView';
import { useScenario } from '../../context/ScenarioContext';
import { generateEnhancedResponse, getContextDescription } from '../../utils/stakeholder-rules';
import { maybeEnhanceWithAI, DEFAULT_AI_CONFIG } from '../../utils/stakeholder-ai';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface StakeholderTabProps {
  onStakeholderSelected?: (stakeholder: StakeholderProfile) => void;
}

export default function StakeholderTab({ onStakeholderSelected }: StakeholderTabProps) {
  const { scenario, derivedMetrics } = useScenario();
  const isOnline = useOnlineStatus();
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderProfile | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [userPrediction, setUserPrediction] = useState<string>('');
  const [stakeholderResponse, setStakeholderResponse] = useState<StakeholderResponse | null>(null);

  // Enhanced framework controls
  const [developmentContext, setDevelopmentContext] = useState<DevelopmentContext>('emerging');
  const [stakeholderVariant, setStakeholderVariant] = useState<StakeholderVariant>('pragmatic');

  const handleStakeholderClick = (stakeholder: StakeholderProfile) => {
    setSelectedStakeholder(stakeholder);
    setShowPrediction(false);
    setUserPrediction('');
    setStakeholderResponse(null);
    onStakeholderSelected?.(stakeholder);
  };

  const handleProceedToPrediction = () => {
    setShowPrediction(true);
  };

  const handleRevealResponse = async (prediction: string) => {
    setUserPrediction(prediction);

    // Generate stakeholder response with enhanced framework
    if (scenario && derivedMetrics && selectedStakeholder) {
      console.log('Generating response for:', selectedStakeholder.name);
      console.log('Context:', developmentContext, 'Variant:', stakeholderVariant);
      console.log('Scenario loaded:', !!scenario);
      console.log('Derived metrics loaded:', !!derivedMetrics);

      // Generate enhanced response with context and variant
      const enhancedResponse = generateEnhancedResponse(
        scenario,
        derivedMetrics,
        selectedStakeholder,
        {
          context: developmentContext,
          variant: stakeholderVariant,
          includeInteractionTriggers: true
        }
      );

      // Try to enhance with AI on top (silent failover if unavailable)
      const aiEnhancedResponse = await maybeEnhanceWithAI(
        enhancedResponse,
        selectedStakeholder,
        scenario,
        derivedMetrics,
        DEFAULT_AI_CONFIG
      );

      console.log('Response generated:', aiEnhancedResponse.generationType);
      console.log('Interaction triggers:', aiEnhancedResponse.metadata?.interactionTriggersCount || 0);
      setStakeholderResponse(aiEnhancedResponse);
    } else {
      console.error('Missing data for response generation:');
      console.error('- Scenario:', !!scenario);
      console.error('- Derived metrics:', !!derivedMetrics);
      console.error('- Selected stakeholder:', !!selectedStakeholder);
    }
  };

  const handleBackToSelection = () => {
    setShowPrediction(false);
    setUserPrediction('');
    setStakeholderResponse(null);
  };

  const handleTryAnother = () => {
    setSelectedStakeholder(null);
    setShowPrediction(false);
    setUserPrediction('');
    setStakeholderResponse(null);
  };

  // If showing compare view (after response generation), render that
  if (stakeholderResponse && selectedStakeholder && userPrediction) {
    return (
      <CompareView
        stakeholder={selectedStakeholder}
        userPrediction={userPrediction}
        stakeholderResponse={stakeholderResponse}
        onTryAnother={handleTryAnother}
      />
    );
  }

  // If showing prediction input, render that instead
  if (showPrediction && selectedStakeholder) {
    return (
      <PredictionInput
        stakeholder={selectedStakeholder}
        onRevealResponse={handleRevealResponse}
        onBack={handleBackToSelection}
      />
    );
  }

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

        {/* AI Status Indicator - subtle, not alarming */}
        {!isOnline && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Working offline - responses use rule-based generation</span>
          </div>
        )}
      </div>

      {/* Enhanced Framework Controls */}
      <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
          </svg>
          Response Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Development Context Selector */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              Country Development Context
            </label>
            <select
              id="context"
              value={developmentContext}
              onChange={(e) => setDevelopmentContext(e.target.value as DevelopmentContext)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="least-developed">Least-Developed Countries</option>
              <option value="emerging">Emerging Economies</option>
              <option value="developed">Developed Countries</option>
            </select>
            <p className="mt-2 text-xs text-gray-600">
              {getContextDescription(developmentContext)}
            </p>
          </div>

          {/* Stakeholder Variant Selector */}
          <div>
            <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-2">
              Stakeholder Perspective
            </label>
            <select
              id="variant"
              value={stakeholderVariant}
              onChange={(e) => setStakeholderVariant(e.target.value as StakeholderVariant)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="conservative">Conservative - Cautious on change, risk-averse</option>
              <option value="pragmatic">Pragmatic - Balanced, seeks feasible solutions</option>
              <option value="progressive">Progressive - Ambitious, embracing transition</option>
            </select>
            <p className="mt-2 text-xs text-gray-600">
              {stakeholderVariant === 'conservative' && 'Prioritizes security and stability, cautious on rapid transitions'}
              {stakeholderVariant === 'pragmatic' && 'Balances multiple objectives, focuses on practical implementation'}
              {stakeholderVariant === 'progressive' && 'Champions ambitious goals, willing to accept managed risk'}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              These settings adjust stakeholder response thresholds and tone to better reflect your country's development stage and the personality of the stakeholder representative.
            </span>
          </p>
        </div>
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
              {/* Icon */}
              <div className="mb-2">
                <StakeholderIcon stakeholder={stakeholder} size="medium" />
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
            <div className="flex-shrink-0">
              <StakeholderIcon stakeholder={selectedStakeholder} size="large" />
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
              onClick={handleProceedToPrediction}
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
