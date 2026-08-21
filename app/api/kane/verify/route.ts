import path from "node:path";
import {
  DEFAULT_URL,
  TESTS_DIR,
  listTestFiles,
  parseNdjson,
  readTestFrontmatter,
  runKane,
  writeStartUrlVars,
} from "@/lib/kane";

const SAFE_URL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?\/?$/;
const SAFE_FILENAME = /^[a-zA-Z0-9_\-]+\.md$/;

interface TestResult {
  id: string;
  title: string;
  file: string;
  status: "passed" | "failed" | "error";
  steps?: { total: number; passed: number; failed: number; skipped: number };
  duration_s?: number;
  detail?: string;
}

export async function POST(request: Request) {
  let body: { url?: string; tests?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // empty body — run all tests against the default URL
  }

  const url = typeof body.url === "string" && body.url ? body.url : DEFAULT_URL;
  if (!SAFE_URL.test(url)) {
    return Response.json({ ok: false, error: "url must be http://localhost[:port]" }, { status: 400 });
  }

  let files: string[];
  if (Array.isArray(body.tests) && body.tests.length > 0) {
    if (body.tests.some((t) => typeof t !== "string" || !SAFE_FILENAME.test(t))) {
      return Response.json({ ok: false, error: "invalid test filename" }, { status: 400 });
    }
    files = body.tests.map((t) => path.join(TESTS_DIR, t));
  } else {
    files = await listTestFiles();
  }

  if (files.length === 0) {
    return Response.json({ ok: false, error: "no *_test.md files found — run /api/kane/compile first" }, { status: 404 });
  }

  const varsFile = await writeStartUrlVars(url);

  const results: TestResult[] = [];
  for (const file of files) {
    const { id, title } = await readTestFrontmatter(file);
    const base = { id, title, file: path.basename(file) };
    try {
      const run = await runKane([
        "testmd", "run", file,
        "--variables-file", varsFile,
        "--agent",
        "--headless",
      ]);
      const events = parseNdjson(run.stdout);
      const summary = events.find((e) => e.type === "test_md_summary") as
        | { overall_status?: string; steps?: TestResult["steps"]; duration_s?: number }
        | undefined;
      const done = events.find((e) => e.type === "test_md_done") as
        | { overall_status?: string }
        | undefined;

      const status = summary?.overall_status ?? done?.overall_status;
      if (run.timedOut) {
        results.push({ ...base, status: "error", detail: "timed out" });
      } else if (status === "passed") {
        results.push({
          ...base,
          status: "passed",
          steps: summary?.steps,
          duration_s: summary?.duration_s,
        });
      } else if (status === "failed") {
        const lastRunEnd = [...events].reverse().find((e) => e.type === "run_end") as
          | { one_liner?: string; reason?: string }
          | undefined;
        results.push({
          ...base,
          status: "failed",
          steps: summary?.steps,
          duration_s: summary?.duration_s,
          detail: lastRunEnd?.one_liner ?? lastRunEnd?.reason,
        });
      } else {
        results.push({ ...base, status: "error", detail: "no run_end/test_md_summary in output" });
      }
    } catch (err) {
      results.push({ ...base, status: "error", detail: String(err) });
    }
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const errored = results.filter((r) => r.status === "error").length;

  return Response.json({
    ok: true,
    url,
    summary: { total: results.length, passed, failed, errored },
    results,
  });
}
