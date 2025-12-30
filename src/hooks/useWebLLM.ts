/**
 * React hook for WebLLM state management
 *
 * Provides:
 * - WebLLM initialization and status tracking
 * - Progress reporting during model download
 * - Browser support detection
 * - Simplified API for generating AI-enhanced responses
 */

import { useState, useEffect, useCallback } from 'react';
import type { InitProgressReport } from '@mlc-ai/web-llm';
import {
  initializeWebLLM,
  isWebLLMSupported,
  maybeEnhanceWithAI,
  DEFAULT_AI_CONFIG,
  type AIConfig
} from '../utils/stakeholder-ai';
import type { StakeholderProfile } from '../types/stakeholder';
import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';
import type { StakeholderResponse } from '../types/response';

export type WebLLMStatus =
  | 'not-checked'      // Initial state, haven't checked support yet
  | 'unsupported'      // Browser doesn't support WebGPU
  | 'not-loaded'       // Supported but not initialized
  | 'loading'          // Currently downloading/initializing model
  | 'ready'            // Model loaded and ready
  | 'error';           // Initialization failed

interface UseWebLLMOptions {
  autoInitialize?: boolean; // Auto-load model on mount (default: false)
  config?: Partial<AIConfig>;
}

interface UseWebLLMReturn {
  // Status
  status: WebLLMStatus;
  isSupported: boolean | null;
  progress: InitProgressReport | null;

  // Actions
  initializeModel: () => Promise<boolean>;
  generateResponse: (
    ruleBasedResponse: StakeholderResponse,
    stakeholder: StakeholderProfile,
    scenario: ScenarioInput,
    derivedMetrics: DerivedMetrics
  ) => Promise<StakeholderResponse>;

  // Config
  config: AIConfig;
}

/**
 * Hook for managing WebLLM state and operations
 */
export function useWebLLM(options: UseWebLLMOptions = {}): UseWebLLMReturn {
  const { autoInitialize = false, config: configOverrides } = options;

  // Merge config with defaults
  const config: AIConfig = {
    ...DEFAULT_AI_CONFIG,
    ...configOverrides,
  };

  // State
  const [status, setStatus] = useState<WebLLMStatus>('not-checked');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<InitProgressReport | null>(null);

  // Check WebGPU support on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = isWebLLMSupported();
      setIsSupported(supported);
      setStatus(supported ? 'not-loaded' : 'unsupported');
    };

    checkSupport();
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && status === 'not-loaded') {
      initializeModel();
    }
  }, [autoInitialize, status]);

  /**
   * Initialize WebLLM engine (downloads model on first run)
   */
  const initializeModel = useCallback(async (): Promise<boolean> => {
    console.log('🎯 initializeModel called - current status:', status);

    if (status === 'loading' || status === 'ready') {
      console.log('⚠️ Already loading or ready, skipping initialization');
      return status === 'ready';
    }

    if (!isSupported) {
      console.warn('❌ WebLLM not supported in this browser - WebGPU required');
      return false;
    }

    console.log('🚀 Starting WebLLM initialization...');
    setStatus('loading');
    setProgress(null);

    try {
      const engine = await initializeWebLLM(config, (progressReport) => {
        console.log('📊 Progress update:', progressReport.text, `${(progressReport.progress * 100).toFixed(1)}%`);
        setProgress(progressReport);
      });

      if (engine) {
        console.log('✅ WebLLM engine ready!');
        setStatus('ready');
        setProgress(null);
        return true;
      } else {
        console.error('❌ WebLLM engine initialization returned null');
        setStatus('error');
        setProgress(null);
        return false;
      }
    } catch (error) {
      console.error('❌ WebLLM initialization error:', error);
      setStatus('error');
      setProgress(null);
      return false;
    }
  }, [status, isSupported, config]);

  /**
   * Generate AI-enhanced stakeholder response
   * (Automatically falls back to rule-based if WebLLM unavailable)
   */
  const generateResponse = useCallback(async (
    ruleBasedResponse: StakeholderResponse,
    stakeholder: StakeholderProfile,
    scenario: ScenarioInput,
    derivedMetrics: DerivedMetrics
  ): Promise<StakeholderResponse> => {
    // Always use maybeEnhanceWithAI - it handles all failover logic
    return maybeEnhanceWithAI(
      ruleBasedResponse,
      stakeholder,
      scenario,
      derivedMetrics,
      config
    );
  }, [config]);

  return {
    status,
    isSupported,
    progress,
    initializeModel,
    generateResponse,
    config,
  };
}
