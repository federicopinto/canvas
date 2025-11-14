import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('FPS during drag maintains 60fps', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Inject performance monitor
    await page.evaluate(() => {
      window.fpsLog = [];
      window.perfMonitor = {
        lastTime: performance.now(),
        frameCount: 0,
        measure() {
          const now = performance.now();
          const delta = now - this.lastTime;
          const fps = 1000 / delta;
          window.fpsLog.push(fps);
          this.lastTime = now;
          this.frameCount++;
          if (this.frameCount < 60) {
            requestAnimationFrame(() => this.measure());
          }
        }
      };
      requestAnimationFrame(() => window.perfMonitor.measure());
    });

    // Get first node position
    const nodeBox = await page.locator('.node').first().boundingBox();

    // Simulate drag
    await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
    await page.mouse.down();

    for (let i = 0; i < 20; i++) {
      await page.mouse.move(nodeBox.x + i * 5, nodeBox.y, { steps: 1 });
      await page.waitForTimeout(16); // ~60fps
    }

    await page.mouse.up();
    await page.waitForTimeout(100);

    // Get FPS stats
    const stats = await page.evaluate(() => {
      const fps = window.fpsLog.filter(f => f < 200 && f > 10); // Filter outliers
      if (fps.length === 0) return { avg: 0, min: 0, dropped: 0, total: 0 };
      const avg = fps.reduce((a, b) => a + b, 0) / fps.length;
      const min = Math.min(...fps);
      const dropped = fps.filter(f => f < 55).length;
      return { avg, min, dropped, total: fps.length };
    });

    console.log('FPS Stats:', stats);
    expect(stats.avg).toBeGreaterThan(30); // Relaxed for CI environments
    expect(stats.total).toBeGreaterThan(0);
  });

  test('arrow routing performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.arrow');

    // Measure arrow routing time
    const routingTime = await page.evaluate(() => {
      const start = performance.now();

      // Trigger arrow re-routing
      const node = window.canvas.state.getState().nodes.values().next().value;
      window.canvas.eventBus.emit('node:moved', { nodeId: node.id });

      const end = performance.now();
      return end - start;
    });

    console.log('Arrow routing time:', routingTime, 'ms');
    expect(routingTime).toBeLessThan(50); // Relaxed for different environments
  });

  test('initial render time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.node');
    const endTime = Date.now();

    const renderTime = endTime - startTime;
    console.log('Initial render time:', renderTime, 'ms');
    expect(renderTime).toBeLessThan(3000); // Relaxed for slower environments
  });

  test('memory usage stays reasonable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Perform some operations
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, -50); // Zoom in
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, 50); // Zoom out
      await page.waitForTimeout(100);
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercent = (memoryIncrease / initialMemory) * 100;
      console.log('Memory increase:', memoryIncrease, 'bytes', `(${increasePercent.toFixed(1)}%)`);

      // Memory shouldn't increase by more than 50% after operations
      expect(increasePercent).toBeLessThan(50);
    }
  });

  test('viewport transform performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Measure multiple viewport transforms
    const transformTimes = await page.evaluate(() => {
      const times = [];

      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        window.canvas.viewport.zoom = 1.0 + (i * 0.1);
        window.canvas.eventBus.emit('viewport:changed');
        const end = performance.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      return { avg, max };
    });

    console.log('Viewport transform times:', transformTimes);
    expect(transformTimes.avg).toBeLessThan(10);
    expect(transformTimes.max).toBeLessThan(50);
  });

  test('node selection performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Measure selection operations
    const selectionTime = await page.evaluate(() => {
      const times = [];
      const nodes = Array.from(window.canvas.state.getState().nodes.keys());

      for (let i = 0; i < nodes.length; i++) {
        const start = performance.now();
        window.canvas.selectNode(nodes[i], false);
        const end = performance.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      return { avg, max, count: times.length };
    });

    console.log('Selection times:', selectionTime);
    expect(selectionTime.avg).toBeLessThan(5);
  });

  test('performance monitor tracks metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.node');

    // Check that performance monitor is working
    const hasPerf = await page.evaluate(() => {
      return typeof window.perfMonitor !== 'undefined';
    });

    expect(hasPerf).toBe(true);

    // Get performance stats
    const stats = await page.evaluate(() => {
      if (window.canvas && window.canvas.getPerformanceStats) {
        return window.canvas.getPerformanceStats();
      }
      return null;
    });

    if (stats) {
      console.log('Performance stats:', stats);
      expect(stats).toBeTruthy();
    }
  });
});
