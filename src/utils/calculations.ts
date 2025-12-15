// Derived Metrics Calculations (Soft Metrics ONLY)
// Based on CLAUDE.md and DATA-SCHEMAS.md
// CRITICAL: NO LCOE, tariffs, or technical feasibility calculations

import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';
import { getJobFactor, getLandFactor } from '../data/technology-factors';
import { normalizeCapacity, normalizeGeneration } from './unit-conversions';

/**
 * Estimate technology breakdown from aggregated renewables capacity
 * Uses typical distribution if detailed tech data not available
 */
function estimateRenewableMix(totalRenewablesMW: number): {
  hydro: number;
  solarPV: number;
  wind: number;
  geothermal: number;
  biomass: number;
} {
  // Typical distribution based on global averages
  // Users can override by providing detailedTech data
  return {
    hydro: totalRenewablesMW * 0.40,      // 40% hydro (base load)
    solarPV: totalRenewablesMW * 0.30,    // 30% solar
    wind: totalRenewablesMW * 0.20,       // 20% wind
    geothermal: totalRenewablesMW * 0.05, // 5% geothermal
    biomass: totalRenewablesMW * 0.05     // 5% biomass
  };
}

/**
 * Estimate technology breakdown from aggregated fossil capacity
 */
function estimateFossilMix(totalFossilMW: number): {
  coal: number;
  naturalGas: number;
  diesel: number;
  hfo: number;
} {
  // Typical distribution
  return {
    coal: totalFossilMW * 0.20,       // 20% coal
    naturalGas: totalFossilMW * 0.50, // 50% natural gas (efficient)
    diesel: totalFossilMW * 0.15,     // 15% diesel (peaking)
    hfo: totalFossilMW * 0.15         // 15% HFO (base load)
  };
}

/**
 * Calculate employment impacts (construction and operations)
 * Uses IRENA job factor studies
 */
export function calculateJobs(scenario: ScenarioInput): DerivedMetrics['jobs'] {
  const jobs = {
    construction: {} as Record<number, number>,
    operations: {} as Record<number, number>,
    total: {} as Record<number, number>
  };

  for (const milestone of scenario.milestones) {
    const year = milestone.year;
    let constructionJobs = 0;
    let operationsJobs = 0;

    // Normalize capacity to MW
    const renewablesMW = normalizeCapacity(milestone.capacity.total.renewables, milestone.capacity.unit);
    const fossilMW = normalizeCapacity(milestone.capacity.total.fossil, milestone.capacity.unit);
    const storageMW = normalizeCapacity(milestone.capacity.total.storage || 0, milestone.capacity.unit);
    const otherMW = normalizeCapacity(milestone.capacity.total.other || 0, milestone.capacity.unit);

    // Use detailed tech data if available, otherwise estimate
    const detailedForYear = scenario.detailedTech?.[year];

    if (detailedForYear) {
      // Use actual technology breakdown
      const techList = [
        'hydro', 'solarPV', 'wind', 'geothermal', 'biomass',
        'coal', 'naturalGas', 'diesel', 'hfo',
        'battery', 'nuclear', 'interconnector'
      ] as const;

      for (const tech of techList) {
        const capacityMW = detailedForYear[tech] || 0;
        constructionJobs += capacityMW * getJobFactor(tech, 'construction');
        operationsJobs += capacityMW * getJobFactor(tech, 'operations');
      }
    } else {
      // Estimate from aggregated categories
      const reMix = estimateRenewableMix(renewablesMW);
      const fossilMix = estimateFossilMix(fossilMW);

      // Renewables
      constructionJobs += reMix.hydro * getJobFactor('hydro', 'construction');
      constructionJobs += reMix.solarPV * getJobFactor('solarPV', 'construction');
      constructionJobs += reMix.wind * getJobFactor('wind', 'construction');
      constructionJobs += reMix.geothermal * getJobFactor('geothermal', 'construction');
      constructionJobs += reMix.biomass * getJobFactor('biomass', 'construction');

      operationsJobs += reMix.hydro * getJobFactor('hydro', 'operations');
      operationsJobs += reMix.solarPV * getJobFactor('solarPV', 'operations');
      operationsJobs += reMix.wind * getJobFactor('wind', 'operations');
      operationsJobs += reMix.geothermal * getJobFactor('geothermal', 'operations');
      operationsJobs += reMix.biomass * getJobFactor('biomass', 'operations');

      // Fossil
      constructionJobs += fossilMix.coal * getJobFactor('coal', 'construction');
      constructionJobs += fossilMix.naturalGas * getJobFactor('naturalGas', 'construction');
      constructionJobs += fossilMix.diesel * getJobFactor('diesel', 'construction');
      constructionJobs += fossilMix.hfo * getJobFactor('hfo', 'construction');

      operationsJobs += fossilMix.coal * getJobFactor('coal', 'operations');
      operationsJobs += fossilMix.naturalGas * getJobFactor('naturalGas', 'operations');
      operationsJobs += fossilMix.diesel * getJobFactor('diesel', 'operations');
      operationsJobs += fossilMix.hfo * getJobFactor('hfo', 'operations');

      // Storage (treat all as battery for job factors)
      constructionJobs += storageMW * getJobFactor('battery', 'construction');
      operationsJobs += storageMW * getJobFactor('battery', 'operations');

      // Other (treat as nuclear for conservative estimate)
      constructionJobs += otherMW * getJobFactor('nuclear', 'construction');
      operationsJobs += otherMW * getJobFactor('nuclear', 'operations');
    }

    jobs.construction[year] = Math.round(constructionJobs);
    jobs.operations[year] = Math.round(operationsJobs);
    jobs.total[year] = Math.round(constructionJobs + operationsJobs);
  }

  return jobs;
}

/**
 * Calculate land use requirements
 * Only for solar PV, wind, and battery (other technologies too site-specific)
 */
export function calculateLandUse(scenario: ScenarioInput): DerivedMetrics['landUse'] {
  const landUse = {
    totalNewLand: {} as Record<number, number>,
    byTechnology: {
      solarPV: {} as Record<number, number>,
      wind: {} as Record<number, number>,
      battery: {} as Record<number, number>
    }
  };

  for (const milestone of scenario.milestones) {
    const year = milestone.year;

    // Normalize to MW
    const renewablesMW = normalizeCapacity(milestone.capacity.total.renewables, milestone.capacity.unit);
    const storageMW = normalizeCapacity(milestone.capacity.total.storage || 0, milestone.capacity.unit);

    // Use detailed tech data if available
    const detailedForYear = scenario.detailedTech?.[year];

    let solarMW = 0;
    let windMW = 0;
    let batteryMW = storageMW;

    if (detailedForYear) {
      solarMW = detailedForYear.solarPV || 0;
      windMW = detailedForYear.wind || 0;
      batteryMW = detailedForYear.battery || storageMW;
    } else {
      // Estimate from renewables mix
      const reMix = estimateRenewableMix(renewablesMW);
      solarMW = reMix.solarPV;
      windMW = reMix.wind;
    }

    const solarLand = solarMW * getLandFactor('solarPV');
    const windLand = windMW * getLandFactor('wind');
    const batteryLand = batteryMW * getLandFactor('battery');

    landUse.byTechnology.solarPV[year] = Math.round(solarLand);
    landUse.byTechnology.wind[year] = Math.round(windLand);
    landUse.byTechnology.battery[year] = Math.round(batteryLand);
    landUse.totalNewLand[year] = Math.round(solarLand + windLand + batteryLand);
  }

  return landUse;
}

/**
 * Calculate emissions from fossil fuel combustion
 * Uses emission factors from technology-factors.ts
 * Returns absolute emissions and reduction percentages
 */
export function calculateEmissions(scenario: ScenarioInput): DerivedMetrics['emissions'] {
  const emissions = {
    absolute: {} as Record<number, number>,
    reductionPercent: {} as Record<number, number>
  };

  // Use emissions data directly from milestones (preferred - comes from model)
  for (const milestone of scenario.milestones) {
    const year = milestone.year;

    // Emissions already in Mt CO2 in the milestone data
    emissions.absolute[year] = milestone.emissions.total;
  }

  // Calculate reduction percentage vs baseline (first milestone)
  const baselineYear = scenario.milestones[0].year;
  const baselineEmissions = emissions.absolute[baselineYear] || 0;

  for (const milestone of scenario.milestones) {
    const year = milestone.year;
    if (baselineEmissions > 0) {
      const reduction = ((baselineEmissions - emissions.absolute[year]) / baselineEmissions) * 100;
      emissions.reductionPercent[year] = Math.round(reduction * 10) / 10; // Round to 1 decimal
    } else {
      emissions.reductionPercent[year] = 0;
    }
  }

  return emissions;
}

/**
 * Calculate renewable and fossil shares
 */
export function calculateEnergyShares(scenario: ScenarioInput): {
  renewableShare: Record<number, number>;
  fossilShare: Record<number, number>;
} {
  const renewableShare = {} as Record<number, number>;
  const fossilShare = {} as Record<number, number>;

  for (const milestone of scenario.milestones) {
    const year = milestone.year;

    // RE share is already calculated in the milestone
    renewableShare[year] = Math.round(milestone.reShare * 10) / 10; // Round to 1 decimal

    // Calculate fossil share from capacity
    const renewablesMW = normalizeCapacity(milestone.capacity.total.renewables, milestone.capacity.unit);
    const fossilMW = normalizeCapacity(milestone.capacity.total.fossil, milestone.capacity.unit);
    const storageMW = normalizeCapacity(milestone.capacity.total.storage || 0, milestone.capacity.unit);
    const otherMW = normalizeCapacity(milestone.capacity.total.other || 0, milestone.capacity.unit);

    const totalCapacity = renewablesMW + fossilMW + storageMW + otherMW;

    if (totalCapacity > 0) {
      fossilShare[year] = Math.round((fossilMW / totalCapacity) * 1000) / 10;
    } else {
      fossilShare[year] = 0;
    }
  }

  return { renewableShare, fossilShare };
}

/**
 * Calculate capacity metrics
 */
export function calculateCapacityMetrics(scenario: ScenarioInput): DerivedMetrics['capacity'] {
  const capacityMetrics = {
    totalInstalled: {} as Record<number, number>,
    variableRenewableShare: {} as Record<number, number>
  };

  for (const milestone of scenario.milestones) {
    const year = milestone.year;

    // Normalize all to MW
    const renewablesMW = normalizeCapacity(milestone.capacity.total.renewables, milestone.capacity.unit);
    const fossilMW = normalizeCapacity(milestone.capacity.total.fossil, milestone.capacity.unit);
    const storageMW = normalizeCapacity(milestone.capacity.total.storage || 0, milestone.capacity.unit);
    const otherMW = normalizeCapacity(milestone.capacity.total.other || 0, milestone.capacity.unit);

    const totalCapacity = renewablesMW + fossilMW + storageMW + otherMW;
    capacityMetrics.totalInstalled[year] = Math.round(totalCapacity);

    // VRE = solar + wind (estimate from renewables if detailed not available)
    let vreCapacity = 0;
    const detailedForYear = scenario.detailedTech?.[year];

    if (detailedForYear) {
      vreCapacity = (detailedForYear.solarPV || 0) + (detailedForYear.wind || 0);
    } else {
      // Estimate: solar + wind is about 50% of total renewables (typical)
      vreCapacity = renewablesMW * 0.50;
    }

    if (totalCapacity > 0) {
      capacityMetrics.variableRenewableShare[year] = Math.round((vreCapacity / totalCapacity) * 1000) / 10;
    } else {
      capacityMetrics.variableRenewableShare[year] = 0;
    }
  }

  return capacityMetrics;
}

/**
 * Calculate investment metrics
 */
export function calculateInvestmentMetrics(scenario: ScenarioInput): DerivedMetrics['investment'] {
  const investmentMetrics = {
    totalCumulative: {} as Record<number, number>,
    annualPeak: 0,
    averageAnnual: 0
  };

  // Cumulative investment from milestones
  for (const milestone of scenario.milestones) {
    const year = milestone.year;
    investmentMetrics.totalCumulative[year] = milestone.investment.cumulative;
  }

  // Estimate annual peak and average from capacity additions (if available)
  const annualInvestments: number[] = [];

  for (const milestone of scenario.milestones) {
    if (milestone.capacityAdditions) {
      // Rough estimate: assume $1.5M per MW for renewables, $1M for fossil
      const reAdditions = normalizeCapacity(milestone.capacityAdditions.additions.renewables, milestone.capacityAdditions.unit);
      const fossilAdditions = normalizeCapacity(milestone.capacityAdditions.additions.fossil, milestone.capacityAdditions.unit);
      const storageAdditions = normalizeCapacity(milestone.capacityAdditions.additions.storage || 0, milestone.capacityAdditions.unit);

      const annualInv = (reAdditions * 1.5) + (fossilAdditions * 1.0) + (storageAdditions * 2.0);
      annualInvestments.push(annualInv);
    }
  }

  if (annualInvestments.length > 0) {
    investmentMetrics.annualPeak = Math.max(...annualInvestments);
    investmentMetrics.averageAnnual = Math.round(
      annualInvestments.reduce((sum, val) => sum + val, 0) / annualInvestments.length
    );
  }

  return investmentMetrics;
}

/**
 * Main function: Calculate all derived metrics
 * This is the primary export used by the application
 */
export function calculateDerivedMetrics(scenario: ScenarioInput): DerivedMetrics {
  const jobs = calculateJobs(scenario);
  const landUse = calculateLandUse(scenario);
  const emissions = calculateEmissions(scenario);
  const { renewableShare, fossilShare } = calculateEnergyShares(scenario);
  const capacity = calculateCapacityMetrics(scenario);
  const investment = calculateInvestmentMetrics(scenario);

  return {
    renewableShare,
    fossilShare,
    jobs,
    landUse,
    emissions,
    capacity,
    investment
  };
}
