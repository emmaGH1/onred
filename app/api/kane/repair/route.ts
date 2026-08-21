import { readFile } from "node:fs/promises";
import { DEFAULT_URL, SPEC_PATH } from "@/lib/kane";
import { runVerify, type VerifyReport } from "@/lib/verify";
import { buildRepairPrompt, git, runOpencode } from "@/lib/repair";
import {
  addEvent,
  clearEvents,
  getJob,
  setJob,
  setReport,
} from "@/lib/events";

const SAFE_URL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?\/?$/;
// The single, documented sabotage point. The loop stages it before the agent
// runs so `git diff` afterwards shows exactly the agent's patch.
const SABOTAGE_FILE = "app/page.tsx";

export async function POST(request: Request) {
  let body: { url?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body — default URL
  }

  const url = typeof body.url === "string" && body.url ? body.url : DEFAULT_URL;
  if (!SAFE_URL.test(url)) {
    return Response.json({ ok: false, error: "url must be http://localhost[:port]" }, { status: 400 });
  }

  if (getJob() === "running") {
    return Response.json({ ok: false, error: "a repair loop is already running" }, { status: 409 });
  }

  clearEvents();
  setJob("running");
  setReport(null);

  // Fire-and-forget: the spawned kane/opencode child processes keep the event
  // loop alive; the dashboard polls /api/kane/events for progress.
  void runLoop(url).catch((err) => {
    addEvent("error", `repair loop crashed: ${String(err)}`);
    setJob("idle");
  });

  return Response.json({ ok: true, started: true });
}

async function runLoop(url: string): Promise<void> {
  try {
    addEvent("verifying", `Verifying against ${url} …`);
    const before = await runVerify(url);
    setReport(before);

    if (before.summary.failed === 0 && before.summary.errored === 0) {
      addEvent("green", `${before.summary.passed}/${before.summary.total} checks already green — nothing to repair.`);
      return;
    }

    const failures = before.results.filter((r) => r.status === "failed");
    addEvent(
      "fail_detected",
      `${before.summary.passed} passed, ${before.summary.failed} failed.` +
        ` Failing: ${failures.map((f) => f.title).join("; ")}`,
      { detail: failures.map((f) => f.evidence?.oneLiner ?? f.detail ?? "").join("\n") }
    );

    addEvent("diagnosing", "Routing failure evidence to the repair agent (opencode --agent repair)…");

    const spec = await readFile(SPEC_PATH, "utf8");
    const prompt = buildRepairPrompt(failures, spec);

    // Stage the sabotage so the agent's fix diffs cleanly against it.
    await git(["add", SABOTAGE_FILE]);

    const run = await runOpencode(prompt);
    if (run.timedOut) {
      addEvent("error", "repair agent timed out");
      return;
    }

    const patch = (await git(["diff", "--", SABOTAGE_FILE])).stdout;
    addEvent(
      "patch_applied",
      patch ? "Patch applied to app/page.tsx." : "Agent finished with no diff.",
      { diff: patch || undefined }
    );

    addEvent("re_verifying", `Re-verifying against ${url} …`);
    const after = await runVerify(url);
    setReport(after);

    if (after.summary.failed === 0 && after.summary.errored === 0) {
      addEvent("green", `GREEN — ${after.summary.passed}/${after.summary.total} checks pass.`);
    } else {
      const stillFailing = after.results.filter((r) => r.status !== "passed");
      addEvent("red", `RED — still ${after.summary.failed} failing / ${after.summary.errored} errored.`);
      addEvent("info", "Remaining: " + stillFailing.map((r) => r.title).join("; "));
    }
  } catch (err) {
    addEvent("error", `repair loop failed: ${String(err)}`);
  } finally {
    // Restore a clean working tree for the next rehearsal run.
    await git(["reset", "--hard", "HEAD"]);
    setJob("idle");
  }
}

export const runtime = "nodejs";
