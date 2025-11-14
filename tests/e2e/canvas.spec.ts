import { test, expect } from '@playwright/test';

test.describe('Canvas Foundation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('grid pattern is visible', async ({ page }) => {
    // Check that the grid SVG exists
    const grid = page.locator('svg pattern#grid-pattern');
    await expect(grid).toBeVisible();

    // Verify grid pattern attributes
    const patternSize = await grid.getAttribute('width');
    expect(patternSize).toBe('20'); // 20px spacing

    // Check that the grid circle exists (2px dot)
    const gridDot = page.locator('pattern#grid-pattern circle');
    await expect(gridDot).toBeVisible();
    const dotRadius = await gridDot.getAttribute('r');
    expect(dotRadius).toBe('1'); // r=1 means 2px diameter
  });

  test('background color is correct', async ({ page }) => {
    const canvas = page.locator('svg').first();
    const background = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // #FAFBFC = rgb(250, 251, 252)
    expect(background).toBe('rgb(250, 251, 252)');
  });

  test('zoom in functionality works', async ({ page }) => {
    // Get initial zoom level
    const initialZoom = await page.locator('text=/\\d+%/').textContent();

    // Find and click zoom in button ('+' button)
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200); // Wait for animation

    // Get new zoom level
    const newZoom = await page.locator('text=/\\d+%/').textContent();

    // Parse and compare
    const initialValue = parseInt(initialZoom!.replace('%', ''));
    const newValue = parseInt(newZoom!.replace('%', ''));
    expect(newValue).toBeGreaterThan(initialValue);
  });

  test('zoom out functionality works', async ({ page }) => {
    // First zoom in to ensure we're not at minimum
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200);

    const initialZoom = await page.locator('text=/\\d+%/').textContent();

    // Click zoom out button ('-' button)
    await page.locator('button:has-text("-")').click();
    await page.waitForTimeout(200);

    const newZoom = await page.locator('text=/\\d+%/').textContent();

    const initialValue = parseInt(initialZoom!.replace('%', ''));
    const newValue = parseInt(newZoom!.replace('%', ''));
    expect(newValue).toBeLessThan(initialValue);
  });

  test('zoom reset functionality works', async ({ page }) => {
    // First zoom in
    await page.locator('button:has-text("+")').click();
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(300);

    // Find and click reset button (should show "100%")
    await page.locator('button:has-text("100%")').click();
    await page.waitForTimeout(200);

    // Check that zoom is back to 100%
    const zoomText = await page.locator('text=/\\d+%/').textContent();
    expect(zoomText).toBe('100%');
  });

  test('mouse wheel zoom works', async ({ page }) => {
    const initialZoom = await page.locator('text=/\\d+%/').textContent();

    // Get canvas element
    const canvas = page.locator('svg').first();

    // Simulate mouse wheel scroll (zoom in)
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Negative delta = zoom in
    await page.waitForTimeout(200);

    const newZoom = await page.locator('text=/\\d+%/').textContent();

    const initialValue = parseInt(initialZoom!.replace('%', ''));
    const newValue = parseInt(newZoom!.replace('%', ''));
    expect(newValue).not.toBe(initialValue);
  });

  test('pan functionality with spacebar works', async ({ page }) => {
    // Get initial viewport transform
    const getTransform = async () => {
      return await page.locator('g.zoom-layer').evaluate((el) => {
        const transform = el.getAttribute('transform');
        const match = transform?.match(/translate\(([^,]+),([^)]+)\)/);
        return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : null;
      });
    };

    const initialTransform = await getTransform();

    // Press spacebar and drag
    await page.keyboard.down(' ');
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(500, 500);
    await page.mouse.up();
    await page.keyboard.up(' ');
    await page.waitForTimeout(100);

    const newTransform = await getTransform();

    // Verify that the position changed
    expect(newTransform?.x).not.toBe(initialTransform?.x);
    expect(newTransform?.y).not.toBe(initialTransform?.y);
  });

  test('zoom indicator displays correct percentage', async ({ page }) => {
    // Check initial zoom indicator
    const zoomIndicator = page.locator('text=/\\d+%/');
    await expect(zoomIndicator).toBeVisible();

    // Verify it shows a valid percentage
    const text = await zoomIndicator.textContent();
    expect(text).toMatch(/^\d+%$/);

    // Zoom in and verify indicator updates
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200);

    const newText = await zoomIndicator.textContent();
    expect(newText).toMatch(/^\d+%$/);
    expect(newText).not.toBe(text);
  });

  test('zoom has min and max limits', async ({ page }) => {
    // Zoom out to minimum
    for (let i = 0; i < 20; i++) {
      await page.locator('button:has-text("-")').click();
      await page.waitForTimeout(50);
    }

    const minZoom = await page.locator('text=/\\d+%/').textContent();
    const minValue = parseInt(minZoom!.replace('%', ''));
    expect(minValue).toBeGreaterThanOrEqual(10); // 10% minimum

    // Zoom in to maximum
    for (let i = 0; i < 40; i++) {
      await page.locator('button:has-text("+")').click();
      await page.waitForTimeout(50);
    }

    const maxZoom = await page.locator('text=/\\d+%/').textContent();
    const maxValue = parseInt(maxZoom!.replace('%', ''));
    expect(maxValue).toBeLessThanOrEqual(400); // 400% maximum
  });
});
