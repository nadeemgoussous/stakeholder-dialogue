/**
 * Test Suite: F029 - Community Impact Calculator (Demo)
 *
 * Tests the interactive demo calculator showing how to make scenarios personal for communities
 */

import { test, expect } from '@playwright/test';

test.describe('F029: Community Impact Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');
  });

  test('should require scenario to be loaded before accessing calculator', async ({ page }) => {
    // Go to Communication tab WITHOUT loading scenario
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Should show "Load a Scenario to Get Started" message
    await expect(page.locator('text=Load a Scenario to Get Started')).toBeVisible();

    // Community calculator button should NOT be visible
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).not.toBeVisible();
  });

  test('should show calculator demo button when Public & Communities stakeholder selected', async ({ page }) => {
    // Load scenario first
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Go to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Calculator button should NOT be visible initially
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).not.toBeVisible();

    // Select "Public & Communities" stakeholder
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);

    // Now calculator button SHOULD be visible
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).toBeVisible();

    // Check the demo notice text
    await expect(page.locator('text=See a working example of how to translate your scenario')).toBeVisible();
  });

  test('should launch calculator and display scenario context', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Navigate to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Select Public & Communities
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);

    // Launch calculator
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show calculator header
    await expect(page.locator('h2:has-text("Community Impact Calculator")')).toBeVisible();

    // Should show demo notice
    await expect(page.locator('text=This is a Teaching Example')).toBeVisible();

    // Should show scenario context
    await expect(page.locator('text=Using Scenario:')).toBeVisible();
    await expect(page.locator('text=Target Year:')).toBeVisible();
    await expect(page.locator('text=Renewable Share:')).toBeVisible();
  });

  test('should have working user input controls', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Test household size input
    const householdInput = page.locator('#household-size');
    await expect(householdInput).toBeVisible();
    await householdInput.fill('6');
    await expect(householdInput).toHaveValue('6');

    // Test region selector
    const regionSelect = page.locator('#region');
    await expect(regionSelect).toBeVisible();
    await regionSelect.selectOption('north');
    await expect(regionSelect).toHaveValue('north');

    // Should show population for selected region
    await expect(page.locator('text=Population: 2,500,000')).toBeVisible();

    // Test current bill input
    const billInput = page.locator('#current-bill');
    await expect(billInput).toBeVisible();
    await billInput.fill('75');
    await expect(billInput).toHaveValue('75');
  });

  test('should display calculated impacts based on scenario data', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show impact results
    await expect(page.locator('text=Estimated Impact by')).toBeVisible();

    // Should show bill impact
    await expect(page.locator('text=Monthly Electricity Bill').first()).toBeVisible();
    // Check that there's a dollar amount displayed (uses p.text-2xl.font-bold which contains the bill)
    const billAmount = page.locator('p.text-2xl.font-bold').first();
    await expect(billAmount).toBeVisible();
    const billText = await billAmount.textContent();
    expect(billText).toContain('$');

    // Should show jobs created
    await expect(page.locator('text=Jobs Created in').first()).toBeVisible();
    await expect(page.locator('text=jobs').first()).toBeVisible();

    // Should show air quality improvement
    await expect(page.locator('text=Air Quality Improvement').first()).toBeVisible();
    // Air quality should be one of: Significant, Moderate, Minor, Minimal
    await expect(page.locator('text=/Significant|Moderate|Minor|Minimal/').first()).toBeVisible();
  });

  test('should recalculate when user changes inputs', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Get initial bill value
    const billInput = page.locator('#current-bill');
    await billInput.fill('50');
    await page.waitForTimeout(300);
    const initialBill = await page.locator('p.text-2xl.font-bold').first().textContent();

    // Change bill input
    await billInput.fill('100');
    await page.waitForTimeout(300);
    const newBill = await page.locator('p.text-2xl.font-bold').first().textContent();

    // Bill amounts should be different
    expect(initialBill).not.toBe(newBill);

    // Change region
    const regionSelect = page.locator('#region');
    await regionSelect.selectOption('north');
    await page.waitForTimeout(300);

    // Jobs number should update (different population share)
    const jobsText = await page.locator('text=Jobs Created in').locator('..').textContent();
    expect(jobsText).toContain('Northern Region');
  });

  test('should display disclaimer about illustrative estimates', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show prominent disclaimer
    await expect(page.locator('text=ILLUSTRATIVE ESTIMATES ONLY').first()).toBeVisible();
    await expect(page.locator('text=directional impacts for discussion purposes').first()).toBeVisible();
    await expect(page.locator('text=do NOT replace detailed economic modeling').first()).toBeVisible();
  });

  test('should have export calculator template button', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show "Build Your Own Calculator" section
    await expect(page.locator('text=Build Your Own Calculator')).toBeVisible();

    // Should have export button
    const exportButton = page.locator('button:has-text("Export Calculator Template")');
    await expect(exportButton).toBeVisible();

    // Should show instructions
    await expect(page.locator('text=Export the HTML template below')).toBeVisible();
    await expect(page.locator('text=Customize regions, calculation logic')).toBeVisible();
  });

  test('should trigger download when export template clicked', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

    // Click export button
    await page.click('button:has-text("Export Calculator Template")');

    // Verify download triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('community-calculator-template.html');
  });

  test('should navigate back to strategies view', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show back button
    const backButton = page.locator('button:has-text("Back to Strategies")');
    await expect(backButton).toBeVisible();

    // Click back
    await backButton.click();
    await page.waitForTimeout(500);

    // Should return to strategies view with Public & Communities still selected
    await expect(page.locator('text=Select Stakeholder Audience')).toBeVisible();
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).toBeVisible();
  });

  test('should display educational context about why calculators work', async ({ page }) => {
    // Load scenario and navigate to calculator
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);
    await page.click('.stakeholder-selector-btn:has-text("Public")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Launch Community Calculator Demo")');
    await page.waitForTimeout(500);

    // Should show educational context
    await expect(page.locator('text=Why Community Calculators Work')).toBeVisible();
    await expect(page.locator('text=Belgium ("My2050")')).toBeVisible();
    await expect(page.locator('text=Kenya')).toBeVisible();
    await expect(page.locator('text=Make abstract scenarios concrete')).toBeVisible();
    await expect(page.locator('text=Build public support')).toBeVisible();
  });

  test('should NOT show calculator button for other stakeholders', async ({ page }) => {
    // Load scenario
    await page.click('button:has-text("Input")');
    await page.click('[data-testid="load-example-button"]');
    await page.waitForTimeout(1000);

    // Go to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForTimeout(500);

    // Select "Policy Makers" (not Public & Communities)
    await page.click('.stakeholder-selector-btn:has-text("Policy Makers")');
    await page.waitForTimeout(500);

    // Calculator button should NOT be visible
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).not.toBeVisible();

    // Select "Grid Operators"
    await page.click('.stakeholder-selector-btn:has-text("Grid Operators")');
    await page.waitForTimeout(500);

    // Still should NOT be visible
    await expect(page.locator('button:has-text("Launch Community Calculator Demo")')).not.toBeVisible();
  });
});
