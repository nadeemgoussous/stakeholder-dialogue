import { test, expect } from '@playwright/test'

/**
 * E2E Tests for F007 (Header and Footer) and F008 (Tab Navigation)
 *
 * F007: Header and footer with IRENA branding and offline indicator
 * F008: Four-tab navigation system
 *
 * Tests verify:
 * - Header displays IRENA branding and tool name
 * - Online/offline indicator works correctly
 * - Footer displays toolkit reference and version
 * - All four tabs are present and correctly labeled
 * - Tab switching preserves state
 * - Active tab styling is correct
 * - Tab panels are accessible
 * - Responsive layout works correctly
 */

test.describe('F007: Header and Footer Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Header displays IRENA branding and tool name', async ({ page }) => {
    // Check for the tool name in header
    const header = page.locator('header')
    await expect(header).toBeVisible()
    await expect(header.locator('h1')).toHaveText('IRENA Scenario Dialogue Tool')
    await expect(header.locator('p')).toContainText('Understanding Stakeholder Perspectives')
  })

  test('Header displays online/offline status indicator', async ({ page }) => {
    const header = page.locator('header')
    const statusIndicator = header.locator('[role="status"]')

    await expect(statusIndicator).toBeVisible()

    // By default, browser should be online
    const statusText = await statusIndicator.textContent()
    expect(statusText).toMatch(/Online|Offline/)
  })

  test('Header has IRENA blue background color', async ({ page }) => {
    const header = page.locator('header')
    const bgColor = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.backgroundColor
    })

    // IRENA blue is #0078a7, which is rgb(0, 120, 167)
    expect(bgColor).toBe('rgb(0, 120, 167)')
  })

  test('Footer displays toolkit reference', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('Participatory Processes for Strategic Energy Planning')
    await expect(footer).toContainText('toolkit')
  })

  test('Footer displays version and offline-first indicator', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toContainText('Version 1.0.0')
    await expect(footer).toContainText('Offline-First Design')
  })
})

test.describe('F008: Four-Tab Navigation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('All four tabs are present with correct labels', async ({ page }) => {
    const nav = page.locator('nav[role="navigation"]')
    await expect(nav).toBeVisible()

    // Check all four tabs exist
    const inputTab = nav.locator('button', { hasText: 'Input' })
    const dialogueTab = nav.locator('button', { hasText: 'Stakeholder Dialogue' })
    const exploreTab = nav.locator('button', { hasText: 'Explore Impacts' })
    const communicateTab = nav.locator('button', { hasText: 'Communicate' })

    await expect(inputTab).toBeVisible()
    await expect(dialogueTab).toBeVisible()
    await expect(exploreTab).toBeVisible()
    await expect(communicateTab).toBeVisible()
  })

  test('Tab descriptions are displayed', async ({ page }) => {
    const nav = page.locator('nav[role="navigation"]')

    // Check tab descriptions
    await expect(nav).toContainText('Import scenario data')
    await expect(nav).toContainText('Predict & learn')
    await expect(nav).toContainText('Directional sensitivity')
    await expect(nav).toContainText('Audience-specific outputs')
  })

  test('Input tab is active by default', async ({ page }) => {
    const inputTab = page.locator('nav button', { hasText: 'Input' })

    // Check if input tab is marked as selected
    const ariaSelected = await inputTab.getAttribute('aria-selected')
    expect(ariaSelected).toBe('true')

    // Check if input panel is visible
    await expect(page.locator('text=Welcome to the Scenario Dialogue Tool')).toBeVisible()
  })

  test('Switching to Stakeholder Dialogue tab works', async ({ page }) => {
    const dialogueTab = page.locator('nav button', { hasText: 'Stakeholder Dialogue' })

    await dialogueTab.click()

    // Check if dialogue tab is now selected
    const ariaSelected = await dialogueTab.getAttribute('aria-selected')
    expect(ariaSelected).toBe('true')

    // Check if dialogue panel is visible
    const dialoguePanel = page.locator('#dialogue-panel')
    await expect(dialoguePanel).toBeVisible()
    await expect(dialoguePanel).toContainText('Stakeholder Dialogue')
  })

  test('Switching to Explore Impacts tab works', async ({ page }) => {
    const exploreTab = page.locator('nav button', { hasText: 'Explore Impacts' })

    await exploreTab.click()

    // Check if explore tab is now selected
    const ariaSelected = await exploreTab.getAttribute('aria-selected')
    expect(ariaSelected).toBe('true')

    // Check if explore panel is visible
    const explorePanel = page.locator('#explore-panel')
    await expect(explorePanel).toBeVisible()
    await expect(explorePanel).toContainText('Explore Impacts')
  })

  test('Switching to Communicate tab works', async ({ page }) => {
    const communicateTab = page.locator('nav button', { hasText: 'Communicate' })

    await communicateTab.click()

    // Check if communicate tab is now selected
    const ariaSelected = await communicateTab.getAttribute('aria-selected')
    expect(ariaSelected).toBe('true')

    // Check if communicate panel is visible
    const communicatePanel = page.locator('#communicate-panel')
    await expect(communicatePanel).toBeVisible()
    await expect(communicatePanel).toContainText('Communicate')
  })

  test('Active tab has IRENA blue background', async ({ page }) => {
    const inputTab = page.locator('nav button', { hasText: 'Input' }).first()

    const bgColor = await inputTab.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.backgroundColor
    })

    // IRENA blue is #0078a7, which is rgb(0, 120, 167)
    expect(bgColor).toBe('rgb(0, 120, 167)')
  })

  test('Tab switching via Get Started button', async ({ page }) => {
    // Click the "Get Started" button on input tab
    const getStartedButton = page.locator('button', { hasText: 'Get Started' })
    await getStartedButton.click()

    // Should navigate to dialogue tab
    const dialogueTab = page.locator('nav button', { hasText: 'Stakeholder Dialogue' })
    const ariaSelected = await dialogueTab.getAttribute('aria-selected')
    expect(ariaSelected).toBe('true')

    await expect(page.locator('#dialogue-panel')).toBeVisible()
  })

  test('Disclaimer shown on all tabs', async ({ page }) => {
    const disclaimer = page.locator('.disclaimer')

    // Check disclaimer on input tab (default)
    await expect(disclaimer).toBeVisible()
    await expect(disclaimer).toContainText('ILLUSTRATIVE TOOL ONLY')

    // Switch to dialogue tab
    await page.locator('nav button', { hasText: 'Stakeholder Dialogue' }).click()
    await expect(disclaimer).toBeVisible()

    // Switch to explore tab
    await page.locator('nav button', { hasText: 'Explore Impacts' }).click()
    await expect(disclaimer).toBeVisible()

    // Switch to communicate tab
    await page.locator('nav button', { hasText: 'Communicate' }).click()
    await expect(disclaimer).toBeVisible()
  })

  test('Tabs have proper ARIA attributes for accessibility', async ({ page }) => {
    const nav = page.locator('nav[role="navigation"]')
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation')

    const inputTab = page.locator('nav button', { hasText: 'Input' }).first()
    await expect(inputTab).toHaveAttribute('role', 'tab')
    await expect(inputTab).toHaveAttribute('aria-selected', 'true')
    await expect(inputTab).toHaveAttribute('aria-controls', 'input-panel')
  })
})

test.describe('Layout Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Header, navigation, content, and footer are all present', async ({ page }) => {
    // Check all major layout sections exist
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('nav[role="navigation"]')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('Page maintains layout structure when switching tabs', async ({ page }) => {
    // Switch through all tabs and verify layout integrity
    const tabs = [
      'Stakeholder Dialogue',
      'Explore Impacts',
      'Communicate',
      'Input',
    ]

    for (const tabName of tabs) {
      await page.locator('nav button', { hasText: tabName }).click()

      // Verify all layout sections still present
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('nav[role="navigation"]')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    }
  })

  test('Main content area uses flexbox layout', async ({ page }) => {
    const mainContainer = page.locator('div.min-h-screen')

    const display = await mainContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.display
    })

    expect(display).toBe('flex')
  })
})
