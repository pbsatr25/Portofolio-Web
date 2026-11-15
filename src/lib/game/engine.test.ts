import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/random";
import {
  BASE_HP,
  BLAST_LIFE,
  INTRO_TIME,
  KIND,
  MAX_AMMO,
  WAVES,
  addBlast,
  createGame,
  fire,
  groundY,
  spawnEnemy,
  start,
  togglePause,
  update,
} from "./engine";

const newGame = () => {
  const g = createGame(1000, 640, seededRandom(7));
  start(g);
  // tests place their own enemies: skip the banner, keep the wave open with one pending spawn
  g.intro = 0;
  g.spawnLeft = 1;
  g.spawnTimer = 1e9;
  g.chunkTimer = 1e9;
  return g;
};
type G = ReturnType<typeof newGame>;
const run = (g: G, seconds: number, step = 1 / 60) => {
  for (let t = 0; t < seconds; t += step) update(g, step);
};
const live = (g: G) => g.enemies.filter((e) => e.on);

describe("fire", () => {
  it("spends one citation and refuses with none left", () => {
    const g = newGame();
    g.ammo = 1;
    expect(fire(g, 500, 200)).toBe(true);
    expect(g.ammo).toBe(0);
    expect(fire(g, 500, 200)).toBe(false);
  });

  it("refuses to aim into the ground and while paused", () => {
    const g = newGame();
    expect(fire(g, 500, groundY(g))).toBe(false);
    togglePause(g);
    expect(fire(g, 500, 200)).toBe(false);
  });
});

describe("blasts", () => {
  it("destroy an enemy inside them, chain a deeper blast and count the chain", () => {
    const g = newGame();
    spawnEnemy(g, 400, 300);
    const e = live(g)[0];
    e.vx = e.vy = 0; // hold it still
    addBlast(g, 410, 300, 1);
    run(g, BLAST_LIFE / 2);
    expect(e.on).toBe(false);
    expect(g.grounded).toBe(1);
    expect(g.bestChain).toBe(1);
    expect(g.blasts.some((b) => b.on && b.depth === 2)).toBe(true);
    expect(g.pops.some((p) => p.on && p.text === "+25")).toBe(true);
  });

  it("catch a relevant chunk for +3 citations, capped at the maximum", () => {
    const g = newGame();
    g.ammo = 5;
    Object.assign(g.chunks[0], { on: true, x: 300, y: 200 });
    addBlast(g, 300, 210, 1);
    run(g, 0.2);
    expect(g.chunks[0].on).toBe(false);
    expect(g.ammo).toBe(8);
    g.ammo = MAX_AMMO - 1;
    Object.assign(g.chunks[1], { on: true, x: 600, y: 200 });
    addBlast(g, 600, 210, 1);
    run(g, 0.2);
    expect(g.ammo).toBe(MAX_AMMO);
  });
});

describe("enemy kinds", () => {
  it("a confabulation splits into three hallucinations mid-air", () => {
    const g = newGame();
    spawnEnemy(g, 500, 0, KIND.confabulation);
    const c = live(g)[0];
    c.y = c.splitY - 0.1;
    run(g, 0.05);
    // the parent's pool slot is reused by a child, so check the field instead of the object
    expect(live(g)).toHaveLength(3);
    expect(live(g).every((e) => e.kind === KIND.hallucination)).toBe(true);
  });

  it("a jailbreak falls much faster than a hallucination", () => {
    const g = newGame();
    spawnEnemy(g, 500, 0, KIND.hallucination);
    spawnEnemy(g, 500, 0, KIND.jailbreak);
    const [slow, fast] = live(g);
    expect(Math.hypot(fast.vx, fast.vy)).toBeGreaterThan(Math.hypot(slow.vx, slow.vy) * 1.4);
  });
});

describe("waves", () => {
  it("nothing spawns while the wave banner is up", () => {
    const g = createGame(1000, 640, seededRandom(1));
    start(g);
    g.chunkTimer = 1e9;
    run(g, INTRO_TIME - 0.2);
    expect(live(g)).toHaveLength(0);
    run(g, 1.5);
    expect(live(g).length).toBeGreaterThan(0);
  });

  it("a landed enemy knocks out its document; losing them all ends the game", () => {
    const g = newGame();
    g.docs.forEach((d, i) => (d.alive = i === 0));
    Object.assign(g.enemies[0], { on: true, kind: 0, x: g.docs[0].x, y: groundY(g) - 1, vx: 0, vy: 100, doc: 0 });
    run(g, 0.1);
    expect(g.docs[0].alive).toBe(false);
    expect(g.phase).toBe("over");
  });

  it("the LLM takes a few hits before it falls", () => {
    const g = newGame();
    for (let i = 0; i < BASE_HP; i++)
      Object.assign(g.enemies[i], { on: true, kind: 0, x: 500, y: groundY(g) - 1, vx: 0, vy: 100, doc: -1 });
    run(g, 0.1);
    expect(g.baseHp).toBe(0);
    expect(g.phase).toBe("over");
  });

  it("clears to the next wave, and The Hallucinator guards the last one", () => {
    const g = newGame();
    g.spawnLeft = 0;
    run(g, 0.05);
    expect(g.phase).toBe("waveclear");
    run(g, 1.2);
    expect(g.wave).toBe(2);
    expect(g.phase).toBe("playing");

    Object.assign(g, { wave: WAVES - 1, phase: "waveclear", banner: 0 });
    update(g, 0.01);
    expect(g.wave).toBe(WAVES);
    expect(g.boss.on).toBe(true);
    Object.assign(g, { intro: 0, spawnLeft: 0 });
    g.boss.on = false; // boss defeated
    for (const e of g.enemies) e.on = false;
    update(g, 0.01);
    expect(g.phase).toBe("won");
  });
});
