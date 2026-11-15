import { experience } from "@/content/experience";
import { profile, siteUrl } from "@/content/profile";
import type { Project } from "@/content/work";

// One Person entity with a stable @id, referenced from every page (PRD §SEO 3).
export const personId = `${siteUrl}/#person`;

const sameAs = [profile.linkedin, profile.github].filter(Boolean);

export function person() {
  return {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    alternateName: profile.alternateName,
    jobTitle: profile.jobTitle,
    description: profile.description,
    url: siteUrl,
    image: `${siteUrl}${profile.photo.src}`,
    email: `mailto:${profile.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location.city,
      addressCountry: profile.location.country,
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.alumniOf },
    knowsAbout: profile.knowsAbout,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${siteUrl}${item.path}`,
  })),
});

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profilepage`,
        url: siteUrl,
        name: `${profile.name} — ${profile.jobTitle}`,
        inLanguage: "en",
        dateModified: profile.updated,
        mainEntity: person(),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: profile.name,
        publisher: { "@id": personId },
      },
    ] as const,
  };
}

export function projectJsonLd(p: Project) {
  const url = `${siteUrl}/work/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        url,
        name: p.name,
        description: p.summary,
        dateCreated: String(p.year),
        author: { "@id": personId },
        keywords: p.stack.join(", "),
        ...(p.award && { award: p.award }),
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Work", path: "/#work" },
        { name: p.name, path: `/work/${p.slug}` },
      ]),
    ] as const,
  };
}

export function cvJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/cv#profilepage`,
        url: `${siteUrl}/cv`,
        name: `CV — ${profile.name}`,
        dateModified: profile.updated,
        mainEntity: {
          ...person(),
          hasOccupation: experience.years.flatMap((y) =>
            y.items.map((item) => ({ "@type": "Role", roleName: item.role, description: `${item.org} (${y.year})` })),
          ),
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "CV", path: "/cv" },
      ]),
    ] as const,
  };
}

// JSON.stringify does not escape "<"; replace it so content can never close the script tag.
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
