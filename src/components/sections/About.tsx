import Image from "next/image";
import { about, cvHref, profile } from "@/content/profile";
import { Button } from "@/components/ui/Button";
import { PixelDivider } from "@/components/motion/PixelDivider";

export function About() {
  return (
    <section data-stack data-ground="light" id="about" aria-labelledby="about-title" className="relative bg-surface">
      <PixelDivider color="surface" seed={11} />
      <div className="relative z-2 mx-auto flex max-w-page flex-col gap-10 px-5 py-28 xl:flex-row xl:gap-6 xl:px-10 xl:py-48">
        <div data-photo className="relative aspect-[557/720] w-full shrink-0 overflow-hidden bg-dark xl:w-[38.7%]">
          <Image
            src={profile.photo.src}
            alt={profile.photo.alt}
            fill
            sizes="(min-width: 1280px) 557px, 100vw"
            className="object-cover object-[45%_70%]"
          />
          <span aria-hidden>
            <span data-bite className="absolute top-0 right-0 size-10 bg-surface" />
            <span data-bite className="absolute top-0 right-10 size-10 bg-surface" />
            <span data-bite className="absolute top-20 right-0 size-10 bg-accent" />
            <span data-bite className="absolute bottom-0 left-9 size-10 bg-surface" />
            <span data-bite className="absolute bottom-10 left-9 size-10 bg-surface" />
            <span data-bite className="absolute bottom-0 left-19 size-10 bg-surface" />
          </span>
          <p className="absolute top-6 left-6 bg-accent px-3 py-2 text-small text-on-accent">{about.photoTag}</p>
        </div>

        <div className="flex flex-1 flex-col gap-7 xl:pt-2">
          <h2 id="about-title" className="text-heading font-medium">
            About me
          </h2>
          <p className="text-lead">{about.lead}</p>
          <p className="text-body text-ink-muted">{about.body}</p>
          <dl>
            {about.facts.map((f) => (
              <div key={f.term} className="flex flex-col gap-1 border-t border-line py-3.5 xl:flex-row xl:gap-6">
                <dt className="font-pixel text-pixel text-ink-muted xl:w-40 xl:shrink-0">{f.term}</dt>
                <dd className="text-body">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={cvHref}>Download CV</Button>
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
          </div>
        </div>
      </div>
    </section>
  );
}
