import { test, expect } from '@playwright/test';
import type { ScenarioInput } from '../../src/types/scenario';

test.describe('F009: Example Baseline Scenario Data', () => {
  let scenarioData: ScenarioInput;

  test.beforeAll(async () => {
    // Load the example baseline JSON file (note: base path is /stakeholder-dialogue/ in vite.config)
    const response = await fetch('http://localhost:5173/stakeholder-dialogue/sample-data/scenarioland-baseline.json');
    expect(response.ok).toBeTruthy();
    scenarioData = await response.json();
  });

  test('scenarioland-baseline.json file exists and loads', async ({ page }) => {
    await page.goto('/stakeholder-dialogue/');
    const response = await page.request.get('/stakeholder-dialogue/sample-data/scenarioland-baseline.json');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  test('has valid metadata structure', () => {
    expect(scenarioData.metadata).toBeDefined();
    expect(scenarioData.metadata.country).toBe('ScenarioLand');
    expect(scenarioData.metadata.scenarioName).toBe('Business as Usual (Baseline)');
    expect(scenarioData.metadata.modelVersion).toBe('SPLAT-MESSAGE');
    expect(scenarioData.metadata.dateCreated).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
  });

  test('has all required milestone years: 2025, 2030, 2040, 2050', () => {
    const years = scenarioData.milestones.map(m => m.year);
    expect(years).toEqual([2025, 2030, 2040, 2050]);
  });

  test('has complete capacity data for all milestones', () => {
    // New schema uses aggregated categories: renewables, fossil, storage, other
    expect(scenarioData.milestones.length).toBeGreaterThan(0);

    scenarioData.milestones.forEach(milestone => {
      expect(milestone.capacity).toBeDefined();
      expect(milestone.capacity.total).toBeDefined();
      expect(milestone.capacity.unit).toBeDefined();

      // Check aggregated categories
      expect(typeof milestone.capacity.total.renewables).toBe('number');
      expect(milestone.capacity.total.renewables).toBeGreaterThanOrEqual(0);

      expect(typeof milestone.capacity.total.fossil).toBe('number');
      expect(milestone.capacity.total.fossil).toBeGreaterThanOrEqual(0);

      // Storage and other are optional
      if (milestone.capacity.total.storage !== undefined) {
        expect(milestone.capacity.total.storage).toBeGreaterThanOrEqual(0);
      }
      if (milestone.capacity.total.other !== undefined) {
        expect(milestone.capacity.total.other).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('has complete generation data for all milestones', () => {
    // New schema uses aggregated categories: renewables, fossil, storage, other
    scenarioData.milestones.forEach(milestone => {
      expect(milestone.generation).toBeDefined();
      expect(milestone.generation.output).toBeDefined();
      expect(milestone.generation.unit).toBeDefined();

      // Check aggregated categories
      expect(typeof milestone.generation.output.renewables).toBe('number');
      expect(milestone.generation.output.renewables).toBeGreaterThanOrEqual(0);

      expect(typeof milestone.generation.output.fossil).toBe('number');
      expect(milestone.generation.output.fossil).toBeGreaterThanOrEqual(0);

      // Storage and other are optional
      if (milestone.generation.output.storage !== undefined) {
        expect(milestone.generation.output.storage).toBeGreaterThanOrEqual(0);
      }
      if (milestone.generation.output.other !== undefined) {
        expect(milestone.generation.output.other).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('has emissions data for all milestone years', () => {
    scenarioData.milestones.forEach(milestone => {
      expect(milestone.emissions).toBeDefined();
      expect(typeof milestone.emissions.total).toBe('number');
      expect(milestone.emissions.total).toBeGreaterThanOrEqual(0);
      expect(milestone.emissions.unit).toBeDefined();
    });

    // Baseline scenario should show emissions (fossil fuel dependent)
    const milestone2025 = scenarioData.milestones.find(m => m.year === 2025);
    const milestone2030 = scenarioData.milestones.find(m => m.year === 2030);

    expect(milestone2025?.emissions.total).toBeGreaterThan(0);
    expect(milestone2030?.emissions.total).toBeGreaterThan(0);
  });

  test('has investment data (cumulative)', () => {
    scenarioData.milestones.forEach(milestone => {
      expect(milestone.investment).toBeDefined();
      expect(typeof milestone.investment.cumulative).toBe('number');
      expect(milestone.investment.cumulative).toBeGreaterThanOrEqual(0);
      expect(milestone.investment.unit).toBeDefined();
    });

    // Cumulative investment should be monotonically increasing
    const milestone2025 = scenarioData.milestones.find(m => m.year === 2025);
    const milestone2030 = scenarioData.milestones.find(m => m.year === 2030);
    const milestone2040 = scenarioData.milestones.find(m => m.year === 2040);
    const milestone2050 = scenarioData.milestones.find(m => m.year === 2050);

    expect(milestone2030?.investment.cumulative).toBeGreaterThanOrEqual(
      milestone2025?.investment.cumulative || 0
    );
    expect(milestone2040?.investment.cumulative).toBeGreaterThanOrEqual(
      milestone2030?.investment.cumulative || 0
    );
    expect(milestone2050?.investment.cumulative).toBeGreaterThanOrEqual(
      milestone2040?.investment.cumulative || 0
    );
  });

  test('has complete demand data structure', () => {
    scenarioData.milestones.forEach(milestone => {
      expect(milestone.peakDemand).toBeDefined();
      expect(typeof milestone.peakDemand.value).toBe('number');
      expect(milestone.peakDemand.value).toBeGreaterThan(0);
      expect(milestone.peakDemand.unit).toBeDefined();
    });

    // Peak demand should grow over time
    const milestone2025 = scenarioData.milestones.find(m => m.year === 2025);
    const milestone2050 = scenarioData.milestones.find(m => m.year === 2050);

    expect(milestone2050?.peakDemand.value).toBeGreaterThan(
      milestone2025?.peakDemand.value || 0
    );
  });

  test('has RE share calculated for all milestones', () => {
    // New simplified schema includes RE share as a core indicator
    scenarioData.milestones.forEach(milestone => {
      expect(typeof milestone.reShare).toBe('number');
      expect(milestone.reShare).toBeGreaterThanOrEqual(0);
      expect(milestone.reShare).toBeLessThanOrEqual(100);
    });

    // RE share should be consistent with generation data (more accurate than capacity)
    scenarioData.milestones.forEach(milestone => {
      const totalGeneration = milestone.generation.output.renewables +
                             milestone.generation.output.fossil +
                             (milestone.generation.output.other || 0);

      if (totalGeneration > 0) {
        const calculatedREShare = (milestone.generation.output.renewables / totalGeneration) * 100;
        const difference = Math.abs(calculatedREShare - milestone.reShare);
        // Allow up to 2% difference for rounding
        expect(difference).toBeLessThan(2);
      }
    });
  });

  test('represents realistic ScenarioLand baseline scenario characteristics', () => {
    const milestone2025 = scenarioData.milestones.find(m => m.year === 2025);
    const milestone2050 = scenarioData.milestones.find(m => m.year === 2050);

    expect(milestone2025).toBeDefined();
    expect(milestone2050).toBeDefined();

    // ScenarioLand baseline should show some renewable capacity (hydro)
    expect(milestone2025!.capacity.total.renewables).toBeGreaterThan(0);

    // Baseline should show fossil fuel dependence in 2025
    expect(milestone2025!.capacity.total.fossil).toBeGreaterThan(0);

    // Renewable capacity should grow over time in baseline
    expect(milestone2050!.capacity.total.renewables).toBeGreaterThan(
      milestone2025!.capacity.total.renewables
    );

    // RE share should increase over time
    expect(milestone2050!.reShare).toBeGreaterThan(milestone2025!.reShare);

    // If detailed tech data is available, verify no coal
    if (scenarioData.detailedTech) {
      const coal2025 = scenarioData.detailedTech[2025]?.coal || 0;
      const coal2050 = scenarioData.detailedTech[2050]?.coal || 0;
      expect(coal2025).toBe(0);
      expect(coal2050).toBe(0);
    }
  });

  test('data can be used with calculateDerivedMetrics function', async () => {
    // This test verifies the data structure is compatible with our calculations
    // Import the calculation function
    const { calculateDerivedMetrics } = await import('../../src/utils/calculations');

    // Should not throw error
    const derivedMetrics = calculateDerivedMetrics(scenarioData);

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
    // This test verifies the ScenarioLand data follows the expected structure
    // The actual response generation is tested separately in 06-response-generator.spec.ts

    // Verify all required fields are present for response generation
    expect(scenarioData.metadata).toBeDefined();
    expect(scenarioData.milestones).toBeDefined();
    expect(Array.isArray(scenarioData.milestones)).toBe(true);

    // Verify structure matches what response generator expects
    expect(typeof scenarioData.metadata.country).toBe('string');
    expect(typeof scenarioData.metadata.scenarioName).toBe('string');

    // Each milestone should have all required fields
    scenarioData.milestones.forEach(milestone => {
      expect(milestone.year).toBeDefined();
      expect(milestone.capacity).toBeDefined();
      expect(milestone.generation).toBeDefined();
      expect(milestone.emissions).toBeDefined();
      expect(milestone.investment).toBeDefined();
      expect(milestone.peakDemand).toBeDefined();
      expect(milestone.reShare).toBeDefined();
    });
  });
});
