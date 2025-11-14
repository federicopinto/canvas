export class Spring {
  position: number = 0;
  velocity: number = 0;
  target: number = 0;
  stiffness: number = 180;
  damping: number = 12;
  mass: number = 1;

  constructor(initialPosition: number = 0, config?: { stiffness?: number; damping?: number; mass?: number }) {
    this.position = initialPosition;
    this.target = initialPosition;
    if (config) {
      this.stiffness = config.stiffness ?? this.stiffness;
      this.damping = config.damping ?? this.damping;
      this.mass = config.mass ?? this.mass;
    }
  }

  tick(deltaTime: number = 1/60): number {
    // Spring force: F = -k * x
    const force = (this.target - this.position) * this.stiffness;

    // Damping force: F = -c * v
    const dampingForce = this.velocity * this.damping;

    // Acceleration: a = F / m
    const acceleration = (force - dampingForce) / this.mass;

    // Update velocity and position
    this.velocity += acceleration * deltaTime;
    this.position += this.velocity * deltaTime;

    // Stop when close enough (prevents infinite tiny movements)
    const isAtRest =
      Math.abs(this.velocity) < 0.01 &&
      Math.abs(this.target - this.position) < 0.01;

    if (isAtRest) {
      this.position = this.target;
      this.velocity = 0;
    }

    return this.position;
  }

  setTarget(target: number) {
    this.target = target;
  }

  reset(position: number) {
    this.position = position;
    this.target = position;
    this.velocity = 0;
  }

  isAtRest(): boolean {
    return Math.abs(this.velocity) < 0.01 &&
           Math.abs(this.target - this.position) < 0.01;
  }
}

export class Spring2D {
  x: Spring;
  y: Spring;

  constructor(initialX: number = 0, initialY: number = 0, config?: { stiffness?: number; damping?: number }) {
    this.x = new Spring(initialX, config);
    this.y = new Spring(initialY, config);
  }

  tick(deltaTime: number = 1/60): { x: number; y: number } {
    return {
      x: this.x.tick(deltaTime),
      y: this.y.tick(deltaTime)
    };
  }

  setTarget(x: number, y: number) {
    this.x.setTarget(x);
    this.y.setTarget(y);
  }

  isAtRest(): boolean {
    return this.x.isAtRest() && this.y.isAtRest();
  }
}
