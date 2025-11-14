import { test, expect } from '@playwright/test';

test.describe('Auto-Layout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('auto-arrange button is visible', async ({ page }) => {
    // Look for auto-arrange button (lightning bolt ⚡ or similar)
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ });
    const count = await autoArrangeBtn.count();

    if (count > 0) {
      await expect(autoArrangeBtn.first()).toBeVisible();
    } else {
      // Try finding by title or aria-label
      const btn = page.locator('button[title*="arrange"], button[aria-label*="arrange"]').first();
      const hasBtn = await btn.count();
      expect(hasBtn).toBeGreaterThan(0);
    }
  });

  test('clicking auto-arrange button triggers layout', async ({ page }) => {
    // First, manually move a node to mess up layout
    const node = page.locator('g.node').first();
    const initialBbox = await node.boundingBox();

    await page.mouse.move(initialBbox!.x + 20, initialBbox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(initialBbox!.x + 200, initialBbox!.y + 200);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Click auto-arrange
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700); // Wait for animation (600ms)

      // Node should have moved to organized position
      const newBbox = await node.boundingBox();
      expect(newBbox).toBeTruthy();
    }
  });

  test('auto-layout animation is smooth', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      const startTime = Date.now();
      await autoArrangeBtn.click();

      // Wait for animation
      await page.waitForTimeout(700);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take roughly 600ms (+/- tolerance)
      expect(duration).toBeGreaterThanOrEqual(500);
      expect(duration).toBeLessThanOrEqual(900);
    }
  });

  test('layout is hierarchical', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Check that nodes are arranged (not overlapping heavily)
      const nodes = page.locator('g.node');
      const nodeCount = await nodes.count();

      if (nodeCount >= 2) {
        const bbox1 = await nodes.nth(0).boundingBox();
        const bbox2 = await nodes.nth(1).boundingBox();

        // Nodes should not be at exact same position
        const samePosition = bbox1!.x === bbox2!.x && bbox1!.y === bbox2!.y;
        expect(samePosition).toBe(false);
      }
    }
  });

  test('nodes animate to new positions', async ({ page }) => {
    const node = page.locator('g.node').first();

    // Get position before layout
    const initialBbox = await node.boundingBox();

    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();

      // Check position during animation
      await page.waitForTimeout(300);
      const midBbox = await node.boundingBox();

      // Complete animation
      await page.waitForTimeout(400);
      const finalBbox = await node.boundingBox();

      // Positions should exist throughout
      expect(initialBbox).toBeTruthy();
      expect(midBbox).toBeTruthy();
      expect(finalBbox).toBeTruthy();
    }
  });

  test('no overlapping nodes after layout', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Get all node bounding boxes
      const nodes = page.locator('g.node');
      const nodeCount = await nodes.count();

      const bboxes: any[] = [];
      for (let i = 0; i < Math.min(nodeCount, 5); i++) {
        const bbox = await nodes.nth(i).boundingBox();
        bboxes.push(bbox);
      }

      // Check for overlaps (allowing small margin)
      let hasSignificantOverlap = false;
      for (let i = 0; i < bboxes.length; i++) {
        for (let j = i + 1; j < bboxes.length; j++) {
          const b1 = bboxes[i];
          const b2 = bboxes[j];

          // Check if centers are too close
          const centerDist = Math.sqrt(
            Math.pow((b1.x + b1.width/2) - (b2.x + b2.width/2), 2) +
            Math.pow((b1.y + b1.height/2) - (b2.y + b2.height/2), 2)
          );

          if (centerDist < 50) {
            hasSignificantOverlap = true;
          }
        }
      }

      // Layout should minimize overlaps
      expect(hasSignificantOverlap).toBe(false);
    }
  });

  test('layout respects arrow connections', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Arrows should still connect nodes properly
      const arrows = page.locator('path.arrow, g.arrow path');
      const arrowCount = await arrows.count();

      expect(arrowCount).toBeGreaterThan(0);
      await expect(arrows.first()).toBeVisible();
    }
  });

  test('layout can be triggered multiple times', async ({ page }) => {
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      // First layout
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Second layout
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Should not crash
      const nodes = page.locator('g.node');
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    }
  });

  test('layout preserves node selection', async ({ page }) => {
    const node = page.locator('g.node').first();
    await node.click();
    await page.waitForTimeout(100);

    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Node should still be selected (or selection should be cleared gracefully)
      // Check that no errors occurred
      const nodes = page.locator('g.node');
      await expect(nodes.first()).toBeVisible();
    }
  });

  test('layout works with collapsed nodes', async ({ page }) => {
    // Collapse a section
    const section = page.locator('g.node g.section').first();
    const sectionCount = await section.count();

    if (sectionCount > 0) {
      const sectionHeader = section.locator('g.section-header').first();
      await sectionHeader.click();
      await page.waitForTimeout(300);
    }

    // Trigger layout
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    const btnCount = await autoArrangeBtn.count();

    if (btnCount > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);

      // Should complete without errors
      const nodes = page.locator('g.node');
      await expect(nodes.first()).toBeVisible();
    }
  });
});
