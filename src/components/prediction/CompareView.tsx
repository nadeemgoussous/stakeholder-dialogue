import type { StakeholderProfile } from '../../types/stakeholder';
import type { StakeholderResponse } from '../../types/response';
import { StakeholderIcon } from '../stakeholder/StakeholderIcon';

interface CompareViewProps {
  stakeholder: StakeholderProfile;
  userPrediction: string;
  stakeholderResponse: StakeholderResponse;
  onTryAnother: () => void;
  onExportBrief?: () => void;
}

export default function CompareView({
  stakeholder,
  userPrediction,
  stakeholderResponse,
  onTryAnother,
  onExportBrief
}: CompareViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <StakeholderIcon stakeholder={stakeholder} size="large" />
          <h2
            className="text-3xl font-bold"
            style={{ color: stakeholder.color }}
          >
            {stakeholder.name}
          </h2>
        </div>
        <p className="text-gray-600">
          Compare your prediction with the simulated response
        </p>
      </div>

      {/* User's Prediction Box */}
      <div className="card mb-6" style={{ borderLeftColor: '#6366f1', borderLeftWidth: '4px' }}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">💭</span>
          <h3 className="text-xl font-semibold text-gray-900">
            Your Prediction
          </h3>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {userPrediction}
          </p>
        </div>
      </div>

      {/* Simulated Response Box */}
      <div
        className="card mb-6"
        style={{ borderLeftColor: stakeholder.color, borderLeftWidth: '4px' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">💬</span>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              Simulated Response
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {stakeholderResponse.generationType === 'ai-enhanced'
                ? '✨ AI-Enhanced Response'
                : '🔧 Rule-Based Response'}
            </p>
          </div>
        </div>

        {/* Initial Reaction */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span
              className="w-1 h-5 rounded"
              style={{ backgroundColor: stakeholder.color }}
            ></span>
            Initial Reaction
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {stakeholderResponse.initialReaction}
          </p>
        </div>

        {/* Appreciation */}
        {stakeholderResponse.appreciation.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              What They Appreciate
            </h4>
            <ul className="space-y-2">
              {stakeholderResponse.appreciation.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {stakeholderResponse.concerns.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-amber-600">⚠</span>
              Their Concerns
            </h4>
            <ul className="space-y-3">
              {stakeholderResponse.concerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className={`mt-1 ${
                      concern.severity === 'high' ? 'text-red-500' :
                      concern.severity === 'medium' ? 'text-amber-500' :
                      'text-yellow-500'
                    }`}
                  >
                    ⚠
                  </span>
                  <div>
                    <p className="text-gray-800 font-medium">{concern.text}</p>
                    <p className="text-sm text-gray-600 mt-1">{concern.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions */}
        {stakeholderResponse.questions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">❓</span>
              Questions They Would Ask
            </h4>
            <ul className="space-y-2">
              {stakeholderResponse.questions.map((question, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">❓</span>
                  <span className="text-gray-700 italic">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Engagement Advice */}
        {stakeholderResponse.engagementAdvice.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-purple-600">💡</span>
              Engagement Tips
            </h4>
            <ul className="space-y-2">
              {stakeholderResponse.engagementAdvice.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">→</span>
                  <span className="text-gray-700">{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reflection Prompt */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>🤔</span>
          Reflection: How did your prediction compare?
        </h3>
        <div className="text-gray-700 space-y-2">
          <p className="text-sm">Consider these questions:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>What did you predict correctly?</li>
            <li>What concerns or priorities did you miss?</li>
            <li>How might this influence your real stakeholder engagement strategy?</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onTryAnother}
          className="btn-secondary px-6 py-3"
        >
          ← Try Another Stakeholder
        </button>
        {onExportBrief && (
          <button
            onClick={onExportBrief}
            className="btn-primary px-6 py-3"
            style={{ backgroundColor: stakeholder.color }}
          >
            Export Brief →
          </button>
        )}
      </div>

      {/* Learning Note */}
      <div className="mt-6 text-center text-sm text-gray-500 italic">
        💡 This is a learning exercise. Real stakeholder responses will vary based on context,
        relationships, and many other factors not captured in this simulation.
      </div>
    </div>
  );
}
