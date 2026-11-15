import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "@/components/sections/Contact";

// Shared frame for /work/[slug], /cv and 404: nav on the light ground, content, dark footer.
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="bg-bg">
        <div className="mx-auto max-w-page px-5 pt-6 xl:px-10 xl:pt-8">
          <Nav />
        </div>
      </header>
      <main id="main" className="bg-bg">
        <div className="mx-auto flex max-w-page flex-col gap-12 px-5 pt-16 pb-24 xl:px-10 xl:pt-24 xl:pb-32">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
