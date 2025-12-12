// Scenario Data Schema - Simplified Flexible Version
// Based on SIMPLIFIED-SCHEMA-DESIGN.md

import { PowerUnit, EnergyUnit, MoneyUnit, EmissionsUnit } from '../utils/unit-conversions';

// Technology aggregations (simplified from 14 individual technologies)
export interface TechnologyMix {
  renewables: number;    // All RE combined (hydro, solar, wind, geothermal, biomass)
  fossil: number;        // All fossil combined (coal, gas, diesel, HFO)
  storage?: number;      // Batteries + pump storage (optional)
  other?: number;        // Nuclear + interconnectors (optional)
}

// Flexible value with unit
export interface FlexibleValue<U = string> {
  value: number;
  unit: U;
}

// Core scenario data for ONE milestone year
export interface MilestoneData {
  year: number;

  // ========================================
  // REQUIRED FIELDS (7 core indicators)
  // ========================================

  // 1. Installed Capacity
  capacity: {
    total: TechnologyMix;
    unit: PowerUnit;
  };

  // 2. Annual Generation
  generation: {
    output: TechnologyMix;
    unit: EnergyUnit;
  };

  // 3. RE Share (auto-calculated or provided)
  reShare: number;  // Percentage (0-100)

  // 4. Total Investment
  investment: {
    cumulative: number;  // Total investment to this year
    unit: MoneyUnit;
  };

  // 5. Emissions
  emissions: {
    total: number;
    unit: EmissionsUnit;
  };

  // 6. Peak Demand
  peakDemand: {
    value: number;
    unit: PowerUnit;
  };

  // ========================================
  // OPTIONAL ADVANCED FIELDS (3 indicators)
  // ========================================

  // 7. Capacity Additions (for deployment pace analysis)
  capacityAdditions?: {
    additions: TechnologyMix;
    unit: PowerUnit;
  };

  // 8. Annual O&M Costs
  annualOMCosts?: {
    value: number;
    unit: MoneyUnit;
  };

  // 9. RE Curtailment (wasted renewable energy)
  curtailment?: {
    value: number;
    unit: EnergyUnit;
  };

  // 10. Interconnector Imports
  imports?: {
    value: number;
    unit: EnergyUnit;
  };
}

// Complete scenario input structure
export interface ScenarioInput {
  metadata: {
    country: string;
    scenarioName: string;
    modelVersion: string;      // "SPLAT", "MESSAGE", "OSeMOSYS", "LEAP", "Quick Entry"
    dateCreated: string;
    sourceFile?: string;        // Original filename if uploaded
  };

  // Array of milestone years (flexible - can be 2-10 milestones)
  milestones: MilestoneData[];

  // Optional: Detailed technology breakdown for advanced users
  // This allows preserving granular data from SPLAT without requiring it
  detailedTech?: {
    [year: number]: {
      hydro?: number;
      solarPV?: number;
      solarCSP?: number;
      wind?: number;
      geothermal?: number;
      biomass?: number;
      coal?: number;
      gas?: number;
      diesel?: number;
      hfo?: number;
      nuclear?: number;
      battery?: number;
      pumpStorage?: number;
      interconnector?: number;
    };
  };
}

// Quick Entry Form - Simplified to match new schema
export interface QuickScenarioInput {
  country: string;
  scenarioName: string;

  // User can add any number of milestones
  milestones: {
    year: number;

    // Capacity (with flexible units)
    renewablesCapacity: number;
    fossilCapacity: number;
    storageCapacity?: number;
    capacityUnit: PowerUnit;

    // Generation (with flexible units)
    renewablesGeneration: number;
    fossilGeneration: number;
    generationUnit: EnergyUnit;

    // Investment & costs
    cumulativeInvestment: number;
    investmentUnit: MoneyUnit;
    annualOMCost?: number;

    // Emissions & demand
    emissions: number;
    emissionsUnit: EmissionsUnit;
    peakDemand: number;
    peakDemandUnit: PowerUnit;

    // Optional advanced
    renewablesAdditions?: number;
    fossilAdditions?: number;
    curtailment?: number;
    imports?: number;
  }[];
}

// Technology type definitions (kept for compatibility)
export type RenewableTech = 'hydro' | 'solarPV' | 'solarCSP' | 'wind' | 'geothermal' | 'biomass';
export type FossilTech = 'coal' | 'naturalGas' | 'diesel' | 'hfo';
export type StorageTech = 'battery' | 'pumpStorage';
export type AllTech = RenewableTech | FossilTech | StorageTech | 'nuclear' | 'interconnector';

// Helper functions for working with scenarios

/**
 * Calculate RE share from generation data
 */
export function calculateREShare(generation: TechnologyMix): number {
  const total = generation.renewables + generation.fossil + (generation.other || 0);
  if (total === 0) return 0;
  return (generation.renewables / total) * 100;
}

/**
 * Get milestone years from scenario
 */
export function getMilestoneYears(scenario: ScenarioInput): number[] {
  return scenario.milestones.map(m => m.year);
}

/**
 * Get data for specific year
 */
export function getMilestoneData(scenario: ScenarioInput, year: number): MilestoneData | undefined {
  return scenario.milestones.find(m => m.year === year);
}

/**
 * Check if scenario has advanced fields populated
 */
export function hasAdvancedData(scenario: ScenarioInput): boolean {
  return scenario.milestones.some(m =>
    m.capacityAdditions !== undefined ||
    m.annualOMCosts !== undefined ||
    m.curtailment !== undefined ||
    m.imports !== undefined
  );
}

/**
 * Derive capacity additions from total capacity changes (if not provided)
 */
export function deriveCapacityAdditions(scenario: ScenarioInput): ScenarioInput {
  const updated = { ...scenario };

  for (let i = 1; i < updated.milestones.length; i++) {
    const current = updated.milestones[i];
    const previous = updated.milestones[i - 1];

    if (!current.capacityAdditions) {
      const yearDiff = current.year - previous.year;

      current.capacityAdditions = {
        additions: {
          renewables: Math.max(0, (current.capacity.total.renewables - previous.capacity.total.renewables) / yearDiff),
          fossil: Math.max(0, (current.capacity.total.fossil - previous.capacity.total.fossil) / yearDiff),
          storage: current.capacity.total.storage && previous.capacity.total.storage
            ? Math.max(0, (current.capacity.total.storage - previous.capacity.total.storage) / yearDiff)
            : undefined,
          other: current.capacity.total.other && previous.capacity.total.other
            ? Math.max(0, (current.capacity.total.other - previous.capacity.total.other) / yearDiff)
            : undefined,
        },
        unit: current.capacity.unit,
      };
    }
  }

  return updated;
}

/**
 * Estimate O&M costs if not provided (3% of cumulative investment)
 */
export function estimateOMCosts(scenario: ScenarioInput): ScenarioInput {
  const updated = { ...scenario };

  for (const milestone of updated.milestones) {
    if (!milestone.annualOMCosts) {
      milestone.annualOMCosts = {
        value: milestone.investment.cumulative * 0.03,
        unit: milestone.investment.unit,
      };
    }
  }

  return updated;
}

/**
 * Estimate curtailment based on RE share and storage (if not provided)
 */
export function estimateCurtailment(scenario: ScenarioInput): ScenarioInput {
  const updated = { ...scenario };

  for (const milestone of updated.milestones) {
    if (!milestone.curtailment && milestone.reShare > 50) {
      // Simple heuristic: curtailment increases with RE share, decreases with storage
      const storageRatio = (milestone.capacity.total.storage || 0) /
        (milestone.capacity.total.renewables + milestone.capacity.total.fossil);

      const baseCurtailment = (milestone.reShare - 50) * 2; // 2 GWh per % above 50%
      const storageFactor = Math.max(0.1, 1 - storageRatio * 5); // Storage reduces curtailment

      milestone.curtailment = {
        value: baseCurtailment * storageFactor,
        unit: milestone.generation.unit,
      };
    }
  }

  return updated;
}

/**
 * Validate scenario data
 */
export function validateScenario(scenario: ScenarioInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check metadata
  if (!scenario.metadata.country) errors.push('Country is required');
  if (!scenario.metadata.scenarioName) errors.push('Scenario name is required');

  // Check milestones
  if (scenario.milestones.length === 0) {
    errors.push('At least one milestone year is required');
  }

  // Check each milestone
  scenario.milestones.forEach((m, idx) => {
    if (!m.year || m.year < 2020 || m.year > 2100) {
      errors.push(`Milestone ${idx + 1}: Invalid year ${m.year}`);
    }

    if (m.capacity.total.renewables < 0 || m.capacity.total.fossil < 0) {
      errors.push(`Milestone ${idx + 1}: Capacity cannot be negative`);
    }

    if (m.generation.output.renewables < 0 || m.generation.output.fossil < 0) {
      errors.push(`Milestone ${idx + 1}: Generation cannot be negative`);
    }

    if (m.reShare < 0 || m.reShare > 100) {
      errors.push(`Milestone ${idx + 1}: RE share must be between 0-100%`);
    }

    if (m.investment.cumulative < 0) {
      errors.push(`Milestone ${idx + 1}: Investment cannot be negative`);
    }

    if (m.emissions.total < 0) {
      errors.push(`Milestone ${idx + 1}: Emissions cannot be negative`);
    }
  });

  // Check milestone years are in order
  for (let i = 1; i < scenario.milestones.length; i++) {
    if (scenario.milestones[i].year <= scenario.milestones[i - 1].year) {
      errors.push('Milestone years must be in ascending order');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
