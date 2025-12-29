import { test, expect } from '@playwright/test';

test.describe('Rule-Based Response Generator (F002)', () => {
  // Set longer timeout for these tests since module imports can be slow
  test.setTimeout(90000);

  test('generateRuleBasedResponse creates valid response structure', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      // Import dependencies
      const { generateRuleBasedResponse } = await import('/src/utils/stakeholder-rules.ts');
      const { stakeholderProfiles } = await import('/src/data/stakeholder-profiles.ts');

      // Create test scenario data
      const scenario = {
        metadata: {
          country: 'ScenarioLand',
          scenarioName: 'High Renewable',
          modelVersion: 'SPLAT',
          dateCreated: '2025-01-01'
        },
        milestoneYears: [2025, 2030, 2040, 2050],
        supply: {
          capacity: {
            hydro: { 2025: 200, 2030: 250, 2040: 300, 2050: 350 },
            solarPV: { 2025: 50, 2030: 200, 2040: 500, 2050: 800 },
            wind: { 2025: 10, 2030: 50, 2040: 150, 2050: 300 },
            battery: { 2025: 5, 2030: 50, 2040: 150, 2050: 250 },
            geothermal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
            biomass: { 2025: 10, 2030: 15, 2040: 20, 2050: 20 },
            coal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
            diesel: { 2025: 50, 2030: 30, 2040: 10, 2050: 0 },
            hfo: { 2025: 20, 2030: 10, 2040: 0, 2050: 0 },
            naturalGas: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
            nuclear: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
            interconnector: { 2025: 30, 2030: 50, 2040: 100, 2050: 150 }
          },
          generation: {},
          emissions: { 2025: 1.5, 2030: 0.8, 2040: 0.2, 2050: 0.05 },
          investment: {
            annual: { 2025: 200, 2030: 500, 2040: 300, 2050: 150 },
            cumulative: { 2025: 200, 2030: 2500, 2040: 6000, 2050: 8000 }
          }
        },
        demand: {
          total: { 2025: 1000, 2030: 1500, 2040: 2500, 2050: 4000 },
          peak: { 2025: 200, 2030: 300, 2040: 500, 2050: 800 },
          bySector: {
            residential: { 2025: 400, 2030: 600, 2040: 1000, 2050: 1600 },
            commercial: { 2025: 300, 2030: 450, 2040: 750, 2050: 1200 },
            industrial: { 2025: 200, 2030: 300, 2040: 500, 2050: 800 },
            transport: { 2025: 100, 2030: 150, 2040: 250, 2050: 400 }
          }
        }
      };

      // Create test derived metrics
      const derivedMetrics = {
        renewableShare: { 2025: 65, 2030: 85, 2040: 95, 2050: 98 },
        fossilShare: { 2025: 35, 2030: 15, 2040: 5, 2050: 2 },
        jobs: {
          construction: { 2025: 1000, 2030: 2500, 2040: 1500, 2050: 800 },
          operations: { 2025: 200, 2030: 500, 2040: 800, 2050: 1000 },
          total: { 2025: 1200, 2030: 3000, 2040: 2300, 2050: 1800 }
        },
        landUse: {
          totalNewLand: { 2025: 100, 2030: 500, 2040: 1200, 2050: 2000 },
          byTechnology: {
            solarPV: { 2025: 50, 2030: 200, 2040: 500, 2050: 800 },
            wind: { 2025: 40, 2030: 200, 2040: 600, 2050: 1000 },
            battery: { 2025: 10, 2030: 100, 2040: 100, 2050: 200 }
          }
        },
        emissions: {
          absolute: { 2025: 1.5, 2030: 0.8, 2040: 0.2, 2050: 0.05 },
          reductionPercent: { 2025: 0, 2030: 47, 2040: 87, 2050: 97 }
        },
        capacity: {
          totalInstalled: { 2025: 375, 2030: 655, 2040: 1230, 2050: 2070 },
          variableRenewableShare: { 2025: 16, 2030: 38, 2040: 53, 2050: 53 }
        },
        investment: {
          totalCumulative: { 2025: 200, 2030: 2500, 2040: 6000, 2050: 8000 },
          annualPeak: 500,
          averageAnnual: 320
        }
      };

      // Get Policy Makers stakeholder
      const stakeholder = stakeholderProfiles.find(s => s.id === 'policy-makers');
      if (!stakeholder) throw new Error('Policy Makers stakeholder not found');

      // Generate response
      const response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);

      return response;
    });

    // Validate response structure
    expect(result.stakeholderId).toBe('policy-makers');
    expect(result.stakeholderName).toBe('Policy Makers & Regulators');
    expect(result.generationType).toBe('rule-based');
    expect(result.initialReaction).toBeTruthy();
    expect(result.initialReaction.length).toBeGreaterThan(20);

    // Validate arrays
    expect(Array.isArray(result.appreciation)).toBe(true);
    expect(Array.isArray(result.concerns)).toBe(true);
    expect(Array.isArray(result.questions)).toBe(true);
    expect(Array.isArray(result.engagementAdvice)).toBe(true);

    // Validate questions (should be 3-5)
    expect(result.questions.length).toBeGreaterThanOrEqual(3);
    expect(result.questions.length).toBeLessThanOrEqual(5);

    // Validate engagement advice (should be 3)
    expect(result.engagementAdvice.length).toBe(3);

    // Validate timestamp
    expect(result.generatedAt).toBeTruthy();
    const timestamp = new Date(result.generatedAt);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });

  test('getMetricValue retrieves values from scenario data correctly', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { getMetricValue } = await import('/src/utils/stakeholder-rules.ts');

      const scenario = {
        metadata: { country: 'ScenarioLand', scenarioName: 'Test', modelVersion: 'SPLAT', dateCreated: '2025-01-01' },
        milestoneYears: [2030],
        supply: {
          capacity: { hydro: {}, solarPV: {}, wind: {}, battery: {}, geothermal: {}, biomass: {}, coal: {}, diesel: {}, hfo: {}, naturalGas: {}, nuclear: {}, interconnector: {} },
          generation: {},
          emissions: {},
          investment: {
            annual: {},
            cumulative: { 2030: 2500, 2050: 8000 }
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: { residential: {}, commercial: {}, industrial: {}, transport: {} }
        }
      };

      const derivedMetrics = {
        renewableShare: { 2030: 85, 2050: 98 },
        fossilShare: {},
        jobs: { construction: {}, operations: {}, total: { 2030: 3000 } },
        landUse: { totalNewLand: {}, byTechnology: { solarPV: {}, wind: {}, battery: {} } },
        emissions: { absolute: {}, reductionPercent: {} },
        capacity: { totalInstalled: {}, variableRenewableShare: {} },
        investment: { totalCumulative: {}, annualPeak: 0, averageAnnual: 0 }
      };

      return {
        investment2030: getMetricValue(scenario, derivedMetrics, 'supply.investment.cumulative.2030'),
        investment2050: getMetricValue(scenario, derivedMetrics, 'supply.investment.cumulative.2050'),
        renewableShare2030: getMetricValue(scenario, derivedMetrics, 'renewableShare.2030'),
        renewableShare2050: getMetricValue(scenario, derivedMetrics, 'renewableShare.2050'),
        jobs2030: getMetricValue(scenario, derivedMetrics, 'jobs.total.2030'),
        nonExistent: getMetricValue(scenario, derivedMetrics, 'invalid.path.2030')
      };
    });

    expect(result.investment2030).toBe(2500);
    expect(result.investment2050).toBe(8000);
    expect(result.renewableShare2030).toBe(85);
    expect(result.renewableShare2050).toBe(98);
    expect(result.jobs2030).toBe(3000);
    expect(result.nonExistent).toBe(null);
  });

  test('response generator triggers concerns when thresholds exceeded', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { generateRuleBasedResponse } = await import('/src/utils/stakeholder-rules.ts');
      const { stakeholderProfiles } = await import('/src/data/stakeholder-profiles.ts');

      // Create scenario with HIGH investment (should trigger concern for some stakeholders)
      const scenario = {
        metadata: { country: 'ScenarioLand', scenarioName: 'High Investment', modelVersion: 'SPLAT', dateCreated: '2025-01-01' },
        milestoneYears: [2030, 2050],
        supply: {
          capacity: {
            hydro: {}, solarPV: {}, wind: {}, battery: {}, geothermal: {}, biomass: {},
            coal: {}, diesel: {}, hfo: {}, naturalGas: {}, nuclear: {}, interconnector: {}
          },
          generation: {},
          emissions: { 2030: 2.0, 2050: 1.5 },  // High emissions
          investment: {
            annual: {},
            cumulative: { 2030: 10000, 2050: 25000 }  // Very high investment
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: { residential: {}, commercial: {}, industrial: {}, transport: {} }
        }
      };

      const derivedMetrics = {
        renewableShare: { 2030: 30, 2050: 50 },  // Low RE share
        fossilShare: { 2030: 70, 2050: 50 },
        jobs: { construction: {}, operations: {}, total: {} },
        landUse: { totalNewLand: {}, byTechnology: { solarPV: {}, wind: {}, battery: {} } },
        emissions: { absolute: {}, reductionPercent: { 2030: 10, 2050: 30 } },  // Low reduction
        capacity: { totalInstalled: {}, variableRenewableShare: {} },
        investment: { totalCumulative: {}, annualPeak: 0, averageAnnual: 0 }
      };

      const stakeholder = stakeholderProfiles.find(s => s.id === 'csos-ngos');
      if (!stakeholder) throw new Error('CSOs & NGOs stakeholder not found');

      const response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);

      return {
        concernCount: response.concerns.length,
        concerns: response.concerns.map(c => ({ text: c.text, severity: c.severity, metric: c.metric }))
      };
    });

    // CSOs & NGOs should have concerns about low renewable share and high emissions
    expect(result.concernCount).toBeGreaterThan(0);
    expect(result.concerns.length).toBeGreaterThan(0);

    // Each concern should have required properties
    result.concerns.forEach(concern => {
      expect(concern.text).toBeTruthy();
      expect(concern.severity).toMatch(/^(low|medium|high)$/);
      expect(concern.metric).toBeTruthy();
    });
  });

  test('response generator identifies positive indicators', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { generateRuleBasedResponse } = await import('/src/utils/stakeholder-rules.ts');
      const { stakeholderProfiles } = await import('/src/data/stakeholder-profiles.ts');

      // Create scenario with very HIGH renewable share (should trigger appreciation)
      const scenario = {
        metadata: { country: 'ScenarioLand', scenarioName: 'Very High RE', modelVersion: 'SPLAT', dateCreated: '2025-01-01' },
        milestoneYears: [2030, 2050],
        supply: {
          capacity: {
            hydro: {}, solarPV: {}, wind: {}, battery: {}, geothermal: {}, biomass: {},
            coal: {}, diesel: {}, hfo: {}, naturalGas: {}, nuclear: {}, interconnector: {}
          },
          generation: {},
          emissions: { 2030: 0.5, 2050: 0.05 },  // Very low emissions
          investment: {
            annual: {},
            cumulative: { 2030: 3000, 2050: 8000 }
          }
        },
        demand: {
          total: {},
          peak: {},
          bySector: { residential: {}, commercial: {}, industrial: {}, transport: {} }
        }
      };

      const derivedMetrics = {
        renewableShare: { 2030: 90, 2050: 99 },  // Very high RE share
        fossilShare: { 2030: 10, 2050: 1 },
        jobs: { construction: {}, operations: {}, total: { 2030: 5000, 2050: 8000 } },  // Many jobs
        landUse: { totalNewLand: {}, byTechnology: { solarPV: {}, wind: {}, battery: {} } },
        emissions: { absolute: {}, reductionPercent: { 2030: 80, 2050: 95 } },  // High reduction
        capacity: { totalInstalled: {}, variableRenewableShare: {} },
        investment: { totalCumulative: {}, annualPeak: 0, averageAnnual: 0 }
      };

      const stakeholder = stakeholderProfiles.find(s => s.id === 'csos-ngos');
      if (!stakeholder) throw new Error('CSOs & NGOs stakeholder not found');

      const response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);

      return {
        appreciationCount: response.appreciation.length,
        appreciation: response.appreciation
      };
    });

    // CSOs & NGOs should appreciate high RE share and emissions reduction
    expect(result.appreciationCount).toBeGreaterThan(0);
    result.appreciation.forEach(item => {
      expect(typeof item).toBe('string');
      expect(item.length).toBeGreaterThan(10);
    });
  });

  test('response generator works without network (offline test)', async ({ page, context }) => {
    // Load page first while online, then test offline
    await page.goto('/');

    // Now go offline
    await context.setOffline(true);

    const result = await page.evaluate(async () => {
      const { generateRuleBasedResponse } = await import('/src/utils/stakeholder-rules.ts');
      const { stakeholderProfiles } = await import('/src/data/stakeholder-profiles.ts');

      const scenario = {
        metadata: { country: 'ScenarioLand', scenarioName: 'Offline Test', modelVersion: 'SPLAT', dateCreated: '2025-01-01' },
        milestoneYears: [2030],
        supply: {
          capacity: {
            hydro: {}, solarPV: {}, wind: {}, battery: {}, geothermal: {}, biomass: {},
            coal: {}, diesel: {}, hfo: {}, naturalGas: {}, nuclear: {}, interconnector: {}
          },
          generation: {},
          emissions: {},
          investment: { annual: {}, cumulative: { 2030: 5000 } }
        },
        demand: {
          total: {},
          peak: {},
          bySector: { residential: {}, commercial: {}, industrial: {}, transport: {} }
        }
      };

      const derivedMetrics = {
        renewableShare: { 2030: 75 },
        fossilShare: {},
        jobs: { construction: {}, operations: {}, total: {} },
        landUse: { totalNewLand: {}, byTechnology: { solarPV: {}, wind: {}, battery: {} } },
        emissions: { absolute: {}, reductionPercent: {} },
        capacity: { totalInstalled: {}, variableRenewableShare: {} },
        investment: { totalCumulative: {}, annualPeak: 0, averageAnnual: 0 }
      };

      const stakeholder = stakeholderProfiles.find(s => s.id === 'policy-makers');
      if (!stakeholder) throw new Error('Policy Makers stakeholder not found');

      const response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);

      return {
        success: !!response,
        hasInitialReaction: !!response.initialReaction,
        generationType: response.generationType
      };
    });

    expect(result.success).toBe(true);
    expect(result.hasInitialReaction).toBe(true);
    expect(result.generationType).toBe('rule-based');

    // Re-enable network
    await context.setOffline(false);
  });

  test('response generator handles all 9 stakeholders', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { generateRuleBasedResponse } = await import('/src/utils/stakeholder-rules.ts');
      const { stakeholderProfiles } = await import('/src/data/stakeholder-profiles.ts');

      const scenario = {
        metadata: { country: 'Test', scenarioName: 'All Stakeholders', modelVersion: 'SPLAT', dateCreated: '2025-01-01' },
        milestoneYears: [2030],
        supply: {
          capacity: {
            hydro: {}, solarPV: {}, wind: {}, battery: {}, geothermal: {}, biomass: {},
            coal: {}, diesel: {}, hfo: {}, naturalGas: {}, nuclear: {}, interconnector: {}
          },
          generation: {},
          emissions: {},
          investment: { annual: {}, cumulative: {} }
        },
        demand: {
          total: {},
          peak: {},
          bySector: { residential: {}, commercial: {}, industrial: {}, transport: {} }
        }
      };

      const derivedMetrics = {
        renewableShare: {},
        fossilShare: {},
        jobs: { construction: {}, operations: {}, total: {} },
        landUse: { totalNewLand: {}, byTechnology: { solarPV: {}, wind: {}, battery: {} } },
        emissions: { absolute: {}, reductionPercent: {} },
        capacity: { totalInstalled: {}, variableRenewableShare: {} },
        investment: { totalCumulative: {}, annualPeak: 0, averageAnnual: 0 }
      };

      const results = [];
      for (const stakeholder of stakeholderProfiles) {
        const response = generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);
        results.push({
          id: stakeholder.id,
          name: stakeholder.name,
          hasResponse: !!response,
          hasQuestions: response.questions.length > 0,
          hasAdvice: response.engagementAdvice.length > 0
        });
      }

      return results;
    });

    expect(result.length).toBe(9);
    result.forEach(stakeholderResult => {
      expect(stakeholderResult.hasResponse).toBe(true);
      expect(stakeholderResult.hasQuestions).toBe(true);
      expect(stakeholderResult.hasAdvice).toBe(true);
    });
  });
});
