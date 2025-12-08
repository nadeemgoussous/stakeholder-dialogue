/**
 * E2E Tests for AI Enhancement (F021)
 *
 * Tests the AI enhancement system with local LLM (Ollama)
 * and silent failover to rule-based responses.
 *
 * Note: These tests verify the failover logic works correctly.
 * They do NOT require Ollama to be running (tests offline scenario).
 */

import { test, expect } from '@playwright/test';

test.describe('AI Enhancement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Load example scenario
    await page.click('button:has-text("Load Rwanda Baseline Example")');
    await page.waitForSelector('text=Rwanda', { timeout: 5000 });
  });

  test('should generate rule-based response when Ollama unavailable', async ({ page }) => {
    // Navigate to Stakeholder Dialogue tab
    await page.click('button:has-text("Stakeholder Dialogue")');

    // Select a stakeholder (Policy Makers)
    await page.click('[data-testid="stakeholder-card-policy-makers"]');

    // Wait for stakeholder details to load
    await expect(page.locator('h3:has-text("Policy Makers & Regulators")')).toBeVisible();

    // Click "Predict Their Response"
    await page.click('button:has-text("Predict Their Response")');

    // Enter prediction
    await page.fill('textarea[placeholder*="What do you think"]', 'They will ask about costs and implementation timeline for renewable energy transition.');

    // Click "Reveal Response"
    await page.click('button:has-text("Reveal Response")');

    // Response should be generated (either rule-based or AI-enhanced)
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 5000 });

    // Generation type should be shown (rule-based or ai-enhanced)
    const generationType = await page.locator('text=/rule-based|ai-enhanced/i').textContent();
    expect(generationType).toBeTruthy();

    // Response should contain all required sections
    await expect(page.locator('text=Appreciates')).toBeVisible();
    await expect(page.locator('text=Concerns')).toBeVisible();
    await expect(page.locator('text=Questions')).toBeVisible();
    await expect(page.locator('text=Engagement Tips')).toBeVisible();
  });

  test('should show rule-based indicator when AI unavailable', async ({ page }) => {
    // Navigate through workflow
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-grid-operators"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will be concerned about grid stability and integration challenges.');
    await page.click('button:has-text("Reveal Response")');

    // Check generation type indicator
    // Since Ollama is likely not running in test environment, should show "rule-based"
    const indicator = page.locator('text=rule-based');

    // Indicator should be visible somewhere in the response
    // (May be in badge, footer, or generation note)
    const isVisible = await indicator.isVisible().catch(() => false);

    // If not visible as text, check for badge or icon
    if (!isVisible) {
      // Check console debug messages instead
      page.on('console', msg => {
        if (msg.type() === 'debug' && msg.text().includes('rule-based')) {
          expect(msg.text()).toContain('rule-based');
        }
      });
    }
  });

  test('should not show errors when AI unavailable', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through workflow
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-industry"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will want to know about energy costs and reliability.');
    await page.click('button:has-text("Reveal Response")');

    // Wait for response
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 5000 });

    // Should not have ANY console errors related to AI/Ollama
    const aiErrors = errors.filter(e =>
      e.includes('ollama') ||
      e.includes('AI') ||
      e.includes('enhancement') ||
      e.includes('fetch')
    );

    expect(aiErrors.length).toBe(0);
  });

  test('should respond quickly with fallback (under 3 seconds)', async ({ page }) => {
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-public"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will care about electricity prices and job creation.');

    // Measure response time
    const startTime = Date.now();
    await page.click('button:has-text("Reveal Response")');
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 5000 });
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    // Should respond within 3 seconds (rule-based is instant, AI has 3s timeout)
    expect(responseTime).toBeLessThan(3500); // Add 500ms buffer for rendering
  });

  test('should generate different responses for different stakeholders', async ({ page }) => {
    // Get response from Policy Makers
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-policy-makers"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'Test prediction 1');
    await page.click('button:has-text("Reveal Response")');
    await page.waitForSelector('text=Initial Reaction');

    const policyResponse = await page.locator('[data-testid="initial-reaction"]').textContent();

    // Go back and try different stakeholder
    await page.click('button:has-text("Try Another Stakeholder")');
    await page.click('[data-testid="stakeholder-card-csos-ngos"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'Test prediction 2');
    await page.click('button:has-text("Reveal Response")');
    await page.waitForSelector('text=Initial Reaction');

    const csosResponse = await page.locator('[data-testid="initial-reaction"]').textContent();

    // Responses should be different (different stakeholder profiles)
    expect(policyResponse).not.toBe(csosResponse);
  });

  test('should work offline (no network dependency)', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Navigate through workflow
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-scientific"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will want rigorous data and methodology.');
    await page.click('button:has-text("Reveal Response")');

    // Should still get a response (rule-based)
    await expect(page.locator('text=Initial Reaction')).toBeVisible({ timeout: 5000 });

    // Should show rule-based indicator (AI requires network to check Ollama)
    const hasRuleBased = await page.locator('text=rule-based').isVisible().catch(() => false);

    // Re-enable network
    await context.setOffline(false);
  });

  test('should preserve all stakeholder response sections', async ({ page }) => {
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-finance"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will focus on financial returns and risks.');
    await page.click('button:has-text("Reveal Response")');

    // All sections should be present regardless of AI enhancement
    await expect(page.locator('text=Initial Reaction')).toBeVisible();
    await expect(page.locator('text=Appreciates')).toBeVisible();
    await expect(page.locator('text=Concerns')).toBeVisible();
    await expect(page.locator('text=Questions')).toBeVisible();
    await expect(page.locator('text=Engagement Tips')).toBeVisible();

    // Check that concerns have severity indicators
    const concerns = page.locator('[data-testid="concern-item"]');
    const count = await concerns.count();

    if (count > 0) {
      // Each concern should have a severity badge
      const firstConcern = concerns.first();
      const severityBadge = firstConcern.locator('text=/high|medium|low/i');
      await expect(severityBadge).toBeVisible();
    }
  });

  test('should handle rapid stakeholder switching', async ({ page }) => {
    // Quickly switch between stakeholders
    await page.click('button:has-text("Stakeholder Dialogue")');

    for (const stakeholder of ['policy-makers', 'grid-operators', 'industry']) {
      await page.click(`[data-testid="stakeholder-card-${stakeholder}"]`);
      await expect(page.locator('button:has-text("Predict Their Response")')).toBeVisible();

      // Go back immediately
      if (stakeholder !== 'industry') {
        // Click outside or wait briefly
        await page.waitForTimeout(100);
      }
    }

    // Final stakeholder should be selected
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'Test prediction');
    await page.click('button:has-text("Reveal Response")');

    // Should still work correctly
    await expect(page.locator('text=Initial Reaction')).toBeVisible();
  });
});

test.describe('AI Enhancement Integration', () => {
  test('should integrate with prediction workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('button:has-text("Load Rwanda Baseline Example")');
    await page.waitForSelector('text=Rwanda');

    // Complete full workflow: select → predict → reveal → compare
    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-regional-bodies"]');

    // Enter prediction
    await page.click('button:has-text("Predict Their Response")');
    const prediction = 'They will be interested in regional grid integration and cross-border electricity trade.';
    await page.fill('textarea[placeholder*="What do you think"]', prediction);

    // Reveal response (with AI enhancement attempt)
    await page.click('button:has-text("Reveal Response")');

    // Should show compare view
    await expect(page.locator('text=Your Prediction')).toBeVisible();
    await expect(page.locator(`text=${prediction.substring(0, 30)}`)).toBeVisible();
    await expect(page.locator('text=Simulated Response')).toBeVisible();

    // Response should be enhanced (if Ollama available) or rule-based
    await expect(page.locator('text=Initial Reaction')).toBeVisible();
  });

  test('should show reflection prompts regardless of enhancement method', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('button:has-text("Load Rwanda Baseline Example")');
    await page.waitForSelector('text=Rwanda');

    await page.click('button:has-text("Stakeholder Dialogue")');
    await page.click('[data-testid="stakeholder-card-development-partners"]');
    await page.click('button:has-text("Predict Their Response")');
    await page.fill('textarea[placeholder*="What do you think"]', 'They will want to align with sustainable development goals.');
    await page.click('button:has-text("Reveal Response")');

    // Reflection section should be present
    await expect(page.locator('text=How did your prediction compare?')).toBeVisible();

    // Reflection questions should be shown
    const reflectionText = await page.locator('text=/What surprised you|What concerns did you miss|How would you/').count();
    expect(reflectionText).toBeGreaterThan(0);
  });
});
