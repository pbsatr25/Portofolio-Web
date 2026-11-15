// Prompt Defender: pure game logic (no DOM). A small Missile Command about grounding (look and waves from
// art/design/game.mp4): hallucinations fall toward the documents and the LLM; citations fired from the LLM burst
// into blasts; blasts chain through hallucinations; relevant chunks caught in a blast reload citations.
//   wave 1  hallucinations
//   wave 2  + confabulations, which split mid-air
//   wave 3  + jailbreaks, thin and fast
//   wave 4  The Hallucinator (boss) fires volleys
// Entities live in fixed pools allocated once; the frame loop only flips and mutates them.

export type Phase = "ready" | "playing" | "paused" | "waveclear" | "over" | "won";
export const KIND = { hallucination: 0, confabulation: 1, jailbreak: 2 } as const;

type Shot = { on: boolean; x: number; y: number; tx: number; ty: number; vx: number; vy: number };
type Enemy = {
  on: boolean;
  kind: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  doc: number;
  splitY: number;
};
type Blast = { on: boolean; x: number; y: number; r: number; t: number; depth: number; hitBoss: boolean };
type Chunk = { on: boolean; x: number; y: number };
type Doc = { x: number; alive: boolean };
type Pop = { on: boolean; x: number; y: number; t: number; text: string; accent: boolean };
type Bit = { on: boolean; x: number; y: number; vx: number; vy: number; t: number; accent: boolean };

export const WAVES = 4;
export const MAX_AMMO = 18;
export const BASE_HP = 3;
export const BOSS_HP = 16;
export const BLAST_RADIUS = 46;
export const BLAST_LIFE = 0.9; // s, grows then shrinks
export const POP_LIFE = 0.9;
export const BIT_LIFE = 0.6;
export const INTRO_TIME = 2.2; // s the wave banner stays up; no spawns meanwhile
const SHOT_SPEED = 900;
const CHUNK_AMMO = 3;
const SPAWNS = [0, 8, 12, 16, 10]; // per wave (wave 4 adds the boss volleys)

export type Game = ReturnType<typeof createGame>;

export function createGame(w: number, h: number, rand: () => number = Math.random) {
  const pool = <T>(n: number, make: () => T) => Array.from({ length: n }, make);
  return {
    w,
    h,
    rand,
    phase: "ready" as Phase,
    wave: 0,
    score: 0,
    ammo: 0,
    baseHp: BASE_HP,
    grounded: 0, // hallucinations destroyed
    bestChain: 0, // deepest blast chain that destroyed something
    intro: 0, // seconds left on the wave banner
    banner: 0, // seconds left between waves
    spawnLeft: 0,
    spawnTimer: 0,
    chunkTimer: 0,
    docs: pool<Doc>(4, () => ({ x: 0, alive: true })),
    shots: pool<Shot>(24, () => ({ on: false, x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 })),
    enemies: pool<Enemy>(96, () => ({
      on: false,
      kind: 0,
      x0: 0,
      y0: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      doc: -1,
      splitY: 0,
    })),
    blasts: pool<Blast>(64, () => ({ on: false, x: 0, y: 0, r: 0, t: 0, depth: 1, hitBoss: false })),
    chunks: pool<Chunk>(10, () => ({ on: false, x: 0, y: 0 })),
    pops: pool<Pop>(24, () => ({ on: false, x: 0, y: 0, t: 0, text: "", accent: false })),
    bits: pool<Bit>(128, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, accent: false })),
    boss: { on: false, x: 0, y: 0, hp: 0, dir: 1, fireTimer: 0, flash: 0 },
  };
}

export const groundY = (g: Game) => g.h - 70;
export const baseX = (g: Game) => g.w / 2;

const placeDocs = (g: Game) => [0.12, 0.31, 0.69, 0.88].forEach((s, i) => (g.docs[i].x = s * g.w));

export function start(g: Game) {
  Object.assign(g, { wave: 1, score: 0, ammo: 12, baseHp: BASE_HP, grounded: 0, bestChain: 0 });
  placeDocs(g);
  for (const d of g.docs) d.alive = true;
  for (const list of [g.shots, g.enemies, g.blasts, g.chunks, g.pops, g.bits]) for (const e of list) e.on = false;
  setupWave(g);
  g.phase = "playing";
}

function setupWave(g: Game) {
  g.spawnLeft = SPAWNS[g.wave] ?? 10;
  g.intro = INTRO_TIME;
  g.spawnTimer = 0;
  g.chunkTimer = 3;
  Object.assign(g.boss, { on: g.wave === WAVES, hp: BOSS_HP, x: g.w / 2, y: 110, dir: 1, fireTimer: 1, flash: 0 });
}

/** Rescale everything when the canvas changes size mid-game. */
export function resize(g: Game, w: number, h: number) {
  const sx = w / g.w,
    sy = h / g.h;
  g.w = w;
  g.h = h;
  placeDocs(g);
  for (const s of g.shots) {
    s.x *= sx;
    s.tx *= sx;
    s.vx *= sx;
    s.y *= sy;
    s.ty *= sy;
    s.vy *= sy;
  }
  for (const e of g.enemies) {
    e.x0 *= sx;
    e.x *= sx;
    e.vx *= sx;
    e.y0 *= sy;
    e.y *= sy;
    e.vy *= sy;
    e.splitY *= sy;
  }
  for (const list of [g.blasts, g.chunks, g.pops, g.bits])
    for (const e of list) {
      e.x *= sx;
      e.y *= sy;
    }
  g.boss.x *= sx;
}

/** Fire a citation at (x, y). Returns false when it can't (no ammo, not playing, aiming into the ground). */
export function fire(g: Game, x: number, y: number) {
  if (g.phase !== "playing" || g.ammo <= 0 || y > groundY(g) - 20) return false;
  const s = g.shots.find((e) => !e.on);
  if (!s) return false;
  const sx = baseX(g),
    sy = groundY(g) - 30;
  const d = Math.hypot(x - sx, y - sy) || 1;
  Object.assign(s, {
    on: true,
    x: sx,
    y: sy,
    tx: x,
    ty: y,
    vx: ((x - sx) / d) * SHOT_SPEED,
    vy: ((y - sy) / d) * SHOT_SPEED,
  });
  g.ammo--;
  return true;
}

export function togglePause(g: Game) {
  if (g.phase === "playing") g.phase = "paused";
  else if (g.phase === "paused") g.phase = "playing";
}

export function addBlast(g: Game, x: number, y: number, depth: number) {
  const b = g.blasts.find((e) => !e.on);
  if (b) Object.assign(b, { on: true, x, y, r: 0, t: 0, depth, hitBoss: false });
}

function pop(g: Game, x: number, y: number, text: string, accent = false) {
  const p = g.pops.find((e) => !e.on);
  if (p) Object.assign(p, { on: true, x, y, t: 0, text, accent });
}

function burst(g: Game, x: number, y: number, n: number, accent: boolean) {
  for (const b of g.bits) {
    if (b.on) continue;
    const a = g.rand() * Math.PI * 2,
      v = 40 + g.rand() * 120;
    Object.assign(b, { on: true, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, accent });
    if (--n <= 0) return;
  }
}

/** Launch an enemy of `kind` from (x0, y0) toward a standing document, or the LLM once they are gone. */
export function spawnEnemy(g: Game, x0: number, y0: number, kind: number = KIND.hallucination) {
  const e = g.enemies.find((h) => !h.on);
  if (!e) return;
  let doc = -1;
  if (g.rand() < 0.75) {
    const pick = Math.floor(g.rand() * g.docs.length);
    for (let i = 0; i < g.docs.length; i++)
      if (g.docs[(pick + i) % g.docs.length].alive) {
        doc = (pick + i) % g.docs.length;
        break;
      }
  }
  const tx = doc >= 0 ? g.docs[doc].x : baseX(g),
    ty = groundY(g);
  let speed = 38 + 14 * g.wave + g.rand() * 18;
  if (kind === KIND.jailbreak) speed *= 1.9;
  const d = Math.hypot(tx - x0, ty - y0) || 1;
  const splitY = kind === KIND.confabulation ? ty * (0.3 + g.rand() * 0.25) : 0;
  Object.assign(e, {
    on: true,
    kind,
    x0,
    y0,
    x: x0,
    y: y0,
    vx: ((tx - x0) / d) * speed,
    vy: ((ty - y0) / d) * speed,
    doc,
    splitY,
  });
}

/** What drops this wave: confabulations from wave 2, jailbreaks from wave 3. */
function rollKind(g: Game) {
  const r = g.rand();
  if (g.wave >= 3 && r < 0.3) return KIND.jailbreak;
  if (g.wave >= 2 && r < (g.wave >= 3 ? 0.5 : 0.35)) return KIND.confabulation;
  return KIND.hallucination;
}

export function update(g: Game, dt: number) {
  if (g.phase === "waveclear") {
    if ((g.banner -= dt) <= 0) {
      g.wave++;
      setupWave(g);
      g.phase = "playing";
    }
    return;
  }
  if (g.phase !== "playing") return;
  const ground = groundY(g);
  if (g.intro > 0) g.intro -= dt;

  // spawning (held while the wave banner is up)
  if (g.intro <= 0 && g.spawnLeft > 0 && (g.spawnTimer -= dt) <= 0) {
    spawnEnemy(g, 20 + g.rand() * (g.w - 40), 0, rollKind(g));
    g.spawnLeft--;
    g.spawnTimer = (0.6 + g.rand() * 0.8) * (1.2 - g.wave * 0.15);
  }
  if ((g.chunkTimer -= dt) <= 0) {
    const c = g.chunks.find((e) => !e.on);
    if (c) Object.assign(c, { on: true, x: 30 + g.rand() * (g.w - 60), y: 0 });
    g.chunkTimer = (g.boss.on ? 2.2 : 3.5) + g.rand() * 2;
  }

  // The Hallucinator drifts across the top and fires volleys that grow as it weakens
  const boss = g.boss;
  if (boss.on && g.intro <= 0) {
    boss.x += boss.dir * 60 * dt;
    if (boss.x < 70 || boss.x > g.w - 70) boss.dir *= -1;
    boss.flash = Math.max(0, boss.flash - dt);
    if ((boss.fireTimer -= dt) <= 0) {
      const volley = boss.hp > BOSS_HP / 2 ? 3 : 5;
      for (let i = 0; i < volley; i++) spawnEnemy(g, boss.x + (i - (volley - 1) / 2) * 10, boss.y + 30, rollKind(g));
      boss.fireTimer = 2.4;
    }
  }

  // citations travel to their target, then burst
  for (const s of g.shots) {
    if (!s.on) continue;
    const step = Math.hypot(s.vx, s.vy) * dt;
    if (Math.hypot(s.tx - s.x, s.ty - s.y) <= step) {
      s.on = false;
      addBlast(g, s.tx, s.ty, 1);
    } else {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
  }

  // blasts grow and shrink; anything inside is resolved
  for (const b of g.blasts) {
    if (!b.on) continue;
    b.t += dt;
    if (b.t >= BLAST_LIFE) {
      b.on = false;
      continue;
    }
    b.r = BLAST_RADIUS * Math.sin((Math.PI * b.t) / BLAST_LIFE);
    const r2 = b.r * b.r;
    for (const e of g.enemies) {
      if (!e.on || (e.x - b.x) ** 2 + (e.y - b.y) ** 2 > r2) continue;
      e.on = false;
      g.grounded++;
      g.bestChain = Math.max(g.bestChain, b.depth);
      const points = 25 * b.depth * (e.kind === KIND.hallucination ? 1 : 2); // chains and tricky kinds pay more
      g.score += points;
      pop(g, e.x, e.y - 14, `+${points}`);
      burst(g, e.x, e.y, 6, true);
      addBlast(g, e.x, e.y, b.depth + 1);
    }
    for (const c of g.chunks) {
      if (!c.on || (c.x - b.x) ** 2 + (c.y - b.y) ** 2 > r2) continue;
      c.on = false;
      g.ammo = Math.min(MAX_AMMO, g.ammo + CHUNK_AMMO);
      g.score += 10;
      pop(g, c.x, c.y - 18, `+${CHUNK_AMMO} citations`);
      burst(g, c.x, c.y, 4, false);
    }
    if (boss.on && !b.hitBoss && (boss.x - b.x) ** 2 + (boss.y - b.y) ** 2 <= (b.r + 34) ** 2) {
      b.hitBoss = true;
      boss.flash = 0.15;
      g.score += 25;
      burst(g, boss.x, boss.y, 5, true);
      if (--boss.hp <= 0) {
        boss.on = false;
        g.score += 500;
        pop(g, boss.x, boss.y - 30, "+500", true);
        burst(g, boss.x, boss.y, 30, true);
        addBlast(g, boss.x, boss.y, b.depth + 1);
      }
    }
  }

  // enemies fall; confabulations split mid-air; a landed one knocks out its document (or an LLM hit)
  for (const e of g.enemies) {
    if (!e.on) continue;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    if (e.kind === KIND.confabulation && e.y >= e.splitY) {
      e.on = false;
      for (let i = 0; i < 3; i++) spawnEnemy(g, e.x, e.y, KIND.hallucination);
      burst(g, e.x, e.y, 4, false);
      continue;
    }
    if (e.y < ground) continue;
    e.on = false;
    burst(g, e.x, ground, 8, true);
    if (e.doc >= 0) g.docs[e.doc].alive = false;
    else g.baseHp--;
  }
  for (const c of g.chunks) if (c.on && (c.y += 55 * dt) > ground) c.on = false;
  for (const p of g.pops) if (p.on && (p.t += dt) > POP_LIFE) p.on = false;
  for (const b of g.bits) {
    if (!b.on) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += 240 * dt;
    if ((b.t += dt) > BIT_LIFE) b.on = false;
  }

  // end of game / end of wave
  if (g.baseHp <= 0 || g.docs.every((d) => !d.alive)) {
    g.phase = "over";
    return;
  }
  if (g.intro <= 0 && g.spawnLeft === 0 && !boss.on && g.enemies.every((e) => !e.on)) {
    for (const d of g.docs) if (d.alive) g.score += 100;
    if (g.wave >= WAVES) g.phase = "won";
    else {
      g.ammo = Math.min(MAX_AMMO, g.ammo + 6);
      g.banner = 1;
      g.phase = "waveclear";
    }
  }
}
