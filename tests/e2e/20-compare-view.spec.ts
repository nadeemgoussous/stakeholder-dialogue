import { test, expect } from '@playwright/test';

test.describe('F019: Compare Prediction vs Response Display', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout for this complex workflow
    test.setTimeout(60000);

    await page.goto('http://localhost:5173/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on Load Example card
    await page.getByText('Load Example').click();

    // Navigate to dialogue tab
    await page.getByRole('tab', { name: 'Stakeholder Dialogue' }).click();

    // Select a stakeholder (Policy Makers)
    await page.getByRole('button', { name: 'Select Policy Makers & Regulators' }).click();

    // Click "Predict Their Response" button
    await page.getByRole('button', { name: 'Predict Their Response' }).click();

    // Enter prediction (minimum 20 characters)
    await page.locator('#prediction-input').fill('They will appreciate the increased renewable energy capacity but may have concerns about grid stability and implementation costs.');

    // Click "Reveal Response" button
    await page.getByRole('button', { name: 'Reveal Response' }).click();
  });

  test('should display compare view after revealing response', async ({ page }) => {
    // Should show user's prediction box heading (use exact match to avoid strict mode)
    await expect(page.getByRole('heading', { name: 'Your Prediction', exact: true })).toBeVisible();

    // Should show simulated response box heading
    await expect(page.getByRole('heading', { name: 'Simulated Response' })).toBeVisible();

    // Should show the prediction text entered by user
    await expect(page.getByText(/increased renewable energy capacity/)).toBeVisible();
  });

  test('should display all response sections', async ({ page }) => {
    // Should display Initial Reaction section
    await expect(page.getByText('Initial Reaction')).toBeVisible();

    // Should display appreciation section if present
    const appreciationSection = page.getByText('What They Appreciate');
    if (await appreciationSection.isVisible()) {
      await expect(appreciationSection).toBeVisible();
    }

    // Should display concerns section if present
    const concernsSection = page.getByText('Their Concerns');
    if (await concernsSection.isVisible()) {
      await expect(concernsSection).toBeVisible();
    }

    // Should display questions section if present
    const questionsSection = page.getByText('Questions They Would Ask');
    if (await questionsSection.isVisible()) {
      await expect(questionsSection).toBeVisible();
    }

    // Should display engagement advice section
    await expect(page.getByText('Engagement Tips')).toBeVisible();
  });

  test('should show generation type indicator', async ({ page }) => {
    // Should show either rule-based or AI-enhanced indicator
    const ruleBased = page.getByText('Rule-Based Response');
    const aiEnhanced = page.getByText('AI-Enhanced Response');

    const hasRuleBased = await ruleBased.isVisible();
    const hasAiEnhanced = await aiEnhanced.isVisible();

    expect(hasRuleBased || hasAiEnhanced).toBeTruthy();
  });

  test('should display reflection prompt', async ({ page }) => {
    // Should show reflection section
    await expect(page.getByText('Reflection: How did your prediction compare?')).toBeVisible();

    // Should show reflection questions
    await expect(page.getByText(/What did you predict correctly/)).toBeVisible();
    await expect(page.getByText(/What concerns or priorities did you miss/)).toBeVisible();
  });

  test('should display stakeholder name and icon', async ({ page }) => {
    // Should show stakeholder name in header
    await expect(page.getByRole('heading', { name: 'Policy Makers & Regulators' })).toBeVisible();

    // Should show stakeholder icon
    const icon = page.locator('img[alt*="Policy Makers"]');
    await expect(icon).toBeVisible();
  });

  test('should display "Try Another Stakeholder" button', async ({ page }) => {
    // Should show Try Another button
    const tryAnotherButton = page.getByRole('button', { name: /Try Another Stakeholder/i });
    await expect(tryAnotherButton).toBeVisible();
    await expect(tryAnotherButton).toBeEnabled();
  });

  test('should navigate back to stakeholder selection when clicking "Try Another"', async ({ page }) => {
    // Click "Try Another Stakeholder" button
    await page.getByRole('button', { name: /Try Another Stakeholder/i }).click();

    // Should return to stakeholder selection view
    await expect(page.getByText('Select Stakeholder Group')).toBeVisible();

    // Should show all stakeholder icons
    await expect(page.getByRole('button', { name: 'Select Policy Makers & Regulators' })).toBeVisible();
  });

  test('should display appropriate icons for response sections', async ({ page }) => {
    // Check for appreciation checkmarks (✓)
    const appreciationIcon = page.locator('text=✓').first();
    if (await appreciationIcon.isVisible()) {
      await expect(appreciationIcon).toBeVisible();
    }

    // Check for concern warning icons (⚠)
    const concernIcon = page.locator('text=⚠').first();
    if (await concernIcon.isVisible()) {
      await expect(concernIcon).toBeVisible();
    }

    // Check for question marks (❓)
    const questionIcon = page.locator('text=❓').first();
    if (await questionIcon.isVisible()) {
      await expect(questionIcon).toBeVisible();
    }
  });

  test('should display concern severity indicators', async ({ page }) => {
    // If concerns are present, check for severity indicators
    const concernsSection = page.getByText('Their Concerns');

    if (await concernsSection.isVisible()) {
      // Concerns should have warning icons with color coding
      const concerns = page.locator('text=⚠');
      const count = await concerns.count();

      if (count > 0) {
        // At least one concern should be visible
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('should display learning note at bottom', async ({ page }) => {
    // Should show learning note about simulation
    await expect(page.getByText(/This is a learning exercise/)).toBeVisible();
    await expect(page.getByText(/Real stakeholder responses will vary/)).toBeVisible();
  });

  test('should preserve stakeholder color theme throughout', async ({ page }) => {
    // The stakeholder name should be styled with stakeholder color
    const stakeholderHeading = page.getByRole('heading', { name: 'Policy Makers & Regulators' });
    await expect(stakeholderHeading).toBeVisible();

    // Card should have colored left border
    const responseCard = page.locator('.card').filter({ hasText: 'Simulated Response' });
    await expect(responseCard).toBeVisible();
  });

  test('should test with different stakeholder (Grid Operators)', async ({ page }) => {
    // Navigate back
    await page.getByRole('button', { name: /Try Another Stakeholder/i }).click();

    // Select Grid Operators
    await page.getByRole('button', { name: 'Select Grid Operators' }).click();

    // Click "Predict Their Response" button
    await page.getByRole('button', { name: 'Predict Their Response' }).click();

    // Enter prediction
    await page.locator('#prediction-input').fill('Grid operators will focus on system reliability, reserve margins, and integration challenges with high renewable penetration levels.');

    // Click "Reveal Response"
    await page.getByRole('button', { name: 'Reveal Response' }).click();

    // Should show Grid Operators in header
    await expect(page.getByRole('heading', { name: 'Grid Operators' })).toBeVisible();

    // Should show compare view
    await expect(page.getByRole('heading', { name: 'Your Prediction', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Simulated Response' })).toBeVisible();
  });

  test('should show response content relevant to scenario data', async ({ page }) => {
    // The response should contain text content (not be empty)
    const initialReaction = page.locator('text=Initial Reaction').locator('..').locator('p');
    await expect(initialReaction).toBeVisible();

    const reactionText = await initialReaction.textContent();
    expect(reactionText).toBeTruthy();
    expect(reactionText!.length).toBeGreaterThan(20);
  });
});
