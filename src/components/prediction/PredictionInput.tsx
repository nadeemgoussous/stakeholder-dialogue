import { useState } from 'react';
import type { StakeholderProfile } from '../../types/stakeholder';
import { StakeholderIcon } from '../stakeholder/StakeholderIcon';

interface PredictionInputProps {
  stakeholder: StakeholderProfile;
  onRevealResponse: (prediction: string) => void;
  onBack?: () => void;
}

const MIN_PREDICTION_LENGTH = 20;

export default function PredictionInput({
  stakeholder,
  onRevealResponse,
  onBack
}: PredictionInputProps) {
  const [prediction, setPrediction] = useState('');
  const characterCount = prediction.length;
  const isValid = characterCount >= MIN_PREDICTION_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onRevealResponse(prediction);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Stakeholder Selection
          </button>
        )}
      </div>

      {/* Main Card */}
      <div
        className="card"
        style={{ borderLeftColor: stakeholder.color, borderLeftWidth: '4px' }}
      >
        {/* Stakeholder Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            <StakeholderIcon stakeholder={stakeholder} size="large" />
          </div>
          <div className="flex-1">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: stakeholder.color }}
            >
              {stakeholder.name}
            </h2>
            <p className="text-gray-600">
              Predict their response to your scenario
            </p>
          </div>
        </div>

        {/* Pedagogy: Predict-Before-Reveal */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            What do you think {stakeholder.name} will say about this scenario?
          </h3>
          <p className="text-gray-600 mb-4">
            Before seeing the simulated response, take a moment to predict how this stakeholder
            group would react. Consider their priorities and typical concerns.
          </p>
        </div>

        {/* Stakeholder Priorities Hints */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span
              className="w-1 h-5 rounded"
              style={{ backgroundColor: stakeholder.color }}
            ></span>
            Their Key Priorities (Hints)
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stakeholder.priorities.map((priority, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-gray-400 mt-1">•</span>
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prediction Text Area */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="prediction-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Prediction
            </label>
            <textarea
              id="prediction-input"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-offset-2 resize-none"
              style={{
                focusRing: stakeholder.color,
              }}
              placeholder="Type your prediction here... What will they appreciate? What concerns will they raise? What questions will they ask?"
              aria-describedby="character-count prediction-help"
            />
          </div>

          {/* Character Counter */}
          <div className="flex items-center justify-between mb-6">
            <p
              id="prediction-help"
              className="text-sm text-gray-500"
            >
              Minimum {MIN_PREDICTION_LENGTH} characters required
            </p>
            <p
              id="character-count"
              className={`text-sm font-medium ${
                isValid ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {characterCount} / {MIN_PREDICTION_LENGTH}
            </p>
          </div>

          {/* Reveal Response Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50
                       disabled:cursor-not-allowed transition-opacity"
              style={{
                backgroundColor: isValid ? stakeholder.color : undefined,
              }}
            >
              Reveal Response →
            </button>
          </div>
        </form>

        {/* Learning Note */}
        <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 italic">
            💡 <strong>Learning Tip:</strong> There's no "right" answer. The goal is to practice
            thinking from different stakeholder perspectives before engaging them in real life.
          </p>
        </div>
      </div>
    </div>
  );
}
