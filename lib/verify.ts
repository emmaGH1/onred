import {
  DEFAULT_URL,
  TESTS_DIR,
  listTestFiles,
  parseNdjson,
  readTestFrontmatter,
  runKane,
  writeStartUrlVars,
} from "./kane";

export interface TestSteps {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface TestEvidence {
  oneLiner?: string;
  bugTitle?: string;
  suggestion?: string;
  rootCause?: string;
}

export interface TestResult {
  id: string;
  title: string;
  file: string;
  status: "passed" | "failed" | "error";
  steps?: TestSteps;
  duration_s?: number;
  detail?: string;
  evidence?: TestEvidence;
}

export interface VerifyReport {
  ok: boolean;
  url: string;
  summary: { total: number; passed: number; failed: number; errored: number };
  results: TestResult[];
}

/** Pull the richest failure evidence out of a kane --agent NDJSON stream. */
function extractEvidence(events: Record<string, unknown>[]): TestEvidence {
  let verdict: Record<string, unknown> | null = null;
  let bugVerdict: Record<string, unknown> | null = null;
  for (const e of events) {
    if (e.type === "run_end" && e.verdict && typeof e.verdict === "object") {
      verdict = e.verdict as Record<string, unknown>;
    }
    if (e.type === "test_md_bug_verdict") bugVerdict = e;
  }
  return {
    oneLiner: asStr(verdict?.one_liner ?? bugVerdict?.one_liner),
    bugTitle: asStr(verdict?.bug_title ?? bugVerdict?.bug_title),
    suggestion: asStr(verdict?.suggestion),
    rootCause: asStr(verdict?.root_cause),
  };
}

function asStr(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

/**
 * Run every test file through kane-cli `testmd run --agent --headless` and
 * summarize per-file pass/fail. `files` are full paths; pass `[]` to run all.
 */
export async function runVerify(
  url: string,
  files: string[] = []
): Promise<VerifyReport> {
  const resolved = files.length > 0 ? files : await listTestFiles();
  const varsFile = await writeStartUrlVars(url);

  const results: TestResult[] = [];
  for (const file of resolved) {
    const { id, title } = await readTestFrontmatter(file);
    const base = {
      id,
      title,
      file: file.replace(/^.*[\\/]\.testmuai[\\/]tests[\\/]/, ""),
    };
    try {
      const run = await runKane([
        "testmd", "run", file,
        "--variables-file", varsFile,
        "--agent",
        "--headless",
      ]);
      const events = parseNdjson(run.stdout);
      const summary = events.find((e) => e.type === "test_md_summary") as
        | { overall_status?: string; steps?: TestSteps; duration_s?: number }
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
          evidence: extractEvidence(events),
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

  return {
    ok: true,
    url,
    summary: { total: results.length, passed, failed, errored },
    results,
  };
}

export { DEFAULT_URL, TESTS_DIR };
