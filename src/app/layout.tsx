import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Silkscreen } from "next/font/google";
import { profile, siteUrl } from "@/content/profile";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

const text = Host_Grotesk({ subsets: ["latin"], variable: "--font-host-grotesk", display: "swap" });
const pixel = Silkscreen({ subsets: ["latin"], weight: "400", variable: "--font-silkscreen", display: "swap" });

// Every public route must stay fully static (PRD: SSG everywhere).
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.jobTitle}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.description,
  alternates: { canonical: "/" },
  authors: [{ name: profile.name, url: siteUrl }],
  openGraph: { type: "profile", siteName: profile.name, locale: "en_US", url: "/" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#e4e4e1", // --color-bg; metadata cannot read CSS variables
};

// Runs before first paint. "motion" = animations allowed (no reduced motion, no Save-Data, not a bot);
// "loading" = show the loader (first visit this session). "intro-done" is a safety net: if the JS bundle
// never runs, hidden intro elements are revealed after 8 s.
const motionGate = `(function(){try{var d=document.documentElement,n=navigator;
if(matchMedia('(prefers-reduced-motion: reduce)').matches||(n.connection&&n.connection.saveData)||/bot|crawl|spider|lighthouse|headless/i.test(n.userAgent))return;
d.classList.add('motion');if(!sessionStorage.getItem('pbs-seen'))d.classList.add('loading');
setTimeout(function(){d.classList.add('intro-done');d.classList.remove('loading')},8000)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script adds motion classes to <html> before React hydrates.
    <html lang="en" className={`${text.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-3 text-on-dark focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
