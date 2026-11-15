// Lanyard motion (pure, no three.js): the strap is stiff, so the whole badge swings as one damped pendulum
// around the top of the strap, and the card twists a little on its swivel. Both are damped springs.

export type Spring = { x: number; v: number };

/**
 * Semi-implicit Euler step of a damped spring toward `target`.
 * stiffness k (1/s²) sets the period, damping c (1/s) how fast it settles (critical ≈ 2·√k).
 */
export function stepSpring(s: Spring, target: number, dt: number, k: number, c: number) {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
}

/** How far the strap is pulled beyond its length: pointer distance from the anchor minus the distance at grab. */
export function stretchTo(anchorX: number, anchorY: number, x: number, y: number, grabDist: number, max: number) {
  return Math.max(0, Math.min(max, Math.hypot(x - anchorX, y - anchorY) - grabDist));
}

/** Swing angle (radians, around the view axis) that points a strap hanging from `anchor` at the pointer. */
export function swingTo(anchorX: number, anchorY: number, x: number, y: number, limit: number) {
  const a = Math.atan2(x - anchorX, anchorY - y);
  return Math.max(-limit, Math.min(limit, a));
}
