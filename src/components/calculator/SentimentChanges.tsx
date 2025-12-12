import { useState, useMemo } from 'react';
import { calculateSentimentChanges, type AdjustmentState } from '../../utils/sentiment-calculator';
import { StakeholderIcon } from '../stakeholder/StakeholderIcon';
import { stakeholderProfiles } from '../../data/stakeholder-profiles';

/**
 * SentimentChanges Component - F025
 *
 * Displays how each stakeholder's sentiment changes when scenario parameters
 * are adjusted. Shows directional indicators (↗ ↘ →) and factors on hover/click.
 *
 * This is ILLUSTRATIVE ONLY - helps users anticipate stakeholder responses,
 * not perform precise sentiment analysis.
 */

interface SentimentChangesProps {
  baseValues: AdjustmentState;
  adjustedValues: AdjustmentState;
}

export default function SentimentChanges({ baseValues, adjustedValues }: SentimentChangesProps) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);

  // Calculate sentiment changes
  const sentimentChanges = useMemo(
    () => calculateSentimentChanges(baseValues, adjustedValues),
    [baseValues, adjustedValues]
  );

  // Get stakeholder profile for colors
  const getStakeholderProfile = (id: string) => {
    return stakeholderProfiles.find(p => p.id === id);
  };

  // Get arrow icon based on direction
  const getArrowIcon = (direction: 'positive' | 'negative' | 'neutral') => {
    switch (direction) {
      case 'positive':
        return '↗'; // Up-right arrow
      case 'negative':
        return '↘'; // Down-right arrow
      case 'neutral':
        return '→'; // Right arrow
    }
  };

  // Get color based on direction
  const getDirectionColor = (direction: 'positive' | 'negative' | 'neutral') => {
    switch (direction) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-500';
    }
  };

  // Get background color based on direction
  const getDirectionBgColor = (direction: 'positive' | 'negative' | 'neutral') => {
    switch (direction) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      case 'neutral':
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get magnitude label
  const getMagnitudeLabel = (magnitude: 'minor' | 'moderate' | 'significant') => {
    switch (magnitude) {
      case 'significant':
        return 'Significant change';
      case 'moderate':
        return 'Moderate change';
      case 'minor':
        return 'Minor change';
    }
  };

  const handleStakeholderClick = (stakeholderId: string) => {
    setSelectedStakeholder(selectedStakeholder === stakeholderId ? null : stakeholderId);
  };

  const selectedChange = sentimentChanges.find(sc => sc.stakeholderId === selectedStakeholder);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Stakeholder Sentiment Changes
      </h3>
      <p className="text-gray-600 mb-6">
        How might each stakeholder group respond to these adjustments?
        Click any stakeholder to see specific factors.
      </p>

      {/* Stakeholder Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {sentimentChanges.map((change) => {
          const profile = getStakeholderProfile(change.stakeholderId);
          const isSelected = selectedStakeholder === change.stakeholderId;

          return (
            <button
              key={change.stakeholderId}
              onClick={() => handleStakeholderClick(change.stakeholderId)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? `${getDirectionBgColor(change.direction)} border-irena-blue shadow-lg`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
                }
                cursor-pointer text-left
              `}
              aria-label={`View ${change.stakeholderName} sentiment details`}
            >
              {/* Stakeholder Icon and Name */}
              <div className="flex items-center gap-3 mb-2">
                {profile && (
                  <StakeholderIcon
                    stakeholder={profile}
                    size="small"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {change.stakeholderName}
                  </div>
                </div>
              </div>

              {/* Sentiment Arrow and Magnitude */}
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-3xl ${getDirectionColor(change.direction)}`}
                  aria-label={`Sentiment ${change.direction}`}
                >
                  {getArrowIcon(change.direction)}
                </span>
                <span className="text-xs text-gray-600">
                  {getMagnitudeLabel(change.magnitude)}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-irena-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Factors Panel */}
      {selectedChange && (() => {
        const selectedProfile = getStakeholderProfile(selectedChange.stakeholderId);
        return (
          <div className={`border-2 rounded-lg p-6 ${getDirectionBgColor(selectedChange.direction)}`}>
            <div className="flex items-start gap-4 mb-4">
              {selectedProfile && (
                <StakeholderIcon
                  stakeholder={selectedProfile}
                  size="medium"
                />
              )}
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedChange.stakeholderName}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${getDirectionColor(selectedChange.direction)}`}>
                  {getArrowIcon(selectedChange.direction)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {getMagnitudeLabel(selectedChange.magnitude)} in sentiment
                </span>
              </div>
            </div>
          </div>

          {/* Positive Factors */}
          {selectedChange.positiveFactors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 text-xl">✓</span>
                <h5 className="font-semibold text-gray-900">What they appreciate:</h5>
              </div>
              <ul className="space-y-1 ml-7">
                {selectedChange.positiveFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Negative Factors */}
          {selectedChange.negativeFactors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-600 text-xl">⚠</span>
                <h5 className="font-semibold text-gray-900">What concerns them:</h5>
              </div>
              <ul className="space-y-1 ml-7">
                {selectedChange.negativeFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Neutral message */}
          {selectedChange.direction === 'neutral' &&
           selectedChange.positiveFactors.length === 0 &&
           selectedChange.negativeFactors.length === 0 && (
            <div className="text-sm text-gray-600 italic">
              These adjustments don't significantly affect this stakeholder's sentiment.
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Use these insights to anticipate questions and prepare tailored communication.
            </p>
          </div>
        </div>
        );
      })()}

      {/* Help text when nothing selected */}
      {!selectedChange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>How to use:</strong> Click any stakeholder above to see what specific factors
            make them more or less supportive of these adjustments.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Note:</strong> These sentiment indicators are <strong>illustrative only</strong> and
          based on typical stakeholder priorities. Actual stakeholder responses will vary based on
          local context, political dynamics, and specific engagement approaches. Always validate
          assumptions through direct stakeholder consultation.
        </p>
      </div>
    </div>
  );
}
