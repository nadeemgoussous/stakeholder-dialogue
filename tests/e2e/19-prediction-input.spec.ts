import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('F018: Predict-Before-Reveal Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    // Navigate to Stakeholder Dialogue tab
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.waitForSelector('h2:has-text("Stakeholder Dialogue")');
  });

  test('should show prediction input after clicking "Predict Their Response"', async ({ page }) => {
    // Select a stakeholder (Policy Makers)
    await page.click('button[aria-label="Select Policy Makers & Regulators"]');

    // Wait for stakeholder details
    await expect(page.locator('h3:has-text("Policy Makers & Regulators")')).toBeVisible();

    // Click "Predict Their Response" button
    await page.click('button:has-text("Predict Their Response")');

    // Should show prediction input page
    await expect(page.locator('h2:has-text("Policy Makers & Regulators")')).toBeVisible();
    await expect(page.locator('h3:has-text("What do you think Policy Makers & Regulators will say")')).toBeVisible();
  });

  test('should display stakeholder priorities as hints', async ({ page }) => {
    // Select CSOs & NGOs
    await page.click('button[aria-label="Select CSOs & NGOs"]');
    await page.click('button:has-text("Predict Their Response")');

    // Should show priorities section
    await expect(page.locator('h4:has-text("Their Key Priorities (Hints)")')).toBeVisible();

    // Should contain priority items - look for the ul with grid class that comes after the h4
    const prioritiesSection = page.locator('div.bg-gray-50:has(h4:has-text("Their Key Priorities"))');
    const listItems = prioritiesSection.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should require minimum 20 characters for prediction', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Industry & Business"]');
    await page.click('button:has-text("Predict Their Response")');

    const textarea = page.locator('textarea#prediction-input');
    const submitButton = page.locator('button:has-text("Reveal Response")');

    // Button should be disabled initially
    await expect(submitButton).toBeDisabled();

    // Type less than 20 characters
    await textarea.fill('Too short');
    await expect(submitButton).toBeDisabled();

    // Type exactly 20 characters
    await textarea.fill('12345678901234567890');
    await expect(submitButton).toBeEnabled();

    // Type more than 20 characters
    await textarea.fill('This is a longer prediction with more than twenty characters');
    await expect(submitButton).toBeEnabled();
  });

  test('should display character counter', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Grid Operators"]');
    await page.click('button:has-text("Predict Their Response")');

    const textarea = page.locator('textarea#prediction-input');
    const counter = page.locator('#character-count');

    // Initial counter should show 0
    await expect(counter).toContainText('0 / 20');

    // Type some text
    await textarea.fill('Hello World');
    await expect(counter).toContainText('11 / 20');

    // Type enough text
    await textarea.fill('This has more than 20 characters');
    const text = await textarea.inputValue();
    await expect(counter).toContainText(`${text.length} / 20`);
  });

  test('should change counter color when minimum reached', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Financial Institutions"]');
    await page.click('button:has-text("Predict Their Response")');

    const textarea = page.locator('textarea#prediction-input');
    const counter = page.locator('#character-count');

    // Counter should not be green initially
    await expect(counter).not.toHaveClass(/text-green/);

    // Type enough text
    await textarea.fill('This is enough text to reach the minimum character count');

    // Counter should be green
    await expect(counter).toHaveClass(/text-green/);
  });

  test('should allow user to go back to stakeholder selection', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Public & Communities"]');
    await page.click('button:has-text("Predict Their Response")');

    // Should be on prediction page
    await expect(page.locator('h3:has-text("What do you think")')).toBeVisible();

    // Click back button
    await page.click('button:has-text("Back to Stakeholder Selection")');

    // Should be back on stakeholder selection page
    await expect(page.locator('h3:has-text("Select Stakeholder Group")')).toBeVisible();
    await expect(page.locator('h3:has-text("What do you think")')).not.toBeVisible();
  });

  test('should clear prediction when going back and selecting different stakeholder', async ({ page }) => {
    // Select first stakeholder
    await page.click('button[aria-label="Select Policy Makers & Regulators"]');
    await page.click('button:has-text("Predict Their Response")');

    // Enter prediction
    await page.locator('textarea#prediction-input').fill('This is my prediction for policy makers');

    // Go back
    await page.click('button:has-text("Back to Stakeholder Selection")');

    // Select different stakeholder
    await page.click('button[aria-label="Select Grid Operators"]');
    await page.click('button:has-text("Predict Their Response")');

    // Textarea should be empty
    const textarea = page.locator('textarea#prediction-input');
    await expect(textarea).toHaveValue('');
  });

  test('should display learning tip about no right answer', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Scientific Institutions"]');
    await page.click('button:has-text("Predict Their Response")');

    // Should show learning tip
    await expect(page.locator('text=Learning Tip')).toBeVisible();
    await expect(page.locator('text=There\'s no "right" answer')).toBeVisible();
  });

  test('should call reveal response handler when form submitted', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Regional Bodies"]');
    await page.click('button:has-text("Predict Their Response")');

    // Fill in prediction
    const predictionText = 'I predict they will be concerned about regional integration and cross-border cooperation';
    await page.locator('textarea#prediction-input').fill(predictionText);

    // Click reveal button
    await page.click('button:has-text("Reveal Response")');

    // For now, just verify we don't get an error
    // (F019/F020 will implement the actual response display)
    // The component should log to console but not crash
    await page.waitForTimeout(500);
  });

  test('should use stakeholder color for submit button when enabled', async ({ page }) => {
    // Select a stakeholder (Industry - orange color)
    await page.click('button[aria-label="Select Industry & Business"]');
    await page.click('button:has-text("Predict Their Response")');

    const submitButton = page.locator('button:has-text("Reveal Response")');
    const textarea = page.locator('textarea#prediction-input');

    // Type enough text
    await textarea.fill('This is my prediction about industry stakeholders and their concerns');

    // Button should have stakeholder color
    const bgColor = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have a background color applied (not default)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('');
  });

  test('should display all stakeholder information on prediction page', async ({ page }) => {
    // Select Development Partners
    await page.click('button[aria-label="Select Development Partners"]');
    await page.click('button:has-text("Predict Their Response")');

    // Should show stakeholder name
    await expect(page.locator('h2:has-text("Development Partners")')).toBeVisible();

    // Should show icon
    const icon = page.locator('img[alt*="Development Partners"], svg[role="img"]').first();
    await expect(icon).toBeVisible();

    // Should show subtitle
    await expect(page.locator('text=Predict their response to your scenario')).toBeVisible();
  });

  test('should preserve selected stakeholder styling on prediction page', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select CSOs & NGOs"]');
    await page.click('button:has-text("Predict Their Response")');

    // Main card should have colored left border
    const card = page.locator('.card').first();
    const borderColor = await card.evaluate((el) => {
      return window.getComputedStyle(el).borderLeftColor;
    });

    // Should have a border color applied
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(borderColor).not.toBe('');
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Policy Makers & Regulators"]');
    await page.click('button:has-text("Predict Their Response")');

    // Tab to textarea
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to type
    await page.keyboard.type('This is my prediction using keyboard');

    const textarea = page.locator('textarea#prediction-input');
    await expect(textarea).toHaveValue('This is my prediction using keyboard');
  });

  test('should show minimum character requirement text', async ({ page }) => {
    // Select a stakeholder
    await page.click('button[aria-label="Select Industry & Business"]');
    await page.click('button:has-text("Predict Their Response")');

    // Should show requirement text
    await expect(page.locator('text=Minimum 20 characters required')).toBeVisible();
  });
});
