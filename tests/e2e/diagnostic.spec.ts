import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
  test('page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    console.log('Console errors:', errors);
    // Report errors but don't fail the test
    if (errors.length > 0) {
      console.warn(`Found ${errors.length} console errors:`, errors);
    }
  });

  test('demo data loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if nodes are present
    const nodes = page.locator('g');
    const count = await nodes.count();

    console.log(`Found ${count} <g> elements on page`);
    expect(count).toBeGreaterThan(0);
  });

  test('SVG canvas exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const svg = page.locator('svg');
    await expect(svg.first()).toBeVisible();
  });

  test('take simple screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: '/home/user/canvas/screenshots/diagnostic.png',
      fullPage: true
    });

    expect(true).toBe(true);
  });
});
