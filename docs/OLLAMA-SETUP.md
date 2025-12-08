# Local LLM Setup with Ollama

This guide explains how to set up **Ollama** with **Gemma 2 2B** for AI-enhanced stakeholder responses in the Scenario Dialogue Tool.

## Why Local LLM?

The Scenario Dialogue Tool is designed for **offline-first workshops** where internet connectivity may be unreliable. Using a local LLM provides:

- ✅ **Truly offline AI enhancement** - Works without internet after setup
- ✅ **Privacy** - Scenario data never leaves the local machine
- ✅ **Speed** - No network latency, instant responses
- ✅ **Cost** - No API fees, unlimited usage
- ✅ **Reliability** - No rate limits, no API outages

## Architecture

The tool uses a **three-tier fallback system**:

1. **Ollama (Local LLM)** - Primary method, best user experience
2. **Cloud API** - Optional fallback for online scenarios
3. **Rule-based** - Always works, guaranteed fallback

The system automatically and silently falls back to rule-based responses if Ollama is unavailable.

---

## Installation

### Step 1: Install Ollama

**Windows:**
1. Download Ollama from [https://ollama.com/download](https://ollama.com/download)
2. Run the installer (`OllamaSetup.exe`)
3. Ollama will install and start automatically

**macOS:**
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.com/download
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Download Gemma 2 2B Model

Open a terminal/command prompt and run:

```bash
ollama pull gemma2:2b
```

This will download the **Gemma 2 2B** model (~1.6 GB). The download happens once and the model is cached locally.

**Why Gemma 2 2B?**
- Small enough to run on laptops (2GB RAM for model)
- Fast inference (~1-2 seconds on modern hardware)
- Good quality for text enhancement tasks
- Open license (Google's Gemma license)

### Step 3: Verify Installation

Run the following command to test Ollama:

```bash
ollama run gemma2:2b "Hello! Can you help me with energy planning?"
```

If you see a response, Ollama is working correctly!

### Step 4: Start Ollama Service

Ollama typically runs as a background service. To ensure it's running:

**Windows:**
- Ollama starts automatically with Windows
- Check system tray for Ollama icon
- Or run: `ollama serve` in Command Prompt

**macOS/Linux:**
```bash
ollama serve
```

The Ollama API will be available at `http://localhost:11434`.

---

## Configuration

The Scenario Dialogue Tool uses these default settings:

```typescript
{
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma2:2b',
  ollamaTimeout: 3000, // 3 seconds max
}
```

### Advanced Configuration

If you want to use a different model or configuration, you can modify `src/utils/stakeholder-ai.ts`:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma2:7b', // Larger model (better quality, slower)
  ollamaTimeout: 5000, // Longer timeout for slower hardware
  cloudEnabled: false,
  cloudTimeout: 3000,
};
```

### Alternative Models

You can experiment with other models supported by Ollama:

```bash
# Larger Gemma model (better quality, requires more RAM)
ollama pull gemma2:9b

# Llama models (also work well)
ollama pull llama3.2:3b

# Mistral models (good for structured output)
ollama pull mistral:7b
```

Then update the `ollamaModel` setting to match.

---

## How It Works

### Response Enhancement Flow

1. **User clicks "Reveal Response"** in the prediction interface
2. **Rule-based response generated** (always fast, always works)
3. **Check Ollama availability**:
   - Ping `http://localhost:11434/api/tags`
   - Check if `gemma2:2b` is available
   - Timeout after 1 second
4. **If Ollama available**:
   - Send rule-based response + scenario context to Ollama
   - Ask LLM to enhance natural language while preserving structure
   - Timeout after 3 seconds
   - Return enhanced response with `generationType: 'ai-enhanced'`
5. **If Ollama unavailable** (timeout, error, offline):
   - Silently return rule-based response
   - No error messages, no loading spinners
   - User never knows AI enhancement failed

### What the LLM Does

The local LLM **enhances** the rule-based response by:

- Making language more natural and conversational
- Adapting tone to match stakeholder personality
- Improving flow and readability
- **WITHOUT** changing the core content, concerns, or facts

### What the LLM Does NOT Do

- ❌ Calculate technical metrics (that's the rule-based system)
- ❌ Add new stakeholder concerns (preserves existing logic)
- ❌ Make up data or numbers
- ❌ Contradict the energy model outputs

---

## Workshop Preparation

### Pre-Workshop Checklist

For facilitators preparing workshops:

- [ ] Install Ollama on workshop laptops/computers
- [ ] Download `gemma2:2b` model on each machine
- [ ] Test Ollama with: `ollama run gemma2:2b "Test"`
- [ ] Ensure Ollama service is running
- [ ] Test the Scenario Dialogue Tool with "Load Example"
- [ ] Verify AI enhancement indicator shows "Enhanced with Ollama"

### Offline Workshop Setup

If the workshop venue has **no internet**:

1. **Pre-download everything before the workshop:**
   ```bash
   # On a machine with internet
   ollama pull gemma2:2b

   # Copy Ollama models directory to USB drive
   # Windows: C:\Users\<username>\.ollama\models
   # macOS: ~/.ollama/models
   # Linux: ~/.ollama/models
   ```

2. **At the venue (offline):**
   ```bash
   # Copy models from USB to each machine
   # Windows: Copy to C:\Users\<username>\.ollama\models
   # macOS/Linux: Copy to ~/.ollama/models

   # Start Ollama service
   ollama serve
   ```

3. **The tool will work completely offline!**

### Troubleshooting

**Ollama not detected:**
- Check if Ollama service is running: `ollama list`
- Restart Ollama: `ollama serve`
- Check firewall isn't blocking localhost:11434

**Responses slow:**
- Gemma 2 2B should respond in 1-3 seconds on modern hardware
- If slower, check CPU/RAM usage
- Consider using rule-based only (`ollamaEnabled: false`)

**Model not found:**
- Run: `ollama list` to see installed models
- Download missing model: `ollama pull gemma2:2b`

**Tool shows "rule-based" but Ollama is running:**
- Check console (F12) for debug messages
- Look for: `✅ Response enhanced with Ollama` or error messages
- Verify model name matches exactly (case-sensitive)

---

## System Requirements

### Minimum Requirements (for Gemma 2 2B)
- **RAM**: 4 GB (2 GB for model + 2 GB for OS/app)
- **Disk Space**: 2 GB for model
- **CPU**: Modern multi-core processor (2018 or newer)
- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)

### Recommended Requirements
- **RAM**: 8 GB or more
- **Disk Space**: 5 GB (for multiple models)
- **CPU**: 4+ cores
- **SSD**: For faster model loading

### Performance Estimates

| Hardware | Response Time | Notes |
|----------|---------------|-------|
| MacBook Pro M1/M2 | 0.5-1s | Excellent |
| Modern laptop (2020+) | 1-2s | Very good |
| Older laptop (2018-2020) | 2-4s | Acceptable |
| Very old laptop (<2018) | 4-8s | Use rule-based only |

---

## Cloud API Fallback (Optional)

If you want to use cloud APIs as a fallback (for online scenarios):

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma2:2b',
  ollamaTimeout: 3000,

  // Enable cloud fallback
  cloudEnabled: true,
  cloudProvider: 'anthropic',
  cloudApiKey: 'sk-ant-...', // Your API key
  cloudTimeout: 3000,
};
```

**Note**: Cloud API integration is currently a placeholder and would need implementation.

---

## Privacy & Security

### Data Privacy

When using Ollama:
- ✅ All data stays on the local machine
- ✅ No scenario data sent to external servers
- ✅ No telemetry or usage tracking
- ✅ Fully compliant with data protection regulations

### Model Licensing

- **Gemma 2**: Released by Google under Gemma Terms of Use
- **Commercial use**: Allowed
- **Distribution**: Allowed
- **No restrictions**: For educational and workshop use

---

## Support

For issues with:

- **Ollama installation**: Visit [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Gemma models**: Visit [https://ai.google.dev/gemma](https://ai.google.dev/gemma)
- **Scenario Dialogue Tool**: Open an issue in the project repository

---

## Summary

✅ **Install Ollama** → Download and install
✅ **Pull Model** → `ollama pull gemma2:2b`
✅ **Start Service** → `ollama serve`
✅ **Use Tool** → AI enhancement happens automatically
✅ **Fallback Works** → Rule-based responses if Ollama unavailable

The tool is designed to work seamlessly whether Ollama is available or not. Set it up for the best experience, but don't worry if it's not available - stakeholder responses will still work!
