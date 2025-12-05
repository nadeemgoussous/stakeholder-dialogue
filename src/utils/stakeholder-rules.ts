// Rule-Based Stakeholder Response Generator
// Based on TECHNICAL-IMPLEMENTATION.md
// This is the PRIMARY response generation system - works 100% offline

import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';
import type { StakeholderProfile, ResponseTemplate } from '../types/stakeholder';
import type { StakeholderResponse, Concern } from '../types/response';

/**
 * Generate a stakeholder response based solely on rules and data (offline-capable)
 * This MUST work without any network calls
 */
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

  // Select engagement advice (top 3 good practices)
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

/**
 * Generate initial reaction based on concern/appreciation balance
 */
function generateInitialReaction(
  concernCount: number,
  appreciationCount: number,
  stakeholder: StakeholderProfile,
  template: ResponseTemplate | null
): string {
  // Use template if available and matches scenario
  if (template) {
    return template.initialReaction;
  }

  // Calculate ratio of positive to total feedback
  const ratio = appreciationCount / (concernCount + appreciationCount + 1);

  if (ratio > 0.7) {
    return `As a ${stakeholder.name} representative, I see several positive aspects in this scenario that align with our priorities.`;
  } else if (ratio > 0.4) {
    return `This scenario has both strengths and areas that warrant further discussion from our perspective.`;
  } else {
    return `We have some important questions and concerns about this scenario that we would like to discuss.`;
  }
}

/**
 * Get metric value from scenario or derived metrics using dot notation path
 * Examples: 'investment.cumulative.2030', 'renewableShare.2040', 'jobs.total.2030'
 */
export function getMetricValue(
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  metricPath: string
): number | null {
  // Parse metric path like 'investment.cumulative.2030'
  const parts = metricPath.split('.');

  // Try scenario first
  let value: any = scenario;
  let found = true;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      found = false;
      break;
    }
  }

  // If found in scenario, return it
  if (found && typeof value === 'number') {
    return value;
  }

  // Try derived metrics
  value = derivedMetrics;
  found = true;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      found = false;
      break;
    }
  }

  // Return if found in derived metrics
  if (found && typeof value === 'number') {
    return value;
  }

  return null;
}

/**
 * Replace {value} placeholder with formatted number
 */
function insertValue(text: string, value: number): string {
  return text.replace('{value}', value.toLocaleString());
}

/**
 * Calculate severity based on how much threshold is exceeded
 */
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

/**
 * Find response template that matches scenario conditions
 */
function findMatchingTemplate(
  scenario: ScenarioInput,
  templates: ResponseTemplate[]
): ResponseTemplate | null {
  // Simple condition matching - can be expanded
  for (const template of templates) {
    if (template.condition === 'highInvestment') {
      const totalInvestment = scenario.supply.investment.cumulative[2050];
      if (totalInvestment && totalInvestment > 5000) return template;
    }
    if (template.condition === 'lowInvestment') {
      const totalInvestment = scenario.supply.investment.cumulative[2050];
      if (totalInvestment && totalInvestment < 1000) return template;
    }
    if (template.condition === 'highRenewable') {
      // Would need to calculate RE share from capacity - skip for now
      // Will be available in derived metrics
    }
    if (template.condition === 'highFossil') {
      // Similar - would use derived metrics
    }
  }
  return null;
}

/**
 * Select 3-5 most relevant questions based on scenario and concerns
 */
function selectRelevantQuestions(
  allQuestions: string[],
  scenario: ScenarioInput,
  concerns: Concern[]
): string[] {
  const selected: string[] = [];

  // Add questions related to top concerns first
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

/**
 * Find a question related to a specific metric
 */
function findRelatedQuestion(metric: string, questions: string[]): string | null {
  // Map metrics to question keywords
  const keywords: Record<string, string[]> = {
    'investment': ['financing', 'investment', 'cost', 'funding'],
    'emissions': ['emissions', 'climate', 'carbon', 'CO2'],
    'jobs': ['jobs', 'employment', 'workforce', 'labor'],
    'renewableShare': ['renewable', 'RE', 'VRE', 'solar', 'wind'],
    'battery': ['storage', 'battery', 'flexibility', 'backup'],
    'landUse': ['land', 'space', 'area', 'footprint'],
    'capacity': ['capacity', 'MW', 'installed'],
    'generation': ['generation', 'GWh', 'production', 'output']
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
