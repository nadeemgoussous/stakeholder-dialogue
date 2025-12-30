/**
 * Simple test to verify loading spinner appears
 */

import { test, expect } from '@playwright/test';

test('Check if loading spinner appears on Reveal Response button', async ({ page }) => {
  console.log('🔍 Starting simple loading check...');

  // Navigate
  await page.goto('/stakeholder-dialogue/');
  await page.waitForTimeout(1000);
  console.log('✅ App loaded');

  // Load example
  await page.click('button:has-text("Load")');
  await page.waitForTimeout(2000);
  console.log('✅ Example loaded');

  // Click Stakeholder Dialogue tab
  await page.click('button:has-text("Stakeholder Dialogue")');
  await page.waitForTimeout(1000);
  console.log('✅ Stakeholder tab opened');

  // Click first stakeholder
  const firstStakeholder = await page.locator('button').filter({ hasText: /policy|grid|industry/i }).first();
  await firstStakeholder.click();
  await page.waitForTimeout(500);
  console.log('✅ Stakeholder selected');

  // Click Predict button
  await page.click('button:has-text("Predict")');
  await page.waitForTimeout(500);
  console.log('✅ Prediction page opened');

  // Fill prediction (look for textarea, not just placeholder)
  const textarea = await page.locator('textarea').first();
  await textarea.fill('This is a test prediction with enough characters to meet the minimum requirement.');
  await page.waitForTimeout(500);
  console.log('✅ Prediction entered');

  // Find Reveal button
  const revealButton = page.locator('button:has-text("Reveal Response")');

  // Check button BEFORE clicking
  const textBefore = await revealButton.textContent();
  console.log('📝 Button text BEFORE click:', textBefore);
  await page.screenshot({ path: 'test-results/visual/button-before.png' });

  // Check if button has loading-related classes or text
  const htmlBefore = await revealButton.innerHTML();
  console.log('📝 Button HTML BEFORE click:', htmlBefore.substring(0, 200));

  // Click and check immediately
  const clickPromise = revealButton.click();

  // Wait tiny bit for React to re-render
  await page.waitForTimeout(100);

  // Check button DURING loading
  try {
    const textDuring = await revealButton.textContent({ timeout: 500 });
    console.log('📝 Button text DURING (100ms after click):', textDuring);

    const htmlDuring = await revealButton.innerHTML();
    console.log('📝 Button HTML DURING:', htmlDuring.substring(0, 200));

    // Check if it contains "Generating" text
    if (textDuring?.includes('Generating')) {
      console.log('✅✅✅ LOADING TEXT FOUND: "Generating Response..."');
    } else {
      console.log('⚠️ No "Generating" text found');
    }

    // Check for spinner SVG
    const spinner = page.locator('svg.animate-spin');
    const spinnerVisible = await spinner.isVisible().catch(() => false);
    console.log('🔄 Spinner visible:', spinnerVisible);

    if (spinnerVisible) {
      console.log('✅✅✅ SPINNER SVG FOUND');
    }

    await page.screenshot({ path: 'test-results/visual/button-during.png' });
  } catch (e) {
    console.log('⚠️ Could not check during state - too fast!');
  }

  // Wait for click to complete
  await clickPromise;
  await page.waitForTimeout(500);

  // Check button AFTER response
  const textAfter = await revealButton.textContent().catch(() => 'Button not found');
  console.log('📝 Button text AFTER response:', textAfter);
  await page.screenshot({ path: 'test-results/visual/button-after.png' });

  // Check if response appeared
  const responseVisible = await page.locator('text=Initial Reaction').isVisible({ timeout: 10000 }).catch(() => false);
  console.log('✅ Response visible:', responseVisible);

  if (responseVisible) {
    await page.screenshot({ path: 'test-results/visual/response-complete.png' });
  }

  // Check console logs for the emoji logs we added
  console.log('\n🔍 Summary:');
  console.log('- Button text changed:', textBefore !== textAfter);
  console.log('- Response appeared:', responseVisible);
});
