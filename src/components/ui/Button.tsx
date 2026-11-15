import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowIcon } from "./icons";

// Figma: Button / Primary, Accent, Ghost. Sharp corners, arrow glyph on the right.
const variants = {
  primary: "bg-ink text-on-dark px-6 py-4 hover:bg-dark-raised",
  // Small text on Cobalt uses white on-accent (WCAG AA), a deliberate deviation from Figma's ink.
  accent: "bg-accent text-on-accent px-6 py-4",
  ghost: "border-b border-current px-1 py-3",
} as const;

type Props = {
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

const base =
  "inline-flex min-h-11 items-center gap-3 font-medium text-button whitespace-nowrap transition-colors duration-200";

/** Same look for a real <button> (client islands such as the game launcher). */
export const buttonClasses = (variant: keyof typeof variants = "primary", className = "") =>
  `${base} ${variants[variant]} ${className}`;

export function Button({
  variant = "primary",
  className = "",
  children,
  href,
  ...rest
}: Props & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const external = typeof href === "string" && /^(https?:|mailto:)/.test(href);
  const content = (
    <>
      {children}
      <ArrowIcon />
    </>
  );
  return external ? (
    <a href={href} className={cls} {...(rest as ComponentProps<"a">)}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
}

// Static placeholder for actions that go live in the final phase (Ask my CV, Prompt Defender).
export function DisabledButton({ variant = "primary", className = "", children }: Props) {
  return (
    <button type="button" disabled className={buttonClasses(variant, `cursor-not-allowed ${className}`)}>
      {children}
      <ArrowIcon />
    </button>
  );
}
