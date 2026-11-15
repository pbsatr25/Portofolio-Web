import { describe, expect, it } from "vitest";
import { stepSpring, stretchTo, swingTo } from "./lanyard";

const run = (s: { x: number; v: number }, target: number, seconds: number, k: number, c: number) => {
  let peak = 0;
  for (let t = 0; t < seconds; t += 1 / 60) {
    stepSpring(s, target, 1 / 60, k, c);
    peak = Math.max(peak, Math.abs(s.x));
  }
  return peak;
};

describe("lanyard spring", () => {
  it("swings back past rest once released, then settles (stiff, not floppy)", () => {
    const s = { x: 0.4, v: 0 };
    let crossed = false;
    for (let t = 0; t < 1.5; t += 1 / 60) {
      stepSpring(s, 0, 1 / 60, 40, 3.5);
      if (s.x < 0) crossed = true;
    }
    expect(crossed).toBe(true); // it does swing
    run(s, 0, 4, 40, 3.5);
    expect(Math.abs(s.x)).toBeLessThan(0.005); // and stops within a few seconds
  });

  it("an overshoot stays small: a fling never whips far past the rest pose", () => {
    const s = { x: 0.4, v: 0 };
    let minX = 0;
    for (let t = 0; t < 3; t += 1 / 60) {
      stepSpring(s, 0, 1 / 60, 40, 3.5);
      minX = Math.min(minX, s.x);
    }
    expect(minX).toBeGreaterThan(-0.25);
  });
});

describe("stretchTo", () => {
  it("only stretches when pulled further than the grab point, up to a limit", () => {
    expect(stretchTo(0, 4, 0, 1, 3, 1)).toBe(0); // at the grab distance
    expect(stretchTo(0, 4, 0, 0.5, 3, 1)).toBeCloseTo(0.5); // pulled down
    expect(stretchTo(0, 4, 0, 2, 3, 1)).toBe(0); // pushed up: a strap goes slack, never negative
    expect(stretchTo(0, 4, 0, -5, 3, 1)).toBe(1); // capped
  });
});

describe("swingTo", () => {
  it("points the strap at the pointer and clamps the angle", () => {
    expect(swingTo(0, 4, 0, 0, 0.5)).toBeCloseTo(0);
    expect(swingTo(0, 4, 1, 3, 1)).toBeCloseTo(Math.PI / 4);
    expect(swingTo(0, 4, 10, 3, 0.5)).toBe(0.5);
    expect(swingTo(0, 4, -10, 3, 0.5)).toBe(-0.5);
  });
});
