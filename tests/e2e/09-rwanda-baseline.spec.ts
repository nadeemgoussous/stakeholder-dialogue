import { test, expect } from '@playwright/test';
import type { ScenarioInput } from '../../src/types/scenario';

test.describe('F009: Rwanda Baseline Scenario Data', () => {
  let rwandaData: ScenarioInput;

  test.beforeAll(async () => {
    // Load the Rwanda baseline JSON file
    const response = await fetch('http://localhost:5173/sample-data/rwanda-baseline.json');
    expect(response.ok).toBeTruthy();
    rwandaData = await response.json();
  });

  test('rwanda-baseline.json file exists and loads', async ({ page }) => {
    await page.goto('/');
    const response = await page.request.get('/sample-data/rwanda-baseline.json');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  test('has valid metadata structure', () => {
    expect(rwandaData.metadata).toBeDefined();
    expect(rwandaData.metadata.country).toBe('Rwanda');
    expect(rwandaData.metadata.scenarioName).toBe('Business as Usual (Baseline)');
    expect(rwandaData.metadata.modelVersion).toBe('SPLAT-MESSAGE');
    expect(rwandaData.metadata.dateCreated).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
  });

  test('has all required milestone years: 2025, 2030, 2040, 2050', () => {
    expect(rwandaData.milestoneYears).toEqual([2025, 2030, 2040, 2050]);
  });

  test('has complete capacity data for all technology categories', () => {
    const capacityTechs = [
      'hydro', 'solarPV', 'wind', 'battery', 'geothermal', 'biomass',
      'coal', 'diesel', 'hfo', 'naturalGas', 'nuclear', 'interconnector'
    ];

    capacityTechs.forEach(tech => {
      expect(rwandaData.supply.capacity[tech]).toBeDefined();

      // Each tech should have data for all milestone years
      rwandaData.milestoneYears.forEach(year => {
        expect(rwandaData.supply.capacity[tech][year]).toBeDefined();
        expect(typeof rwandaData.supply.capacity[tech][year]).toBe('number');
        expect(rwandaData.supply.capacity[tech][year]).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test('has complete generation data for all technologies', () => {
    const generationTechs = [
      'hydro', 'solarPV', 'wind', 'battery', 'geothermal', 'biomass',
      'coal', 'diesel', 'hfo', 'naturalGas', 'nuclear', 'interconnector'
    ];

    generationTechs.forEach(tech => {
      expect(rwandaData.supply.generation[tech]).toBeDefined();

      // Each tech should have data for all milestone years
      rwandaData.milestoneYears.forEach(year => {
        expect(rwandaData.supply.generation[tech][year]).toBeDefined();
        expect(typeof rwandaData.supply.generation[tech][year]).toBe('number');
        expect(rwandaData.supply.generation[tech][year]).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test('has emissions data for all milestone years', () => {
    expect(rwandaData.supply.emissions).toBeDefined();

    rwandaData.milestoneYears.forEach(year => {
      expect(rwandaData.supply.emissions[year]).toBeDefined();
      expect(typeof rwandaData.supply.emissions[year]).toBe('number');
      expect(rwandaData.supply.emissions[year]).toBeGreaterThanOrEqual(0);
    });

    // Baseline scenario should show emissions (fossil fuel dependent)
    expect(rwandaData.supply.emissions[2025]).toBeGreaterThan(0);
    expect(rwandaData.supply.emissions[2030]).toBeGreaterThan(0);
  });

  test('has investment data (annual and cumulative)', () => {
    expect(rwandaData.supply.investment).toBeDefined();
    expect(rwandaData.supply.investment.annual).toBeDefined();
    expect(rwandaData.supply.investment.cumulative).toBeDefined();

    rwandaData.milestoneYears.forEach(year => {
      // Annual investment
      expect(rwandaData.supply.investment.annual[year]).toBeDefined();
      expect(typeof rwandaData.supply.investment.annual[year]).toBe('number');
      expect(rwandaData.supply.investment.annual[year]).toBeGreaterThanOrEqual(0);

      // Cumulative investment
      expect(rwandaData.supply.investment.cumulative[year]).toBeDefined();
      expect(typeof rwandaData.supply.investment.cumulative[year]).toBe('number');
      expect(rwandaData.supply.investment.cumulative[year]).toBeGreaterThanOrEqual(0);
    });

    // Cumulative investment should be monotonically increasing
    expect(rwandaData.supply.investment.cumulative[2030]).toBeGreaterThanOrEqual(
      rwandaData.supply.investment.cumulative[2025]
    );
    expect(rwandaData.supply.investment.cumulative[2040]).toBeGreaterThanOrEqual(
      rwandaData.supply.investment.cumulative[2030]
    );
    expect(rwandaData.supply.investment.cumulative[2050]).toBeGreaterThanOrEqual(
      rwandaData.supply.investment.cumulative[2040]
    );
  });

  test('has complete demand data structure', () => {
    expect(rwandaData.demand).toBeDefined();
    expect(rwandaData.demand.total).toBeDefined();
    expect(rwandaData.demand.peak).toBeDefined();
    expect(rwandaData.demand.bySector).toBeDefined();

    rwandaData.milestoneYears.forEach(year => {
      // Total demand
      expect(rwandaData.demand.total[year]).toBeDefined();
      expect(typeof rwandaData.demand.total[year]).toBe('number');
      expect(rwandaData.demand.total[year]).toBeGreaterThan(0);

      // Peak demand
      expect(rwandaData.demand.peak[year]).toBeDefined();
      expect(typeof rwandaData.demand.peak[year]).toBe('number');
      expect(rwandaData.demand.peak[year]).toBeGreaterThan(0);
    });

    // Demand should grow over time
    expect(rwandaData.demand.total[2050]).toBeGreaterThan(rwandaData.demand.total[2025]);
  });

  test('has sectoral demand breakdown', () => {
    const sectors = ['residential', 'commercial', 'industrial', 'transport'];

    sectors.forEach(sector => {
      expect(rwandaData.demand.bySector[sector]).toBeDefined();

      rwandaData.milestoneYears.forEach(year => {
        expect(rwandaData.demand.bySector[sector][year]).toBeDefined();
        expect(typeof rwandaData.demand.bySector[sector][year]).toBe('number');
        expect(rwandaData.demand.bySector[sector][year]).toBeGreaterThan(0);
      });
    });

    // Sectoral demands should roughly sum to total (allowing for rounding)
    rwandaData.milestoneYears.forEach(year => {
      const sectoralSum =
        rwandaData.demand.bySector.residential[year] +
        rwandaData.demand.bySector.commercial[year] +
        rwandaData.demand.bySector.industrial[year] +
        rwandaData.demand.bySector.transport[year];

      const totalDemand = rwandaData.demand.total[year];
      const difference = Math.abs(sectoralSum - totalDemand);
      const percentDifference = (difference / totalDemand) * 100;

      // Allow up to 5% difference for rounding/losses
      expect(percentDifference).toBeLessThan(5);
    });
  });

  test('represents realistic Rwanda baseline scenario characteristics', () => {
    // Rwanda has good hydro resources (should be significant)
    expect(rwandaData.supply.capacity.hydro[2025]).toBeGreaterThan(100);

    // Baseline should show fossil fuel dependence
    const fossil2025 =
      rwandaData.supply.capacity.diesel[2025] +
      rwandaData.supply.capacity.hfo[2025] +
      rwandaData.supply.capacity.naturalGas[2025];
    expect(fossil2025).toBeGreaterThan(0);

    // Renewable capacity should grow over time in baseline
    const renewable2025 =
      rwandaData.supply.capacity.hydro[2025] +
      rwandaData.supply.capacity.solarPV[2025] +
      rwandaData.supply.capacity.wind[2025] +
      rwandaData.supply.capacity.geothermal[2025];

    const renewable2050 =
      rwandaData.supply.capacity.hydro[2050] +
      rwandaData.supply.capacity.solarPV[2050] +
      rwandaData.supply.capacity.wind[2050] +
      rwandaData.supply.capacity.geothermal[2050];

    expect(renewable2050).toBeGreaterThan(renewable2025);

    // No coal (Rwanda doesn't use coal)
    expect(rwandaData.supply.capacity.coal[2025]).toBe(0);
    expect(rwandaData.supply.capacity.coal[2050]).toBe(0);
  });

  test('data can be used with calculateDerivedMetrics function', async () => {
    // This test verifies the data structure is compatible with our calculations
    // Import the calculation function
    const { calculateDerivedMetrics } = await import('../../src/utils/calculations');

    // Should not throw error
    const derivedMetrics = calculateDerivedMetrics(rwandaData);

    expect(derivedMetrics).toBeDefined();
    expect(derivedMetrics.jobs).toBeDefined();
    expect(derivedMetrics.landUse).toBeDefined();
    expect(derivedMetrics.emissions).toBeDefined();
    expect(derivedMetrics.renewableShare).toBeDefined();
    expect(derivedMetrics.fossilShare).toBeDefined();
    expect(derivedMetrics.capacity).toBeDefined();
    expect(derivedMetrics.investment).toBeDefined();
  });

  test('data structure is compatible with response generation', () => {
    // This test verifies the Rwanda data follows the expected structure
    // The actual response generation is tested separately in 06-response-generator.spec.ts

    // Verify all required fields are present for response generation
    expect(rwandaData.metadata).toBeDefined();
    expect(rwandaData.milestoneYears).toBeDefined();
    expect(rwandaData.supply).toBeDefined();
    expect(rwandaData.supply.capacity).toBeDefined();
    expect(rwandaData.supply.generation).toBeDefined();
    expect(rwandaData.supply.emissions).toBeDefined();
    expect(rwandaData.supply.investment).toBeDefined();
    expect(rwandaData.demand).toBeDefined();

    // Verify structure matches what response generator expects
    expect(typeof rwandaData.metadata.country).toBe('string');
    expect(typeof rwandaData.metadata.scenarioName).toBe('string');
    expect(Array.isArray(rwandaData.milestoneYears)).toBe(true);
    expect(typeof rwandaData.supply.capacity).toBe('object');
    expect(typeof rwandaData.supply.generation).toBe('object');
  });
});
