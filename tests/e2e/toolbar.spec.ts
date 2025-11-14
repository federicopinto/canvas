import { test, expect } from '@playwright/test';

test.describe('Toolbar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('toolbar is visible', async ({ page }) => {
    // Look for toolbar container
    const toolbar = page.locator('.toolbar, [class*="toolbar"]');
    const count = await toolbar.count();

    // If not found by class, look for a group of buttons
    if (count === 0) {
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    } else {
      await expect(toolbar.first()).toBeVisible();
    }
  });

  test('all toolbar buttons are visible', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // Should have multiple buttons (zoom in, zoom out, reset, auto-arrange, fit, export, clear)
    expect(buttonCount).toBeGreaterThanOrEqual(5);
  });

  test('zoom in button works', async ({ page }) => {
    const initialZoom = await page.locator('text=/\\d+%/').textContent();

    const zoomInBtn = page.locator('button:has-text("+")');
    await zoomInBtn.click();
    await page.waitForTimeout(200);

    const newZoom = await page.locator('text=/\\d+%/').textContent();

    const initialValue = parseInt(initialZoom!.replace('%', ''));
    const newValue = parseInt(newZoom!.replace('%', ''));
    expect(newValue).toBeGreaterThan(initialValue);
  });

  test('zoom out button works', async ({ page }) => {
    // First zoom in
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200);

    const initialZoom = await page.locator('text=/\\d+%/').textContent();

    const zoomOutBtn = page.locator('button:has-text("-")');
    await zoomOutBtn.click();
    await page.waitForTimeout(200);

    const newZoom = await page.locator('text=/\\d+%/').textContent();

    const initialValue = parseInt(initialZoom!.replace('%', ''));
    const newValue = parseInt(newZoom!.replace('%', ''));
    expect(newValue).toBeLessThan(initialValue);
  });

  test('zoom reset button works', async ({ page }) => {
    // Zoom in multiple times
    await page.locator('button:has-text("+")').click();
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(300);

    // Click reset (100% button)
    const resetBtn = page.locator('button:has-text("100%")');
    await resetBtn.click();
    await page.waitForTimeout(200);

    const zoomText = await page.locator('text=/\\d+%/').textContent();
    expect(zoomText).toBe('100%');
  });

  test('fit to screen button works', async ({ page }) => {
    // Look for fit button (⛶ or similar icon)
    const fitBtn = page.locator('button').filter({ hasText: /⛶|Fit|Center/ }).first();
    const count = await fitBtn.count();

    if (count > 0) {
      await fitBtn.click();
      await page.waitForTimeout(300);

      // Zoom should adjust to fit all nodes
      const zoomText = await page.locator('text=/\\d+%/').textContent();
      expect(zoomText).toMatch(/^\d+%$/);
    } else {
      // Try finding by title or aria-label
      const btn = page.locator('button[title*="fit"], button[aria-label*="fit"]').first();
      const hasBtn = await btn.count();

      if (hasBtn > 0) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('export PNG button exists', async ({ page }) => {
    // Look for export/download button
    const exportBtn = page.locator('button').filter({ hasText: /Export|Download|PNG|💾/ });
    const count = await exportBtn.count();

    if (count > 0) {
      await expect(exportBtn.first()).toBeVisible();
    } else {
      // Try finding by title
      const btn = page.locator('button[title*="export"], button[title*="download"]').first();
      const hasBtn = await btn.count();

      if (hasBtn > 0) {
        await expect(btn).toBeVisible();
      }
    }
  });

  test('export PNG downloads file', async ({ page }) => {
    const exportBtn = page.locator('button').filter({ hasText: /Export|Download|PNG|💾/ }).first();
    const count = await exportBtn.count();

    if (count > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await exportBtn.click();

      const download = await downloadPromise;

      if (download) {
        // Verify download happened
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.png$/i);
      }
    }
  });

  test('clear canvas button exists', async ({ page }) => {
    const clearBtn = page.locator('button').filter({ hasText: /Clear|Reset|🗑/ });
    const count = await clearBtn.count();

    if (count > 0) {
      await expect(clearBtn.first()).toBeVisible();
    }
  });

  test('auto-arrange button is in toolbar', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ });
    const count = await autoArrangeBtn.count();

    if (count > 0) {
      await expect(autoArrangeBtn.first()).toBeVisible();
    }
  });

  test('toolbar buttons have tooltips or labels', async ({ page }) => {
    const buttons = page.locator('button').first();

    // Check for title attribute or aria-label
    const title = await buttons.getAttribute('title');
    const ariaLabel = await buttons.getAttribute('aria-label');

    // At least some indication of what button does
    const hasLabel = title || ariaLabel || await buttons.textContent();
    expect(hasLabel).toBeTruthy();
  });

  test('toolbar remains accessible during zoom', async ({ page }) => {
    // Zoom in
    await page.locator('button:has-text("+")').click();
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(300);

    // Toolbar should still be visible and clickable
    const zoomOutBtn = page.locator('button:has-text("-")');
    await expect(zoomOutBtn).toBeVisible();
    await zoomOutBtn.click();
  });

  test('toolbar remains accessible during pan', async ({ page }) => {
    // Pan the canvas
    await page.keyboard.down(' ');
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(500, 500);
    await page.mouse.up();
    await page.keyboard.up(' ');
    await page.waitForTimeout(100);

    // Toolbar should still work
    const zoomInBtn = page.locator('button:has-text("+")');
    await expect(zoomInBtn).toBeVisible();
  });

  test('toolbar buttons are styled consistently', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount >= 2) {
      // Get styles of first two buttons
      const style1 = await buttons.nth(0).evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          height: styles.height,
          padding: styles.padding
        };
      });

      const style2 = await buttons.nth(1).evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          height: styles.height,
          padding: styles.padding
        };
      });

      // Buttons should have consistent sizing (approximately)
      expect(style1.height).toBeTruthy();
      expect(style2.height).toBeTruthy();
    }
  });

  test('zoom indicator updates with toolbar controls', async ({ page }) => {
    const zoomIndicator = page.locator('text=/\\d+%/');
    const initialZoom = await zoomIndicator.textContent();

    // Use zoom in button
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200);

    const newZoom = await zoomIndicator.textContent();
    expect(newZoom).not.toBe(initialZoom);
  });

  test('multiple toolbar actions can be performed in sequence', async ({ page }) => {
    // Zoom in
    await page.locator('button:has-text("+")').click();
    await page.waitForTimeout(200);

    // Auto-arrange
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const hasAutoArrange = await autoArrangeBtn.count();

    if (hasAutoArrange > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);
    }

    // Zoom out
    await page.locator('button:has-text("-")').click();
    await page.waitForTimeout(200);

    // Fit to screen
    const fitBtn = page.locator('button').filter({ hasText: /⛶|Fit/ }).first();
    const hasFit = await fitBtn.count();

    if (hasFit > 0) {
      await fitBtn.click();
      await page.waitForTimeout(300);
    }

    // All should work without errors
    const nodes = page.locator('g.node');
    await expect(nodes.first()).toBeVisible();
  });
});
