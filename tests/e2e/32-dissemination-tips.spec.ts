/**
 * F032 - Dissemination Tips Tests
 *
 * Tests the educational content from IRENA Toolkit Section 4.3
 * including quick tips, principles, and case studies.
 */

import { test, expect } from '@playwright/test';

test.describe('F032 - Dissemination Tips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Load ScenarioLand example scenario first
    await page.click('text=Load Example');
    await page.waitForSelector('text=ScenarioLand', { timeout: 10000 });

    // Navigate to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForSelector('text=Communication Strategies');
  });

  test('should show Best Practices tab in Communication view', async ({ page }) => {
    // Check Best Practices tab is visible
    await expect(page.locator('button:has-text("Best Practices")')).toBeVisible();
  });

  test('should navigate to Best Practices view when tab clicked', async ({ page }) => {
    // Click Best Practices tab
    await page.click('button:has-text("Best Practices")');

    // Should show Dissemination Best Practices heading
    await expect(page.locator('text=Dissemination Best Practices')).toBeVisible();
  });

  test('should display Quick Tips tab with expandable cards', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Quick Tips tab should be active by default
    await expect(page.locator('button:has-text("Quick Tips")')).toBeVisible();

    // Should show quick tip cards
    await expect(page.locator('text=Match Format to Audience')).toBeVisible();
    await expect(page.locator('text=Use Non-Technical Language')).toBeVisible();
    await expect(page.locator('text=Make It Interactive')).toBeVisible();
  });

  test('should expand quick tip card when clicked', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Click on a quick tip card to expand it
    await page.click('text=Match Format to Audience');

    // Should show toolkit reference when expanded
    await expect(page.locator('text=Toolkit Reference:')).toBeVisible();
    await expect(page.locator('text=Section 4.3.2')).toBeVisible();
  });

  test('should display Toolkit Principles tab with expandable sections', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Click Toolkit Principles tab
    await page.click('button:has-text("Toolkit Principles")');

    // Should show the two main principles from Section 4.3
    await expect(page.locator('text=Public Presentations and Reports')).toBeVisible();
    await expect(page.locator('text=Visualisation Tools, Games and Simulations')).toBeVisible();
  });

  test('should expand principle card to show strengths, challenges, limitations', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');
    await page.click('button:has-text("Toolkit Principles")');

    // Expand first principle
    await page.click('text=Public Presentations and Reports');

    // Should show strengths, challenges, limitations sections
    await expect(page.locator('h5:has-text("Strengths")')).toBeVisible();
    await expect(page.locator('h5:has-text("Challenges")')).toBeVisible();
    await expect(page.locator('h5:has-text("Limitations")')).toBeVisible();

    // Should show implementation stages
    await expect(page.locator('text=Implementation Stages')).toBeVisible();
  });

  test('should display Case Studies tab with country examples', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Click Case Studies tab
    await page.click('button:has-text("Case Studies")');

    // Should show country case studies from the toolkit
    await expect(page.locator('text=Belgium')).toBeVisible();
    await expect(page.locator('text=Kenya')).toBeVisible();
    await expect(page.locator('text=Cyprus')).toBeVisible();
    await expect(page.locator('text=Brazil')).toBeVisible();
  });

  test('should show contextual tips when stakeholder is selected first', async ({ page }) => {
    // Select a stakeholder first (Public & Communities)
    await page.click('text=Public & Communities');

    // Then go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Should show contextual tips for Public stakeholder
    await expect(page.locator('text=Tips for Public')).toBeVisible();
    await expect(page.locator('text=Recommended Approaches')).toBeVisible();
    await expect(page.locator('text=Approaches to Avoid')).toBeVisible();
  });

  test('should show toolkit reference footer', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Should show source reference at bottom
    await expect(page.locator('text=Source Reference')).toBeVisible();
    await expect(page.locator('text=Section 4.3: Dissemination')).toBeVisible();
  });

  test('should display available tools in expanded principle', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');
    await page.click('button:has-text("Toolkit Principles")');

    // Expand visualisation principle
    await page.click('text=Visualisation Tools, Games and Simulations');

    // Should show available tools (use headings to be specific)
    await expect(page.locator('h4:has-text("Available Tools")')).toBeVisible();
    await expect(page.locator('h5:has-text("Data Visualisation Tools")')).toBeVisible();
    await expect(page.locator('h5:has-text("Energy Calculators")')).toBeVisible();
    await expect(page.locator('h5:has-text("Simulations and Games")')).toBeVisible();
  });

  test('should show resource requirements in expanded principle', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');
    await page.click('button:has-text("Toolkit Principles")');

    // Expand public presentations principle
    await page.click('text=Public Presentations and Reports');

    // Should show resource requirements (use heading to be specific)
    await expect(page.locator('h4:has-text("Resource Requirements")')).toBeVisible();
  });

  test('should show back button that returns to strategies view', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');

    // Click back button
    await page.click('text=Back to Strategies');

    // Should return to strategies view with stakeholder selector visible
    await expect(page.locator('text=Select Stakeholder Audience')).toBeVisible();
  });

  test('should display section references for each principle', async ({ page }) => {
    // Go to Best Practices
    await page.click('button:has-text("Best Practices")');
    await page.click('button:has-text("Toolkit Principles")');

    // Should show section references
    await expect(page.locator('text=Section 4.3.1')).toBeVisible();
    await expect(page.locator('text=Section 4.3.2')).toBeVisible();
  });
});
