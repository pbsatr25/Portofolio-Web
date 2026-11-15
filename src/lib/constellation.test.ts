import { describe, expect, it } from "vitest";
import { nearestK } from "./constellation";

const pts = (list: [number, number][]) => ({
  xs: Float32Array.from(list.map((p) => p[0])),
  ys: Float32Array.from(list.map((p) => p[1])),
  n: list.length,
});

describe("nearestK", () => {
  it("returns the k closest points, closest first", () => {
    const { xs, ys, n } = pts([
      [10, 0],
      [1, 0],
      [5, 0],
      [3, 0],
      [100, 0],
    ]);
    const idx = new Int32Array(3);
    const d2 = new Float64Array(3);
    expect(nearestK(xs, ys, n, 0, 0, Infinity, idx, d2)).toBe(3);
    expect([...idx]).toEqual([1, 3, 2]);
    expect([...d2]).toEqual([1, 9, 25]);
  });

  it("ignores points beyond the radius and reports fewer than k", () => {
    const { xs, ys, n } = pts([
      [1, 0],
      [50, 0],
      [2, 0],
    ]);
    const idx = new Int32Array(5);
    const d2 = new Float64Array(5);
    expect(nearestK(xs, ys, n, 0, 0, 10 * 10, idx, d2)).toBe(2);
    expect([...idx.slice(0, 2)]).toEqual([0, 2]);
  });

  it("only scans the first `count` points", () => {
    const { xs, ys } = pts([
      [5, 0],
      [1, 0],
    ]);
    const idx = new Int32Array(2);
    expect(nearestK(xs, ys, 1, 0, 0, Infinity, idx, new Float64Array(2))).toBe(1);
    expect(idx[0]).toBe(0);
  });
});
