<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — rules for every coding agent in this repo

- **Minimal diff discipline.** Fix only what the failing check requires. Never
  refactor, rename, or clean up adjacent code while repairing.
- **No new dependencies** without explicit approval.
- **Legible diffs.** The demo shows real diffs. They must be readable at a glance —
  one small, obvious change, not a rewrite.
- **Dashboard / event-log code stays boring and readable.** No clever abstractions.
  This code is shown on camera; boring is a feature.
- **~6h deadline.** When in doubt, ship the boring working version.
