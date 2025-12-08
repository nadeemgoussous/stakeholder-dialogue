/**
 * AI Enhancement for Stakeholder Responses
 *
 * Multi-tier approach with silent failover:
 * 1. Local LLM (Ollama - gemma2:2b) - PREFERRED for workshops
 * 2. Cloud API (Anthropic/OpenAI) - OPTIONAL fallback
 * 3. Rule-based response - ALWAYS works (no enhancement)
 *
 * CRITICAL: Never show errors to user. Always failover silently.
 */

import type { StakeholderResponse, StakeholderProfile } from '../types/stakeholder';
import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';

/**
 * AI enhancement configuration
 */
export interface AIConfig {
  // Ollama settings (local LLM)
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
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma2:2b',
  ollamaTimeout: 3000,
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
 * Build system prompt for LLM with strict guardrails
 */
function buildSystemPrompt(
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics
): string {
  return `You are simulating the perspective of a ${stakeholder.name} stakeholder reviewing an energy scenario.

STAKEHOLDER PROFILE:
- Name: ${stakeholder.name}
- Primary Concerns: ${stakeholder.priorities.join(', ')}
- Questions They Typically Ask: ${stakeholder.typicalQuestions.join('; ')}

SCENARIO CONTEXT:
- Country: ${scenario.metadata.country}
- Scenario: ${scenario.metadata.scenarioName}
- Renewable Share 2030: ${calculateREShare(scenario, 2030).toFixed(1)}%
- Renewable Share 2040: ${calculateREShare(scenario, 2040).toFixed(1)}%
- Estimated Jobs (2030): ${derivedMetrics.jobs.byYear[2030]?.total.toLocaleString() || 'N/A'}
- Emissions Reduction: ${derivedMetrics.emissions.percentReduction.toFixed(1)}%

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
 * Tries in order:
 * 1. Ollama (local LLM)
 * 2. Cloud API (if configured)
 * 3. Rule-based response (guaranteed fallback)
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
  // Check if online (basic check)
  if (!navigator.onLine) {
    return ruleBasedResponse; // Offline - skip enhancement
  }

  // Try Ollama first (local LLM)
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

  // Try cloud API fallback
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

  // All AI methods failed - return rule-based response silently
  console.debug('ℹ️ Using rule-based response (AI enhancement unavailable)');
  return ruleBasedResponse;
}

/**
 * Get current AI status for UI indicators
 */
export async function getAIStatus(config: AIConfig = DEFAULT_AI_CONFIG): Promise<{
  available: boolean;
  method: 'ollama' | 'cloud' | 'none';
  model?: string;
}> {
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
