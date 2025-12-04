// Scenario Data Schema
// Based on CLAUDE.md and DATA-SCHEMAS.md specifications

export interface ScenarioInput {
  metadata: {
    country: string;           // Country or region name
    scenarioName: string;      // e.g., "High Renewable", "Business as Usual"
    modelVersion: string;      // e.g., "MESSAGE", "OSeMOSYS", "LEAP"
    dateCreated: string;       // ISO 8601 date
  };

  milestoneYears: number[];    // e.g., [2025, 2030, 2040, 2050]

  supply: {
    capacity: {                // MW by technology and year
      hydro: Record<number, number>;
      solarPV: Record<number, number>;
      wind: Record<number, number>;
      battery: Record<number, number>;
      geothermal: Record<number, number>;
      biomass: Record<number, number>;
      coal: Record<number, number>;
      diesel: Record<number, number>;
      hfo: Record<number, number>;
      naturalGas: Record<number, number>;
      nuclear: Record<number, number>;
      interconnector: Record<number, number>;
    };
    generation: Record<string, Record<number, number>>;  // GWh by technology and year
    emissions: Record<number, number>;                    // Mt CO2 by year
    investment: {
      annual: Record<number, number>;      // USD millions by year
      cumulative: Record<number, number>;  // USD millions by year
    };
  };

  demand: {
    total: Record<number, number>;      // GWh by year
    peak: Record<number, number>;       // MW by year
    bySector: {
      residential: Record<number, number>;
      commercial: Record<number, number>;
      industrial: Record<number, number>;
      transport: Record<number, number>;
    };
  };
}

// Quick Entry Schema (Simplified)
export interface QuickScenarioInput {
  country: string;
  scenarioName: string;

  // Capacity 2030 (MW)
  renewableCapacity2030: number;
  fossilCapacity2030: number;
  batteryCapacity2030: number;

  // Capacity 2040 (MW)
  renewableCapacity2040: number;
  fossilCapacity2040: number;
  batteryCapacity2040: number;

  // Key metrics
  totalInvestment2030: number;      // USD millions cumulative
  totalInvestment2050: number;
  emissions2025: number;            // Mt CO2
  emissions2030: number;
  emissions2050: number;

  // Demand
  peakDemand2030: number;           // MW
  peakDemand2040: number;
}

// Technology types
export type RenewableTech = 'hydro' | 'solarPV' | 'wind' | 'geothermal' | 'biomass';
export type FossilTech = 'coal' | 'naturalGas' | 'diesel' | 'hfo';
export type StorageTech = 'battery';
export type AllTech = RenewableTech | FossilTech | StorageTech | 'nuclear' | 'interconnector';
