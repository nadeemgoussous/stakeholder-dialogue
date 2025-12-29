/**
 * F027: Communication Tab - Dissemination Strategy Recommender
 *
 * Tests the educational tool that teaches energy planners which dissemination
 * formats work best for each stakeholder audience.
 */

import { test, expect } from '@playwright/test';

test.describe('F027: Communication Tab - Dissemination Strategy Recommender', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Load ScenarioLand example scenario first
    await page.click('text=Load Example Scenario');
    await page.waitForSelector('text=ScenarioLand');

    // Navigate to Communication tab
    await page.click('button:has-text("Communicate")');
    await page.waitForSelector('text=Communication Strategies');
  });

  test('should display Communication tab header and instructions', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText('Communication Strategies');

    // Check description
    await expect(page.locator('text=Learn which dissemination formats')).toBeVisible();

    // Check educational focus banner
    await expect(page.locator('text=Educational Focus')).toBeVisible();
  });

  test('should display all 9 stakeholder selector buttons', async ({ page }) => {
    // Count stakeholder buttons
    const stakeholderButtons = page.locator('.stakeholder-selector-btn');
    await expect(stakeholderButtons).toHaveCount(9);

    // Check that all stakeholder names are present
    const stakeholderNames = [
      'Policy Makers & Regulators',
      'Grid Operators',
      'Industry & Business',
      'Public & Communities',
      'CSOs & NGOs',
      'Scientific Institutions',
      'Financial Institutions',
      'Regional Bodies',
      'Development Partners',
    ];

    for (const name of stakeholderNames) {
      await expect(page.locator(`text=${name}`)).toBeVisible();
    }
  });

  test('should show placeholder when no stakeholder selected', async ({ page }) => {
    await expect(page.locator('text=Select a stakeholder group above')).toBeVisible();
  });

  test('should display strategy when Policy Makers selected', async ({ page }) => {
    // Click Policy Makers button
    await page.click('text=Policy Makers & Regulators');

    // Wait for strategy to load
    await page.waitForSelector('text=Why This Matters for Policy Makers');

    // Check key sections are displayed
    await expect(page.locator('text=Recommended Dissemination Formats')).toBeVisible();
    await expect(page.locator('text=Key Messages to Emphasize')).toBeVisible();
    await expect(page.locator('text=Narrative Framing Guidance')).toBeVisible();
    await expect(page.locator('text=What to Avoid')).toBeVisible();

    // Check that format levels are shown
    await expect(page.locator('text=PRIMARY')).toBeVisible();
    await expect(page.locator('text=SECONDARY')).toBeVisible();
  });

  test('should display context indicators (technical level, time, influence)', async ({ page }) => {
    await page.click('text=Policy Makers & Regulators');
    await page.waitForSelector('text=Why This Matters for Policy Makers');

    // Check context indicators
    await expect(page.locator('text=Technical Level')).toBeVisible();
    await expect(page.locator('text=Time Available')).toBeVisible();
    await expect(page.locator('text=Decision Influence')).toBeVisible();
  });

  test('should populate key messages with scenario data', async ({ page }) => {
    await page.click('text=Public & Communities');
    await page.waitForSelector('text=Why This Matters for Public & Communities');

    // Check that key messages section exists
    await expect(page.locator('text=Key Messages to Emphasize')).toBeVisible();

    // Check that at least some messages are displayed (should have numbered bullets)
    const numberedItems = page.locator('span:has-text("1")').first();
    await expect(numberedItems).toBeVisible();
  });

  test('should display toolkit methods references', async ({ page }) => {
    await page.click('text=Scientific Institutions');
    await page.waitForSelector('text=Why This Matters for Scientific');

    // Check toolkit reference section
    await expect(page.locator('text=IRENA Toolkit Methods Referenced')).toBeVisible();
  });

  test('should show demo tools navigation (disabled for now)', async ({ page }) => {
    await page.click('text=Public & Communities');
    await page.waitForSelector('text=Why This Matters for Public');

    // Check demo tools section
    await expect(page.locator('text=Interactive Tools & Templates')).toBeVisible();

    // Check that demo tool buttons exist (but are disabled)
    await expect(page.locator('text=Community Calculator')).toBeVisible();
    await expect(page.locator('text=Scenario Comparison')).toBeVisible();
    await expect(page.locator('text=Format Templates')).toBeVisible();

    // Check they are marked as coming soon
    await expect(page.locator('text=Coming soon (F029)').first()).toBeVisible();
  });

  test('should switch between stakeholders and update strategy', async ({ page }) => {
    // Select Policy Makers
    await page.click('text=Policy Makers & Regulators');
    await page.waitForSelector('text=Why This Matters for Policy Makers');
    await expect(page.locator('text=Policy Brief')).toBeVisible();

    // Switch to Grid Operators
    await page.click('text=Grid Operators');
    await page.waitForSelector('text=Why This Matters for Grid Operators');
    await expect(page.locator('text=Technical Appendix')).toBeVisible();

    // Switch to Financial Institutions
    await page.click('text=Financial Institutions');
    await page.waitForSelector('text=Why This Matters for Financial');
    await expect(page.locator('text=Investment Prospectus')).toBeVisible();
  });

  test('should display format effort levels', async ({ page }) => {
    await page.click('text=Policy Makers & Regulators');
    await page.waitForSelector('text=Why This Matters for Policy Makers');

    // Check that effort indicators are shown
    const effortBadges = page.locator('text=/LOW EFFORT|MEDIUM EFFORT|HIGH EFFORT/');
    await expect(effortBadges.first()).toBeVisible();
  });

  test('should show toolkit reference section at bottom', async ({ page }) => {
    // Check toolkit reference footer
    await expect(page.locator('text=About This Tool')).toBeVisible();
    await expect(page.locator('text=IRENA\'s Participatory Processes for Strategic Energy Planning toolkit')).toBeVisible();
  });

  test('should have copy button for key messages', async ({ page }) => {
    await page.click('text=Policy Makers & Regulators');
    await page.waitForSelector('text=Why This Matters for Policy Makers');

    // Check copy button exists
    await expect(page.locator('button:has-text("Copy All Messages")')).toBeVisible();
  });

  test('should display all stakeholders with unique strategies', async ({ page }) => {
    const stakeholders = [
      { name: 'Policy Makers & Regulators', format: 'Policy Brief' },
      { name: 'Grid Operators', format: 'Technical Appendix' },
      { name: 'Industry & Business', format: 'Investment Briefing' },
      { name: 'Public & Communities', format: 'Community Impact Calculator' },
      { name: 'CSOs & NGOs', format: 'Climate Impact Narrative' },
      { name: 'Scientific Institutions', format: 'Technical Report' },
      { name: 'Financial Institutions', format: 'Investment Prospectus' },
      { name: 'Regional Bodies', format: 'Regional Integration Report' },
      { name: 'Development Partners', format: 'Programmatic Briefing' },
    ];

    for (const stakeholder of stakeholders) {
      await page.click(`text=${stakeholder.name}`);
      await page.waitForSelector(`text=Why This Matters for ${stakeholder.name.split('&')[0].trim()}`);
      await expect(page.locator(`text=${stakeholder.format}`)).toBeVisible();
    }
  });
});
