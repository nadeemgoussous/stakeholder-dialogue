# Testing Guide for Scenario Dialogue Tool

## **CRITICAL TESTING PRINCIPLE**

**NO FEATURE IS COMPLETE WITHOUT PASSING TESTS.**

Per CLAUDE.md agent instructions:
- Work on ONE feature at a time
- Write tests for the feature
- Run tests and verify they pass
- **ONLY THEN** mark feature as `"passes": true` in `feature_list.json`

## Testing Stack

- **Framework**: Playwright
- **Test Location**: `tests/e2e/`
- **Configuration**: `playwright.config.ts`
- **Browsers**: Chrome, Firefox, Safari, iPad Pro

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/01-app-loads.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Tests for Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug a Test
```bash
npx playwright test --debug
```

### View Test Report
```bash
npx playwright show-report
```

## Test File Naming Convention

Tests are numbered and named by feature:

- `01-app-loads.spec.ts` - F001: Basic app loading
- `02-offline-functionality.spec.ts` - **CRITICAL**: Offline-first verification
- `03-typescript-compilation.spec.ts` - F003: Type system validation
- `04-technology-factors.spec.ts` - F005: Data validation
- `05-stakeholder-profiles.spec.ts` - F004: Stakeholder data (TODO)
- `06-response-generator.spec.ts` - F002: Rule-based responses (TODO)
- etc.

## Critical Test Requirements

### 1. Offline Functionality (Non-Negotiable)

**EVERY feature must be tested offline.**

```typescript
test('should work offline', async ({ page, context }) => {
  // Load page online
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Go offline
  await context.setOffline(true);

  // Feature should still work
  // ... test feature functionality ...
});
```

### 2. Response Generation Tests

When testing stakeholder response generation:

```typescript
test('should generate response without network', async ({ page, context }) => {
  await page.goto('/');

  // Load scenario
  // Select stakeholder
  // Enter prediction

  // Go offline
  await context.setOffline(true);

  // Click "Reveal Response"
  // Response should appear within 2 seconds (< 200ms target for rule-based)

  // Verify response type is "rule-based" when offline
});
```

### 3. No Loading Spinners for Core Features

```typescript
// ❌ BAD: Core features should not show loading states
await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();

// ✅ GOOD: Responses should feel instant
await page.click('[data-testid="reveal-response"]');
await expect(page.locator('[data-testid="stakeholder-response"]')).toBeVisible({ timeout: 2000 });
```

### 4. AI Failover Tests

```typescript
test('should failover to rule-based when API fails', async ({ page }) => {
  // Mock API to fail
  await page.route('https://api.anthropic.com/**', route => route.abort());

  await page.goto('/');

  // Generate response - should work with rule-based
  // ... test functionality ...

  // Verify it's rule-based, not AI-enhanced
  await expect(page.locator('[data-testid="response-type"]')).toHaveText('rule-based');
});
```

## Test Data

### Sample Scenarios

Located in `public/sample-data/`:
- `example-scenario.json` - For testing scenario loading
- `rwanda-baseline.json` - Realistic SPLAT output

### Test Scenarios Should Include

- Different renewable shares (low, medium, high)
- Different investment levels
- Edge cases (zero capacity, very high capacity)
- Missing data handling

## Coverage Requirements

Each feature must have tests for:

1. **Happy Path**: Feature works as expected
2. **Error Handling**: Graceful failures with clear messages
3. **Offline Mode**: Feature works without internet
4. **Edge Cases**: Boundary values, missing data, invalid input
5. **Accessibility**: Keyboard navigation, screen readers
6. **Responsive**: Works on tablet viewports (iPad Pro)

## CI/CD Integration

Tests run automatically on:
- Every commit (via git hooks - TODO)
- Pull requests (via GitHub Actions - TODO)
- Before deployment (pre-deploy check)

## Debugging Failed Tests

### 1. Run with Trace
```bash
npx playwright test --trace on
```

### 2. View Trace
```bash
npx playwright show-trace trace.zip
```

### 3. Use Inspector
```bash
npx playwright test --debug
```

### 4. Take Screenshots
Screenshots are automatically saved on failure to `test-results/`

## Writing New Tests

### Template for New Feature Test

```typescript
import { test, expect } from '@playwright/test';

/**
 * [Feature Name] Tests (F00X)
 * [Brief description of what this feature does]
 */
test.describe('[Feature Name]', () => {
  test('should [do something] - happy path', async ({ page }) => {
    await page.goto('/');

    // Test implementation

    // Assertions
    await expect(page.locator('[data-testid="something"]')).toBeVisible();
  });

  test('should [handle errors gracefully]', async ({ page }) => {
    // Test error handling
  });

  test('should [work offline] - CRITICAL', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);

    // Test offline functionality
  });
});
```

## Test Checklist Before Marking Feature Complete

- [ ] All tests pass in all browsers (Chrome, Firefox, Safari)
- [ ] Offline functionality verified
- [ ] No console errors during tests
- [ ] Test coverage includes happy path, errors, edge cases
- [ ] Tests run in under 30 seconds (fast feedback)
- [ ] Test artifacts (screenshots, traces) reviewed if failures
- [ ] Feature marked `"passes": true` in `feature_list.json`

## Common Issues and Solutions

### Issue: Service Worker Not Caching

**Solution**: Wait for service worker registration
```typescript
await page.waitForTimeout(2000); // Wait for SW to be ready
```

### Issue: Tests Flaky in Offline Mode

**Solution**: Ensure network idle before going offline
```typescript
await page.waitForLoadState('networkidle');
await context.setOffline(true);
```

### Issue: TypeScript Import Errors in Tests

**Solution**: Use dynamic imports in browser context
```typescript
const module = await import('/src/data/technology-factors.ts');
```

## Performance Benchmarks

Tests should verify performance targets:

- **Page load**: < 2 seconds
- **Rule-based response**: < 200ms
- **AI response timeout**: 3 seconds (then failover)
- **Scenario data import**: < 5 seconds

## Accessibility Testing

Use Playwright's accessibility features:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Test Maintenance

- Review and update tests when features change
- Remove obsolete tests
- Keep test data realistic and up-to-date
- Document any test-specific configuration

---

**Remember**: If the tests don't pass, the feature isn't done!
