import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/profile";

// Allow every crawler (incl. AI search bots); only the API is off limits. Never block /_next/.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
