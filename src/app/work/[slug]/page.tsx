import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/work";
import { profile } from "@/content/profile";
import { projectJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/Button";

// Every valid slug is prerendered, so navigation to it is already static. Params are awaited at the top on
// purpose: an unknown slug must answer with a real 404, and a <Suspense> boundary would stream a soft 404.
// That trips the dev-only instant-navigation check, so the check is switched off for this segment.
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { type: "article", url: `/work/${p.slug}`, title: p.seoTitle, description: p.seoDescription },
  };
}

// Case study frame (PRD §Kerangka case study). Problem, architecture, results and links are added
// when PBS supplies the material; nothing here is invented.
export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  return (
    <PageShell>
      <JsonLd data={projectJsonLd(p)} />
      <nav aria-label="Breadcrumb" className="text-small text-ink-muted">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>{" "}
            /
          </li>
          <li>
            <Link href="/#work" className="hover:text-ink">
              Work
            </Link>{" "}
            /
          </li>
          <li aria-current="page">{p.name}</li>
        </ol>
      </nav>

      <header className="flex flex-col gap-6">
        <p className="font-pixel text-pixel">{p.year}</p>
        <h1 className="text-statement font-medium">{p.name}</h1>
        <p className="max-w-3xl text-lead">{p.summary}</p>
      </header>

      <div aria-hidden className="aspect-[16/9] w-full bg-photo-bg" />

      <dl className="grid max-w-3xl">
        {[
          ["Role", p.role],
          ["Year", String(p.year)],
          ...(p.award ? [["Recognition", p.award]] : []),
          ["Stack", p.stack.join(" · ")],
        ].map(([term, value]) => (
          <div key={term} className="flex flex-col gap-1 border-t border-line py-3.5 sm:flex-row sm:gap-6">
            <dt className="font-pixel text-pixel text-ink-muted sm:w-40 sm:shrink-0">{term}</dt>
            <dd className="text-body">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <Button href="/#work">All work</Button>
        <Button variant="ghost" href={`mailto:${profile.email}`}>
          Ask me about {p.name}
        </Button>
      </div>
    </PageShell>
  );
}
