import Image from "next/image";
import { statement } from "@/content/profile";
import { PixelDivider } from "@/components/motion/PixelDivider";

// Desktop side labels sit next to lines 2–6 (Figma 62:14198); x as % of the 1440 frame.
const labelX = ["77%", "4%", "62.5%", "3%", "79%"];

export function Statement() {
  const rows = statement.lines.length;
  return (
    <section
      data-stack
      data-ground="accent"
      data-statement
      aria-label="Statement"
      className="relative overflow-x-clip bg-accent text-ink"
    >
      <div aria-hidden className="grain-accent absolute inset-0" />
      <PixelDivider color="accent" seed={37} grain="accent" />
      <div aria-hidden className="hidden xl:block">
        <span data-float className="absolute top-25 left-[87.5%] size-16 bg-ink" />
        <span data-float className="absolute top-41 left-[92%] size-8 bg-ink" />
        <span data-float className="absolute top-15 left-[76.4%] size-6 bg-on-dark" />
      </div>

      <div className="relative z-2 mx-auto max-w-page px-5 pt-28 pb-36 xl:pt-48 xl:pb-60">
        {/* Pinned block: only the lines + labels, centred in the viewport, so every line stays visible while
            the section (taller than most screens) is pinned. */}
        <div data-statement-pin className="relative">
          {/* One sentence for crawlers and screen readers; each line becomes an animation target in stage 3. */}
          <p className="text-center text-stack-word font-medium uppercase">
            {statement.lines.map((line) =>
              line === "*(" ? (
                <span key={line} data-statement-line aria-hidden className="flex items-center justify-center gap-4">
                  *(
                  <span data-face className="relative inline-block h-[0.8125em] w-[0.875em] overflow-hidden bg-dark">
                    <Image
                      src="/media/portrait-dither.png"
                      alt=""
                      width={372}
                      height={663}
                      className="absolute top-[-0.11em] left-[-0.94em] w-[2.33em] max-w-none"
                    />
                  </span>
                  )
                </span>
              ) : (
                <span key={line} data-statement-line className="block">
                  {line}{" "}
                </span>
              ),
            )}
          </p>
          <ul className="pointer-events-none absolute inset-0 hidden text-small text-on-accent xl:block">
            {statement.labels.map((label, i) => (
              <li
                key={label}
                className="absolute -translate-y-1/2"
                style={{ left: labelX[i], top: `${((i + 1.5) / rows) * 100}%` }}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 aspect-[9/1] bg-[url(/media/x-band.svg)] bg-cover" />
    </section>
  );
}
