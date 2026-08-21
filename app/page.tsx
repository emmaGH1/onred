"use client";

import { useState } from "react";

type Product = { id: string; name: string; price: number };
type CartItem = Product & { qty: number };

const PRODUCTS: Product[] = [
  { id: "shirt", name: "T-Shirt", price: 20 },
  { id: "mug", name: "Coffee Mug", price: 12 },
  { id: "hat", name: "Cap", price: 18 },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  // Header item count (behavior #3) — isolated on this line on purpose.
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Onred</h1>
        <div className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white">
          Cart ({cartCount})
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <ul className="space-y-3">
          {PRODUCTS.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-zinc-500">${p.price}</p>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-4">
          {/* Cart line items — Kane's tests confirm product names appear in the
              cart summary after an add; without this list the authoring agent
              loops on the badge and every run re-authors (the stuck loop). */}
          <ul className="mb-3 space-y-1 text-sm text-zinc-700">
            {cart.map((i) => (
              <li key={i.id}>
                {i.name} × {i.qty}
              </li>
            ))}
          </ul>
          {/* Clear cart — t-3's final assertion re-checks the $0 empty-cart
              promise after an add; without a way to empty the cart the agent
              can never reach that state. */}
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="mb-3 rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
            >
              Clear cart
            </button>
          )}
          <p className="text-lg font-semibold">Total: ${cartTotal}</p>
        </div>
      </main>
    </div>
  );
}
