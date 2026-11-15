"use client";

import { useRef } from "react";

type Item = { label: string; href: string };

// Native modal <dialog>: focus trap, Esc to close and focus return come from the browser.
// Page scroll lock lives in globals.css (html:has(dialog[open])).
export function MobileMenu({ items, cvHref }: { items: Item[]; cvHref: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="flex min-h-11 items-center gap-3 text-button font-medium"
        aria-haspopup="dialog"
      >
        Menu
        <span aria-hidden className="flex flex-col gap-1">
          <span className="size-1.5 bg-ink" />
          <span className="size-1.5 bg-ink" />
          <span className="size-1.5 bg-accent" />
        </span>
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        className="m-0 size-full max-h-none max-w-none bg-dark p-5 text-on-dark backdrop:bg-dark"
      >
        <div className="flex items-center justify-between">
          <span className="font-pixel text-pixel-lg">PBS</span>
          <button type="button" onClick={close} className="min-h-11 text-button font-medium">
            Close
          </button>
        </div>
        <ul className="mt-16 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={close} className="text-heading font-medium hover:text-accent-on-dark">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={cvHref}
          onClick={close}
          className="mt-12 inline-flex min-h-11 items-center bg-accent px-6 py-4 text-button font-medium text-on-accent"
        >
          Download CV
        </a>
      </dialog>
    </div>
  );
}
