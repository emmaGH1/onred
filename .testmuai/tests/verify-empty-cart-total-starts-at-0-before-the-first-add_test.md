---
assurance:
  id: t-3
  base: sha256:bfbf54b8a56cf6c47368426db5c28ec3ddc66d99e8e1c216137a6c8c5f55e615
---
# Verify empty-cart total starts at $0 before the first add

> Proves the empty-cart baseline of $0 and that the first add from a product card places that product in the cart and updates the live cart indicators.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product listing page to load with the site header, product cards, and cart summary visible.

## Step 2

Before adding anything, assert the cart summary Total label shows $0 and store the displayed header item count as empty_count.

## Step 3

On the product listing page, identify one visible product card that shows a price and an "Add to cart" button; store its product name as product_name and its displayed price as unit_price.

## Step 4

From the stored product_name card, add the product to the cart and confirm the cart or cart summary now shows product_name.

## Step 5

Assert the displayed Total label now equals unit_price and the displayed header item count now equals 1.

## Step 6 — assert @verifies ac-1, ac-2, ac-3, ac-4

Confirm absolute check: $0 (equals) — the stated promise: When the cart has no items, the Total label shows $0.
