# Model Fine-Tuning Guide for Stakeholder Dialogue Tool

## Overview

This guide shows how to fine-tune **Gemma 2B** for better stakeholder dialogue responses using your actual hardware:

- **M1 MacBook** (8GB RAM) - Personal/testing
- **Intel i7 Work PC** (16GB RAM) - Primary fine-tuning machine

Both machines can fine-tune Gemma 2B effectively. The work PC has more RAM for experimentation.

---

## Hardware Comparison

| Specification | M1 MacBook | Intel i7 Work PC | Recommendation |
|--------------|------------|------------------|----------------|
| **CPU** | M1 (8-core) | i7-10610U (4-core) | M1 faster for inference |
| **RAM** | 8GB unified | 16GB DDR4 | Work PC for training |
| **GPU** | M1 integrated (8-core) | Intel UHD | M1 much faster |
| **Best For** | Inference, testing | Training, experiments | Use both! |

**Strategy**: Train on work PC (more RAM), test on M1 (faster inference)

---

## Fine-Tuning Approaches

### Option 1: LoRA Fine-Tuning (Recommended)

**LoRA** (Low-Rank Adaptation) - Only trains small adapter layers

**Advantages**:
- ✅ Uses 1/10th the memory of full fine-tuning
- ✅ Fast training (minutes, not hours)
- ✅ Can switch adapters without reloading base model
- ✅ Works on both machines

**Memory Requirements**:
- Gemma 2B + LoRA 4-bit: **4-6GB** (fits both machines)
- Gemma 2B + LoRA 8-bit: **6-8GB** (comfortable on work PC)
- Gemma 2B full fine-tune: **12-16GB** (work PC only, slow)

### Option 2: Full Fine-Tuning

Only recommended for work PC with specific use case. LoRA usually sufficient.

---

## Installation

### On M1 MacBook (MLX - Apple's Framework)

```bash
# MLX is optimized for Apple Silicon
pip install mlx mlx-lm huggingface-hub

# Verify installation
python -c "import mlx.core as mx; print(mx.metal.is_available())"
# Should print: True
```

### On Intel i7 Work PC (PyTorch + Transformers)

```bash
# Install PyTorch (CPU version - no NVIDIA GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install transformers and dependencies
pip install transformers datasets peft bitsandbytes accelerate

# Verify installation
python -c "import torch; print(torch.__version__)"
```

**Note**: Your work PC has Intel integrated graphics (no CUDA). We'll use CPU-optimized training.

---

## Step 1: Prepare Training Data

### 1.1 Generate Examples from Rule-Based System

Create a Python script to export training data:

**File**: `scripts/export_training_data.py`

```python
import json
import sys
sys.path.append('./src')

from data.stakeholder_profiles import stakeholderProfiles
from utils.stakeholder_rules import generateRuleBasedResponse
from utils.calculations import calculateDerivedMetrics

# Sample scenarios (create variety)
scenarios = [
    {
        "metadata": {"country": "ScenarioLand", "scenarioName": "High Solar"},
        "capacity": {
            "byYear": {
                "2030": {"solarPV": 300, "windOnshore": 50, "hydro": 200, "gas": 100},
                "2040": {"solarPV": 600, "windOnshore": 100, "hydro": 200, "gas": 50}
            }
        },
        "investment": {"total": 2500},
        "emissions": {"byYear": {"2025": 5.0, "2050": 1.0}}
    },
    {
        "metadata": {"country": "Kenya", "scenarioName": "Wind Dominant"},
        "capacity": {
            "byYear": {
                "2030": {"solarPV": 100, "windOnshore": 400, "hydro": 300, "gas": 100},
                "2040": {"solarPV": 200, "windOnshore": 800, "hydro": 300, "gas": 0}
            }
        },
        "investment": {"total": 3000},
        "emissions": {"byYear": {"2025": 6.0, "2050": 0.5}}
    },
    # Add 20-50 diverse scenarios
]

training_data = []

for scenario in scenarios:
    derivedMetrics = calculateDerivedMetrics(scenario)

    for stakeholder in stakeholderProfiles:
        response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder)

        # Create training example
        prompt = f"""You are simulating a {stakeholder['name']} stakeholder reviewing an energy scenario.

**Scenario Context**:
- Country: {scenario['metadata']['country']}
- Scenario: {scenario['metadata']['scenarioName']}
- Renewable Share 2030: {calculate_re_share(scenario, 2030):.1f}%
- Investment: ${scenario['investment']['total']}M USD
- Jobs Created: {derivedMetrics['jobs']['byYear']['2030']['total']} (2030)

**Stakeholder Priorities**: {', '.join(stakeholder['priorities'])}

Respond as this stakeholder would, addressing their concerns and interests."""

        completion = f"""**Initial Reaction**: {response['initialReaction']}

**Appreciates**:
{format_list(response['appreciations'])}

**Concerns**:
{format_concerns(response['concerns'])}

**Questions**:
{format_list(response['questions'])}

**Engagement Tips**: {response['engagementTips']}"""

        training_data.append({
            "prompt": prompt,
            "completion": completion,
            "stakeholder": stakeholder['name'],
            "scenario": scenario['metadata']['scenarioName']
        })

# Save as JSONL
with open('training_data/stakeholder_dialogues.jsonl', 'w') as f:
    for item in training_data:
        f.write(json.dumps(item) + '\n')

print(f"Generated {len(training_data)} training examples")
```

**Run**:
```bash
mkdir -p training_data
python scripts/export_training_data.py
```

### 1.2 Manually Enhance Examples (Optional)

Review and improve the generated examples:

```python
# Add more natural language
# Add regional variations
# Add nuanced concerns based on real stakeholder feedback
```

**Target**: 200-500 high-quality examples

---

## Step 2: Fine-Tune on M1 MacBook (MLX)

### 2.1 Prepare Data for MLX

MLX expects data in specific format:

```python
# convert_to_mlx.py
import json

with open('training_data/stakeholder_dialogues.jsonl', 'r') as f:
    data = [json.loads(line) for line in f]

# MLX format
mlx_data = []
for item in data:
    mlx_data.append({
        "text": f"<|user|>\n{item['prompt']}\n<|assistant|>\n{item['completion']}<|endoftext|>"
    })

with open('training_data/stakeholder_mlx.jsonl', 'w') as f:
    for item in mlx_data:
        f.write(json.dumps(item) + '\n')
```

### 2.2 Fine-Tune with MLX

```bash
# Download base model
python -m mlx_lm.convert \
  --hf-path google/gemma-2b-it \
  --mlx-path models/gemma-2b-mlx

# Fine-tune with LoRA
python -m mlx_lm.lora \
  --model models/gemma-2b-mlx \
  --train \
  --data training_data/stakeholder_mlx.jsonl \
  --iters 600 \
  --steps-per-eval 100 \
  --val-batches 10 \
  --learning-rate 1e-5 \
  --batch-size 2 \
  --lora-layers 16 \
  --save-every 100 \
  --adapter-file models/stakeholder_lora

# Expected time: 15-30 minutes on M1 for 500 examples
```

### 2.3 Test the Fine-Tuned Model

```python
from mlx_lm import load, generate

# Load model with LoRA adapter
model, tokenizer = load(
    "models/gemma-2b-mlx",
    adapter_file="models/stakeholder_lora/adapters.npz"
)

# Test prompt
prompt = """You are simulating a Policy Maker stakeholder reviewing an energy scenario.

**Scenario Context**:
- Country: Tanzania
- Renewable Share 2030: 65%
- Investment: $2,800M USD

**Stakeholder Priorities**: Energy security, Climate commitments, Economic development

Respond as this stakeholder would."""

response = generate(model, tokenizer, prompt, max_tokens=400, temp=0.7)
print(response)
```

### 2.4 Export for Ollama

```bash
# Convert MLX LoRA to GGUF (Ollama format)
python scripts/mlx_to_gguf.py \
  --mlx-model models/gemma-2b-mlx \
  --adapter models/stakeholder_lora/adapters.npz \
  --output models/stakeholder-gemma.gguf
```

**Use in Ollama**:
```bash
# Create Modelfile
cat > Modelfile << EOF
FROM ./models/stakeholder-gemma.gguf
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM You are an expert at simulating stakeholder perspectives in energy planning scenarios. Always respond in character based on stakeholder priorities.
EOF

# Create Ollama model
ollama create stakeholder-gemma -f Modelfile

# Test
ollama run stakeholder-gemma "As a Grid Operator, what concerns do you have about 60% solar by 2030?"
```

---

## Step 3: Fine-Tune on Intel i7 Work PC (PyTorch)

### 3.1 Prepare Data for Transformers

```python
# prepare_hf_dataset.py
from datasets import Dataset
import json

with open('training_data/stakeholder_dialogues.jsonl', 'r') as f:
    data = [json.loads(line) for line in f]

# Hugging Face dataset format
hf_data = {
    "text": [f"<|user|>\n{item['prompt']}\n<|assistant|>\n{item['completion']}<|endoftext|>"
             for item in data]
}

dataset = Dataset.from_dict(hf_data)
dataset.save_to_disk("training_data/stakeholder_hf_dataset")
```

### 3.2 Fine-Tune with LoRA (PEFT)

```python
# finetune_gemma.py
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_from_disk

# Load model in 8-bit (saves memory)
model_name = "google/gemma-2b-it"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,  # 8-bit quantization
    device_map="cpu",   # CPU only (no CUDA on Intel UHD)
    torch_dtype=torch.float16
)

# Prepare for training
model = prepare_model_for_kbit_training(model)

# LoRA configuration
lora_config = LoraConfig(
    r=16,  # LoRA rank
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# Apply LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # Shows only 0.1% of params are trainable!

# Load dataset
dataset = load_from_disk("training_data/stakeholder_hf_dataset")

# Tokenize
def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)

tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=["text"])

# Training arguments
training_args = TrainingArguments(
    output_dir="./models/stakeholder-gemma-lora",
    num_train_epochs=3,
    per_device_train_batch_size=2,  # Small batch for CPU
    gradient_accumulation_steps=4,   # Effective batch size = 8
    learning_rate=2e-5,
    fp16=False,  # CPU doesn't support fp16
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    report_to="none",
    optim="adamw_torch",  # CPU-optimized optimizer
)

# Data collator
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

# Train!
print("Starting fine-tuning...")
trainer.train()

# Save LoRA adapters
model.save_pretrained("./models/stakeholder-gemma-lora")
tokenizer.save_pretrained("./models/stakeholder-gemma-lora")

print("Fine-tuning complete!")
```

**Run**:
```bash
python finetune_gemma.py

# Expected time on Intel i7 CPU: 1-2 hours for 500 examples
# Uses ~8-12GB RAM
```

**Note**: CPU training is slower than GPU, but your 16GB RAM handles it fine.

### 3.3 Test Fine-Tuned Model

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "google/gemma-2b-it",
    device_map="cpu",
    torch_dtype=torch.float16
)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, "./models/stakeholder-gemma-lora")
tokenizer = AutoTokenizer.from_pretrained("./models/stakeholder-gemma-lora")

# Test
prompt = """You are simulating a Financial Institution stakeholder...
[scenario details]
Respond as this stakeholder would."""

inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=400, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

### 3.4 Export for Ollama (from Work PC)

```bash
# Merge LoRA with base model
python scripts/merge_lora.py \
  --base-model google/gemma-2b-it \
  --lora-model ./models/stakeholder-gemma-lora \
  --output ./models/stakeholder-gemma-merged

# Convert to GGUF
python llama.cpp/convert.py \
  ./models/stakeholder-gemma-merged \
  --outfile ./models/stakeholder-gemma-q4.gguf \
  --outtype q4_0  # 4-bit quantization

# Transfer to M1 Mac and create Ollama model (same as before)
```

---

## Step 4: Deploy Fine-Tuned Model

### 4.1 For Ollama (Both Machines)

```bash
# Copy model to Ollama models directory
# Or use Modelfile as shown in Step 2.4

ollama create stakeholder-gemma -f Modelfile
```

**Update `stakeholder-ai.ts`**:

```typescript
export const DEFAULT_AI_CONFIG: AIConfig = {
  ollamaEnabled: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'stakeholder-gemma',  // Your fine-tuned model!
  ollamaTimeout: 3000,
  // ... rest of config
};
```

### 4.2 For WebLLM (Browser Deployment)

After implementing F043, you can deploy your fine-tuned model in the browser:

```typescript
// Convert to WebLLM format
// 1. Export as GGUF (done above)
// 2. Host on CDN or bundle with app
// 3. Load in WebLLM

const webLLMConfig = {
  model_url: "/models/stakeholder-gemma-q4.gguf",
  model_lib_url: webllm.modelLibraryUrl,
};
```

---

## Performance Comparison

### Training Speed

| Machine | Method | Time (500 examples) | Memory Used |
|---------|--------|---------------------|-------------|
| **M1 MacBook** | MLX + LoRA | 15-30 min | 4-6 GB |
| **Intel i7 PC** | PyTorch + LoRA (CPU) | 60-120 min | 8-12 GB |

**Recommendation**: Use M1 for training if possible (3-4x faster)

### Inference Speed (After Fine-Tuning)

| Machine | Method | Speed per Response |
|---------|--------|-------------------|
| **M1 MacBook** | Ollama (Metal) | 0.5-1.5 sec |
| **M1 MacBook** | MLX (native) | 0.3-0.8 sec |
| **Intel i7 PC** | Ollama (CPU) | 2-4 sec |

**Recommendation**: Deploy on M1 for production use

---

## Training Data Best Practices

### Quality Over Quantity

- ✅ **200-500 high-quality examples** > 5,000 mediocre ones
- ✅ **Diverse scenarios**: Different countries, tech mixes, investment levels
- ✅ **Accurate stakeholder voices**: Review with domain experts if possible
- ✅ **Consistent format**: Same structure across all examples

### Scenario Diversity

Create examples covering:
- **Geography**: Africa (EAPP, SAPP, WAPP), Asia, Small Islands
- **Technology Mix**: Solar-dominant, wind-dominant, balanced, hydro-heavy
- **Ambition Levels**: Conservative (30% RE), moderate (60% RE), ambitious (90% RE)
- **Investment**: Low-cost (<$1B), medium ($1-3B), high (>$3B)
- **Challenges**: Grid integration, land use, financing, political

### Example Distribution

```
Total: 500 examples
├── Policy Makers: 60 examples
├── Grid Operators: 60 examples
├── Industry: 55 examples
├── Public & Communities: 55 examples
├── CSOs & NGOs: 55 examples
├── Scientific Institutions: 55 examples
├── Financial Institutions: 55 examples
├── Regional Bodies: 55 examples
└── Development Partners: 50 examples
```

---

## Evaluation & Testing

### 1. Automated Evaluation

Compare fine-tuned vs base model:

```python
import json
from transformers import pipeline

# Load both models
base_model = pipeline("text-generation", model="google/gemma-2b-it")
fine_tuned = pipeline("text-generation", model="./models/stakeholder-gemma-lora")

# Test prompts
test_prompts = [
    # Load from test set (20% holdout from training data)
]

for prompt in test_prompts:
    base_response = base_model(prompt, max_new_tokens=200)[0]['generated_text']
    ft_response = fine_tuned(prompt, max_new_tokens=200)[0]['generated_text']

    print("Base:", base_response)
    print("Fine-tuned:", ft_response)
    print("---")
```

### 2. Human Evaluation

Have domain experts rate responses:
- Accuracy (does it match stakeholder priorities?)
- Naturalness (does it sound human?)
- Relevance (does it address the scenario?)
- Specificity (does it reference actual numbers/details?)

### 3. A/B Testing

Deploy both in the tool and let users compare!

---

## Troubleshooting

### M1 MacBook Issues

**"Metal not available"**:
```bash
# Reinstall MLX
pip uninstall mlx mlx-lm
pip install --upgrade mlx mlx-lm
```

**"Out of memory"**:
- Reduce batch size: `--batch-size 1`
- Use 4-bit quantization instead of 8-bit
- Close other applications

### Intel i7 Work PC Issues

**"Training too slow"**:
- Reduce batch size: `per_device_train_batch_size=1`
- Increase gradient accumulation: `gradient_accumulation_steps=8`
- Use fewer training epochs: `num_train_epochs=2`

**"Out of memory"**:
- Use 4-bit quantization: `load_in_4bit=True`
- Reduce max sequence length: `max_length=256`

---

## Cost-Benefit Analysis

### Time Investment

| Activity | Time Required |
|----------|---------------|
| Data preparation | 2-4 hours |
| Fine-tuning (M1) | 30-60 min |
| Fine-tuning (Work PC) | 1-2 hours |
| Testing & evaluation | 2-3 hours |
| Deployment | 1-2 hours |
| **Total** | **1-2 days** |

### Expected Improvement

- **Naturalness**: 30-50% better (more conversational)
- **Accuracy**: 10-20% better (more context-aware)
- **Consistency**: 40-60% better (stays in character)
- **Specificity**: 50-70% better (references actual scenario details)

### When to Fine-Tune

**Fine-tune if**:
- ✅ Base model responses feel generic
- ✅ You want more consistent stakeholder voices
- ✅ You have domain-specific knowledge to encode
- ✅ You plan to use the tool extensively (workshops)

**Don't fine-tune if**:
- ❌ Rule-based responses are good enough
- ❌ You're still prototyping features
- ❌ You don't have quality training data
- ❌ Time is very limited

---

## Next Steps

1. **Generate Training Data**: Run export script to create initial examples
2. **Review & Enhance**: Manually improve 50-100 examples
3. **Fine-Tune on M1**: Quick iteration and testing (30 min)
4. **Fine-Tune on Work PC**: More thorough training if needed (1-2 hours)
5. **Deploy**: Update Ollama model in the tool
6. **Evaluate**: Compare with base model and rule-based responses
7. **Iterate**: Refine training data based on results

---

## Advanced: Multi-Stakeholder Training

For even better results, train separate LoRA adapters per stakeholder:

```bash
# Train 9 different LoRA adapters
for stakeholder in policy-makers grid-operators industry ...; do
  python -m mlx_lm.lora \
    --model gemma-2b-mlx \
    --train \
    --data "training_data/${stakeholder}.jsonl" \
    --adapter-file "models/lora_${stakeholder}"
done

# Switch adapters at runtime based on selected stakeholder
```

This gives maximum quality per stakeholder but requires more storage and complexity.

---

## Resources

- **MLX Documentation**: https://ml-explore.github.io/mlx/build/html/index.html
- **PEFT (LoRA) Guide**: https://huggingface.co/docs/peft
- **Gemma Model Card**: https://huggingface.co/google/gemma-2b-it
- **Transformers Documentation**: https://huggingface.co/docs/transformers

---

## Summary

**For Your Setup**:

1. **M1 MacBook (8GB)**: ✅ Perfect for fine-tuning with MLX (fast, efficient)
2. **Intel i7 Work PC (16GB)**: ✅ Great for experimentation and longer training runs

**Recommended Workflow**:
```
Generate Data (Work PC)
    ↓
Fine-Tune with MLX (M1 Mac) - Fast iteration
    ↓
Test & Evaluate (M1 Mac) - Quick feedback
    ↓
Deploy to Ollama (M1 Mac) - Best inference speed
    ↓
Optional: Fine-tune with PyTorch (Work PC) - Thorough training
```

**Expected Results**:
- **Better quality** responses (more natural, context-aware)
- **Consistent** stakeholder voices across scenarios
- **Production-ready** model for workshops

Happy fine-tuning! 🚀
