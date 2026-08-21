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
- [x] Phase 4 — repair loop **validated end-to-end 21 Aug 16:22**: verify (9 min) →
      RED on t-2 with real evidence ("cart shows two shirts and $40 total, but
      header count says 1") → opencode repair agent applied the exact one-line
      patch → re-verify → **GREEN 3/3** → `git reset --hard` restores the tree.
- [x] Phase 5 — dashboard console (`/dashboard`)

## Root cause of the old stuck loop (fixed 21 Aug)

The cart summary rendered only `Total: $X` — no product names. Every generated
test says "confirm the cart or cart summary now shows product_name", so Kane's
authoring agent looped on the cart badge ("AP determined agent is stuck"),
adaptive-heal re-authored the tail every run (20+ min verifies, 2/3 timeouts),
and the repair agent got an automation bug it could never patch. Fixes:

1. `app/page.tsx` renders cart line items (`{name} × {qty}`) in the summary.
2. `app/page.tsx` has a **Clear cart** button — t-3's final assertion re-checks
   the $0 empty-cart promise *after* an add, unreachable without it.
3. t-3 gained a Step 6 ("Click Clear cart…") before the final assert — per
   Kane's own bug-verdict suggestion. Assert-only steps never change state.

Replays now run in ~40–70 s per test (first run per test still authors, minutes).

## Demo-day warnings

- **One machine, one state file.** The event log lives at
  `%TEMP%\onred-repair-state.json`. A concurrent session writing mock events
  into it clobbers the live log and can leave `job: "running"`, which 409-locks
  the real loop (fix: set `"job":"idle"` in the file). Close other sessions
  before the demo run.
- The repair route stages `app/page.tsx` before the agent runs and ends with
  `git reset --hard HEAD` — commit everything before triggering Repair, or
  uncommitted work is lost.

## Rehearsal record (2026-08-21, proven)

**Full cycle completed green, end to end:**

| Phase | Time | Evidence |
|---|---|---|
| Sabotage applied (`sum + i.qty` → `sum + 1`) | 15:15 | working tree |
| Verify → fail detected | 15:30 (≈15 min) | t-2 failed: "header cart count stays at 1" — exactly the sabotaged behavior; t-1/t-3 green |
| Repair agent (opencode `--agent repair`) | 15:32 (≈2 min) | one-line diff: restored `sum + i.qty` — minimal-diff constraint held |
| Re-verify → GREEN | 15:52 | 3/3 passed (t-1 87s, t-2 157s, t-3 366s) |
| Tree self-reset | auto | `git reset --hard HEAD` in loop's finally block |

**Root causes fixed along the way (all committed):**
- `7d517ae` — opencode hangs on an open stdin pipe; spawn with `stdio: ["ignore", ...]`. This was THE blocker: every prior repair attempt died as a 10-min timeout.
- `d8e35b1` — timeouts raised: opencode 20 min, kane per-test 12 min (first-run authoring exceeds 8).
- `cc91b7c` / `9b9925c` — cart line items + Clear cart button so t-3 can reach its empty-cart assertion (Kane-authored test needed a reachable empty state).

**Demo pacing (for the 3-min video):**
- Verify (replay): ~6–10 min wall clock → **time-lapse or cut**; show red board result
- Repair agent: ~2 min → show event log live + the one-line diff (this is the centerpiece — give it real screen time)
- Re-verify: ~6 min → cut to green board
- Never show a live unedited full cycle — it cannot fit 3 minutes.

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
