# Onred — Cart PRD

Onred is a minimal shopping cart demo app. It has no backend, no auth, and no
persistence — all state lives in the browser for the session.

## Requirements

1. The user can add any product to the cart by clicking that product's "Add to cart" button.
2. The cart total (the "Total" label) updates to the sum of price times quantity for every item in the cart, starting at $0.
3. The header shows a live item count equal to the total quantity of all items in the cart, and it updates after every add.
