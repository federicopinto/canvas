import { Easing } from './Tween.js';

/**
 * Animator - Manages smooth animations for properties
 */
export class Animator {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.animations = [];
    this.running = false;
    this.animationFrameId = null;
  }

  /**
   * Animate a property from current value to target value
   */
  animate(target, property, to, duration = 300, easing = Easing.easeInOutCubic, onComplete = null) {
    // Get current value
    const from = target[property];

    // Remove any existing animations for this target/property
    this.animations = this.animations.filter(
      anim => !(anim.target === target && anim.property === property)
    );

    // Create animation object
    const animation = {
      target,
      property,
      from,
      to,
      duration,
      easing,
      onComplete,
      startTime: performance.now(),
      done: false
    };

    // Add to active animations
    this.animations.push(animation);

    // Start loop if not running
    if (!this.running) {
      this.start();
    }

    return animation;
  }

  /**
   * Animate multiple properties of the same target
   */
  animateMultiple(target, properties, duration = 300, easing = Easing.easeInOutCubic, onComplete = null) {
    const animations = [];

    Object.entries(properties).forEach(([property, to]) => {
      const animation = this.animate(target, property, to, duration, easing);
      animations.push(animation);
    });

    // Call onComplete when all animations finish
    if (onComplete) {
      const checkComplete = () => {
        if (animations.every(a => a.done)) {
          onComplete();
        } else {
          requestAnimationFrame(checkComplete);
        }
      };
      requestAnimationFrame(checkComplete);
    }

    return animations;
  }

  /**
   * Start animation loop
   */
  start() {
    this.running = true;
    this.loop();
  }

  /**
   * Animation loop
   */
  loop() {
    if (!this.running) return;

    const now = performance.now();
    let anyActive = false;

    // Update all active animations
    this.animations.forEach(anim => {
      if (anim.done) return;

      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);

      // Apply easing
      const easedProgress = anim.easing(progress);

      // Calculate new value
      const value = anim.from + (anim.to - anim.from) * easedProgress;

      // Update property
      anim.target[anim.property] = value;

      // Check if complete
      if (progress >= 1) {
        anim.target[anim.property] = anim.to; // Ensure exact final value
        anim.done = true;

        // Call completion callback
        if (anim.onComplete) {
          anim.onComplete();
        }

        // Emit animation complete event
        this.eventBus?.emit('animation:complete', {
          target: anim.target,
          property: anim.property
        });
      } else {
        anyActive = true;
      }
    });

    // Remove completed animations
    this.animations = this.animations.filter(a => !a.done);

    // Continue loop if animations remain
    if (anyActive || this.animations.length > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    } else {
      this.stop();
    }
  }

  /**
   * Stop animation loop
   */
  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cancel all animations
   */
  cancelAll() {
    this.animations = [];
    this.stop();
  }

  /**
   * Cancel animations for a specific target
   */
  cancelFor(target) {
    this.animations = this.animations.filter(anim => anim.target !== target);
    if (this.animations.length === 0) {
      this.stop();
    }
  }

  /**
   * Cancel animation for a specific target property
   */
  cancelProperty(target, property) {
    this.animations = this.animations.filter(
      anim => !(anim.target === target && anim.property === property)
    );
    if (this.animations.length === 0) {
      this.stop();
    }
  }

  /**
   * Check if any animations are running
   */
  isAnimating() {
    return this.animations.length > 0;
  }

  /**
   * Get active animations count
   */
  getActiveCount() {
    return this.animations.length;
  }
}
