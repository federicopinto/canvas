import { test, expect } from '@playwright/test';

test('debug - check what renders', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Listen for page errors
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // Take a screenshot to see what's on the page
  await page.screenshot({ path: 'tests/screenshots/debug.png', fullPage: true });

  // Get the HTML body content
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('BODY HTML:', bodyHTML.substring(0, 500));

  // Check if #app exists
  const appElement = await page.locator('#app');
  const appHTML = await appElement.innerHTML();
  console.log('APP HTML:', appHTML.substring(0, 500));
});
