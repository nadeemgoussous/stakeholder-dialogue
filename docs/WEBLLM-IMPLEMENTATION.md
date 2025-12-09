# WebLLM Implementation Guide

## Overview

This document outlines the implementation plan for adding **WebLLM** (browser-based LLM) support to the Scenario Dialogue Tool. WebLLM will enable AI-enhanced stakeholder responses for **workshop participants** without requiring any external installations.

## Status: PLANNED (Not Yet Implemented)

**Priority**: HIGH - Should be implemented before final workshop deployment
**Package**: Already installed (`@mlc-ai/web-llm`)
**Target Feature**: F021B (extension of F021)

---

## Why WebLLM?

### Current Limitation
- **Ollama** requires separate installation on each machine
- Perfect for facilitators, but burdensome for participants
- Participants currently fall back to rule-based responses only

### WebLLM Benefits
✅ **Zero Installation** - Runs entirely in browser
✅ **Truly Offline** - Model cached in browser after first load
✅ **Privacy-First** - Data never leaves local machine
✅ **PWA Compatible** - Can be bundled with the app
✅ **Cross-Platform** - Works on any modern browser
✅ **Workshop-Ready** - Pre-load on USB drives for air-gapped venues

### Trade-offs
⚠️ **Initial Download** - ~800MB-1.5GB model (one-time)
⚠️ **Browser Requirements** - Needs WebGPU support (Chrome 113+, Edge 113+)
⚠️ **Performance** - Slower than Ollama on older hardware (still acceptable)

---

## Recommended Model

**Model**: `gemma-2-2b-it-q4f16_1-MLC`

**Why this model?**
- Size: ~1.4GB (compact for a 2B model)
- Quality: Excellent instruction-following from Google
- Speed: Fast inference on WebGPU
- License: Gemma Terms of Use (permissive for most uses)
- Consistency: Matches Ollama gemma2:2b model used by facilitators

**Alternative Models:**
- `TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC` (~600MB, faster but lower quality)
- `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (~900MB, good quality)
- `Phi-3.5-mini-instruct-q4f16_1-MLC` (~800MB, Microsoft's model)

**Custom/Fine-Tuned Models:**
You can use your own fine-tuned models by:
1. Converting your model to MLC format
2. Hosting it on your server or including in PWA bundle
3. Updating `webLLMModel` in AIConfig to your model's URL/name
4. The tool will automatically use your custom model

---

## Implementation Plan

### 1. Update AIConfig Interface

**File**: `src/utils/stakeholder-ai.ts`

```typescript
export interface AIConfig {
  // WebLLM settings (browser-based LLM) - NEW
  webLLMEnabled: boolean;
  webLLMModel: string; // e.g., "Phi-3.5-mini-instruct-q4f16_1-MLC"
  webLLMTimeout: number; // 5000ms (model inference in browser)

  // Ollama settings (local server LLM) - EXISTING
  ollamaEnabled: boolean;
  ollamaUrl: string;
  ollamaModel: string;
  ollamaTimeout: number;

  // Cloud API settings - EXISTING
  cloudEnabled: boolean;
  cloudProvider?: 'anthropic' | 'openai';
  cloudApiKey?: string;
  cloudTimeout: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  // Prioritize WebLLM for workshop participants
  webLLMEnabled: true,
  webLLMModel: 'gemma-2-2b-it-q4f16_1-MLC', // Can be replaced with custom fine-tuned model
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
```

### 2. Implement WebLLM Engine

**File**: `src/utils/stakeholder-ai.ts`

```typescript
import * as webllm from '@mlc-ai/web-llm';

// Singleton WebLLM engine instance
let webLLMEngine: webllm.MLCEngine | null = null;
let webLLMInitPromise: Promise<webllm.MLCEngine> | null = null;

/**
 * Initialize WebLLM engine (singleton pattern)
 * Shows progress to user during first load
 */
async function initializeWebLLM(
  config: AIConfig,
  onProgress?: (progress: webllm.InitProgressReport) => void
): Promise<webllm.MLCEngine | null> {
  // Return existing engine if already initialized
  if (webLLMEngine) return webLLMEngine;

  // Wait for existing initialization if in progress
  if (webLLMInitPromise) return webLLMInitPromise;

  try {
    // Check browser support
    if (!webllm.hasWebGPU()) {
      console.warn('WebGPU not supported - WebLLM unavailable');
      return null;
    }

    // Initialize engine with progress tracking
    webLLMInitPromise = webllm.CreateMLCEngine(config.webLLMModel, {
      initProgressCallback: (progress) => {
        console.log(`WebLLM Loading: ${progress.text}`);
        onProgress?.(progress);
      },
    });

    webLLMEngine = await webLLMInitPromise;
    console.log('✅ WebLLM initialized successfully');
    return webLLMEngine;
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
    // Initialize engine if needed
    const engine = await initializeWebLLM(config);
    if (!engine) return null;

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.webLLMTimeout);

    const completion = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    clearTimeout(timeoutId);

    const enhancedText = completion.choices[0]?.message?.content;
    if (!enhancedText) return null;

    // Try to parse enhanced response
    try {
      const parsed = JSON.parse(enhancedText);
      return {
        ...ruleBasedResponse,
        ...parsed,
        generationType: 'ai-enhanced' as const,
      };
    } catch {
      // Use enhanced text for initial reaction only
      return {
        ...ruleBasedResponse,
        initialReaction: enhancedText.trim().substring(0, 300),
        generationType: 'ai-enhanced' as const,
      };
    }
  } catch (error) {
    console.debug('WebLLM enhancement failed:', error);
    return null;
  }
}
```

### 3. Update Failover Priority

**File**: `src/utils/stakeholder-ai.ts`

```typescript
/**
 * Main function: Attempt to enhance response with AI
 *
 * NEW PRIORITY ORDER:
 * 1. WebLLM (browser-based) - Best for participants
 * 2. Ollama (local server) - Best for facilitators
 * 3. Cloud API - Optional fallback
 * 4. Rule-based - Always works
 */
export async function maybeEnhanceWithAI(
  ruleBasedResponse: StakeholderResponse,
  stakeholder: StakeholderProfile,
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  config: AIConfig = DEFAULT_AI_CONFIG
): Promise<StakeholderResponse> {
  // Check if online
  if (!navigator.onLine) {
    return ruleBasedResponse;
  }

  // 1. Try WebLLM first (browser-based, best for participants)
  if (config.webLLMEnabled) {
    const webllmResult = await enhanceWithWebLLM(
      ruleBasedResponse,
      stakeholder,
      scenario,
      derivedMetrics,
      config
    );

    if (webllmResult) {
      console.debug('✅ Response enhanced with WebLLM');
      return webllmResult;
    }
  }

  // 2. Try Ollama (local server, best for facilitators)
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
```

### 4. Model Loading UI Component

**File**: `src/components/common/ModelLoadingProgress.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import type { InitProgressReport } from '@mlc-ai/web-llm';

interface ModelLoadingProgressProps {
  onComplete?: () => void;
}

export function ModelLoadingProgress({ onComplete }: ModelLoadingProgressProps) {
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would be called from WebLLM initialization
    // For now, just a placeholder
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Loading AI Model</h3>
        <p className="text-gray-600 mb-4">
          Downloading model for enhanced responses...
          <br />
          <span className="text-sm">(This happens once, then cached)</span>
        </p>

        {progress && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(progress.progress || 0) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress.text}</p>
          </div>
        )}

        <button
          onClick={() => setIsLoading(false)}
          className="text-sm text-blue-600 hover:underline"
        >
          Continue with basic responses (skip AI)
        </button>
      </div>
    </div>
  );
}
```

### 5. Settings Panel for AI Configuration

**File**: `src/components/settings/AISettings.tsx` (NEW)

Allow users to enable/disable different AI methods:

```typescript
export function AISettings() {
  const [config, setConfig] = useState(DEFAULT_AI_CONFIG);

  return (
    <div className="space-y-4">
      <h3 className="font-bold">AI Enhancement Settings</h3>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.webLLMEnabled}
          onChange={(e) => setConfig({ ...config, webLLMEnabled: e.target.checked })}
        />
        <span>Use browser-based AI (WebLLM)</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.ollamaEnabled}
          onChange={(e) => setConfig({ ...config, ollamaEnabled: e.target.checked })}
        />
        <span>Use local server AI (Ollama)</span>
      </label>

      <p className="text-sm text-gray-600">
        AI enhancement makes responses more natural. Disable for faster, basic responses.
      </p>
    </div>
  );
}
```

---

## Workshop Deployment Strategy

### Option 1: Pre-Load on USB Drives
1. Build PWA with WebLLM bundled
2. Load WebLLM model in browser (caches to IndexedDB)
3. Export IndexedDB data to file
4. Distribute on USB drives with tool
5. Participants import IndexedDB data = instant offline AI

### Option 2: First-Run Download
1. Participants open tool (from USB or local server)
2. Tool detects no cached model
3. Shows progress UI during ~800MB download
4. Model cached for all future uses
5. Works offline after first load

### Option 3: Hybrid
1. Facilitators use Ollama (pre-installed, faster)
2. Participants use WebLLM (browser-based, zero setup)
3. Everyone has AI enhancement, different implementation

---

## Testing Checklist

Before final deployment:

- [ ] Test WebLLM model loading in fresh browser (no cache)
- [ ] Verify model caching in IndexedDB persists across page reloads
- [ ] Test offline functionality after model loaded
- [ ] Verify failover: WebLLM → Ollama → Rule-based
- [ ] Test on minimum spec hardware (4GB RAM, integrated GPU)
- [ ] Verify browser compatibility (Chrome 113+, Edge 113+)
- [ ] Test PWA installation with WebLLM
- [ ] Measure performance: inference time, memory usage
- [ ] Test in air-gapped environment (no internet after first load)
- [ ] Verify silent failover if WebGPU not supported

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 113+ (Windows, macOS, Linux)
- ✅ Edge 113+ (Windows, macOS)
- ✅ Opera 99+
- ⚠️ Safari 18+ (experimental WebGPU support)

### Unsupported Browsers
- ❌ Firefox (WebGPU not yet stable)
- ❌ Older Chrome/Edge (< version 113)
- ❌ Mobile browsers (limited WebGPU support)

**Fallback**: Tool automatically uses rule-based responses on unsupported browsers

---

## Performance Expectations

### Model Loading (First Time)
- **Download**: ~800MB (Phi-3.5-mini)
- **Time**: 2-5 minutes on good connection
- **Caching**: Stored in browser (IndexedDB)
- **Subsequent loads**: Instant (cached)

### Inference Performance
| Hardware | Response Time | Notes |
|----------|---------------|-------|
| Modern laptop (2020+, dedicated GPU) | 1-2 seconds | Excellent |
| Modern laptop (2020+, integrated GPU) | 2-4 seconds | Good |
| Older laptop (2018-2020) | 4-8 seconds | Acceptable |
| Very old laptop (<2018) | 8-15 seconds | Consider rule-based only |

**Comparison to Ollama**:
- Ollama: ~1-2 seconds (dedicated process)
- WebLLM: ~2-4 seconds (shares browser resources)

---

## Implementation Priority

**When to implement**: Before final workshop packaging

**Recommended timeline**:
1. Complete current features (F022-F042)
2. Test thoroughly with Ollama only
3. Add WebLLM as final enhancement
4. Test with workshop participants
5. Package for distribution

**Why wait**:
- WebLLM is enhancement, not core functionality
- Rule-based responses work well as baseline
- Better to have solid tool + basic responses than buggy tool + AI
- Can be added later without breaking existing functionality

---

## References

- **WebLLM Documentation**: https://webllm.mlc.ai/
- **Supported Models**: https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
- **WebGPU Support**: https://caniuse.com/webgpu
- **MLC LLM Project**: https://llm.mlc.ai/

---

## Questions & Decisions

### Q: WebLLM vs Transformers.js?
**A**: WebLLM chosen because:
- Better model quality (supports larger models)
- Active development and support
- WebGPU acceleration (faster)
- Better suited for chat/instruction-following tasks

### Q: Which model to use?
**A**: Phi-3.5-mini recommended:
- Good balance of size (~800MB) and quality
- Microsoft research, well-tested
- Fast inference on WebGPU
- MIT license (permissive)

### Q: What if user's browser doesn't support WebGPU?
**A**: Silent failover to Ollama or rule-based responses. No error shown to user.

### Q: Can we pre-bundle the model with the app?
**A**: No, model is too large (~800MB). But we can:
- Cache model in browser after first download
- Export cached model to file for USB distribution
- Pre-load on facilitator machine for workshop LAN

---

*This document will be updated as WebLLM implementation progresses.*
