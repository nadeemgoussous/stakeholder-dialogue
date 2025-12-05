import { test, expect } from '@playwright/test';

test.describe('Input Mode Switching (F015 Fix)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('can switch from example to quick entry', async ({ page }) => {
    // Load example first
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Click Quick Entry button
    await page.getByTestId('quick-entry-button').click();

    // Should show the quick entry form
    await expect(page.getByTestId('quick-entry-form')).toBeVisible({ timeout: 5000 });

    // Preview should be hidden
    await expect(page.getByTestId('scenario-preview')).not.toBeVisible();
  });

  test('can switch from example to paste', async ({ page }) => {
    // Load example first
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Click Paste JSON button
    await page.getByTestId('paste-json-button').click();

    // Should show the paste placeholder
    await expect(page.getByTestId('paste-placeholder')).toBeVisible();

    // Preview should be hidden
    await expect(page.getByTestId('scenario-preview')).not.toBeVisible();
  });

  test('shows "Load Different Scenario" button in preview', async ({ page }) => {
    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Should show load different button
    const loadDifferentButton = page.getByTestId('load-different-button');
    await expect(loadDifferentButton).toBeVisible();
    await expect(loadDifferentButton).toContainText('Load Different Scenario');
  });

  test('clicking "Load Different Scenario" clears the scenario', async ({ page }) => {
    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Click load different
    await page.getByTestId('load-different-button').click();

    // Should hide the preview
    await expect(page.getByTestId('scenario-preview')).not.toBeVisible();

    // Should show the three input option buttons again
    await expect(page.getByTestId('load-example-button')).toBeVisible();
    await expect(page.getByTestId('paste-json-button')).toBeVisible();
    await expect(page.getByTestId('quick-entry-button')).toBeVisible();
  });

  test('can load example, clear, then use quick entry', async ({ page }) => {
    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Clear it
    await page.getByTestId('load-different-button').click();
    await page.waitForTimeout(500);

    // Now use quick entry
    await page.getByTestId('quick-entry-button').click();

    // Should show quick entry form
    await expect(page.getByTestId('quick-entry-form')).toBeVisible({ timeout: 5000 });
  });

  test('can cancel quick entry and return to options', async ({ page }) => {
    // Click quick entry
    await page.getByTestId('quick-entry-button').click();
    await page.waitForSelector('[data-testid="quick-entry-form"]', { timeout: 5000 });

    // Click cancel
    await page.getByText('Cancel').click();

    // Should show the three input option buttons again
    await expect(page.getByTestId('load-example-button')).toBeVisible();
    await expect(page.getByTestId('paste-json-button')).toBeVisible();
    await expect(page.getByTestId('quick-entry-button')).toBeVisible();
  });

  test('can cancel paste and return to options', async ({ page }) => {
    // Click paste
    await page.getByTestId('paste-json-button').click();
    await page.waitForSelector('[data-testid="paste-placeholder"]', { timeout: 5000 });

    // Click back to options
    await page.getByText('← Back to options').click();

    // Should show the three input option buttons again
    await expect(page.getByTestId('load-example-button')).toBeVisible();
    await expect(page.getByTestId('paste-json-button')).toBeVisible();
    await expect(page.getByTestId('quick-entry-button')).toBeVisible();
  });

  test.skip('quick entry form submission shows preview with load different button', async ({ page }) => {
    // Open quick entry
    await page.getByTestId('quick-entry-button').click();
    await page.waitForSelector('[data-testid="quick-entry-form"]', { timeout: 5000 });

    // Fill form using the correct test IDs from F012 tests
    await page.getByTestId('country-select').selectOption('Kenya');
    await page.getByTestId('scenario-name-input').fill('Test Scenario');
    await page.getByTestId('renewable-capacity-2030').fill('1000');
    await page.getByTestId('fossil-capacity-2030').fill('500');
    await page.getByTestId('battery-capacity-2030').fill('100');
    await page.getByTestId('renewable-capacity-2040').fill('2000');
    await page.getByTestId('fossil-capacity-2040').fill('300');
    await page.getByTestId('battery-capacity-2040').fill('200');
    await page.getByTestId('total-investment-2030').fill('1000');
    await page.getByTestId('total-investment-2050').fill('3000');
    await page.getByTestId('emissions-2025').fill('10');
    await page.getByTestId('emissions-2030').fill('8');
    await page.getByTestId('emissions-2050').fill('3');
    await page.getByTestId('peak-demand-2030').fill('2000');
    await page.getByTestId('peak-demand-2040').fill('3000');

    // Submit
    await page.getByTestId('submit-quick-entry').click();

    // Should show preview
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 5000 });

    // Should have load different button
    await expect(page.getByTestId('load-different-button')).toBeVisible();
  });

  test.skip('scenario persists when switching tabs and back', async ({ page }) => {
    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Get the country name
    const country = await page.getByTestId('preview-country').textContent();

    // Switch to Dialogue tab
    await page.getByRole('button', { name: 'Stakeholder Dialogue' }).click();
    await page.waitForTimeout(500);

    // Switch back to Input tab
    await page.getByRole('button', { name: 'Input' }).click();
    await page.waitForTimeout(500);

    // Scenario should still be loaded
    await expect(page.getByTestId('scenario-preview')).toBeVisible();
    await expect(page.getByTestId('preview-country')).toContainText(country || '');
  });

  test('can load different example after clearing', async ({ page }) => {
    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    const firstCountry = await page.getByTestId('preview-country').textContent();

    // Clear and load again
    await page.getByTestId('load-different-button').click();
    await page.waitForTimeout(500);

    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    const secondCountry = await page.getByTestId('preview-country').textContent();

    // Should be the same example (Rwanda)
    expect(firstCountry).toBe(secondCountry);
  });

  test('input method buttons are always visible and clickable', async ({ page }) => {
    // Buttons should be visible initially
    await expect(page.getByTestId('load-example-button')).toBeVisible();
    await expect(page.getByTestId('paste-json-button')).toBeVisible();
    await expect(page.getByTestId('quick-entry-button')).toBeVisible();

    // Load example
    await page.getByTestId('load-example-button').click();
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });

    // Buttons should still be visible
    await expect(page.getByTestId('load-example-button')).toBeVisible();
    await expect(page.getByTestId('paste-json-button')).toBeVisible();
    await expect(page.getByTestId('quick-entry-button')).toBeVisible();

    // And clickable
    await expect(page.getByTestId('load-example-button')).toBeEnabled();
    await expect(page.getByTestId('paste-json-button')).toBeEnabled();
    await expect(page.getByTestId('quick-entry-button')).toBeEnabled();
  });
});
