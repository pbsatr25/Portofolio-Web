import type { CSSProperties } from "react";
import { projects, work } from "@/content/work";
import { Button } from "@/components/ui/Button";
import { PixelDivider } from "@/components/motion/PixelDivider";

// CSS-only deck: each card sticks a strip lower than the one before, so the next card slides over it
// while every card stays fully readable without JS. Back of the deck = oldest, front = newest (Figma).
const deck = [...projects].reverse();

export function Work() {
  return (
    <section
      data-stack
      data-ground="dark"
      id="work"
      aria-labelledby="work-title"
      className="relative bg-dark text-on-dark"
    >
      <div aria-hidden className="grain-dark absolute inset-0" />
      <PixelDivider color="dark" seed={67} grain="dark" />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-10 px-5 py-28 xl:gap-16 xl:px-10 xl:py-48">
        <h2 id="work-title" className="text-heading font-medium">
          {work.title}
        </h2>
        <ol className="flex flex-col gap-6">
          {deck.map((p, i) => (
            <li
              key={p.slug}
              className="sticky top-[calc(1rem+var(--i)*3.5rem)] mx-[calc((var(--n)-var(--i))*0.5rem)] xl:top-[calc(2rem+var(--i)*5rem)] xl:mx-[calc((var(--n)-var(--i))*1.25rem)]"
              style={{ "--i": i, "--n": deck.length - 1 } as CSSProperties}
            >
              <article className="flex flex-col gap-6 bg-bg p-4 text-ink xl:p-6">
                <header className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <h3 className="text-lead">{p.name}</h3>
                  <p className="flex-1 text-body text-ink-muted">{p.role}</p>
                  <p className="font-pixel text-pixel">{p.year}</p>
                </header>
                <div className="flex flex-col gap-6 xl:flex-row">
                  {/* TODO(PBS): project screenshot; placeholder keeps the Figma slot and aspect ratio. */}
                  <div aria-hidden className="aspect-[4/3] bg-photo-bg xl:aspect-auto xl:h-130 xl:flex-1" />
                  <div className="flex flex-col justify-between gap-6 xl:w-110 xl:shrink-0">
                    <div className="flex flex-col gap-4">
                      <p className="text-lead">{p.summary}</p>
                      <p className="text-small text-ink-muted">{p.stack.join(" · ")}</p>
                    </div>
                    <Button href={`/work/${p.slug}`} className="self-start">
                      {work.cta}
                      <span className="sr-only">: {p.name}</span>
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
