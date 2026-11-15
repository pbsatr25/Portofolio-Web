import Image from "next/image";

// Loader sequence from art/design/Recording 2026-11-14 220355.mp4 (Cobalt instead of the orange prototype).
// Server markup so it covers the page before hydration; only visible while <html> has "loading"
// (first visit per session, motion allowed). The intro HTML stays in the DOM underneath. Driven by Motion.tsx.

// 6×6 pixel glyphs. . empty · o muted · w light · a accent
const glyphs = [
  ["o.o.o.", ".a.o.o", "o.o.a.", ".o.o.o", "a.o.o.", ".o.a.o"],
  ["......", ".w..a.", "..ww..", ".a..w.", "w....a", "..a..."],
  ["aoooow", "oowooo", "oooaoo", "owoooa", "ooaooo", "wooooa"],
  ["..ww..", ".w..w.", "aw..wa", "..aa..", ".aww..", "a....w"],
  ["wwwww.", "w...w.", "wwwww.", "..w...", "......", "......"],
  [".w..w.", "w....w", "w.aa.w", "w.aa.w", "w....w", ".w..w."],
];
const fill = { o: "fill-dark-line", w: "fill-on-dark", a: "fill-accent" } as const;

function Glyph({ rows, className = "" }: { rows: string[]; className?: string }) {
  return (
    <svg viewBox="0 0 6 6" shapeRendering="crispEdges" className={`size-full ${className}`}>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className={fill[c as keyof typeof fill]} />
          ),
        ),
      )}
    </svg>
  );
}

// Desktop: one row of 108 px tiles (scaled up twice by ~50% at PBS's request).
// Phones: a vertical column of 60 px tiles, capped by viewport height so 8 tiles fit short screens.
const tileSize = "size-[min(3.75rem,7svh)] p-2.5 xl:size-27 xl:p-4.5";
const tile = `${tileSize} bg-dark-raised`;

export function Loader() {
  return (
    <div data-loader className="loader fixed inset-0 z-50 hidden" aria-hidden>
      <div data-loader-stage className="absolute inset-0 bg-dark text-on-dark">
        <div aria-hidden className="grain-dark absolute inset-0" />
        <span className="absolute top-5 left-5 font-pixel text-pixel xl:top-8 xl:left-10">PBS</span>
        <span className="absolute top-5 right-5 text-small text-on-dark-muted xl:top-8 xl:right-10">
          Portfolio 2026
        </span>
        <span className="absolute top-1/2 left-5 -translate-y-1/2 text-small xl:left-10">AI engineer</span>
        <span className="absolute top-1/2 right-5 -translate-y-1/2 text-small xl:right-10">Software engineer</span>

        {/* Centre: one tile cycling glyphs while counting, then the portrait, then a row of tiles. */}
        <div className="absolute top-1/2 left-1/2 -translate-1/2">
          <div data-loader-tile className={`relative ${tile}`}>
            {/* glyphs stack inside the tile's padding box (an absolutely positioned <svg> with inset alone
                would size itself, not stretch, and spill over the tile) */}
            <div className="absolute inset-2.5 xl:inset-4.5">
              {glyphs.map((g, i) => (
                <Glyph key={i} rows={g} className={`absolute inset-0 ${i ? "opacity-0" : ""}`} />
              ))}
            </div>
            <Image
              data-loader-portrait
              src="/media/portrait-dither.png"
              alt=""
              width={372}
              height={663}
              className="absolute inset-0 size-full object-cover object-[50%_10%] opacity-0"
            />
          </div>
        </div>
        <div
          data-loader-column
          className="absolute top-1/2 left-1/2 flex w-max -translate-1/2 flex-col gap-3 opacity-0 xl:flex-row xl:gap-6"
        >
          <div className={`${tile} p-0`}>
            <Image
              src="/media/portrait-dither.png"
              alt=""
              width={372}
              height={663}
              className="size-full object-cover object-[50%_10%]"
            />
          </div>
          <div
            className={`${tileSize} flex items-center justify-center bg-accent font-pixel text-pixel text-on-accent xl:text-pixel-lg`}
          >
            PBS
          </div>
          {glyphs.map((g, i) => (
            <div key={i} className={tile}>
              <Glyph rows={g} />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 xl:bottom-10">
          <span className="font-pixel text-pixel-lg">
            <span data-loader-count>000</span>
            <span className="text-pixel">%</span>
          </span>
          <span className="text-small text-on-dark-muted">Prihastomo Budi Satrio, Yogyakarta</span>
        </div>
        <button
          type="button"
          data-loader-skip
          tabIndex={-1}
          className="absolute right-5 bottom-5 min-h-11 px-2 text-small text-on-dark-muted hover:text-on-dark xl:right-10 xl:bottom-10"
        >
          Skip
        </button>
      </div>
      {/* Pixel dissolve cells are created by Motion.tsx to fit the viewport. */}
      <div data-loader-cells className="pointer-events-none absolute inset-0 grid" />
    </div>
  );
}
