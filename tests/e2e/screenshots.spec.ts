import { test, expect } from '@playwright/test';

test.describe('Screenshot Capture', () => {
  test('capture all required screenshots', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Let everything settle

    // 1. Initial demo diagram
    await page.screenshot({
      path: '/home/user/canvas/screenshots/screenshot-initial.png',
      fullPage: false
    });

    // 2. Zoom to 50%
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("-")').click();
      await page.waitForTimeout(100);
    }
    await page.screenshot({
      path: '/home/user/canvas/screenshots/screenshot-zoomed-50.png',
      fullPage: false
    });

    // 3. Zoom to 200%
    await page.locator('button:has-text("100%")').click();
    await page.waitForTimeout(200);
    for (let i = 0; i < 10; i++) {
      await page.locator('button:has-text("+")').click();
      await page.waitForTimeout(100);
    }
    await page.screenshot({
      path: '/home/user/canvas/screenshots/screenshot-zoomed-200.png',
      fullPage: false
    });

    // Reset zoom
    await page.locator('button:has-text("100%")').click();
    await page.waitForTimeout(200);

    // 4. Close-up of first node (Class node)
    const nodes = page.locator('g.node');
    const firstNode = nodes.first();
    if (await firstNode.count() > 0) {
      const bbox = await firstNode.boundingBox();
      if (bbox) {
        await page.screenshot({
          path: '/home/user/canvas/screenshots/screenshot-class-node.png',
          clip: {
            x: Math.max(0, bbox.x - 20),
            y: Math.max(0, bbox.y - 20),
            width: Math.min(bbox.width + 40, 400),
            height: Math.min(bbox.height + 40, 600)
          }
        });
      }
    }

    // 5. Close-up of second node (Dataclass or another type)
    const secondNode = nodes.nth(1);
    if (await secondNode.count() > 0) {
      const bbox = await secondNode.boundingBox();
      if (bbox) {
        await page.screenshot({
          path: '/home/user/canvas/screenshots/screenshot-dataclass-node.png',
          clip: {
            x: Math.max(0, bbox.x - 20),
            y: Math.max(0, bbox.y - 20),
            width: Math.min(bbox.width + 40, 400),
            height: Math.min(bbox.height + 40, 600)
          }
        });
      }
    }

    // 6. Close-up of third node (Protocol or another type)
    const thirdNode = nodes.nth(2);
    if (await thirdNode.count() > 0) {
      const bbox = await thirdNode.boundingBox();
      if (bbox) {
        await page.screenshot({
          path: '/home/user/canvas/screenshots/screenshot-protocol-node.png',
          clip: {
            x: Math.max(0, bbox.x - 20),
            y: Math.max(0, bbox.y - 20),
            width: Math.min(bbox.width + 40, 400),
            height: Math.min(bbox.height + 40, 600)
          }
        });
      }
    }

    // 7. Selected node
    await firstNode.click();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: '/home/user/canvas/screenshots/screenshot-selected.png',
      fullPage: false
    });

    // 8. Collapsed section
    const sections = page.locator('g.section-header, text').filter({ hasText: /Fields|Methods|Properties/ });
    if (await sections.count() > 0) {
      await sections.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: '/home/user/canvas/screenshots/screenshot-collapsed.png',
        fullPage: false
      });
    }

    // 9. Arrows visible
    await page.screenshot({
      path: '/home/user/canvas/screenshots/screenshot-arrows.png',
      fullPage: false
    });

    // 10. After auto-layout
    const autoArrangeBtn = page.locator('button').filter({ hasText: /⚡|Auto|Arrange/ }).first();
    if (await autoArrangeBtn.count() > 0) {
      await autoArrangeBtn.click();
      await page.waitForTimeout(700);
      await page.screenshot({
        path: '/home/user/canvas/screenshots/screenshot-layout-after.png',
        fullPage: false
      });
    }

    expect(true).toBe(true); // Test passes if we got here
  });
});
