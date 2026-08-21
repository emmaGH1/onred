import path from "node:path";
import { DEFAULT_URL, TESTS_DIR, listTestFiles } from "@/lib/kane";
import { runVerify } from "@/lib/verify";

const SAFE_URL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?\/?$/;
const SAFE_FILENAME = /^[a-zA-Z0-9_\-]+\.md$/;

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

  const report = await runVerify(url, files);
  return Response.json(report);
}
