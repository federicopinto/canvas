import { test, expect } from '@playwright/test';

test.describe('Canvas Visual Tests', () => {
  test('canvas renders with grid', async ({ page }) => {
    await page.goto('/');

    // Wait for canvas to load
    await page.waitForSelector('svg');

    // Check grid pattern exists
    const pattern = await page.locator('pattern#grid-pattern');
    await expect(pattern).toBeAttached();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/canvas-initial.png' });
  });

  test('nodes render with correct count', async ({ page }) => {
    await page.goto('/');

    // Wait for nodes to render
    await page.waitForSelector('.node');

    // Count nodes (demo has 8 nodes)
    const nodeCount = await page.locator('.node').count();
    expect(nodeCount).toBe(8);
  });

  test('nodes render with correct types', async ({ page }) => {
    await page.goto('/');

    // Wait for nodes
    await page.waitForSelector('.node');

    // Check specific node types exist by checking badge text
    const badges = await page.locator('.node-badge').allTextContents();

    // We should have: 1 protocol, 4 dataclasses, 1 class, 1 enum, 1 interface
    const protocolCount = badges.filter(b => b === '«protocol»').length;
    const dataclassCount = badges.filter(b => b === '@dataclass').length;
    const classCount = badges.filter(b => b === 'class').length;
    const enumCount = badges.filter(b => b === '«enum»').length;
    const interfaceCount = badges.filter(b => b === '«interface»').length;

    expect(protocolCount).toBe(1);
    expect(dataclassCount).toBe(4);
    expect(classCount).toBe(1);
    expect(enumCount).toBe(1);
    expect(interfaceCount).toBe(1);
  });

  test('specific nodes render with correct names', async ({ page }) => {
    await page.goto('/');

    // Wait for nodes
    await page.waitForSelector('.node');

    // Check for specific class names
    const classNames = await page.locator('.node-class-name').allTextContents();

    expect(classNames).toContain('Serializable');
    expect(classNames).toContain('Product');
    expect(classNames).toContain('Customer');
    expect(classNames).toContain('Order');
    expect(classNames).toContain('OrderItem');
    expect(classNames).toContain('OrderStatus');
    expect(classNames).toContain('OrderService');
    expect(classNames).toContain('PaymentProcessor');
  });

  test('arrows render between nodes', async ({ page }) => {
    await page.goto('/');

    // Wait for arrows
    await page.waitForSelector('.arrow');

    // Count arrows (demo has 8 arrows)
    const arrowCount = await page.locator('.arrow').count();
    expect(arrowCount).toBe(8);
  });

  test('arrows render with correct types', async ({ page }) => {
    await page.goto('/');

    // Wait for arrows
    await page.waitForSelector('.arrow');

    // Check arrow markers are present
    const arrows = await page.locator('.arrow').all();

    let inheritanceCount = 0;
    let compositionCount = 0;
    let dependencyCount = 0;
    let associationCount = 0;

    for (const arrow of arrows) {
      const markerEnd = await arrow.getAttribute('marker-end');
      const markerStart = await arrow.getAttribute('marker-start');

      if (markerEnd?.includes('inheritance')) inheritanceCount++;
      if (markerEnd?.includes('composition')) compositionCount++;
      if (markerEnd?.includes('dependency')) dependencyCount++;
      if (markerEnd?.includes('association') && !markerStart) associationCount++;
    }

    // Based on demo data: 3 inheritance, 1 composition, 1 dependency, 3 association
    expect(inheritanceCount).toBe(3);
    expect(compositionCount).toBe(1);
    expect(dependencyCount).toBe(1);
    expect(associationCount).toBe(3);
  });

  test('toolbar is visible and functional', async ({ page }) => {
    await page.goto('/');

    // Check toolbar exists
    const toolbar = await page.locator('.toolbar');
    await expect(toolbar).toBeVisible();

    // Count buttons
    const buttonCount = await page.locator('.toolbar button').count();
    expect(buttonCount).toBe(7);
  });

  test('zoom control displays percentage', async ({ page }) => {
    await page.goto('/');

    // Wait for zoom control to appear
    await page.waitForSelector('.zoom-control');

    // Check zoom control displays a percentage
    const zoomText = await page.locator('.zoom-control').textContent();
    expect(zoomText).toMatch(/\d+%/);
  });

  test('SVG defs contain arrow markers', async ({ page }) => {
    await page.goto('/');

    // Check that SVG markers are defined
    await page.waitForSelector('svg defs');

    const markers = await page.locator('defs marker').count();
    expect(markers).toBeGreaterThan(5); // We define multiple markers for different arrow types
  });
});
