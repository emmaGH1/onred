---
assurance:
  id: t-2
  base: sha256:9aea402d0011403cdb2463d38f1473b0fc30f4d6bc332d9e8810a1e3d8853455
---
# Add the same product twice and verify doubled total and count

> Prove that repeated adds of one product update the cart total and header quantity after each add.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product list page, the cart summary, and the header item count to finish rendering.

## Step 2

On the product list page, choose one visible product card with a displayed price, store that displayed price as unit_price, and confirm that the same card exposes its own "Add to cart" button.

## Step 3

Add that chosen product to the cart once from its own product card and allow the cart total and header count to refresh.

## Step 4

Add the same chosen product to the cart a second time from the same product card and allow the cart total and header count to refresh again.

## Step 5

Assert the displayed cart total equals twice unit_price.

## Step 6

Assert the header item count equals 2.

## Step 7 — assert @verifies ac-5, ac-7, ac-1, ac-2

Confirm absolute check: twice the displayed price of the product added twice (equals) — the stated promise: After adding the same product twice, the displayed cart total equals twice that product's displayed price.
