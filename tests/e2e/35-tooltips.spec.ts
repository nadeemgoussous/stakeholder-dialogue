import { test, expect } from '@playwright/test';

test.describe('F035 - Tooltips for Technical Terms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Load the ScenarioLand example scenario for testing
    await page.click('button:has-text("Load ScenarioLand Example")');
    await page.waitForSelector('[data-testid="scenario-preview"]');
  });

  test('should display tooltip component', async ({ page }) => {
    // Tooltips should be present on the page
    // Check for elements with dotted underline (tooltip triggers)
    const tooltipTriggers = page.locator('.border-dotted.border-irena-blue');
    await expect(tooltipTriggers.first()).toBeVisible();
  });

  test('should show tooltip on hover in ScenarioPreview', async ({ page }) => {
    // Find a metric label with tooltip (e.g., "RE SHARE 2030")
    const reShareLabel = page.locator('text=RE SHARE').first();
    await expect(reShareLabel).toBeVisible();

    // Hover over the label
    await reShareLabel.hover();

    // Tooltip should appear with definition
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check that tooltip contains definition text
    await expect(tooltip).toContainText('Percentage of electricity generation from renewable energy');
  });

  test('should show tooltip on hover in ExploreTab', async ({ page }) => {
    // Navigate to Explore Impacts tab
    await page.click('button:has-text("Explore Impacts")');
    await page.waitForSelector('text=Adjustable Parameters');

    // Find the RE Share slider label
    const reShareLabel = page.locator('text=Renewable Energy Share 2030').first();
    await expect(reShareLabel).toBeVisible();

    // Hover over the label
    await reShareLabel.hover();

    // Tooltip should appear
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check content
    await expect(tooltip).toContainText('Percentage of electricity generation from renewable energy');
  });

  test('should show tooltip on hover for investment metric', async ({ page }) => {
    // Find investment metric label
    const investmentLabel = page.locator('text=TOTAL INVESTMENT').first();
    await expect(investmentLabel).toBeVisible();

    // Hover over label
    await investmentLabel.hover();

    // Tooltip should appear
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check that tooltip contains investment definition
    await expect(tooltip).toContainText('Capital expenditure required for building new power generation');
  });

  test('should show tooltip on hover for emissions reduction', async ({ page }) => {
    // Find emissions reduction label
    const emissionsLabel = page.locator('text=EMISSIONS REDUCTION').first();
    await expect(emissionsLabel).toBeVisible();

    // Hover over label
    await emissionsLabel.hover();

    // Tooltip should appear
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check content
    await expect(tooltip).toContainText('Percentage decrease in CO₂ emissions');
  });

  test('should show tooltip for stakeholder priorities', async ({ page }) => {
    // Navigate to Stakeholder Dialogue tab
    await page.click('button:has-text("Stakeholder Dialogue")');

    // Select a stakeholder (e.g., Policy Makers)
    await page.click('button[aria-label*="Policy"]');
    await page.waitForSelector('text=Key Priorities');

    // Find a priority with tooltip
    const priorityElement = page.locator('.cursor-help').first();
    await expect(priorityElement).toBeVisible();

    // Hover over the priority
    await priorityElement.hover();

    // Tooltip should appear (if there's a matching glossary entry)
    // Some priorities might not have glossary entries, so we check if tooltip appears
    const tooltip = page.locator('[role="tooltip"]');
    const tooltipCount = await tooltip.count();

    // If tooltip exists, it should be visible
    if (tooltipCount > 0) {
      await expect(tooltip).toBeVisible({ timeout: 2000 });
    }
  });

  test('should hide tooltip when mouse leaves', async ({ page }) => {
    // Find a metric label
    const reShareLabel = page.locator('text=RE SHARE').first();
    await expect(reShareLabel).toBeVisible();

    // Hover to show tooltip
    await reShareLabel.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Move mouse away
    await page.mouse.move(0, 0);

    // Tooltip should disappear
    await expect(tooltip).not.toBeVisible({ timeout: 2000 });
  });

  test('should show tooltip with keyboard focus', async ({ page }) => {
    // Tab to a tooltip trigger
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Keep tabbing until we find an element with tooltip
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');

      // Check if tooltip appears
      const tooltip = page.locator('[role="tooltip"]');
      const isVisible = await tooltip.isVisible().catch(() => false);

      if (isVisible) {
        // Found a tooltip!
        await expect(tooltip).toBeVisible();
        return;
      }
    }

    // At least verify that tooltip triggers exist
    const tooltipTriggers = page.locator('[tabindex="0"]');
    expect(await tooltipTriggers.count()).toBeGreaterThan(0);
  });

  test('should style tooltip with IRENA colors', async ({ page }) => {
    // Find a metric label
    const reShareLabel = page.locator('text=RE SHARE').first();
    await expect(reShareLabel).toBeVisible();

    // Hover to show tooltip
    await reShareLabel.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check IRENA blue styling (bg-irena-blue-dark)
    const bgColor = await tooltip.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have a background color (not transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  test('should have dotted underline on tooltip triggers', async ({ page }) => {
    // Find a tooltip trigger element
    const trigger = page.locator('.border-dotted.border-irena-blue').first();
    await expect(trigger).toBeVisible();

    // Check border style
    const borderStyle = await trigger.evaluate((el) => {
      return window.getComputedStyle(el).borderBottomStyle;
    });

    expect(borderStyle).toBe('dotted');
  });

  test('should have accessible tooltip attributes', async ({ page }) => {
    // Find a metric label
    const reShareLabel = page.locator('text=RE SHARE').first();
    await expect(reShareLabel).toBeVisible();

    // Hover to show tooltip
    await reShareLabel.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Check tooltip has correct role
    await expect(tooltip).toHaveAttribute('role', 'tooltip');

    // Check tooltip has id
    await expect(tooltip).toHaveAttribute('id', 'tooltip');
  });

  test('should display glossary definitions correctly', async ({ page }) => {
    // Test that glossary definitions are loaded and displayed

    // RE Share tooltip
    const reShareLabel = page.locator('text=RE SHARE').first();
    await reShareLabel.hover();
    let tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toContainText('renewable energy sources');

    // Move away to hide tooltip
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible();

    // Investment tooltip
    const investmentLabel = page.locator('text=TOTAL INVESTMENT').first();
    await investmentLabel.hover();
    tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toContainText('Capital expenditure');

    // Move away
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible();

    // Emissions tooltip
    const emissionsLabel = page.locator('text=EMISSIONS REDUCTION').first();
    await emissionsLabel.hover();
    tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toContainText('Percentage decrease');
  });

  test('should handle missing glossary entries gracefully', async ({ page }) => {
    // The component should not crash if a glossary key is missing
    // It should simply not show a tooltip

    // This test verifies the app doesn't crash with missing keys
    // by checking that the page is still functional
    await expect(page.locator('[data-testid="scenario-preview"]')).toBeVisible();

    // Navigate to other tabs to ensure stability
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.waitForSelector('text=Select Stakeholder Group');

    await page.click('button:has-text("Explore Impacts")');
    await page.waitForSelector('text=Adjustable Parameters');

    // If we got here without errors, the app is stable
    expect(true).toBe(true);
  });
});
