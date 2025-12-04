// Technology Factors for Soft Metrics Calculations
// Based on IRENA job factor studies and DATA-SCHEMAS.md
// CRITICAL: These are APPROXIMATIONS for discussion, not precise forecasts

/**
 * Job Factors - Jobs per MW installed
 * Based on IRENA renewable energy job factor studies
 */
export const JOB_FACTORS = {
  // Jobs per MW installed (construction phase, job-years)
  construction: {
    solarPV: 10,      // High labor intensity for installation
    wind: 8,          // Manufacturing + installation
    hydro: 12,        // Civil works intensive
    battery: 3,       // Lower labor intensity
    geothermal: 6,    // Drilling + installation
    biomass: 8,       // Plant construction
    coal: 4,          // Conventional plant
    naturalGas: 4,    // Conventional plant
    gas: 4,           // Alias for naturalGas
    diesel: 3,        // Simple cycle
    hfo: 3,           // Heavy fuel oil plants
    nuclear: 10,      // Complex construction
    interconnector: 5 // Transmission lines
  },

  // Permanent jobs per MW (operations and maintenance)
  operations: {
    solarPV: 0.3,     // Minimal O&M staff
    wind: 0.4,        // Regular maintenance
    hydro: 0.5,       // Dam operation + maintenance
    battery: 0.1,     // Limited O&M
    geothermal: 0.6,  // Continuous monitoring
    biomass: 1.0,     // Fuel handling + operation
    coal: 0.8,        // Plant operation
    naturalGas: 0.8,  // Plant operation
    gas: 0.8,         // Alias for naturalGas
    diesel: 0.5,      // Simple operation
    hfo: 0.5,         // Simple operation
    nuclear: 0.7,     // Continuous staffing
    interconnector: 0.05 // Minimal maintenance
  }
} as const;

/**
 * Land Use Factors - Hectares per MW
 * Only for technologies with significant and generalizable land footprints
 *
 * NOTE:
 * - Solar: Assumes typical utility-scale fixed-tilt installations
 * - Wind: Direct turbine footprint only (total project area 10-100x larger)
 * - Battery: Assumes containerized/modular systems
 * - Hydro, geothermal, thermal plants: too site-specific to generalize
 */
export const LAND_FACTORS = {
  solarPV: 2.0,       // Hectares per MW (utility-scale ground mount)
  wind: 0.3,          // Hectares per MW (direct footprint only, not total area)
  battery: 0.1,       // Hectares per MW (containerized systems)
  // Other technologies: site-specific, not generalized
} as const;

/**
 * Emission Factors - tCO2 per GWh generated
 * For fossil fuel combustion only
 *
 * NOTE:
 * - Factors represent COMBUSTION EMISSIONS ONLY
 * - Does not include lifecycle/embodied emissions
 * - For illustrative scenario comparison, not carbon accounting
 * - Actual emissions should come from the optimization model
 */
export const EMISSION_FACTORS = {
  coal: 900,          // High carbon intensity (tCO2/GWh)
  naturalGas: 400,    // Lower than coal (tCO2/GWh)
  gas: 400,           // Alias for naturalGas
  diesel: 700,        // Medium-high intensity (tCO2/GWh)
  hfo: 650,           // Heavy fuel oil (tCO2/GWh)
  // Renewables: 0 (lifecycle emissions not included in this tool)
} as const;

// Type exports for type safety
export type TechnologyKey = keyof typeof JOB_FACTORS.construction;
export type LandUseKey = keyof typeof LAND_FACTORS;
export type EmissionKey = keyof typeof EMISSION_FACTORS;

/**
 * Helper function to get job factor safely
 */
export function getJobFactor(
  technology: string,
  phase: 'construction' | 'operations'
): number {
  const tech = technology as TechnologyKey;
  return JOB_FACTORS[phase][tech] || 0;
}

/**
 * Helper function to get land factor safely
 */
export function getLandFactor(technology: string): number {
  const tech = technology as LandUseKey;
  return LAND_FACTORS[tech] || 0;
}

/**
 * Helper function to get emission factor safely
 */
export function getEmissionFactor(technology: string): number {
  const tech = technology as EmissionKey;
  return EMISSION_FACTORS[tech] || 0;
}
