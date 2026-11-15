import type { MetadataRoute } from "next";
import { profile, siteUrl } from "@/content/profile";
import { projects } from "@/content/work";

// lastModified = date the content last changed (profile.updated), not build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = profile.updated;
  return [
    { url: siteUrl, lastModified, priority: 1 },
    { url: `${siteUrl}/cv`, lastModified, priority: 0.8 },
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}`, lastModified, priority: 0.7 })),
  ];
}
