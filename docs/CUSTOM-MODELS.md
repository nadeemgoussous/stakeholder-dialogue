# Using Custom/Fine-Tuned Models with WebLLM

This guide explains how to use your own fine-tuned models with the Scenario Dialogue Tool.

## Overview

The tool supports custom models for both WebLLM (browser-based) and Ollama (local server). This is useful when you want to:
- Use a model fine-tuned on energy sector terminology
- Optimize responses for specific regional contexts
- Reduce model size for faster loading
- Improve response quality for your specific use case

---

## Option 1: Custom WebLLM Model (Browser-Based)

### Prerequisites

1. **Model in MLC Format**: Your model must be converted to MLC (Machine Learning Compilation) format
2. **Model Hosting**: Host your model files on a server or include in PWA bundle
3. **WebGPU Support**: Users need Chrome 113+ or Edge 113+

### Steps

#### 1. Convert Your Model to MLC Format

Use the MLC-LLM tools to convert your fine-tuned model:

```bash
# Install MLC-LLM
pip install mlc-llm

# Convert your model (example for Gemma fine-tune)
mlc_llm convert_weight \
  --model-path /path/to/your/fine-tuned-model \
  --quantization q4f16_1 \
  --output /path/to/output/mlc-model

# Compile the model for WebGPU
mlc_llm compile \
  --model /path/to/output/mlc-model \
  --target webgpu \
  --output /path/to/compiled-model
```

#### 2. Package Model with PWA (Recommended for Workshops)

**Why Package the Model?**
- ✅ No internet required during workshops
- ✅ Instant loading (no download wait)
- ✅ Works in air-gapped environments
- ✅ Can distribute on USB drives
- ✅ More reliable than online loading

**Steps to Package Model:**

```bash
# 1. Create models directory in public/
mkdir -p public/models

# 2. Copy your compiled model files
cp -r /path/to/compiled-model/* public/models/gemma-2-2b-it-q4f16_1-MLC/

# 3. Verify model files are present
ls -lh public/models/gemma-2-2b-it-q4f16_1-MLC/
# Should see: model weights, tokenizer, config files

# 4. Build PWA with bundled model
npm run build

# 5. Test the build
npm run preview
```

**Alternative: Self-Hosted Server** (for development/testing only)
```bash
# Serve your model files
# Make sure CORS is configured correctly
python -m http.server 8080 --directory /path/to/compiled-model
```

#### 3. Update Configuration

Edit `src/utils/stakeholder-ai.ts`:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  // Enable WebLLM (disabled by default)
  webLLMEnabled: true,

  // For packaged model (recommended):
  webLLMModel: '/models/gemma-2-2b-it-q4f16_1-MLC',

  // For hosted model (development only):
  // webLLMModel: 'https://your-server.com/models/your-model-name-q4f16_1-MLC',

  // For custom fine-tuned model:
  // webLLMModel: '/models/custom/your-fine-tuned-model-q4f16_1-MLC',

  webLLMTimeout: 5000,
  // ... rest of config
};
```

**IMPORTANT**: WebLLM is disabled by default to prevent UI blocking during model download. Only enable it after packaging the model or in production builds.

#### 4. Test Your Model

```bash
# Start dev server
npm run dev

# Open browser and load the tool
# WebLLM will download/load your custom model
# Check browser console for loading progress
```

---

## Option 2: Custom Ollama Model (Local Server)

### Prerequisites

1. **Ollama Installed**: Install Ollama on facilitator machines
2. **Model in GGUF Format**: Your model converted to GGUF format

### Steps

#### 1. Create Ollama Model

```bash
# Create a Modelfile
cat > Modelfile <<EOF
FROM /path/to/your/model.gguf

# Set custom parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9

# Set system prompt (optional)
SYSTEM """
You are an expert in energy planning and stakeholder engagement.
Enhance stakeholder responses while preserving all key points.
"""
EOF

# Create the model in Ollama
ollama create your-custom-model -f Modelfile
```

#### 2. Update Configuration

Edit `src/utils/stakeholder-ai.ts`:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  // ... WebLLM config

  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'your-custom-model', // Your model name
  ollamaTimeout: 3000,

  // ... rest of config
};
```

#### 3. Test Your Model

```bash
# Verify model works in Ollama
ollama run your-custom-model "Test prompt"

# Start the tool
npm run dev
```

---

## Model Size Recommendations

### For WebLLM (Browser-Based)
- **Workshop WiFi**: < 1GB (faster download)
- **USB Distribution**: < 2GB (reasonable bundle size)
- **Pre-loaded**: Any size (model cached before workshop)

### For Ollama (Local Server)
- **Facilitator Laptops**: < 4GB (fits in RAM)
- **Workshop Server**: < 8GB (better quality)

---

## Model Quantization

Use quantization to reduce model size:

| Quantization | Size Reduction | Quality | Speed |
|--------------|----------------|---------|-------|
| q4f16_1      | ~4x smaller    | High    | Fast  |
| q4f32_1      | ~3x smaller    | Higher  | Medium|
| q8f16_1      | ~2x smaller    | Best    | Slower|

**Recommendation**: Use `q4f16_1` for best balance of size, quality, and speed.

---

## Fine-Tuning Tips for Energy Scenarios

When fine-tuning a model for this tool:

### Training Data Examples

**Good Examples**:
```
Input: Enhance this response for Policy Makers about a 60% RE scenario...
Output: [Enhanced response with policy-appropriate language]

Input: Enhance this response for CSOs/NGOs about coal phaseout...
Output: [Enhanced response emphasizing climate benefits]
```

### Recommended Fine-Tuning Parameters

```python
training_args = TrainingArguments(
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    num_train_epochs=3,
    warmup_steps=100,
    # Focus on preserving factual content
    # while improving natural language
)
```

### Validation Criteria

Test your fine-tuned model on:
1. **Factual Preservation**: Ensure numbers and key points unchanged
2. **Stakeholder Tone**: Match appropriate tone for each stakeholder type
3. **Brevity**: Responses should be concise (< 300 words)
4. **Consistency**: Similar scenarios get similar enhancements

---

## Deployment Strategies

### Strategy 1: Hybrid Approach (Recommended)
- **WebLLM**: Default Gemma 2 2B for all participants
- **Ollama**: Fine-tuned model for facilitators (better quality)
- **Failover**: Rule-based responses as ultimate fallback

### Strategy 2: Custom WebLLM Only
- **WebLLM**: Your fine-tuned model for all users
- **Pre-load**: Include model in PWA bundle or USB distribution
- **Failover**: Rule-based responses

### Strategy 3: Progressive Enhancement
- **Workshop Start**: Rule-based responses (instant)
- **Model Loading**: WebLLM loads in background
- **After Load**: AI-enhanced responses automatically

---

## Troubleshooting

### WebLLM Model Not Loading

**Check**:
- Model URL is accessible (CORS enabled)
- Model format is correct (MLC format for WebGPU)
- Browser supports WebGPU (Chrome 113+)
- Console logs for specific errors

**Solutions**:
```javascript
// Check WebGPU support
if ('gpu' in navigator) {
  console.log('WebGPU supported');
} else {
  console.warn('WebGPU not supported - will use fallback');
}
```

### Ollama Model Not Found

**Check**:
```bash
# List available models
ollama list

# Test model directly
ollama run your-custom-model "test"
```

**Solutions**:
- Recreate model with `ollama create`
- Check model name matches config exactly
- Ensure Ollama service is running

### Model Too Slow

**Solutions**:
1. Use smaller quantization (q4f16_1)
2. Reduce max_tokens in prompt
3. Increase timeout in config
4. Use faster base model (1B instead of 2B)

---

## Example: Fine-Tuned Gemma for Energy Planning

Here's a complete example of deploying a fine-tuned Gemma model:

```bash
# 1. Fine-tune Gemma 2 2B on energy planning data
# (Use your preferred fine-tuning framework)

# 2. Convert to GGUF for Ollama
python convert-to-gguf.py --model ./fine-tuned-gemma

# 3. Create Ollama model
ollama create energy-planner-gemma -f Modelfile

# 4. Convert to MLC for WebLLM
mlc_llm convert_weight \
  --model-path ./fine-tuned-gemma \
  --quantization q4f16_1 \
  --output ./mlc-energy-planner

mlc_llm compile \
  --model ./mlc-energy-planner \
  --target webgpu \
  --output ./webgpu-energy-planner

# 5. Update config
# Edit src/utils/stakeholder-ai.ts with model names

# 6. Test both
npm run dev
```

---

## Resources

- **MLC-LLM Documentation**: https://llm.mlc.ai/
- **WebLLM GitHub**: https://github.com/mlc-ai/web-llm
- **Ollama Documentation**: https://ollama.ai/
- **Model Quantization Guide**: https://huggingface.co/docs/transformers/main/quantization

---

**Need Help?** Check the WebLLM implementation guide at `docs/WEBLLM-IMPLEMENTATION.md` for more details on the integration architecture.
