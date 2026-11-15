"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// three.js only downloads when About is close to the viewport, and only with the motion gate on and WebGL
// available. Until then (and for reduced motion, Save-Data, bots, no WebGL) the static photo below is the
// About image. The <img> and its alt stay in the DOM either way; once the card is live the photo is only hidden.
const Lanyard = dynamic(() => import("@/components/canvas/Lanyard"), { ssr: false });

const webgl = () => {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
};

export function PhotoLanyard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const onReady = useCallback(() => setLive(true), []);
  // the canvas spans the full section width, so a swing or a pull never hits the edge of the photo column
  const [span, setSpan] = useState<CSSProperties>({});
  useEffect(() => {
    const el = ref.current;
    const section = el?.closest("section");
    if (!near || !el || !section) return;
    const fit = () => {
      const a = el.getBoundingClientRect(),
        s = section.getBoundingClientRect();
      setSpan({ left: s.left - a.left, width: s.width });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(section);
    return () => ro.disconnect();
  }, [near]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !document.documentElement.classList.contains("motion") || !webgl()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-lanyard={live || undefined} className="relative aspect-[557/720] w-full shrink-0 xl:w-[38.7%]">
      <div className={`size-full transition-opacity duration-500 ${live ? "opacity-0" : ""}`}>{children}</div>
      {/* Full section width (span), up to the section's top edge for the strap and well below the photo for a
          pull-down. It sits BEHIND the text column (z-10 in About.tsx). */}
      {near && (
        <div style={span} className="pointer-events-none absolute -top-28 -bottom-[45%] xl:-top-48">
          <Lanyard frame={ref} onReady={onReady} />
        </div>
      )}
    </div>
  );
}
