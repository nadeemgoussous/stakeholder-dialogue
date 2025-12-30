# WebLLM Integration

**Last Updated:** 2025-12-30
**Status:** ✅ FULLY IMPLEMENTED - 100% quality after echo fix
**Feature:** F043 (WebLLM Browser-Based AI)

---

## Overview

WebLLM enables **browser-based AI enhancement** for stakeholder responses. Workshop participants get AI-powered responses without installing anything - the model runs entirely in their browser using WebGPU.

### Why WebLLM?

| Approach | Pros | Cons |
|----------|------|------|
| **Ollama** | Fast, high quality | Requires installation |
| **Cloud API** | Best quality | Requires internet, API key |
| **WebLLM** | Zero setup, offline | Slower, limited quality |
| **Rule-based** | Instant, always works | Less natural language |

**WebLLM is ideal for workshops** where participants can't install software but need AI enhancement.

### Benefits
- ✅ **Zero Installation** - Runs entirely in browser
- ✅ **Truly Offline** - Works after first model download
- ✅ **Privacy-First** - Data never leaves local machine
- ✅ **PWA Compatible** - Can be bundled with the app
- ✅ **Silent Failover** - Falls back to rule-based if unavailable

### Trade-offs
- ⚠️ **Initial Download** - ~1.77 GB model (one-time, cached)
- ⚠️ **Browser Requirements** - WebGPU required (Chrome/Edge 113+)
- ⚠️ **Inference Speed** - 5-15 seconds per response

---

## Current Implementation

### Model
- **Model:** `SmolLM2-1.7B-Instruct-q4f16_1-MLC`
- **Size:** ~1.77 GB
- **Parameters:** 1.7 billion
- **Quantization:** 4-bit (q4f16)

### Alternative Models (can swap in config)
| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| SmolLM2-1.7B-Instruct | 1.77 GB | Good | Fast |
| Gemma-2-2b-it | 1.5 GB | Better | Medium |
| Phi-3.5-mini-instruct | 2.4 GB | Best | Slower |

### Performance Metrics

| Metric | Value |
|--------|-------|
| Model size | 1.77 GB |
| First load time | 2-5 minutes (download) |
| Subsequent loads | <2 seconds (from cache) |
| Inference time | 5-15 seconds |
| Timeout | 20 seconds |
| Quality rate | 100% (after echo fix) |

---

## Architecture

### Failover Chain
```
1. WebLLM (browser) → 2. Ollama (local) → 3. Cloud API → 4. Rule-based
```

Each tier fails silently to the next. Users never see errors.

### Key Files

| File | Purpose |
|------|---------|
| `src/utils/stakeholder-ai.ts` | Core AI logic, WebLLM integration |
| `src/data/stakeholder-fewshot.ts` | Few-shot examples (18 total) |
| `src/hooks/useWebLLM.ts` | React state management |
| `src/components/common/ModelLoadingProgress.tsx` | Loading UI |
| `scripts/test-prompts-ollama.ts` | Bulk testing script |

### Key Functions

```typescript
// Initialize WebLLM engine (singleton)
initializeWebLLM(config, onProgress?)

// Enhance response with AI
enhanceWithWebLLM(ruleBasedResponse, stakeholder, scenario, derivedMetrics, config)

// Build system prompt with few-shot examples
buildEnhancementSystemPrompt(stakeholder, scenario, derivedMetrics)

// Detect if response echoes the prompt (quality check)
isEchoResponse(response)

// Main entry point with failover
maybeEnhanceWithAI(ruleBasedResponse, stakeholder, scenario, derivedMetrics, config)
```

---

## Few-Shot Prompting

Each stakeholder has 2 examples teaching the model their voice:

| Stakeholder | Voice Description |
|-------------|-------------------|
| Policy Makers | Formal, balanced, policy coherence |
| Grid Operators | Technical, risk-focused, stability |
| Industry | Business-oriented, costs, competitiveness |
| Public | Accessible language, local impacts |
| CSOs/NGOs | Advocacy, climate ambition, justice |
| Scientific | Evidence-based, methodological |
| Financial | Investment-focused, bankability |
| Regional Bodies | Cross-border, harmonization |
| Development Partners | Debt sustainability, concessional finance |

**File:** `src/data/stakeholder-fewshot.ts` (184 lines, 18 examples)

### Prompt Structure

```
You are [Stakeholder Name].

Voice: [Voice description]

Examples:

1. Scenario: [Example scenario]
Response: "[Example response]"

2. Scenario: [Example scenario]
Response: "[Example response]"

---END OF EXAMPLES---

Now respond to this NEW scenario for [Country]:
- [RE%] renewable energy by 2030
- Key concerns: [priorities]

IMPORTANT: Do NOT repeat the examples above. Write a NEW, ORIGINAL response.
Write 2-3 sentences as [Stakeholder]. Match the voice and style but create NEW content.
Output ONLY your response - no labels, no "Voice:", no "Examples:".
```

---

## Echo Detection

Small models sometimes "echo" the prompt instead of generating new content. We detect and handle this automatically.

### Detection Function

```typescript
function isEchoResponse(response: string): boolean {
  const echoPatterns = [
    'Voice:',           // Echoing voice description
    'Examples:',        // Echoing examples header
    'Scenario:',        // Echoing scenario from examples
    'Response: "',      // Echoing example response format
    'would respond',    // Third-person instead of first-person
  ];

  for (const pattern of echoPatterns) {
    if (response.includes(pattern)) {
      return true;  // Echo detected
    }
  }
  return false;
}
```

### Behavior When Echo Detected
1. Log warning to console
2. Return `null` from `enhanceWithWebLLM()`
3. Failover chain continues to next tier
4. User sees rule-based response (no error)

### Fix Applied (2025-12-30)
| Change | Before | After |
|--------|--------|-------|
| Prompt instruction | None | "Do NOT repeat examples" |
| Separator | None | `---END OF EXAMPLES---` |
| Temperature | 0.7 | 0.5 |
| Echo detection | None | `isEchoResponse()` |
| **Echo rate** | **11%** | **0%** |

---

## Bulk Testing

### Test Script
```bash
# Ensure Ollama is running
ollama pull smollm2:1.7b

# Run 90 tests (9 stakeholders × 10 scenarios)
npx tsx scripts/test-prompts-ollama.ts
```

### Test Results (2025-12-30, after fix)

| Metric | Value |
|--------|-------|
| Tests run | 90 |
| Success rate | 100% |
| Echo detected | 0 (0%) |
| Good quality | 90 (100%) |
| Avg inference | 6.5 seconds |

### Quality by Stakeholder

| Stakeholder | Quality | Notes |
|-------------|---------|-------|
| Policy Makers | ✅ Excellent | Formal, coherent policy language |
| Grid Operators | ✅ Excellent | Technical, mentions N-1 contingency |
| Industry | ✅ Good | Cost/competitiveness focused |
| Public | ✅ Good | Accessible, asks about bills/jobs |
| Financial | ✅ Good | PPAs, bankability, risk returns |
| Development Partners | ✅ Good | Debt sustainability focused |
| Regional Bodies | ✅ Good | Cross-border trade perspective |
| CSOs/NGOs | ✅ Good | Climate ambition, justice |
| Scientific | ✅ Good | Evidence-based, methodological |

---

## Browser Compatibility

### Supported
- ✅ Chrome 113+ (Windows, macOS, Linux)
- ✅ Edge 113+ (Windows, macOS)
- ✅ Opera 99+

### Unsupported (silent fallback to rule-based)
- ❌ Firefox (WebGPU not stable)
- ❌ Safari < 18
- ❌ Mobile browsers
- ❌ Older Chrome/Edge < 113

---

## Configuration

### Enable/Disable WebLLM

In `src/utils/stakeholder-ai.ts`:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  webLLMEnabled: true,  // Set to false to disable
  webLLMModel: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
  webLLMTimeout: 20000,
  // ...
};
```

### Change Model

```typescript
webLLMModel: 'Phi-3.5-mini-instruct-q4f16_1-MLC',  // Better quality, larger
```

---

## Workshop Deployment

### Option 1: First-Run Download
1. Participant opens tool
2. Clicks "Enable AI" button
3. Model downloads (~2-5 min on good connection)
4. Model cached in browser (IndexedDB)
5. Works offline forever after

### Option 2: Pre-Load on USB
1. Facilitator downloads model on their machine
2. Export browser IndexedDB to file
3. Distribute on USB with tool
4. Participants import = instant AI

### Option 3: Hybrid
- **Facilitators:** Use Ollama (faster, better quality)
- **Participants:** Use WebLLM (zero setup)
- Both get AI enhancement, different backends

### Browser Requirements for Participants
- Chrome 113+ or Edge 113+
- ~2 GB free disk space
- Good internet for first download (or USB)

---

## Testing Checklist

- [x] Model loads in fresh browser
- [x] Model caches in IndexedDB
- [x] Works offline after cache
- [x] Failover: WebLLM → Ollama → Rule-based
- [x] Silent failover if WebGPU unsupported
- [x] Few-shot prompts for all 9 stakeholders
- [x] Echo detection and fallback
- [x] Bulk testing (90 scenarios)
- [x] 100% quality rate achieved

---

## Future Improvements

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Try Phi-3.5-mini model | 1 hour | Higher quality |
| Fine-tune on stakeholder data | 8-16 hours | Much higher quality |
| Add model selection UI | 2 hours | User choice |
| Streaming responses | 4 hours | Better UX |

---

## References

- [WebLLM Documentation](https://webllm.mlc.ai/)
- [Supported Models](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
- [WebGPU Support](https://caniuse.com/webgpu)
- [MLC LLM Project](https://llm.mlc.ai/)
