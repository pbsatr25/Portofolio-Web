import Link from "next/link";
import { cvHref, nav } from "@/content/profile";
import { Button } from "./Button";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  return (
    <nav aria-label="Main" className="relative z-20 flex items-center justify-between">
      <Link href="/" className="font-pixel text-pixel-lg" aria-label="PBS, home">
        PBS
      </Link>
      <ul className="hidden gap-8 text-button font-medium xl:flex">
        {nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button href={cvHref} className="max-xl:hidden">
        Download CV
      </Button>
      <MobileMenu items={nav} cvHref={cvHref} />
    </nav>
  );
}
