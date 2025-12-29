/**
 * F031 - Export Guidance Tests
 *
 * Tests for the Export Guidance component which provides:
 * - Step-by-step instructions for creating materials
 * - Copy Key Data functionality
 * - Downloadable template files
 * - Customization checklist
 * - IRENA toolkit resources
 */

import { test, expect } from '@playwright/test';

test.describe('F031 - Export Guidance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');
  });

  test('should show Export Guidance tab in Communication section', async ({ page }) => {
    // Load scenario first (required for Communication tab)
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Go to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Check Export Guidance tab button is visible
    await expect(page.locator('button:has-text("Export Guidance")')).toBeVisible();
  });

  test('should require scenario to be loaded', async ({ page }) => {
    // Navigate to Communication tab without loading scenario
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Should show "Load a Scenario" message
    await expect(page.locator('text=Load a Scenario to Get Started')).toBeVisible();
    await expect(page.locator('button:has-text("Export Guidance")')).not.toBeVisible();
  });

  test('should display step-by-step instructions', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check Export Guidance header
    await expect(page.locator('h1:has-text("Export Guidance")')).toBeVisible();

    // Check step-by-step instructions are displayed
    await expect(page.locator('text=How to Create Your Materials')).toBeVisible();
    await expect(page.locator('h3:has-text("Identify Your Audience")')).toBeVisible();
    await expect(page.locator('h3:has-text("Choose a Template")')).toBeVisible();
    await expect(page.locator('h3:has-text("Customize for Context")')).toBeVisible();
    await expect(page.locator('h3:has-text("Review and Refine")')).toBeVisible();
  });

  test('should show scenario context banner', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check scenario banner
    await expect(page.locator('text=Using Scenario:')).toBeVisible();
  });

  test('should copy key data to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Click Copy Key Data button
    await page.click('button:has-text("Copy Key Data to Clipboard")');

    // Should show success message
    await expect(page.locator('text=Copied to Clipboard!')).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('KEY SCENARIO DATA');
    expect(clipboardText).toContain('RENEWABLE ENERGY SHARE');
  });

  test('should display downloadable template list', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check template section header
    await expect(page.locator('text=Download Template Files')).toBeVisible();

    // Check template cards are displayed
    await expect(page.locator('text=Presentation Outline')).toBeVisible();
    await expect(page.locator('text=Policy Brief Template')).toBeVisible();
    await expect(page.locator('text=Infographic Structure')).toBeVisible();
    await expect(page.locator('text=Community Flyer Template')).toBeVisible();

    // Check download buttons exist
    const downloadButtons = page.locator('button:has-text("Download Template")');
    await expect(downloadButtons).toHaveCount(4);
  });

  test('should trigger template download', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Listen for download
    const downloadPromise = page.waitForEvent('download');

    // Click first download button (Presentation Outline)
    const downloadButtons = page.locator('button:has-text("Download Template")');
    await downloadButtons.first().click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('presentation-outline.md');
  });

  test('should display customization checklist', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check checklist section
    await expect(page.locator('text=Customization Checklist')).toBeVisible();

    // Check specific checklist items
    await expect(page.locator("text=Add your organization's logo and colors")).toBeVisible();
    await expect(page.locator('text=Reference national/regional energy targets')).toBeVisible();
    await expect(page.locator('text=Include local project examples or case studies')).toBeVisible();
  });

  test('should allow checking items in customization checklist', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check progress is initially 0
    await expect(page.locator('text=Progress: 0 of 8 items completed')).toBeVisible();

    // Click first checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();

    // Progress should update
    await expect(page.locator('text=Progress: 1 of 8 items completed')).toBeVisible();

    // Click another checkbox
    const secondCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await secondCheckbox.check();

    // Progress should update again
    await expect(page.locator('text=Progress: 2 of 8 items completed')).toBeVisible();
  });

  test('should display IRENA toolkit resources', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check toolkit resources section
    await expect(page.locator('h2:has-text("IRENA Toolkit Resources")')).toBeVisible();
    await expect(page.getByText('Section 4.3:', { exact: true })).toBeVisible();
    await expect(page.getByText('Case Studies:', { exact: true })).toBeVisible();
    await expect(page.getByText('Best Practices:', { exact: true })).toBeVisible();
  });

  test('should navigate back to strategies view', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("Export Guidance")')).toBeVisible();

    // Click back button
    await page.click('text=Back to Communication Strategies');
    await page.waitForTimeout(500);

    // Should be back at strategies view
    await expect(page.locator('text=Select Stakeholder Audience')).toBeVisible();
  });

  test('should show tips for each step', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);

    // Check tips are displayed
    await expect(page.locator('text=Policy makers prefer 2-page briefs')).toBeVisible();
  });

  test('should maintain view when switching between tabs', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Export Guidance
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("Export Guidance")')).toBeVisible();

    // Switch to Templates tab
    await page.click('button:has-text("Format Templates")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Dissemination Format Templates')).toBeVisible();

    // Switch back to Export Guidance
    await page.click('button:has-text("Export Guidance")');
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("Export Guidance")')).toBeVisible();
  });
});
