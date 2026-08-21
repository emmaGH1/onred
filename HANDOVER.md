# HANDOVER — Onred

## Event facts

- **Event:** Kane CLI Online Hackathon (solo, opencode).
- **Deadline:** 21 Aug 11:59 PM IST = **7:29 PM WAT**. ~6h remain.
- **Stack:** Next.js + TypeScript + Tailwind.
- **Judging (equal weights):** Ships, Verified, Closed loop, Craft.
  Tiebreaks: **Verified** first, then **Closed loop**.

## Architecture decisions

- **Use Kane's native pipeline — do NOT rebuild it.** We invoke Kane CLI's
  context ingest → context extract → design tests flow verbatim. Reimplementing
  spec→test generation is wasted time and misses the point.
- **The repair loop IS the product.** A red check → agent reads evidence → minimal
  patch → re-verify → green, streamed into a live event log. That closed loop is
  what gets demoed and judged.

## Demo timeline (3:00 hard stop)

- **0:00–0:20** — Hook: "Kane verifies. But who fixes what it finds?"
- **0:20–0:50** — Kane pipeline run (sped up in post).
- **0:50–1:00** — Deliberate sabotage. **REHEARSED take:** same known, pre-tested
  sabotage every take, tested 3–4× before recording, never improvised.
- **1:00–2:20** — Agent reads failure, applies minimal patch (show the real diff —
  one-glance legible), re-verify flips green.
- **2:20–3:00** — Close: "Detect → diagnose → repair → re-verify. Zero human fixes."

## Rejected ideas (guardrails)

- No browser agents.
- No auth / payments.
- No marketing landing page beyond one hero screen.
- No rebuilding Kane's test generation.
- No spec-editor polish.

## Current status checklist

- [x] git repo, remote, initial push
- [x] docs (.gitignore, README, HANDOVER, AGENTS, repair agent)
- [x] Next.js scaffold (v16.3.1, builds clean)
- [x] Kane CLI installed (v0.8.5)
- [ ] Kane CLI verify smoke test — **blocked: needs `kane-cli login` (no access key available)**

## Kane CLI

- **Install command:** `npm install -g @testmuai/kane-cli` — installed v0.8.5. ✅
  (official package `@testmuai/kane-cli`, binary `kane-cli`; source:
  https://www.testmuai.com/support/docs/kane-cli-introduction/)
- **Auth command:** `kane-cli login` — interactive, or
  `kane-cli login --oauth` (browser), or
  `kane-cli login --username <user> --access-key <key>` (basic auth).
- **Verify command:** `kane-cli run --url http://localhost:3000 "<objective>"`.
- **Status:** ⚠️ **BLOCKED at auth.** `kane-cli whoami` → "Not logged in". A test
  run exits with: `Not authenticated. Run: kane-cli login --oauth, or
  kane-cli login --username <user> --access-key <key>`. No TestMu AI access key
  was available in the environment (no env vars, no stored profile).
  **Manual step needed:** the user must run `kane-cli login --oauth` (opens
  browser) or `kane-cli login --username <user> --access-key <key>` with their
  TestMu AI credentials, then re-run the verify command above.

## Kane pipeline → concept mapping (verified against v0.8.5 help)

- context ingest  → `kane-cli context ingest <src...>` (lands sources into `.context/`)
- context extract → `kane-cli context extract` (extract use-cases via context agent)
- design tests    → `kane-cli design tests` (committed use-case → ACs, scenarios, 1:1 tests)
- run/verify      → `kane-cli run --url <url> "<objective>"` (browser run, pass/fail)
- evidence/cover  → `kane-cli evidence`, `kane-cli cover` (proof pack + coverage)

Use these as-is. Do NOT rebuild spec→test generation.
