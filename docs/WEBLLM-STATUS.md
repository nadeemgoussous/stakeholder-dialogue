# WebLLM Integration Status

**Last Updated:** 2025-12-30  
**Status:** ✅ WORKING - Quality improvements deferred

## Summary

WebLLM integration is **technically complete and functional**. The SmolLM2-1.7B-Instruct model loads successfully in the browser, generates AI-enhanced responses, and fails over gracefully when unavailable. However, **response quality is limited** due to the small model size (1.7B parameters).

## What Works

✅ **Model Loading**
- SmolLM2-1.7B-Instruct (~1.77 GB) downloads and caches successfully
- Uses browser IndexedDB for persistent storage
- Only downloads once, subsequent loads are instant from cache

✅ **Response Generation**
- Enhances `initialReaction` field with more natural language
- 20-second timeout with graceful failover to rule-based responses
- No errors shown to user when AI unavailable

✅ **Browser Compatibility**
- Works in Chrome 113+ and Edge 113+ (WebGPU required)
- Silent degradation on unsupported browsers
- No installation required for workshop participants

✅ **Offline Functionality**
- Works 100% offline after first model download
- Privacy-preserving (data stays in browser)
- PWA-compatible

## Current Limitations

⚠️ **Response Quality**
- Quality improved significantly with few-shot prompting (2025-12-30)
- Still limited compared to larger models, but usable for workshops
- May occasionally produce generic responses

## Few-Shot Prompting (Implemented)

Added 2 examples per stakeholder to teach the model each group's voice:

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

**File:** `src/data/stakeholder-fewshot.ts`

## Root Causes (for remaining limitations)

1. **Small Model Size** - 1.7B parameters is limited for nuanced simulation
2. **Context Window** - Must keep prompts short for reliable inference
3. **No Fine-Tuning** - Model not specifically trained on stakeholder data

## Improvement Roadmap

### ✅ Option 1: Few-Shot Prompts (DONE - 2025-12-30)
- Added 2 examples per stakeholder to system prompt
- Each example shows voice, tone, and typical concerns
- Kept examples short (2-3 sentences) for token efficiency
- **Effort:** ~2 hours
- **Result:** Noticeably improved quality

### Option 2: Larger Model (Medium effort, high impact)
- **Phi-3.5-mini-instruct** (3.8B params, ~2.4 GB)
  - Better instruction following
  - More nuanced language generation
  - Still fast enough for browser inference
- **Gemma-2-2b-it** (2B params, ~1.5 GB)
  - Alternative to SmolLM2
  - Better zero-shot performance
- **Estimated effort:** 1 hour (just change model ID)
- **Expected improvement:** 50-70% better quality

### Option 3: Fine-Tuning (High effort, high impact)
- Generate 500+ training examples per stakeholder (9 x 500 = 4,500 examples)
- Fine-tune SmolLM2 or Phi-3.5-mini on stakeholder simulation task
- Convert to MLC format and host
- **Estimated effort:** 8-16 hours
- **Expected improvement:** 80-90% better quality

### Option 4: Hybrid Approach (Recommended)
1. **Immediate:** Try Phi-3.5-mini-instruct (1 hour)
2. **Short-term:** Improve prompts with examples (2-4 hours)
3. **Long-term:** Fine-tune if budget allows (deferred)

## Technical Implementation

### Current Prompts

**System Prompt:**
```
You are [Stakeholder] reviewing an energy scenario for [Country].

KEY CONCERNS: [3 priorities]
SCENARIO: [RE%] renewable energy by 2030

Write a brief, natural response (2-3 sentences) expressing your initial reaction.
Use [Stakeholder]'s perspective and priorities.
Output ONLY the response text - no JSON, no labels, no formatting.
```

**User Prompt:**
```
POSITIVE: [appreciations]
CONCERNS: [concerns]

Write [Stakeholder]'s initial reaction to this energy scenario.
Make it natural and conversational.
Keep it to 2-3 sentences.
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| Model size | 1.77 GB |
| First load time | 2-5 minutes (download) |
| Subsequent loads | <2 seconds (from cache) |
| Inference time | 10-15 seconds |
| Timeout | 20 seconds |
| Browser support | Chrome/Edge 113+ |

### Files Modified

- `src/utils/stakeholder-ai.ts` - Core WebLLM integration
- `src/hooks/useWebLLM.ts` - React state management
- `src/components/stakeholder/StakeholderTab.tsx` - UI integration
- `src/components/common/ModelLoadingProgress.tsx` - Loading UI

### Key Functions

- `initializeWebLLM()` - Singleton engine initialization
- `enhanceWithWebLLM()` - Response enhancement
- `buildEnhancementSystemPrompt()` - Simplified prompts for SmolLM2
- `buildEnhancementUserPrompt()` - Context extraction from rule-based response

## Deployment Notes

### For Workshops

**Current Recommendation:** Keep WebLLM **disabled by default** until quality improves.

Participants can optionally enable it by clicking "Enable AI" button, but should understand it's experimental.

**Alternative:** Pre-load a better model (Phi-3.5-mini) and test quality before workshops.

### Configuration

Enable/disable WebLLM in `src/utils/stakeholder-ai.ts`:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  webLLMEnabled: true,  // Set to false to disable
  webLLMModel: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
  webLLMTimeout: 20000,
  // ...
};
```

### Browser Requirements

Inform participants:
- **Chrome 113+** or **Edge 113+** required
- **~2 GB free disk space** for model caching
- **Good internet connection** for first-time model download (or pre-distribute on USB drives)

## Testing

Test WebLLM quality:

```bash
# 1. Load app
open http://localhost:5173/stakeholder-dialogue/

# 2. Load example scenario
# 3. Enable AI (wait for model to download first time)
# 4. Try all 9 stakeholders
# 5. Compare AI-enhanced vs rule-based responses
```

Check browser console for:
- Model loading progress
- Inference timing
- Fallback behavior

## Next Steps

**Immediate (before next workshop):**
1. Test Phi-3.5-mini-instruct model (30 minutes)
2. Compare quality side-by-side with SmolLM2
3. If significantly better → switch default model
4. If still poor → keep WebLLM disabled by default

**Future Enhancements:**
- Add few-shot examples to prompts
- Generate fine-tuning dataset
- Test Gemma-2-2b alternative
- Add model selection UI for advanced users
- Support streaming responses for better UX

## Conclusion

WebLLM integration is **production-ready from a technical standpoint** but **not yet production-ready from a quality standpoint**. The infrastructure is solid and extensible - we just need a better model or better prompts to unlock its full potential.

**Recommendation:** Defer quality improvements to next development cycle. Focus on completing remaining features (F034-F042) first.
