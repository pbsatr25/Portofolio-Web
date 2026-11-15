"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { buttonClasses } from "./Button";
import { ArrowIcon } from "./icons";

// The game bundle only downloads when the player opens it (PRD: game loaded on Play, ≤ 80 KB gzip).
const PromptDefenderGame = dynamic(() => import("@/components/canvas/PromptDefenderGame"), {
  ssr: false,
  loading: () => <p className="flex size-full items-center justify-center font-pixel text-pixel">loading…</p>,
});

// Play → page blacks out (backdrop, 300 ms), then the popup grows from the centre (globals.css .game-dialog).
// Native modal <dialog>: focus trap, Esc to close and focus back on the opener come from the browser.
// html:has(dialog[open]) locks page scroll; data-lenis-prevent keeps smooth scroll from eating the wheel.
export function GameLauncher({ cta, secondary }: { cta: string; secondary: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const show = () => {
    ref.current?.showModal();
    setOpen(true);
  };
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={show} className={buttonClasses("primary")}>
        {cta}
        <ArrowIcon />
      </button>
      <button type="button" onClick={show} className={buttonClasses("ghost", "text-on-accent")}>
        {secondary}
        <ArrowIcon />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        data-lenis-prevent
        aria-label="Prompt Defender"
        className="game-dialog m-auto h-svh max-h-none w-screen max-w-none flex-col gap-4 bg-transparent p-0 text-on-dark open:flex md:h-[min(740px,calc(100svh-7rem))] md:w-[min(1120px,calc(100vw-4rem))] md:overflow-visible"
      >
        <div className="min-h-0 flex-1 border-dark-line md:border">
          {open && <PromptDefenderGame onClose={close} />}
        </div>
        <p className="hidden text-center font-pixel text-pixel text-on-dark-muted md:block">
          esc to close · space to pause
        </p>
      </dialog>
    </>
  );
}
