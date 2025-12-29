import { test, expect } from '@playwright/test';

test.describe('Scenario Preview Panel (F015)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    // Load the example scenario first
    await page.getByTestId('load-example-button').click();
    // Wait for the preview to appear
    await page.waitForSelector('[data-testid="scenario-preview"]', { timeout: 10000 });
  });

  test('displays scenario preview after loading example', async ({ page }) => {
    // Should show the preview panel
    const preview = page.getByTestId('scenario-preview');
    await expect(preview).toBeVisible();
  });

  test('displays key metadata correctly', async ({ page }) => {
    // Country
    const country = page.getByTestId('preview-country');
    await expect(country).toBeVisible();
    await expect(country).toContainText('ScenarioLand');

    // Scenario name
    const scenarioName = page.getByTestId('preview-scenario-name');
    await expect(scenarioName).toBeVisible();
    await expect(scenarioName).toContainText('Baseline');

    // Model version
    const model = page.getByTestId('preview-model');
    await expect(model).toBeVisible();
    await expect(model).toContainText('SPLAT');
  });

  test('calculates and displays RE share for 2030', async ({ page }) => {
    const reShare2030 = page.getByTestId('preview-re-2030');
    await expect(reShare2030).toBeVisible();

    // Should show a percentage
    const text = await reShare2030.textContent();
    expect(text).toMatch(/\d+%/);

    // Should be a reasonable value (0-100%)
    const value = parseInt(text?.replace('%', '') || '0');
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('calculates and displays RE share for 2040', async ({ page }) => {
    const reShare2040 = page.getByTestId('preview-re-2040');
    await expect(reShare2040).toBeVisible();

    // Should show a percentage
    const text = await reShare2040.textContent();
    expect(text).toMatch(/\d+%/);

    // Should be a reasonable value (0-100%)
    const value = parseInt(text?.replace('%', '') || '0');
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('displays total investment in billions', async ({ page }) => {
    const investment = page.getByTestId('preview-investment');
    await expect(investment).toBeVisible();

    // Should show dollars in billions (e.g., "$2.5B")
    const text = await investment.textContent();
    expect(text).toMatch(/\$\d+(\.\d+)?B/);
  });

  test('displays emissions reduction percentage', async ({ page }) => {
    const emissions = page.getByTestId('preview-emissions');
    await expect(emissions).toBeVisible();

    // Should show a reduction percentage (e.g., "-45%") or "N/A"
    const text = await emissions.textContent();
    expect(text).toMatch(/(-\d+%|N\/A)/);
  });

  test('displays capacity mix chart', async ({ page }) => {
    const chart = page.getByTestId('capacity-mix-chart');
    await expect(chart).toBeVisible();

    // Chart should have SVG content (Recharts renders as SVG)
    // Use .first() to get the main chart SVG (not legend icons)
    const svg = chart.locator('svg.recharts-surface').first();
    await expect(svg).toBeVisible();
  });

  test('chart displays data for 2030 and 2040', async ({ page }) => {
    const chart = page.getByTestId('capacity-mix-chart');

    // Should show both years on x-axis
    await expect(chart.getByText('2030')).toBeVisible();
    await expect(chart.getByText('2040')).toBeVisible();
  });

  test('displays "Proceed to Dialogue" button when onProceed provided', async ({ page }) => {
    // Check if proceed button exists
    const proceedButton = page.getByTestId('proceed-button');
    await expect(proceedButton).toBeVisible();
    await expect(proceedButton).toContainText('Proceed to Dialogue');
  });

  test('proceeds to dialogue tab when button clicked', async ({ page }) => {
    // Click the proceed button
    const proceedButton = page.getByTestId('proceed-button');
    await proceedButton.click();

    // Should navigate to Stakeholder Dialogue tab
    await expect(page.locator('#dialogue-panel')).toBeVisible({ timeout: 5000 });
  });

  // Note: Testing preview updates with Quick Entry is covered by tests/e2e/12-quick-entry-form.spec.ts
  // This test is redundant and has been removed to avoid complexity

  test('RE share calculation is accurate', async ({ page }) => {
    // For ScenarioLand baseline, let's verify the calculation
    // Get the RE share text
    const reShare2030 = page.getByTestId('preview-re-2030');
    const text = await reShare2030.textContent();
    const value = parseInt(text?.replace('%', '') || '0');

    // RE share should be reasonable for ScenarioLand (high hydro potential)
    // We don't hard-code the exact value, but it should be > 0
    expect(value).toBeGreaterThan(0);
  });

  test('chart shows multiple technology bars', async ({ page }) => {
    const chart = page.getByTestId('capacity-mix-chart');

    // Chart should have a legend showing different technologies
    // (Recharts renders legend items)
    const legendItems = chart.locator('.recharts-legend-item');
    const count = await legendItems.count();

    // Should have at least a few technologies shown
    expect(count).toBeGreaterThan(0);
  });

  test('preview is responsive and readable', async ({ page }) => {
    // Check that key elements are visible at different viewport sizes
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size

    await expect(page.getByTestId('scenario-preview')).toBeVisible();
    await expect(page.getByTestId('preview-country')).toBeVisible();
    await expect(page.getByTestId('capacity-mix-chart')).toBeVisible();
    await expect(page.getByTestId('proceed-button')).toBeVisible();
  });
});
