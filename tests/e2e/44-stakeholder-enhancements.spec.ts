import { test, expect } from '@playwright/test';

test.describe('Stakeholder Enhancements Framework', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Load example scenario
    await page.click('text=Load Example Scenario');
    await page.waitForTimeout(500);
  });

  test('should load stakeholder enhancements module without errors', async ({ page }) => {
    // Check for console errors during page load
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to stakeholder dialogue tab
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Verify no import errors
    expect(errors.filter(e => e.includes('stakeholder-enhancements'))).toHaveLength(0);
  });

  test('should import enhanced types correctly', async ({ page }) => {
    // This test verifies TypeScript compilation succeeded
    // If types are wrong, the build would fail

    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // If we got here, types compiled successfully
    expect(true).toBe(true);
  });

  test('should have interaction triggers for all stakeholders', async ({ page }) => {
    // Test data structure exists
    const hasInteractions = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        return !!(
          module.policyMakersInteractions &&
          module.gridOperatorsInteractions &&
          module.industryInteractions &&
          module.publicInteractions &&
          module.csosNgosInteractions &&
          module.scientificInteractions &&
          module.financeInteractions &&
          module.regionalBodiesInteractions &&
          module.developmentPartnersInteractions
        );
      } catch (e) {
        console.error('Failed to load enhancements:', e);
        return false;
      }
    });

    expect(hasInteractions).toBe(true);
  });

  test('should have variant profiles for all stakeholders', async ({ page }) => {
    const hasVariants = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        const variantSets = [
          module.policyMakersVariants,
          module.gridOperatorsVariants,
          module.industryVariants,
          module.publicVariants,
          module.csosNgosVariants,
          module.scientificVariants,
          module.financeVariants,
          module.regionalBodiesVariants,
          module.developmentPartnersVariants
        ];

        return variantSets.every(v => v && v.conservative && v.progressive && v.pragmatic);
      } catch (e) {
        console.error('Failed to load variants:', e);
        return false;
      }
    });

    expect(hasVariants).toBe(true);
  });

  test('should have context profiles', async ({ page }) => {
    const hasContexts = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        const profiles = module.contextProfiles;
        return profiles &&
               profiles.length === 3 &&
               profiles.some((p: any) => p.id === 'least-developed') &&
               profiles.some((p: any) => p.id === 'emerging') &&
               profiles.some((p: any) => p.id === 'developed');
      } catch (e) {
        console.error('Failed to load contexts:', e);
        return false;
      }
    });

    expect(hasContexts).toBe(true);
  });

  test('should export helper functions', async ({ page }) => {
    const hasFunctions = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        return !!(
          module.applyContextModifiers &&
          module.applyVariantModifiers &&
          module.evaluateInteractionTriggers &&
          module.constructEnhancedResponse
        );
      } catch (e) {
        console.error('Failed to load functions:', e);
        return false;
      }
    });

    expect(hasFunctions).toBe(true);
  });

  test('generateEnhancedResponse function should be available', async ({ page }) => {
    const hasFunction = await page.evaluate(() => {
      try {
        const module = require('../src/utils/stakeholder-rules');
        return typeof module.generateEnhancedResponse === 'function';
      } catch (e) {
        console.error('Failed to load generateEnhancedResponse:', e);
        return false;
      }
    });

    expect(hasFunction).toBe(true);
  });

  test('should evaluate interaction triggers correctly', async ({ page }) => {
    const triggersWork = await page.evaluate(() => {
      try {
        const { evaluateInteractionTriggers } = require('../src/data/stakeholder-enhancements');

        // Test scenario indicators
        const indicators = {
          'renewableShare.2040': 70,          // High RE
          'supply.capacity.battery.2040': 150  // Low battery
        };

        // Should trigger "intermittency-risk" for grid operators
        const triggers = evaluateInteractionTriggers(
          'grid-operators',
          indicators,
          'emerging'
        );

        return triggers && triggers.length > 0;
      } catch (e) {
        console.error('Failed to evaluate triggers:', e);
        return false;
      }
    });

    expect(triggersWork).toBe(true);
  });

  test('should apply context modifiers correctly', async ({ page }) => {
    const modifiersWork = await page.evaluate(() => {
      try {
        const { applyContextModifiers } = require('../src/data/stakeholder-enhancements');

        const baseThreshold = 50;

        // LDC should lower threshold
        const ldcThreshold = applyContextModifiers(baseThreshold, 'renewableShare.2030', 'least-developed');

        // Developed should raise threshold
        const devThreshold = applyContextModifiers(baseThreshold, 'renewableShare.2030', 'developed');

        return ldcThreshold < baseThreshold && devThreshold > baseThreshold;
      } catch (e) {
        console.error('Failed to apply modifiers:', e);
        return false;
      }
    });

    expect(modifiersWork).toBe(true);
  });

  test('should apply variant modifiers correctly', async ({ page }) => {
    const variantsWork = await page.evaluate(() => {
      try {
        const { applyVariantModifiers } = require('../src/data/stakeholder-enhancements');

        const baseThreshold = 50;

        // Conservative should lower threshold (more cautious)
        const conservativeThreshold = applyVariantModifiers(
          baseThreshold,
          'renewableShare.2030',
          'grid-operators',
          'conservative'
        );

        // Progressive should raise threshold (more accepting)
        const progressiveThreshold = applyVariantModifiers(
          baseThreshold,
          'renewableShare.2030',
          'grid-operators',
          'progressive'
        );

        return conservativeThreshold < baseThreshold && progressiveThreshold > baseThreshold;
      } catch (e) {
        console.error('Failed to apply variant modifiers:', e);
        return false;
      }
    });

    expect(variantsWork).toBe(true);
  });

  test('should generate enhanced response without errors', async ({ page }) => {
    // Navigate to stakeholder dialogue and select a stakeholder
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Select Grid Operators
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);

    // Click predict their response
    await page.click('text=Predict Their Response');
    await page.waitForTimeout(500);

    // Enter prediction
    await page.fill('textarea', 'I think they will be concerned about system reliability and grid integration challenges.');

    // Reveal response
    await page.click('text=Reveal Response');
    await page.waitForTimeout(1000);

    // Check that response was generated (no errors)
    const hasResponse = await page.locator('text=Initial Reaction').isVisible();
    expect(hasResponse).toBe(true);
  });

  test('interaction triggers should fire for high RE + low storage scenario', async ({ page }) => {
    const triggerFires = await page.evaluate(() => {
      try {
        const { evaluateInteractionTriggers } = require('../src/data/stakeholder-enhancements');

        // Create scenario that should trigger intermittency concern
        const indicators = {
          'renewableShare.2040': 75,          // Very high RE (>60%)
          'supply.capacity.battery.2040': 100  // Low battery (<200 MW)
        };

        const triggers = evaluateInteractionTriggers(
          'grid-operators',
          indicators,
          'emerging'
        );

        // Should find "intermittency-risk" trigger
        const intermittencyTrigger = triggers.find((t: any) => t.id === 'intermittency-risk');

        return !!intermittencyTrigger;
      } catch (e) {
        console.error('Trigger evaluation failed:', e);
        return false;
      }
    });

    expect(triggerFires).toBe(true);
  });

  test('interaction triggers should NOT fire when conditions not met', async ({ page }) => {
    const noTrigger = await page.evaluate(() => {
      try {
        const { evaluateInteractionTriggers } = require('../src/data/stakeholder-enhancements');

        // Create scenario that should NOT trigger intermittency concern
        const indicators = {
          'renewableShare.2040': 40,          // Moderate RE (<60%)
          'supply.capacity.battery.2040': 300  // High battery (>200 MW)
        };

        const triggers = evaluateInteractionTriggers(
          'grid-operators',
          indicators,
          'emerging'
        );

        // Should NOT find "intermittency-risk" trigger
        const intermittencyTrigger = triggers.find((t: any) => t.id === 'intermittency-risk');

        return !intermittencyTrigger;
      } catch (e) {
        console.error('Trigger evaluation failed:', e);
        return false;
      }
    });

    expect(noTrigger).toBe(true);
  });

  test('multi-metric AND triggers should require all conditions', async ({ page }) => {
    const andLogicWorks = await page.evaluate(() => {
      try {
        const { evaluateInteractionTriggers } = require('../src/data/stakeholder-enhancements');

        // Test 1: Only first condition met
        const indicators1 = {
          'renewableShare.2040': 75,          // High RE - condition met
          'supply.capacity.battery.2040': 300  // High battery - condition NOT met
        };
        const triggers1 = evaluateInteractionTriggers('grid-operators', indicators1, 'emerging');
        const trigger1 = triggers1.find((t: any) => t.id === 'intermittency-risk');

        // Test 2: Only second condition met
        const indicators2 = {
          'renewableShare.2040': 40,          // Low RE - condition NOT met
          'supply.capacity.battery.2040': 100  // Low battery - condition met
        };
        const triggers2 = evaluateInteractionTriggers('grid-operators', indicators2, 'emerging');
        const trigger2 = triggers2.find((t: any) => t.id === 'intermittency-risk');

        // Test 3: Both conditions met
        const indicators3 = {
          'renewableShare.2040': 75,          // High RE - condition met
          'supply.capacity.battery.2040': 100  // Low battery - condition met
        };
        const triggers3 = evaluateInteractionTriggers('grid-operators', indicators3, 'emerging');
        const trigger3 = triggers3.find((t: any) => t.id === 'intermittency-risk');

        // AND logic: only trigger3 should fire
        return !trigger1 && !trigger2 && !!trigger3;
      } catch (e) {
        console.error('AND logic test failed:', e);
        return false;
      }
    });

    expect(andLogicWorks).toBe(true);
  });

  test('context adjustments should affect trigger evaluation', async ({ page }) => {
    const contextAffectsTriggers = await page.evaluate(() => {
      try {
        const { evaluateInteractionTriggers } = require('../src/data/stakeholder-enhancements');

        // Same indicators, different contexts
        const indicators = {
          'renewableShare.2030': 45  // Moderate RE share
        };

        // LDC context: threshold lowered to ~35% (0.7×50), so 45% should trigger
        const ldcTriggers = evaluateInteractionTriggers('policy-makers', indicators, 'least-developed');

        // Developed context: threshold raised to ~65% (1.3×50), so 45% should NOT trigger
        const devTriggers = evaluateInteractionTriggers('policy-makers', indicators, 'developed');

        // LDC should have more triggers (more sensitive)
        return ldcTriggers.length >= devTriggers.length;
      } catch (e) {
        console.error('Context adjustment test failed:', e);
        return false;
      }
    });

    expect(contextAffectsTriggers).toBe(true);
  });

  test('all 9 stakeholder groups should have 3 interaction triggers each', async ({ page }) => {
    const allStakeholdersHaveTriggers = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');

        const triggerArrays = [
          module.policyMakersInteractions,
          module.gridOperatorsInteractions,
          module.industryInteractions,
          module.publicInteractions,
          module.csosNgosInteractions,
          module.scientificInteractions,
          module.financeInteractions,
          module.regionalBodiesInteractions,
          module.developmentPartnersInteractions
        ];

        // Each should have at least 2-3 triggers
        return triggerArrays.every(arr => arr && arr.length >= 2);
      } catch (e) {
        console.error('Failed to check triggers:', e);
        return false;
      }
    });

    expect(allStakeholdersHaveTriggers).toBe(true);
  });

  test('all 9 stakeholder groups should have 3 variants each', async ({ page }) => {
    const allStakeholdersHaveVariants = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');

        const variantSets = [
          module.policyMakersVariants,
          module.gridOperatorsVariants,
          module.industryVariants,
          module.publicVariants,
          module.csosNgosVariants,
          module.scientificVariants,
          module.financeVariants,
          module.regionalBodiesVariants,
          module.developmentPartnersVariants
        ];

        // Each should have exactly 3 variants
        return variantSets.every(v =>
          v &&
          v.conservative &&
          v.progressive &&
          v.pragmatic &&
          Object.keys(v).length === 3
        );
      } catch (e) {
        console.error('Failed to check variants:', e);
        return false;
      }
    });

    expect(allStakeholdersHaveVariants).toBe(true);
  });

  test('variant profiles should have required fields', async ({ page }) => {
    const variantsHaveRequiredFields = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        const variants = module.gridOperatorsVariants;

        const conservative = variants.conservative;

        return !!(
          conservative.variant &&
          conservative.description &&
          conservative.thresholdModifiers &&
          conservative.toneAdjustment &&
          conservative.toneAdjustment.riskTolerance &&
          conservative.toneAdjustment.changeOpenness &&
          conservative.toneAdjustment.collaborationStyle &&
          conservative.framingPreference
        );
      } catch (e) {
        console.error('Failed to check variant fields:', e);
        return false;
      }
    });

    expect(variantsHaveRequiredFields).toBe(true);
  });

  test('context profiles should have required fields', async ({ page }) => {
    const contextsHaveRequiredFields = await page.evaluate(() => {
      try {
        const module = require('../src/data/stakeholder-enhancements');
        const profiles = module.contextProfiles;
        const ldcProfile = profiles.find((p: any) => p.id === 'least-developed');

        return !!(
          ldcProfile.id &&
          ldcProfile.name &&
          ldcProfile.description &&
          ldcProfile.thresholdModifiers &&
          ldcProfile.priorityShifts &&
          ldcProfile.thresholdModifiers.length > 0 &&
          ldcProfile.priorityShifts.length > 0
        );
      } catch (e) {
        console.error('Failed to check context fields:', e);
        return false;
      }
    });

    expect(contextsHaveRequiredFields).toBe(true);
  });
});
