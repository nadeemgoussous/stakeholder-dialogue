import { test, expect } from '@playwright/test';

/**
 * F022: Offline indicator and graceful degradation
 *
 * Requirements:
 * - Add online/offline status listener
 * - Show subtle offline indicator in header (not alarming)
 * - When offline: show informative message in StakeholderTab
 * - NEVER show loading spinners for core stakeholder responses
 * - Responses must feel instant (< 2 seconds)
 * - Silent failover to rule-based when AI unavailable
 */

test.describe('F022: Offline Indicator and Graceful Degradation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('online indicator shows when connected', async ({ page }) => {
    // Check header has online indicator
    const onlineStatus = page.locator('[role="status"]').first();
    await expect(onlineStatus).toBeVisible();
    await expect(onlineStatus).toContainText('Online');

    // Should have green styling (not red/yellow)
    const hasGreenIndicator = await onlineStatus.locator('.bg-green-300, .text-green-200').count();
    expect(hasGreenIndicator).toBeGreaterThan(0);
  });

  test('offline indicator appears when connection lost', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Wait a moment for React to update
    await page.waitForTimeout(500);

    // Check header shows offline status
    const onlineStatus = page.locator('[role="status"]').first();
    await expect(onlineStatus).toBeVisible();
    await expect(onlineStatus).toContainText('Offline');

    // Should have blue styling (not red/alarming)
    const hasBlueIndicator = await onlineStatus.locator('.bg-blue-300, .text-blue-100').count();
    expect(hasBlueIndicator).toBeGreaterThan(0);
  });

  test('offline indicator is subtle and not alarming', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    const onlineStatus = page.locator('[role="status"]').first();

    // Check it's not red (error color)
    const hasRedIndicator = await onlineStatus.locator('.bg-red-500, .text-red-500, .bg-red-600').count();
    expect(hasRedIndicator).toBe(0);

    // Check it's not yellow warning
    const hasYellowIndicator = await onlineStatus.locator('.bg-yellow-500, .text-yellow-500').count();
    expect(hasYellowIndicator).toBe(0);

    // Should be blue (calm, informative)
    await expect(onlineStatus).toHaveClass(/bg-blue/);
  });

  test('stakeholder tab shows offline message when disconnected', async ({ page, context }) => {
    // Load example scenario first
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(1000);

    // Navigate to stakeholder tab
    await page.click('button:has-text("Proceed to Stakeholder Dialogue")');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Check for offline message in stakeholder tab
    const offlineMessage = page.locator('text=/Working offline.*rule-based/i');
    await expect(offlineMessage).toBeVisible();

    // Message should not be alarming
    const messageContainer = offlineMessage.locator('..');
    await expect(messageContainer).toHaveClass(/bg-blue-50/);
  });

  test('responses still work offline (rule-based)', async ({ page, context }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(1000);

    // Navigate to stakeholder tab
    await page.click('button:has-text("Proceed to Stakeholder Dialogue")');

    // Go offline BEFORE selecting stakeholder
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Select a stakeholder
    await page.click('button[aria-label*="Policy Makers"]');
    await page.waitForTimeout(500);

    // Click predict button
    await page.click('button:has-text("Predict Their Response")');

    // Enter prediction
    const predictionBox = page.locator('textarea[placeholder*="prediction"]');
    await predictionBox.fill('They will be concerned about costs and implementation timeline');

    // Reveal response
    await page.click('button:has-text("Reveal Response")');

    // Response should appear (using rule-based generation)
    const responseSection = page.locator('text=/Initial Reaction/i');
    await expect(responseSection).toBeVisible({ timeout: 3000 });

    // Should show rule-based indicator
    const generationType = page.locator('text=/rule-based/i');
    await expect(generationType).toBeVisible();
  });

  test('responses are instant (no loading spinners)', async ({ page }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(1000);

    // Navigate to stakeholder tab
    await page.click('button:has-text("Proceed to Stakeholder Dialogue")');

    // Select stakeholder
    await page.click('button[aria-label*="Grid Operators"]');
    await page.waitForTimeout(500);

    // Click predict button
    await page.click('button:has-text("Predict Their Response")');

    // Enter prediction
    const predictionBox = page.locator('textarea[placeholder*="prediction"]');
    await predictionBox.fill('They will worry about grid stability and renewable integration');

    // Reveal response and measure time
    const startTime = Date.now();
    await page.click('button:has-text("Reveal Response")');

    // Response should appear quickly
    const responseSection = page.locator('text=/Initial Reaction/i');
    await expect(responseSection).toBeVisible({ timeout: 3000 });

    const elapsedTime = Date.now() - startTime;

    // Should be under 2 seconds (usually < 500ms for rule-based)
    expect(elapsedTime).toBeLessThan(2000);

    // Check there are NO loading spinners in the document
    const spinners = page.locator('.animate-spin, [role="progressbar"], text=/loading/i');
    const spinnerCount = await spinners.count();
    expect(spinnerCount).toBe(0);
  });

  test('status updates when network changes', async ({ page, context }) => {
    const onlineStatus = page.locator('[role="status"]').first();

    // Start online
    await expect(onlineStatus).toContainText('Online');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await expect(onlineStatus).toContainText('Offline');

    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(500);
    await expect(onlineStatus).toContainText('Online');
  });

  test('offline indicator has accessible attributes', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    const onlineStatus = page.locator('[role="status"]').first();

    // Should have role="status" for screen readers
    await expect(onlineStatus).toHaveAttribute('role', 'status');

    // Should have aria-live for dynamic updates
    await expect(onlineStatus).toHaveAttribute('aria-live', 'polite');

    // Should have descriptive title/tooltip
    const hasTitle = await onlineStatus.getAttribute('title');
    expect(hasTitle).toBeTruthy();
    expect(hasTitle).toContain('offline');
  });

  test('no error messages or warnings when offline', async ({ page, context }) => {
    // Load example and navigate
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Proceed to Stakeholder Dialogue")');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Select stakeholder and generate response
    await page.click('button[aria-label*="Policy Makers"]');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Predict Their Response")');
    const predictionBox = page.locator('textarea[placeholder*="prediction"]');
    await predictionBox.fill('They will be concerned');
    await page.click('button:has-text("Reveal Response")');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for error messages
    const errorMessages = page.locator('text=/error|failed|unable to/i');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  test('generation type indicator shows "rule-based" when offline', async ({ page, context }) => {
    // Load example scenario
    await page.click('button:has-text("Load Rwanda Example")');
    await page.waitForTimeout(1000);

    // Navigate to stakeholder tab
    await page.click('button:has-text("Proceed to Stakeholder Dialogue")');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Select stakeholder
    await page.click('button[aria-label*="Industry"]');
    await page.waitForTimeout(500);

    // Generate response
    await page.click('button:has-text("Predict Their Response")');
    const predictionBox = page.locator('textarea[placeholder*="prediction"]');
    await predictionBox.fill('They will focus on costs and reliability');
    await page.click('button:has-text("Reveal Response")');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check generation type indicator
    const generationIndicator = page.locator('text=/Generated by.*rule-based/i');
    await expect(generationIndicator).toBeVisible();

    // Should NOT say "AI-enhanced" when offline
    const aiEnhanced = page.locator('text=/AI-enhanced/i');
    await expect(aiEnhanced).not.toBeVisible();
  });
});
