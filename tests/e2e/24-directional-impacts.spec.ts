import { test, expect } from '@playwright/test';

test.describe('F024 - Directional Impact Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Load example scenario
    await page.getByRole('button', { name: /load.*example/i }).click();
    await expect(page.getByText(/ScenarioLand/i)).toBeVisible({ timeout: 10000 });

    // Navigate to Explore tab
    await page.getByRole('button', { name: /explore impacts/i }).click();
    await expect(page.getByRole('heading', { name: /explore impacts/i })).toBeVisible();
  });

  test('should show placeholder message when no adjustments made', async ({ page }) => {
    // Should show placeholder when no adjustments
    await expect(page.getByText(/adjust parameters above to see directional impacts/i)).toBeVisible();

    // Should NOT show DirectionalImpacts component yet
    await expect(page.getByText(/jobs/i).and(page.locator('.bg-blue-50'))).not.toBeVisible();
  });

  test('should display directional impacts after adjusting RE share 2030', async ({ page }) => {
    // Adjust RE share 2030 slider
    const slider = page.locator('#re-share-2030');
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    // Increase RE share significantly
    await slider.fill(String(Math.min(baseValue + 30, 100)));

    // Wait for impacts to render
    await page.waitForTimeout(500);

    // Should show DirectionalImpacts component
    await expect(page.getByRole('heading', { name: /directional impacts/i })).toBeVisible();

    // Should show all three impact cards
    await expect(page.getByText('Jobs').and(page.locator('.bg-blue-50'))).toBeVisible();
    await expect(page.getByText('Land Use').and(page.locator('.bg-green-50'))).toBeVisible();
    await expect(page.getByText('Emissions').and(page.locator('.bg-purple-50'))).toBeVisible();
  });

  test('should show increase in jobs when RE share increases significantly', async ({ page }) => {
    // Get base value
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    // Increase RE share 2030 by 25%
    await page.locator('#re-share-2030').fill(String(Math.min(baseValue + 25, 100)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Check Jobs card shows increase
    const jobsCard = page.locator('.bg-blue-50').filter({ hasText: 'Jobs' });
    await expect(jobsCard).toBeVisible();
    await expect(jobsCard.getByText(/increase/i)).toBeVisible();
    await expect(jobsCard.getByText('↑')).toBeVisible();
  });

  test('should show increase in land use when RE share increases significantly', async ({ page }) => {
    // Get base value
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    // Increase RE share 2040 by 35%
    await page.locator('#re-share-2040').fill(String(Math.min(baseValue + 35, 100)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Check Land Use card shows increase
    const landUseCard = page.locator('.bg-green-50').filter({ hasText: 'Land Use' });
    await expect(landUseCard).toBeVisible();
    await expect(landUseCard.getByText(/increase/i)).toBeVisible();
    await expect(landUseCard.getByText('↑')).toBeVisible();
  });

  test('should show decrease in emissions when RE share increases', async ({ page }) => {
    // Get base values
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    // Increase RE share 2030 significantly
    await page.locator('#re-share-2030').fill(String(Math.min(baseValue + 20, 100)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Check Emissions card shows decrease
    const emissionsCard = page.locator('.bg-purple-50').filter({ hasText: 'Emissions' });
    await expect(emissionsCard).toBeVisible();
    await expect(emissionsCard.getByText(/decrease/i)).toBeVisible();
    await expect(emissionsCard.getByText('↓')).toBeVisible();
  });

  test('should show decrease in emissions when coal phaseout is earlier', async ({ page }) => {
    // Get base coal phaseout year
    const coalLabel = page.locator('label[for="coal-phaseout"]').locator('xpath=following-sibling::*');
    const baseText = await coalLabel.locator('text=Base:').textContent();
    const baseYear = parseInt(baseText?.match(/\d+/)?.[0] || '2050');

    // Move coal phaseout earlier by 10 years
    await page.locator('#coal-phaseout').fill(String(Math.max(baseYear - 10, 2025)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Check Emissions card shows decrease
    const emissionsCard = page.locator('.bg-purple-50').filter({ hasText: 'Emissions' });
    await expect(emissionsCard).toBeVisible();
    await expect(emissionsCard.getByText(/decrease/i)).toBeVisible();
  });

  test('should show magnitude labels (minimal, moderate, significant)', async ({ page }) => {
    // Make a moderate adjustment
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    await page.locator('#re-share-2030').fill(String(Math.min(baseValue + 15, 100)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Should show magnitude labels
    const magnitudeTexts = ['Minimal', 'Moderate', 'Significant'];
    let foundMagnitude = false;

    for (const mag of magnitudeTexts) {
      const count = await page.getByText(mag, { exact: true }).count();
      if (count > 0) {
        foundMagnitude = true;
        break;
      }
    }

    expect(foundMagnitude).toBe(true);
  });

  test('should display explanatory text for each impact', async ({ page }) => {
    // Adjust RE share
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    await page.locator('#re-share-2030').fill(String(Math.min(baseValue + 20, 100)));

    // Wait for impacts
    await page.waitForTimeout(500);

    // Each card should have explanation text
    const jobsCard = page.locator('.bg-blue-50').filter({ hasText: 'Jobs' });
    const jobsText = await jobsCard.textContent();
    expect(jobsText?.length).toBeGreaterThan(50); // Should have meaningful explanation

    const landCard = page.locator('.bg-green-50').filter({ hasText: 'Land Use' });
    const landText = await landCard.textContent();
    expect(landText?.length).toBeGreaterThan(50);

    const emissionsCard = page.locator('.bg-purple-50').filter({ hasText: 'Emissions' });
    const emissionsText = await emissionsCard.textContent();
    expect(emissionsText?.length).toBeGreaterThan(50);
  });

  test('should show "How to Use These Indicators" note', async ({ page }) => {
    // Adjust slider
    const slider = page.locator('#re-share-2030');
    await slider.fill('80');

    // Wait for impacts
    await page.waitForTimeout(500);

    // Should show usage guidance
    await expect(page.getByText(/how to use these indicators/i)).toBeVisible();
    await expect(page.getByText(/directional indicators help you anticipate/i)).toBeVisible();
  });

  test('should hide impacts when reset to base scenario', async ({ page }) => {
    // Make adjustment
    await page.locator('#re-share-2030').fill('85');
    await page.waitForTimeout(500);

    // Should show impacts
    await expect(page.getByRole('heading', { name: /directional impacts/i })).toBeVisible();
    await expect(page.locator('.bg-blue-50').filter({ hasText: 'Jobs' })).toBeVisible();

    // Click reset
    await page.getByRole('button', { name: /reset to base scenario/i }).click();

    // Should hide impacts and show placeholder
    await expect(page.getByText(/adjust parameters above to see directional impacts/i)).toBeVisible();
    await expect(page.locator('.bg-blue-50').filter({ hasText: 'Jobs' })).not.toBeVisible();
  });

  test('should update impacts when multiple sliders adjusted', async ({ page }) => {
    // Get base values
    const baseRE2030Text = await page.locator('label[for="re-share-2030"]').locator('xpath=following-sibling::*').locator('text=Base:').textContent();
    const baseRE2030 = parseInt(baseRE2030Text?.match(/\d+/)?.[0] || '0');

    const baseRE2040Text = await page.locator('label[for="re-share-2040"]').locator('xpath=following-sibling::*').locator('text=Base:').textContent();
    const baseRE2040 = parseInt(baseRE2040Text?.match(/\d+/)?.[0] || '0');

    // Adjust RE 2030
    await page.locator('#re-share-2030').fill(String(Math.min(baseRE2030 + 20, 100)));
    await page.waitForTimeout(300);

    // Verify impacts visible
    await expect(page.locator('.bg-blue-50').filter({ hasText: 'Jobs' })).toBeVisible();

    // Adjust RE 2040 as well
    await page.locator('#re-share-2040').fill(String(Math.min(baseRE2040 + 25, 100)));
    await page.waitForTimeout(300);

    // Should still show impacts (now with combined effect)
    await expect(page.locator('.bg-blue-50').filter({ hasText: 'Jobs' })).toBeVisible();
    await expect(page.locator('.bg-green-50').filter({ hasText: 'Land Use' })).toBeVisible();
    await expect(page.locator('.bg-purple-50').filter({ hasText: 'Emissions' })).toBeVisible();
  });

  test('should show directional arrows (↑ ↓ →) appropriately', async ({ page }) => {
    // Increase RE significantly - should show increase arrows for jobs/land, decrease for emissions
    await page.locator('#re-share-2030').fill('90');
    await page.locator('#re-share-2040').fill('95');
    await page.waitForTimeout(500);

    // Check that directional arrows are present
    const pageContent = await page.textContent('body');
    const hasArrows = pageContent?.includes('↑') || pageContent?.includes('↓') || pageContent?.includes('→');
    expect(hasArrows).toBe(true);
  });

  test('should show unchanged direction for minimal adjustments', async ({ page }) => {
    // Get base value
    const baseValueText = await page.locator('text=Base:').first().textContent();
    const baseValue = parseInt(baseValueText?.match(/\d+/)?.[0] || '0');

    // Make minimal adjustment (2%)
    await page.locator('#re-share-2030').fill(String(baseValue + 2));
    await page.waitForTimeout(500);

    // At least one metric should show "unchanged" or "minimal"
    const hasUnchangedOrMinimal =
      (await page.getByText(/unchanged/i).count()) > 0 ||
      (await page.getByText(/minimal/i).count()) > 0 ||
      (await page.getByText('→').count()) > 0;

    expect(hasUnchangedOrMinimal).toBe(true);
  });

  test('should NOT show specific numbers or percentages', async ({ page }) => {
    // Adjust slider
    await page.locator('#re-share-2030').fill('80');
    await page.waitForTimeout(500);

    // Get DirectionalImpacts component text
    const impactsSection = page.locator('.card').filter({ hasText: /directional impacts/i }).first();
    const impactsText = await impactsSection.textContent();

    // Should NOT contain numeric job counts, land hectares, or emission tonnes
    // (These would indicate calculations rather than directional indicators)
    expect(impactsText).not.toMatch(/\d+\s+jobs/i);
    expect(impactsText).not.toMatch(/\d+\s+hectares/i);
    expect(impactsText).not.toMatch(/\d+\s+tonnes/i);
    expect(impactsText).not.toMatch(/\d+\s+mt\s+co2/i);

    // Should contain directional language
    expect(impactsText).toMatch(/increase|decrease|unchanged/i);
  });

  test('should maintain disclaimer about directional indicators', async ({ page }) => {
    // Adjust slider
    await page.locator('#re-share-2030').fill('85');
    await page.waitForTimeout(500);

    // Check for disclaimer in impacts component
    await expect(page.getByText(/directional trends only/i)).toBeVisible();
    await expect(page.getByText(/meant to spark discussion/i)).toBeVisible();
  });
});
