/**
 * Stakeholder Response Content Testing
 *
 * Simple test to extract and log stakeholder responses for manual evaluation
 */

import { test } from '@playwright/test';

test.describe('Stakeholder Response Content Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/stakeholder-dialogue/');
    await page.waitForLoadState('networkidle');
  });

  test('Extract responses from all 9 stakeholders with Example Scenario', async ({ page }) => {
    test.setTimeout(90000); // Increase timeout to 90 seconds for all 9 stakeholders
    console.log('\n' + '='.repeat(120));
    console.log(' '.repeat(30) + 'STAKEHOLDER RESPONSE CONTENT EVALUATION');
    console.log(' '.repeat(40) + 'Example Scenario (High Renewable Transition)');
    console.log('='.repeat(120) + '\n');

    // Load example scenario
    console.log('Loading example scenario...\n');
    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(2000);

    // Navigate to Stakeholder Dialogue tab
    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(1000);

    const stakeholders = [
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

    for (const stakeholder of stakeholders) {
      console.log('━'.repeat(120));
      console.log(`STAKEHOLDER: ${stakeholder}`);
      console.log('━'.repeat(120) + '\n');

      // Select stakeholder
      await page.click(`button:has-text("${stakeholder}")`);
      await page.waitForTimeout(1000);

      // Click "Predict Their Response" button to enter prediction mode
      const predictButton = page.locator('button:has-text("Predict Their Response")');
      if (await predictButton.count() > 0) {
        await predictButton.click();
        await page.waitForTimeout(500);
      }

      // Enter prediction
      const predictionTextarea = page.locator('textarea');
      if (await predictionTextarea.count() > 0) {
        await predictionTextarea.fill('Testing stakeholder response system for evaluation');
        await page.waitForTimeout(300);

        // Click Reveal Response button
        await page.click('button:has-text("Reveal Response")');
        await page.waitForTimeout(2000);
      }

      // Now we should be in CompareView - extract all content
      try {
        // Extract Initial Reaction
        const initialReactionHeading = page.locator('h4:has-text("Initial Reaction")');
        if (await initialReactionHeading.count() > 0) {
          const reactionText = await page.locator('h4:has-text("Initial Reaction") + p').textContent();
          console.log('INITIAL REACTION:');
          console.log(`  ${reactionText}\n`);
        }

        // Extract Appreciation
        const appreciationHeading = page.locator('h4:has-text("What They Appreciate")');
        if (await appreciationHeading.count() > 0) {
          const appreciationItems = await page.locator('h4:has-text("What They Appreciate") + ul li').allTextContents();
          if (appreciationItems.length > 0) {
            console.log(`WHAT THEY APPRECIATE (${appreciationItems.length} points):`);
            appreciationItems.forEach((item, i) => {
              // Clean up the checkmark symbol
              const cleanItem = item.replace(/^✓\s*/, '').trim();
              console.log(`  ${i + 1}. ${cleanItem}`);
            });
            console.log('');
          }
        }

        // Extract Concerns
        const concernsHeading = page.locator('h4:has-text("Their Concerns")');
        if (await concernsHeading.count() > 0) {
          const concernItems = await page.locator('h4:has-text("Their Concerns") + ul li').allTextContents();
          if (concernItems.length > 0) {
            console.log(`THEIR CONCERNS (${concernItems.length} concerns):`);
            concernItems.forEach((item, i) => {
              // Clean up the warning symbol
              const cleanItem = item.replace(/^⚠\s*/, '').trim();
              console.log(`  ${i + 1}. ${cleanItem}`);
            });
            console.log('');
          }
        }

        // Extract Questions
        const questionsHeading = page.locator('h4:has-text("Questions They Would Ask")');
        if (await questionsHeading.count() > 0) {
          const questionItems = await page.locator('h4:has-text("Questions They Would Ask") + ul li').allTextContents();
          if (questionItems.length > 0) {
            console.log(`QUESTIONS THEY WOULD ASK (${questionItems.length} questions):`);
            questionItems.forEach((item, i) => {
              // Clean up the question mark symbol
              const cleanItem = item.replace(/^❓\s*/, '').trim();
              console.log(`  ${i + 1}. ${cleanItem}`);
            });
            console.log('');
          }
        }

        // Extract Engagement Tips
        const tipsHeading = page.locator('h4:has-text("Engagement Tips")');
        if (await tipsHeading.count() > 0) {
          const tipItems = await page.locator('h4:has-text("Engagement Tips") + ul li').allTextContents();
          if (tipItems.length > 0) {
            console.log(`ENGAGEMENT TIPS (${tipItems.length} tips):`);
            tipItems.forEach((item, i) => {
              // Clean up the arrow symbol
              const cleanItem = item.replace(/^→\s*/, '').trim();
              console.log(`  ${i + 1}. ${cleanItem}`);
            });
            console.log('');
          }
        }

        // Extract generation type (optional)
        try {
          const generationType = await page.locator('text=/✨ AI-Enhanced Response|🔧 Rule-Based Response/').first().textContent({ timeout: 2000 });
          console.log(`GENERATION TYPE: ${generationType}\n`);
        } catch {
          // Generation type not found, skip it
        }

      } catch (error) {
        console.log(`❌ ERROR extracting response: ${error}\n`);
      }

      // Go back to stakeholder selection
      const backButton = page.locator('button:has-text("Try Another Stakeholder")');
      if (await backButton.count() > 0) {
        await backButton.click();
        await page.waitForTimeout(500);
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log(' '.repeat(40) + 'EVALUATION COMPLETE');
    console.log('='.repeat(120) + '\n');

    console.log('EVALUATION SUMMARY:');
    console.log('─'.repeat(120));
    console.log('✓ Tested all 9 stakeholder groups');
    console.log('✓ Extracted initial reactions, appreciations, concerns, questions, and engagement tips');
    console.log('✓ Responses logged above for manual evaluation');
    console.log('\nNEXT STEPS FOR EVALUATION:');
    console.log('  1. Review each stakeholder response for relevance to their priorities');
    console.log('  2. Check if concerns match expected thresholds (e.g., CSOs care about emissions, Grid Operators about integration)');
    console.log('  3. Verify questions align with stakeholder typical interests');
    console.log('  4. Assess if responses would be helpful for energy planners in workshops');
    console.log('  5. Identify any unrealistic or off-topic responses');
    console.log('─'.repeat(120) + '\n');
  });

  test('Test different development contexts (Enhanced Responses)', async ({ page }) => {
    console.log('\n' + '='.repeat(120));
    console.log(' '.repeat(30) + 'DEVELOPMENT CONTEXT SENSITIVITY TEST');
    console.log('='.repeat(120) + '\n');

    await page.click('button:has-text("Load Example")');
    await page.waitForTimeout(2000);

    await page.click('text=Stakeholder Dialogue');
    await page.waitForTimeout(1000);

    const contexts: Array<'least-developed' | 'emerging' | 'developed'> = [
      'least-developed',
      'emerging',
      'developed'
    ];

    const variants: Array<'conservative' | 'pragmatic' | 'progressive'> = [
      'conservative',
      'pragmatic',
      'progressive'
    ];

    // Test Policy Makers with different contexts
    console.log('━'.repeat(120));
    console.log('TESTING: Policy Makers & Regulators');
    console.log('━'.repeat(120) + '\n');

    for (const context of contexts) {
      for (const variant of variants) {
        console.log(`\nContext: ${context.toUpperCase()} | Variant: ${variant.toUpperCase()}`);
        console.log('─'.repeat(80));

        await page.click('button:has-text("Policy Makers & Regulators")');
        await page.waitForTimeout(1000);

        // Check if Response Settings exist (F044 feature)
        const contextSelect = page.locator('select').filter({ hasText: /Least Developed|Emerging|Developed/ });
        const variantSelect = page.locator('select').filter({ hasText: /Conservative|Pragmatic|Progressive/ });

        if (await contextSelect.count() > 0 && await variantSelect.count() > 0) {
          // Select context and variant
          await contextSelect.selectOption(context);
          await variantSelect.selectOption(variant);
          await page.waitForTimeout(300);
        } else {
          console.log('⚠️  Response Settings (F044) not found - using default settings');
        }

        // Enter prediction and reveal
        const predictionTextarea = page.locator('textarea');
        if (await predictionTextarea.count() > 0) {
          await predictionTextarea.fill(`Testing ${context} / ${variant}`);
          await page.click('button:has-text("Reveal Response")');
          await page.waitForTimeout(2000);
        }

        // Extract initial reaction
        const reaction = await page.locator('h4:has-text("Initial Reaction") + p').textContent();
        console.log(`Response: ${reaction?.substring(0, 150)}...`);

        // Go back
        await page.click('button:has-text("Try Another Stakeholder")');
        await page.waitForTimeout(500);
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log('CONTEXT SENSITIVITY TEST COMPLETE');
    console.log('='.repeat(120) + '\n');
  });
});
