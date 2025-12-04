# Testing Workflow - MANDATORY FOR ALL FEATURES

## ⚠️ CRITICAL RULE

**NO FEATURE IS COMPLETE WITHOUT PASSING TESTS**

This is documented to prevent the mistake of marking features as complete without testing.

## Standard Feature Development Workflow

### 1. Implement Feature
- Write the code for the feature
- Ensure it follows CLAUDE.md specifications

### 2. Write Tests
- Create test file in `tests/e2e/`
- Name it with number prefix: `XX-feature-name.spec.ts`
- Include tests for:
  - ✅ Happy path
  - ✅ Error handling
  - ✅ **Offline mode (CRITICAL)**
  - ✅ Edge cases
  - ✅ Accessibility (if UI component)

### 3. Run Tests Locally
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/e2e/XX-feature-name.spec.ts

# Run in headed mode (see browser)
npm run test:headed

# Debug failing tests
npm run test:debug
```

### 4. Fix Failures
- If tests fail, fix the code or the test
- Re-run until all pass
- Check test results in `playwright-report/`

### 5. Mark Feature Complete
- **ONLY AFTER** all tests pass:
  - Update `feature_list.json`: `"passes": true`
  - Update `claude-progress.txt` with completion note
  - Commit with test results

### 6. Git Commit
```bash
git add .
git commit -m "feat: [feature name] (FXXX)

- Implemented [feature description]
- Added comprehensive tests
- All tests passing

Tests: XX passing
"
```

## Quick Test Commands Reference

```bash
# Development cycle
npm test                    # Run all tests
npm run test:ui            # Interactive UI mode
npm run test:headed        # See browser while testing
npm run test:debug         # Debug mode with breakpoints
npm run test:report        # View last test report

# Specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Watch mode (auto-rerun on changes)
npx playwright test --ui
```

## Test Results Interpretation

### ✅ All Tests Passing
```
56 passed (1.2m)
```
**Action**: Mark feature as complete in `feature_list.json`

### ❌ Some Tests Failing
```
12 passed
44 failed
```
**Action**:
1. Check `playwright-report/index.html`
2. Fix failing tests or code
3. Re-run tests
4. **DO NOT** mark feature complete

### ⚠️ Browser Not Installed
```
Error: browserType.launch: Executable doesn't exist
```
**Action**:
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Minimum Testing Requirements

### For Data/Logic Features (F003, F005)
- ✅ TypeScript compiles without errors
- ✅ Data is accessible in browser context
- ✅ Helper functions work correctly
- ✅ Values match specifications exactly

### For UI Components
- ✅ Component renders
- ✅ User interactions work
- ✅ Accessibility (keyboard nav, screen readers)
- ✅ Responsive on tablet viewports
- ✅ **Works offline**

### For Response Generation (F002)
- ✅ Generates responses in < 200ms (rule-based)
- ✅ Works completely offline
- ✅ Handles missing data gracefully
- ✅ AI failover to rule-based (no errors shown)
- ✅ All stakeholders tested

### For PWA/Offline Features
- ✅ Service worker registers
- ✅ Assets cached correctly
- ✅ Loads offline after first visit
- ✅ Offline indicator updates correctly

## Common Testing Mistakes to Avoid

### ❌ DON'T: Mark feature complete without running tests
```json
// feature_list.json
"passes": true  // ❌ Set without running tests
```

### ❌ DON'T: Skip offline testing
```typescript
// Missing offline test
test('should work', async ({ page }) => {
  await page.goto('/');
  // ... but didn't test offline
});
```

### ❌ DON'T: Ignore browser-specific failures
```
"It works in Chrome, that's good enough"  // ❌ Wrong!
```

### ✅ DO: Follow complete workflow
1. Write feature
2. Write tests
3. Run tests (all browsers)
4. Fix failures
5. **THEN** mark complete

## Test File Template

Save this for each new feature:

```typescript
import { test, expect } from '@playwright/test';

/**
 * [Feature Name] Tests (FXXX)
 *
 * REQUIREMENTS:
 * - [ ] Happy path works
 * - [ ] Errors handled gracefully
 * - [ ] Works offline
 * - [ ] Responsive design
 * - [ ] Accessibility
 */
test.describe('[Feature Name]', () => {

  test('should [happy path scenario]', async ({ page }) => {
    await page.goto('/');

    // Test implementation

    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Error scenario test
  });

  test('should work offline - CRITICAL', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);

    // Feature should still work
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Keyboard navigation
    await page.keyboard.press('Tab');

    // Check focus visible
  });
});
```

## Debugging Failed Tests

### Step 1: View HTML Report
```bash
npm run test:report
```

### Step 2: Run in Debug Mode
```bash
npm run test:debug
```

### Step 3: Check Screenshots
Failed tests save screenshots to `test-results/`

### Step 4: Add Debugging
```typescript
await page.pause();  // Pauses test execution
console.log(await page.content());  // Log page HTML
await page.screenshot({ path: 'debug.png' });  // Manual screenshot
```

## CI/CD Integration (Future)

When CI/CD is set up:
- All tests run on every commit
- Pull requests require passing tests
- Deployment blocked if tests fail

## Performance Benchmarks in Tests

Verify performance targets:

```typescript
test('should generate response quickly', async ({ page }) => {
  const start = Date.now();

  await page.click('[data-testid="reveal-response"]');
  await expect(page.locator('[data-testid="response"]')).toBeVisible();

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(2000);  // < 2 seconds
});
```

## Summary

**NEVER:**
- Mark a feature complete without passing tests
- Skip offline functionality tests
- Ignore test failures

**ALWAYS:**
- Write tests before marking feature complete
- Test in all browsers (Chrome, Firefox, Safari)
- Verify offline functionality
- Check test reports for details

---

**Remember**: Tests are not optional. They are part of the feature.
