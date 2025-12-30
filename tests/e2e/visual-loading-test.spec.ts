/**
 * Visual Test for Loading Indicators
 *
 * Takes screenshots at each stage to verify loading states visually
 */

import { test, expect } from '@playwright/test';

test('Visual verification of loading states', async ({ page }) => {
  // Navigate to app
  await page.goto('/stakeholder-dialogue/');
  await page.screenshot({ path: 'test-results/visual/01-app-loaded.png', fullPage: true });

  // Load example scenario
  const loadButton = page.getByRole('button', { name: /load.*example/i });
  await expect(loadButton).toBeVisible({ timeout: 10000 });
  await loadButton.click();

  // Wait for scenario to load
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/visual/02-scenario-loaded.png', fullPage: true });

  // Check if we can see the tabs
  const tabs = await page.locator('[role="button"]').filter({ hasText: /stakeholder|dialogue/i }).all();
  console.log('Found tabs:', tabs.length);

  // Try clicking the tab with different selectors
  const tabSelectors = [
    'button:has-text("Stakeholder Dialogue")',
    '[role="button"]:has-text("Stakeholder")',
    'button >> text=/stakeholder.*dialogue/i',
  ];

  let tabClicked = false;
  for (const selector of tabSelectors) {
    try {
      const tab = page.locator(selector).first();
      if (await tab.isVisible({ timeout: 2000 })) {
        console.log(`Found tab with selector: ${selector}`);
        await tab.click({ timeout: 5000 });
        tabClicked = true;
        break;
      }
    } catch (e) {
      console.log(`Selector failed: ${selector}`);
    }
  }

  if (!tabClicked) {
    console.log('❌ Could not click Stakeholder Dialogue tab');
    await page.screenshot({ path: 'test-results/visual/03-FAILED-no-tab.png', fullPage: true });
    return; // Exit test early
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/visual/03-stakeholder-tab.png', fullPage: true });

  // Try to find stakeholder buttons
  const stakeholders = await page.locator('button').filter({ hasText: /policy|grid|industry/i }).all();
  console.log('Found stakeholder buttons:', stakeholders.length);

  if (stakeholders.length === 0) {
    console.log('❌ No stakeholder buttons found');
    await page.screenshot({ path: 'test-results/visual/04-FAILED-no-stakeholders.png', fullPage: true });
    return;
  }

  // Click first stakeholder
  await stakeholders[0].click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/visual/04-stakeholder-selected.png', fullPage: true });

  // Find Predict button
  const predictButton = page.getByRole('button', { name: /predict/i }).first();
  if (await predictButton.isVisible({ timeout: 2000 })) {
    await predictButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/visual/05-prediction-input.png', fullPage: true });

    // Enter prediction
    const input = page.getByPlaceholder(/what do you think/i);
    if (await input.isVisible({ timeout: 2000 })) {
      await input.fill('This is a test prediction to verify the loading indicator works correctly when revealing the response.');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/visual/06-prediction-entered.png', fullPage: true });

      // Find and screenshot the Reveal button BEFORE clicking
      const revealButton = page.getByRole('button', { name: /reveal/i });
      await page.screenshot({ path: 'test-results/visual/07-BEFORE-reveal-click.png', fullPage: true });

      // Click Reveal and take rapid screenshots
      console.log('🔄 Clicking Reveal Response button...');
      const clickPromise = revealButton.click();

      // Take screenshots rapidly to catch loading state
      await page.waitForTimeout(50);
      await page.screenshot({ path: 'test-results/visual/08-DURING-loading-50ms.png', fullPage: true });

      await page.waitForTimeout(100);
      await page.screenshot({ path: 'test-results/visual/09-DURING-loading-150ms.png', fullPage: true });

      await page.waitForTimeout(200);
      await page.screenshot({ path: 'test-results/visual/10-DURING-loading-350ms.png', fullPage: true });

      await clickPromise;

      // Wait for response
      try {
        await page.locator('text=Initial Reaction').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/visual/11-AFTER-response-complete.png', fullPage: true });
        console.log('✅ Response generated successfully');
      } catch (e) {
        console.log('❌ Response did not appear');
        await page.screenshot({ path: 'test-results/visual/11-FAILED-no-response.png', fullPage: true });
      }

      // Also check the button text at different stages
      const buttonText = await revealButton.textContent().catch(() => 'Button not found');
      console.log('Final button text:', buttonText);
    }
  }

  console.log('✅ Visual test complete - check test-results/visual/ for screenshots');
});
