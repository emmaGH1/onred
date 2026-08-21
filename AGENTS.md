# AGENTS.md — rules for every coding agent in this repo

- **Minimal diff discipline.** Fix only what the failing check requires. Never
  refactor, rename, or clean up adjacent code while repairing.
- **No new dependencies** without explicit approval.
- **Legible diffs.** The demo shows real diffs. They must be readable at a glance —
  one small, obvious change, not a rewrite.
- **Dashboard / event-log code stays boring and readable.** No clever abstractions.
  This code is shown on camera; boring is a feature.
- **~6h deadline.** When in doubt, ship the boring working version.
