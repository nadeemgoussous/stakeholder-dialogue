// Derived Metrics Calculations (Soft Metrics ONLY)
// Based on CLAUDE.md and DATA-SCHEMAS.md
// CRITICAL: NO LCOE, tariffs, or technical feasibility calculations

import type { ScenarioInput } from '../types/scenario';
import type { DerivedMetrics } from '../types/derived-metrics';
import { getJobFactor, getLandFactor, getEmissionFactor } from '../data/technology-factors';

/**
 * Calculate employment impacts (construction and operations)
 * Uses IRENA job factor studies
 */
export function calculateJobs(scenario: ScenarioInput): DerivedMetrics['jobs'] {
  const { capacity } = scenario.supply;
  const { milestoneYears } = scenario;

  const jobs = {
    construction: {} as Record<number, number>,
    operations: {} as Record<number, number>,
    total: {} as Record<number, number>
  };

  for (const year of milestoneYears) {
    let constructionJobs = 0;
    let operationsJobs = 0;

    // Calculate construction jobs from NEW capacity in this year
    // For simplicity, we assume all capacity in year X was built leading up to year X
    const technologies = [
      'hydro', 'solarPV', 'wind', 'battery', 'geothermal', 'biomass',
      'coal', 'diesel', 'hfo', 'naturalGas', 'nuclear', 'interconnector'
    ] as const;

    for (const tech of technologies) {
      const capacityMW = capacity[tech]?.[year] || 0;

      // Construction jobs (job-years per MW)
      constructionJobs += capacityMW * getJobFactor(tech, 'construction');

      // Operations jobs (permanent jobs per MW)
      operationsJobs += capacityMW * getJobFactor(tech, 'operations');
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
  const { capacity } = scenario.supply;
  const { milestoneYears } = scenario;

  const landUse = {
    totalNewLand: {} as Record<number, number>,
    byTechnology: {
      solarPV: {} as Record<number, number>,
      wind: {} as Record<number, number>,
      battery: {} as Record<number, number>
    }
  };

  for (const year of milestoneYears) {
    const solarMW = capacity.solarPV?.[year] || 0;
    const windMW = capacity.wind?.[year] || 0;
    const batteryMW = capacity.battery?.[year] || 0;

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
  const { generation, emissions: scenarioEmissions } = scenario.supply;
  const { milestoneYears } = scenario;

  const emissions = {
    absolute: {} as Record<number, number>,
    reductionPercent: {} as Record<number, number>
  };

  // If the scenario provides emissions directly, use those (preferred)
  if (scenarioEmissions && Object.keys(scenarioEmissions).length > 0) {
    for (const year of milestoneYears) {
      emissions.absolute[year] = scenarioEmissions[year] || 0;
    }
  } else {
    // Otherwise estimate from generation using emission factors
    for (const year of milestoneYears) {
      let totalEmissions = 0;

      const fossilTechs = ['coal', 'naturalGas', 'gas', 'diesel', 'hfo'];
      for (const tech of fossilTechs) {
        const generationGWh = generation[tech]?.[year] || 0;
        const emissionFactor = getEmissionFactor(tech);
        totalEmissions += (generationGWh * emissionFactor) / 1000; // Convert tCO2 to Mt CO2
      }

      emissions.absolute[year] = Math.round(totalEmissions * 100) / 100; // Round to 2 decimals
    }
  }

  // Calculate reduction percentage vs baseline (first year)
  const baselineYear = milestoneYears[0];
  const baselineEmissions = emissions.absolute[baselineYear] || 0;

  for (const year of milestoneYears) {
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
  const { capacity } = scenario.supply;
  const { milestoneYears } = scenario;

  const renewableShare = {} as Record<number, number>;
  const fossilShare = {} as Record<number, number>;

  const renewableTechs = ['hydro', 'solarPV', 'wind', 'geothermal', 'biomass'];
  const fossilTechs = ['coal', 'naturalGas', 'diesel', 'hfo'];

  for (const year of milestoneYears) {
    let totalRenewable = 0;
    let totalFossil = 0;
    let totalCapacity = 0;

    // Sum renewable capacity
    for (const tech of renewableTechs) {
      const cap = capacity[tech as keyof typeof capacity]?.[year] || 0;
      totalRenewable += cap;
      totalCapacity += cap;
    }

    // Sum fossil capacity
    for (const tech of fossilTechs) {
      const cap = capacity[tech as keyof typeof capacity]?.[year] || 0;
      totalFossil += cap;
      totalCapacity += cap;
    }

    // Also include other technologies in total
    totalCapacity += capacity.battery?.[year] || 0;
    totalCapacity += capacity.nuclear?.[year] || 0;
    totalCapacity += capacity.interconnector?.[year] || 0;

    if (totalCapacity > 0) {
      renewableShare[year] = Math.round((totalRenewable / totalCapacity) * 1000) / 10; // Round to 1 decimal
      fossilShare[year] = Math.round((totalFossil / totalCapacity) * 1000) / 10;
    } else {
      renewableShare[year] = 0;
      fossilShare[year] = 0;
    }
  }

  return { renewableShare, fossilShare };
}

/**
 * Calculate capacity metrics
 */
export function calculateCapacityMetrics(scenario: ScenarioInput): DerivedMetrics['capacity'] {
  const { capacity } = scenario.supply;
  const { milestoneYears } = scenario;

  const capacityMetrics = {
    totalInstalled: {} as Record<number, number>,
    variableRenewableShare: {} as Record<number, number>
  };

  for (const year of milestoneYears) {
    let totalCapacity = 0;
    let vreCapacity = 0;

    const allTechs = [
      'hydro', 'solarPV', 'wind', 'battery', 'geothermal', 'biomass',
      'coal', 'diesel', 'hfo', 'naturalGas', 'nuclear', 'interconnector'
    ] as const;

    for (const tech of allTechs) {
      const cap = capacity[tech]?.[year] || 0;
      totalCapacity += cap;

      // VRE = solar + wind
      if (tech === 'solarPV' || tech === 'wind') {
        vreCapacity += cap;
      }
    }

    capacityMetrics.totalInstalled[year] = Math.round(totalCapacity);

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
  const { investment } = scenario.supply;
  const { milestoneYears } = scenario;

  const investmentMetrics = {
    totalCumulative: {} as Record<number, number>,
    annualPeak: 0,
    averageAnnual: 0
  };

  // Cumulative investment
  for (const year of milestoneYears) {
    investmentMetrics.totalCumulative[year] = investment.cumulative?.[year] || 0;
  }

  // Find annual peak from annual investment data
  const annualInvestments = Object.values(investment.annual || {});
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
