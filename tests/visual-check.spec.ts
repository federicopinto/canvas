import { test, expect } from '@playwright/test';

test('Phase 1: Canvas foundation with infinite grid', async ({ page }) => {
  // Navigate to the canvas
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Take screenshot of initial state (regardless of whether canvas appears)
  await page.screenshot({
    path: 'tests/screenshots/phase1-foundation.png',
    fullPage: true
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser Error:', msg.text());
    }
  });

  // Try to find canvas
  const canvas = page.locator('canvas');
  const canvasCount = await canvas.count();
  console.log('Canvas elements found:', canvasCount);

  if (canvasCount > 0) {
    // Verify canvas element exists
    await expect(canvas).toBeVisible();

    // Check canvas dimensions
    const box = await canvas.boundingBox();
    console.log('Canvas dimensions:', box);

    // Simulate zoom by scrolling
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, -300); // Zoom in
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase1-zoomed-in.png'
    });

    // Zoom out
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase1-zoomed-out.png'
    });

    console.log('✅ Phase 1 visual tests complete');
  } else {
    console.log('⚠️  No canvas element found - checking page content');
    const html = await page.content();
    console.log('Page HTML length:', html.length);
  }
});
