import type { Metadata } from "next";
import Link from "next/link";
import { about, profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { projects } from "@/content/work";
import { stack } from "@/content/stack";
import { cvJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Experience, projects, skills and awards of Prihastomo Budi Satrio, AI and software engineer at UGM. Download the PDF.",
  alternates: { canonical: "/cv" },
};

export default function CvPage() {
  return (
    <PageShell>
      <JsonLd data={cvJsonLd()} />
      <header className="flex flex-col gap-6">
        <h1 className="text-statement font-medium">{profile.name}</h1>
        <p className="text-lead text-ink-muted">{profile.roleLine}</p>
        <p className="max-w-3xl text-lead">{about.lead}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {profile.cvPdf && (
            <Button href={profile.cvPdf} download>
              Download PDF
            </Button>
          )}
          <Button variant="ghost" href={`mailto:${profile.email}`}>
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
        </div>
      </header>

      <section aria-labelledby="cv-experience" className="flex flex-col gap-6">
        <h2 id="cv-experience" className="text-heading font-medium">
          Experience
        </h2>
        {experience.years.map((y) => (
          <div key={y.year} className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:gap-6">
            <h3 className="font-pixel text-pixel-lg sm:w-40 sm:shrink-0">{y.year}</h3>
            <ul className="flex flex-1 flex-col gap-4">
              {y.items.map((item) => (
                <li key={item.role + item.org}>
                  <p className="text-lead">{item.role}</p>
                  <p className="text-body text-ink-muted">
                    {item.org} · {item.when}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="cv-projects" className="flex flex-col gap-6">
        <h2 id="cv-projects" className="text-heading font-medium">
          Projects
        </h2>
        <ul className="flex flex-col">
          {projects.map((p) => (
            <li key={p.slug} className="flex flex-col gap-1 border-t border-line py-4">
              <p className="text-lead">
                <Link href={`/work/${p.slug}`} className="underline-offset-4 hover:underline">
                  {p.name}
                </Link>{" "}
                <span className="font-pixel text-pixel">{p.year}</span>
              </p>
              <p className="text-body text-ink-muted">{p.role}</p>
              <p className="text-body">{p.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cv-skills" className="flex flex-col gap-6">
        <h2 id="cv-skills" className="text-heading font-medium">
          Skills
        </h2>
        <dl>
          {stack.rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 border-t border-line py-3.5 sm:flex-row sm:gap-6">
              <dt className="font-pixel text-pixel text-ink-muted sm:w-40 sm:shrink-0">{row.label}</dt>
              <dd className="text-body">{row.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="cv-education" className="flex flex-col gap-6">
        <h2 id="cv-education" className="text-heading font-medium">
          Education
        </h2>
        <p className="border-t border-line pt-4 text-body">
          {about.facts.find((f) => f.term === "Studying")?.value} · since 2024
        </p>
      </section>
    </PageShell>
  );
}
