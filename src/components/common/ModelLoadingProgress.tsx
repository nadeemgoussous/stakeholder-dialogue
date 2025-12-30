/**
 * Model Loading Progress Component
 *
 * Shows progress UI during first-time WebLLM model download
 * SmolLM2-1.7B-Instruct: ~1.77 GB (better instruction following)
 * Allows users to skip and use basic (rule-based) responses
 */

import { useState, useEffect } from 'react';
import type { InitProgressReport } from '@mlc-ai/web-llm';

interface ModelLoadingProgressProps {
  onComplete?: () => void;
  onSkip?: () => void;
  progress?: InitProgressReport | null;
  isLoading?: boolean;
}

export function ModelLoadingProgress({
  onComplete,
  onSkip,
  progress: externalProgress,
  isLoading: externalIsLoading
}: ModelLoadingProgressProps) {
  const [progress, setProgress] = useState<InitProgressReport | null>(externalProgress || null);
  const [isLoading, setIsLoading] = useState(externalIsLoading !== undefined ? externalIsLoading : true);

  useEffect(() => {
    if (externalProgress) {
      setProgress(externalProgress);
    }
  }, [externalProgress]);

  useEffect(() => {
    if (externalIsLoading !== undefined) {
      setIsLoading(externalIsLoading);
    }
  }, [externalIsLoading]);

  // Don't show if not loading
  if (!isLoading) return null;

  const progressPercent = progress?.progress ? progress.progress * 100 : 0;

  const handleSkip = () => {
    setIsLoading(false);
    onSkip?.();
  };

  const handleComplete = () => {
    setIsLoading(false);
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Loading AI Model</h3>
            <p className="text-sm text-gray-500">First-time setup</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4">
          Downloading AI model for enhanced stakeholder responses...
        </p>
        <p className="text-sm text-gray-500 mb-6">
          <strong>Note:</strong> This happens once (~1.8GB), then cached in your browser for future use.
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
              style={{ width: `${progressPercent}%` }}
            >
              {progressPercent > 10 && (
                <span className="text-xs text-white font-medium">
                  {progressPercent.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          {progress && (
            <p className="text-sm text-gray-600 mt-2">
              {progress.text}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
          >
            ← Skip AI (use basic responses)
          </button>

          {progressPercent >= 100 && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Why download?</strong> The AI model runs entirely in your browser for privacy and offline use.
            You can skip and use rule-based responses (still very good!).
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple loading indicator for inline use
 */
export function ModelLoadingIndicator({ progress }: { progress?: InitProgressReport | null }) {
  if (!progress) return null;

  const progressPercent = progress.progress ? progress.progress * 100 : 0;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center mb-2">
        <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium text-blue-900">
          Loading AI model... {progressPercent.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-blue-700 mt-1">{progress.text}</p>
    </div>
  );
}
