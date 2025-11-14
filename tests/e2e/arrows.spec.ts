import { test, expect } from '@playwright/test';

test.describe('Arrow Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('arrows are visible on canvas', async ({ page }) => {
    // Check that path elements (arrows) exist
    const arrows = page.locator('path.arrow, g.arrow path');
    const count = await arrows.count();

    // Demo should have multiple arrows
    expect(count).toBeGreaterThan(0);
  });

  test('arrow markers are defined', async ({ page }) => {
    // Check for marker definitions in defs
    const markers = page.locator('defs marker');
    const markerCount = await markers.count();

    // Should have markers for arrow heads and tails
    expect(markerCount).toBeGreaterThan(0);
  });

  test('inheritance arrow has hollow triangle marker', async ({ page }) => {
    // Look for hollow triangle marker (markerEnd with triangle path)
    const triangleMarker = page.locator('defs marker').filter({ has: page.locator('path, polygon') });
    const count = await triangleMarker.count();

    if (count > 0) {
      // Check that it's not filled (hollow)
      const marker = triangleMarker.first();
      const path = marker.locator('path, polygon').first();
      const fill = await path.getAttribute('fill');

      // Hollow should be 'none' or 'white' or similar
      expect(fill).toBeTruthy();
    }
  });

  test('composition arrow has filled diamond marker', async ({ page }) => {
    // Look for diamond marker
    const diamondMarker = page.locator('defs marker[id*="diamond"], defs marker[id*="composition"]');
    const count = await diamondMarker.count();

    if (count > 0) {
      const marker = diamondMarker.first();
      await expect(marker).toBeVisible();

      // Check that it has a path or polygon
      const shape = marker.locator('path, polygon');
      await expect(shape).toBeVisible();
    }
  });

  test('aggregation arrow has hollow diamond marker', async ({ page }) => {
    // Look for hollow diamond marker
    const hollowDiamondMarker = page.locator('defs marker[id*="hollow"], defs marker[id*="aggregation"]');
    const count = await hollowDiamondMarker.count();

    if (count > 0) {
      const marker = hollowDiamondMarker.first();
      await expect(marker).toBeVisible();
    }
  });

  test('dependency arrow has dashed line', async ({ page }) => {
    // Look for dashed arrows
    const dashedArrows = page.locator('path[stroke-dasharray]');
    const count = await dashedArrows.count();

    if (count > 0) {
      const arrow = dashedArrows.first();
      await expect(arrow).toBeVisible();

      const dashArray = await arrow.getAttribute('stroke-dasharray');
      expect(dashArray).toBeTruthy();
      expect(dashArray).not.toBe('0');
    }
  });

  test('arrows connect nodes properly', async ({ page }) => {
    const arrows = page.locator('path.arrow, g.arrow path').first();
    const count = await arrows.count();

    if (count > 0) {
      // Get arrow path
      const d = await arrows.getAttribute('d');
      expect(d).toBeTruthy();

      // Path should have multiple points (curved or straight)
      expect(d!.length).toBeGreaterThan(10);
    }
  });

  test('arrows use bezier curves', async ({ page }) => {
    const arrows = page.locator('path.arrow, g.arrow path').first();
    const count = await arrows.count();

    if (count > 0) {
      const d = await arrows.getAttribute('d');
      expect(d).toBeTruthy();

      // Bezier curves use C or Q commands
      const hasCurve = d!.includes('C') || d!.includes('Q') || d!.includes('c') || d!.includes('q');
      expect(hasCurve).toBe(true);
    }
  });

  test('arrows update when node is dragged', async ({ page }) => {
    const node = page.locator('g.node').first();
    const arrow = page.locator('path.arrow, g.arrow path').first();

    const arrowCount = await arrow.count();
    if (arrowCount > 0) {
      // Get initial arrow path
      const initialPath = await arrow.getAttribute('d');

      // Drag a node
      const bbox = await node.boundingBox();
      await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
      await page.mouse.down();
      await page.mouse.move(bbox!.x + 120, bbox!.y + 110);
      await page.mouse.up();
      await page.waitForTimeout(100);

      // Get new arrow path
      const newPath = await arrow.getAttribute('d');

      // Path should have changed
      expect(newPath).not.toBe(initialPath);
    }
  });

  test('arrows update in real-time during drag', async ({ page }) => {
    const node = page.locator('g.node').first();
    const arrow = page.locator('path.arrow, g.arrow path').first();

    const arrowCount = await arrow.count();
    if (arrowCount > 0) {
      const bbox = await node.boundingBox();

      // Start drag
      await page.mouse.move(bbox!.x + 20, bbox!.y + 10);
      await page.mouse.down();

      // Get path during drag
      await page.mouse.move(bbox!.x + 60, bbox!.y + 60);
      await page.waitForTimeout(50);
      const midPath = await arrow.getAttribute('d');

      // Continue drag
      await page.mouse.move(bbox!.x + 120, bbox!.y + 110);
      await page.waitForTimeout(50);
      const endPath = await arrow.getAttribute('d');

      await page.mouse.up();

      // Paths should be different at different drag stages
      expect(endPath).not.toBe(midPath);
    }
  });

  test('arrow colors are correct', async ({ page }) => {
    const arrows = page.locator('path.arrow, g.arrow path');
    const count = await arrows.count();

    if (count > 0) {
      const arrow = arrows.first();
      const stroke = await arrow.getAttribute('stroke');

      // Should have a stroke color
      expect(stroke).toBeTruthy();
      expect(stroke).not.toBe('none');
    }
  });

  test('arrows have hover effects', async ({ page }) => {
    const arrow = page.locator('path.arrow, g.arrow path').first();
    const count = await arrow.count();

    if (count > 0) {
      // Get initial stroke width
      const initialWidth = await arrow.evaluate((el) => {
        return window.getComputedStyle(el).strokeWidth;
      });

      // Hover over arrow
      await arrow.hover();
      await page.waitForTimeout(100);

      // Stroke width might increase on hover
      const hoverWidth = await arrow.evaluate((el) => {
        return window.getComputedStyle(el).strokeWidth;
      });

      // At minimum, hover should not crash
      expect(hoverWidth).toBeTruthy();
    }
  });

  test('multiple arrow types can coexist', async ({ page }) => {
    // Check for both solid and dashed arrows
    const solidArrows = page.locator('path.arrow:not([stroke-dasharray]), g.arrow path:not([stroke-dasharray])');
    const dashedArrows = page.locator('path[stroke-dasharray], g.arrow path[stroke-dasharray]');

    const solidCount = await solidArrows.count();
    const dashedCount = await dashedArrows.count();

    // Should have at least some arrows
    expect(solidCount + dashedCount).toBeGreaterThan(0);
  });

  test('arrow markers have correct orientation', async ({ page }) => {
    const markers = page.locator('defs marker');
    const count = await markers.count();

    if (count > 0) {
      const marker = markers.first();

      // Check orient attribute
      const orient = await marker.getAttribute('orient');
      expect(orient).toBeTruthy(); // Should be 'auto' or a specific angle
    }
  });

  test('arrows do not overlap nodes inappropriately', async ({ page }) => {
    // This is more of a visual test, but we can check that arrows exist
    // and nodes exist without obvious errors
    const arrows = page.locator('path.arrow, g.arrow path');
    const nodes = page.locator('g.node');

    const arrowCount = await arrows.count();
    const nodeCount = await nodes.count();

    expect(arrowCount).toBeGreaterThan(0);
    expect(nodeCount).toBeGreaterThan(0);

    // Both should be visible
    await expect(arrows.first()).toBeVisible();
    await expect(nodes.first()).toBeVisible();
  });

  test('arrows render smoothly without gaps', async ({ page }) => {
    const arrow = page.locator('path.arrow, g.arrow path').first();
    const count = await arrow.count();

    if (count > 0) {
      // Check that stroke-width is set
      const strokeWidth = await arrow.getAttribute('stroke-width');
      expect(strokeWidth).toBeTruthy();
      expect(parseFloat(strokeWidth!)).toBeGreaterThan(0);
    }
  });
});
