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
- [x] Kane CLI auth (`kane-cli whoami` → user `emma080355`, oauth, valid token)
- [x] Phase 0 — real pass/fail NDJSON samples in `samples/` (from `testmd run --agent`)
- [x] Phase 1 — cart app (3 behaviors) + documented sabotage point (see below)
- [x] Phase 2 — `spec/onred.prd.md` → Kane `_test.md` files (`.testmuai/tests/`)
- [x] Phase 3 — `POST /api/kane/compile` + `POST /api/kane/verify` (gate: 3/3 → 1 red → 3/3)

**Remaining for follow-up session:** Phase 4 (repair loop) and Phase 5 (dashboard).
Do NOT record, do NOT rebuild Kane's pipeline — invoke it via the routes above.

## Sabotage point

The cart app has exactly ONE deliberate, isolated sabotage line. It lives in
`app/page.tsx` behind **behavior #3 (header item count)** — it does NOT affect
behavior #1 (add to cart) or #2 (cart total).

Current (correct) line:

```ts
const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
```

Sabotage (one-line change — breaks ONLY the header count):

```ts
const cartCount = cart.reduce((sum, i) => sum + 1, 0);
```

- **Effect:** the header counts distinct line items instead of total quantity.
  Add the same product 3× → header shows `Cart (1)` instead of `Cart (3)`.
- **Why it's isolated:** `cartTotal` is a separate reduce (`price * qty`) on the
  line above, so the total stays correct and adding still works. Only #3 flips.
- **Rehearse** (always this exact take, never improvised): add T-Shirt 3× →
  header should read `Cart (3)`. After sabotage it reads `Cart (1)`.

## Kane CLI

- **Install command:** `npm install -g @testmuai/kane-cli` — installed v0.8.5. ✅
  (official package `@testmuai/kane-cli`, binary `kane-cli`; source:
  https://www.testmuai.com/support/docs/kane-cli-introduction/)
- **Auth command:** `kane-cli login` — interactive, or
  `kane-cli login --oauth` (browser), or
  `kane-cli login --username <user> --access-key <key>` (basic auth).
- **Verify command:** `kane-cli run --url http://localhost:3000 "<objective>"`.
- **Status:** ✅ authenticated (`kane-cli whoami` → user `emma080355`, oauth,
  token valid). Verify smoke test passes: `kane-cli run --url http://localhost:3000
  --agent --headless "<objective>"` navigates to the app and returns NDJSON on stdout.
  **Note:** use `--headless` — headed mode intermittently times out on the
  post-nav screenshot. Generated `_test.md` files reference `{{start_url}}`;
  fill it via `--variables-file` (a JSON file `{"start_url":{"value":"<url>","secret":false}}`),
  NOT `--url` (that flag is ignored by `testmd run`). First `testmd run` per test
  *authors* (slow, minutes); later runs *replay* (tens of seconds).

## Kane pipeline → concept mapping (verified against v0.8.5 help)

- context ingest  → `kane-cli context ingest <src...>` (lands sources into `.context/`)
- context extract → `kane-cli context extract` (extract use-cases via context agent)
- design tests    → `kane-cli design tests` (committed use-case → ACs, scenarios, 1:1 tests)
- run/verify      → `kane-cli run --url <url> "<objective>"` (browser run, pass/fail)
- evidence/cover  → `kane-cli evidence`, `kane-cli cover` (proof pack + coverage)

Use these as-is. Do NOT rebuild spec→test generation.
