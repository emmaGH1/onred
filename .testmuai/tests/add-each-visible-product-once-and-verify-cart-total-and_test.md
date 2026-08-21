---
assurance:
  id: t-1
  base: sha256:69d0e241a83a294b6bf64bb8575eb4170b3a5588d2448f7c24bb4a59e8fd858a
---
# Add each visible product once and verify cart total and count

> Prove that every visible product can be added from its own button and that the cart total and header count reflect the resulting cart contents.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product list page, the cart summary, and the header item count to finish rendering.

## Step 2

On the product list page, store the set of visible product cards and each card's displayed price, and confirm each stored card exposes its own "Add to cart" button.

## Step 3

Add each stored visible product to the cart exactly once from that product card's own "Add to cart" button, allowing the page to reflect each add before continuing.

## Step 4

Assert the displayed cart total equals the sum of the stored displayed prices of all products added once.

## Step 5

Assert the header item count equals the number of stored visible products that were added once.

## Step 6 — assert @verifies ac-6, ac-8, ac-1, ac-2, ac-3

Confirm absolute check: sum of the displayed prices of all products added once (equals) — the stated promise: After adding each visible product once, the displayed cart total equals the sum of the displayed prices of all products added once.
