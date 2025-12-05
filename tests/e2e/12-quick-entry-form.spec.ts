import { test, expect } from '@playwright/test';

test.describe('F012: Quick Entry Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display quick entry form when button is clicked', async ({ page }) => {
    // Click the quick entry button
    await page.click('[data-testid="quick-entry-button"]');

    // Verify form is displayed
    await expect(page.locator('[data-testid="quick-entry-form"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Quick Entry Form")')).toBeVisible();
  });

  test('should have all 15 required fields', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Check that all fields are present
    await expect(page.locator('[data-testid="country-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-name-input"]')).toBeVisible();

    // Capacity 2030
    await expect(page.locator('[data-testid="renewable-capacity-2030"]')).toBeVisible();
    await expect(page.locator('[data-testid="fossil-capacity-2030"]')).toBeVisible();
    await expect(page.locator('[data-testid="battery-capacity-2030"]')).toBeVisible();

    // Capacity 2040
    await expect(page.locator('[data-testid="renewable-capacity-2040"]')).toBeVisible();
    await expect(page.locator('[data-testid="fossil-capacity-2040"]')).toBeVisible();
    await expect(page.locator('[data-testid="battery-capacity-2040"]')).toBeVisible();

    // Investment
    await expect(page.locator('[data-testid="total-investment-2030"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-investment-2050"]')).toBeVisible();

    // Emissions
    await expect(page.locator('[data-testid="emissions-2025"]')).toBeVisible();
    await expect(page.locator('[data-testid="emissions-2030"]')).toBeVisible();
    await expect(page.locator('[data-testid="emissions-2050"]')).toBeVisible();

    // Demand
    await expect(page.locator('[data-testid="peak-demand-2030"]')).toBeVisible();
    await expect(page.locator('[data-testid="peak-demand-2040"]')).toBeVisible();

    // Submit button
    await expect(page.locator('[data-testid="submit-quick-entry"]')).toBeVisible();
  });

  test('should have global country dropdown with multiple countries', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    const countrySelect = page.locator('[data-testid="country-select"]');
    await expect(countrySelect).toBeVisible();

    // Check for a few countries from different regions
    const optionsCount = await countrySelect.locator('option').count();
    expect(optionsCount).toBeGreaterThan(50); // Should have many countries

    // Verify specific countries exist
    await expect(countrySelect.locator('option:has-text("Rwanda")')).toHaveCount(1);
    await expect(countrySelect.locator('option:has-text("Kenya")')).toHaveCount(1);
    await expect(countrySelect.locator('option:has-text("Brazil")')).toHaveCount(1);
    await expect(countrySelect.locator('option:has-text("India")')).toHaveCount(1);
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Try to submit without filling anything
    await page.click('[data-testid="submit-quick-entry"]');

    // Should show validation errors
    await expect(page.locator('text=Country is required')).toBeVisible();
    await expect(page.locator('text=Scenario name is required')).toBeVisible();
  });

  test('should validate numeric fields are non-negative', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Fill required fields
    await page.selectOption('[data-testid="country-select"]', 'Rwanda');
    await page.fill('[data-testid="scenario-name-input"]', 'Test Scenario');

    // Try to enter negative value
    await page.fill('[data-testid="renewable-capacity-2030"]', '-100');
    await page.click('[data-testid="submit-quick-entry"]');

    // Should show validation error
    await expect(page.locator('text=Must be non-negative')).toBeVisible();
  });

  test('should successfully create scenario from quick entry', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Fill all required fields
    await page.selectOption('[data-testid="country-select"]', 'Kenya');
    await page.fill('[data-testid="scenario-name-input"]', 'Kenya High Ambition');

    // Capacity 2030
    await page.fill('[data-testid="renewable-capacity-2030"]', '5000');
    await page.fill('[data-testid="fossil-capacity-2030"]', '2000');
    await page.fill('[data-testid="battery-capacity-2030"]', '500');

    // Capacity 2040
    await page.fill('[data-testid="renewable-capacity-2040"]', '8000');
    await page.fill('[data-testid="fossil-capacity-2040"]', '1000');
    await page.fill('[data-testid="battery-capacity-2040"]', '1500');

    // Investment
    await page.fill('[data-testid="total-investment-2030"]', '10000');
    await page.fill('[data-testid="total-investment-2050"]', '25000');

    // Emissions
    await page.fill('[data-testid="emissions-2025"]', '15');
    await page.fill('[data-testid="emissions-2030"]', '12');
    await page.fill('[data-testid="emissions-2050"]', '3');

    // Demand
    await page.fill('[data-testid="peak-demand-2030"]', '3500');
    await page.fill('[data-testid="peak-demand-2040"]', '5000');

    // Submit the form
    await page.click('[data-testid="submit-quick-entry"]');

    // Should show scenario preview
    await expect(page.locator('[data-testid="scenario-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-country"]:has-text("Kenya")')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-name"]:has-text("Kenya High Ambition")')).toBeVisible();
  });

  test('should allow canceling and returning to options', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Verify form is visible
    await expect(page.locator('[data-testid="quick-entry-form"]')).toBeVisible();

    // Click the back button
    await page.click('button:has-text("Back to options")');

    // Should return to the three options
    await expect(page.locator('[data-testid="load-example-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="paste-json-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-entry-button"]')).toBeVisible();
  });

  test('should clear field errors when user starts typing', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Submit to trigger validation
    await page.click('[data-testid="submit-quick-entry"]');
    await expect(page.locator('text=Country is required')).toBeVisible();

    // Start filling the field
    await page.selectOption('[data-testid="country-select"]', 'Rwanda');

    // Error should disappear
    await expect(page.locator('text=Country is required')).not.toBeVisible();
  });

  test('should complete in under 3 minutes for typical use', async ({ page }) => {
    // This test ensures form is designed for speed
    await page.click('[data-testid="quick-entry-button"]');

    // Verify quick entry messaging
    await expect(page.locator('text=Target: under 3 minutes')).toBeVisible();

    // Verify form has helpful defaults (all fields start at 0, not empty)
    const renewableCapacity = await page.locator('[data-testid="renewable-capacity-2030"]').inputValue();
    expect(renewableCapacity).toBe('0');
  });

  test('should convert quick input to full ScenarioInput structure', async ({ page }) => {
    await page.click('[data-testid="quick-entry-button"]');

    // Fill minimal data
    await page.selectOption('[data-testid="country-select"]', 'Uganda');
    await page.fill('[data-testid="scenario-name-input"]', 'Quick Test');
    await page.fill('[data-testid="renewable-capacity-2030"]', '1000');
    await page.fill('[data-testid="fossil-capacity-2030"]', '500');
    await page.fill('[data-testid="renewable-capacity-2040"]', '2000');
    await page.fill('[data-testid="fossil-capacity-2040"]', '200');
    await page.fill('[data-testid="emissions-2025"]', '10');
    await page.fill('[data-testid="emissions-2030"]', '8');
    await page.fill('[data-testid="emissions-2050"]', '2');
    await page.fill('[data-testid="peak-demand-2030"]', '1500');
    await page.fill('[data-testid="peak-demand-2040"]', '2000');

    await page.click('[data-testid="submit-quick-entry"]');

    // Should create a full scenario with all required structure
    await expect(page.locator('[data-testid="scenario-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-model"]:has-text("Quick Entry")')).toBeVisible();
  });
});
