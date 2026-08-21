# Onred

**When checks go red, Onred repairs.**

Kane finds the bug. The agent fixes it. Nobody writes tests or patches by hand.

## 30-second pitch

You write a plain-English spec. Kane CLI turns it into verification checks. When a
check goes **red**, an opencode coding agent reads the failure evidence, applies a
**minimal** patch, and re-runs verification until it flips **green**. The live
repair log — detect → diagnose → repair → re-verify — is the product.

## Architecture

- **Spec input** — a plain-English spec field feeds the pipeline. Nothing clever.
- **Kane pipeline invocation** — we call Kane CLI's native flow (context ingest →
  context extract → design tests) as-is. We do **not** rebuild spec→test generation.
- **Repair loop + event log** — a failing check triggers an opencode agent that reads
  evidence, patches minimally, and re-verifies. Every step streams into a live event log.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Kane CLI for verification,
opencode agent for the repair loop.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
