import { test, expect } from '@playwright/test';

test.describe('Interactive Diagram Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    // Wait for canvas to load
    await page.waitForSelector('.canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow initial render and animations
  });

  test('should load with demo diagram', async ({ page }) => {
    // Check that canvas is visible
    const canvas = await page.locator('.canvas');
    await expect(canvas).toBeVisible();

    // Check for nodes
    const nodes = await page.locator('.class-node').count();
    expect(nodes).toBeGreaterThan(5);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-initial-load.png', fullPage: true });
  });

  test('should display toolbar', async ({ page }) => {
    const toolbar = await page.locator('.toolbar');
    await expect(toolbar).toBeVisible();

    // Check for all buttons
    const buttons = await page.locator('.toolbar-button').count();
    expect(buttons).toBeGreaterThanOrEqual(7);

    await page.screenshot({ path: 'tests/screenshots/02-toolbar.png' });
  });

  test('should display performance monitor', async ({ page }) => {
    const perfMonitor = await page.locator('.performance-monitor');
    await expect(perfMonitor).toBeVisible();

    // Wait for FPS stats to populate
    await page.waitForTimeout(2000);

    const fpsText = await page.locator('.performance-monitor .value').first().textContent();
    expect(fpsText).toBeTruthy();

    await page.screenshot({ path: 'tests/screenshots/03-performance-monitor.png' });
  });

  test('should show all 3 node types', async ({ page }) => {
    // Visual check for different node types
    await page.screenshot({ path: 'tests/screenshots/04-node-types.png', fullPage: true });
  });

  test('should zoom in and out', async ({ page }) => {
    const zoomIndicator = await page.locator('.zoom-indicator');
    const initialZoom = await zoomIndicator.textContent();

    // Zoom in
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(300);

    const zoomedIn = await zoomIndicator.textContent();
    expect(zoomedIn).not.toBe(initialZoom);

    await page.screenshot({ path: 'tests/screenshots/05-zoomed-in.png', fullPage: true });

    // Zoom out
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'tests/screenshots/06-zoomed-out.png', fullPage: true });
  });

  test('should collapse and expand sections', async ({ page }) => {
    // Find a section header and click it
    const sectionHeader = await page.locator('.section-header').first();

    // Take before screenshot
    await page.screenshot({ path: 'tests/screenshots/07-section-expanded.png' });

    // Click to collapse
    await sectionHeader.click();
    await page.waitForTimeout(300); // Wait for animation

    // Take after screenshot
    await page.screenshot({ path: 'tests/screenshots/08-section-collapsed.png' });
  });

  test('should auto-arrange layout', async ({ page }) => {
    // Take before screenshot
    await page.screenshot({ path: 'tests/screenshots/09-before-layout.png', fullPage: true });

    // Click auto-arrange button
    const autoArrangeBtn = await page.locator('.toolbar-button').first();
    await autoArrangeBtn.click();

    // Wait for animation
    await page.waitForTimeout(700);

    // Take after screenshot
    await page.screenshot({ path: 'tests/screenshots/10-after-layout.png', fullPage: true });
  });

  test('should render all arrow types', async ({ page }) => {
    // Check that arrows are visible
    const arrows = await page.locator('.arrow').count();
    expect(arrows).toBeGreaterThan(5);

    await page.screenshot({ path: 'tests/screenshots/11-arrows.png', fullPage: true });
  });

  test('performance check', async ({ page }) => {
    // Measure FPS during interaction
    await page.waitForTimeout(3000); // Let FPS stabilize

    const fpsValue = await page.locator('.performance-monitor .value').first().textContent();
    const fps = parseInt(fpsValue || '0');

    console.log(`Average FPS: ${fps}`);
    expect(fps).toBeGreaterThan(45); // Should maintain >45 FPS

    await page.screenshot({ path: 'tests/screenshots/12-performance.png' });
  });
});
