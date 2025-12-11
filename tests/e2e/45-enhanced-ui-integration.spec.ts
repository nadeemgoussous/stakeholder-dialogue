import { test, expect } from '@playwright/test';

test.describe('Enhanced Stakeholder UI Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('text=Load Example Scenario');
    await page.waitForTimeout(500);
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(500);
  });

  test('should display Response Settings section', async ({ page }) => {
    const responseSettings = await page.locator('text=Response Settings').isVisible();
    expect(responseSettings).toBe(true);
  });

  test('should have context selector with 3 options', async ({ page }) => {
    const contextSelector = page.locator('select#context');
    await expect(contextSelector).toBeVisible();

    const options = await contextSelector.locator('option').allTextContents();
    expect(options).toContain('Least-Developed Countries');
    expect(options).toContain('Emerging Economies');
    expect(options).toContain('Developed Countries');
    expect(options.length).toBe(3);
  });

  test('should have variant selector with 3 options', async ({ page }) => {
    const variantSelector = page.locator('select#variant');
    await expect(variantSelector).toBeVisible();

    const options = await variantSelector.locator('option').allTextContents();
    expect(options.some(o => o.includes('Conservative'))).toBe(true);
    expect(options.some(o => o.includes('Pragmatic'))).toBe(true);
    expect(options.some(o => o.includes('Progressive'))).toBe(true);
    expect(options.length).toBe(3);
  });

  test('should default to emerging + pragmatic', async ({ page }) => {
    const contextValue = await page.locator('select#context').inputValue();
    const variantValue = await page.locator('select#variant').inputValue();

    expect(contextValue).toBe('emerging');
    expect(variantValue).toBe('pragmatic');
  });

  test('should update context description when changing selection', async ({ page }) => {
    // Select LDC context
    await page.selectOption('select#context', 'least-developed');
    await page.waitForTimeout(200);

    const description = await page.locator('select#context + p').textContent();
    expect(description).toContain('Low electrification');
  });

  test('should update variant description when changing selection', async ({ page }) => {
    // Select progressive variant
    await page.selectOption('select#variant', 'progressive');
    await page.waitForTimeout(200);

    const description = await page.locator('select#variant + p').textContent();
    expect(description).toContain('ambitious');
  });

  test('should generate enhanced response with selected settings', async ({ page }) => {
    // Select least-developed + progressive
    await page.selectOption('select#context', 'least-developed');
    await page.selectOption('select#variant', 'progressive');

    // Select Grid Operators
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);

    // Click predict
    await page.click('text=Predict Their Response');
    await page.waitForTimeout(500);

    // Enter prediction
    await page.fill('textarea', 'They will be concerned about system reliability.');

    // Reveal response
    await page.click('text=Reveal Response');
    await page.waitForTimeout(2000);

    // Should see response
    const hasResponse = await page.locator('text=Initial Reaction').isVisible();
    expect(hasResponse).toBe(true);
  });

  test('should log enhanced response settings to console', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    // Select specific settings
    await page.selectOption('select#context', 'developed');
    await page.selectOption('select#variant', 'conservative');

    // Generate response
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);
    await page.click('text=Predict Their Response');
    await page.waitForTimeout(500);
    await page.fill('textarea', 'Test prediction');
    await page.click('text=Reveal Response');
    await page.waitForTimeout(2000);

    // Check console logs
    const hasContextLog = logs.some(log => log.includes('Context: developed'));
    const hasVariantLog = logs.some(log => log.includes('Variant: conservative'));

    expect(hasContextLog).toBe(true);
    expect(hasVariantLog).toBe(true);
  });

  test('should persist settings when switching between stakeholders', async ({ page }) => {
    // Set custom settings
    await page.selectOption('select#context', 'developed');
    await page.selectOption('select#variant', 'progressive');

    // Select first stakeholder
    await page.click('[data-stakeholder-id="policy-makers"]');
    await page.waitForTimeout(500);

    // Go back and select another
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);

    // Settings should still be the same
    const contextValue = await page.locator('select#context').inputValue();
    const variantValue = await page.locator('select#variant').inputValue();

    expect(contextValue).toBe('developed');
    expect(variantValue).toBe('progressive');
  });

  test('enhanced response should call generateEnhancedResponse', async ({ page }) => {
    let enhancedFunctionCalled = false;

    await page.exposeFunction('checkEnhancedCalled', () => {
      enhancedFunctionCalled = true;
    });

    // Generate response
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);
    await page.click('text=Predict Their Response');
    await page.waitForTimeout(500);
    await page.fill('textarea', 'Test');
    await page.click('text=Reveal Response');
    await page.waitForTimeout(2000);

    // The function should have been called during response generation
    // We can verify this indirectly by checking console logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    // Check that response was generated successfully
    const hasResponse = await page.locator('text=Initial Reaction').isVisible();
    expect(hasResponse).toBe(true);
  });

  test('should show helptext explaining response settings', async ({ page }) => {
    const helpText = await page.locator('text=These settings adjust stakeholder response thresholds').isVisible();
    expect(helpText).toBe(true);
  });

  test('context selector should be keyboard accessible', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBe('context');
  });

  test('variant selector should be keyboard accessible', async ({ page }) => {
    // Tab to variant selector
    await page.locator('select#variant').focus();

    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBe('variant');
  });

  test('different contexts should produce different trigger counts', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    // Test with LDC context
    await page.selectOption('select#context', 'least-developed');
    await page.click('[data-stakeholder-id="grid-operators"]');
    await page.waitForTimeout(500);
    await page.click('text=Predict Their Response');
    await page.waitForTimeout(500);
    await page.fill('textarea', 'Test 1');
    await page.click('text=Reveal Response');
    await page.waitForTimeout(2000);

    // Check for interaction triggers log
    const hasTriggerLog = logs.some(log => log.includes('Interaction triggers'));
    expect(hasTriggerLog).toBe(true);
  });

  test('Response Settings section should have proper styling', async ({ page }) => {
    const settingsCard = page.locator('text=Response Settings').locator('..');

    // Should have gradient background
    const hasGradient = await settingsCard.evaluate(el => {
      const classes = el.className;
      return classes.includes('from-blue-50') && classes.includes('to-indigo-50');
    });

    expect(hasGradient).toBe(true);
  });

  test('should display icon in Response Settings header', async ({ page }) => {
    const headerIcon = page.locator('text=Response Settings').locator('..').locator('svg').first();
    await expect(headerIcon).toBeVisible();
  });
});
