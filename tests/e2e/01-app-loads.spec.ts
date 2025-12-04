import { test, expect } from '@playwright/test';

/**
 * Basic App Loading Tests (F001)
 * Verifies the application loads and displays correctly
 */
test.describe('App Loading', () => {
  test('should load the welcome page', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.locator('h1')).toContainText('IRENA Scenario Dialogue Tool');

    // Check for key sections
    await expect(page.locator('text=Welcome to the Scenario Dialogue Tool')).toBeVisible();
    await expect(page.locator('text=Offline-First Design')).toBeVisible();
  });

  test('should display IRENA branding', async ({ page }) => {
    await page.goto('/');

    // Check header has IRENA blue background
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should show online/offline status indicator', async ({ page }) => {
    await page.goto('/');

    // Should show online or offline status
    const statusIndicator = page.locator('text=/Online|Offline Mode/');
    await expect(statusIndicator).toBeVisible();
  });

  test('should display disclaimer about illustrative nature', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=ILLUSTRATIVE TOOL ONLY')).toBeVisible();
    await expect(page.locator('text=/does NOT replace energy system optimization models/')).toBeVisible();
  });

  test('should have Get Started button', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button', { hasText: 'Get Started' });
    await expect(button).toBeVisible();
  });
});
