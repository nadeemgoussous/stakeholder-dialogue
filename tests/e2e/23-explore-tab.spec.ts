import { test, expect } from '@playwright/test';

/**
 * F023: Explore Impacts Tab Tests
 *
 * Tests the Explore tab with directional sliders for adjusting scenario parameters.
 * Critical: This tool shows DIRECTIONAL impacts only, not precise calculations.
 */

test.describe('F023: Explore Impacts Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/Scenario Dialogue Tool/);
  });

  test('shows "no scenario loaded" message when no scenario is loaded', async ({ page }) => {
    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Should show warning message
    await expect(page.locator('text=⚠️ No Scenario Loaded')).toBeVisible();
    await expect(page.locator('text=Please load a scenario from the Input tab')).toBeVisible();
  });

  test('displays sliders after loading example scenario', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check header and description
    await expect(page.locator('h2:has-text("Explore Impacts")')).toBeVisible();
    await expect(page.locator('text=Use the sliders below to explore')).toBeVisible();

    // Check all three sliders are present
    await expect(page.locator('label:has-text("Renewable Energy Share 2030")')).toBeVisible();
    await expect(page.locator('label:has-text("Renewable Energy Share 2040")')).toBeVisible();
    await expect(page.locator('label:has-text("Coal Phaseout Year")')).toBeVisible();
  });

  test('displays prominent disclaimer per CLAUDE.md', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check disclaimer is prominent and visible
    const disclaimer = page.locator('text=⚠️ DIRECTIONAL INDICATORS ONLY');
    await expect(disclaimer).toBeVisible();

    // Check disclaimer has amber/yellow styling (warning but not alarming)
    const disclaimerBox = page.locator('div.bg-amber-50.border-amber-300');
    await expect(disclaimerBox).toBeVisible();

    // Check key disclaimer text
    await expect(page.locator('text=do NOT recalculate technical feasibility')).toBeVisible();
    await expect(page.locator('text=Always verify changes in your full energy system optimization model')).toBeVisible();
  });

  test('displays base values from loaded scenario', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check that base values are displayed
    const baseValueLabels = page.locator('text=/Base: \\d+%?/');
    const count = await baseValueLabels.count();
    expect(count).toBeGreaterThan(0);

    // Check RE share base values are visible
    await expect(page.locator('label:has-text("Renewable Energy Share 2030") >> .. >> text=/Base: \\d+%/')).toBeVisible();
    await expect(page.locator('label:has-text("Renewable Energy Share 2040") >> .. >> text=/Base: \\d+%/')).toBeVisible();
  });

  test('allows adjusting RE share 2030 slider', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Find and adjust the RE 2030 slider
    const slider = page.locator('input#re-share-2030[type="range"]');
    await expect(slider).toBeVisible();

    // Get initial value
    const initialValue = await slider.inputValue();

    // Adjust slider to 75%
    await slider.fill('75');

    // Verify adjusted value is shown
    await expect(page.locator('text=/→ 75%/')).toBeVisible();

    // Verify value changed
    const newValue = await slider.inputValue();
    expect(newValue).toBe('75');
    expect(newValue).not.toBe(initialValue);
  });

  test('allows adjusting RE share 2040 slider', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Find and adjust the RE 2040 slider
    const slider = page.locator('input#re-share-2040[type="range"]');
    await expect(slider).toBeVisible();

    // Adjust slider to 90%
    await slider.fill('90');

    // Verify adjusted value is shown
    await expect(page.locator('text=/→ 90%/')).toBeVisible();
  });

  test('allows adjusting coal phaseout year slider', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Find and adjust the coal phaseout slider
    const slider = page.locator('input#coal-phaseout[type="range"]');
    await expect(slider).toBeVisible();

    // Adjust slider to 2035
    await slider.fill('2035');

    // Verify adjusted value is shown
    await expect(page.locator('text=/→ 2035/')).toBeVisible();
  });

  test('shows reset button after making adjustments', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Reset button should not be visible initially
    await expect(page.locator('button:has-text("Reset to Base Scenario")')).not.toBeVisible();

    // Make an adjustment
    const slider = page.locator('input#re-share-2030[type="range"]');
    await slider.fill('80');

    // Reset button should now be visible
    await expect(page.locator('button:has-text("Reset to Base Scenario")')).toBeVisible();
  });

  test('reset button restores base values', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Get initial value
    const slider = page.locator('input#re-share-2030[type="range"]');
    const initialValue = await slider.inputValue();

    // Make an adjustment
    await slider.fill('85');
    await expect(page.locator('text=/→ 85%/')).toBeVisible();

    // Click reset button
    await page.click('button:has-text("Reset to Base Scenario")');

    // Verify value is restored
    const restoredValue = await slider.inputValue();
    expect(restoredValue).toBe(initialValue);

    // Reset button should hide
    await expect(page.locator('button:has-text("Reset to Base Scenario")')).not.toBeVisible();

    // Adjusted value indicator should disappear
    await expect(page.locator('text=/→ 85%/')).not.toBeVisible();
  });

  test('displays placeholder for future directional impacts (F024-F025)', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check placeholder section exists
    await expect(page.locator('h3:has-text("Directional Impacts")')).toBeVisible();
    await expect(page.locator('text=Adjust parameters above to see directional impacts')).toBeVisible();
    await expect(page.locator('text=Coming soon in F024-F025')).toBeVisible();
  });

  test('slider ranges are appropriate (0-100% for RE, 2025-2050 for coal)', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check RE 2030 slider range
    const reSlider2030 = page.locator('input#re-share-2030[type="range"]');
    await expect(reSlider2030).toHaveAttribute('min', '0');
    await expect(reSlider2030).toHaveAttribute('max', '100');
    await expect(reSlider2030).toHaveAttribute('step', '5');

    // Check RE 2040 slider range
    const reSlider2040 = page.locator('input#re-share-2040[type="range"]');
    await expect(reSlider2040).toHaveAttribute('min', '0');
    await expect(reSlider2040).toHaveAttribute('max', '100');
    await expect(reSlider2040).toHaveAttribute('step', '5');

    // Check coal phaseout slider range
    const coalSlider = page.locator('input#coal-phaseout[type="range"]');
    await expect(coalSlider).toHaveAttribute('min', '2025');
    await expect(coalSlider).toHaveAttribute('max', '2050');
    await expect(coalSlider).toHaveAttribute('step', '5');
  });

  test('sliders have proper labels and accessibility attributes', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Check all sliders have proper id and labels
    await expect(page.locator('label[for="re-share-2030"]')).toBeVisible();
    await expect(page.locator('label[for="re-share-2040"]')).toBeVisible();
    await expect(page.locator('label[for="coal-phaseout"]')).toBeVisible();

    // Check sliders have IDs
    await expect(page.locator('input#re-share-2030')).toBeVisible();
    await expect(page.locator('input#re-share-2040')).toBeVisible();
    await expect(page.locator('input#coal-phaseout')).toBeVisible();
  });

  test('multiple adjustments work together', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });

    // Navigate to Explore tab
    await page.click('button[role="tab"]:has-text("Explore Impacts")');

    // Adjust all three sliders
    await page.locator('input#re-share-2030').fill('70');
    await page.locator('input#re-share-2040').fill('95');
    await page.locator('input#coal-phaseout').fill('2030');

    // Verify all adjustments are shown
    await expect(page.locator('text=/→ 70%/').first()).toBeVisible();
    await expect(page.locator('text=/→ 95%/')).toBeVisible();
    await expect(page.locator('text=/→ 2030/')).toBeVisible();

    // Reset should clear all
    await page.click('button:has-text("Reset to Base Scenario")');

    // Verify all adjusted indicators disappear
    await expect(page.locator('text=/→ 70%/')).not.toBeVisible();
    await expect(page.locator('text=/→ 95%/')).not.toBeVisible();
  });
});
