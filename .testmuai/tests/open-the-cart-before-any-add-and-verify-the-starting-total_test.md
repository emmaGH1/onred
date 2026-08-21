---
assurance:
  id: t-3
  base: sha256:915af4bbcfd315dc4b70327c73e520875cb9e3d1842724715e0a9c20cf413430
---
# Open the cart before any add and verify the starting total

> Prove that the displayed cart total starts at $0 before the user adds any product.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product list page, the cart summary, and the header item count to finish rendering.

## Step 2

Without adding any product, inspect the cart summary area that contains the "Total" label.

## Step 3

Assert the displayed cart total equals $0.

## Step 4 — assert @verifies ac-4

Confirm absolute check: $0 (equals) — the stated promise: Before any products are added, the displayed cart total starts at $0.
