# Technical Implementation Guide

This document contains reference implementations for core algorithms and logic used in the Scenario Dialogue Tool.

## Response Generation System

### Architecture: Offline-First

```
┌─────────────────────────────────────────────────────────┐
│                    User Selects Stakeholder              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Check: Is scenario data complete?              │
│                         │                                │
│            No ──────────┼──────────► Show validation     │
│                         │            errors              │
│            Yes          ▼                                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│      PREDICT-BEFORE-REVEAL (Pedagogy Feature)           │
│                                                         │
│  "What do you think [Stakeholder] will say about        │
│   this scenario? Type your prediction below:"           │
│                                                         │
│  [________________________________] (min 20 chars)      │
│                                                         │
│  [Reveal Response]                                      │
└─────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Generate Response (Offline-First)                │
│                                                         │
│  1. ALWAYS generate rule-based response first           │
│  2. IF online AND API key configured:                   │
│     - Attempt AI enhancement (3 second timeout)         │
│     - On ANY error: silently use rule-based            │
│  3. Display response with user's prediction visible     │
└─────────────────────────────────────────────────────────┘
```

---

## Rule-Based Response Generator (PRIMARY)

This is the core response generation logic that works 100% offline.

### Main Response Function

```typescript
// src/utils/stakeholder-rules.ts

export function generateRuleBasedResponse(
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  stakeholder: StakeholderProfile
): StakeholderResponse {

  const concerns: Concern[] = [];
  const appreciation: string[] = [];

  // Check all concern triggers against data
  for (const trigger of stakeholder.concernTriggers) {
    const value = getMetricValue(scenario, derivedMetrics, trigger.metric);
    if (value !== null) {
      const triggered = trigger.direction === 'above'
        ? value > trigger.threshold
        : value < trigger.threshold;

      if (triggered) {
        concerns.push({
          text: insertValue(trigger.concernText, value),
          explanation: trigger.explanation,
          metric: trigger.metric,
          severity: calculateSeverity(value, trigger.threshold, trigger.direction)
        });
      }
    }
  }

  // Check all positive indicators
  for (const indicator of stakeholder.positiveIndicators) {
    const value = getMetricValue(scenario, derivedMetrics, indicator.metric);
    if (value !== null) {
      const triggered = indicator.direction === 'above'
        ? value > indicator.threshold
        : value < indicator.threshold;

      if (triggered) {
        appreciation.push(insertValue(indicator.praiseText, value));
      }
    }
  }

  // Find matching response template
  const template = findMatchingTemplate(scenario, stakeholder.responseTemplates);

  // Generate initial reaction based on balance
  const initialReaction = generateInitialReaction(
    concerns.length,
    appreciation.length,
    stakeholder,
    template
  );

  // Select relevant questions based on scenario characteristics
  const questions = selectRelevantQuestions(
    stakeholder.typicalQuestions,
    scenario,
    concerns
  );

  // Select engagement advice
  const advice = stakeholder.goodPractices.slice(0, 3);

  return {
    stakeholderId: stakeholder.id,
    stakeholderName: stakeholder.name,
    initialReaction,
    appreciation,
    concerns,
    questions,
    engagementAdvice: advice,
    generatedAt: new Date().toISOString(),
    generationType: 'rule-based'
  };
}
```

### Helper Functions

```typescript
function generateInitialReaction(
  concernCount: number,
  appreciationCount: number,
  stakeholder: StakeholderProfile,
  template: ResponseTemplate | null
): string {
  if (template) {
    return template.initialReaction;
  }

  const ratio = appreciationCount / (concernCount + appreciationCount + 1);

  if (ratio > 0.7) {
    return `As a ${stakeholder.name} representative, I see several positive aspects in this scenario that align with our priorities.`;
  } else if (ratio > 0.4) {
    return `This scenario has both strengths and areas that warrant further discussion from our perspective.`;
  } else {
    return `We have some important questions and concerns about this scenario that we would like to discuss.`;
  }
}

function getMetricValue(
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  metricPath: string
): number | null {
  // Parse metric path like 'investment.cumulative.2030'
  const parts = metricPath.split('.');
  let value: any = scenario;

  // Try scenario first
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      // Try derived metrics
      value = derivedMetrics;
      for (const derivedPart of parts) {
        if (value && typeof value === 'object' && derivedPart in value) {
          value = value[derivedPart];
        } else {
          return null;
        }
      }
      break;
    }
  }

  return typeof value === 'number' ? value : null;
}

function insertValue(text: string, value: number): string {
  // Replace {value} placeholder with formatted number
  return text.replace('{value}', value.toLocaleString());
}

function calculateSeverity(
  value: number,
  threshold: number,
  direction: 'above' | 'below'
): 'low' | 'medium' | 'high' {
  const ratio = value / threshold;
  const exceedance = direction === 'above'
    ? ratio - 1
    : 1 - ratio;

  if (exceedance > 0.5) return 'high';
  if (exceedance > 0.2) return 'medium';
  return 'low';
}

function findMatchingTemplate(
  scenario: ScenarioInput,
  templates: ResponseTemplate[]
): ResponseTemplate | null {
  // Simple condition matching - can be expanded
  for (const template of templates) {
    if (template.condition === 'highInvestment') {
      const totalInvestment = scenario.supply.investment.cumulative[2050];
      if (totalInvestment > 5000) return template;
    }
    // Add more conditions as needed
  }
  return null;
}

function selectRelevantQuestions(
  allQuestions: string[],
  scenario: ScenarioInput,
  concerns: Concern[]
): string[] {
  // Select 3-5 most relevant questions based on scenario
  // Prioritize questions related to identified concerns
  const selected: string[] = [];

  // Add questions related to concerns
  for (const concern of concerns.slice(0, 2)) {
    const relatedQuestion = findRelatedQuestion(concern.metric, allQuestions);
    if (relatedQuestion && !selected.includes(relatedQuestion)) {
      selected.push(relatedQuestion);
    }
  }

  // Fill remaining slots with general questions
  for (const question of allQuestions) {
    if (selected.length >= 5) break;
    if (!selected.includes(question)) {
      selected.push(question);
    }
  }

  return selected.slice(0, 5);
}

function findRelatedQuestion(metric: string, questions: string[]): string | null {
  // Map metrics to question keywords
  const keywords: Record<string, string[]> = {
    'investment': ['financing', 'investment', 'cost'],
    'emissions': ['emissions', 'climate', 'carbon'],
    'jobs': ['jobs', 'employment', 'workforce'],
    'renewableShare': ['renewable', 'RE', 'VRE'],
    'battery': ['storage', 'battery', 'flexibility']
  };

  for (const [metricKey, relatedKeywords] of Object.entries(keywords)) {
    if (metric.includes(metricKey)) {
      for (const question of questions) {
        for (const keyword of relatedKeywords) {
          if (question.toLowerCase().includes(keyword.toLowerCase())) {
            return question;
          }
        }
      }
    }
  }

  return null;
}
```

---

## AI Enhancement (OPTIONAL, Silent Failover)

AI enhancement is completely optional and gracefully degrades to rule-based responses.

### Main AI Function

```typescript
// src/utils/stakeholder-ai.ts

const AI_TIMEOUT_MS = 3000;  // Short timeout - don't block user

export async function maybeEnhanceWithAI(
  ruleBasedResponse: StakeholderResponse,
  scenario: ScenarioInput,
  stakeholder: StakeholderProfile
): Promise<StakeholderResponse> {

  // Check if AI is available
  if (!navigator.onLine) {
    return ruleBasedResponse;
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ruleBasedResponse;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildSystemPrompt(stakeholder),
        messages: [{
          role: 'user',
          content: buildUserPrompt(scenario, stakeholder, ruleBasedResponse)
        }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Silent failover
      return ruleBasedResponse;
    }

    const data = await response.json();
    const enhanced = parseAIResponse(data.content[0].text, ruleBasedResponse);
    enhanced.generationType = 'ai-enhanced';
    return enhanced;

  } catch (error) {
    // Silent failover - never show errors for AI
    console.log('AI enhancement unavailable, using rule-based response');
    return ruleBasedResponse;
  }
}
```

### AI System Prompt (With Strict Guardrails)

```typescript
function buildSystemPrompt(stakeholder: StakeholderProfile): string {
  return `You are helping energy planners understand how a ${stakeholder.name} representative would respond to their energy scenario.

## YOUR ROLE
You simulate a realistic, professional perspective - NOT an adversarial one. Stakeholders have legitimate concerns and valuable viewpoints.

## STRICT RULES - VIOLATIONS ARE UNACCEPTABLE

1. TONE: Be professional, constructive, and respectful. Never insulting, accusatory, or inflammatory. You represent a professional stakeholder, not a protester.

2. FACTS ONLY:
   - ONLY reference data that is explicitly provided in the scenario
   - NEVER invent specific policy documents, laws, or agreements that weren't mentioned
   - NEVER claim the scenario violates specific regulations unless named in the input
   - If you need to reference a policy, say "relevant policies" not "the 2023 Renewable Energy Act"

3. NO TECHNICAL CALCULATIONS:
   - Do not calculate LCOE, reserve margins, or system reliability
   - Do not claim specific percentages unless they are in the input data
   - Say "this may require additional grid investment" NOT "this will cost $500 million in grid upgrades"

4. RESPECTFUL CRITICISM:
   - Frame concerns as questions, not accusations
   - "We would want to understand the financing strategy" NOT "This plan is fiscally irresponsible"
   - "This raises questions about community consultation" NOT "Communities were ignored"

5. BALANCED VIEW:
   - Always acknowledge positive aspects before concerns
   - End with constructive suggestions, not demands

## OUTPUT FORMAT
Enhance the rule-based response provided, making it more natural and specific to the scenario data. Keep the same structure:
- Initial Reaction (2-3 sentences)
- What They Would Appreciate (2-4 bullet points with specific numbers from data)
- Key Concerns (2-4 bullet points, professionally worded)
- Questions They Would Ask (3-5 specific questions)
- Advice for Engagement (2-3 suggestions)`;
}

function buildUserPrompt(
  scenario: ScenarioInput,
  stakeholder: StakeholderProfile,
  ruleBasedResponse: StakeholderResponse
): string {
  return `Scenario Summary:
- Country: ${scenario.metadata.country}
- Scenario: ${scenario.metadata.scenarioName}

Key Metrics:
- Renewable capacity 2040: ${scenario.supply.capacity.solarPV[2040] + scenario.supply.capacity.wind[2040]} MW
- Total investment: $${scenario.supply.investment.cumulative[2050]} million
- Emissions 2050: ${scenario.supply.emissions[2050]} Mt CO2

Stakeholder: ${stakeholder.name}

Rule-based response (enhance this):
${JSON.stringify(ruleBasedResponse, null, 2)}

Enhance this response to be more natural and conversational while maintaining professional tone.`;
}

function parseAIResponse(
  aiText: string,
  fallback: StakeholderResponse
): StakeholderResponse {
  // Parse AI response - if parsing fails, return fallback
  try {
    // Simple parsing - could be more sophisticated
    const enhanced = { ...fallback };

    // Extract sections using regex or simple string matching
    // This is a simplified example
    const sections = aiText.split('##');

    for (const section of sections) {
      if (section.includes('Initial Reaction')) {
        enhanced.initialReaction = section.replace('Initial Reaction', '').trim();
      }
      // Parse other sections similarly
    }

    return enhanced;
  } catch (error) {
    return fallback;
  }
}
```

---

## Adjustment Calculator (Soft Metrics Only)

### Purpose

Help users explore how changes to scenario parameters might affect stakeholder sentiment. **NOT for technical analysis.**

### Calculation Logic

```typescript
// src/utils/calculator.ts

export function calculateDirectionalImpacts(
  baseScenario: ScenarioInput,
  baseDerivedMetrics: DerivedMetrics,
  adjustments: AdjustableParameters
): DirectionalImpacts {

  const reShareChange2040 = adjustments.renewableShareTarget2040 -
    calculateBaseREShare(baseScenario, 2040);

  return {
    jobs: {
      direction: reShareChange2040 > 0 ? 'increase' : reShareChange2040 < 0 ? 'decrease' : 'unchanged',
      magnitude: Math.abs(reShareChange2040) > 20 ? 'significant' : 'moderate',
      explanation: 'Solar and wind have higher job factors per MW than fossil fuels'
    },

    landUse: {
      direction: reShareChange2040 > 0 ? 'increase' : 'decrease',
      magnitude: Math.abs(reShareChange2040) > 20 ? 'significant' : 'moderate',
      explanation: 'Solar PV requires approximately 2 hectares per MW'
    },

    emissions: {
      direction: reShareChange2040 > 0 ? 'decrease' : 'increase',
      magnitude: Math.abs(reShareChange2040) > 20 ? 'significant' : 'moderate',
      explanation: 'Replacing fossil generation reduces CO2 emissions'
    },

    stakeholderSentiment: calculateSentimentChanges(
      baseScenario,
      adjustments,
      stakeholderProfiles
    )
  };
}

function calculateBaseREShare(scenario: ScenarioInput, year: number): number {
  const renewable = (scenario.supply.capacity.solarPV[year] || 0) +
                    (scenario.supply.capacity.wind[year] || 0) +
                    (scenario.supply.capacity.hydro[year] || 0) +
                    (scenario.supply.capacity.geothermal[year] || 0) +
                    (scenario.supply.capacity.biomass[year] || 0);

  const total = renewable +
                (scenario.supply.capacity.gas[year] || 0) +
                (scenario.supply.capacity.coal[year] || 0) +
                (scenario.supply.capacity.diesel[year] || 0) +
                (scenario.supply.capacity.hfo[year] || 0);

  return total > 0 ? (renewable / total) * 100 : 0;
}

// Sentiment calculation
function calculateSentimentChanges(
  baseScenario: ScenarioInput,
  adjustments: AdjustableParameters,
  stakeholders: StakeholderProfile[]
): Record<string, SentimentChange> {

  const changes: Record<string, SentimentChange> = {};

  for (const stakeholder of stakeholders) {
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    // CSOs like higher RE
    if (stakeholder.id === 'csos-ngos') {
      if (adjustments.renewableShareTarget2040 > 70) {
        positiveFactors.push('Ambitious renewable target');
      }
      if (adjustments.coalPhaseoutYear && adjustments.coalPhaseoutYear < 2040) {
        positiveFactors.push('Early coal phase-out');
      }
    }

    // Finance cautious about higher investment
    if (stakeholder.id === 'finance') {
      if (adjustments.investmentLevel === 'high') {
        negativeFactors.push('Higher investment requirements');
      }
    }

    // Communities concerned about land
    if (stakeholder.id === 'public') {
      if (adjustments.renewableShareTarget2040 > 60) {
        negativeFactors.push('Increased land requirements');
        positiveFactors.push('More local jobs');
      }
    }

    // Determine overall sentiment
    const net = positiveFactors.length - negativeFactors.length;
    changes[stakeholder.id] = {
      direction: net > 0 ? 'more_positive' : net < 0 ? 'more_negative' : 'unchanged',
      positiveFactors,
      negativeFactors
    };
  }

  return changes;
}
```

### Required Disclaimer

```typescript
const CALCULATOR_DISCLAIMER = `
⚠️ DIRECTIONAL INDICATORS ONLY

This calculator shows how changes might affect stakeholder sentiment.
It does NOT:
• Calculate technical feasibility
• Replace optimization model outputs
• Provide cost estimates

ALWAYS verify scenario changes in the full model before presenting to stakeholders.
`;
```

---

## Soft Metrics Calculations

Reference implementations for job, land use, and emission calculations.

```typescript
// src/utils/calculations.ts

export function calculateJobs(scenario: ScenarioInput): JobMetrics {
  const constructionJobs: Record<number, number> = {};
  const operationsJobs: Record<number, number> = {};

  for (const year of scenario.milestoneYears) {
    let construction = 0;
    let operations = 0;

    for (const [tech, capacity] of Object.entries(scenario.supply.capacity)) {
      const capacityMW = capacity[year] || 0;
      const prevCapacityMW = capacity[year - 5] || 0;
      const newCapacityMW = Math.max(0, capacityMW - prevCapacityMW);

      construction += newCapacityMW * (JOB_FACTORS.construction[tech] || 0);
      operations += capacityMW * (JOB_FACTORS.operations[tech] || 0);
    }

    constructionJobs[year] = Math.round(construction);
    operationsJobs[year] = Math.round(operations);
  }

  return { construction: constructionJobs, operations: operationsJobs };
}

export function calculateLandUse(scenario: ScenarioInput): LandUseMetrics {
  const landUse: Record<number, number> = {};

  for (const year of scenario.milestoneYears) {
    let totalHectares = 0;

    // Only calculate for technologies with significant land footprint
    const solarMW = scenario.supply.capacity.solarPV[year] || 0;
    const windMW = scenario.supply.capacity.wind[year] || 0;
    const batteryMW = scenario.supply.capacity.battery[year] || 0;

    totalHectares += solarMW * LAND_FACTORS.solarPV;
    totalHectares += windMW * LAND_FACTORS.wind;
    totalHectares += batteryMW * LAND_FACTORS.battery;

    landUse[year] = Math.round(totalHectares);
  }

  return { totalLandUse: landUse };
}

export function calculateEmissions(scenario: ScenarioInput): EmissionMetrics {
  // Emissions are typically provided by the optimization model
  // This function validates and formats them

  const emissions = scenario.supply.emissions;
  const baselineYear = Math.min(...scenario.milestoneYears);
  const baseline = emissions[baselineYear] || 0;

  const reductionPercent: Record<number, number> = {};
  for (const year of scenario.milestoneYears) {
    const currentEmissions = emissions[year] || 0;
    reductionPercent[year] = baseline > 0
      ? ((baseline - currentEmissions) / baseline) * 100
      : 0;
  }

  return {
    absolute: emissions,
    reductionPercent
  };
}
```

---

## Testing Guidelines

### Testing Offline Functionality

```typescript
// tests/e2e/offline.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Offline functionality', () => {
  test('should generate responses when offline', async ({ page, context }) => {
    // Load the app
    await page.goto('http://localhost:5173');

    // Wait for service worker to install
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Load scenario
    await page.click('[data-testid="load-example"]');

    // Select stakeholder
    await page.click('[data-testid="stakeholder-grid-operators"]');

    // Enter prediction
    await page.fill('[data-testid="prediction-input"]', 'I think they will be concerned about renewable integration');

    // Reveal response
    await page.click('[data-testid="reveal-response"]');

    // Check response appears
    await expect(page.locator('[data-testid="stakeholder-response"]')).toBeVisible();

    // Verify it's rule-based
    await expect(page.locator('[data-testid="response-type"]')).toHaveText('rule-based');
  });
});
```

### Testing AI Failover

```typescript
test('should failover to rule-based when AI fails', async ({ page }) => {
  // Mock API to fail
  await page.route('https://api.anthropic.com/**', route => route.abort());

  await page.goto('http://localhost:5173');

  // ... generate response ...

  // Should still work with rule-based
  await expect(page.locator('[data-testid="stakeholder-response"]')).toBeVisible();
  await expect(page.locator('[data-testid="response-type"]')).toHaveText('rule-based');
});
```

---

## Performance Optimization

### Response Generation Performance

Target: < 200ms for rule-based responses

```typescript
// Optimization techniques:

// 1. Pre-calculate derived metrics once
const derivedMetrics = useMemo(() =>
  calculateDerivedMetrics(scenario),
  [scenario]
);

// 2. Memoize stakeholder responses
const response = useMemo(() =>
  generateRuleBasedResponse(scenario, derivedMetrics, stakeholder),
  [scenario, derivedMetrics, stakeholder.id]
);

// 3. Lazy load stakeholder profiles
const stakeholderProfiles = lazy(() => import('./data/stakeholder-profiles'));
```

### Bundle Size Optimization

- Keep stakeholder profiles in separate chunk
- Lazy load AI enhancement code
- Use code splitting for calculator

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'stakeholders': ['./src/data/stakeholder-profiles.ts'],
          'ai': ['./src/utils/stakeholder-ai.ts'],
          'calculator': ['./src/utils/calculator.ts']
        }
      }
    }
  }
});
```
