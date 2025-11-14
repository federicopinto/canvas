/**
 * PerformanceMonitor - Track FPS and frame times
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.logInterval = options.logInterval || 1000; // Log every second
    this.slowFrameThreshold = options.slowFrameThreshold || 16.67; // 60fps

    this.frames = [];
    this.lastLogTime = performance.now();
    this.slowFrameCount = 0;
    this.totalFrames = 0;

    // Stats
    this.stats = {
      fps: 0,
      avgFrameTime: 0,
      minFrameTime: 0,
      maxFrameTime: 0,
      slowFrames: 0
    };
  }

  /**
   * Start monitoring
   */
  start() {
    if (!this.enabled) return;

    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Tick - should be called every frame
   */
  tick() {
    if (!this.enabled) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Record frame time
    this.frames.push(frameTime);
    this.totalFrames++;

    // Check for slow frame
    if (frameTime > this.slowFrameThreshold) {
      this.slowFrameCount++;
      if (frameTime > 33) { // Really slow (< 30fps)
        console.warn(`Slow frame detected: ${frameTime.toFixed(2)}ms`);
      }
    }

    // Log stats periodically
    if (now - this.lastLogTime >= this.logInterval) {
      this.calculateStats();
      this.logStats();
      this.lastLogTime = now;
      this.frames = []; // Reset for next interval
    }
  }

  /**
   * Calculate statistics
   */
  calculateStats() {
    if (this.frames.length === 0) return;

    const sum = this.frames.reduce((a, b) => a + b, 0);
    const avg = sum / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);

    this.stats = {
      fps: Math.round(1000 / avg),
      avgFrameTime: avg.toFixed(2),
      minFrameTime: min.toFixed(2),
      maxFrameTime: max.toFixed(2),
      slowFrames: this.slowFrameCount
    };
  }

  /**
   * Log statistics to console
   */
  logStats() {
    if (!this.enabled) return;

    console.log(`[Performance] FPS: ${this.stats.fps} | Avg: ${this.stats.avgFrameTime}ms | Min: ${this.stats.minFrameTime}ms | Max: ${this.stats.maxFrameTime}ms | Slow frames: ${this.stats.slowFrames}`);
  }

  /**
   * Get current stats
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.frames = [];
    this.slowFrameCount = 0;
    this.totalFrames = 0;
    this.lastLogTime = performance.now();
    this.stats = {
      fps: 0,
      avgFrameTime: 0,
      minFrameTime: 0,
      maxFrameTime: 0,
      slowFrames: 0
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.reset();
      this.start();
    }
  }

  /**
   * Mark start of operation
   */
  mark(label) {
    if (!this.enabled) return;
    performance.mark(label);
  }

  /**
   * Measure operation duration
   */
  measure(name, startMark, endMark) {
    if (!this.enabled) return;
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    if (measure) {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }
  }
}
