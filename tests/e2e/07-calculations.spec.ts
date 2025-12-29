import { test, expect } from '@playwright/test';

// Test timeout for module loading
test.setTimeout(90000);

test.describe('F006: Derived Metrics Calculator (Soft Metrics ONLY)', () => {

  test('should calculate jobs (construction and operations)', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateJobs } = await import('/src/utils/calculations.ts');

      // Create test scenario
      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Job Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030, 2040],
        supply: {
          capacity: {
            hydro: { 2025: 0, 2030: 100, 2040: 100 },
            solarPV: { 2025: 0, 2030: 500, 2040: 1000 },
            wind: { 2025: 0, 2030: 300, 2040: 600 },
            battery: { 2025: 0, 2030: 50, 2040: 100 },
            geothermal: { 2025: 0, 2030: 0, 2040: 0 },
            biomass: { 2025: 0, 2030: 0, 2040: 0 },
            coal: { 2025: 200, 2030: 100, 2040: 0 },
            diesel: { 2025: 50, 2030: 25, 2040: 0 },
            hfo: { 2025: 0, 2030: 0, 2040: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 0 },
            nuclear: { 2025: 0, 2030: 0, 2040: 0 },
            interconnector: { 2025: 0, 2030: 0, 2040: 0 }
          },
          generation: {},
          emissions: {},
          investment: {
            annual: {},
            cumulative: {}
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const jobs = calculateJobs(testScenario);

      return {
        jobs,
        hasConstruction: 'construction' in jobs,
        hasOperations: 'operations' in jobs,
        hasTotal: 'total' in jobs,
        construction2030: jobs.construction[2030],
        operations2030: jobs.operations[2030],
        total2030: jobs.total[2030]
      };
    });

    // Verify jobs structure
    expect(result.hasConstruction).toBe(true);
    expect(result.hasOperations).toBe(true);
    expect(result.hasTotal).toBe(true);

    // Verify jobs for 2030
    // Solar: 500 MW * 10 = 5000 construction jobs
    // Solar: 500 MW * 0.3 = 150 operations jobs
    // Wind: 300 MW * 8 = 2400 construction jobs
    // Wind: 300 MW * 0.4 = 120 operations jobs
    expect(result.construction2030).toBeGreaterThan(7000); // Should be around 7550
    expect(result.operations2030).toBeGreaterThan(250); // Should be around 270
    expect(result.total2030).toBeGreaterThan(7500); // Should be around 7820
  });

  test('should calculate land use for solar, wind, and battery only', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateLandUse } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Land Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030],
        supply: {
          capacity: {
            hydro: { 2025: 0, 2030: 100 },
            solarPV: { 2025: 0, 2030: 1000 }, // 1000 MW solar
            wind: { 2025: 0, 2030: 500 },     // 500 MW wind
            battery: { 2025: 0, 2030: 100 },  // 100 MW battery
            geothermal: { 2025: 0, 2030: 0 },
            biomass: { 2025: 0, 2030: 0 },
            coal: { 2025: 0, 2030: 0 },
            diesel: { 2025: 0, 2030: 0 },
            hfo: { 2025: 0, 2030: 0 },
            naturalGas: { 2025: 0, 2030: 0 },
            nuclear: { 2025: 0, 2030: 0 },
            interconnector: { 2025: 0, 2030: 0 }
          },
          generation: {},
          emissions: {},
          investment: {
            annual: {},
            cumulative: {}
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const landUse = calculateLandUse(testScenario);

      return {
        hasTotalNewLand: 'totalNewLand' in landUse,
        hasByTechnology: 'byTechnology' in landUse,
        solarPV2030: landUse.byTechnology.solarPV[2030],
        wind2030: landUse.byTechnology.wind[2030],
        battery2030: landUse.byTechnology.battery[2030],
        totalNewLand2030: landUse.totalNewLand[2030]
      };
    });

    // Verify land use structure
    expect(result.hasTotalNewLand).toBe(true);
    expect(result.hasByTechnology).toBe(true);

    // Verify land use for 2030
    // Solar: 1000 MW * 2.0 ha/MW = 2000 ha
    // Wind: 500 MW * 0.3 ha/MW = 150 ha
    // Battery: 100 MW * 0.1 ha/MW = 10 ha
    expect(result.solarPV2030).toBe(2000);
    expect(result.wind2030).toBe(150);
    expect(result.battery2030).toBe(10);
    expect(result.totalNewLand2030).toBe(2160); // 2000 + 150 + 10
  });

  test('should calculate emissions from scenario data or generation', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateEmissions } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Emissions Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030, 2040],
        supply: {
          capacity: {
            hydro: { 2025: 0, 2030: 0, 2040: 0 },
            solarPV: { 2025: 0, 2030: 0, 2040: 0 },
            wind: { 2025: 0, 2030: 0, 2040: 0 },
            battery: { 2025: 0, 2030: 0, 2040: 0 },
            geothermal: { 2025: 0, 2030: 0, 2040: 0 },
            biomass: { 2025: 0, 2030: 0, 2040: 0 },
            coal: { 2025: 0, 2030: 0, 2040: 0 },
            diesel: { 2025: 0, 2030: 0, 2040: 0 },
            hfo: { 2025: 0, 2030: 0, 2040: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 0 },
            nuclear: { 2025: 0, 2030: 0, 2040: 0 },
            interconnector: { 2025: 0, 2030: 0, 2040: 0 }
          },
          generation: {},
          emissions: { 2025: 10.0, 2030: 7.5, 2040: 2.5 }, // Mt CO2
          investment: {
            annual: {},
            cumulative: {}
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const emissions = calculateEmissions(testScenario);

      return {
        hasAbsolute: 'absolute' in emissions,
        hasReductionPercent: 'reductionPercent' in emissions,
        absolute2025: emissions.absolute[2025],
        absolute2030: emissions.absolute[2030],
        absolute2040: emissions.absolute[2040],
        reductionPercent2025: emissions.reductionPercent[2025],
        reductionPercent2030: emissions.reductionPercent[2030],
        reductionPercent2040: emissions.reductionPercent[2040]
      };
    });

    // Verify emissions structure
    expect(result.hasAbsolute).toBe(true);
    expect(result.hasReductionPercent).toBe(true);

    // Verify absolute emissions
    expect(result.absolute2025).toBe(10.0);
    expect(result.absolute2030).toBe(7.5);
    expect(result.absolute2040).toBe(2.5);

    // Verify reduction percentages (vs 2025 baseline)
    expect(result.reductionPercent2025).toBe(0); // Baseline year
    expect(result.reductionPercent2030).toBe(25); // 25% reduction
    expect(result.reductionPercent2040).toBe(75); // 75% reduction
  });

  test('should calculate renewable and fossil shares', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateEnergyShares } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Shares Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030],
        supply: {
          capacity: {
            hydro: { 2025: 100, 2030: 200 },
            solarPV: { 2025: 50, 2030: 400 },
            wind: { 2025: 50, 2030: 400 },
            battery: { 2025: 0, 2030: 0 },
            geothermal: { 2025: 0, 2030: 0 },
            biomass: { 2025: 0, 2030: 0 },
            coal: { 2025: 600, 2030: 200 },
            diesel: { 2025: 200, 2030: 0 },
            hfo: { 2025: 0, 2030: 0 },
            naturalGas: { 2025: 0, 2030: 0 },
            nuclear: { 2025: 0, 2030: 0 },
            interconnector: { 2025: 0, 2030: 0 }
          },
          generation: {},
          emissions: {},
          investment: {
            annual: {},
            cumulative: {}
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const shares = calculateEnergyShares(testScenario);

      return {
        hasRenewableShare: 'renewableShare' in shares,
        hasFossilShare: 'fossilShare' in shares,
        renewableShare2025: shares.renewableShare[2025],
        renewableShare2030: shares.renewableShare[2030],
        fossilShare2025: shares.fossilShare[2025],
        fossilShare2030: shares.fossilShare[2030]
      };
    });

    // Verify shares structure
    expect(result.hasRenewableShare).toBe(true);
    expect(result.hasFossilShare).toBe(true);

    // 2025: RE = 200 MW (hydro 100 + solar 50 + wind 50), Fossil = 800 MW (coal 600 + diesel 200)
    // Total = 1000 MW, RE share = 20%, Fossil share = 80%
    expect(result.renewableShare2025).toBe(20.0);
    expect(result.fossilShare2025).toBe(80.0);

    // 2030: RE = 1000 MW (hydro 200 + solar 400 + wind 400), Fossil = 200 MW (coal 200)
    // Total = 1200 MW, RE share = 83.3%, Fossil share = 16.7%
    expect(result.renewableShare2030).toBeCloseTo(83.3, 0);
    expect(result.fossilShare2030).toBeCloseTo(16.7, 0);
  });

  test('should calculate capacity metrics including VRE share', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateCapacityMetrics } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Capacity Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2030],
        supply: {
          capacity: {
            hydro: { 2030: 200 },
            solarPV: { 2030: 600 },  // VRE
            wind: { 2030: 400 },     // VRE
            battery: { 2030: 100 },
            geothermal: { 2030: 0 },
            biomass: { 2030: 0 },
            coal: { 2030: 200 },
            diesel: { 2030: 0 },
            hfo: { 2030: 0 },
            naturalGas: { 2030: 0 },
            nuclear: { 2030: 0 },
            interconnector: { 2030: 0 }
          },
          generation: {},
          emissions: {},
          investment: {
            annual: {},
            cumulative: {}
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const capacity = calculateCapacityMetrics(testScenario);

      return {
        hasTotalInstalled: 'totalInstalled' in capacity,
        hasVariableRenewableShare: 'variableRenewableShare' in capacity,
        totalInstalled2030: capacity.totalInstalled[2030],
        variableRenewableShare2030: capacity.variableRenewableShare[2030]
      };
    });

    // Verify capacity structure
    expect(result.hasTotalInstalled).toBe(true);
    expect(result.hasVariableRenewableShare).toBe(true);

    // Total: 200 + 600 + 400 + 100 + 200 = 1500 MW
    expect(result.totalInstalled2030).toBe(1500);

    // VRE: 600 + 400 = 1000 MW, VRE share = 1000/1500 = 66.7%
    expect(result.variableRenewableShare2030).toBeCloseTo(66.7, 0);
  });

  test('should calculate investment metrics', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateInvestmentMetrics } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'TestCountry',
          scenarioName: 'Investment Test',
          modelVersion: 'TEST',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030, 2040],
        supply: {
          capacity: {
            hydro: { 2025: 0, 2030: 0, 2040: 0 },
            solarPV: { 2025: 0, 2030: 0, 2040: 0 },
            wind: { 2025: 0, 2030: 0, 2040: 0 },
            battery: { 2025: 0, 2030: 0, 2040: 0 },
            geothermal: { 2025: 0, 2030: 0, 2040: 0 },
            biomass: { 2025: 0, 2030: 0, 2040: 0 },
            coal: { 2025: 0, 2030: 0, 2040: 0 },
            diesel: { 2025: 0, 2030: 0, 2040: 0 },
            hfo: { 2025: 0, 2030: 0, 2040: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 0 },
            nuclear: { 2025: 0, 2030: 0, 2040: 0 },
            interconnector: { 2025: 0, 2030: 0, 2040: 0 }
          },
          generation: {},
          emissions: {},
          investment: {
            annual: { 2025: 100, 2026: 200, 2027: 300, 2028: 200, 2029: 150 },
            cumulative: { 2025: 100, 2030: 1500, 2040: 5000 }
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: {
            residential: {},
            commercial: {},
            industrial: {},
            transport: {}
          }
        }
      };

      const investment = calculateInvestmentMetrics(testScenario);

      return {
        hasTotalCumulative: 'totalCumulative' in investment,
        hasAnnualPeak: 'annualPeak' in investment,
        hasAverageAnnual: 'averageAnnual' in investment,
        totalCumulative2025: investment.totalCumulative[2025],
        totalCumulative2030: investment.totalCumulative[2030],
        totalCumulative2040: investment.totalCumulative[2040],
        annualPeak: investment.annualPeak,
        averageAnnual: investment.averageAnnual
      };
    });

    // Verify investment structure
    expect(result.hasTotalCumulative).toBe(true);
    expect(result.hasAnnualPeak).toBe(true);
    expect(result.hasAverageAnnual).toBe(true);

    // Cumulative investment
    expect(result.totalCumulative2025).toBe(100);
    expect(result.totalCumulative2030).toBe(1500);
    expect(result.totalCumulative2040).toBe(5000);

    // Annual peak should be 300 (max of annual investments)
    expect(result.annualPeak).toBe(300);

    // Average annual: (100 + 200 + 300 + 200 + 150) / 5 = 190
    expect(result.averageAnnual).toBe(190);
  });

  test('should calculate complete DerivedMetrics object', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { calculateDerivedMetrics } = await import('/src/utils/calculations.ts');

      const testScenario = {
        metadata: {
          country: 'ScenarioLand',
          scenarioName: 'High Renewable',
          modelVersion: 'SPLAT-MESSAGE',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030, 2040],
        supply: {
          capacity: {
            hydro: { 2025: 200, 2030: 300, 2040: 400 },
            solarPV: { 2025: 50, 2030: 500, 2040: 1000 },
            wind: { 2025: 0, 2030: 200, 2040: 500 },
            battery: { 2025: 0, 2030: 100, 2040: 200 },
            geothermal: { 2025: 0, 2030: 0, 2040: 50 },
            biomass: { 2025: 10, 2030: 20, 2040: 30 },
            coal: { 2025: 100, 2030: 50, 2040: 0 },
            diesel: { 2025: 50, 2030: 25, 2040: 0 },
            hfo: { 2025: 30, 2030: 15, 2040: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 100 },
            nuclear: { 2025: 0, 2030: 0, 2040: 0 },
            interconnector: { 2025: 50, 2030: 100, 2040: 150 }
          },
          generation: {
            coal: { 2025: 400, 2030: 200, 2040: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 300 }
          },
          emissions: { 2025: 2.5, 2030: 1.5, 2040: 0.5 },
          investment: {
            annual: { 2025: 150, 2026: 200, 2027: 250 },
            cumulative: { 2025: 150, 2030: 2000, 2040: 6000 }
          }
        },
        demand: {
          total: { 2025: 1000, 2030: 2000, 2040: 4000 },
          peak: { 2025: 200, 2030: 400, 2040: 800 },
          bySector: {
            residential: { 2025: 400, 2030: 800, 2040: 1600 },
            commercial: { 2025: 300, 2030: 600, 2040: 1200 },
            industrial: { 2025: 250, 2030: 500, 2040: 1000 },
            transport: { 2025: 50, 2030: 100, 2040: 200 }
          }
        }
      };

      const derivedMetrics = calculateDerivedMetrics(testScenario);

      return {
        hasRenewableShare: 'renewableShare' in derivedMetrics,
        hasFossilShare: 'fossilShare' in derivedMetrics,
        hasJobs: 'jobs' in derivedMetrics,
        hasLandUse: 'landUse' in derivedMetrics,
        hasEmissions: 'emissions' in derivedMetrics,
        hasCapacity: 'capacity' in derivedMetrics,
        hasInvestment: 'investment' in derivedMetrics,
        jobsHasConstruction: 'construction' in derivedMetrics.jobs,
        landUseHasTotalNewLand: 'totalNewLand' in derivedMetrics.landUse,
        emissionsHasAbsolute: 'absolute' in derivedMetrics.emissions,
        capacityHasTotalInstalled: 'totalInstalled' in derivedMetrics.capacity,
        investmentHasTotalCumulative: 'totalCumulative' in derivedMetrics.investment,
        renewableShare2030: derivedMetrics.renewableShare[2030],
        emissionsAbsolute2030: derivedMetrics.emissions.absolute[2030],
        emissionsReductionPercent2030: derivedMetrics.emissions.reductionPercent[2030]
      };
    });

    // Verify complete structure
    expect(result.hasRenewableShare).toBe(true);
    expect(result.hasFossilShare).toBe(true);
    expect(result.hasJobs).toBe(true);
    expect(result.hasLandUse).toBe(true);
    expect(result.hasEmissions).toBe(true);
    expect(result.hasCapacity).toBe(true);
    expect(result.hasInvestment).toBe(true);

    // Verify all nested properties exist
    expect(result.jobsHasConstruction).toBe(true);
    expect(result.landUseHasTotalNewLand).toBe(true);
    expect(result.emissionsHasAbsolute).toBe(true);
    expect(result.capacityHasTotalInstalled).toBe(true);
    expect(result.investmentHasTotalCumulative).toBe(true);

    // Verify data for 2030
    expect(result.renewableShare2030).toBeGreaterThan(70); // High renewable scenario
    expect(result.emissionsAbsolute2030).toBe(1.5);
    expect(result.emissionsReductionPercent2030).toBe(40); // 40% reduction vs 2025
  });

  test('CRITICAL: should NOT calculate LCOE, tariffs, or technical feasibility', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const module = await import('/src/utils/calculations.ts');

      return {
        hasLCOE: typeof module.calculateLCOE !== 'undefined',
        hasTariff: typeof module.calculateTariff !== 'undefined',
        hasReserveMargin: typeof module.calculateReserveMargin !== 'undefined',
        hasReliability: typeof module.calculateReliability !== 'undefined'
      };
    });

    expect(result.hasLCOE).toBe(false);
    expect(result.hasTariff).toBe(false);
    expect(result.hasReserveMargin).toBe(false);
    expect(result.hasReliability).toBe(false);
  });

});
