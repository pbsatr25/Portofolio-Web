import { stack } from "@/content/stack";
import { PixelDivider } from "@/components/motion/PixelDivider";

const tones = { accent: "text-accent-on-dark", light: "text-on-dark", muted: "text-on-dark-muted" } as const;

export function Stack() {
  return (
    <section
      data-stack
      data-ground="dark"
      id="stack"
      aria-labelledby="stack-title"
      className="relative overflow-x-clip bg-dark text-on-dark"
    >
      <div aria-hidden className="grain-dark absolute inset-0" />
      <PixelDivider color="dark" seed={23} grain="dark" />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-10 py-28 pl-5 xl:gap-16 xl:py-48 xl:pl-10">
        <div className="flex flex-col gap-4 pr-5 xl:flex-row xl:items-end xl:gap-6 xl:pr-10">
          <h2 id="stack-title" className="text-heading font-medium xl:w-[437px] xl:shrink-0">
            {stack.title}
          </h2>
          <p className="text-lead text-on-dark-muted">{stack.description}</p>
        </div>
        {stack.rows.map((row, r) => (
          <div key={row.label} className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-6">
            <h3 className="font-pixel text-pixel text-on-dark-muted xl:w-45 xl:shrink-0">{row.label}</h3>
            {/* Marquee track: the real list + an aria-hidden copy, so a -50% shift loops seamlessly.
                The wrapper clips it so it never slides under the row label. */}
            {/* Soft fade at both ends instead of a hard cut; on screens wider than the 1440 container the track
                runs on to the viewport edge. */}
            <div className="-my-3 min-w-0 flex-1 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_90%,transparent)] xl:mr-[min(0px,calc((1440px-100vw)/2))]">
              <div
                data-marquee={r % 2 ? "left" : "right"}
                data-speed={[0.6, 0.8, 1][r]}
                className={`flex w-max text-marquee font-medium whitespace-nowrap ${tones[row.tone]}`}
              >
                {[false, true].map((copy) => (
                  <ul key={String(copy)} aria-hidden={copy || undefined} className="flex">
                    {row.items.map((item) => (
                      <li key={item}>
                        {item}
                        <span aria-hidden className="px-[0.3em]">
                          ·
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
