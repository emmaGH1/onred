"use client";

import { useEffect, useRef, useState } from "react";

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

type VerifyReport = { results: TestResult[]; summary: { passed: number; failed: number; errored: number } };

const PHASE_COLOR: Record<string, string> = {
  verifying: "text-sky-400",
  fail_detected: "text-red-400",
  diagnosing: "text-amber-400",
  patch_applied: "text-emerald-400",
  re_verifying: "text-sky-400",
  green: "text-emerald-400",
  red: "text-red-400",
  info: "text-zinc-400",
  error: "text-red-400",
};

function pill(status: Status) {
  if (status === "passed") return "bg-emerald-100 text-emerald-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function ts(ms: number) {
  return new Date(ms).toLocaleTimeString();
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
    // pick up any in-flight loop on load
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
        body: "{}",
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Onred — repair console</h1>
          <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            open cart app →
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        {/* Left: spec + controls */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-medium text-zinc-400">Spec</h2>
            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              spellCheck={false}
            />
          </section>

          <section className="flex gap-3">
            <button
              onClick={compileAndVerify}
              disabled={busy !== null}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            >
              {busy === "compile" ? "Compiling & verifying…" : "Compile & Verify"}
            </button>
            <button
              onClick={repair}
              disabled={busy !== null}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "repair" ? "Repairing…" : "Repair"}
            </button>
          </section>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <section>
            <h2 className="mb-2 text-sm font-medium text-zinc-400">Requirements</h2>
            {!results && (
              <p className="text-sm text-zinc-500">
                Run Compile &amp; Verify to populate requirement status.
              </p>
            )}
            {results && (
              <ul className="space-y-2">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
                  >
                    <span className="text-sm">{r.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pill(r.status)}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: event log */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-400">Event log</h2>
            <span className="text-xs text-zinc-500">{job === "running" ? "● running" : "idle"}</span>
          </div>
          <div
            ref={logRef}
            className="h-[28rem] overflow-y-auto rounded-lg border border-zinc-800 bg-black p-3 font-mono text-xs leading-relaxed"
          >
            {events.length === 0 && <p className="text-zinc-600">No events yet.</p>}
            {events.map((e) => (
              <div key={e.id} className="mb-2">
                <div className="text-zinc-500">
                  [{ts(e.ts)}]{" "}
                  <span className={PHASE_COLOR[e.phase] ?? "text-zinc-300"}>{e.phase}</span>
                </div>
                <div className="text-zinc-300">{e.message}</div>
                {e.detail && <div className="whitespace-pre-wrap text-zinc-500">{e.detail}</div>}
                {e.diff && (
                  <pre className="mt-1 overflow-x-auto rounded bg-zinc-900 p-2 text-emerald-300">
                    {e.diff}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
