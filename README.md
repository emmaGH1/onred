<p align="center">
  <img src="public/logo.svg" alt="Onred" width="168" height="40" />
</p>

<p align="center">
  <strong>Kane finds the bug. onred fixes it.</strong>
</p>

<p align="center">
  Detect → diagnose → repair → re-verify.<br />
  Nobody writes the tests. Nobody writes the patch.
</p>

---

When a Kane check goes **red**, Onred routes the failure evidence to an opencode repair agent, applies a **minimal** patch, and re-runs the same checks until they go **green**. The live event log is the product.

This repo is the Kane CLI Online Hackathon entry: a closed loop around Kane’s native pipeline, not a rebuild of it.

## What you are looking at

| Route | What it is |
|---|---|
| [`/`](http://localhost:3000) | Landing — visor, loop, console teaser |
| [`/dashboard`](http://localhost:3000/dashboard) | Repair console — spec, board, Repair, event log |
| [`/cart`](http://localhost:3000/cart) | Cart **fixture** Kane actually verifies |

The cart is the specimen. The console is the product.

## 30-second pitch

You paste a plain-English spec. Kane CLI’s native flow (`context ingest` → `context extract` → `design tests`) compiles it into `_test.md` checks. When a check fails, an opencode `--agent repair` run reads Kane’s evidence, patches one line, and Kane re-verifies. In the demo, a sabotaged header count (`Cart (1)` instead of `Cart (3)`) is caught, patched, and flipped 3/3 green.

## Run it (this is the real product)

The closed loop **must run on this machine**. Kane needs local Chrome. The repair agent is a local `opencode` binary. Next.js route handlers spawn both.

```bash
npm install
npm install -g @testmuai/kane-cli opencode-ai
kane-cli login --oauth
npm run dev
```

Then:

1. Open [http://localhost:3000](http://localhost:3000) — landing.
2. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — console.
3. Kane verify/repair targets [http://localhost:3000/cart](http://localhost:3000/cart).

### Prereqs

- Node 20+
- Authenticated Kane CLI (`kane-cli whoami`)
- Global `opencode` on PATH
- Chrome (Kane `--headless`)
- **One session only.** The event log lives at `%TEMP%\onred-repair-state.json`. A second tab writing `job: "running"` 409-locks Repair.

## Deploying

**Do we deploy on Vercel?** The landing can. The loop cannot.

There is no separate backend service. “Backend” here is four Next.js route handlers:

| Route | Spawns |
|---|---|
| `POST /api/kane/compile` | `kane-cli context ingest / extract / design tests` |
| `POST /api/kane/verify` | `kane-cli testmd run --agent --headless` (real Chrome) |
| `POST /api/kane/repair` | verify → `opencode --agent repair` → re-verify |
| `GET /api/kane/events` | the live log file |

Those children need:

- a global Kane CLI with a valid token
- a global opencode binary
- a local Chrome
- the cart app at `http://localhost:3000/cart`

A Vercel Function does not have Kane, opencode, or your Chrome. Repair on a hosted URL will 500. That is expected.

**Hackathon demo:** `npm run dev` on this laptop. Record the console. Judges clone the repo and run the same command.

**Optional pretty URL:** you *can* `vercel` the Next app so `/` is a public landing. Do not point judges at that URL for Repair. The README install command is the live command on the submission form.

```bash
# marketing landing only — loop will not run
npx vercel
```

## Architecture

```
spec/onred.prd.md
        │
        ▼
 Kane native pipeline          (compile)
 ingest → extract → design tests
        │
        ▼
 .testmuai/tests/*_test.md
        │
        ▼
 Kane testmd run --agent       (verify)
        │
   RED ─┴─ evidence (one-liner, root cause)
        │
        ▼
 opencode --agent repair       (minimal diff)
        │
        ▼
 Kane testmd run --agent       (re-verify)
        │
      GREEN
```

We do **not** reimplement spec → test generation. We invoke Kane as-is.

## Demo sabotage (always this take)

File: `app/cart/page.tsx`

```ts
const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
```

Break **only** the header count:

```ts
const cartCount = cart.reduce((sum, i) => sum + 1, 0);
```

Add T-Shirt 3× → header reads `Cart (1)` instead of `Cart (3)`. Add-to-cart and total stay correct. Repair restores the first line.

The loop restores **only that file** when it finishes. It no longer `git reset --hard` the whole tree.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn primitives · Kane CLI v0.8.5 · opencode `repair` agent.

## License

Hackathon entry. Code stays yours.
