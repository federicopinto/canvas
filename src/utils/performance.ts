export class PerformanceMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private rafId: number | null = null;

  private updateCallback?: (stats: PerformanceStats) => void;

  start(callback: (stats: PerformanceStats) => void) {
    this.updateCallback = callback;
    this.measure();
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private measure() {
    const now = performance.now();
    const delta = now - this.lastTime;
    const fps = 1000 / delta;

    this.frames.push(fps);

    // Keep last 60 frames (1 second at 60fps)
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    this.lastTime = now;

    if (this.updateCallback && this.frames.length > 10) {
      const stats = this.getStats();
      this.updateCallback(stats);
    }

    this.rafId = requestAnimationFrame(() => this.measure());
  }

  private getStats(): PerformanceStats {
    const sorted = [...this.frames].sort((a, b) => a - b);
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);
    const p1 = sorted[Math.floor(sorted.length * 0.01)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      avgFPS: Math.round(avg),
      minFPS: Math.round(min),
      maxFPS: Math.round(max),
      p1FPS: Math.round(p1),
      p99FPS: Math.round(p99),
      droppedFrames: this.frames.filter(f => f < 55).length
    };
  }
}

export interface PerformanceStats {
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  p1FPS: number;
  p99FPS: number;
  droppedFrames: number;
}
