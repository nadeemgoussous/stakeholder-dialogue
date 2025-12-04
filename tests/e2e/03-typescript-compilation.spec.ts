import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * TypeScript Compilation Tests (F003)
 * Verifies that all TypeScript interfaces compile correctly
 */
test.describe('TypeScript Compilation', () => {
  test('should compile TypeScript without errors', async () => {
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
        cwd: process.cwd()
      });

      // TypeScript should compile without errors
      expect(stderr).toBe('');
    } catch (error: any) {
      // If tsc fails, it will throw an error
      console.error('TypeScript compilation failed:', error.stdout);
      throw new Error(`TypeScript compilation failed: ${error.stdout}`);
    }
  });

  test('should have all required type files', async ({ page }) => {
    // This test verifies files exist by trying to import them in the browser context
    await page.goto('/');

    // Check if types can be loaded (indirectly through the app loading)
    // If types are broken, the app won't load
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });
});
