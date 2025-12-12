// Conversion utility for Quick Entry Form to Full Scenario Schema
// Updated to support new schema with capacity additions, detailed costs, curtailment, etc.

import { ScenarioInput, QuickScenarioInput as QuickInput } from '../types/scenario';

/**
 * Converts simplified Quick Entry input into full ScenarioInput format
 * Handles new schema structure including:
 * - capacity.total and capacity.additions
 * - generation.output
 * - detailed cost breakdown
 * - curtailment
 * - solarCSP and pumpStorage
 */
export function convertQuickEntryToFullScenario(quick: QuickInput): ScenarioInput {
  // Distribute renewable capacity into technology categories
  const solarPV2030 = Math.round(quick.renewableCapacity2030 * 0.4);
  const wind2030 = Math.round(quick.renewableCapacity2030 * 0.3);
  const hydro2030 = Math.round(quick.renewableCapacity2030 * 0.3);

  const solarPV2040 = Math.round(quick.renewableCapacity2040 * 0.4);
  const wind2040 = Math.round(quick.renewableCapacity2040 * 0.3);
  const hydro2040 = Math.round(quick.renewableCapacity2040 * 0.3);

  // Distribute fossil capacity
  const gas2030 = Math.round(quick.fossilCapacity2030 * 0.6);
  const diesel2030 = Math.round(quick.fossilCapacity2030 * 0.3);
  const hfo2030 = Math.round(quick.fossilCapacity2030 * 0.1);

  const gas2040 = Math.round(quick.fossilCapacity2040 * 0.6);
  const diesel2040 = Math.round(quick.fossilCapacity2040 * 0.3);
  const hfo2040 = Math.round(quick.fossilCapacity2040 * 0.1);

  // Calculate 2025 (starting point - 70% of 2030)
  const solarPV2025 = Math.round(solarPV2030 * 0.7);
  const wind2025 = Math.round(wind2030 * 0.7);
  const hydro2025 = Math.round(hydro2030 * 0.9); // Hydro grows slower
  const gas2025 = Math.round(gas2030 * 0.8);
  const diesel2025 = Math.round(diesel2030 * 0.9);
  const hfo2025 = Math.round(hfo2030 * 0.9);
  const battery2025 = Math.round(quick.batteryCapacity2030 * 0.3);

  // Calculate 2050 (endpoint - extrapolate from 2040)
  const solarPV2050 = Math.round(solarPV2040 * 1.5);
  const wind2050 = Math.round(wind2040 * 1.5);
  const hydro2050 = Math.round(hydro2040 * 1.2);
  const gas2050 = Math.round(gas2040 * 0.6); // Phasing out
  const diesel2050 = Math.round(diesel2040 * 0.3);
  const hfo2050 = Math.round(hfo2040 * 0.2);
  const battery2050 = Math.round(quick.batteryCapacity2040 * 1.8);

  // Calculate annual additions (NEW - critical for construction jobs)
  // Simplified: evenly distributed between milestone years
  const addHydro = (year: number) => {
    if (year === 2025) return Math.max(1, Math.round((hydro2025 - 0) / 5));
    if (year === 2030) return Math.max(1, Math.round((hydro2030 - hydro2025) / 5));
    if (year === 2040) return Math.max(1, Math.round((hydro2040 - hydro2030) / 10));
    return Math.max(1, Math.round((hydro2050 - hydro2040) / 10));
  };

  const addSolarPV = (year: number) => {
    if (year === 2025) return Math.max(1, Math.round((solarPV2025 - 0) / 5));
    if (year === 2030) return Math.max(1, Math.round((solarPV2030 - solarPV2025) / 5));
    if (year === 2040) return Math.max(1, Math.round((solarPV2040 - solarPV2030) / 10));
    return Math.max(1, Math.round((solarPV2050 - solarPV2040) / 10));
  };

  const addWind = (year: number) => {
    if (year === 2025) return Math.max(0, Math.round((wind2025 - 0) / 5));
    if (year === 2030) return Math.max(1, Math.round((wind2030 - wind2025) / 5));
    if (year === 2040) return Math.max(1, Math.round((wind2040 - wind2030) / 10));
    return Math.max(1, Math.round((wind2050 - wind2040) / 10));
  };

  const addBattery = (year: number) => {
    if (year === 2025) return Math.max(0, Math.round((battery2025 - 0) / 5));
    if (year === 2030) return Math.max(1, Math.round((quick.batteryCapacity2030 - battery2025) / 5));
    if (year === 2040) return Math.max(1, Math.round((quick.batteryCapacity2040 - quick.batteryCapacity2030) / 10));
    return Math.max(1, Math.round((battery2050 - quick.batteryCapacity2040) / 10));
  };

  const addGas = (year: number) => {
    if (year === 2025) return Math.max(0, Math.round((gas2025 - 0) / 5));
    if (year === 2030) return Math.max(1, Math.round((gas2030 - gas2025) / 5));
    if (year === 2040) return Math.max(0, Math.round((gas2040 - gas2030) / 10));
    return Math.max(0, Math.round((gas2050 - gas2040) / 10));
  };

  // Estimate costs
  // If user provided annualOperatingCost2030, use it; otherwise estimate
  const omCost2030 = quick.annualOperatingCost2030 || Math.round(quick.totalInvestment2030 * 0.03);
  const omCost2050 = Math.round(omCost2030 * 1.5);

  // Split lumpsum investment evenly between years (simplified)
  const invest2025 = Math.round(quick.totalInvestment2030 * 0.2);
  const invest2030 = Math.round(quick.totalInvestment2030 * 0.25);
  const invest2040 = Math.round((quick.totalInvestment2050 - quick.totalInvestment2030) * 0.3);
  const invest2050 = Math.round((quick.totalInvestment2050 - quick.totalInvestment2030) * 0.25);

  // Estimate curtailment based on RE share
  const reShare2030 = (solarPV2030 + wind2030 + hydro2030) / (solarPV2030 + wind2030 + hydro2030 + gas2030 + diesel2030 + hfo2030);
  const reShare2040 = (solarPV2040 + wind2040 + hydro2040) / (solarPV2040 + wind2040 + hydro2040 + gas2040 + diesel2040 + hfo2040);

  const curtail2030 = quick.reCurtailment2030 !== undefined ? quick.reCurtailment2030 : (reShare2030 > 0.5 ? Math.round(reShare2030 * 50) : 0);
  const curtail2040 = quick.reCurtailment2040 !== undefined ? quick.reCurtailment2040 : (reShare2040 > 0.6 ? Math.round(reShare2040 * 80) : 0);

  return {
    metadata: {
      country: quick.country,
      scenarioName: quick.scenarioName,
      modelVersion: 'Quick Entry',
      dateCreated: new Date().toISOString(),
    },
    milestoneYears: [2025, 2030, 2040, 2050],
    supply: {
      capacity: {
        total: {
          hydro: { 2025: hydro2025, 2030: hydro2030, 2040: hydro2040, 2050: hydro2050 },
          solarPV: { 2025: solarPV2025, 2030: solarPV2030, 2040: solarPV2040, 2050: solarPV2050 },
          solarCSP: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 }, // Not used in quick entry
          wind: { 2025: wind2025, 2030: wind2030, 2040: wind2040, 2050: wind2050 },
          battery: { 2025: battery2025, 2030: quick.batteryCapacity2030, 2040: quick.batteryCapacity2040, 2050: battery2050 },
          pumpStorage: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 }, // Not used in quick entry
          geothermal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          biomass: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          coal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          diesel: { 2025: diesel2025, 2030: diesel2030, 2040: diesel2040, 2050: diesel2050 },
          hfo: { 2025: hfo2025, 2030: hfo2030, 2040: hfo2040, 2050: hfo2050 },
          naturalGas: { 2025: gas2025, 2030: gas2030, 2040: gas2040, 2050: gas2050 },
          nuclear: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          interconnector: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
        },
        additions: {
          hydro: { 2025: addHydro(2025), 2030: addHydro(2030), 2040: addHydro(2040), 2050: addHydro(2050) },
          solarPV: { 2025: addSolarPV(2025), 2030: addSolarPV(2030), 2040: addSolarPV(2040), 2050: addSolarPV(2050) },
          solarCSP: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          wind: { 2025: addWind(2025), 2030: addWind(2030), 2040: addWind(2040), 2050: addWind(2050) },
          battery: { 2025: addBattery(2025), 2030: addBattery(2030), 2040: addBattery(2040), 2050: addBattery(2050) },
          pumpStorage: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          geothermal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          biomass: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          coal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          diesel: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          hfo: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          naturalGas: { 2025: addGas(2025), 2030: addGas(2030), 2040: addGas(2040), 2050: addGas(2050) },
          nuclear: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          interconnector: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
        },
      },
      generation: {
        output: {
          hydro: { 2025: hydro2025 * 4000, 2030: hydro2030 * 4000, 2040: hydro2040 * 4000, 2050: hydro2050 * 4000 },
          solarPV: { 2025: solarPV2025 * 1800, 2030: solarPV2030 * 1800, 2040: solarPV2040 * 1800, 2050: solarPV2050 * 1800 },
          solarCSP: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          wind: { 2025: wind2025 * 2800, 2030: wind2030 * 2800, 2040: wind2040 * 2800, 2050: wind2050 * 2800 },
          battery: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 }, // Storage doesn't generate
          pumpStorage: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          geothermal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          biomass: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          coal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          diesel: { 2025: diesel2025 * 3500, 2030: diesel2030 * 3500, 2040: diesel2040 * 3500, 2050: diesel2050 * 3500 },
          hfo: { 2025: hfo2025 * 3500, 2030: hfo2030 * 3500, 2040: hfo2040 * 3500, 2050: hfo2050 * 3500 },
          naturalGas: { 2025: gas2025 * 4500, 2030: gas2030 * 4500, 2040: gas2040 * 4500, 2050: gas2050 * 4500 },
          nuclear: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
          imports: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
        },
      },
      emissions: {
        total: {
          2025: quick.emissions2025,
          2030: quick.emissions2030,
          2040: Math.round((quick.emissions2030 + quick.emissions2050) / 2), // Interpolate
          2050: quick.emissions2050,
        },
      },
      curtailment: {
        2025: 0,
        2030: curtail2030,
        2040: curtail2040,
        2050: Math.round(curtail2040 * 1.2),
      },
      costs: {
        investmentLumpsum: {
          2025: invest2025,
          2030: invest2030,
          2040: invest2040,
          2050: invest2050,
        },
        investmentAnnualized: {
          2025: Math.round(invest2025 * 0.08),
          2030: Math.round(invest2030 * 0.08),
          2040: Math.round(invest2040 * 0.08),
          2050: Math.round(invest2050 * 0.08),
        },
        fixedOM: {
          2025: Math.round(omCost2030 * 0.6),
          2030: omCost2030,
          2040: Math.round((omCost2030 + omCost2050) / 2),
          2050: omCost2050,
        },
        variableOM: {
          2025: Math.round(omCost2030 * 0.3),
          2030: Math.round(omCost2030 * 0.5),
          2040: Math.round(omCost2050 * 0.5),
          2050: Math.round(omCost2050 * 0.6),
        },
        fuel: {
          2025: Math.round((gas2025 + diesel2025 + hfo2025) * 0.5),
          2030: Math.round((gas2030 + diesel2030 + hfo2030) * 0.6),
          2040: Math.round((gas2040 + diesel2040 + hfo2040) * 0.7),
          2050: Math.round((gas2050 + diesel2050 + hfo2050) * 0.8),
        },
        cumulativeInvestment: {
          2025: invest2025,
          2030: quick.totalInvestment2030,
          2040: Math.round(quick.totalInvestment2030 + (quick.totalInvestment2050 - quick.totalInvestment2030) * 0.6),
          2050: quick.totalInvestment2050,
        },
      },
    },
    demand: {
      total: {
        2025: Math.round(quick.peakDemand2030 * 4500),
        2030: Math.round(quick.peakDemand2030 * 5000),
        2040: Math.round(quick.peakDemand2040 * 5000),
        2050: Math.round(quick.peakDemand2040 * 5500),
      },
      peak: {
        2025: Math.round(quick.peakDemand2030 * 0.9),
        2030: quick.peakDemand2030,
        2040: quick.peakDemand2040,
        2050: Math.round(quick.peakDemand2040 * 1.15),
      },
      bySector: {
        residential: {
          2025: Math.round(quick.peakDemand2030 * 4500 * 0.30),
          2030: Math.round(quick.peakDemand2030 * 5000 * 0.30),
          2040: Math.round(quick.peakDemand2040 * 5000 * 0.28),
          2050: Math.round(quick.peakDemand2040 * 5500 * 0.27),
        },
        commercial: {
          2025: Math.round(quick.peakDemand2030 * 4500 * 0.25),
          2030: Math.round(quick.peakDemand2030 * 5000 * 0.26),
          2040: Math.round(quick.peakDemand2040 * 5000 * 0.27),
          2050: Math.round(quick.peakDemand2040 * 5500 * 0.28),
        },
        industrial: {
          2025: Math.round(quick.peakDemand2030 * 4500 * 0.35),
          2030: Math.round(quick.peakDemand2030 * 5000 * 0.33),
          2040: Math.round(quick.peakDemand2040 * 5000 * 0.32),
          2050: Math.round(quick.peakDemand2040 * 5500 * 0.30),
        },
        transport: {
          2025: Math.round(quick.peakDemand2030 * 4500 * 0.10),
          2030: Math.round(quick.peakDemand2030 * 5000 * 0.11),
          2040: Math.round(quick.peakDemand2040 * 5000 * 0.13),
          2050: Math.round(quick.peakDemand2040 * 5500 * 0.15),
        },
      },
    },
  };
}
