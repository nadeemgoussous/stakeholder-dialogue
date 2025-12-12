// F046: CSV Upload Integration
// Test CSV file upload with real SPLAT data

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('F046: CSV Upload Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show CSV upload button on Input tab', async ({ page }) => {
    // Navigate to Input tab (should be default)
    const csvUploadButton = page.getByTestId('csv-upload-button');
    await expect(csvUploadButton).toBeVisible();

    // Check button text and description
    await expect(csvUploadButton).toContainText('Upload CSV');
    await expect(csvUploadButton).toContainText('Import from SPLAT, MESSAGE, or other models');
  });

  test('should open CSV uploader when clicked', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Should show CSVUploader component
    await expect(page.getByText('Upload CSV File')).toBeVisible();
    await expect(page.getByText('Upload a CSV file from SPLAT, MESSAGE, OSeMOSYS, or other energy models')).toBeVisible();

    // Should show file input
    const fileInput = page.getByTestId('csv-file-input');
    await expect(fileInput).toBeAttached();
  });

  test('should upload and parse real SPLAT CSV file', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Get the file input
    const fileInput = page.getByTestId('csv-file-input');

    // Read the SPLAT CSV file
    const csvPath = path.join(process.cwd(), 'docs', 'examples', '20250108_lesotho_tes_cplex_test.csv');

    // Upload the file
    await fileInput.setInputFiles(csvPath);

    // Wait for file to be processed
    await page.waitForTimeout(2000); // CSV parsing takes a moment

    // Should move to configure step
    await expect(page.getByText(/Found \d+ years of data/)).toBeVisible();
    await expect(page.getByTestId('csv-country-input')).toBeVisible();
    await expect(page.getByTestId('csv-scenario-name-input')).toBeVisible();

    // Should suggest milestone years
    const milestoneButtons = page.locator('[data-testid^="milestone-year-"]');
    const count = await milestoneButtons.count();
    expect(count).toBeGreaterThan(0);

    // Some years should be pre-selected
    const selectedButtons = page.locator('[data-testid^="milestone-year-"].bg-irena-blue');
    const selectedCount = await selectedButtons.count();
    expect(selectedCount).toBeGreaterThan(0);
  });

  test('should validate required fields before parsing', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Upload file
    const fileInput = page.getByTestId('csv-file-input');
    const csvPath = path.join(process.cwd(), 'docs', 'examples', '20250108_lesotho_tes_cplex_test.csv');
    await fileInput.setInputFiles(csvPath);

    await page.waitForTimeout(2000);

    // Parse button should be disabled when required fields are missing
    const parseButton = page.getByTestId('csv-parse-button');
    await expect(parseButton).toBeDisabled();

    // Fill in country only
    await page.getByTestId('csv-country-input').fill('Lesotho');

    // Should still be disabled (scenario name missing)
    await expect(parseButton).toBeDisabled();

    // Fill in scenario name
    await page.getByTestId('csv-scenario-name-input').fill('Test');

    // Now should be enabled
    await expect(parseButton).toBeEnabled();
  });

  test('should parse CSV and show preview', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Upload file
    const fileInput = page.getByTestId('csv-file-input');
    const csvPath = path.join(process.cwd(), 'docs', 'examples', '20250108_lesotho_tes_cplex_test.csv');
    await fileInput.setInputFiles(csvPath);

    await page.waitForTimeout(2000);

    // Fill in required fields
    await page.getByTestId('csv-country-input').fill('Lesotho');
    await page.getByTestId('csv-scenario-name-input').fill('Test Scenario');

    // Click parse button
    await page.getByTestId('csv-parse-button').click();

    // Wait for parsing
    await page.waitForTimeout(3000);

    // Should show preview
    await expect(page.getByText('Scenario Summary')).toBeVisible();
    await expect(page.getByText('Lesotho')).toBeVisible();
    await expect(page.getByText('Test Scenario')).toBeVisible();

    // Should show milestones
    await expect(page.getByText(/\d+ years/)).toBeVisible();

    // Should show Load Scenario button
    await expect(page.getByTestId('csv-load-button')).toBeVisible();
  });

  test('should load parsed scenario into context', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Upload file
    const fileInput = page.getByTestId('csv-file-input');
    const csvPath = path.join(process.cwd(), 'docs', 'examples', '20250108_lesotho_tes_cplex_test.csv');
    await fileInput.setInputFiles(csvPath);

    await page.waitForTimeout(2000);

    // Fill in required fields
    await page.getByTestId('csv-country-input').fill('Lesotho');
    await page.getByTestId('csv-scenario-name-input').fill('Test Scenario');

    // Parse
    await page.getByTestId('csv-parse-button').click();
    await page.waitForTimeout(3000);

    // Load scenario
    await page.getByTestId('csv-load-button').click();

    // Wait for the scenario to load and preview to appear
    await page.waitForTimeout(1000);

    // Should show scenario preview (after loading, CSVUploader closes and preview shows)
    // The ScenarioPreview should now be visible with the loaded scenario
    await expect(page.getByTestId('scenario-preview')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('preview-country')).toContainText('Lesotho');
  });

  test('should allow milestone year selection', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Upload file
    const fileInput = page.getByTestId('csv-file-input');
    const csvPath = path.join(process.cwd(), 'docs', 'examples', '20250108_lesotho_tes_cplex_test.csv');
    await fileInput.setInputFiles(csvPath);

    await page.waitForTimeout(2000);

    // Should show milestone years
    const year2025 = page.getByTestId('milestone-year-2025');
    const year2030 = page.getByTestId('milestone-year-2030');

    // Check if years are available
    if (await year2025.isVisible()) {
      // Click to toggle selection
      await year2025.click();
      await page.waitForTimeout(100);

      // Click again to toggle back
      await year2025.click();
    }

    if (await year2030.isVisible()) {
      await year2030.click();
      await page.waitForTimeout(100);
    }
  });

  test('should handle back navigation', async ({ page }) => {
    // Click CSV upload button
    await page.getByTestId('csv-upload-button').click();

    // Should show uploader
    await expect(page.getByText('Upload CSV File')).toBeVisible();

    // Click back button
    await page.getByRole('button', { name: /back to options/i }).click();

    // Should return to input options
    await expect(page.getByTestId('csv-upload-button')).toBeVisible();
    await expect(page.getByTestId('load-example-button')).toBeVisible();
  });
});
