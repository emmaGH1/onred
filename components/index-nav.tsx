"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { n: "01", label: "loop", href: "/#loop" },
  { n: "02", label: "console", href: "/#console" },
  { n: "03", label: "fixture", href: "/cart" },
  { n: "04", label: "source", href: "https://github.com/emmaGH1/onred" },
] as const;

function Items({ onClick }: { onClick?: () => void }) {
  return (
    <ul className="flex flex-col gap-5">
      {LINKS.map((l) => (
        <li key={l.n}>
          <Link
            href={l.href}
            onClick={onClick}
            className="group flex items-baseline gap-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1"
          >
            <span className="font-mono text-[10px] tracking-widest text-onred/70 transition-colors group-hover:text-onred">
              {l.n}
            </span>
            <span className="text-sm text-mute transition-colors group-hover:text-ink">
              {l.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function IndexNav() {
  return (
    <>
      <nav
        aria-label="Index"
        className="pointer-events-auto absolute top-1/2 right-8 z-20 hidden -translate-y-1/2 lg:block"
      >
        <Items />
      </nav>

      <Sheet>
        <SheetTrigger className="pointer-events-auto absolute top-6 right-5 z-20 font-mono text-[11px] tracking-[0.28em] text-mute uppercase lg:hidden">
          index
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>index</SheetTitle>
          <div className="mt-12">
            <Items />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
