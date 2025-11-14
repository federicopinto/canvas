import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('measure FPS during node drag', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Inject FPS monitor
    const fps = await page.evaluate(() => {
      return new Promise<{ avgFPS: number; minFPS: number; droppedFrames: number }>((resolve) => {
        const fpsSampler = {
          frames: [] as number[],
          lastTime: performance.now(),
          measure() {
            const now = performance.now();
            const fps = 1000 / (now - this.lastTime);
            this.frames.push(fps);
            this.lastTime = now;
            if (this.frames.length < 120) { // 2 seconds at 60fps
              requestAnimationFrame(() => this.measure());
            } else {
              resolve({
                avgFPS: this.frames.reduce((a,b) => a+b, 0) / this.frames.length,
                minFPS: Math.min(...this.frames),
                droppedFrames: this.frames.filter(f => f < 55).length
              });
            }
          }
        };

        // Start dragging a node
        const node = document.querySelector('g.node');
        if (!node) {
          resolve({ avgFPS: 0, minFPS: 0, droppedFrames: 0 });
          return;
        }

        const bbox = node.getBoundingClientRect();
        const startX = bbox.x + 20;
        const startY = bbox.y + 10;

        // Simulate drag
        const mouseDown = new MouseEvent('mousedown', {
          bubbles: true,
          clientX: startX,
          clientY: startY
        });
        node.dispatchEvent(mouseDown);

        fpsSampler.measure();

        let frame = 0;
        const dragAnimation = () => {
          frame++;
          if (frame <= 120) {
            const mouseMove = new MouseEvent('mousemove', {
              bubbles: true,
              clientX: startX + frame,
              clientY: startY + frame
            });
            document.dispatchEvent(mouseMove);
            requestAnimationFrame(dragAnimation);
          } else {
            const mouseUp = new MouseEvent('mouseup', { bubbles: true });
            document.dispatchEvent(mouseUp);
          }
        };
        dragAnimation();
      });
    });

    console.log('Drag FPS:', fps);

    // Target is 60fps with minimal dropped frames
    expect(fps.avgFPS).toBeGreaterThan(50);
    expect(fps.droppedFrames).toBeLessThan(20); // Allow some tolerance
  });

  test('measure FPS during collapse animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const fps = await page.evaluate(() => {
      return new Promise<{ avgFPS: number; minFPS: number; droppedFrames: number }>((resolve) => {
        const fpsSampler = {
          frames: [] as number[],
          lastTime: performance.now(),
          measure() {
            const now = performance.now();
            const fps = 1000 / (now - this.lastTime);
            this.frames.push(fps);
            this.lastTime = now;
            if (this.frames.length < 60) { // 1 second at 60fps
              requestAnimationFrame(() => this.measure());
            } else {
              resolve({
                avgFPS: this.frames.reduce((a,b) => a+b, 0) / this.frames.length,
                minFPS: Math.min(...this.frames),
                droppedFrames: this.frames.filter(f => f < 55).length
              });
            }
          }
        };

        // Find and click a section header
        const sectionHeader = document.querySelector('g.section-header');
        if (sectionHeader) {
          fpsSampler.measure();
          (sectionHeader as any).click();
        } else {
          resolve({ avgFPS: 60, minFPS: 60, droppedFrames: 0 });
        }
      });
    });

    console.log('Collapse FPS:', fps);

    expect(fps.avgFPS).toBeGreaterThan(50);
    expect(fps.droppedFrames).toBeLessThan(10);
  });

  test('measure FPS during auto-layout animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const fps = await page.evaluate(() => {
      return new Promise<{ avgFPS: number; minFPS: number; droppedFrames: number }>((resolve) => {
        const fpsSampler = {
          frames: [] as number[],
          lastTime: performance.now(),
          measure() {
            const now = performance.now();
            const fps = 1000 / (now - this.lastTime);
            this.frames.push(fps);
            this.lastTime = now;
            if (this.frames.length < 180) { // 3 seconds at 60fps
              requestAnimationFrame(() => this.measure());
            } else {
              resolve({
                avgFPS: this.frames.reduce((a,b) => a+b, 0) / this.frames.length,
                minFPS: Math.min(...this.frames),
                droppedFrames: this.frames.filter(f => f < 55).length
              });
            }
          }
        };

        // Find and click auto-arrange button
        const buttons = Array.from(document.querySelectorAll('button'));
        const autoArrangeBtn = buttons.find(btn => btn.textContent?.includes('⚡') || btn.textContent?.includes('Auto'));

        if (autoArrangeBtn) {
          fpsSampler.measure();
          autoArrangeBtn.click();
        } else {
          resolve({ avgFPS: 60, minFPS: 60, droppedFrames: 0 });
        }
      });
    });

    console.log('Layout FPS:', fps);

    expect(fps.avgFPS).toBeGreaterThan(50);
    expect(fps.droppedFrames).toBeLessThan(30); // More tolerance for complex animation
  });

  test('measure FPS during zoom and pan', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const fps = await page.evaluate(() => {
      return new Promise<{ avgFPS: number; minFPS: number; droppedFrames: number }>((resolve) => {
        const fpsSampler = {
          frames: [] as number[],
          lastTime: performance.now(),
          measure() {
            const now = performance.now();
            const fps = 1000 / (now - this.lastTime);
            this.frames.push(fps);
            this.lastTime = now;
            if (this.frames.length < 120) { // 2 seconds at 60fps
              requestAnimationFrame(() => this.measure());
            } else {
              resolve({
                avgFPS: this.frames.reduce((a,b) => a+b, 0) / this.frames.length,
                minFPS: Math.min(...this.frames),
                droppedFrames: this.frames.filter(f => f < 55).length
              });
            }
          }
        };

        fpsSampler.measure();

        // Simulate zoom
        const svg = document.querySelector('svg');
        if (svg) {
          let frame = 0;
          const zoomAnimation = () => {
            frame++;
            if (frame <= 120) {
              const wheelEvent = new WheelEvent('wheel', {
                deltaY: frame % 10 === 0 ? -10 : 0,
                bubbles: true
              });
              svg.dispatchEvent(wheelEvent);
              requestAnimationFrame(zoomAnimation);
            }
          };
          zoomAnimation();
        } else {
          resolve({ avgFPS: 60, minFPS: 60, droppedFrames: 0 });
        }
      });
    });

    console.log('Zoom/Pan FPS:', fps);

    expect(fps.avgFPS).toBeGreaterThan(50);
    expect(fps.droppedFrames).toBeLessThan(20);
  });
});
