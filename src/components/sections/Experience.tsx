import { experience } from "@/content/experience";
import { cvHref } from "@/content/profile";
import { Button } from "@/components/ui/Button";
import { PixelDivider } from "@/components/motion/PixelDivider";

const tilt = ["rotate-[1.5deg]", "-rotate-1", "rotate-[0.5deg]", "rotate-[-1.5deg]"];

export function Experience() {
  return (
    <section
      data-stack
      data-ground="light"
      id="experience"
      aria-labelledby="experience-title"
      className="relative overflow-x-clip bg-bg"
    >
      <PixelDivider color="bg" seed={79} />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-10 px-5 py-28 xl:gap-16 xl:px-10 xl:py-48">
        <div className="flex flex-col gap-6 xl:gap-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="experience-title" className="text-heading font-medium">
              {experience.title}
            </h2>
            <Button variant="ghost" href={cvHref} className="max-xl:hidden">
              {experience.cta}
            </Button>
          </div>
          <p className="max-w-170 text-lead text-ink-muted">{experience.description}</p>
        </div>

        {/* Mobile: native horizontal track (next folder peeks). Desktop: three folders in a row. */}
        {/* tabIndex: keyboard users can scroll the track with arrow keys (axe scrollable-region-focusable). */}
        <div
          data-exp-track
          tabIndex={0}
          role="region"
          aria-label="Experience by year"
          className="-mx-5 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-4 xl:mx-0 xl:overflow-visible xl:px-0 xl:pb-0"
        >
          {experience.years.map((y, yi) => (
            <section
              key={y.year}
              data-folder
              aria-labelledby={`exp-${y.year}`}
              className="relative h-175 w-75 shrink-0 snap-start xl:w-108"
            >
              <h3
                id={`exp-${y.year}`}
                className={`absolute top-0 left-0 px-4 py-2.5 font-pixel text-pixel ${yi === 0 ? "bg-accent text-on-accent" : "bg-ink-muted text-on-dark"}`}
              >
                experience/{y.year}
              </h3>
              <div aria-hidden className="absolute inset-x-0 top-10 bottom-0 bg-ink-muted" />
              <ol className="relative flex flex-col px-4 pt-16 xl:px-6">
                {y.items.map((item, i) => (
                  <li
                    data-file
                    key={item.role + item.org}
                    className={`flex h-55 flex-col gap-1.5 border border-line bg-on-dark px-5 pt-3.5 pb-4 ${tilt[i % tilt.length]} ${i > 0 ? "-mt-24 xl:-mt-28" : ""}`}
                  >
                    <p className="font-pixel text-pixel">{item.when}</p>
                    <p className="text-lead">{item.role}</p>
                    <p className="text-body text-ink-muted">{item.org}</p>
                  </li>
                ))}
              </ol>
              <div
                data-flap
                aria-hidden
                className="absolute inset-x-0 bottom-0 flex h-45.5 flex-col justify-between bg-dark px-6 py-5"
              >
                <span className={`font-pixel text-pixel-xl ${yi === 0 ? "text-accent-on-dark" : "text-on-dark"}`}>
                  {y.year}
                </span>
                <span className="text-small text-on-dark-muted">
                  {y.items.length} {y.items.length === 1 ? "file" : "files"}
                </span>
              </div>
            </section>
          ))}
        </div>

        <Button variant="ghost" href={cvHref} className="self-start xl:hidden">
          {experience.cta}
        </Button>
      </div>
    </section>
  );
}
