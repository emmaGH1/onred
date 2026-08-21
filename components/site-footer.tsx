import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-mute">
            Kane finds the bug. onred fixes it. The live repair log is the
            product.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-onred">
            the loop
          </p>
          <p className="mt-3 font-display text-lg leading-snug">
            detect → diagnose → repair → re-verify
          </p>
        </div>
        <div className="flex flex-col gap-2 font-mono text-sm text-mute">
          <Link href="/#loop" className="hover:text-ink">
            how it works
          </Link>
          <Link href="/dashboard" className="hover:text-ink">
            repair console
          </Link>
          <Link href="/cart" className="hover:text-ink">
            cart fixture
          </Link>
          <a
            href="https://github.com/emmaGH1/onred"
            className="hover:text-ink"
          >
            github
          </a>
        </div>
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-mono text-[11px] text-mute">
        <span>built for the Kane CLI hackathon</span>
        <span>find. fix. ship.</span>
      </div>
    </footer>
  );
}
