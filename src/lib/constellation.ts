// Pure helpers for the background constellation (no DOM, no allocations in the hot path).

/**
 * Writes the indices of the k points nearest to (px, py) and within maxD2 into outIdx (closest first).
 * Returns how many were found. Same idea as top-k retrieval in RAG, which is what the lines illustrate.
 */
export function nearestK(
  xs: Float32Array,
  ys: Float32Array,
  count: number,
  px: number,
  py: number,
  maxD2: number,
  outIdx: Int32Array,
  outD2: Float64Array,
): number {
  const k = outIdx.length;
  let found = 0;
  for (let i = 0; i < count; i++) {
    const dx = xs[i] - px;
    const dy = ys[i] - py;
    const d2 = dx * dx + dy * dy;
    if (d2 > maxD2 || (found === k && d2 >= outD2[k - 1])) continue;
    // insertion into the sorted top-k window
    let j = found < k ? found++ : k - 1;
    while (j > 0 && outD2[j - 1] > d2) {
      outD2[j] = outD2[j - 1];
      outIdx[j] = outIdx[j - 1];
      j--;
    }
    outD2[j] = d2;
    outIdx[j] = i;
  }
  return found;
}
