// Rule-Based Stakeholder Response Generator
// Based on TECHNICAL-IMPLEMENTATION.md
// This is the PRIMARY response generation system - works 100% offline

import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';
import type {
  StakeholderProfile,
  ResponseTemplate,
  DevelopmentContext,
  StakeholderVariant,
  InteractionTrigger
} from '../types/stakeholder';
import type { StakeholderResponse, Concern } from '../types/response';
import {
  evaluateInteractionTriggers,
  applyContextModifiers,
  applyVariantModifiers,
  contextProfiles,
  policyMakersVariants,
  gridOperatorsVariants,
  industryVariants,
  publicVariants,
  csosNgosVariants,
  scientificVariants,
  financeVariants,
  regionalBodiesVariants,
  developmentPartnersVariants,
} from '../data/stakeholder-enhancements';

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
  // Get final milestone for long-term investment check
  const finalMilestone = scenario.milestones[scenario.milestones.length - 1];
  if (!finalMilestone) return null;

  // Simple condition matching - can be expanded
  for (const template of templates) {
    if (template.condition === 'highInvestment') {
      const totalInvestment = finalMilestone.investment.cumulative;
      if (totalInvestment && totalInvestment > 5000) return template;
    }
    if (template.condition === 'lowInvestment') {
      const totalInvestment = finalMilestone.investment.cumulative;
      if (totalInvestment && totalInvestment < 1000) return template;
    }
    if (template.condition === 'highRenewable') {
      // Use RE share from milestone
      if (finalMilestone.reShare > 70) return template;
    }
    if (template.condition === 'highFossil') {
      // Use RE share to infer fossil dependence
      if (finalMilestone.reShare < 30) return template;
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

// ============================================================================
// ENHANCED RESPONSE GENERATION
// Uses interaction triggers, context profiles, and variant personalities
// ============================================================================

export interface EnhancedResponseOptions {
  context?: DevelopmentContext;
  variant?: StakeholderVariant;
  includeInteractionTriggers?: boolean;
}

/**
 * Generate enhanced stakeholder response with context awareness and variants
 * Falls back to standard generation if enhanced features not available
 */
export function generateEnhancedResponse(
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics,
  stakeholder: StakeholderProfile,
  options: EnhancedResponseOptions = {}
): StakeholderResponse {
  const {
    context = 'emerging',
    variant = 'pragmatic',
    includeInteractionTriggers = true
  } = options;

  console.log('[Enhanced] Starting enhanced response generation');
  console.log(`[Enhanced] Context: ${context}, Variant: ${variant}`);

  // Start with base rule-based response
  const baseResponse = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);
  console.log('[Enhanced] Base response generated');

  // If no enhanced features requested, return base response
  if (!includeInteractionTriggers) {
    console.log('[Enhanced] Interaction triggers disabled, returning base response');
    return baseResponse;
  }

  try {
    // Build scenario indicators for interaction trigger evaluation
    const indicators = buildScenarioIndicators(scenario, derivedMetrics);
    console.log(`[Enhanced] Built ${Object.keys(indicators).length} indicators from scenario data`);

    // Evaluate interaction triggers with context-aware thresholds
    const triggeredInteractions = evaluateInteractionTriggers(
      stakeholder.id,
      indicators,
      context
    );

    console.log(`[Enhanced] Triggered interactions: ${triggeredInteractions.length}`);
    if (triggeredInteractions.length > 0) {
      console.log('[Enhanced] Triggered:', triggeredInteractions.map(t => t.id).join(', '));
    }

    // Enhance concerns with interaction trigger insights
    const enhancedConcerns = enhanceConcernsWithInteractions(
      baseResponse.concerns,
      triggeredInteractions
    );

    console.log(`[Enhanced] Total concerns: ${enhancedConcerns.length} (base: ${baseResponse.concerns.length}, added: ${enhancedConcerns.length - baseResponse.concerns.length})`);

    // Enhance initial reaction with variant tone
    const enhancedReaction = enhanceReactionWithVariant(
      baseResponse.initialReaction,
      stakeholder.id,
      variant,
      triggeredInteractions
    );

    console.log(`[Enhanced] Base reaction: "${baseResponse.initialReaction.slice(0, 60)}..."`);
    console.log(`[Enhanced] Enhanced reaction: "${enhancedReaction.slice(0, 60)}..."`);

    // Add context-specific appreciation points
    let enhancedAppreciation = enhanceAppreciationWithContext(
      baseResponse.appreciation,
      context,
      indicators
    );

    // Add appreciation from positive interaction triggers
    enhancedAppreciation = enhanceAppreciationWithInteractions(
      enhancedAppreciation,
      triggeredInteractions
    );

    console.log(`[Enhanced] Total appreciation: ${enhancedAppreciation.length} (base: ${baseResponse.appreciation.length})`);
    console.log('[Enhanced] Response enhancement complete');

    return {
      ...baseResponse,
      initialReaction: enhancedReaction,
      appreciation: enhancedAppreciation,
      concerns: enhancedConcerns,
      generationType: 'enhanced-rule-based',
      metadata: {
        context,
        variant,
        interactionTriggersCount: triggeredInteractions.length
      }
    };
  } catch (error) {
    console.error('[Enhanced] Error during enhancement, falling back to base response:', error);
    return {
      ...baseResponse,
      generationType: 'rule-based',
      metadata: {
        context,
        variant,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Build flat indicator object for interaction trigger evaluation
 * Updated for simplified milestone-based schema
 */
function buildScenarioIndicators(
  scenario: ScenarioInput,
  derivedMetrics: DerivedMetrics
): Record<string, number> {
  const indicators: Record<string, number> = {};

  // Loop through each milestone and add indicators
  for (const milestone of scenario.milestones) {
    const year = milestone.year;

    // Add renewable share (from milestone or derived metrics)
    indicators[`renewableShare.${year}`] = milestone.reShare;

    // Add emissions data
    indicators[`emissions.${year}`] = milestone.emissions.total;

    // Add emissions reduction percent (from derived metrics)
    if (derivedMetrics.emissions?.reductionPercent?.[year]) {
      indicators[`emissions.reductionPercent${year}`] = derivedMetrics.emissions.reductionPercent[year];
    }

    // Add investment data
    indicators[`investment.cumulative.${year}`] = milestone.investment.cumulative;

    // Add capacity data for aggregated categories
    indicators[`supply.capacity.renewables.${year}`] = milestone.capacity.total.renewables;
    indicators[`supply.capacity.fossil.${year}`] = milestone.capacity.total.fossil;
    if (milestone.capacity.total.storage !== undefined) {
      indicators[`supply.capacity.battery.${year}`] = milestone.capacity.total.storage;
      indicators[`supply.capacity.storage.${year}`] = milestone.capacity.total.storage;
    }
    if (milestone.capacity.total.other !== undefined) {
      indicators[`supply.capacity.other.${year}`] = milestone.capacity.total.other;
    }

    // Add total capacity
    const totalCapacity = milestone.capacity.total.renewables +
                          milestone.capacity.total.fossil +
                          (milestone.capacity.total.storage || 0) +
                          (milestone.capacity.total.other || 0);
    indicators[`supply.capacity.total.${year}`] = totalCapacity;

    // Add generation data
    indicators[`supply.generation.renewables.${year}`] = milestone.generation.output.renewables;
    indicators[`supply.generation.fossil.${year}`] = milestone.generation.output.fossil;

    // Add peak demand
    indicators[`demand.peak.${year}`] = milestone.peakDemand.value;

    // Add optional advanced fields if present
    if (milestone.capacityAdditions) {
      indicators[`capacityAdditions.renewables.${year}`] = milestone.capacityAdditions.additions.renewables;
      indicators[`capacityAdditions.fossil.${year}`] = milestone.capacityAdditions.additions.fossil;
    }

    if (milestone.curtailment) {
      indicators[`curtailment.${year}`] = milestone.curtailment.value;
    }

    if (milestone.annualOMCosts) {
      indicators[`om.annual.${year}`] = milestone.annualOMCosts.value;
    }

    if (milestone.imports) {
      indicators[`imports.${year}`] = milestone.imports.value;
    }
  }

  // Add jobs data from derived metrics (still calculated externally)
  if (derivedMetrics.jobs) {
    if (derivedMetrics.jobs.total) {
      for (const [year, value] of Object.entries(derivedMetrics.jobs.total)) {
        indicators[`jobs.total.${year}`] = value;
      }
    }
    if (derivedMetrics.jobs.construction) {
      for (const [year, value] of Object.entries(derivedMetrics.jobs.construction)) {
        indicators[`jobs.construction.${year}`] = value;
      }
    }
    if (derivedMetrics.jobs.operations) {
      for (const [year, value] of Object.entries(derivedMetrics.jobs.operations)) {
        indicators[`jobs.operations.${year}`] = value;
      }
    }
  }

  // Add land use data from derived metrics (still calculated externally)
  if (derivedMetrics.landUse?.totalNewLand) {
    for (const [year, value] of Object.entries(derivedMetrics.landUse.totalNewLand)) {
      indicators[`land.total.${year}`] = value;
    }
  }

  return indicators;
}

/**
 * Enhance concerns by incorporating interaction trigger insights
 * Only adds triggers marked as type: 'concern'
 */
function enhanceConcernsWithInteractions(
  baseConcerns: Concern[],
  interactions: InteractionTrigger[]
): Concern[] {
  const enhanced = [...baseConcerns];

  // Add concerns from interaction triggers (filter for concerns only)
  for (const interaction of interactions) {
    // Skip appreciation triggers - they go to appreciation array
    if (interaction.type === 'appreciation') {
      continue;
    }

    // Check if similar concern already exists
    const exists = enhanced.some(c =>
      c.text.toLowerCase().includes(interaction.concernText.toLowerCase().slice(0, 30))
    );

    if (!exists) {
      enhanced.push({
        text: interaction.concernText,
        explanation: `${interaction.explanation} ${interaction.suggestedResponse}`,
        metric: interaction.id,
        severity: 'medium'
      });
    }
  }

  return enhanced;
}

/**
 * Enhance appreciation by incorporating positive interaction trigger insights
 * Only adds triggers marked as type: 'appreciation'
 */
function enhanceAppreciationWithInteractions(
  baseAppreciation: string[],
  interactions: InteractionTrigger[]
): string[] {
  const enhanced = [...baseAppreciation];

  // Add appreciation from interaction triggers (filter for appreciation only)
  for (const interaction of interactions) {
    // Skip concern triggers - they go to concerns array
    if (interaction.type === 'concern') {
      continue;
    }

    // Check if similar appreciation already exists
    const exists = enhanced.some(a =>
      a.toLowerCase().includes(interaction.concernText.toLowerCase().slice(0, 30))
    );

    if (!exists) {
      enhanced.push(interaction.concernText);
    }
  }

  return enhanced;
}

/**
 * Enhance initial reaction based on variant tone
 */
function enhanceReactionWithVariant(
  baseReaction: string,
  stakeholderId: string,
  variant: StakeholderVariant,
  interactions: InteractionTrigger[]
): string {
  // Map stakeholder IDs to their variant profiles
  const variantMap: Record<string, Record<StakeholderVariant, any>> = {
    'policy-makers': policyMakersVariants,
    'grid-operators': gridOperatorsVariants,
    'industry': industryVariants,
    'public': publicVariants,
    'csos-ngos': csosNgosVariants,
    'scientific': scientificVariants,
    'finance': financeVariants,
    'regional-bodies': regionalBodiesVariants,
    'development-partners': developmentPartnersVariants,
  };

  const variantProfile = variantMap[stakeholderId]?.[variant];

  if (!variantProfile) {
    console.warn(`[Enhanced] No variant profile found for ${stakeholderId}/${variant}`);
    return baseReaction;
  }

  // Prepend variant framing preference to base reaction
  return `${variantProfile.framingPreference} ${baseReaction}`;
}

/**
 * Enhance appreciation with context-specific insights
 */
function enhanceAppreciationWithContext(
  baseAppreciation: string[],
  context: DevelopmentContext,
  indicators: Record<string, number>
): string[] {
  const enhanced = [...baseAppreciation];

  // Add context-specific praise for ambitious goals
  if (context === 'least-developed') {
    const reShare2030 = indicators['renewableShare.2030'];
    if (reShare2030 && reShare2030 > 35) {
      enhanced.push('Ambitious renewable targets despite development challenges');
    }
  } else if (context === 'developed') {
    const emissions2030 = indicators['emissions.reductionPercent2030'];
    if (emissions2030 && emissions2030 > 40) {
      enhanced.push('Climate leadership with aggressive decarbonization timeline');
    }
  }

  return enhanced;
}

/**
 * Get context profile description for UI display
 */
export function getContextDescription(context: DevelopmentContext): string {
  const profile = contextProfiles.find(p => p.id === context);
  return profile?.description || '';
}
