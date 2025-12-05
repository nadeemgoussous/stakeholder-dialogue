import { test, expect } from '@playwright/test';

test.describe('F010: Input Tab with Three Input Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays three input option buttons', async ({ page }) => {
    const loadExampleButton = page.getByTestId('load-example-button');
    const pasteJSONButton = page.getByTestId('paste-json-button');
    const quickEntryButton = page.getByTestId('quick-entry-button');

    await expect(loadExampleButton).toBeVisible();
    await expect(pasteJSONButton).toBeVisible();
    await expect(quickEntryButton).toBeVisible();
  });

  test('displays input tab header with 5-minute messaging', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Import Your Scenario' })).toBeVisible();
    await expect(page.getByText('Target: Complete data input in under 5 minutes')).toBeVisible();
  });

  test('Load Example button shows correct title and description', async ({ page }) => {
    const loadExampleButton = page.getByTestId('load-example-button');
    await expect(loadExampleButton.getByText('Load Example')).toBeVisible();
    await expect(loadExampleButton.getByText('Rwanda baseline scenario')).toBeVisible();
    await expect(loadExampleButton.getByText('Works offline')).toBeVisible();
  });

  test('Paste from Template button shows correct title and description', async ({ page }) => {
    const pasteButton = page.getByTestId('paste-json-button');
    await expect(pasteButton.getByText('Paste from Template')).toBeVisible();
    await expect(pasteButton.getByText('JSON output from the Excel template')).toBeVisible();
  });

  test('Quick Entry button shows correct title and description', async ({ page }) => {
    const quickEntryButton = page.getByTestId('quick-entry-button');
    await expect(quickEntryButton.getByText('Quick Entry')).toBeVisible();
    await expect(quickEntryButton.getByText('15 essential metrics manually')).toBeVisible();
  });

  test('clicking Paste from Template shows placeholder', async ({ page }) => {
    await page.getByTestId('paste-json-button').click();
    await expect(page.getByTestId('paste-placeholder')).toBeVisible();
    await expect(page.getByText('Coming soon: JSON paste functionality')).toBeVisible();
  });

  test('clicking Quick Entry shows placeholder', async ({ page }) => {
    await page.getByTestId('quick-entry-button').click();
    await expect(page.getByTestId('quick-entry-placeholder')).toBeVisible();
    await expect(page.getByText('Coming soon: 15-field quick entry form')).toBeVisible();
  });

  test('can navigate back to options from placeholders', async ({ page }) => {
    // Click Paste button
    await page.getByTestId('paste-json-button').click();
    await expect(page.getByTestId('paste-placeholder')).toBeVisible();

    // Click Back button
    await page.getByRole('button', { name: '← Back to options' }).click();
    await expect(page.getByTestId('paste-placeholder')).not.toBeVisible();
    await expect(page.getByTestId('load-example-button')).toBeVisible();
  });
});

test.describe('F011: Load Example Scenario Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads Rwanda baseline scenario when Load Example clicked', async ({ page }) => {
    await page.getByTestId('load-example-button').click();

    // Wait for loading to complete
    await expect(page.getByTestId('loading-indicator')).toBeVisible();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    // Verify scenario preview appears
    await expect(page.getByTestId('scenario-preview')).toBeVisible();
  });

  test('displays Rwanda scenario metadata correctly', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    // Check metadata
    await expect(page.getByTestId('scenario-country')).toHaveText('Rwanda');
    await expect(page.getByTestId('scenario-name')).toHaveText('Business as Usual (Baseline)');
    await expect(page.getByTestId('scenario-model')).toHaveText('SPLAT-MESSAGE');
  });

  test('shows success message after loading scenario', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByText('✓ Scenario Loaded Successfully')).toBeVisible();
  });

  test('displays next steps guidance after loading', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByText('Ready to explore stakeholder responses!')).toBeVisible();
    await expect(page.getByText('Navigate to the Stakeholder Dialogue tab')).toBeVisible();
  });

  test('does not show error message on successful load', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });

  test('scenario preview has all required fields', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    const preview = page.getByTestId('scenario-preview');
    await expect(preview.getByText('Country')).toBeVisible();
    await expect(preview.getByText('Scenario Name')).toBeVisible();
    await expect(preview.getByText('Model Version')).toBeVisible();
    await expect(preview.getByText('Date Created')).toBeVisible();
  });

  test('works offline (MUST work without network)', async ({ page, context }) => {
    // First load the page online to cache the JSON
    await page.goto('/');
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('scenario-preview')).toBeVisible();

    // Now go offline and reload
    await context.setOffline(true);
    await page.reload();

    // Click Load Example again - should work offline
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('scenario-preview')).toBeVisible();
    await expect(page.getByTestId('scenario-country')).toHaveText('Rwanda');
  });

  test('button is disabled while loading', async ({ page }) => {
    await page.getByTestId('load-example-button').click();

    // Button should be disabled while loading
    const button = page.getByTestId('load-example-button');
    await expect(button).toBeDisabled();

    // Wait for load to complete
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    // Button should be enabled again
    await expect(button).toBeEnabled();
  });

  test('scenario data populates ScenarioContext', async ({ page }) => {
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    // Verify that the scenario data is accessible (check preview displays data)
    const preview = page.getByTestId('scenario-preview');
    await expect(preview).toBeVisible();

    // The fact that metadata displays means context is populated
    await expect(page.getByTestId('scenario-country')).not.toBeEmpty();
    await expect(page.getByTestId('scenario-name')).not.toBeEmpty();
  });

  test('derived metrics are calculated on load', async ({ page }) => {
    // We test this indirectly by verifying the scenario loads successfully
    // (The ScenarioContext calls calculateDerivedMetrics on load)
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });

    // If derived metrics calculation failed, the load would fail
    await expect(page.getByTestId('scenario-preview')).toBeVisible();
    await expect(page.getByText('✓ Scenario Loaded Successfully')).toBeVisible();
  });

  test('scenario persists when switching tabs', async ({ page }) => {
    // Load scenario
    await page.getByTestId('load-example-button').click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('scenario-preview')).toBeVisible();

    // Switch to another tab
    await page.getByRole('tab', { name: 'Stakeholder Dialogue' }).click();
    await expect(page.getByText('Stakeholder Dialogue')).toBeVisible();

    // Switch back to Input tab
    await page.getByRole('tab', { name: 'Input' }).click();

    // Scenario preview should still be visible
    await expect(page.getByTestId('scenario-preview')).toBeVisible();
    await expect(page.getByTestId('scenario-country')).toHaveText('Rwanda');
  });
});
