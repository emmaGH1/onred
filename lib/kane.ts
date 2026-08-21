import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const REPO_ROOT = process.cwd();
export const TESTS_DIR = path.join(REPO_ROOT, ".testmuai", "tests");
export const CONTEXT_DIR = path.join(REPO_ROOT, ".context");
export const SPEC_PATH = path.join(REPO_ROOT, "spec", "onred.prd.md");

const DEFAULT_URL = "http://localhost:3000";
const RUN_TIMEOUT_MS = 12 * 60 * 1000; // 12 min per kane command — first-run authoring exceeds 8

function resolveKaneCli(): string {
  const candidates = [
    process.env.APPDATA
      ? path.join(
          process.env.APPDATA,
          "npm",
          "node_modules",
          "@testmuai",
          "kane-cli",
          "bin",
          "kane-cli.cjs"
        )
      : null,
    path.join(
      os.homedir(),
      "AppData",
      "Roaming",
      "npm",
      "node_modules",
      "@testmuai",
      "kane-cli",
      "bin",
      "kane-cli.cjs"
    ),
  ].filter((c): c is string => Boolean(c));

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error("kane-cli not found — expected a global @testmuai/kane-cli install");
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Run kane-cli via `node <kane-cli.cjs>`, passing args as an argument array
 * (no shell). Never interpolate user input into a shell string.
 */
export function runKane(
  args: string[],
  opts: { timeoutMs?: number; cwd?: string } = {}
): Promise<RunResult> {
  const { timeoutMs = RUN_TIMEOUT_MS, cwd = REPO_ROOT } = opts;
  const cli = resolveKaneCli();

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], {
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
      // Kill the whole tree — kane-cli spawns a worker + Chrome that can outlive it.
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

/** Parse kane-cli --agent NDJSON: one JSON object per line (stdout only). */
export function parseNdjson(stdout: string): Record<string, unknown>[] {
  return stdout
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{"))
    .map((l) => {
      try {
        return JSON.parse(l) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((o): o is Record<string, unknown> => o !== null);
}

export async function listTestFiles(): Promise<string[]> {
  try {
    const entries = await readdir(TESTS_DIR);
    return entries
      .filter((f) => f.endsWith("_test.md"))
      .map((f) => path.join(TESTS_DIR, f))
      .sort();
  } catch {
    return [];
  }
}

export async function resetDerivedState(): Promise<void> {
  await rm(CONTEXT_DIR, { recursive: true, force: true });
  await rm(TESTS_DIR, { recursive: true, force: true });
}

/** Write the start_url variable file kane's testmd runner expects. */
export async function writeStartUrlVars(url: string): Promise<string> {
  const file = path.join(os.tmpdir(), "onred-kane-vars.json");
  const { writeFile } = await import("node:fs/promises");
  await writeFile(file, JSON.stringify({ start_url: { value: url, secret: false } }), "utf8");
  return file;
}

export async function readTestFrontmatter(file: string): Promise<{ id: string; title: string }> {
  const raw = await readFile(file, "utf8");
  const idMatch = raw.match(/^\s*id:\s*(\S+)/m);
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  return { id: idMatch?.[1] ?? path.basename(file), title: titleMatch?.[1]?.trim() ?? path.basename(file) };
}

export { DEFAULT_URL };
