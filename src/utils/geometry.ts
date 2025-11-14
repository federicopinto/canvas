// Vector math helpers for canvas operations

export interface Point {
  x: number;
  y: number;
}

export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function add(p1: Point, p2: Point): Point {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  };
}

export function subtract(p1: Point, p2: Point): Point {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}

export function scale(p: Point, factor: number): Point {
  return {
    x: p.x * factor,
    y: p.y * factor
  };
}

export function dot(p1: Point, p2: Point): number {
  return p1.x * p2.x + p1.y * p2.y;
}

export function normalize(p: Point): Point {
  const len = Math.sqrt(p.x * p.x + p.y * p.y);
  if (len === 0) return { x: 0, y: 0 };
  return {
    x: p.x / len,
    y: p.y / len
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
