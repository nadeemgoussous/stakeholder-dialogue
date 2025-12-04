import { test, expect } from '@playwright/test';

/**
 * Technology Factors Tests (F005)
 * Verifies technology factors data is accessible and correct
 */
test.describe('Technology Factors', () => {
  test('should have job factors accessible in app', async ({ page }) => {
    await page.goto('/');

    // Test that technology factors can be loaded
    // We'll do this by checking if the app loads successfully (which imports the factors)
    const result = await page.evaluate(async () => {
      try {
        // Dynamic import in browser context
        const module = await import('/src/data/technology-factors.ts');

        // Verify JOB_FACTORS exist
        if (!module.JOB_FACTORS) return { success: false, error: 'JOB_FACTORS not found' };

        // Verify construction factors
        if (!module.JOB_FACTORS.construction) return { success: false, error: 'construction factors not found' };

        // Verify operations factors
        if (!module.JOB_FACTORS.operations) return { success: false, error: 'operations factors not found' };

        // Check some specific values
        const solarConstructionJobs = module.JOB_FACTORS.construction.solarPV;
        const solarOperationsJobs = module.JOB_FACTORS.operations.solarPV;

        return {
          success: true,
          solarConstructionJobs,
          solarOperationsJobs
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.solarConstructionJobs).toBe(10);  // Per IRENA studies
      expect(result.solarOperationsJobs).toBe(0.3);
    }
  });

  test('should have land factors accessible', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      try {
        const module = await import('/src/data/technology-factors.ts');

        if (!module.LAND_FACTORS) return { success: false, error: 'LAND_FACTORS not found' };

        return {
          success: true,
          solarLand: module.LAND_FACTORS.solarPV,
          windLand: module.LAND_FACTORS.wind
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.solarLand).toBe(2.0);  // hectares per MW
      expect(result.windLand).toBe(0.3);
    }
  });

  test('should have emission factors accessible', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      try {
        const module = await import('/src/data/technology-factors.ts');

        if (!module.EMISSION_FACTORS) return { success: false, error: 'EMISSION_FACTORS not found' };

        return {
          success: true,
          coal: module.EMISSION_FACTORS.coal,
          gas: module.EMISSION_FACTORS.naturalGas
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.coal).toBe(900);   // tCO2 per GWh
      expect(result.gas).toBe(400);
    }
  });

  test('should have helper functions working', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      try {
        const module = await import('/src/data/technology-factors.ts');

        const solarConstruction = module.getJobFactor('solarPV', 'construction');
        const windOperations = module.getJobFactor('wind', 'operations');
        const solarLand = module.getLandFactor('solarPV');
        const coalEmissions = module.getEmissionFactor('coal');

        return {
          success: true,
          solarConstruction,
          windOperations,
          solarLand,
          coalEmissions
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.solarConstruction).toBe(10);
      expect(result.windOperations).toBe(0.4);
      expect(result.solarLand).toBe(2.0);
      expect(result.coalEmissions).toBe(900);
    }
  });
});
