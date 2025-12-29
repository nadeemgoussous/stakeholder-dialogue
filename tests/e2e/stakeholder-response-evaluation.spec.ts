/**
 * Stakeholder Response Evaluation Tests
 *
 * This test suite evaluates the robustness and realism of stakeholder responses
 * across different scenario types and input variations.
 *
 * Output: Detailed console logs showing response patterns for manual evaluation
 */

import { test, expect } from '@playwright/test';

test.describe('Stakeholder Response Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');
  });

  /**
   * Test 1: High Renewable Ambition Scenario
   * Expected: CSOs/NGOs very positive, Grid Operators concerned about integration
   */
  test('Scenario 1: High Renewable Ambition (70% RE by 2030)', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST SCENARIO 1: HIGH RENEWABLE AMBITION');
    console.log('='.repeat(100));

    // Load example scenario
    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(1000);

    // Navigate to Stakeholder Dialogue tab
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Test all 9 stakeholders
    const stakeholders = [
      'Policy Makers & Regulators',
      'Grid Operators',
      'Industry & Business',
      'Public & Communities',
      'CSOs & NGOs',
      'Scientific Institutions',
      'Financial Institutions',
      'Regional Bodies',
      'Development Partners'
    ];

    for (const stakeholder of stakeholders) {
      console.log('\n' + '-'.repeat(100));
      console.log(`STAKEHOLDER: ${stakeholder}`);
      console.log('-'.repeat(100));

      // Select stakeholder
      await page.click(`button:has-text("${stakeholder}")`);
      await page.waitForTimeout(500);

      // Skip prediction and reveal directly (for testing purposes)
      const predictionInput = page.locator('textarea[placeholder*="predict"]');
      if (await predictionInput.isVisible()) {
        await predictionInput.fill('Test prediction for evaluation purposes');
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(500);
      }

      // Extract response data
      const initialReaction = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
      console.log(`\nInitial Reaction:\n  ${initialReaction || 'NOT FOUND'}`);

      // Extract appreciation points
      const appreciationSection = page.locator('[data-testid="appreciation"], .appreciation, h3:has-text("Appreciation")');
      if (await appreciationSection.count() > 0) {
        const appreciationItems = await appreciationSection.locator('+ ul li, + div li').allTextContents();
        console.log(`\nAppreciation Points (${appreciationItems.length}):`);
        appreciationItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item}`);
        });
      }

      // Extract concerns
      const concernsSection = page.locator('[data-testid="concerns"], .concerns, h3:has-text("Concerns")');
      if (await concernsSection.count() > 0) {
        const concernItems = await concernsSection.locator('+ ul li, + div li, + div > div').allTextContents();
        console.log(`\nConcerns (${concernItems.length}):`);
        concernItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item}`);
        });
      }

      // Extract questions
      const questionsSection = page.locator('[data-testid="questions"], .questions, h3:has-text("Questions")');
      if (await questionsSection.count() > 0) {
        const questionItems = await questionsSection.locator('+ ul li, + div li').allTextContents();
        console.log(`\nTypical Questions (${questionItems.length}):`);
        questionItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item}`);
        });
      }

      // Extract engagement advice
      const adviceSection = page.locator('[data-testid="engagement-advice"], .engagement-advice, h3:has-text("Engagement Advice")');
      if (await adviceSection.count() > 0) {
        const adviceItems = await adviceSection.locator('+ ul li, + div li').allTextContents();
        console.log(`\nEngagement Advice (${adviceItems.length}):`);
        adviceItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item}`);
        });
      }

      // Go back to stakeholder selection for next iteration
      const backButton = page.locator('button:has-text("Back"), button:has-text("Try Another")');
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(300);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('SCENARIO 1 COMPLETE');
    console.log('='.repeat(100) + '\n');
  });

  /**
   * Test 2: Fossil Fuel Dependent (BAU) Scenario
   * Expected: CSOs/NGOs very concerned, Industry less worried
   */
  test('Scenario 2: Business as Usual (Low RE, continued coal)', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST SCENARIO 2: BUSINESS AS USUAL (FOSSIL DEPENDENT)');
    console.log('='.repeat(100));

    // Load custom low-RE scenario via quick entry
    await page.click('button:has-text("Quick Entry")');
    await page.waitForTimeout(500);

    // Fill in low-ambition scenario data
    await page.fill('input[name="scenarioName"]', 'Low Ambition BAU');
    await page.fill('input[name="country"]', 'Test Country');

    // Set low RE share for 2030
    const reShare2030 = page.locator('input[placeholder*="Renewable"], input[name*="reShare"]').first();
    await reShare2030.fill('25');

    // Set high fossil capacity
    const fossilCapacity = page.locator('input[placeholder*="Fossil"], input[name*="fossil"]').first();
    await fossilCapacity.fill('2000');

    // Set renewable capacity (low)
    const renewableCapacity = page.locator('input[placeholder*="Renewable Capacity"], input[name*="renewables"]').first();
    await renewableCapacity.fill('600');

    // Set minimal battery
    const battery = page.locator('input[placeholder*="Storage"], input[name*="storage"]').first();
    await battery.fill('50');

    // Set emissions (high)
    const emissions = page.locator('input[placeholder*="Emissions"], input[name*="emissions"]').first();
    await emissions.fill('4.5');

    // Set investment (low)
    const investment = page.locator('input[placeholder*="Investment"], input[name*="investment"]').first();
    await investment.fill('800');

    // Submit
    const loadButton = page.locator('button:has-text("Load Scenario")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to Stakeholder Dialogue tab
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Test key stakeholders that should show strong reactions
    const keyStakeholders = [
      'CSOs & NGOs',           // Should be very concerned
      'Policy Makers & Regulators', // Should have concerns about climate goals
      'Financial Institutions',     // Should have stranded asset concerns
      'Industry & Business'          // Might be positive (cheap fossil)
    ];

    for (const stakeholder of keyStakeholders) {
      console.log('\n' + '-'.repeat(100));
      console.log(`STAKEHOLDER: ${stakeholder}`);
      console.log('-'.repeat(100));

      await page.click(`button:has-text("${stakeholder}")`);
      await page.waitForTimeout(500);

      const predictionInput = page.locator('textarea[placeholder*="predict"]');
      if (await predictionInput.isVisible()) {
        await predictionInput.fill('Test prediction');
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(500);
      }

      const initialReaction = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
      console.log(`\nInitial Reaction:\n  ${initialReaction || 'NOT FOUND'}`);

      const backButton = page.locator('button:has-text("Back"), button:has-text("Try Another")');
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(300);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('SCENARIO 2 COMPLETE');
    console.log('='.repeat(100) + '\n');
  });

  /**
   * Test 3: Context and Variant Sensitivity
   * Test if enhanced responses differ based on development context and stakeholder variant
   */
  test('Context & Variant Sensitivity Testing', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST 3: CONTEXT & VARIANT SENSITIVITY');
    console.log('='.repeat(100));

    // Load example scenario
    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(1000);

    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Select a stakeholder
    await page.click('button:has-text("Grid Operators")');
    await page.waitForTimeout(500);

    // Check if Response Settings are available (from F044 enhancement)
    const contextSelector = page.locator('select[name="context"], select:has(option:text("Least Developed"))');
    const variantSelector = page.locator('select[name="variant"], select:has(option:text("Conservative"))');

    if (await contextSelector.count() > 0 && await variantSelector.count() > 0) {
      console.log('\n✅ Enhanced response features detected (F044)');

      // Test 1: Conservative variant in least-developed context
      console.log('\n' + '-'.repeat(100));
      console.log('Configuration: Least Developed + Conservative Grid Operator');
      console.log('-'.repeat(100));

      await contextSelector.selectOption('least-developed');
      await variantSelector.selectOption('conservative');
      await page.waitForTimeout(300);

      const predictionInput1 = page.locator('textarea[placeholder*="predict"]');
      if (await predictionInput1.isVisible()) {
        await predictionInput1.fill('Test conservative response');
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(500);
      }

      const reaction1 = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
      console.log(`\nConservative Reaction:\n  ${reaction1}`);

      // Go back
      const backButton1 = page.locator('button:has-text("Back"), button:has-text("Try Another")');
      if (await backButton1.count() > 0) {
        await backButton1.first().click();
        await page.waitForTimeout(300);
      }

      // Test 2: Progressive variant in developed context
      console.log('\n' + '-'.repeat(100));
      console.log('Configuration: Developed + Progressive Grid Operator');
      console.log('-'.repeat(100));

      await page.click('button:has-text("Grid Operators")');
      await page.waitForTimeout(500);

      await contextSelector.selectOption('developed');
      await variantSelector.selectOption('progressive');
      await page.waitForTimeout(300);

      const predictionInput2 = page.locator('textarea[placeholder*="predict"]');
      if (await predictionInput2.isVisible()) {
        await predictionInput2.fill('Test progressive response');
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(500);
      }

      const reaction2 = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
      console.log(`\nProgressive Reaction:\n  ${reaction2}`);

      console.log('\n📊 COMPARISON:');
      console.log(`Conservative response length: ${reaction1?.length || 0} chars`);
      console.log(`Progressive response length: ${reaction2?.length || 0} chars`);
      console.log(`Responses are different: ${reaction1 !== reaction2 ? 'YES ✅' : 'NO ❌'}`);

    } else {
      console.log('\n⚠️  Enhanced response features (F044) not yet implemented');
      console.log('Skipping context/variant sensitivity tests');
    }

    console.log('\n' + '='.repeat(100));
    console.log('CONTEXT & VARIANT TEST COMPLETE');
    console.log('='.repeat(100) + '\n');
  });

  /**
   * Test 4: Metric Threshold Sensitivity
   * Test if responses change appropriately when metrics cross thresholds
   */
  test('Metric Threshold Sensitivity Analysis', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST 4: METRIC THRESHOLD SENSITIVITY ANALYSIS');
    console.log('='.repeat(100));

    const scenarios = [
      {
        name: 'Very Low Investment (500M)',
        investment: '500',
        expectedConcern: 'Financial Institutions should be less concerned (low risk)'
      },
      {
        name: 'High Investment (12000M)',
        investment: '12000',
        expectedConcern: 'Financial Institutions should raise bankability concerns'
      },
      {
        name: 'Very Low Jobs (500)',
        jobs: '500',
        expectedConcern: 'Policy Makers should raise employment concerns'
      },
      {
        name: 'High Jobs (15000)',
        jobs: '15000',
        expectedConcern: 'Policy Makers should praise job creation'
      }
    ];

    for (const scenario of scenarios) {
      console.log('\n' + '-'.repeat(100));
      console.log(`Testing: ${scenario.name}`);
      console.log(`Expected: ${scenario.expectedConcern}`);
      console.log('-'.repeat(100));

      // For this test, we'll just log the expectation
      // Actual implementation would require modifying scenario data programmatically
      console.log('⚠️  This test requires programmatic scenario manipulation');
      console.log('   Manual testing recommended for threshold validation');
    }

    console.log('\n' + '='.repeat(100));
    console.log('THRESHOLD SENSITIVITY ANALYSIS COMPLETE');
    console.log('='.repeat(100) + '\n');
  });

  /**
   * Test 5: Response Consistency
   * Verify that same scenario produces consistent responses (rule-based should be deterministic)
   */
  test('Response Consistency Check', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST 5: RESPONSE CONSISTENCY (DETERMINISM CHECK)');
    console.log('='.repeat(100));

    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(1000);

    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    // Generate response 3 times for same stakeholder
    const responses: string[] = [];

    for (let i = 0; i < 3; i++) {
      console.log(`\nIteration ${i + 1}/3:`);

      await page.click('button:has-text("Policy Makers")');
      await page.waitForTimeout(500);

      const predictionInput = page.locator('textarea[placeholder*="predict"]');
      if (await predictionInput.isVisible()) {
        await predictionInput.fill(`Test iteration ${i + 1}`);
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(500);
      }

      const reaction = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
      responses.push(reaction || '');
      console.log(`  Response: ${reaction?.substring(0, 80)}...`);

      const backButton = page.locator('button:has-text("Back"), button:has-text("Try Another")');
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await page.waitForTimeout(300);
      }
    }

    console.log('\n📊 CONSISTENCY ANALYSIS:');
    const allSame = responses.every(r => r === responses[0]);
    console.log(`All responses identical: ${allSame ? 'YES ✅' : 'NO ❌'}`);

    if (!allSame) {
      console.log('\n⚠️  WARNING: Rule-based responses should be deterministic!');
      responses.forEach((r, i) => {
        console.log(`\nResponse ${i + 1}: ${r}`);
      });
    }

    console.log('\n' + '='.repeat(100));
    console.log('CONSISTENCY CHECK COMPLETE');
    console.log('='.repeat(100) + '\n');
  });

  /**
   * Test 6: All Stakeholder Coverage
   * Verify all 9 stakeholders produce responses without errors
   */
  test('All Stakeholder Coverage Test', async ({ page }) => {
    console.log('\n' + '='.repeat(100));
    console.log('TEST 6: ALL STAKEHOLDER COVERAGE (ERROR CHECK)');
    console.log('='.repeat(100));

    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(1000);

    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);

    const stakeholders = [
      'Policy Makers & Regulators',
      'Grid Operators',
      'Industry & Business',
      'Public & Communities',
      'CSOs & NGOs',
      'Scientific Institutions',
      'Financial Institutions',
      'Regional Bodies',
      'Development Partners'
    ];

    const results: Record<string, boolean> = {};

    for (const stakeholder of stakeholders) {
      try {
        await page.click(`button:has-text("${stakeholder}")`);
        await page.waitForTimeout(300);

        const predictionInput = page.locator('textarea[placeholder*="predict"]');
        if (await predictionInput.isVisible()) {
          await predictionInput.fill('Coverage test');
          await page.click('button:has-text("Reveal Response")');
          await page.waitForTimeout(300);
        }

        const reaction = await page.locator('[data-testid="initial-reaction"], .initial-reaction, h3:has-text("Initial Reaction") + p').first().textContent();
        results[stakeholder] = !!reaction && reaction.length > 10;

        console.log(`${stakeholder.padEnd(35)} ${results[stakeholder] ? '✅ PASS' : '❌ FAIL'}`);

        const backButton = page.locator('button:has-text("Back"), button:has-text("Try Another")');
        if (await backButton.count() > 0) {
          await backButton.first().click();
          await page.waitForTimeout(200);
        }
      } catch (error) {
        results[stakeholder] = false;
        console.log(`${stakeholder.padEnd(35)} ❌ ERROR: ${error}`);
      }
    }

    const passCount = Object.values(results).filter(v => v).length;
    console.log(`\n📊 COVERAGE SUMMARY: ${passCount}/${stakeholders.length} stakeholders working`);

    console.log('\n' + '='.repeat(100));
    console.log('COVERAGE TEST COMPLETE');
    console.log('='.repeat(100) + '\n');
  });
});
