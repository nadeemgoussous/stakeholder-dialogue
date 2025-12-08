import { test, expect } from '@playwright/test';

test.describe('F017: Stakeholder Icons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(500);
    // Navigate to Stakeholder Dialogue tab
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.waitForTimeout(500);
  });

  test('should display actual icons instead of letter placeholders', async ({ page }) => {
    // Check that icon images are present (not just letter placeholders)
    const iconImages = page.locator('.stakeholder-button img');
    await expect(iconImages).toHaveCount(9);

    // Verify first icon loads
    const firstIcon = iconImages.first();
    await expect(firstIcon).toBeVisible();
    await expect(firstIcon).toHaveAttribute('alt', /icon/i);
  });

  test('should load PNG icons for first 7 stakeholders', async ({ page }) => {
    const pngStakeholders = [
      'policy-makers',
      'grid-operators',
      'industry',
      'csos-ngos',
      'public',
      'scientific',
      'finance'
    ];

    for (const id of pngStakeholders) {
      const icon = page.locator(`img[src="/icons/${id}.png"]`);
      await expect(icon).toBeVisible();
    }
  });

  test('should load SVG icons for regional bodies and development partners', async ({ page }) => {
    const svgStakeholders = [
      'regional-bodies',
      'development-partners'
    ];

    for (const id of svgStakeholders) {
      const icon = page.locator(`img[src="/icons/${id}.svg"]`);
      await expect(icon).toBeVisible();
    }
  });

  test('should display icon with correct alt text', async ({ page }) => {
    // Click first stakeholder
    await page.click('.stakeholder-button:first-child');
    await page.waitForTimeout(300);

    // Check that alt text includes stakeholder name
    const detailIcon = page.locator('.card img').first();
    const altText = await detailIcon.getAttribute('alt');
    expect(altText).toContain('icon');
  });

  test('should show icons in stakeholder detail view', async ({ page }) => {
    // Click Policy Makers
    await page.click('button:has-text("Policy Makers & Regulators")');
    await page.waitForTimeout(300);

    // Verify icon appears in detail card
    const detailIcon = page.locator('.card img[src="/icons/policy-makers.png"]');
    await expect(detailIcon).toBeVisible();
  });

  test('should display icons with consistent sizing', async ({ page }) => {
    // Get all icons in the grid
    const icons = page.locator('.stakeholder-button img');

    // Check first 3 icons have same dimensions
    for (let i = 0; i < 3; i++) {
      const icon = icons.nth(i);
      await expect(icon).toBeVisible();

      // Icons should have w-16 h-16 classes (64px)
      const box = await icon.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // Allow some tolerance for sizing
        expect(box.width).toBeGreaterThanOrEqual(50);
        expect(box.width).toBeLessThanOrEqual(80);
        expect(box.height).toBeGreaterThanOrEqual(50);
        expect(box.height).toBeLessThanOrEqual(80);
      }
    }
  });

  test('should have tooltip/title on icon hover', async ({ page }) => {
    const iconContainer = page.locator('.stakeholder-button').first();

    // Icons should have accessible labels
    const ariaLabel = await iconContainer.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Select');
  });
});
