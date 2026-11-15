"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

// Lenis on GSAP's ticker so ScrollTrigger and smooth scroll share one frame loop.
// Touch devices keep native scroll (syncTouch: false). Skipped when the motion gate is off.
export function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("motion")) return;
    const lenis = new Lenis({ lerp: 0.1, syncTouch: false, anchors: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // A page opened on /#section while the loader holds the page (overflow: hidden) never gets the browser's
    // anchor jump, and Lenis is left mid-"scroll", overriding every native scroll after it. Once the page is
    // free, land on the hash (or stay put) immediately, which also resets Lenis.
    const settle = () => {
      const target = location.hash && document.querySelector(location.hash) ? location.hash : scrollY;
      lenis.scrollTo(target, { immediate: true, force: true });
    };
    let mo: MutationObserver | undefined;
    if (html.classList.contains("loading")) {
      mo = new MutationObserver(() => {
        if (html.classList.contains("loading")) return;
        mo?.disconnect();
        requestAnimationFrame(settle);
      });
      mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    } else requestAnimationFrame(settle);

    return () => {
      mo?.disconnect();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
