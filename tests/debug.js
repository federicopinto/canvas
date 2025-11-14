import { chromium } from '@playwright/test';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));

  // Listen to page errors
  page.on('pageerror', error => console.log('Page error:', error.message));

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');

  // Wait a bit for page to load
  await page.waitForTimeout(3000);

  // Check what's on the page
  const html = await page.content();
  console.log('\n=== Page HTML (first 500 chars) ===');
  console.log(html.substring(0, 500));

  // Check if SVG exists
  const svgCount = await page.locator('svg').count();
  console.log('\n=== Element Counts ===');
  console.log('SVG elements:', svgCount);

  const divCount = await page.locator('#app').count();
  console.log('App div:', divCount);

  const nodeCount = await page.locator('.node').count();
  console.log('Node elements:', nodeCount);

  // Check for JavaScript errors or if window.canvas exists
  const canvasExists = await page.evaluate(() => {
    return typeof window.canvas !== 'undefined';
  });
  console.log('window.canvas exists:', canvasExists);

  // Take a screenshot
  await page.screenshot({ path: 'tests/screenshots/debug.png', fullPage: true });
  console.log('\nScreenshot saved to tests/screenshots/debug.png');

  await browser.close();
}

debug().catch(console.error);
