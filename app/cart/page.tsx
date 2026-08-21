"use client";

import Link from "next/link";
import { useState } from "react";

type Product = { id: string; name: string; price: number };
type CartItem = Product & { qty: number };

const PRODUCTS: Product[] = [
  { id: "shirt", name: "T-Shirt", price: 20 },
  { id: "mug", name: "Coffee Mug", price: 12 },
  { id: "hat", name: "Cap", price: 18 },
];

export default function CartPage() {
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
    <div className="min-h-screen bg-ground text-ink">
      <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-onred">
            fixture
          </p>
          <h1 className="font-display text-xl tracking-tight text-onred">Onred</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-xs text-mute hover:text-ink">
            home
          </Link>
          <Link
            href="/dashboard"
            className="font-mono text-xs text-mute hover:text-ink"
          >
            console
          </Link>
          <div className="bg-onred px-4 py-1.5 font-mono text-base font-medium text-white">
            Cart ({cartCount})
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <ul className="space-y-3">
          {PRODUCTS.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between border border-line bg-panel p-4"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="font-mono text-sm text-mute">${p.price}</p>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="bg-ink px-4 py-2 text-sm font-medium text-ground"
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 border border-line bg-panel p-4">
          {/* Cart line items — Kane's tests confirm product names appear in the
              cart summary after an add; without this list the authoring agent
              loops on the badge and every run re-authors (the stuck loop). */}
          <ul className="mb-3 space-y-1 text-sm text-ink">
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
              className="mb-3 border border-line px-3 py-1 text-xs text-mute hover:text-ink"
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
