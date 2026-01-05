/**
 * Model Loading Progress Component
 *
 * Shows progress UI during first-time WebLLM model download
 * SmolLM2-1.7B-Instruct: ~1.77 GB (better instruction following)
 * Allows users to skip and use basic (rule-based) responses
 * Shows actionable error messages with solutions (e.g., QuotaExceededError)
 */

import { useState, useEffect } from 'react';
import type { InitProgressReport } from '@mlc-ai/web-llm';
import type { WebLLMError } from '../../utils/stakeholder-ai';

interface ModelLoadingProgressProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onRetry?: () => void;
  progress?: InitProgressReport | null;
  isLoading?: boolean;
  error?: WebLLMError | null;
}

export function ModelLoadingProgress({
  onComplete,
  onSkip,
  onRetry,
  progress: externalProgress,
  isLoading: externalIsLoading,
  error: externalError
}: ModelLoadingProgressProps) {
  const [progress, setProgress] = useState<InitProgressReport | null>(externalProgress || null);
  const [isLoading, setIsLoading] = useState(externalIsLoading !== undefined ? externalIsLoading : true);
  const [error, setError] = useState<WebLLMError | null>(externalError || null);

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

  useEffect(() => {
    if (externalError !== undefined) {
      setError(externalError);
    }
  }, [externalError]);

  // Don't show if not loading and no error
  if (!isLoading && !error) return null;

  const progressPercent = progress?.progress ? progress.progress * 100 : 0;

  const handleSkip = () => {
    setIsLoading(false);
    setError(null);
    onSkip?.();
  };

  const handleComplete = () => {
    setIsLoading(false);
    setError(null);
    onComplete?.();
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    setProgress(null);
    onRetry?.();
  };

  const handleClearCacheAndRetry = async () => {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear IndexedDB (where WebLLM stores model)
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases?.();
        if (databases) {
          await Promise.all(
            databases.map(db => {
              if (db.name) {
                return new Promise<void>((resolve, reject) => {
                  const request = indexedDB.deleteDatabase(db.name!);
                  request.onsuccess = () => resolve();
                  request.onerror = () => reject(request.error);
                });
              }
            })
          );
        }
      }

      console.log('✅ Cache cleared successfully');
      handleRetry();
    } catch (err) {
      console.error('❌ Failed to clear cache:', err);
      alert('Failed to clear cache. Please clear it manually: DevTools → Application → Storage → Clear Site Data');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 ${error ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mr-3`}>
            {error ? (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${error ? 'text-red-900' : 'text-gray-900'}`}>
              {error ? 'Loading Failed' : 'Loading AI Model'}
            </h3>
            <p className="text-sm text-gray-500">
              {error ? 'An error occurred' : 'First-time setup'}
            </p>
          </div>
        </div>

        {/* Error or Progress Content */}
        {error ? (
          <>
            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-900 font-semibold mb-2">{error.userMessage}</p>
              <p className="text-sm text-red-700 mb-2">{error.actionable}</p>
              {error.type === 'quota' && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-600 mb-2">
                    <strong>What happened:</strong> The AI model (~1.8GB) needs browser storage, but there isn't enough space available.
                  </p>
                  <p className="text-xs text-red-600">
                    <strong>Solution:</strong> Click "Clear Cache & Retry" below to automatically free up space.
                  </p>
                </div>
              )}
            </div>

            {/* Technical Details (collapsed) */}
            <details className="mb-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Technical details
              </summary>
              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                {error.message}
              </pre>
            </details>

            {/* Error Actions */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
              >
                ← Skip AI (use basic responses)
              </button>

              <div className="flex gap-2">
                {error.type === 'quota' ? (
                  <button
                    onClick={handleClearCacheAndRetry}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Clear Cache & Retry
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Still not working?</strong> You can skip AI enhancement and use rule-based responses instead (still very good!).
                Manual cache clear: DevTools (F12) → Application → Storage → "Clear site data"
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Loading Description */}
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

            {/* Loading Actions */}
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
          </>
        )}
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
