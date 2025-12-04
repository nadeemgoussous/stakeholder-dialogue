// Derived Metrics Schema (Soft Metrics ONLY)
// Based on DATA-SCHEMAS.md
// CRITICAL: NO LCOE, tariffs, or technical feasibility calculations

export interface DerivedMetrics {
  renewableShare: Record<number, number>;      // % by year
  fossilShare: Record<number, number>;         // % by year

  jobs: {
    construction: Record<number, number>;      // Job-years by year
    operations: Record<number, number>;        // Permanent jobs by year
    total: Record<number, number>;             // Combined by year
  };

  landUse: {
    totalNewLand: Record<number, number>;      // Hectares by year
    byTechnology: {
      solarPV: Record<number, number>;
      wind: Record<number, number>;
      battery: Record<number, number>;
    };
  };

  emissions: {
    absolute: Record<number, number>;          // Mt CO2 by year
    reductionPercent: Record<number, number>;  // % reduction vs baseline
  };

  capacity: {
    totalInstalled: Record<number, number>;    // MW by year
    variableRenewableShare: Record<number, number>;  // % (solar + wind)
  };

  investment: {
    totalCumulative: Record<number, number>;   // USD millions by year
    annualPeak: number;                        // Highest annual investment
    averageAnnual: number;                     // Average across period
  };
}
