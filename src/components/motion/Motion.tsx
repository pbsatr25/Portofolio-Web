"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
gsap.defaults({ ease: "expo.out", duration: 0.42 });

const $ = (sel: string, root: ParentNode = document) => gsap.utils.toArray<HTMLElement>(sel, root);
const once = (trigger: Element, start = "top 80%") => ({ trigger, start, once: true });

// One client island for every scroll/intro animation on the home page. Sections stay Server Components
// and expose data-* hooks. Only transform, opacity and clip-path are animated. Nothing runs unless the
// motion gate in layout.tsx set html.motion (reduced motion, Save-Data and bots get the static page).
export function Motion() {
  useGSAP(() => {
    const html = document.documentElement;
    if (!html.classList.contains("motion")) return;

    // ── Loader → intro ───────────────────────────────────────────
    // Wordmark rises line by line, avatar rises from below, then nav / name / intro card.
    const intro = () => {
      html.classList.add("intro-done");
      gsap
        .timeline()
        .fromTo($("[data-line]"), { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.06 })
        .fromTo("[data-avatar]", { autoAlpha: 0, yPercent: 35 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, "-=0.55")
        .fromTo(
          $("[data-intro]:not([data-avatar])"),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, stagger: 0.06 },
          "-=0.6",
        );
    };

    if (html.classList.contains("loading")) {
      // Sequence from art/design/Recording 2026-11-14 220355.mp4. SPEED scales the whole loader (~4.3 s at 1);
      // PRD asks for ≤ 1.2 s, raise SPEED to shorten it.
      const SPEED = 1;
      const count = document.querySelector("[data-loader-count]");
      const glyphs = $("[data-loader-tile] svg");
      const stage = document.querySelector("[data-loader-stage]");
      const grid = document.querySelector<HTMLElement>("[data-loader-cells]");

      // Pixel dissolve grid sized to the viewport (48 px cells, 32 px on phones).
      const cellSize = innerWidth < 768 ? 32 : 48;
      const cols = Math.ceil(innerWidth / cellSize),
        rows = Math.ceil(innerHeight / cellSize);
      if (grid) {
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.replaceChildren(
          ...Array.from({ length: cols * rows }, () => {
            const cell = document.createElement("div");
            cell.className = "bg-accent opacity-0";
            return cell;
          }),
        );
      }
      const cells = grid ? gsap.utils.shuffle([...grid.children]) : [];

      const state = { n: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          html.classList.remove("loading");
          sessionStorage.setItem("pbs-seen", "1");
          grid?.replaceChildren();
          ScrollTrigger.refresh();
        },
      });
      tl.timeScale(SPEED)
        // 1. count 0 → 100 while the centre tile cycles glyphs
        .to(state, {
          n: 100,
          duration: 1.3,
          ease: "power1.inOut",
          onUpdate: () => {
            if (count) count.textContent = String(Math.round(state.n)).padStart(3, "0");
            const g = Math.min(glyphs.length - 1, Math.floor((state.n / 100) * glyphs.length));
            glyphs.forEach((el, i) => (el.style.opacity = i === g ? "1" : "0"));
          },
        })
        // 2. tile becomes the dithered portrait and grows
        .to("[data-loader-portrait]", { opacity: 1, duration: 0.2 })
        .to(glyphs, { opacity: 0, duration: 0.2 }, "<")
        .to("[data-loader-tile]", { scale: 2, duration: 0.5 }, "<")
        // 3. the portrait drops into a row of tiles (column on phones)
        .to("[data-loader-tile]", { autoAlpha: 0, duration: 0.15 }, "+=0.2")
        .set("[data-loader-column]", { opacity: 1 })
        .from(
          $("[data-loader-column] > *"),
          innerWidth >= 1280
            ? { autoAlpha: 0, x: -12, stagger: 0.09, duration: 0.3 }
            : { autoAlpha: 0, y: -12, stagger: 0.09, duration: 0.3 },
          "<",
        )
        // 4. Cobalt pixels cover the screen
        .to(cells, { opacity: 1, duration: 0.01, stagger: { amount: 0.6 } }, "+=0.25")
        .set(stage, { autoAlpha: 0 })
        // 5. pixels clear and reveal the page while the intro plays
        .add(intro, "+=0.1")
        .to(cells, { opacity: 0, duration: 0.01, stagger: { amount: 0.7 } }, "<");
      document.querySelector("[data-loader-skip]")?.addEventListener("click", () => tl.progress(1));
    } else {
      intro();
    }

    // Avatar drifts slower than the page and shrinks a little (parallax ~0.6).
    gsap.to("[data-avatar]", {
      y: () => innerHeight * 0.4,
      scale: 0.9,
      ease: "none",
      scrollTrigger: { trigger: "[data-intro-root]", start: "top top", end: "bottom top", scrub: true },
    });

    // ── Superposition: sticky sections need their height (globals.css [data-stack]) ──
    // Sticky is switched off while ScrollTrigger measures, so trigger positions stay in normal flow.
    const stacks = $("[data-stack]");
    const setHeights = () => stacks.forEach((el) => el.style.setProperty("--stack-h", `${el.offsetHeight}px`));
    const ro = new ResizeObserver(setHeights);
    stacks.forEach((el) => ro.observe(el));
    const stackOff = () => html.classList.add("stack-off");
    const stackOn = () => {
      html.classList.remove("stack-off");
      setHeights();
    };
    ScrollTrigger.addEventListener("refreshInit", stackOff);
    ScrollTrigger.addEventListener("refresh", stackOn);

    // ── Pixel dividers: columns grow row by row as the section rises, strays twinkle ──
    const dividers = (grid: string) => {
      for (const svg of $(`[data-divider] ${grid}`)) {
        const cols = $("[data-col]", svg);
        const strays = $("[data-stray]", svg);
        gsap
          .timeline({ scrollTrigger: { trigger: svg, start: "top bottom", end: "top 35%", scrub: 0.6 } })
          .from(cols, {
            scaleY: 0,
            transformOrigin: "50% 0%",
            ease: (t) => Math.ceil(t * 3) / 3, // whole rows, never a half pixel
            stagger: { each: 0.004, from: "random" },
          })
          .from(strays, { opacity: 0, ease: "steps(1)", stagger: { each: 0.01, from: "random" } }, 0.15);
        // idle: a few stray pixels blink while the divider is on screen
        const blink = gsap.to(strays, {
          opacity: 0,
          ease: "steps(1)",
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          repeatDelay: 1.6,
          stagger: { each: 0.37, from: "random", repeat: -1 },
          paused: true,
        });
        ScrollTrigger.create({ trigger: svg, onToggle: (self) => (self.isActive ? blink.play() : blink.pause()) });
      }
    };

    // ── About: photo opens from the bottom, facts stagger in ─────
    const about = document.querySelector("#about");
    if (about) {
      gsap.from("[data-photo]", {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.9,
        scrollTrigger: once(about, "top 70%"),
      });
      gsap.from($("#about dl > div"), { autoAlpha: 0, y: 20, stagger: 0.05, scrollTrigger: once(about, "top 50%") });
    }

    // ── Stack marquee: loops while visible, scroll velocity speeds it up ──
    for (const track of $("[data-marquee]")) {
      const right = track.dataset.marquee === "right";
      const speed = Number(track.dataset.speed) || 1;
      const tween = gsap.fromTo(
        track,
        { xPercent: right ? -50 : 0 },
        { xPercent: right ? 0 : -50, duration: 40 / speed, ease: "none", repeat: -1, paused: true },
      );
      ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
          gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true });
          gsap.to(tween, { timeScale: 1, duration: 1, delay: 0.2, ease: "power2.out" });
        },
      });
    }

    // ── Statement: pinned ~2 screens, smoothed scrub, a different entrance per line ──
    // Line order: I BUILD AI · THAT SHOWS · ITS SOURCES · *(face) · & INTERFACES · PEOPLE TRUST
    const statement = document.querySelector("[data-statement]");
    if (statement) {
      const [l1, l2, l3, l4, l5, l6] = $("[data-statement-line]", statement);
      const labels = $("li", statement); // side labels for lines 2–6
      const enter = { duration: 1, ease: "power2.out" };
      const tl = gsap.timeline({
        defaults: enter,
        scrollTrigger: {
          trigger: "[data-statement-pin]",
          start: "center center",
          end: "+=180%",
          pin: true,
          scrub: 1.2,
        },
      });
      tl.from(l1, { yPercent: 70, clipPath: "inset(0% 0% 100% 0%)", autoAlpha: 0 }) // rises from a mask
        .from(l2, { xPercent: 22, skewX: -8, autoAlpha: 0 }, 0.45) // glides in from the right, leaning
        .from(l3, { clipPath: "inset(0% 100% 0% 0%)" }, 0.9) // wipes open left → right
        .from(l4, { scale: 0.6, autoAlpha: 0 }, 1.35) // brackets open from the centre…
        .from("[data-face]", { scale: 0, rotate: -90, duration: 1.2, ease: "back.out(1.6)" }, 1.6) // …face spins in
        .from(l5, { xPercent: -22, skewX: 8, autoAlpha: 0 }, 1.9) // glides in from the left
        .from(l6, { clipPath: "inset(0% 50% 0% 50%)", autoAlpha: 0 }, 2.35) // opens from the middle
        .from(labels, { autoAlpha: 0, y: 12, stagger: 0.45 }, 0.6)
        .to({}, { duration: 0.6 }); // short hold before the pin releases
    }

    // ── Ask my CV: live card rises once ──────────────────────────
    const askCard = document.querySelector("[data-ask-card]");
    if (askCard) gsap.from(askCard, { y: 60, autoAlpha: 0, duration: 0.6, scrollTrigger: once(askCard) });

    // ── Experience ───────────────────────────────────────────────
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1280px)", () => dividers(".divider-desktop"));
    mm.add("(max-width: 1279px)", () => dividers(".divider-mobile"));
    const track = document.querySelector<HTMLElement>("[data-exp-track]");
    if (track) {
      mm.add("(min-width: 1280px)", () => {
        // Folders slide up, flaps tip forward, files rise out (scrubbed with the scroll).
        const tl = gsap.timeline({ scrollTrigger: { trigger: track, start: "top 85%", end: "top 25%", scrub: true } });
        tl.from($("[data-folder]", track), { y: 160, stagger: 0.1, ease: "none" })
          .from($("[data-file]", track), { y: 120, autoAlpha: 0, stagger: 0.03, ease: "none" }, 0.1)
          .fromTo(
            $("[data-flap]", track),
            { rotateX: 0 },
            { rotateX: -10, transformPerspective: 1200, transformOrigin: "50% 100%", ease: "none" },
            0.3,
          );
      });
      mm.add("(max-width: 1279px)", () => {
        // Native horizontal track becomes a pinned, scroll-driven shelf.
        gsap.set(track, { overflowX: "visible" });
        const distance = () => track.scrollWidth - track.clientWidth;
        // Move the folders, not the pinned track itself (pin owns the track's transform).
        gsap.to($("[data-folder]", track), {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "center center",
            end: () => `+=${distance()}`,
            pin: true,
            pinSpacing: true, // parent is flex, where GSAP defaults this to false
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }

    // ── Contact: SAY HELLO rises letter by letter, pixel band slides in ──
    const hello = document.querySelector("[data-hello]");
    if (hello) {
      gsap.from($("[data-letter]", hello), { yPercent: 100, stagger: 0.04, duration: 0.6, scrollTrigger: once(hello) });
      gsap.from("[data-band]", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: "[data-band]", start: "top bottom", end: "bottom 70%", scrub: true },
      });
    }

    // ── Text: headings and paragraphs rise line by line from a mask; pixel labels scramble in ──
    const skip = "[data-statement], [data-hello], [data-marquee], dialog, [data-loader], [data-ask-card] li";
    for (const el of $("main h2, main h3, main p.text-lead, main p.text-body, main dd")) {
      if (el.closest(skip)) continue;
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        aria: "none", // the line wrappers keep the text readable; aria-label is not allowed on <p>/<dd>
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.9,
            stagger: 0.07,
            scrollTrigger: once(el, "top 88%"),
          }),
      });
    }
    for (const el of $("main .font-pixel")) {
      const text = el.textContent?.trim() ?? "";
      if (!text || text.length > 28 || el.children.length || el.closest(skip) || el.closest("[data-flap]")) continue;
      gsap.to(el, {
        scrambleText: { text, chars: "01▮▯", speed: 0.6, revealDelay: 0.2 },
        duration: 0.9,
        ease: "none",
        scrollTrigger: once(el, "top 92%"),
      });
    }
    for (const group of $("main section .flex:has(> a[href], > button)")) {
      if (group.closest(skip)) continue;
      gsap.from(group.children, {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        scrollTrigger: once(group, "top 92%"),
      });
    }

    // ── Pixels: float + depth parallax, step-in bites, filling score bars, twinkling band, blinking cue ──
    for (const px of $("[data-float]")) {
      const size = px.offsetWidth || 16;
      gsap.to(px, {
        y: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(2, 3.6),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(px, {
        yPercent: -size * 4, // bigger pixels sit "closer" and move faster
        ease: "none",
        scrollTrigger: { trigger: px.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
    const photo = document.querySelector("[data-photo]");
    if (photo)
      gsap.from($("[data-bite]", photo), {
        opacity: 0,
        ease: "steps(1)",
        stagger: { each: 0.12, from: "random" },
        delay: 0.5,
        scrollTrigger: once(photo, "top 70%"),
      });
    for (const card of $("[data-ask-card] li")) {
      gsap.from($("[data-cell]", card), {
        opacity: 0,
        ease: "steps(1)",
        stagger: 0.06,
        scrollTrigger: once(card, "top 90%"),
      });
    }
    const band = $("[data-px]");
    if (band.length) {
      gsap.from(band, {
        opacity: 0,
        ease: "steps(1)",
        stagger: { amount: 0.8, from: "random" },
        scrollTrigger: once(band[0].parentElement!, "top 95%"),
      });
      const twinkle = gsap.to(gsap.utils.shuffle(band.slice()).slice(0, Math.ceil(band.length / 8)), {
        opacity: 0.15,
        ease: "steps(1)",
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.2,
        stagger: { each: 0.3, repeat: -1 },
        paused: true,
      });
      ScrollTrigger.create({
        trigger: band[0].parentElement!,
        onToggle: (self) => (self.isActive ? twinkle.play() : twinkle.pause()),
      });
    }
    gsap.to("[data-cue]", { opacity: 0.2, ease: "steps(1)", duration: 0.35, repeat: -1, yoyo: true, stagger: 0.35 });

    return () => {
      mm.revert();
      ro.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", stackOff);
      ScrollTrigger.removeEventListener("refresh", stackOn);
    };
  });

  return null;
}
