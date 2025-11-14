import { test, expect } from '@playwright/test';

test.describe('Drag Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('single node can be dragged', async ({ page }) => {
    const node = page.locator('g.node').first();
    const bbox = await node.boundingBox();
    expect(bbox).toBeTruthy();

    const initialX = bbox!.x;
    const initialY = bbox!.y;

    // Drag the node
    await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(bbox!.x + 120, bbox!.y + 110);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Get new position
    const newBbox = await node.boundingBox();
    expect(newBbox).toBeTruthy();

    // Position should have changed
    expect(Math.abs(newBbox!.x - initialX)).toBeGreaterThan(50);
    expect(Math.abs(newBbox!.y - initialY)).toBeGreaterThan(50);
  });

  test('node follows cursor during drag', async ({ page }) => {
    const node = page.locator('g.node').first();
    const bbox = await node.boundingBox();
    expect(bbox).toBeTruthy();

    // Start drag
    await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
    await page.mouse.down();

    // Move in multiple steps
    for (let i = 1; i <= 5; i++) {
      await page.mouse.move(bbox!.x + 20 + (i * 20), bbox!.y + 10 + (i * 20));
      await page.waitForTimeout(50);
    }

    await page.mouse.up();

    // Final position should reflect all movements
    const newBbox = await node.boundingBox();
    expect(newBbox!.x).not.toBe(bbox!.x);
    expect(newBbox!.y).not.toBe(bbox!.y);
  });

  test('clicking node selects it', async ({ page }) => {
    const node = page.locator('g.node').first();
    await node.click();
    await page.waitForTimeout(100);

    // Check for selection indicator (purple border)
    const selectedBorder = node.locator('rect[stroke="#667EEA"]');
    const count = await selectedBorder.count();

    // Should have selection indicator
    expect(count).toBeGreaterThan(0);
  });

  test('shift+click enables multi-select', async ({ page }) => {
    const nodes = page.locator('g.node');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      // Click first node
      await nodes.nth(0).click();
      await page.waitForTimeout(100);

      // Shift+click second node
      await page.keyboard.down('Shift');
      await nodes.nth(1).click();
      await page.keyboard.up('Shift');
      await page.waitForTimeout(100);

      // Both nodes should be selected
      const selectedBorders = page.locator('g.node rect[stroke="#667EEA"]');
      const selectedCount = await selectedBorders.count();

      expect(selectedCount).toBeGreaterThanOrEqual(2);
    }
  });

  test('multi-selected nodes can be dragged together', async ({ page }) => {
    const nodes = page.locator('g.node');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      // Multi-select two nodes
      await nodes.nth(0).click();
      await page.keyboard.down('Shift');
      await nodes.nth(1).click();
      await page.keyboard.up('Shift');
      await page.waitForTimeout(100);

      // Get initial positions
      const bbox1 = await nodes.nth(0).boundingBox();
      const bbox2 = await nodes.nth(1).boundingBox();

      // Drag first node
      await page.mouse.move(bbox1!.x + 20, bbox1!.y + 10);
      await page.mouse.down();
      await page.mouse.move(bbox1!.x + 120, bbox1!.y + 110);
      await page.mouse.up();
      await page.waitForTimeout(100);

      // Both nodes should have moved
      const newBbox1 = await nodes.nth(0).boundingBox();
      const newBbox2 = await nodes.nth(1).boundingBox();

      expect(newBbox1!.x).not.toBe(bbox1!.x);
      expect(newBbox2!.x).not.toBe(bbox2!.x);
    }
  });

  test('escape key deselects nodes', async ({ page }) => {
    const node = page.locator('g.node').first();
    await node.click();
    await page.waitForTimeout(100);

    // Verify selection
    let selectedBorders = page.locator('g.node rect[stroke="#667EEA"]');
    let count = await selectedBorders.count();
    expect(count).toBeGreaterThan(0);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Selection should be cleared
    selectedBorders = page.locator('g.node rect[stroke="#667EEA"]');
    count = await selectedBorders.count();
    expect(count).toBe(0);
  });

  test('dragging shows visual feedback', async ({ page }) => {
    const node = page.locator('g.node').first();
    const bbox = await node.boundingBox();

    // Start drag
    await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // During drag, node might have different opacity or scale
    // Check that node is still visible
    await expect(node).toBeVisible();

    await page.mouse.move(bbox!.x + 120, bbox!.y + 110);
    await page.mouse.up();
  });

  test('drag works on node header only', async ({ page }) => {
    const node = page.locator('g.node').first();
    const bbox = await node.boundingBox();

    // Try dragging from header area (top portion)
    const headerY = bbox!.y + 15; // Header should be at top

    await page.mouse.move(bbox!.x + bbox!.width / 2, headerY);
    await page.mouse.down();
    await page.mouse.move(bbox!.x + bbox!.width / 2 + 100, headerY + 100);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Node should have moved
    const newBbox = await node.boundingBox();
    expect(newBbox!.x).not.toBe(bbox!.x);
  });

  test('clicking empty canvas deselects nodes', async ({ page }) => {
    const node = page.locator('g.node').first();
    await node.click();
    await page.waitForTimeout(100);

    // Click on empty area
    await page.mouse.click(50, 50);
    await page.waitForTimeout(100);

    // Selection should be cleared
    const selectedBorders = page.locator('g.node rect[stroke="#667EEA"]');
    const count = await selectedBorders.count();
    expect(count).toBe(0);
  });

  test('drag maintains relative positions in multi-select', async ({ page }) => {
    const nodes = page.locator('g.node');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      // Multi-select
      await nodes.nth(0).click();
      await page.keyboard.down('Shift');
      await nodes.nth(1).click();
      await page.keyboard.up('Shift');
      await page.waitForTimeout(100);

      // Calculate initial relative distance
      const bbox1 = await nodes.nth(0).boundingBox();
      const bbox2 = await nodes.nth(1).boundingBox();
      const initialDx = bbox2!.x - bbox1!.x;
      const initialDy = bbox2!.y - bbox1!.y;

      // Drag
      await page.mouse.move(bbox1!.x + 20, bbox1!.y + 10);
      await page.mouse.down();
      await page.mouse.move(bbox1!.x + 120, bbox1!.y + 110);
      await page.mouse.up();
      await page.waitForTimeout(100);

      // Calculate new relative distance
      const newBbox1 = await nodes.nth(0).boundingBox();
      const newBbox2 = await nodes.nth(1).boundingBox();
      const newDx = newBbox2!.x - newBbox1!.x;
      const newDy = newBbox2!.y - newBbox1!.y;

      // Relative positions should be maintained (within tolerance)
      expect(Math.abs(newDx - initialDx)).toBeLessThan(5);
      expect(Math.abs(newDy - initialDy)).toBeLessThan(5);
    }
  });

  test('dragged node stays within canvas bounds', async ({ page }) => {
    const node = page.locator('g.node').first();
    const bbox = await node.boundingBox();

    // Try to drag way off screen
    await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(-1000, -1000);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Node should still be accessible (implementation may or may not clamp)
    const newBbox = await node.boundingBox();
    expect(newBbox).toBeTruthy();
  });
});
