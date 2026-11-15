import Image from "next/image";
import { introCard, profile } from "@/content/profile";
import { ArrowIcon } from "@/components/ui/icons";
import { Nav } from "@/components/ui/Nav";

// Decorative pixel cloud, positions from Figma Intro frame (1440 × 960), as % of the frame.
const pixels = [
  { x: 8.3, y: 18.8, s: "size-6", c: "bg-dark-line" },
  { x: 18.1, y: 12.5, s: "size-4", c: "bg-on-dark-muted" },
  { x: 81.9, y: 16.7, s: "size-8", c: "bg-dark-line" },
  { x: 90.3, y: 27.1, s: "size-4", c: "bg-accent" },
  { x: 12.5, y: 66.7, s: "size-10", c: "bg-dark-line" },
  { x: 86.1, y: 62.5, s: "size-6", c: "bg-on-dark-muted" },
  { x: 29.2, y: 22.9, s: "size-4", c: "bg-accent" },
  { x: 68.1, y: 20.8, s: "size-6", c: "bg-dark-line" },
  { x: 75, y: 75, s: "size-4", c: "bg-on-dark-muted" },
  { x: 20.8, y: 79.2, s: "size-6", c: "bg-dark-line" },
  { x: 94.4, y: 43.8, s: "size-10", c: "bg-dark-line" },
  { x: 5.6, y: 43.8, s: "size-4", c: "bg-on-dark-muted" },
  { x: 82.6, y: 43.8, s: "size-12", c: "bg-accent" },
  { x: 86, y: 48.8, s: "size-6", c: "bg-accent" },
  { x: 31.9, y: 58.3, s: "size-8", c: "bg-on-dark" },
  { x: 70.1, y: 81.3, s: "size-10", c: "bg-accent" },
];

export function Intro() {
  return (
    <header
      data-stack
      data-ground="light"
      data-intro-root
      className="relative flex min-h-svh flex-col overflow-hidden bg-bg"
    >
      <div aria-hidden className="grain-light absolute inset-0" />
      <div aria-hidden className="absolute inset-0 hidden xl:block">
        {pixels.map((p, i) => (
          <span key={i} data-float className={`absolute ${p.s} ${p.c}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} />
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-page flex-1 flex-col px-5 pt-6 pb-24 xl:px-10 xl:pt-8 xl:pb-36">
        <div data-intro>
          <Nav />
        </div>

        <p
          aria-hidden
          className="relative z-2 mt-10 font-medium text-wordmark xl:absolute xl:inset-x-0 xl:top-36 xl:mt-0 xl:text-center"
        >
          {/* Masked line rise: outer span clips, inner span [data-line] slides up. */}
          <span className="block overflow-hidden xl:inline-block">
            <span data-line className="block">
              Porto
            </span>
          </span>
          <span className="block overflow-hidden xl:inline-block">
            <span data-line className="block">
              Folio
            </span>
          </span>
        </p>

        <div className="relative z-10 mt-auto flex items-end justify-between gap-6">
          <h1 data-intro className="max-w-[60%] xl:max-w-none">
            <span className="block text-lead">{profile.name}</span>
            <span className="mt-2 block text-body text-ink-muted">{profile.roleLine}</span>
          </h1>
          <div className="flex flex-col items-end gap-6">
            <div data-intro className="hidden w-80 flex-col gap-3 bg-accent p-4 text-small text-on-accent xl:flex">
              <p>{introCard.text}</p>
              <a
                href={introCard.href}
                className="inline-flex items-center gap-2 self-start underline underline-offset-4"
              >
                {introCard.cta}
                <ArrowIcon />
              </a>
            </div>
            <a data-intro href="#about" className="hidden items-center gap-3 font-pixel text-pixel xl:flex">
              Scroll
              <span aria-hidden className="flex flex-col gap-1">
                <span data-cue className="size-2 bg-ink" />
                <span data-cue className="size-2 bg-ink" />
                <span data-cue className="size-2 bg-accent" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* LCP candidate. TODO(PBS): WebM alpha + MP4 avatar video (≤ 1.5 MB) replaces this poster once encoded. */}
      <Image
        src={profile.avatarPoster.src}
        alt={profile.avatarPoster.alt}
        width={231}
        height={542}
        loading="eager"
        fetchPriority="high"
        unoptimized
        data-intro
        data-avatar
        className="pointer-events-none absolute right-0 bottom-0 z-3 h-[70%] w-auto [image-rendering:pixelated] xl:top-40 xl:right-auto xl:bottom-auto xl:left-1/2 xl:h-auto xl:w-[48%] xl:-translate-x-1/2"
      />
    </header>
  );
}
