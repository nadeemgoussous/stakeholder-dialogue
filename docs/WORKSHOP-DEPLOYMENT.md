# Workshop Deployment Guide

Quick guide for deploying the Scenario Dialogue Tool in workshops with packaged AI models.

## Quick Start (Without WebLLM)

**Current State**: Tool works immediately with rule-based responses (no AI). This is perfect for testing!

```bash
# 1. Start the tool
npm run dev

# 2. Open browser at http://localhost:5174
# 3. Load example scenario
# 4. Try stakeholder dialogue
# ✅ Works instantly with rule-based responses
```

---

## Adding AI Enhancement (Ollama - Recommended for Now)

**For Facilitators/Developers Only:**

```bash
# 1. Install Ollama
# Download from: https://ollama.ai

# 2. Pull Gemma 2 model
ollama pull gemma2:2b

# 3. Start the tool
npm run dev

# 4. Responses now AI-enhanced via Ollama!
# ✅ Fast inference (~1-2 seconds)
# ✅ Better quality responses
# ✅ Works offline
```

---

## Adding WebLLM (For Workshop Participants)

### Why Wait to Enable WebLLM?

❌ **Problem**: Large model download (1.4GB) blocks UI
❌ **Problem**: Requires fast internet during first use
❌ **Problem**: Takes 2-5 minutes to download

✅ **Solution**: Package model with PWA before workshop

### Steps to Package WebLLM Model

#### 1. Download and Convert Model

```bash
# Option A: Download pre-built model from WebLLM
# (Easiest - no conversion needed)
# Visit: https://github.com/mlc-ai/binary-mlc-llm-libs
# Download: gemma-2-2b-it-q4f16_1-MLC

# Option B: Convert your fine-tuned model
# See: docs/CUSTOM-MODELS.md for conversion guide
```

#### 2. Package with PWA

```bash
# 1. Create models directory
mkdir -p public/models

# 2. Copy model files
cp -r /path/to/gemma-2-2b-it-q4f16_1-MLC public/models/

# 3. Verify files copied
ls -lh public/models/gemma-2-2b-it-q4f16_1-MLC/
# Should see: weights, tokenizer, config

# 4. Enable WebLLM in config
# Edit src/utils/stakeholder-ai.ts:
# webLLMEnabled: true
# webLLMModel: '/models/gemma-2-2b-it-q4f16_1-MLC'

# 5. Build PWA
npm run build

# 6. Test build
npm run preview
```

#### 3. Distribute to Participants

**Option A: USB Drives**
```bash
# Copy dist/ folder to USB drives
cp -r dist/ /media/usb/scenario-dialogue-tool/

# On participant machines:
cd scenario-dialogue-tool
npx http-server -p 5000
# Open: http://localhost:5000
```

**Option B: Local Network Server**
```bash
# On facilitator machine:
npm run preview -- --host

# Participants access via:
# http://192.168.1.XXX:4173
```

**Option C: Pre-install on Workshop Laptops**
```bash
# Install on each laptop before workshop
npm install
npm run build
npm run preview
```

---

## Workshop Day Checklist

### Before Workshop

- [ ] Tool built with packaged model (if using WebLLM)
- [ ] USB drives prepared OR laptops pre-configured
- [ ] Test tool works offline (disconnect internet and verify)
- [ ] Example scenarios loaded and tested
- [ ] Facilitator has Ollama installed (for better responses)

### During Workshop

**If Using Rule-Based Only** (Current State):
- ✅ Works immediately, no setup needed
- ✅ Instant responses (< 200ms)
- ✅ No internet required
- ✅ Perfect for testing pedagogy

**If Using Ollama** (Facilitator Only):
- ✅ Fast AI-enhanced responses (~1-2 seconds)
- ✅ Works offline
- ✅ Better quality than rule-based
- ⚠️ Requires Ollama installation

**If Using WebLLM** (After Packaging):
- ✅ AI-enhanced responses for all participants
- ✅ Works offline (model pre-loaded)
- ✅ No installation required
- ✅ Zero-setup for participants
- ⏱️ 2-4 seconds inference time

### Troubleshooting

**"Reveal Response" button doesn't work:**
- Check WebLLM is disabled (webLLMEnabled: false) in config
- If enabled, make sure model is packaged in public/models/
- Check browser console for errors
- Test with rule-based first (disable all AI)

**Responses are slow:**
- Use rule-based responses (fastest)
- OR use Ollama (faster than WebLLM)
- OR reduce webLLMTimeout in config

**Model not loading:**
- Verify files in public/models/
- Check browser supports WebGPU (Chrome 113+)
- Try rebuilding: npm run build
- Fall back to rule-based responses

---

## Performance Comparison

| Method | Setup Time | Response Time | Quality | Offline |
|--------|------------|---------------|---------|---------|
| Rule-based | 0 min | < 200ms | Good | ✅ |
| Ollama | 5 min | 1-2 sec | Better | ✅ |
| WebLLM (packaged) | 30 min* | 2-4 sec | Better | ✅ |
| WebLLM (download) | 0 min | 2-5 min first use | Better | ❌ |

*One-time setup before workshop

---

## Recommended Deployment Strategy

### Phase 1: NOW (Testing & Development)
- Use **rule-based responses** for immediate testing
- Facilitators use **Ollama** for better responses
- Test all pedagogy features work correctly

### Phase 2: BEFORE Workshop
- Package **WebLLM model** with PWA
- Test on workshop laptops
- Create USB drive backups

### Phase 3: Workshop Day
- Participants use **packaged WebLLM** (instant, offline)
- Facilitators use **Ollama** (faster responses)
- Rule-based as ultimate fallback

---

## Current Status

✅ **Tool works right now** with rule-based responses
✅ **Ollama ready** (just install and pull model)
🚧 **WebLLM ready** (need to package model first)

**To test immediately:**
```bash
npm run dev
# Open browser, load example, try dialogue
# Works with rule-based responses!
```

**To add AI (easy):**
```bash
ollama pull gemma2:2b
# Restart tool, responses now AI-enhanced!
```

**To add WebLLM (requires packaging):**
```bash
# See "Adding WebLLM" section above
# Or wait until you have fine-tuned model ready
```
