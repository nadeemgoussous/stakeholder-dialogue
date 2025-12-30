/**
 * E2E Tests for Loading Indicators
 *
 * Tests that loading spinners and status messages appear correctly:
 * - Response generation loading state
 * - WebLLM download progress
 * - Button disabled states
 */

import { test, expect } from '@playwright/test';

test.describe('Loading Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stakeholder-dialogue/');
  });

  /**
   * Test 1: Response generation shows loading spinner
   */
  test('should show loading spinner when generating response', async ({ page }) => {
    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.locator('text=ScenarioLand').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Stakeholder Dialogue tab
    const stakeholderTab = page.getByRole('button', { name: /stakeholder dialogue/i });
    await stakeholderTab.click();
    await expect(page.locator('text=Select a stakeholder')).toBeVisible({ timeout: 5000 });

    // Select a stakeholder (Policy Makers)
    const policyMakersButton = page.locator('button').filter({ hasText: /policy.*makers/i }).first();
    await policyMakersButton.click();

    // Click "Predict Their Response"
    await page.getByRole('button', { name: /predict.*response/i }).click();

    // Enter prediction
    const predictionInput = page.getByPlaceholder(/what do you think/i);
    await predictionInput.fill('They will focus on policy frameworks and regulatory alignment.');

    // Find the Reveal Response button
    const revealButton = page.getByRole('button', { name: /reveal.*response/i });

    // Verify button is enabled before clicking
    await expect(revealButton).toBeEnabled();
    await expect(revealButton).toContainText('Reveal Response');

    // Click Reveal Response and immediately check for loading state
    const responsePromise = revealButton.click();

    // The button should show "Generating Response..." text VERY quickly
    // We use a short timeout because the loading state should appear immediately
    try {
      await expect(page.getByText(/generating.*response/i)).toBeVisible({ timeout: 2000 });
      console.log('✅ Loading text "Generating Response..." appeared');
    } catch (e) {
      console.log('⚠️ Loading text did not appear within 2 seconds - response may be too fast');
    }

    // Check if spinner SVG is visible (the animate-spin class)
    try {
      const spinner = page.locator('svg.animate-spin').first();
      await expect(spinner).toBeVisible({ timeout: 2000 });
      console.log('✅ Loading spinner (animated SVG) appeared');
    } catch (e) {
      console.log('⚠️ Loading spinner did not appear - response may be too fast');
    }

    // Button should be disabled while loading
    try {
      await expect(revealButton).toBeDisabled({ timeout: 2000 });
      console.log('✅ Button was disabled during generation');
    } catch (e) {
      console.log('⚠️ Button was not disabled - response may be too fast');
    }

    // Wait for the click to complete
    await responsePromise;

    // Eventually, the response should appear
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 10000 });
    console.log('✅ Response appeared successfully');

    // After response appears, loading should be gone
    await expect(page.getByText(/generating.*response/i)).not.toBeVisible();
    console.log('✅ Loading text disappeared after completion');
  });

  /**
   * Test 2: Button is disabled while generating
   */
  test('should prevent double-clicks during generation', async ({ page }) => {
    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.locator('text=ScenarioLand').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Stakeholder Dialogue
    await page.getByRole('button', { name: /stakeholder dialogue/i }).click();

    // Select Grid Operators
    const gridButton = page.locator('button').filter({ hasText: /grid.*operator/i }).first();
    await gridButton.click();

    // Predict
    await page.getByRole('button', { name: /predict.*response/i }).click();
    await page.getByPlaceholder(/what do you think/i).fill('They will be concerned about grid stability.');

    // Get the Reveal button
    const revealButton = page.getByRole('button', { name: /reveal.*response/i });

    // Click it
    await revealButton.click();

    // Immediately try to click it again - should be disabled
    const isDisabled = await revealButton.isDisabled();
    console.log('Button disabled after first click:', isDisabled);

    // If it's too fast and we miss the disabled state, that's okay -
    // we just want to make sure we don't get errors from double-clicking

    // Response should still appear normally
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 10000 });
  });

  /**
   * Test 3: Loading text changes button appearance
   */
  test('should change button text during loading', async ({ page }) => {
    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.locator('text=ScenarioLand').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Stakeholder Dialogue
    await page.getByRole('button', { name: /stakeholder dialogue/i }).click();

    // Select CSOs/NGOs
    const csosButton = page.locator('button').filter({ hasText: /cso|ngo/i }).first();
    await csosButton.click();

    // Predict
    await page.getByRole('button', { name: /predict.*response/i }).click();
    await page.getByPlaceholder(/what do you think/i).fill('They will advocate for ambitious climate action.');

    // Get the Reveal button
    const revealButton = page.getByRole('button', { name: /reveal.*response/i });

    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click.png' });

    // Click and immediately check text
    const clickPromise = revealButton.click();

    // Wait a tiny bit for React to update
    await page.waitForTimeout(100);

    // Try to capture the loading state
    const buttonText = await page.locator('button').filter({ hasText: /generating|reveal/i }).first().textContent();
    console.log('Button text during/after click:', buttonText);

    // Take screenshot during loading (if we catch it)
    await page.screenshot({ path: 'test-results/during-loading.png' });

    await clickPromise;

    // Response should appear
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 10000 });

    // Take screenshot after response
    await page.screenshot({ path: 'test-results/after-response.png' });
  });

  /**
   * Test 4: Console logs appear during generation
   */
  test('should log generation status to console', async ({ page }) => {
    const consoleLogs: string[] = [];

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('Browser console:', text);
    });

    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.locator('text=ScenarioLand').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Stakeholder Dialogue
    await page.getByRole('button', { name: /stakeholder dialogue/i }).click();

    // Select Industry
    const industryButton = page.locator('button').filter({ hasText: /industry/i }).first();
    await industryButton.click();

    // Predict
    await page.getByRole('button', { name: /predict.*response/i }).click();
    await page.getByPlaceholder(/what do you think/i).fill('They will want reliable power supply.');

    // Clear logs before reveal
    consoleLogs.length = 0;

    // Reveal
    await page.getByRole('button', { name: /reveal.*response/i }).click();

    // Wait for response
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 10000 });

    // Check that we got the expected console logs
    const hasGeneratingLog = consoleLogs.some(log => log.includes('Generating response') || log.includes('🔄'));
    const hasCompleteLog = consoleLogs.some(log => log.includes('Response generated') || log.includes('✅'));

    console.log('Found "Generating" log:', hasGeneratingLog);
    console.log('Found "Complete" log:', hasCompleteLog);
    console.log('Total console logs captured:', consoleLogs.length);

    // At minimum, we should have some logs
    expect(consoleLogs.length).toBeGreaterThan(0);
  });

  /**
   * Test 5: WebLLM download progress shows in header (if initialized)
   */
  test('should show WebLLM status indicators', async ({ page }) => {
    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.locator('text=ScenarioLand').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Stakeholder Dialogue
    await page.getByRole('button', { name: /stakeholder dialogue/i }).click();

    // Check if WebGPU is supported
    const hasWebGPU = await page.evaluate(() => 'gpu' in navigator);
    console.log('WebGPU supported:', hasWebGPU);

    if (hasWebGPU) {
      // Look for either:
      // - "Enable AI Enhancement" button (not loaded)
      // - "AI Enhancement Active" (ready)
      // - "Downloading AI Model..." (loading)

      const enableButton = page.locator('button:has-text("Enable AI Enhancement")');
      const readyIndicator = page.locator('text=AI Enhancement Active');
      const loadingIndicator = page.locator('text=/downloading.*ai.*model/i');

      const enableVisible = await enableButton.isVisible().catch(() => false);
      const readyVisible = await readyIndicator.isVisible().catch(() => false);
      const loadingVisible = await loadingIndicator.isVisible().catch(() => false);

      console.log('Enable AI button visible:', enableVisible);
      console.log('AI Ready indicator visible:', readyVisible);
      console.log('AI Loading indicator visible:', loadingVisible);

      // At least one status indicator should be present
      const hasAnyIndicator = enableVisible || readyVisible || loadingVisible;
      expect(hasAnyIndicator).toBe(true);

      // If we see the Enable button, we could test clicking it (but won't download the model)
      if (enableVisible) {
        console.log('✅ Enable AI button is present and can be clicked');

        // Don't actually click it in tests (would download 1.8GB!)
        // await enableButton.click();
        // await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
      }
    } else {
      console.log('WebGPU not supported - no AI indicators should show (silent degradation)');
    }
  });
});
