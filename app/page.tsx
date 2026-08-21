import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IndexNav } from "@/components/index-nav";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { Wordmark } from "@/components/wordmark";

const STEPS = [
  {
    n: "01",
    title: "Detect",
    body: "Kane runs the spec in a real browser and returns pass or fail with evidence.",
  },
  {
    n: "02",
    title: "Diagnose",
    body: "The failure is a verdict — one-liner, root cause, suggested fix — not a wall of logs.",
  },
  {
    n: "03",
    title: "Repair",
    body: "An opencode agent reads that evidence and applies the smallest possible patch.",
  },
  {
    n: "04",
    title: "Re-verify",
    body: "The same checks run again. Green, or the loop continues. Nobody writes the fix.",
  },
];

const LOG = [
  { phase: "fail_detected", color: "text-onred", msg: "2 passed, 1 failed." },
  {
    phase: "detail",
    color: "text-mute",
    msg: "The cart shows two shirts and a $40 total, but the header cart count still says 1.",
  },
  {
    phase: "diagnosing",
    color: "text-warn",
    msg: "Routing failure evidence to the repair agent.",
  },
  { phase: "patch_applied", color: "text-pass", msg: "Patch applied to app/cart/page.tsx." },
  { phase: "green", color: "text-pass", msg: "GREEN — 3/3 checks pass." },
];

export default function Page() {
  return (
    <div className="bg-ground">
      <section className="relative isolate min-h-[100dvh] overflow-hidden">
        <Image
          src="/visor-hud.jpg"
          alt="Visor HUD with a red scanline"
          fill
          priority
          unoptimized
          className="visor-lock object-cover object-[center_22%]"
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ground to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-ground/40 via-transparent to-ground" />
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-ground via-ground/90 to-transparent" />

        <div className="relative z-10 flex min-h-[100dvh] flex-col">
          <div className="flex items-start justify-between px-6 pt-6 sm:px-8">
            <Wordmark />
          </div>
          <IndexNav />

          <div className="mt-auto px-6 pb-16 sm:px-8 lg:pb-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="rise rise-1 font-mono text-sm tracking-wide text-mute">
                find. fix. <span className="text-onred">ship.</span>
              </p>
              <h1 className="rise rise-2 mt-4 font-display text-[2.35rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Kane finds the bug.
                <br />
                <span className="text-onred">onred fixes it.</span>
              </h1>
              <div className="rise rise-3 mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
                <Button asChild size="lg">
                  <Link href="/dashboard">Watch it fix a bug</Link>
                </Button>
                <Button asChild variant="ghostline" size="inline">
                  <a href="https://github.com/emmaGH1/onred">View source</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="loop" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-onred">
            how it works
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Four steps. Zero humans in the middle.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n}>
              <article className="relative">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-3 left-12 hidden h-px w-[calc(100%-0.5rem)] bg-onred/30 lg:block"
                  />
                )}
                <p className="font-mono text-xs tracking-widest text-onred">{s.n}</p>
                <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Separator />

      <section
        id="console"
        className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32"
      >
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-onred">
            the console
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-semibold sm:text-5xl">
            The board the loop writes on.
          </h2>
          <p className="mt-5 max-w-md text-mute">
            Spec in. Event log out. When a check goes red, Repair is one
            control. The cart is the specimen — this is the product.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/dashboard">Open the repair console</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal>
          <div className="border border-line bg-black p-5 font-mono text-[11px] leading-relaxed">
            {LOG.map((e, i) => (
              <div key={i} className="mb-2 last:mb-0">
                {e.phase !== "detail" && (
                  <span className={e.color}>{e.phase}</span>
                )}
                <p className={e.phase === "detail" ? "text-mute" : "text-ink"}>
                  {e.msg}
                </p>
              </div>
            ))}
            <pre className="mt-3 border border-line bg-panel p-3 text-[10px] leading-relaxed">
              <span className="text-onred">
                -  const cartCount = cart.reduce((sum, i) =&gt; sum + 1, 0);
              </span>
              {"\n"}
              <span className="text-pass">
                +  const cartCount = cart.reduce((sum, i) =&gt; sum + i.qty, 0);
              </span>
            </pre>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
