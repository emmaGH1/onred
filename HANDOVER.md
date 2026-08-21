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

- [ ] git repo, remote, initial push
- [ ] docs (.gitignore, README, HANDOVER, AGENTS, repair agent)
- [ ] Next.js scaffold
- [ ] Kane CLI installed
- [ ] Kane CLI verify smoke test

## Kane CLI

- **Install command:** (filled in step 8)
- **Verify command:** (filled in step 8)
- **Status:** (filled in step 8)
