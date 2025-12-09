/**
 * Sentiment Change Calculator for Scenario Adjustments
 *
 * Calculates how each stakeholder's sentiment changes when scenario parameters
 * are adjusted in the Explore Impacts tab.
 *
 * This is DIRECTIONAL ONLY - used to help users anticipate stakeholder reactions,
 * not to perform precise sentiment analysis.
 */

export interface AdjustmentState {
  reShare2030: number;    // % renewable energy share in 2030
  reShare2040: number;    // % renewable energy share in 2040
  coalPhaseout: number;   // Year of coal phaseout
}

export interface SentimentChange {
  stakeholderId: string;
  stakeholderName: string;
  direction: 'positive' | 'negative' | 'neutral'; // ↗ ↘ →
  magnitude: 'minor' | 'moderate' | 'significant'; // How much change
  positiveFactors: string[]; // What they like about the changes
  negativeFactors: string[]; // What concerns them
  netScore: number; // Internal score for determining direction (-10 to +10)
}

/**
 * Calculate sentiment changes for all stakeholders
 */
export function calculateSentimentChanges(
  baseValues: AdjustmentState,
  adjustedValues: AdjustmentState
): SentimentChange[] {
  const stakeholders = [
    'policy-makers',
    'grid-operators',
    'industry',
    'public',
    'csos-ngos',
    'scientific',
    'finance',
    'regional-bodies',
    'development-partners'
  ];

  return stakeholders.map(id => calculateStakeholderSentiment(id, baseValues, adjustedValues));
}

/**
 * Calculate sentiment change for a single stakeholder
 */
function calculateStakeholderSentiment(
  stakeholderId: string,
  base: AdjustmentState,
  adjusted: AdjustmentState
): SentimentChange {
  const deltas = {
    reShare2030: adjusted.reShare2030 - base.reShare2030,
    reShare2040: adjusted.reShare2040 - base.reShare2040,
    coalPhaseout: adjusted.coalPhaseout - base.coalPhaseout, // Positive = later phaseout
  };

  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  let netScore = 0;

  // Calculate sentiment based on stakeholder-specific priorities
  switch (stakeholderId) {
    case 'policy-makers':
      netScore += evaluatePolicyMakers(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'grid-operators':
      netScore += evaluateGridOperators(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'industry':
      netScore += evaluateIndustry(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'public':
      netScore += evaluatePublic(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'csos-ngos':
      netScore += evaluateCSOsNGOs(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'scientific':
      netScore += evaluateScientific(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'finance':
      netScore += evaluateFinance(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'regional-bodies':
      netScore += evaluateRegionalBodies(deltas, positiveFactors, negativeFactors, adjusted);
      break;
    case 'development-partners':
      netScore += evaluateDevelopmentPartners(deltas, positiveFactors, negativeFactors, adjusted);
      break;
  }

  // Determine direction and magnitude based on net score
  let direction: 'positive' | 'negative' | 'neutral';
  let magnitude: 'minor' | 'moderate' | 'significant';

  if (netScore > 1) {
    direction = 'positive';
    magnitude = netScore >= 5 ? 'significant' : netScore >= 3 ? 'moderate' : 'minor';
  } else if (netScore < -1) {
    direction = 'negative';
    magnitude = netScore <= -5 ? 'significant' : netScore <= -3 ? 'moderate' : 'minor';
  } else {
    direction = 'neutral';
    magnitude = 'minor';
  }

  return {
    stakeholderId,
    stakeholderName: getStakeholderName(stakeholderId),
    direction,
    magnitude,
    positiveFactors,
    negativeFactors,
    netScore
  };
}

/**
 * Policy Makers: Balance climate goals with feasibility concerns
 */
function evaluatePolicyMakers(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = positive (climate goals)
  if (deltas.reShare2030 > 10) {
    positive.push('Stronger climate action in 2030');
    score += 2;
  } else if (deltas.reShare2030 > 5) {
    positive.push('Improved renewable energy targets');
    score += 1;
  }

  if (deltas.reShare2040 > 10) {
    positive.push('Ambitious long-term decarbonization');
    score += 2;
  }

  // Earlier coal phaseout = positive (climate commitments)
  if (deltas.coalPhaseout < -5) {
    positive.push('Earlier coal phaseout strengthens NDC compliance');
    score += 3;
  } else if (deltas.coalPhaseout < 0) {
    positive.push('Accelerated transition away from coal');
    score += 1;
  }

  // Later coal phaseout = negative
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed coal phaseout may conflict with climate commitments');
    score -= 2;
  }

  // Very high RE share = concern about feasibility
  if (adjusted.reShare2030 > 70) {
    negative.push('Very high renewable targets may raise feasibility questions');
    score -= 1;
  }

  // Lower RE = negative
  if (deltas.reShare2030 < -10) {
    negative.push('Reduced renewable ambition weakens climate position');
    score -= 3;
  }

  return score;
}

/**
 * Grid Operators: Concerned about reliability and rapid changes
 */
function evaluateGridOperators(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Moderate RE increase = okay, rapid increase = concern
  if (deltas.reShare2030 > 15 || deltas.reShare2040 > 20) {
    negative.push('Rapid renewable integration may strain grid management');
    score -= 3;
  } else if (deltas.reShare2030 > 5) {
    negative.push('Faster renewable deployment requires grid upgrades');
    score -= 1;
  }

  // Earlier coal phaseout = concern about baseload
  if (deltas.coalPhaseout < -5) {
    negative.push('Earlier coal retirement raises baseload adequacy concerns');
    score -= 2;
  }

  // Later coal phaseout = positive (more time to prepare)
  if (deltas.coalPhaseout > 5) {
    positive.push('More time to develop grid flexibility solutions');
    score += 2;
  }

  // Gradual transition = positive
  if (Math.abs(deltas.reShare2030) <= 5 && Math.abs(deltas.reShare2040) <= 10) {
    positive.push('Gradual transition allows for proper grid preparation');
    score += 1;
  }

  // Very high RE = major concern
  if (adjusted.reShare2040 > 80) {
    negative.push('Very high VRE penetration requires extensive storage/flexibility');
    score -= 2;
  }

  return score;
}

/**
 * Industry: Want reliable, affordable power
 */
function evaluateIndustry(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = mixed (new opportunities but also concerns)
  if (deltas.reShare2030 > 10) {
    positive.push('New opportunities in renewable energy supply chain');
    score += 1;
    negative.push('Concerns about power reliability during transition');
    score -= 1;
  }

  // Earlier coal phaseout = negative (power costs)
  if (deltas.coalPhaseout < -5) {
    negative.push('Rapid coal exit may increase power costs');
    score -= 2;
  } else if (deltas.coalPhaseout < 0) {
    negative.push('Accelerated transition could affect industrial tariffs');
    score -= 1;
  }

  // Later coal phaseout = positive (maintains cheap power longer)
  if (deltas.coalPhaseout > 5) {
    positive.push('Extended coal operation maintains affordable baseload');
    score += 1;
  }

  // Moderate RE growth = positive (local manufacturing)
  if (deltas.reShare2040 > 5 && deltas.reShare2040 < 20) {
    positive.push('Steady renewable growth supports local manufacturing');
    score += 2;
  }

  return score;
}

/**
 * Public: Care about clean air, affordability, jobs
 */
function evaluatePublic(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = positive (clean air)
  if (deltas.reShare2030 > 10) {
    positive.push('More renewable energy means cleaner air and health benefits');
    score += 2;
  } else if (deltas.reShare2030 > 5) {
    positive.push('Improved air quality from more clean energy');
    score += 1;
  }

  // Earlier coal phaseout = very positive (health)
  if (deltas.coalPhaseout < -5) {
    positive.push('Earlier coal phaseout reduces air pollution sooner');
    score += 3;
  } else if (deltas.coalPhaseout < 0) {
    positive.push('Faster transition to clean energy benefits public health');
    score += 1;
  }

  // Later coal phaseout = negative
  if (deltas.coalPhaseout > 5) {
    negative.push('Continued coal use prolongs air pollution impacts');
    score -= 2;
  }

  // Lower RE = negative
  if (deltas.reShare2030 < -10) {
    negative.push('Less renewable energy means worse air quality');
    score -= 2;
  }

  // Rapid changes = slight concern about tariffs
  if (Math.abs(deltas.reShare2030) > 20) {
    negative.push('Very rapid changes may affect electricity prices');
    score -= 1;
  }

  return score;
}

/**
 * CSOs/NGOs: Strong climate advocacy, want rapid transition
 */
function evaluateCSOsNGOs(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = very positive
  if (deltas.reShare2030 > 15) {
    positive.push('Major acceleration toward 100% renewable energy');
    score += 4;
  } else if (deltas.reShare2030 > 5) {
    positive.push('Increased renewable targets show climate leadership');
    score += 2;
  }

  if (deltas.reShare2040 > 10) {
    positive.push('Ambitious 2040 targets align with Paris Agreement');
    score += 2;
  }

  // Earlier coal phaseout = extremely positive
  if (deltas.coalPhaseout < -10) {
    positive.push('Rapid coal phaseout demonstrates climate urgency');
    score += 5;
  } else if (deltas.coalPhaseout < -5) {
    positive.push('Accelerated coal exit critical for climate goals');
    score += 3;
  } else if (deltas.coalPhaseout < 0) {
    positive.push('Earlier coal retirement aligns with science-based targets');
    score += 1;
  }

  // Later coal phaseout = very negative
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed coal phaseout incompatible with 1.5°C pathway');
    score -= 5;
  } else if (deltas.coalPhaseout > 0) {
    negative.push('Any delay in coal exit undermines climate commitments');
    score -= 2;
  }

  // Lower RE = very negative
  if (deltas.reShare2030 < -5) {
    negative.push('Reduced renewable ambition is unacceptable for climate action');
    score -= 4;
  }

  return score;
}

/**
 * Scientific Institutions: Want evidence-based, technically feasible plans
 */
function evaluateScientific(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = positive if feasible
  if (deltas.reShare2030 > 10 && adjusted.reShare2030 < 60) {
    positive.push('Accelerated renewable deployment aligns with climate science');
    score += 2;
  } else if (deltas.reShare2030 > 10 && adjusted.reShare2030 >= 60) {
    negative.push('Very rapid renewable integration needs careful technical validation');
    score -= 1;
  }

  // Earlier coal phaseout = positive for emissions
  if (deltas.coalPhaseout < -5) {
    positive.push('Earlier coal phaseout reduces cumulative emissions');
    score += 2;
  }

  // Later coal phaseout = concern about carbon budget
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed coal exit consumes remaining carbon budget');
    score -= 2;
  }

  // Very high RE = technical feasibility questions
  if (adjusted.reShare2040 > 85) {
    negative.push('Near-100% VRE requires rigorous technical feasibility assessment');
    score -= 2;
  }

  // Balanced approach = positive
  if (Math.abs(deltas.reShare2030) <= 10 && deltas.coalPhaseout <= 0) {
    positive.push('Balanced approach allows for evidence-based implementation');
    score += 1;
  }

  return score;
}

/**
 * Financial Institutions: Concerned about bankability and risk
 */
function evaluateFinance(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = mixed (opportunities but also risk)
  if (deltas.reShare2030 > 15) {
    negative.push('Very rapid renewable scale-up increases execution risk');
    score -= 2;
    positive.push('Large-scale renewable investment opportunities');
    score += 1;
  } else if (deltas.reShare2030 > 5) {
    positive.push('Growing renewable market offers attractive returns');
    score += 2;
  }

  // Earlier coal phaseout = concern about stranded assets
  if (deltas.coalPhaseout < -5) {
    negative.push('Early coal retirement risks stranded assets');
    score -= 3;
  } else if (deltas.coalPhaseout < 0) {
    negative.push('Accelerated coal phaseout affects asset valuations');
    score -= 1;
  }

  // Later coal phaseout = concern about transition risk
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed transition increases long-term policy risk');
    score -= 1;
  }

  // Gradual, predictable transition = positive
  if (Math.abs(deltas.reShare2030) <= 10 && Math.abs(deltas.coalPhaseout) <= 5) {
    positive.push('Gradual transition provides investment certainty');
    score += 2;
  }

  return score;
}

/**
 * Regional Bodies: Care about regional cooperation and interconnection
 */
function evaluateRegionalBodies(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = positive (regional trade opportunities)
  if (deltas.reShare2030 > 10) {
    positive.push('Increased renewables create regional power trade opportunities');
    score += 2;
  }

  if (deltas.reShare2040 > 15) {
    positive.push('High renewable ambition supports regional integration goals');
    score += 2;
  }

  // Earlier coal phaseout = positive (regional climate leadership)
  if (deltas.coalPhaseout < -5) {
    positive.push('Early coal phaseout sets positive example for region');
    score += 2;
  }

  // Later coal phaseout = slight negative
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed transition may lag behind regional peers');
    score -= 1;
  }

  // Very high RE = need for interconnection
  if (adjusted.reShare2040 > 70) {
    positive.push('High VRE share increases value of regional interconnection');
    negative.push('Success depends on regional coordination and grid integration');
    // Net neutral on score
  }

  return score;
}

/**
 * Development Partners: Support climate action but concerned about debt
 */
function evaluateDevelopmentPartners(
  deltas: any,
  positive: string[],
  negative: string[],
  adjusted: AdjustmentState
): number {
  let score = 0;

  // Higher RE = positive (climate finance)
  if (deltas.reShare2030 > 10) {
    positive.push('Strong renewable targets unlock climate finance opportunities');
    score += 2;
  }

  if (deltas.reShare2040 > 15) {
    positive.push('Ambitious long-term decarbonization aligns with SDGs');
    score += 2;
  }

  // Earlier coal phaseout = positive (climate goals)
  if (deltas.coalPhaseout < -5) {
    positive.push('Early coal phaseout strengthens case for concessional financing');
    score += 3;
  } else if (deltas.coalPhaseout < 0) {
    positive.push('Accelerated transition attracts international support');
    score += 1;
  }

  // Later coal phaseout = negative
  if (deltas.coalPhaseout > 5) {
    negative.push('Delayed coal exit may limit access to climate funds');
    score -= 2;
  }

  // Very rapid changes = debt sustainability concern
  if (deltas.reShare2030 > 20) {
    negative.push('Very rapid scale-up requires careful debt sustainability analysis');
    score -= 2;
  }

  // Lower RE = negative
  if (deltas.reShare2030 < -10) {
    negative.push('Reduced ambition may not qualify for concessional climate finance');
    score -= 2;
  }

  return score;
}

/**
 * Get stakeholder display name from ID
 */
function getStakeholderName(id: string): string {
  const names: Record<string, string> = {
    'policy-makers': 'Policy Makers & Regulators',
    'grid-operators': 'Grid Operators',
    'industry': 'Industry & Business',
    'public': 'Public & Communities',
    'csos-ngos': 'CSOs & NGOs',
    'scientific': 'Scientific Institutions',
    'finance': 'Financial Institutions',
    'regional-bodies': 'Regional Bodies',
    'development-partners': 'Development Partners'
  };
  return names[id] || id;
}
