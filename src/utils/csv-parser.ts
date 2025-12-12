// CSV Parser for SPLAT and Generic Energy Model Outputs
// Auto-detects format and aggregates to milestone years

import { ScenarioInput, MilestoneData, calculateREShare } from '../types/scenario';
import { normalizeCapacity, normalizeGeneration, normalizeMoney, normalizeEmissions } from './unit-conversions';

// Technology mapping to our simplified categories
const TECH_MAPPINGS = {
  renewables: [
    /hydro/i,
    /solar/i,
    /wind/i,
    /geothermal/i,
    /biomass/i,
    /^LSHY/i,   // SPLAT hydro codes
    /^LSSO/i,   // SPLAT solar codes
    /^LSWD/i,   // SPLAT wind codes
    /^LSGE/i,   // SPLAT geothermal codes
    /^LSBI/i,   // SPLAT biomass codes
  ],
  fossil: [
    /coal/i,
    /gas/i,
    /diesel/i,
    /hfo/i,
    /oil/i,
    /^LSCL/i,   // SPLAT coal codes
    /^LSNG/i,   // SPLAT natural gas codes
    /^LSDS/i,   // SPLAT diesel codes
  ],
  storage: [
    /battery/i,
    /batt/i,
    /storage/i,
    /pump.*storage/i,
    /TPS/i,     // SPLAT pump storage codes
    /BESS/i,    // Battery energy storage system
  ],
  other: [
    /nuclear/i,
    /interconnect/i,
    /import/i,
    /^LSNU/i,   // SPLAT nuclear codes
    /^LSEL.*i/i, // SPLAT electricity import codes
  ],
};

/**
 * Categorize a technology code/name into our simplified categories
 */
function categorizeTechnology(techName: string): 'renewables' | 'fossil' | 'storage' | 'other' | null {
  techName = techName.trim();

  // Check each category
  for (const [category, patterns] of Object.entries(TECH_MAPPINGS)) {
    if (patterns.some(pattern => pattern.test(techName))) {
      return category as 'renewables' | 'fossil' | 'storage' | 'other';
    }
  }

  // If no match, try to infer from common keywords
  if (techName.toLowerCase().includes('re') || techName.toLowerCase().includes('renewable')) {
    return 'renewables';
  }

  return null; // Unknown technology
}

/**
 * Parse CSV string into rows
 */
function parseCSVString(csvContent: string): string[][] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    // Simple CSV parsing (handles basic comma separation)
    // For production, consider using a library like PapaParse
    const row = line.split(',').map(cell => cell.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Detect if CSV is SPLAT format
 */
function isSPLATFormat(headers: string[]): boolean {
  const requiredColumns = ['Technology', 'Par/Var', 'Year', 'Value'];
  return requiredColumns.every(col =>
    headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
  );
}

/**
 * Parse SPLAT CSV format
 */
function parseSPLATFormat(
  rows: string[][],
  milestoneYears: number[],
  country: string,
  scenarioName: string
): ScenarioInput {
  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Find column indices
  const techIdx = headers.findIndex(h => h.toLowerCase().includes('technology'));
  const descIdx = headers.findIndex(h => h.toLowerCase().includes('tech.description'));
  const parVarIdx = headers.findIndex(h => h.toLowerCase().includes('par/var'));
  const yearIdx = headers.findIndex(h => h.toLowerCase().includes('year'));
  const valueIdx = headers.findIndex(h => h.toLowerCase().includes('value'));
  const unitIdx = headers.findIndex(h => h.toLowerCase().includes('unit'));

  // Data structure to accumulate values
  interface YearData {
    capacity: { renewables: number; fossil: number; storage: number; other: number };
    generation: { renewables: number; fossil: number; other: number };
    capacityAdditions: { renewables: number; fossil: number; storage: number; other: number };
    emissions: number;
    investmentLumpsum: number;
    fixedOM: number;
    variableOM: number;
    fuel: number;
    curtailment: number;
  }

  const yearData: Record<number, YearData> = {};

  // Initialize milestone years
  for (const year of milestoneYears) {
    yearData[year] = {
      capacity: { renewables: 0, fossil: 0, storage: 0, other: 0 },
      generation: { renewables: 0, fossil: 0, other: 0 },
      capacityAdditions: { renewables: 0, fossil: 0, storage: 0, other: 0 },
      emissions: 0,
      investmentLumpsum: 0,
      fixedOM: 0,
      variableOM: 0,
      fuel: 0,
      curtailment: 0,
    };
  }

  // Process each row
  for (const row of dataRows) {
    const year = parseInt(row[yearIdx]);
    if (!milestoneYears.includes(year)) continue; // Skip non-milestone years

    const techCode = row[techIdx];
    const techDesc = descIdx >= 0 ? row[descIdx] : techCode;
    const paramType = row[parVarIdx];
    const value = parseFloat(row[valueIdx]);
    const unit = unitIdx >= 0 ? row[unitIdx] : '';

    if (isNaN(value)) continue;

    const category = categorizeTechnology(techDesc || techCode);
    if (!category) continue;

    const data = yearData[year];

    // Map SPLAT parameters to our fields
    switch (paramType) {
      case 'Total Capacity':
        if (unit.includes('MW')) {
          data.capacity[category] += normalizeCapacity(value, 'MW');
        } else if (unit.includes('GW')) {
          data.capacity[category] += normalizeCapacity(value, 'GW');
        }
        break;

      case 'New Capacity':
        if (unit.includes('MW')) {
          data.capacityAdditions[category] += normalizeCapacity(value, 'MW');
        } else if (unit.includes('GW')) {
          data.capacityAdditions[category] += normalizeCapacity(value, 'GW');
        }
        break;

      case 'Output':
        if (category === 'storage') break; // Storage doesn't generate
        const genCategory = category === 'other' ? 'other' : category;
        if (unit.includes('GWh')) {
          data.generation[genCategory] += normalizeGeneration(value, 'GWh');
        } else if (unit.includes('TWh')) {
          data.generation[genCategory] += normalizeGeneration(value, 'TWh');
        } else if (unit.includes('TJ')) {
          // Convert TJ to GWh (1 TJ = 0.2778 GWh)
          data.generation[genCategory] += value * 0.2778;
        }
        break;

      case 'CO2 Emissions':
        if (unit.includes('Mt')) {
          data.emissions += normalizeEmissions(value, 'Mt CO2');
        } else if (unit.includes('kt')) {
          data.emissions += normalizeEmissions(value, 'kt CO2');
        }
        break;

      case 'Lumpsum Investment Costs':
        if (unit.includes('m$')) {
          data.investmentLumpsum += normalizeMoney(value, 'm$');
        } else if (unit.includes('B$')) {
          data.investmentLumpsum += normalizeMoney(value, 'B$');
        }
        break;

      case 'Fixed O&M Costs':
        if (unit.includes('m$')) {
          data.fixedOM += normalizeMoney(value, 'm$');
        }
        break;

      case 'Variable Costs':
        if (unit.includes('m$')) {
          data.variableOM += normalizeMoney(value, 'm$');
        }
        break;

      case 'Fuel Costs':
        if (unit.includes('m$')) {
          data.fuel += normalizeMoney(value, 'm$');
        }
        break;

      case 'RE Curtailment':
        if (unit.includes('GWh')) {
          data.curtailment += normalizeGeneration(value, 'GWh');
        }
        break;
    }
  }

  // Build scenario milestones
  const milestones: MilestoneData[] = [];
  let cumulativeInvestment = 0;

  for (const year of milestoneYears.sort((a, b) => a - b)) {
    const data = yearData[year];

    // Calculate cumulative investment
    cumulativeInvestment += data.investmentLumpsum;

    // Calculate RE share
    const reShare = calculateREShare(data.generation);

    // Estimate peak demand (rough heuristic: total generation / 5000 hours)
    const totalGeneration = data.generation.renewables + data.generation.fossil + data.generation.other;
    const peakDemand = totalGeneration / 5000;

    milestones.push({
      year,
      capacity: {
        total: data.capacity,
        unit: 'MW',
      },
      generation: {
        output: data.generation,
        unit: 'GWh',
      },
      reShare,
      investment: {
        cumulative: cumulativeInvestment,
        unit: 'm$',
      },
      emissions: {
        total: data.emissions,
        unit: 'Mt CO2',
      },
      peakDemand: {
        value: peakDemand,
        unit: 'MW',
      },
      capacityAdditions: {
        additions: data.capacityAdditions,
        unit: 'MW',
      },
      annualOMCosts: {
        value: data.fixedOM + data.variableOM,
        unit: 'm$',
      },
      curtailment: data.curtailment > 0 ? {
        value: data.curtailment,
        unit: 'GWh',
      } : undefined,
    });
  }

  return {
    metadata: {
      country,
      scenarioName,
      modelVersion: 'SPLAT',
      dateCreated: new Date().toISOString(),
    },
    milestones,
  };
}

/**
 * Parse generic CSV format (flexible column names)
 */
function parseGenericFormat(
  rows: string[][],
  milestoneYears: number[],
  country: string,
  scenarioName: string
): ScenarioInput {
  const headers = rows[0].map(h => h.toLowerCase());
  const dataRows = rows.slice(1);

  // Try to find relevant columns
  const yearIdx = headers.findIndex(h => h.includes('year'));
  const techIdx = headers.findIndex(h => h.includes('tech') || h.includes('fuel'));
  const capacityIdx = headers.findIndex(h => h.includes('capacity') && !h.includes('addition'));
  const generationIdx = headers.findIndex(h => h.includes('generation') || h.includes('output'));
  const emissionsIdx = headers.findIndex(h => h.includes('emission') || h.includes('co2'));
  const investmentIdx = headers.findIndex(h => h.includes('investment') || h.includes('cost'));

  if (yearIdx === -1) {
    throw new Error('Could not find Year column in CSV');
  }

  // Build milestones (simplified - assumes data is already aggregated)
  const yearDataMap: Record<number, any> = {};

  for (const year of milestoneYears) {
    yearDataMap[year] = {
      capacity: { renewables: 0, fossil: 0, storage: 0, other: 0 },
      generation: { renewables: 0, fossil: 0, other: 0 },
      emissions: 0,
      investment: 0,
    };
  }

  for (const row of dataRows) {
    const year = parseInt(row[yearIdx]);
    if (!milestoneYears.includes(year)) continue;

    const tech = techIdx >= 0 ? row[techIdx] : 'unknown';
    const category = categorizeTechnology(tech);
    if (!category) continue;

    const data = yearDataMap[year];

    if (capacityIdx >= 0) {
      const capacity = parseFloat(row[capacityIdx]);
      if (!isNaN(capacity)) {
        data.capacity[category] += capacity;
      }
    }

    if (generationIdx >= 0) {
      const generation = parseFloat(row[generationIdx]);
      if (!isNaN(generation) && category !== 'storage') {
        const genCategory = category === 'other' ? 'other' : category;
        data.generation[genCategory] += generation;
      }
    }

    if (emissionsIdx >= 0) {
      const emissions = parseFloat(row[emissionsIdx]);
      if (!isNaN(emissions)) {
        data.emissions += emissions;
      }
    }

    if (investmentIdx >= 0) {
      const investment = parseFloat(row[investmentIdx]);
      if (!isNaN(investment)) {
        data.investment += investment;
      }
    }
  }

  // Build scenario
  const milestones: MilestoneData[] = [];
  let cumulativeInvestment = 0;

  for (const year of milestoneYears.sort((a, b) => a - b)) {
    const data = yearDataMap[year];
    cumulativeInvestment += data.investment;

    const reShare = calculateREShare(data.generation);
    const totalGeneration = data.generation.renewables + data.generation.fossil + data.generation.other;
    const peakDemand = totalGeneration / 5000;

    milestones.push({
      year,
      capacity: { total: data.capacity, unit: 'MW' },
      generation: { output: data.generation, unit: 'GWh' },
      reShare,
      investment: { cumulative: cumulativeInvestment, unit: 'm$' },
      emissions: { total: data.emissions, unit: 'Mt CO2' },
      peakDemand: { value: peakDemand, unit: 'MW' },
    });
  }

  return {
    metadata: {
      country,
      scenarioName,
      modelVersion: 'Generic CSV',
      dateCreated: new Date().toISOString(),
    },
    milestones,
  };
}

/**
 * Main CSV parsing function
 * Auto-detects format and parses accordingly
 */
export async function parseCSV(
  file: File,
  milestoneYears: number[],
  country: string,
  scenarioName: string
): Promise<ScenarioInput> {
  // Read file content
  const content = await file.text();
  const rows = parseCSVString(content);

  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = rows[0];

  // Detect format
  const isSPLAT = isSPLATFormat(headers);

  console.log(`Detected format: ${isSPLAT ? 'SPLAT' : 'Generic'}`);
  console.log(`Processing ${rows.length - 1} rows for ${milestoneYears.length} milestone years`);

  if (isSPLAT) {
    return parseSPLATFormat(rows, milestoneYears, country, scenarioName);
  } else {
    return parseGenericFormat(rows, milestoneYears, country, scenarioName);
  }
}

/**
 * Get list of unique years from CSV (for user to select milestones)
 */
export async function getAvailableYears(file: File): Promise<number[]> {
  const content = await file.text();
  const rows = parseCSVString(content);

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.toLowerCase());
  const yearIdx = headers.findIndex(h => h.includes('year'));

  if (yearIdx === -1) return [];

  const years = new Set<number>();
  for (let i = 1; i < rows.length; i++) {
    const year = parseInt(rows[i][yearIdx]);
    if (!isNaN(year) && year >= 2020 && year <= 2100) {
      years.add(year);
    }
  }

  return Array.from(years).sort((a, b) => a - b);
}

/**
 * Suggest milestone years based on available data
 * Returns evenly spaced years (e.g., 2025, 2030, 2040, 2050)
 */
export function suggestMilestoneYears(availableYears: number[]): number[] {
  if (availableYears.length === 0) return [2025, 2030, 2040, 2050];

  const min = Math.min(...availableYears);
  const max = Math.max(...availableYears);

  // Find years closest to standard milestones
  const standardMilestones = [2025, 2030, 2040, 2050];
  const suggested: number[] = [];

  for (const target of standardMilestones) {
    if (target < min || target > max) continue;

    // Find closest available year
    const closest = availableYears.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );

    if (!suggested.includes(closest)) {
      suggested.push(closest);
    }
  }

  // If we don't have enough milestones, add more
  if (suggested.length < 3) {
    const interval = Math.floor((max - min) / 3);
    suggested.push(min);
    suggested.push(min + interval);
    suggested.push(min + 2 * interval);
    suggested.push(max);
  }

  return Array.from(new Set(suggested)).sort((a, b) => a - b).slice(0, 4);
}
