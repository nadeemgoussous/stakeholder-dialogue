import { test, expect } from '@playwright/test';

test.describe('F016: Stakeholder Tab with Icon Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Navigate to Stakeholder Dialogue tab
    await page.click('text=Stakeholder Dialogue');
    await expect(page.locator('h2:has-text("Stakeholder Dialogue")')).toBeVisible();
  });

  test('should display stakeholder tab header and instructions', async ({ page }) => {
    // Check header
    await expect(page.locator('h2:has-text("Stakeholder Dialogue")')).toBeVisible();
    await expect(page.locator('text=Select a stakeholder group to explore their perspective')).toBeVisible();

    // Check instruction text (before selection)
    await expect(page.locator('text=Click on a stakeholder group above')).toBeVisible();
  });

  test('should display all 9 stakeholder icons in grid', async ({ page }) => {
    // Check that we have 9 stakeholder buttons
    const stakeholderButtons = page.locator('button.stakeholder-button');
    await expect(stakeholderButtons).toHaveCount(9);

    // Verify all expected stakeholder names are present
    const expectedStakeholders = [
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

    for (const name of expectedStakeholders) {
      await expect(page.locator(`button:has-text("${name}")`)).toBeVisible();
    }
  });

  test('should select a stakeholder when clicked', async ({ page }) => {
    // Click on Policy Makers
    const policyMakersButton = page.locator('button:has-text("Policy Makers & Regulators")');
    await policyMakersButton.click();

    // Check that button shows selected state (aria-pressed)
    await expect(policyMakersButton).toHaveAttribute('aria-pressed', 'true');

    // Check that details panel appears
    await expect(page.locator('h3:has-text("Policy Makers & Regulators")')).toBeVisible();
  });

  test('should display stakeholder details after selection', async ({ page }) => {
    // Select Grid Operators
    await page.click('button:has-text("Grid Operators")');

    // Check that description is shown
    await expect(page.locator('text=Entities responsible for operating and developing power networks')).toBeVisible();

    // Check that Key Priorities section is shown (open by default)
    await expect(page.locator('button:has-text("Key Priorities")')).toBeVisible();
    await expect(page.locator('text=System reliability and security of supply')).toBeVisible();

    // Check that Typical Questions collapsible section is shown
    await expect(page.locator('button:has-text("Typical Questions They Ask")')).toBeVisible();

    // Check that Engagement Rationale collapsible section is shown
    await expect(page.locator('button:has-text("Engagement Rationale")')).toBeVisible();
  });

  test('should show priorities for selected stakeholder', async ({ page }) => {
    // Select Industry & Business
    await page.click('button:has-text("Industry & Business")');

    // Check priorities are displayed
    await expect(page.locator('text=Reliable electricity supply')).toBeVisible();
    await expect(page.locator('text=Competitive energy costs')).toBeVisible();
    await expect(page.locator('text=Predictable policy environment')).toBeVisible();
  });

  test('should show typical questions for selected stakeholder', async ({ page }) => {
    // Select Public & Communities
    await page.click('button:has-text("Public & Communities")');

    // Expand the "Typical Questions" collapsible section
    await page.click('button:has-text("Typical Questions They Ask")');

    // Check questions are displayed with question marks
    await expect(page.locator('text=How will this affect electricity bills?')).toBeVisible();
    await expect(page.locator('text=Will there be jobs for local people?')).toBeVisible();
  });

  test('should show why engage and benefit information', async ({ page }) => {
    // Select CSOs & NGOs
    await page.click('button:has-text("CSOs & NGOs")');

    // Expand the "Engagement Rationale" collapsible section
    await page.click('button:has-text("Engagement Rationale")');

    // Check "Why Engage" section (now shown as text label, not h4)
    await expect(page.locator('text=Why Engage This Group?')).toBeVisible();
    await expect(page.locator('text=Represent public interests')).toBeVisible();

    // Check "What's In It For Them" section
    await expect(page.locator('text=What\'s In It For Them?')).toBeVisible();
  });

  test('should apply stakeholder-specific colors', async ({ page }) => {
    // Select Financial Institutions (green color: #2e5a3a)
    const financeButton = page.locator('button:has-text("Financial Institutions")');
    await financeButton.click();

    // Check that the header has the stakeholder color
    const header = page.locator('h3:has-text("Financial Institutions")');
    await expect(header).toHaveCSS('color', 'rgb(46, 90, 58)'); // #2e5a3a

    // Check that the card has a colored left border
    const card = page.locator('[style*="border-left-color"]').first();
    await expect(card).toBeVisible();
  });

  test('should show "Predict Their Response" button for selected stakeholder', async ({ page }) => {
    // Select Development Partners
    await page.click('button:has-text("Development Partners")');

    // Check that the button is visible
    const predictButton = page.locator('button:has-text("Predict Their Response")');
    await expect(predictButton).toBeVisible();
    await expect(predictButton).toBeEnabled();
  });

  test('should allow switching between stakeholders', async ({ page }) => {
    // Select Policy Makers
    await page.click('button:has-text("Policy Makers & Regulators")');
    await expect(page.locator('h3:has-text("Policy Makers & Regulators")')).toBeVisible();

    // Switch to Scientific Institutions
    await page.click('button:has-text("Scientific Institutions")');
    await expect(page.locator('h3:has-text("Scientific Institutions")')).toBeVisible();
    await expect(page.locator('text=Methodological rigor')).toBeVisible();

    // Verify Policy Makers details are no longer shown
    await expect(page.locator('text=Alignment with national development goals')).not.toBeVisible();
  });

  test('should hide instruction text after selecting stakeholder', async ({ page }) => {
    // Initially, instruction text should be visible
    await expect(page.locator('text=Click on a stakeholder group above')).toBeVisible();

    // Select a stakeholder
    await page.click('button:has-text("Regional Bodies")');

    // Instruction text should be hidden
    await expect(page.locator('text=Click on a stakeholder group above')).not.toBeVisible();

    // Details panel should be visible instead
    await expect(page.locator('h3:has-text("Regional Bodies")')).toBeVisible();
  });

  test('should support keyboard navigation and accessibility', async ({ page }) => {
    // Focus on first stakeholder button
    const firstButton = page.locator('button.stakeholder-button').first();
    await firstButton.focus();

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Check that stakeholder is selected
    await expect(firstButton).toHaveAttribute('aria-pressed', 'true');

    // Check aria-label is present
    await expect(firstButton).toHaveAttribute('aria-label');
  });

  test('should display all stakeholders with proper grid layout on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Check grid layout
    const grid = page.locator('.grid.grid-cols-3');
    await expect(grid).toBeVisible();

    // All 9 stakeholders should be visible
    const buttons = page.locator('button.stakeholder-button');
    await expect(buttons).toHaveCount(9);
  });

  test('should show responsive grid on tablet', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    // Re-navigate after viewport change
    await page.goto('http://localhost:5173');
    await page.click('text=Stakeholder Dialogue');

    // Should still show all 9 stakeholders
    const buttons = page.locator('button.stakeholder-button');
    await expect(buttons).toHaveCount(9);

    // Click should still work on tablet
    await page.click('button:has-text("Industry & Business")');
    await expect(page.locator('h3:has-text("Industry & Business")')).toBeVisible();
  });
});
