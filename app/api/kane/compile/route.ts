import { writeFile } from "node:fs/promises";
import {
  SPEC_PATH,
  listTestFiles,
  parseNdjson,
  readTestFrontmatter,
  resetDerivedState,
  runKane,
} from "@/lib/kane";

const MAX_SPEC_LENGTH = 20_000;

export async function POST(request: Request) {
  let body: { spec?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — compile the committed spec
  }

  const spec = typeof body.spec === "string" ? body.spec.slice(0, MAX_SPEC_LENGTH) : null;
  if (spec !== null) {
    await writeFile(SPEC_PATH, spec, "utf8");
  }

  const steps: { command: string; code: number; note?: string }[] = [];
  const push = (command: string, code: number, note?: string) =>
    steps.push({ command, code, ...(note ? { note } : {}) });

  // Fresh slate — Kane's graph is derived state; regenerate from the spec.
  await resetDerivedState();

  const ingest = await runKane(["context", "ingest", SPEC_PATH, "--mode", "ci"]);
  push("context ingest", ingest.code);
  if (ingest.code !== 0) {
    return Response.json({ ok: false, error: "ingest failed", steps, stderr: ingest.stderr.slice(-2000) }, { status: 500 });
  }

  const extract = await runKane(["context", "extract", "--mode", "ci"]);
  push("context extract", extract.code);
  if (extract.code !== 0) {
    return Response.json({ ok: false, error: "extract failed", steps, stderr: extract.stderr.slice(-2000) }, { status: 500 });
  }

  const list = await runKane(["context", "list", "--type", "usecase", "--json"]);
  const useCases = parseNdjson(list.stdout)
    .map((n) => String(n.id ?? ""))
    .filter((id) => id);

  if (useCases.length === 0) {
    return Response.json({ ok: false, error: "no use-cases extracted", steps, stdout: list.stdout.slice(-2000) }, { status: 500 });
  }

  for (const id of useCases) {
    const design = await runKane([
      "design", "tests",
      "--use-case", id,
      "--mode", "ci",
      "--allow-unreviewed",
      "--force",
    ]);
    push(`design tests ${id}`, design.code, design.code !== 0 ? design.stderr.slice(-500) : undefined);
    if (design.code !== 0) {
      return Response.json({ ok: false, error: `design tests failed for ${id}`, steps, stderr: design.stderr.slice(-2000) }, { status: 500 });
    }
  }

  const files = await listTestFiles();
  const checks = await Promise.all(
    files.map(async (f) => {
      const { id, title } = await readTestFrontmatter(f);
      return { id, title, file: f.replace(/^.*[\\/]\.testmuai[\\/]tests[\\/]/, "") };
    })
  );

  return Response.json({ ok: true, useCases, checks, steps });
}
