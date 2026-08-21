---
assurance:
  id: t-1
  base: sha256:cf45f08a0ee9cbb97c0b092b133b68160408c1be929d51c4d35b121ce43c583b
---
# Verify cart total and header count after adding two different products

> Proves that adding distinct products produces a cart total equal to the sum across both items and a header count equal to the combined quantity after each add.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Onred product listing page to load with the site header, product cards, and cart summary visible.

## Step 2

On the product listing page, identify two different visible product cards that each show a price and an "Add to cart" button; store the first product name as product_a, its displayed price as price_a, the second product name as product_b, and its displayed price as price_b.

## Step 3

In the page header and cart summary, store the currently displayed header item count as baseline_count and the Total label value as baseline_total.

## Step 4

From the product card stored as product_a, add that product to the cart and confirm the cart or cart summary now shows product_a.

## Step 5

From the product card stored as product_b, add that product to the cart and confirm the cart or cart summary now shows both product_a and product_b.

## Step 6

Using the stored visible prices and one added unit for each product, calculate expected_total as price_a + price_b; assert the displayed Total label equals expected_total and the displayed header item count equals 2.

## Step 7 — assert @verifies ac-1, ac-3, ac-4

Confirm absolute check: sum of every cart item's price multiplied by its quantity (equals) — the stated promise: After an add, the Total label equals the sum of every cart item's price multiplied by its quantity.
