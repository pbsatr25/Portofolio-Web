import Image from "next/image";
import { play } from "@/content/ask";
import { GameLauncher } from "@/components/ui/GameLauncher";
import { PixelDivider } from "@/components/motion/PixelDivider";

// The preview stays a static frame; the game bundle downloads only when Play is pressed (GameLauncher).
export function PromptDefender() {
  return (
    <section
      data-stack
      data-ground="accent"
      id="play"
      aria-labelledby="play-title"
      className="relative bg-accent text-ink"
    >
      <PixelDivider color="accent" seed={53} />
      <div className="relative z-2 mx-auto grid max-w-page gap-8 px-5 py-28 xl:grid-cols-[minmax(0,1fr)_437px] xl:gap-x-6 xl:px-10 xl:py-48">
        <div className="flex flex-col gap-6 xl:col-start-2 xl:row-start-1 xl:self-end">
          <h2 id="play-title" className="text-statement font-medium">
            Prompt
            <br />
            Defender
          </h2>
          <p className="text-body text-on-accent">{play.description}</p>
          <p className="text-small text-on-accent">{play.meta}</p>
        </div>

        <figure className="relative aspect-[899/560] overflow-hidden bg-dark xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:self-center">
          <Image src="/media/game-preview.svg" alt={play.previewAlt} fill unoptimized className="object-cover" />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 flex items-center justify-between bg-dark px-6 py-2.5 font-pixel text-pixel"
          >
            <span className="flex flex-col">
              <span className="text-on-dark-muted">wave</span>
              <span className="text-on-dark">{play.hud.wave}</span>
            </span>
            <span className="hidden gap-[3px] sm:flex">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} className={`h-3 w-1.5 ${i < 9 ? "bg-on-dark" : "bg-dark-line"}`} />
              ))}
            </span>
            <span className="flex flex-col items-end">
              <span className="text-on-dark-muted">score</span>
              <span className="text-on-dark">{play.hud.score}</span>
            </span>
          </div>
          <p
            aria-hidden
            className="absolute bottom-4 left-4 hidden bg-dark px-3 py-2 font-pixel text-pixel text-on-dark sm:block"
          >
            {play.hud.tag}
          </p>
        </figure>

        <div className="flex flex-wrap items-center gap-6 xl:col-start-2 xl:row-start-2 xl:self-start">
          <GameLauncher cta={play.cta} secondary={play.secondary} />
        </div>
      </div>
    </section>
  );
}
