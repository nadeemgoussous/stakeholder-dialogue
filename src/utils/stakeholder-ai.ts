/**
 * AI Enhancement for Stakeholder Responses
 *
 * Multi-tier approach with silent failover:
 * 1. WebLLM (browser-based) - BEST for workshop participants
 * 2. Ollama (local server) - BEST for facilitators
 * 3. Cloud API (Anthropic/OpenAI) - OPTIONAL fallback
 * 4. Rule-based response - ALWAYS works (no enhancement)
 *
 * CRITICAL: Never show errors to user. Always failover silently.
 */

import * as webllm from '@mlc-ai/web-llm';
import type { StakeholderResponse, StakeholderProfile } from '../types/stakeholder';
import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';

/**
 * AI enhancement configuration
 */
export interface AIConfig {
  // WebLLM settings (browser-based LLM) - NEW
  webLLMEnabled: boolean;
  webLLMModel: string; // Default: gemma-2-2b-it-q4f16_1-MLC (can be customized or fine-tuned)
  webLLMTimeout: number; // Default: 5000ms (browser inference)

  // Ollama settings (local server LLM)
  ollamaEnabled: boolean;
  ollamaUrl: string; // Default: http://localhost:11434
  ollamaModel: string; // Default: gemma2:2b
  ollamaTimeout: number; // Default: 3000ms

  // Cloud API settings (optional fallback)
  cloudEnabled: boolean;
  cloudProvider?: 'anthropic' | 'openai';
  cloudApiKey?: string;
  cloudTimeout: number; // Default: 3000ms
}

/**
 * Default AI configuration
 *
 * IMPORTANT: WebLLM is DISABLED by default to prevent blocking the UI while downloading model.
 * Enable it after packaging the model with the PWA or when users have fast internet.
 *
 * For workshop deployment:
 * 1. Package model with PWA (see docs/CUSTOM-MODELS.md)
 * 2. Set webLLMEnabled: true
 * 3. Test that model loads correctly
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  // WebLLM for participants (browser-based, zero setup)
  // ENABLED for development/testing - model will download on first use (~1.77 GB)
  webLLMEnabled: true, // Enable WebLLM for browser-based AI
  webLLMModel: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', // SmolLM2: Better instruction following than Gemma (~1.77 GB)
  webLLMTimeout: 5000,

  // Ollama for facilitators (better performance)
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma2:2b',
  ollamaTimeout: 3000,

  // Cloud API disabled by default
  cloudEnabled: false,
  cloudTimeout: 3000,
};

/**
 * Check if Ollama is available and running
 */
export async function checkOllamaAvailability(config: AIConfig): Promise<boolean> {
  if (!config.ollamaEnabled) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const response = await fetch(`${config.ollamaUrl}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    // Check if our preferred model is available
    const data = await response.json();
    const models = data.models || [];
    return models.some((m: any) => m.name.includes(config.ollamaModel.split(':')[0]));
  } catch (error) {
    // Ollama not running or network error - fail silently
    return false;
  }
}

/**
 * WebLLM Engine Singleton
 */
let webLLMEngine: webllm.MLCEngine | null = null;
let webLLMInitPromise: Promise<webllm.MLCEngine | null> | null = null;
let webLLMInitialized = false;

/**
 * Check if WebLLM is supported (WebGPU available)
 */
export function isWebLLMSupported(): boolean {
  try {
    // Check if WebGPU is available
    return 'gpu' in navigator;
  } catch {
    return false;
  }
}

/**
 * Initialize WebLLM engine (singleton pattern)
 * Shows progress during first load (~800MB model download)
 */
export async function initializeWebLLM(
  config: AIConfig,
  onProgress?: (progress: webllm.InitProgressReport) => void
): Promise<webllm.MLCEngine | null> {
  // Return existing engine if already initialized
  if (webLLMEngine && webLLMInitialized) {
    return webLLMEngine;
  }

  // Wait for existing initialization if in progress
  if (webLLMInitPromise) {
    return webLLMInitPromise;
  }

  // Check if WebLLM is enabled
  if (!config.webLLMEnabled) {
    return null;
  }

  // Check browser support
  if (!isWebLLMSupported()) {
    console.warn('WebGPU not supported - WebLLM unavailable');
    return null;
  }

  try {
    console.log('🚀 Initializing WebLLM with model:', config.webLLMModel);
    console.log('📦 Model size: ~1.77 GB - this will take 2-5 minutes on first load');

    // Initialize engine with progress tracking
    webLLMInitPromise = (async () => {
      try {
        console.log('⏳ Starting WebLLM engine creation...');
        const engine = await webllm.CreateMLCEngine(config.webLLMModel, {
          initProgressCallback: (progress) => {
            console.log(`📥 WebLLM Loading: ${progress.text} (${(progress.progress * 100).toFixed(1)}%)`);
            onProgress?.(progress);
          },
        });

        webLLMEngine = engine;
        webLLMInitialized = true;
        console.log('✅ WebLLM initialized successfully - AI enhancement ready!');
        return engine;
      } catch (error) {
        console.error('❌ WebLLM initialization failed:', error);
        webLLMInitPromise = null;
        return null;
      }
    })();

    return await webLLMInitPromise;
  } catch (error) {
    console.warn('WebLLM initialization failed:', error);
    webLLMInitPromise = null;
    return null;
  }
}

/**
 * Enhance response using WebLLM (browser-based)
 */
async function enhanceWithWebLLM(
  ruleBasedResponse: StakeholderResponse,
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  config: AIConfig
): Promise<StakeholderResponse | null> {
  try {
    console.log('🤖 [WebLLM] Starting enhancement for:', stakeholder.name);

    // Initialize engine if needed (will use cached model after first load)
    const engine = await initializeWebLLM(config);
    if (!engine) {
      console.log('❌ [WebLLM] Engine not available');
      return null;
    }

    console.log('✅ [WebLLM] Engine available, generating completion...');

    const systemPrompt = buildSystemPrompt(stakeholder, scenario, derivedMetrics);
    const baseResponseText = JSON.stringify(ruleBasedResponse, null, 2);

    const messages: webllm.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${baseResponseText}\n\nEnhance this stakeholder response to make it more natural and conversational while preserving all key points.`,
      },
    ];

    // Generate response with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('WebLLM timeout')), config.webLLMTimeout);
    });

    const completionPromise = engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    console.log('⏳ [WebLLM] Waiting for completion (timeout: ' + config.webLLMTimeout + 'ms)...');
    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const enhancedText = completion.choices[0]?.message?.content;
    console.log('📝 [WebLLM] Received response:', enhancedText?.substring(0, 100) + '...');

    if (!enhancedText) {
      console.log('❌ [WebLLM] No content in completion');
      return null;
    }

    // Try to parse enhanced response as JSON
    try {
      const parsed = JSON.parse(enhancedText);
      console.log('✅ [WebLLM] Successfully parsed JSON response');
      return {
        ...ruleBasedResponse,
        ...parsed,
        generationType: 'ai-enhanced' as const,
      };
    } catch {
      // Use enhanced text for initial reaction only
      console.log('⚠️ [WebLLM] Using text response (not JSON)');
      return {
        ...ruleBasedResponse,
        initialReaction: enhancedText.trim().substring(0, 300),
        generationType: 'ai-enhanced' as const,
      };
    }
  } catch (error) {
    console.error('❌ [WebLLM] Enhancement failed:', error);
    return null;
  }
}

/**
 * Build system prompt for LLM with strict guardrails
 */
function buildSystemPrompt(
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics
): string {
  // Safe access to nested properties with fallbacks
  const reShare2030 = calculateREShare(scenario, 2030).toFixed(1);
  const reShare2040 = calculateREShare(scenario, 2040).toFixed(1);
  const jobs2030 = derivedMetrics.jobs?.byYear?.[2030]?.total?.toLocaleString() || 'N/A';
  const emissionsReduction = derivedMetrics.emissions?.percentReduction?.toFixed(1) || 'N/A';

  return `You are simulating the perspective of a ${stakeholder.name} stakeholder reviewing an energy scenario.

STAKEHOLDER PROFILE:
- Name: ${stakeholder.name}
- Primary Concerns: ${stakeholder.priorities.join(', ')}
- Questions They Typically Ask: ${stakeholder.typicalQuestions.join('; ')}

SCENARIO CONTEXT:
- Country: ${scenario.metadata?.country || 'N/A'}
- Scenario: ${scenario.metadata?.scenarioName || 'N/A'}
- Renewable Share 2030: ${reShare2030}%
- Renewable Share 2040: ${reShare2040}%
- Estimated Jobs (2030): ${jobs2030}
- Emissions Reduction: ${emissionsReduction}%

TASK:
Enhance the following stakeholder response by making it more natural and conversational while preserving all key points.

CRITICAL RULES:
1. You MUST keep the same structure (Initial Reaction, Appreciation, Concerns, Questions, Engagement)
2. You MUST preserve all specific concerns and appreciations
3. You MUST NOT add new technical claims or calculations
4. You MUST NOT contradict the rule-based response
5. Make language more natural and stakeholder-appropriate
6. Keep tone professional but accessible
7. Maximum 200 words total

BASE RESPONSE TO ENHANCE:`;
}

/**
 * Calculate RE share for a given year
 */
function calculateREShare(scenario: ScenarioInput, year: number): number {
  // Add null checks for scenario.capacity
  if (!scenario.capacity?.byYear) {
    console.warn('[AI] Scenario missing capacity data for RE share calculation');
    return 0;
  }

  const capacityData = scenario.capacity.byYear[year];
  if (!capacityData) return 0;

  const renewable = (capacityData.solarPV || 0) +
                   (capacityData.windOnshore || 0) +
                   (capacityData.windOffshore || 0) +
                   (capacityData.hydro || 0);

  const total = renewable +
                (capacityData.coal || 0) +
                (capacityData.gas || 0) +
                (capacityData.diesel || 0);

  return total > 0 ? (renewable / total) * 100 : 0;
}

/**
 * Enhance response using Ollama local LLM
 */
async function enhanceWithOllama(
  ruleBasedResponse: StakeholderResponse,
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  config: AIConfig
): Promise<StakeholderResponse | null> {
  try {
    const systemPrompt = buildSystemPrompt(stakeholder, scenario, derivedMetrics);
    const baseResponseText = JSON.stringify(ruleBasedResponse, null, 2);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.ollamaTimeout);

    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: `${systemPrompt}\n\n${baseResponseText}\n\nENHANCED VERSION (preserve structure, make more natural):`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 400, // ~200 words
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const enhancedText = data.response;

    // Try to parse as JSON (if LLM returned structured data)
    try {
      const parsed = JSON.parse(enhancedText);
      return {
        ...ruleBasedResponse,
        ...parsed,
        generationType: 'ai-enhanced' as const,
      };
    } catch {
      // LLM returned plain text - use it to enhance initialReaction only
      return {
        ...ruleBasedResponse,
        initialReaction: enhancedText.trim().substring(0, 300), // Limit length
        generationType: 'ai-enhanced' as const,
      };
    }
  } catch (error) {
    // Timeout or network error - fail silently
    console.debug('Ollama enhancement failed:', error);
    return null;
  }
}

/**
 * Enhance response using cloud API (Anthropic or OpenAI)
 */
async function enhanceWithCloudAPI(
  ruleBasedResponse: StakeholderResponse,
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  config: AIConfig
): Promise<StakeholderResponse | null> {
  if (!config.cloudEnabled || !config.cloudApiKey) return null;

  try {
    // This is a placeholder for cloud API integration
    // Can be implemented later if needed
    // For now, we prioritize local LLM
    console.debug('Cloud API enhancement not yet implemented');
    return null;
  } catch (error) {
    console.debug('Cloud API enhancement failed:', error);
    return null;
  }
}

/**
 * Main function: Attempt to enhance response with AI, or return rule-based response
 *
 * NEW PRIORITY ORDER:
 * 1. WebLLM (browser-based) - Best for participants, works offline after first load
 * 2. Ollama (local server) - Best for facilitators
 * 3. Cloud API (if configured) - Optional fallback
 * 4. Rule-based response - Guaranteed fallback (always works)
 *
 * NEVER throws errors. NEVER shows loading states.
 */
export async function maybeEnhanceWithAI(
  ruleBasedResponse: StakeholderResponse,
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  config: AIConfig = DEFAULT_AI_CONFIG
): Promise<StakeholderResponse> {
  // 1. Try WebLLM first (browser-based, zero installation)
  // Note: WebLLM works offline after first model load
  if (config.webLLMEnabled) {
    console.log('🔍 [AI] Attempting WebLLM enhancement...');
    const webllmResult = await enhanceWithWebLLM(
      ruleBasedResponse,
      stakeholder,
      scenario,
      derivedMetrics,
      config
    );

    if (webllmResult) {
      console.log('✅ [AI] Response enhanced with WebLLM');
      return webllmResult;
    } else {
      console.log('⚠️ [AI] WebLLM enhancement returned null, trying fallbacks...');
    }
  }

  // 2. Try Ollama (local server LLM)
  if (config.ollamaEnabled) {
    const ollamaResult = await enhanceWithOllama(
      ruleBasedResponse,
      stakeholder,
      scenario,
      derivedMetrics,
      config
    );

    if (ollamaResult) {
      console.debug('✅ Response enhanced with Ollama');
      return ollamaResult;
    }
  }

  // 3. Try cloud API fallback
  if (config.cloudEnabled) {
    const cloudResult = await enhanceWithCloudAPI(
      ruleBasedResponse,
      stakeholder,
      scenario,
      derivedMetrics,
      config
    );

    if (cloudResult) {
      console.debug('✅ Response enhanced with cloud API');
      return cloudResult;
    }
  }

  // 4. All AI methods failed - return rule-based response silently
  console.debug('ℹ️ Using rule-based response (AI enhancement unavailable)');
  return ruleBasedResponse;
}

/**
 * Get current AI status for UI indicators
 */
export async function getAIStatus(config: AIConfig = DEFAULT_AI_CONFIG): Promise<{
  available: boolean;
  method: 'webllm' | 'ollama' | 'cloud' | 'none';
  model?: string;
  loading?: boolean;
}> {
  // Check WebLLM first (highest priority)
  if (config.webLLMEnabled && isWebLLMSupported()) {
    if (webLLMEngine && webLLMInitialized) {
      return {
        available: true,
        method: 'webllm',
        model: config.webLLMModel,
      };
    }
    // WebLLM is loading
    if (webLLMInitPromise) {
      return {
        available: false,
        method: 'webllm',
        model: config.webLLMModel,
        loading: true,
      };
    }
  }

  // Check Ollama
  if (config.ollamaEnabled) {
    const ollamaAvailable = await checkOllamaAvailability(config);
    if (ollamaAvailable) {
      return {
        available: true,
        method: 'ollama',
        model: config.ollamaModel,
      };
    }
  }

  // Check cloud API
  if (config.cloudEnabled && config.cloudApiKey) {
    return {
      available: true,
      method: 'cloud',
      model: config.cloudProvider,
    };
  }

  // No AI available
  return {
    available: false,
    method: 'none',
  };
}
