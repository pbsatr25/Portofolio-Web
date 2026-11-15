"use client";

import { useEffect, useRef, useState } from "react";
import { game as copy } from "@/content/ask";
import { ArrowIcon } from "@/components/ui/icons";
import { siteUrl } from "@/content/profile";
import {
  BASE_HP,
  BIT_LIFE,
  BOSS_HP,
  KIND,
  MAX_AMMO,
  POP_LIFE,
  WAVES,
  baseX,
  createGame,
  fire,
  groundY,
  resize,
  start,
  togglePause,
  update,
  type Game,
  type Phase,
} from "@/lib/game/engine";

// Prompt Defender (PRD §Prompt Defender; look and waves from art/design/game.mp4). Loaded only when Play is
// pressed. Logic lives in src/lib/game/engine.ts; this file draws it and wires input. HUD, banners and end
// screen are real DOM so they read out and work from the keyboard; the canvas is the playfield only.
const BOSS = ["..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "..X..X..", ".X.XX.X."];
const GRID = 32;
const BEST_KEY = "pbs-prompt-defender-best";

type Result = { score: number; wave: number; grounded: number; chain: number; best: number };

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export default function PromptDefenderGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const ammoRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [banner, setBanner] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const c = (name: string) => css.getPropertyValue(name).trim();
    const col = {
      bg: c("--color-dark"),
      line: c("--color-dark-line"),
      ink: c("--color-on-dark"),
      muted: c("--color-on-dark-muted"),
      accent: c("--color-accent-on-dark"),
    };
    const pixelFont = getComputedStyle(document.querySelector(".font-pixel") ?? document.body).fontFamily;

    let w = 0,
      h = 0;
    const fit = () => {
      // layout size, not getBoundingClientRect: the popup opens with a scale() animation
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textAlign = "center";
      if (gameRef.current) resize(gameRef.current, w, h);
      else gameRef.current = createGame(w, h);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const aim = { x: 0, y: 0, on: false };
    const g = gameRef.current!;
    let last = performance.now(),
      raf = 0,
      shownWave = -1,
      shownScore = -1,
      shownAmmo = -1,
      shownBanner = "";
    let shownPhase: Phase = g.phase;

    const square = (x: number, y: number, s: number) => ctx.fillRect(x - s / 2, y - s / 2, s, s);
    const cross = (x: number, y: number, r: number, plus: boolean) => {
      ctx.beginPath();
      if (plus) {
        ctx.moveTo(x - r, y);
        ctx.lineTo(x + r, y);
        ctx.moveTo(x, y - r);
        ctx.lineTo(x, y + r);
      } else {
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.moveTo(x + r, y - r);
        ctx.lineTo(x - r, y + r);
      }
      ctx.stroke();
    };

    const draw = () => {
      const ground = groundY(g);
      ctx.fillStyle = col.bg;
      ctx.fillRect(0, 0, w, h);

      // grid + ground line
      ctx.strokeStyle = col.line;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = GRID; x < w; x += GRID) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, ground);
      }
      for (let y = GRID; y < ground; y += GRID) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col.line;
      ctx.fillRect(0, ground, w, 2);

      // documents (3 × 2 blocks) with their labels; a knocked-out one becomes a slab and its label dims
      ctx.font = `10px ${pixelFont}`;
      g.docs.forEach((d, i) => {
        ctx.fillStyle = d.alive ? col.ink : col.line;
        if (d.alive)
          for (let k = 0; k < 6; k++) ctx.fillRect(d.x - 16 + (k % 3) * 11, ground - 22 + Math.floor(k / 3) * 11, 9, 9);
        else ctx.fillRect(d.x - 16, ground - 6, 32, 6);
        ctx.fillStyle = d.alive ? col.muted : col.line;
        ctx.fillText(copy.docs[i].toUpperCase(), d.x, ground + 22);
      });

      // the LLM + its remaining hits
      const bx = baseX(g);
      ctx.fillStyle = col.accent;
      ctx.fillRect(bx - 30, ground - 32, 60, 32);
      ctx.fillStyle = col.bg;
      ctx.fillText(copy.base, bx, ground - 12);
      for (let i = 0; i < BASE_HP; i++) {
        ctx.fillStyle = i < g.baseHp ? col.accent : col.line;
        ctx.fillRect(bx - 14 + i * 10, ground + 12, 8, 8);
      }

      // enemies: trail + head, styled by kind
      for (const e of g.enemies) {
        if (!e.on) continue;
        const thin = e.kind === KIND.jailbreak;
        ctx.strokeStyle = col.accent;
        ctx.lineWidth = thin ? 1 : 1.5;
        ctx.globalAlpha = thin ? 0.6 : 0.85;
        ctx.beginPath();
        ctx.moveTo(e.x0, e.y0);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (e.kind === KIND.confabulation) {
          ctx.fillStyle = col.ink;
          square(e.x, e.y, 10);
          ctx.fillStyle = col.accent;
          square(e.x, e.y, 4);
        } else {
          ctx.fillStyle = col.accent;
          square(e.x, e.y, thin ? 3 : 6);
        }
      }

      // relevant chunks: white tile with two lines
      for (const ch of g.chunks) {
        if (!ch.on) continue;
        ctx.fillStyle = col.ink;
        square(ch.x, ch.y, 16);
        ctx.fillStyle = col.bg;
        ctx.fillRect(ch.x - 4, ch.y - 3, 8, 2);
        ctx.fillRect(ch.x - 4, ch.y + 1, 5, 2);
      }

      // citations in flight + their target mark
      ctx.strokeStyle = col.ink;
      ctx.lineWidth = 1.5;
      for (const s of g.shots) {
        if (!s.on) continue;
        ctx.beginPath();
        ctx.moveTo(bx, ground - 32);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.strokeStyle = col.muted;
        cross(s.tx, s.ty, 6, false);
        ctx.strokeStyle = col.ink;
      }

      // blasts: a citation burst is a white ring, each link of a chain takes the accent
      for (const b of g.blasts) {
        if (!b.on || b.r <= 0) continue;
        const tone = b.depth > 1 ? col.accent : col.ink;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = tone;
        ctx.globalAlpha = 0.18;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = tone;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // debris
      for (const b of g.bits) {
        if (!b.on) continue;
        ctx.globalAlpha = 1 - b.t / BIT_LIFE;
        ctx.fillStyle = b.accent ? col.accent : col.ink;
        square(b.x, b.y, 3);
      }
      ctx.globalAlpha = 1;

      // The Hallucinator: flashes white when hit, health bar and name below
      const boss = g.boss;
      if (boss.on) {
        const cell = 11,
          ox = boss.x - (BOSS[0].length * cell) / 2,
          oy = boss.y - (BOSS.length * cell) / 2;
        ctx.fillStyle = boss.flash > 0 ? col.ink : col.accent;
        BOSS.forEach((row, y) => {
          for (let x = 0; x < row.length; x++)
            if (row[x] === "X") ctx.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1);
        });
        const barY = oy + BOSS.length * cell + 8;
        ctx.fillStyle = col.line;
        ctx.fillRect(boss.x - 44, barY, 88, 4);
        ctx.fillStyle = col.accent;
        ctx.fillRect(boss.x - 44, barY, (88 * boss.hp) / BOSS_HP, 4);
        ctx.fillStyle = col.ink;
        ctx.fillText(copy.boss.toUpperCase(), boss.x, barY + 20);
      }

      // floating score / reload text
      ctx.font = `11px ${pixelFont}`;
      for (const p of g.pops) {
        if (!p.on) continue;
        ctx.globalAlpha = 1 - p.t / POP_LIFE;
        ctx.fillStyle = p.accent ? col.accent : col.ink;
        ctx.fillText(p.text.toUpperCase(), p.x, p.y - p.t * 26);
      }
      ctx.globalAlpha = 1;

      // crosshair under the pointer / keyboard aim
      if (aim.on && g.phase === "playing") {
        ctx.strokeStyle = col.ink;
        ctx.lineWidth = 1.5;
        cross(aim.x, aim.y, 10, true);
      }
    };

    // HUD and banner are DOM: only touch them when a value changes.
    const syncHud = () => {
      if (g.wave !== shownWave && waveRef.current) waveRef.current.textContent = String((shownWave = g.wave) || 1);
      if (g.score !== shownScore && scoreRef.current) scoreRef.current.textContent = String((shownScore = g.score));
      if (g.ammo !== shownAmmo && ammoRef.current) {
        shownAmmo = g.ammo;
        const cells = ammoRef.current.children;
        for (let i = 0; i < cells.length; i++) cells[i].classList.toggle("opacity-20", i >= g.ammo);
        ammoRef.current.setAttribute("aria-label", `${g.ammo} of ${MAX_AMMO} citations`);
      }
      const nextBanner = g.phase === "playing" && g.intro > 0 ? copy.waves[g.wave] : "";
      if (nextBanner !== shownBanner) setBanner((shownBanner = nextBanner));
      if (g.phase !== shownPhase) {
        shownPhase = g.phase;
        if (g.phase === "over" || g.phase === "won") {
          const best = Math.max(readBest(), g.score);
          try {
            localStorage.setItem(BEST_KEY, String(best));
          } catch {
            // private mode: the best score just isn't remembered
          }
          setResult({ score: g.score, wave: g.wave, grounded: g.grounded, chain: g.bestChain, best });
        }
        setPhase(g.phase);
      }
    };

    const loop = (now: number) => {
      update(g, Math.min(0.05, (now - last) / 1000));
      last = now;
      draw();
      syncHud();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect(); // visual box; rescale in case a transform is still running
      aim.x = ((e.clientX - r.left) * w) / r.width;
      aim.y = ((e.clientY - r.top) * h) / r.height;
      aim.on = true;
    };
    const onDown = (e: PointerEvent) => {
      local(e);
      fire(g, aim.x, aim.y);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        togglePause(g);
        return;
      }
      if (e.target !== canvas) return;
      // keyboard play: arrows move the crosshair, Enter fires
      const step = e.shiftKey ? 48 : 16;
      if (!aim.on) Object.assign(aim, { x: w / 2, y: h / 2, on: true });
      if (e.key === "ArrowLeft") aim.x = Math.max(0, aim.x - step);
      else if (e.key === "ArrowRight") aim.x = Math.min(w, aim.x + step);
      else if (e.key === "ArrowUp") aim.y = Math.max(0, aim.y - step);
      else if (e.key === "ArrowDown") aim.y = Math.min(groundY(g) - 24, aim.y + step);
      else if (e.key === "Enter") fire(g, aim.x, aim.y);
      else return;
      e.preventDefault();
    };
    const onVisibility = () => {
      if (document.hidden && g.phase === "playing") togglePause(g);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", local);
    addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", local);
      removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const begin = () => {
    const g = gameRef.current;
    if (!g) return;
    start(g);
    setResult(null);
    setCopied(false);
    setPhase(g.phase);
    canvasRef.current?.focus();
  };
  const pause = () => {
    const g = gameRef.current;
    if (g) togglePause(g);
  };
  const share = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(copy.share(result.score, siteUrl));
      setCopied(true);
    } catch {
      setCopied(false); // clipboard blocked; nothing else to do
    }
  };

  const hudBtn =
    "flex size-11 items-center justify-center border border-dark-line font-pixel text-pixel hover:border-on-dark-muted";
  const ended = phase === "over" || phase === "won";

  return (
    <div className="relative size-full bg-dark text-on-dark">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label="Prompt Defender playfield. Click or tap to fire a citation; with the keyboard, arrows aim and Enter fires."
        className="absolute inset-0 size-full touch-none outline-none focus-visible:outline-2 focus-visible:outline-accent"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-dark px-4 py-2.5 font-pixel text-pixel md:gap-4 md:px-6">
        <p className="flex flex-col">
          <span className="text-on-dark-muted">wave</span>
          <span>
            <span ref={waveRef}>1</span>
            <span className="sr-only"> of {WAVES}</span>
          </span>
        </p>
        <p className="flex flex-col items-center gap-1">
          <span className="text-on-dark-muted">citations</span>
          {/* 18 cells: 13 on the first row, 5 centred under them */}
          <span
            ref={ammoRef}
            role="img"
            aria-label={`${MAX_AMMO} citations`}
            className="flex w-[76px] flex-wrap justify-center gap-0.5 md:w-[114px] md:gap-[3px]"
          >
            {Array.from({ length: MAX_AMMO }, (_, i) => (
              <span key={i} className="h-3 w-1 bg-on-dark md:w-1.5" />
            ))}
          </span>
        </p>
        <div className="pointer-events-auto flex items-start gap-2 md:gap-3">
          <p className="flex flex-col items-end md:mr-2">
            <span className="text-on-dark-muted">score</span>
            <span ref={scoreRef}>0</span>
          </p>
          <button type="button" onClick={pause} className={hudBtn} aria-label={phase === "paused" ? "Resume" : "Pause"}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="fill-current">
              {phase === "paused" ? <path d="M2 1l9 5-9 5z" /> : <path d="M2 1h3v10H2zM7 1h3v10H7z" />}
            </svg>
          </button>
          <button type="button" onClick={onClose} className={hudBtn} aria-label="Close game">
            ×
          </button>
        </div>
      </div>

      {banner && (
        <p className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-6">
          <span className="bg-on-dark px-4 py-2 text-body text-ink">{banner}</span>
        </p>
      )}

      {(phase === "ready" || phase === "paused") && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/80 p-6">
          <div className="flex max-w-sm flex-col gap-4">
            <p className="font-pixel text-pixel text-on-dark-muted">{copy.eyebrow}</p>
            <h2 className="text-heading font-medium">{phase === "paused" ? "Paused" : copy.title}</h2>
            {phase === "ready" && (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-small text-on-dark-muted">
                {copy.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap gap-4">
              <button
                type="button"
                autoFocus
                onClick={phase === "paused" ? pause : begin}
                className="inline-flex min-h-11 items-center bg-accent px-6 py-3 text-button font-medium text-on-accent"
              >
                {phase === "paused" ? "Resume" : "Start"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center border-b border-current px-1 text-button font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {ended && result && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end overflow-y-auto bg-dark p-6 md:items-center md:justify-center">
          <div className="flex w-full max-w-md flex-col gap-5">
            <p className="font-pixel text-pixel text-on-dark-muted">{copy.eyebrow}</p>
            <div>
              <p className="font-pixel text-pixel text-on-dark-muted">score</p>
              <p className="font-pixel text-pixel-xl">{result.score}</p>
            </div>
            <dl className="grid grid-cols-2 border border-dark-line bg-dark-raised">
              {[
                [result.wave, copy.stats.wave],
                [result.grounded, copy.stats.grounded],
                [`×${result.chain}`, copy.stats.chain],
                [result.best, copy.stats.best],
              ].map(([value, label], i) => (
                <div
                  key={String(label)}
                  className={`flex flex-col-reverse gap-1 p-4 ${i % 2 ? "border-l border-dark-line" : ""} ${i > 1 ? "border-t border-dark-line" : ""}`}
                >
                  <dt className="text-small text-on-dark-muted">{label}</dt>
                  <dd className="font-pixel text-pixel-lg">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-lead">{phase === "won" ? copy.won : copy.over}</p>
            <button
              type="button"
              autoFocus
              onClick={begin}
              className="flex min-h-12 items-center justify-between bg-on-dark px-5 text-button font-medium text-ink"
            >
              {copy.again}
              <span aria-hidden>↻</span>
            </button>
            <button
              type="button"
              onClick={share}
              className="flex min-h-12 items-center justify-between border border-on-dark px-5 text-button font-medium"
            >
              {copied ? copy.copied : copy.copy}
              <ArrowIcon />
            </button>
            <button type="button" onClick={onClose} className="self-start text-small text-on-dark-muted underline">
              Close
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {banner}
        {phase === "paused" && "Paused"}
        {ended && result && `${phase === "won" ? copy.won : copy.over} Score ${result.score}.`}
      </p>
    </div>
  );
}
