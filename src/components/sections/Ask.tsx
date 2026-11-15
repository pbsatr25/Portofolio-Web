import Image from "next/image";
import { ask } from "@/content/ask";
import { DisabledButton } from "@/components/ui/Button";
import { PixelDivider } from "@/components/motion/PixelDivider";

// Plot labels over the exported plot (437 × 360 crop), as % of that box.
const plotLabels = [
  { t: "dim 1", x: 74.8, y: 87.8, muted: true },
  { t: "dim 2", x: 14.9, y: 87.8, muted: true },
  { t: "dim 3", x: 52.2, y: 14.4, muted: true },
  { t: "Q", x: 47.4, y: 50.6 },
  { t: "1", x: 61.3, y: 49.2 },
  { t: "2", x: 41.6, y: 48.1 },
  { t: "3", x: 46.9, y: 68.3 },
];

// DATA: POST /api/ask (fase akhir). Static sample of a finished answer until then.
export function AskMyCV() {
  return (
    <section data-stack data-ground="light" id="ask" aria-labelledby="ask-title" className="relative bg-bg">
      <PixelDivider color="bg" seed={41} />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-10 px-5 py-28 xl:flex-row xl:gap-6 xl:px-10 xl:py-48">
        <div className="flex flex-col gap-6 xl:w-[437px] xl:shrink-0">
          <h2 id="ask-title" className="text-statement font-medium">
            {ask.title}
          </h2>
          <p className="text-body text-ink-muted">{ask.description}</p>
          <figure className="relative aspect-[437/360] w-full max-w-[437px] overflow-hidden">
            <Image
              src="/media/ask-plot.svg"
              alt={ask.plotAlt}
              width={437}
              height={420}
              unoptimized
              className="w-full"
            />
            <div aria-hidden className="font-pixel text-pixel">
              {plotLabels.map((l) => (
                <span
                  key={l.t}
                  className={`absolute ${l.muted ? "text-ink-muted" : "text-ink"}`}
                  style={{ left: `${l.x}%`, top: `${l.y}%` }}
                >
                  {l.t}
                </span>
              ))}
            </div>
          </figure>
        </div>

        <div data-ask-card className="flex flex-1 flex-col gap-6 bg-dark-raised p-5 text-on-dark xl:p-8">
          <form className="flex flex-col gap-2">
            <label htmlFor="ask-question" className="font-pixel text-pixel text-on-dark-muted">
              Your question
            </label>
            <div className="flex flex-col gap-2 border border-dark-line bg-dark p-2 sm:flex-row sm:items-center sm:gap-4 sm:pl-5">
              <input
                id="ask-question"
                name="question"
                defaultValue={ask.question}
                readOnly
                maxLength={300}
                className="min-h-11 flex-1 bg-transparent px-3 text-lead outline-none sm:px-0"
              />
              <DisabledButton variant="accent">
                Ask <span className="text-small">· live soon</span>
              </DisabledButton>
            </div>
          </form>
          <p className="text-small text-on-dark-muted">{ask.status}</p>

          <ol className="grid gap-4 md:grid-cols-3">
            {ask.chunks.map((c) => {
              const filled = Math.round(c.score * 10);
              return (
                <li
                  key={c.index}
                  id={`chunk-${c.index}`}
                  className="flex flex-col gap-3 border border-dark-line bg-dark p-4"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <span
                          key={i}
                          data-cell
                          className={`size-2 ${i < filled ? "bg-accent-on-dark" : "bg-dark-line"}`}
                        />
                      ))}
                    </span>
                    <span className="font-pixel text-pixel">
                      <span className="sr-only">Score </span>
                      {c.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-small">{c.text}</p>
                  <p className="mt-auto text-small text-on-dark-muted">
                    [{c.index}] {c.source}
                  </p>
                </li>
              );
            })}
          </ol>

          <div role="log" aria-live="polite">
            <p className="text-lead">
              {ask.answer.map((part, i) => (
                <span key={i}>
                  {part.text}
                  {part.cite && (
                    <>
                      {" "}
                      <a href={`#chunk-${part.cite}`} className="underline-offset-4 hover:underline">
                        [{part.cite}]
                      </a>
                    </>
                  )}
                </span>
              ))}
            </p>
          </div>
          <p className="text-small text-on-dark-muted">{ask.suggestion}</p>
        </div>
      </div>
    </section>
  );
}
