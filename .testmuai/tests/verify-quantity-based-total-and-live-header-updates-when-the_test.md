---
assurance:
  id: t-2
  base: sha256:b345cdc9e8e9840b21363448e0a49674d375d6b1e1f116a0fb5850f5797abb2c
---
# Verify quantity-based total and live header updates when the same product is added twice

> Proves that repeated adds of one product are reflected in quantity-based total calculation and in the live header count after each add.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product listing page to load with the site header, product cards, and cart summary visible.

## Step 2

On the product listing page, identify one visible product card that shows a price and an "Add to cart" button; store its product name as product_name and its displayed price as unit_price.

## Step 3

In the page header and cart summary, store the currently displayed header item count as baseline_count and the Total label value as baseline_total.

## Step 4

From the stored product_name card, add the product to the cart once; confirm the cart or cart summary now shows product_name, then store the displayed header item count as count_after_first_add and the displayed Total label as total_after_first_add.

## Step 5

From the same stored product_name card, add the product to the cart a second time; then store the displayed header item count as count_after_second_add and the displayed Total label as total_after_second_add.

## Step 6

Assert count_after_first_add equals 1 and count_after_second_add equals 2; using the stored unit_price, assert total_after_second_add equals unit_price multiplied by 2.

## Step 7 — assert @verifies ac-1, ac-3, ac-4

Confirm count check: [object Object] (equals) — the stated promise: After every add, the header item count equals the total quantity of all items in the cart.
