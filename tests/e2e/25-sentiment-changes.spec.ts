/**
 * E2E Tests for F025 - Stakeholder Sentiment Change Display
 *
 * Tests the display of sentiment changes when scenario parameters are adjusted.
 */

import { test, expect } from '@playwright/test';

test.describe('F025 - Stakeholder Sentiment Changes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Load example scenario
    await page.click('button:has-text("Load ScenarioLand Example")');
    await page.waitForTimeout(500);

    // Navigate to Explore Impacts tab
    await page.click('button:has-text("Explore Impacts")');
    await page.waitForTimeout(500);
  });

  test('should not show sentiment changes when no adjustments made', async ({ page }) => {
    // Sentiment changes should not be visible without adjustments
    const sentimentSection = page.locator('text=Stakeholder Sentiment Changes');
    await expect(sentimentSection).not.toBeVisible();

    // Placeholder message should be visible
    await expect(page.locator('text=Adjust parameters above to see directional impacts')).toBeVisible();
  });

  test('should display sentiment changes after making adjustments', async ({ page }) => {
    // Make an adjustment
    const slider = page.locator('#re-share-2030');
    await slider.fill('60');
    await page.waitForTimeout(500);

    // Sentiment changes section should now be visible
    await expect(page.locator('text=Stakeholder Sentiment Changes')).toBeVisible();
    await expect(page.locator('text=How might each stakeholder group respond')).toBeVisible();
  });

  test('should display all 9 stakeholders in grid', async ({ page }) => {
    // Make an adjustment to show sentiment changes
    await page.locator('#re-share-2030').fill('65');
    await page.waitForTimeout(500);

    // Check that all stakeholders are displayed
    const stakeholders = [
      'Policy Makers & Regulators',
      'Grid Operators',
      'Industry & Business',
      'Public & Communities',
      'CSOs & NGOs',
      'Scientific Institutions',
      'Financial Institutions',
      'Regional Bodies',
      'Development Partners'
    ];

    for (const stakeholder of stakeholders) {
      await expect(page.locator(`text=${stakeholder}`).first()).toBeVisible();
    }
  });

  test('should show sentiment arrows for stakeholders', async ({ page }) => {
    // Make adjustment that should affect sentiment
    await page.locator('#re-share-2030').fill('70'); // Higher RE
    await page.waitForTimeout(500);

    // Look for sentiment arrows (↗ ↘ →)
    const arrowPattern = /[↗↘→]/;

    // CSOs & NGOs should show positive sentiment (↗) for higher RE
    const csoCard = page.locator('button:has-text("CSOs & NGOs")');
    const csoText = await csoCard.textContent();
    expect(csoText).toMatch(arrowPattern);

    // Grid Operators might show negative sentiment (↘) for very high RE
    const gridCard = page.locator('button:has-text("Grid Operators")');
    const gridText = await gridCard.textContent();
    expect(gridText).toMatch(arrowPattern);
  });

  test('should show magnitude labels', async ({ page }) => {
    // Make significant adjustment
    await page.locator('#re-share-2030').fill('75');
    await page.waitForTimeout(500);

    // Check for magnitude labels
    const magnitudes = ['minor', 'moderate', 'significant'];
    let foundMagnitude = false;

    for (const magnitude of magnitudes) {
      const label = page.locator(`text=${magnitude} change`).first();
      if (await label.isVisible()) {
        foundMagnitude = true;
        break;
      }
    }

    expect(foundMagnitude).toBe(true);
  });

  test('should show details when stakeholder clicked', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Click on CSOs & NGOs (should have strong positive reaction to higher RE)
    const csoCard = page.locator('button:has-text("CSOs & NGOs")').first();
    await csoCard.click();
    await page.waitForTimeout(300);

    // Should show detailed factors panel
    await expect(page.locator('text=What they appreciate:')).toBeVisible();
  });

  test('should show positive and negative factors', async ({ page }) => {
    // Make mixed adjustment (higher RE but later coal phaseout)
    await page.locator('#re-share-2030').fill('70'); // Higher RE = positive for most
    await page.locator('#coal-phaseout').fill('2050'); // Later phaseout = negative for some
    await page.waitForTimeout(500);

    // Click on a stakeholder likely to have both factors (e.g., Policy Makers)
    await page.locator('button:has-text("Policy Makers")').first().click();
    await page.waitForTimeout(300);

    // Check for factor sections (at least one should be present)
    const hasAppreciate = await page.locator('text=What they appreciate:').isVisible();
    const hasConcerns = await page.locator('text=What concerns them:').isVisible();

    expect(hasAppreciate || hasConcerns).toBe(true);
  });

  test('should show checkmark icon for positive factors', async ({ page }) => {
    // Higher RE to generate positive factors
    await page.locator('#re-share-2030').fill('75');
    await page.waitForTimeout(500);

    // Click CSOs (very positive about RE)
    await page.locator('button:has-text("CSOs & NGOs")').first().click();
    await page.waitForTimeout(300);

    // Should show checkmark (✓) for positive factors
    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    const panelText = await detailsPanel.textContent();
    expect(panelText).toContain('✓');
  });

  test('should show warning icon for concerns', async ({ page }) => {
    // Very high RE to generate concerns from Grid Operators
    await page.locator('#re-share-2030').fill('80');
    await page.waitForTimeout(500);

    // Click Grid Operators (concerned about high VRE)
    await page.locator('button:has-text("Grid Operators")').first().click();
    await page.waitForTimeout(300);

    // Should show warning (⚠) for concerns
    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    const panelText = await detailsPanel.textContent();
    expect(panelText).toContain('⚠');
  });

  test('should toggle selection when clicking same stakeholder twice', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Click stakeholder
    const stakeholderCard = page.locator('button:has-text("CSOs & NGOs")').first();
    await stakeholderCard.click();
    await page.waitForTimeout(300);

    // Details should be visible
    await expect(page.locator('text=What they appreciate:').first()).toBeVisible();

    // Click again to close
    await stakeholderCard.click();
    await page.waitForTimeout(300);

    // Details should be hidden (help text should show instead)
    await expect(page.locator('text=How to use:')).toBeVisible();
  });

  test('should show help text when no stakeholder selected', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('65');
    await page.waitForTimeout(500);

    // Help text should be visible initially
    await expect(page.locator('text=How to use:')).toBeVisible();
    await expect(page.locator('text=Click any stakeholder above to see what specific factors')).toBeVisible();
  });

  test('should switch selection when clicking different stakeholder', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Click first stakeholder
    await page.locator('button:has-text("Policy Makers")').first().click();
    await page.waitForTimeout(300);

    // Verify first stakeholder details shown
    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    await expect(detailsPanel.locator('text=Policy Makers & Regulators')).toBeVisible();

    // Click second stakeholder
    await page.locator('button:has-text("CSOs & NGOs")').first().click();
    await page.waitForTimeout(300);

    // Verify second stakeholder details shown (first should be replaced)
    await expect(detailsPanel.locator('text=CSOs & NGOs')).toBeVisible();
  });

  test('should show disclaimer about illustrative nature', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Disclaimer should be visible
    await expect(page.locator('text=These sentiment indicators are illustrative only')).toBeVisible();
    await expect(page.locator('text=Always validate assumptions through direct stakeholder consultation')).toBeVisible();
  });

  test('should show stakeholder icons in grid', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('65');
    await page.waitForTimeout(500);

    // Check for stakeholder icons (should have images or SVGs)
    const icons = page.locator('button img, button svg').first();
    await expect(icons).toBeVisible();
  });

  test('should highlight selected stakeholder card', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Click stakeholder
    const card = page.locator('button:has-text("Policy Makers")').first();
    await card.click();
    await page.waitForTimeout(300);

    // Card should have selection styling (checkmark icon)
    const checkmark = card.locator('svg').last();
    await expect(checkmark).toBeVisible();
  });

  test('should hide sentiment changes when reset to base', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('70');
    await page.waitForTimeout(500);

    // Sentiment changes should be visible
    await expect(page.locator('text=Stakeholder Sentiment Changes')).toBeVisible();

    // Reset to base
    await page.click('button:has-text("Reset to Base Scenario")');
    await page.waitForTimeout(500);

    // Sentiment changes should be hidden
    await expect(page.locator('text=Stakeholder Sentiment Changes')).not.toBeVisible();
  });

  test('should show positive sentiment for CSOs with higher RE', async ({ page }) => {
    // Increase RE significantly
    await page.locator('#re-share-2030').fill('80');
    await page.waitForTimeout(500);

    // CSOs should show positive arrow (↗)
    const csoCard = page.locator('button:has-text("CSOs & NGOs")').first();
    const csoText = await csoCard.textContent();
    expect(csoText).toContain('↗');
  });

  test('should show negative sentiment for Grid Operators with very high RE', async ({ page }) => {
    // Very high RE share
    await page.locator('#re-share-2030').fill('85');
    await page.waitForTimeout(500);

    // Grid Operators should show negative arrow (↘) or at least concerns
    await page.locator('button:has-text("Grid Operators")').first().click();
    await page.waitForTimeout(300);

    // Should have concerns listed
    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    const panelText = await detailsPanel.textContent();
    expect(panelText).toContain('concern'); // Should mention concerns
  });

  test('should update sentiments when adjusting coal phaseout', async ({ page }) => {
    // Earlier coal phaseout
    await page.locator('#coal-phaseout').fill('2030');
    await page.waitForTimeout(500);

    // Sentiment changes should be visible
    await expect(page.locator('text=Stakeholder Sentiment Changes')).toBeVisible();

    // CSOs should be very positive about early coal phaseout
    await page.locator('button:has-text("CSOs & NGOs")').first().click();
    await page.waitForTimeout(300);

    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    const panelText = await detailsPanel.textContent();
    expect(panelText?.toLowerCase()).toContain('coal');
  });

  test('should show appropriate factors for multiple adjustments', async ({ page }) => {
    // Make multiple adjustments
    await page.locator('#re-share-2030').fill('75');
    await page.locator('#re-share-2040').fill('90');
    await page.locator('#coal-phaseout').fill('2035');
    await page.waitForTimeout(500);

    // Click a stakeholder
    await page.locator('button:has-text("Development Partners")').first().click();
    await page.waitForTimeout(300);

    // Should show factors related to multiple aspects
    const detailsPanel = page.locator('.border-2.rounded-lg').last();
    await expect(detailsPanel).toBeVisible();

    // Check that there are multiple factors (either positive or negative)
    const factorCount = await detailsPanel.locator('li').count();
    expect(factorCount).toBeGreaterThan(0);
  });
});
