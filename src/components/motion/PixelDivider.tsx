import { seededRandom } from "@/lib/random";

// Pixel dissolve on the leading edge of a section: pixels in the section's OWN ground (and grain) rise above its
// top, so when the section slides over the previous one (superposition) its edge dissolves into it instead of
// cutting it with a straight line. Cells stay square at a fixed size on any width: 24 px at ≥ 1280, 13 px below.
// Extra columns are generated and cropped (preserveAspectRatio "slice"). Decorative.
const fills = { bg: "fill-bg", surface: "fill-surface", dark: "fill-dark", accent: "fill-accent" } as const;
const grains = {
  light: { src: "/media/grain-light.png", opacity: 0.3 },
  dark: { src: "/media/grain-dark.png", opacity: 0.6 },
  accent: { src: "/media/grain-accent.png", opacity: 0.6 },
} as const;

// One entry per column: a solid run from the top (1–3 rows) and, sometimes, a stray pixel below the edge.
function columns(cols: number, seed: number) {
  const rand = seededRandom(seed);
  return Array.from({ length: cols }, (_, x) => {
    const depth = 1 + Math.floor(rand() * 3);
    return { x, depth, stray: rand() < 0.22 ? depth + 1 : 0 };
  });
}

function Grid({
  cols,
  cell,
  seed,
  grain,
  className,
}: {
  cols: number;
  cell: number;
  seed: number;
  grain?: keyof typeof grains;
  className: string;
}) {
  const id = `grain-${seed}-${cols}`;
  const tile = 144 / cell; // CSS grain tile is 144 px; viewBox units are cells
  // Each column / stray is its own <g> so Motion.tsx can grow the columns row by row and twinkle the strays.
  const cellRects = (x: number, y: number, h: number) => (
    <>
      <rect x={x} y={y} width="1" height={h} />
      {grain && <rect x={x} y={y} width="1" height={h} fill={`url(#${id})`} opacity={grains[grain].opacity} />}
    </>
  );
  return (
    <svg
      viewBox={`0 0 ${cols} 5`}
      preserveAspectRatio="xMinYMin slice"
      className={`block w-full ${className}`}
      shapeRendering="crispEdges"
    >
      {grain && (
        <defs>
          <pattern id={id} patternUnits="userSpaceOnUse" width={tile} height={tile}>
            <image href={grains[grain].src} width={tile} height={tile} />
          </pattern>
        </defs>
      )}
      {columns(cols, seed).map((c) => (
        <g key={c.x}>
          <g data-col={c.depth}>{cellRects(c.x, 0, c.depth)}</g>
          {c.stray > 0 && <g data-stray>{cellRects(c.x, c.stray, 1)}</g>}
        </g>
      ))}
    </svg>
  );
}

export function PixelDivider({
  color,
  seed,
  grain,
}: {
  color: keyof typeof fills;
  seed: number;
  grain?: keyof typeof grains;
}) {
  // bottom-full: sits just above the section (1 px overlap hides sub-pixel seams), flipped so pixels point up.
  // z-5 keeps it over the previous section's avatar/content when sections aren't stacked (no motion).
  return (
    <div
      aria-hidden
      data-divider
      className={`pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] z-5 -scale-y-100 ${fills[color]}`}
    >
      {/* 100 × 13 px covers up to 1300 px; 80 × 24 px covers up to 1920 px before cells start to grow. */}
      <Grid cols={100} cell={13} seed={seed} grain={grain} className="divider-mobile h-16.25 xl:hidden" />
      <Grid cols={80} cell={24} seed={seed} grain={grain} className="divider-desktop hidden h-30 xl:block" />
    </div>
  );
}
