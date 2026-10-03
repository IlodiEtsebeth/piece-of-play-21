// A small cart kept in the visitor's browser (localStorage).
// Prices here are only for display — the payfast-initiate function
// always re-reads prices from the database before charging.
import { useSyncExternalStore } from "react";

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  quantity: number;
};

const KEY = "pop-cart-v1";
const MAX_QTY = 50;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      items = parsed.filter(
        (i) => i && typeof i.product_id === "string" && Number.isInteger(i.quantity) && i.quantity > 0,
      );
    }
  } catch {
    items = EMPTY;
  }
}

function save(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — cart still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

const clamp = (q: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(q) || 1));

export const cart = {
  add(item: Omit<CartItem, "quantity">, quantity = 1) {
    load();
    const existing = items.find((i) => i.product_id === item.product_id);
    if (existing) {
      save(
        items.map((i) =>
          i.product_id === item.product_id ? { ...i, ...item, quantity: clamp(i.quantity + quantity) } : i,
        ),
      );
    } else {
      save([...items, { ...item, quantity: clamp(quantity) }]);
    }
  },
  setQuantity(productId: string, quantity: number) {
    load();
    save(items.map((i) => (i.product_id === productId ? { ...i, quantity: clamp(quantity) } : i)));
  },
  remove(productId: string) {
    load();
    save(items.filter((i) => i.product_id !== productId));
  },
  clear() {
    load();
    save([]);
  },
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const count = current.reduce((n, i) => n + i.quantity, 0);
  const totalCents = current.reduce((n, i) => n + i.price_cents * i.quantity, 0);
  return { items: current, count, totalCents };
}

export const CART_MAX_QTY = MAX_QTY;
