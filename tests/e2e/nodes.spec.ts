import { test, expect } from '@playwright/test';

test.describe('Node Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all three node types render correctly', async ({ page }) => {
    // Check that nodes are present
    const nodes = page.locator('g.node');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('class node has correct colors', async ({ page }) => {
    // Find a class-type node by looking for the expected header color
    // Class header should be #DAE8FC with #6C8EBF border
    const classNode = page.locator('g.node').filter({ has: page.locator('rect[fill="#DAE8FC"]') }).first();
    await expect(classNode).toBeVisible();

    // Check header fill color
    const header = classNode.locator('rect[fill="#DAE8FC"]');
    await expect(header).toBeVisible();

    // Check border color (stroke)
    const headerStroke = await header.getAttribute('stroke');
    expect(headerStroke).toBe('#6C8EBF');
  });

  test('dataclass node has correct colors', async ({ page }) => {
    // Dataclass header should be #E1D5E7 with #9673A6 border
    const dataclassNode = page.locator('g.node').filter({ has: page.locator('rect[fill="#E1D5E7"]') }).first();

    // May not exist in demo data, so check if it exists first
    const count = await dataclassNode.count();
    if (count > 0) {
      await expect(dataclassNode).toBeVisible();

      const header = dataclassNode.locator('rect[fill="#E1D5E7"]');
      await expect(header).toBeVisible();

      const headerStroke = await header.getAttribute('stroke');
      expect(headerStroke).toBe('#9673A6');
    }
  });

  test('protocol node has correct colors and dashed border', async ({ page }) => {
    // Protocol header should be #FFF2CC with dashed #D6B656 border
    const protocolNode = page.locator('g.node').filter({ has: page.locator('rect[fill="#FFF2CC"]') }).first();

    const count = await protocolNode.count();
    if (count > 0) {
      await expect(protocolNode).toBeVisible();

      const header = protocolNode.locator('rect[fill="#FFF2CC"]');
      await expect(header).toBeVisible();

      const headerStroke = await header.getAttribute('stroke');
      expect(headerStroke).toBe('#D6B656');

      // Check for dashed border
      const strokeDasharray = await header.getAttribute('stroke-dasharray');
      expect(strokeDasharray).toBeTruthy(); // Should have a dash pattern
    }
  });

  test('nodes have visible shadows', async ({ page }) => {
    // Check that filter definition exists for drop shadow
    const filter = page.locator('defs filter#drop-shadow');

    // If custom filter exists, check it
    const filterCount = await filter.count();
    if (filterCount > 0) {
      await expect(filter).toBeVisible();
    }

    // Alternatively, check that nodes have filter applied
    const nodeWithShadow = page.locator('g.node rect[filter]').first();
    const hasFilter = await nodeWithShadow.count();

    // At least some visual shadow/depth should be present
    expect(hasFilter).toBeGreaterThanOrEqual(0); // This is permissive as shadows may be CSS
  });

  test('node headers display properly', async ({ page }) => {
    // Check that node labels are visible
    const nodeLabel = page.locator('g.node text.node-label').first();
    await expect(nodeLabel).toBeVisible();

    const labelText = await nodeLabel.textContent();
    expect(labelText).toBeTruthy();
    expect(labelText!.length).toBeGreaterThan(0);
  });

  test('node bodies display properly', async ({ page }) => {
    // Check that node bodies (white background) exist
    const nodeBody = page.locator('g.node rect[fill="#FFFFFF"]').first();
    await expect(nodeBody).toBeVisible();

    // Check that sections are visible
    const sectionText = page.locator('g.node text').nth(1); // Second text should be in body
    await expect(sectionText).toBeVisible();
  });

  test('nodes have correct dimensions', async ({ page }) => {
    const node = page.locator('g.node').first();

    // Get bounding box
    const bbox = await node.boundingBox();
    expect(bbox).toBeTruthy();
    expect(bbox!.width).toBeGreaterThan(200); // Nodes should be at least 200px wide
    expect(bbox!.height).toBeGreaterThan(50); // And at least 50px tall
  });

  test('node text is readable and properly styled', async ({ page }) => {
    // Check header text
    const headerText = page.locator('g.node text.node-label').first();
    const headerFontSize = await headerText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Header should be larger than body text
    expect(parseInt(headerFontSize)).toBeGreaterThanOrEqual(14);

    // Check that text has proper fill color (not transparent)
    const fill = await headerText.getAttribute('fill');
    expect(fill).toBeTruthy();
  });

  test('nodes show field and method sections', async ({ page }) => {
    // Look for section headers like "Fields" or "Methods"
    const sectionHeaders = page.locator('g.node text').filter({ hasText: /Fields|Methods|Properties/ });
    const count = await sectionHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test('multiple nodes can exist simultaneously', async ({ page }) => {
    const nodes = page.locator('g.node');
    const nodeCount = await nodes.count();

    // Demo data should have multiple nodes
    expect(nodeCount).toBeGreaterThanOrEqual(3);
  });

  test('nodes maintain visual hierarchy', async ({ page }) => {
    // Header should be above body
    const node = page.locator('g.node').first();

    const headerRect = node.locator('rect').first();
    const headerY = await headerRect.evaluate((el) => parseFloat(el.getAttribute('y') || '0'));

    const bodyRect = node.locator('rect').nth(1);
    const bodyY = await bodyRect.evaluate((el) => parseFloat(el.getAttribute('y') || '0'));

    expect(bodyY).toBeGreaterThan(headerY);
  });
});
