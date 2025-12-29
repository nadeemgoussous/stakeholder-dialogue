/**
 * F030 - Scenario Comparison Tool Tests
 *
 * Tests the scenario comparison demo tool that shows BAU vs User Scenario vs High Ambition
 * benchmarks for CSOs/NGOs and Scientific stakeholders.
 */

import { test, expect } from '@playwright/test';

test.describe('F030 - Scenario Comparison Tool', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');

    // Wait for app to load
    await page.waitForSelector('text=Scenario Dialogue Tool', { timeout: 10000 });

    // Load sample scenario first (required for Communication tab)
    await page.click('button:has-text("Load Example")');
    await page.waitForSelector('text=ScenarioLand', { timeout: 5000 });

    // Navigate to Communication tab
    await page.click('text=Communicate');
    await page.waitForTimeout(300);
  });

  test('should require scenario to be loaded', async ({ page }) => {
    // Start fresh without scenario
    await page.goto('/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Scenario Dialogue Tool', { timeout: 10000 });

    // Go directly to Communication tab without loading scenario
    await page.click('text=Communicate');
    await page.waitForTimeout(300);

    // Should show scenario required message
    await expect(page.getByText('Load a Scenario to Get Started')).toBeVisible();
  });

  test('should not show comparison button for non-CSO/Scientific stakeholders', async ({ page }) => {
    // Select Policy Makers
    await page.click('text=Policy Makers');
    await page.waitForTimeout(300);

    // Should not show comparison demo button
    await expect(page.getByRole('button', { name: /Launch Scenario Comparison Demo/i })).not.toBeVisible();

    // Select Industry
    await page.click('text=Industry');
    await page.waitForTimeout(300);

    // Should still not show comparison demo button
    await expect(page.getByRole('button', { name: /Launch Scenario Comparison Demo/i })).not.toBeVisible();
  });

  test('should show comparison button for CSOs/NGOs stakeholder', async ({ page }) => {
    // Select CSOs/NGOs
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);

    // Should show comparison demo button
    await expect(page.getByRole('button', { name: /Launch Scenario Comparison Demo/i })).toBeVisible();
  });

  test('should show comparison button for Scientific stakeholder', async ({ page }) => {
    // Select Scientific
    await page.click('text=Scientific');
    await page.waitForTimeout(300);

    // Should show comparison demo button
    await expect(page.getByRole('button', { name: /Launch Scenario Comparison Demo/i })).toBeVisible();
  });

  test('should launch comparison tool when button clicked', async ({ page }) => {
    // Select CSOs/NGOs
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);

    // Click launch button
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show comparison tool header
    await expect(page.getByText('Scenario Comparison Tool')).toBeVisible();
    await expect(page.getByText('Compare your scenario against Business as Usual and High Ambition')).toBeVisible();
  });

  test('should display three scenarios in comparison table', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show all three scenarios in the table
    await expect(page.getByRole('table').getByText('Business as Usual', { exact: true })).toBeVisible();
    await expect(page.getByRole('table').getByText('High Ambition')).toBeVisible();
    // User scenario name appears in table header
    const tableHeaders = page.locator('table th');
    await expect(tableHeaders).toHaveCount(4); // Metric + 3 scenarios
  });

  test('should display comparison metrics', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show metric rows in the table
    await expect(page.locator('table').getByText('Renewable Energy Share (2030)')).toBeVisible();
    await expect(page.locator('table').getByText(/Emissions Reduction by 20\d{2}/)).toBeVisible();
    await expect(page.locator('table').getByText('Total Investment (USD billion)')).toBeVisible();
    await expect(page.locator('table').getByText('Jobs Created')).toBeVisible();
  });

  test('should display visual bar chart', async ({ page }) => {
    // Select Scientific and launch comparison
    await page.click('text=Scientific');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show RE share bar chart title
    await expect(page.getByText(/Renewable Energy Share by 20\d{2}/)).toBeVisible();

    // Should show all three scenarios in bar format
    const bars = page.locator('.rounded-full.h-8');
    await expect(bars).toHaveCount(3);
  });

  test('should show stakeholder-specific narrative for CSOs/NGOs', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show CSO-specific narrative heading
    await expect(page.getByRole('heading', { name: /Climate Justice Perspective/i })).toBeVisible();

    // Should mention key CSO themes in the narrative
    const narrativeSection = page.locator('.leading-relaxed').first();
    await expect(narrativeSection).toContainText(/climate|vulnerable|communities/i);
  });

  test('should show stakeholder-specific narrative for Scientific', async ({ page }) => {
    // Select Scientific and launch comparison
    await page.click('text=Scientific');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show Scientific-specific narrative heading
    await expect(page.getByRole('heading', { name: /Scientific Analysis/i })).toBeVisible();

    // Should mention scientific themes in the narrative
    const narrativeSection = page.locator('.leading-relaxed').first();
    await expect(narrativeSection).toContainText(/IPCC|carbon budget|sectoral/i);
  });

  test('should have export CSV functionality', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should have export button
    const exportButton = page.getByRole('button', { name: /Export as CSV/i });
    await expect(exportButton).toBeVisible();

    // Set up download handler
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportButton.click(),
    ]);

    // Verify download
    expect(download.suggestedFilename()).toMatch(/scenario-comparison.*\.csv$/);
  });

  test('should display disclaimer about illustrative benchmarks', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show disclaimer
    await expect(page.getByText('ILLUSTRATIVE BENCHMARKS ONLY')).toBeVisible();
    await expect(page.getByText(/simplified assumptions/i)).toBeVisible();
  });

  test('should navigate back to strategies view', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Verify we're in comparison view
    await expect(page.getByText('Scenario Comparison Tool')).toBeVisible();

    // Click back button
    await page.click('text=Back to Strategies');
    await page.waitForTimeout(300);

    // Should be back in strategies view, stakeholder still selected
    await expect(page.getByText('Select Stakeholder Audience')).toBeVisible();
    // CSOs/NGOs button should still be highlighted
    const csosButton = page.locator('button:has-text("CSOs & NGOs")');
    await expect(csosButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show teaching example notice', async ({ page }) => {
    // Select Scientific and launch comparison
    await page.click('text=Scientific');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show teaching notice
    await expect(page.getByText('This is a Teaching Example')).toBeVisible();
  });

  test('should show educational context about why comparison works', async ({ page }) => {
    // Select CSOs/NGOs and launch comparison
    await page.click('text=CSOs & NGOs');
    await page.waitForTimeout(300);
    await page.click('text=Launch Scenario Comparison Demo');
    await page.waitForTimeout(300);

    // Should show educational section
    await expect(page.getByText('Why Scenario Comparison Works')).toBeVisible();
    await expect(page.getByText('Provides context')).toBeVisible();
    await expect(page.getByText('Identifies gaps')).toBeVisible();
    await expect(page.getByText('Builds urgency')).toBeVisible();
  });
});
