import { test, expect } from '@playwright/test';

/**
 * Offline Functionality Tests (CRITICAL)
 * Per CLAUDE.md: Tool MUST work fully offline after initial load
 */
test.describe('Offline Functionality', () => {
  test('should detect when going offline', async ({ page, context }) => {
    await page.goto('/');

    // Should show "Online" initially
    await expect(page.locator('text=Online')).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Wait for status to update (with timeout)
    await page.waitForTimeout(1000);

    // Should now show "Offline Mode"
    await expect(page.locator('text=Offline Mode')).toBeVisible({ timeout: 5000 });
  });

  test('should still display UI when offline', async ({ page, context }) => {
    // Load page online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // UI should still be visible and functional
    await expect(page.locator('h1')).toContainText('IRENA Scenario Dialogue Tool');
    await expect(page.locator('text=Welcome to the Scenario Dialogue Tool')).toBeVisible();
  });

  test('should load page after going offline (PWA cache)', async ({ page, context }) => {
    // First visit (cache the page)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to be ready
    await page.waitForTimeout(2000);

    // Close and reopen
    await page.close();
    const newPage = await context.newPage();

    // Go offline
    await context.setOffline(true);

    // Try to load page offline
    await newPage.goto('/');

    // Should still load from cache
    await expect(newPage.locator('h1')).toContainText('IRENA Scenario Dialogue Tool', { timeout: 10000 });
  });
});
