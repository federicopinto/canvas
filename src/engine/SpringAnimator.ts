/**
 * Spring Physics Animation System
 * Uses damped harmonic oscillator for organic motion
 */

export interface SpringConfig {
  stiffness?: number;  // How tight the spring is (default: 170)
  damping?: number;    // Resistance to motion (default: 26)
  mass?: number;       // Inertia (default: 1)
  precision?: number;  // When to stop animating (default: 0.01)
}

export class Spring {
  value: number;
  velocity: number = 0;
  target: number;

  stiffness: number;
  damping: number;
  mass: number;
  precision: number;

  constructor(initialValue: number, config: SpringConfig = {}) {
    this.value = initialValue;
    this.target = initialValue;
    this.stiffness = config.stiffness ?? 170;
    this.damping = config.damping ?? 26;
    this.mass = config.mass ?? 1;
    this.precision = config.precision ?? 0.01;
  }

  /**
   * Update spring physics simulation
   * @param deltaTime Time step in seconds (usually 1/60 for 60fps)
   * @returns true if still animating, false if settled
   */
  step(deltaTime: number): boolean {
    const force = -this.stiffness * (this.value - this.target);
    const dampingForce = -this.damping * this.velocity;
    const acceleration = (force + dampingForce) / this.mass;

    this.velocity += acceleration * deltaTime;
    this.value += this.velocity * deltaTime;

    // Check if settled
    const isSettled = Math.abs(this.value - this.target) < this.precision &&
                      Math.abs(this.velocity) < this.precision;

    if (isSettled) {
      this.value = this.target;
      this.velocity = 0;
      return false;
    }

    return true;
  }

  setTarget(newTarget: number) {
    this.target = newTarget;
  }

  setValue(newValue: number) {
    this.value = newValue;
    this.velocity = 0;
  }

  isSettled(): boolean {
    return Math.abs(this.value - this.target) < this.precision &&
           Math.abs(this.velocity) < this.precision;
  }
}

/**
 * Manages multiple spring animations
 */
export class SpringAnimator {
  private springs: Map<string, Spring> = new Map();
  private activeAnimations: Set<string> = new Set();

  /**
   * Create or update a spring animation
   */
  animate(key: string, target: number, config?: SpringConfig): Spring {
    let spring = this.springs.get(key);

    if (!spring) {
      spring = new Spring(target, config);
      this.springs.set(key, spring);
    }

    spring.setTarget(target);
    this.activeAnimations.add(key);

    return spring;
  }

  /**
   * Get current value of a spring
   */
  getValue(key: string): number {
    return this.springs.get(key)?.value ?? 0;
  }

  /**
   * Update all active springs
   * Call this every frame
   */
  step(deltaTime: number = 1/60) {
    const settled: string[] = [];

    for (const key of this.activeAnimations) {
      const spring = this.springs.get(key);
      if (spring) {
        const stillAnimating = spring.step(deltaTime);
        if (!stillAnimating) {
          settled.push(key);
        }
      }
    }

    // Remove settled animations
    settled.forEach(key => this.activeAnimations.delete(key));
  }

  /**
   * Check if any animations are active
   */
  hasActiveAnimations(): boolean {
    return this.activeAnimations.size > 0;
  }

  /**
   * Set value immediately without animation
   */
  setValue(key: string, value: number, config?: SpringConfig) {
    const spring = new Spring(value, config);
    spring.setValue(value);
    this.springs.set(key, spring);
    this.activeAnimations.delete(key);
  }
}
