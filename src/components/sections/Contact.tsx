import { Fragment } from "react";
import { contact, cvHref, profile } from "@/content/profile";
import { seededRandom } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { PixelDivider } from "@/components/motion/PixelDivider";

// Pixel band under the links (Figma "Pixel band"): 40 px cells, denser at the bottom, a few Cobalt.
function PixelBand() {
  const cols = 34;
  const rand = seededRandom(97);
  const cells: { x: number; y: number; accent: boolean }[] = [];
  for (let x = 0; x < cols; x++)
    for (let y = 0; y < 3; y++) if (rand() < [0.3, 0.55, 0.85][y]) cells.push({ x, y, accent: rand() < 0.12 });
  return (
    <svg aria-hidden data-band viewBox={`0 0 ${cols} 3`} className="block w-full" shapeRendering="crispEdges">
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width="1"
          height="1"
          data-px
          className={c.accent ? "fill-accent" : "fill-on-dark"}
        />
      ))}
    </svg>
  );
}

export function Contact() {
  return (
    <section
      data-stack
      data-ground="dark"
      id="contact"
      aria-labelledby="contact-title"
      className="relative bg-dark text-on-dark"
    >
      <div aria-hidden className="grain-dark absolute inset-0" />
      <PixelDivider color="dark" seed={89} grain="dark" />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-8 px-5 pt-28 xl:gap-12 xl:px-10 xl:pt-48">
        <p className="text-lead text-on-dark-muted">{contact.ask}</p>
        {/* Letters are split for the rise animation; aria-label keeps the heading a single word pair. */}
        <h2 id="contact-title" data-hello aria-label={contact.title} className="overflow-hidden text-mega font-medium">
          {/* words stay whole (nowrap), so a narrow screen breaks "SAY / HELLO", never inside a word */}
          {contact.title.split(" ").map((word, w) => (
            <Fragment key={w}>
              {w > 0 && " "}
              <span aria-hidden className="inline-block whitespace-nowrap">
                {[...word].map((ch, i) => (
                  <span key={i} data-letter className="inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </h2>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button variant="accent" href={`mailto:${profile.email}`}>
            {profile.email}
          </Button>
          {profile.linkedin && (
            <Button variant="ghost" href={profile.linkedin} rel="me">
              LinkedIn
            </Button>
          )}
          {profile.github && (
            <Button variant="ghost" href={profile.github} rel="me">
              GitHub
            </Button>
          )}
          <Button variant="ghost" href={cvHref}>
            Download CV
          </Button>
        </div>
        <PixelBand />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    // relative: the sticky (positioned) intro header would otherwise paint over a static footer
    <footer className="relative bg-dark text-on-dark-muted">
      <div className="relative z-2 mx-auto flex max-w-page flex-col justify-between gap-2 px-5 pt-8 pb-10 text-small sm:flex-row xl:px-10">
        <p>{contact.footerLeft}</p>
        <p>{contact.footerRight}</p>
      </div>
    </footer>
  );
}
