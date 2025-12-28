import { test, expect } from '@playwright/test';

test.describe('F028: Dissemination Format Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Load example scenario first (required for Communication tab)
    await page.click('text=Load Example Scenario');
    await page.waitForSelector('text=Rwanda');
    await page.waitForTimeout(500);

    // Navigate to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
  });

  test('should require scenario to be loaded', async ({ page }) => {
    // Navigate to fresh page without loading scenario
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Communication tab without loading scenario
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Should show "Load Scenario" message
    await expect(page.locator('text=Load a Scenario to Get Started')).toBeVisible();
    await expect(page.locator('text=Please load a scenario first')).toBeVisible();
  });

  test('should show scenario context banner when scenario loaded', async ({ page }) => {
    // Should show scenario context
    await expect(page.locator('text=Using Scenario:')).toBeVisible();
    await expect(page.locator('text=Rwanda').first()).toBeVisible();
  });

  test('should show view switcher with Strategies and Templates tabs', async ({ page }) => {
    // Check that both tabs exist
    await expect(page.locator('text=📊 Dissemination Strategies')).toBeVisible();
    await expect(page.locator('text=📝 Format Templates')).toBeVisible();
  });

  test('should show strategies view by default', async ({ page }) => {
    // Strategies tab should be active by default
    const strategiesTab = page.locator('text=📊 Dissemination Strategies');
    await expect(strategiesTab).toHaveClass(/border-irena-blue/);

    // Should show stakeholder selector
    await expect(page.locator('text=Select Stakeholder Audience')).toBeVisible();
  });

  test('should switch to templates view when Templates tab clicked', async ({ page }) => {
    // Click Templates tab
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Should show template library header
    await expect(page.locator('text=Dissemination Format Templates')).toBeVisible();
    await expect(page.locator('text=Text-based template structures')).toBeVisible();
  });

  test('should display all 4 template cards', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Check all template cards are visible
    await expect(page.locator('text=Policy Brief')).toBeVisible();
    await expect(page.locator('text=Infographic')).toBeVisible();
    await expect(page.locator('text=Investment Briefing')).toBeVisible();
    await expect(page.locator('text=Climate Impact Narrative')).toBeVisible();
  });

  test('should show template characteristics on cards', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Check characteristics are displayed (use first() to handle multiple cards)
    await expect(page.locator('text=Length:').first()).toBeVisible();
    await expect(page.locator('text=Tone:').first()).toBeVisible();
    await expect(page.locator('text=Level:').first()).toBeVisible();

    // Check effort badges
    await expect(page.locator('text=MEDIUM EFFORT').first()).toBeVisible();
    await expect(page.locator('text=HIGH EFFORT').first()).toBeVisible();
  });

  test('should show best-for audiences on cards', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Check "Best for" section exists
    await expect(page.locator('text=Best for:').first()).toBeVisible();

    // Check some specific audiences (use first() for multiple occurrences)
    await expect(page.locator('text=Policy Makers').first()).toBeVisible();
    await expect(page.locator('text=Financial Institutions').first()).toBeVisible();
  });

  test('should open template detail view when card clicked', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Click on first template's "View Template Structure" button
    await page.locator('text=View Template Structure →').first().click();
    await page.waitForTimeout(300);

    // Should show detail view with back button (use first() for multiple back buttons)
    await expect(page.locator('text=← Back to Templates').first()).toBeVisible();

    // Should show "How to Use This Template"
    await expect(page.locator('text=How to Use This Template')).toBeVisible();

    // Should show Template Structure
    await expect(page.locator('text=Template Structure')).toBeVisible();
  });

  test('should show template sections in detail view', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Check for section headings (use first() for multiple occurrences)
    await expect(page.locator('text=Executive Summary').first()).toBeVisible();
    await expect(page.locator('text=Key Points to Include:').first()).toBeVisible();
    await expect(page.locator('text=Scenario Data to Include:').first()).toBeVisible();
  });

  test('should show copy buttons in template detail view', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Check for copy buttons
    await expect(page.locator('text=📋 Copy').first()).toBeVisible();
    await expect(page.locator('text=📋 Copy Full Template').first()).toBeVisible();
  });

  test('should show example text in detail view', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Check for example section
    await expect(page.locator('text=Example / Full Template')).toBeVisible();

    // Check pre element exists (contains example text)
    const preElement = page.locator('pre');
    await expect(preElement).toBeVisible();
  });

  test('should navigate back to template list from detail view', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Click back button
    await page.click('text=← Back to Templates');
    await page.waitForTimeout(300);

    // Should be back at template list
    await expect(page.locator('text=Dissemination Format Templates')).toBeVisible();
    await expect(page.locator('text=Policy Brief')).toBeVisible();
  });

  test('should show "How to use" instructions for templates', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Check for how-to-use section
    await expect(page.locator('text=How to Use This Template')).toBeVisible();

    // Should have bullet points
    const howToSection = page.locator('text=How to Use This Template').locator('..');
    await expect(howToSection.locator('li').first()).toBeVisible();
  });

  test('should show toolkit reference for templates', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Check for toolkit reference
    await expect(page.locator('text=IRENA Toolkit Reference:')).toBeVisible();
  });

  test('should persist view selection when switching back from Templates', async ({ page }) => {
    // Select a stakeholder in Strategies view
    await page.click('[aria-label*="Grid Operators"]');
    await page.waitForTimeout(300);

    // Switch to Templates
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Switch back to Strategies
    await page.click('text=📊 Dissemination Strategies');
    await page.waitForTimeout(300);

    // Grid Operators should still be selected
    const gridOperatorsBtn = page.locator('button:has([aria-label*="Grid Operators"])');
    await expect(gridOperatorsBtn).toHaveClass(/scale-105/);
  });

  test('should show data fields for scenario customization', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Open first template
    await page.locator('button:has-text("View Template Structure")').first().click();
    await page.waitForTimeout(300);

    // Should show scenario data fields
    await expect(page.locator('code').first()).toBeVisible();
  });

  test('should show toolkit reference at bottom of page', async ({ page }) => {
    await page.click('text=📝 Format Templates');
    await page.waitForTimeout(300);

    // Check for general toolkit reference (use first() to handle multiple occurrences)
    await expect(page.locator('text=IRENA\'s Participatory Processes Toolkit').first()).toBeVisible();
  });
});
