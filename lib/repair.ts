import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { REPO_ROOT } from "./kane";
import type { TestResult } from "./verify";

const execFileAsync = promisify(execFile);
const OPENCODE_TIMEOUT_MS = 10 * 60 * 1000; // 10 min for a repair agent run

function resolveOpencode(): string {
  const candidates = [
    process.env.APPDATA
      ? path.join(process.env.APPDATA, "npm", "node_modules", "opencode-ai", "bin", "opencode.exe")
      : null,
    path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "opencode-ai", "bin", "opencode.exe"),
  ].filter((c): c is string => Boolean(c));

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error("opencode not found — expected a global opencode install (opencode-ai/bin/opencode.exe)");
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Run opencode headlessly, routed to the `repair` agent, auto-approving file
 * edits so the loop needs no human. The prompt is passed as a single argv
 * element (no shell), so it is never interpreted by a shell.
 */
export function runOpencode(
  prompt: string,
  opts: { timeoutMs?: number; cwd?: string } = {}
): Promise<RunResult> {
  const { timeoutMs = OPENCODE_TIMEOUT_MS, cwd = REPO_ROOT } = opts;
  const bin = resolveOpencode();

  return new Promise((resolve) => {
    const child = spawn(bin, ["run", prompt, "--agent", "repair", "--auto"], {
      cwd,
      windowsHide: true,
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (d: string) => (stdout += d));
    child.stderr.on("data", (d: string) => (stderr += d));

    const timer = setTimeout(() => {
      timedOut = true;
      const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      killer.on("error", () => child.kill("SIGKILL"));
    }, timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: `${stderr}\n${String(err)}`, timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, stdout, stderr, timedOut });
    });
  });
}

/** Run a git command in the repo root, returning code + output (never throws). */
export async function git(args: string[]): Promise<RunResult> {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd: REPO_ROOT,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    });
    return { code: 0, stdout, stderr, timedOut: false };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    return {
      code: e.code ?? -1,
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? String(err),
      timedOut: false,
    };
  }
}

const CONSTRAINT =
  "Fix only what's needed to make this specific check pass. Minimal diff — do not refactor unrelated code, do not rename, do not reformat, do not add dependencies.";

/**
 * Build the repair prompt. Evidence is Kane's own failure verdict; the
 * constraint is verbatim and keeps the patch minimal.
 */
export function buildRepairPrompt(failures: TestResult[], spec: string): string {
  const failing = failures
    .filter((r) => r.status === "failed")
    .map((r) => {
      const e = r.evidence ?? {};
      const lines = [
        `- Check: ${r.title}`,
        e.bugTitle ? `- Bug: ${e.bugTitle}` : null,
        e.oneLiner ? `- Evidence: ${e.oneLiner}` : null,
        r.detail && !e.oneLiner ? `- Evidence: ${r.detail}` : null,
        e.suggestion ? `- Suggested fix: ${e.suggestion}` : null,
        e.rootCause ? `- Root cause: ${e.rootCause}` : null,
      ].filter((l): l is string => Boolean(l));
      return lines.join("\n");
    })
    .join("\n\n");

  return [
    "A Kane verification check is failing on this app. Repair it.",
    "",
    "FAILING CHECKS:",
    failing,
    "",
    "APP SPEC (context only):",
    spec,
    "",
    "CONSTRAINT:",
    CONSTRAINT,
  ].join("\n");
}
