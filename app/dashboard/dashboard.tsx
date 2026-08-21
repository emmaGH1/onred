"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

type Status = "passed" | "failed" | "error";
type TestResult = {
  id: string;
  title: string;
  status: Status;
  detail?: string;
};

type LogEvent = {
  id: number;
  phase: string;
  message: string;
  ts: number;
  diff?: string;
  detail?: string;
};

const PHASE_COLOR: Record<string, string> = {
  verifying: "text-ink",
  fail_detected: "text-onred",
  diagnosing: "text-warn",
  patch_applied: "text-pass",
  re_verifying: "text-ink",
  green: "text-pass",
  red: "text-onred",
  info: "text-mute",
  error: "text-onred",
};

function pill(status: Status) {
  if (status === "passed") return "bg-pass/15 text-pass";
  if (status === "failed") return "bg-onred/15 text-onred";
  return "bg-warn/15 text-warn";
}

function ts(ms: number) {
  return new Date(ms).toLocaleTimeString();
}

function board(results: TestResult[] | null) {
  if (!results || results.length === 0) {
    return { score: "—/—", tone: "idle" as const, word: "IDLE" };
  }
  const passed = results.filter((r) => r.status === "passed").length;
  const red = results.some((r) => r.status !== "passed");
  return {
    score: `${passed}/${results.length}`,
    tone: red ? ("red" as const) : ("green" as const),
    word: red ? "RED" : "GREEN",
  };
}

function DiffBlock({ diff }: { diff: string }) {
  return (
    <pre className="mt-2 overflow-x-auto border border-line bg-ground p-3 text-[11px] leading-relaxed">
      {diff.split("\n").map((line, i) => {
        const color = line.startsWith("+")
          ? "text-pass"
          : line.startsWith("-")
            ? "text-onred"
            : "text-mute";
        return (
          <div key={i} className={color}>
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
}

export default function Dashboard({ initialSpec }: { initialSpec: string }) {
  const [spec, setSpec] = useState(initialSpec);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [job, setJob] = useState<"idle" | "running">("idle");
  const [busy, setBusy] = useState<null | "compile" | "repair">(null);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [events]);

  useEffect(() => {
    fetch("/api/kane/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? []);
        setJob(d.job);
        if (d.report) setResults(d.report.results ?? null);
        if (d.job === "running") poll();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function poll() {
    fetch("/api/kane/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? []);
        setJob(d.job);
        if (d.report) setResults(d.report.results ?? null);
        if (d.job === "running") setTimeout(poll, 800);
        else setBusy(null);
      })
      .catch(() => setTimeout(poll, 1500));
  }

  async function compileAndVerify() {
    setBusy("compile");
    setError(null);
    try {
      const c = await fetch("/api/kane/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      const cj = await c.json();
      if (!cj.ok) {
        setError(cj.error ?? "compile failed");
        return;
      }
      const v = await fetch("/api/kane/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const vj = await v.json();
      if (!vj.ok) {
        setError(vj.error ?? "verify failed");
        return;
      }
      setResults(vj.results ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  }

  async function repair() {
    setBusy("repair");
    setError(null);
    setEvents([]);
    try {
      const r = await fetch("/api/kane/repair", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const rj = await r.json();
      if (!rj.ok) {
        setError(rj.error ?? "repair failed to start");
        setBusy(null);
        return;
      }
      poll();
    } catch (e) {
      setError(String(e));
      setBusy(null);
    }
  }

  const b = board(results);
  const last = events[events.length - 1];
  const running = job === "running" || busy !== null;
  const phaseLabel = running
    ? busy === "compile"
      ? "compiling"
      : last?.phase ?? "repairing"
    : "idle";

  return (
    <div className="min-h-screen bg-ground text-ink">
      <header className="border-b border-line px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-onred">
              repair console
            </p>
            <Wordmark />
            <p className="mt-1 text-sm text-mute">
              when checks go red, Onred repairs
            </p>
          </div>
          <div className="flex gap-4 font-mono text-xs text-mute">
            <Link href="/" className="hover:text-ink">
              home
            </Link>
            <Link href="/cart" className="hover:text-ink">
              fixture
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <section
            className={`border px-4 py-3 ${
              b.tone === "red"
                ? "border-onred/40 bg-onred/10"
                : b.tone === "green"
                  ? "border-pass/40 bg-pass/10"
                  : "border-line bg-panel"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
              board
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p
                className={`font-mono text-4xl font-medium leading-none ${
                  b.tone === "red"
                    ? "text-onred"
                    : b.tone === "green"
                      ? "text-pass"
                      : "text-mute"
                }`}
              >
                {b.score} {b.word}
              </p>
              <p className="font-mono text-xs text-mute">
                {running ? (
                  <span className="text-onred">● {phaseLabel}</span>
                ) : (
                  "idle"
                )}
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
              Spec
            </h2>
            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              rows={10}
              className="w-full border border-line bg-panel p-3 font-mono text-sm text-ink focus:border-onred focus:outline-none"
              spellCheck={false}
            />
          </section>

          <section className="flex flex-wrap items-center gap-5">
            <Button onClick={repair} disabled={busy !== null}>
              {busy === "repair" ? "Repairing…" : "Repair"}
            </Button>
            <Button
              onClick={compileAndVerify}
              disabled={busy !== null}
              variant="ghostline"
              size="inline"
            >
              {busy === "compile" ? "Compiling & verifying…" : "Compile & Verify"}
            </Button>
          </section>

          {error && (
            <div className="border border-onred/40 bg-onred/10 p-3 text-sm text-onred">
              {error}
            </div>
          )}

          <section>
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
              Requirements
            </h2>
            {!results && (
              <p className="text-sm text-mute">
                Run Compile &amp; Verify to populate requirement status.
              </p>
            )}
            {results && (
              <ul className="space-y-2">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 border border-line bg-panel px-3 py-2"
                  >
                    <span className="text-sm">{r.title}</span>
                    <span
                      className={`shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${pill(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
              Event log
            </h2>
            <span className="font-mono text-xs text-mute">
              {running ? <span className="text-onred">● {phaseLabel}</span> : "idle"}
            </span>
          </div>
          <div
            ref={logRef}
            className="h-[28rem] overflow-y-auto border border-line bg-black p-4 font-mono text-xs leading-relaxed lg:h-[calc(100vh-11rem)]"
          >
            {events.length === 0 && <p className="text-mute">No events yet.</p>}
            {events.map((e) => (
              <div key={e.id} className="mb-3">
                <div className="text-mute">
                  [{ts(e.ts)}]{" "}
                  <span className={PHASE_COLOR[e.phase] ?? "text-ink"}>
                    {e.phase}
                  </span>
                </div>
                <div className="text-ink">{e.message}</div>
                {e.detail && (
                  <div className="whitespace-pre-wrap text-mute">{e.detail}</div>
                )}
                {e.diff && <DiffBlock diff={e.diff} />}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
