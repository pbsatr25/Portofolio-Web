"use client";

import { useEffect } from "react";
import { nearestK } from "@/lib/constellation";

// Background "embedding constellation" (PRD §Background; look from art/design/constellation.mp4). One fixed canvas
// between the section grounds and the content (z-1; content wrappers are z-2). Points drift like embedding
// vectors; a query point Q trails the cursor and links to its top-5 neighbours; a click sends a ring.
// Every mark takes its colour from the ground directly under it, so it keeps contrast across section edges.
const K = 5;
const LINK = 240; // px, max Q-to-neighbour distance
const AMBIENT_LINK = 90; // px, faint links between nearby ambient points
const WAVE_SPEED = 700; // px/s
const WAVE_LIFE = 1.4; // s
const PARALLAX = 0.12;

type Ground = "light" | "dark" | "accent";
const GROUNDS: Ground[] = ["light", "dark", "accent"];
// Per ground: ambient dot, neighbour + line, query point (CSS token names).
const palette: Record<Ground, { dot: string; hit: string; line: string; q: string }> = {
  light: { dot: "--color-ink-muted", hit: "--color-ink", line: "--color-accent", q: "--color-accent" },
  dark: {
    dot: "--color-on-dark-muted",
    hit: "--color-accent-on-dark",
    line: "--color-accent-on-dark",
    q: "--color-accent-on-dark",
  },
  accent: { dot: "--color-ink", hit: "--color-on-dark", line: "--color-ink", q: "--color-ink" },
};

export function Constellation() {
  useEffect(() => {
    const html = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Off for Save-Data and bots (motion gate off without reduced motion); static dots for reduced motion.
    if (!html.classList.contains("motion") && !reduced) return;

    // Sticky (superposed) sections are stacking contexts, so one page-level canvas can't sit between a
    // section's ground and its text. The canvas lives inside the section in front instead (fixed, z-1 under
    // the z-2 content) and moves when that changes. Created here, not in JSX, so React never owns its parent.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "pointer-events-none fixed inset-0 z-1 size-full";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(html);
    const color = Object.fromEntries(
      GROUNDS.map((g) => {
        const p = palette[g];
        const v = (name: string) => css.getPropertyValue(name).trim();
        return [g, { dot: v(p.dot), hit: v(p.hit), line: v(p.line), q: v(p.q) }];
      }),
    ) as Record<Ground, { dot: string; hit: string; line: string; q: string }>;
    const pixelFont = getComputedStyle(document.querySelector(".font-pixel") ?? html).fontFamily;

    // Section grounds, read once per frame into preallocated arrays (no allocation in the loop).
    const sections = [...document.querySelectorAll<HTMLElement>("[data-ground]")];
    const kinds = sections.map((s) => GROUNDS.indexOf((s.dataset.ground as Ground) ?? "light"));
    const tops = new Float32Array(sections.length),
      bottoms = new Float32Array(sections.length);
    const readGrounds = () => {
      for (let s = 0; s < sections.length; s++) {
        const r = sections[s].getBoundingClientRect();
        tops[s] = r.top;
        bottoms[s] = r.bottom;
      }
    };
    // Later sections are stacked on top, so search from the last one.
    const sectionAt = (y: number) => {
      for (let s = sections.length - 1; s >= 0; s--) if (y >= tops[s] && y < bottoms[s]) return s;
      return -1;
    };
    const groundAt = (y: number) => {
      const s = sectionAt(y);
      return s < 0 ? 1 : kinds[s]; // footer and anything below the sections is dark
    };
    let host = -1;
    const placeCanvas = () => {
      const front = Math.max(0, sectionAt(innerHeight / 2));
      if (front !== host && sections[front]) sections[(host = front)].prepend(canvas);
    };

    const mobile = matchMedia("(max-width: 767px)").matches;
    const n = mobile ? 45 : 90;
    const xs = new Float32Array(n),
      ys = new Float32Array(n); // drawn positions (viewport px)
    const bx = new Float32Array(n),
      by = new Float32Array(n); // home positions (0..1 of the field)
    const vx = new Float32Array(n),
      vy = new Float32Array(n); // drift
    const ox = new Float32Array(n),
      oy = new Float32Array(n); // wave offset
    const size = new Float32Array(n);
    const ground = new Uint8Array(n);
    const hit = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      bx[i] = Math.random();
      by[i] = Math.random();
      vx[i] = (Math.random() - 0.5) * 0.006;
      vy[i] = (Math.random() - 0.5) * 0.006;
      size[i] = Math.random() < 0.2 ? 4 : 3;
    }
    const idx = new Int32Array(K),
      d2 = new Float64Array(K);

    let w = 0,
      h = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `10px ${pixelFont}`; // resizing the canvas resets context state
    };
    resize();

    const pointer = { x: -1e4, y: -1e4, active: false };
    const q = { x: -1e4, y: -1e4 }; // query point trails the pointer
    const wave = { x: 0, y: 0, t: WAVE_LIFE };

    const draw = (dt: number) => {
      readGrounds();
      placeCanvas();
      const shift = (scrollY * PARALLAX) % h;
      wave.t += dt;
      const front = wave.t * WAVE_SPEED;
      const waveOn = wave.t < WAVE_LIFE;

      // positions
      for (let i = 0; i < n; i++) {
        bx[i] = (bx[i] + vx[i] * dt + 1) % 1;
        by[i] = (by[i] + vy[i] * dt + 1) % 1;
        const x = bx[i] * w,
          y = (((by[i] * h - shift) % h) + h) % h;
        if (waveOn) {
          const dx = x - wave.x,
            dy = y - wave.y,
            dist = Math.hypot(dx, dy) || 1;
          const band = 1 - Math.min(1, Math.abs(dist - front) / 80);
          if (band > 0) {
            const push = band * 28 * (1 - wave.t / WAVE_LIFE);
            ox[i] = (dx / dist) * push;
            oy[i] = (dy / dist) * push;
          }
        }
        ox[i] *= 0.92;
        oy[i] *= 0.92;
        xs[i] = x + ox[i];
        ys[i] = y + oy[i];
        ground[i] = groundAt(ys[i]);
        hit[i] = 0;
      }

      ctx.clearRect(0, 0, w, h);

      // query point + top-k
      const showQ = pointer.active && !reduced;
      let found = 0,
        qg: Ground = "light";
      if (showQ) {
        const a = Math.min(1, dt * 8);
        q.x += (pointer.x - q.x) * a;
        q.y += (pointer.y - q.y) * a;
        found = nearestK(xs, ys, n, q.x, q.y, LINK * LINK, idx, d2);
        for (let j = 0; j < found; j++) hit[idx[j]] = 1;
        qg = GROUNDS[groundAt(q.y)];
      }

      // faint ambient links, then ambient dots, one pass per ground so fillStyle is set 3× per frame
      ctx.lineWidth = 1;
      for (let g = 0; g < 3; g++) {
        const c = color[GROUNDS[g]];
        ctx.strokeStyle = c.dot;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if (ground[i] !== g) continue;
          for (let j = i + 1; j < n; j++) {
            const dx = xs[i] - xs[j],
              dy = ys[i] - ys[j];
            if (dx * dx + dy * dy < AMBIENT_LINK * AMBIENT_LINK) {
              ctx.moveTo(xs[i], ys[i]);
              ctx.lineTo(xs[j], ys[j]);
            }
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = c.dot;
        for (let i = 0; i < n; i++)
          if (ground[i] === g && !hit[i]) ctx.fillRect(xs[i] - size[i] / 2, ys[i] - size[i] / 2, size[i], size[i]);
      }
      ctx.globalAlpha = 1;

      // click ring
      if (waveOn) {
        ctx.strokeStyle = color[GROUNDS[groundAt(wave.y)]].line;
        ctx.globalAlpha = 0.5 * (1 - wave.t / WAVE_LIFE);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, front, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (!showQ) return;
      const c = color[qg];
      ctx.strokeStyle = c.line;
      ctx.lineWidth = 1.5;
      for (let j = 0; j < found; j++) {
        ctx.globalAlpha = 0.35 + 0.6 * (1 - Math.sqrt(d2[j]) / LINK);
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(xs[idx[j]], ys[idx[j]]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (let j = 0; j < found; j++) {
        const i = idx[j];
        ctx.fillStyle = color[GROUNDS[ground[i]]].hit;
        ctx.fillRect(xs[i] - 4, ys[i] - 4, 8, 8);
      }
      ctx.fillStyle = c.q;
      ctx.fillRect(q.x - 6, q.y - 6, 12, 12);
      ctx.fillText("Q · TOP-5", q.x + 14, q.y - 8);
    };

    if (reduced) {
      // Static dots, no interaction, redrawn only on resize.
      const still = () => {
        resize();
        draw(1);
      };
      still();
      addEventListener("resize", still);
      return () => {
        removeEventListener("resize", still);
        canvas.remove();
      };
    }

    let raf = 0,
      last = performance.now();
    const loop = (now: number) => {
      draw(Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    const onMove = (e: PointerEvent) => {
      if (!pointer.active) {
        q.x = e.clientX;
        q.y = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    const onDown = (e: PointerEvent) => {
      onMove(e);
      wave.x = e.clientX;
      wave.y = e.clientY;
      wave.t = 0;
    };

    addEventListener("resize", resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      canvas.remove();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
