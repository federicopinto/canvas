import { test, expect } from '@playwright/test';

test.describe('Interaction Tests', () => {
  test('pan with middle mouse drag', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Get initial viewport position
    const initialX = await page.evaluate(() => window.canvas.viewport.x);

    // Simulate middle mouse drag
    await page.mouse.move(400, 300);
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(300, 200, { steps: 10 });
    await page.mouse.up({ button: 'middle' });

    // Wait a frame
    await page.waitForTimeout(100);

    // Check viewport changed
    const newX = await page.evaluate(() => window.canvas.viewport.x);
    expect(newX).not.toBe(initialX);
  });

  test('zoom with mousewheel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Get initial zoom
    const initialZoom = await page.evaluate(() => window.canvas.viewport.zoom);

    // Simulate mousewheel zoom
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, -100); // Scroll up = zoom in

    await page.waitForTimeout(200);

    // Check zoom changed
    const newZoom = await page.evaluate(() => window.canvas.viewport.zoom);
    expect(newZoom).toBeGreaterThan(initialZoom);

    // Check zoom control updated
    const zoomText = await page.locator('.zoom-control').textContent();
    const zoomPercent = parseInt(zoomText);
    expect(zoomPercent).toBeGreaterThan(100);
  });

  test('select node on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Click first node
    await page.locator('.node').first().click();

    // Wait a bit for selection to update
    await page.waitForTimeout(100);

    // Check node is selected
    const selectedCount = await page.locator('.node.selected').count();
    expect(selectedCount).toBe(1);
  });

  test('deselect node with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Click a node to select it
    await page.locator('.node').first().click();
    await page.waitForTimeout(100);

    // Verify it's selected
    let selectedCount = await page.locator('.node.selected').count();
    expect(selectedCount).toBe(1);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Verify selection is cleared
    selectedCount = await page.locator('.node.selected').count();
    expect(selectedCount).toBe(0);
  });

  test('drag node updates position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Get first node ID and initial position
    const nodeId = await page.locator('.node').first().getAttribute('data-node-id');
    const initialPos = await page.evaluate((id) => {
      const node = window.canvas.state.getState().nodes.get(id);
      return { x: node.x, y: node.y };
    }, nodeId);

    // Get the node element's bounding box
    const nodeBox = await page.locator('.node').first().boundingBox();

    // Drag node
    await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(nodeBox.x + 100, nodeBox.y + 100, { steps: 5 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Check position changed
    const newPos = await page.evaluate((id) => {
      const node = window.canvas.state.getState().nodes.get(id);
      return { x: node.x, y: node.y };
    }, nodeId);

    expect(newPos.x).not.toBe(initialPos.x);
    expect(newPos.y).not.toBe(initialPos.y);
  });

  test('toolbar auto-layout button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.toolbar');

    // Get initial positions of all nodes
    const initialPositions = await page.evaluate(() => {
      const nodes = window.canvas.state.getState().nodes;
      return Array.from(nodes.values()).map(n => ({ id: n.id, x: n.x, y: n.y }));
    });

    // Click auto-layout button (should be the lightning bolt icon)
    const buttons = await page.locator('.toolbar button').all();
    // Auto-layout is typically one of the toolbar buttons
    // We'll click all buttons to find it, or we can click by index
    // Let's try to find it by title attribute if it exists
    const autoLayoutBtn = page.locator('.toolbar button').filter({ hasText: /⚡/ }).first();
    if (await autoLayoutBtn.count() > 0) {
      await autoLayoutBtn.click();
    } else {
      // Fallback: click by index (adjust based on toolbar order)
      await page.locator('.toolbar button').nth(3).click();
    }

    // Wait for animation to complete
    await page.waitForTimeout(700);

    // Check that positions have changed
    const newPositions = await page.evaluate(() => {
      const nodes = window.canvas.state.getState().nodes;
      return Array.from(nodes.values()).map(n => ({ id: n.id, x: n.x, y: n.y }));
    });

    // At least some nodes should have moved
    let movedCount = 0;
    for (let i = 0; i < initialPositions.length; i++) {
      if (initialPositions[i].x !== newPositions[i].x || initialPositions[i].y !== newPositions[i].y) {
        movedCount++;
      }
    }

    expect(movedCount).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/auto-layout.png' });
  });

  test('keyboard shortcuts - reset zoom', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.zoom-control');

    // First zoom in
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(200);

    // Verify zoom changed
    let zoomText = await page.locator('.zoom-control').textContent();
    expect(parseInt(zoomText)).toBeGreaterThan(100);

    // Test Ctrl+0 (reset zoom)
    await page.keyboard.press('Control+0');
    await page.waitForTimeout(100);

    zoomText = await page.locator('.zoom-control').textContent();
    expect(zoomText).toBe('100%');
  });

  test('keyboard shortcuts - fit to screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Get initial viewport
    const initialViewport = await page.evaluate(() => ({
      x: window.canvas.viewport.x,
      y: window.canvas.viewport.y,
      zoom: window.canvas.viewport.zoom
    }));

    // Pan away from center
    await page.mouse.move(400, 300);
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(200, 100, { steps: 10 });
    await page.mouse.up({ button: 'middle' });
    await page.waitForTimeout(100);

    // Press Ctrl+1 to fit to screen
    await page.keyboard.press('Control+1');
    await page.waitForTimeout(300);

    // Verify viewport changed (should center content)
    const newViewport = await page.evaluate(() => ({
      x: window.canvas.viewport.x,
      y: window.canvas.viewport.y,
      zoom: window.canvas.viewport.zoom
    }));

    // At least one viewport parameter should have changed
    const changed = newViewport.x !== initialViewport.x ||
                   newViewport.y !== initialViewport.y ||
                   newViewport.zoom !== initialViewport.zoom;
    expect(changed).toBe(true);
  });

  test('multi-select with Shift+Click', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Click first node
    await page.locator('.node').nth(0).click();
    await page.waitForTimeout(100);

    // Shift+Click second node
    await page.keyboard.down('Shift');
    await page.locator('.node').nth(1).click();
    await page.keyboard.up('Shift');
    await page.waitForTimeout(100);

    // Should have 2 selected nodes
    const selectedCount = await page.locator('.node.selected').count();
    expect(selectedCount).toBe(2);
  });

  test('zoom in/out with +/- keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.zoom-control');

    // Get initial zoom
    const initialZoom = await page.evaluate(() => window.canvas.viewport.zoom);

    // Press + to zoom in
    await page.keyboard.press('+');
    await page.waitForTimeout(200);

    let newZoom = await page.evaluate(() => window.canvas.viewport.zoom);
    expect(newZoom).toBeGreaterThan(initialZoom);

    // Press - to zoom out
    await page.keyboard.press('-');
    await page.waitForTimeout(200);

    newZoom = await page.evaluate(() => window.canvas.viewport.zoom);
    expect(newZoom).toBeLessThan(newZoom);
  });
});
